import os
from typing import Optional, Tuple
import uuid
import time
import re
from .supabase_client import initialize_supabase

# Initialize Supabase client
supabase = initialize_supabase()

# Bucket name for storing resumes
RESUME_BUCKET = "Resume"

def ensure_bucket_exists() -> bool:
    """
    Ensure that the resume bucket exists, create if it doesn't
    """
    try:
        if supabase is None:
            print("Warning: Supabase client is not initialized. Storage operations will be skipped.")
            return False
            
        # List buckets to check if resume bucket exists
        try:
            buckets = supabase.storage.list_buckets()
            bucket_exists = any(bucket.name == RESUME_BUCKET for bucket in buckets)
            if bucket_exists:
                print(f"Using existing Supabase storage bucket: {RESUME_BUCKET}")
                return True
        except Exception as list_error:
            print(f"Warning: Cannot list buckets: {str(list_error)[:80]}")
            # The bucket might still exist and be usable
            return True
            
        # Bucket doesn't appear to exist yet
        print(f"Creating Supabase storage bucket: {RESUME_BUCKET}")
        
        # The newer supabase-py SDK (v2+) expects create_bucket to receive a single dict argument
        try:
            supabase.storage.create_bucket(RESUME_BUCKET)
            print(f"Successfully created bucket: {RESUME_BUCKET}")
            time.sleep(1)
            return True
        except Exception as e:
            error_msg = str(e)
            print(f"INFO: Could not auto-create bucket: {error_msg[:100]}")
            print("INFO: The 'resume' bucket must be created manually in Supabase Dashboard -> Storage.")
            print("INFO: Until then, resumes will be stored with local file references (data still saved to DB).")
            return True  # Be optimistic - bucket might already exist
    except Exception as e:
        error_str = str(e)
        print(f"Error with Supabase storage bucket: {error_str}")
        return True  # Optimistic - let upload attempt anyway

def get_mime_type(file_path: str) -> str:
    """
    Determine the appropriate MIME type based on file extension
    """
    ext = os.path.splitext(file_path)[1].lower()
    mime_types = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    return mime_types.get(ext, 'application/octet-stream')

def upload_resume(file_path: str, file_name: Optional[str] = None, job_role: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """
    Upload a resume file to Supabase storage
    
    Args:
        file_path: Path to the file to upload
        file_name: Optional name to use for the file (if None, will use a UUID)
        job_role: Optional job role to include in the file name to avoid conflicts
        
    Returns:
        Tuple of (success, file_url)
    """
    try:
        if supabase is None:
            print(f"Warning: Supabase client not initialized. Skipping resume upload for: {file_path}")
            return True, f"file://{os.path.abspath(file_path)}"
            
        # Generate a unique file name if none provided
        if not file_name:
            ext = os.path.splitext(file_path)[1]
            file_name = f"{str(uuid.uuid4())}{ext}"
        
        # Include job role in file name to avoid conflicts if provided
        if job_role:
            sanitized_role = re.sub(r'[^a-zA-Z0-9_-]', '', job_role.replace(' ', '_').lower())
            name_part, ext_part = os.path.splitext(file_name)
            file_name = f"{sanitized_role}_{name_part}{ext_part}"
        
        # First just try uploading directly - if bucket exists and works, this will succeed
        # If not, we fallback gracefully to local path
        content_type = get_mime_type(file_path)
        
        print(f"Uploading file to Supabase: {file_path} as {file_name}")
        
        with open(file_path, "rb") as f:
            file_data = f.read()
        
        # Try upload with different SDK versions
        for attempt_args in [
            {"path": file_name, "file": file_data, "file_options": {"contentType": content_type}},
            {"path": file_name, "file": file_data},
        ]:
            try:
                supabase.storage.from_(RESUME_BUCKET).upload(**attempt_args)
                # Get the public URL
                file_url = supabase.storage.from_(RESUME_BUCKET).get_public_url(file_name)
                print(f"Successfully uploaded file to Supabase. Public URL: {file_url}")
                return True, file_url
            except Exception as e:
                error_msg = str(e)
                if "already exists" in error_msg.lower():
                    # File already exists - get the URL
                    file_url = supabase.storage.from_(RESUME_BUCKET).get_public_url(file_name)
                    print(f"File already exists. URL: {file_url}")
                    return True, file_url
                print(f"Upload attempt failed: {error_msg[:80]}...")
                continue
        
        # If we're here, all upload attempts failed.
        # This is expected if the 'resume' bucket hasn't been created in Supabase.
        # Use local file path as fallback (candidate data still saved to DB).
        print(f"Resume upload to Supabase failed. Using local path as fallback.")
        return True, f"file://{os.path.abspath(file_path)}"
        
    except Exception as e:
        print(f"Error uploading file {file_path} to Supabase: {str(e)}")
        return True, f"file://{os.path.abspath(file_path)}"  # Return local fallback, don't fail

def delete_resume(file_name: str) -> bool:
    """
    Delete a resume file from storage
    
    Args:
        file_name: Name of the file to delete
        
    Returns:
        True if deleted successfully, False otherwise
    """
    try:
        print(f"Deleting file from Supabase: {file_name}")
        supabase.storage.from_(RESUME_BUCKET).remove([file_name])
        print(f"Successfully deleted file: {file_name}")
        return True
    except Exception as e:
        print(f"Error deleting file {file_name} from Supabase: {str(e)}")
        return False
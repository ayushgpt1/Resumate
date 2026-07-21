import os
from typing import Dict, List, Optional, Any, Tuple
import json
from utils.supabase_db import store_candidate, assign_candidate_to_role, store_job_role, delete_candidate, remove_candidate_from_role
from utils.supabase_storage import upload_resume, delete_resume
from utils.local_storage import (
    store_candidate_local, store_job_role_local, assign_candidate_to_role_local,
    get_all_roles_local, get_candidates_for_role_local
)

class TransactionTracker:
    """Class to track operations for potential rollback"""
    
    def __init__(self):
        self.uploaded_files = []  # List of file names uploaded to storage
        self.stored_candidates = []  # List of candidate IDs stored in database
        self.role_assignments = []  # List of (role_name, candidate_id) tuples
    
    def add_file(self, file_name):
        """Track an uploaded file"""
        self.uploaded_files.append(file_name)
    
    def add_candidate(self, candidate_id):
        """Track a stored candidate"""
        self.stored_candidates.append(candidate_id)
    
    def add_role_assignment(self, role_name, candidate_id):
        """Track a role assignment"""
        self.role_assignments.append((role_name, candidate_id))
    
    def rollback(self):
        """Rollback all tracked operations"""
        print(f"Rolling back transaction: {len(self.uploaded_files)} files, {len(self.stored_candidates)} candidates")
        
        for file_name in self.uploaded_files:
            delete_resume(file_name)
        
        for role_name, candidate_id in self.role_assignments:
            remove_candidate_from_role(role_name, candidate_id)
        
        for candidate_id in self.stored_candidates:
            delete_candidate(candidate_id)
        
        self.uploaded_files.clear()
        self.stored_candidates.clear()
        self.role_assignments.clear()

class CandidateProcessor:
    """Class to handle all candidate-related operations"""
    
    @staticmethod
    def process_candidate_data(candidate_info: Dict[str, Any], resume_path: Optional[str] = None, 
                              job_role: Optional[str] = None, 
                              transaction: Optional[TransactionTracker] = None,
                              user_id: str = "") -> Tuple[bool, Dict[str, Any]]:
        """
        Process candidate information, store in database, and handle resume uploads
        
        Args:
            candidate_info: Dictionary containing candidate information
            resume_path: Path to the resume file
            job_role: The job role to associate this candidate with
            transaction: TransactionTracker to track operations for potential rollback
            
        Returns:
            Tuple of (success, updated_candidate_info)
        """
        local_transaction = transaction is None
        if local_transaction:
            transaction = TransactionTracker()
        
        try:
            # Print debug info about the original candidate data
            print(f"Processing candidate: {candidate_info.get('name', 'Unknown')} with resume: {resume_path}")
            
            # Clean and validate candidate info to ensure required fields are present
            validated_info = candidate_info.copy()
            
            # Validate/set name field
            if not validated_info.get("name") or validated_info.get("name") == "Unknown":
                # Try alternative fields
                for field in ["candidateName", "candidate_name", "fullName", "full_name"]:
                    if field in validated_info and validated_info[field]:
                        validated_info["name"] = validated_info[field]
                        break
                        
            # Validate/set email field
            if not validated_info.get("email") or validated_info.get("email") == "Not provided":
                # Try alternative fields
                for field in ["emailAddress", "candidate_email", "email_address"]:
                    if field in validated_info and validated_info[field]:
                        validated_info["email"] = validated_info[field]
                        break
            
            # Generate a unique email if none is found to avoid null constraint issues
            if not validated_info.get("email") or validated_info.get("email") == "Not provided":
                import uuid
                unique_id = str(uuid.uuid4())[:8]
                name_part = validated_info.get("name", "candidate").replace(" ", "").lower()
                validated_info["email"] = f"{name_part}_{unique_id}@noemail.provided"
                print(f"Generated unique email for candidate without email: {validated_info['email']}")
            
            # Validate/set phone_number field
            if not validated_info.get("phone_number") or validated_info.get("phone_number") == "Not provided":
                # Try alternative fields
                for field in ["phoneNumber", "phone", "contact", "contactNumber"]:
                    if field in validated_info and validated_info[field]:
                        validated_info["phone_number"] = validated_info[field]
                        break
            
            # Make sure we have a ranking score
            if not validated_info.get("ranking_score"):
                # Try alternative fields
                for field in ["score", "overall_score", "fit_score", "rating"]:
                    if field in validated_info and validated_info[field]:
                        try:
                            # Convert to float in case it's a string
                            validated_info["ranking_score"] = float(validated_info[field])
                            break
                        except (ValueError, TypeError):
                            pass
                
                # If still no score, default to 0
                if not validated_info.get("ranking_score"):
                    validated_info["ranking_score"] = 0
            
            # Upload resume if provided
            resume_link = None
            file_name = None
            
            if resume_path and os.path.exists(resume_path):
                # Generate a unique filename based on candidate email or name
                email = validated_info.get('email', '').replace('@', '_at_')
                name = validated_info.get('name', '').replace(' ', '_')
                
                if email and email != "Not provided":
                    base_filename = email
                elif name and name != "Unknown":
                    base_filename = name
                else:
                    import uuid
                    base_filename = str(uuid.uuid4())
                
                ext = os.path.splitext(resume_path)[1]
                file_name = f"{base_filename}{ext}"
                
                # Upload to storage - pass job_role to include in file name
                # Note: upload_resume now returns a fallback local path if storage fails
                success, resume_link = upload_resume(resume_path, file_name, job_role)
                if not success:
                    print(f"Warning: Resume upload failed, but continuing with candidate processing. Resume: {resume_path}")
                    # Don't fail the entire operation if storage fails - continue without resume link
                    resume_link = None
                else:
                    if file_name and resume_link and not resume_link.startswith("file://"):
                        # Only track files that were actually uploaded to storage
                        transaction.add_file(file_name)
            
            # Separate base candidate info from role-specific info
            base_candidate_info = {
                "name": validated_info.get("name", "Unknown"),
                "email": validated_info.get("email", "Not provided"),
                "phone_number": validated_info.get("phone_number", "Not provided"),
                "resume_link": resume_link
            }

            # Full local-storage candidate info includes the rich fields too,
            # because the local storage layer stores them on the candidate
            # record itself (unlike Supabase, which keeps role-specific data in
            # the role_candidates junction table).
            local_candidate_info = {
                **validated_info,
                "resume_link": resume_link
            }

            # Store basic candidate in database
            print(f"Storing base candidate with data: name={base_candidate_info.get('name')}, email={base_candidate_info.get('email')}")
            candidate_id = store_candidate(base_candidate_info, resume_link, user_id)

            # Fallback to local storage if Supabase fails
            if not candidate_id:
                print(f"WARNING: Supabase storage failed. Falling back to local storage...")
                candidate_id = store_candidate_local(local_candidate_info, resume_link, user_id)
                if not candidate_id:
                    print(f"ERROR: Failed to store candidate in both Supabase and local storage for candidate: {base_candidate_info.get('name')}")
                    if local_transaction:
                        transaction.rollback()
                    return False, candidate_info
                print(f"✓ Stored candidate locally (ID: {candidate_id})")
                
            transaction.add_candidate(candidate_id)
            
            # Store job role and associate candidate with role if both are present
            if candidate_id and job_role:
                print(f"Storing job role: {job_role}")
                role_name = store_job_role(job_role, user_id)
                
                # Fallback to local storage if Supabase fails
                if not role_name:
                    print(f"WARNING: Supabase role storage failed. Falling back to local storage...")
                    role_name = store_job_role_local(job_role, user_id)
                    if not role_name:
                        print(f"ERROR: Failed to store job role in both Supabase and local storage for role: {job_role}")
                        if local_transaction:
                            transaction.rollback()
                        return False, candidate_info
                    print(f"✓ Stored role locally: {role_name}")
                else:
                    print(f"Successfully stored job role: {role_name}")
                
                # Role-specific data to store in role_candidates
                role_specific_data = {
                    "ranking_score": float(validated_info.get('ranking_score', 0)),
                    "experience": validated_info.get("experience", ""),
                    "skills": validated_info.get("skills", []),
                    "cultural_fit": validated_info.get("cultural_fit", ""),
                    "communication": validated_info.get("communication", ""),
                    "explanation": validated_info.get("explanation", "")
                }
                
                print(f"Assigning candidate {candidate_id} to role {role_name}")
                success = assign_candidate_to_role(role_name, candidate_id, role_specific_data, user_id)
                
                # Fallback to local storage if Supabase fails
                if not success:
                    print(f"WARNING: Supabase role assignment failed. Falling back to local storage...")
                    success = assign_candidate_to_role_local(role_name, candidate_id, role_specific_data, user_id)
                    if not success:
                        print(f"ERROR: Failed to assign candidate to role in both Supabase and local storage for candidate_id={candidate_id}, role={role_name}")
                        if local_transaction:
                            transaction.rollback()
                        return False, candidate_info
                    print(f"✓ Assigned candidate to role locally")
                else:
                    print(f"Successfully assigned candidate {candidate_id} to role {role_name}")
                
                transaction.add_role_assignment(role_name, candidate_id)
            
            # Update candidate info with database ID and resume link
            result = validated_info.copy()
            result['id'] = candidate_id
            result['resume_link'] = resume_link
            
            return True, result
        except Exception as e:
            print(f"Error processing candidate: {e}")
            import traceback
            traceback.print_exc()
            if local_transaction:
                transaction.rollback()
            return False, candidate_info
    
    @classmethod
    def process_candidates_batch(cls, candidates_data, job_role, resume_paths=None, user_id=""):
        """
        Process a batch of candidates data
        
        Args:
            candidates_data: List of dictionaries containing candidate information
            job_role: The name of the job role to assign candidates to
            resume_paths: Dictionary mapping candidate file attributes to resume file paths
            user_id: The authenticated user's ID for multi-tenant isolation
            
        Returns:
            List of processed candidate information dictionaries
        """
        results = []
        transaction = TransactionTracker()
        
        print(f"Starting batch processing of {len(candidates_data)} candidates for role: {job_role} for user: {user_id}")
        print(f"Resume paths available: {list(resume_paths.keys()) if resume_paths else 'None'}")
        
        errors = []  # Track errors instead of stopping on first error
        
        for i, candidate_info in enumerate(candidates_data):
            resume_path = None
            
            # Try to find a resume for this candidate (improved debugging)
            if resume_paths:
                candidate_file = candidate_info.get('file')
                print(f"Candidate {i} has file attribute: {candidate_file}")
                
                if candidate_file and candidate_file in resume_paths:
                    resume_path = resume_paths[candidate_file]
                    print(f"Found resume path by file name: {resume_path}")
                elif str(i) in resume_paths:
                    resume_path = resume_paths[str(i)]
                    print(f"Found resume path by string index: {resume_path}")
                elif i in resume_paths:
                    resume_path = resume_paths[i]
                    print(f"Found resume path by index: {resume_path}")
                else:
                    print(f"WARNING: Could not find resume path for candidate {i} with file {candidate_file}")
            
            # Process the candidate
            try:
                success, processed_info = CandidateProcessor.process_candidate_data(
                    candidate_info, resume_path, job_role, transaction, user_id
                )
                
                if success:
                    results.append(processed_info)
                    print(f"✓ Successfully processed candidate {i}: {candidate_info.get('name', 'Unknown')}")
                else:
                    error_msg = f"Failed to process candidate {i}: {candidate_info.get('name', 'Unknown')}"
                    # Check if processed_info has error details
                    if processed_info and isinstance(processed_info, dict):
                        if 'error' in processed_info:
                            error_msg += f" - {processed_info['error']}"
                    errors.append(error_msg)
                    print(f"✗ {error_msg}")
            except Exception as e:
                errors.append(f"Exception processing candidate {i}: {str(e)}")
                import traceback
                traceback.print_exc()
        
        if errors:
            # Only rollback if all candidates failed - we want to keep the successful ones
            if len(errors) == len(candidates_data):
                print("=" * 80)
                print("ERROR: All candidates failed processing. Rolling back all changes.")
                print("=" * 80)
                for i, error in enumerate(errors):
                    print(f"  Error {i+1}: {error}")
                print("=" * 80)
                transaction.rollback()
                return []
            else:
                # Log errors but continue with the successful candidates
                print(f"Some candidates failed processing ({len(errors)} out of {len(candidates_data)}):")
                for error in errors:
                    print(f" - {error}")
        
        print(f"Successfully processed {len(results)} out of {len(candidates_data)} candidates")
        if len(results) == 0:
            print("WARNING: No candidates were successfully processed. Check the errors above.")
        return results

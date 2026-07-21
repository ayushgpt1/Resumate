import os
from typing import Dict, List, Optional, Any, Union, Tuple
from .supabase_client import initialize_supabase

supabase = initialize_supabase()

# Cache to store which tables have 'user_id' column
_has_user_id_cache = {}

def _table_has_user_id(table_name: str) -> bool:
    """Check if a table has the 'user_id' column, cached"""
    global _has_user_id_cache
    if table_name in _has_user_id_cache:
        return _has_user_id_cache[table_name]
        
    try:
        if supabase is None:
            return False
            
        # Try a quick select to see if user_id column can be queried
        supabase.table(table_name).select('user_id').limit(1).execute()
        _has_user_id_cache[table_name] = True
        return True
    except Exception:
        _has_user_id_cache[table_name] = False
        return False

def _check_supabase():
    """Check if Supabase client is initialized"""
    if supabase is None:
        print("ERROR: Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_KEY in .env file.")
        return False
    return True

def test_supabase_connection() -> Tuple[bool, str]:
    """
    Test if Supabase database connection is working
    
    Returns:
        Tuple of (success, error_message)
    """
    try:
        if not _check_supabase():
            return False, "Supabase client not initialized"
        
        # Try a simple query to test connectivity
        result = supabase.table('open_roles').select('id').limit(1).execute()
        return True, "Connection successful"
    except Exception as e:
        error_str = str(e)
        if "getaddrinfo failed" in error_str or "11001" in error_str:
            return False, f"Network error: Cannot connect to Supabase database. {error_str}"
        elif "permission denied" in error_str.lower() or "RLS" in error_str:
            return False, f"Permission error: Check Supabase RLS policies. {error_str}"
        else:
            return False, f"Connection test failed: {error_str}"

def store_job_role(role_name: str, user_id: str = "") -> Optional[str]:
    """
    Store a job role in the database and return its name
    
    Args:
        role_name: The name of the job role
        user_id: The authenticated user's ID for multi-tenant isolation
        
    Returns:
        The name of the job role or None if there was an error
    """
    try:
        if not _check_supabase():
            return None
            
        if not role_name:
            return None
            
        # Normalize job role name for searching (remove extra spaces, convert to lowercase)
        normalized_role = role_name.strip()
        
        # First try exact match for this user
        query = supabase.table('open_roles').select('*').eq('role_name', role_name)
        if user_id and _table_has_user_id('open_roles'):
            query = query.eq('user_id', user_id)
        response = query.execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]['role_name']
        
        # Role doesn't exist for this user, insert it
        insert_data = {"role_name": role_name}
        if user_id and _table_has_user_id('open_roles'):
            insert_data["user_id"] = user_id
            
        result = supabase.table('open_roles').insert(insert_data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]['role_name']
        return None
    except Exception as e:
        print(f"Error storing job role '{role_name}': {e}")
        import traceback
        traceback.print_exc()
        return None

def role_exists(role_name: str) -> bool:
    """
    Check if a job role exists in the database, case-insensitive
    
    Args:
        role_name: The name of the job role to check
        
    Returns:
        True if the role exists, False otherwise
    """
    try:
        if not role_name:
            return False
            
        # Try case-insensitive search using ilike
        response = supabase.table('open_roles').select('*')\
                  .ilike('role_name', role_name.strip()).execute()
        
        return bool(response.data and len(response.data) > 0)
    except Exception as e:
        print(f"Error checking if role exists: {e}")
        return False

def store_candidate(candidate_info: Dict[str, Any], resume_link: str = None, user_id: str = "") -> Optional[int]:
    """
    Store candidate information in the database
    
    Args:
        candidate_info: Dictionary containing candidate information
        resume_link: Link to the candidate's resume in storage
        user_id: The authenticated user's ID for multi-tenant isolation
        
    Returns:
        The ID of the inserted candidate or None if there was an error
    """
    try:
        if not _check_supabase():
            return None
            
        # Add resume link, default status, and user_id
        candidate_data = {
            "name": candidate_info.get("name", "Unknown"),
            "email": candidate_info.get("email", "Not provided"),
            "phone_number": candidate_info.get("phone_number", "Not provided"),
            "experience": candidate_info.get("experience", ""),
            "skills": candidate_info.get("skills", []),
            "cultural_fit": candidate_info.get("cultural_fit", ""),
            "communication": candidate_info.get("communication", ""),
            "ranking_score": candidate_info.get("ranking_score", 0),
            "explanation": candidate_info.get("explanation", ""),
            "status": "active",
            "resume_link": resume_link
        }
        
        if user_id and _table_has_user_id('candidates'):
            candidate_data["user_id"] = user_id
        
        # Ensure no None values
        for key, value in candidate_data.items():
            if value is None:
                if key in ["skills"]:
                    candidate_data[key] = []
                elif key in ["ranking_score"]:
                    candidate_data[key] = 0
                else:
                    candidate_data[key] = ""
        
        # Insert new candidate
        try:
            print(f"Attempting to insert candidate into database...")
            result = supabase.table('candidates').insert(candidate_data).execute()
            
            if result.data and len(result.data) > 0:
                new_id = result.data[0]['id']
                print(f"Successfully inserted new candidate with ID: {new_id}")
                return new_id
            else:
                print("ERROR: No data returned from insert operation.")
                return None
        except Exception as insert_error:
            error_str = str(insert_error)
            print(f"ERROR: Insert failed: {error_str}")
            
            # Try with unique email as fallback
            try:
                import uuid
                unique_id = str(uuid.uuid4())
                candidate_data["email"] = f"candidate_{unique_id}@unique.generated"
                print(f"Retrying with unique email: {candidate_data['email']}")
                
                retry_result = supabase.table('candidates').insert(candidate_data).execute()
                if retry_result.data and len(retry_result.data) > 0:
                    new_id = retry_result.data[0]['id']
                    print(f"Inserted candidate with unique email, ID: {new_id}")
                    return new_id
            except Exception as retry_error:
                print(f"Retry also failed: {retry_error}")
            
            return None
    except Exception as e:
        print(f"Error storing candidate '{candidate_info.get('name', 'Unknown')}': {e}")
        import traceback
        traceback.print_exc()
        return None

def assign_candidate_to_role(role_name: str, candidate_id: int, candidate_data: Dict[str, Any], user_id: str = "") -> bool:
    """
    Assign a candidate to a job role using the role_candidates junction table
    
    Args:
        role_name: The name of the job role
        candidate_id: The ID of the candidate
        candidate_data: The role-specific candidate data
        user_id: The authenticated user's ID for multi-tenant isolation
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if not _check_supabase():
            return False
            
        if not role_name or not isinstance(role_name, str) or not role_name.strip():
            print(f"Warning: Invalid role name: {role_name}")
            return False
            
        if not candidate_id or not isinstance(candidate_id, int) or candidate_id <= 0:
            print(f"Warning: Invalid candidate ID: {candidate_id}")
            return False
            
        # Get role_id from role_name (for this user)
        print(f"Looking up role_id for role_name: {role_name}")
        role_query = supabase.table('open_roles').select('id').eq('role_name', role_name)
        if user_id and _table_has_user_id('open_roles'):
            role_query = role_query.eq('user_id', user_id)
        role_response = role_query.execute()
        
        if not role_response.data or len(role_response.data) == 0:
            print(f"ERROR: No role found with name: {role_name}")
            return False
            
        role_id = role_response.data[0]['id']
        print(f"Found role_id: {role_id} for role_name: {role_name}")
            
        # Check if relationship already exists
        response = supabase.table('role_candidates').select('*')\
                  .eq('role_id', role_id)\
                  .eq('candidate_id', candidate_id).execute()
        
        # Prepare data
        role_candidate_data = {
            "role_id": role_id,
            "candidate_id": candidate_id,
            "ranking_score": float(candidate_data.get("ranking_score", 0)),
            "experience": str(candidate_data.get("experience", "")),
            "skills": candidate_data.get("skills", []) if isinstance(candidate_data.get("skills"), list) else [],
            "cultural_fit": str(candidate_data.get("cultural_fit", "")),
            "communication": str(candidate_data.get("communication", "")),
            "explanation": str(candidate_data.get("explanation", ""))
        }
        
        if user_id and _table_has_user_id('role_candidates'):
            role_candidate_data["user_id"] = user_id
        
        # Ensure no None values
        for key, value in role_candidate_data.items():
            if value is None:
                if key == "skills":
                    role_candidate_data[key] = []
                elif key == "ranking_score":
                    role_candidate_data[key] = 0
                else:
                    role_candidate_data[key] = ""
        
        if response.data and len(response.data) > 0:
            existing_id = response.data[0]['id']
            print(f"Updating existing role_candidate relationship (id: {existing_id})")
            result = supabase.table('role_candidates').update(role_candidate_data)\
                    .eq('role_id', role_id)\
                    .eq('candidate_id', candidate_id).execute()
        else:
            print(f"Creating new role_candidate relationship")
            result = supabase.table('role_candidates').insert(role_candidate_data).execute()
        
        if result.data:
            print(f"Successfully assigned candidate {candidate_id} to role {role_name}")
            return True
        else:
            print(f"ERROR: Assignment returned no data.")
            return False
    except Exception as e:
        print(f"Error assigning candidate {candidate_id} to role '{role_name}': {e}")
        import traceback
        traceback.print_exc()
        return False

def get_candidates_for_role(role_name: str, user_id: str = "") -> List[Dict[str, Any]]:
    """
    Get all candidates for a specific role, filtered by user_id
    
    Args:
        role_name: The name of the job role
        user_id: The authenticated user's ID for multi-tenant isolation
        
    Returns:
        List of candidate information dictionaries
    """
    print(f"Searching for candidates with role: {role_name} for user: {user_id}")
    try:
        if not _check_supabase():
            from utils.local_storage import get_candidates_for_role_local
            print("Supabase unavailable, using local storage for candidates")
            return get_candidates_for_role_local(role_name, user_id)
            
        # First, get the role ID for this user
        role_query = supabase.table('open_roles').select('id').eq('role_name', role_name)
        if user_id and _table_has_user_id('open_roles'):
            role_query = role_query.eq('user_id', user_id)
        role_response = role_query.execute()
        
        if not role_response.data or len(role_response.data) == 0:
            print(f"No role found with name: {role_name}")
            return []
            
        role_id = role_response.data[0]['id']
        
        # Query candidates via role_candidates
        rc_query = supabase.table('role_candidates')\
            .select('''
                candidates!inner(id, name, email, phone_number, resume_link),
                role_id,
                ranking_score,
                experience,
                skills,
                cultural_fit,
                communication,
                explanation
            ''')\
            .eq('role_id', role_id)\
            .order('ranking_score', desc=True)
        
        if user_id and _table_has_user_id('role_candidates'):
            rc_query = rc_query.eq('user_id', user_id)
            
        query = rc_query.execute()
        
        # Process the results
        results = []
        if query.data:
            for item in query.data:
                candidate = item['candidates'].copy()
                candidate['ranking_score'] = item['ranking_score']
                candidate['experience'] = item['experience']
                candidate['skills'] = item['skills']
                candidate['cultural_fit'] = item['cultural_fit']
                candidate['communication'] = item['communication']
                candidate['explanation'] = item['explanation']
                results.append(candidate)
        
        return results
    except Exception as e:
        print(f"Error getting candidates for role: {e}")
        try:
            from utils.local_storage import get_candidates_for_role_local
            print("Falling back to local storage for candidates")
            return get_candidates_for_role_local(role_name, user_id)
        except:
            import traceback
            traceback.print_exc()
            return []

def get_all_roles(user_id: str = "") -> List[Dict[str, Any]]:
    """
    Get all job roles with candidate counts, filtered by user_id
    
    Args:
        user_id: The authenticated user's ID for multi-tenant isolation
        
    Returns:
        List of role dictionaries with candidate counts
    """
    print(f"Getting all roles for user: {user_id}")
    try:
        if not _check_supabase():
            from utils.local_storage import get_all_roles_local
            return get_all_roles_local(user_id)
        
        # Get roles for this user
        role_query = supabase.table('open_roles').select('*')
        if user_id and _table_has_user_id('open_roles'):
            role_query = role_query.eq('user_id', user_id)
        role_response = role_query.execute()
        
        # Get candidate counts for each role
        roles_data = []
        if role_response.data:
            for role in role_response.data:
                role_id = role['id']
                
                # Count candidates for this role (filtered by user)
                count_query = supabase.table('role_candidates').select('id', count='exact')\
                    .eq('role_id', role_id)
                if user_id and _table_has_user_id('role_candidates'):
                    count_query = count_query.eq('user_id', user_id)
                count_response = count_query.execute()
                
                candidate_count = count_response.count if hasattr(count_response, 'count') else 0
                
                roles_data.append({
                    "role_name": role['role_name'],
                    "candidate_count": candidate_count,
                    "created_date": role.get('created_date', '')
                })
        
        return roles_data
    except Exception as e:
        print(f"Error getting all roles: {e}")
        try:
            from utils.local_storage import get_all_roles_local
            return get_all_roles_local(user_id)
        except:
            return []

def delete_candidate(candidate_id: int, user_id: str = "") -> bool:
    """
    Delete a candidate by ID, including their resume from Supabase Storage
    
    Args:
        candidate_id: The ID of the candidate to delete
        user_id: The authenticated user's ID for multi-tenant isolation
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if not _check_supabase():
            return False
            
        # First, get the candidate's resume_link to delete the file from storage
        resume_query = supabase.table('candidates').select('resume_link').eq('id', candidate_id)
        if user_id and _table_has_user_id('candidates'):
            resume_query = resume_query.eq('user_id', user_id)
        resume_response = resume_query.execute()
        
        if resume_response.data and len(resume_response.data) > 0:
            resume_link = resume_response.data[0].get('resume_link', '')
            if resume_link and not resume_link.startswith('file://'):
                # Extract file name from the Supabase storage URL
                # URL format: https://<project>.supabase.co/storage/v1/object/public/Resume/<filename>
                try:
                    file_name = resume_link.rsplit('/', 1)[-1]
                    if file_name:
                        from utils.supabase_storage import delete_resume
                        delete_resume(file_name)
                        print(f"Deleted resume file '{file_name}' from storage for candidate {candidate_id}")
                except Exception as storage_error:
                    print(f"Warning: Could not delete resume from storage: {storage_error}")
        
        # Remove candidate from all role assignments
        rc_query = supabase.table('role_candidates').delete().eq('candidate_id', candidate_id)
        if user_id and _table_has_user_id('role_candidates'):
            rc_query = rc_query.eq('user_id', user_id)
        rc_query.execute()
        
        # Delete the candidate
        c_query = supabase.table('candidates').delete().eq('id', candidate_id)
        if user_id and _table_has_user_id('candidates'):
            c_query = c_query.eq('user_id', user_id)
        c_query.execute()
        
        print(f"Deleted candidate {candidate_id} (including resume from storage)")
        return True
    except Exception as e:
        print(f"Error deleting candidate {candidate_id}: {e}")
        return False

def remove_candidate_from_role(role_name: str, candidate_id: int, user_id: str = "") -> bool:
    """
    Remove a candidate from a specific role
    
    Args:
        role_name: The name of the job role
        candidate_id: The ID of the candidate
        user_id: The authenticated user's ID
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if not _check_supabase():
            return False
        
        role_response = supabase.table('open_roles').select('id').eq('role_name', role_name).execute()
        if not role_response.data or len(role_response.data) == 0:
            return False
            
        role_id = role_response.data[0]['id']
        
        rc_query = supabase.table('role_candidates').delete()\
            .eq('role_id', role_id)\
            .eq('candidate_id', candidate_id)
        if user_id and _table_has_user_id('role_candidates'):
            rc_query = rc_query.eq('user_id', user_id)
        rc_query.execute()
        
        return True
    except Exception as e:
        print(f"Error removing candidate {candidate_id} from role {role_name}: {e}")
        return False
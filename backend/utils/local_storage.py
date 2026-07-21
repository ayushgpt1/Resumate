"""
Local storage fallback when Supabase is unavailable
Stores data in JSON files locally, with per-user isolation
"""
import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime

# Local storage directory
STORAGE_DIR = "local_data"
CANDIDATES_FILE = os.path.join(STORAGE_DIR, "candidates.json")
ROLES_FILE = os.path.join(STORAGE_DIR, "roles.json")
ROLE_CANDIDATES_FILE = os.path.join(STORAGE_DIR, "role_candidates.json")

# Ensure storage directory exists
os.makedirs(STORAGE_DIR, exist_ok=True)

def _load_json(filepath: str, default: Any = None) -> Any:
    """Load JSON from file"""
    if default is None:
        default = []
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return default
    return default

def _save_json(filepath: str, data: Any):
    """Save JSON to file"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def store_candidate_local(candidate_info: Dict[str, Any], resume_link: str = None, user_id: str = "") -> Optional[int]:
    """Store candidate locally with user isolation"""
    candidates = _load_json(CANDIDATES_FILE, [])
    
    # Generate ID
    if candidates:
        new_id = max(c.get('id', 0) for c in candidates) + 1
    else:
        new_id = 1
    
    candidate_data = {
        "id": new_id,
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
        "resume_link": resume_link,
        "user_id": user_id,
        "created_at": datetime.now().isoformat()
    }
    
    candidates.append(candidate_data)
    _save_json(CANDIDATES_FILE, candidates)
    print(f"✓ Stored candidate locally with ID: {new_id} for user: {user_id}")
    return new_id

def store_job_role_local(role_name: str, user_id: str = "") -> Optional[str]:
    """Store job role locally with user isolation"""
    roles = _load_json(ROLES_FILE, [])
    
    # Check if role exists for this user
    for role in roles:
        if role.get('role_name', '').lower() == role_name.lower() and role.get('user_id') == user_id:
            return role['role_name']
    
    # Add new role
    new_role = {
        "id": len(roles) + 1,
        "role_name": role_name,
        "user_id": user_id,
        "created_date": datetime.now().isoformat().split('T')[0]
    }
    roles.append(new_role)
    _save_json(ROLES_FILE, roles)
    print(f"✓ Stored role locally: {role_name} for user: {user_id}")
    return role_name

def assign_candidate_to_role_local(role_name: str, candidate_id: int, candidate_data: Dict[str, Any], user_id: str = "") -> bool:
    """Assign candidate to role locally with user isolation"""
    role_candidates = _load_json(ROLE_CANDIDATES_FILE, [])
    roles = _load_json(ROLES_FILE, [])
    
    # Find role ID for this user
    role_id = None
    for role in roles:
        if role.get('role_name', '').lower() == role_name.lower() and role.get('user_id') == user_id:
            role_id = role.get('id')
            break
    
    if not role_id:
        print(f"ERROR: Role '{role_name}' not found for user {user_id}")
        return False
    
    # Check if assignment exists
    for rc in role_candidates:
        if rc.get('role_id') == role_id and rc.get('candidate_id') == candidate_id and rc.get('user_id') == user_id:
            # Update existing
            rc.update({
                "ranking_score": float(candidate_data.get("ranking_score", 0)),
                "experience": str(candidate_data.get("experience", "")),
                "skills": candidate_data.get("skills", []),
                "cultural_fit": str(candidate_data.get("cultural_fit", "")),
                "communication": str(candidate_data.get("communication", "")),
                "explanation": str(candidate_data.get("explanation", ""))
            })
            _save_json(ROLE_CANDIDATES_FILE, role_candidates)
            print(f"✓ Updated role assignment locally")
            return True
    
    # Create new assignment
    new_assignment = {
        "id": len(role_candidates) + 1,
        "role_id": role_id,
        "candidate_id": candidate_id,
        "user_id": user_id,
        "ranking_score": float(candidate_data.get("ranking_score", 0)),
        "experience": str(candidate_data.get("experience", "")),
        "skills": candidate_data.get("skills", []),
        "cultural_fit": str(candidate_data.get("cultural_fit", "")),
        "communication": str(candidate_data.get("communication", "")),
        "explanation": str(candidate_data.get("explanation", ""))
    }
    role_candidates.append(new_assignment)
    _save_json(ROLE_CANDIDATES_FILE, role_candidates)
    print(f"✓ Created role assignment locally")
    return True

def get_all_roles_local(user_id: str = "") -> List[Dict[str, Any]]:
    """Get all roles with candidate counts, filtered by user"""
    roles = _load_json(ROLES_FILE, [])
    role_candidates = _load_json(ROLE_CANDIDATES_FILE, [])
    
    # Filter roles by user
    user_roles = [r for r in roles if not user_id or r.get('user_id') == user_id]
    
    for role in user_roles:
        role_id = role.get('id')
        count = sum(1 for rc in role_candidates if rc.get('role_id') == role_id and (not user_id or rc.get('user_id') == user_id))
        role['candidate_count'] = count
    
    return user_roles

def delete_role_local(role_name: str, user_id: str = "") -> bool:
    """Delete a role and its candidate assignments, filtered by user"""
    roles = _load_json(ROLES_FILE, [])
    role_candidates = _load_json(ROLE_CANDIDATES_FILE, [])
    
    # Find role ID for this user
    role_id = None
    for role in roles:
        if role.get('role_name', '').lower() == role_name.lower() and role.get('user_id') == user_id:
            role_id = role.get('id')
            break
    
    if not role_id:
        print(f"ERROR: Role '{role_name}' not found for user {user_id}")
        return False
    
    # Remove role candidates for this user
    role_candidates = [rc for rc in role_candidates if not (rc.get('role_id') == role_id and rc.get('user_id') == user_id)]
    _save_json(ROLE_CANDIDATES_FILE, role_candidates)
    
    # Remove role
    roles = [r for r in roles if r.get('id') != role_id]
    _save_json(ROLES_FILE, roles)
    print(f"✓ Deleted role '{role_name}' locally for user {user_id}")
    return True

def delete_candidate_local(candidate_id: int, user_id: str = "") -> bool:
    """Delete a candidate locally with user isolation"""
    candidates = _load_json(CANDIDATES_FILE, [])
    role_candidates = _load_json(ROLE_CANDIDATES_FILE, [])
    
    # Remove from role_candidates for this user
    role_candidates = [rc for rc in role_candidates if not (rc.get('candidate_id') == candidate_id and rc.get('user_id') == user_id)]
    _save_json(ROLE_CANDIDATES_FILE, role_candidates)
    
    # Remove from candidates
    candidates = [c for c in candidates if c.get('id') != candidate_id or c.get('user_id') != user_id]
    _save_json(CANDIDATES_FILE, candidates)
    print(f"✓ Deleted candidate {candidate_id} locally for user {user_id}")
    return True

def get_candidates_for_role_local(role_name: str, user_id: str = "") -> List[Dict[str, Any]]:
    """Get candidates for a specific role, filtered by user"""
    roles = _load_json(ROLES_FILE, [])
    candidates = _load_json(CANDIDATES_FILE, [])
    role_candidates = _load_json(ROLE_CANDIDATES_FILE, [])
    
    # Find role ID for this user
    role_id = None
    for role in roles:
        if role.get('role_name', '').lower() == role_name.lower() and role.get('user_id') == user_id:
            role_id = role.get('id')
            break
    
    if not role_id:
        return []
    
    # Build results filtered by user
    results = []
    for rc in role_candidates:
        if rc.get('role_id') == role_id and rc.get('user_id') == user_id:
            candidate_id = rc.get('candidate_id')
            # Find candidate
            candidate = next((c for c in candidates if c.get('id') == candidate_id), None)
            if candidate:
                result = candidate.copy()
                # Add role-specific data
                result['ranking_score'] = rc.get('ranking_score', 0)
                result['experience'] = rc.get('experience', '')
                result['skills'] = rc.get('skills', [])
                result['cultural_fit'] = rc.get('cultural_fit', '')
                result['communication'] = rc.get('communication', '')
                result['explanation'] = rc.get('explanation', '')
                results.append(result)
    
    # Sort by ranking score
    results.sort(key=lambda x: float(x.get('ranking_score', 0)), reverse=True)
    return results
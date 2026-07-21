import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, User, Stars } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { deleteCandidate } from '../utils/api';
import { useAuth } from '@clerk/clerk-react';
import CandidateCard from '../components/candidateCard/CandidateCard';

const Candidates = ({ candidates, jobTitle, resetForm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const candidatesFromState = location.state?.candidates;
  const jobTitleFromState = location.state?.formData?.jobTitle;
  const { getToken } = useAuth();

  const [displayCandidates, setDisplayCandidates] = useState(candidates || candidatesFromState || []);
  const displayJobTitle = jobTitle || jobTitleFromState || "Unknown Job";
  const cameFromRoles = location.state?.fromRoles;

  useEffect(() => {
    setDisplayCandidates(candidates || candidatesFromState || []);
  }, [candidates, candidatesFromState]);

  useEffect(() => {
    if (displayCandidates.length === 0 && !location.state) {
      navigate('/roles');
    }
  }, [displayCandidates, location.state, navigate]);

  const handleBack = () => {
    if (cameFromRoles) {
      navigate('/roles');
    } else {
      if (resetForm) resetForm();
      navigate('/try');
    }
  };

  const handleDelete = async (candidateId) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication failed: No token received');
      }

      await deleteCandidate(token, candidateId);
      setDisplayCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast.success('Candidate deleted successfully');
    } catch (err) {
      console.error('Error deleting candidate:', err);
      toast.error(err.message || 'Failed to delete candidate. Please try again.');
    }
  };

  if (!displayCandidates || displayCandidates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md text-center border border-gray-100">
          <div className="bg-yellow-50 p-4 rounded-full w-fit mx-auto mb-4">
            <Stars className="h-8 w-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Candidates Found</h1>
          <p className="text-gray-600 mb-6 bg-blue-50 px-4 py-3 rounded-lg">
            There are no candidates to display. Try uploading some resumes first.
          </p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg mx-auto shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
            {cameFromRoles ? 'Back to roles' : 'Back to upload'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span>{cameFromRoles ? 'Back to roles' : 'Back to upload'}</span>
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Candidate Analysis Results</h1>
          <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full w-fit">
            <User className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-sm text-gray-700">
              Showing results for: <span className="font-medium text-blue-600">{displayJobTitle}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCandidates.map((candidate, index) => (
            <CandidateCard key={candidate.id || index} candidate={candidate} index={index} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Candidates;
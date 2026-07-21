import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, User, ChevronDown, ChevronUp, Filter, Search, Briefcase, Award, Star, Clock, Zap, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCandidatesByRole, deleteCandidate } from '../utils/api';
import CandidateCard from '../components/candidateCard/CandidateCard';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 w-full bg-gray-200 rounded"></div>
      <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
      <div className="h-3 w-4/6 bg-gray-200 rounded"></div>
    </div>
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
    </div>
    <div className="flex space-x-3 pt-3 border-t border-gray-100">
      <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
      <div className="h-9 w-full bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const CandidatesByRole = () => {
  const { roleName } = useParams();
  const decodedRoleName = decodeURIComponent(roleName);
  const [candidates, setCandidates] = useState([]);
  const [sortedCandidates, setSortedCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'ranking_score',
    direction: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        if (!token) {
          throw new Error('Authentication failed: No token received');
        }

        const candidatesData = await fetchCandidatesByRole(token, decodedRoleName);
        setCandidates(candidatesData);
        setSortedCandidates([...candidatesData].sort((a, b) => b.ranking_score - a.ranking_score));
      } catch (err) {
        console.error('Error loading candidates:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, [getToken, decodedRoleName]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });

    const sorted = [...candidates].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setSortedCandidates(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const handleDelete = async (candidateId) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication failed: No token received');
      }

      await deleteCandidate(token, candidateId);

      const updatedCandidates = candidates.filter(c => c.id !== candidateId);
      setCandidates(updatedCandidates);
      setSortedCandidates(sortedCandidates.filter(c => c.id !== candidateId));

      toast.success('Candidate deleted successfully');
    } catch (err) {
      console.error('Error deleting candidate:', err);
      toast.error(err.message || 'Failed to delete candidate. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/roles');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) {
      handleApplyFilters(selectedFilter, sortConfig, candidates);
    } else {
      const filteredCandidates = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      handleApplyFilters(selectedFilter, sortConfig, filteredCandidates);
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    handleApplyFilters(filter, sortConfig, candidates);
  };

  const handleApplyFilters = (filter, sortCfg, candidatesList) => {
    let filtered = [...candidatesList];
    
    if (searchTerm) {
      filtered = filtered.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter === 'top') {
      filtered = filtered.filter(c => c.ranking_score >= 80);
    } else if (filter === 'mid') {
      filtered = filtered.filter(c => c.ranking_score >= 60 && c.ranking_score < 80);
    } else if (filter === 'low') {
      filtered = filtered.filter(c => c.ranking_score < 60);
    }
    
    filtered.sort((a, b) => {
      if (a[sortCfg.key] < b[sortCfg.key]) {
        return sortCfg.direction === 'asc' ? -1 : 1;
      }
      if (a[sortCfg.key] > b[sortCfg.key]) {
        return sortCfg.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setSortedCandidates(filtered);
  };
  
  const getCandidateStats = () => {
    if (!candidates.length) return { top: 0, mid: 0, low: 0, total: 0 };
    
    return {
      top: candidates.filter(c => c.ranking_score >= 80).length,
      mid: candidates.filter(c => c.ranking_score >= 60 && c.ranking_score < 80).length,
      low: candidates.filter(c => c.ranking_score < 60).length,
      total: candidates.length
    };
  };
  
  const stats = getCandidateStats();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-100 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-red-100"
        >
          <div className="bg-red-50 p-5 rounded-full w-fit mx-auto mb-5 shadow-inner">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Candidates</h1>
          <p className="text-red-500 mb-6 px-5 py-4 bg-red-50 rounded-xl border border-red-100">{error}</p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-all px-6 py-3 rounded-lg mx-auto shadow-md w-full font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Roles
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isLoading && (!candidates || candidates.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-100 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-gray-100 hover:shadow-xl transition-all"
        >
          <div className="bg-yellow-50 p-5 rounded-full w-fit mx-auto mb-5 shadow-inner">
            <User className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Candidates Found</h1>
          <p className="text-gray-600 mb-6 bg-blue-50 px-5 py-4 rounded-xl border border-blue-100">
            There are no candidates for the role: <span className="font-medium text-blue-600">{decodedRoleName}</span>
          </p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-all px-6 py-3 rounded-lg mx-auto shadow-md w-full font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Roles
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-100 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Back to Roles</span>
        </button>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-blue-600" />
                Candidates for {decodedRoleName}
              </h1>
              <div className="flex items-center text-gray-600 bg-blue-50 px-4 py-2 rounded-full w-fit">
                <User className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm">
                  {isLoading ? 'Loading...' : `${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} found`}
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search candidates..." 
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full shadow-sm"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                <div className="text-purple-600 text-sm font-medium mb-1 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Total Candidates
                </div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-md transition-all">
                <div className="text-green-600 text-sm font-medium mb-1 flex items-center gap-2">
                  <Star className="h-4 w-4" /> Elites (80%+)
                </div>
                <div className="text-2xl font-bold">{stats.top}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all">
                <div className="text-blue-600 text-sm font-medium mb-1 flex items-center gap-2">
                  <Award className="h-4 w-4" /> Good Match (60-79%)
                </div>
                <div className="text-2xl font-bold">{stats.mid}</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 shadow-sm hover:shadow-md transition-all">
                <div className="text-yellow-600 text-sm font-medium mb-1 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Low Match {`<50%`}
                </div>
                <div className="text-2xl font-bold">{stats.low}</div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-3 rounded-xl mb-4">
            <div className="flex flex-wrap gap-2 mb-3 sm:mb-0">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'all' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                All Candidates
              </button>
              <button 
                onClick={() => handleFilterChange('top')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'top' 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Elites
              </button>
              <button 
                onClick={() => handleFilterChange('mid')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'mid' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Good Match
              </button>
              <button 
                onClick={() => handleFilterChange('low')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'low' 
                    ? 'bg-yellow-600 text-white shadow-sm' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Low Match
              </button>
            </div>
            
            <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600 mr-2">Sort:</span>
              <button
                onClick={() => handleSort('ranking_score')}
                className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  sortConfig.key === 'ranking_score' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'hover:bg-gray-100 text-gray-700'
                } transition-colors`}
              >
                Score {getSortIcon('ranking_score')}
              </button>
              <button
                onClick={() => handleSort('name')}
                className={`flex items-center px-3 py-1 rounded-full text-sm ml-2 ${
                  sortConfig.key === 'name' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'hover:bg-gray-100 text-gray-700'
                } transition-colors`}
              >
                Name {getSortIcon('name')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <SkeletonCard />
                  </motion.div>
                ))}
              </>
            ) : sortedCandidates.length > 0 ? (
              sortedCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CandidateCard candidate={candidate} index={index} onDelete={handleDelete} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <p className="text-gray-600">No candidates match your current filters.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidatesByRole;
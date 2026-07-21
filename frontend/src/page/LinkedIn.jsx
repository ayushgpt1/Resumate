import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Briefcase, Map, Clock, Cpu, Users, ArrowUpRight, FileText } from 'lucide-react';
import { apiGet } from '../utils/api';

const LinkedIn = () => {
  const [searchParams, setSearchParams] = useState({
    skills: '',
    min_experience: '',
    location: '',
    education: '',
    availability: false
  });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const searchCandidates = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setCandidates([]);
    setSelectedCandidate(null);
    setCandidateDetails(null);

    try {
      const params = Object.fromEntries(
        Object.entries({
          skills: searchParams.skills,
          min_experience: searchParams.min_experience,
          location: searchParams.location,
          education: searchParams.education,
          availability: searchParams.availability ? 'true' : undefined,
          page: page
        }).filter(([_, value]) => value !== '' && value !== undefined)
      );

      const data = await apiGet('/linkedin/candidates/search', params);

      if (!data || !Array.isArray(data.candidates)) {
        throw new Error('Invalid response format from server');
      }

      setCandidates(data.candidates || []);
      setTotalMatches(data.total_matches || 0);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateDetails = async (candidateId) => {
    if (!candidateId) return;

    setDetailsLoading(true);
    try {
      const data = await apiGet(`/linkedin/candidates/${candidateId}`);

      if (!data || !data.id) {
        throw new Error('Invalid candidate data received');
      }

      setCandidateDetails(data);
    } catch (err) {
      console.error('Candidate details error:', err);
      setError(err.message || 'Failed to load candidate details. Please try again.');
      setCandidateDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    fetchCandidateDetails(candidate.id);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    if (page > 1 || candidates.length > 0) {
      searchCandidates();
    }
  }, [page]);

  useEffect(() => {}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/3 translate-x-1/3 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 rounded-full translate-y-1/3 -translate-x-1/3 opacity-50"></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-3 rounded-2xl shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">LinkedIn Candidate Search</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mb-6">
              Find and filter potential candidates from the LinkedIn database. Use precise search criteria to discover talent that matches your requirements.
            </p>

            <form onSubmit={searchCandidates} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Cpu className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="skills"
                      value={searchParams.skills}
                      onChange={handleInputChange}
                      placeholder="Python, React, AWS..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Experience (years)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="min_experience"
                      value={searchParams.min_experience}
                      onChange={handleInputChange}
                      placeholder="3"
                      min="0"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Map className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={searchParams.location}
                      onChange={handleInputChange}
                      placeholder="Remote, New York, Bangalore..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="education"
                      value={searchParams.education}
                      onChange={handleInputChange}
                      placeholder="Computer Science, MBA..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center h-full pt-6">
                  <input
                    type="checkbox"
                    id="availability"
                    name="availability"
                    checked={searchParams.availability}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="availability" className="ml-2 block text-sm text-gray-700">
                    Immediately Available
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all px-5 py-3 rounded-xl shadow-md"
                >
                  <Search className="h-4 w-4" />
                  Search Candidates
                </button>
              </div>
            </form>
          </div>
        </div>

        {candidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Matches</p>
                <p className="text-2xl font-bold text-gray-800">{totalMatches}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Page</p>
                <p className="text-2xl font-bold text-gray-800">{page}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Skills Searched</p>
                <p className="text-2xl font-bold text-gray-800">{searchParams.skills ? searchParams.skills.split(',').length : 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <Cpu className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${selectedCandidate ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="relative w-20 h-20">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-indigo-600 font-medium">Loading candidates...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : candidates.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-2 rounded-lg shadow-sm mr-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Found {totalMatches} matching candidates
                </h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {candidates.map((candidate, index) => {
                      const colors = [
                        'from-blue-500 to-indigo-600',
                        'from-emerald-500 to-teal-600',
                        'from-violet-500 to-purple-600',
                        'from-amber-500 to-orange-600',
                        'from-rose-500 to-pink-600',
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <li
                          key={candidate.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-all ${selectedCandidate?.id === candidate.id ? 'bg-indigo-50' : ''}`}
                          onClick={() => handleCandidateSelect(candidate)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-start gap-3">
                              <div className={`h-10 w-1 bg-gradient-to-b ${color} rounded-full`}></div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                                <p className="text-sm text-gray-500">{candidate.current_role}</p>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <Briefcase className="h-4 w-4 mr-1" />
                                  <span>{candidate.experience_years} years experience</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                candidate.match_score >= 80 ? 'bg-green-100 text-green-800' :
                                candidate.match_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {candidate.match_score}% match
                              </span>
                              <div className="mt-1 flex flex-wrap justify-end gap-1">
                                {candidate.key_skills?.slice(0, 3).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-2 flex items-center text-indigo-600 font-medium text-xs group-hover:text-indigo-700 transition-colors">
                                View details
                                <ArrowUpRight className="ml-1 h-3 w-3" />
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {totalMatches > 10 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                      <div className="flex-1 flex justify-between">
                        <button
                          onClick={() => handlePageChange(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page * 10 >= totalMatches}
                          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            page * 10 >= totalMatches ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No candidates found</h2>
                <p className="text-gray-500 mb-4">Adjust your search criteria and try again.</p>
                <button
                  onClick={() => searchCandidates()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Try New Search
                </button>
              </div>
            )}
          </div>

          {selectedCandidate && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/3 translate-x-1/3 opacity-30"></div>

                {detailsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="relative w-20 h-20">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                  </div>
                ) : candidateDetails ? (
                  <div className="relative">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">{candidateDetails.name}</h2>
                      <p className="text-lg text-gray-600">{candidateDetails.current_role}</p>
                      {candidateDetails.profile_views && (
                        <p className="text-sm text-gray-500 mt-1">Profile viewed {candidateDetails.profile_views} times</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                          <User className="h-4 w-4 mr-2 text-indigo-600" />
                          Contact Information
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-sm mb-2"><strong>Email:</strong> {candidateDetails.contact}</p>
                          <p className="text-sm"><strong>Phone:</strong> {candidateDetails.phone}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-indigo-600" />
                          Availability
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-sm mb-2"><strong>Status:</strong> {candidateDetails.availability}</p>
                          <p className="text-sm"><strong>Last Updated:</strong> {new Date(candidateDetails.last_updated).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-indigo-600" />
                          Experience
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{candidateDetails.experience_years} years</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                          <Map className="h-4 w-4 mr-2 text-indigo-600" />
                          Salary Expectation
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-sm font-medium text-gray-900">${candidateDetails.salary_expectation.toLocaleString()}/year</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                          <Filter className="h-4 w-4 mr-2 text-indigo-600" />
                          Match Score
                        </h3>
                        <div className={`p-4 rounded-xl border ${
                          selectedCandidate.match_score >= 80 ? 'bg-green-50 border-green-100' :
                          selectedCandidate.match_score >= 60 ? 'bg-yellow-50 border-yellow-100' :
                          'bg-red-50 border-red-100'
                        }`}>
                          <p className={`text-sm font-bold ${
                            selectedCandidate.match_score >= 80 ? 'text-green-700' :
                            selectedCandidate.match_score >= 60 ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>{selectedCandidate.match_score}% match</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                          <Cpu className="h-4 w-4 mr-2 text-indigo-600" />
                          Skills
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {candidateDetails.skills.map((skill, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                          <Map className="h-4 w-4 mr-2 text-indigo-600" />
                          Location Preference
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {candidateDetails.location_preference.map((location, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {location}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                        Education & Certifications
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Education</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {candidateDetails.education.map((edu, index) => (
                              <li key={index}>{edu}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Certifications</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {candidateDetails.certifications.map((cert, index) => (
                              <li key={index}>{cert}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedCandidate(null);
                          setCandidateDetails(null);
                        }}
                        className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-all px-4 py-2 rounded-xl shadow-sm"
                      >
                        Back to Results
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-gray-500">Could not load candidate details.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedIn;

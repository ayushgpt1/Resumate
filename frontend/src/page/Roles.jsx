import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Briefcase, Users, ArrowUpRight, SearchIcon, Calendar, Plus, FileText, Star, BarChart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchRoles, deleteRole } from '../utils/api';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        if (!token) {
          throw new Error('Authentication failed: No token received');
        }

        const rolesData = await fetchRoles(token);
        setRoles(rolesData);
      } catch (err) {
        console.error('Error loading roles:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, [getToken]);

  const handleDeleteRole = async (e, roleName) => {
    e.stopPropagation();
    
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication failed: No token received');
      
      await deleteRole(token, roleName);
      setRoles(prev => prev.filter(r => r.role_name !== roleName));
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Failed to delete role. Please try again.');
    }
  };

  const handleRoleClick = (roleName) => {
    navigate(`/candidates/${encodeURIComponent(roleName)}`);
  };

  const filteredRoles = roles.filter(role => 
    role.role_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupRolesByDate = (roles) => {
    const groups = {};
    
    roles.forEach(role => {
      const date = new Date(role.created_date);
      const dateKey = date.toISOString().split('T')[0];
      const displayDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }).format(date);
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          displayDate,
          roles: []
        };
      }
      
      groups[dateKey].roles.push(role);
    });
    
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(key => groups[key]);
  };

  const groupedRoles = groupRolesByDate(filteredRoles);

  const getRandomColor = (index) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-violet-500 to-purple-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-cyan-500 to-blue-600'
    ];
    return colors[index % colors.length];
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/3 translate-x-1/3 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 rounded-full translate-y-1/3 -translate-x-1/3 opacity-50"></div>
          
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-3 rounded-2xl shadow-md">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800">Job Roles</h1>
                </div>
                <p className="text-gray-600 max-w-xl">
                  Browse and manage your job roles. Select a role to view matching candidates and their AI-ranked qualifications.
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/try')}
                className="flex items-center gap-2 text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all px-5 py-3 rounded-xl shadow-md w-fit"
              >
                <Plus className="h-5 w-5" />
                <span>Upload New Resumes</span>
              </motion.button>
            </div>

            {/* Search */}
            <div className="mb-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 shadow-sm"
                  placeholder="Search job roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { 
                  label: "Total Roles", 
                  value: roles.length, 
                  icon: <Briefcase className="h-5 w-5 text-indigo-600" />,
                  color: "bg-indigo-50"
                },
                { 
                  label: "Total Candidates", 
                  value: roles.reduce((sum, role) => sum + (role.candidate_count || 0), 0), 
                  icon: <Users className="h-5 w-5 text-blue-600" />,
                  color: "bg-blue-50"
                },
                { 
                  label: "Recent Uploads", 
                  value: roles.filter(role => new Date(role.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, 
                  icon: <FileText className="h-5 w-5 text-emerald-600" />,
                  color: "bg-emerald-50"
                }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl mb-6 shadow-sm">
            <p className="font-medium mb-1">Error loading roles</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Content Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-indigo-600 font-medium">Loading job roles...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Briefcase className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">No roles found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery 
                  ? `No roles match "${searchQuery}". Try adjusting your search terms.`
                  : "You haven't created any job roles yet. Upload resumes to get started with your candidate analysis."}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/try')}
                className="flex items-center gap-2 text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all px-6 py-3 rounded-xl mx-auto shadow-md"
              >
                <Plus className="h-5 w-5" />
                <span>Upload Resumes</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {groupedRoles.map((group, groupIndex) => (
                <motion.div 
                  key={group.displayDate} 
                  className="space-y-6"
                  variants={itemVariants}
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800">{group.displayDate}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.roles.map((role, index) => (
                      <motion.div
                        key={role.role_name}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group relative"
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRoleClick(role.role_name)}
                        variants={itemVariants}
                      >
                        <button
                          onClick={(e) => handleDeleteRole(e, role.role_name)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all z-10"
                          title="Delete role"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className={`h-2 w-full bg-gradient-to-r ${getRandomColor(index)}`}></div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`bg-gradient-to-r ${getRandomColor(index)} p-3 rounded-lg shadow-sm`}>
                              <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>{role.candidate_count} candidates</span>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">{role.role_name}</h3>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {[...Array(Math.min(3, role.candidate_count || 0))].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center overflow-hidden">
                                  <Users className="h-4 w-4 text-gray-400" />
                                </div>
                              ))}
                              {role.candidate_count > 3 && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-medium text-indigo-600">
                                  +{role.candidate_count - 3}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:text-indigo-700 transition-colors">
                              View details
                              <ArrowUpRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Roles;
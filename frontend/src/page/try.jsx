import React, { useState } from 'react';
import { Upload, FileText, Briefcase, FileSpreadsheet, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

function Try() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    files: [],
    jobTitle: '',
    jobDescription: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, files: Array.from(e.target.files) }));
      setUploadStatus('success');
    }
  };

  const removeFile = (index) => {
    const newFiles = [...formData.files];
    newFiles.splice(index, 1);
    setFormData((prev) => ({ ...prev, files: newFiles }));
    if (newFiles.length === 0) setUploadStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = await getToken();
      console.log('Token retrieved:', token ? 'Yes (length: ' + token.length + ')' : 'No');
      
      if (!token || token.trim() === '') {
        setError('Please sign in to continue. Authentication is required.');
        setIsLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      console.log('Files to upload:', formData.files.length);
      formData.files.forEach((file, index) => {
        console.log(`File ${index}: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
        formDataToSend.append('resumes', file);
      });
      formDataToSend.append('job_title', formData.jobTitle);
      formDataToSend.append('job_description', formData.jobDescription);
      console.log('Job title:', formData.jobTitle);
      console.log('Job description length:', formData.jobDescription.length);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Making request to:', `${apiUrl}/process`);
      console.log('Token present:', !!token);
      
      const response = await fetch(`${apiUrl}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to process resumes: ${response.statusText}. ${errorText || ''}`);
      }

      const result = await response.json();
      console.log('Response from server:', result);

      // Check if we have results
      if (result.results && result.results.length > 0) {
        // Navigate to candidates page with results
        navigate('/candidates', {
          state: {
            candidates: result.results,
            formData: {
              jobTitle: formData.jobTitle,
              jobDescription: formData.jobDescription,
              fileNames: formData.files.map(f => f.name)
            },
            fromRoles: false
          }
        });
      } else if (result.warning) {
        // Database unavailable but we have results
        if (result.results && result.results.length > 0) {
          navigate('/candidates', {
            state: {
              candidates: result.results,
              formData: {
                jobTitle: formData.jobTitle,
                jobDescription: formData.jobDescription,
                fileNames: formData.files.map(f => f.name)
              },
              fromRoles: false,
              warning: result.warning
            }
          });
        } else {
          // No results, go to roles page
          navigate('/roles');
        }
      } else {
        // No results, go to roles page
        navigate('/roles');
      }

      setFormData({
        files: [],
        jobTitle: '',
        jobDescription: '',
      });
      setUploadStatus('idle');
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 backdrop-blur-sm bg-opacity-95">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-md">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">AI Resume Screening</h1>
              <p className="text-gray-500">Find the perfect candidates with AI-powered analysis</p>
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-5 mb-8 border border-blue-200 flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium">
                Welcome, <span className="text-indigo-700 font-semibold">{user?.firstName || 'User'}</span>!
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Upload resumes and job details to get instant AI-powered match scores
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Section */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                <FileText className="h-5 w-5 text-indigo-500" />
                Resume Documents
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                  multiple
                  required
                />
                <label
                  htmlFor="resume-upload"
                  className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 ${
                    uploadStatus === 'success' 
                      ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                      : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-center">
                    {uploadStatus === 'success' ? (
                      <div className="bg-green-100 p-3 rounded-full inline-flex mb-3">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                      </div>
                    ) : (
                      <div className="bg-indigo-100 p-3 rounded-full inline-flex mb-3">
                        <Upload className="h-10 w-10 text-indigo-500" />
                      </div>
                    )}
                    
                    <p className="text-sm font-medium mb-2">
                      {formData.files.length === 0 ? (
                        <span className="text-indigo-700">Drag & drop resumes or click to browse</span>
                      ) : (
                        <span className="text-green-600">
                          {formData.files.length} resume{formData.files.length !== 1 ? 's' : ''} selected
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG
                    </p>
                  </div>
                </label>
              </div>

              {/* File List */}
              {formData.files.length > 0 && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto p-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">Uploaded Files</p>
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                      <div className="flex items-center gap-3 truncate">
                        <div className="bg-indigo-100 p-1.5 rounded">
                          <FileText className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Job Details Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="jobTitle" className="flex items-center gap-2 text-base font-medium text-gray-700">
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                  Job Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 bg-white shadow-sm"
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label htmlFor="jobDescription" className="flex items-center gap-2 text-base font-medium text-gray-700">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  Job Requirements
                </label>
                <textarea
                  id="jobDescription"
                  value={formData.jobDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, jobDescription: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 h-32 bg-white shadow-sm"
                  placeholder="Enter the key skills, qualifications, and responsibilities for this role..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-white font-medium text-lg transition-all duration-300 shadow-md ${
                  isLoading 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Analyzing Resumes...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate AI Analysis
                  </>
                )}
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {[
                { icon: <FileText className="h-5 w-5 text-indigo-500" />, title: "Resume Parsing", desc: "AI extracts key skills & experiences" },
                { icon: <Briefcase className="h-5 w-5 text-blue-500" />, title: "Job Matching", desc: "Ranks candidates by qualification fit" },
                { icon: <Sparkles className="h-5 w-5 text-purple-500" />, title: "Skill Analysis", desc: "Highlights strengths & gaps" },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gray-50 p-2 rounded-lg">{feature.icon}</div>
                    <h3 className="font-medium text-gray-800">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 ml-11">{feature.desc}</p>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Try;
// Import necessary modules
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { FileSpreadsheet, Upload } from 'lucide-react';

const FileUploadForm = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    files: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

  const validateFiles = (fileList) => {
    const invalidFiles = [];
    const files = Array.from(fileList);

    for (const file of files) {
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
      const hasAllowedExtension = ALLOWED_EXTENSIONS.includes(fileExtension);
      const hasAllowedType = ALLOWED_TYPES.includes(file.type);

      if (!hasAllowedExtension && !hasAllowedType) {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      setError(`Invalid file type(s): ${invalidFiles.join(', ')}. Only PDF, DOC, DOCX, JPG, PNG are allowed.`);
      return null;
    }

    setError('');
    return fileList;
  };

  const handleFileChange = (e) => {
    const validatedFiles = validateFiles(e.target.files);
    if (validatedFiles) {
      setFormData({
        ...formData,
        files: validatedFiles
      });
    } else {
      setFormData({
        ...formData,
        files: []
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Create a FormData object to send files and other data
    const submissionData = new FormData();
    submissionData.append('job_title', formData.jobTitle);
    submissionData.append('job_description', formData.jobDescription);
    Array.from(formData.files).forEach((file) => {
      submissionData.append('resumes', file);
    });

    try {
      // Get authentication token
      const token = await getToken();
      console.log('Token retrieved:', token ? 'Yes (length: ' + token.length + ')' : 'No');
      
      if (!token || token.trim() === '') {
        setError('Please sign in to continue. Authentication is required.');
        setIsLoading(false);
        return;
      }

      // Send data to the backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Making request to:', `${apiUrl}/process`);
      console.log('Token present:', !!token);
      
      const response = await fetch(`${apiUrl}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submissionData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to process resumes: ${response.statusText}. ${errorText || ''}`);
      }

      const result = await response.json();

      // Extract file names for display purposes only - don't pass File objects
      const fileNames = Array.from(formData.files).map(file => file.name);

      // Navigate to candidates page with the results
      // IMPORTANT: Don't include actual File objects in the state
      navigate('/candidates', { 
        state: { 
          candidates: result.results,
          formData: {
            jobTitle: formData.jobTitle,
            jobDescription: formData.jobDescription,
            fileNames: fileNames // Just passing names, not File objects
          },
          fromRoles: false
        } 
      });

      // Reset the form
      setFormData({
        jobTitle: '',
        jobDescription: '',
        files: []
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
          Job Title:
        </label>
        <div className="relative">
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Senior Software Engineer"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
          Job Description:
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          value={formData.jobDescription}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          placeholder="Enter the full job description here..."
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="files" className="block text-sm font-medium text-gray-700">
          Upload Resumes:
        </label>
        <input
          type="file"
          id="files"
          name="files"
          multiple
          onChange={handleFileChange}
          className="hidden" // Hide the default file input
          required
        />
        <label
          htmlFor="files"
          className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="text-center">
            {formData.files.length === 0 ? (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Click to upload or drag and drop</span>
                  <br />
                  <span className="text-xs text-gray-500">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG
                  </span>
                </p>
              </>
            ) : (
              <div className="text-blue-600 flex flex-col items-center justify-center gap-2">
                <Upload className="h-8 w-8" />
                {formData.files.length} file(s) selected
                <ul className="text-xs text-gray-500 mt-2">
                  {Array.from(formData.files).map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </label>
      </div>
      
      <button 
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium ${
          isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } transition-colors`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            Processing...
          </>
        ) : (
          <>
            <FileSpreadsheet className="h-5 w-5" />
            Generate Analysis
          </>
        )}
      </button>
    </form>
  );
};

export default FileUploadForm;
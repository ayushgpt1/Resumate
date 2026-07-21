import React from 'react';
import { Toaster } from 'sonner';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useAuth } from '@clerk/clerk-react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Try from './page/try'
import LandingPage from './page/LandingPage'
import Candidates from './page/Candidates'
import Roles from './page/Roles'
import CandidatesByRole from './page/CandidatesByRole'
import LinkedIn from './page/LinkedIn'
import Sidebar from './components/Sidebar'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function MainContent({ candidates, formData, resetForm }) {
  const { isSignedIn, isLoaded } = useUser();
  const location = useLocation();
  
  if (!isLoaded) {
    return null;
  }
  
  const isLandingPage = location.pathname === '/' && !isSignedIn;
  
  const mainClasses = isLandingPage 
    ? "flex-1"
    : "flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8";
    
  return (
    <main className={mainClasses}>
      <Routes>
        <Route path="/" element={
          isSignedIn ? <Navigate to="/roles" replace /> : <LandingPage />
        } />
        
        <Route path="/try" element={
          isSignedIn ? <Try /> : <Navigate to="/" replace />
        } />
        
        <Route path="/roles" element={
          isSignedIn ? <Roles /> : <Navigate to="/" replace />
        } />
        
        <Route path="/candidates/:roleName" element={
          isSignedIn ? <CandidatesByRole /> : <Navigate to="/" replace />
        } />
        
        <Route path="/candidates" element={
          isSignedIn 
            ? <Candidates 
                candidates={location.state?.candidates || candidates} 
                jobTitle={location.state?.formData?.jobTitle || formData?.jobTitle}
                resetForm={resetForm}
              /> 
            : <Navigate to="/" replace />
        } />
        
        <Route path="/linkedin" element={
          isSignedIn ? <LinkedIn /> : <Navigate to="/" replace />
        } />
        
        <Route path="*" element={
          isSignedIn ? <Navigate to="/roles" replace /> : <Navigate to="/" replace />
        } />
      </Routes>
    </main>
  );
}

function App() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [candidates, setCandidates] = useState(null);
  const [formData, setFormData] = useState({
    files: [],
    jobTitle: '',
    jobDescription: '',
  });
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const resetForm = () => {
    setCandidates(null);
    setFormData({
      files: [],
      jobTitle: '',
      jobDescription: '',
    });
  };

  if (!isLoaded) {
    return (
      <Router>
        <LoadingScreen />
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Toaster position="bottom-right" richColors />
        
        <SignedIn>
          <Sidebar 
            user={user} 
            isOpen={sidebarOpen} 
            toggleSidebar={toggleSidebar} 
          />
        </SignedIn>
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Resumate</h1>
              <div className="flex items-center">
                <SignedIn>
                  <UserButton afterSignOutUrl='/' />
                </SignedIn>
                <SignedOut>
                  <SignInButton 
                    mode="modal" 
                    afterSignInUrl="/try" 
                    afterSignUpUrl="/try"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                  >
                    Sign Up / Login
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </header>

          <MainContent 
            candidates={candidates} 
            formData={formData}
            resetForm={resetForm}
          />
        </div>
      </div>
    </Router>
  )
}

export default App
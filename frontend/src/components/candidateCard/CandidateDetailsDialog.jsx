import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Star, BookOpen, MessageSquare, FileText, Mail, Phone, X, RefreshCw, Download, Calendar, MapPin, Clock, Send } from 'lucide-react';

const Dialog = ({ open, onOpenChange, children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    const handleFocusTrap = (e) => {
      if (!dialogRef.current || !open) return;

      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && e.key === 'Tab' && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }

      if (!e.shiftKey && e.key === 'Tab' && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (open) {
      document.addEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px]">
      <motion.div
        className="absolute inset-0 bg-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenChange(false);
        }}
      />
      <div ref={dialogRef} className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ className, children, onClose }) => {
  return (
    <motion.div
      className={`relative bg-white rounded-lg shadow-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-20"
        aria-label="Close dialog"
      >
        <X className="h-5 w-5 text-gray-600" />
      </button>
      {children}
    </motion.div>
  );
};

const DialogTitle = ({ className, children }) => {
  return <h2 className={`text-2xl font-semibold ${className}`}>{children}</h2>;
};

const ScrollArea = ({ className, children }) => {
  return (
    <div className={`overflow-y-auto ${className}`} style={{ maxHeight: 'calc(70vh - 120px)' }}>
      {children}
    </div>
  );
};

const Button = ({ className, onClick, children }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const CandidateDetailsDialog = ({ candidate, isOpen, onClose }) => {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    venue: '',
    timeSlots: '',
    selectedSlot: '',
    loading: false,
    error: null
  });

  const handleSendEmailClick = (e) => {
    e.stopPropagation();
    onClose();
    setEmailModalOpen(true);
    setEmailData({
      venue: '',
      timeSlots: '',
      selectedSlot: '',
      loading: false,
      error: null
    });
  };

  const handleTimeSlotsChange = (e) => {
    const value = e.target.value;
    const slots = value.split(',').map(slot => slot.trim()).filter(slot => slot);
    const firstSlot = slots[0] || '';

    setEmailData(prev => ({
      ...prev,
      timeSlots: value,
      selectedSlot: firstSlot,
      error: null
    }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    const trimmedVenue = emailData.venue.trim();
    const trimmedTimeSlots = emailData.timeSlots.trim();
    const trimmedSelectedSlot = emailData.selectedSlot.trim();

    if (!trimmedVenue || !trimmedTimeSlots || !trimmedSelectedSlot) {
      setEmailData(prev => ({ ...prev, error: "Please fill all fields" }));
      return;
    }

    try {
      setEmailData(prev => ({ ...prev, loading: true, error: null }));

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/send-interview-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateEmail: candidate.email,
          candidateName: candidate.name,
          venue: trimmedVenue,
          timeSlot: trimmedSelectedSlot
        }),
      });

      let result = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
        }
      } else {
        const text = await response.text();
        result = { error: text || 'Failed to send email' };
      }

      if (!response.ok) {
        const errorMessage = result.error || result.message || 'Failed to send email';
        throw new Error(errorMessage);
      }

      setEmailModalOpen(false);
      setSuccessModalOpen(true);
      setTimeout(() => setSuccessModalOpen(false), 3000);
    } catch (error) {
      setEmailData(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  if (!candidate) return null;

  return (
    <AnimatePresence>
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent
          className="max-w-md"
          onClose={() => setEmailModalOpen(false)}
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <DialogTitle className="text-white">Schedule Interview</DialogTitle>
              </div>
            </div>
            <div className="mt-2 text-blue-100 text-sm">
              Scheduling interview for <span className="font-semibold text-white">{candidate.name}</span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="p-5">
            {emailData.error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 flex items-start">
                <X className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{emailData.error}</span>
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                Interview Venue
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={emailData.venue}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      venue: e.target.value,
                      error: null,
                    }))
                  }
                  required
                  placeholder="e.g. TechCorp HQ, Building A"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Provide the full address for the interview location</p>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                Available Time Slots
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={emailData.timeSlots}
                  onChange={handleTimeSlotsChange}
                  placeholder="e.g. 10:00 AM, 2:00 PM, 4:30 PM"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Separate multiple time slots with commas</p>
            </div>

            {emailData.timeSlots && emailData.venue && (
              <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-1.5">Email Preview</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
                      <User className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-gray-600">
                      To: <span className="font-medium text-gray-800">{candidate.name}</span>
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
                      <MapPin className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-gray-600">
                      Venue: <span className="font-medium text-gray-800">{emailData.venue}</span>
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-1 rounded mr-2 mt-0.5">
                      <Clock className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-gray-600">
                      Time: <span className="font-medium text-gray-800">{emailData.timeSlots.split(',')[0]}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={emailData.loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md flex items-center"
                disabled={emailData.loading}
              >
                {emailData.loading ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="max-w-sm" onClose={() => setSuccessModalOpen(false)}>
          <div className="p-8 text-center">
            <div className="bg-green-100 p-4 rounded-full mx-auto mb-4 w-fit">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Sent Successfully</h3>
            <p className="text-gray-600 text-sm mb-4">Interview invitation has been sent to <strong>{candidate?.name}</strong>.</p>
            <Button onClick={() => setSuccessModalOpen(false)} className="bg-green-600 hover:bg-green-700">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isOpen && !emailModalOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="w-[95vw] max-w-6xl h-[70vh] max-h-[70vh] p-0" onClose={onClose}>
            <div className="h-full">
              <div className="flex flex-col h-full relative">
                {candidate.email && (
                  <button
                    onClick={handleSendEmailClick}
                    className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg transition-colors flex items-center justify-center z-20"
                    title="Send Email to Candidate"
                    style={{
                      width: '40px',
                      height: '40px',
                    }}
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                )}

                <div className="p-4 sticky top-0 bg-white z-10 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2.5 rounded-full mr-3">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold">{candidate.name}</DialogTitle>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-600">
                          {candidate.email && (
                            <div className="flex items-center">
                              <Mail className="h-3.5 w-3.5 mr-1.5" />
                              <span>{candidate.email}</span>
                            </div>
                          )}
                          {candidate.phone_number && (
                            <div className="flex items-center">
                              <Phone className="h-3.5 w-3.5 mr-1.5" />
                              <span>{candidate.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-600 rounded-full flex items-center justify-center w-10 h-10">
                      <span className="text-white font-medium text-sm">{candidate.ranking_score}</span>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <h3>Experience</h3>
                      </div>
                      <p className="text-gray-600 text-sm pl-6">{(() => {
                        const exp = candidate.experience;
                        if (!exp) return 'No experience information available';
                        if (Array.isArray(exp)) return exp.join(' ').trim();
                        if (typeof exp === 'string' && exp.startsWith('[') && exp.endsWith(']')) {
                          try {
                            const parsed = JSON.parse(exp.replace(/'/g, '"'));
                            if (Array.isArray(parsed)) return parsed.join(' ').trim();
                          } catch (e) {
                            return exp.slice(1, -1).trim();
                          }
                        }
                        return exp;
                      })()}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <h3>Skills</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-6">
                        {candidate.skills && candidate.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {(!candidate.skills || candidate.skills.length === 0) && (
                          <span className="text-gray-500 text-sm">No skills listed</span>
                        )}
                      </div>
                    </div>

                    {candidate.cultural_fit && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <h3>Cultural Fit</h3>
                        </div>
                        <p className="text-gray-600 text-sm pl-6">{candidate.cultural_fit}</p>
                      </div>
                    )}

                    {candidate.communication && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                          <h3>Communication</h3>
                        </div>
                        <p className="text-gray-600 text-sm pl-6">{candidate.communication}</p>
                      </div>
                    )}

                    {candidate.explanation && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                          <FileText className="h-4 w-4 text-purple-500" />
                          <h3>Evaluation</h3>
                        </div>
                        <p className="text-gray-600 text-sm pl-6">{candidate.explanation}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default CandidateDetailsDialog;
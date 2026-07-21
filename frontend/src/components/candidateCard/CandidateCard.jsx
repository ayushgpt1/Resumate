import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Star, FileText, Mail, Phone, ExternalLink, Trash2 } from 'lucide-react';
import CandidateDetailsDialog from './CandidateDetailsDialog';

const CandidateCard = ({ candidate, index, onDelete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleCardClick = () => {
    // Clicking anywhere on the card opens the full-profile dialog
    // so the user can inspect the resume and the AI evaluation.
    setIsDialogOpen(true);
  };

  const formatExperience = (exp) => {
    if (!exp) return 'No experience information available';
    
    // If it's an array, join with spaces
    if (Array.isArray(exp)) {
      return exp.join(' ').trim();
    }
    
    // If it's a string that starts with [ and ends with ], strip the brackets
    if (typeof exp === 'string' && exp.startsWith('[') && exp.endsWith(']')) {
      try {
        const parsed = JSON.parse(exp.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
          return parsed.join(' ').trim();
        }
      } catch (e) {
        // Fallback: just strip the brackets
        return exp.slice(1, -1).trim();
      }
    }
    
    return exp;
  };

  const formattedExperience = formatExperience(candidate.experience);
  const truncatedExperience = formattedExperience.length > 200 
    ? `${formattedExperience.substring(0, 200)}...` 
    : formattedExperience;

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={handleCardClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="p-6 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete && !isDeleting) {
                setIsDeleting(true);
                onDelete(candidate.id);
              }
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all z-10"
            title="Delete candidate"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium ml-3 text-gray-800">
                  {candidate.name}
                </h3>
                <div className="flex space-x-4 ml-3 mt-1">
                  {candidate.email && (
                    <div className="flex items-center text-gray-500 text-xs">
                      <Mail className="h-3 w-3 mr-1" />
                      <span>Email</span>
                    </div>
                  )}
                  {candidate.phone_number && (
                    <div className="flex items-center text-gray-500 text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      <span>Phone</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={`rounded-full flex items-center justify-center w-10 h-10 ${
              candidate.ranking_score > 80 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                : 'bg-blue-600'
            }`}>
              <span className="text-white font-medium text-sm">{candidate.ranking_score}</span>
            </div>
          </div>
          
          <div className="mb-4 flex items-start text-gray-600">
            <Briefcase className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
            <p className="text-sm text-balance">{truncatedExperience}</p>
          </div>
          
          <div className="flex items-start mb-5">
            <Star className="h-4 w-4 mr-2 mt-1 text-amber-500 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {candidate.skills && candidate.skills.slice(0, 6).map((skill, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills && candidate.skills.length > 6 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                  +{candidate.skills.length - 6} more
                </span>
              )}
            </div>
          </div>
          
          {candidate.file && (
            <div className="flex items-center mb-4 text-gray-500">
              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{candidate.file}</span>
            </div>
          )}
          
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-2">Evaluation:</div>
            <p className="text-sm text-gray-700 mb-4">{candidate.explanation}</p>
            <button
              className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                setIsDialogOpen(true);
              }}
            >
              View Full Profile
              <ExternalLink className="ml-1 h-3 w-3" />
              <span className="sr-only">Opens in modal</span>
            </button>
          </div>
        </div>
      </motion.div>

      <CandidateDetailsDialog 
        candidate={candidate} 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
};

export default CandidateCard;

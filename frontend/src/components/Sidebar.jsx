import React from 'react';
import { Home, Menu, FileSpreadsheet, Briefcase, UserSearch } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const routes = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/try'
  },
  {
    id: 'roles',
    label: 'Job Roles',
    icon: Briefcase,
    path: '/roles'
  },
  {
    id: 'candidates',
    label: 'Candidates',
    icon: FileSpreadsheet,
    path: '/candidates'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Search',
    icon: UserSearch,
    path: '/linkedin'
  }
];

const Sidebar = ({ user, isOpen, toggleSidebar }) => {
  return (
    <div
      className={`min-h-screen bg-white shadow-lg transition-all duration-300 ease-in-out 
      ${isOpen ? 'w-72' : 'w-20'} relative`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        {isOpen && (
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Resumate
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu size={22} className="text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-2 p-4">
        {routes.map((route) => (
          <NavLink
            key={route.id}
            to={route.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'}
              ${!isOpen && 'justify-center'}
            `}
          >
            {({ isActive }) => (
              <>
                <route.icon
                  size={22}
                  className={isActive ? 'text-indigo-600' : 'text-gray-500'}
                />
                {isOpen && (
                  <span className={`font-medium ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' : 'text-gray-700'}`}>
                    {route.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

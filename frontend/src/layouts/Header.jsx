import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-emerald-50 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-10">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 mr-3 text-emerald-600 hover:bg-emerald-50 rounded-xl lg:hidden transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-xl font-bold text-emerald-950 tracking-tight hidden sm:block">Wargatify</h2>
      </div>

      <div className="flex items-center space-x-5">
        <button className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-emerald-100 hidden sm:block"></div>
        
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-full flex items-center justify-center font-bold shadow-sm shadow-emerald-200">
            <User size={18} />
          </div>
          <div className="hidden md:block text-sm">
            <p className="text-emerald-900 font-semibold group-hover:text-emerald-600 transition-colors">
              {user?.nama_lengkap || 'Guest'}
            </p>
            <p className="text-emerald-500 text-xs font-medium">
              {user?.nama_role || 'Visitor'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-emerald-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl ml-1 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

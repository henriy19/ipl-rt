import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, ReceiptText, FileBarChart, X, Shield, Megaphone, Map, Contact } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Data Warga', path: '/warga', icon: <Users size={20} /> },
    { name: 'Informasi Kegiatan', path: '/informasi', icon: <Megaphone size={20} /> },
    { name: 'Transaksi', path: '/transaksi', icon: <ReceiptText size={20} /> },
    { name: 'Laporan', path: '/laporan', icon: <FileBarChart size={20} /> },
  ];

  const masterItems = [
    { name: 'Master Role', path: '/role', icon: <Shield size={20} /> },
    { name: 'Master Iuran', path: '/iuran', icon: <CreditCard size={20} /> },
    { name: 'Master RT-RW', path: '/rt-rw', icon: <Map size={20} /> },
    { name: 'Master Struktur', path: '/struktur', icon: <Contact size={20} /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-emerald-50 w-64 z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 flex flex-col justify-between`}>
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between h-16 px-6 mb-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Wargatify Logo" className="w-8 h-8 rounded-lg shadow-sm" />
              <span className="text-xl font-bold tracking-tight text-emerald-950">Wargatify</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-emerald-700 bg-emerald-50 rounded-lg p-1">
              <X size={20} />
            </button>
          </div>
          
          <nav className="px-4 space-y-1 pb-4">
            <p className="px-4 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Menu Utama</p>
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                      : 'text-gray-500 hover:bg-emerald-50/50 hover:text-emerald-800'
                  }`
                }
              >
                {React.cloneElement(item.icon, { className: 'stroke-[2px]' })}
                <span className="text-[15px]">{item.name}</span>
              </NavLink>
            ))}

            <p className="px-4 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-8">Data Master</p>
            {masterItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                      : 'text-gray-500 hover:bg-emerald-50/50 hover:text-emerald-800'
                  }`
                }
              >
                {React.cloneElement(item.icon, { className: 'stroke-[2px]' })}
                <span className="text-[15px]">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer / Version Info */}
        <div className="p-4 border-t border-emerald-50/50 bg-emerald-50/10 text-center space-y-0.5">
          <p className="text-[10px] font-semibold text-emerald-500/80 tracking-wider uppercase">
            Wargatify Version 1.0.0
          </p>
          <p className="text-[9px] font-medium text-emerald-400/60 uppercase tracking-widest">
            Powered by ASBAK
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './features/dashboard/Dashboard';
import Warga from './features/warga/Warga';
import Iuran from './features/iuran/Iuran';
import Transaksi from './features/transaksi/Transaksi';
import Laporan from './features/laporan/Laporan';
import Role from './features/master/Role';
import Informasi from './features/informasi/Informasi';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="warga" element={<Warga />} />
            <Route path="iuran" element={<Iuran />} />
            <Route path="transaksi" element={<Transaksi />} />
            <Route path="laporan" element={<Laporan />} />
            <Route path="role" element={<Role />} />
            <Route path="informasi" element={<Informasi />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

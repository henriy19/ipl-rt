import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
    Contact, 
    Search, 
    Plus, 
    Edit2, 
    Trash2, 
    AlertCircle, 
    Loader2,
    Eye,
    X,
    Save,
    AlertTriangle,
    Info,
    CheckCircle,
    UserCheck,
    Briefcase,
    Shield,
    MapPin
} from 'lucide-react';

const StrukturOrganisasi = () => {
    const { user } = useAuth();
    const isAuthorized = user && ['Admin', 'Petugas', 'Bendahara'].includes(user.nama_role);

    // List States
    const [strukturList, setStrukturList] = useState([]);
    const [wargaList, setWargaList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [rtList, setRtList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selected Pengurus and Form States
    const [selectedPengurus, setSelectedPengurus] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        user_id: '',
        role_id: '',
        rt_id: '',
        is_active: 1
    });

    // Custom Dropdown States for Pilih Warga
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [wargaSearchTerm, setWargaSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const [strukturRes, wargaRes, roleRes, rtRes] = await Promise.all([
                api.get('/struktur'),
                api.get('/users'),
                api.get('/roles'),
                api.get('/rt?all=true')
            ]);

            if (strukturRes.data && strukturRes.data.status === 'success') {
                setStrukturList(strukturRes.data.data);
            }
            if (wargaRes.data && wargaRes.data.status === 'success') {
                setWargaList(wargaRes.data.data);
            }
            if (roleRes.data && roleRes.data.status === 'success') {
                setRoleList(roleRes.data.data);
            }
            if (rtRes.data && rtRes.data.status === 'success') {
                setRtList(rtRes.data.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Gagal memuat data struktur organisasi');
        } finally {
            setLoading(false);
        }
    };

    // Filter struktur berdasarkan pencarian
    const filteredStruktur = strukturList.filter((s) => {
        const query = searchTerm.toLowerCase();
        return (
            s.nama_lengkap.toLowerCase().includes(query) ||
            s.no_hp.toLowerCase().includes(query) ||
            s.jabatan.toLowerCase().includes(query) ||
            (s.nomor_rt && s.nomor_rt.includes(query))
        );
    });

    // Warga yang belum didaftarkan dalam pengurus
    const availableWarga = wargaList.filter(
        warga => warga.is_active && !strukturList.some(s => s.user_id === warga.id)
    );

    // Filter available warga berdasarkan search inside dropdown
    const filteredAvailableWarga = availableWarga.filter(w => {
        const q = wargaSearchTerm.toLowerCase();
        return (
            w.nama_lengkap.toLowerCase().includes(q) || 
            (w.blok_rumah && w.blok_rumah.toLowerCase().includes(q)) ||
            (w.no_hp && w.no_hp.includes(q))
        );
    });

    // Handler untuk memilih warga dari dropdown kustom
    const handleSelectWarga = (wargaId) => {
        setFormData(prev => ({ ...prev, user_id: wargaId }));
        setIsDropdownOpen(false);
        setWargaSearchTerm('');
    };

    // Form Change Handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'is_active' ? parseInt(value, 10) : value
        }));
    };

    // Open Modal Handlers
    const openAddModal = () => {
        const firstWargaId = availableWarga.length > 0 ? availableWarga[0].id : '';
        const firstRoleId = roleList.length > 0 ? roleList[0].id : '';
        const firstRtId = rtList.length > 0 ? rtList[0].id : '';

        setFormData({
            user_id: firstWargaId,
            role_id: firstRoleId,
            rt_id: firstRtId,
            is_active: 1
        });
        setFormError('');
        setIsDropdownOpen(false);
        setWargaSearchTerm('');
        setIsAddOpen(true);
    };

    const openEditModal = (s) => {
        setSelectedPengurus(s);
        setFormData({
            user_id: s.user_id,
            role_id: s.role_id,
            rt_id: s.rt_id || '',
            is_active: s.is_active ? 1 : 0
        });
        setFormError('');
        setIsEditOpen(true);
    };

    const openViewModal = (s) => {
        setSelectedPengurus(s);
        setIsViewOpen(true);
    };

    const openDeleteModal = (s) => {
        setSelectedPengurus(s);
        setIsDeleteOpen(true);
    };

    // Action Submit Handlers
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.user_id || !formData.role_id) {
            setFormError('Warga dan Jabatan (Role) wajib dipilih');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            const res = await api.post('/struktur', {
                user_id: formData.user_id,
                role_id: formData.role_id,
                rt_id: formData.rt_id || null,
                is_active: formData.is_active === 1
            });
            if (res.data && res.data.status === 'success') {
                setIsAddOpen(false);
                fetchData();
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Gagal menambahkan pengurus');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!formData.role_id) {
            setFormError('Jabatan (Role) wajib dipilih');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            const res = await api.put(`/struktur/${selectedPengurus.id}`, {
                role_id: formData.role_id,
                rt_id: formData.rt_id || null,
                is_active: formData.is_active === 1
            });
            if (res.data && res.data.status === 'success') {
                setIsEditOpen(false);
                fetchData();
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Gagal memperbarui data pengurus');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            setSubmitLoading(true);
            const res = await api.delete(`/struktur/${selectedPengurus.id}`);
            if (res.data && res.data.status === 'success') {
                setIsDeleteOpen(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Gagal menghapus pengurus');
        } finally {
            setSubmitLoading(false);
        }
    };

    const selectedWargaObj = availableWarga.find(w => w.id === formData.user_id);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-950 tracking-tight flex items-center gap-2">
                        <Contact className="text-emerald-600" />
                        Struktur Organisasi
                    </h1>
                    <p className="text-sm text-emerald-600/80 mt-1">
                        Kelola data warga yang ditunjuk dalam struktur kepengurusan pelayanan wilayah RT-RW.
                    </p>
                </div>
                {isAuthorized && (
                    <button 
                        onClick={openAddModal}
                        disabled={availableWarga.length === 0}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>Tambah Pengurus</span>
                    </button>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Contact size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Pengurus</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">{strukturList.length} Orang</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Pengurus Aktif</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">
                            {strukturList.filter(s => s.is_active).length} Orang
                        </p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Warga Belum Masuk Struktur</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">
                            {availableWarga.length} Warga
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Actions Bar */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 placeholder-emerald-300 text-emerald-900 transition-colors"
                        placeholder="Cari nama, jabatan, atau RT..."
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button 
                        onClick={fetchData}
                        className="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-emerald-50 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-emerald-600">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p className="text-sm font-medium">Memuat data pengurus...</p>
                    </div>
                ) : error ? (
                    <div className="py-16 flex flex-col items-center justify-center text-red-500 px-4 text-center">
                        <AlertCircle className="mb-2" size={36} />
                        <p className="font-semibold">{error}</p>
                        <button 
                            onClick={fetchData}
                            className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : filteredStruktur.length === 0 ? (
                    <div className="py-16 text-center text-emerald-600/60">
                        <AlertCircle className="mx-auto mb-2" size={32} />
                        <p className="font-medium">Data pengurus tidak ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-emerald-50">
                            <thead className="bg-emerald-50/30">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nama Pengurus</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">No. HP</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">RT Penugasan</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Jabatan (Role)</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-4">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-emerald-50/50">
                                {filteredStruktur.map((s) => (
                                    <tr key={s.id} className="hover:bg-emerald-50/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                                                    {s.nama_lengkap.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-semibold text-emerald-950">{s.nama_lengkap}</div>
                                                    <div className="text-xs text-emerald-600/70">Blok {s.blok_rumah || '-'}/{s.nomor_rumah || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-medium">
                                            {s.no_hp}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-medium">
                                            {s.nomor_rt ? `RT ${s.nomor_rt} / RW ${s.nomor_rw}` : 'Seluruh Wilayah'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-950 font-bold">
                                            {s.jabatan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                s.is_active 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                    : 'bg-red-50 text-red-600 border border-red-200'
                                            }`}>
                                                {s.is_active ? 'Aktif' : 'Non-aktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openViewModal(s)}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                                    title="View Detail"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {isAuthorized && (
                                                    <>
                                                        <button 
                                                            onClick={() => openEditModal(s)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit Pengurus"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => openDeleteModal(s)}
                                                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Hapus Pengurus"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL: TAMBAH PENGURUS */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-md w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Plus className="text-emerald-600" size={20} />
                                Tambah Pengurus Baru
                            </h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Form */}
                        <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {/* Pilih Warga Custom Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Pilih Warga *</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full flex items-center justify-between px-3 py-2 border border-emerald-100 rounded-xl text-sm text-emerald-950 bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left"
                                    >
                                        {selectedWargaObj ? (
                                            <span className="block truncate font-medium">
                                                {selectedWargaObj.nama_lengkap} <span className="text-[10px] text-emerald-600/70 font-semibold">(Blok {selectedWargaObj.blok_rumah || '-'}/{selectedWargaObj.nomor_rumah || '-'}, HP: {selectedWargaObj.no_hp})</span>
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Pilih Warga...</span>
                                        )}
                                        <span className="ml-2 flex items-center pointer-events-none text-emerald-500">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </button>

                                    {isDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => { setIsDropdownOpen(false); setWargaSearchTerm(''); }}></div>
                                            <div className="absolute z-20 mt-1.5 w-full bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in">
                                                <div className="p-2 border-b border-emerald-50 bg-emerald-50/20">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={wargaSearchTerm}
                                                            onChange={(e) => setWargaSearchTerm(e.target.value)}
                                                            placeholder="Cari nama, blok atau HP..."
                                                            className="w-full px-3 py-1.5 pl-8 text-xs border border-emerald-100 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 placeholder-emerald-300"
                                                        />
                                                        <Search className="absolute left-2.5 top-2.5 text-emerald-400" size={12} />
                                                    </div>
                                                </div>

                                                <div className="overflow-y-auto max-h-48 divide-y divide-emerald-50/30">
                                                    {filteredAvailableWarga.length === 0 ? (
                                                        <div className="p-4 text-xs text-center text-emerald-600/60 font-medium">
                                                            Tidak ada warga yang cocok
                                                        </div>
                                                    ) : (
                                                        filteredAvailableWarga.map((w) => {
                                                            const isSelected = w.id === formData.user_id;
                                                            return (
                                                                <div
                                                                    key={w.id}
                                                                    onClick={() => handleSelectWarga(w.id)}
                                                                    className={`px-4 py-2.5 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                                        isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                                    }`}
                                                                >
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-semibold text-emerald-950 truncate">{w.nama_lengkap}</div>
                                                                        <div className="text-[10px] text-emerald-600/60 mt-0.5">
                                                                            Blok {w.blok_rumah || '-'}/{w.nomor_rumah || '-'} • HP: {w.no_hp}
                                                                        </div>
                                                                    </div>
                                                                    {isSelected && <CheckCircle size={14} className="text-emerald-600 ml-2 flex-shrink-0" />}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Pilih Jabatan (Role DDL) */}
                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Jabatan (Role) *</label>
                                <div className="relative">
                                    <select
                                        name="role_id"
                                        value={formData.role_id}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 bg-white"
                                        required
                                    >
                                        {roleList.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.nama_role}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Pilih RT Penugasan */}
                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">RT Penugasan</label>
                                <div className="relative">
                                    <select
                                        name="rt_id"
                                        value={formData.rt_id}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 bg-white"
                                    >
                                        <option value="">-- Seluruh Wilayah (Lokal/RW) --</option>
                                        {rtList.map((rt) => (
                                            <option key={rt.id} value={rt.id}>
                                                RT {rt.nomor_rt} / RW {rt.nomor_rw}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Status Keaktifan */}
                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Status Keaktifan</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="inline-flex items-center text-sm text-emerald-950">
                                        <input
                                            type="radio"
                                            name="is_active"
                                            value="1"
                                            checked={formData.is_active === 1}
                                            onChange={handleInputChange}
                                            className="text-emerald-600 focus:ring-emerald-500 mr-2"
                                        />
                                        Aktif
                                    </label>
                                    <label className="inline-flex items-center text-sm text-emerald-950">
                                        <input
                                            type="radio"
                                            name="is_active"
                                            value="0"
                                            checked={formData.is_active === 0}
                                            onChange={handleInputChange}
                                            className="text-emerald-600 focus:ring-emerald-500 mr-2"
                                        />
                                        Non-aktif
                                    </label>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-4 border-t border-emerald-50 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading || availableWarga.length === 0}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-sm"
                                >
                                    {submitLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>Simpan Pengurus</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT PENGURUS */}
            {isEditOpen && selectedPengurus && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-md w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Edit2 className="text-emerald-600" size={20} />
                                Edit Data Pengurus
                            </h3>
                            <button onClick={() => setIsEditOpen(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Form */}
                        <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nama Warga (Read-only)</label>
                                <input
                                    type="text"
                                    value={`${selectedPengurus.nama_lengkap} (HP: ${selectedPengurus.no_hp})`}
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm bg-gray-50 text-gray-500 font-medium"
                                    disabled
                                />
                            </div>

                            {/* Pilih Jabatan (Role DDL) */}
                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Jabatan (Role) *</label>
                                <div className="relative">
                                    <select
                                        name="role_id"
                                        value={formData.role_id}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 bg-white"
                                        required
                                    >
                                        {roleList.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.nama_role}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Pilih RT Penugasan */}
                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">RT Penugasan</label>
                                <div className="relative">
                                    <select
                                        name="rt_id"
                                        value={formData.rt_id}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 bg-white"
                                    >
                                        <option value="">-- Seluruh Wilayah (Lokal/RW) --</option>
                                        {rtList.map((rt) => (
                                            <option key={rt.id} value={rt.id}>
                                                RT {rt.nomor_rt} / RW {rt.nomor_rw}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Status Keaktifan */}
                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Status Keaktifan</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="inline-flex items-center text-sm text-emerald-950">
                                        <input
                                            type="radio"
                                            name="is_active"
                                            value="1"
                                            checked={formData.is_active === 1}
                                            onChange={handleInputChange}
                                            className="text-emerald-600 focus:ring-emerald-500 mr-2"
                                        />
                                        Aktif
                                    </label>
                                    <label className="inline-flex items-center text-sm text-emerald-950">
                                        <input
                                            type="radio"
                                            name="is_active"
                                            value="0"
                                            checked={formData.is_active === 0}
                                            onChange={handleInputChange}
                                            className="text-emerald-600 focus:ring-emerald-500 mr-2"
                                        />
                                        Non-aktif
                                    </label>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-4 border-t border-emerald-50 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-sm"
                                >
                                    {submitLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>Simpan Perubahan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: VIEW DETAILS */}
            {isViewOpen && selectedPengurus && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Info className="text-emerald-600" size={20} />
                                Detail Profil Pengurus
                            </h3>
                            <button onClick={() => setIsViewOpen(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Avatar & Basic Info */}
                            <div className="flex items-center gap-4 border-b border-emerald-50 pb-4">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 text-2xl font-bold flex items-center justify-center shadow-inner">
                                    <Contact size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-emerald-950 leading-tight">{selectedPengurus.nama_lengkap}</h4>
                                    <p className="text-sm text-emerald-600 mt-1">{selectedPengurus.jabatan}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">No. HP</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">{selectedPengurus.no_hp}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Alamat Rumah</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        Blok {selectedPengurus.blok_rumah || '-'}/{selectedPengurus.nomor_rumah || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">RT Penugasan</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {selectedPengurus.nomor_rt ? `RT ${selectedPengurus.nomor_rt} / RW ${selectedPengurus.nomor_rw}` : 'Seluruh Wilayah'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Status Keaktifan</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {selectedPengurus.is_active ? 'Aktif Kepengurusan' : 'Non-aktif'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">ID Pengurus</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5 font-mono text-[10px] break-all">{selectedPengurus.id}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-emerald-50 flex justify-end">
                                <button
                                    onClick={() => setIsViewOpen(false)}
                                    className="px-5 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                                >
                                    Tutup Detail
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: HAPUS CONFIRMATION */}
            {isDeleteOpen && selectedPengurus && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-emerald-950">Konfirmasi Hapus Pengurus</h4>
                                <p className="text-sm text-emerald-600/70 mt-2">
                                    Apakah Anda yakin ingin memberhentikan <strong>{selectedPengurus.nama_lengkap}</strong> dari struktur organisasi? Tindakan ini hanya menghapus status kepengurusan tanpa menghapus data warga asli.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setIsDeleteOpen(false)}
                                    className="flex-1 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeleteSubmit}
                                    disabled={submitLoading}
                                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                                >
                                    {submitLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <span>Ya, Hapus</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StrukturOrganisasi;

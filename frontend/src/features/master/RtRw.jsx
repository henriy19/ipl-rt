import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
    Map, 
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
    Home,
    MapPin
} from 'lucide-react';

const RtRw = () => {
    const { user } = useAuth();
    const isAuthorized = user && ['Admin', 'Petugas', 'Bendahara'].includes(user.nama_role);

    // Active Tab State: 'rt' or 'rw'
    const [activeTab, setActiveTab] = useState('rt');

    // Data List States
    const [rtList, setRtList] = useState([]);
    const [rwList, setRwList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selected Item and Form States
    const [selectedItem, setSelectedItem] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        // Fields for RT
        nomor_rt: '',
        ketua_rt: '',
        rw_id: '',
        
        // Fields for RW
        nomor_rw: '',
        ketua_rw: '',
        
        // Shared
        is_active: 1
    });

    // Custom Dropdown States for RW selection in RT form
    const [isRwDropdownOpen, setIsRwDropdownOpen] = useState(false);
    const [rwSearchTerm, setRwSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Fetch RT with all=true to show inactive ones in management
            const rtRes = await api.get('/rt?all=true');
            // Fetch RW
            const rwRes = await api.get('/rw');

            if (rtRes.data && rtRes.data.status === 'success') {
                setRtList(rtRes.data.data);
            }
            if (rwRes.data && rwRes.data.status === 'success') {
                setRwList(rwRes.data.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Gagal memuat data wilayah');
        } finally {
            setLoading(false);
        }
    };

    // Filtered data based on search term and active tab
    const filteredRt = rtList.filter(rt => {
        const query = searchTerm.toLowerCase();
        return (
            rt.nomor_rt.toLowerCase().includes(query) ||
            (rt.ketua_rt && rt.ketua_rt.toLowerCase().includes(query)) ||
            rt.nomor_rw.toLowerCase().includes(query)
        );
    });

    const filteredRw = rwList.filter(rw => {
        const query = searchTerm.toLowerCase();
        return (
            rw.nomor_rw.toLowerCase().includes(query) ||
            (rw.ketua_rw && rw.ketua_rw.toLowerCase().includes(query))
        );
    });

    // Form inputs change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'is_active' ? parseInt(value, 10) : value
        }));
    };

    const filteredRws = rwList.filter(rw => {
        const q = rwSearchTerm.toLowerCase();
        return rw.nomor_rw.includes(q) || (rw.ketua_rw && rw.ketua_rw.toLowerCase().includes(q));
    });

    const handleSelectRw = (rwId) => {
        setFormData(prev => ({ ...prev, rw_id: rwId }));
        setIsRwDropdownOpen(false);
        setRwSearchTerm('');
    };

    // Open Modal Handlers
    const openAddModal = () => {
        setFormError('');
        if (activeTab === 'rt') {
            setFormData({
                nomor_rt: '',
                ketua_rt: '',
                rw_id: rwList.length > 0 ? rwList[0].id : '',
                is_active: 1
            });
        } else {
            setFormData({
                nomor_rw: '',
                ketua_rw: '',
                is_active: 1
            });
        }
        setIsRwDropdownOpen(false);
        setRwSearchTerm('');
        setIsAddOpen(true);
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setFormError('');
        if (activeTab === 'rt') {
            setFormData({
                nomor_rt: item.nomor_rt,
                ketua_rt: item.ketua_rt || '',
                rw_id: item.rw_id,
                is_active: item.is_active ? 1 : 0
            });
        } else {
            setFormData({
                nomor_rw: item.nomor_rw,
                ketua_rw: item.ketua_rw || '',
                is_active: item.is_active ? 1 : 0
            });
        }
        setIsRwDropdownOpen(false);
        setRwSearchTerm('');
        setIsEditOpen(true);
    };

    const openViewModal = (item) => {
        setSelectedItem(item);
        setIsViewOpen(true);
    };

    const openDeleteModal = (item) => {
        setSelectedItem(item);
        setIsDeleteOpen(true);
    };

    // CRUD Submit Handlers
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (activeTab === 'rt') {
            if (!formData.nomor_rt || !formData.rw_id) {
                setFormError('Nomor RT dan RW penaung wajib diisi');
                return;
            }
            try {
                setSubmitLoading(true);
                const res = await api.post('/rt', {
                    nomor_rt: formData.nomor_rt,
                    ketua_rt: formData.ketua_rt,
                    rw_id: formData.rw_id,
                    is_active: formData.is_active === 1
                });
                if (res.data && res.data.status === 'success') {
                    setIsAddOpen(false);
                    fetchData();
                }
            } catch (err) {
                setFormError(err.response?.data?.message || 'Gagal menambahkan RT baru');
            } finally {
                setSubmitLoading(false);
            }
        } else {
            if (!formData.nomor_rw) {
                setFormError('Nomor RW wajib diisi');
                return;
            }
            try {
                setSubmitLoading(true);
                const res = await api.post('/rw', {
                    nomor_rw: formData.nomor_rw,
                    ketua_rw: formData.ketua_rw,
                    is_active: formData.is_active === 1
                });
                if (res.data && res.data.status === 'success') {
                    setIsAddOpen(false);
                    fetchData();
                }
            } catch (err) {
                setFormError(err.response?.data?.message || 'Gagal menambahkan RW baru');
            } finally {
                setSubmitLoading(false);
            }
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (activeTab === 'rt') {
            if (!formData.nomor_rt || !formData.rw_id) {
                setFormError('Nomor RT dan RW penaung wajib diisi');
                return;
            }
            try {
                setSubmitLoading(true);
                const res = await api.put(`/rt/${selectedItem.id}`, {
                    nomor_rt: formData.nomor_rt,
                    ketua_rt: formData.ketua_rt,
                    rw_id: formData.rw_id,
                    is_active: formData.is_active === 1
                });
                if (res.data && res.data.status === 'success') {
                    setIsEditOpen(false);
                    fetchData();
                }
            } catch (err) {
                setFormError(err.response?.data?.message || 'Gagal memperbarui RT');
            } finally {
                setSubmitLoading(false);
            }
        } else {
            if (!formData.nomor_rw) {
                setFormError('Nomor RW wajib diisi');
                return;
            }
            try {
                setSubmitLoading(true);
                const res = await api.put(`/rw/${selectedItem.id}`, {
                    nomor_rw: formData.nomor_rw,
                    ketua_rw: formData.ketua_rw,
                    is_active: formData.is_active === 1
                });
                if (res.data && res.data.status === 'success') {
                    setIsEditOpen(false);
                    fetchData();
                }
            } catch (err) {
                setFormError(err.response?.data?.message || 'Gagal memperbarui RW');
            } finally {
                setSubmitLoading(false);
            }
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            setSubmitLoading(true);
            const endpoint = activeTab === 'rt' ? `/rt/${selectedItem.id}` : `/rw/${selectedItem.id}`;
            const res = await api.delete(endpoint);
            if (res.data && res.data.status === 'success') {
                setIsDeleteOpen(false);
                fetchData();
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert(err.response?.data?.message || `Gagal menghapus ${activeTab === 'rt' ? 'RT' : 'RW'}`);
        } finally {
            setSubmitLoading(false);
        }
    };

    const selectedRwObj = rwList.find(rw => rw.id === formData.rw_id);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-950 tracking-tight flex items-center gap-2">
                        <Map className="text-emerald-600" />
                        Master Wilayah RT & RW
                    </h1>
                    <p className="text-sm text-emerald-600/80 mt-1">
                        Kelola data wilayah Rukun Tetangga (RT) dan Rukun Warga (RW) di lingkungan Wargatify.
                    </p>
                </div>
                {isAuthorized && (
                    <button 
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-emerald-100 hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>Tambah {activeTab === 'rt' ? 'RT' : 'RW'}</span>
                    </button>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Rukun Tetangga (RT)</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">{rtList.length} RT</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Home size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Rukun Warga (RW)</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">{rwList.length} RW</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Wilayah Aktif</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">
                            {activeTab === 'rt' 
                                ? rtList.filter(rt => rt.is_active).length + ' RT' 
                                : rwList.filter(rw => rw.is_active).length + ' RW'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-emerald-50">
                <button
                    onClick={() => { setActiveTab('rt'); setSearchTerm(''); }}
                    className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                        activeTab === 'rt' 
                            ? 'border-emerald-600 text-emerald-700 font-bold' 
                            : 'border-transparent text-gray-400 hover:text-emerald-800'
                    }`}
                >
                    Daftar Rukun Tetangga (RT)
                </button>
                <button
                    onClick={() => { setActiveTab('rw'); setSearchTerm(''); }}
                    className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                        activeTab === 'rw' 
                            ? 'border-emerald-600 text-emerald-700 font-bold' 
                            : 'border-transparent text-gray-400 hover:text-emerald-800'
                    }`}
                >
                    Daftar Rukun Warga (RW)
                </button>
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
                        placeholder={activeTab === 'rt' ? "Cari nomor RT, Ketua, atau RW..." : "Cari nomor RW atau Ketua..."}
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
                        <p className="text-sm font-medium">Memuat data wilayah...</p>
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
                ) : (activeTab === 'rt' ? filteredRt.length === 0 : filteredRw.length === 0) ? (
                    <div className="py-16 text-center text-emerald-600/60">
                        <AlertCircle className="mx-auto mb-2" size={32} />
                        <p className="font-medium">Data wilayah tidak ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-emerald-50">
                            <thead className="bg-emerald-50/30">
                                <tr>
                                    {activeTab === 'rt' ? (
                                        <>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">No. RT</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">RW Penaung</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nama Ketua RT</th>
                                        </>
                                    ) : (
                                        <>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">No. RW</th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nama Ketua RW</th>
                                        </>
                                    )}
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-4">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-emerald-50/50">
                                {activeTab === 'rt' ? (
                                    filteredRt.map((rt) => (
                                        <tr key={rt.id} className="hover:bg-emerald-50/10 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm">
                                                        RT
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-semibold text-emerald-950">RT {rt.nomor_rt}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-medium">
                                                RW {rt.nomor_rw}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-semibold">
                                                {rt.ketua_rt || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    rt.is_active 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                        : 'bg-red-50 text-red-600 border border-red-200'
                                                }`}>
                                                    {rt.is_active ? 'Aktif' : 'Non-aktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => openViewModal(rt)}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                                        title="View Detail"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {isAuthorized && (
                                                        <>
                                                            <button 
                                                                onClick={() => openEditModal(rt)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Edit RT"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => openDeleteModal(rt)}
                                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Hapus RT"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredRw.map((rw) => (
                                        <tr key={rw.id} className="hover:bg-emerald-50/10 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm">
                                                        RW
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-semibold text-emerald-950">RW {rw.nomor_rw}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-semibold">
                                                {rw.ketua_rw || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    rw.is_active 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                        : 'bg-red-50 text-red-600 border border-red-200'
                                                }`}>
                                                    {rw.is_active ? 'Aktif' : 'Non-aktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => openViewModal(rw)}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                                        title="View Detail"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {isAuthorized && (
                                                        <>
                                                            <button 
                                                                onClick={() => openEditModal(rw)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Edit RW"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => openDeleteModal(rw)}
                                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Hapus RW"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL: TAMBAH DATA */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-md w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Plus className="text-emerald-600" size={20} />
                                Tambah {activeTab === 'rt' ? 'RT' : 'RW'} Baru
                            </h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {activeTab === 'rt' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">RW Penaung *</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsRwDropdownOpen(!isRwDropdownOpen)}
                                                className="w-full flex items-center justify-between px-3 py-2 border border-emerald-100 rounded-xl text-sm text-emerald-950 bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left"
                                            >
                                                {selectedRwObj ? (
                                                    <span className="block truncate font-medium">RW {selectedRwObj.nomor_rw} (Ketua: {selectedRwObj.ketua_rw || '-'})</span>
                                                ) : (
                                                    <span className="text-gray-400">Pilih RW...</span>
                                                )}
                                                <span className="ml-2 flex items-center pointer-events-none text-emerald-500">
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            </button>

                                            {isRwDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => { setIsRwDropdownOpen(false); setRwSearchTerm(''); }}></div>
                                                    <div className="absolute z-20 mt-1.5 w-full bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in">
                                                        <div className="p-2 border-b border-emerald-50 bg-emerald-50/20">
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={rwSearchTerm}
                                                                    onChange={(e) => setRwSearchTerm(e.target.value)}
                                                                    placeholder="Cari RW..."
                                                                    className="w-full px-3 py-1.5 pl-8 text-xs border border-emerald-100 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 placeholder-emerald-300"
                                                                />
                                                                <Search className="absolute left-2.5 top-2.5 text-emerald-400" size={12} />
                                                            </div>
                                                        </div>

                                                        <div className="overflow-y-auto max-h-48 divide-y divide-emerald-50/30">
                                                            {filteredRws.filter(rw => rw.is_active).length === 0 ? (
                                                                <div className="p-4 text-xs text-center text-emerald-600/60 font-medium">
                                                                    Tidak ada RW aktif yang cocok
                                                                </div>
                                                            ) : (
                                                                filteredRws.filter(rw => rw.is_active).map((rw) => {
                                                                    const isSelected = rw.id === formData.rw_id;
                                                                    return (
                                                                        <div
                                                                            key={rw.id}
                                                                            onClick={() => handleSelectRw(rw.id)}
                                                                            className={`px-4 py-2.5 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                                                isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                                            }`}
                                                                        >
                                                                            <span className="font-semibold text-emerald-950">RW {rw.nomor_rw} (Ketua: {rw.ketua_rw || '-'})</span>
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
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nomor RT *</label>
                                        <input
                                            type="text"
                                            name="nomor_rt"
                                            value={formData.nomor_rt}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                            placeholder="Contoh: 001"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nama Ketua RT</label>
                                        <input
                                            type="text"
                                            name="ketua_rt"
                                            value={formData.ketua_rt}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                            placeholder="Masukkan nama ketua RT"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nomor RW *</label>
                                        <input
                                            type="text"
                                            name="nomor_rw"
                                            value={formData.nomor_rw}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                            placeholder="Contoh: 010"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nama Ketua RW</label>
                                        <input
                                            type="text"
                                            name="ketua_rw"
                                            value={formData.ketua_rw}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                            placeholder="Masukkan nama ketua RW"
                                        />
                                    </div>
                                </>
                            )}

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
                                            <span>Simpan Data</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT DATA */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-md w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Edit2 className="text-emerald-600" size={20} />
                                Edit Data {activeTab === 'rt' ? 'RT' : 'RW'}
                            </h3>
                            <button onClick={() => setIsEditOpen(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {activeTab === 'rt' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">RW Penaung *</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsRwDropdownOpen(!isRwDropdownOpen)}
                                                className="w-full flex items-center justify-between px-3 py-2 border border-emerald-100 rounded-xl text-sm text-emerald-950 bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left"
                                            >
                                                {selectedRwObj ? (
                                                    <span className="block truncate font-medium">RW {selectedRwObj.nomor_rw} (Ketua: {selectedRwObj.ketua_rw || '-'})</span>
                                                ) : (
                                                    <span className="text-gray-400">Pilih RW...</span>
                                                )}
                                                <span className="ml-2 flex items-center pointer-events-none text-emerald-500">
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            </button>

                                            {isRwDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => { setIsRwDropdownOpen(false); setRwSearchTerm(''); }}></div>
                                                    <div className="absolute z-20 mt-1.5 w-full bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in">
                                                        <div className="p-2 border-b border-emerald-50 bg-emerald-50/20">
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={rwSearchTerm}
                                                                    onChange={(e) => setRwSearchTerm(e.target.value)}
                                                                    placeholder="Cari RW..."
                                                                    className="w-full px-3 py-1.5 pl-8 text-xs border border-emerald-100 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 placeholder-emerald-300"
                                                                />
                                                                <Search className="absolute left-2.5 top-2.5 text-emerald-400" size={12} />
                                                            </div>
                                                        </div>

                                                        <div className="overflow-y-auto max-h-48 divide-y divide-emerald-50/30">
                                                            {filteredRws.length === 0 ? (
                                                                <div className="p-4 text-xs text-center text-emerald-600/60 font-medium">
                                                                    Tidak ada RW yang cocok
                                                                </div>
                                                            ) : (
                                                                filteredRws.map((rw) => {
                                                                    const isSelected = rw.id === formData.rw_id;
                                                                    return (
                                                                        <div
                                                                            key={rw.id}
                                                                            onClick={() => handleSelectRw(rw.id)}
                                                                            className={`px-4 py-2.5 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                                                isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                                            }`}
                                                                        >
                                                                            <span className="font-semibold text-emerald-950">RW {rw.nomor_rw} (Ketua: {rw.ketua_rw || '-'}) {rw.is_active ? '' : '(Non-aktif)'}</span>
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
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nomor RT *</label>
                                        <input
                                            type="text"
                                            name="nomor_rt"
                                            value={formData.nomor_rt}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nama Ketua RT</label>
                                        <input
                                            type="text"
                                            name="ketua_rt"
                                            value={formData.ketua_rt}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nomor RW *</label>
                                        <input
                                            type="text"
                                            name="nomor_rw"
                                            value={formData.nomor_rw}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nama Ketua RW</label>
                                        <input
                                            type="text"
                                            name="ketua_rw"
                                            value={formData.ketua_rw}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                        />
                                    </div>
                                </>
                            )}

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

            {/* MODAL: DETAIL VIEW */}
            {isViewOpen && selectedItem && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Info className="text-emerald-600" size={20} />
                                Detail {activeTab === 'rt' ? 'Rukun Tetangga (RT)' : 'Rukun Warga (RW)'}
                            </h3>
                            <button onClick={() => setIsViewOpen(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4 border-b border-emerald-50 pb-4">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 text-2xl font-bold flex items-center justify-center shadow-inner">
                                    <MapPin size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-emerald-950 leading-tight">
                                        {activeTab === 'rt' ? `RT ${selectedItem.nomor_rt}` : `RW ${selectedItem.nomor_rw}`}
                                    </h4>
                                    {activeTab === 'rt' && (
                                        <p className="text-sm text-emerald-600 mt-1">Di bawah RW {selectedItem.nomor_rw}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-4 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">ID Wilayah</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5 font-mono text-xs break-all">{selectedItem.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                                        Nama Ketua {activeTab === 'rt' ? 'RT' : 'RW'}
                                    </p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {activeTab === 'rt' ? selectedItem.ketua_rt : selectedItem.ketua_rw || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Status Keaktifan</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5 flex items-center gap-1.5">
                                        <span className={`w-2.5 h-2.5 rounded-full ${selectedItem.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        {selectedItem.is_active ? 'Aktif (Dapat dipilih oleh warga)' : 'Non-aktif'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Tanggal Didaftarkan</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : '-'}
                                    </p>
                                </div>
                            </div>

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
            {isDeleteOpen && selectedItem && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-emerald-950">
                                    Konfirmasi Hapus {activeTab === 'rt' ? 'RT' : 'RW'}
                                </h4>
                                <p className="text-sm text-emerald-600/70 mt-2">
                                    Apakah Anda yakin ingin menghapus {activeTab === 'rt' ? `RT ${selectedItem.nomor_rt}` : `RW ${selectedItem.nomor_rw}`}? Tindakan ini akan divalidasi keamanannya agar tidak merusak data relasi iuran/warga yang sudah ada.
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

export default RtRw;

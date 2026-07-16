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
    Briefcase
} from 'lucide-react';

const Petugas = () => {
    const { user } = useAuth();
    const isAuthorized = user && ['Admin', 'Petugas', 'Bendahara'].includes(user.nama_role);

    // List States
    const [petugasList, setPetugasList] = useState([]);
    const [wargaList, setWargaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selected Petugas and Form States
    const [selectedPetugas, setSelectedPetugas] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        user_id: '',
        jabatan: '',
        is_active: 1
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const petugasRes = await api.get('/petugas');
            const wargaRes = await api.get('/users');

            if (petugasRes.data && petugasRes.data.status === 'success') {
                setPetugasList(petugasRes.data.data);
            }
            if (wargaRes.data && wargaRes.data.status === 'success') {
                setWargaList(wargaRes.data.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Gagal memuat data petugas');
        } finally {
            setLoading(false);
        }
    };

    // Filter petugas berdasarkan pencarian
    const filteredPetugas = petugasList.filter((p) => {
        const query = searchTerm.toLowerCase();
        return (
            p.nama_lengkap.toLowerCase().includes(query) ||
            p.no_hp.toLowerCase().includes(query) ||
            p.jabatan.toLowerCase().includes(query)
        );
    });

    // Warga yang belum didaftarkan sebagai petugas (untuk dropdown list Tambah Petugas)
    const availableWarga = wargaList.filter(
        warga => warga.is_active && !petugasList.some(p => p.user_id === warga.id)
    );

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
        setFormData({
            user_id: availableWarga.length > 0 ? availableWarga[0].id : '',
            jabatan: '',
            is_active: 1
        });
        setFormError('');
        setIsAddOpen(true);
    };

    const openEditModal = (p) => {
        setSelectedPetugas(p);
        setFormData({
            user_id: p.user_id,
            jabatan: p.jabatan,
            is_active: p.is_active ? 1 : 0
        });
        setFormError('');
        setIsEditOpen(true);
    };

    const openViewModal = (p) => {
        setSelectedPetugas(p);
        setIsViewOpen(true);
    };

    const openDeleteModal = (p) => {
        setSelectedPetugas(p);
        setIsDeleteOpen(true);
    };

    // Action Submit Handlers
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.user_id || !formData.jabatan) {
            setFormError('Nama Warga dan Jabatan wajib diisi');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            const res = await api.post('/petugas', {
                user_id: formData.user_id,
                jabatan: formData.jabatan,
                is_active: formData.is_active === 1
            });
            if (res.data && res.data.status === 'success') {
                setIsAddOpen(false);
                fetchData();
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Gagal menambahkan petugas');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!formData.jabatan) {
            setFormError('Jabatan petugas wajib diisi');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            const res = await api.put(`/petugas/${selectedPetugas.id}`, {
                jabatan: formData.jabatan,
                is_active: formData.is_active === 1
            });
            if (res.data && res.data.status === 'success') {
                setIsEditOpen(false);
                fetchData();
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Gagal memperbarui data petugas');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            setSubmitLoading(true);
            const res = await api.delete(`/petugas/${selectedPetugas.id}`);
            if (res.data && res.data.status === 'success') {
                setIsDeleteOpen(false);
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Gagal menghapus petugas');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-950 tracking-tight flex items-center gap-2">
                        <Contact className="text-emerald-600" />
                        Master Data Petugas
                    </h1>
                    <p className="text-sm text-emerald-600/80 mt-1">
                        Kelola data warga yang ditunjuk sebagai petugas pelayanan di lingkungan Wargatify.
                    </p>
                </div>
                {isAuthorized && (
                    <button 
                        onClick={openAddModal}
                        disabled={availableWarga.length === 0}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>Tambah Petugas</span>
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
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Petugas</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">{petugasList.length} Orang</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Petugas Aktif</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">
                            {petugasList.filter(p => p.is_active).length} Orang
                        </p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Warga Belum Ditunjuk</p>
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
                        placeholder="Cari nama, no hp, jabatan..."
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
                        <p className="text-sm font-medium">Memuat data petugas...</p>
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
                ) : filteredPetugas.length === 0 ? (
                    <div className="py-16 text-center text-emerald-600/60">
                        <AlertCircle className="mx-auto mb-2" size={32} />
                        <p className="font-medium">Data petugas tidak ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-emerald-50">
                            <thead className="bg-emerald-50/30">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nama Petugas</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">No. HP</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Wilayah RT/RW</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Jabatan</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-4">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-emerald-50/50">
                                {filteredPetugas.map((p) => (
                                    <tr key={p.id} className="hover:bg-emerald-50/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                                                    {p.nama_lengkap.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-semibold text-emerald-950">{p.nama_lengkap}</div>
                                                    <div className="text-xs text-emerald-600/70">Blok {p.blok_rumah || '-'}/{p.nomor_rumah || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-medium">
                                            {p.no_hp}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-medium">
                                            {p.nomor_rt ? `RT ${p.nomor_rt} / RW ${p.nomor_rw}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-950 font-bold">
                                            {p.jabatan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                p.is_active 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                    : 'bg-red-50 text-red-600 border border-red-200'
                                            }`}>
                                                {p.is_active ? 'Aktif' : 'Non-aktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openViewModal(p)}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                                    title="View Detail"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {isAuthorized && (
                                                    <>
                                                        <button 
                                                            onClick={() => openEditModal(p)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit Petugas"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => openDeleteModal(p)}
                                                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Hapus Petugas"
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

            {/* MODAL: TAMBAH PETUGAS */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-md w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Plus className="text-emerald-600" size={20} />
                                Tambah Petugas Baru
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

                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Pilih Warga *</label>
                                <select
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 bg-white"
                                    required
                                >
                                    {availableWarga.length === 0 ? (
                                        <option value="" disabled>Tidak ada warga yang tersedia</option>
                                    ) : (
                                        availableWarga.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.nama_lengkap} (Blok {w.blok_rumah || '-'}/{w.nomor_rumah || '-'}, HP: {w.no_hp})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Jabatan / Posisi Tugas *</label>
                                <input
                                    type="text"
                                    name="jabatan"
                                    value={formData.jabatan}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                    placeholder="Contoh: Koordinator K3 / Keamanan"
                                    required
                                />
                            </div>

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
                                            <span>Simpan Petugas</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT PETUGAS */}
            {isEditOpen && selectedPetugas && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-md w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Edit2 className="text-emerald-600" size={20} />
                                Edit Data Petugas
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
                                    value={`${selectedPetugas.nama_lengkap} (HP: ${selectedPetugas.no_hp})`}
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm bg-gray-50 text-gray-500 font-medium"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Jabatan / Posisi Tugas *</label>
                                <input
                                    type="text"
                                    name="jabatan"
                                    value={formData.jabatan}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                    placeholder="Masukkan jabatan petugas"
                                    required
                                />
                            </div>

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
            {isViewOpen && selectedPetugas && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Info className="text-emerald-600" size={20} />
                                Detail Profil Petugas
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
                                    <h4 className="text-lg font-bold text-emerald-950 leading-tight">{selectedPetugas.nama_lengkap}</h4>
                                    <p className="text-sm text-emerald-600 mt-1">{selectedPetugas.jabatan}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">No. HP</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">{selectedPetugas.no_hp}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Alamat Rumah</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        Blok {selectedPetugas.blok_rumah || '-'}/{selectedPetugas.nomor_rumah || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Wilayah RT/RW</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {selectedPetugas.nomor_rt ? `RT ${selectedPetugas.nomor_rt} / RW ${selectedPetugas.nomor_rw}` : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Status Keaktifan</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {selectedPetugas.is_active ? 'Aktif Tugas' : 'Non-aktif'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">ID Petugas</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5 font-mono text-[10px] break-all">{selectedPetugas.id}</p>
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
            {isDeleteOpen && selectedPetugas && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-emerald-950">Konfirmasi Hapus Petugas</h4>
                                <p className="text-sm text-emerald-600/70 mt-2">
                                    Apakah Anda yakin ingin memberhentikan <strong>{selectedPetugas.nama_lengkap}</strong> sebagai petugas? Tindakan ini hanya menghapus status ketugasan tanpa menghapus data warga aslinya.
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

export default Petugas;

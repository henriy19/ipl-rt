import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Loader2, 
    AlertCircle, 
    CheckCircle, 
    XCircle, 
    X, 
    Save, 
    CreditCard, 
    Coins 
} from 'lucide-react';

const Iuran = () => {
    const { user } = useAuth();
    const isAuthorized = user && ['Admin', 'Petugas', 'Bendahara'].includes(user.nama_role);

    // States
    const [iuranList, setIuranList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Form / Selected States
    const [selectedIuran, setSelectedIuran] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        nama_iuran: '',
        nominal: '',
        is_active: 1
    });

    useEffect(() => {
        fetchIuran();
    }, []);

    const fetchIuran = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/iuran');
            if (response.data && response.data.status === 'success') {
                setIuranList(response.data.data);
            } else {
                setError('Gagal memuat data iuran');
            }
        } catch (err) {
            console.error('Gagal mengambil data iuran:', err);
            setError(err.response?.data?.message || 'Koneksi ke server gagal');
        } finally {
            setLoading(false);
        }
    };

    // Filter iuran berdasarkan pencarian
    const filteredIuran = iuranList.filter((iuran) => {
        const query = searchTerm.toLowerCase();
        return (
            iuran.nama_iuran.toLowerCase().includes(query) ||
            iuran.nominal.toString().includes(query)
        );
    });

    // Form Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked ? 1 : 0
        }));
    };

    // Open Modals
    const openAddModal = () => {
        setFormData({
            nama_iuran: '',
            nominal: '',
            is_active: 1
        });
        setFormError('');
        setIsAddOpen(true);
    };

    const openEditModal = (iuran) => {
        setSelectedIuran(iuran);
        setFormData({
            nama_iuran: iuran.nama_iuran,
            nominal: iuran.nominal,
            is_active: iuran.is_active ? 1 : 0
        });
        setFormError('');
        setIsEditOpen(true);
    };

    const openDeleteModal = (iuran) => {
        setSelectedIuran(iuran);
        setIsDeleteOpen(true);
    };

    // CRUD Submissions
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nama_iuran || formData.nominal === '') {
            setFormError('Nama iuran dan Nominal wajib diisi');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            const payload = {
                ...formData,
                nominal: Number(formData.nominal),
                is_active: formData.is_active === 1
            };

            const res = await api.post('/iuran', payload);
            if (res.data && res.data.status === 'success') {
                setIsAddOpen(false);
                fetchIuran();
            } else {
                setFormError(res.data.message || 'Gagal menambahkan iuran');
            }
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.message || 'Terjadi kesalahan sistem');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nama_iuran || formData.nominal === '') {
            setFormError('Nama iuran dan Nominal wajib diisi');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            const payload = {
                ...formData,
                nominal: Number(formData.nominal),
                is_active: formData.is_active === 1
            };

            const res = await api.put(`/iuran/${selectedIuran.id}`, payload);
            if (res.data && res.data.status === 'success') {
                setIsEditOpen(false);
                fetchIuran();
            } else {
                setFormError(res.data.message || 'Gagal memperbarui iuran');
            }
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.message || 'Terjadi kesalahan sistem');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            setSubmitLoading(true);
            const res = await api.delete(`/iuran/${selectedIuran.id}`);
            if (res.data && res.data.status === 'success') {
                setIsDeleteOpen(false);
                fetchIuran();
            } else {
                alert(res.data.message || 'Gagal menghapus iuran');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Terjadi kesalahan sistem');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Helper formatter rupiah
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-950">Master Iuran</h1>
                    <p className="text-sm text-emerald-600/80">Kelola daftar jenis iuran IPL bulanan warga.</p>
                </div>
                {isAuthorized && (
                    <button 
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-emerald-100 hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>Tambah Iuran</span>
                    </button>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Jenis Iuran</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">{iuranList.length} Jenis</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Coins size={24} className="stroke-teal-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Iuran Aktif</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">
                            {iuranList.filter(i => i.is_active).length} Aktif
                        </p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Iuran Nonaktif</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">
                            {iuranList.filter(i => !i.is_active).length} Nonaktif
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Refresh */}
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
                        placeholder="Cari nama iuran atau nominal..."
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button 
                        onClick={fetchIuran}
                        className="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-emerald-50 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-emerald-600">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p className="text-sm font-medium">Memuat data iuran...</p>
                    </div>
                ) : error ? (
                    <div className="py-16 flex flex-col items-center justify-center text-red-500 px-4 text-center">
                        <AlertCircle className="mb-2" size={36} />
                        <p className="font-semibold">{error}</p>
                        <button 
                            onClick={fetchIuran}
                            className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : filteredIuran.length === 0 ? (
                    <div className="py-16 text-center text-emerald-600/60">
                        <AlertCircle className="mx-auto mb-2" size={32} />
                        <p className="font-medium">Data iuran tidak ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-emerald-50">
                            <thead className="bg-emerald-50/30">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nama Iuran</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nominal Bulanan</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Status</th>
                                    {isAuthorized && (
                                        <th scope="col" className="relative px-6 py-4">
                                            <span className="sr-only">Aksi</span>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-emerald-50/50">
                                {filteredIuran.map((iuran) => (
                                    <tr key={iuran.id} className="hover:bg-emerald-50/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-950">
                                            {iuran.nama_iuran}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-semibold">
                                            {formatRupiah(iuran.nominal)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {iuran.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                                    <CheckCircle size={12} />
                                                    <span>Aktif</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                                                    <XCircle size={12} />
                                                    <span>Nonaktif</span>
                                                </span>
                                            )}
                                        </td>
                                        {isAuthorized && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => openEditModal(iuran)}
                                                        className="p-1.5 text-emerald-600 hover:text-emerald-950 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                                        title="Ubah data"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => openDeleteModal(iuran)}
                                                        className="p-1.5 text-rose-500 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                                        title="Hapus data"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ============================================================== */}
            {/* MODAL: TAMBAH IURAN */}
            {/* ============================================================== */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden border border-emerald-50/50 shadow-2xl animate-scale-in">
                        <div className="px-6 py-4 bg-emerald-50/40 border-b border-emerald-50 flex items-center justify-between">
                            <h3 className="font-bold text-emerald-950 text-base">Tambah Jenis Iuran</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 p-1 rounded-lg transition-all cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-emerald-950 mb-1.5">Nama Iuran</label>
                                <input
                                    type="text"
                                    name="nama_iuran"
                                    value={formData.nama_iuran}
                                    onChange={handleInputChange}
                                    className="block w-full px-4 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 placeholder-emerald-300 text-emerald-900 transition-colors"
                                    placeholder="Contoh: Iuran Keamanan, Sampah"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-emerald-950 mb-1.5">Nominal Bulanan (Rp)</label>
                                <input
                                    type="number"
                                    name="nominal"
                                    min="0"
                                    value={formData.nominal}
                                    onChange={handleInputChange}
                                    className="block w-full px-4 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 placeholder-emerald-300 text-emerald-900 transition-colors"
                                    placeholder="Masukkan besaran nominal rupiah"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active_add"
                                    name="is_active"
                                    checked={formData.is_active === 1}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300 cursor-pointer"
                                />
                                <label htmlFor="is_active_add" className="text-sm font-semibold text-emerald-950 cursor-pointer">
                                    Status Aktif (Terapkan pada Tagihan Warga)
                                </label>
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
                                            <span>Simpan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL: UBAH IURAN */}
            {/* ============================================================== */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden border border-emerald-50/50 shadow-2xl animate-scale-in">
                        <div className="px-6 py-4 bg-emerald-50/40 border-b border-emerald-50 flex items-center justify-between">
                            <h3 className="font-bold text-emerald-950 text-base">Ubah Data Iuran</h3>
                            <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 p-1 rounded-lg transition-all cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-emerald-950 mb-1.5">Nama Iuran</label>
                                <input
                                    type="text"
                                    name="nama_iuran"
                                    value={formData.nama_iuran}
                                    onChange={handleInputChange}
                                    className="block w-full px-4 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 placeholder-emerald-300 text-emerald-900 transition-colors"
                                    placeholder="Contoh: Iuran Keamanan, Sampah"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-emerald-950 mb-1.5">Nominal Bulanan (Rp)</label>
                                <input
                                    type="number"
                                    name="nominal"
                                    min="0"
                                    value={formData.nominal}
                                    onChange={handleInputChange}
                                    className="block w-full px-4 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 placeholder-emerald-300 text-emerald-900 transition-colors"
                                    placeholder="Masukkan besaran nominal rupiah"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active_edit"
                                    name="is_active"
                                    checked={formData.is_active === 1}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300 cursor-pointer"
                                />
                                <label htmlFor="is_active_edit" className="text-sm font-semibold text-emerald-950 cursor-pointer">
                                    Status Aktif (Terapkan pada Tagihan Warga)
                                </label>
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
                                            <span>Memperbarui...</span>
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

            {/* ============================================================== */}
            {/* MODAL: HAPUS IURAN */}
            {/* ============================================================== */}
            {isDeleteOpen && (
                <div className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden border border-emerald-50/50 shadow-2xl animate-scale-in">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-base font-bold text-emerald-950">Hapus Jenis Iuran</h3>
                            <p className="text-xs text-gray-500 mt-2 px-2 leading-relaxed">
                                Apakah Anda yakin ingin menghapus data iuran <strong>{selectedIuran?.nama_iuran}</strong>? Tindakan ini tidak dapat dibatalkan dan dapat memengaruhi riwayat tagihan warga.
                            </p>
                        </div>

                        <div className="px-6 py-4 bg-emerald-50/20 border-t border-emerald-50/50 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={submitLoading}
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-white hover:bg-emerald-50 rounded-xl transition-all border border-emerald-100 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={submitLoading}
                                onClick={handleDeleteSubmit}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-400 rounded-xl transition-all cursor-pointer shadow-sm"
                            >
                                {submitLoading ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Iuran;

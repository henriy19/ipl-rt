import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Shield, 
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
    CheckCircle
} from 'lucide-react';

const Role = () => {
    // List States
    const [roleList, setRoleList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selected Role & Form States
    const [selectedRole, setSelectedRole] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        nama_role: ''
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/roles');
            if (response.data && response.data.status === 'success') {
                setRoleList(response.data.data);
            } else {
                setError('Gagal memuat data role');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Koneksi ke server gagal');
        } finally {
            setLoading(false);
        }
    };

    // Filter role berdasarkan pencarian
    const filteredRoles = roleList.filter((role) => {
        const query = searchTerm.toLowerCase();
        return role.nama_role.toLowerCase().includes(query);
    });

    // Form Change Handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Open Modal Handlers
    const openAddModal = () => {
        setFormData({
            nama_role: ''
        });
        setFormError('');
        setIsAddOpen(true);
    };

    const openEditModal = (role) => {
        setSelectedRole(role);
        setFormData({
            nama_role: role.nama_role
        });
        setFormError('');
        setIsEditOpen(true);
    };

    const openViewModal = (role) => {
        setSelectedRole(role);
        setIsViewOpen(true);
    };

    const openDeleteModal = (role) => {
        setSelectedRole(role);
        setIsDeleteOpen(true);
    };

    // Action Handlers
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nama_role) {
            setFormError('Nama role wajib diisi');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            const res = await api.post('/roles', formData);
            if (res.data && res.data.status === 'success') {
                setIsAddOpen(false);
                fetchRoles();
            } else {
                setFormError(res.data.message || 'Gagal menambahkan role');
            }
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.message || 'Gagal terhubung ke server');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nama_role) {
            setFormError('Nama role wajib diisi');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            const res = await api.put(`/roles/${selectedRole.id}`, formData);
            if (res.data && res.data.status === 'success') {
                setIsEditOpen(false);
                fetchRoles();
            } else {
                setFormError(res.data.message || 'Gagal memperbarui data role');
            }
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.message || 'Gagal terhubung ke server');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            setSubmitLoading(true);
            const res = await api.delete(`/roles/${selectedRole.id}`);
            if (res.data && res.data.status === 'success') {
                setIsDeleteOpen(false);
                fetchRoles();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Gagal menghapus role');
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
                        <Shield className="text-emerald-600" />
                        Master Role
                    </h1>
                    <p className="text-sm text-emerald-600/80 mt-1">
                        Kelola data hak akses dan peran pengguna dalam aplikasi.
                    </p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-emerald-100 hover:shadow-md transition-all cursor-pointer"
                >
                    <Plus size={18} />
                    <span>Tambah Role</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Peran</p>
                        <p className="text-2xl font-bold text-emerald-950 mt-0.5">{roleList.length} Role</p>
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
                        placeholder="Cari nama role..."
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button 
                        onClick={fetchRoles}
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
                        <p className="text-sm font-medium">Memuat data role...</p>
                    </div>
                ) : error ? (
                    <div className="py-16 flex flex-col items-center justify-center text-red-500 px-4 text-center">
                        <AlertCircle className="mb-2" size={36} />
                        <p className="font-semibold">{error}</p>
                        <button 
                            onClick={fetchRoles}
                            className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : filteredRoles.length === 0 ? (
                    <div className="py-16 text-center text-emerald-600/60">
                        <AlertCircle className="mx-auto mb-2" size={32} />
                        <p className="font-medium">Data role tidak ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-emerald-50">
                            <thead className="bg-emerald-50/30">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nama Role</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">ID Role</th>
                                    <th scope="col" className="relative px-6 py-4">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-emerald-50/50">
                                {filteredRoles.map((role) => (
                                    <tr key={role.id} className="hover:bg-emerald-50/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                                                    {role.nama_role.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-semibold text-emerald-950">{role.nama_role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium font-mono text-xs">
                                            {role.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openViewModal(role)}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                                    title="View Detail"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => openEditModal(role)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Edit Role"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(role)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Hapus Role"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL: TAMBAH ROLE */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-md w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Plus className="text-emerald-600" size={20} />
                                Tambah Role Baru
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
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nama Role *</label>
                                <input
                                    type="text"
                                    name="nama_role"
                                    value={formData.nama_role}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                    placeholder="Contoh: Super Admin"
                                    required
                                />
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
                                            <span>Simpan Role</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT ROLE */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-md w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Edit2 className="text-emerald-600" size={20} />
                                Edit Data Role
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
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nama Role *</label>
                                <input
                                    type="text"
                                    name="nama_role"
                                    value={formData.nama_role}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                    placeholder="Masukkan nama role"
                                    required
                                />
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
            {isViewOpen && selectedRole && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Info className="text-emerald-600" size={20} />
                                Detail Role
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
                                    <Shield size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-emerald-950 leading-tight">{selectedRole.nama_role}</h4>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 gap-y-4 gap-x-2 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">ID Role</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5 font-mono text-xs break-all">{selectedRole.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Dibuat Pada</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {selectedRole.created_at ? new Date(selectedRole.created_at).toLocaleString('id-ID') : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Terakhir Diperbarui</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {selectedRole.updated_at ? new Date(selectedRole.updated_at).toLocaleString('id-ID') : '-'}
                                    </p>
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
            {isDeleteOpen && selectedRole && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-emerald-950">Konfirmasi Hapus Role</h4>
                                <p className="text-sm text-emerald-600/70 mt-2">
                                    Apakah Anda yakin ingin menghapus role <strong>{selectedRole.nama_role}</strong>? Tindakan ini tidak dapat dibatalkan.
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

export default Role;

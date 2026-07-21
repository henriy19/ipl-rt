import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Users, 
    Search, 
    UserPlus, 
    Edit2, 
    Trash2, 
    AlertCircle, 
    Home, 
    CheckCircle, 
    XCircle,
    Loader2,
    Eye,
    X,
    Save,
    AlertTriangle,
    Info,
    FileSpreadsheet,
    Download
} from 'lucide-react';

const Warga = () => {
    // List States
    const [wargaList, setWargaList] = useState([]);
    const [rtList, setRtList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Excel Upload States
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    // Selected Warga & Form States
    const [selectedWarga, setSelectedWarga] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        no_hp: '',
        password: '',
        blok_rumah: '',
        nomor_rumah: '',
        status_hunian: 'pemilik',
        rt_id: '',
        role_id: '',
        jumlah_penghuni: 1,
        is_active: 1
    });

    // Custom Dropdown States for RT / RW
    const [isRtDropdownOpen, setIsRtDropdownOpen] = useState(false);
    const [rtSearchTerm, setRtSearchTerm] = useState('');

    // Custom Dropdown States for Role
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const [roleSearchTerm, setRoleSearchTerm] = useState('');

    useEffect(() => {
        fetchWarga();
        fetchReferences();
    }, []);

    const fetchWarga = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/users');
            if (response.data && response.data.status === 'success') {
                setWargaList(response.data.data);
            } else {
                setError('Gagal memuat data warga');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Koneksi ke server gagal');
        } finally {
            setLoading(false);
        }
    };

    const fetchReferences = async () => {
        try {
            const rtRes = await api.get('/rt');
            if (rtRes.data && rtRes.data.status === 'success') {
                setRtList(rtRes.data.data);
            }
            const roleRes = await api.get('/roles');
            if (roleRes.data && roleRes.data.status === 'success') {
                setRoleList(roleRes.data.data);
            }
        } catch (err) {
            console.error('Gagal mengambil data referensi RT/Role:', err);
        }
    };

    // Filter warga berdasarkan pencarian
    const filteredWarga = wargaList.filter((warga) => {
        const query = searchTerm.toLowerCase();
        return (
            warga.nama_lengkap.toLowerCase().includes(query) ||
            warga.no_hp.includes(query) ||
            (warga.blok_rumah && warga.blok_rumah.toLowerCase().includes(query)) ||
            (warga.nomor_rumah && warga.nomor_rumah.includes(query))
        );
    });

    // Form Change Handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e) => {
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

    // Filter RT / RW lists
    const filteredRts = rtList.filter(rt => {
        const q = rtSearchTerm.toLowerCase();
        return rt.nomor_rt.includes(q) || rt.nomor_rw.includes(q) || (rt.ketua_rt && rt.ketua_rt.toLowerCase().includes(q));
    });

    // Filter Role lists
    const filteredRoles = roleList.filter(role => {
        const q = roleSearchTerm.toLowerCase();
        return role.nama_role.toLowerCase().includes(q);
    });

    const handleSelectRt = (rtId) => {
        setFormData(prev => ({ ...prev, rt_id: rtId }));
        setIsRtDropdownOpen(false);
        setRtSearchTerm('');
    };

    const handleSelectRole = (roleId) => {
        setFormData(prev => ({ ...prev, role_id: roleId }));
        setIsRoleDropdownOpen(false);
        setRoleSearchTerm('');
    };

    // Open Modal Handlers
    const openAddModal = () => {
        setFormData({
            nama_lengkap: '',
            no_hp: '',
            password: '',
            blok_rumah: '',
            nomor_rumah: '',
            status_hunian: 'pemilik',
            rt_id: rtList[0]?.id || '',
            role_id: roleList.find(r => r.nama_role.toLowerCase() === 'warga')?.id || roleList[0]?.id || '',
            jumlah_penghuni: 1,
            is_active: 1
        });
        setFormError('');
        setIsRtDropdownOpen(false);
        setRtSearchTerm('');
        setIsRoleDropdownOpen(false);
        setRoleSearchTerm('');
        setIsAddOpen(true);
    };

    const openEditModal = (warga) => {
        setSelectedWarga(warga);
        setFormData({
            nama_lengkap: warga.nama_lengkap,
            no_hp: warga.no_hp,
            password: '', // Biarkan kosong kecuali diubah
            blok_rumah: warga.blok_rumah || '',
            nomor_rumah: warga.nomor_rumah || '',
            status_hunian: warga.status_hunian || 'pemilik',
            rt_id: warga.rt_id || '',
            role_id: warga.role_id,
            jumlah_penghuni: warga.jumlah_penghuni || 1,
            is_active: warga.is_active
        });
        setFormError('');
        setIsRtDropdownOpen(false);
        setRtSearchTerm('');
        setIsRoleDropdownOpen(false);
        setRoleSearchTerm('');
        setIsEditOpen(true);
    };

    const openViewModal = (warga) => {
        setSelectedWarga(warga);
        setIsViewOpen(true);
    };

    const openDeleteModal = (warga) => {
        setSelectedWarga(warga);
        setIsDeleteOpen(true);
    };

    const openUploadModal = () => {
        setUploadFile(null);
        setUploadError('');
        setUploadSuccess('');
        setIsUploadOpen(true);
    };

    const handleFileChange = (e) => {
        setUploadFile(e.target.files[0]);
        setUploadError('');
        setUploadSuccess('');
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile) {
            setUploadError('Pilih berkas Excel terlebih dahulu');
            return;
        }

        try {
            setUploadLoading(true);
            setUploadError('');
            setUploadSuccess('');

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const base64 = event.target.result;
                    const res = await api.post('/users/upload-excel', { file: base64 });
                    if (res.data && res.data.status === 'success') {
                        setUploadSuccess(res.data.message || 'Data warga berhasil di-upsert');
                        fetchWarga();
                        setUploadFile(null);
                    } else {
                        setUploadError(res.data.message || 'Gagal mengunggah data');
                    }
                } catch (err) {
                    console.error(err);
                    setUploadError(err.response?.data?.message || 'Gagal terhubung ke server');
                } finally {
                    setUploadLoading(false);
                }
            };
            reader.onerror = () => {
                setUploadError('Gagal membaca berkas');
                setUploadLoading(false);
            };
            reader.readAsDataURL(uploadFile);
        } catch (err) {
            console.error(err);
            setUploadError('Terjadi kesalahan saat memproses berkas');
            setUploadLoading(false);
        }
    };

    // Action Handlers
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nama_lengkap || !formData.no_hp) {
            setFormError('Nama lengkap dan Nomor HP wajib diisi');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            const res = await api.post('/users', formData);
            if (res.data && res.data.status === 'success') {
                setIsAddOpen(false);
                fetchWarga();
            } else {
                setFormError(res.data.message || 'Gagal menambahkan warga');
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
        if (!formData.nama_lengkap || !formData.no_hp) {
            setFormError('Nama lengkap dan Nomor HP wajib diisi');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            const res = await api.put(`/users/${selectedWarga.id}`, formData);
            if (res.data && res.data.status === 'success') {
                setIsEditOpen(false);
                fetchWarga();
            } else {
                setFormError(res.data.message || 'Gagal memperbarui data warga');
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
            const res = await api.delete(`/users/${selectedWarga.id}`);
            if (res.data && res.data.status === 'success') {
                setIsDeleteOpen(false);
                fetchWarga();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Gagal menghapus warga');
        } finally {
            setSubmitLoading(false);
        }
    };

    const selectedRtObj = rtList.find(rt => rt.id === formData.rt_id);
    const selectedRoleObj = roleList.find(r => r.id === formData.role_id);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-950 tracking-tight flex items-center gap-2">
                        <Users className="text-emerald-600" />
                        Data Warga
                    </h1>
                    <p className="text-sm text-emerald-600/80 mt-1">
                        Kelola data warga RT secara terpusat, tertib, dan aman.
                    </p>
                </div>
                <div className="flex gap-2">
                    <a 
                        href="/template_data_warga.xlsx" 
                        download="template_data_warga.xlsx"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                        <Download size={18} />
                        <span>Download Template</span>
                    </a>
                    <button 
                        onClick={openUploadModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                        <FileSpreadsheet size={18} />
                        <span>Upload Excel</span>
                    </button>
                    <button 
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-emerald-100 hover:shadow-md transition-all cursor-pointer"
                    >
                        <UserPlus size={18} />
                        <span>Tambah Warga</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            {(() => {
                const totalJiwa = wargaList.reduce((acc, curr) => acc + (parseInt(curr.jumlah_penghuni, 10) || 1), 0);
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Kepala Keluarga</p>
                                <p className="text-2xl font-bold text-emerald-950 mt-0.5">{wargaList.length} KK</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Users size={24} className="stroke-teal-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Populasi (Jiwa)</p>
                                <p className="text-2xl font-bold text-emerald-950 mt-0.5">{totalJiwa} Jiwa</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Home size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Pemilik Hunian</p>
                                <p className="text-2xl font-bold text-emerald-950 mt-0.5">
                                    {wargaList.filter(w => w.status_hunian === 'pemilik').length} KK
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-teal-500 uppercase tracking-wider">Penyewa / Kontrak</p>
                                <p className="text-2xl font-bold text-emerald-950 mt-0.5">
                                    {wargaList.filter(w => w.status_hunian === 'penyewa').length} KK
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })()}

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
                        placeholder="Cari nama, no HP, blok..."
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button 
                        onClick={fetchWarga}
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
                        <p className="text-sm font-medium">Memuat data warga...</p>
                    </div>
                ) : error ? (
                    <div className="py-16 flex flex-col items-center justify-center text-red-500 px-4 text-center">
                        <AlertCircle className="mb-2" size={36} />
                        <p className="font-semibold">{error}</p>
                        <button 
                            onClick={fetchWarga}
                            className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : filteredWarga.length === 0 ? (
                    <div className="py-16 text-center text-emerald-600/60">
                        <AlertCircle className="mx-auto mb-2" size={32} />
                        <p className="font-medium">Data warga tidak ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-emerald-50">
                            <thead className="bg-emerald-50/30">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nama Lengkap</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">No. Handphone</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Alamat Rumah</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">RT / RW</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Hunian</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Penghuni</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-4">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-emerald-50/50">
                                {filteredWarga.map((warga) => (
                                    <tr key={warga.id} className="hover:bg-emerald-50/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                                                    {warga.nama_lengkap.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-semibold text-emerald-950">{warga.nama_lengkap}</div>
                                                    <div className="text-xs text-emerald-500 font-medium capitalize">{warga.nama_role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-medium">
                                            {warga.no_hp}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                                            {warga.blok_rumah && warga.nomor_rumah 
                                                ? `Blok ${warga.blok_rumah} No. ${warga.nomor_rumah}` 
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-semibold">
                                            {warga.nomor_rt && warga.nomor_rw 
                                                ? `RT ${warga.nomor_rt} / RW ${warga.nomor_rw}` 
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                                warga.status_hunian === 'pemilik' 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                    : 'bg-teal-50 text-teal-700 border border-teal-100'
                                            }`}>
                                                {warga.status_hunian}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-950 font-semibold">
                                            {warga.jumlah_penghuni || 1} Jiwa
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {warga.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                    <CheckCircle size={14} />
                                                    <span>Aktif</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                                                    <XCircle size={14} />
                                                    <span>Nonaktif</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openViewModal(warga)}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                                    title="View Detail"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => openEditModal(warga)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Edit Warga"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(warga)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Hapus Warga"
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

            {/* MODAL: UPLOAD EXCEL */}
            {isUploadOpen && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <FileSpreadsheet className="text-emerald-600" size={20} />
                                Upload Data Warga via Excel
                            </h3>
                            <button onClick={() => setIsUploadOpen(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Content */}
                        <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {uploadError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={16} />
                                    <span>{uploadError}</span>
                                </div>
                            )}
                            {uploadSuccess && (
                                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-100">
                                    <CheckCircle size={16} />
                                    <span>{uploadSuccess}</span>
                                </div>
                            )}

                            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-950 space-y-2">
                                <p className="font-bold flex items-center gap-1">
                                    <Info size={14} className="text-emerald-600" />
                                    Petunjuk Struktur Kolom Excel:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><b>Nama Lengkap</b> (Wajib)</li>
                                    <li><b>No HP</b> (Wajib, Unik sebagai kunci data)</li>
                                    <li><b>Blok</b>, <b>No Rumah</b> (Opsional)</li>
                                    <li><b>Status Hunian</b> (Opsional: pemilik / penyewa)</li>
                                    <li><b>Jumlah Penghuni</b> (Opsional, angka)</li>
                                    <li><b>Peran</b> (Opsional: Admin / Warga / Petugas / Bendahara)</li>
                                    <li><b>RT</b>, <b>RW</b> (Opsional, angka RT dan RW penaung)</li>
                                </ul>
                                <p className="text-emerald-700 font-medium pt-1">
                                    * Data warga lama dengan nomor HP yang sama akan diperbarui (upsert).
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Pilih Berkas Excel (.xlsx / .xls)</label>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-emerald-950 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                    required
                                />
                            </div>

                            {uploadFile && (
                                <div className="text-xs text-emerald-700 font-medium">
                                    Berkas terpilih: <span className="font-bold text-emerald-950">{uploadFile.name}</span> ({(uploadFile.size / 1024).toFixed(1)} KB)
                                </div>
                            )}

                            <div className="pt-4 flex items-center justify-between border-t border-emerald-100">
                                <a 
                                    href="/template_data_warga.xlsx" 
                                    download="template_data_warga.xlsx"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                                >
                                    <FileSpreadsheet size={14} />
                                    Unduh Template Excel
                                </a>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadOpen(false)}
                                        className="px-4 py-2 border border-emerald-100 rounded-xl text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploadLoading}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                                    >
                                        {uploadLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                <span>Mengunggah...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                <span>Mulai Upload</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: TAMBAH WARGA */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <UserPlus className="text-emerald-600" size={20} />
                                Tambah Warga Baru
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
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    name="nama_lengkap"
                                    value={formData.nama_lengkap}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                    placeholder="Masukkan nama lengkap warga"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nomor Handphone *</label>
                                    <input
                                        type="tel"
                                        name="no_hp"
                                        value={formData.no_hp}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                        placeholder="0812xxxxxxxx"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Password (Opsional)</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                        placeholder="Default: password123"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Blok Rumah</label>
                                    <input
                                        type="text"
                                        name="blok_rumah"
                                        value={formData.blok_rumah}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                        placeholder="Contoh: A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nomor Rumah</label>
                                    <input
                                        type="text"
                                        name="nomor_rumah"
                                        value={formData.nomor_rumah}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                        placeholder="Contoh: 15"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">RT / RW *</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsRtDropdownOpen(!isRtDropdownOpen)}
                                            className="w-full flex items-center justify-between px-3 py-2 border border-emerald-100 rounded-xl text-sm text-emerald-950 bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left"
                                        >
                                            {selectedRtObj ? (
                                                <span className="block truncate font-medium">RT {selectedRtObj.nomor_rt} / RW {selectedRtObj.nomor_rw}</span>
                                            ) : (
                                                <span className="text-gray-400">Pilih RT / RW...</span>
                                            )}
                                            <span className="ml-2 flex items-center pointer-events-none text-emerald-500">
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        </button>

                                        {isRtDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => { setIsRtDropdownOpen(false); setRtSearchTerm(''); }}></div>
                                                <div className="absolute z-20 mt-1.5 w-full bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in">
                                                    <div className="p-2 border-b border-emerald-50 bg-emerald-50/20">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={rtSearchTerm}
                                                                onChange={(e) => setRtSearchTerm(e.target.value)}
                                                                placeholder="Cari RT..."
                                                                className="w-full px-3 py-1.5 pl-8 text-xs border border-emerald-100 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 placeholder-emerald-300"
                                                            />
                                                            <Search className="absolute left-2.5 top-2.5 text-emerald-400" size={12} />
                                                        </div>
                                                    </div>

                                                    <div className="overflow-y-auto max-h-48 divide-y divide-emerald-50/30">
                                                        {filteredRts.length === 0 ? (
                                                            <div className="p-4 text-xs text-center text-emerald-600/60 font-medium">
                                                                Tidak ada RT yang cocok
                                                            </div>
                                                        ) : (
                                                            filteredRts.map((rt) => {
                                                                const isSelected = rt.id === formData.rt_id;
                                                                return (
                                                                    <div
                                                                        key={rt.id}
                                                                        onClick={() => handleSelectRt(rt.id)}
                                                                        className={`px-4 py-2.5 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                                            isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                                        }`}
                                                                    >
                                                                        <span className="font-semibold text-emerald-950">RT {rt.nomor_rt} / RW {rt.nomor_rw}</span>
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
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Peran (Role) *</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                            className="w-full flex items-center justify-between px-3 py-2 border border-emerald-100 rounded-xl text-sm text-emerald-950 bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left"
                                        >
                                            {selectedRoleObj ? (
                                                <span className="block truncate font-medium">{selectedRoleObj.nama_role}</span>
                                            ) : (
                                                <span className="text-gray-400">Pilih Peran...</span>
                                            )}
                                            <span className="ml-2 flex items-center pointer-events-none text-emerald-500">
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        </button>

                                        {isRoleDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => { setIsRoleDropdownOpen(false); setRoleSearchTerm(''); }}></div>
                                                <div className="absolute z-20 mt-1.5 w-full bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in">
                                                    <div className="p-2 border-b border-emerald-50 bg-emerald-50/20">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={roleSearchTerm}
                                                                onChange={(e) => setRoleSearchTerm(e.target.value)}
                                                                placeholder="Cari peran..."
                                                                className="w-full px-3 py-1.5 pl-8 text-xs border border-emerald-100 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 placeholder-emerald-300"
                                                            />
                                                            <Search className="absolute left-2.5 top-2.5 text-emerald-400" size={12} />
                                                        </div>
                                                    </div>

                                                    <div className="overflow-y-auto max-h-48 divide-y divide-emerald-50/30">
                                                        {filteredRoles.length === 0 ? (
                                                            <div className="p-4 text-xs text-center text-emerald-600/60 font-medium">
                                                                Tidak ada peran yang cocok
                                                            </div>
                                                        ) : (
                                                            filteredRoles.map((role) => {
                                                                const isSelected = role.id === formData.role_id;
                                                                return (
                                                                    <div
                                                                        key={role.id}
                                                                        onClick={() => handleSelectRole(role.id)}
                                                                        className={`px-4 py-2.5 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                                            isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                                        }`}
                                                                    >
                                                                        <span className="font-semibold text-emerald-950">{role.nama_role}</span>
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
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Status Hunian *</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                                        formData.status_hunian === 'pemilik' 
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                            : 'border-emerald-100 bg-white text-emerald-600 hover:bg-emerald-50/30'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="status_hunian"
                                            value="pemilik"
                                            checked={formData.status_hunian === 'pemilik'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        Pemilik Rumah
                                    </label>
                                    <label className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                                        formData.status_hunian === 'penyewa' 
                                            ? 'border-teal-500 bg-teal-50/70 text-teal-700' 
                                            : 'border-emerald-100 bg-white text-emerald-600 hover:bg-emerald-50/30'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="status_hunian"
                                            value="penyewa"
                                            checked={formData.status_hunian === 'penyewa'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        Penyewa / Kontrak
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-emerald-950 mb-1.5">Jumlah Penghuni (Jiwa)</label>
                                <input
                                    type="number"
                                    name="jumlah_penghuni"
                                    min="1"
                                    value={formData.jumlah_penghuni}
                                    onChange={handleInputChange}
                                    className="block w-full px-4 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 placeholder-emerald-300 text-emerald-900 transition-colors"
                                    placeholder="Masukkan jumlah orang yang tinggal"
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
                                    Pengguna Aktif (Bisa Login ke Aplikasi)
                                </label>
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
                                            <span>Simpan Warga</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT WARGA */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Edit2 className="text-emerald-600" size={20} />
                                Edit Data Warga
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
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    name="nama_lengkap"
                                    value={formData.nama_lengkap}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                    placeholder="Masukkan nama lengkap warga"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nomor Handphone *</label>
                                <input
                                    type="tel"
                                    name="no_hp"
                                    value={formData.no_hp}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                    placeholder="0812xxxxxxxx"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Blok Rumah</label>
                                    <input
                                        type="text"
                                        name="blok_rumah"
                                        value={formData.blok_rumah}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                        placeholder="Contoh: A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Nomor Rumah</label>
                                    <input
                                        type="text"
                                        name="nomor_rumah"
                                        value={formData.nomor_rumah}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                        placeholder="Contoh: 15"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">RT / RW *</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsRtDropdownOpen(!isRtDropdownOpen)}
                                            className="w-full flex items-center justify-between px-3 py-2 border border-emerald-100 rounded-xl text-sm text-emerald-950 bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left"
                                        >
                                            {selectedRtObj ? (
                                                <span className="block truncate font-medium">RT {selectedRtObj.nomor_rt} / RW {selectedRtObj.nomor_rw}</span>
                                            ) : (
                                                <span className="text-gray-400">Pilih RT / RW...</span>
                                            )}
                                            <span className="ml-2 flex items-center pointer-events-none text-emerald-500">
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        </button>

                                        {isRtDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => { setIsRtDropdownOpen(false); setRtSearchTerm(''); }}></div>
                                                <div className="absolute z-20 mt-1.5 w-full bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in">
                                                    <div className="p-2 border-b border-emerald-50 bg-emerald-50/20">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={rtSearchTerm}
                                                                onChange={(e) => setRtSearchTerm(e.target.value)}
                                                                placeholder="Cari RT..."
                                                                className="w-full px-3 py-1.5 pl-8 text-xs border border-emerald-100 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 placeholder-emerald-300"
                                                            />
                                                            <Search className="absolute left-2.5 top-2.5 text-emerald-400" size={12} />
                                                        </div>
                                                    </div>

                                                    <div className="overflow-y-auto max-h-48 divide-y divide-emerald-50/30">
                                                        {filteredRts.length === 0 ? (
                                                            <div className="p-4 text-xs text-center text-emerald-600/60 font-medium">
                                                                Tidak ada RT yang cocok
                                                            </div>
                                                        ) : (
                                                            filteredRts.map((rt) => {
                                                                const isSelected = rt.id === formData.rt_id;
                                                                return (
                                                                    <div
                                                                        key={rt.id}
                                                                        onClick={() => handleSelectRt(rt.id)}
                                                                        className={`px-4 py-2.5 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                                            isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                                        }`}
                                                                    >
                                                                        <span className="font-semibold text-emerald-950">RT {rt.nomor_rt} / RW {rt.nomor_rw}</span>
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
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Peran (Role) *</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                            className="w-full flex items-center justify-between px-3 py-2 border border-emerald-100 rounded-xl text-sm text-emerald-950 bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left"
                                        >
                                            {selectedRoleObj ? (
                                                <span className="block truncate font-medium">{selectedRoleObj.nama_role}</span>
                                            ) : (
                                                <span className="text-gray-400">Pilih Peran...</span>
                                            )}
                                            <span className="ml-2 flex items-center pointer-events-none text-emerald-500">
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        </button>

                                        {isRoleDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => { setIsRoleDropdownOpen(false); setRoleSearchTerm(''); }}></div>
                                                <div className="absolute z-20 mt-1.5 w-full bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in">
                                                    <div className="p-2 border-b border-emerald-50 bg-emerald-50/20">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={roleSearchTerm}
                                                                onChange={(e) => setRoleSearchTerm(e.target.value)}
                                                                placeholder="Cari peran..."
                                                                className="w-full px-3 py-1.5 pl-8 text-xs border border-emerald-100 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 placeholder-emerald-300"
                                                            />
                                                            <Search className="absolute left-2.5 top-2.5 text-emerald-400" size={12} />
                                                        </div>
                                                    </div>

                                                    <div className="overflow-y-auto max-h-48 divide-y divide-emerald-50/30">
                                                        {filteredRoles.length === 0 ? (
                                                            <div className="p-4 text-xs text-center text-emerald-600/60 font-medium">
                                                                Tidak ada peran yang cocok
                                                            </div>
                                                        ) : (
                                                            filteredRoles.map((role) => {
                                                                const isSelected = role.id === formData.role_id;
                                                                return (
                                                                    <div
                                                                        key={role.id}
                                                                        onClick={() => handleSelectRole(role.id)}
                                                                        className={`px-4 py-2.5 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                                            isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                                        }`}
                                                                    >
                                                                        <span className="font-semibold text-emerald-950">{role.nama_role}</span>
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
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Status Hunian *</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                                        formData.status_hunian === 'pemilik' 
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                            : 'border-emerald-100 bg-white text-emerald-600 hover:bg-emerald-50/30'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="status_hunian"
                                            value="pemilik"
                                            checked={formData.status_hunian === 'pemilik'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        Pemilik Rumah
                                    </label>
                                    <label className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                                        formData.status_hunian === 'penyewa' 
                                            ? 'border-teal-500 bg-teal-50/70 text-teal-700' 
                                            : 'border-emerald-100 bg-white text-emerald-600 hover:bg-emerald-50/30'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="status_hunian"
                                            value="penyewa"
                                            checked={formData.status_hunian === 'penyewa'}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        Penyewa / Kontrak
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-emerald-950 mb-1.5">Jumlah Penghuni (Jiwa)</label>
                                <input
                                    type="number"
                                    name="jumlah_penghuni"
                                    min="1"
                                    value={formData.jumlah_penghuni}
                                    onChange={handleInputChange}
                                    className="block w-full px-4 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 placeholder-emerald-300 text-emerald-900 transition-colors"
                                    placeholder="Masukkan jumlah orang yang tinggal"
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
                                    Pengguna Aktif (Bisa Login ke Aplikasi)
                                </label>
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
            {isViewOpen && selectedWarga && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-md w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Info className="text-emerald-600" size={20} />
                                Detail Profil Warga
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
                                    {selectedWarga.nama_lengkap.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-emerald-950 leading-tight">{selectedWarga.nama_lengkap}</h4>
                                    <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 capitalize">
                                        Peran: {selectedWarga.nama_role}
                                    </span>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">No. Handphone</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">{selectedWarga.no_hp}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Status Hunian</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5 capitalize">{selectedWarga.status_hunian}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Jumlah Penghuni</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">{selectedWarga.jumlah_penghuni || 1} Jiwa</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Alamat Lengkap</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {selectedWarga.blok_rumah && selectedWarga.nomor_rumah 
                                            ? `Blok ${selectedWarga.blok_rumah} No. ${selectedWarga.nomor_rumah}` 
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Wilayah RT / RW</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {selectedWarga.nomor_rt && selectedWarga.nomor_rw 
                                            ? `RT ${selectedWarga.nomor_rt} / RW ${selectedWarga.nomor_rw}` 
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Status Akun</p>
                                    <div className="mt-1">
                                        {selectedWarga.is_active ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                <CheckCircle size={12} />
                                                <span>Aktif (Bisa Login)</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                                                <XCircle size={12} />
                                                <span>Nonaktif (Blokir)</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Tanggal Terdaftar</p>
                                    <p className="font-semibold text-emerald-950 mt-0.5">
                                        {new Date(selectedWarga.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
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
            {isDeleteOpen && selectedWarga && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-emerald-50 max-w-sm w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-emerald-950">Konfirmasi Hapus Warga</h4>
                                <p className="text-sm text-emerald-600/70 mt-2">
                                    Apakah Anda yakin ingin menghapus data <strong>{selectedWarga.nama_lengkap}</strong>? Tindakan ini tidak dapat dibatalkan.
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

export default Warga;

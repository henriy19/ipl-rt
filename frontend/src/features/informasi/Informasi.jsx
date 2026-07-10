import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
    Megaphone, 
    Plus, 
    Search, 
    Calendar, 
    FileText, 
    Image, 
    Video, 
    Tag, 
    Edit2, 
    Trash2, 
    Eye, 
    X, 
    Save, 
    Loader2, 
    AlertCircle,
    Play,
    Link,
    Upload
} from 'lucide-react';

const Informasi = () => {
    const { user } = useAuth();
    const isAuthorized = user && ['Admin', 'Petugas', 'Bendahara'].includes(user.nama_role);

    // States
    const [infoList, setInfoList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Control States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selected items & Form States
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        judul: '',
        narasi: '',
        tanggal: '',
        kategori: 'Kegiatan',
        foto_url: '',
        video_url: ''
    });

    // Toggle Inputs for URL/Link vs Upload
    const [fotoInputType, setFotoInputType] = useState('link'); // 'link' or 'upload'
    const [videoInputType, setVideoInputType] = useState('link'); // 'link' or 'upload'

    useEffect(() => {
        fetchInformasi();
    }, []);

    const fetchInformasi = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/informasi');
            if (response.data && response.data.status === 'success') {
                setInfoList(response.data.data);
            } else {
                setError('Gagal memuat data informasi');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Koneksi ke server gagal');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi ukuran: max 10MB untuk foto, max 40MB untuk video
        const maxSize = field === 'foto_url' ? 10 * 1024 * 1024 : 40 * 1024 * 1024;
        if (file.size > maxSize) {
            setFormError(`Ukuran file terlalu besar. Maksimal ${field === 'foto_url' ? '10MB' : '40MB'}.`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                [field]: reader.result // Base64 data URL
            }));
            setFormError('');
        };
        reader.readAsDataURL(file);
    };

    const openAddModal = () => {
        setFormData({
            judul: '',
            narasi: '',
            tanggal: new Date().toISOString().split('T')[0],
            kategori: 'Kegiatan',
            foto_url: '',
            video_url: ''
        });
        setFotoInputType('link');
        setVideoInputType('link');
        setIsEditMode(false);
        setFormError('');
        setIsFormOpen(true);
    };

    const openEditModal = (info) => {
        setSelectedInfo(info);
        const formattedDate = info.tanggal ? info.tanggal.split('T')[0] : '';
        setFormData({
            judul: info.judul,
            narasi: info.narasi,
            tanggal: formattedDate,
            kategori: info.kategori || 'Kegiatan',
            foto_url: info.foto_url || '',
            video_url: info.video_url || ''
        });
        setFotoInputType(info.foto_url?.startsWith('/uploads') ? 'upload' : 'link');
        setVideoInputType(info.video_url?.startsWith('/uploads') ? 'upload' : 'link');
        setIsEditMode(true);
        setFormError('');
        setIsFormOpen(true);
    };

    const openViewModal = (info) => {
        setSelectedInfo(info);
        setIsViewOpen(true);
    };

    const openDeleteModal = (info) => {
        setSelectedInfo(info);
        setIsDeleteOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.judul || !formData.narasi || !formData.tanggal) {
            setFormError('Judul, Narasi, dan Tanggal wajib diisi');
            return;
        }

        try {
            setSubmitLoading(true);
            setFormError('');
            if (isEditMode) {
                const res = await api.put(`/informasi/${selectedInfo.id}`, formData);
                if (res.data && res.data.status === 'success') {
                    setIsFormOpen(false);
                    fetchInformasi();
                } else {
                    setFormError(res.data.message || 'Gagal memperbarui informasi');
                }
            } else {
                const res = await api.post('/informasi', formData);
                if (res.data && res.data.status === 'success') {
                    setIsFormOpen(false);
                    fetchInformasi();
                } else {
                    setFormError(res.data.message || 'Gagal menambahkan informasi');
                }
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
            const res = await api.delete(`/informasi/${selectedInfo.id}`);
            if (res.data && res.data.status === 'success') {
                setIsDeleteOpen(false);
                fetchInformasi();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Gagal menghapus informasi');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Helper static uploads URL getter
    const getMediaUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/uploads')) {
            return `http://localhost:5000${url}`;
        }
        return url;
    };

    // Helper Youtube Embed Parser
    const getEmbedVideoUrl = (url) => {
        if (!url) return null;
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
        const match = ytRegex.exec(url);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
        return getMediaUrl(url);
    };

    const getKategoriBadgeColor = (kategori) => {
        switch (kategori) {
            case 'Kerja Bakti':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Rapat RT':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Kesehatan':
                return 'bg-cyan-50 text-cyan-700 border-cyan-100';
            case 'Sosialisasi':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Olahraga':
                return 'bg-purple-50 text-purple-700 border-purple-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Filtered list
    const filteredInfo = infoList.filter(info => {
        const query = searchTerm.toLowerCase();
        return (
            info.judul.toLowerCase().includes(query) ||
            info.narasi.toLowerCase().includes(query) ||
            (info.kategori && info.kategori.toLowerCase().includes(query))
        );
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-950 tracking-tight flex items-center gap-2">
                        <Megaphone className="text-emerald-600" />
                        Informasi & Kegiatan
                    </h1>
                    <p className="text-sm text-emerald-600/80 mt-1">
                        Daftar pengumuman, sosialisasi, dan agenda kegiatan di lingkungan RT/RW.
                    </p>
                </div>
                {isAuthorized && (
                    <button 
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-emerald-100 hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>Tambah Informasi</span>
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 placeholder-emerald-300 text-emerald-900 transition-colors"
                        placeholder="Cari judul, kegiatan, kategori..."
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button 
                        onClick={fetchInformasi}
                        className="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-emerald-600">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p className="text-sm font-medium">Memuat informasi kegiatan...</p>
                </div>
            ) : error ? (
                <div className="py-16 flex flex-col items-center justify-center text-red-500 px-4 text-center">
                    <AlertCircle className="mb-2" size={36} />
                    <p className="font-semibold">{error}</p>
                    <button 
                        onClick={fetchInformasi}
                        className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                    >
                        Coba Lagi
                    </button>
                </div>
            ) : filteredInfo.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-emerald-50/50 shadow-[0_4px_20px_rgb(16,185,129,0.02)]">
                    <Megaphone className="mx-auto mb-4 text-emerald-200" size={48} />
                    <p className="font-semibold text-emerald-700 text-lg">Belum ada informasi kegiatan.</p>
                    <p className="text-sm mt-1 text-emerald-500/70">Pengumuman warga akan tampil di sini saat dirilis oleh pengurus RT.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInfo.map((info) => (
                        <div key={info.id} className="bg-white rounded-3xl overflow-hidden border border-emerald-50 shadow-[0_4px_20px_rgb(16,185,129,0.03)] hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgb(16,185,129,0.08)] transition-all duration-300 flex flex-col group">
                            {/* Card Media Preview */}
                            <div className="relative aspect-video w-full overflow-hidden bg-emerald-50/50">
                                {info.foto_url ? (
                                    <img 
                                        src={getMediaUrl(info.foto_url)} 
                                        alt={info.judul} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-emerald-300">
                                        <Megaphone size={40} className="stroke-[1.5]" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize shadow-sm ${getKategoriBadgeColor(info.kategori)}`}>
                                        {info.kategori}
                                    </span>
                                </div>
                                {info.video_url && (
                                    <div className="absolute bottom-3 right-3 bg-emerald-600/90 text-white p-2 rounded-full shadow backdrop-blur-sm">
                                        <Play size={14} className="fill-white" />
                                    </div>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center text-xs text-emerald-600 font-semibold gap-1.5">
                                        <Calendar size={14} />
                                        <span>{formatDate(info.tanggal)}</span>
                                    </div>
                                    <h3 className="font-bold text-emerald-950 text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                                        {info.judul}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                                        {info.narasi}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-emerald-50 flex items-center justify-between">
                                    <button 
                                        onClick={() => openViewModal(info)}
                                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold text-sm bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                                    >
                                        <Eye size={16} />
                                        <span>View Detail</span>
                                    </button>
                                    
                                    {isAuthorized && (
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => openEditModal(info)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(info)}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL: FORM (ADD / EDIT) */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-emerald-50 max-w-2xl w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                <Megaphone className="text-emerald-600" size={20} />
                                {isEditMode ? 'Edit Informasi Kegiatan' : 'Tambah Informasi Kegiatan Baru'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2 border border-red-100 animate-pulse rounded-xl">
                                    <AlertCircle size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Judul Kegiatan *</label>
                                    <input
                                        type="text"
                                        name="judul"
                                        value={formData.judul}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                        placeholder="Contoh: Kerja Bakti Bulanan"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Tanggal Kegiatan *</label>
                                    <input
                                        type="date"
                                        name="tanggal"
                                        value={formData.tanggal}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Kategori *</label>
                                    <select
                                        name="kategori"
                                        value={formData.kategori}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 cursor-pointer"
                                        required
                                    >
                                        <option value="Kegiatan">Kegiatan Umum</option>
                                        <option value="Kerja Bakti">Kerja Bakti</option>
                                        <option value="Rapat RT">Rapat RT</option>
                                        <option value="Kesehatan">Kesehatan / Posyandu</option>
                                        <option value="Sosialisasi">Sosialisasi</option>
                                        <option value="Olahraga">Olahraga</option>
                                    </select>
                                </div>

                                {/* FOTO KETENTUAN UPLOAD ATAU LINK */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">Foto Kegiatan</label>
                                        <div className="flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => { setFotoInputType('link'); setFormData(p => ({ ...p, foto_url: '' })); }}
                                                className={`px-2 py-0.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${fotoInputType === 'link' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                            >
                                                Link URL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setFotoInputType('upload'); setFormData(p => ({ ...p, foto_url: '' })); }}
                                                className={`px-2 py-0.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${fotoInputType === 'upload' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                            >
                                                Upload
                                            </button>
                                        </div>
                                    </div>
                                    {fotoInputType === 'link' ? (
                                        <input
                                            type="url"
                                            name="foto_url"
                                            value={formData.foto_url.startsWith('data:') ? '' : formData.foto_url}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'foto_url')}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-emerald-100 rounded-xl px-2 py-1"
                                            />
                                            {formData.foto_url.startsWith('data:') && (
                                                <span className="absolute right-3 top-2.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Terunggah</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* VIDEO KETENTUAN UPLOAD ATAU LINK */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">Video Terkait</label>
                                    <div className="flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => { setVideoInputType('link'); setFormData(p => ({ ...p, video_url: '' })); }}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${videoInputType === 'link' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                        >
                                            Link URL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setVideoInputType('upload'); setFormData(p => ({ ...p, video_url: '' })); }}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${videoInputType === 'upload' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>
                                {videoInputType === 'link' ? (
                                    <input
                                        type="url"
                                        name="video_url"
                                        value={formData.video_url.startsWith('data:') ? '' : formData.video_url}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950"
                                        placeholder="https://www.youtube.com/watch?v=xxx atau https://example.com/video.mp4"
                                    />
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handleFileChange(e, 'video_url')}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-emerald-100 rounded-xl px-2 py-1"
                                        />
                                        {formData.video_url.startsWith('data:') && (
                                            <span className="absolute right-3 top-2.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Terunggah</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Narasi / Detail Kegiatan *</label>
                                <textarea
                                    name="narasi"
                                    value={formData.narasi}
                                    onChange={handleInputChange}
                                    rows="5"
                                    className="block w-full px-3 py-2 border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-950 leading-relaxed"
                                    placeholder="Tuliskan detail mengenai kegiatan ini (lokasi, perlengkapan yang dibawa, imbauan dll)..."
                                    required
                                />
                            </div>

                            {/* Live Media Preview Box */}
                            {(formData.foto_url || formData.video_url) && (
                                <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-50 space-y-4 animate-fade-in">
                                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <Image size={14} />
                                        Preview Media Input
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {formData.foto_url && (
                                            <div>
                                                <span className="text-[11px] font-semibold text-emerald-600 block mb-1">Foto Preview</span>
                                                <div className="aspect-video w-full rounded-xl overflow-hidden bg-white border border-emerald-100">
                                                    <img 
                                                        src={getMediaUrl(formData.foto_url)} 
                                                        alt="Preview" 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {formData.video_url && (
                                            <div>
                                                <span className="text-[11px] font-semibold text-emerald-600 block mb-1">Video Preview</span>
                                                <div className="aspect-video w-full rounded-xl overflow-hidden bg-white border border-emerald-100 flex items-center justify-center bg-black">
                                                    {getEmbedVideoUrl(formData.video_url) && getEmbedVideoUrl(formData.video_url).includes('youtube.com/embed') ? (
                                                        <iframe 
                                                            src={getEmbedVideoUrl(formData.video_url)} 
                                                            title="Video Preview"
                                                            className="w-full h-full"
                                                            frameBorder="0"
                                                        />
                                                    ) : (
                                                        <video src={getMediaUrl(formData.video_url)} className="w-full h-full object-cover" controls />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="pt-4 border-t border-emerald-50 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
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
                                            <span>Simpan Informasi</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: VIEW DETAIL */}
            {isViewOpen && selectedInfo && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-emerald-50 max-w-2xl w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize shadow-sm ${getKategoriBadgeColor(selectedInfo.kategori)}`}>
                                {selectedInfo.kategori}
                            </span>
                            <button onClick={() => setIsViewOpen(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1 rounded-lg hover:bg-emerald-100">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center text-xs text-emerald-600 font-semibold gap-1.5">
                                    <Calendar size={14} />
                                    <span>{formatDate(selectedInfo.tanggal)}</span>
                                </div>
                                <h2 className="text-2xl font-extrabold text-emerald-950 leading-tight">
                                    {selectedInfo.judul}
                                </h2>
                            </div>

                            {/* Main Image */}
                            {selectedInfo.foto_url && (
                                <div className="rounded-2xl overflow-hidden shadow border border-emerald-50 bg-emerald-50/20 max-h-80 flex items-center justify-center">
                                    <img 
                                        src={getMediaUrl(selectedInfo.foto_url)} 
                                        alt={selectedInfo.judul} 
                                        className="w-full object-cover max-h-80"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Narrative */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">Narasi Kegiatan</label>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-emerald-50/20 p-4 rounded-2xl border border-emerald-50/50">
                                    {selectedInfo.narasi}
                                </p>
                            </div>

                            {/* Video Embed */}
                            {selectedInfo.video_url && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                                        <Video size={14} />
                                        Video Terkait
                                    </label>
                                    {getEmbedVideoUrl(selectedInfo.video_url) && getEmbedVideoUrl(selectedInfo.video_url).includes('youtube.com/embed') ? (
                                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-emerald-100 bg-black">
                                            <iframe
                                                src={getEmbedVideoUrl(selectedInfo.video_url)}
                                                title={selectedInfo.judul}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="absolute inset-0 w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <video src={getMediaUrl(selectedInfo.video_url)} controls className="w-full rounded-2xl max-h-80 bg-black shadow-md border border-emerald-100" />
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Footer */}
                        <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100 flex justify-end">
                            <button
                                onClick={() => setIsViewOpen(false)}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: CONFIRM DELETE */}
            {isDeleteOpen && selectedInfo && (
                <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-emerald-50 max-w-md w-full overflow-hidden shadow-2xl animate-fade-in">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100">
                                <Trash2 size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-emerald-950">Hapus Informasi Kegiatan?</h3>
                                <p className="text-sm text-gray-500 leading-relaxed px-2">
                                    Apakah Anda yakin ingin menghapus informasi <span className="font-semibold text-emerald-900">"{selectedInfo.judul}"</span>? Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setIsDeleteOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer border border-emerald-100"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeleteSubmit}
                                    disabled={submitLoading}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-xl transition-all cursor-pointer shadow-sm"
                                >
                                    {submitLoading ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Informasi;

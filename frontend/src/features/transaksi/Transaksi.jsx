import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
    Search, 
    Loader2, 
    AlertCircle, 
    CheckCircle, 
    XCircle, 
    X, 
    Save, 
    CreditCard, 
    TrendingUp, 
    Calendar,
    ArrowUpRight,
    Trash2
} from 'lucide-react';

const Transaksi = () => {
    const { user } = useAuth();
    const isAuthorized = user && ['Admin', 'Petugas', 'Bendahara'].includes(user.nama_role);
    const isAdmin = user && user.nama_role === 'Admin';

    // Filter States
    const now = new Date();
    const [filterBulan, setFilterBulan] = useState(now.getMonth() + 1);
    const [filterTahun, setFilterTahun] = useState(now.getFullYear());
    const [filterStatus, setFilterStatus] = useState('all');

    // List & Loading States
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Control States
    const [isPayOpen, setIsPayOpen] = useState(false);
    const [selectedTagihan, setSelectedTagihan] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [payForm, setPayForm] = useState({
        metode_pembayaran: 'cash',
        catatan_bendahara: ''
    });

    const [payMode, setPayMode] = useState('direct'); // 'direct', 'verify', 'submit'
    const [genLoading, setGenLoading] = useState(false);
    const [clearLoading, setClearLoading] = useState(false);

    // Custom Dialog States
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        message: '',
        onConfirm: null
    });
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        type: 'success',
        message: ''
    });

    useEffect(() => {
        fetchTransactions();
    }, [filterBulan, filterTahun, filterStatus]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError('');
            
            let res;
            if (isAuthorized) {
                // Admin: Fetch all transactions with filters
                const params = {
                    bulan: filterBulan,
                    tahun: filterTahun,
                    status: filterStatus
                };
                res = await api.get('/tagihan', { params });
            } else {
                // Warga: Fetch own history
                res = await api.get('/tagihan/history');
            }

            if (res.data && res.data.status === 'success') {
                setTransactions(res.data.data);
            } else {
                setError('Gagal memuat data transaksi');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Koneksi ke server gagal');
        } finally {
            setLoading(false);
        }
    };

    // Filter data lokal berdasarkan input pencarian (nama, blok, dll.)
    const filteredTransactions = transactions.filter((t) => {
        const query = searchTerm.toLowerCase();
        // Tagihan history warga biasa mungkin tidak memiliki field nama_lengkap (karena milik sendiri)
        const nama = t.nama_lengkap ? t.nama_lengkap.toLowerCase() : (user?.nama_lengkap || '').toLowerCase();
        const blok = t.blok_rumah ? t.blok_rumah.toLowerCase() : '';
        const noRumah = t.nomor_rumah ? t.nomor_rumah.toLowerCase() : '';
        const namaIuran = t.nama_iuran ? t.nama_iuran.toLowerCase() : '';
        
        return (
            nama.includes(query) ||
            blok.includes(query) ||
            noRumah.includes(query) ||
            namaIuran.includes(query)
        );
    });

    // Generate Tagihan Bulanan (Massal)
    const handleGenerateTagihan = () => {
        setConfirmModal({
            isOpen: true,
            message: `Apakah Anda yakin ingin men-generate tagihan untuk periode ${getNamaBulan(filterBulan)} ${filterTahun}?`,
            onConfirm: () => executeGenerateTagihan()
        });
    };

    const executeGenerateTagihan = async () => {
        try {
            setGenLoading(true);
            const res = await api.post('/tagihan/generate', {
                bulan: filterBulan,
                tahun: filterTahun
            });

            if (res.data && res.data.status === 'success') {
                setAlertModal({
                    isOpen: true,
                    type: 'success',
                    message: res.data.message
                });
                fetchTransactions();
            } else {
                setAlertModal({
                    isOpen: true,
                    type: 'error',
                    message: res.data.message || 'Gagal men-generate tagihan'
                });
            }
        } catch (err) {
            console.error(err);
            setAlertModal({
                isOpen: true,
                type: 'error',
                message: err.response?.data?.message || 'Terjadi kesalahan sistem'
            });
        } finally {
            setGenLoading(false);
        }
    };

    // Clear Tagihan Bulanan (Admin Only)
    const handleClearTagihan = () => {
        setConfirmModal({
            isOpen: true,
            message: `Apakah Anda yakin ingin menghapus seluruh data tagihan dan riwayat pembayaran untuk periode ${getNamaBulan(filterBulan)} ${filterTahun}? Tindakan ini TIDAK dapat dibatalkan!`,
            onConfirm: () => executeClearTagihan()
        });
    };

    const executeClearTagihan = async () => {
        try {
            setClearLoading(true);
            const res = await api.post('/tagihan/clear', {
                bulan: filterBulan,
                tahun: filterTahun
            });

            if (res.data && res.data.status === 'success') {
                setAlertModal({
                    isOpen: true,
                    type: 'success',
                    message: res.data.message
                });
                fetchTransactions();
            } else {
                setAlertModal({
                    isOpen: true,
                    type: 'error',
                    message: res.data.message || 'Gagal menghapus tagihan'
                });
            }
        } catch (err) {
            console.error(err);
            setAlertModal({
                isOpen: true,
                type: 'error',
                message: err.response?.data?.message || 'Terjadi kesalahan sistem'
            });
        } finally {
            setClearLoading(false);
        }
    };

    // Open Modal Pembayaran
    const openPayModal = (tagihan, mode = 'direct') => {
        setSelectedTagihan(tagihan);
        setPayMode(mode);
        setPayForm({
            metode_pembayaran: tagihan.metode_pembayaran || 'cash',
            catatan_bendahara: mode === 'verify' ? 'Pembayaran terverifikasi lunas oleh pengurus' : ''
        });
        setFormError('');
        setIsPayOpen(true);
    };

    // Submit Pembayaran / Tandai Lunas / Verifikasi
    const handlePaySubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitLoading(true);
            setFormError('');
            
            let res;
            if (payMode === 'direct') {
                res = await api.post(`/tagihan/${selectedTagihan.id}/bayar`, payForm);
            } else if (payMode === 'verify') {
                res = await api.post(`/tagihan/${selectedTagihan.id}/verifikasi`, {
                    catatan_bendahara: payForm.catatan_bendahara
                });
            } else if (payMode === 'submit') {
                res = await api.post(`/tagihan/${selectedTagihan.id}/submit`, payForm);
            }
            
            if (res.data && res.data.status === 'success') {
                setIsPayOpen(false);
                setAlertModal({
                    isOpen: true,
                    type: 'success',
                    message: payMode === 'verify' 
                        ? 'Tagihan berhasil diverifikasi Lunas!' 
                        : 'Pembayaran berhasil dicatat/dikirim. Status sekarang: Menunggu Verifikasi.'
                });
                fetchTransactions();
            } else {
                setFormError(res.data.message || 'Gagal memproses transaksi');
            }
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.message || 'Terjadi kesalahan sistem');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Helper Rupiah
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Helper Nama Bulan
    const getNamaBulan = (num) => {
        const daftarBulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return daftarBulan[num - 1] || '';
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-950">Transaksi Iuran</h1>
                    <p className="text-sm text-emerald-600/80">
                        {isAuthorized 
                            ? 'Pantau pembayaran IPL bulanan warga dan verifikasi lunas.' 
                            : 'Lihat riwayat tagihan bulanan dan bukti pembayaran Anda.'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {isAdmin && (
                        <button 
                            onClick={handleClearTagihan}
                            disabled={clearLoading}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                            {clearLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Menghapus...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 size={18} />
                                    <span>Hapus Tagihan Periode Ini</span>
                                </>
                            )}
                        </button>
                    )}
                    {isAuthorized && (
                        <button 
                            onClick={handleGenerateTagihan}
                            disabled={genLoading}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                            {genLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <ArrowUpRight size={18} />
                                    <span>Generate Tagihan Bulanan</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Overview (Hanya untuk Admin/Bendahara) */}
            {isAuthorized && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4 animate-fade-in">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Tagihan Periode Ini</p>
                            <p className="text-2xl font-bold text-emerald-950 mt-0.5">{transactions.length} Tagihan</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp size={24} className="stroke-teal-600" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Lunas</p>
                            <p className="text-2xl font-bold text-emerald-950 mt-0.5">
                                {transactions.filter(t => t.status === 'paid').length} Lunas
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-emerald-50 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <XCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Belum Lunas (Tunggakan)</p>
                            <p className="text-2xl font-bold text-emerald-950 mt-0.5">
                                {transactions.filter(t => t.status !== 'paid').length} Rumah
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="relative w-full md:max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 placeholder-emerald-300 text-emerald-900 transition-colors"
                            placeholder={isAuthorized ? "Cari nama warga, blok, iuran..." : "Cari iuran..."}
                        />
                    </div>

                    {/* Filters (Admin Only) */}
                    {isAuthorized && (
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                            {/* Bulan */}
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} className="text-emerald-600" />
                                <select
                                    value={filterBulan}
                                    onChange={(e) => setFilterBulan(e.target.value)}
                                    className="px-3 py-1.5 border border-emerald-100 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-emerald-950 font-semibold"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {getNamaBulan(i + 1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tahun */}
                            <select
                                value={filterTahun}
                                onChange={(e) => setFilterTahun(e.target.value)}
                                className="px-3 py-1.5 border border-emerald-100 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-emerald-950 font-semibold"
                            >
                                {[2024, 2025, 2026, 2027, 2028].map(yr => (
                                    <option key={yr} value={yr}>{yr}</option>
                                ))}
                            </select>

                            {/* Status */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-1.5 border border-emerald-100 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-emerald-950 font-semibold"
                            >
                                <option value="all">Semua Status</option>
                                <option value="paid">Lunas</option>
                                <option value="unpaid">Belum Lunas</option>
                            </select>

                            <button 
                                onClick={fetchTransactions}
                                className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Refresh
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-emerald-50 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-emerald-600">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p className="text-sm font-medium">Memuat data transaksi...</p>
                    </div>
                ) : error ? (
                    <div className="py-16 flex flex-col items-center justify-center text-red-500 px-4 text-center">
                        <AlertCircle className="mb-2" size={36} />
                        <p className="font-semibold">{error}</p>
                        <button 
                            onClick={fetchTransactions}
                            className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="py-16 text-center text-emerald-600/60">
                        <AlertCircle className="mx-auto mb-2" size={32} />
                        <p className="font-medium">Data transaksi tidak ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-emerald-50">
                            <thead className="bg-emerald-50/30">
                                <tr>
                                    {isAuthorized && (
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nama Warga</th>
                                    )}
                                    {isAuthorized && (
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Alamat / RT</th>
                                    )}
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nama Iuran</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Nominal</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Periode</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">Detail Pembayaran</th>
                                    <th scope="col" className="relative px-6 py-4 text-right text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                                        <span>Aksi</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-emerald-50/50">
                                {filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-emerald-50/10 transition-colors">
                                        {isAuthorized && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-950">
                                                {t.nama_lengkap}
                                            </td>
                                        )}
                                        {isAuthorized && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                                                {t.blok_rumah && t.nomor_rumah ? `Blok ${t.blok_rumah}/${t.nomor_rumah}` : '-'} 
                                                {t.nomor_rt ? ` (RT ${t.nomor_rt})` : ''}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-950 font-semibold">
                                            {t.nama_iuran}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900 font-semibold">
                                            {formatRupiah(t.nominal_tagihan)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-semibold">
                                            {getNamaBulan(t.bulan)} {t.tahun}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {t.status === 'paid' ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                                    <CheckCircle size={12} />
                                                    <span>Lunas</span>
                                                </span>
                                            ) : t.status === 'pending' ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100 animate-pulse">
                                                    <AlertCircle size={12} />
                                                    <span>Menunggu Verifikasi</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                                                    <XCircle size={12} />
                                                    <span>Tunggakan</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {t.status === 'paid' ? (
                                                <div className="space-y-0.5">
                                                    <p>Metode: <strong className="capitalize text-emerald-950">{t.metode_pembayaran}</strong></p>
                                                    <p>Tgl Bayar: {new Date(t.tanggal_bayar).toLocaleDateString('id-ID')}</p>
                                                    {t.pencatat_nama && <p>Dicatat oleh: <span className="font-semibold text-emerald-900">{t.pencatat_nama}</span></p>}
                                                    {t.verifikator_nama && <p>Diverifikasi oleh: <span className="font-semibold text-teal-800">{t.verifikator_nama}</span></p>}
                                                    {t.catatan_bendahara && <p className="italic mt-0.5">Pesan Pembayar: "{t.catatan_bendahara}"</p>}
                                                    {t.catatan_verifikasi && <p className="italic mt-0.5 text-teal-700">Note Verifikasi: "{t.catatan_verifikasi}"</p>}
                                                </div>
                                            ) : t.status === 'pending' ? (
                                                <div className="space-y-0.5">
                                                    <p>Metode: <strong className="capitalize text-amber-600">{t.metode_pembayaran}</strong></p>
                                                    <p>Tgl Kirim: {new Date(t.tanggal_bayar).toLocaleDateString('id-ID')}</p>
                                                    {t.pencatat_nama && <p>Dicatat oleh: <span className="font-semibold text-emerald-900">{t.pencatat_nama}</span></p>}
                                                    {t.catatan_bendahara && <p className="italic mt-0.5">Pesan Pembayar: "{t.catatan_bendahara}"</p>}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 font-medium">Belum membayar</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {isAuthorized ? (
                                                <>
                                                    {t.status === 'unpaid' && (
                                                        <button 
                                                            onClick={() => openPayModal(t, 'direct')}
                                                            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-50"
                                                        >
                                                            Catat Bayar
                                                        </button>
                                                    )}
                                                    {t.status === 'pending' && (
                                                        <button 
                                                            onClick={() => openPayModal(t, 'verify')}
                                                            className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all cursor-pointer shadow-sm shadow-teal-50"
                                                        >
                                                            Verifikasi Lunas
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {t.status === 'unpaid' && (
                                                        <button 
                                                            onClick={() => openPayModal(t, 'submit')}
                                                            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-50"
                                                        >
                                                            Bayar Sekarang
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ============================================================== */}
            {/* MODAL: VERIFIKASI PEMBAYARAN / TANDAI LUNAS */}
            {/* ============================================================== */}
            {isPayOpen && (
                <div className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden border border-emerald-50/50 shadow-2xl animate-scale-in">
                        <div className="px-6 py-4 bg-emerald-50/40 border-b border-emerald-50 flex items-center justify-between">
                            <h3 className="font-bold text-emerald-950 text-base">
                                {payMode === 'direct' && 'Catat Pembayaran Warga'}
                                {payMode === 'verify' && 'Verifikasi Pembayaran Lunas'}
                                {payMode === 'submit' && 'Konfirmasi Pembayaran Iuran'}
                            </h3>
                            <button onClick={() => setIsPayOpen(false)} className="text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 p-1 rounded-lg transition-all cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handlePaySubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {/* Info Tagihan */}
                            <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50 text-sm space-y-1">
                                {isAuthorized && selectedTagihan?.nama_lengkap && (
                                    <p className="text-emerald-800">Warga: <strong>{selectedTagihan?.nama_lengkap}</strong></p>
                                )}
                                <p className="text-emerald-800">Iuran: <strong>{selectedTagihan?.nama_iuran}</strong></p>
                                <p className="text-emerald-800">Nominal: <strong>{formatRupiah(selectedTagihan?.nominal_tagihan)}</strong></p>
                                <p className="text-emerald-800">Periode: <strong>{getNamaBulan(selectedTagihan?.bulan)} {selectedTagihan?.tahun}</strong></p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-emerald-950 mb-1.5">Metode Pembayaran</label>
                                <select
                                    name="metode_pembayaran"
                                    value={payForm.metode_pembayaran}
                                    onChange={(e) => setPayForm(prev => ({ ...prev, metode_pembayaran: e.target.value }))}
                                    disabled={payMode === 'verify'}
                                    className="block w-full px-4 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 text-emerald-900 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    <option value="cash">Tunai (Cash)</option>
                                    <option value="transfer">Transfer Bank / E-Wallet</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-emerald-950 mb-1.5">
                                    {payMode === 'submit' ? 'Catatan Pembayaran (Misal: Pengirim Mandiri An. Budi)' : 'Catatan Bendahara'}
                                </label>
                                <textarea
                                    name="catatan_bendahara"
                                    value={payForm.catatan_bendahara}
                                    onChange={(e) => setPayForm(prev => ({ ...prev, catatan_bendahara: e.target.value }))}
                                    rows="3"
                                    className="block w-full px-4 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/10 placeholder-emerald-300 text-emerald-900 transition-colors"
                                    placeholder={payMode === 'submit' ? 'Contoh: Sudah ditransfer via Mandiri atas nama Budi Warga' : 'Contoh: Lunas via transfer Mandiri An. Budi'}
                                />
                            </div>

                            <div className="pt-4 border-t border-emerald-50 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPayOpen(false)}
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
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>
                                                {payMode === 'direct' && 'Catat Pembayaran'}
                                                {payMode === 'verify' && 'Setujui & Verifikasi Lunas'}
                                                {payMode === 'submit' && 'Kirim Konfirmasi'}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL: CUSTOM CONFIRM DIALOG */}
            {/* ============================================================== */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden border border-emerald-50/50 shadow-2xl animate-scale-in">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                <Calendar size={24} />
                            </div>
                            <h3 className="text-base font-bold text-emerald-950">Konfirmasi Tindakan</h3>
                            <p className="text-xs text-gray-500 mt-2 px-2 leading-relaxed">
                                {confirmModal.message}
                            </p>
                        </div>

                        <div className="px-6 py-4 bg-emerald-50/20 border-t border-emerald-50/50 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-white hover:bg-emerald-50 rounded-xl transition-all border border-emerald-100 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                                }}
                                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-sm"
                            >
                                Ya, Lanjutkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL: CUSTOM ALERT DIALOG */}
            {/* ============================================================== */}
            {alertModal.isOpen && (
                <div className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden border border-emerald-50/50 shadow-2xl animate-scale-in">
                        <div className="p-6 text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border ${
                                alertModal.type === 'success' 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                    : 'bg-red-50 text-red-500 border-red-100'
                            }`}>
                                {alertModal.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                            </div>
                            <h3 className="text-base font-bold text-emerald-950">
                                {alertModal.type === 'success' ? 'Berhasil' : 'Perhatian'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-2 px-2 leading-relaxed">
                                {alertModal.message}
                            </p>
                        </div>

                        <div className="px-6 py-4 bg-emerald-50/20 border-t border-emerald-50/50 flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-6 py-2 text-sm font-semibold text-emerald-700 bg-white hover:bg-emerald-50 rounded-xl transition-all border border-emerald-100 cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transaksi;

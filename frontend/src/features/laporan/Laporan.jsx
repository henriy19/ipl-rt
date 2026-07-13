import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
    Loader2, 
    AlertCircle, 
    FileText, 
    TrendingUp, 
    AlertTriangle,
    Printer,
    Coins,
    RefreshCw
} from 'lucide-react';

const Laporan = () => {
    const { user } = useAuth();
    const isAuthorized = user && ['Admin', 'Petugas', 'Bendahara'].includes(user.nama_role);

    const now = new Date();
    const [filterTahun, setFilterTahun] = useState(now.getFullYear());
    const [filterBulan, setFilterBulan] = useState(''); // Default semua bulan untuk tunggakan

    const [rekapData, setRekapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthorized) {
            fetchReportData();
        }
    }, [filterTahun, filterBulan]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError('');
            const params = {
                tahun: filterTahun,
                bulan: filterBulan
            };
            const res = await api.get('/report/rekapitulasi', { params });
            if (res.data && res.data.status === 'success') {
                setRekapData(res.data.data);
            } else {
                setError('Gagal memuat data laporan');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Koneksi ke server gagal');
        } finally {
            setLoading(false);
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

    // Ekspor PDF Laporan dengan window.print() + layout kop surat bersih
    const handleDownloadPDF = () => {
        if (!rekapData) return;

        const printWindow = window.open('', '_blank');
        
        // Buat baris tabel pemasukan
        const pemasukanRows = rekapData.rekap_pemasukan_bulanan.map(item => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${getNamaBulan(item.bulan)}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">
                    ${formatRupiah(item.total)}
                </td>
            </tr>
        `).join('');

        // Buat baris tabel tunggakan
        const tunggakanRows = rekapData.daftar_tunggakan.length > 0 
            ? rekapData.daftar_tunggakan.map((t, index) => `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${t.nama_lengkap}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">Blok ${t.blok_rumah || '-'}/${t.nomor_rumah || '-'} (RT ${t.nomor_rt || '-'})</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${t.nama_iuran}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${getNamaBulan(t.bulan)} ${t.tahun}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #d92727; font-weight: bold;">
                        ${formatRupiah(t.nominal_tagihan)}
                    </td>
                </tr>
            `).join('')
            : `<tr><td colspan="6" style="padding: 12px; border: 1px solid #ddd; text-align: center; color: #777;">Tidak ada tunggakan warga pada periode ini.</td></tr>`;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Laporan Keuangan Wargatify - Tahun ${rekapData.tahun}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; color: #1a202c; padding: 20px; line-height: 1.5; }
                        .header { text-align: center; border-bottom: 3px double #10b981; padding-bottom: 12px; margin-bottom: 25px; }
                        .header h1 { margin: 0; font-size: 24px; color: #065f46; text-transform: uppercase; }
                        .header p { margin: 4px 0 0 0; font-size: 13px; color: #4b5563; }
                        .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
                        .summary-cards { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
                        .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #f8fafc; }
                        .card-title { font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; letter-spacing: 0.5px; }
                        .card-value { font-size: 18px; font-weight: bold; color: #1a202c; margin-top: 5px; }
                        .table-title { font-size: 15px; font-weight: bold; color: #065f46; border-left: 4px solid #10b981; padding-left: 8px; margin: 20px 0 10px 0; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
                        th { background-color: #f1f5f9; padding: 10px 8px; border: 1px solid #ddd; font-weight: bold; text-align: left; }
                        .signature-section { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; }
                        .signature-box { text-align: center; width: 200px; }
                        .signature-space { height: 60px; }
                        @media print {
                            body { padding: 0; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Laporan Kas & Keuangan Wargatify</h1>
                        <p>Lingkungan RT 01-02 / RW 010 - Kelurahan Wargatify Asri</p>
                    </div>

                    <div class="meta-info">
                        <div><strong>Tanggal Laporan:</strong> ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                        <div><strong>Periode Laporan:</strong> Tahun ${rekapData.tahun}</div>
                    </div>

                    <div class="summary-cards">
                        <div class="card">
                            <div class="card-title">Total Uang Pemasukan (${rekapData.tahun})</div>
                            <div class="card-value" style="color: #047857;">${formatRupiah(rekapData.total_pemasukan_tahunan)}</div>
                        </div>
                        <div class="card">
                            <div class="card-title">Total Tunggakan Warga</div>
                            <div class="card-value" style="color: #be123c;">${formatRupiah(rekapData.total_tunggakan)}</div>
                        </div>
                    </div>

                    <div class="table-title">Rekapitulasi Pemasukan Kas per Bulan</div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50%;">Bulan</th>
                                <th style="text-align: right;">Total Pemasukan Lunas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pemasukanRows}
                        </tbody>
                    </table>

                    <div class="table-title">Daftar Tunggakan Pembayaran Warga (${rekapData.bulan_filter === 'Semua' ? 'Seluruh Bulan' : getNamaBulan(rekapData.bulan_filter)})</div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 5%; text-align: center;">No</th>
                                <th style="width: 25%;">Nama Lengkap</th>
                                <th style="width: 25%;">Alamat Rumah</th>
                                <th style="width: 15%;">Jenis Iuran</th>
                                <th style="width: 15%; text-align: center;">Periode</th>
                                <th style="width: 15%; text-align: right;">Nominal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tunggakanRows}
                        </tbody>
                    </table>

                    <div class="signature-section">
                        <div class="signature-box">
                            <p>Mengetahui,</p>
                            <p><strong>Ketua RT 001</strong></p>
                            <div class="signature-space"></div>
                            <p>___________________</p>
                        </div>
                        <div class="signature-box">
                            <p>Dicetak Oleh,</p>
                            <p><strong>Bendahara RT</strong></p>
                            <div class="signature-space"></div>
                            <p><strong>${user?.nama_lengkap || 'Bendahara'}</strong></p>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!isAuthorized) {
        return (
            <div className="bg-white rounded-2xl border border-emerald-50 shadow-sm p-8 text-center text-emerald-600">
                <AlertCircle className="mx-auto mb-2 text-emerald-400" size={32} />
                <h3 className="text-lg font-bold text-emerald-950">Akses Terbatas</h3>
                <p className="text-sm mt-1">Menu laporan hanya dapat diakses oleh peran kepengurusan (Admin, Petugas, atau Bendahara).</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-950">Laporan Keuangan</h1>
                    <p className="text-sm text-emerald-600/80">Analisis rekap kas iuran warga bulanan dan daftar tunggakan aktif.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchReportData}
                        className="p-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                        title="Segarkan data"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={!rekapData || loading}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                        <Printer size={18} />
                        <span>Ekspor Laporan PDF</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm flex flex-wrap items-center gap-3">
                {/* Tahun */}
                <div className="flex items-center gap-2 text-sm text-emerald-950 font-semibold">
                    <span>Tahun Pemasukan:</span>
                    <select
                        value={filterTahun}
                        onChange={(e) => setFilterTahun(e.target.value)}
                        className="px-3 py-1.5 border border-emerald-100 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-emerald-950 font-semibold"
                    >
                        {[2024, 2025, 2026, 2027, 2028].map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                        ))}
                    </select>
                </div>

                {/* Bulan Filter untuk Tunggakan */}
                <div className="flex items-center gap-2 text-sm text-emerald-950 font-semibold ml-0 sm:ml-4">
                    <span>Filter Bulan Tunggakan:</span>
                    <select
                        value={filterBulan}
                        onChange={(e) => setFilterBulan(e.target.value)}
                        className="px-3 py-1.5 border border-emerald-100 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-emerald-950 font-semibold"
                    >
                        <option value="">Semua Bulan</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {getNamaBulan(i + 1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-emerald-600 bg-white rounded-2xl border border-emerald-50 shadow-sm">
                    <Loader2 className="animate-spin mb-2" size={36} />
                    <p className="text-sm font-medium">Menyusun laporan keuangan...</p>
                </div>
            ) : error ? (
                <div className="py-20 flex flex-col items-center justify-center text-red-500 px-4 text-center bg-white rounded-2xl border border-emerald-50 shadow-sm">
                    <AlertCircle className="mb-2" size={40} />
                    <p className="font-semibold">{error}</p>
                    <button 
                        onClick={fetchReportData}
                        className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                    >
                        Coba Lagi
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Pemasukan Kas Lunas ({filterTahun})</p>
                                <p className="text-3xl font-bold text-emerald-950">{formatRupiah(rekapData.total_pemasukan_tahunan)}</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-inner">
                                <Coins size={28} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-rose-50 shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Total Tunggakan Aktif</p>
                                <p className="text-3xl font-bold text-rose-600">{formatRupiah(rekapData.total_tunggakan)}</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner">
                                <AlertTriangle size={28} />
                            </div>
                        </div>
                    </div>

                    {/* Tables Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pemasukan Bulanan (Column Span 1) */}
                        <div className="bg-white rounded-2xl border border-emerald-50 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-5 py-4 border-b border-emerald-50 bg-emerald-50/20">
                                <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                                    <TrendingUp size={16} className="text-emerald-700" />
                                    <span>Rekap Bulanan</span>
                                </h3>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full divide-y divide-emerald-50">
                                    <thead className="bg-emerald-50/10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">Bulan</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-800 uppercase">Kas Masuk</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-50/50">
                                        {rekapData.rekap_pemasukan_bulanan.map(item => (
                                            <tr key={item.bulan} className="hover:bg-emerald-50/5 transition-colors">
                                                <td className="px-4 py-2.5 text-sm text-emerald-900 font-semibold">{getNamaBulan(item.bulan)}</td>
                                                <td className="px-4 py-2.5 text-sm text-emerald-950 font-bold text-right">{formatRupiah(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Daftar Tunggakan (Column Span 2) */}
                        <div className="bg-white rounded-2xl border border-emerald-50 shadow-sm overflow-hidden flex flex-col lg:col-span-2">
                            <div className="px-5 py-4 border-b border-emerald-50 bg-emerald-50/20">
                                <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                                    <FileText size={16} className="text-rose-500" />
                                    <span>Daftar Warga Menunggak ({filterBulan === '' ? 'Seluruh Bulan' : getNamaBulan(parseInt(filterBulan, 10))})</span>
                                </h3>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                {rekapData.daftar_tunggakan.length === 0 ? (
                                    <div className="py-24 text-center text-emerald-600/60 font-semibold text-sm">
                                        Yey! Tidak ada tunggakan pembayaran warga pada periode ini.
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-emerald-50">
                                        <thead className="bg-emerald-50/10">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">Nama Warga</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">Alamat</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">Iuran</th>
                                                <th className="px-5 py-3 text-center text-xs font-semibold text-emerald-800 uppercase">Periode</th>
                                                <th className="px-5 py-3 text-right text-xs font-semibold text-emerald-800 uppercase">Nominal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-emerald-50/50">
                                            {rekapData.daftar_tunggakan.map(t => (
                                                <tr key={t.tagihan_id} className="hover:bg-rose-50/5 transition-colors">
                                                    <td className="px-5 py-3 text-sm font-semibold text-emerald-950">{t.nama_lengkap}</td>
                                                    <td className="px-5 py-3 text-xs text-emerald-600 font-medium">
                                                        Blok {t.blok_rumah || '-'}/{t.nomor_rumah || '-'} (RT {t.nomor_rt || '-'})
                                                    </td>
                                                    <td className="px-5 py-3 text-sm text-emerald-900 font-semibold">{t.nama_iuran}</td>
                                                    <td className="px-5 py-3 text-xs text-emerald-600 font-semibold text-center">{getNamaBulan(t.bulan)} {t.tahun}</td>
                                                    <td className="px-5 py-3 text-sm text-rose-600 font-bold text-right">{formatRupiah(t.nominal_tagihan)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Laporan;

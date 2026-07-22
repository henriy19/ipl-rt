import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
    Loader2, 
    AlertCircle, 
    FileText, 
    TrendingUp, 
    AlertTriangle,
    Printer,
    Coins,
    RefreshCw,
    Calendar,
    Search,
    CheckCircle,
    Download,
    Users,
    Home,
    X,
    XCircle
} from 'lucide-react';

const Laporan = () => {
    const { user } = useAuth();
    const isAuthorized = user && ['Admin', 'Petugas', 'Bendahara'].includes(user.nama_role);

    const now = new Date();
    const [filterTahun, setFilterTahun] = useState(now.getFullYear());
    const [filterBulan, setFilterBulan] = useState(''); // Default semua bulan untuk tunggakan

    // Custom Dropdown States for Filters
    const [isTahunFilterOpen, setIsTahunFilterOpen] = useState(false);
    const [isBulanFilterOpen, setIsBulanFilterOpen] = useState(false);

    const [rekapData, setRekapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Tab State
    const [activeTab, setActiveTab] = useState('keuangan'); // 'keuangan' atau 'warga'

    // Warga Report States
    const [wargaList, setWargaList] = useState([]);
    const [rtList, setRtList] = useState([]);
    const [filterRt, setFilterRt] = useState(''); // Empty means "Semua RT"
    const [isRtFilterOpen, setIsRtFilterOpen] = useState(false);
    const [rtSearchTerm, setRtSearchTerm] = useState('');
    const [wargaLoading, setWargaLoading] = useState(false);
    const [wargaError, setWargaError] = useState('');

    useEffect(() => {
        if (isAuthorized) {
            fetchReportData();
            fetchWargaData();
        }
    }, [filterTahun, filterBulan, filterRt]);

    const fetchWargaData = async () => {
        try {
            setWargaLoading(true);
            setWargaError('');
            const usersRes = await api.get('/users');
            if (usersRes.data && usersRes.data.status === 'success') {
                setWargaList(usersRes.data.data);
            }
            const rtRes = await api.get('/rt');
            if (rtRes.data && rtRes.data.status === 'success') {
                setRtList(rtRes.data.data);
            }
        } catch (err) {
            console.error('Gagal mengambil data warga/RT:', err);
            setWargaError('Gagal memuat data referensi warga');
        } finally {
            setWargaLoading(false);
        }
    };

    const handleSelectRtFilter = (rtId) => {
        setFilterRt(rtId);
        setIsRtFilterOpen(false);
        setRtSearchTerm('');
    };

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError('');
            const params = {
                tahun: filterTahun,
                bulan: filterBulan,
                rt_id: filterRt
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

    const handleSelectTahunFilter = (val) => {
        setFilterTahun(val);
        setIsTahunFilterOpen(false);
    };

    const handleSelectBulanFilter = (val) => {
        setFilterBulan(val);
        setIsBulanFilterOpen(false);
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

        // Buat baris tabel pemasukan
        const pemasukanRows = rekapData.rekap_pemasukan_bulanan.map(item => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${getNamaBulan(item.bulan)}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">
                    ${formatRupiah(item.total)}
                </td>
            </tr>
        `).join('');

        // Buat baris tabel warga
        const tunggakanRows = rekapData.daftar_tunggakan.length > 0 
            ? rekapData.daftar_tunggakan.map((t, index) => {
                const statusText = t.status === 'paid' ? 'Lunas' : t.status === 'pending' ? 'Butuh Verifikasi' : 'Tunggakan';
                const statusColor = t.status === 'paid' ? '#047857' : t.status === 'pending' ? '#b45309' : '#b91c1c';
                const statusBg = t.status === 'paid' ? '#ecfdf5' : t.status === 'pending' ? '#fffbeb' : '#fef2f2';
                return `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${t.nama_lengkap}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">Blok ${t.blok_rumah || '-'}/${t.nomor_rumah || '-'} (RT ${t.nomor_rt || '-'})</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${t.nama_iuran}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${getNamaBulan(t.bulan)} ${t.tahun}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; color: ${statusColor}; background-color: ${statusBg}; border: 1px solid ${statusColor}40;">
                                ${statusText}
                            </span>
                        </td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: ${statusColor};">
                            ${formatRupiah(t.nominal_tagihan)}
                        </td>
                    </tr>
                `;
            }).join('')
            : `<tr><td colspan="7" style="padding: 12px; border: 1px solid #ddd; text-align: center; color: #777;">Tidak ada data tagihan warga pada periode ini.</td></tr>`;

        const filename = `Laporan_Keuangan_RT_${rekapData.tahun}_${rekapData.bulan_filter === 'Semua' ? 'Tahunan' : getNamaBulan(rekapData.bulan_filter)}.pdf`;

        // Create temporary isolated iframe to block Tailwind global oklch styling leak
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '0';
        iframe.style.top = '0';
        iframe.style.width = '820px';
        iframe.style.height = '1200px';
        iframe.style.zIndex = '-9999';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <html>
                <head>
                    <title>${filename}</title>
                    <style>
                        body { font-family: Arial, sans-serif; color: #1a202c; padding: 30px; margin: 0; background: #ffffff; }
                        .header { text-align: center; border-bottom: 3px double #10b981; padding-bottom: 12px; margin-bottom: 25px; }
                        .header h1 { margin: 0; font-size: 24px; color: #065f46; text-transform: uppercase; }
                        .header p { margin: 4px 0 0 0; font-size: 13px; color: #4b5563; }
                        .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
                        .summary-cards { display: flex; gap: 15px; margin-bottom: 25px; }
                        .card { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #f8fafc; }
                        .card-title { font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; letter-spacing: 0.5px; }
                        .card-value { font-size: 18px; font-weight: bold; color: #1a202c; margin-top: 5px; }
                        .table-title { font-size: 15px; font-weight: bold; color: #065f46; border-left: 4px solid #10b981; padding-left: 8px; margin: 20px 0 10px 0; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
                        th { background-color: #f1f5f9; padding: 10px 8px; border: 1px solid #ddd; font-weight: bold; text-align: left; }
                        td { padding: 8px; border: 1px solid #ddd; }
                        .signature-section { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; }
                        .signature-box { text-align: center; width: 200px; }
                        .signature-space { height: 60px; }
                    </style>
                </head>
                <body>
                    <div id="print-content">
                        <div class="header">
                            <h1>Laporan Kas & Keuangan Wargatify</h1>
                            <p>Lingkungan RT 01-02 / RW 010 - Kelurahan Wargatify Asri</p>
                        </div>

                        <div class="meta-info">
                            <div><strong>Tanggal Laporan:</strong> ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                            <div><strong>Periode Laporan:</strong> ${rekapData.bulan_filter === 'Semua' ? 'Tahun ' + rekapData.tahun : getNamaBulan(rekapData.bulan_filter) + ' ' + rekapData.tahun}</div>
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

                        <div class="table-title">Daftar Status Pembayaran & Tagihan Warga (${rekapData.bulan_filter === 'Semua' ? 'Seluruh Bulan' : getNamaBulan(rekapData.bulan_filter)})</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 5%; text-align: center;">No</th>
                                    <th style="width: 25%;">Nama Lengkap</th>
                                    <th style="width: 20%;">Alamat Rumah</th>
                                    <th style="width: 15%;">Jenis Iuran</th>
                                    <th style="width: 12%; text-align: center;">Periode</th>
                                    <th style="width: 13%; text-align: center;">Status</th>
                                    <th style="width: 10%; text-align: right;">Nominal</th>
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
                    </div>
                </body>
            </html>
        `);
        iframeDoc.close();

        // Render PDF on loaded iframe window context
        setTimeout(() => {
            const printContent = iframeDoc.getElementById('print-content');
            html2canvas(printContent, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save(filename);
                iframe.remove();
            }).catch((err) => {
                console.error('Error generating PDF:', err);
                iframe.remove();
            });
        }, 150);
    };

    const handleDownloadWargaPDF = () => {
        if (wargaList.length === 0) return;

        const selectedRtObj = rtList.find(rt => rt.id === filterRt);
        const rtText = selectedRtObj 
            ? `RT ${selectedRtObj.nomor_rt} / RW ${selectedRtObj.nomor_rw}` 
            : 'Semua RT';

        const filteredWarga = filterRt 
            ? wargaList.filter(w => w.rt_id === filterRt) 
            : wargaList;

        const totalKK = filteredWarga.length;
        const totalJiwa = filteredWarga.reduce((sum, w) => sum + (parseInt(w.jumlah_penghuni, 10) || 1), 0);
        const totalPemilik = filteredWarga.filter(w => w.status_hunian === 'pemilik').length;
        const totalPenyewa = filteredWarga.filter(w => w.status_hunian === 'penyewa').length;

        const wargaRows = filteredWarga.map((w, index) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${w.nama_lengkap}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${w.no_hp}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">Blok ${w.blok_rumah || '-'}/${w.nomor_rumah || '-'} (RT ${w.nomor_rt || '-'})</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; text-transform: capitalize;">${w.status_hunian}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${w.jumlah_penghuni || 1} Jiwa</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                    <span style="color: ${w.is_active ? '#047857' : '#b91c1c'}; font-weight: bold;">
                        ${w.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                </td>
            </tr>
        `).join('');

        const filename = `Laporan_Data_Warga_${rtText.replace(/\s+/g, '_')}.pdf`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '0';
        iframe.style.top = '0';
        iframe.style.width = '820px';
        iframe.style.height = '1200px';
        iframe.style.zIndex = '-9999';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <html>
                <head>
                    <title>${filename}</title>
                    <style>
                        body { font-family: Arial, sans-serif; color: #1a202c; padding: 30px; margin: 0; background: #ffffff; }
                        .header { text-align: center; border-bottom: 3px double #10b981; padding-bottom: 12px; margin-bottom: 25px; }
                        .header h1 { margin: 0; font-size: 24px; color: #065f46; text-transform: uppercase; }
                        .header p { margin: 4px 0 0 0; font-size: 13px; color: #4b5563; }
                        .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
                        .summary-cards { display: flex; gap: 15px; margin-bottom: 25px; }
                        .card { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #f8fafc; }
                        .card-title { font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; letter-spacing: 0.5px; }
                        .card-value { font-size: 18px; font-weight: bold; color: #1a202c; margin-top: 5px; }
                        .table-title { font-size: 15px; font-weight: bold; color: #065f46; border-left: 4px solid #10b981; padding-left: 8px; margin: 20px 0 10px 0; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; }
                        th { background-color: #f1f5f9; padding: 10px 8px; border: 1px solid #ddd; font-weight: bold; text-align: left; }
                        td { padding: 8px; border: 1px solid #ddd; }
                        .signature-section { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; }
                        .signature-box { text-align: center; width: 200px; }
                        .signature-space { height: 60px; }
                    </style>
                </head>
                <body>
                    <div id="print-content">
                        <div class="header">
                            <h1>Laporan Data Warga Wargatify</h1>
                            <p>Lingkungan RT 01-02 / RW 010 - Kelurahan Wargatify Asri</p>
                        </div>

                        <div class="meta-info">
                            <div><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                            <div><strong>Filter Wilayah:</strong> ${rtText}</div>
                        </div>

                        <div class="summary-cards">
                            <div class="card">
                                <div class="card-title">Total Kepala Keluarga (KK)</div>
                                <div class="card-value" style="color: #047857;">${totalKK} KK</div>
                            </div>
                            <div class="card">
                                <div class="card-title">Total Populasi (Jiwa)</div>
                                <div class="card-value" style="color: #065f46;">${totalJiwa} Jiwa</div>
                            </div>
                            <div class="card">
                                <div class="card-title">Hunian (Pemilik / Penyewa)</div>
                                <div class="card-value">${totalPemilik} / ${totalPenyewa} KK</div>
                            </div>
                        </div>

                        <div class="table-title">Daftar Warga Terdaftar</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 5%; text-align: center;">No</th>
                                    <th style="width: 25%;">Nama Lengkap</th>
                                    <th style="width: 15%; text-align: center;">No. HP</th>
                                    <th style="width: 25%;">Alamat</th>
                                    <th style="width: 10%; text-align: center;">Hunian</th>
                                    <th style="width: 10%; text-align: center;">Penghuni</th>
                                    <th style="width: 10%; text-align: center;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${wargaRows}
                            </tbody>
                        </table>

                        <div class="signature-section">
                            <div class="signature-box">
                                <p>Mengetahui,</p>
                                <p style="font-weight: bold;">Ketua RW 010</p>
                                <div class="signature-space"></div>
                                <p style="text-decoration: underline; font-weight: bold;">Bapak RW 10</p>
                            </div>
                            <div class="signature-box">
                                <p>Wargatify, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p style="font-weight: bold;">Ketua RT / Pengurus</p>
                                <div class="signature-space"></div>
                                <p style="text-decoration: underline; font-weight: bold;">${user?.nama_lengkap || 'Admin Wargatify'}</p>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);
        iframeDoc.close();

        // Render PDF on loaded iframe window context without triggering print dialog
        setTimeout(() => {
            const printContent = iframeDoc.getElementById('print-content');
            html2canvas(printContent, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save(filename);
                iframe.remove();
            }).catch((err) => {
                console.error('Error generating PDF:', err);
                iframe.remove();
            });
        }, 150);
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

    const tahunOptions = [2024, 2025, 2026, 2027, 2028].map(yr => ({
        value: yr,
        label: yr.toString()
    }));

    const bulanOptions = [
        { value: '', label: 'Semua Bulan' },
        ...Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: getNamaBulan(i + 1)
        }))
    ];

    const selectedTahunObj = tahunOptions.find(opt => opt.value === parseInt(filterTahun, 10));
    const selectedBulanObj = bulanOptions.find(opt => opt.value === (filterBulan === '' ? '' : parseInt(filterBulan, 10)));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-950">
                        {activeTab === 'keuangan' ? 'Laporan Keuangan' : 'Laporan Data Warga'}
                    </h1>
                    <p className="text-sm text-emerald-600/80">
                        {activeTab === 'keuangan' 
                            ? 'Analisis rekap kas iuran warga bulanan dan daftar tunggakan aktif.' 
                            : 'Analisis populasi warga, hunian rumah, dan pembagian per rukun tetangga.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={activeTab === 'keuangan' ? fetchReportData : fetchWargaData}
                        className="p-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                        title="Segarkan data"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button 
                        onClick={activeTab === 'keuangan' ? handleDownloadPDF : handleDownloadWargaPDF}
                        disabled={activeTab === 'keuangan' ? (!rekapData || loading) : (wargaList.length === 0 || wargaLoading)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                        <Printer size={18} />
                        <span>Ekspor Laporan PDF</span>
                    </button>
                </div>
            </div>

            {/* Tab Selection */}
            <div className="flex border-b border-emerald-100/50">
                <button
                    onClick={() => setActiveTab('keuangan')}
                    className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                        activeTab === 'keuangan'
                            ? 'border-emerald-600 text-emerald-700 bg-emerald-50/10 font-bold'
                            : 'border-transparent text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-50/5'
                    }`}
                >
                    Laporan Keuangan
                </button>
                <button
                    onClick={() => setActiveTab('warga')}
                    className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                        activeTab === 'warga'
                            ? 'border-emerald-600 text-emerald-700 bg-emerald-50/10 font-bold'
                            : 'border-transparent text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-50/5'
                    }`}
                >
                    Laporan Data Warga
                </button>
            </div>

            {/* Filter Bar */}
            {activeTab === 'keuangan' ? (
                <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm flex flex-wrap items-center gap-3">
                    {/* Tahun */}
                    <div className="flex items-center gap-2 text-sm text-emerald-950 font-semibold relative">
                        <span>Tahun Pemasukan:</span>
                        <button
                            type="button"
                            onClick={() => {
                                setIsTahunFilterOpen(!isTahunFilterOpen);
                                setIsBulanFilterOpen(false);
                            }}
                            className="px-3 py-1.5 border border-emerald-100 rounded-xl bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-emerald-950 font-semibold flex items-center justify-between min-w-[85px] cursor-pointer"
                        >
                            <span>{selectedTahunObj ? selectedTahunObj.label : 'Tahun'}</span>
                            <svg className="ml-2 h-4 w-4 text-emerald-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {isTahunFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsTahunFilterOpen(false)}></div>
                                <div className="absolute z-20 mt-9 w-32 bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in left-0 sm:left-auto right-0 sm:right-auto">
                                    <div className="overflow-y-auto max-h-48 divide-y divide-emerald-50/30">
                                        {tahunOptions.map((opt) => {
                                            const isSelected = opt.value === parseInt(filterTahun, 10);
                                            return (
                                                <div
                                                    key={opt.value}
                                                    onClick={() => handleSelectTahunFilter(opt.value)}
                                                    className={`px-4 py-2 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                        isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                    }`}
                                                >
                                                    <span className="font-semibold">{opt.label}</span>
                                                    {isSelected && <CheckCircle size={12} className="text-emerald-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bulan Filter untuk Tunggakan */}
                    <div className="flex items-center gap-2 text-sm text-emerald-950 font-semibold ml-0 sm:ml-4 relative">
                        <span>Filter Bulan Tunggakan:</span>
                        <button
                            type="button"
                            onClick={() => {
                                setIsBulanFilterOpen(!isBulanFilterOpen);
                                setIsTahunFilterOpen(false);
                            }}
                            className="px-3 py-1.5 border border-emerald-100 rounded-xl bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-emerald-950 font-semibold flex items-center justify-between min-w-[130px] cursor-pointer"
                        >
                            <span>{selectedBulanObj ? selectedBulanObj.label : 'Semua Bulan'}</span>
                            <svg className="ml-2 h-4 w-4 text-emerald-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {isBulanFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsBulanFilterOpen(false)}></div>
                                <div className="absolute z-20 mt-9 w-40 bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in left-0 sm:left-auto right-0 sm:right-auto">
                                    <div className="overflow-y-auto max-h-56 divide-y divide-emerald-50/30">
                                        {bulanOptions.map((opt) => {
                                            const isSelected = opt.value === (filterBulan === '' ? '' : parseInt(filterBulan, 10));
                                            return (
                                                <div
                                                    key={opt.value}
                                                    onClick={() => handleSelectBulanFilter(opt.value)}
                                                    className={`px-4 py-2 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                        isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                    }`}
                                                >
                                                    <span className="font-semibold">{opt.label}</span>
                                                    {isSelected && <CheckCircle size={12} className="text-emerald-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Filter RT / RW */}
                    <div className="flex items-center gap-2 text-sm text-emerald-950 font-semibold ml-0 sm:ml-4 relative">
                        <span>Filter RT:</span>
                        <button
                            type="button"
                            onClick={() => {
                                setIsRtFilterOpen(!isRtFilterOpen);
                                setIsTahunFilterOpen(false);
                                setIsBulanFilterOpen(false);
                            }}
                            className="px-3 py-1.5 border border-emerald-100 rounded-xl bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-emerald-950 font-semibold flex items-center justify-between min-w-[150px] cursor-pointer"
                        >
                            <span>
                                {filterRt 
                                    ? `RT ${rtList.find(r => r.id === filterRt)?.nomor_rt || ''} / RW ${rtList.find(r => r.id === filterRt)?.nomor_rw || ''}` 
                                    : 'Semua RT'}
                            </span>
                            <svg className="ml-2 h-4 w-4 text-emerald-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {isRtFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsRtFilterOpen(false)}></div>
                                <div className="absolute z-20 mt-9 w-56 bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in left-0 sm:left-auto right-0 sm:right-auto">
                                    <div className="p-2 border-b border-emerald-50">
                                        <input
                                            type="text"
                                            placeholder="Cari RT..."
                                            value={rtSearchTerm}
                                            onChange={(e) => setRtSearchTerm(e.target.value)}
                                            className="w-full px-3 py-1.5 border border-emerald-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="overflow-y-auto max-h-48 divide-y divide-emerald-50/30">
                                        <div
                                            onClick={() => handleSelectRtFilter('')}
                                            className={`px-4 py-2 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                filterRt === '' ? 'bg-emerald-50/50 font-bold' : ''
                                            }`}
                                        >
                                            <span>Semua RT</span>
                                            {filterRt === '' && <CheckCircle size={12} className="text-emerald-600" />}
                                        </div>
                                        {rtList
                                            .filter(rt => {
                                                const q = rtSearchTerm.toLowerCase();
                                                return rt.nomor_rt.includes(q) || rt.nomor_rw.includes(q);
                                            })
                                            .map((rt) => {
                                                const isSelected = rt.id === filterRt;
                                                return (
                                                    <div
                                                        key={rt.id}
                                                        onClick={() => handleSelectRtFilter(rt.id)}
                                                        className={`px-4 py-2 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                            isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                        }`}
                                                    >
                                                        <span>RT {rt.nomor_rt} / RW {rt.nomor_rw}</span>
                                                        {isSelected && <CheckCircle size={12} className="text-emerald-600" />}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-emerald-950 font-semibold relative">
                        <span>Pilih Rukun Tetangga (RT):</span>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsRtFilterOpen(!isRtFilterOpen)}
                                className="px-3 py-1.5 border border-emerald-100 rounded-xl bg-white shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-emerald-950 font-semibold flex items-center justify-between min-w-[150px] cursor-pointer"
                            >
                                <span>
                                    {filterRt 
                                        ? `RT ${rtList.find(r => r.id === filterRt)?.nomor_rt || ''} / RW ${rtList.find(r => r.id === filterRt)?.nomor_rw || ''}` 
                                        : 'Semua RT'}
                                </span>
                                <svg className="ml-2 h-4 w-4 text-emerald-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {isRtFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsRtFilterOpen(false)}></div>
                                    <div className="absolute z-20 mt-2 w-56 bg-white border border-emerald-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in left-0">
                                        <div className="p-2 border-b border-emerald-50">
                                            <input
                                                type="text"
                                                placeholder="Cari RT..."
                                                value={rtSearchTerm}
                                                onChange={(e) => setRtSearchTerm(e.target.value)}
                                                className="w-full px-3 py-1.5 border border-emerald-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div className="overflow-y-auto max-h-48 divide-y divide-emerald-50/30">
                                            <div
                                                onClick={() => handleSelectRtFilter('')}
                                                className={`px-4 py-2 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                    filterRt === '' ? 'bg-emerald-50/50 font-bold' : ''
                                                }`}
                                            >
                                                <span>Semua RT</span>
                                                {filterRt === '' && <CheckCircle size={12} className="text-emerald-600" />}
                                            </div>
                                            {rtList
                                                .filter(rt => {
                                                    const q = rtSearchTerm.toLowerCase();
                                                    return rt.nomor_rt.includes(q) || rt.nomor_rw.includes(q);
                                                })
                                                .map((rt) => {
                                                    const isSelected = rt.id === filterRt;
                                                    return (
                                                        <div
                                                            key={rt.id}
                                                            onClick={() => handleSelectRtFilter(rt.id)}
                                                            className={`px-4 py-2 text-xs text-emerald-950 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors ${
                                                                isSelected ? 'bg-emerald-50/50 font-bold' : ''
                                                            }`}
                                                        >
                                                            <span>RT {rt.nomor_rt} / RW {rt.nomor_rw}</span>
                                                            {isSelected && <CheckCircle size={12} className="text-emerald-600" />}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'keuangan' ? (
                loading ? (
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
                        {(() => {
                            const filteredDaftarTunggakan = (rekapData?.daftar_tunggakan || []).filter(item => {
                                if (!filterRt) return true;
                                return item.rt_id === filterRt;
                            });

                            const calculatedTotalTunggakan = filteredDaftarTunggakan
                                .filter(item => item.status !== 'paid')
                                .reduce((sum, item) => sum + parseFloat(item.nominal_tagihan || 0), 0);

                            return (
                                <>
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
                                                <p className="text-3xl font-bold text-rose-600">{formatRupiah(calculatedTotalTunggakan)}</p>
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
                                                    <FileText size={16} className="text-emerald-600" />
                                                    <span>Status Pembayaran & Tagihan Warga ({filterBulan === '' ? 'Seluruh Bulan' : getNamaBulan(parseInt(filterBulan, 10))})</span>
                                                </h3>
                                            </div>
                                            <div className="overflow-x-auto flex-1">
                                                {filteredDaftarTunggakan.length === 0 ? (
                                                    <div className="py-24 text-center text-emerald-600/60 font-semibold text-sm">
                                                        Tidak ada data tagihan warga pada periode ini.
                                                    </div>
                                                ) : (
                                                    <table className="min-w-full divide-y divide-emerald-50">
                                                        <thead className="bg-emerald-50/10">
                                                            <tr>
                                                                <th className="px-5 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">Nama Warga</th>
                                                                <th className="px-5 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">Alamat</th>
                                                                <th className="px-5 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">Iuran</th>
                                                                <th className="px-5 py-3 text-center text-xs font-semibold text-emerald-800 uppercase">Periode</th>
                                                                <th className="px-5 py-3 text-center text-xs font-semibold text-emerald-800 uppercase">Status</th>
                                                                <th className="px-5 py-3 text-right text-xs font-semibold text-emerald-800 uppercase">Nominal</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-emerald-50/50">
                                                            {filteredDaftarTunggakan.map(t => (
                                                                <tr key={t.tagihan_id} className="hover:bg-emerald-50/5 transition-colors">
                                                                    <td className="px-5 py-3 text-sm font-semibold text-emerald-950">{t.nama_lengkap}</td>
                                                                    <td className="px-5 py-3 text-xs text-emerald-600 font-medium">
                                                                        Blok {t.blok_rumah || '-'}/{t.nomor_rumah || '-'} (RT {t.nomor_rt || '-'})
                                                                    </td>
                                                        <td className="px-5 py-3 text-sm text-emerald-900 font-semibold">{t.nama_iuran}</td>
                                                        <td className="px-5 py-3 text-xs text-emerald-600 font-semibold text-center">{getNamaBulan(t.bulan)} {t.tahun}</td>
                                                        <td className="px-5 py-3 text-center whitespace-nowrap">
                                                            {t.status === 'paid' ? (
                                                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                                    Lunas
                                                                </span>
                                                            ) : t.status === 'pending' ? (
                                                                <span className="inline-flex items-center text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                                    Pending Verif
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                                                    Tunggakan
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className={`px-5 py-3 text-sm font-bold text-right ${
                                                            t.status === 'paid' ? 'text-emerald-700' : t.status === 'pending' ? 'text-amber-600' : 'text-rose-600'
                                                        }`}>{formatRupiah(t.nominal_tagihan)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    </div>
                                </div>
                            </div>
                        </>
                    );
                })()}
            </div>
                )
            ) : (
                wargaLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center text-emerald-600 bg-white rounded-2xl border border-emerald-50 shadow-sm">
                        <Loader2 className="animate-spin mb-2" size={36} />
                        <p className="text-sm font-medium">Menyusun laporan data warga...</p>
                    </div>
                ) : wargaError ? (
                    <div className="py-20 flex flex-col items-center justify-center text-red-500 px-4 text-center bg-white rounded-2xl border border-emerald-50 shadow-sm">
                        <AlertCircle className="mb-2" size={40} />
                        <p className="font-semibold">{wargaError}</p>
                        <button 
                            onClick={fetchWargaData}
                            className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : (() => {
                    const filteredWarga = filterRt 
                        ? wargaList.filter(w => w.rt_id === filterRt) 
                        : wargaList;
                    
                    const totalKK = filteredWarga.length;
                    const totalJiwa = filteredWarga.reduce((sum, w) => sum + (parseInt(w.jumlah_penghuni, 10) || 1), 0);
                    const totalPemilik = filteredWarga.filter(w => w.status_hunian === 'pemilik').length;
                    const totalPenyewa = filteredWarga.filter(w => w.status_hunian === 'penyewa').length;

                    return (
                        <div className="space-y-6 animate-fade-in">
                            {/* Warga Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Kepala Keluarga (KK)</p>
                                        <p className="text-3xl font-bold text-emerald-950">{totalKK} KK</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50/70 text-emerald-700 flex items-center justify-center shadow-inner">
                                        <Users size={28} />
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Populasi (Jiwa)</p>
                                        <p className="text-3xl font-bold text-emerald-950">{totalJiwa} Jiwa</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-inner">
                                        <Users size={28} className="stroke-teal-600" />
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Hunian (Pemilik / Kontrak)</p>
                                        <p className="text-3xl font-bold text-emerald-950">{totalPemilik} / {totalPenyewa} KK</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50/40 text-emerald-600 flex items-center justify-center shadow-inner">
                                        <Home size={28} />
                                    </div>
                                </div>
                            </div>

                            {/* Warga Table */}
                            <div className="bg-white rounded-2xl border border-emerald-50 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-emerald-50 bg-emerald-50/20">
                                    <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                                        <Users size={16} className="text-emerald-700" />
                                        <span>Daftar Warga Terdaftar ({filterRt ? `RT ${rtList.find(r => r.id === filterRt)?.nomor_rt || ''}` : 'Semua RT'})</span>
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    {filteredWarga.length === 0 ? (
                                        <div className="py-24 text-center text-emerald-600/60 font-semibold text-sm">
                                            Tidak ada data warga terdaftar.
                                        </div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-emerald-50">
                                            <thead className="bg-emerald-50/10">
                                                <tr>
                                                    <th className="px-5 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">Nama Lengkap</th>
                                                    <th className="px-5 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">No. Handphone</th>
                                                    <th className="px-5 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">Alamat</th>
                                                    <th className="px-5 py-3 text-center text-xs font-semibold text-emerald-800 uppercase">Hunian</th>
                                                    <th className="px-5 py-3 text-center text-xs font-semibold text-emerald-800 uppercase">Penghuni</th>
                                                    <th className="px-5 py-3 text-center text-xs font-semibold text-emerald-800 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-emerald-50/50 bg-white">
                                                {filteredWarga.map(w => (
                                                    <tr key={w.id} className="hover:bg-emerald-50/5 transition-colors">
                                                        <td className="px-5 py-3 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
                                                                    {w.nama_lengkap.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="ml-2.5">
                                                                    <div className="text-sm font-semibold text-emerald-950">{w.nama_lengkap}</div>
                                                                    <div className="text-[10px] text-emerald-500 font-medium capitalize">{w.nama_role}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-sm text-emerald-900 font-medium">{w.no_hp}</td>
                                                        <td className="px-5 py-3 text-sm text-emerald-600 font-medium">
                                                            {w.blok_rumah && w.nomor_rumah ? `Blok ${w.blok_rumah} No. ${w.nomor_rumah}` : '-'}
                                                            {w.nomor_rt && <span className="text-xs text-emerald-400 font-medium"> (RT {w.nomor_rt})</span>}
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                                                                w.status_hunian === 'pemilik' 
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                                    : 'bg-teal-50 text-teal-700 border-teal-100'
                                                            }`}>
                                                                {w.status_hunian}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-sm font-bold text-center text-emerald-950">{w.jumlah_penghuni || 1} Jiwa</td>
                                                        <td className="px-5 py-3 text-center whitespace-nowrap">
                                                            {w.is_active ? (
                                                                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                                                                    <CheckCircle size={12} />
                                                                    <span>Aktif</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-500">
                                                                    <XCircle size={12} />
                                                                    <span>Nonaktif</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
};

export default Laporan;

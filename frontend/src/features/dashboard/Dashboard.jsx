import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  Megaphone, 
  Calendar, 
  Eye, 
  X, 
  Play, 
  Video 
} from 'lucide-react';

const Dashboard = () => {
  // Stats & Event States
  const [stats, setStats] = useState([
    { title: 'Total Warga', value: '145', icon: <Users size={24} className="text-emerald-500" />, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
    { title: 'Total Pemasukan Bulan Ini', value: 'Rp 4.500.000', icon: <Wallet size={24} className="text-teal-500" />, bgColor: 'bg-teal-50', textColor: 'text-teal-700' },
    { title: 'Total Tunggakan', value: 'Rp 1.250.000', icon: <AlertCircle size={24} className="text-orange-500" />, bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  ]);
  const [latestEvents, setLatestEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLatestEvents();
  }, []);

  const fetchLatestEvents = async () => {
    try {
      setEventsLoading(true);
      const res = await api.get('/informasi/latest');
      if (res.data && res.data.status === 'success') {
        setLatestEvents(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat kegiatan terbaru di dashboard:', err);
    } finally {
      setEventsLoading(false);
    }
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

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${baseUrl}${url}`;
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

  const handleOpenDetail = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">Dashboard</h1>
        <p className="text-emerald-600/80 text-sm mt-1.5">Selamat datang kembali! Berikut ringkasan Wargatify Anda.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-3xl p-6 flex items-center space-x-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(16,185,129,0.06)] shadow-[0_4px_20px_rgb(16,185,129,0.03)] border border-emerald-50/50">
            <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">{stat.title}</p>
              <h3 className={`text-2xl font-bold mt-1 tracking-tight ${stat.textColor}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Transaksi & Informasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Left Column: Transaksi Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_4px_20px_rgb(16,185,129,0.03)] border border-emerald-50/50 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-emerald-950 tracking-tight">Transaksi Terbaru</h2>
              <button className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors cursor-pointer">Lihat Semua</button>
            </div>
            <div className="text-center py-16 text-emerald-300 bg-[#F4F9F7] rounded-2xl border border-dashed border-emerald-200">
              <TrendingUp size={48} className="mx-auto mb-4 text-emerald-200" />
              <p className="font-semibold text-emerald-600">Belum ada transaksi bulan ini.</p>
              <p className="text-sm mt-1 text-emerald-500/70">Pembayaran IPL warga akan muncul di sini.</p>
            </div>
          </div>
        </div>

        {/* Right Column: 5 Informasi Kegiatan Terkini */}
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(16,185,129,0.03)] border border-emerald-50/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-emerald-950 tracking-tight flex items-center gap-2">
              <Megaphone size={20} className="text-emerald-600" />
              Kegiatan RT-RW Terkini
            </h2>
            <a href="/informasi" className="text-xs text-emerald-700 hover:underline font-semibold">Lihat Semua</a>
          </div>

          {eventsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-emerald-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mb-2"></div>
              <p className="text-xs">Memuat kegiatan...</p>
            </div>
          ) : latestEvents.length === 0 ? (
            <div className="text-center py-12 bg-emerald-50/10 rounded-2xl border border-dashed border-emerald-100">
              <Megaphone size={32} className="mx-auto mb-2 text-emerald-200" />
              <p className="text-xs font-semibold text-emerald-600">Belum ada pengumuman</p>
            </div>
          ) : (
            <div className="space-y-4">
              {latestEvents.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => handleOpenDetail(event)}
                  className="group flex gap-3 p-3 rounded-2xl border border-emerald-50/50 hover:bg-emerald-50/30 hover:border-emerald-100 transition-all cursor-pointer"
                >
                  {/* Event Mini Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-emerald-50 flex items-center justify-center text-emerald-300">
                    {event.foto_url ? (
                      <img 
                        src={getMediaUrl(event.foto_url)} 
                        alt={event.judul} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                    ) : (
                      <Megaphone size={20} />
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getKategoriBadgeColor(event.kategori)}`}>
                      {event.kategori}
                    </span>
                    <h3 className="font-bold text-emerald-950 text-xs truncate group-hover:text-emerald-700 transition-colors">
                      {event.judul}
                    </h3>
                    <div className="flex items-center text-[10px] text-emerald-600 font-semibold gap-1">
                      <Calendar size={10} />
                      <span>{new Date(event.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* DETAIL EVENT MODAL */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-emerald-50 max-w-2xl w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize shadow-sm ${getKategoriBadgeColor(selectedEvent.kategori)}`}>
                {selectedEvent.kategori}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1 rounded-lg hover:bg-emerald-100">
                <X size={20} />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center text-xs text-emerald-600 font-semibold gap-1.5">
                  <Calendar size={14} />
                  <span>{formatDate(selectedEvent.tanggal)}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-emerald-950 leading-tight">
                  {selectedEvent.judul}
                </h2>
              </div>

              {/* Image */}
              {selectedEvent.foto_url && (
                <div className="rounded-2xl overflow-hidden shadow border border-emerald-50 bg-emerald-50/20 max-h-80 flex items-center justify-center">
                  <img 
                    src={getMediaUrl(selectedEvent.foto_url)} 
                    alt={selectedEvent.judul} 
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
                  {selectedEvent.narasi}
                </p>
              </div>

              {/* Video Embed */}
              {selectedEvent.video_url && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                    <Video size={14} />
                    Video Terkait
                  </label>
                  {getEmbedVideoUrl(selectedEvent.video_url) && getEmbedVideoUrl(selectedEvent.video_url).includes('youtube.com/embed') ? (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-emerald-100 bg-black">
                      <iframe
                        src={getEmbedVideoUrl(selectedEvent.video_url)}
                        title={selectedEvent.judul}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  ) : (
                    <video src={getMediaUrl(selectedEvent.video_url)} controls className="w-full rounded-2xl max-h-80 bg-black shadow-md border border-emerald-100" />
                  )}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm"
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

export default Dashboard;

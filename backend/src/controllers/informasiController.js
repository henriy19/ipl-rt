const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Informasi = require('../models/informasiModel');

// Helper to save Base64 file to uploads directory
const saveBase64File = (base64String, prefix = 'file') => {
    if (!base64String) return null;
    
    // If it's already a URL/path, return as is
    if (!base64String.startsWith('data:')) {
        return base64String;
    }
    
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return base64String;
    }
    
    const fileType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Get extension
    let extension = 'bin';
    if (fileType.includes('image/png')) extension = 'png';
    else if (fileType.includes('image/jpeg') || fileType.includes('image/jpg')) extension = 'jpg';
    else if (fileType.includes('image/gif')) extension = 'gif';
    else if (fileType.includes('image/webp')) extension = 'webp';
    else if (fileType.includes('video/mp4')) extension = 'mp4';
    else if (fileType.includes('video/webm')) extension = 'webm';
    else if (fileType.includes('video/ogg')) extension = 'ogg';
    
    const filename = `${prefix}_${crypto.randomUUID()}.${extension}`;
    const folderPath = path.join(__dirname, '../../public/uploads');
    const fullPath = path.join(folderPath, filename);
    
    // Ensure directory exists
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, buffer);
    
    return `/uploads/${filename}`;
};

const GetAllInformasi = async (req, res, next) => {
    try {
        const info = await Informasi.getAll();
        return res.success('Berhasil mengambil semua data informasi kegiatan', info);
    } catch (error) {
        next(error);
    }
};

const GetLatestInformasi = async (req, res, next) => {
    try {
        const info = await Informasi.getLatest();
        return res.success('Berhasil mengambil 5 data informasi kegiatan terakhir', info);
    } catch (error) {
        next(error);
    }
};

const GetInformasiById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const info = await Informasi.getById(id);
        if (!info) {
            return res.error('Detail informasi kegiatan tidak ditemukan', 404);
        }
        return res.success('Berhasil mengambil detail informasi kegiatan', info);
    } catch (error) {
        next(error);
    }
};

const CreateInformasi = async (req, res, next) => {
    try {
        const { judul, narasi, tanggal, kategori, foto_url, video_url } = req.body;

        // Validasi field wajib
        if (!judul || !narasi || !tanggal) {
            return res.error('Judul, narasi, dan tanggal wajib diisi', 400);
        }

        // Process Base64 uploads if present
        const savedFotoUrl = saveBase64File(foto_url, 'foto');
        const savedVideoUrl = saveBase64File(video_url, 'video');

        const id = crypto.randomUUID();
        const infoData = {
            id,
            judul,
            narasi,
            tanggal,
            kategori: kategori || 'Kegiatan',
            foto_url: savedFotoUrl,
            video_url: savedVideoUrl
        };

        await Informasi.create(infoData);

        const createdInfo = await Informasi.getById(id);
        return res.success('Informasi kegiatan berhasil ditambahkan', createdInfo, 201);
    } catch (error) {
        next(error);
    }
};

const UpdateInformasi = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { judul, narasi, tanggal, kategori, foto_url, video_url } = req.body;

        const existingInfo = await Informasi.getById(id);
        if (!existingInfo) {
            return res.error('Informasi kegiatan tidak ditemukan', 404);
        }

        // Validasi field wajib
        if (!judul || !narasi || !tanggal) {
            return res.error('Judul, narasi, dan tanggal wajib diisi', 400);
        }

        // Process Base64 uploads if present
        const savedFotoUrl = saveBase64File(foto_url, 'foto');
        const savedVideoUrl = saveBase64File(video_url, 'video');

        const infoData = {
            judul,
            narasi,
            tanggal,
            kategori: kategori || 'Kegiatan',
            foto_url: savedFotoUrl,
            video_url: savedVideoUrl
        };

        await Informasi.update(id, infoData);

        const updatedInfo = await Informasi.getById(id);
        return res.success('Informasi kegiatan berhasil diperbarui', updatedInfo);
    } catch (error) {
        next(error);
    }
};

const DeleteInformasi = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingInfo = await Informasi.getById(id);
        if (!existingInfo) {
            return res.error('Informasi kegiatan tidak ditemukan', 404);
        }

        await Informasi.delete(id);
        return res.success('Informasi kegiatan berhasil dihapus');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetAllInformasi,
    GetLatestInformasi,
    GetInformasiById,
    CreateInformasi,
    UpdateInformasi,
    DeleteInformasi
};

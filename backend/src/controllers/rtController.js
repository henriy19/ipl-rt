const RT = require('../models/rtModel');

const GetAllRT = async (req, res, next) => {
    try {
        const rtList = await RT.getAll();
        return res.success('Berhasil mengambil data wilayah RT/RW', rtList);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GetAllRT
};

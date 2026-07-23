const pool = require('../config/db');
const crypto = require('crypto');

const parseValidDate = (dateStr) => {
    if (!dateStr) return null;
    let str = String(dateStr).trim();
    if (!str) return null;

    // Handle YYYY-MM-DD format with potential year length > 4
    const matchParts = str.split('-');
    if (matchParts.length === 3) {
        let [year, month, day] = matchParts;
        if (year.length > 4) {
            year = year.slice(0, 4);
        }
        month = month.padStart(2, '0');
        day = day.padStart(2, '0');
        const numYear = parseInt(year, 10);
        const numMonth = parseInt(month, 10);
        const numDay = parseInt(day, 10);
        if (numYear > 1900 && numYear < 2100 && numMonth >= 1 && numMonth <= 12 && numDay >= 1 && numDay <= 31) {
            return `${year}-${month}-${day}`;
        }
    }

    // Try standard JS Date parsing
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        if (yyyy > 1900 && yyyy < 2100) {
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }
    }
    return null;
};

const Penghuni = {
    // Get all occupants for a user by phone number
    async getByPhone(no_hp) {
        if (!no_hp) return [];
        const query = `
            SELECT id, no_hp, COALESCE(no_hp_penghuni, no_hp) AS no_hp_penghuni, nama_lengkap, TO_CHAR(tanggal_lahir, 'YYYY-MM-DD') AS tanggal_lahir, created_at, updated_at 
            FROM users_penghuni 
            WHERE no_hp = $1 
            ORDER BY created_at ASC
        `;
        const { rows } = await pool.query(query, [no_hp]);
        return rows;
    },

    // Get occupants for multiple phone numbers in bulk
    async getByPhonesBulk(phoneList) {
        if (!phoneList || phoneList.length === 0) return {};
        const query = `
            SELECT id, no_hp, COALESCE(no_hp_penghuni, no_hp) AS no_hp_penghuni, nama_lengkap, TO_CHAR(tanggal_lahir, 'YYYY-MM-DD') AS tanggal_lahir 
            FROM users_penghuni 
            WHERE no_hp = ANY($1)
            ORDER BY created_at ASC
        `;
        const { rows } = await pool.query(query, [phoneList]);
        const map = {};
        rows.forEach(r => {
            if (!map[r.no_hp]) map[r.no_hp] = [];
            map[r.no_hp].push(r);
        });
        return map;
    },

    // Sync main user entry and additional occupants for a given no_hp
    async syncPenghuni(no_hp, mainUserObj, additionalPenghuniList = [], client = null) {
        const executor = client || pool;
        
        // Remove old records for this no_hp
        await executor.query('DELETE FROM users_penghuni WHERE no_hp = $1', [no_hp]);

        let insertedCount = 0;

        // 1. Insert Main User as first occupant
        const mainId = crypto.randomUUID();
        const mainQuery = `
            INSERT INTO users_penghuni (id, no_hp, no_hp_penghuni, nama_lengkap, tanggal_lahir)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await executor.query(mainQuery, [
            mainId,
            no_hp,
            mainUserObj.no_hp || no_hp,
            mainUserObj.nama_lengkap,
            parseValidDate(mainUserObj.tanggal_lahir)
        ]);
        insertedCount++;

        // 2. Insert Additional Occupants
        if (Array.isArray(additionalPenghuniList)) {
            for (const p of additionalPenghuniList) {
                if (p && p.nama_lengkap && p.nama_lengkap.trim() !== '') {
                    // Prevent duplicate if main user name was somehow passed again
                    if (p.nama_lengkap.trim().toLowerCase() === mainUserObj.nama_lengkap.trim().toLowerCase()) {
                        continue;
                    }
                    const pId = crypto.randomUUID();
                    const pNoHp = p.no_hp_penghuni || p.no_hp || null;
                    await executor.query(mainQuery, [
                        pId,
                        no_hp,
                        pNoHp ? pNoHp.trim() : null,
                        p.nama_lengkap.trim(),
                        parseValidDate(p.tanggal_lahir)
                    ]);
                    insertedCount++;
                }
            }
        }

        // 3. Update jumlah_penghuni count in users table
        await executor.query(
            'UPDATE users SET jumlah_penghuni = $1 WHERE no_hp = $2',
            [insertedCount, no_hp]
        );

        return insertedCount;
    }
};

module.exports = Penghuni;

const API_URL = "https://script.google.com/macros/s/AKfycbxuubD1deSNlHoecTzOMAqYyzrdNrnnAQ0-VPVvxM0HEKfYUceQTt4lySczmlKxo9SH/exec";

/* =========================================================
   CACHE
========================================================= */

const WO_CACHE_KEY = "WO_CACHE_DATA";
const WO_CACHE_TIME = "WO_CACHE_TIME";


/* =========================================================
   GET CACHE
========================================================= */

function getCacheWO() {

    try {

        const raw =
            localStorage.getItem(
                WO_CACHE_KEY
            );

        if (!raw) {
            return [];
        }

        const data =
            JSON.parse(raw);

        if (!Array.isArray(data)) {
            return [];
        }

        return data;

    } catch (err) {

        console.error(
            "CACHE READ ERROR:",
            err
        );

        return [];
    }
}


/* =========================================================
   SAVE CACHE
========================================================= */

function saveCacheWO(data) {

    try {

        localStorage.setItem(
            WO_CACHE_KEY,
            JSON.stringify(data)
        );

        localStorage.setItem(
            WO_CACHE_TIME,
            String(Date.now())
        );

    } catch (err) {

        console.error(
            "CACHE SAVE ERROR:",
            err
        );
    }
}


/* =========================================================
   CLEAR CACHE
========================================================= */

function clearCacheWO() {

    localStorage.removeItem(
        WO_CACHE_KEY
    );

    localStorage.removeItem(
        WO_CACHE_TIME
    );
}


/* =========================================================
   GET DATA SERVER
========================================================= */

async function getWOFromServer() {

    try {

        const res =
            await fetch(
                `${API_URL}?action=get&_=${Date.now()}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!res.ok) {
            throw new Error(
                `HTTP ${res.status}`
            );
        }

        const data =
            await res.json();


        /*
         * PENTING:
         * Tidak ada filter status.
         *
         * Semua data dikembalikan:
         * Close
         * Pending
         * Progress
         * Open
         * dll.
         */

        let result = [];

        if (Array.isArray(data)) {

            result = data;

        } else if (
            Array.isArray(data?.data)
        ) {

            result = data.data;
        }


        /*
         * Simpan SEMUA data
         */

        saveCacheWO(result);


        console.log(
            "SERVER DATA:",
            result.length
        );


        /*
         * Beritahu halaman
         * bahwa server sudah selesai
         */

        window.dispatchEvent(
            new CustomEvent(
                "WO_SERVER_UPDATED",
                {
                    detail: result
                }
            )
        );


        return result;

    } catch (err) {

        console.error(
            "GET SERVER ERROR:",
            err
        );

        return null;
    }
}


/* =========================================================
   GET WO
   CACHE FIRST
========================================================= */

async function getWO() {

    /*
     * Coba ambil cache
     */

    const cached =
        getCacheWO();


    /*
     * Kalau cache tersedia:
     * langsung return.
     */

    if (cached.length > 0) {

        console.log(
            "LOAD FROM CACHE:",
            cached.length
        );


        /*
         * Refresh server di belakang layar
         */

        getWOFromServer();


        return cached;
    }


    /*
     * Cache kosong:
     * ambil server.
     */

    console.log(
        "CACHE EMPTY → LOAD SERVER"
    );


    const serverData =
        await getWOFromServer();


    return serverData || [];
}


/* =========================================================
   BASE CALL
========================================================= */

async function callAPI(params) {

    try {

        let url =
            `${API_URL}?action=${params.action}`;


        /*
         * DATA
         */

        if (params.data) {

            url +=
                `&data=${encodeURIComponent(
                    JSON.stringify(params.data)
                )}`;
        }


        /*
         * KEY
         */

        if (params.praInvoiceNumber) {

            url +=
                `&praInvoiceNumber=${encodeURIComponent(
                    params.praInvoiceNumber
                )}`;
        }


        /*
         * Hindari browser cache
         */

        url +=
            `&_=${Date.now()}`;


        const res =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!res.ok) {

            throw new Error(
                `HTTP ${res.status}`
            );
        }


        const result =
            await res.json();


        console.log(
            "API RESPONSE:",
            result
        );


        return result;

    } catch (err) {

        console.error(
            "API ERROR:",
            err
        );

        return {

            status: false,

            message:
                err.message ||
                "network error"
        };
    }
}


/* =========================================================
   ADD
========================================================= */

async function addWO(data) {

    const result =
        await callAPI({

            action: "add",

            data: data
        });


    /*
     * Kalau berhasil,
     * langsung update cache.
     */

    if (
        result &&
        result.status === true
    ) {

        const cache =
            getCacheWO();


        /*
         * Data yang ditambahkan
         */

        const newData =
            result.data || data;


        /*
         * Cek apakah sudah ada
         */

        const exists =
            cache.some(item =>

                String(
                    item.praInvoiceNumber
                ).trim()
                ===
                String(
                    newData.praInvoiceNumber
                ).trim()
            );


        if (!exists) {

            cache.push(
                newData
            );

            saveCacheWO(
                cache
            );
        }


        /*
         * Update UI
         */

        window.dispatchEvent(
            new CustomEvent(
                "WO_CHANGED",
                {
                    detail: {
                        type: "add",
                        data: newData
                    }
                }
            )
        );
    }


    return result;
}


/* =========================================================
   UPDATE
========================================================= */

async function updateWO(data) {

    const result =
        await callAPI({

            action: "update",

            data: data
        });


    /*
     * Kalau berhasil,
     * update hanya 1 item
     * di cache.
     */

    if (
        result &&
        result.status === true
    ) {

        const cache =
            getCacheWO();


        const updatedData =
            result.data || data;


        const target =
            String(
                updatedData.praInvoiceNumber
            ).trim();


        const index =
            cache.findIndex(item =>

                String(
                    item.praInvoiceNumber
                ).trim()
                === target
            );


        if (index !== -1) {

            cache[index] = {
                ...cache[index],
                ...updatedData
            };

        } else {

            cache.push(
                updatedData
            );
        }


        saveCacheWO(
            cache
        );


        /*
         * Update UI
         */

        window.dispatchEvent(
            new CustomEvent(
                "WO_CHANGED",
                {
                    detail: {
                        type: "update",
                        data: updatedData
                    }
                }
            )
        );
    }


    return result;
}


/* =========================================================
   DELETE
========================================================= */

async function deleteWO(
    praInvoiceNumber
) {

    const result =
        await callAPI({

            action: "delete",

            praInvoiceNumber:
                praInvoiceNumber
        });


    /*
     * Kalau berhasil,
     * hapus dari cache.
     */

    if (
        result &&
        result.status === true
    ) {

        let cache =
            getCacheWO();


        const target =
            String(
                praInvoiceNumber
            ).trim();


        cache =
            cache.filter(item =>

                String(
                    item.praInvoiceNumber
                ).trim()
                !== target
            );


        saveCacheWO(
            cache
        );


        /*
         * Update UI
         */

        window.dispatchEvent(
            new CustomEvent(
                "WO_CHANGED",
                {
                    detail: {
                        type: "delete",
                        praInvoiceNumber:
                            praInvoiceNumber
                    }
                }
            )
        );
    }


    return result;
}


/* =========================================================
   RESET CACHE
   PAKAI SEKALI SAJA JIKA PERLU
========================================================= */

function resetWOCache() {

    clearCacheWO();

    console.log(
        "WO CACHE SUDAH DIHAPUS"
    );
}

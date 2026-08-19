const API_URL = "https://script.google.com/macros/s/AKfycbxuubD1deSNlHoecTzOMAqYyzrdNrnnAQ0-VPVvxM0HEKfYUceQTt4lySczmlKxo9SH/exec";


/* =========================================================
   CONFIG
========================================================= */

const API_LIMIT = 100;

const API_TIMEOUT = 15000;

// Cache browser 10 detik
const CLIENT_CACHE_TIME = 10000;


/* =========================================================
   CLIENT CACHE
========================================================= */

const woPageCache = new Map();


/* =========================================================
   CACHE KEY
========================================================= */

function getClientCacheKey(page, limit) {

    return `${page}_${limit}`;

}


/* =========================================================
   CLEAR CLIENT CACHE
========================================================= */

function clearWOClientCache() {

    woPageCache.clear();

}


/* =========================================================
   TIMEOUT FETCH
========================================================= */

async function fetchWithTimeout(
    url,
    options = {},
    timeout = API_TIMEOUT
) {

    const controller =
        new AbortController();

    const timer =
        setTimeout(
            () => controller.abort(),
            timeout
        );


    try {

        const response =
            await fetch(
                url,
                {
                    ...options,
                    signal:
                        controller.signal
                }
            );

        return response;

    } finally {

        clearTimeout(timer);

    }

}


/* =========================================================
   API JSON PARSER
========================================================= */

async function parseAPIResponse(res) {

    const text =
        await res.text();


    /* =========================
       HTTP ERROR
    ========================= */

    if (!res.ok) {

        console.error(
            "API HTTP ERROR:",
            res.status,
            res.statusText,
            text.substring(0, 500)
        );


        throw new Error(
            `HTTP ${res.status} - ${res.statusText}`
        );

    }


    /* =========================
       EMPTY RESPONSE
    ========================= */

    if (!text) {

        throw new Error(
            "Server mengembalikan response kosong"
        );

    }


    /* =========================
       JSON
    ========================= */

    try {

        return JSON.parse(text);

    } catch (err) {

        console.error(
            "API NOT JSON:",
            text.substring(0, 500)
        );


        throw new Error(
            "Server tidak mengembalikan JSON"
        );

    }

}


/* =========================================================
   GET DATA
   PAGINATION
========================================================= */

async function getWO(
    page = 1,
    limit = API_LIMIT,
    forceReload = false
) {

    page =
        Math.max(
            Number(page) || 1,
            1
        );


    limit =
        Math.min(
            Math.max(
                Number(limit) || API_LIMIT,
                1
            ),
            500
        );


    const cacheKey =
        getClientCacheKey(
            page,
            limit
        );


    /* =========================
       CLIENT CACHE
    ========================= */

    if (!forceReload) {

        const cached =
            woPageCache.get(
                cacheKey
            );


        if (cached) {

            const age =
                Date.now() -
                cached.time;


            if (
                age <
                CLIENT_CACHE_TIME
            ) {

                return cached.data;

            }

        }

    }


    /* =========================
       URL
    ========================= */

    const url =
        `${API_URL}` +
        `?action=get` +
        `&page=${page}` +
        `&limit=${limit}`;


    console.log(
        "GET API:",
        url
    );


    try {

        const res =
            await fetchWithTimeout(
                url,
                {
                    method: "GET",

                    cache: "no-store"
                }
            );


        const result =
            await parseAPIResponse(
                res
            );


        /* =========================
           FORMAT BARU
        ========================= */

        if (
            result &&
            result.status === true &&
            Array.isArray(
                result.data
            )
        ) {

            woPageCache.set(
                cacheKey,
                {
                    time: Date.now(),
                    data: result
                }
            );


            return result;

        }


        /* =========================
           FORMAT ARRAY LAMA
        ========================= */

        if (
            Array.isArray(result)
        ) {

            const converted = {

                status: true,

                data: result,

                total:
                    result.length,

                page: page,

                limit: limit,

                totalPages: 1

            };


            woPageCache.set(
                cacheKey,
                {
                    time: Date.now(),
                    data: converted
                }
            );


            return converted;

        }


        /* =========================
           DATA TIDAK VALID
        ========================= */

        return {

            status: false,

            data: [],

            total: 0,

            page: page,

            limit: limit,

            totalPages: 0,

            message:
                result?.message ||
                "Response API tidak valid"

        };


    } catch (err) {

        console.error(
            "GET ERROR:",
            err
        );


        return {

            status: false,

            data: [],

            total: 0,

            page: page,

            limit: limit,

            totalPages: 0,

            message:
                err.name ===
                "AbortError"

                    ? "Request timeout"

                    : (
                        err.message ||
                        "network error"
                    )

        };

    }

}


/* =========================================================
   GET ALL DATA
   HANYA UNTUK EXPORT / KEBUTUHAN KHUSUS
========================================================= */

async function getAllWO() {

    try {

        let page = 1;

        const limit = 500;

        let allData = [];

        let totalPages = 1;


        do {

            const result =
                await getWO(
                    page,
                    limit,
                    false
                );


            if (
                !result ||
                result.status === false
            ) {

                console.error(
                    "GET ALL ERROR:",
                    result
                );

                return allData;

            }


            if (
                Array.isArray(
                    result.data
                )
            ) {

                allData =
                    allData.concat(
                        result.data
                    );

            }


            totalPages =
                Number(
                    result.totalPages
                ) || 1;


            page++;


        } while (
            page <=
            totalPages
        );


        return allData;


    } catch (err) {

        console.error(
            "GET ALL ERROR:",
            err
        );


        return [];

    }

}


/* =========================================================
   BASE API CALL
========================================================= */

async function callAPI(
    params
) {

    try {

        let url =
            `${API_URL}` +
            `?action=` +
            encodeURIComponent(
                params.action
            );


        /* =========================
           DATA
        ========================= */

        if (
            params.data
        ) {

            url +=
                `&data=` +
                encodeURIComponent(
                    JSON.stringify(
                        params.data
                    )
                );

        }


        /* =========================
           PRA INVOICE NUMBER
        ========================= */

        if (
            params.praInvoiceNumber
        ) {

            url +=
                `&praInvoiceNumber=` +
                encodeURIComponent(
                    params.praInvoiceNumber
                );

        }


        console.log(
            "CALL API:",
            params.action
        );


        const res =
            await fetchWithTimeout(
                url,
                {
                    method: "GET",

                    cache: "no-store"
                }
            );


        const result =
            await parseAPIResponse(
                res
            );


        console.log(
            "API RESPONSE:",
            result
        );


        /* =========================
           INVALID RESPONSE
        ========================= */

        if (
            !result ||
            typeof result !==
            "object"
        ) {

            return {

                status: false,

                message:
                    "Response API tidak valid"

            };

        }


        /* =========================
           CLEAR CLIENT CACHE
           
           Setelah data berubah.
        ========================= */

        if (
            result.status === true
        ) {

            if (
                params.action ===
                "add" ||

                params.action ===
                "update" ||

                params.action ===
                "delete"
            ) {

                clearWOClientCache();

            }

        }


        return result;


    } catch (err) {

        console.error(
            "API ERROR:",
            err
        );


        return {

            status: false,

            message:
                err.name ===
                "AbortError"

                    ? "Request timeout"

                    : (
                        err.message ||
                        "network error"
                    )

        };

    }

}


/* =========================================================
   ADD
========================================================= */

async function addWO(
    data
) {

    return await callAPI({

        action: "add",

        data: data

    });

}


/* =========================================================
   UPDATE
========================================================= */

async function updateWO(
    data
) {

    return await callAPI({

        action: "update",

        data: data

    });

}


/* =========================================================
   DELETE
========================================================= */

async function deleteWO(
    praInvoiceNumber
) {

    return await callAPI({

        action: "delete",

        praInvoiceNumber:
            praInvoiceNumber

    });

}


/* =========================================================
   REFRESH INDEX
   DIPAKAI JIKA DATA DI SHEET
   DIUBAH MANUAL
========================================================= */

async function refreshWOIndex() {

    try {

        const url =
            `${API_URL}?action=refreshIndex`;


        const res =
            await fetchWithTimeout(
                url,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        const result =
            await parseAPIResponse(
                res
            );


        console.log(
            "INDEX REFRESH:",
            result
        );


        clearWOClientCache();


        return result;


    } catch (err) {

        console.error(
            "INDEX REFRESH ERROR:",
            err
        );


        return {

            status: false,

            message:
                err.message ||
                "refresh index failed"

        };

    }

}

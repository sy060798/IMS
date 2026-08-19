const API_URL = "https://script.google.com/macros/s/AKfycbxuubD1deSNlHoecTzOMAqYyzrdNrnnAQ0-VPVvxM0HEKfYUceQTt4lySczmlKxo9SH/exec";


/* =========================================================
   CONFIG
========================================================= */

const API_LIMIT = 100;

const API_MAX_LIMIT = 500;

const API_TIMEOUT = 15000;


/*
 * Cache browser hanya digunakan untuk GET.
 *
 * Setelah ADD / UPDATE / DELETE,
 * cache langsung dibersihkan.
 */
const CLIENT_CACHE_TIME = 5000;


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
   CLEAR ALL CLIENT CACHE
========================================================= */

function clearWOClientCache() {

    woPageCache.clear();

}


/* =========================================================
   CLEAR PAGE CACHE
========================================================= */

function clearWOPageCache(
    page,
    limit
) {

    const key =
        getClientCacheKey(
            page,
            limit
        );


    woPageCache.delete(
        key
    );

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
            () => {
                controller.abort();
            },
            timeout
        );


    try {

        return await fetch(
            url,
            {
                ...options,
                signal:
                    controller.signal
            }
        );

    } finally {

        clearTimeout(
            timer
        );

    }

}


/* =========================================================
   API JSON PARSER
========================================================= */

async function parseAPIResponse(
    res
) {

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
            text.substring(
                0,
                500
            )
        );


        throw new Error(
            `HTTP ${res.status} - ${res.statusText}`
        );

    }


    /* =========================
       EMPTY
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

        return JSON.parse(
            text
        );

    } catch (err) {

        console.error(
            "API NOT JSON:",
            text.substring(
                0,
                500
            )
        );


        throw new Error(
            "Server tidak mengembalikan JSON"
        );

    }

}


/* =========================================================
   NORMALIZE RESPONSE
========================================================= */

function normalizeGetResponse(
    result,
    page,
    limit
) {

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

        return {

            status: true,

            data:
                result.data,

            total:
                Number(
                    result.total
                ) || 0,

            page:
                Number(
                    result.page
                ) || page,

            limit:
                Number(
                    result.limit
                ) || limit,

            totalPages:
                Number(
                    result.totalPages
                ) || 0

        };

    }


    /* =========================
       ARRAY LAMA
    ========================= */

    if (
        Array.isArray(
            result
        )
    ) {

        return {

            status: true,

            data:
                result,

            total:
                result.length,

            page:
                page,

            limit:
                limit,

            totalPages:
                1

        };

    }


    /* =========================
       DATA PROPERTY
    ========================= */

    if (
        result &&
        Array.isArray(
            result.data
        )
    ) {

        return {

            status:
                result.status !== false,

            data:
                result.data,

            total:
                Number(
                    result.total
                ) || result.data.length,

            page:
                Number(
                    result.page
                ) || page,

            limit:
                Number(
                    result.limit
                ) || limit,

            totalPages:
                Number(
                    result.totalPages
                ) || 1

        };

    }


    /* =========================
       INVALID
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
                Number(limit) ||
                API_LIMIT,
                1
            ),
            API_MAX_LIMIT
        );


    const cacheKey =
        getClientCacheKey(
            page,
            limit
        );


    /* =====================================================
       CLIENT CACHE
    ===================================================== */

    if (
        !forceReload
    ) {

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


            /*
             * Cache expired.
             */

            woPageCache.delete(
                cacheKey
            );

        }

    }


    /* =====================================================
       URL
    ===================================================== */

    const url =
        `${API_URL}` +
        `?action=get` +
        `&page=${encodeURIComponent(page)}` +
        `&limit=${encodeURIComponent(limit)}`;


    console.log(
        "GET WO:",
        page,
        limit
    );


    try {

        const res =
            await fetchWithTimeout(
                url,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const raw =
            await parseAPIResponse(
                res
            );


        const result =
            normalizeGetResponse(
                raw,
                page,
                limit
            );


        /* =================================================
           CACHE SUCCESS RESPONSE
        ================================================= */

        if (
            result.status === true
        ) {

            woPageCache.set(
                cacheKey,
                {
                    time:
                        Date.now(),

                    data:
                        result
                }
            );

        }


        return result;


    } catch (err) {

        console.error(
            "GET WO ERROR:",
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
   FORCE RELOAD CURRENT PAGE
========================================================= */

async function reloadWO(
    page = 1,
    limit = API_LIMIT
) {

    /*
     * Hanya reload page yang diminta.
     *
     * Tidak mengambil semua data.
     */

    clearWOPageCache(
        page,
        limit
    );


    return await getWO(
        page,
        limit,
        true
    );

}


/* =========================================================
   GET ALL DATA
   KHUSUS EXPORT
========================================================= */

async function getAllWO() {

    try {

        let page = 1;

        const limit =
            API_MAX_LIMIT;

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

                break;

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
   BUILD API URL
========================================================= */

function buildAPIUrl(
    params
) {

    let url =
        `${API_URL}` +
        `?action=` +
        encodeURIComponent(
            params.action
        );


    /* =========================
       DATA OBJECT
    ========================= */

    if (
        params.data !== undefined &&
        params.data !== null
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
       PRA INVOICE
    ========================= */

    if (
        params.praInvoiceNumber !==
        undefined &&
        params.praInvoiceNumber !==
        null
    ) {

        url +=
            `&praInvoiceNumber=` +
            encodeURIComponent(
                params.praInvoiceNumber
            );

    }


    return url;

}


/* =========================================================
   BASE API CALL
========================================================= */

async function callAPI(
    params
) {

    const action =
        params.action;


    try {

        const url =
            buildAPIUrl(
                params
            );


        console.log(
            "CALL API:",
            action
        );


        const res =
            await fetchWithTimeout(
                url,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const result =
            await parseAPIResponse(
                res
            );


        console.log(
            "API RESPONSE:",
            action,
            result
        );


        /* =================================================
           INVALID RESPONSE
        ================================================= */

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


        /* =================================================
           DATA BERHASIL BERUBAH
        ================================================= */

        if (
            result.status === true
        ) {

            if (
                action === "add" ||
                action === "update" ||
                action === "delete"
            ) {

                /*
                 * Hapus cache frontend.
                 *
                 * Request berikutnya akan
                 * mengambil data terbaru.
                 */

                clearWOClientCache();

            }

        }


        return result;


    } catch (err) {

        console.error(
            "API ERROR:",
            action,
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

    const result =
        await callAPI({

            action: "add",

            data: data

        });


    return result;

}


/* =========================================================
   UPDATE
========================================================= */

async function updateWO(
    data
) {

    const result =
        await callAPI({

            action: "update",

            data: data

        });


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


    return result;

}


/* =========================================================
   REFRESH INDEX
   HANYA JIKA SHEET DIUBAH MANUAL
========================================================= */

async function refreshWOIndex() {

    try {

        const url =
            `${API_URL}` +
            `?action=refreshIndex`;


        const res =
            await fetchWithTimeout(
                url,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {
                        "Accept":
                            "application/json"
                    }
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


        /*
         * Data mungkin berubah
         * setelah index refresh.
         */

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
                err.name ===
                "AbortError"

                    ? "Request timeout"

                    : (
                        err.message ||
                        "refresh index failed"
                    )

        };

    }

}


/* =========================================================
   HELPER:
   UPDATE DATA DI CACHE
   OPTIONAL
========================================================= */

function updateWOItemInCache(
    updatedItem
) {

    if (
        !updatedItem ||
        !updatedItem.praInvoiceNumber
    ) {

        return;

    }


    for (
        const [
            cacheKey,
            cached
        ]
        of woPageCache.entries()
    ) {

        if (
            !cached ||
            !cached.data ||
            !Array.isArray(
                cached.data.data
            )
        ) {

            continue;

        }


        const list =
            cached.data.data;


        const index =
            list.findIndex(
                item =>
                    String(
                        item.praInvoiceNumber
                    ).trim() ===
                    String(
                        updatedItem.praInvoiceNumber
                    ).trim()
            );


        if (
            index !== -1
        ) {

            list[index] = {
                ...list[index],
                ...updatedItem
            };


            cached.time =
                Date.now();

        }

    }

}


/* =========================================================
   HELPER:
   REMOVE ITEM FROM CACHE
   OPTIONAL
========================================================= */

function removeWOItemFromCache(
    praInvoiceNumber
) {

    const key =
        String(
            praInvoiceNumber || ""
        ).trim();


    if (!key) {
        return;
    }


    for (
        const [
            cacheKey,
            cached
        ]
        of woPageCache.entries()
    ) {

        if (
            !cached ||
            !cached.data ||
            !Array.isArray(
                cached.data.data
            )
        ) {

            continue;

        }


        cached.data.data =
            cached.data.data.filter(
                item =>
                    String(
                        item.praInvoiceNumber
                    ).trim() !== key
            );

    }

}

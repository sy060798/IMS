const API_URL = "https://script.google.com/macros/s/AKfycbxuubD1deSNlHoecTzOMAqYyzrdNrnnAQ0-VPVvxM0HEKfYUceQTt4lySczmlKxo9SH/exec";

/* =========================================================
   CONFIG
========================================================= */

const WO_CACHE_KEY = "WO_DATA_CACHE_V2";
const WO_CACHE_TIME_KEY = "WO_DATA_CACHE_TIME_V2";


/* =========================================================
   CACHE - GET
========================================================= */

function getWOCache() {

    try {

        const raw = localStorage.getItem(WO_CACHE_KEY);

        if (!raw) {
            return [];
        }

        const data = JSON.parse(raw);

        if (!Array.isArray(data)) {
            return [];
        }

        return data;

    } catch (err) {

        console.error("CACHE GET ERROR:", err);

        return [];
    }
}


/* =========================================================
   CACHE - SAVE
========================================================= */

function setWOCache(data) {

    try {

        if (!Array.isArray(data)) {
            return false;
        }

        localStorage.setItem(
            WO_CACHE_KEY,
            JSON.stringify(data)
        );

        localStorage.setItem(
            WO_CACHE_TIME_KEY,
            String(Date.now())
        );

        return true;

    } catch (err) {

        console.error("CACHE SAVE ERROR:", err);

        return false;
    }
}


/* =========================================================
   CACHE - CLEAR
========================================================= */

function clearWOCache() {

    try {

        localStorage.removeItem(
            WO_CACHE_KEY
        );

        localStorage.removeItem(
            WO_CACHE_TIME_KEY
        );

    } catch (err) {

        console.error(
            "CACHE CLEAR ERROR:",
            err
        );
    }
}


/* =========================================================
   CACHE TIME
========================================================= */

function getWOCacheTime() {

    try {

        const value =
            localStorage.getItem(
                WO_CACHE_TIME_KEY
            );

        if (!value) {
            return 0;
        }

        return Number(value) || 0;

    } catch (err) {

        return 0;
    }
}


/* =========================================================
   CACHE INFO
========================================================= */

function getWOInfo() {

    const data = getWOCache();

    const cacheTime =
        getWOCacheTime();

    return {

        count: data.length,

        cacheTime: cacheTime,

        cacheDate:
            cacheTime
                ? new Date(cacheTime)
                : null
    };
}


/* =========================================================
   GET DATA FROM SERVER
========================================================= */

async function getWOServer() {

    try {

        const url =
            `${API_URL}?action=get&_=${Date.now()}`;

        const response =
            await fetch(url, {

                method: "GET",

                cache: "no-store"
            });

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const result =
            await response.json();


        /* -----------------------------------------
           Response harus array
        ----------------------------------------- */

        let data = [];

        if (Array.isArray(result)) {

            data = result;

        } else if (
            Array.isArray(result?.data)
        ) {

            data = result.data;

        } else {

            console.warn(
                "INVALID GET RESPONSE:",
                result
            );

            return null;
        }


        /* -----------------------------------------
           Simpan ke cache
        ----------------------------------------- */

        setWOCache(data);


        /* -----------------------------------------
           Beritahu aplikasi bahwa data berubah
        ----------------------------------------- */

        dispatchWOEvent(
            "server-refresh",
            data
        );


        return data;

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

async function getWO(options = {}) {

    const refresh =
        options.refresh !== false;

    const cached =
        getWOCache();


    /* -----------------------------------------
       Kalau cache tersedia:
       langsung return cache
    ----------------------------------------- */

    if (cached.length > 0) {

        console.log(
            `WO CACHE: ${cached.length} data`
        );


        /* -----------------------------------------
           Refresh server di background
        ----------------------------------------- */

        if (refresh) {

            getWOServer()
                .then(serverData => {

                    if (serverData) {

                        console.log(
                            `WO SERVER: ${serverData.length} data`
                        );
                    }

                })
                .catch(err => {

                    console.error(
                        "BACKGROUND REFRESH ERROR:",
                        err
                    );
                });
        }


        return cached;
    }


    /* -----------------------------------------
       Belum ada cache
       → ambil dari server
    ----------------------------------------- */

    console.log(
        "WO CACHE EMPTY → GET SERVER"
    );

    const serverData =
        await getWOServer();

    return serverData || [];
}


/* =========================================================
   FORCE REFRESH
========================================================= */

async function refreshWO() {

    console.log(
        "FORCE REFRESH WO..."
    );

    return await getWOServer();
}


/* =========================================================
   BASE API CALL
========================================================= */

async function callAPI({

    action,

    data = null,

    praInvoiceNumber = null

}) {

    try {

        const params =
            new URLSearchParams();


        /* -----------------------------------------
           Action
        ----------------------------------------- */

        params.set(
            "action",
            action
        );


        /* -----------------------------------------
           Data JSON
        ----------------------------------------- */

        if (data !== null) {

            params.set(
                "data",
                JSON.stringify(data)
            );
        }


        /* -----------------------------------------
           Key untuk DELETE
        ----------------------------------------- */

        if (
            praInvoiceNumber !== null &&
            praInvoiceNumber !== undefined &&
            praInvoiceNumber !== ""
        ) {

            params.set(
                "praInvoiceNumber",
                String(
                    praInvoiceNumber
                )
            );
        }


        /* -----------------------------------------
           Cache buster
        ----------------------------------------- */

        params.set(
            "_",
            String(Date.now())
        );


        const url =
            `${API_URL}?${params.toString()}`;


        console.log(
            "API REQUEST:",
            action
        );


        const response =
            await fetch(url, {

                method: "GET",

                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const result =
            await response.json();


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
   ADD WO
========================================================= */

async function addWO(data) {

    try {

        console.log(
            "ADDING WO:",
            data
        );


        const result =
            await callAPI({

                action: "add",

                data: data
            });


        /* -----------------------------------------
           Kalau server sukses
        ----------------------------------------- */

        if (
            result &&
            result.status === true
        ) {

            /*
             * Apps Script mengembalikan
             * data yang benar-benar disimpan.
             */

            const newData =
                result.data || data;


            const cache =
                getWOCache();


            /*
             * Pastikan tidak ada duplikat
             */

            const key =
                String(
                    newData.praInvoiceNumber || ""
                )
                .trim()
                .toLowerCase();


            const exists =
                cache.some(item =>

                    String(
                        item.praInvoiceNumber || ""
                    )
                    .trim()
                    .toLowerCase() === key
                );


            if (!exists) {

                cache.push(
                    newData
                );
            }


            /*
             * Simpan cache
             */

            setWOCache(cache);


            /*
             * Update UI
             */

            dispatchWOEvent(
                "add",
                newData
            );


            console.log(
                "WO ADD SUCCESS"
            );
        }


        return result;

    } catch (err) {

        console.error(
            "ADD WO ERROR:",
            err
        );

        return {

            status: false,

            message:
                err.message ||
                "add error"
        };
    }
}


/* =========================================================
   UPDATE WO
========================================================= */

async function updateWO(data) {

    try {

        console.log(
            "UPDATING WO:",
            data
        );


        const result =
            await callAPI({

                action: "update",

                data: data
            });


        /* -----------------------------------------
           Server sukses
        ----------------------------------------- */

        if (
            result &&
            result.status === true
        ) {

            const updatedData =
                result.data || data;


            const cache =
                getWOCache();


            const target =
                String(
                    updatedData.praInvoiceNumber || ""
                )
                .trim()
                .toLowerCase();


            const index =
                cache.findIndex(item =>

                    String(
                        item.praInvoiceNumber || ""
                    )
                    .trim()
                    .toLowerCase() === target
                );


            /*
             * Update data yang sudah ada
             */

            if (index !== -1) {

                cache[index] = {

                    ...cache[index],

                    ...updatedData
                };

            } else {

                /*
                 * Kalau belum ada di cache,
                 * tambahkan.
                 */

                cache.push(
                    updatedData
                );
            }


            /*
             * Simpan cache
             */

            setWOCache(cache);


            /*
             * Update UI
             */

            dispatchWOEvent(
                "update",
                updatedData
            );


            console.log(
                "WO UPDATE SUCCESS"
            );
        }


        return result;

    } catch (err) {

        console.error(
            "UPDATE WO ERROR:",
            err
        );

        return {

            status: false,

            message:
                err.message ||
                "update error"
        };
    }
}


/* =========================================================
   DELETE WO
========================================================= */

async function deleteWO(
    praInvoiceNumber
) {

    try {

        console.log(
            "DELETING WO:",
            praInvoiceNumber
        );


        const result =
            await callAPI({

                action: "delete",

                praInvoiceNumber:
                    praInvoiceNumber
            });


        /* -----------------------------------------
           Server sukses
        ----------------------------------------- */

        if (
            result &&
            result.status === true
        ) {

            const target =
                String(
                    praInvoiceNumber
                )
                .trim()
                .toLowerCase();


            let cache =
                getWOCache();


            /*
             * Hapus dari cache
             */

            cache =
                cache.filter(item =>

                    String(
                        item.praInvoiceNumber || ""
                    )
                    .trim()
                    .toLowerCase() !== target
                );


            /*
             * Simpan cache
             */

            setWOCache(cache);


            /*
             * Update UI
             */

            dispatchWOEvent(
                "delete",
                {
                    praInvoiceNumber:
                        praInvoiceNumber
                }
            );


            console.log(
                "WO DELETE SUCCESS"
            );
        }


        return result;

    } catch (err) {

        console.error(
            "DELETE WO ERROR:",
            err
        );

        return {

            status: false,

            message:
                err.message ||
                "delete error"
        };
    }
}


/* =========================================================
   EVENT SYSTEM
========================================================= */

function dispatchWOEvent(
    type,
    data
) {

    try {

        window.dispatchEvent(

            new CustomEvent(
                "wo-updated",
                {
                    detail: {

                        type: type,

                        data: data,

                        cache:
                            getWOCache()
                    }
                }
            )
        );

    } catch (err) {

        console.error(
            "EVENT ERROR:",
            err
        );
    }
}


/* =========================================================
   LISTEN EVENT
========================================================= */

function onWOUpdated(
    callback
) {

    window.addEventListener(
        "wo-updated",
        event => {

            try {

                callback(
                    event.detail
                );

            } catch (err) {

                console.error(
                    "WO CALLBACK ERROR:",
                    err
                );
            }
        }
    );
}


/* =========================================================
   FIND WO BY KEY
========================================================= */

function findWO(
    praInvoiceNumber
) {

    const target =
        String(
            praInvoiceNumber || ""
        )
        .trim()
        .toLowerCase();


    const cache =
        getWOCache();


    return (
        cache.find(item =>

            String(
                item.praInvoiceNumber || ""
            )
            .trim()
            .toLowerCase() === target

        ) || null
    );
}


/* =========================================================
   UPDATE CACHE MANUALLY
========================================================= */

function updateWOCacheItem(
    data
) {

    if (
        !data ||
        !data.praInvoiceNumber
    ) {
        return false;
    }


    const cache =
        getWOCache();


    const target =
        String(
            data.praInvoiceNumber
        )
        .trim()
        .toLowerCase();


    const index =
        cache.findIndex(item =>

            String(
                item.praInvoiceNumber || ""
            )
            .trim()
            .toLowerCase() === target
        );


    if (index === -1) {

        cache.push(data);

    } else {

        cache[index] = {

            ...cache[index],

            ...data
        };
    }


    setWOCache(cache);


    dispatchWOEvent(
        "cache-update",
        data
    );


    return true;
}


/* =========================================================
   REMOVE CACHE ITEM MANUALLY
========================================================= */

function removeWOCacheItem(
    praInvoiceNumber
) {

    const target =
        String(
            praInvoiceNumber || ""
        )
        .trim()
        .toLowerCase();


    let cache =
        getWOCache();


    const oldLength =
        cache.length;


    cache =
        cache.filter(item =>

            String(
                item.praInvoiceNumber || ""
            )
            .trim()
            .toLowerCase() !== target
        );


    if (
        cache.length !== oldLength
    ) {

        setWOCache(cache);

        dispatchWOEvent(
            "cache-delete",
            {
                praInvoiceNumber:
                    praInvoiceNumber
            }
        );

        return true;
    }


    return false;
}


/* =========================================================
   CACHE STATUS
========================================================= */

function getWOStatus() {

    const data =
        getWOCache();

    const time =
        getWOCacheTime();


    return {

        total:
            data.length,

        hasCache:
            data.length > 0,

        lastUpdate:
            time
                ? new Date(time)
                : null
    };
}


/* =========================================================
   CLEAR ALL CACHE
========================================================= */

function resetWOCache() {

    clearWOCache();

    dispatchWOEvent(
        "cache-clear",
        []
    );

    console.log(
        "WO CACHE CLEARED"
    );
}

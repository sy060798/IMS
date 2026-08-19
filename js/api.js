const API_URL = "https://script.google.com/macros/s/AKfycbxAIonz6PoJzDvySBG6xfgUvvoSMFGIsxE5n95eVSJWYkFVJBT6vKysMEjls9RcqyAc/exec";


/* =========================
   CONFIG
========================= */

const API_LIMIT = 100;


/* =========================
   API JSON PARSER
========================= */

async function parseAPIResponse(res) {

    const text = await res.text();

    // Cek HTTP error
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


    // Cek apakah response JSON
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


/* =========================
   GET DATA
   PAGINATION
========================= */

async function getWO(page = 1, limit = API_LIMIT) {

    try {

        const url =
            `${API_URL}?action=get&page=${page}&limit=${limit}`;

        console.log("GET API:", url);


        const res = await fetch(url, {
            method: "GET",
            cache: "no-store"
        });


        const result =
            await parseAPIResponse(res);


        console.log(
            "GET RESPONSE:",
            result
        );


        /* =========================
           FORMAT BARU
        ========================= */

        if (
            result &&
            result.status === true &&
            Array.isArray(result.data)
        ) {

            return result;
        }


        /* =========================
           FORMAT LAMA
           BACKUP
        ========================= */

        if (Array.isArray(result)) {

            return {
                status: true,
                data: result,
                total: result.length,
                page: 1,
                limit: result.length,
                totalPages: 1
            };
        }


        if (
            result &&
            Array.isArray(result.data)
        ) {

            return result;
        }


        return {
            status: false,
            data: [],
            total: 0,
            page: page,
            limit: limit,
            totalPages: 0
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
            message: err.message || "network error"
        };
    }
}


/* =========================
   GET SEMUA DATA
   OPTIONAL
========================= */

async function getAllWO() {

    try {

        let page = 1;
        const limit = API_LIMIT;

        let allData = [];

        let totalPages = 1;


        do {

            const result =
                await getWO(page, limit);


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


            if (Array.isArray(result.data)) {

                allData =
                    allData.concat(result.data);
            }


            totalPages =
                Number(result.totalPages) || 1;


            page++;


        } while (page <= totalPages);


        return allData;


    } catch (err) {

        console.error(
            "GET ALL ERROR:",
            err
        );

        return [];
    }
}


/* =========================
   BASE CALL
========================= */

async function callAPI(params) {

    try {

        let url =
            `${API_URL}?action=${encodeURIComponent(params.action)}`;


        /* =========================
           DATA OBJECT
        ========================= */

        if (params.data) {

            url +=
                `&data=${encodeURIComponent(
                    JSON.stringify(params.data)
                )}`;
        }


        /* =========================
           PRA INVOICE NUMBER
        ========================= */

        if (params.praInvoiceNumber) {

            url +=
                `&praInvoiceNumber=${encodeURIComponent(
                    params.praInvoiceNumber
                )}`;
        }


        console.log(
            "CALL API:",
            params.action
        );


        const res = await fetch(url, {

            method: "GET",

            cache: "no-store"
        });


        const result =
            await parseAPIResponse(res);


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
                err.message || "network error"
        };
    }
}


/* =========================
   ADD
========================= */

async function addWO(data) {

    return await callAPI({

        action: "add",

        data: data

    });
}


/* =========================
   UPDATE
========================= */

async function updateWO(data) {

    return await callAPI({

        action: "update",

        data: data

    });
}


/* =========================
   DELETE
========================= */

async function deleteWO(praInvoiceNumber) {

    return await callAPI({

        action: "delete",

        praInvoiceNumber:
            praInvoiceNumber

    });
}

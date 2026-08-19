const API_URL = "https://script.google.com/macros/s/AKfycbzrcQicFyANsu8zWXuZR1LyirzpFPoNMC7NRujFdZfpIXmkPaOJSkPvylH4GPGj4m_K/exec";

/* =========================
   GET DATA - OPTIMIZED
========================= */
async function getWO() {
    try {
        const res = await fetch(`${API_URL}?action=get`, {
            method: "GET"
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];

    } catch (err) {
        console.error("GET ERROR:", err);
        return [];
    }
}


/* =========================
   BASE CALL - OPTIMIZED
========================= */
async function callAPI(params) {
    try {

        const query = new URLSearchParams();

        query.set("action", params.action);

        // kirim data object
        if (params.data) {
            query.set(
                "data",
                JSON.stringify(params.data)
            );
        }

        // kirim key utama
        if (params.praInvoiceNumber) {
            query.set(
                "praInvoiceNumber",
                params.praInvoiceNumber
            );
        }

        const res = await fetch(
            `${API_URL}?${query.toString()}`,
            {
                method: "GET"
            }
        );

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const result = await res.json();

        console.log("API RESPONSE:", result);

        return result;

    } catch (err) {

        console.error("API ERROR:", err);

        return {
            status: false,
            message: "network error"
        };
    }
}


/* =========================
   ADD
========================= */
function addWO(data) {
    return callAPI({
        action: "add",
        data
    });
}


/* =========================
   UPDATE
========================= */
function updateWO(data) {
    return callAPI({
        action: "update",
        data
    });
}


/* =========================
   DELETE
========================= */
function deleteWO(praInvoiceNumber) {
    return callAPI({
        action: "delete",
        praInvoiceNumber
    });
}


const API_URL = "https://script.google.com/macros/s/AKfycby3rTXADnj2dkicPOZcWojW9pDt1CNsKiG4Q0N2Xo-NwBX9AGW_r-GM8INmEArKVPbq/exec";

/* =========================
   GET DATA (SAFE)
========================= */
async function getWO() {
    try {
        const res = await fetch(`${API_URL}?action=get`, {
            method: "GET",
            cache: "no-cache"
        });

        const data = await res.json();

        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;

        return [];
    } catch (err) {
        console.error("GET ERROR:", err);
        return [];
    }
}

/* =========================
   BASE CALL (GET VERSION)
========================= */
async function callAPI(params) {
    try {

        let url = `${API_URL}?action=${params.action}`;

        // kirim data object
        if (params.data) {
            url += `&data=${encodeURIComponent(JSON.stringify(params.data))}`;
        }

        // kirim key utama
        if (params.praInvoiceNumber) {
            url += `&praInvoiceNumber=${encodeURIComponent(params.praInvoiceNumber)}`;
        }

        const res = await fetch(url, {
            method: "GET",
            cache: "no-cache"
        });

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

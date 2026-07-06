const API_URL = "https://script.google.com/macros/s/AKfycbwE9WLiyjp8QpejmNC_iRzpSm3sL0xHb4k3jn3FoU0XqsG-19-bQXQqaFkYzp25PFZZ/exec";

/* =========================
   GET DATA (SAFE)
========================= */
async function getWO() {
    try {
        const res = await fetch(API_URL + "?action=get", {
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
   BASE CALL (FIXED → GET ONLY)
========================= */
async function callAPI(params) {
    try {

        let url = API_URL + "?action=" + params.action;

        if (params.data) {
            url += "&data=" + encodeURIComponent(JSON.stringify(params.data));
        }

        if (params.praInvoiceNumber) {
            url += "&praInvoiceNumber=" + encodeURIComponent(params.praInvoiceNumber);
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

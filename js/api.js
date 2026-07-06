const API_URL = "https://script.google.com/macros/s/AKfycbwE9WLiyjp8QpejmNC_iRzpSm3sL0xHb4k3jn3FoU0XqsG-19-bQXQqaFkYzp25PFZZ/exec";

/* =========================
   SAFE GET
========================= */
async function getWO() {
    try {
        const res = await fetch(API_URL + "?action=get", {
            cache: "no-cache"
        });

        const data = await res.json();

        return Array.isArray(data)
            ? data
            : (data?.data || []);

    } catch (err) {
        console.error("GET ERROR:", err);
        return [];
    }
}

/* =========================
   BASE CALL (SAFE)
========================= */
async function callAPI(params) {

    try {

        const url = API_URL + "?action=" + params.action;

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params),
            cache: "no-cache"
        });

        const result = await res.json();

        console.log("API RESPONSE:", result);

        if (!result || result.status === false) {
            console.error("API FAILED:", result);
        }

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


/* ==========================================
   CONFIG
========================================== */

const API_URL = "https://script.google.com/macros/s/AKfycbwE9WLiyjp8QpejmNC_iRzpSm3sL0xHb4k3jn3FoU0XqsG-19-bQXQqaFkYzp25PFZZ/exec";

/* ==========================================
   GET DATA (AMAN - NO CORS ISSUE)
========================================== */

async function getWO() {
    try {
        const res = await fetch(API_URL + "?action=get");
        return await res.json();
    } catch (err) {
        console.error("GET ERROR:", err);
        return [];
    }
}

/* ==========================================
   POST VIA GET PARAMETER (ANTI CORS FIX)
========================================== */

async function postData(payload) {

    try {

        const url =
            API_URL +
            "?action=" + payload.action +
            "&data=" + encodeURIComponent(JSON.stringify(payload.data || {})) +
            "&woNumber=" + encodeURIComponent(payload.woNumber || "");

        const res = await fetch(url, {
            method: "GET" // penting: hindari preflight CORS
        });

        return await res.json();

    } catch (err) {

        console.error("POST ERROR:", err);

        return {
            status: false,
            message: "Network error"
        };
    }
}

/* ==========================================
   WRAPPER FUNCTIONS
========================================== */

async function addWO(data) {
    return await postData({ action: "add", data });
}

async function updateWO(data) {
    return await postData({ action: "update", data });
}

async function deleteWO(woNumber) {
    return await postData({ action: "delete", woNumber });
}

/* ==========================================
   AUTO REFRESH TABLE
========================================== */

setInterval(() => {

    if (typeof loadTable === "function") {
        loadTable();
    }

}, 10000);

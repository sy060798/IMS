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

        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;

        return [];

    } catch (err) {
        console.error("GET ERROR:", err);
        return [];
    }
}

/* =========================
   BASE CALL
========================= */
async function callAPI(params) {

    try {

        let url = API_URL + "?action=" + params.action;

        if (params.data) {
            url += "&data=" + encodeURIComponent(JSON.stringify(params.data));
        }

        if (params.woNumber) {
            url += "&woNumber=" + encodeURIComponent(params.woNumber);
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
        return { status: false, message: "network error" };
    }
}

/* =========================
   ADD
========================= */
async function addWO(data) {

    const res = await callAPI({
        action: "add",
        data
    });

    if (!res.status) {
        console.error("ADD FAILED:", res);
    }

    return res;
}

/* =========================
   UPDATE
========================= */
async function updateWO(data) {

    const res = await callAPI({
        action: "update",
        data
    });

    if (!res.status) {
        console.error("UPDATE FAILED:", res);
    }

    return res;
}

/* =========================
   DELETE
========================= */
async function deleteWO(woNumber) {

    const res = await callAPI({
        action: "delete",
        woNumber
    });

    if (!res.status) {
        console.error("DELETE FAILED:", res);
    }

    return res;
}

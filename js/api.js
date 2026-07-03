const API_URL = "https://script.google.com/macros/s/AKfycbwE9WLiyjp8QpejmNC_iRzpSm3sL0xHb4k3jn3FoU0XqsG-19-bQXQqaFkYzp25PFZZ/exec";

/* =========================
   GET DATA ONLY (SAFE)
========================= */
async function getWO() {
    try {
        const res = await fetch(API_URL + "?action=get");
        const data = await res.json();

        // pastikan selalu array
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;

        return [];
    } catch (err) {
        console.error("GET WO ERROR:", err);
        return [];
    }
}

/* =========================
   ADD / UPDATE / DELETE VIA GET
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

        const res = await fetch(url);
        return await res.json();

    } catch (err) {
        console.error("API ERROR:", err);
        return { status: false };
    }
}

/* WRAPPER */
function addWO(data) {
    return callAPI({ action: "add", data });
}

async function updateWO(data) {

    const result = await callAPI({
        action: "update",
        data
    });

    console.log("UPDATE RESULT:", result);

    return result;
}

async function deleteWO(woNumber) {

    const result = await callAPI({
        action: "delete",
        woNumber
    });

    console.log("DELETE RESULT:", result);

    return result;
}

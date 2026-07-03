const API_URL = "https://script.google.com/macros/s/AKfycbwE9WLiyjp8QpejmNC_iRzpSm3sL0xHb4k3jn3FoU0XqsG-19-bQXQqaFkYzp25PFZZ/exec";

/* GET */
async function getWO() {
    const res = await fetch(API_URL + "?action=get");
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
}

/* POST WRAPPER */
async function postData(payload) {

    let url = API_URL + "?action=" + payload.action;

    if (payload.data) {
        url += "&data=" + encodeURIComponent(JSON.stringify(payload.data));
    }

    if (payload.woNumber) {
        url += "&woNumber=" + encodeURIComponent(payload.woNumber);
    }

    const res = await fetch(url);
    return await res.json();
}

async function addWO(data) {
    return await postData({ action: "add", data });
}

async function updateWO(data) {
    return await postData({ action: "update", data });
}

async function deleteWO(woNumber) {
    return await postData({ action: "delete", woNumber });
}

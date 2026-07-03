let editMode = false;
let woData = [];

/* =========================
   OPEN / CLOSE FORM
========================= */

function openForm() {
    document.getElementById("modalWO").style.display = "block";
}

function closeForm() {
    document.getElementById("modalWO").style.display = "none";
    clearForm();
    editMode = false;
}

/* =========================
   CLEAR FORM
========================= */

function clearForm() {

    const fields = [
        "woNumber","reference","quotation","woStart","woEnd",
        "jobName","area","city","boq","woTotal",
        "status","praInvoice","invoice","jenis"
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

/* =========================
   SAVE
========================= */

async function saveWO() {

    const data = {
        woNumber: document.getElementById("woNumber").value,
        reference: document.getElementById("reference").value,
        quotation: document.getElementById("quotation").value,
        woStart: document.getElementById("woStart").value,
        woEnd: document.getElementById("woEnd").value,
        jobName: document.getElementById("jobName").value,
        area: document.getElementById("area").value,
        city: document.getElementById("city").value,
        boq: document.getElementById("boq").value,
        woTotal: document.getElementById("woTotal").value,
        status: document.getElementById("status").value,
        praInvoice: document.getElementById("praInvoice").value,
        invoice: document.getElementById("invoice").value,
        jenis: document.getElementById("jenis").value
    };

    if (editMode) {
        await updateWO(data);
    } else {
        await addWO(data);
    }

    closeForm();
    await loadTable();
}

/* =========================
   EDIT
========================= */

function editWO(woNumber) {

    const item = woData.find(x => x.woNumber == woNumber);
    if (!item) return;

    editMode = true;
    openForm();

    Object.keys(item).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = item[key];
    });
}

/* =========================
   LOAD TABLE (FIX UTAMA)
========================= */

async function loadTable() {

    try {

        const res = await getWO();

        console.log("RAW API RESPONSE:", res);

        // 🔥 NORMALISASI DATA (INI FIX UTAMA)
        let data = [];

        if (Array.isArray(res)) {
            data = res;
        } else if (res && Array.isArray(res.data)) {
            data = res.data;
        } else {
            data = [];
        }

        woData = data;

        renderTable(data);

    } catch (err) {
        console.error("LOAD ERROR:", err);
    }
}

/* =========================
   RENDER TABLE
========================= */

function renderTable(data) {

    const tbody = document.getElementById("tableBody");

    console.log("TBody:", tbody);
    console.log("DATA:", data);

    if (!tbody) {
        console.error("tableBody NOT FOUND");
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No Data</td></tr>`;
        return;
    }

    let html = "";

    data.forEach(item => {

        html += `
        <tr>
            <td>${item.woNumber ?? "-"}</td>
            <td>${item.reference ?? "-"}</td>
            <td>${item.jobName ?? "-"}</td>
            <td>${item.city ?? "-"}</td>
            <td>${item.status ?? "-"}</td>
            <td>${item.woTotal ?? "-"}</td>
            <td>
                <button onclick="editWO('${item.woNumber}')">Edit</button>
                <button onclick="deleteWO('${item.woNumber}')">Hapus</button>
            </td>
        </tr>
        `;
    });

    tbody.innerHTML = html;
}

/* =========================
   DELETE ACTION (TAMBAHAN FIX)
========================= */

async function hapusWO(woNumber) {

    if (!confirm("Yakin ingin menghapus data?")) return;

    await deleteWO(woNumber); // fungsi dari api.js

    loadTable();
}

/* =========================
   INIT
========================= */

loadTable();

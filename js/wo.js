
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
   SAVE (ADD / UPDATE)
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
    loadTable();
}

/* =========================
   EDIT
========================= */

function editWO(woNumber) {

    const item = woData.find(x => x.woNumber === woNumber);
    if (!item) return;

    editMode = true;
    openForm();

    document.getElementById("woNumber").value = item.woNumber || "";
    document.getElementById("reference").value = item.reference || "";
    document.getElementById("quotation").value = item.quotation || "";
    document.getElementById("woStart").value = item.woStart || "";
    document.getElementById("woEnd").value = item.woEnd || "";
    document.getElementById("jobName").value = item.jobName || "";
    document.getElementById("area").value = item.area || "";
    document.getElementById("city").value = item.city || "";
    document.getElementById("boq").value = item.boq || "";
    document.getElementById("woTotal").value = item.woTotal || "";
    document.getElementById("status").value = item.status || "";
    document.getElementById("praInvoice").value = item.praInvoice || "";
    document.getElementById("invoice").value = item.invoice || "";
    document.getElementById("jenis").value = item.jenis || "";
}

/* =========================
   LOAD TABLE (IMPORTANT FIX)
========================= */

async function loadTable() {

    const data = await getWO();

    woData = data || [];

    renderTable(woData);
}

/* =========================
   RENDER TABLE
========================= */

function renderTable(data) {

    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">No Data</td>
            </tr>
        `;
        return;
    }

    let html = "";

    data.forEach(item => {

        html += `
        <tr>
            <td>${item.woNumber || ""}</td>
            <td>${item.jobName || ""}</td>
            <td>${item.city || ""}</td>
            <td>${item.status || ""}</td>
            <td>${item.woTotal || ""}</td>
            <td>
                <button onclick="editWO('${item.woNumber}')">Edit</button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

/* =========================
   INIT
========================= */

loadTable();

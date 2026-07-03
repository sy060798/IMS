let editMode = false;
let woData = [];

/* =========================
   OPEN FORM
========================= */
function openForm() {
    document.getElementById("modalWO").style.display = "block";
}

/* =========================
   CLOSE FORM
========================= */
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

    console.log("SAVE DATA:", data);

    if (editMode) {
        await updateWO(data);
    } else {
        await addWO(data);
    }

    closeForm();
    await loadTable();
}

/* =========================
   EDIT DATA
========================= */
function editWO(woNumber) {

    const item = woData.find(x => x.woNumber == woNumber);
    if (!item) return;

    editMode = true;
    openForm();

    // isi form otomatis dari data
    setValue("woNumber", item.woNumber);
    setValue("reference", item.reference);
    setValue("quotation", item.quotation);
    setValue("woStart", item.woStart);
    setValue("woEnd", item.woEnd);
    setValue("jobName", item.jobName);
    setValue("area", item.area);
    setValue("city", item.city);
    setValue("boq", item.boq);
    setValue("woTotal", item.woTotal);
    setValue("status", item.status);
    setValue("praInvoice", item.praInvoice);
    setValue("invoice", item.invoice);
    setValue("jenis", item.jenis);
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
}

/* =========================
   LOAD DATA
========================= */
async function loadTable() {

    try {

        const res = await getWO();

        console.log("RAW RESPONSE:", res);

        let data = [];

        if (Array.isArray(res)) {
            data = res;
        } else if (res && Array.isArray(res.data)) {
            data = res.data;
        }

        woData = data;

        renderTable(data);

    } catch (err) {
        console.error("LOAD ERROR:", err);
    }
}

/* =========================
   filter
========================= */

function applyFilter() {
    const search = document.getElementById("searchWO")?.value.toLowerCase() || "";
    const status = document.getElementById("filterStatus")?.value || "";
    const city = document.getElementById("filterCity")?.value || "";

    let filtered = woData;

    // filter WO number / reference / jobName
    if (search) {
        filtered = filtered.filter(item =>
            (item.woNumber || "").toLowerCase().includes(search) ||
            (item.reference || "").toLowerCase().includes(search) ||
            (item.jobName || "").toLowerCase().includes(search)
        );
    }

    // filter status
    if (status && status !== "All") {
        filtered = filtered.filter(item => item.status === status);
    }

    // filter city
    if (city && city !== "Semua Kota") {
        filtered = filtered.filter(item => item.city === city);
    }

    renderTable(filtered);
}

/* =========================
   RENDER TABLE
========================= */
function renderTable(data) {

    const tbody = document.getElementById("tableBody");

    if (!tbody) {
        console.error("tableBody not found");
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">No Data</td></tr>`;
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
                <button onclick="hapusWO('${item.woNumber}')">Hapus</button>
            </td>
        </tr>
        `;
    });

    tbody.innerHTML = html;
}

/* =========================
   DELETE FIX
========================= */
async function hapusWO(woNumber) {

    if (!confirm("Yakin hapus data ini?")) return;

    console.log("DELETE:", woNumber);

    await deleteWO(woNumber);

    await loadTable();
}

/* =========================
   INIT
========================= */
loadTable();

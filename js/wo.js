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
        "praInvoiceNumber",
        "invoiceNumber",
        "invoiceName",
        "invoiceDate",
        "periode",
        "jobName",
        "area",
        "city",
        "boq",
        "woTotal",
        "status",
        "praInvoice",
        "invoice",
        "jenis"
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
        praInvoiceNumber: document.getElementById("praInvoiceNumber").value,
        invoiceNumber: document.getElementById("invoiceNumber").value,
        invoiceName: document.getElementById("invoiceName").value,
        invoiceDate: document.getElementById("invoiceDate").value,
        periode: document.getElementById("periode").value,
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
function editWO(praInvoiceNumber) {

    const item = woData.find(x => x.praInvoiceNumber == praInvoiceNumber);
    if (!item) return;

    editMode = true;
    openForm();

    setValue("praInvoiceNumber", item.praInvoiceNumber);
    setValue("invoiceNumber", item.invoiceNumber);
    setValue("invoiceName", item.invoiceName);
    setValue("invoiceDate", item.invoiceDate);
    setValue("periode", item.periode);
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
   FILTER
========================= */
function applyFilter() {

    const search = document.getElementById("searchWO")?.value.toLowerCase() || "";
    const status = document.getElementById("filterStatus")?.value || "";
    const city = document.getElementById("filterCity")?.value || "";

    let filtered = woData;

    if (search) {
        filtered = filtered.filter(item =>
            (item.praInvoiceNumber || "").toLowerCase().includes(search) ||
            (item.invoiceNumber || "").toLowerCase().includes(search) ||
            (item.invoiceName || "").toLowerCase().includes(search)
        );
    }

    if (status && status !== "All") {
        filtered = filtered.filter(item => item.status === status);
    }

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

    if (!tbody) return;

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">No Data</td></tr>`;
        return;
    }

    let html = "";

    data.forEach(item => {

        html += `
        <tr>
            <td>${item.praInvoiceNumber ?? "-"}</td>
            <td>${item.invoiceNumber ?? "-"}</td>
            <td>${item.invoiceName ?? "-"}</td>
            <td>${item.invoiceDate ?? "-"}</td>
            <td>${item.status ?? "-"}</td>
            <td>${item.woTotal ?? "-"}</td>
            <td>
                <button onclick="editWO('${item.praInvoiceNumber}')">Edit</button>
                <button onclick="hapusWO('${item.praInvoiceNumber}')">Hapus</button>
            </td>
        </tr>
        `;
    });

    tbody.innerHTML = html;
}

/* =========================
   DELETE
========================= */
async function hapusWO(praInvoiceNumber) {

    if (!confirm("Yakin hapus data ini?")) return;

    console.log("DELETE:", praInvoiceNumber);

    await deleteWO(praInvoiceNumber);

    await loadTable();
}

/* =========================
   INIT
========================= */
loadTable();

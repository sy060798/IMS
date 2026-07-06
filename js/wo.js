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
        "jenis"
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

/* =========================
   SAVE DATA (ADD / UPDATE)
========================= */

async function saveWO() {

    const data = {
        praInvoiceNumber: val("praInvoiceNumber"),
        invoiceNumber: val("invoiceNumber"),
        invoiceName: val("invoiceName"),
        invoiceDate: val("invoiceDate"),
        periode: val("periode"),
        jobName: val("jobName"),
        area: val("area"),
        city: val("city"),
        boq: val("boq"),
        woTotal: val("woTotal"),
        status: val("status"),
        jenis: val("jenis")
    };

    if (!data.praInvoiceNumber) {
        alert("Pra Invoice Number wajib diisi");
        return;
    }

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

    const item = woData.find(x => x?.praInvoiceNumber == praInvoiceNumber);
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
    setValue("jenis", item.jenis);
}

/* =========================
   LOAD TABLE
========================= */

async function loadTable() {

    try {

        const res = await getWO();

        woData = Array.isArray(res) ? res : (res?.data || []);

        renderTable(woData);

    } catch (err) {
        console.error("LOAD ERROR:", err);
        woData = [];
    }
}

/* =========================
   FILTER
========================= */

function applyFilter() {

    const search = (id("searchWO") || "").toLowerCase();
    const status = id("filterStatus");
    const city = id("filterCity");

    let filtered = [...woData];

    if (search) {
        filtered = filtered.filter(item =>
            item?.praInvoiceNumber?.toLowerCase().includes(search) ||
            item?.invoiceNumber?.toLowerCase().includes(search) ||
            item?.invoiceName?.toLowerCase().includes(search)
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

function renderTable(data = []) {

    const tbody = document.getElementById("tableBody");

    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">No Data</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item?.praInvoiceNumber ?? "-"}</td>
            <td>${item?.invoiceNumber ?? "-"}</td>
            <td>${item?.invoiceName ?? "-"}</td>
            <td>${item?.invoiceDate ?? "-"}</td>
            <td>${item?.status ?? "-"}</td>
            <td>${formatRupiah(item?.woTotal)}</td>
            <td>
                <button onclick="editWO('${item?.praInvoiceNumber}')">Edit</button>
                <button onclick="hapusWO('${item?.praInvoiceNumber}')">Hapus</button>
            </td>
        </tr>
    `).join("");
}

/* =========================
   DELETE
========================= */

async function hapusWO(praInvoiceNumber) {

    if (!confirm("Yakin hapus data ini?")) return;

    try {
        await deleteWO(praInvoiceNumber);
        await loadTable();
    } catch (err) {
        console.error("DELETE ERROR:", err);
    }
}

/* =========================
   HELPERS (ANTI ERROR)
========================= */

function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function id(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
}

function formatRupiah(angka) {
    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

/* =========================
   INIT
========================= */

loadTable();

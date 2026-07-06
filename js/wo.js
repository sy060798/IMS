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
        "city",
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
   SAVE (ADD / UPDATE)
========================= */

async function saveWO() {

    const data = {
        praInvoiceNumber: val("praInvoiceNumber"),
        invoiceNumber: val("invoiceNumber"),
        invoiceName: val("invoiceName"),
        invoiceDate: val("invoiceDate"),
        periode: val("periode"),
        city: val("city"),
        woTotal: val("woTotal"),
        status: val("status"),
        jenis: val("jenis")
    };

    if (!data.praInvoiceNumber) {
        alert("Pra Invoice Number wajib diisi");
        return;
    }

    // =========================
    // ANTI DUPLIKAT
    // =========================
    const exists = woData.some(item =>
        String(item?.praInvoiceNumber).trim() === String(data.praInvoiceNumber).trim()
    );

    if (exists && !editMode) {
        alert("Pra Invoice sudah ada (duplikat)");
        return;
    }

    try {

        let result;

        if (editMode) {
            result = await updateWO(data);
        } else {
            result = await addWO(data);
        }

        console.log("SAVE RESPONSE:", result);

        // =========================
        // VALIDASI RESPONSE API
        // =========================
        if (!result || result.status === false) {
            alert(result?.message || "Gagal menyimpan data ke server");
            return;
        }

        closeForm();
        await loadTable();

    } catch (err) {
        console.error("SAVE ERROR:", err);
        alert("Terjadi kesalahan saat menyimpan data");
    }
}

/* =========================
   LOAD TABLE
========================= */

async function loadTable() {

    try {

        const res = await getWO();

        woData = Array.isArray(res) ? res : (res?.data || []);

        renderTable(woData);
        syncCityFilter();

    } catch (err) {
        console.error("LOAD ERROR:", err);
        woData = [];
    }
}

/* =========================
   EDIT
========================= */

function editWO(praInvoiceNumber) {

    const item = woData.find(x =>
        String(x?.praInvoiceNumber).trim() === String(praInvoiceNumber).trim()
    );

    if (!item) {
        alert("Data tidak ditemukan");
        return;
    }

    editMode = true;
    openForm();

    setValue("praInvoiceNumber", item.praInvoiceNumber);
    setValue("invoiceNumber", item.invoiceNumber);
    setValue("invoiceName", item.invoiceName);
    setValue("invoiceDate", item.invoiceDate);
    setValue("periode", item.periode);
    setValue("city", item.city);
    setValue("woTotal", item.woTotal);
    setValue("status", item.status);
    setValue("jenis", item.jenis);
}

/* =========================
   DELETE
========================= */

async function hapusWO(praInvoiceNumber) {

    if (!confirm("Yakin hapus data ini?")) return;

    try {

        const result = await deleteWO(praInvoiceNumber);

        if (!result || result.status === false) {
            alert(result?.message || "Gagal hapus data");
            return;
        }

        await loadTable();

    } catch (err) {
        console.error("DELETE ERROR:", err);
        alert("Gagal menghapus data");
    }
}

/* =========================
   FILTER
========================= */

function applyFilter() {

    const search = (document.getElementById("searchWO")?.value || "").toLowerCase();
    const status = document.getElementById("filterStatus")?.value || "";
    const city = document.getElementById("filterCity")?.value || "";

    let filtered = [...woData];

    if (search) {
        filtered = filtered.filter(item =>
            (item?.praInvoiceNumber || "").toLowerCase().includes(search) ||
            (item?.invoiceNumber || "").toLowerCase().includes(search) ||
            (item?.invoiceName || "").toLowerCase().includes(search)
        );
    }

    if (status) {
        filtered = filtered.filter(item => item.status === status);
    }

    if (city) {
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

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="9">No Data</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item?.praInvoiceNumber ?? "-"}</td>
            <td>${item?.invoiceNumber ?? "-"}</td>
            <td>${item?.invoiceName ?? "-"}</td>
            <td>${item?.invoiceDate ?? "-"}</td>
            <td>${item?.periode ?? "-"}</td>
            <td>${item?.city ?? "-"}</td>
            <td>${item?.status ?? "-"}</td>
            <td>${formatRupiah(item?.woTotal)}</td>
            <td>${item?.jenis ?? "-"}</td>
            <td>
                <button onclick="editWO('${item?.praInvoiceNumber}')">Edit</button>
                <button onclick="hapusWO('${item?.praInvoiceNumber}')">Hapus</button>
            </td>
        </tr>
    `).join("");
}

/* =========================
   CITY FILTER SYNC
========================= */

function syncCityFilter() {

    const select = document.getElementById("filterCity");
    if (!select) return;

    const cities = [...new Set(woData.map(x => x.city).filter(Boolean))];

    select.innerHTML =
        `<option value="">Semua Kota</option>` +
        cities.map(c => `<option value="${c}">${c}</option>`).join("");
}

/* =========================
   HELPERS
========================= */

function val(id) {
    return document.getElementById(id)?.value || "";
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

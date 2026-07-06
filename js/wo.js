let editMode = false;
let woData = [];

/* =========================
   TOAST NOTIFICATION
========================= */
function showToast(message, type = "success") {

    let toast = document.getElementById("toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";

        toast.style.position = "fixed";
        toast.style.top = "20px";
        toast.style.right = "20px";
        toast.style.padding = "12px 18px";
        toast.style.color = "#fff";
        toast.style.borderRadius = "8px";
        toast.style.fontSize = "14px";
        toast.style.fontWeight = "bold";
        toast.style.zIndex = "99999";
        toast.style.opacity = "0";
        toast.style.transition = ".3s";

        document.body.appendChild(toast);
    }

    toast.style.background =
        type === "success" ? "#28a745" : "#dc3545";

    toast.innerHTML = message;
    toast.style.opacity = "1";

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.style.opacity = "0";
    }, 2500);
}

/* =========================
   DATE FORMAT
========================= */
function formatDateOnly(dateStr) {

    if (!dateStr) return "-";

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return dateStr;

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/* =========================
   FORM CONTROL
========================= */
function openForm() {
    document.getElementById("modalWO").style.display = "block";
}

function closeForm() {
    document.getElementById("modalWO").style.display = "none";
    clearForm();
    editMode = false;
}

function clearForm() {

    ["praInvoiceNumber","invoiceNumber","invoiceName","invoiceDate","periode","city","woTotal","status","jenis"]
    .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

}

/* =========================
   SAVE
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
        showToast("Pra Invoice wajib diisi", "error");
        return;
    }

    const exists = woData.some(item =>
        String(item?.praInvoiceNumber).trim() === String(data.praInvoiceNumber).trim()
    );

    if (exists && !editMode) {
        showToast("Data duplikat", "error");
        return;
    }

    try {

        const result = editMode
            ? await updateWO(data)
            : await addWO(data);

        if (!result || result.status === false) {
            showToast(result?.message || "Gagal simpan", "error");
            return;
        }

        closeForm();
        await loadTable();

        showToast(editMode ? "Update sukses" : "Tambah sukses");

    } catch (err) {
        console.error(err);
        showToast("Error sistem", "error");
    }
}

/* =========================
   LOAD TABLE
========================= */
async function loadTable() {

    try {

        const res = await getWO();

        woData = Array.isArray(res) ? res : (res?.data || []);

        applyFilter(); // penting: langsung pakai filter utama

    } catch (err) {
        console.error(err);
        woData = [];
        renderTable([]);
    }
}

/* =========================
   EDIT
========================= */
function editWO(id) {

    const item = woData.find(x => String(x?.praInvoiceNumber) === String(id));

    if (!item) return showToast("Data tidak ditemukan", "error");

    editMode = true;
    openForm();

    setValue("praInvoiceNumber", item.praInvoiceNumber);
    setValue("invoiceNumber", item.invoiceNumber);
    setValue("invoiceName", item.invoiceName);
    setValue("invoiceDate", formatDateOnly(item.invoiceDate));
    setValue("periode", item.periode);
    setValue("city", item.city);
    setValue("woTotal", item.woTotal);
    setValue("status", item.status);
    setValue("jenis", item.jenis);
}

/* =========================
   DELETE
========================= */
async function hapusWO(id) {

    if (!confirm("Hapus data ini?")) return;

    try {

        const result = await deleteWO(id);

        if (!result || result.status === false) {
            return showToast("Gagal hapus", "error");
        }

        await loadTable();
        showToast("Berhasil hapus");

    } catch (err) {
        console.error(err);
        showToast("Error hapus", "error");
    }
}

/* =========================
   FILTER (FIX FINAL CASCADING)
========================= */
function applyFilter() {

    const search = (document.getElementById("searchWO")?.value || "").toLowerCase();
    const status = document.getElementById("filterStatus")?.value || "";
    const cityEl = document.getElementById("filterCity");

    let filtered = [...woData];

    // 1. STATUS FILTER
    if (status) {
        filtered = filtered.filter(x => x.status === status);
    }

    // 2. BUILD CITY LIST DARI STATUS TERFILTER
    const cities = [...new Set(filtered.map(x => x.city).filter(Boolean))];

    if (cityEl) {

        const prev = cityEl.value;

        cityEl.innerHTML =
            `<option value="">Semua Kota</option>` +
            cities.map(c => `<option value="${c}">${c}</option>`).join("");

        cityEl.value = cities.includes(prev) ? prev : "";
    }

    // 3. CITY FILTER
    const city = cityEl?.value || "";

    if (city) {
        filtered = filtered.filter(x => x.city === city);
    }

    // 4. SEARCH
    if (search) {
        filtered = filtered.filter(x =>
            (x.praInvoiceNumber || "").toLowerCase().includes(search) ||
            (x.invoiceNumber || "").toLowerCase().includes(search) ||
            (x.invoiceName || "").toLowerCase().includes(search)
        );
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
        tbody.innerHTML = `<tr><td colspan="10">No Data</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item?.praInvoiceNumber ?? "-"}</td>
            <td>${item?.invoiceNumber ?? "-"}</td>
            <td>${item?.invoiceName ?? "-"}</td>
            <td>${formatDateOnly(item?.invoiceDate)}</td>
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
   HELPERS
========================= */
function val(id) {
    return document.getElementById(id)?.value || "";
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
}

function formatRupiah(num) {
    return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

    loadTable();

    document.getElementById("searchWO")?.addEventListener("input", applyFilter);
    document.getElementById("filterStatus")?.addEventListener("change", applyFilter);
    document.getElementById("filterCity")?.addEventListener("change", applyFilter);

});

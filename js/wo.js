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
   DATE FORMAT FIX
========================= */
function formatDateOnly(dateStr) {

    if (!dateStr) return "-";

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return dateStr;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

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
        showToast("Pra Invoice Number wajib diisi", "error");
        return;
    }

    const exists = woData.some(item =>
        String(item?.praInvoiceNumber).trim() ===
        String(data.praInvoiceNumber).trim()
    );

    if (exists && !editMode) {
        showToast("Pra Invoice sudah ada (duplikat)", "error");
        return;
    }

    try {

        let result;

        if (editMode) {
            result = await updateWO(data);
        } else {
            result = await addWO(data);
        }

        if (!result || result.status === false) {
            showToast(result?.message || "Gagal menyimpan data", "error");
            return;
        }

        closeForm();
        await loadTable();

        showToast(
            editMode
                ? "Data berhasil diperbarui"
                : "Data berhasil ditambahkan"
        );

    } catch (err) {

        console.error("SAVE ERROR:", err);
        showToast("Terjadi kesalahan saat menyimpan data", "error");

    }
}

/* =========================
   LOAD TABLE
========================= */
async function loadTable() {

    try {

        const search =
            document.getElementById("searchWO")?.value || "";

        const status =
            document.getElementById("filterStatus")?.value || "";

        const city =
            document.getElementById("filterCity")?.value || "";

        const res = await getWO();

        woData = Array.isArray(res)
            ? res
            : (res?.data || []);

        syncCityFilter();

        if (document.getElementById("searchWO"))
            document.getElementById("searchWO").value = search;

        if (document.getElementById("filterStatus"))
            document.getElementById("filterStatus").value = status;

        if (document.getElementById("filterCity"))
            document.getElementById("filterCity").value = city;

        applyFilter();

    } catch (err) {

        console.error("LOAD ERROR:", err);
        woData = [];
        renderTable([]);

    }
}

/* =========================
   EDIT
========================= */
function editWO(praInvoiceNumber) {

    const item = woData.find(x =>
        String(x?.praInvoiceNumber).trim() ===
        String(praInvoiceNumber).trim()
    );

    if (!item) {
        showToast("Data tidak ditemukan", "error");
        return;
    }

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
async function hapusWO(praInvoiceNumber) {

    if (!confirm("Yakin hapus data ini?")) return;

    try {

        const result = await deleteWO(praInvoiceNumber);

        if (!result || result.status === false) {
            showToast(result?.message || "Gagal menghapus data", "error");
            return;
        }

        await loadTable();

        showToast("Data berhasil dihapus");

    } catch (err) {

        console.error("DELETE ERROR:", err);
        showToast("Gagal menghapus data", "error");

    }
}

/* =========================
   FILTER
========================= */
function applyFilter() {

    const search = (
        document.getElementById("searchWO")?.value || ""
    ).toLowerCase();

    const status =
        document.getElementById("filterStatus")?.value || "";

    const city =
        document.getElementById("filterCity")?.value || "";

    let filtered = [...woData];

    if (search) {

        filtered = filtered.filter(item =>
            (item?.praInvoiceNumber || "")
                .toLowerCase()
                .includes(search) ||

            (item?.invoiceNumber || "")
                .toLowerCase()
                .includes(search) ||

            (item?.invoiceName || "")
                .toLowerCase()
                .includes(search)
        );

    }

    if (status) {
        filtered = filtered.filter(
            item => item.status === status
        );
    }

    if (city) {
        filtered = filtered.filter(
            item => item.city === city
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

        tbody.innerHTML =
            `<tr><td colspan="10">No Data</td></tr>`;

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
                <button onclick="editWO('${item?.praInvoiceNumber}')">
                    Edit
                </button>

                <button onclick="hapusWO('${item?.praInvoiceNumber}')">
                    Hapus
                </button>
            </td>

        </tr>
    `).join("");

}

/* =========================
   CITY FILTER
========================= */
function syncCityFilter() {

    const select =
        document.getElementById("filterCity");

    if (!select) return;

    const selected = select.value;

    const cities = [
        ...new Set(
            woData
                .map(x => x.city)
                .filter(Boolean)
        )
    ];

    select.innerHTML =
        `<option value="">Semua Kota</option>` +
        cities
            .map(c => `<option value="${c}">${c}</option>`)
            .join("");

    if (cities.includes(selected)) {
        select.value = selected;
    }

}

/* =========================
   HELPERS
========================= */
function val(id) {
    return document.getElementById(id)?.value || "";
}

function setValue(id, value) {

    const el = document.getElementById(id);

    if (el) {
        el.value = value ?? "";
    }

}

function formatRupiah(angka) {

    return "Rp " +
        Number(angka || 0)
            .toLocaleString("id-ID");

}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

    loadTable();

    document
        .getElementById("searchWO")
        ?.addEventListener("input", applyFilter);

    document
        .getElementById("filterStatus")
        ?.addEventListener("change", applyFilter);

    document
        .getElementById("filterCity")
        ?.addEventListener("change", applyFilter);

});

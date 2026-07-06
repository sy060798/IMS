let allData = [];

/* =========================
   INIT
========================= */
async function loadReport() {

    try {
        const res = await getWO();

        allData = Array.isArray(res) ? res : (res?.data || []);

        applyFilter();

    } catch (err) {
        console.error("LOAD REPORT ERROR:", err);
        allData = [];
    }
}

/* =========================
   FILTER
========================= */
function applyFilter() {

    const status = document.getElementById("filterStatus")?.value || "";
    const jenis = document.getElementById("filterJenis")?.value || "";

    let data = [...allData];

    if (jenis) {
        data = data.filter(x => x?.jenis === jenis);
    }

    if (status) {
        data = data.filter(x => x?.status === status);
    }

    render(data);
}

/* =========================
   RENDER
========================= */
function render(data = []) {

    let totalWO = data.length;
    let totalHarga = 0;
    let kotaSet = new Set();

    const html = data.map(item => {

        totalHarga += Number(item?.woTotal || 0);

        if (item?.city) {
            kotaSet.add(item.city);
        }

        return `
        <tr>
            <td>${item?.praInvoiceNumber ?? "-"}</td>
            <td>${item?.invoiceNumber ?? "-"}</td>
            <td>${item?.invoiceName ?? "-"}</td>
            <td>${item?.invoiceDate ?? "-"}</td>
            <td>${item?.periode ?? "-"}</td>
            <td>${item?.city ?? "-"}</td>
            <td>${item?.jenis ?? "-"}</td>
            <td>${item?.status ?? "-"}</td>
            <td>${formatRupiah(item?.woTotal)}</td>
        </tr>
        `;

    }).join("");

    const table = document.getElementById("reportTable");
    if (table) table.innerHTML = html;

    setText("rTotalWO", totalWO);
    setText("rTotalHarga", formatRupiah(totalHarga));
    setText("rTotalKota", kotaSet.size);
}

/* =========================
   FORMAT YEAR MONTH
========================= */
function formatYearMonth(dateStr) {

    if (!dateStr) return "-";

    const date = new Date(dateStr);

    if (isNaN(date)) return "-";

    return date.toISOString().slice(0, 7);
}

/* =========================
   FORMAT RUPIAH
========================= */
function formatRupiah(angka) {

    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

/* =========================
   SAFE HELPERS
========================= */

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

/* =========================
   INIT
========================= */

loadReport();

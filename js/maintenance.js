let dataMaintenance = [];

/* =========================
   LOAD MAINTENANCE DATA
========================= */

async function loadMaintenance() {

    try {

        const res = await getWO();

        const all = Array.isArray(res) ? res : (res?.data || []);

        dataMaintenance = all.filter(item => item?.jenis === "Maintenance");

        renderTable();

    } catch (err) {

        console.error("LOAD MAINTENANCE ERROR:", err);
        dataMaintenance = [];
    }
}

/* =========================
   RENDER TABLE
========================= */

function renderTable() {

    const tbody = document.getElementById("maintenanceTable");

    if (!tbody) return;

    if (dataMaintenance.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">No Data</td></tr>`;
        return;
    }

    const html = dataMaintenance.map(item => `
        <tr>
            <td>${item?.praInvoiceNumber ?? "-"}</td>
            <td>${item?.invoiceNumber ?? "-"}</td>
            <td>${item?.invoiceName ?? "-"}</td>
            <td>${item?.invoiceDate ?? "-"}</td>
            <td>${item?.periode ?? "-"}</td>
            <td>${item?.city ?? "-"}</td>
            <td>${item?.status ?? "-"}</td>
            <td>${formatRupiah(item?.woTotal)}</td>
        </tr>
    `).join("");

    tbody.innerHTML = html;
}

/* =========================
   FORMAT RUPIAH
========================= */

function formatRupiah(angka) {

    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

/* =========================
   INIT
========================= */

loadMaintenance();

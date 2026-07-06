let dataAktivasi = [];

/* =========================
   LOAD AKTIVASI DATA
========================= */

async function loadAktivasi() {

    try {

        const res = await getWO();

        const all = Array.isArray(res) ? res : (res?.data || []);

        dataAktivasi = all.filter(item => item?.jenis === "Aktivasi");

        renderTable();

    } catch (err) {

        console.error("LOAD AKTIVASI ERROR:", err);
        dataAktivasi = [];
    }
}

/* =========================
   RENDER TABLE
========================= */

function renderTable() {

    const tbody = document.getElementById("aktivasiTable");

    if (!tbody) return;

    if (dataAktivasi.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">No Data</td></tr>`;
        return;
    }

    const html = dataAktivasi.map(item => `
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

loadAktivasi();

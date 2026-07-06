/* =========================
   LOAD AKTIVASI DATA
========================= */

let dataAktivasi = [];

async function loadAktivasi() {

    const res = await getWO();

    const all = Array.isArray(res) ? res : (res?.data || []);

    dataAktivasi = all.filter(item => item.jenis === "Aktivasi");

    renderTable();
}

/* =========================
   RENDER TABLE
========================= */

function renderTable() {

    let html = "";

    dataAktivasi.forEach(item => {

        html += `
        <tr>
            <td>${item.praInvoiceNumber ?? "-"}</td>
            <td>${item.invoiceNumber ?? "-"}</td>
            <td>${item.invoiceName ?? "-"}</td>
            <td>${item.invoiceDate ?? "-"}</td>
            <td>${item.periode ?? "-"}</td>
            <td>${item.city ?? "-"}</td>
            <td>${item.status ?? "-"}</td>
            <td>${formatRupiah(item.woTotal)}</td>
        </tr>
        `;

    });

    document.getElementById("aktivasiTable").innerHTML = html;
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

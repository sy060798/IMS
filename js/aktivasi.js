/* =========================
   LOAD AKTIVASI DATA
========================= */

let dataAktivasi = [];

async function loadAktivasi() {

    const all = await getWO();

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
            <td>${item.woNumber}</td>
            <td>${item.jobName}</td>
            <td>${item.city}</td>
            <td>${item.status}</td>
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

    return "Rp " + Number(angka || 0)
        .toLocaleString("id-ID");
}

/* =========================
   INIT
========================= */

loadAktivasi();

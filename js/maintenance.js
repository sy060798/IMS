/* =========================
   LOAD MAINTENANCE DATA
========================= */

let dataMaintenance = [];

async function loadMaintenance() {

    const all = await getWO();

    dataMaintenance = all.filter(item => item.jenis === "Maintenance");

    renderTable();
}

/* =========================
   RENDER TABLE
========================= */

function renderTable() {

    let html = "";

    dataMaintenance.forEach(item => {

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

    document.getElementById("maintenanceTable").innerHTML = html;
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

loadMaintenance();

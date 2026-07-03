/* =========================
   REPORT DATA
========================= */

let allData = [];

/* =========================
   INIT
========================= */

async function loadReport() {

    allData = await getWO();

    applyFilter();
}

/* =========================
   FILTER
========================= */

function applyFilter() {

    let bulan = document.getElementById("filterBulan").value;
    let jenis = document.getElementById("filterJenis").value;

    let data = allData;

    if (jenis) {
        data = data.filter(x => x.jenis === jenis);
    }

    if (bulan) {
        data = data.filter(x => {
            let b = new Date(x.woStart).getMonth() + 1;
            return b == bulan;
        });
    }

    render(data);
}

/* =========================
   RENDER TABLE + SUMMARY
========================= */

function render(data) {

    let html = "";

    let totalWO = data.length;

    let totalHarga = 0;

    let kotaSet = new Set();

    data.forEach(item => {

        totalHarga += Number(item.woTotal || 0);
        kotaSet.add(item.city);

        html += `
        <tr>
            <td>${item.woNumber}</td>
            <td>${item.jobName}</td>
            <td>${item.city}</td>
            <td>${item.Wo End}</td>
            <td>${item.jenis}</td>
            <td>${item.status}</td>
            <td>${formatRupiah(item.woTotal)}</td>
            <td>${item.Pra Invoice Number}</td>
        </tr>
        `;

    });

    document.getElementById("reportTable").innerHTML = html;

    document.getElementById("rTotalWO").innerText = totalWO;
    document.getElementById("rTotalHarga").innerText = formatRupiah(totalHarga);
    document.getElementById("rTotalKota").innerText = kotaSet.size;
}

/* =========================
   FORMAT RUPIAH
========================= */

function formatRupiah(angka) {

    return "Rp " + Number(angka || 0)
        .toLocaleString("id-ID");
}

/* =========================
   INIT LOAD
========================= */

loadReport();

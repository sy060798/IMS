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
    }
}

/* =========================
   FILTER
========================= */
function applyFilter() {

    let status = document.getElementById("filterStatus").value;
    let jenis = document.getElementById("filterJenis").value;

    let data = allData;

    // filter jenis
    if (jenis) {
        data = data.filter(x => x.jenis === jenis);
    }

    // filter status
    if (status) {
        data = data.filter(x => x.status === status);
    }

    render(data);
}


/* =========================
   RENDER
========================= */
function render(data) {

    let html = "";
    let totalWO = data.length;
    let totalHarga = 0;
    let kotaSet = new Set();

    data.forEach(item => {

        totalHarga += Number(item.woTotal || 0);
        if (item.city) kotaSet.add(item.city);

        html += `
        <tr>
            <td>${item.woNumber ?? "-"}</td>
            <td>${item.jobName ?? "-"}</td>
            <td>${item.city ?? "-"}</td>
            <td>${item.woEnd ?? "-"}</td>
            <td>${item.jenis ?? "-"}</td>
            <td>${item.status ?? "-"}</td>
            <td>${formatRupiah(item.woTotal)}</td>
            <td>${item.praInvoice ?? "-"}</td>
        </tr>
        `;
    });

    document.getElementById("reportTable").innerHTML = html;

    document.getElementById("rTotalWO").innerText = totalWO;
    document.getElementById("rTotalHarga").innerText = formatRupiah(totalHarga);
    document.getElementById("rTotalKota").innerText = kotaSet.size;
}


   /* =========================
   FORMAT FUNCTION (INI TEMPATNYA)
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
   INIT
========================= */
loadReport();

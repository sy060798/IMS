/* =========================
   LOAD DASHBOARD
========================= */

let allWO = [];

async function loadDashboard() {

    allWO = await getWO();

    renderCards();
    renderRecentTable();
    renderChartBulan();
    renderChartKota();
}

/* =========================
   CARD STATISTIC
========================= */

function renderCards() {

    let totalWO = allWO.length;

    let totalHarga = allWO.reduce((sum, item) => {
        return sum + Number(item.woTotal || 0);
    }, 0);

    let aktivasi = allWO.filter(x => x.jenis === "Aktivasi").length;

    let maintenance = allWO.filter(x => x.jenis === "Maintenance").length;

    document.getElementById("totalWO").innerText = totalWO;
    document.getElementById("totalHarga").innerText = formatRupiah(totalHarga);
    document.getElementById("totalAktivasi").innerText = aktivasi;
    document.getElementById("totalMaintenance").innerText = maintenance;
}

/* =========================
   RECENT TABLE
========================= */

function renderRecentTable() {

    let recent = allWO.slice(-5).reverse();

    let html = "";

    recent.forEach(item => {

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

    document.getElementById("recentTable").innerHTML = html;
}

/* =========================
   CHART WO PER BULAN
========================= */

function renderChartBulan() {

    let bulanCount = {};

    allWO.forEach(item => {

        let date = new Date(item.woStart);
        let bulan = date.toLocaleString("id-ID", { month: "short" });

        bulanCount[bulan] = (bulanCount[bulan] || 0) + 1;
    });

    new Chart(document.getElementById("bulanChart"), {

        type: "bar",

        data: {
            labels: Object.keys(bulanCount),
            datasets: [{
                label: "WO Per Bulan",
                data: Object.values(bulanCount),
                backgroundColor: "#2563eb"
            }]
        }

    });
}

/* =========================
   CHART WO PER KOTA
========================= */

function renderChartKota() {

    let kotaCount = {};

    allWO.forEach(item => {

        let kota = item.city || "Unknown";

        kotaCount[kota] = (kotaCount[kota] || 0) + 1;
    });

    new Chart(document.getElementById("kotaChart"), {

        type: "pie",

        data: {
            labels: Object.keys(kotaCount),
            datasets: [{
                data: Object.values(kotaCount),
                backgroundColor: [
                    "#2563eb",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6"
                ]
            }]
        }

    });
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

loadDashboard();

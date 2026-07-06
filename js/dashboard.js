/* =========================
   LOAD DASHBOARD
========================= */

let allWO = [];

async function loadDashboard() {

    const res = await getWO();

    allWO = Array.isArray(res) ? res : (res?.data || []);

    renderCards();
    renderRecentTable();
    renderChartBulan();
    renderChartKota();
}

/* =========================
   CARD STATISTIC
========================= */

function renderCards() {

    const totalWO = allWO.length;

    const totalHarga = allWO.reduce((sum, item) => {
        return sum + Number(item.woTotal || 0);
    }, 0);

    const aktivasi = allWO.filter(x => x.jenis === "Aktivasi").length;
    const maintenance = allWO.filter(x => x.jenis === "Maintenance").length;

    document.getElementById("totalWO").innerText = totalWO;
    document.getElementById("totalHarga").innerText = formatRupiah(totalHarga);
    document.getElementById("totalAktivasi").innerText = aktivasi;
    document.getElementById("totalMaintenance").innerText = maintenance;
}

/* =========================
   RECENT TABLE
========================= */

function renderRecentTable() {

    const recent = allWO.slice(-5).reverse();

    let html = "";

    recent.forEach(item => {

        html += `
        <tr>
            <td>${item.praInvoiceNumber ?? "-"}</td>
            <td>${item.invoiceNumber ?? "-"}</td>
            <td>${item.invoiceName ?? "-"}</td>
            <td>${item.city ?? "-"}</td>
            <td>${item.status ?? "-"}</td>
            <td>${formatRupiah(item.woTotal)}</td>
        </tr>
        `;

    });

    document.getElementById("recentTable").innerHTML = html;
}

/* =========================
   CHART INVOICE PER BULAN
========================= */

function renderChartBulan() {

    const bulanCount = {};

    allWO.forEach(item => {

        if (!item.invoiceDate) return;

        const date = new Date(item.invoiceDate);

        if (isNaN(date)) return;

        const bulan = date.toLocaleString("id-ID", {
            month: "short",
            year: "numeric"
        });

        bulanCount[bulan] = (bulanCount[bulan] || 0) + 1;
    });

    new Chart(document.getElementById("bulanChart"), {

        type: "bar",

        data: {
            labels: Object.keys(bulanCount),
            datasets: [{
                label: "Invoice per Bulan",
                data: Object.values(bulanCount),
                backgroundColor: "#2563eb"
            }]
        }

    });
}

/* =========================
   CHART PER KOTA
========================= */

function renderChartKota() {

    const kotaCount = {};

    allWO.forEach(item => {

        const kota = item.city || "Unknown";

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
                    "#8b5cf6",
                    "#06b6d4",
                    "#ec4899",
                    "#84cc16"
                ]
            }]
        }

    });
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

loadDashboard();

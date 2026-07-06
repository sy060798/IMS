let allWO = [];

/* =========================
   LOAD DASHBOARD
========================= */

async function loadDashboard() {

    try {

        const res = await getWO();

        allWO = Array.isArray(res) ? res : (res?.data || []);

        renderCards();
        renderRecentTable();
        renderChartBulan();
        renderChartKota();

    } catch (err) {

        console.error("LOAD DASHBOARD ERROR:", err);
        allWO = [];
    }
}

/* =========================
   CARD STATISTIC
========================= */

function renderCards() {

    const totalWO = allWO.length;

    const totalHarga = allWO.reduce((sum, item) => {
        return sum + Number(item?.woTotal || 0);
    }, 0);

    const aktivasi = allWO.filter(x => x?.jenis === "Aktivasi").length;
    const maintenance = allWO.filter(x => x?.jenis === "Maintenance").length;

    setText("totalWO", totalWO);
    setText("totalHarga", formatRupiah(totalHarga));
    setText("totalAktivasi", aktivasi);
    setText("totalMaintenance", maintenance);
}

/* =========================
   RECENT TABLE
========================= */

function renderRecentTable() {

    const recent = [...allWO].slice(-5).reverse();

    const html = recent.map(item => `
        <tr>
            <td>${item?.praInvoiceNumber ?? "-"}</td>
            <td>${item?.invoiceNumber ?? "-"}</td>
            <td>${item?.invoiceName ?? "-"}</td>
            <td>${item?.city ?? "-"}</td>
            <td>${item?.status ?? "-"}</td>
            <td>${formatRupiah(item?.woTotal)}</td>
        </tr>
    `).join("");

    const table = document.getElementById("recentTable");
    if (table) table.innerHTML = html;
}

/* =========================
   CHART INVOICE PER BULAN
========================= */

function renderChartBulan() {

    const bulanCount = {};

    allWO.forEach(item => {

        if (!item?.invoiceDate) return;

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

        const kota = item?.city || "Unknown";

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
   HELPERS
========================= */

function formatRupiah(angka) {
    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

/* =========================
   INIT
========================= */

loadDashboard();

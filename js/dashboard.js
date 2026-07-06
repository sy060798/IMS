let allWO = [];

/* =========================
   INIT
========================= */
window.addEventListener("load", () => {
    loadDashboard();
});

/* =========================
   LOAD DASHBOARD
========================= */
async function loadDashboard() {

    try {

        const res = await getWO();
        allWO = Array.isArray(res) ? res : (res?.data || []);

        renderCards();
        renderCharts();
        renderPendingList();
        renderProgressList();

    } catch (err) {
        console.error("LOAD DASHBOARD ERROR:", err);
    }
}

/* =========================
   NORMALIZER
========================= */
function normalizeStatus(status) {
    return (status || "")
        .toString()
        .trim()
        .toLowerCase();
}

function normalizeNumber(val) {
    return Number(String(val || 0).replace(/[^0-9]/g, "")) || 0;
}

/* =========================
   CARDS
========================= */
function renderCards() {

    let revenue = 0;

    let open = 0;
    let close = 0;
    let pending = 0;
    let progress = 0;

    let closeRevenue = 0;
    let pendingRevenue = 0;
    let progressRevenue = 0;

    allWO.forEach(item => {

        const status = normalizeStatus(item?.status);
        const total = normalizeNumber(item?.woTotal);

        revenue += total;

        if (status === "open") {
            open++;
        }
        else if (status === "close") {
            close++;
            closeRevenue += total;
        }
        else if (status === "pending") {
            pending++;
            pendingRevenue += total;
        }
        else if (status === "progress") {
            progress++;
            progressRevenue += total;
        }
    });

    setText("totalHarga", formatRupiah(revenue));
    setText("totalOpen", open);
    setText("totalClose", close);
    setText("totalPending", pending);
    setText("totalProgress", progress);

    setText("totalCloseRevenue", formatRupiah(closeRevenue));
    setText("totalPendingRevenue", formatRupiah(pendingRevenue));
    setText("totalProgressRevenue", formatRupiah(progressRevenue));
}

/* =========================
   CHARTS (SAFE REINIT FIX)
========================= */
let pieChart;
let barChart;

function renderCharts() {

    const pieEl = document.getElementById("statusPie");
    const barEl = document.getElementById("statusBar");

    if (!pieEl || !barEl) return;

    let open = 0;
    let close = 0;
    let pending = 0;
    let progress = 0;

    allWO.forEach(item => {

        const status = normalizeStatus(item?.status);

        if (status === "open") open++;
        else if (status === "close") close++;
        else if (status === "pending") pending++;
        else if (status === "progress") progress++;
    });

    // destroy old chart biar tidak error
    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();

    pieChart = new Chart(pieEl, {
        type: "pie",
        data: {
            labels: ["Open", "Close", "Pending", "Progress"],
            datasets: [{
                data: [open, close, pending, progress],
                backgroundColor: [
                    "#f59e0b",
                    "#10b981",
                    "#ef4444",
                    "#3b82f6"
                ]
            }]
        }
    });

    barChart = new Chart(barEl, {
        type: "bar",
        data: {
            labels: ["Open", "Close", "Pending", "Progress"],
            datasets: [{
                data: [open, close, pending, progress],
                backgroundColor: [
                    "#f59e0b",
                    "#10b981",
                    "#ef4444",
                    "#3b82f6"
                ]
            }]
        }
    });
}

/* =========================
   PENDING LIST
========================= */
function renderPendingList() {

    const pendingData = allWO.filter(item =>
        normalizeStatus(item?.status) === "pending"
    );

    const html = pendingData.map(item => `
        <tr>
            <td>${item?.praInvoiceNumber ?? "-"}</td>
            <td>${item?.invoiceName ?? "-"}</td>
            <td>${item?.city ?? "-"}</td>
            <td>${formatRupiah(item?.woTotal)}</td>
        </tr>
    `).join("");

    const table = document.getElementById("pendingTable");
    if (table) table.innerHTML = html;
}

/* =========================
   PROGRESS LIST
========================= */
function renderProgressList() {

    const progressData = allWO.filter(item =>
        normalizeStatus(item?.status) === "progress"
    );

    const html = progressData.map(item => `
        <tr>
            <td>${item?.praInvoiceNumber ?? "-"}</td>
            <td>${item?.invoiceName ?? "-"}</td>
            <td>${item?.city ?? "-"}</td>
            <td>${formatRupiah(item?.woTotal)}</td>
        </tr>
    `).join("");

    const table = document.getElementById("progressTable");
    if (table) table.innerHTML = html;
}

/* =========================
   HELPERS
========================= */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

function formatRupiah(num) {
    return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

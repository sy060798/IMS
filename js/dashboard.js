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

    } catch (err) {
        console.error("LOAD DASHBOARD ERROR:", err);
    }
}

/* =========================
   NORMALIZER (IMPORTANT)
========================= */
function normalizeStatus(status) {
    return (status || "")
        .toString()
        .trim()
        .toLowerCase();
}

function normalizeNumber(val) {
    return Number(
        String(val || 0).replace(/[^0-9]/g, "")
    ) || 0;
}

/* =========================
   CARDS (FIXED ACCURATE)
========================= */
function renderCards() {

    let revenue = 0;
    let open = 0;
    let close = 0;
    let pending = 0;

    let closeRevenue = 0;
    let pendingRevenue = 0;

    allWO.forEach(item => {

        const status = normalizeStatus(item?.status);
        const total = normalizeNumber(item?.woTotal);

        revenue += total;

        if (status === "open") {
            open++;
        }

        if (status === "close") {
            close++;
            closeRevenue += total;
        }

        if (status === "pending") {
            pending++;
            pendingRevenue += total;
        }
    });

    setText("totalHarga", formatRupiah(revenue));
    setText("totalOpen", open);
    setText("totalClose", close);
    setText("totalPending", pending);

    setText("totalCloseRevenue", formatRupiah(closeRevenue));
    setText("totalPendingRevenue", formatRupiah(pendingRevenue));
}

/* =========================
   CHARTS
========================= */
function renderCharts() {

    const pieEl = document.getElementById("statusPie");
    const barEl = document.getElementById("statusBar");

    if (!pieEl || !barEl) return;

    let open = 0;
    let close = 0;
    let pending = 0;

    allWO.forEach(item => {

        const status = normalizeStatus(item?.status);

        if (status === "open") open++;
        if (status === "close") close++;
        if (status === "pending") pending++;
    });

    new Chart(pieEl, {
        type: "pie",
        data: {
            labels: ["Open", "Close", "Pending"],
            datasets: [{
                data: [open, close, pending],
                backgroundColor: ["#f59e0b", "#10b981", "#ef4444"]
            }]
        }
    });

    new Chart(barEl, {
        type: "bar",
        data: {
            labels: ["Open", "Close"],
            datasets: [{
                data: [open, close],
                backgroundColor: ["#f59e0b", "#10b981"]
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
   HELPERS
========================= */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

function formatRupiah(num) {
    return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

let allWO = [];

/* =========================
   INIT SAFE
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

    } catch (err) {
        console.error("LOAD DASHBOARD ERROR:", err);
    }
}

/* =========================
   CARDS
========================= */
function renderCards() {

    let revenue = 0;
    let open = 0;
    let close = 0;
    let pending = 0;

    allWO.forEach(item => {

        revenue += Number(item?.woTotal || 0);

        if (item.status === "Open") open++;
        if (item.status === "Close") close++;
        if (item.status === "Pending") pending++;
    });

    setText("totalHarga", formatRupiah(revenue));
    setText("totalOpen", open);
    setText("totalClose", close);
    setText("totalPending", pending);
}

/* =========================
   CHARTS (ONLY 2)
========================= */
function renderCharts() {

    const pieEl = document.getElementById("statusPie");
    const barEl = document.getElementById("statusBar");

    if (!pieEl || !barEl) {
        console.error("Canvas tidak ditemukan");
        return;
    }

    let open = 0;
    let close = 0;
    let pending = 0;

    allWO.forEach(item => {

        if (item.status === "Open") open++;
        if (item.status === "Close") close++;
        if (item.status === "Pending") pending++;
    });

    // PIE
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

    // BAR
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
   HELPERS
========================= */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

function formatRupiah(num) {
    return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

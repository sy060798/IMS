let allWO = [];

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
        allWO = [];
    }
}

/* =========================
   CARD STATISTIC (NEW VERSION)
========================= */
function renderCards() {

    let totalRevenue = 0;
    let open = 0;
    let close = 0;
    let pending = 0;

    allWO.forEach(item => {

        totalRevenue += Number(item?.woTotal || 0);

        if (item.status === "Open") open++;
        if (item.status === "Close") close++;
        if (item.status === "Pending") pending++;
    });

    setText("totalHarga", formatRupiah(totalRevenue));
    setText("totalOpen", open);
    setText("totalClose", close);
    setText("totalPending", pending);
}

/* =========================
   CHARTS (PIE + BAR)
========================= */
function renderCharts() {

    let open = 0;
    let close = 0;
    let pending = 0;

    allWO.forEach(item => {

        if (item.status === "Open") open++;
        if (item.status === "Close") close++;
        if (item.status === "Pending") pending++;
    });

    /* =========================
       PIE CHART (STATUS ONLY)
    ========================= */
    new Chart(document.getElementById("statusPie"), {
        type: "pie",
        data: {
            labels: ["Open", "Close", "Pending"],
            datasets: [{
                data: [open, close, pending],
                backgroundColor: [
                    "#f59e0b",
                    "#10b981",
                    "#ef4444"
                ]
            }]
        }
    });

    /* =========================
       BAR CHART (OPEN vs CLOSE)
    ========================= */
    new Chart(document.getElementById("statusBar"), {
        type: "bar",
        data: {
            labels: ["Open", "Close"],
            datasets: [{
                label: "Total Status",
                data: [open, close],
                backgroundColor: [
                    "#f59e0b",
                    "#10b981"
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

let editMode = false;
let woData = [];

/* OPEN */
function openForm() {
    document.getElementById("modalWO").style.display = "block";
}

/* CLOSE */
function closeForm() {
    document.getElementById("modalWO").style.display = "none";
    clearForm();
    editMode = false;
}

/* CLEAR FORM */
function clearForm() {

    const fields = [
        "woNumber","reference","quotation","woStart","woEnd",
        "jobName","area","city","boq","woTotal",
        "status","praInvoice","invoice","jenis"
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

/* SAVE */
async function saveWO() {

    const data = {
        woNumber: document.getElementById("woNumber").value,
        reference: document.getElementById("reference").value,
        quotation: document.getElementById("quotation").value,
        woStart: document.getElementById("woStart").value,
        woEnd: document.getElementById("woEnd").value,
        jobName: document.getElementById("jobName").value,
        area: document.getElementById("area").value,
        city: document.getElementById("city").value,
        boq: document.getElementById("boq").value,
        woTotal: document.getElementById("woTotal").value,
        status: document.getElementById("status").value,
        praInvoice: document.getElementById("praInvoice").value,
        invoice: document.getElementById("invoice").value,
        jenis: document.getElementById("jenis").value
    };

    if (editMode) {
        await updateWO(data);
    } else {
        await addWO(data);
    }

    closeForm();
    loadTable();
}

/* EDIT */
function editWO(woNumber) {

    const item = woData.find(x => x.woNumber === woNumber);
    if (!item) return;

    editMode = true;
    openForm();

    Object.keys(item).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = item[key];
    });
}

/* LOAD */
async function loadTable() {

    const res = await getWO();

    woData = res;

    renderTable(res);
}

/* RENDER */
function renderTable(data) {

    const tbody = document.getElementById("tableBody");
    if (!tbody) return;

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="6">No Data</td></tr>`;
        return;
    }

    let html = "";

    data.forEach(item => {

        html += `
        <tr>
            <td>${item.woNumber || ""}</td>
            <td>${item.jobName || ""}</td>
            <td>${item.city || ""}</td>
            <td>${item.status || ""}</td>
            <td>${item.woTotal || ""}</td>
            <td>
                <button onclick="editWO('${item.woNumber}')">Edit</button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

/* INIT */
loadTable();

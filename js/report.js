let allData = [];

/* =========================
   INIT
========================= */
async function loadReport() {

    try {

        const res = await getWO();

        allData = Array.isArray(res)
            ? res
            : (res?.data || []);

        applyFilter();

    } catch (err) {

        console.error("LOAD REPORT ERROR:", err);

        allData = [];

        render([]);

    }

}


/* =========================
   GET FILTERED DATA
   Dipakai untuk TABLE & EXCEL
========================= */
function getFilteredData() {

    const status =
        document.getElementById("filterStatus")?.value || "";

    const jenis =
        document.getElementById("filterJenis")?.value || "";

    let data = [...allData];


    // Filter Jenis
    if (jenis) {

        data = data.filter(x =>
            x?.jenis === jenis
        );

    }


    // Filter Status
    if (status) {

        data = data.filter(x =>
            x?.status === status
        );

    }


    return data;

}


/* =========================
   FILTER
========================= */
function applyFilter() {

    const data = getFilteredData();

    render(data);

}


/* =========================
   RENDER REPORT
========================= */
function render(data = []) {

    let totalWO = data.length;

    let totalHarga = 0;

    let kotaSet = new Set();


    const html = data.map(item => {

        totalHarga += Number(
            item?.woTotal || 0
        );


        if (item?.city) {

            kotaSet.add(item.city);

        }


        return `
            <tr>

                <td>
                    ${item?.praInvoiceNumber ?? "-"}
                </td>

                <td>
                    ${item?.invoiceNumber ?? "-"}
                </td>

                <td>
                    ${item?.invoiceName ?? "-"}
                </td>

                <td>
                    ${item?.periode ?? "-"}
                </td>

                <td>
                    ${item?.city ?? "-"}
                </td>

                <td>
                    ${item?.jenis ?? "-"}
                </td>

                <td>
                    ${item?.status ?? "-"}
                </td>

                <td>
                    ${formatRupiah(item?.woTotal)}
                </td>

            </tr>
        `;

    }).join("");


    const table =
        document.getElementById("reportTable");


    if (table) {

        table.innerHTML = html;

    }


    setText(
        "rTotalWO",
        totalWO
    );


    setText(
        "rTotalHarga",
        formatRupiah(totalHarga)
    );


    setText(
        "rTotalKota",
        kotaSet.size
    );

}


/* =========================
   FORMAT RUPIAH
========================= */
function formatRupiah(angka) {

    return "Rp " +
        Number(angka || 0)
            .toLocaleString("id-ID");

}


/* =========================
   SAFE HELPER
========================= */
function setText(id, value) {

    const el =
        document.getElementById(id);

    if (el) {

        el.innerText = value;

    }

}


/* =========================
   EXPORT EXCEL
========================= */
function exportExcel() {

    // Cek library XLSX
    if (typeof XLSX === "undefined") {

        alert(
            "Library Excel belum tersedia."
        );

        console.error(
            "XLSX tidak ditemukan. Pastikan SheetJS sudah dipanggil di HTML."
        );

        return;

    }


    // Ambil data yang SAMA dengan tabel
    const data = getFilteredData();


    // Tidak ada data
    if (!data.length) {

        alert(
            "Tidak ada data untuk di-export."
        );

        return;

    }


    // Konversi ke data Excel
    const excelData = data.map(item => ({

        "Pra Invoice Number":
            item?.praInvoiceNumber ?? "-",

        "Invoice Number":
            item?.invoiceNumber ?? "-",

        "Invoice Name":
            item?.invoiceName ?? "-",

        "Periode":
            item?.periode ?? "-",

        "Kota":
            item?.city ?? "-",

        "Jenis":
            item?.jenis ?? "-",

        "Status":
            item?.status ?? "-",

        "Total WO":
            Number(item?.woTotal || 0)

    }));


    // Buat worksheet
    const worksheet =
        XLSX.utils.json_to_sheet(excelData);


    // Atur lebar kolom
    worksheet["!cols"] = [

        { wch: 22 }, // Pra Invoice

        { wch: 22 }, // Invoice Number

        { wch: 30 }, // Invoice Name

        { wch: 15 }, // Periode

        { wch: 20 }, // Kota

        { wch: 15 }, // Jenis

        { wch: 15 }, // Status

        { wch: 20 }  // Total

    ];


    // Buat workbook
    const workbook =
        XLSX.utils.book_new();


    // Tambahkan worksheet
    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Report WO"
    );


    // Ambil filter aktif
    const status =
        document.getElementById("filterStatus")?.value || "";

    const jenis =
        document.getElementById("filterJenis")?.value || "";


    // Nama file
    const jenisName =
        jenis || "SemuaJenis";

    const statusName =
        status || "SemuaStatus";


    const fileName =
        `Report_WO_${jenisName}_${statusName}.xlsx`;


    // Download
    XLSX.writeFile(
        workbook,
        fileName
    );

}


/* =========================
   LOAD DATA
========================= */
loadReport();

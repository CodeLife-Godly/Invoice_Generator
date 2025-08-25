const form = document.getElementById('invoice-form');

document.addEventListener('DOMContentLoaded', () => {
  console.log("Script loaded and ready!");

  populateOwnerList();
  populateTenantList();

  const dateInput = document.getElementById('invoice-date');
  const invoiceList = document.getElementById('invoice-list');
  const tenantFilter = document.getElementById('tenant-filter');
  const ownerFilter = document.getElementById('owner-filter');
  const dateFilter = document.getElementById('date-filter');
  const fyfilter = document.getElementById('fy-filter');
  const enterModeDiv = document.getElementById('enter-mode');
  const fetchModeDiv = document.getElementById('fetch-mode');

  // Set default to today's date
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  function saveTenant(tenantName, gst, address) {
    let tenants = JSON.parse(localStorage.getItem('tenants')) || {};
    
    tenants[tenantName] = { gst, address };
    localStorage.setItem('tenants', JSON.stringify(tenants));
    populateTenantList();
  }

  function saveOwner(ownerName, gst, address,acc,ifsc,bankname,branchname,courts) {
    let owners = JSON.parse(localStorage.getItem('owners')) || {};
    
    owners[ownerName] = { gst, address, acc, ifsc, bankname,branchname,courts};
    localStorage.setItem('owners', JSON.stringify(owners));
    populateOwnerList();
  }

  // Autofill tenant info
  function autofillTenant(name) {
    const tenants = JSON.parse(localStorage.getItem("tenants")) || {};
    if (tenants[name]) {
        document.getElementById("gst-tenant").value = tenants[name].gst;
        document.getElementById("tenant-address").value = tenants[name].address;
    } 
    else{
        document.getElementById("gst-tenant").value = document.getElementById("gst-tenant").defaultValue;
        document.getElementById("tenant-address").value = "";
    } 
    }

  // Save owner info if new
  function autofillOwner(name) {
    const owners = JSON.parse(localStorage.getItem("owners")) || {};
    if (owners[name]) {
        document.getElementById("gst-owner").value = owners[name].gst;
        document.getElementById("owner-address").value = owners[name].address;
        document.getElementById("AC").value = owners[name].acc;
        document.getElementById("IFSC").value = owners[name].ifsc;  
        document.getElementById("bank-name").value = owners[name].bankname;
        document.getElementById("branch-name").value = owners[name].branchname;
        document.getElementById("court").value = owners[name].courts;
    }
    else{
        document.getElementById("gst-owner").value = document.getElementById("gst-owner").defaultValue;
        document.getElementById("owner-address").value = "";
        document.getElementById("AC").value = document.getElementById("AC").defaultValue;
        document.getElementById("IFSC").value = document.getElementById("IFSC").defaultValue;  
        document.getElementById("bank-name").value = document.getElementById("bank-name").defaultValue;
        document.getElementById("branch-name").value = document.getElementById("branch-name").defaultValue; 
        document.getElementById("court").value = document.getElementById("court").defaultValue;
        }
    }

    function updateTenantDropdown() {
    const tenantList = document.getElementById("tenant-list");
    tenantList.innerHTML = ""; // clear old entries

    const tenants = JSON.parse(localStorage.getItem("tenants")) || {};
    Object.keys(tenants).forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        tenantList.appendChild(option);
    });
    }

    function updateOwnerDropdown() {
    const ownerList = document.getElementById("owner-list");
    ownerList.innerHTML = "";

    const owners = JSON.parse(localStorage.getItem("owners")) || {};
    Object.keys(owners).forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        ownerList.appendChild(option);
    });
    }

    document.getElementById("tenant-name").addEventListener("input", (e) => {
    autofillTenant(e.target.value.trim());
    });
    document.getElementById("owner-name").addEventListener("input", (e) => {
    autofillOwner(e.target.value.trim());
    });

    form.addEventListener('submit', function(e) {
    e.preventDefault();

    const tenant = document.getElementById('tenant-name').value.trim();
    const gst_tenant = document.getElementById('gst-tenant').value.trim();

    const tenant_address = document.getElementById('tenant-address').value.trim();

    const owner = document.getElementById('owner-name').value.trim();
    const gst_owner = document.getElementById('gst-owner').value.trim();

    const owner_address = document.getElementById('owner-address').value.trim();
    const owner_acc = document.getElementById('AC').value;
    const owner_ifsc = document.getElementById('IFSC').value;

    const bank_name = document.getElementById('bank-name').value.trim();
    const branch_name = document.getElementById('branch-name').value.trim();
    const court = document.getElementById("court").value.trim();


    saveOwner(owner,gst_owner,owner_address,owner_acc,owner_ifsc,bank_name,branch_name,court);
    updateOwnerDropdown();
    saveTenant(tenant,gst_tenant,tenant_address);
    updateTenantDropdown();

    const monthof = document.getElementById('month-of').value;
    const monthyear = formatMonthYear(monthof);
    const SAC = document.getElementById('sac').value.trim();
    const baseAmount = parseFloat(document.getElementById('rent').value.trim());
    const sgst_rate = document.getElementById('sgst').value;
    const cgst_rate = document.getElementById('cgst').value;
    const sgst = (baseAmount * sgst_rate) / 100;
    const cgst = (baseAmount * cgst_rate) / 100;
    const total = baseAmount + sgst + cgst;


    const invoiceDate = dateInput.value;
    const dateObj = new Date(invoiceDate);
    const financialYear = getFinancialYear(dateObj);
    const formattedDate = String(dateObj.getDate()).padStart(2, '0') + '-' +
                          String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                          dateObj.getFullYear();
    const monthName = dateObj.toLocaleString('default', { month: 'long' });
    const year = dateObj.getFullYear();
    const monthYear = `${monthName} ${year}`;


    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    let invoice = { monthof, monthyear, monthYear, financialYear, gst_tenant, gst_owner, tenant_address, owner_address, tenant, owner, bank_name,branch_name,owner_acc,owner_ifsc, court, baseAmount, sgst, cgst, sgst_rate, cgst_rate, total, SAC, date: formattedDate, timestamp: new Date().toLocaleString() };

    const editing = form.dataset.editingInvoice;

    if (editing) {
        const [invoiceNumberStr] = editing.split('-');
        const invoiceNumber = parseInt(invoiceNumberStr);

        const index = invoices.findIndex(inv => 
            inv.invoiceNumber === invoiceNumber
        );
        if (index !== -1) {
            invoice.invoiceNumber = parseInt(invoiceNumber); 
            invoice.financialYear = invoices[index].financialYear;
            invoices[index] = invoice; 
        }
        delete form.dataset.editingInvoice; // clear editing flag
    } else {
        let invoiceCounts = JSON.parse(localStorage.getItem('invoiceCounts')) || {};
        let invoiceNumber = 1;

        if (invoiceCounts[financialYear]) invoiceNumber = invoiceCounts[financialYear] + 1;
        invoiceCounts[financialYear] = invoiceNumber;
        localStorage.setItem('invoiceCounts', JSON.stringify(invoiceCounts));
        invoice.invoiceNumber = invoiceNumber;
        invoices.push(invoice);
    }

    localStorage.setItem('invoices', JSON.stringify(invoices));

    displayInvoices();

    window.alert("Invoice saved!");

    if(!editing){
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0]; // reset to today
    } 
});

    //selecting enter mode
  document.getElementById('enter').onclick = () => {
    enterModeDiv.style.display = 'block';
    fetchModeDiv.style.display = 'none';
  };

  //selecting fetch 
  document.getElementById('fetch').onclick = () => {
    enterModeDiv.style.display = 'none';
    fetchModeDiv.style.display = 'block';
    displayInvoices();
  };

  document.getElementById('update-report').addEventListener("click",updateReport);  //no ()

 function updateReport() {
    const reportDiv = document.getElementById('report-table');
    if (!reportDiv || reportDiv.innerHTML.trim() === "") {
        alert("No report to update! Please generate a report first.");
        return;
    }

    let rows = Array.from(reportDiv.querySelectorAll("tr"));
    let checkedCount = 0;

    rows.forEach((row, index) => {
        const checkbox = row.querySelector("input[type='checkbox']");
        if (index === 0) return; // skip header row
        if (checkbox && checkbox.checked) {
            checkedCount++;
        }
    });

    if (checkedCount === 0) {
        alert("⚠️ Please select at least one checkbox first to update the report!");
        return; 
    }

    const lastRow = rows[rows.length - 1];
    if (lastRow && lastRow.cells[0] && lastRow.cells[0].innerText === "TOTAL") {
        lastRow.remove();
        rows.pop();
    }

    rows.forEach((row, index) => {
        const checkbox = row.querySelector("input[type='checkbox']");
        if (index === 0) return; // always keep header row
        if (checkbox && !checkbox.checked) {
            row.remove();
        }
    });

    let total_amount = 0, total_sgst = 0, total_cgst = 0, grand_total = 0;
    rows = Array.from(reportDiv.querySelectorAll("tr"));
    let serial = 1;

    rows.forEach((row, index) => {
        if (index === 0) return; // skip header
        row.cells[0].textContent = serial++ ;
        const cells = row.querySelectorAll("td");
        if (cells.length >= 9) { // ensure row has data cells
            total_amount += parseFloat(cells[5].innerText) || 0;
            total_sgst += parseFloat(cells[6].innerText) || 0;
            total_cgst += parseFloat(cells[7].innerText) || 0;
            grand_total += parseFloat(cells[8].innerText) || 0;
        }
    });

    const newTotalRow = document.createElement("tr");
    newTotalRow.innerHTML = `
        <td style="text-align:center" colspan="5">TOTAL</td>
        <td style="text-align:center">${total_amount.toFixed(2)}</td>
        <td style="text-align:center">${total_sgst.toFixed(2)}</td>
        <td style="text-align:center">${total_cgst.toFixed(2)}</td>
        <td style="text-align:center">${grand_total.toFixed(2)}</td>
    `;
    reportDiv.querySelector("table").appendChild(newTotalRow);
}

  function displayInvoices() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];

    if (invoices.length === 0) {
        invoiceList.innerHTML = '<p>No invoices found.</p>';
        ownerFilter.innerHTML = '<option value="">-- All Owners --</option>';
        fyfilter.innerHTML = '<option value="">-- All FY --</option>';
        tenantFilter.innerHTML = '<option value="">-- All Tenants --</option>';
        dateFilter.innerHTML = '<option value="">-- All Dates --</option>';
        return;
    }

    // Populate tenant dropdown
    const uniqueTenants = [...new Set(invoices.map(inv => inv.tenant))];
    tenantFilter.innerHTML = '<option value="">-- All Tenants --</option>';
    uniqueTenants.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        tenantFilter.appendChild(option);
    });

    // Populate owner dropdown
    const uniqueOwners = [...new Set(invoices.map(inv => inv.owner))];
    ownerFilter.innerHTML = '<option value="">-- All Owners --</option>';
    uniqueOwners.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        ownerFilter.appendChild(option);
    });


    // Populate date dropdown
    const uniqueDates = [...new Set(invoices.map(inv => inv.date))];
    dateFilter.innerHTML = '<option value="">-- All Dates --</option>';
    uniqueDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateFilter.appendChild(option);
    });

    const uniquefy = [...new Set(invoices.map(inv => inv.financialYear))];
    fyfilter.innerHTML = '<option value = "">--ALL F.Y --</option>';
    uniquefy.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        fyfilter.appendChild(option);
    });
  
    generateReport();

    tenantFilter.onchange = () => {
        generateReport();
    } 
    dateFilter.onchange = () =>{
        generateReport();
    } 
    fyfilter.onchange = () => {
        generateReport();
    }
    ownerFilter.onchange = () => {
        generateReport();
    }
}

  function renderFilteredInvoices() {
        const allInvoices = JSON.parse(localStorage.getItem('invoices')) || [];

        const selectedKeys = Array
            .from(document.querySelectorAll('.invoiceSelect:checked'))
            .map(cb => cb.value);

        const wants = new Set(selectedKeys);

        const filtered = allInvoices.filter(inv =>
            wants.has(`${inv.financialYear}:${inv.invoiceNumber}`)
        );

        const invoiceList = document.getElementById('invoice-list');
        invoiceList.innerHTML = '';

    filtered.forEach(inv =>{
        const div = document.createElement('div');
        div.style.border = '1px solid #ccc';
        div.style.margin = '10px 0';
        div.style.padding = '10px';

        const originalId = `print-${inv.invoiceNumber}-Original`;
        const duplicateId = `print-${inv.invoiceNumber}-Copy`;

        div.innerHTML = `
            <div class="print-invoice print-only" id="${originalId}">
                ${renderInvoiceHTML(inv, "Original")}
                <div style="margin-top: 10px;">
                    <button class="delete-btn" data-invoice="${inv.invoiceNumber}" data-year="${inv.financialYear}" 
                        style="padding:6px 12px; background:#f44336; color:#fff; border:none; cursor:pointer;">
                        🗑 Delete Invoice
                    </button>
                    <button class="print-btn" data-id="${originalId}" 
                        style="padding:6px 12px; margin-left:5px;">🖨 Print Original</button>
                    <button class="edit-btn" data-invoice="${inv.invoiceNumber}" data-year="${inv.financialYear}" 
                        style="padding:6px 12px; margin-left:5px; background:#4CAF50; color:white; border:none; cursor:pointer;">
                        ✏️ Edit Invoice
                    </button>
                </div>
            </div>

            <hr style="border:2px dashed #000; margin:40px 0;">

            <div class="print-invoice print-only" id="${duplicateId}">
                ${renderInvoiceHTML(inv, "Copy")}
                <div style="margin-top: 10px;">
                    <button class='delete-btn' data-invoice="${inv.invoiceNumber}" data-year="${inv.financialYear}" 
                        style="padding:6px 12px; background:#f44336; color:#fff; border:none; cursor:pointer;">
                        🗑 Delete Invoice
                    </button>
                    <button class="print-btn" data-id="${duplicateId}" 
                        style="padding:6px 12px; margin-left:5px;">🖨 Print Copy</button>
                    <button class="edit-btn" data-invoice="${inv.invoiceNumber}" data-year="${inv.financialYear}" 
                        style="padding:6px 12px; margin-left:5px; background:#4CAF50; color:white; border:none; cursor:pointer;">
                        ✏️ Edit Invoice
                    </button>
                </div>
            </div>
        `;

        invoiceList.appendChild(div);

        // Attach delete event listeners
        div.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.invoice);
                const year = btn.dataset.year;
                deleteInvoice(number, year);
            });
        });

        // Attach print event listeners
        div.querySelectorAll('.print-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const elementId = btn.dataset.id;
                printInvoice(elementId);
            });
        });

        // Attach edit event listeners
        div.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.invoice);
                const year = btn.dataset.year;
                editInvoice(number, year);
            });
        });
    });
  }

  function generateReport() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];

    // filters
    const fy = document.getElementById('fy-filter').value;
    const ownerValue = document.getElementById('owner-filter').value;
    const tenantValue = document.getElementById('tenant-filter').value;
    const dateValue = document.getElementById('date-filter').value;

    const filtered = invoices.filter(inv => {
        const matchTenant = tenantValue ? inv.tenant === tenantValue : true;
        const matchDate   = dateValue ? inv.date === dateValue : true;
        const matchFY     = fy ? inv.financialYear === fy : true;
        const matchOwner  = ownerValue ? inv.owner === ownerValue : true;
        return matchTenant && matchDate && matchFY && matchOwner;
    });

    const reportDiv = document.getElementById('report-table');
    if (!filtered.length) {
        reportDiv.innerHTML = '<p>No invoices for this selection.</p>';
        return;
    }


    let totalBase = 0, totalSgst = 0, totalCgst = 0, totalGrand = 0;

    let tableHTML = `
        <table border="1" cellpadding="5" cellspacing="0">
        <thead>
            <tr>
            <th>SN</th>
            <th>Invoice No</th>
            <th>Date</th>
            <th>Tenant</th>
            <th>Owner</th>
            <th>Base Amount</th>
            <th>SGST</th>
            <th>CGST</th>
            <th>Total</th>
            <th>
                Get Invoice:<br>
                <input type="checkbox" id="select-all-invoices" />
            </th>
            </tr>
        </thead>
        <tbody>
    `;

    filtered.forEach((inv, i) => {
        totalBase  += Number(inv.baseAmount) || 0;
        totalSgst  += Number(inv.sgst) || 0;
        totalCgst  += Number(inv.cgst) || 0;
        totalGrand += Number(inv.total) || 0;

        const key = `${inv.financialYear}:${inv.invoiceNumber}`;
        tableHTML += `
        <tr>
            <td style="text-align:center">${i + 1}</td>
            <td>${inv.financialYear}/${inv.invoiceNumber}</td>
            <td>${inv.date}</td>
            <td>${inv.tenant}</td>
            <td>${inv.owner}</td>
            <td style="text-align:center">${(inv.baseAmount)}</td>
            <td style="text-align:center">${(inv.sgst)}</td>
            <td style="text-align:center">${(inv.cgst)}</td>
            <td style="text-align:center">${(inv.total)}</td>
            <td style="text-align:center">
            <input type="checkbox" class="invoiceSelect" value="${key}">
            </td>
        </tr>
        `;
    });

    tableHTML += `
        </tbody>
        <tfoot>
            <tr>
            <td style="text-align:center" colspan="5">TOTAL</td>
            <td style="text-align:center">${(totalBase)}</td>
            <td style="text-align:center">${(totalSgst)}</td>
            <td style="text-align:center">${(totalCgst)}</td>
            <td style="text-align:center">${(totalGrand)}</td>
            <td></td>
            </tr>
        </tfoot>
        </table>
    `;

    reportDiv.innerHTML = tableHTML;

    // "Select all" behavior
    const selectAll = document.getElementById('select-all-invoices');
    if (selectAll) {
        selectAll.addEventListener('change', () => {
            document.querySelectorAll('.invoiceSelect').forEach(cb => {
            cb.checked = selectAll.checked;
            });
            renderFilteredInvoices();
        });
    }

    //individual select behaviour
    document.querySelectorAll('.invoiceSelect').forEach(cb => {
        cb.addEventListener('change', () => {
            renderFilteredInvoices();
        const all = document.querySelectorAll('.invoiceSelect');
        const checked = document.querySelectorAll('.invoiceSelect:checked');
        selectAll.checked = (all.length > 0 && all.length === checked.length);
        });
    });
}

  function renderInvoiceHTML(inv, copyType) {
    return `
    <table style="width:100%; border:none; margin-bottom:10px;">
        <tr>
            <td style="text-align:left; border:none;font-size:small;">
                INVOICE NO. ${inv.financialYear}/${inv.invoiceNumber}
            </td>
            <td style="text-align:center; border:none;">
                <h2 style="margin:0;">TAX INVOICE (${copyType})</h2>
            </td>
            <td style="text-align:right; border:none;font-size:small;">
                Date: ${inv.date}
            </td>
        </tr>
    </table>

    <br>

    <table style="width:100%; border:none;">
        <tr>
            <td style="width:80px; text-align:center; vertical-align:top; font-weight:bold; border:none;">OWNER</td>
            <td style="border:none; text-align:left;padding-left:30px;">
                <strong>${inv.owner.toUpperCase()}</strong><br>
                ${inv.owner_address.replace(/\n/g, '<br>')}<br><br>
                <div id = "gst_owner_div" style = "display:${inv.gst_owner && inv.gst_owner !== "0" && inv.gst_owner != "undefined" ? 'block':'none'}">
                    <strong>GSTIN: ${inv.gst_owner}</strong>
                </div>
            </td>
        </tr>
    </table>

    <hr>

    <table style="width:100%; border:none;">
        <tr>
            <td style="width:80px; text-align:center; vertical-align:top; font-weight:bold; border:none;">TENANT</td>
            <td style="border:none; text-align:left;padding-left:30px;">
                <strong>${inv.tenant.toUpperCase()}</strong><br>
                ${inv.tenant_address.replace(/\n/g, '<br>')}<br><br>
                <div id = "gst_tenant_div" style = "display: ${inv.gst_tenant && inv.gst_tenant !== "0" && inv.gst_tenant != "undefined" ? 'block' : 'none'}">
                    <strong>GSTIN: ${inv.gst_tenant}</strong>
                </div>
            </td>
        </tr>
    </table>

    <br>

    <table id="main_table" style="font-size:14px;width:100%; border-collapse: collapse; border: 1px solid black; text-align:left;">
        <tr>
            <td style="border: 1px solid black; padding: 8px; text-align:center;">PARTICULARS</td>
            <td style="border: 1px solid black; padding: 8px; text-align:center;">AMOUNT</td>
        </tr>
        <tr>
            <td style="border-left: 1px solid black; border-right: 1px solid black; border-top:none; border-bottom:none; padding:12px 8px; vertical-align: top;">
                <strong>MONTHLY RENT</strong><br>
                <div style="margin-bottom:80px;">
                    For The Month of <span id="month-of-display">${inv.monthyear}</span>
                </div>
            </td>
            <td style="border-left: 1px solid black; border-right: 1px solid black; border-top:none; border-bottom:none; padding:12px 8px; text-align:right; vertical-align: top;">
                ₹${inv.baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
        </tr>
        <tr>
            <td style="border-left: 1px solid black; border-right: 1px solid black; border-top: none; border-bottom: none; padding: 1px 8px; text-align:right;">
                CGST @ ${inv.cgst_rate}%
            </td>
            <td style="border-left: 1px solid black; border-right: 1px solid black; border-top: none; border-bottom: none; padding: 1px 8px; text-align:right;">
                ₹${inv.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
        </tr>
        <tr>
            <td style="border-left: 1px solid black; border-right: 1px solid black; border-top: none; border-bottom: 1px solid black; padding: 1px 8px; text-align:right;">
                SGST @ ${inv.sgst_rate}%
            </td>
            <td style="border-left: 1px solid black; border-right: 1px solid black; border-top: none; border-bottom: 1px solid black; padding: 1px 8px; text-align:right;">
                ₹${inv.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 18px 8px; text-align:center;">TOTAL</td>
            <td style="border: 1px solid black; padding: 18px 8px; text-align:right;">
                ₹${inv.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
        </tr>
    </table>

    <p>Amount Chargeable (in Words)</p>
    <p>Rupees ${convertToWords(inv.total)} Only</p>
    <br>

    <table id="details_table" style="font-size:14px;width:100%; border-collapse: collapse; border: 1px solid black; text-align:center;">
        <tr>
            <td rowspan="2" style="border: 1px solid black; padding: 8px;">HSN/SAC</td>
            <td rowspan="2" style="border: 1px solid black; padding: 8px;">Taxable Value</td>
            <td colspan="2" style="border: 1px solid black; padding: 8px;">Central Tax</td>
            <td colspan="2" style="border: 1px solid black; padding: 8px;">State Tax</td>
            <td rowspan="2" style="border: 1px solid black; padding: 8px;">Total Tax Amount</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">Rate</td>
            <td style="border: 1px solid black; padding: 8px;">Amount</td>
            <td style="border: 1px solid black; padding: 8px;">Rate</td>
            <td style="border: 1px solid black; padding: 8px;">Amount</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">${inv.SAC}</td>
            <td style="border: 1px solid black; padding: 8px;">₹${inv.baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="border: 1px solid black; padding: 8px;">${inv.cgst_rate}%</td>
            <td style="border: 1px solid black; padding: 8px;">₹${inv.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="border: 1px solid black; padding: 8px;">${inv.sgst_rate}%</td>
            <td style="border: 1px solid black; padding: 8px;">₹${inv.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="border: 1px solid black; padding: 8px;">₹${(inv.cgst + inv.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">TOTAL</td>
            <td style="border: 1px solid black; padding: 8px;">₹${inv.baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="border: 1px solid black; padding: 8px;">${inv.cgst_rate}%</td>
            <td style="border: 1px solid black; padding: 8px;">₹${inv.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="border: 1px solid black; padding: 8px;">${inv.sgst_rate}%</td>
            <td style="border: 1px solid black; padding: 8px;">₹${inv.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="border: 1px solid black; padding: 8px;">₹${(inv.cgst + inv.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
    </table>

    <div style="font-size:14px;margin-top: 8px; border: 1px solid black; padding: 8px;">
        Tax Amount (In Words) &nbsp; Rupees ${convertToWords(inv.total)} Only
    </div>

    <p style="margin-top: 30px;font-size:12px;">
        <em>
            Kindly favor us with a remittance of the same.<br>
            ${inv.owner},${inv.bank_name}, ${inv.branch_name} Branch, Ac No. : ${inv.owner_acc}, IFSC Code: ${inv.owner_ifsc}<br>
            Late payment beyond 10 days will attract 24% P.A. interest.<br>
            All disputes are subject to ${inv.court} Jurisdiction only.
        </em>
    </p>

    <p style="text-align:right;">
        ${inv.owner.toUpperCase()}<br><br><br>
        Auth. Signatory
    </p>
    `;
  }

  function deleteInvoice(invoiceNumber, financialYear) {
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];

    if (confirm("Are you sure you want to delete this invoice?")) {
        // Remove invoice by invoiceNumber & financialYear
        invoices = invoices.filter(inv => !(inv.invoiceNumber === invoiceNumber && inv.financialYear === financialYear));
        localStorage.setItem('invoices', JSON.stringify(invoices));

        // Update invoiceCounts for that financial year
        let invoiceCounts = JSON.parse(localStorage.getItem('invoiceCounts')) || {};
        const maxNumber = Math.max(...invoices.filter(inv => inv.financialYear === financialYear).map(inv => inv.invoiceNumber), 0);
        invoiceCounts[financialYear] = maxNumber;
        localStorage.setItem('invoiceCounts', JSON.stringify(invoiceCounts));

        // Remove the divs from DOM immediately (both original + duplicate)
        const originalDiv = document.getElementById(`print-${invoiceNumber}-Original`);
        const duplicateDiv = document.getElementById(`print-${invoiceNumber}-Copy`);
        if (originalDiv) originalDiv.remove();
        if (duplicateDiv) duplicateDiv.remove();

        displayInvoices();
        generateReport();
    }
  } 

  function printReport() {
    const reportDiv = document.getElementById('report-table');

    if (!reportDiv || reportDiv.innerHTML.trim() === "") {
        alert("No report to print! Please generate a report first.");
        return;
    }

    const clonedTable = reportDiv.cloneNode(true);

    // Collect existing styles
    let styles = "";
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
        styles += node.outerHTML;
    });

    // Open print window
    const printWindow = window.open('', '', 'width=1000,height=700');
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice Report</title>
                ${styles}
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table, th, td { font-size:small;border: 1px solid black; border-collapse: collapse; padding: 5px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    th:last-child,td:last-child{
                        display : none;
                    }
                </style>
            </head>
            <body>
                <h1 style = "text-align:center;">Invoice Report</h1>
                ${clonedTable.outerHTML}
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    }
  //prints the report
   document.getElementById('print-report').addEventListener('click',printReport);

   //show popup
   document.getElementById('update-report').addEventListener('click',() =>{
    let div = document.getElementById('popup');
    div.style.display = "block";

    setTimeout(() =>{
        div.style.display = "none";
    },2000);
   });
});

function populateTenantList() {
  const tenants = JSON.parse(localStorage.getItem("tenants")) || {};
  const tenantList = document.getElementById("tenant-list");
  tenantList.innerHTML = "";
  Object.keys(tenants).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    tenantList.appendChild(option);
  });
}

function populateOwnerList() {
  const owners = JSON.parse(localStorage.getItem("owners")) || {};
  const ownerList = document.getElementById("owner-list");
  ownerList.innerHTML = "";
  Object.keys(owners).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    ownerList.appendChild(option);
  });
}

function printInvoice(elementId){
      const invoiceElement = document.getElementById(elementId);

      if (!invoiceElement) {
          alert("Invoice not found!");
          return;
      }

      // Include existing styles
      let styles = "";
      document.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
          styles += node.outerHTML;
      });

      const printWindow = window.open('', '', 'width=900,height=1000');

      printWindow.document.write(`
          <html>
              <head>
                  <title>Invoice</title>
                  ${styles}
                  <style>
                      /* Reduce print margins */
                      @page {
                          margin: 2mm; /* adjust as needed */
                      }

                      body {
                          font-family: Arial, sans-serif;
                          margin: 0; /* remove default body margin */
                      }

                      .invoice-container {
                          border: 2px solid black;
                          padding: 5px;
                          box-sizing: border-box;
                          width: 100%;
                      }

                    .edit-btn, .print-btn, .delete-btn{
                        visibility:hidden;
                    }

                      table {
                          border-collapse: collapse;
                          width: 100%;
                      }

                      td, th {
                          border: none;
                          padding: 0;
                          text-align: left;
                      }

                      table, tr, td {
                          page-break-inside: avoid;
                      }
                  </style>
              </head>
              <body>
                  <div class="invoice-container">
                      ${invoiceElement.outerHTML}
                  </div>
              </body>
          </html>
      `);

      printWindow.document.close();

      printWindow.onload = function () {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
      };
}

function editInvoice(invoiceNumber, financialYear) {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const invoice = invoices.find(inv => 
        inv.invoiceNumber === invoiceNumber && inv.financialYear === financialYear
    );

    if (!invoice) {
        alert("Invoice not found!");
        return;
    }

    // Show Enter Mode
    document.getElementById('enter-mode').style.display = 'block';
    document.getElementById('fetch-mode').style.display = 'none';

    // Populate form fields
    document.getElementById('month-of').value = invoice.monthof;
    document.getElementById('tenant-name').value = invoice.tenant;
    document.getElementById('owner-name').value = invoice.owner;
    
    let div_gst_tenant = document.getElementById('gst_tenant_div');
    if(div_gst_tenant.style.display === "none"){
        document.getElementById('gst-tenant').value = "0";
    }else document.getElementById('gst-tenant').value = invoice.gst_tenant;

    let div_gst_owner = document.getElementById('gst_owner_div');
    if(div_gst_owner.style.display === "none"){
        document.getElementById('gst-owner').value = "0";
    }else document.getElementById('gst-owner').value = invoice.gst_owner;


    document.getElementById('tenant-address').value = invoice.tenant_address;
    document.getElementById('owner-address').value = invoice.owner_address;
    document.getElementById('sac').value = invoice.SAC;
    document.getElementById('rent').value = invoice.baseAmount;
    document.getElementById('sgst').value = invoice.sgst_rate;
    document.getElementById('cgst').value = invoice.cgst_rate;
    document.getElementById('invoice-date').value = new Date(invoice.date.split('-').reverse().join('-')).toISOString().split('T')[0];

    // Mark form as "editing" by storing the invoiceNumber & financialYear
    form.dataset.editingInvoice = `${invoiceNumber}-${financialYear}`;
}

function convertToWords(amount) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function numToWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
  }

  return numToWords(Math.floor(amount));
}

function getFinancialYear(dateobj){
  const date = new Date(dateobj);
  let year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  // Financial year starts in April
  if (month < 4) {
    return `${year - 1}-${year}`;
  } else {
    return `${year}-${year + 1}`;
  }
}

function formatMonthYear(yyyyMm) {
    const [year, month] = yyyyMm.split('-');
    const date = new Date(year, month - 1); // JS months are 0-based
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

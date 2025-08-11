document.addEventListener('DOMContentLoaded', () => {
  console.log("Script loaded and ready!");

  const form = document.getElementById('invoice-form');
  const dateInput = document.getElementById('invoice-date');
  const invoiceList = document.getElementById('invoice-list');
  const tenantFilter = document.getElementById('tenant-filter');
  const dateFilter = document.getElementById('date-filter');
  const enterModeDiv = document.getElementById('enter-mode');
  const fetchModeDiv = document.getElementById('fetch-mode');
  const SAC = document.getElementById('sac').value.trim();
  
  // Set default to today's date
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const tenant = document.getElementById('tenant-name').value.trim();
    const owner = document.getElementById('owner-name').value.trim();
    const gstin_tenant = document.getElementById('gst-tenant').value.trim();
    const gstin_owner = document.getElementById('gst-owner').value.trim();
    const tenant_address = document.getElementById('tenant-address').value.trim();
    const owner_address = document.getElementById('owner-address').value.trim();
    const SAC = document.getElementById('sac').value;
    const baseAmount = parseFloat(document.getElementById('rent').value);
  

    const sgst_rate = document.getElementById('sgst').value;
    const cgst_rate = document.getElementById('cgst').value;
    const sgst = (baseAmount * sgst_rate)/100;
    const cgst = (baseAmount * cgst_rate)/100;
    const total = baseAmount + sgst + cgst;

    let invoiceCount = parseInt(localStorage.getItem('invoiceCount')) || 0;
    invoiceCount += 1;
    localStorage.setItem('invoiceCount', invoiceCount);

    const invoiceDate = dateInput.value;
    const dateObj = new Date(invoiceDate);
    const formattedDate = String(dateObj.getDate()).padStart(2, '0') + '-' +
                      String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                      dateObj.getFullYear();


    const monthName = dateObj.toLocaleString('default', { month: 'long' });
    const year = dateObj.getFullYear();
    const monthYear = `${monthName} ${year}`;

    const financialYear = getFinancialYear(dateObj);

    const invoice = {
        monthYear,
        financialYear,
        gstin_tenant,
        gstin_owner,
        tenant_address,
        owner_address,
        invoiceNumber: invoiceCount,
        tenant,
        owner,
        baseAmount,
        sgst,
        cgst,
        sgst_rate,
        cgst_rate,
        total,
        SAC,
        date: formattedDate,
        timestamp: new Date().toLocaleString()
    };

    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    window.alert("Invoice saved!");
    form.reset();
    dateInput.value = today; // reset to today
  });

    //selecting enter mode
    document.querySelector('button:nth-of-type(1)').onclick = () => {
    enterModeDiv.style.display = 'block';
    fetchModeDiv.style.display = 'none';
  };

  //selecting fetch 
  document.querySelector('button:nth-of-type(2)').onclick = () => {
    enterModeDiv.style.display = 'none';
    fetchModeDiv.style.display = 'block';
    displayInvoices();
  };

  function displayInvoices() {
        const invoices = JSON.parse(localStorage.getItem('invoices')) || [];

        // Extract unique tenant names and dates
        const uniqueTenants = [...new Set(invoices.map(inv => inv.tenant))];
        const uniqueDates = [...new Set(invoices.map(inv => inv.date))];

        // Populate tenant dropdown
        tenantFilter.innerHTML = '<option value="">-- All Tenants --</option>';
        uniqueTenants.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            tenantFilter.appendChild(option);
        });

        // Populate date dropdown
        dateFilter.innerHTML = '<option value="">-- All Dates --</option>';
        uniqueDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            dateFilter.appendChild(option);
         });

        // Call filter logic after dropdowns are ready
        renderFilteredInvoices(invoices);
        }
    
    function renderFilteredInvoices(invoices) {
    invoiceList.innerHTML = '';

    const tenantValue = tenantFilter.value;
    const dateValue = dateFilter.value;

    const filtered = invoices.filter(inv => {
        const matchTenant = tenantValue ? inv.tenant === tenantValue : true;
        const matchDate = dateValue ? inv.date === dateValue : true;
        return matchTenant && matchDate;
    });

    if (filtered.length === 0) {
        invoiceList.innerHTML = '<p>No invoices found for selection.</p>';
        return;
    }

    filtered.forEach(inv => {
        const div = document.createElement('div');
        div.style.border = '1px solid #ccc';
        div.style.margin = '10px 0';
        div.style.padding = '10px';

        // Unique IDs for original & duplicate
        const originalId = `print-${inv.invoiceNumber}-Original`;
        const duplicateId = `print-${inv.invoiceNumber}-Duplicate`;

        div.innerHTML = `
            <!-- ORIGINAL COPY -->
            <div class="print-invoice print-only" id="${originalId}">
                ${renderInvoiceHTML(inv, "Original")}
            </div>
            <button onclick="printInvoice('${originalId}')" 
                style="margin-top: 10px; padding: 6px 12px; font-size: 14px;">
                🖨 Print Original
            </button>

            <hr style="border: 2px dashed #000; margin: 40px 0;">

            <!-- DUPLICATE COPY -->
            <div class="print-invoice print-only" id="${duplicateId}">
                ${renderInvoiceHTML(inv, "Duplicate")}
            </div>
            <button onclick="printInvoice('${duplicateId}')" 
                style="margin-top: 10px; padding: 6px 12px; font-size: 14px;">
                🖨 Print Duplicate
            </button>
        `;

        invoiceList.appendChild(div);
      });
  }

  function renderInvoiceHTML(inv, copyType) {
    return `
    <table style="width:100%; border:none; margin-bottom:10px;">
        <tr>
            <td style="text-align:left; border:none;">
                <strong>INVOICE NO. </strong>${inv.financialYear} / ${inv.invoiceNumber}
            </td>
            <td style="text-align:center; border:none;">
                <h2 style="margin:0;">TAX INVOICE (${copyType})</h2>
            </td>
            <td style="text-align:right; border:none;">
                <strong>Date:</strong> ${inv.date}
            </td>
        </tr>
    </table>

    <table style="width:100%; border:none;">
        <tr>
            <td style="width:80px;vertical-align:top; font-weight:bold; border:none;"></td>
            <td style="border:none; text-align:left;padding-left:30px;">
                <strong>${inv.owner}</strong><br>
                ${inv.owner_address.replace(/\n/g, '<br>')}<br>
                <strong>GSTIN: ${inv.gstin_owner}</strong>
            </td>
        </tr>
    </table>

    <hr>

    <table style="width:100%; border:none;">
        <tr>
            <td style="width:80px;text-align:center;vertical-align:top; font-weight:bold; border:none;">TENANT</td>
            <td style="border:none; text-align:left;padding-left:30px;">
                <strong>${inv.tenant}</strong><br>
                ${inv.tenant_address.replace(/\n/g, '<br>')}<br>
                <strong>GSTIN: ${inv.gstin_tenant}</strong>
            </td>
        </tr>
    </table>

    <hr>

    <p><strong>For the Month of: </strong>${inv.monthYear}</p>

    <table class="details-table">
        <thead>
            <tr>
                <th style="padding:10px 10px;">PARTICULARS</th>
                <th style="padding:10px 10px;">HSN/SAC</th>
                <th style="padding:10px 10px;">Taxable Value</th>
                <th style="padding:10px 10px;">CGST (${inv.cgst_rate}%)</th>
                <th style="padding:10px 10px;">SGST (${inv.sgst_rate}%)</th>
                <th style="padding:8px;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>MONTHLY RENT</td>
                <td>${inv.SAC}</td>
                <td>₹${inv.baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${inv.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${inv.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${inv.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
        </tbody>
    </table>

    <p><strong>Total Tax:</strong> ₹${(inv.sgst + inv.cgst).toFixed(2)}</p>
    <p><strong>Total Payable:</strong> ₹${inv.total.toFixed(2)}</p>
    <p><strong>Amount in Words:</strong> ${convertToWords(inv.total)} Only</p>

    <p style="margin-top: 30px;"><em>Late payment beyond 10 days will attract 24% P.A. interest.<br>All disputes are subject to Haldwani Jurisdiction only.</em></p>

    <p style="text-align:right;"><strong>${inv.owner}</strong><br>Auth. Signatory</p>
    `;
  }

  


    tenantFilter.addEventListener('change', () => {
        const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        renderFilteredInvoices(invoices);
    });

    dateFilter.addEventListener('change', () => {
        const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        renderFilteredInvoices(invoices);
    });
});

function printInvoice(elementId) {
    const invoiceElement = document.getElementById(elementId);

    if (!invoiceElement) {
        alert("Invoice not found!");
        return;
    }

    // Extract invoice number & copy type from ID
    // Example: "print-5-Original" → ["print", "5", "Original"]
    const parts = elementId.split('-');
    const invoiceNumber = parts[1];
    const copyType = parts[2] || "Copy";

    // Get all stylesheets from the current page
    let styles = "";
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
        styles += node.outerHTML;
    });

    // Open a new popup window
    const printWindow = window.open('', '', 'width=800,height=900');

    // Write invoice content into the new window
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice #${invoiceNumber} - ${copyType}</title>
                ${styles}
                <style>
                    body { margin: 20px; font-family: Arial, sans-serif; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid black; padding: 8px; text-align: center; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                ${invoiceElement.outerHTML}
            </body>
        </html>
    `);

    printWindow.document.close();

    // Wait until content loads, then print
    printWindow.onload = function () {
        printWindow.print();
        printWindow.close();
    };
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


function getFinancialYear(dateobj) {
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



/* ===================================
   InsightFlow - Dashboard JavaScript
   Navigation & Interactivity
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTabs();
    initTreeNavigation();
    initQueryTabs();
    initExecuteButtons();
    initDataModelTableClicks();
    initDataModelRunButton();
});

// ===================================
// Page Navigation
// ===================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const pages = {
        'overview': document.getElementById('overviewPage'),
        'pipeline': document.getElementById('pipelinePage'),
        'datamodel': document.getElementById('datamodelPage'),
        'quality': document.getElementById('qualityPage')
    };
    
    const breadcrumbMap = {
        'overview': 'Overview',
        'pipeline': 'ETL Pipeline',
        'datamodel': 'Data Model',
        'quality': 'Data Quality'
    };
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show/hide pages with animation
            Object.keys(pages).forEach(key => {
                if (pages[key]) {
                    if (key === page) {
                        pages[key].style.display = 'block';
                        pages[key].style.opacity = '0';
                        pages[key].style.transform = 'translateY(20px)';
                        
                        // Trigger animation
                        requestAnimationFrame(() => {
                            pages[key].style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                            pages[key].style.opacity = '1';
                            pages[key].style.transform = 'translateY(0)';
                        });
                    } else {
                        pages[key].style.display = 'none';
                    }
                }
            });
            
            // Update breadcrumb with animation
            const breadcrumbCurrent = document.querySelector('.breadcrumb .current');
            if (breadcrumbCurrent) {
                breadcrumbCurrent.style.opacity = '0';
                setTimeout(() => {
                    breadcrumbCurrent.textContent = breadcrumbMap[page];
                    breadcrumbCurrent.style.transition = 'opacity 0.3s ease';
                    breadcrumbCurrent.style.opacity = '1';
                }, 150);
            }
        });
    });
}

// ===================================
// Tab Pills (Overview Page)
// ===================================
function initTabs() {
    const tabPills = document.querySelectorAll('.tab-pills .pill');
    
    tabPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const parent = pill.closest('.tab-pills');
            parent.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            // Here you could load different table data based on tab
            const tabName = pill.dataset.tab;
            updateTablesData(tabName);
        });
    });
}

function updateTablesData(layer) {
    const tableData = {
        bronze: [
            { name: 'crm_cust_info', source: 'CRM System', rows: '18,484', size: '2.4 MB' },
            { name: 'crm_prd_info', source: 'CRM System', rows: '397', size: '128 KB' },
            { name: 'crm_sales_details', source: 'CRM System', rows: '60,398', size: '8.2 MB' }
        ],
        silver: [
            { name: 'crm_cust_info', source: 'Transformed', rows: '18,484', size: '2.1 MB' },
            { name: 'crm_prd_info', source: 'Transformed', rows: '295', size: '98 KB' },
            { name: 'crm_sales_details', source: 'Transformed', rows: '60,398', size: '7.8 MB' }
        ],
        gold: [
            { name: 'dim_customers', source: 'Analytics', rows: '18,484', size: '1.8 MB' },
            { name: 'dim_products', source: 'Analytics', rows: '295', size: '64 KB' },
            { name: 'fact_sales', source: 'Analytics', rows: '60,398', size: '6.2 MB' }
        ]
    };
    
    const tablesList = document.querySelector('.tables-list');
    if (!tablesList || !tableData[layer]) return;
    
    tablesList.innerHTML = tableData[layer].map(table => `
        <div class="table-row">
            <div class="table-info">
                <i class="fas fa-table"></i>
                <div>
                    <span class="table-name">${table.name}</span>
                    <span class="table-source">${table.source}</span>
                </div>
            </div>
            <span class="table-rows">${table.rows} rows</span>
            <span class="table-size">${table.size}</span>
        </div>
    `).join('');
}

// ===================================
// Tree Navigation (Data Model Page)
// ===================================
function initTreeNavigation() {
    const treeHeaders = document.querySelectorAll('.tree-header, .tree-group-header');
    
    treeHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const parent = header.closest('.tree-section, .tree-group');
            if (parent) {
                parent.classList.toggle('expanded');
            }
        });
    });
    
    const treeItems = document.querySelectorAll('.tree-item');
    treeItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            treeItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// ===================================
// Query Tabs (Pipeline Page) - Gold Layer Queries
// ===================================
function initQueryTabs() {
    const queryTabs = document.querySelectorAll('#pipelinePage .query-tab');
    
    const queries = {
        dim_customers: {
            sql: `<span class="keyword">CREATE VIEW</span> gold.dim_customers <span class="keyword">AS</span>
<span class="keyword">SELECT</span>
    <span class="function">ROW_NUMBER</span>() <span class="keyword">OVER</span>(<span class="keyword">ORDER BY</span> cst_id) <span class="keyword">AS</span> customer_key,
    ci.cst_id <span class="keyword">AS</span> customer_id,
    ci.cst_key <span class="keyword">AS</span> customer_number,
    ci.cst_firstname <span class="keyword">AS</span> first_name,
    ci.cst_lastname <span class="keyword">AS</span> last_name,
    ci.cst_marital_status <span class="keyword">AS</span> marital_status,
    <span class="keyword">CASE WHEN</span> ci.cst_gndr &lt;&gt; <span class="string">'n/a'</span> <span class="keyword">THEN</span> ci.cst_gndr
         <span class="keyword">ELSE</span> <span class="function">COALESCE</span>(ca.gen, <span class="string">'n/a'</span>)
    <span class="keyword">END AS</span> gender,
    ci.cst_create_date <span class="keyword">AS</span> create_date,
    ca.bdate <span class="keyword">AS</span> birth_date,
    la.cntry <span class="keyword">AS</span> country
<span class="keyword">FROM</span> silver.crm_cust_info ci
<span class="keyword">LEFT JOIN</span> silver.erp_cust_az12 ca
    <span class="keyword">ON</span> ci.cst_key = ca.cid
<span class="keyword">LEFT JOIN</span> silver.erp_loc_a101 la
    <span class="keyword">ON</span> ci.cst_key = la.cid;`,
            results: [
                ['1', '11000', 'AW00011000', 'Jon', 'Yang', 'Australia'],
                ['2', '11001', 'AW00011001', 'Eugene', 'Huang', 'Australia'],
                ['3', '11002', 'AW00011002', 'Ruben', 'Torres', 'Australia'],
                ['4', '11003', 'AW00011003', 'Christy', 'Zhu', 'Australia'],
                ['5', '11004', 'AW00011004', 'Elizabeth', 'Johnson', 'Australia'],
                ['6', '11005', 'AW00011005', 'Julio', 'Ruiz', 'Australia'],
                ['7', '11006', 'AW00011006', 'Janet', 'Alvarez', 'Australia'],
                ['8', '11007', 'AW00011007', 'Marco', 'Mehta', 'Australia']
            ],
            headers: ['customer_key', 'customer_id', 'customer_number', 'first_name', 'last_name', 'country'],
            meta: '18,484 rows • 0.078s'
        },
        dim_products: {
            sql: `<span class="keyword">CREATE VIEW</span> gold.dim_products <span class="keyword">AS</span>
<span class="keyword">SELECT</span>
    <span class="function">ROW_NUMBER</span>() <span class="keyword">OVER</span> (<span class="keyword">ORDER BY</span> pn.prd_start_dt, pn.prd_key) <span class="keyword">AS</span> product_key,
    pn.prd_id <span class="keyword">AS</span> product_id,
    pn.prd_key <span class="keyword">AS</span> product_number,
    pn.prd_nm <span class="keyword">AS</span> product_name,
    pn.cat_id <span class="keyword">AS</span> category_id,
    pc.cat <span class="keyword">AS</span> category,
    pc.subcat <span class="keyword">AS</span> subcategory,
    pc.maintenance <span class="keyword">AS</span> maintenance,
    pn.prd_cost <span class="keyword">AS</span> cost,
    pn.prd_line <span class="keyword">AS</span> product_line,
    pn.prd_start_dt <span class="keyword">AS</span> start_date
<span class="keyword">FROM</span> silver.crm_prd_info pn
<span class="keyword">LEFT JOIN</span> silver.erp_px_cat_g1v2 pc
    <span class="keyword">ON</span> pn.cat_id = pc.id
<span class="keyword">WHERE</span> prd_end_dt <span class="keyword">IS NULL</span>; <span class="comment">-- filter out historical data</span>`,
            results: [
                ['1', '210', 'FR-R92B-58', 'HL Road Frame - Black- 58', 'Components', 'Road Frames'],
                ['2', '211', 'FR-R92R-58', 'HL Road Frame - Red- 58', 'Components', 'Road Frames'],
                ['3', '348', 'BK-M82B-38', 'Mountain-100 Black- 38', 'Bikes', 'Mountain Bikes'],
                ['4', '349', 'BK-M82B-42', 'Mountain-100 Black- 42', 'Bikes', 'Mountain Bikes'],
                ['5', '350', 'BK-M82B-44', 'Mountain-100 Black- 44', 'Bikes', 'Mountain Bikes'],
                ['6', '351', 'BK-M82B-48', 'Mountain-100 Black- 48', 'Bikes', 'Mountain Bikes'],
                ['7', '344', 'BK-M82S-38', 'Mountain-100 Silver- 38', 'Bikes', 'Mountain Bikes'],
                ['8', '345', 'BK-M82S-42', 'Mountain-100 Silver- 42', 'Bikes', 'Mountain Bikes'],
                ['9', '346', 'BK-M82S-44', 'Mountain-100 Silver- 44', 'Bikes', 'Mountain Bikes'],
                ['10', '347', 'BK-M82S-48', 'Mountain-100 Silver- 48', 'Bikes', 'Mountain Bikes'],
                ['11', '352', 'BK-M68B-38', 'Mountain-200 Black- 38', 'Bikes', 'Mountain Bikes'],
                ['12', '353', 'BK-M68B-42', 'Mountain-200 Black- 42', 'Bikes', 'Mountain Bikes'],
                ['13', '354', 'BK-M68B-46', 'Mountain-200 Black- 46', 'Bikes', 'Mountain Bikes'],
                ['14', '355', 'BK-M68S-38', 'Mountain-200 Silver- 38', 'Bikes', 'Mountain Bikes'],
                ['15', '356', 'BK-M68S-42', 'Mountain-200 Silver- 42', 'Bikes', 'Mountain Bikes'],
                ['16', '357', 'BK-M68S-46', 'Mountain-200 Silver- 46', 'Bikes', 'Mountain Bikes'],
                ['17', '358', 'BK-M47B-38', 'Mountain-300 Black- 38', 'Bikes', 'Mountain Bikes'],
                ['18', '359', 'BK-M47B-40', 'Mountain-300 Black- 40', 'Bikes', 'Mountain Bikes'],
                ['19', '360', 'BK-M47B-44', 'Mountain-300 Black- 44', 'Bikes', 'Mountain Bikes'],
                ['20', '361', 'BK-M47B-48', 'Mountain-300 Black- 48', 'Bikes', 'Mountain Bikes'],
                ['21', '362', 'BK-R93R-44', 'Road-150 Red- 44', 'Bikes', 'Road Bikes'],
                ['22', '363', 'BK-R93R-48', 'Road-150 Red- 48', 'Bikes', 'Road Bikes'],
                ['23', '364', 'BK-R93R-52', 'Road-150 Red- 52', 'Bikes', 'Road Bikes'],
                ['24', '365', 'BK-R93R-56', 'Road-150 Red- 56', 'Bikes', 'Road Bikes'],
                ['25', '366', 'BK-R93R-62', 'Road-150 Red- 62', 'Bikes', 'Road Bikes'],
                ['26', '367', 'BK-R68R-44', 'Road-450 Red- 44', 'Bikes', 'Road Bikes'],
                ['27', '368', 'BK-R68R-48', 'Road-450 Red- 48', 'Bikes', 'Road Bikes'],
                ['28', '369', 'BK-R68R-52', 'Road-450 Red- 52', 'Bikes', 'Road Bikes'],
                ['29', '370', 'BK-R68R-58', 'Road-450 Red- 58', 'Bikes', 'Road Bikes'],
                ['30', '371', 'BK-R68R-60', 'Road-450 Red- 60', 'Bikes', 'Road Bikes'],
                ['31', '372', 'BK-R64Y-38', 'Road-550-W Yellow- 38', 'Bikes', 'Road Bikes'],
                ['32', '373', 'BK-R64Y-40', 'Road-550-W Yellow- 40', 'Bikes', 'Road Bikes'],
                ['33', '374', 'BK-R64Y-42', 'Road-550-W Yellow- 42', 'Bikes', 'Road Bikes'],
                ['34', '375', 'BK-R64Y-44', 'Road-550-W Yellow- 44', 'Bikes', 'Road Bikes'],
                ['35', '376', 'BK-R64Y-48', 'Road-550-W Yellow- 48', 'Bikes', 'Road Bikes'],
                ['36', '377', 'BK-R50R-44', 'Road-650 Red- 44', 'Bikes', 'Road Bikes'],
                ['37', '378', 'BK-R50R-48', 'Road-650 Red- 48', 'Bikes', 'Road Bikes'],
                ['38', '379', 'BK-R50R-52', 'Road-650 Red- 52', 'Bikes', 'Road Bikes'],
                ['39', '380', 'BK-R50R-58', 'Road-650 Red- 58', 'Bikes', 'Road Bikes'],
                ['40', '381', 'BK-R50R-60', 'Road-650 Red- 60', 'Bikes', 'Road Bikes'],
                ['41', '382', 'BK-R50B-44', 'Road-650 Black- 44', 'Bikes', 'Road Bikes'],
                ['42', '383', 'BK-R50B-48', 'Road-650 Black- 48', 'Bikes', 'Road Bikes'],
                ['43', '384', 'BK-R50B-52', 'Road-650 Black- 52', 'Bikes', 'Road Bikes'],
                ['44', '385', 'BK-R50B-58', 'Road-650 Black- 58', 'Bikes', 'Road Bikes'],
                ['45', '386', 'BK-R50B-60', 'Road-650 Black- 60', 'Bikes', 'Road Bikes'],
                ['46', '387', 'BK-T79U-46', 'Touring-1000 Blue- 46', 'Bikes', 'Touring Bikes'],
                ['47', '388', 'BK-T79U-50', 'Touring-1000 Blue- 50', 'Bikes', 'Touring Bikes'],
                ['48', '389', 'BK-T79U-54', 'Touring-1000 Blue- 54', 'Bikes', 'Touring Bikes'],
                ['49', '390', 'BK-T79U-60', 'Touring-1000 Blue- 60', 'Bikes', 'Touring Bikes'],
                ['50', '391', 'BK-T79Y-46', 'Touring-1000 Yellow- 46', 'Bikes', 'Touring Bikes'],
                ['51', '392', 'BK-T79Y-50', 'Touring-1000 Yellow- 50', 'Bikes', 'Touring Bikes'],
                ['52', '393', 'BK-T79Y-54', 'Touring-1000 Yellow- 54', 'Bikes', 'Touring Bikes'],
                ['53', '394', 'BK-T79Y-60', 'Touring-1000 Yellow- 60', 'Bikes', 'Touring Bikes'],
                ['54', '395', 'BK-T44U-50', 'Touring-2000 Blue- 50', 'Bikes', 'Touring Bikes'],
                ['55', '396', 'BK-T44U-54', 'Touring-2000 Blue- 54', 'Bikes', 'Touring Bikes'],
                ['56', '397', 'BK-T44U-60', 'Touring-2000 Blue- 60', 'Bikes', 'Touring Bikes'],
                ['57', '398', 'BK-T18U-54', 'Touring-3000 Blue- 54', 'Bikes', 'Touring Bikes'],
                ['58', '399', 'BK-T18U-58', 'Touring-3000 Blue- 58', 'Bikes', 'Touring Bikes'],
                ['59', '400', 'BK-T18U-62', 'Touring-3000 Blue- 62', 'Bikes', 'Touring Bikes'],
                ['60', '401', 'BK-T18Y-54', 'Touring-3000 Yellow- 54', 'Bikes', 'Touring Bikes'],
                ['61', '402', 'BK-T18Y-58', 'Touring-3000 Yellow- 58', 'Bikes', 'Touring Bikes'],
                ['62', '403', 'BK-T18Y-62', 'Touring-3000 Yellow- 62', 'Bikes', 'Touring Bikes'],
                ['63', '701', 'HL-U509-R', 'Sport-100 Helmet- Red', 'Accessories', 'Helmets'],
                ['64', '702', 'HL-U509-B', 'Sport-100 Helmet- Black', 'Accessories', 'Helmets'],
                ['65', '703', 'HL-U509', 'Sport-100 Helmet- Blue', 'Accessories', 'Helmets'],
                ['66', '706', 'CA-1098', 'AWC Logo Cap', 'Clothing', 'Caps'],
                ['67', '707', 'LJ-0192-S', 'Long-Sleeve Logo Jersey- S', 'Clothing', 'Jerseys'],
                ['68', '708', 'LJ-0192-M', 'Long-Sleeve Logo Jersey- M', 'Clothing', 'Jerseys'],
                ['69', '709', 'LJ-0192-L', 'Long-Sleeve Logo Jersey- L', 'Clothing', 'Jerseys'],
                ['70', '710', 'LJ-0192-X', 'Long-Sleeve Logo Jersey- XL', 'Clothing', 'Jerseys'],
                ['71', '711', 'SJ-0194-S', 'Short-Sleeve Jersey- S', 'Clothing', 'Jerseys'],
                ['72', '712', 'SJ-0194-M', 'Short-Sleeve Jersey- M', 'Clothing', 'Jerseys'],
                ['73', '713', 'SJ-0194-L', 'Short-Sleeve Jersey- L', 'Clothing', 'Jerseys'],
                ['74', '714', 'SJ-0194-X', 'Short-Sleeve Jersey- XL', 'Clothing', 'Jerseys'],
                ['75', '715', 'GL-H102-S', 'Half-Finger Gloves- S', 'Clothing', 'Gloves'],
                ['76', '716', 'GL-H102-M', 'Half-Finger Gloves- M', 'Clothing', 'Gloves'],
                ['77', '717', 'GL-H102-L', 'Half-Finger Gloves- L', 'Clothing', 'Gloves'],
                ['78', '718', 'GL-F110-S', 'Full-Finger Gloves- S', 'Clothing', 'Gloves'],
                ['79', '719', 'GL-F110-M', 'Full-Finger Gloves- M', 'Clothing', 'Gloves'],
                ['80', '720', 'GL-F110-L', 'Full-Finger Gloves- L', 'Clothing', 'Gloves'],
                ['81', '721', 'SO-B909-M', 'Mountain Bike Socks- M', 'Clothing', 'Socks'],
                ['82', '722', 'SO-B909-L', 'Mountain Bike Socks- L', 'Clothing', 'Socks'],
                ['83', '723', 'SO-R809-M', 'Racing Socks- M', 'Clothing', 'Socks'],
                ['84', '724', 'SO-R809-L', 'Racing Socks- L', 'Clothing', 'Socks'],
                ['85', '725', 'BIB-S-S', 'Men Bib-Shorts- S', 'Clothing', 'Bib-Shorts'],
                ['86', '726', 'BIB-S-M', 'Men Bib-Shorts- M', 'Clothing', 'Bib-Shorts'],
                ['87', '727', 'BIB-S-L', 'Men Bib-Shorts- L', 'Clothing', 'Bib-Shorts'],
                ['88', '728', 'SH-M897-S', 'Women Mountain Shorts- S', 'Clothing', 'Shorts'],
                ['89', '729', 'SH-M897-M', 'Women Mountain Shorts- M', 'Clothing', 'Shorts'],
                ['90', '730', 'SH-M897-L', 'Women Mountain Shorts- L', 'Clothing', 'Shorts'],
                ['91', '731', 'TG-W091-S', 'Women Tights- S', 'Clothing', 'Tights'],
                ['92', '732', 'TG-W091-M', 'Women Tights- M', 'Clothing', 'Tights'],
                ['93', '733', 'TG-W091-L', 'Women Tights- L', 'Clothing', 'Tights'],
                ['94', '734', 'VE-C304-S', 'Classic Vest- S', 'Clothing', 'Vests'],
                ['95', '735', 'VE-C304-M', 'Classic Vest- M', 'Clothing', 'Vests'],
                ['96', '736', 'VE-C304-L', 'Classic Vest- L', 'Clothing', 'Vests'],
                ['97', '737', 'HY-1023-70', 'Hydration Pack- 70 oz', 'Accessories', 'Hydration Packs'],
                ['98', '738', 'TI-M267', 'Bike Wash - Dissolver', 'Accessories', 'Cleaners'],
                ['99', '739', 'TI-M602', 'Fender Set - Mountain', 'Accessories', 'Fenders'],
                ['100', '740', 'PU-M044', 'Minipump', 'Accessories', 'Pumps']
            ],
            headers: ['product_key', 'product_id', 'product_number', 'product_name', 'category', 'subcategory'],
            meta: '295 rows • 0.067s'
        },
        fact_sales: {
            sql: `<span class="comment">-- Fact Table</span>
<span class="keyword">CREATE VIEW</span> gold.fact_sales <span class="keyword">AS</span>
<span class="keyword">SELECT</span>
    sd.sls_ord_num <span class="keyword">AS</span> order_number,
    pr.product_key <span class="keyword">AS</span> product_key,
    cu.customer_key <span class="keyword">AS</span> customer_key,
    sd.sls_order_dt <span class="keyword">AS</span> order_date,
    sd.sls_ship_dt <span class="keyword">AS</span> shipping_date,
    sd.sls_due_dt <span class="keyword">AS</span> due_date,
    sd.sls_sales <span class="keyword">AS</span> sales_amount,
    sd.sls_quantity <span class="keyword">AS</span> quantity,
    sd.sls_price <span class="keyword">AS</span> price
<span class="keyword">FROM</span> silver.crm_sales_details sd
<span class="keyword">LEFT JOIN</span> gold.dim_products pr
    <span class="keyword">ON</span> sd.sls_prd_key = pr.product_number
<span class="keyword">LEFT JOIN</span> gold.dim_customers cu
    <span class="keyword">ON</span> sd.sls_cust_id = cu.customer_id;`,
            results: [
                ['SO43697', '20', '10769', '2010-12-29', '2011-01-05', '2011-01-10', '3578', '1'],
                ['SO43698', '9', '17390', '2010-12-29', '2011-01-05', '2011-01-10', '3400', '1'],
                ['SO43699', '9', '14864', '2010-12-29', '2011-01-05', '2011-01-10', '3400', '1'],
                ['SO43700', '41', '3502', '2010-12-29', '2011-01-05', '2011-01-10', '699', '1'],
                ['SO43701', '9', '3', '2010-12-29', '2011-01-05', '2011-01-10', '3400', '1'],
                ['SO43702', '16', '16646', '2010-12-30', '2011-01-06', '2011-01-11', '3578', '1'],
                ['SO43703', '20', '5625', '2010-12-30', '2011-01-06', '2011-01-11', '3578', '1'],
                ['SO43704', '6', '6', '2010-12-30', '2011-01-06', '2011-01-11', '3375', '1'],
                ['SO43705', '15', '8921', '2010-12-30', '2011-01-06', '2011-01-11', '2294', '1'],
                ['SO43706', '22', '12408', '2010-12-30', '2011-01-06', '2011-01-11', '3578', '2'],
                ['SO43707', '18', '4501', '2010-12-31', '2011-01-07', '2011-01-12', '2294', '1'],
                ['SO43708', '35', '9102', '2010-12-31', '2011-01-07', '2011-01-12', '1200', '3'],
                ['SO43709', '12', '7654', '2010-12-31', '2011-01-07', '2011-01-12', '1800', '2'],
                ['SO43710', '44', '2341', '2010-12-31', '2011-01-07', '2011-01-12', '450', '1'],
                ['SO43711', '8', '15678', '2011-01-01', '2011-01-08', '2011-01-13', '3200', '1'],
                ['SO43712', '27', '6789', '2011-01-01', '2011-01-08', '2011-01-13', '875', '2'],
                ['SO43713', '33', '11234', '2011-01-01', '2011-01-08', '2011-01-13', '1050', '1'],
                ['SO43714', '19', '8456', '2011-01-02', '2011-01-09', '2011-01-14', '2750', '1'],
                ['SO43715', '5', '3210', '2011-01-02', '2011-01-09', '2011-01-14', '3100', '2'],
                ['SO43716', '48', '14567', '2011-01-02', '2011-01-09', '2011-01-14', '520', '3'],
                ['SO43717', '11', '9876', '2011-01-03', '2011-01-10', '2011-01-15', '1950', '1'],
                ['SO43718', '29', '5432', '2011-01-03', '2011-01-10', '2011-01-15', '780', '2'],
                ['SO43719', '7', '17654', '2011-01-03', '2011-01-10', '2011-01-15', '3280', '1'],
                ['SO43720', '52', '2198', '2011-01-04', '2011-01-11', '2011-01-16', '340', '4'],
                ['SO43721', '14', '13456', '2011-01-04', '2011-01-11', '2011-01-16', '2100', '1'],
                ['SO43722', '38', '7890', '2011-01-04', '2011-01-11', '2011-01-16', '920', '2'],
                ['SO43723', '3', '4321', '2011-01-05', '2011-01-12', '2011-01-17', '3450', '1'],
                ['SO43724', '56', '10987', '2011-01-05', '2011-01-12', '2011-01-17', '275', '5'],
                ['SO43725', '21', '6543', '2011-01-05', '2011-01-12', '2011-01-17', '2800', '1'],
                ['SO43726', '45', '15432', '2011-01-06', '2011-01-13', '2011-01-18', '580', '2'],
                ['SO43727', '10', '8765', '2011-01-06', '2011-01-13', '2011-01-18', '1875', '1'],
                ['SO43728', '31', '3456', '2011-01-06', '2011-01-13', '2011-01-18', '1100', '3'],
                ['SO43729', '17', '12345', '2011-01-07', '2011-01-14', '2011-01-19', '2450', '1'],
                ['SO43730', '59', '9012', '2011-01-07', '2011-01-14', '2011-01-19', '180', '6'],
                ['SO43731', '24', '4567', '2011-01-07', '2011-01-14', '2011-01-19', '2650', '2'],
                ['SO43732', '42', '16789', '2011-01-08', '2011-01-15', '2011-01-20', '680', '1'],
                ['SO43733', '13', '7012', '2011-01-08', '2011-01-15', '2011-01-20', '1980', '1'],
                ['SO43734', '36', '2345', '2011-01-08', '2011-01-15', '2011-01-20', '1150', '2'],
                ['SO43735', '4', '11567', '2011-01-09', '2011-01-16', '2011-01-21', '3380', '1'],
                ['SO43736', '63', '8901', '2011-01-09', '2011-01-16', '2011-01-21', '125', '8'],
                ['SO43737', '26', '5678', '2011-01-09', '2011-01-16', '2011-01-21', '850', '1'],
                ['SO43738', '49', '14321', '2011-01-10', '2011-01-17', '2011-01-22', '495', '3'],
                ['SO43739', '16', '9234', '2011-01-10', '2011-01-17', '2011-01-22', '2300', '1'],
                ['SO43740', '34', '3789', '2011-01-10', '2011-01-17', '2011-01-22', '1080', '2'],
                ['SO43741', '2', '10456', '2011-01-11', '2011-01-18', '2011-01-23', '3520', '1'],
                ['SO43742', '67', '6012', '2011-01-11', '2011-01-18', '2011-01-23', '95', '10'],
                ['SO43743', '23', '2567', '2011-01-11', '2011-01-18', '2011-01-23', '2720', '1'],
                ['SO43744', '46', '13890', '2011-01-12', '2011-01-19', '2011-01-24', '560', '2'],
                ['SO43745', '11', '8234', '2011-01-12', '2011-01-19', '2011-01-24', '1920', '1'],
                ['SO43746', '39', '4890', '2011-01-12', '2011-01-19', '2011-01-24', '890', '3'],
                ['SO43747', '8', '11123', '2011-01-13', '2011-01-20', '2011-01-25', '3180', '1'],
                ['SO43748', '71', '7345', '2011-01-13', '2011-01-20', '2011-01-25', '72', '12'],
                ['SO43749', '28', '3012', '2011-01-13', '2011-01-20', '2011-01-25', '820', '2'],
                ['SO43750', '53', '15678', '2011-01-14', '2011-01-21', '2011-01-26', '320', '4'],
                ['SO43751', '19', '9567', '2011-01-14', '2011-01-21', '2011-01-26', '2680', '1'],
                ['SO43752', '37', '5123', '2011-01-14', '2011-01-21', '2011-01-26', '940', '2'],
                ['SO43753', '6', '12890', '2011-01-15', '2011-01-22', '2011-01-27', '3350', '1'],
                ['SO43754', '75', '8012', '2011-01-15', '2011-01-22', '2011-01-27', '55', '15'],
                ['SO43755', '25', '4234', '2011-01-15', '2011-01-22', '2011-01-27', '2580', '1'],
                ['SO43756', '50', '16234', '2011-01-16', '2011-01-23', '2011-01-28', '480', '3'],
                ['SO43757', '14', '10012', '2011-01-16', '2011-01-23', '2011-01-28', '2050', '1'],
                ['SO43758', '32', '6567', '2011-01-16', '2011-01-23', '2011-01-28', '1020', '2'],
                ['SO43759', '1', '2890', '2011-01-17', '2011-01-24', '2011-01-29', '3580', '1'],
                ['SO43760', '79', '9345', '2011-01-17', '2011-01-24', '2011-01-29', '42', '18'],
                ['SO43761', '22', '5789', '2011-01-17', '2011-01-24', '2011-01-29', '2850', '1'],
                ['SO43762', '47', '14012', '2011-01-18', '2011-01-25', '2011-01-30', '545', '2'],
                ['SO43763', '12', '8567', '2011-01-18', '2011-01-25', '2011-01-30', '1850', '1'],
                ['SO43764', '40', '4012', '2011-01-18', '2011-01-25', '2011-01-30', '865', '3'],
                ['SO43765', '9', '11789', '2011-01-19', '2011-01-26', '2011-01-31', '3250', '1'],
                ['SO43766', '83', '7890', '2011-01-19', '2011-01-26', '2011-01-31', '35', '20'],
                ['SO43767', '27', '3345', '2011-01-19', '2011-01-26', '2011-01-31', '790', '2'],
                ['SO43768', '54', '16567', '2011-01-20', '2011-01-27', '2011-02-01', '295', '5'],
                ['SO43769', '17', '10234', '2011-01-20', '2011-01-27', '2011-02-01', '2380', '1'],
                ['SO43770', '35', '6890', '2011-01-20', '2011-01-27', '2011-02-01', '1120', '2'],
                ['SO43771', '5', '2012', '2011-01-21', '2011-01-28', '2011-02-02', '3420', '1'],
                ['SO43772', '87', '9678', '2011-01-21', '2011-01-28', '2011-02-02', '28', '22'],
                ['SO43773', '30', '5234', '2011-01-21', '2011-01-28', '2011-02-02', '950', '1'],
                ['SO43774', '57', '13567', '2011-01-22', '2011-01-29', '2011-02-03', '265', '4'],
                ['SO43775', '20', '8890', '2011-01-22', '2011-01-29', '2011-02-03', '2750', '1'],
                ['SO43776', '43', '4567', '2011-01-22', '2011-01-29', '2011-02-03', '720', '3'],
                ['SO43777', '3', '12234', '2011-01-23', '2011-01-30', '2011-02-04', '3490', '1'],
                ['SO43778', '91', '7012', '2011-01-23', '2011-01-30', '2011-02-04', '22', '25'],
                ['SO43779', '24', '3567', '2011-01-23', '2011-01-30', '2011-02-04', '2620', '2'],
                ['SO43780', '51', '15890', '2011-01-24', '2011-01-31', '2011-02-05', '360', '3'],
                ['SO43781', '15', '10567', '2011-01-24', '2011-01-31', '2011-02-05', '2180', '1'],
                ['SO43782', '38', '6234', '2011-01-24', '2011-01-31', '2011-02-05', '980', '2'],
                ['SO43783', '7', '2345', '2011-01-25', '2011-02-01', '2011-02-06', '3320', '1'],
                ['SO43784', '95', '9012', '2011-01-25', '2011-02-01', '2011-02-06', '18', '28'],
                ['SO43785', '29', '5890', '2011-01-25', '2011-02-01', '2011-02-06', '810', '1'],
                ['SO43786', '58', '14234', '2011-01-26', '2011-02-02', '2011-02-07', '240', '5'],
                ['SO43787', '18', '8012', '2011-01-26', '2011-02-02', '2011-02-07', '2480', '1'],
                ['SO43788', '41', '4890', '2011-01-26', '2011-02-02', '2011-02-07', '695', '2'],
                ['SO43789', '10', '11456', '2011-01-27', '2011-02-03', '2011-02-08', '3150', '1'],
                ['SO43790', '99', '7567', '2011-01-27', '2011-02-03', '2011-02-08', '15', '30'],
                ['SO43791', '33', '3890', '2011-01-27', '2011-02-03', '2011-02-08', '1060', '1'],
                ['SO43792', '61', '16012', '2011-01-28', '2011-02-04', '2011-02-09', '210', '6'],
                ['SO43793', '21', '10890', '2011-01-28', '2011-02-04', '2011-02-09', '2820', '1'],
                ['SO43794', '44', '6567', '2011-01-28', '2011-02-04', '2011-02-09', '620', '3'],
                ['SO43795', '2', '2678', '2011-01-29', '2011-02-05', '2011-02-10', '3550', '1'],
                ['SO43796', '100', '9234', '2011-01-29', '2011-02-05', '2011-02-10', '12', '32']
            ],
            headers: ['order_number', 'product_key', 'customer_key', 'order_date', 'ship_date', 'due_date', 'sales_amount', 'qty'],
            meta: '60,398 rows • 0.468s'
        }
    };
    
    queryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active from all tabs
            queryTabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked tab
            this.classList.add('active');
            
            const queryKey = this.dataset.query;
            const query = queries[queryKey];
            
            if (query) {
                // Update SQL code
                const sqlCode = document.getElementById('sqlCode');
                if (sqlCode) {
                    sqlCode.innerHTML = query.sql;
                }
                
                // Update results meta
                const resultsMeta = document.querySelector('#pipelinePage .results-meta');
                if (resultsMeta) {
                    resultsMeta.textContent = query.meta;
                }
                
                // Update results table
                const resultsTable = document.getElementById('pipelineResultsTable');
                if (resultsTable) {
                    resultsTable.innerHTML = `
                        <thead>
                            <tr>${query.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${query.results.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                        </tbody>
                    `;
                }
            }
        });
    });
}

// ===================================
// Execute Buttons
// ===================================
function initExecuteButtons() {
    const executeButtons = document.querySelectorAll('.execute-btn');
    
    executeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Add loading state
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            btn.disabled = true;
            
            // Simulate query execution
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                
                // Flash success
                btn.classList.add('success-flash');
                setTimeout(() => btn.classList.remove('success-flash'), 300);
            }, 800);
        });
    });
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const activeExecuteBtn = document.querySelector('.page:not([style*="display: none"]) .execute-btn');
            if (activeExecuteBtn) {
                activeExecuteBtn.click();
            }
        }
    });
}

// ===================================
// Search Functionality
// ===================================
const searchBox = document.querySelector('.search-box input');
if (searchBox) {
    searchBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchBox.value.toLowerCase();
            // Implement search logic here
            console.log('Searching for:', query);
        }
    });
}

// ===================================
// Layer Item Click Handler
// ===================================
const layerItems = document.querySelectorAll('.layer-item');
layerItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Navigate to data model page
        const dataModelNav = document.querySelector('[data-page="datamodel"]');
        if (dataModelNav) {
            dataModelNav.click();
        }
        
        // Expand the corresponding layer in tree
        const layer = item.dataset.layer;
        const treeGroup = document.querySelector(`.tree-group-header .dot.${layer}`)?.closest('.tree-group');
        if (treeGroup) {
            treeGroup.classList.add('expanded');
        }
    });
});

// ===================================
// Smooth Scroll for Internal Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===================================
// Initialize Tooltips (Optional)
// ===================================
function initTooltips() {
    const buttons = document.querySelectorAll('[title]');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', (e) => {
            // Create and show tooltip
        });
        btn.addEventListener('mouseleave', () => {
            // Hide tooltip
        });
    });
}

// ===================================
// Animation on Scroll (Optional)
// ===================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.card, .stat-card').forEach(el => {
        observer.observe(el);
    });
}

// ===================================
// Data Model Table Click Handlers
// ===================================
function initDataModelTableClicks() {
    const tableItems = document.querySelectorAll('.tree-item[data-table]');
    
    const tableQueries = {
        dim_customers: {
            sql: `<span class="comment">-- Gold Layer: dim_customers</span>
<span class="comment">-- Customer Dimension with SCD Type 1</span>
<span class="keyword">CREATE OR REPLACE VIEW</span> gold.dim_customers <span class="keyword">AS</span>
<span class="keyword">SELECT</span>
    <span class="function">ROW_NUMBER</span>() <span class="keyword">OVER</span> (<span class="keyword">ORDER BY</span> cst_id) <span class="keyword">AS</span> customer_key,
    ci.cst_id <span class="keyword">AS</span> customer_id,
    ci.cst_key <span class="keyword">AS</span> customer_number,
    ci.cst_firstname <span class="keyword">AS</span> first_name,
    ci.cst_lastname <span class="keyword">AS</span> last_name,
    la.cntry <span class="keyword">AS</span> country,
    la.city <span class="keyword">AS</span> city,
    <span class="keyword">CASE WHEN</span> ci.cst_gndr != <span class="string">'n/a'</span> 
         <span class="keyword">THEN</span> ci.cst_gndr <span class="keyword">ELSE</span> <span class="string">'Unknown'</span> <span class="keyword">END AS</span> gender,
    ci.cst_marital_status <span class="keyword">AS</span> marital_status,
    ci.cst_create_date <span class="keyword">AS</span> create_date
<span class="keyword">FROM</span> silver.crm_cust_info ci
<span class="keyword">LEFT JOIN</span> silver.erp_loc_a101 la
    <span class="keyword">ON</span> ci.cst_key = la.cid;`,
            results: [
                ['1', 'CST-001', 'AW00011000', 'Jon', 'Yang', 'Australia', 'Sydney', 'Male', 'Married'],
                ['2', 'CST-002', 'AW00011001', 'Eugene', 'Huang', 'Australia', 'Melbourne', 'Male', 'Single'],
                ['3', 'CST-003', 'AW00011002', 'Ruben', 'Torres', 'United States', 'Phoenix', 'Male', 'Married'],
                ['4', 'CST-004', 'AW00011003', 'Christy', 'Zhu', 'Germany', 'Munich', 'Female', 'Single'],
                ['5', 'CST-005', 'AW00011004', 'Elizabeth', 'Johnson', 'United States', 'Chicago', 'Female', 'Married']
            ],
            headers: ['customer_key', 'customer_id', 'customer_number', 'first_name', 'last_name', 'country', 'city', 'gender', 'marital_status']
        },
        dim_products: {
            sql: `<span class="comment">-- Gold Layer: dim_products</span>
<span class="comment">-- Product Dimension with Category Hierarchy</span>
<span class="keyword">CREATE OR REPLACE VIEW</span> gold.dim_products <span class="keyword">AS</span>
<span class="keyword">SELECT</span>
    <span class="function">ROW_NUMBER</span>() <span class="keyword">OVER</span> (<span class="keyword">ORDER BY</span> pn.prd_start_dt, pn.prd_key) <span class="keyword">AS</span> product_key,
    pn.prd_id <span class="keyword">AS</span> product_id,
    pn.prd_key <span class="keyword">AS</span> product_number,
    pn.prd_nm <span class="keyword">AS</span> product_name,
    pn.cat_id <span class="keyword">AS</span> category_id,
    pc.cat <span class="keyword">AS</span> category,
    pc.subcat <span class="keyword">AS</span> subcategory,
    pc.maintenance <span class="keyword">AS</span> maintenance_flag,
    pn.prd_cost <span class="keyword">AS</span> cost,
    pn.prd_line <span class="keyword">AS</span> product_line,
    pn.prd_start_dt <span class="keyword">AS</span> start_date
<span class="keyword">FROM</span> silver.crm_prd_info pn
<span class="keyword">LEFT JOIN</span> silver.erp_px_cat_g1v2 pc
    <span class="keyword">ON</span> pn.cat_id = pc.id
<span class="keyword">WHERE</span> pn.prd_end_dt <span class="keyword">IS NULL</span>;`,
            results: [
                ['1', 'PRD-001', 'BK-R93R-62', 'Road-150 Red, 62', 'CAT-01', 'Bikes', 'Road Bikes', 'Yes', '$2,171.29'],
                ['2', 'PRD-002', 'BK-M68S-42', 'Mountain-200 Silver, 42', 'CAT-01', 'Bikes', 'Mountain Bikes', 'Yes', '$1,912.15'],
                ['3', 'PRD-003', 'BK-T79U-50', 'Touring-1000 Blue, 50', 'CAT-01', 'Bikes', 'Touring Bikes', 'Yes', '$2,384.07'],
                ['4', 'PRD-004', 'HL-U509-R', 'Sport-100 Helmet, Red', 'CAT-02', 'Accessories', 'Helmets', 'No', '$13.08'],
                ['5', 'PRD-005', 'CA-1098', 'AWC Logo Cap', 'CAT-03', 'Clothing', 'Caps', 'No', '$6.92']
            ],
            headers: ['product_key', 'product_id', 'product_number', 'product_name', 'category_id', 'category', 'subcategory', 'maintenance', 'cost']
        },
        fact_sales: {
            sql: `<span class="comment">-- Gold Layer: fact_sales</span>
<span class="comment">-- Sales Fact Table with Calculated Measures</span>
<span class="keyword">CREATE OR REPLACE VIEW</span> gold.fact_sales <span class="keyword">AS</span>
<span class="keyword">SELECT</span>
    sd.sls_ord_num <span class="keyword">AS</span> order_number,
    dp.product_key,
    dc.customer_key,
    sd.sls_order_dt <span class="keyword">AS</span> order_date,
    sd.sls_ship_dt <span class="keyword">AS</span> ship_date,
    sd.sls_due_dt <span class="keyword">AS</span> due_date,
    sd.sls_sales <span class="keyword">AS</span> sales_amount,
    sd.sls_quantity <span class="keyword">AS</span> quantity,
    sd.sls_price <span class="keyword">AS</span> unit_price,
    <span class="function">EXTRACT</span>(<span class="string">YEAR</span> <span class="keyword">FROM</span> sd.sls_order_dt) <span class="keyword">AS</span> order_year,
    <span class="function">EXTRACT</span>(<span class="string">MONTH</span> <span class="keyword">FROM</span> sd.sls_order_dt) <span class="keyword">AS</span> order_month,
    <span class="function">DATE_PART</span>(<span class="string">'dow'</span>, sd.sls_order_dt) <span class="keyword">AS</span> order_day_of_week
<span class="keyword">FROM</span> silver.crm_sales_details sd
<span class="keyword">LEFT JOIN</span> gold.dim_products dp
    <span class="keyword">ON</span> sd.sls_prd_key = dp.product_number
<span class="keyword">LEFT JOIN</span> gold.dim_customers dc
    <span class="keyword">ON</span> sd.sls_cust_id = dc.customer_id;`,
            results: [
                ['SO71774', '587', '17782', '2013-06-01', '2013-06-08', '2013-06-13', '$2,024.99', '1', '$2,024.99'],
                ['SO71776', '592', '16561', '2013-06-01', '2013-06-08', '2013-06-13', '$2,039.99', '1', '$2,039.99'],
                ['SO71780', '604', '15831', '2013-06-01', '2013-06-08', '2013-06-13', '$4,499.98', '2', '$2,249.99'],
                ['SO71782', '601', '28389', '2013-06-01', '2013-06-08', '2013-06-13', '$1,894.00', '1', '$1,894.00'],
                ['SO71783', '587', '27515', '2013-06-01', '2013-06-08', '2013-06-13', '$2,024.99', '1', '$2,024.99']
            ],
            headers: ['order_number', 'product_key', 'customer_key', 'order_date', 'ship_date', 'due_date', 'sales_amount', 'quantity', 'unit_price']
        }
    };
    
    tableItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const tableName = item.dataset.table;
            const queryData = tableQueries[tableName];
            
            if (!queryData) return;
            
            // Update active state
            tableItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Update SQL code display
            const codeElement = document.getElementById('dmConsoleCode');
            if (codeElement) {
                codeElement.innerHTML = queryData.sql;
            }
            
            // Update header
            const headerElement = document.getElementById('dmConsoleHeader');
            if (headerElement) {
                headerElement.textContent = 'Schema Console — ' + tableName;
            }
            
            // Update results table
            const resultsTable = document.getElementById('dmResultsTable');
            if (resultsTable) {
                const tableHead = resultsTable.querySelector('thead tr');
                const tableBody = resultsTable.querySelector('tbody');
                
                if (tableHead) {
                    tableHead.innerHTML = queryData.headers.map(h => `<th>${h}</th>`).join('');
                }
                
                if (tableBody) {
                    tableBody.innerHTML = queryData.results.map(row => 
                        `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
                    ).join('');
                }
            }
        });
    });
}

// ===================================
// Data Model Run Button
// ===================================
function initDataModelRunButton() {
    const runBtn = document.querySelector('.dm-console-run');
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            const resultsSection = document.querySelector('.dm-sql-half .console-bottom');
            if (resultsSection) {
                resultsSection.style.display = 'block';
                
                // Add a brief animation
                resultsSection.style.opacity = '0';
                setTimeout(() => {
                    resultsSection.style.transition = 'opacity 0.3s ease';
                    resultsSection.style.opacity = '1';
                }, 50);
            }
        });
    }
}

// ===================================
// Data Quality Page Buttons
// ===================================
function initQualityButtons() {
    const exportBtn = document.getElementById('exportReportBtn');
    const rerunBtn = document.getElementById('rerunChecksBtn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            // Generate and download a text report
            const reportContent = `
================================================================================
                    INSIGHTFLOW DATA QUALITY REPORT
                    Generated: ${new Date().toLocaleString()}
================================================================================

EXECUTIVE SUMMARY
-----------------
Overall Quality Score: 100% (All Checks Passed)
Total Tables Analyzed: 3 (Gold Layer)
Total Records: 79,177

================================================================================
PRIMARY KEY INTEGRITY                                              ✓ PASSED
================================================================================
All primary keys are unique and not null across all Gold layer tables.

  • dim_customers: 18,484 unique records
  • dim_products: 295 unique records  
  • fact_sales: 60,398 unique records

================================================================================
REFERENTIAL INTEGRITY                                              ✓ PASSED
================================================================================
All foreign key relationships are valid with no orphaned records.

  • customer_key → dim_customers: 100% match
  • product_key → dim_products: 100% match

================================================================================
NULL VALUE ANALYSIS                                                ✓ PASSED
================================================================================
Critical columns contain no null values after Silver layer transformations.

  • customer_name: 0% null
  • product_name: 0% null
  • sales_amount: 0% null

================================================================================
DATA STANDARDIZATION                                               ✓ PASSED
================================================================================
All categorical values are standardized and consistent.

  • Gender values: Male/Female only
  • Country names: ISO standard
  • Marital status: Standardized

================================================================================
TEST RESULTS SUMMARY
================================================================================

Silver Layer QC Tests:
  ✓ Null Value Check - Validates no critical NULLs in transformed tables
  ✓ Duplicate Detection - Ensures no duplicate records after deduplication
  ✓ Data Type Validation - Verifies correct data types after transformation
  ✓ Date Range Check - Validates dates are within expected ranges

Gold Layer QC Tests:
  ✓ Primary Key Uniqueness - All surrogate keys are unique
  ✓ Foreign Key Integrity - All FKs reference valid dimension records
  ✓ Aggregation Accuracy - Fact table calculations are correct
  ✓ Dimension Completeness - No orphaned dimension values

================================================================================
                              END OF REPORT
================================================================================
`;
            
            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'InsightFlow_Data_Quality_Report.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Show notification
            showNotification('Report exported successfully!', 'success');
        });
    }
    
    if (rerunBtn) {
        rerunBtn.addEventListener('click', function() {
            const btn = this;
            const originalText = btn.innerHTML;
            
            // Show running state
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            btn.disabled = true;
            
            // Simulate running checks
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> All Passed!';
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-success');
                
                showNotification('All quality checks passed! 8/8 tests successful.', 'success');
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-primary');
                }, 2000);
            }, 1500);
        });
    }
}

// ===================================
// Notification System
// ===================================
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize additional features
initScrollAnimations();
initQualityButtons();


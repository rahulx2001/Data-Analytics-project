// ===== Dummy Data for SQL Playground =====

const dummyData = {
    'sales-by-country': {
        query: `-- Sales by Customer Country
SELECT 
    c.country,
    COUNT(f.order_number) AS total_orders,
    SUM(f.sales_amount) AS total_revenue,
    ROUND(AVG(f.sales_amount), 2) AS avg_order_value
FROM gold.fact_sales f
JOIN gold.dim_customers c 
    ON f.customer_key = c.customer_key
GROUP BY c.country
ORDER BY total_revenue DESC
LIMIT 10;`,
        columns: ['country', 'total_orders', 'total_revenue', 'avg_order_value'],
        data: [
            ['United States', '15,234', '$4,567,890', '$299.85'],
            ['United Kingdom', '8,456', '$2,345,678', '$277.42'],
            ['Germany', '6,789', '$1,987,654', '$292.78'],
            ['France', '5,432', '$1,654,321', '$304.58'],
            ['Australia', '4,567', '$1,234,567', '$270.32'],
            ['Canada', '3,876', '$1,098,765', '$283.47'],
            ['Japan', '2,987', '$876,543', '$293.45'],
            ['Netherlands', '1,876', '$543,210', '$289.56'],
            ['Spain', '1,543', '$432,109', '$280.11'],
            ['Italy', '1,234', '$321,098', '$260.21']
        ]
    },
    'top-products': {
        query: `-- Top 10 Products by Revenue
SELECT 
    p.product_name,
    p.category,
    SUM(f.quantity) AS units_sold,
    SUM(f.sales_amount) AS revenue
FROM gold.fact_sales f
JOIN gold.dim_products p 
    ON f.product_key = p.product_key
GROUP BY p.product_name, p.category
ORDER BY revenue DESC
LIMIT 10;`,
        columns: ['product_name', 'category', 'units_sold', 'revenue'],
        data: [
            ['Mountain-200 Black, 46', 'Bikes', '2,345', '$892,456'],
            ['Road-150 Red, 62', 'Bikes', '1,987', '$756,234'],
            ['Mountain-200 Silver, 38', 'Bikes', '1,876', '$712,543'],
            ['Road-650 Black, 52', 'Bikes', '1,654', '$543,210'],
            ['Touring-1000 Blue, 54', 'Bikes', '1,432', '$487,654'],
            ['HL Mountain Frame Black, 42', 'Components', '3,456', '$345,678'],
            ['HL Road Frame Red, 58', 'Components', '2,987', '$298,765'],
            ['Sport-100 Helmet Red', 'Accessories', '8,765', '$219,125'],
            ['AWC Logo Cap', 'Clothing', '12,345', '$185,175'],
            ['Long-Sleeve Logo Jersey, L', 'Clothing', '5,432', '$162,960']
        ]
    },
    'monthly-trend': {
        query: `-- Monthly Sales Trend
SELECT 
    DATE_TRUNC('month', f.order_date) AS month,
    COUNT(*) AS total_orders,
    SUM(f.sales_amount) AS revenue,
    COUNT(DISTINCT f.customer_key) AS unique_customers
FROM gold.fact_sales f
WHERE f.order_date >= '2024-01-01'
GROUP BY DATE_TRUNC('month', f.order_date)
ORDER BY month;`,
        columns: ['month', 'total_orders', 'revenue', 'unique_customers'],
        data: [
            ['2024-01', '4,567', '$1,234,567', '2,345'],
            ['2024-02', '4,234', '$1,156,789', '2,198'],
            ['2024-03', '5,123', '$1,456,234', '2,567'],
            ['2024-04', '4,876', '$1,345,678', '2,432'],
            ['2024-05', '5,432', '$1,567,890', '2,765'],
            ['2024-06', '5,876', '$1,678,901', '2,987'],
            ['2024-07', '6,123', '$1,789,012', '3,123'],
            ['2024-08', '5,654', '$1,654,321', '2,876'],
            ['2024-09', '5,234', '$1,543,210', '2,654'],
            ['2024-10', '5,876', '$1,698,765', '2,987'],
            ['2024-11', '6,543', '$1,876,543', '3,234'],
            ['2024-12', '7,234', '$2,123,456', '3,567']
        ]
    },
    'customer-segments': {
        query: `-- Customer Segments Analysis
SELECT 
    c.gender,
    c.marital_status,
    COUNT(DISTINCT c.customer_key) AS customers,
    SUM(f.sales_amount) AS total_spend,
    ROUND(AVG(f.sales_amount), 2) AS avg_order
FROM gold.fact_sales f
JOIN gold.dim_customers c 
    ON f.customer_key = c.customer_key
GROUP BY c.gender, c.marital_status
ORDER BY total_spend DESC;`,
        columns: ['gender', 'marital_status', 'customers', 'total_spend', 'avg_order'],
        data: [
            ['Male', 'Married', '4,567', '$3,456,789', '$312.45'],
            ['Female', 'Married', '4,234', '$3,234,567', '$298.76'],
            ['Male', 'Single', '3,876', '$2,876,543', '$287.65'],
            ['Female', 'Single', '3,654', '$2,654,321', '$276.54'],
            ['Male', 'n/a', '1,234', '$876,543', '$265.43'],
            ['Female', 'n/a', '1,123', '$765,432', '$254.32']
        ]
    },
    'category-analysis': {
        query: `-- Product Category Performance
SELECT 
    p.category,
    p.subcategory,
    COUNT(DISTINCT p.product_key) AS products,
    SUM(f.quantity) AS units_sold,
    SUM(f.sales_amount) AS revenue,
    ROUND(SUM(f.sales_amount) * 100.0 / 
        SUM(SUM(f.sales_amount)) OVER (), 2) AS pct_revenue
FROM gold.fact_sales f
JOIN gold.dim_products p 
    ON f.product_key = p.product_key
GROUP BY p.category, p.subcategory
ORDER BY revenue DESC
LIMIT 10;`,
        columns: ['category', 'subcategory', 'products', 'units_sold', 'revenue', 'pct_revenue'],
        data: [
            ['Bikes', 'Mountain Bikes', '32', '8,765', '$4,567,890', '28.5%'],
            ['Bikes', 'Road Bikes', '28', '7,654', '$3,987,654', '24.9%'],
            ['Bikes', 'Touring Bikes', '22', '5,432', '$2,876,543', '18.0%'],
            ['Components', 'Mountain Frames', '28', '6,543', '$1,234,567', '7.7%'],
            ['Components', 'Road Frames', '24', '5,876', '$1,098,765', '6.9%'],
            ['Accessories', 'Helmets', '8', '12,345', '$567,890', '3.5%'],
            ['Clothing', 'Jerseys', '15', '9,876', '$456,789', '2.9%'],
            ['Accessories', 'Bottles and Cages', '6', '18,765', '$234,567', '1.5%'],
            ['Clothing', 'Caps', '4', '15,432', '$198,765', '1.2%'],
            ['Components', 'Wheels', '14', '3,456', '$176,543', '1.1%']
        ]
    }
};

// ===== Navigation Toggle =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ===== Animated Counter =====
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        updateCounter();
    });
};

// Trigger counter animation when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroSection = document.getElementById('hero');
if (heroSection) {
    heroObserver.observe(heroSection);
}

// ===== SQL Playground =====
const sqlEditor = document.getElementById('sqlEditor');
const runQueryBtn = document.getElementById('runQuery');
const resultsBody = document.getElementById('resultsBody');
const resultsInfo = document.getElementById('resultsInfo');
const queryBtns = document.querySelectorAll('.query-btn');

// Switch between sample queries
queryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        queryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const queryKey = btn.getAttribute('data-query');
        if (dummyData[queryKey]) {
            sqlEditor.value = dummyData[queryKey].query;
        }
    });
});

// Run query and display results
runQueryBtn?.addEventListener('click', () => {
    const activeQuery = document.querySelector('.query-btn.active');
    const queryKey = activeQuery?.getAttribute('data-query') || 'sales-by-country';
    const data = dummyData[queryKey];
    
    if (!data) return;
    
    // Show loading state
    resultsBody.innerHTML = `
        <div class="results-placeholder">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Executing query...</p>
        </div>
    `;
    resultsInfo.textContent = 'Running...';
    
    // Simulate query execution delay
    setTimeout(() => {
        // Build results table
        let tableHTML = '<table class="results-table"><thead><tr>';
        
        data.columns.forEach(col => {
            tableHTML += `<th>${col}</th>`;
        });
        
        tableHTML += '</tr></thead><tbody>';
        
        data.data.forEach(row => {
            tableHTML += '<tr>';
            row.forEach(cell => {
                tableHTML += `<td>${cell}</td>`;
            });
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        
        resultsBody.innerHTML = tableHTML;
        resultsInfo.textContent = `${data.data.length} rows returned in 0.${Math.floor(Math.random() * 90) + 10}s`;
    }, 500 + Math.random() * 500);
});

// ===== Copy Code =====
function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    });
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.overview-card, .arch-layer, .timeline-item, .schema-table, .concept-card, .check-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    scrollObserver.observe(el);
});

// Add animation class
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    </style>
`);

// ===== Navbar Background on Scroll =====
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
    }
    
    lastScroll = currentScroll;
});

// ===== Schema Table Hover Effects =====
const schemaTables = document.querySelectorAll('.schema-table');

schemaTables.forEach(table => {
    table.addEventListener('mouseenter', () => {
        // Add connection highlight
        const factTable = document.getElementById('fact-sales');
        if (table !== factTable) {
            factTable?.classList.add('connected');
        }
    });
    
    table.addEventListener('mouseleave', () => {
        document.querySelectorAll('.schema-table').forEach(t => {
            t.classList.remove('connected');
        });
    });
});

// ===== Quality Score Animation =====
const scoreCircle = document.querySelector('.score-fill');
if (scoreCircle) {
    const scoreObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate the score circle
                scoreCircle.style.transition = 'stroke-dashoffset 2s ease-out';
                scoreCircle.style.strokeDashoffset = '14'; // 95% score
                scoreObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    scoreObserver.observe(scoreCircle);
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Set initial query in playground
    if (sqlEditor && dummyData['sales-by-country']) {
        sqlEditor.value = dummyData['sales-by-country'].query;
    }
});

console.log('🚀 InsightFlow Case Study Website Loaded');

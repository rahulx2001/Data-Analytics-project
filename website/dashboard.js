// ===================================
// InsightFlow Case Study Dashboard
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeMobileMenu();
});

// ===================================
// Navigation
// ===================================
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.content-section');
    const currentSectionEl = document.getElementById('currentSection');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            
            // Update nav active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `section-${sectionId}`) {
                    section.classList.add('active');
                }
            });
            
            // Update breadcrumb
            const sectionNames = {
                'overview': 'Overview',
                'architecture': 'Architecture',
                'bronze': 'Bronze Layer',
                'silver': 'Silver Layer',
                'gold': 'Gold Layer',
                'quality': 'Data Quality'
            };
            
            if (currentSectionEl) {
                currentSectionEl.textContent = sectionNames[sectionId] || sectionId;
            }
            
            // Close mobile menu if open
            document.querySelector('.sidebar').classList.remove('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ===================================
// Mobile Menu
// ===================================
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

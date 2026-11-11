document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initStatCounters();
    initCopyEmail();
    initSkillsFilter();
    initCopyBankDetails();
    initBackToTop();
});

/* 1. Dark/Light Theme Toggle */
function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        htmlElement.setAttribute('data-theme', 'dark');
        if (toggleBtn) toggleBtn.textContent = '☀️';
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        if (toggleBtn) toggleBtn.textContent = '🌙';
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }
}

/* 2. Animated Stat Counters */
function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'), 10);
        const suffix = stat.getAttribute('data-suffix') || '';
        let count = 0;
        const duration = 1200; // ms
        const increment = Math.max(1, Math.ceil(target / (duration / 30)));

        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                count = target;
                clearInterval(timer);
            }
            stat.textContent = count + suffix;
        }, 30);
    });
}

/* 3. Copy Email to Clipboard with Toast Notification */
function initCopyEmail() {
    const copyBtn = document.getElementById('copyEmailBtn');
    const email = 'abrahamromeom@gmail.com';

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(email).then(() => {
                showToast('Email address copied!');
            }).catch(() => {
                showToast('Failed to copy email');
            });
        });
    }
}

/* 4. Interactive Skills Filter Fixture */
function initSkillsFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const skillItems = document.querySelectorAll('#skillsList li');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            skillItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || filter === category) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

/* 5. Copy Bank Details */
function initCopyBankDetails() {
    const copyBtn = document.getElementById('copyBankDetailsBtn');
    if (!copyBtn) return;

    const bankInfo = 'Account Holder: Romeo Mduduzi Mangena\nDocument Password: 9810035374084';

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(bankInfo).then(() => {
            showToast('Account details copied to clipboard!');
        }).catch(() => {
            showToast('Failed to copy details');
        });
    });
}

/* 6. Back to Top Button */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* Helper: Toast Notification */
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

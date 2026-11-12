let toastTimeout;

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initStatCounters();
    initCopyEmail();
    initSkillsFilter();
    initBackToTop();
});

function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    const root = document.documentElement;
    if (!toggleBtn) return;

    let savedTheme;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (error) {
        console.warn('Theme preference could not be loaded.', error);
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    const applyTheme = (theme) => {
        root.dataset.theme = theme;
        toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
        toggleBtn.setAttribute('aria-pressed', String(theme === 'dark'));
    };

    applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light');

    toggleBtn.addEventListener('click', () => {
        const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn('Theme preference could not be saved.', error);
        }
    });
}

function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reducedMotion) return;

    stats.forEach((stat) => {
        const target = Number(stat.dataset.target);
        if (!Number.isFinite(target) || target < 0) return;

        const suffix = stat.dataset.suffix || '';
        const duration = 1200;
        let startTime;

        const animate = (timestamp) => {
            startTime ??= timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            stat.textContent = `${Math.round(target * easedProgress)}${suffix}`;

            if (progress < 1) {
                window.requestAnimationFrame(animate);
            }
        };

        stat.textContent = `0${suffix}`;
        window.requestAnimationFrame(animate);
    });
}

function initCopyEmail() {
    const copyBtn = document.getElementById('copyEmailBtn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async () => {
        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error('Clipboard access is unavailable.');
            }
            await navigator.clipboard.writeText('abrahamromeom@gmail.com');
            showToast('Email address copied!');
        } catch {
            showToast('Could not copy email. Please use the Contact Me link.');
        }
    });
}

function initSkillsFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillItems = document.querySelectorAll('#skillsList li');

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            filterButtons.forEach((item) => {
                const isActive = item === button;
                item.classList.toggle('active', isActive);
                item.setAttribute('aria-pressed', String(isActive));
            });

            skillItems.forEach((item) => {
                item.hidden = filter !== 'all' && item.dataset.category !== filter;
            });
        });
    });
}

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;

    const updateVisibility = () => {
        backToTopBtn.classList.toggle('show', window.scrollY > 300);
    };

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();

    backToTopBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    window.clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimeout = window.setTimeout(() => {
        toast.classList.remove('show');
        toast.textContent = '';
    }, 2500);
}

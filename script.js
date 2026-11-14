let toastTimeout;

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initStatCounters();
    initCopyEmail();
    initSkillsFilter();
    initMobileNav();
    initBackToTop();
    initScrollEffects();
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
    const themeColor = document.querySelector('meta[name="theme-color"]');
    let hasSavedTheme = savedTheme === 'dark' || savedTheme === 'light';
    const applyTheme = (theme) => {
        root.dataset.theme = theme;
        toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
        toggleBtn.setAttribute('aria-pressed', String(theme === 'dark'));
        themeColor?.setAttribute('content', theme === 'dark' ? '#0f172a' : '#4f46e5');
    };

    applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light');

    toggleBtn.addEventListener('click', () => {
        const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        hasSavedTheme = true;
        applyTheme(theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn('Theme preference could not be saved.', error);
        }
    });

    const colorScheme = window.matchMedia?.('(prefers-color-scheme: dark)');
    colorScheme?.addEventListener?.('change', (event) => {
        if (!hasSavedTheme) applyTheme(event.matches ? 'dark' : 'light');
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
    const searchInput = document.getElementById('skillSearch');
    const resultCount = document.getElementById('skillsResultCount');
    let activeFilter = 'all';

    const updateSkills = () => {
        const searchTerm = searchInput instanceof HTMLInputElement
            ? searchInput.value.trim().toLocaleLowerCase()
            : '';
        let visibleCount = 0;

        skillItems.forEach((item) => {
            const matchesCategory = activeFilter === 'all' || item.dataset.category === activeFilter;
            const matchesSearch = item.textContent?.toLocaleLowerCase().includes(searchTerm) ?? false;
            const isVisible = matchesCategory && matchesSearch;
            item.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
        });

        if (resultCount) {
            resultCount.textContent = visibleCount === 0
                ? 'No matching skills'
                : `Showing ${visibleCount} of ${skillItems.length} skills`;
        }
    };

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter || 'all';

            filterButtons.forEach((item) => {
                const isActive = item === button;
                item.classList.toggle('active', isActive);
                item.setAttribute('aria-pressed', String(isActive));
            });

            updateSkills();
        });
    });

    searchInput?.addEventListener('input', updateSkills);
    updateSkills();
}

function initMobileNav() {
    const toggleBtn = document.getElementById('navToggleBtn');
    const siteNav = document.getElementById('siteNav');
    if (!toggleBtn || !siteNav || !window.matchMedia) return;

    const mobileQuery = window.matchMedia('(max-width: 720px)');
    toggleBtn.hidden = false;

    const setMenuOpen = (isOpen) => {
        siteNav.classList.toggle('is-collapsed', !isOpen);
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
        toggleBtn.setAttribute('aria-label', `${isOpen ? 'Close' : 'Open'} navigation`);
    };

    setMenuOpen(!mobileQuery.matches);
    const handleBreakpointChange = (event) => setMenuOpen(!event.matches);
    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener('change', handleBreakpointChange);
    } else {
        mobileQuery.addListener(handleBreakpointChange);
    }

    toggleBtn.addEventListener('click', () => {
        setMenuOpen(toggleBtn.getAttribute('aria-expanded') !== 'true');
    });

    siteNav.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('a') && mobileQuery.matches) {
            setMenuOpen(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileQuery.matches && toggleBtn.getAttribute('aria-expanded') === 'true') {
            setMenuOpen(false);
            toggleBtn.focus();
        }
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

function initScrollEffects() {
    const progressBar = document.getElementById('scrollProgressBar');
    let updateScheduled = false;

    const updateProgress = () => {
        updateScheduled = false;
        if (!progressBar) return;

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    };

    window.addEventListener('scroll', () => {
        if (updateScheduled) return;
        updateScheduled = true;
        window.requestAnimationFrame(updateProgress);
    }, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();

    const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
    const sections = Array.from(navLinks)
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter((section) => section instanceof HTMLElement);

    if ('IntersectionObserver' in window && sections.length > 0) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                navLinks.forEach((link) => {
                    if (link.getAttribute('href') === `#${entry.target.id}`) {
                        link.setAttribute('aria-current', 'location');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            });
        }, { rootMargin: '-20% 0px -65% 0px' });

        sections.forEach((section) => navObserver.observe(section));
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reducedMotion || !('IntersectionObserver' in window)) return;

    const revealTargets = document.querySelectorAll(
        '.hero, .content-section, .info-card, .experience-card, .education-card, .project-card'
    );
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    revealTargets.forEach((target) => {
        target.classList.add('reveal-ready');
        revealObserver.observe(target);
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

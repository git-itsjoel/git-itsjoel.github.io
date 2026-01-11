document.addEventListener('DOMContentLoaded', () => {
    // 1. Fluid Scroll Observer (Looping Animations)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-reveal');
            } else {
                // Remove class to allow re-animation when scrolling back into view
                entry.target.classList.remove('animate-reveal');
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animatedElements = document.querySelectorAll(
        '.hero-content > *,' +
        '.section-title,' +
        '.about-content,' +
        '.skill-card,' +
        '.project-card,' +
        '.timeline-item,' +
        '.contact-wrapper > *'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // 2. Stagger Logic for Grids
    const grids = document.querySelectorAll('.skills-grid, .projects-grid');
    grids.forEach(grid => {
        const children = grid.children;
        Array.from(children).forEach((child, i) => {
            child.style.animationDelay = `${i * 100}ms`;
        });
    });

    // 3. Navbar Scroll Effect (Glassmorphism toggle)
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScroll = currentScroll;
    });
});

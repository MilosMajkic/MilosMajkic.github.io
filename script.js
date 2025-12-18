// ============================================
// INITIALIZATION & SETUP
// ============================================

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Accent color state
let currentAccent = 'blue';
const accentColors = {
    blue: '#3b82f6',
    purple: '#a855f7',
    emerald: '#10b981'
};

// ============================================
// PRELOADER
// ============================================

function initPreloader() {
    const preloader = document.getElementById('preloader');
    const counter = document.getElementById('preloader-counter');
    const logo = document.getElementById('preloader-logo');
    
    let progress = 0;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    // Animate logo
    gsap.fromTo(logo, 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
    );
    
    function updateCounter() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(100, Math.floor((elapsed / duration) * 100));
        counter.textContent = `${progress}%`;
        
        if (progress < 100) {
            requestAnimationFrame(updateCounter);
        } else {
            // Hide preloader
            gsap.to(preloader, {
                opacity: 0,
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => {
                    preloader.style.display = 'none';
                    initAll();
                }
            });
        }
    }
    
    updateCounter();
}

// ============================================
// LENIS SMOOTH SCROLL
// ============================================

let lenis;

function initSmoothScroll() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Connect GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// ============================================
// THREE.JS 3D BACKGROUND
// ============================================

let scene, camera, renderer, wireframe, particles;
let mouseX = 0, mouseY = 0;

function initThreeJS() {
    const canvas = document.getElementById('canvas-3d');
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        alpha: true,
        antialias: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Wireframe Geometry
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    wireframe = new THREE.Mesh(geometry, material);
    scene.add(wireframe);

    // Particle System
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate wireframe
        wireframe.rotation.x += 0.002;
        wireframe.rotation.y += 0.003;

        // React to mouse
        wireframe.rotation.x += mouseY * 0.0005;
        wireframe.rotation.y += mouseX * 0.0005;

        // Animate particles
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.0001;
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Move particles based on mouse
        particles.rotation.x += mouseY * 0.0002;
        particles.rotation.y += mouseX * 0.0002;

        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

// ============================================
// CUSTOM MAGNETIC CURSOR
// ============================================

let cursor, cursorDot, cursorTrail;
let cursorX = 0, cursorY = 0;
let dotX = 0, dotY = 0;
let trailX = 0, trailY = 0;

function initCursor() {
    cursor = document.getElementById('cursor');
    cursorDot = document.getElementById('cursor-dot');
    cursorTrail = document.getElementById('cursor-trail');

    // Hide cursor on mobile
    if (window.innerWidth < 768) {
        if (cursor) cursor.style.display = 'none';
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorTrail) cursorTrail.style.display = 'none';
        return;
    }
    
    if (!cursor || !cursorDot || !cursorTrail) return;

    let isHovering = false;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    // Magnetic elements
    const magneticElements = document.querySelectorAll('.magnetic-btn, .project-card, .nav-link');
    
    magneticElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHovering = true;
            cursor.style.transform = 'scale(1.5)';
            cursorTrail.style.transform = 'scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            isHovering = false;
            cursor.style.transform = 'scale(1)';
            cursorTrail.style.transform = 'scale(1)';
        });
        
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(el, {
                x: x * 0.2,
                y: y * 0.2,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });

    // Cursor position tracking
    let cursorRingX = 0, cursorRingY = 0;

    // Animate cursor
    function animateCursor() {
        // Smooth cursor dot
        dotX += (cursorX - dotX) * 0.1;
        dotY += (cursorY - dotY) * 0.1;
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';

        // Smooth cursor ring
        cursorRingX += (cursorX - cursorRingX) * 0.15;
        cursorRingY += (cursorY - cursorRingY) * 0.15;
        cursor.style.left = (cursorRingX - 10) + 'px';
        cursor.style.top = (cursorRingY - 10) + 'px';

        // Smooth trail
        trailX += (cursorX - trailX) * 0.05;
        trailY += (cursorY - trailY) * 0.05;
        cursorTrail.style.left = (trailX - 20) + 'px';
        cursorTrail.style.top = (trailY - 20) + 'px';

        requestAnimationFrame(animateCursor);
    }

    animateCursor();
}

// ============================================
// NAVIGATION AUTO-HIDE
// ============================================

let lastScrollY = 0;
let scrollDirection = 'up';

function initNavigation() {
    const nav = document.getElementById('nav');
    let ticking = false;

    function updateNav() {
        const currentScrollY = window.scrollY || (lenis ? lenis.scroll : 0);

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down
            if (scrollDirection !== 'down') {
                nav.classList.add('hidden');
                scrollDirection = 'down';
            }
        } else if (currentScrollY < lastScrollY) {
            // Scrolling up
            if (scrollDirection !== 'up') {
                nav.classList.remove('hidden');
                scrollDirection = 'up';
            }
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    // Use Lenis scroll event if available
    if (lenis) {
        lenis.on('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateNav);
                ticking = true;
            }
        });
    } else {
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateNav);
                ticking = true;
            }
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target && lenis) {
                lenis.scrollTo(target, { offset: -100 });
            }
        });
    });
}

// ============================================
// ACCENT COLOR SWITCHER
// ============================================

function initColorSwitcher() {
    const toggle = document.getElementById('color-toggle');
    const colors = ['blue', 'purple', 'emerald'];
    let currentIndex = colors.indexOf(currentAccent);

    // Set initial color
    document.body.className = `accent-${currentAccent}`;
    updateAccentColor(currentAccent);

    toggle.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % colors.length;
        currentAccent = colors[currentIndex];
        document.body.className = `accent-${currentAccent}`;
        updateAccentColor(currentAccent);
        
        // Animate toggle
        gsap.to(toggle, {
            scale: 0.8,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });
    });
}

function updateAccentColor(color) {
    const accent = accentColors[color];
    document.documentElement.style.setProperty('--accent', accent);
    
    // Update cursor color
    const cursorEl = document.getElementById('cursor');
    if (cursorEl) {
        cursorEl.style.borderColor = accent;
    }
    
    // Update hover states
    const style = document.createElement('style');
    style.textContent = `
        .magnetic-btn:hover,
        .project-card:hover {
            border-color: ${accent};
        }
        .nav-link:hover {
            color: ${accent};
        }
    `;
    const existingStyle = document.getElementById('accent-style');
    if (existingStyle) {
        existingStyle.remove();
    }
    style.id = 'accent-style';
    document.head.appendChild(style);
}

// ============================================
// GSAP ANIMATIONS
// ============================================

function initAnimations() {
    // Text reveal animations
    const textReveals = document.querySelectorAll('.text-reveal span');
    
    textReveals.forEach((span, index) => {
        gsap.fromTo(span,
            { y: '100%', opacity: 0 },
            {
                y: '0%',
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: span.closest('section'),
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Project cards animation
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        gsap.fromTo(card,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Skills tags animation
    const skillTags = document.querySelectorAll('.skill-tag span');
    
    skillTags.forEach((tag, index) => {
        gsap.fromTo(tag,
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: 'back.out(1.7)',
                delay: index * 0.05,
                scrollTrigger: {
                    trigger: tag.closest('.skill-category'),
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Hero section entrance
    gsap.fromTo('#hero .text-reveal span',
        { y: '100%', opacity: 0 },
        {
            y: '0%',
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            stagger: 0.2,
            delay: 0.5
        }
    );
}

// ============================================
// RESPONSIVE OPTIMIZATIONS
// ============================================

function initResponsive() {
    const mm = gsap.matchMedia();

    mm.add('(max-width: 768px)', () => {
        // Disable 3D on mobile for performance
        if (renderer) {
            renderer.setPixelRatio(1);
        }
        
        // Simplify animations
        gsap.defaults({ duration: 0.5 });
    });

    mm.add('(min-width: 769px)', () => {
        // Full animations on desktop
        gsap.defaults({ duration: 1 });
    });
}

// ============================================
// EMAILJS CONTACT FORM
// ============================================

function initContactForm() {
    const modal = document.getElementById('contact-modal');
    const openBtn = document.getElementById('open-contact');
    const closeBtn = document.getElementById('close-modal');
    const overlay = document.getElementById('modal-overlay');
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    const formMessage = document.getElementById('form-message');
    
    // Open modal
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Animate modal entrance
            gsap.fromTo(modal.querySelector('.modal-content'),
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
            );
        });
    }
    
    // Close modal
    function closeModal() {
        gsap.to(modal.querySelector('.modal-content'), {
            opacity: 0,
            scale: 0.9,
            y: 20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                form.reset();
                formMessage.classList.add('hidden');
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Show loading state
            submitText.classList.add('hidden');
            submitLoading.classList.remove('hidden');
            submitBtn.disabled = true;
            formMessage.classList.add('hidden');
            
            try {
                const response = await emailjs.send(
                    'service_me4wgpd',
                    'template_ekyl53p',
                    {
                        from_name: name,
                        from_email: email,
                        message: message,
                    },
                    'bjW4wDsl3HwtpzC4Z'
                );
                
                // Success
                formMessage.textContent = 'Message sent successfully!';
                formMessage.className = 'text-center text-sm mt-4 text-green-400';
                formMessage.classList.remove('hidden');
                
                // Reset form
                form.reset();
                
                // Animate success
                gsap.fromTo(formMessage,
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: 0.3 }
                );
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    closeModal();
                }, 2000);
                
            } catch (error) {
                // Error
                formMessage.textContent = 'Failed to send message. Please try again.';
                formMessage.className = 'text-center text-sm mt-4 text-red-400';
                formMessage.classList.remove('hidden');
                
                gsap.fromTo(formMessage,
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: 0.3 }
                );
                
                console.error('EmailJS Error:', error);
            } finally {
                // Reset button state
                submitText.classList.remove('hidden');
                submitLoading.classList.add('hidden');
                submitBtn.disabled = false;
            }
        });
    }
}

// ============================================
// INITIALIZE ALL
// ============================================

function initAll() {
    initSmoothScroll();
    initThreeJS();
    initCursor();
    // Delay navigation init to ensure lenis is ready
    setTimeout(() => {
        initNavigation();
    }, 100);
    initColorSwitcher();
    initAnimations();
    initResponsive();
    initContactForm();
}

// Start with preloader
initPreloader();


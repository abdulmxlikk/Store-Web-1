/* ===================================================================
   LUXORIQUE — Interactive 3D Effects, Animations & Logic
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Preloader ───
    const preloader = document.getElementById('preloader');
    const preloaderFill = document.getElementById('preloaderFill');
    let progress = 0;

    function updatePreloader() {
        progress += Math.random() * 15 + 5;
        if (progress > 100) progress = 100;
        preloaderFill.style.width = progress + '%';

        if (progress < 100) {
            setTimeout(updatePreloader, 150 + Math.random() * 200);
        } else {
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = '';
            }, 400);
        }
    }
    document.body.style.overflow = 'hidden';
    updatePreloader();


    // ─── Particle Background System ───
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let mouse = { x: -1000, y: -1000 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse for interactive particles
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.baseSpeedX = (Math.random() - 0.5) * 0.4;
            this.baseSpeedY = (Math.random() - 0.5) * 0.4;
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.glowing = Math.random() > 0.92;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }
        update() {
            // Mouse repulsion effect
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.speedX = this.baseSpeedX + (dx / dist) * force * 1.5;
                this.speedY = this.baseSpeedY + (dy / dist) * force * 1.5;
            } else {
                this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
                this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
            }

            this.x += this.speedX;
            this.y += this.speedY;
            this.pulsePhase += this.pulseSpeed;

            if (this.x < 0 || this.x > canvas.width ||
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            const pulse = this.glowing ? (Math.sin(this.pulsePhase) * 0.3 + 0.7) : 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * pulse, 0, Math.PI * 2);
            ctx.fillStyle = this.glowing
                ? `rgba(201, 169, 110, ${this.opacity * pulse})`
                : `rgba(200, 200, 220, ${this.opacity * 0.5})`;
            ctx.fill();

            if (this.glowing) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 4 * pulse, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201, 169, 110, ${this.opacity * 0.08 * pulse})`;
                ctx.fill();
            }
        }
    }

    function initParticles() {
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connecting lines between close particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(201, 169, 110, ${0.04 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();


    // ─── Cursor Glow Effect ───
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && !('ontouchstart' in window)) {
        window.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
            cursorGlow.classList.add('visible');
        });
        window.addEventListener('mouseleave', () => {
            cursorGlow.classList.remove('visible');
        });
    }


    // ─── Navbar Scroll Effect ───
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });


    // ─── Mobile Navigation ───
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });


    // ─── Active Nav Link Tracking ───
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);


    // ─── 3D Tilt Effect for Product Cards ───
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        const inner = card.querySelector('.product-card-inner');
        if (!inner) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });


    // ─── Scroll Reveal Animations ───
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => observer.observe(el));


    // ─── Counter Animation ───
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutQuart
            const ease = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(target * ease);
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(update);
    }

    const statNumbers = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => statsObserver.observe(el));


    // ─── Product Filter ───
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            productCards.forEach((card, index) => {
                const category = card.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = `fadeInUp 0.5s ease ${index * 0.08}s both`;
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });


    // ─── Shopping Cart ───
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    let cart = [];

    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function addToCart(name, price, imageSrc) {
        cart.push({ name, price, image: imageSrc });
        updateCart();
        showToast(`${name} added to bag!`);
    }

    function updateCart() {
        cartCount.textContent = cart.length;
        cartCount.classList.toggle('show', cart.length > 0);

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                        <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    <p>Your bag is empty</p>
                </div>`;
            cartFooter.style.display = 'none';
        } else {
            cartItems.innerHTML = cart.map((item, i) => `
                <div class="cart-item">
                    <img src="${item.image || 'images/product_jacket.png'}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                        <div class="cart-item-remove" data-index="${i}">Remove</div>
                    </div>
                </div>
            `).join('');
            cartFooter.style.display = 'block';

            const total = cart.reduce((sum, item) => sum + item.price, 0);
            cartTotal.textContent = `$${total.toLocaleString()}`;

            // Remove item listeners
            document.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    cart.splice(index, 1);
                    updateCart();
                    showToast('Item removed from bag');
                });
            });
        }
    }

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'));

            // Find the closest image
            const card = btn.closest('.product-card') || btn.closest('.product-card-inner');
            const img = card ? card.querySelector('.product-image') : null;
            const imageSrc = img ? img.getAttribute('src') : 'images/product_jacket.png';

            addToCart(name, price, imageSrc);

            // Button animation
            btn.classList.add('added');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span>✓ Added!</span>';

            setTimeout(() => {
                btn.classList.remove('added');
                btn.innerHTML = originalHTML;
            }, 1500);
        });
    });


    // ─── Wishlist Toggle ───
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const isActive = btn.classList.contains('active');
            showToast(isActive ? 'Added to wishlist ♥' : 'Removed from wishlist');
        });
    });


    // ─── Search Overlay ───
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');

    function openSearch() {
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchInput.focus(), 300);
    }

    function closeSearch() {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        searchInput.value = '';
    }

    searchBtn.addEventListener('click', openSearch);
    searchClose.addEventListener('click', closeSearch);

    // Search suggestions click
    document.querySelectorAll('.search-suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', (e) => {
            e.preventDefault();
            closeSearch();
            const collectionsSection = document.getElementById('collections');
            if (collectionsSection) {
                collectionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Search on Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            closeSearch();
            const collectionsSection = document.getElementById('collections');
            if (collectionsSection) {
                collectionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });


    // ─── Quick View Modal ───
    const modalOverlay = document.getElementById('modalOverlay');
    const quickViewModal = document.getElementById('quickViewModal');
    const modalClose = document.getElementById('modalClose');
    const modalImage = document.getElementById('modalImage');
    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    const modalReviews = document.getElementById('modalReviews');
    const modalDescription = document.getElementById('modalDescription');
    const modalPrice = document.getElementById('modalPrice');
    const modalOldPrice = document.getElementById('modalOldPrice');
    const modalAddCart = document.getElementById('modalAddCart');

    // Product data for Quick View
    const productData = {
        '1': {
            name: 'Elite Leather Jacket',
            category: "Men's Outerwear",
            price: '$849',
            oldPrice: '$1,199',
            reviews: '(128)',
            image: 'images/product_jacket.png',
            description: 'Hand-stitched from premium Italian full-grain leather, this iconic jacket features a custom silk lining and precision hardware. Each piece undergoes 40+ hours of meticulous craftsmanship.'
        },
        '2': {
            name: 'Velvet Evening Gown',
            category: "Women's Dresses",
            price: '$1,249',
            oldPrice: '$1,899',
            reviews: '(96)',
            image: 'images/product_dress.png',
            description: 'A breathtaking burgundy velvet gown designed for unforgettable evenings. Features an asymmetric drape, hand-sewn embellishments, and a figure-flattering silhouette.'
        },
        '3': {
            name: 'Aurora Designer Sneakers',
            category: 'Footwear',
            price: '$599',
            oldPrice: '$799',
            reviews: '(214)',
            image: 'images/product_sneakers.png',
            description: 'Where street culture meets luxury. Crafted with premium calfskin leather uppers, cushioned insoles, and our signature Aurora sole technology for all-day comfort.'
        },
        '4': {
            name: 'Cognac Heritage Bag',
            category: 'Accessories',
            price: '$1,499',
            oldPrice: '$2,149',
            reviews: '(73)',
            image: 'images/product_handbag.png',
            description: 'Vegetable-tanned Italian leather that ages beautifully. Hand-burnished edges, solid brass hardware, and complimentary monogram service make this bag truly yours.'
        },
        '5': {
            name: 'Savile Row Tailored Suit',
            category: "Men's Formalwear",
            price: '$2,499',
            oldPrice: '$3,200',
            reviews: '(55)',
            image: 'images/product_suit.png',
            description: 'Bespoke tailoring at its finest. Cut from Super 150s merino wool with mother-of-pearl buttons, full canvas construction, and a complimentary fitting session.'
        },
        '6': {
            name: 'Silk Cascade Dress',
            category: "Women's Runway",
            price: '$1,899',
            oldPrice: '',
            reviews: '(42)',
            image: 'images/product_dress.png',
            description: 'A runway masterpiece in pure mulberry silk. The cascading layers create an ethereal silhouette, while delicate hand-sewn details add captivating texture.'
        }
    };

    let currentModalProduct = null;

    function openModal(productId) {
        const product = productData[productId];
        if (!product) return;

        currentModalProduct = product;
        modalImage.src = product.image;
        modalImage.alt = product.name;
        modalCategory.textContent = product.category;
        modalTitle.textContent = product.name;
        modalReviews.textContent = product.reviews;
        modalDescription.textContent = product.description;
        modalPrice.textContent = product.price;
        modalOldPrice.textContent = product.oldPrice;

        modalOverlay.classList.add('active');
        quickViewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        quickViewModal.classList.remove('active');
        document.body.style.overflow = '';
        currentModalProduct = null;
    }

    // Attach Quick View buttons
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-product');
            openModal(productId);
        });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Modal Add to Cart
    modalAddCart.addEventListener('click', () => {
        if (currentModalProduct) {
            const price = parseInt(currentModalProduct.price.replace(/[$,]/g, ''));
            addToCart(currentModalProduct.name, price, currentModalProduct.image);

            const originalHTML = modalAddCart.innerHTML;
            modalAddCart.innerHTML = '<span>✓ Added to Bag!</span>';
            setTimeout(() => {
                modalAddCart.innerHTML = originalHTML;
            }, 1500);
        }
    });

    // Modal Wishlist
    const modalWishlist = document.getElementById('modalWishlist');
    modalWishlist.addEventListener('click', () => {
        modalWishlist.classList.toggle('active');
        showToast(modalWishlist.classList.contains('active') ? 'Added to wishlist ♥' : 'Removed from wishlist');
    });

    // Size selector
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Color selector
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
        });
    });


    // ─── Newsletter Form ───
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('emailInput').value;
            if (email) {
                showToast('Welcome to the inner circle! ✨');
                document.getElementById('emailInput').value = '';
            }
        });
    }


    // ─── Smooth Scroll for Anchor Links ───
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // ─── 3D Showcase - Touch/Click flip for mobile ───
    if ('ontouchstart' in window) {
        document.querySelectorAll('.showcase-card').forEach(card => {
            card.addEventListener('click', () => {
                const inner = card.querySelector('.showcase-card-3d');
                inner.style.transform = inner.style.transform === 'rotateY(180deg)'
                    ? 'rotateY(0deg)'
                    : 'rotateY(180deg)';
            });
        });
    }


    // ─── CSS Keyframe for Filter Animation ───
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;
    document.head.appendChild(styleSheet);


    // ─── Keyboard: Escape closes overlays ───
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeSearch();
            closeModal();
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

});

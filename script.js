// SEARCH FUNCTIONALITY: Redirects user to search results page
document.querySelector(".search-btn").addEventListener("click", function() {
    let query = document.querySelector(".search-input").value.trim().toLowerCase();
    if (query) {
        window.location.href = `search-results.html?query=${encodeURIComponent(query)}`;
    }
});

// Allows user to press Enter to search
document.querySelector(".search-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        document.querySelector(".search-btn").click();
    }
});

// SMOOTH SCROLL: When "About Us" button is clicked, it smoothly scrolls to footer


document.addEventListener("DOMContentLoaded", () => {
    const triggers = document.querySelectorAll(".dropdown-trigger");
    let activeMenu = null;

    triggers.forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            const menuId = trigger.getAttribute("data-menu");
            const menu = document.getElementById(menuId);

            // Close any other open dropdown
            if (activeMenu && activeMenu !== menu) {
                activeMenu.classList.remove("show");
            }

            // Toggle current dropdown
            if (menu) {
                const isOpen = menu.classList.contains("show");
                menu.classList.toggle("show", !isOpen);
                activeMenu = isOpen ? null : menu;
            }
        });
    });

    // Close dropdown if clicked outside
    document.addEventListener("click", (event) => {
        if (!event.target.closest("nav")) {
            document.querySelectorAll(".dropdown-menu").forEach((menu) => {
                menu.classList.remove("show");
            });
            activeMenu = null;
        }
    });
});

let slideIndex = 0;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

function showSlides(direction) {
    const currentSlide = slides[slideIndex];
    let newIndex;

    if (direction === "next") {
        newIndex = (slideIndex + 1) % slides.length;
    } else if (direction === "prev") {
        newIndex = (slideIndex - 1 + slides.length) % slides.length;
    } else {
        newIndex = direction; // For manual dot clicks
    }

    const newSlide = slides[newIndex];

    // Set up exit and enter animations
    if (direction === "next") {
        currentSlide.classList.add("exit-left");
        newSlide.classList.add("enter-right");
    } else if (direction === "prev") {
        currentSlide.classList.add("exit-right");
        newSlide.classList.add("enter-left");
    } else {
        // For manual dot clicks, determine direction
        if (newIndex > slideIndex) {
            currentSlide.classList.add("exit-left");
            newSlide.classList.add("enter-right");
        } else {
            currentSlide.classList.add("exit-right");
            newSlide.classList.add("enter-left");
        }
    }

    // Wait for the transition to complete
    setTimeout(() => {
        currentSlide.classList.remove("active", "exit-left", "exit-right");
        newSlide.classList.remove("enter-left", "enter-right");
        newSlide.classList.add("active");
        slideIndex = newIndex;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === slideIndex);
        });
    }, 360); // Match this duration to the CSS transition duration
}

function changeSlide(n) {
    const direction = n === 1 ? "next" : "prev";
    showSlides(direction);
}

function setSlide(n) {
    showSlides(n);
}

// Auto-play slides
let autoSlideInterval;

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        changeSlide(1); // Automatically go to the next slide
    }, 5000); // Change every 5 seconds
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

document.addEventListener("DOMContentLoaded", () => {
    slides[slideIndex].classList.add("active"); // Show the first slide
    dots[slideIndex].classList.add("active"); // Activate the first dot
    startAutoSlide();

    // Pause auto-slide on arrow or dot click
    document.querySelectorAll(".prev, .next, .dot").forEach((element) => {
        element.addEventListener("click", () => {
            stopAutoSlide();
            startAutoSlide(); // Restart auto-slide after manual interaction
        });
    });
});

function showSlides(direction) {
    const currentSlide = slides[slideIndex];
    let newIndex;

    if (direction === "next") {
        newIndex = (slideIndex + 1) % slides.length;
    } else if (direction === "prev") {
        newIndex = (slideIndex - 1 + slides.length) % slides.length;
    } else {
        newIndex = direction; // For manual dot clicks
    }

    console.log(`Current Index: ${slideIndex}, New Index: ${newIndex}`); // Debugging

    const newSlide = slides[newIndex];

    // Set up exit and enter animations
    if (direction === "next") {
        currentSlide.classList.add("exit-left");
        newSlide.classList.add("enter-right");
    } else if (direction === "prev") {
        currentSlide.classList.add("exit-right");
        newSlide.classList.add("enter-left");
    } else {
        // For manual dot clicks, determine direction
        if (newIndex > slideIndex) {
            currentSlide.classList.add("exit-left");
            newSlide.classList.add("enter-right");
        } else {
            currentSlide.classList.add("exit-right");
            newSlide.classList.add("enter-left");
        }
    }

    // Wait for the transition to complete
    setTimeout(() => {
        currentSlide.classList.remove("active", "exit-left", "exit-right");
        newSlide.classList.remove("enter-left", "enter-right");
        newSlide.classList.add("active");
        slideIndex = newIndex;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === slideIndex);
        });
    }, 360); // Match this duration to the CSS transition duration
}

const expandBtn = document.querySelector('.expand-btn');
if (expandBtn) {
    expandBtn.addEventListener('click', function() {
        document.querySelector('.vertical-bar').classList.toggle('expanded');
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const productsMenuTrigger = document.querySelector('.dropdown-trigger[data-menu="products-menu"]');
    const productsMenu = document.getElementById('products-menu');
    const categoryTriggers = document.querySelectorAll('.category-trigger');
    const productsList = document.getElementById('products-list');
    const solutionsList = document.getElementById('solutions-list');

    const productsData = {
        'clinical-biochemistry': {
            products: [
                'Helena ColoScreen and ColoScreen-ES',
                'Immunodiagnostic Systems (IDS) ELISA and RIA Products',
                'BÜHLMANN Gamma-hydroxybutyric acid (GHB)',
                'BÜHLMANN Cellular Allergy Products'
            ],
            solutions: [
                'Piccolo Xpress Chemistry Analyzer',
                'BÜHLMANN fCAL® turbo and fPELA® turbo'
            ]
        },
        'hematology': {
            products: ['Erythrocyte Sedimentation Rate (ESR) Controls'],
            solutions: ['ELITech Excyte ESR Analyzers']
        },
        'microbiology': {
            products: [
                'C-Reactive Protein (CRP)',
                'Rheumajet RF',
                'Rheumajet ASO'
            ],
            solutions: [
                'QIAGEN QIAstat-Dx Syndromic Testing Analyzer',
                'QIAGEN QuantiFERON-TB Gold Plus'
            ]
        }
    };

    // Open dropdown when clicking "Products & Solutions"
    productsMenuTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        productsMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-trigger')) {
            productsMenu.classList.remove('show');
        }
    });

    // Update products & solutions dynamically on hover
    categoryTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function () {
            const category = this.getAttribute('data-category');

            productsList.innerHTML = '';
            solutionsList.innerHTML = '';

            if (productsData[category]) {
                productsData[category].products.forEach(product => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="#">${product}</a>`;
                    productsList.appendChild(li);
                });

                productsData[category].solutions.forEach(solution => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="#">${solution}</a>`;
                    solutionsList.appendChild(li);
                });
            }
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const productsMenuTrigger = document.querySelector('.dropdown-trigger[data-menu="products-menu"]');
    const productsMenu = document.getElementById('products-menu');
    const categoryTriggers = document.querySelectorAll('.category-trigger');
    const productsList = document.getElementById('products-list');
    const solutionsList = document.getElementById('solutions-list');

    const productsData = {
        'clinical-biochemistry': {
            products: [
                'Helena ColoScreen and ColoScreen-ES',
                'Immunodiagnostic Systems (IDS) ELISA and RIA Products',
                'BÜHLMANN Gamma-hydroxybutyric acid (GHB)',
                'BÜHLMANN Cellular Allergy Products'
            ],
            solutions: [
                'Piccolo Xpress Chemistry Analyzer',
                'BÜHLMANN fCAL® turbo and fPELA® turbo'
            ]
        },
        'hematology': {
            products: ['Erythrocyte Sedimentation Rate (ESR) Controls'],
            solutions: ['ELITech Excyte ESR Analyzers']
        },
        'microbiology': {
            products: [
                'C-Reactive Protein (CRP)',
                'Rheumajet RF',
                'Rheumajet ASO'
            ],
            solutions: [
                'QIAGEN QIAstat-Dx Syndromic Testing Analyzer',
                'QIAGEN QuantiFERON-TB Gold Plus'
            ]
        }
    };

    // Open dropdown when clicking "Products & Solutions"
    productsMenuTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        productsMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-trigger')) {
            productsMenu.classList.remove('show');
        }
    });

    // Update products & solutions dynamically on hover
    categoryTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function () {
            const category = this.getAttribute('data-category');

            productsList.innerHTML = '';
            solutionsList.innerHTML = '';

            if (productsData[category]) {
                productsData[category].products.forEach(product => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="#">${product}</a>`;
                    productsList.appendChild(li);
                });

                productsData[category].solutions.forEach(solution => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="#">${solution}</a>`;
                    solutionsList.appendChild(li);
                });
            }
        });
    });

    categoryTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function () {
            console.log(`🖱 Hover detected on: ${this.textContent}`);
        });
    });
});

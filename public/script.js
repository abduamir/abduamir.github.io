// Shared Pagination Variables
const productsPerPage = 25;
let currentPage = 1;
let currentCategory = null; // Null unless tabs are used

// Tab and Pagination Logic
console.log('Tab script is running');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Common Setup
    const productList = document.querySelector('.product-table tbody');
    const paginationContainer = document.querySelector('.pagination');
    const tabButtons = document.querySelectorAll('.catalogue .tabs .tab-btn');

    if (!productList) {
        console.warn('Product table not found');
        return;
    }

    const tableRows = Array.from(productList.children);
    console.log('Table rows found:', tableRows.length);

    // Tab Logic (Optional)
    if (tabButtons.length > 0) {
        console.log('Tab buttons found:', tabButtons.length);

        function showCategory(category) {
            console.log('Showing category:', category);
            currentCategory = category; // Track for pagination

            if (category === 'all') {
                // Show all rows if category is 'all'
                tableRows.forEach(row => {
                    row.classList.add('tab-active');
                });
            } else {
                // Filter rows by category
                tableRows.forEach(row => {
                    const rowCategory = row.getAttribute('data-category');
                    row.classList.toggle('tab-active', rowCategory === category);
                });
            }

            currentPage = 1; // Reset to page 1 on category change
            updateProductDisplay();
        }

        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                console.log('Tab clicked:', this.getAttribute('data-tab'));
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const category = this.getAttribute('data-tab');
                showCategory(category);
            });
        });

        // Dynamically determine the initial category
        // Look for the tab with the 'active' class, or default to the first tab
        const initialTab = Array.from(tabButtons).find(btn => btn.classList.contains('active')) || tabButtons[0];
        if (initialTab) {
            const initialCategory = initialTab.getAttribute('data-tab');
            console.log('Initial category:', initialCategory);
            showCategory(initialCategory);
        } else {
            console.warn('No tab buttons found, showing all rows');
            tableRows.forEach(row => row.classList.add('tab-active'));
            updateProductDisplay();
        }
    } else {
        console.log('No tabs on this page, proceeding with all rows');
        // For non-tabbed pages, mark all rows as tab-active by default
        tableRows.forEach(row => row.classList.add('tab-active'));
        updateProductDisplay(); // Run pagination immediately
    }

    // Shared Pagination Functions
    function updateProductDisplay() {
        // Filter to tab-active rows (all rows if no tabs)
        const activeRows = tableRows.filter(row => row.classList.contains('tab-active'));
        console.log('Active rows:', activeRows.length, 'Category:', currentCategory || 'All');

        const totalPages = Math.ceil(activeRows.length / productsPerPage);
        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;

        tableRows.forEach(row => {
            const isActive = row.classList.contains('tab-active');
            const indexInActive = activeRows.indexOf(row);
            const isInPageRange = isActive && indexInActive >= start && indexInActive < end;
            row.classList.toggle('page-active', isInPageRange);
        });

        createPaginationButtons(totalPages);
    }

    function createPaginationButtons(totalPages) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        // Hide pagination if 25 or fewer rows
        const activeRows = tableRows.filter(row => row.classList.contains('tab-active'));
        if (activeRows.length <= productsPerPage) {
            console.log('No pagination needed:', activeRows.length, 'rows');
            return;
        }

        const createButton = (text, page) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.classList.add('page-btn');
            if (page === currentPage) button.classList.add('active');
            button.addEventListener('click', () => {
                currentPage = page;
                updateProductDisplay();
            });
            return button;
        };

        if (currentPage > 1) {
            paginationContainer.appendChild(createButton('Previous', currentPage - 1));
        }

        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.appendChild(createButton(i, i));
        }

        if (currentPage < totalPages) {
            paginationContainer.appendChild(createButton('Next', currentPage + 1));
        }
    }
});

// Levenshtein Distance function
function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill(null).map(() =>
        Array(a.length + 1).fill(null)
    );
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }
    return matrix[b.length][a.length];
}

// Search button and Enter key functionality
document.querySelector(".search-btn").addEventListener("click", function() {
    let query = document.querySelector(".search-input").value.trim().toLowerCase();
    if (query) {
        window.location.href = `/search-results.html?query=${encodeURIComponent(query)}`;
    }
});

document.querySelector(".search-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        document.querySelector(".search-btn").click();
    }
});

// Get query parameter from URL
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Fetch and extract page content
async function fetchPageContent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mainContent = doc.querySelector('main') || doc.body;
        const textElements = mainContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
        return Array.from(textElements)
            .map(el => el.textContent.trim())
            .join(' ')
            .toLowerCase();
    } catch (error) {
        console.error(error);
        return '';
    }
}

// Perform search
async function performSearch() {
    const query = getQueryParameter('query');
    if (!query) {
        console.log('No query provided');
        return;
    }
    console.log('Query:', query);
    try {
        const response = await fetch('/api/pages');
        if (!response.ok) throw new Error('Failed to fetch page list');
        const pages = await response.json();
        console.log('Pages fetched:', pages);
        const pagesWithContent = await Promise.all(pages.map(async page => {
            const content = await fetchPageContent(page.url);
            console.log(`Content for ${page.url}:`, content.slice(0, 50));
            return { ...page, description: content.slice(0, 100), content };
        }));
        const queryWords = query.toLowerCase().split(/\s+/);
        console.log('Query words:', queryWords);
        const results = pagesWithContent
            .map(page => {
                const nameLower = page.name.toLowerCase();
                const contentLower = page.content || '';
                let score = 0;
                let bestMatchDistance = Infinity;
                queryWords.forEach(word => {
                    if (nameLower.includes(word)) score += 10;
                    if (contentLower.includes(word)) score += 3;
                    const nameWords = nameLower.split(/\s+/);
                    const contentWords = contentLower.split(/\s+/);
                    const allWords = [...nameWords, ...contentWords];
                    allWords.forEach(targetWord => {
                        const distance = levenshteinDistance(word, targetWord);
                        const maxLength = Math.max(word.length, targetWord.length);
                        const normalizedDistance = distance / maxLength;
                        if (normalizedDistance < 0.4) {
                            const wordScore = 2 / (distance + 1);
                            score += wordScore;
                            bestMatchDistance = Math.min(bestMatchDistance, distance);
                        }
                    });
                });
                console.log(`Page: ${page.name}, Score: ${score}`);
                return { page, score, bestMatchDistance };
            })
            .filter(result => result.score > 0)
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.bestMatchDistance - b.bestMatchDistance;
            })
            .map(result => result.page);
        console.log('Results:', results);
        displayResults(results);
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Display search results
function displayResults(results) {
    const resultsContainer = document.getElementById('search-results');
    const header = resultsContainer.querySelector('.results-header');
    if (!resultsContainer || !header) return;

    const query = getQueryParameter('query') || '';
    header.textContent = `Search results for: ${decodeURIComponent(query)}`;

    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(header);

    if (results.length === 0) {
        resultsContainer.innerHTML += '<p>No results found</p>';
        return;
    }

    const ul = document.createElement('ul');
    results.forEach(result => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = result.url;
        a.textContent = result.name;
        li.appendChild(a);

        const description = document.createElement('div');
        description.className = 'description';
        description.textContent = result.description || 'Learn more about this topic.';
        li.appendChild(description);

        ul.appendChild(li);
    });

    resultsContainer.appendChild(ul);
}

// Run search on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('search-results.html')) {
        performSearch();
    }
});

// Consolidated Dropdown Logic
document.addEventListener("DOMContentLoaded", () => {
    const triggers = document.querySelectorAll(".dropdown-trigger, .view-products-btn");
    let activeMenu = null;

    triggers.forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            const menuId = trigger.getAttribute("data-menu");
            const menu = document.getElementById(menuId);
            console.log('Trigger clicked:', menuId); // Debug

            if (activeMenu && activeMenu !== menu) {
                activeMenu.classList.remove("show");
            }

            if (menu) {
                const isOpen = menu.classList.contains("show");
                menu.classList.toggle("show", !isOpen);
                activeMenu = isOpen ? null : menu;
            } else {
                console.log('Menu not found:', menuId);
            }
        });
    });

    // Click-outside handler
    document.addEventListener("click", (event) => {
        if (!event.target.closest("nav") && !event.target.closest(".tile")) {
            document.querySelectorAll(".dropdown-menu").forEach((menu) => {
                menu.classList.remove("show");
                menu.style.position = '';
                menu.style.top = '';
                menu.style.left = '';
                menu.style.width = '';
            });
            activeMenu = null;
        }
    });

    // Products & Solutions Sub-Menu Logic
    const categoryTriggers = document.querySelectorAll('.category-trigger');
    const productsList = document.getElementById('products-list');
    const solutionsList = document.getElementById('solutions-list');

    const productsData = {
        'clinical-chemistry': {
            products: [
                { name: 'Control OPTI™ B-Cassette Blood Gas', url: '/pages/optimedical-list.html' },
                { name: 'Control OPTI™ SRC Level 1', url: '/pages/optimedical-list.html' },
                { name: 'Control OPTI™ SRC Level 3', url: '/pages/optimedical-list.html' },
                { name: 'OPTI 1 Calibration Gas Bottle', url: '/pages/optimedical-list.html' },
                { name: 'OPTI-Check Vials, Tri-level', url: '/pages/optimedical-list.html' },
                { name: 'More Products...', url: '/pages/optimedical-list.html' }
            ],
            solutions: [
                { name: 'OPTI CCA-TS2 Blood Gas and Electrolyte Analyzer', url: '/pages/OptiMedical-products.html' }
            ]
        },
        'hematology': {
            products: [
                { name: 'Seditrol® Quality Control', url: '/pages/alcor-list.html' },
                { name: 'iWASH™ Wash Fluid', url: '/pages/alcor-list.html' },
                { name: 'miniiWASH™ Wash Fluid', url: '/pages/alcor-list.html' },
                { name: 'miniiWASTE™ Container', url: '/pages/alcor-list.html' },
                { name: 'WASTE Container', url: '/pages/alcor-list.html' },
                { name: 'Test Card; 500 test credits', url: '/pages/alcor-list.html' },
                { name: 'Test Card; 1000 test credits', url: '/pages/alcor-list.html' },
                { name: 'More Products...', url: '/pages/alcor-list.html' }
            ],
            solutions: [
                { name: 'iSED', url: '/pages/alcor-products.html' },
                { name: 'iSED Pro', url: '/pages/alcor-products.html' },
                { name: 'miniiSED', url: '/pages/alcor-products.html' }
            ]
        },
        'microbiology': {
            products: [],
            solutions: [
                {
                    name: 'Fujirebio – Lumipulse, Autoblot',
                    url: '/pages/fujirebio-products.html',
                    products: [
                        { name: 'ELISA', url: '/pages/fujirebio-list.html' },
                        { name: 'Blots', url: '/pages/fujirebio-list.html' }
                    ]
                },
                {
                    name: 'Mikrogen – Carl',
                    url: '/pages/mikrogen-products.html',
                    products: [
                        { name: 'ELISA', url: '/pages/mikrogen-list.html' },
                        { name: 'Blots', url: '/pages/mikrogen-list.html' }
                    ]
                },
                {
                    name: 'Dynex – DSX',
                    url: '/pages/dynex-list.html',
                    products: [
                        { name: 'View All Products...', url: '/pages/dynex-list.html' },
                    ]
                },
                {
                    name: 'Stratec - Gemini',
                    url: '/pages/stratec-list.html',
                    products: [
                        { name: 'View All Products...', url: '/pages/stratec-list.html' },
                    ]
                },
                {
                    name: 'Phoenix',
                    url: '#',
                    products: [
                        { name: 'ELISA', url: '/pages/phoenix-list.html' }
                    ]
                },
                
                {
                    name: 'Alltest',
                    url: '#',
                    products: [
                        { name: 'Rapid Testing', url: '/pages/alltest-list.html' }
                    ]
                }
            ]
        },
        'EQA': {
            products: [
                { name: 'Biochemistry Programs', url: '/pages/ESFEQA-list.html' },
                { name: 'Microbiology and Virology', url: '/pages/ESFEQA-list.html' },
                { name: 'Immunology Programs', url: '/pages/ESFEQA-list.html' },
                { name: 'Hematology and Immunohematology', url: '/pages/ESFEQA-list.html' },
                { name: 'CSF Diagnostics and Coagulation', url: '/pages/ESFEQA-list.html' },
                { name: 'Educational Programs', url: '/pages/ESFEQA-list.html' }
            ],
            solutions: [
                { name: 'External Quality Assessment (EQA) programs', url: '/pages/ESFEQA-list.html' }
            ]
        },
        'pathology': {
            products: [
                { name: 'Cassettes', url: '/pages/cellpath-products.html' },
                { name: 'Blades', url: '/pages/cellpath-products.html' },
                { name: 'Filters', url: '/pages/cellpath-products.html' },
                { name: 'Slides', url: '/pages/cellpath-products.html' },
                { name: 'More Products...', url: '/pages/cellpath-products.html' }
            ],
            solutions: [
                { name: 'TISSUE SECTION BATH (ROUND)', url: '/pages/cellpath-products.html' },
                { name: 'MINI HOTPLATE/ORIENTATOR', url: '/pages/cellpath-products.html' },
                { name: 'CELLCEPS+ HEATED FORCEP - SMOOTH', url: '/pages/cellpath-products.html' },
                { name: 'HIGH CAPACITY SECTION DRYER', url: '/pages/cellpath-products.html' }
            ]
        },
        'transfusion-medicine': {
            products: [
                { name: 'RADGIL2 - XRay Blood Irradiator', url: '/pages/gilardoni-products.html' },
                
            ],
            solutions: [
                { name: 'RADGIL2 - XRay Blood Irradiator', url: '/pages/gilardoni-products.html' },
                
            ]
        },
        'disinfection-systems': {
            products: [
                { name: 'Glycinex™ Disinfectant Neutralizer', url: '/pages/csmedical-list.html' },
                { name: 'QwikDry TEE Probe Drying Cloth', url: '/pages/csmedical-list.html' },
                { name: 'TD-5', url: '/pages/csmedical-list.html' },
                { name: 'TD-8', url: '/pages/csmedical-list.html' },
                { name: 'TD-12', url: '/pages/csmedical-list.html' },
                { name: 'TEEZyme® for TEEClean', url: '/pages/csmedical-list.html' },
                { name: 'TEEZyme®MC Enzymatic Cleaner', url: '/pages/csmedical-list.html' }
            ],
            solutions: [
                { name: 'TD 100® Automated TEE Probe Disinfector', url: '/pages/csmedical-products.html' },
                { name: 'TD 200® Automated TEE Probe Disinfector', url: '/pages/csmedical-products.html' },
                { name: 'TEEClean® Automated TEE Probe Cleaner Disinfector', url: '/pages/csmedical-products.html' }
            ]
        },
        'Biomarkers': {
            products: [
                { name: 'Neurobiomarkers', url: '/pages/fujirebio-list.html' },
                { name: 'Cardiobiomarkers', url: '/products/cardiobiomarkers' }
            ],
            solutions: [
                { name: 'Lumipulse G1200', url: '/pages/fujirebio-products.html' }
            ]
        },
        'Pre-Analytical': {
            products: [],
            solutions: [
                { name: 'HENd', url: '/pages/energium-products.html' },
                { name: 'HENm', url: '/pages/energium-products.html' }
            ]
        },
        'Food-Sensitivity': {
            products: [],
            solutions: [
                { name: 'HENd', url: '/pages/energium-products.html' },
                { name: 'HENm', url: '/pages/energium-products.html' }
            ]
        }
    };

    categoryTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function () {
            const category = this.getAttribute('data-category');
            console.log(`🖱 Hover detected on category: ${category}`); // Debug
            productsList.innerHTML = '';
            solutionsList.innerHTML = '';

            if (!productsData[category]) {
                console.warn(`No data found for category: ${category}`);
                solutionsList.innerHTML = '<li>No solutions available</li>';
                productsList.innerHTML = '<li>N/A</li>';
                return;
            }

            if (category === 'microbiology') {
                // Special handling for microbiology
                console.log('Processing microbiology solutions:', productsData[category].solutions);
                productsData[category].solutions.forEach(solution => {
                    if (!solution.name || !solution.url || !Array.isArray(solution.products)) {
                        console.warn('Invalid solution data:', solution);
                        return;
                    }

                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = solution.url;
                    a.textContent = solution.name;
                    li.appendChild(a);
                    solutionsList.appendChild(li);
                    console.log(`Added solution: ${solution.name} with URL: ${solution.url}`); // Debug

                    // Add hover event listener to each solution
                    li.addEventListener('mouseenter', () => {
                        console.log(`🖱 Hover on solution: ${solution.name}`);
                        productsList.innerHTML = ''; // Clear products list
                        if (solution.products.length === 0) {
                            productsList.innerHTML = '<li>No products available</li>';
                        } else {
                            solution.products.forEach(product => {
                                if (!product.name || !product.url) {
                                    console.warn('Invalid product data:', product);
                                    return;
                                }
                                const productLi = document.createElement('li');
                                productLi.innerHTML = `<a href="${product.url}">${product.name}</a>`;
                                productsList.appendChild(productLi);
                                console.log(`Added product: ${product.name} with URL: ${product.url}`); // Debug
                            });
                        }
                    });
                });

                // Set initial products list state
                productsList.innerHTML = '<li>Please hover over a solution to see products</li>';
            } else {
                // Default handling for other categories
                console.log(`Processing category: ${category}`);
                if (productsData[category].products.length === 0) {
                    productsList.innerHTML = '<li>No products available</li>';
                } else {
                    productsData[category].products.forEach(product => {
                        if (!product.name || !product.url) {
                            console.warn('Invalid product data:', product);
                            return;
                        }
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="${product.url}">${product.name}</a>`;
                        productsList.appendChild(li);
                    });
                }

                if (productsData[category].solutions.length === 0) {
                    solutionsList.innerHTML = '<li>No solutions available</li>';
                } else {
                    productsData[category].solutions.forEach(solution => {
                        if (!solution.name || !solution.url) {
                            console.warn('Invalid solution data:', solution);
                            return;
                        }
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="${solution.url}">${solution.name}</a>`;
                        solutionsList.appendChild(li);
                    });
                }
            }
        });
    });

    // Reset products list when leaving solutions column (for microbiology)
    solutionsList.addEventListener('mouseleave', () => {
        if (document.querySelector('.category-trigger[data-category="microbiology"]:hover')) {
            console.log('Mouse left solutions list, resetting products');
            productsList.innerHTML = '<li>Please hover over a solution to see products</li>';
        }
    });
});

// Slideshow Logic
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
        newIndex = direction;
    }

    const newSlide = slides[newIndex];

    if (direction === "next") {
        currentSlide.classList.add("exit-left");
        newSlide.classList.add("enter-right");
    } else if (direction === "prev") {
        currentSlide.classList.add("exit-right");
        newSlide.classList.add("enter-left");
    } else {
        if (newIndex > slideIndex) {
            currentSlide.classList.add("exit-left");
            newSlide.classList.add("enter-right");
        } else {
            currentSlide.classList.add("exit-right");
            newSlide.classList.add("enter-left");
        }
    }

    setTimeout(() => {
        currentSlide.classList.remove("active", "exit-left", "exit-right");
        newSlide.classList.remove("enter-left", "enter-right");
        newSlide.classList.add("active");
        slideIndex = newIndex;

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === slideIndex);
        });
    }, 360);
}

function changeSlide(n) {
    const direction = n === 1 ? "next" : "prev";
    showSlides(direction);
}

function setSlide(n) {
    showSlides(n);
}

let autoSlideInterval;

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

document.addEventListener("DOMContentLoaded", () => {
    if (slides.length > 0) {
        slides[slideIndex].classList.add("active");
        dots[slideIndex].classList.add("active");
        startAutoSlide();

        document.querySelectorAll(".prev, .next, .dot").forEach((element) => {
            element.addEventListener("click", () => {
                stopAutoSlide();
                startAutoSlide();
            });
        });
    }

    // Toggle Specs Table Logic
    const toggleSpecs = document.querySelectorAll('.toggle-specs');
    toggleSpecs.forEach(trigger => {
        trigger.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const targetTable = document.getElementById(targetId);
            const isOpen = targetTable.style.display === 'block';

            // Close all tables within the same product item
            const parentProductItem = this.closest('.product-item');
            const allTablesInItem = parentProductItem.querySelectorAll('.specs-table');
            const allTriggersInItem = parentProductItem.querySelectorAll('.toggle-specs');

            allTablesInItem.forEach(table => {
                table.style.display = 'none';
            });
            allTriggersInItem.forEach(t => {
                t.textContent = t.textContent.replace('▼', '>');
            });

            // Toggle the clicked table
            if (!isOpen) {
                targetTable.style.display = 'block';
                this.textContent = this.textContent.replace('>', '▼');
            } else {
                targetTable.style.display = 'none';
                this.textContent = this.textContent.replace('▼', '>');
            }
        });
    });
});

const expandBtn = document.querySelector('.expand-btn');
if (expandBtn) {
    expandBtn.addEventListener('click', function() {
        document.querySelector('.vertical-bar').classList.toggle('expanded');
    });
}

function toggleMoreInfo(element) {
    const table = element.nextElementSibling; // The .more-info-table div
    const isVisible = table.style.display === 'block';

    // Toggle table visibility
    table.style.display = isVisible ? 'none' : 'block';

    // Toggle the active class to change the arrow
    element.classList.toggle('active', !isVisible);
}

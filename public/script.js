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
        const response = await fetch('/pages');
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
    const header = resultsContainer.querySelector('.results-header'); // Updated selector
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
    const triggers = document.querySelectorAll(".dropdown-trigger");
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

    document.addEventListener("click", (event) => {
        if (!event.target.closest("nav")) {
            document.querySelectorAll(".dropdown-menu").forEach((menu) => {
                menu.classList.remove("show");
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
            products: ['ALCOR SEDiTROL® Quality Control'],
            solutions: ['ALCOR ESR Analyzers']
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
        },
        'molecular': {
            products: [
                'PCR Kits',
                'DNA/RNA Extraction Kits'
            ],
            solutions: [
                'Real-Time PCR Systems',
                'Next-Generation Sequencing (NGS) Platforms'
            ]
        },
        'pathology': {
            products: [
                'Histology Reagents',
                'Immunohistochemistry (IHC) Antibodies'
            ],
            solutions: [
                'Automated Staining Systems',
                'Digital Pathology Solutions'
            ]
        },
        'transfusion-medicine': {
            products: [
                'Blood Collection Tubes',
                'Blood Typing Reagents'
            ],
            solutions: [
                'Automated Blood Typing Analyzers',
                'Blood Bank Management Software'
            ]
        },
        'disinfection-systems': {
            products: [
                'Glycinex™ Disinfectant Neutralizer',
                'QwikDry TEE Probe Drying Cloth',
                'TD-12® AquaCide High-Level Disinfectant',
                'TD-5',
                'TD-8',
                'TD-12',
                'TEEZyme® for TEEClean',
                'TEEZyme®MC Enzymatic Cleaner',
                'TEEZyme™ TEE Probe Enzymatic Sponge',
                'TPorter TEE Probe Transport Device'
            ],
            solutions: [
                'AC600 Endoscopy Workstations',
                'ACVP50 – Ultrasound Workstation',
                'Automated Room Disinfection Systems',
                'Blood Irradiation – RADGIL2 – XRay Irradiator',
                'Surface Disinfection Solutions',
                'TD 100® Automated TEE Probe Disinfector',
                'TD 200® Automated TEE Probe Disinfector',
                'TEEClean® Automated TEE Probe Cleaner Disinfector'
            ]
        }
    };

    categoryTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function () {
            const category = this.getAttribute('data-category');
            console.log(`🖱 Hover detected on: ${this.textContent}`); // Debug
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
});

const expandBtn = document.querySelector('.expand-btn');
if (expandBtn) {
    expandBtn.addEventListener('click', function() {
        document.querySelector('.vertical-bar').classList.toggle('expanded');
    });
}
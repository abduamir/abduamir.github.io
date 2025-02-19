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

document.querySelector('.expand-btn').addEventListener('click', function() {
    document.querySelector('.vertical-bar').classList.toggle('expanded');
});


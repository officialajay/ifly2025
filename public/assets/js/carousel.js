const carouselInner = document.querySelector(".carousel-inner");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentIndex = 0; // Tracks the index of the first visible image
const totalImages = document.querySelectorAll(".carousel-inner img").length;
const visibleImages = 6; // Number of visible images at a time
const slideWidth = 100 / visibleImages; // Each slide width as a percentage

// Function to move the carousel
function moveCarousel() {
    carouselInner.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
}

// Function to move to the next slide
function nextSlide() {
    if (currentIndex < totalImages - visibleImages) {
        currentIndex++;
    } else {
        currentIndex = 0; // Go back to the beginning
    }
    moveCarousel();
}

// Function to move to the previous slide
function prevSlide() {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = totalImages - visibleImages; // Go to the last set of images
    }
    moveCarousel();
}

// Automatic sliding every 3 seconds
function startAutoSlide() {
    setInterval(nextSlide, 5000);
}

// Event Listeners for buttons
nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

// Start the carousel
startAutoSlide();
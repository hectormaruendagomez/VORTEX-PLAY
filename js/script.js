document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
});

let currentSlide = 0;
const slides = document.querySelectorAll('.news-item');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function initializeCarousel() {
    showSlide(0);

    document.getElementById('prevBtn').addEventListener('click', previousSlide);
    document.getElementById('nextBtn').addEventListener('click', nextSlide);

    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            showSlide(parseInt(this.getAttribute('data-slide')));
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') previousSlide();
        else if (e.key === 'ArrowRight') nextSlide();
    });
}

function showSlide(n) {
    if (n >= totalSlides) n = 0;
    else if (n < 0) n = totalSlides - 1;
    currentSlide = n;

    slides.forEach(s => s.classList.remove('active', 'prev'));
    indicators.forEach(i => i.classList.remove('active'));

    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function previousSlide() {
    slides[currentSlide].classList.add('prev');
    showSlide(currentSlide - 1);
}

const images = Array.from(document.querySelectorAll('.gallery-image'));
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('.lightbox-img');
const leftArrow = lightbox.querySelector('.lightbox-arrow.left');
const rightArrow = lightbox.querySelector('.lightbox-arrow.right');
const lightboxClose = lightbox.querySelector('.lightbox-close');

let currentIndex = 0;

function showImage(index) {
  const total = images.length;
  currentIndex = (index + total) % total; // zirkulär
  const imgSrc = images[currentIndex].getAttribute('src');
  lightboxImg.setAttribute('src', imgSrc);
  lightbox.classList.remove('hidden');
}

// Öffnen bei Klick
images.forEach((img, index) => {
  img.addEventListener('click', () => {
    showImage(index);
  });
});

// Navigation
leftArrow.addEventListener('click', (e) => {
  e.stopPropagation();
  showImage(currentIndex - 1);
});

rightArrow.addEventListener('click', (e) => {
  e.stopPropagation();
  showImage(currentIndex + 1);
});

// ESC schließen + Tastennavigation
document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('hidden')) return;
  if (e.key === 'Escape') lightbox.classList.add('hidden');
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
});

// Schließen über das X
lightboxClose.addEventListener('click', (e) => {
  e.stopPropagation();
  lightbox.classList.add('hidden');
});

// Schließen durch Klick auf Hintergrund
lightbox.addEventListener('click', (e) => {
  const isImage = e.target.classList.contains('lightbox-img');
  const isArrow = e.target.classList.contains('lightbox-arrow');
  const isClose = e.target.classList.contains('lightbox-close');
  if (!isImage && !isArrow && !isClose) {
    lightbox.classList.add('hidden');
  }
});

const images = Array.from(document.querySelectorAll('.gallery-image'));
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('.lightbox-img');
const closeBtn = lightbox.querySelector('.close');
const leftArrow = lightbox.querySelector('.lightbox-arrow.left');
const rightArrow = lightbox.querySelector('.lightbox-arrow.right');

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

// Schließen
closeBtn.addEventListener('click', () => {
  lightbox.classList.add('hidden');
});

// Navigation
leftArrow.addEventListener('click', () => {
  showImage(currentIndex - 1);
});

rightArrow.addEventListener('click', () => {
  showImage(currentIndex + 1);
});

// ESC schließen
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') lightbox.classList.add('hidden');
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
});

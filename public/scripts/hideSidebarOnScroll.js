// scripts/hideSidebarOnScroll.js

let lastScrollTop = 0;
const sidebar = document.querySelector('.sidebar');

function handleScroll() {
  if (window.innerWidth > 480) return; // Nur auf kleinen Geräten aktiv

  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  if (currentScroll > lastScrollTop) {
    sidebar.classList.add('collapsed'); // nach oben ausblenden
  } else {
    sidebar.classList.remove('collapsed'); // wieder einblenden
  }
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}

window.addEventListener('scroll', handleScroll);

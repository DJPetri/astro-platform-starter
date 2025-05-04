const toggleButton = document.querySelector('.sidebar-toggle');
const layout = document.querySelector('.layout');

toggleButton.addEventListener('click', () => {
  layout.classList.toggle('sidebar-collapsed');
});

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const toggleInside = document.getElementById("sidebarToggleInside");
    const toggleOutside = document.getElementById("sidebarToggleOutside");
  
    const toggleSidebar = () => {
      sidebar.classList.toggle("collapsed");
    };
  
    toggleInside?.addEventListener("click", toggleSidebar);
    toggleOutside?.addEventListener("click", toggleSidebar);
  });
  
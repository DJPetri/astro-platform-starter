window.addEventListener('load', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 480 && sidebar && mainContent) {
      const sidebarHeight = sidebar.offsetHeight;
      mainContent.style.marginTop = `${sidebarHeight + 10}px`; // Fügt 10px zum Abstand hinzu
    }
  
    // Optional: Wenn du das Verhalten auch bei der Seitenänderung im viewport wünschst
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 480 && sidebar && mainContent) {
        const sidebarHeight = sidebar.offsetHeight;
        mainContent.style.marginTop = `${sidebarHeight + 10}px`;
      }
    });
  });
  
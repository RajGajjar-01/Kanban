export function initNavbar() {
  const navbar = document.querySelector('[data-component="navbar"]');
  if (!navbar) return;

  const toggle = navbar.querySelector('[data-navbar-toggle]');
  const menu = navbar.querySelector('[data-navbar-menu]');

  if (!toggle || !menu) return;

  const closeMenu = () => menu.classList.remove('navbar-menu-open');
  const toggleMenu = () => menu.classList.toggle('navbar-menu-open');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  const mediaQuery = window.matchMedia('(min-width: 769px)');
  mediaQuery.addEventListener('change', (e) => {
    if (e.matches) {
      closeMenu();
    }
  });
}

import { initNavbar } from './components/navbar.js';
import { initTheme } from './utils/theme.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();  
});

import { icon_sun, icon_moon } from './constants.js';

export function openModal(modalId) {
    document.getElementById(modalId).classList.remove("hidden");
}

export function closeModal(modalId) {
    document.getElementById(modalId).classList.add("hidden");
}

export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.innerHTML = localStorage.getItem('theme') === 'dark' ? icon_moon : icon_sun;
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            console.log ('Theme toggle clicked');
            document.documentElement.classList.toggle('dark');
            // Change the icon
            if (document.documentElement.classList.contains('dark')) {
                themeToggle.innerHTML =  icon_moon;
            } else {
                themeToggle.innerHTML = icon_sun;
            }
            localStorage.setItem('theme', 
                document.documentElement.classList.contains('dark') ? 'dark' : 'light'
            );
        });
        

        if (localStorage.getItem('theme') === 'dark' || 
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');

        }
    }
}


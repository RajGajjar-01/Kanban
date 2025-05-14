import { initThemeToggle } from "./utils.js";

document.addEventListener("DOMContentLoaded", function () { 
    console.log("DOM fully loaded and parsed");
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        initThemeToggle();
    }
}
);
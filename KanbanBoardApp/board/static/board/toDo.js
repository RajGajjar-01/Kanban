import { openModal, closeModal } from "./utils.js";
import { renderWorkspaces, fetchWorkspaces } from "./workspaces.js";
import { renderBoards } from "./boards.js";

function switchTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active", "border-blue-500", "text-blue-600");
        if (btn.dataset.tab === tabName) {
            btn.classList.add("active", "border-blue-500", "text-blue-600");
        }
    });

    if (tabName === "boards") {
        renderBoards();
    } else {
        boardsGrid.innerHTML = `<p>Content for ${tabName} tab</p>`;
    }
}

document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
});

fetchWorkspaces();

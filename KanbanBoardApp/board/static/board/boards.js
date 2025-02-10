import { currentWorkspace } from "./workspaces.js";

let currentBoard = null;
const boardsGrid = document.getElementById("boardsGrid");
const addBoardBtn = document.getElementById("addBoardBtn");
const addBoardModal = document.getElementById("addBoardModal");
const addBoardForm = document.getElementById("addBoardForm");
const currentWorkspaceTitle = document.getElementById("currentWorkspaceTitle");

addBoardBtn.addEventListener("click", () => openModal("addBoardModal"));
addBoardForm.addEventListener("submit", handleAddBoard);

function handleAddBoard(e) {
    e.preventDefault();

    if (!currentWorkspace) {
        alert("Please select a workspace first.");
        return;
    }

    const formData = new FormData(e.target);
    const board = {
        id: Date.now(),
        title: formData.get("title"),
        description: formData.get("description"),
        theme: formData.get("theme"),
    };

    currentWorkspace.boards.push(board);
    renderBoards();
    closeModal("addBoardModal");
    e.target.reset();
}

export function renderBoards() {
    if (!currentWorkspace) {
        boardsGrid.innerHTML = "<p>Please select a workspace to view boards.</p>";
        return;
    }

    const boardsHTML = currentWorkspace.boards
        .map(
            (board) => `
                <div class="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                    style="background-color: ${board.theme}">
                    <h3 class="font-semibold mb-2">${board.title}</h3>
                    <p class="text-sm text-gray-300">${board.description}</p>
                </div>`
        )
        .join("");

    boardsGrid.innerHTML =
        boardsHTML +
        `<button id="addBoardBtn" class="h-48 rounded-lg flex items-center justify-center border-2 border-black"
        onclick="openModal('addBoardModal')">
            <div class="text-center hover:bg-blue-300 transition-all">
                <svg class="w-8 h-8 mx-auto mb-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-line join="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span class="text-black font-medium">Add Board</span>
            </div>
        </button>`;
}


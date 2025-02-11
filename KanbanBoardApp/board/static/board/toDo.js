import { openModal, closeModal, getCookie } from "./utils.js";

let workspaces = [];
let currentWorkspace = null;
let workspaceToDelete = null;

const workspaceList = document.getElementById("workspaceList");
const addWorkspaceBtn = document.getElementById("addWorkspaceBtn");
const cancelWorkspaceBtn = document.getElementById("cancelWorkspaceBtn");
const cancelDeleteWorkspaceBtn = document.getElementById("cancelDeleteWorkspaceBtn");
const addWorkspaceModal = document.getElementById("addWorkspaceModal");
const addWorkspaceForm = document.getElementById("addWorkspaceForm");

const workspaceTabs = document.getElementById("workspaceTabs");

addWorkspaceBtn.addEventListener("click", () => openModal("addWorkspaceModal"));
cancelWorkspaceBtn.addEventListener("click", () => closeModal("addWorkspaceModal"));
addWorkspaceForm.addEventListener("submit", handleAddWorkspace);
cancelDeleteWorkspaceBtn.addEventListener("click", () => closeModal("deleteWorkspaceModal"))

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16px" height="16px"><path d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"/></svg>`

export function renderWorkspaces() {
    console.log(workspaces);
    workspaceList.innerHTML = workspaces
        .map(
            (workspace) => `
          <div class="flex justify-between items-center w-full px-4 py-2 rounded-lg hover:bg-gray-100 ${currentWorkspace?.id === workspace.id ? "bg-gray-100" : ""
                }">
              <button class="flex-1 text-left" id="select-${workspace.id}">
                  ${workspace.name}
              </button>
              <button class="text-red-500 hover:text-red-700" onclick="confirmDeleteWorkspace(${workspace.id})">
                  ${svg}
              </button>
          </div>
      `
        )
        .join("");

    workspaces.forEach((workspace) => {
        const selectButton = document.getElementById(`select-${workspace.id}`)
        if (selectButton) {
            selectButton.addEventListener("click", () => selectWorkspace(workspace.id))
        }
    });

    workspaces.forEach((workspace) => {
        const deleteButton = document.getElementById(`delete-${workspace.id}`)
        if (deleteButton) {
            deleteButton.addEventListener("click", () => confirmDeleteWorkspace(workspace.id))
        }
    });
}

function handleAddWorkspace(e) {
    e.preventDefault();

    const formData = new FormData(this);
    console.log('Hello')
    fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': formData.get('csrfmiddlewaretoken')
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchWorkspaces()
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));

    closeModal("addWorkspaceModal");
    selectWorkspace()
    e.target.reset();
}

function confirmDeleteWorkspace(workspaceId) {
    workspaceToDelete = workspaceId; // Store ID
    openModal("deleteWorkspaceModal"); // Show confirmation modal
}

async function selectWorkspace(workspaceId) {
    currentWorkspace = workspaces.find((w) => w.id === workspaceId);
    currentWorkspaceTitle.textContent = currentWorkspace.name;
    workspaceTabs.classList.remove("hidden");
    console.log("select")
    try {
        const response = await fetch(`/api/workspace-${workspaceId}/get-boards/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log('Hello Board')
        const data = await response.json();
        if (data.success) {
            console.log(data);
        } else {
            console.error('Error fetching boards:', data.message);
        }
    } catch (error) {
        console.error('Error fetching boards:', error);
    }
    renderBoards();
}

function deleteWorkspace(workspaceId) {
    workspaces = workspaces.filter((workspace) => workspace.id !== workspaceId);

    if (currentWorkspace && currentWorkspace.id === workspaceId) {
        currentWorkspace = workspaces.length > 0 ? workspaces[0] : null;
        currentWorkspaceTitle.textContent = currentWorkspace ? currentWorkspace.name : "";
        renderBoards();
    }
    renderWorkspaces();
}

document.getElementById("confirmDeleteWorkspace").addEventListener("click", function () {
    if (workspaceToDelete !== null) {
        workspaces = workspaces.filter((workspace) => workspace.id !== workspaceToDelete);

        // Reset current workspace if the deleted one was selected
        if (currentWorkspace && currentWorkspace.id === workspaceToDelete) {
            currentWorkspace = workspaces.length > 0 ? workspaces[0] : null;
            currentWorkspaceTitle.textContent = currentWorkspace ? currentWorkspace.name : "";
            renderBoards();
        }

        renderWorkspaces();
        closeModal("deleteWorkspaceModal");
        workspaceToDelete = null;
    }
});

async function fetchWorkspaces() {
    try {
        const response = await fetch("/api/all-workspaces/", {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log('Hello')
        const data = await response.json();
        if (data.success) {
            workspaces = data.workspaces.map(workspace => ({
                id: workspace.id,
                name: workspace.workspace_name,
                boards: [],
            }));
            renderWorkspaces();
            console.log(workspaces[0].id);
            selectWorkspace(workspaces[0].id);
        } else {
            console.error('Error fetching workspaces:', data.message);
        }
    } catch (error) {
        console.error('Error fetching workspaces:', error);
    }
}

let currentBoard = null;
const boardsGrid = document.getElementById("boardsGrid");
const addBoardBtn = document.getElementById("addBoardBtn");
const addBoardModal = document.getElementById("addBoardModal");
const addBoardForm = document.getElementById("addBoardForm");
const currentWorkspaceTitle = document.getElementById("currentWorkspaceTitle");
addBoardForm.addEventListener("submit", handleAddBoard);
addBoardBtn.addEventListener("click", () => openModal("addBoardModal"))


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

async function renderBoards() {
    if (!currentWorkspace) {
        boardsGrid.innerHTML = "<p>Please select a workspace to view boards.</p>";
        return;
    }
    console.log("HII")
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
}

function switchTab(tabName) {
    console.log(tabName)
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("text-rose-600", "border-rose-600");
        if (btn.dataset.tab === tabName) {
            btn.classList.add("text-rose-600", "border-rose-600");
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


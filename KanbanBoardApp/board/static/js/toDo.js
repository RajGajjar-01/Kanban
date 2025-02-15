import { openModal, closeModal, getCookie } from "./utils.js";

export let workspaces = [];
let currentWorkspace = null;
let workspaceToDelete = null;

const workspaceList = document.getElementById("workspaceList");
const addWorkspaceBtn = document.getElementById("addWorkspaceBtn");
const cancelWorkspaceBtn = document.getElementById("cancelWorkspaceBtn");
const cancelDeleteWorkspaceBtn = document.getElementById("cancelDeleteWorkspaceBtn");
const addWorkspaceModal = document.getElementById("addWorkspaceModal");
const addWorkspaceForm = document.getElementById("addWorkspaceForm");
const confirmDeleteWorkspaceBtn = document.getElementById("confirmDeleteWorkspaceBtn");

const workspaceTabs = document.getElementById("workspaceTabs");

addWorkspaceBtn.addEventListener("click", () => openModal("addWorkspaceModal"));
cancelWorkspaceBtn.addEventListener("click", () => closeModal("addWorkspaceModal"));
addWorkspaceForm.addEventListener("submit", handleAddWorkspace);
cancelDeleteWorkspaceBtn.addEventListener("click", () => closeModal("deleteWorkspaceModal"))
confirmDeleteWorkspaceBtn.addEventListener("click", ()=>deleteWorkspace());

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16px" height="16px"><path d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"/></svg>`

export function renderWorkspaces() {
    console.log(workspaces);
    workspaceList.innerHTML = workspaces
        .map(
            (workspace) => `
            <div class="flex justify-center items-center px-4 py-3 hover:bg-gray-300 ${currentWorkspace? "bg-gray-100" : ""
                    }">
                <button class="flex-1 text-left" id="select-${workspace.id}">
                    ${workspace.name}
                </button>
                <button class="text-red-500 hover:text-red-200" id="delete-${workspace.id}">
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
                fetchWorkspaces();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));

    closeModal("addWorkspaceModal");
    e.target.reset();
}

function confirmDeleteWorkspace(workspaceId) {
    workspaceToDelete = workspaceId; 
    openModal("deleteWorkspaceModal"); 
}

export async function selectWorkspace(workspaceId) {
    currentWorkspace = workspaces.find((w) => w.id === workspaceId);
    currentWorkspaceTitle.textContent = currentWorkspace.name;
    workspaceTabs.classList.remove("hidden");   
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
        const data = await response.json();
        if (data.success) {
            console.log(currentWorkspace.id);
            currentWorkspace.boards = data.board;
            console.log(currentWorkspace.boards);
            renderBoards();
        } else {
            console.error('Error fetching boards:', data.message);
        }
    } catch (error) {
        console.error('Error fetching boards:', error);
    }
}

async function deleteWorkspace() {
    if (workspaceToDelete !== null) {
        workspaces = workspaces.filter((workspace) => workspace.id !== workspaceToDelete);

        try {
            const response = await fetch(`/api/workspace-${workspaceToDelete}/delete/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                console.log(data.message)
                if (currentWorkspace && currentWorkspace.id === workspaceToDelete) {
                    currentWorkspace = workspaces.length > 0 ? workspaces[0] : null;
                    currentWorkspaceTitle.textContent = currentWorkspace ? currentWorkspace.name : "";
                    fetchWorkspaces();
                }
                fetchWorkspaces();
                closeModal("deleteWorkspaceModal");
                workspaceToDelete = null;
                renderBoards();
            } else {
                console.error('Error fetching workspaces:', data.message);
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        }        
    }
}

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
        const data = await response.json();
        if (data.success) {
            workspaces = data.workspaces.map(workspace => ({
                id: workspace.id,
                name: workspace.workspace_name,
                boards: [],
            }));
            renderWorkspaces();
            
            selectWorkspace(workspaces[0].id);
        } else {
            console.error('Error fetching workspaces:', data.message);
        }
    } catch (error) {
        console.error('Error fetching workspaces:', error);
    }
}

export let currentBoard = null;

const boardsGrid = document.getElementById("boardsGrid");
const addBoardModal = document.getElementById("addBoardModal");
const addBoardForm = document.getElementById("addBoardForm");
const currentWorkspaceTitle = document.getElementById("currentWorkspaceTitle");
const cancelBoardModalButton = document.getElementById("cancelBoardModalBtn");
addBoardForm.addEventListener("submit", handleAddBoard);

async function handleAddBoard(e) {
    e.preventDefault();
    
    if (!currentWorkspace || !currentWorkspace.id) {
        alert("Please select a workspace first.");
        console.error("Workspace ID is missing");
        return;
    }

    const form = e.target; // Get the form element
    const formData = new FormData(form);
    try {
        const response = await fetch(`/api/workspace-${currentWorkspace.id}/create-board/`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            console.log("created");
            selectWorkspace(currentWorkspace.id);
            closeModal("addBoardModal");
            e.target.reset();
        } else {
            console.error('Error fetching workspaces:', data.message);
        }
    } catch (error) {
        console.error('Error occured');
    }
}

async function renderBoards() {
    console.log("rednering")
    if (!currentWorkspace) {
        boardsGrid.innerHTML = "<p>Please select a workspace to view boards.</p>";
        return;
    }
    console.log(currentWorkspace.boards.map((board)=>board.id));
    const boardsHTML = currentWorkspace.boards
        .map(
            (board) => `
            <button id="${board.id}"
                <div class="w-[16rem] h-[9rem] flex justify-center items-center bg-red-300 rounded-lg shadow-sm border-2 border-red-500 hover:shadow-lg transition-shadow cursor-pointer"
                    style="background-color: ${board.theme}">
                    <h3 class="font-semibold mb-2">${board.name}</h3>
                </div>
            </board>`
        )
        .join("");

    boardsGrid.innerHTML = boardsHTML;
    boardsGrid.innerHTML += `<button id="addBoardBtn1" >
                                <div class="w-[16rem] h-[9rem] rounded-lg flex items-center justify-center border-2 border-gray-400 border-dashed hover:border-solid hover:bg-gray-200 hover:shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 30 30" width="40px" height="40px" fill="#f74c66">    <path d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M21,16h-5v5 c0,0.553-0.448,1-1,1s-1-0.447-1-1v-5H9c-0.552,0-1-0.447-1-1s0.448-1,1-1h5V9c0-0.553,0.448-1,1-1s1,0.447,1,1v5h5 c0.552,0,1,0.447,1,1S21.552,16,21,16z"/></svg>
                                </div>
                            </button>`
    addBoardBtn1.addEventListener("click", () => openModal("addBoardModal"));
    cancelBoardModalButton.addEventListener("click", ()=> closeModal("addBoardModal")); 

    currentWorkspace.boards.forEach((board)=>{
        const boardbtn = document.getElementById(`${board.id}`);
        if (boardbtn) {
            boardbtn.addEventListener("click", ()=>{
                currentBoard = board;
                console.log(currentBoard);
                window.location.href = `/workspace/${currentWorkspace.id}/get-board/${board.id}`;
            });
        }
    })
}

function switchTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("text-rose-600", "border-rose-600");
        if (btn.dataset.tab === tabName) {
            btn.classList.add("text-rose-600", "border-rose-600");
        }
    });

    if (tabName === "boards") {
        boardsGrid.innerHTML = '';
        renderBoards();
    } else {
        boardsGrid.innerHTML = `<p>Content for ${tabName} tab</p>`;
    }
}

document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
});

fetchWorkspaces();


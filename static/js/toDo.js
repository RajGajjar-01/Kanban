import { openModal, closeModal, getCookie } from "./utils.js";

export let workspaces = [];
export let otherworkspaces = [];
export let currentWorkspace = null;
let workspaceToDelete = null;

const workspaceList = document.getElementById("workspaceList");
const workspaceListOthers = document.getElementById("workspaceListOthers");
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


export function renderWorkspaces(workspacesToRender, ListToAdd) {    
    if (workspacesToRender.length == 0 && workspacesToRender === workspaces) {
        ListToAdd.innerHTML = `<div class="px-8 py-3">I don't know what to write here. create a workspace.</div>`
        return
    } 
    ListToAdd.innerHTML = workspacesToRender
        .map(
            (workspace) => `
            <div class="flex justify-center items-center px-8 py-3 hover:bg-gray-300 }">
                <button class="flex-1 text-left" id="select-${workspace.id}">
                    ${workspace.name} <span class="text-gray-600">${workspace.created_by? `- ${workspace.created_by}`:""}</span>
                </button>
                ${!workspace.created_by? `
                    <button class="text-gray-400 hover:text-gray-800" id="delete-${workspace.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    `: 
                    ``}   
            </div>
        `
        )
        .join("");

    workspacesToRender.forEach((workspace) => {
        const selectButton = document.getElementById(`select-${workspace.id}`);
        if (selectButton) {
            if (!workspace.created_by) {
                selectButton.addEventListener("click", () => selectWorkspace(workspace.id));
            } else {
                selectButton.addEventListener("click", () => selectOtherWorkspace(workspace.id));
            }
        }
    });
   
    workspacesToRender.forEach((workspace) => {
        if (!workspace.created_by) {
            const deleteButton = document.getElementById(`delete-${workspace.id}`)
            if (deleteButton) {
                deleteButton.addEventListener("click", () => confirmDeleteWorkspace(workspace.id));
            } 
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
            currentWorkspace.boards = data.board;
            renderBoards();
            switchTab("boards");
        } else {
            console.error('Error fetching boards:', data.message);
        }
    } catch (error) {
        console.error('Error fetching boards:', error);
    }
}

export async function selectOtherWorkspace(workspaceId) {
    currentWorkspace = otherworkspaces.find((w) => w.id === workspaceId);
    currentWorkspaceTitle.textContent = currentWorkspace.name;
    workspaceTabs.classList.remove("hidden");   
    try {
        const response = await fetch(`/api/workspace-${workspaceId}/get-particular-boards/`, {
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
            currentWorkspace.boards = data.board;
            renderBoards();
            switchTab("boards");
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
            renderWorkspaces(workspaces, workspaceList); 
        } else {
            console.error('Error fetching workspaces:', data.message);
        }
    } catch (error) {
        console.error('Error fetching workspaces:', error);
    }
}

async function fetchOtherWorkspaces() {
    try {
        const response = await fetch("/api/get-all-other-workspaces/", {
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
            otherworkspaces = data.workspaces.map(workspace => ({
                id: workspace.id,
                name: workspace.workspace_name, 
                boards: [],
                created_by: workspace.created_by__username,
            }));
            renderWorkspaces(otherworkspaces, workspaceListOthers); 
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
    const form = e.target; 
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
            selectWorkspace(currentWorkspace.id);
            closeModal("addBoardModal");
        } else {
            console.error('Error fetching workspaces:', data.message);
        }
    } catch (error) {
        console.error('Error occured');
    }
    e.target.reset();
}

async function renderBoards() {
    if (!currentWorkspace) {
        boardsGrid.innerHTML = "<p>Please select a workspace to view boards.</p>";
        return;
    }
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
    if(!currentWorkspace.created_by) {
        boardsGrid.innerHTML += `<button id="addBoardBtn1" >
                                    <div class="w-[16rem] h-[9rem] rounded-lg flex items-center justify-center border-2 border-gray-400 border-dashed hover:border-solid hover:bg-gray-200 hover:shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 30 30" width="40px" height="40px" fill="#f74c66">    <path d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M21,16h-5v5 c0,0.553-0.448,1-1,1s-1-0.447-1-1v-5H9c-0.552,0-1-0.447-1-1s0.448-1,1-1h5V9c0-0.553,0.448-1,1-1s1,0.447,1,1v5h5 c0.552,0,1,0.447,1,1S21.552,16,21,16z"/></svg>
                                    </div>
                                </button>`
        addBoardBtn1.addEventListener("click", () => openModal("addBoardModal"));
        cancelBoardModalButton.addEventListener("click", ()=> closeModal("addBoardModal")); 
    }

    currentWorkspace.boards.forEach((board)=>{
        const boardbtn = document.getElementById(`${board.id}`);
        if (boardbtn) {
            boardbtn.addEventListener("click", ()=>{
                currentBoard = board;
                window.location.href = `/workspace/${currentWorkspace.id}/get-board/${board.id}`;
            });
        }
    })
}

export async function fetchMembersList() {
    try {
        const response = await fetch(`/api/workspace-${currentWorkspace.id}/get-members/`, {
            request: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            showMembers(data.members);
        } else {
            console.error('Error:', data.message);
        }
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

function showMembers(memberList) {
    boardsGrid.classList = 'm-4 py-4';
    if (memberList.length == 0) {
        boardsGrid.innerHTML = `<p>Create a board first</p>`;
        return;
    }
    const membersByBoard = memberList.map((board) => {
        return `<div class="border-2 border-gray-300 rounded-md m-4 bg-gray-100 flex items-center min-h-[6rem] hover:shadow-md transition-all duration-300 ease-in-out">
                    <div class="w-[40%] mx-4 text-[1.2rem] font-medium">${board[0].board__name}</div>
                    <div>${board.map((mems) => {
                        return `
                            <div class="flex gap-16 items-center my-2">
                                <div>
                                    <img src="${mems.user__profile__image}" class="rounded-full w-8 h-8"></div>
                                <div>${mems.user__username}</div>
                                <div>${mems.user__email}</div>
                            </div>
                        `
                    }).join("")}</div>
                </div>
        ` 
    })
    .join('');
    boardsGrid.innerHTML += membersByBoard;
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
        boardsGrid.classList = 'inline-flex gap-4 flex-wrap mt-4';
        renderBoards();
    } else if (tabName === "members") {
        boardsGrid.innerHTML = '';
        fetchMembersList();
    } else {
        boardsGrid.innerHTML = 'hello ';
    }
}

document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
});

fetchOtherWorkspaces();
fetchWorkspaces();


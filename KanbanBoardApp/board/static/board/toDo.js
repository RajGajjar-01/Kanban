// Data structure to store workspaces, boards, and tasks
let workspaces = [];
let currentWorkspace = null;
let currentBoard = null;
console.log('Hii')

// DOM Elements
const workspaceList = document.getElementById("workspaceList");
const boardsGrid = document.getElementById("boardsGrid");
const currentWorkspaceTitle = document.getElementById("currentWorkspaceTitle");
const workspaceTabs = document.getElementById("workspaceTabs");

// Modal Elements
const addWorkspaceBtn = document.getElementById("addWorkspaceBtn");
const addBoardBtn = document.getElementById("addBoardBtn");
const addWorkspaceModal = document.getElementById("addWorkspaceModal");
const addBoardModal = document.getElementById("addBoardModal");
const addTaskModal = document.getElementById("addTaskModal");

// Form Elements
const addWorkspaceForm = document.getElementById("addWorkspaceForm");
const addBoardForm = document.getElementById("addBoardForm");
const addTaskForm = document.getElementById("addTaskForm");

// Event Listeners
addWorkspaceBtn.addEventListener("click", () => openModal("addWorkspaceModal"));
addBoardBtn.addEventListener("click", () => openModal("addBoardModal"));

addWorkspaceForm.addEventListener("submit", handleAddWorkspace);
addBoardForm.addEventListener("submit", handleAddBoard);
addTaskForm.addEventListener("submit", handleAddTask);

// Tab functionality
document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
});

// Utility Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.remove("hidden");
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add("hidden");
}

function switchTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active", "border-blue-500", "text-blue-600");
        if (btn.dataset.tab === tabName) {
            btn.classList.add("active", "border-blue-500", "text-blue-600");
        }
    });
    // Handle tab content switching here
    if (tabName === "boards") {
        renderBoards();
    } else {
        // Implement other tab content
        boardsGrid.innerHTML = '<p>Content for ${tabName} tab</p>';
    }
}

// Workspace Functions
function handleAddWorkspace(e) {
    e.preventDefault();
    const workspaceName = e.target.querySelector("input").value;

    const workspace = {
        id: Date.now(),
        name: workspaceName,
        boards: [],
    };

    workspaces.push(workspace);
    renderWorkspaces();
    closeModal("addWorkspaceModal");
    e.target.reset();
}

function renderWorkspaces() {
    workspaceList.innerHTML = workspaces
        .map(
            (workspace) => `
        <button 
            class="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 ${currentWorkspace?.id === workspace.id ? "bg-gray-100" : ""
                }"
            onclick="selectWorkspace(${workspace.id})"
        >
            ${workspace.name}
        </button>
    `
        )
        .join("");
}

function selectWorkspace(workspaceId) {
    currentWorkspace = workspaces.find((w) => w.id === workspaceId);
    currentWorkspaceTitle.textContent = currentWorkspace.name;
    workspaceTabs.classList.remove("hidden");
    renderBoards();
}

// Board Functions
function handleAddBoard(e) {
    e.preventDefault();

    // Ensure a workspace is selected
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
        tasks: [],
    };

    // Debugging: Check if boards array is updated
    console.log("Before adding board:", currentWorkspace.boards);

    currentWorkspace.boards.push(board);

    console.log("After adding board:", currentWorkspace.boards);

    renderBoards();
    closeModal("addBoardModal");
    e.target.reset();
}

function renderBoards() {
    if (!currentWorkspace) {
        boardsGrid.innerHTML = "<p>Please select a workspace to view boards.</p>";
        return;
    }

    console.log("Rendering boards for:", currentWorkspace.name);

    const boardsHTML = currentWorkspace.boards
        .map(
            (board) => `
        <div class="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
             onclick="selectBoard(${board.id})"
             style="border-top: 4px solid ${board.theme}">
            <h3 class="font-semibold mb-2">${board.title}</h3>
            <p class="text-sm text-gray-600">${board.description}</p>
        </div>
    `
        )
        .join("");
    boardsGrid.innerHTML = boardsHTML + addBoardBtn.outerHTML;
    boardsGrid.innerHTML =
        boardsHTML +
        `
    <button id="addBoardBtn" class="h-48 border-2 border-dashed rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            onclick="openModal('addBoardModal')">
        <div class="text-center">
            <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span class="text-gray-500">Add Board</span>
        </div>
    </button>
`;
}

function selectBoard(boardId) {
    currentBoard = currentWorkspace.boards.find((b) => b.id === boardId);
    renderTasks();
}

// Task Functions
function handleAddTask(e) {
    e.preventDefault();
    if (!currentBoard) return;

    const taskTitle = e.target.querySelector("input").value;
    const task = {
        id: Date.now(),
        title: taskTitle,
        subtasks: [],
    };

    currentBoard.tasks.push(task);
    renderTasks();
    closeModal("addTaskModal");
    e.target.reset();
}

function renderTasks() {
    const tasksContainer = document.createElement("div");
    tasksContainer.className =
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";

    const tasksHTML = currentBoard.tasks
        .map(
            (task) => `
        <div class="bg-white p-4 rounded-lg shadow-sm border">
            <h4 class="font-medium">${task.title}</h4>
            <div class="mt-2 space-y-1">
                ${task.subtasks
                    .map(
                        (subtask) => `
                    <div class="text-sm text-gray-600">${subtask.title}</div>
                `
                    )
                    .join("")}
            </div>
            <button class="mt-2 text-sm text-blue-500 hover:text-blue-600"
                    onclick="openAddSubtaskModal(${task.id})">
                + Add Subtask
            </button>
        </div>
    `
        )
        .join("");

    tasksContainer.innerHTML =
        tasksHTML +
        `
        <button id="addTaskBtn" class="h-48 border-2 border-dashed rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                onclick="openModal('addTaskModal')">
            <div class="text-center">
                <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span class="text-gray-500">Add New Task</span>
            </div>
        </button>
    `;

    boardsGrid.innerHTML = "";
    boardsGrid.appendChild(tasksContainer);
}

// Subtask Functions
function openAddSubtaskModal(taskId) {
    // Implement subtask modal and functionality
    console.log("Open subtask modal for task:", taskId);
}

// Initialize the app
renderWorkspaces();
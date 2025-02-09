// Data structure to store workspaces, boards, and tasks
let workspaces = [];
let currentWorkspace = null;
let currentBoard = null;

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
    workspaceToDelete = null; // Reset variable
  }
});


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

let workspaceToDelete = null; // Store workspace ID before confirming deletion

function confirmDeleteWorkspace(workspaceId) {
  workspaceToDelete = workspaceId; // Store ID
  openModal("deleteWorkspaceModal"); // Show confirmation modal
}


function renderWorkspaces() {
  workspaceList.innerHTML = workspaces
    .map(
      (workspace) => `
        <div class="flex justify-between items-center w-full px-4 py-2 rounded-lg hover:bg-gray-200 ${currentWorkspace?.id === workspace.id ? "bg-gray-200" : ""
        }">
            <button class="flex-1 text-left" onclick="selectWorkspace(${workspace.id})">
                ${workspace.name}
            </button>
            <button class="text-red-500 hover:text-red-700" onclick="confirmDeleteWorkspace(${workspace.id})">
                ✖
            </button>
        </div>
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

function deleteWorkspace(workspaceId) {
  workspaces = workspaces.filter((workspace) => workspace.id !== workspaceId);

  // If the deleted workspace was the selected one, reset or select another
  if (currentWorkspace && currentWorkspace.id === workspaceId) {
    currentWorkspace = workspaces.length > 0 ? workspaces[0] : null;
    currentWorkspaceTitle.textContent = currentWorkspace ? currentWorkspace.name : "";
    renderBoards();
  }

  renderWorkspaces();
}

// Board Functions
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
    tasks: [],
  };

  currentWorkspace.boards.push(board);
  renderBoards();
  closeModal("addBoardModal");
  e.target.reset();
}



function renderBoards() {
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
        </div>
    `
    )
    .join("");

  boardsGrid.innerHTML =
    boardsHTML +
    ` <button id="addBoardBtn" class="h-48 rounded-lg flex items-center justify-center border-2 border-black"
        onclick="openModal('addBoardModal')">
        <div class="text-center hover:bg-blue-300 transition-all">
            <svg class="w-8 h-8 mx-auto mb-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-line join="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span class="text-black font-medium">Add Board</span>
        </div>
    </button>`;
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
  tasksContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";

  const tasksHTML = currentBoard.tasks
    .map(
      (task) => `
        <div class="bg-white p-4 rounded-lg shadow-sm border">
            <h4 class="font-medium">${task.title}</h4>
            <div class="mt-2 space-y-1">
                ${task.subtasks.map((subtask) => `<div class="text-sm text-gray-600">${subtask.title}</div>`).join("")}
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
    `<button id="addTaskBtn" class="h-48 border-2 border-dashed rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            onclick="openModal('addTaskModal')">
        <div class="text-center">
            <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span class="text-gray-500">Add New Task</span>
        </div>
    </button>`;

  boardsGrid.innerHTML = "";
  boardsGrid.appendChild(tasksContainer);
}

// Initialize
renderWorkspaces();
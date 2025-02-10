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
const cancelWorkspaceBtn = document.getElementById("cancelWorkspaceBtn")
const addWorkspaceModal = document.getElementById("addWorkspaceModal");

const addBoardBtn = document.getElementById("addBoardBtn");
const addBoardModal = document.getElementById("addBoardModal");

const addTaskModal = document.getElementById("addTaskModal");

// Form Elements
const addWorkspaceForm = document.getElementById("addWorkspaceForm");
const addBoardForm = document.getElementById("addBoardForm");
const addTaskForm = document.getElementById("addTaskForm");

// Event Listeners
addWorkspaceBtn.addEventListener("click", () => openModal("addWorkspaceModal"));
cancelWorkspaceBtn.addEventListener("click", () => closeModal("addWorkspaceModal"));

addBoardBtn.addEventListener("click", () => openModal("addBoardModal"));

addWorkspaceForm.addEventListener("submit", handleAddWorkspace);
addBoardForm.addEventListener("submit", handleAddBoard);
addTaskForm.addEventListener("submit", handleAddTask);
import { openModal, closeModal, getCookie } from "./utils.js";

const listArray = [];
let listCounter = 0;
let taskCounter = 0;
let selectedList = null;
let selectedTask = null;
let draggedTask = null;
let dragOverTask = null;

const boardId = document.getElementById("board-id").textContent;
const addListForm = document.getElementById("addListForm");

// List modal related
const listModal = document.getElementById("list-modal");
const closeListModalBtn = document.getElementById("close-list-modal");
closeListModalBtn.addEventListener("click", () => closeModal("list-modal"));
addListForm.addEventListener('submit', createListo);

async function fetchLists() {
    try {
        const response = await fetch(`/api/board-${boardId}/get-lists/`, {
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
            addDefaultLists(data.boardlists.sort((a,b)=>a.list_position - b.list_position));
            console.log(listArray.length);
        } else {
            console.error('Error fetching workspaces:', data.message);
        }
    } catch (error) {
        console.error('Error fetching workspaces:', error);
    }
}

async function createListo(e) {
    e.preventDefault();
    const formData = new FormData(this);
    formData.append('board', boardId);
    formData.append('position', listArray.length + 1);

    console.log(formData);
    try {        
        const response = await fetch('/api/board/create-list/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        });
    
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            console.log('hello');
            fetchLists();
            closeListModalBtn.click();
        } else {
            console.error('Error fetching lists:', data.message);
        }
    } catch (error) {
        console.error('Error fetching workspaces:', error);
    }    
}

function createList(listName) {
    listCounter++;
    const list = document.createElement("div");
    list.className = "bg-white p-4 rounded shadow w-72 h-fit";
    list.setAttribute("draggable", "true");
    list.id = `list-${listCounter}`;
    list.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold cursor-pointer">${listName}</h3>
            <div>
                <button class="rename-list text-blue-500 hover:text-blue-700 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-list text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="tasks space-y-2"></div>
        <button class="add-task bg-black text-white px-2 py-1 rounded text-sm hover:bg-gray-800 mt-2">Add Task</button>
    `;

    list.addEventListener("dragstart", dragStart);
    list.addEventListener("dragover", dragOver);
    list.addEventListener("drop", drop);

    list.querySelector(".add-task").addEventListener("click", () => {
        selectedList = list;
        document.getElementById("task-modal").classList.remove("hidden");
    });

    list.querySelector(".rename-list").addEventListener("click", () => {
        selectedList = list;
        const listName = list.querySelector("h3").innerText;
        document.getElementById("edit-list-name").value = listName;
        document.getElementById("edit-list-modal").classList.remove("hidden");
    });

    list.querySelector(".delete-list").addEventListener("click", () => {
        selectedList = list;
        document.getElementById("delete-list-modal").classList.remove("hidden");
    });

    return list;
}

function addTask(list, taskName) {
    taskCounter++;
    const taskContainer = list.querySelector(".tasks");
    const task = document.createElement("div");
    task.className = "bg-gray-100 p-2 rounded cursor-move group relative";
    task.setAttribute("draggable", "true");
    task.id = `task-${taskCounter}`;
    task.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="task-text">${taskName}</span>
            <button class="edit-task text-blue-500 hover:text-blue-700 hidden group-hover:block absolute right-2">
                <i class="fas fa-edit"></i>
            </button>
        </div>
    `;

    // Drag events
    task.addEventListener("dragstart", (e) => {
        e.stopPropagation();
        draggedTask = task;
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.setData("application/task", "true");
        setTimeout(() => task.classList.add("opacity-50"), 0);
    });

    task.addEventListener("dragend", () => {
        task.classList.remove("opacity-50");
        draggedTask = null;
        dragOverTask = null;
        document.querySelectorAll(".task-drop-preview").forEach(el => el.remove());
    });

    task.addEventListener("dragover", handleTaskDragOver);
    task.addEventListener("dragleave", handleTaskDragLeave);

    const editBtn = task.querySelector(".edit-task");
    editBtn.addEventListener("click", () => {
        selectedTask = task;
        const taskName = task.querySelector(".task-text").innerText;
        document.getElementById("edit-task-name").value = taskName;
        document.getElementById("edit-task-modal").classList.remove("hidden");
    });

    taskContainer.appendChild(task);
}

// Modal Event Listeners
document.getElementById("update-list").addEventListener("click", () => {
    const newName = document.getElementById("edit-list-name").value.trim();
    if (newName && selectedList) {
        selectedList.querySelector("h3").innerText = newName;
        document.getElementById("edit-list-modal").classList.add("hidden");
    }
});

document.getElementById("close-edit-list-modal").addEventListener("click", () => {
    document.getElementById("edit-list-modal").classList.add("hidden");
});

document.getElementById("confirm-delete-list").addEventListener("click", () => {
    if (selectedList) {
        selectedList.remove();
        document.getElementById("delete-list-modal").classList.add("hidden");
    }
});

document.getElementById("close-delete-list-modal").addEventListener("click", () => {
    document.getElementById("delete-list-modal").classList.add("hidden");
});

document.getElementById("update-task").addEventListener("click", () => {
    const newName = document.getElementById("edit-task-name").value.trim();
    if (newName && selectedTask) {
        selectedTask.querySelector(".task-text").innerText = newName;
        document.getElementById("edit-task-modal").classList.add("hidden");
    }
});

document.getElementById("close-edit-task-modal").addEventListener("click", () => {
    document.getElementById("edit-task-modal").classList.add("hidden");
});

document.addEventListener("DOMContentLoaded", () => {
    initializeSidebar();
    initializeBackgroundPicker();
    initializeBoardTitle();
    fetchLists();
});

function addDefaultLists(lists) {
    const defaultLists = lists;
    const listContainer = document.getElementById("list-container");
    listContainer.innerHTML = "";
    defaultLists.forEach(listName => {
        const list = createList(listName.list_name);
        listContainer.appendChild(list);
    });
    listContainer.appendChild(createAddListCard());
    listArray.push(...lists);
    console.log(listArray);
}

function createAddListCard() {
    const addListDiv = document.createElement("div");
    addListDiv.className = "bg-white/50 p-4 rounded w-72 h-fit flex items-center justify-center cursor-pointer hover:bg-white/60";
    addListDiv.innerHTML = `
        <div class="text-gray-600 text-center">
            <i class="fas fa-plus mb-2 text-2xl"></i>
            <div>Add List</div>
        </div>
    `;
    addListDiv.addEventListener("click", () => {
        document.getElementById("list-modal").classList.remove("hidden");
    });
    return addListDiv;
}

// Sidebar functions
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("main-content");
const sidebarnav = document.getElementById("sidebar-nav");
let isSidebarOpen = true;
const wsp = document.getElementById("wsp");
const toggleicon = document.getElementById("toggle-icon");

function initializeSidebar() {
    wsp.addEventListener("click", () => {
        if (isSidebarOpen) {
            closeSidebar();
            toggleicon.classList.add("hidden");
        } else {
            openSidebar();
            toggleicon.classList.remove("hidden");
        }
        isSidebarOpen = !isSidebarOpen;
    });
}

function closeSidebar() {
    sidebar.classList.remove("w-[20rem]");
    sidebar.classList.add("w-[2rem]", "hover:bg-gray-200");
    sidebarnav.classList.add("hidden");
    wsp.classList.add("transform", "rotate-[-90deg]", "translate-y-[280%]", "origin-center");
}

function openSidebar() {
    sidebar.classList.remove("w-[2rem]", "hover:bg-gray-200");
    sidebar.classList.add("w-[20rem]");
    sidebarnav.classList.remove("hidden");
    wsp.classList.remove("transform", "rotate-[-90deg]", "translate-y-[280%]", "origin-center");
}


document.getElementById("close-task-modal").addEventListener("click", () => {
    document.getElementById("task-modal").classList.add("hidden");
});

document.getElementById("save-task").addEventListener("click", () => {
    const taskName = document.getElementById("task-name").value.trim();
    if (taskName && selectedList) {
        addTask(selectedList, taskName);
        document.getElementById("task-name").value = "";
        document.getElementById("task-modal").classList.add("hidden");
    }
});

// Drag and Drop
function handleTaskDragOver(e) {
    e.preventDefault();
    e.stopPropagation();

    const targetTask = e.currentTarget;
    if (targetTask === draggedTask) return;

    dragOverTask = targetTask;

    document.querySelectorAll(".task-drop-preview").forEach(el => el.remove());

    const rect = targetTask.getBoundingClientRect();
    const midPoint = rect.top + rect.height / 2;

    const preview = document.createElement("div");
    preview.className = "task-drop-preview h-1 bg-blue-500 my-1 rounded";

    if (e.clientY < midPoint) {
        targetTask.parentNode.insertBefore(preview, targetTask);
    } else {
        targetTask.parentNode.insertBefore(preview, targetTask.nextSibling);
    }
}

function handleTaskDragLeave(e) {
    if (e.relatedTarget && !e.relatedTarget.closest(".tasks")) {
        document.querySelectorAll(".task-drop-preview").forEach(el => el.remove());
        dragOverTask = null;
    }
}

function dragStart(e) {
    if (!e.target.classList.contains("bg-gray-100")) {
        e.dataTransfer.setData("text/plain", e.target.id);
        e.dataTransfer.setData("application/list", "false"); // Changed for lists
    }
}

function dragOver(e) {
    e.preventDefault();
    if (draggedTask) {
        const listElement = e.currentTarget;
        const tasksContainer = listElement.querySelector(".tasks");

        if (!tasksContainer.contains(e.target)) {
            document.querySelectorAll(".task-drop-preview").forEach(el => el.remove());
            const preview = document.createElement("div");
            preview.className = "task-drop-preview h-1 bg-blue-500 my-1 rounded";
            tasksContainer.appendChild(preview);
        }
    }
}

function drop(e) {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    const isTask = e.dataTransfer.getData("application/task") === "true";
    const isList = e.dataTransfer.getData("application/list") === "true"; // Added list check
    const draggedElement = document.getElementById(draggedId);

    if (!draggedElement) return;

    document.querySelectorAll(".task-drop-preview").forEach(el => el.remove());

    if (isTask) {
        const targetList = e.currentTarget;
        const tasksContainer = targetList.querySelector(".tasks");

        if (dragOverTask && dragOverTask.parentNode === tasksContainer) {
            const rect = dragOverTask.getBoundingClientRect();
            const midPoint = rect.top + rect.height / 2;

            if (e.clientY < midPoint) {
                tasksContainer.insertBefore(draggedElement, dragOverTask);
            } else {
                tasksContainer.insertBefore(draggedElement, dragOverTask.nextSibling);
            }
        } else {
            tasksContainer.appendChild(draggedElement);
        }
    } else if (isList) { // Handle list swapping
        const dropZone = e.currentTarget;
        if (dropZone && dropZone !== draggedElement) {
            const tempHtml = dropZone.innerHTML;
            const tempId = dropZone.id;

            dropZone.innerHTML = draggedElement.innerHTML;
            dropZone.id = draggedElement.id;

            draggedElement.innerHTML = tempHtml;
            draggedElement.id = tempId;

            reassignEventListeners(dropZone);
            reassignEventListeners(draggedElement);
        }
    }

    draggedTask = null;
    dragOverTask = null;
}

// Background Picker (unchanged)
function initializeBackgroundPicker() {
    const backgroundModal = document.getElementById("background-modal");
    const openBackgroundModalBtn = document.getElementById("open-background-modal");
    const closeBackgroundModalBtn = document.getElementById("close-background-modal");
    const mainBody = document.getElementById("main-body");

    openBackgroundModalBtn.addEventListener("click", () => {
        backgroundModal.classList.remove("hidden");
    });

    closeBackgroundModalBtn.addEventListener("click", () => {
        backgroundModal.classList.add("hidden");
    });

    const colorOptions = backgroundModal.querySelectorAll("[data-color]");
    colorOptions.forEach(option => {
        option.addEventListener("click", () => {
            const classesToRemove = mainBody.className.split(" ").filter(className =>
                className.startsWith("bg-") ||
                className.startsWith("from-") ||
                className.startsWith("to-") ||
                className.startsWith("via-")
            );
            mainBody.classList.remove(...classesToRemove);
            const newClasses = option.dataset.color.split(" ");
            mainBody.classList.add(...newClasses);
            backgroundModal.classList.add("hidden");
        });
    });
}

// Board Title (commented out as before)
function initializeBoardTitle() {
    // Existing commented code
    // const boardTitle = document.getElementById('board-title');
    // const editBoardTitleBtn = document.getElementById('edit-board-title');
    // const boardTitleModal = document.getElementById('board-title-modal');
    // const boardTitleInput = document.getElementById('board-title-input');
    // const saveBoardTitleBtn = document.getElementById('save-board-title');
    // const closeBoardTitleModalBtn = document.getElementById('close-board-title-modal');

    // editBoardTitleBtn.addEventListener('click', () => {
    //     boardTitleInput.value = boardTitle.textContent;
    //     boardTitleModal.classList.remove('hidden');
    // });

    // closeBoardTitleModalBtn.addEventListener('click', () => {
    //     boardTitleModal.classList.add('hidden');
    // });

    // saveBoardTitleBtn.addEventListener('click', () => {
    //     const newTitle = boardTitleInput.value.trim();
    //     if (newTitle) {
    //         boardTitle.textContent = newTitle;
    //         boardTitleModal.classList.add('hidden');
    //     }
    // });
}
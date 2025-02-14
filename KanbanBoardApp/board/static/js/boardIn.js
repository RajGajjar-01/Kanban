let taskCounter = 0;
let subtaskCounter = 0;
let selectedTask = null;
let selectedSubtask = null;
let draggedSubtask = null;
let dragOverSubtask = null;

function createTask(taskName) {
    taskCounter++;
    const task = document.createElement("div");
    task.className = "bg-white p-4 rounded shadow w-72 h-fit";
    task.setAttribute("draggable", "true");
    task.id = `task-${taskCounter}`;
    task.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold cursor-pointer">${taskName}</h3>
            <div>
                <button class="rename-task text-blue-500 hover:text-blue-700 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-task text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="subtasks space-y-2"></div>
        <button class="add-subtask bg-black text-white px-2 py-1 rounded text-sm hover:bg-gray-800 mt-2">Add Subtask</button>
    `;

    task.addEventListener("dragstart", dragStart);
    task.addEventListener("dragover", dragOver);
    task.addEventListener("drop", drop);

    task.querySelector(".add-subtask").addEventListener("click", () => {
        selectedTask = task;
        document.getElementById("subtask-modal").classList.remove("hidden");
    });

    task.querySelector(".rename-task").addEventListener("click", () => {
        selectedTask = task;
        const taskName = task.querySelector("h3").innerText;
        document.getElementById("edit-task-name").value = taskName;
        document.getElementById("edit-task-modal").classList.remove("hidden");
    });

    task.querySelector(".delete-task").addEventListener("click", () => {
        selectedTask = task;
        document.getElementById("delete-task-modal").classList.remove("hidden");
    });

    return task;
}

function addSubtask(task, subtaskName) {
    subtaskCounter++;
    const subtaskContainer = task.querySelector(".subtasks");
    const subtask = document.createElement("div");
    subtask.className = "bg-gray-100 p-2 rounded cursor-move group relative";
    subtask.setAttribute("draggable", "true");
    subtask.id = `subtask-${subtaskCounter}`;
    subtask.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="subtask-text">${subtaskName}</span>
            <button class="edit-subtask text-blue-500 hover:text-blue-700 hidden group-hover:block absolute right-2">
                <i class="fas fa-edit"></i>
            </button>
        </div>
    `;

    // Add drag events
    subtask.addEventListener("dragstart", (e) => {
        e.stopPropagation();
        draggedSubtask = subtask;
        e.dataTransfer.setData("text/plain", subtask.id);
        e.dataTransfer.setData("application/subtask", "true");
        setTimeout(() => subtask.classList.add("opacity-50"), 0);
    });

    subtask.addEventListener("dragend", () => {
        subtask.classList.remove("opacity-50");
        draggedSubtask = null;
        dragOverSubtask = null;
        document.querySelectorAll(".subtask-drop-preview").forEach(el => el.remove());
    });

    subtask.addEventListener("dragover", handleSubtaskDragOver);
    subtask.addEventListener("dragleave", handleSubtaskDragLeave);

    const editBtn = subtask.querySelector(".edit-subtask");
    editBtn.addEventListener("click", () => {
        selectedSubtask = subtask;
        const subtaskName = subtask.querySelector(".subtask-text").innerText;
        document.getElementById("edit-subtask-name").value = subtaskName;
        document.getElementById("edit-subtask-modal").classList.remove("hidden");
    });

    subtaskContainer.appendChild(subtask);
}

// Modal Event Listeners
document.getElementById("update-task").addEventListener("click", () => {
    const newName = document.getElementById("edit-task-name").value.trim();
    if (newName && selectedTask) {
        selectedTask.querySelector("h3").innerText = newName;
        document.getElementById("edit-task-modal").classList.add("hidden");
    }
});

document.getElementById("close-edit-task-modal").addEventListener("click", () => {
    document.getElementById("edit-task-modal").classList.add("hidden");
});

document.getElementById("confirm-delete-task").addEventListener("click", () => {
    if (selectedTask) {
        selectedTask.remove();
        document.getElementById("delete-task-modal").classList.add("hidden");
    }
});

document.getElementById("close-delete-task-modal").addEventListener("click", () => {
    document.getElementById("delete-task-modal").classList.add("hidden");
});

document.getElementById("update-subtask").addEventListener("click", () => {
    const newName = document.getElementById("edit-subtask-name").value.trim();
    if (newName && selectedSubtask) {
        selectedSubtask.querySelector(".subtask-text").innerText = newName;
        document.getElementById("edit-subtask-modal").classList.add("hidden");
    }
});

document.getElementById("close-edit-subtask-modal").addEventListener("click", () => {
    document.getElementById("edit-subtask-modal").classList.add("hidden");
});

// Initialize default tasks
document.addEventListener("DOMContentLoaded", () => {
    addDefaultTasks();
    initializeSidebar();
    initializeBackgroundPicker();
    initializeBoardTitle();
});

function addDefaultTasks() {
    const defaultTasks = ["To Do", "Doing", "Completed"];
    const taskContainer = document.getElementById("task-container");
    defaultTasks.forEach(taskName => {
        const task = createTask(taskName);
        taskContainer.appendChild(task);
    });
    taskContainer.appendChild(createAddTaskCard());
}

function createAddTaskCard() {
    const addTaskDiv = document.createElement("div");
    addTaskDiv.className = "bg-white/50 p-4 rounded w-72 h-42 flex items-center"
    addTaskDiv.className = "bg-white/50 p-4 rounded w-72 h-42 flex items-center justify-center cursor-pointer hover:bg-white/60";
    addTaskDiv.innerHTML = `
        <div class="text-gray-600 text-center">
            <i class="fas fa-plus mb-2 text-2xl"></i>
            <div>Add Task</div>
        </div>
    `;
    addTaskDiv.addEventListener("click", () => {
        document.getElementById("task-modal").classList.remove("hidden");
    });
    return addTaskDiv;
}

const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("main-content");
const sidebarnav = document.getElementById("sidebar-nav");
let isSidebarOpen = true;
const wsp = document.getElementById("wsp");

function initializeSidebar() {
    
    sidebar.addEventListener("click", () => {
        if (isSidebarOpen) {
            closeSidebar();
        } else {
            console.log("Hii");
            openSidebar();
        }
    });  
}

function closeSidebar() {
    sidebar.classList.remove("w-[20rem]");
    sidebar.classList.add("w-[2rem]", "hover:bg-gray-200");
    sidebarnav.classList.add("hidden");
    isSidebarOpen = false;
    wsp.classList.add("transform","translate-y-[3rem]","-translate-x-12","rotate-[-90deg]","origin-left-top");
}

function openSidebar() {

    mainContent.style.marginLeft = 0;
    sidebar.classList.remove("w-[2rem]", "hover:bg-gray-200")
    sidebar.classList.add("w-[20rem]")
    sidebarnav.classList.remove("hidden");
    wsp.classList.remove("transform","translate-y-[3rem]","-translate-x-12","rotate-[-90deg]","origin-left-top");
    isSidebarOpen = true;
}

document.getElementById("close-task-modal").addEventListener("click", () => {
    document.getElementById("task-modal").classList.add("hidden");
});

document.getElementById("save-task").addEventListener("click", () => {
    const taskName = document.getElementById("task-name").value.trim();
    if (taskName) {
        const taskContainer = document.getElementById("task-container");
        const addTaskCard = taskContainer.lastElementChild;
        const task = createTask(taskName);
        taskContainer.insertBefore(task, addTaskCard);
        document.getElementById("task-name").value = "";
        document.getElementById("task-modal").classList.add("hidden");
    }
});

// Subtask Modal Event Listeners
document.getElementById("close-subtask-modal").addEventListener("click", () => {
    document.getElementById("subtask-modal").classList.add("hidden");
});

document.getElementById("save-subtask").addEventListener("click", () => {
    const subtaskName = document.getElementById("subtask-name").value.trim();
    if (subtaskName && selectedTask) {
        addSubtask(selectedTask, subtaskName);
        document.getElementById("subtask-name").value = "";
        document.getElementById("subtask-modal").classList.add("hidden");
    }
});

// Invite Member Modal Event Listeners
document.getElementById("open-invite-modal").addEventListener("click", () => {
    document.getElementById("invite-member-modal").classList.remove("hidden");
});

document.getElementById("close-invite-modal").addEventListener("click", () => {
    document.getElementById("invite-member-modal").classList.add("hidden");
});

document.getElementById("send-invite").addEventListener("click", () => {
    const email = document.getElementById("invite-email").value.trim();
    if (email) {
        alert(`Invitation sent to ${email}`);
        document.getElementById("invite-email").value = "";
        document.getElementById("invite-member-modal").classList.add("hidden");
    } else {
        alert("Please enter a valid email ID.");
    }
});

// Drag and Drop Helper Functions
function handleSubtaskDragOver(e) {
    e.preventDefault();
    e.stopPropagation();

    const targetSubtask = e.currentTarget;
    if (targetSubtask === draggedSubtask) return;

    dragOverSubtask = targetSubtask;

    document.querySelectorAll(".subtask-drop-preview").forEach(el => el.remove());

    const rect = targetSubtask.getBoundingClientRect();
    const midPoint = rect.top + rect.height / 2;

    const preview = document.createElement("div");
    preview.className = "subtask-drop-preview h-1 bg-blue-500 my-1 rounded";

    if (e.clientY < midPoint) {
        targetSubtask.parentNode.insertBefore(preview, targetSubtask);
    } else {
        targetSubtask.parentNode.insertBefore(preview, targetSubtask.nextSibling);
    }
}

function handleSubtaskDragLeave(e) {
    if (e.relatedTarget && !e.relatedTarget.closest(".subtasks")) {
        document.querySelectorAll(".subtask-drop-preview").forEach(el => el.remove());
        dragOverSubtask = null;
    }
}

function dragStart(e) {
    if (!e.target.classList.contains("bg-gray-100")) {
        e.dataTransfer.setData("text/plain", e.target.id);
        e.dataTransfer.setData("application/subtask", "false");
    }
}

function dragOver(e) {
    e.preventDefault();
    if (draggedSubtask) {
        const taskElement = e.currentTarget;
        const subtasksContainer = taskElement.querySelector(".subtasks");

        if (!subtasksContainer.contains(e.target)) {
            document.querySelectorAll(".subtask-drop-preview").forEach(el => el.remove());

            const preview = document.createElement("div");
            preview.className = "subtask-drop-preview h-1 bg-blue-500 my-1 rounded";
            subtasksContainer.appendChild(preview);
        }
    }
}

function drop(e) {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    const isSubtask = e.dataTransfer.getData("application/subtask") === "true";
    const draggedElement = document.getElementById(draggedId);

    if (!draggedElement) return;

    document.querySelectorAll(".subtask-drop-preview").forEach(el => el.remove());

    if (isSubtask) {
        const targetTask = e.currentTarget;
        const subtasksContainer = targetTask.querySelector(".subtasks");

        if (dragOverSubtask && dragOverSubtask.parentNode === subtasksContainer) {
            const rect = dragOverSubtask.getBoundingClientRect();
            const midPoint = rect.top + rect.height / 2;

            if (e.clientY < midPoint) {
                subtasksContainer.insertBefore(draggedElement, dragOverSubtask);
            } else {
                subtasksContainer.insertBefore(draggedElement, dragOverSubtask.nextSibling);
            }
        } else {
            subtasksContainer.appendChild(draggedElement);
        }
    } else {
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

    draggedSubtask = null;
    dragOverSubtask = null;
}

function initializeBackgroundPicker() {
    const backgroundModal = document.getElementById("background-modal");
    const openBackgroundModalBtn = document.getElementById("open-background-modal");
    const closeBackgroundModalBtn = document.getElementById("close-background-modal");
    const mainBody = document.getElementById("main-body");

    // Open modal
    openBackgroundModalBtn.addEventListener("click", () => {
        backgroundModal.classList.remove("hidden");
    });

    // Close modal
    closeBackgroundModalBtn.addEventListener("click", () => {
        backgroundModal.classList.add("hidden");
    });

    // Add click event for all color options
    const colorOptions = backgroundModal.querySelectorAll("[data-color]");
    colorOptions.forEach(option => {
        option.addEventListener("click", () => {
            // Remove all existing background classes
            const classesToRemove = mainBody.className.split(" ").filter(className =>
                className.startsWith("bg-") ||
                className.startsWith("from-") ||
                className.startsWith("to-") ||
                className.startsWith("via-")
            );
            mainBody.classList.remove(...classesToRemove);

            // Add new background class(es)
            const newClasses = option.dataset.color.split(" ");
            mainBody.classList.add(...newClasses);

            // Close modal
            backgroundModal.classList.add("hidden");
        });
    });
}

function initializeBoardTitle() {
    const boardTitle = document.getElementById('board-title');
    const editBoardTitleBtn = document.getElementById('edit-board-title');
    const boardTitleModal = document.getElementById('board-title-modal');
    const boardTitleInput = document.getElementById('board-title-input');
    const saveBoardTitleBtn = document.getElementById('save-board-title');
    const closeBoardTitleModalBtn = document.getElementById('close-board-title-modal');

    editBoardTitleBtn.addEventListener('click', () => {
        boardTitleInput.value = boardTitle.textContent;
        boardTitleModal.classList.remove('hidden');
    });

    closeBoardTitleModalBtn.addEventListener('click', () => {
        boardTitleModal.classList.add('hidden');
    });

    saveBoardTitleBtn.addEventListener('click', () => {
        const newTitle = boardTitleInput.value.trim();
        if (newTitle) {
            boardTitle.textContent = newTitle;
            boardTitleModal.classList.add('hidden');
        }
    });
}
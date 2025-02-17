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
const addTaskForm = document.getElementById("addTaskForm");

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
            renderLists(data.boardlists.sort((a, b) => a.list_position - b.list_position));
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
    formData.append('list_position', listArray.length + 1);

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

function createList(listObj) {
    listCounter++;
    const list = document.createElement("div");
    list.className = "bg-white p-4 rounded-xl shadow-md w-72 h-fit border-2 border-violet-400";
    list.setAttribute("draggable", "true");
    list.id = `list-${listObj.id}`;
    list.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold cursor-pointer">${listObj.list_name}</h3>
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

    return list;
}

async function deleteList(listId) {
    try {
        const response = await fetch(`/api/board/delete-list-${listId}/`, {
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
            console.log('Task deleted successfully');
            fetchLists();
        } else {
            console.error('Error deleting task:', data.message);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function addTask(list, taskCard) {
    const taskContainer = list.querySelector(".tasks");
    const task = document.createElement("div");
    task.className = "bg-gray-200 p-3 rounded-md cursor-move group relative";
    task.setAttribute("draggable", "true");
    task.id = `task-${taskCard.id}`;
    task.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="task-text">${taskCard.card_name}</span>
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
        openModal("edit-task-modal");
    });

    taskContainer.appendChild(task);
}

// Modal Event Listeners
document.getElementById("update-list").addEventListener("click", () => {
    const newName = document.getElementById("edit-list-name").value.trim();
    if (newName && selectedList) {
        selectedList.querySelector("h3").innerText = newName;
        closeModal("edit-list-modal");
    }
});

document.getElementById("close-edit-list-modal").addEventListener("click", () => {
    closeModal("edit-list-modal");
});

document.getElementById("confirm-delete-list").addEventListener("click", () => {
    if (selectedList) {
        console.log(selectedList)
        deleteList(selectedList.id);
        closeModal("delete-list-modal");
    }
});

document.getElementById("close-delete-list-modal").addEventListener("click", () => {
    closeModal("delete-list-modal")
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

addTaskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!selectedList) return; // Ensure a list is selected
    createTasko(e, selectedList.id);
});

function renderLists(lists) {
    const defaultLists = lists;
    const listContainer = document.getElementById("list-container");
    listContainer.innerHTML = "";
    listArray.length = 0;
    defaultLists.forEach(listL => {
        const list = createList(listL);
        listContainer.appendChild(list);

        list.querySelector(".add-task").addEventListener("click", () => {
            selectedList = listL;
            console.log(selectedList);
            openModal("task-modal");
        });

        list.querySelector(".rename-list").addEventListener("click", () => {
            selectedList = listL;
            const lis = list.querySelector("h3").innerText;
            document.getElementById("edit-list-name").value = listL;
            openModal("edit-list-modal");
        });

        list.querySelector(".delete-list").addEventListener("click", () => {
            selectedList = listL;
            openModal("delete-list-modal");
        });

        listL.cards.forEach(card => addTask(list, card))

    });
    listContainer.appendChild(createAddListCard());
    listArray.push(lists);
    console.log("fxn done");
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

function handleTaskDragOver(e) {
    console.log("drag over kya hota hai?");
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
    console.log("drag leave");
    if (e.relatedTarget && !e.relatedTarget.closest(".tasks")) {
        document.querySelectorAll(".task-drop-preview").forEach(el => el.remove());
        dragOverTask = null;
    }
}

function dragStart(e) {
    console.log("drag start")
    if (!e.target.classList.contains("bg-gray-100")) {
        e.dataTransfer.setData("text/plain", e.target.id);
        e.dataTransfer.setData("application/list", "false"); // if it's true ----> Bugggggssssss
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
    console.log("drop");
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
        const taskId = draggedElement.id.split('-')[1];
        const listId = targetList.id.split('-')[1];
        updateTaskParentList(taskId, listId);

    } else if (isList) { // Handle list swapping
        const dropZone = e.currentTarget;
        console.log("lists");
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

const input = document.getElementById('edit-name');
adjustInputWidth(input);
input.addEventListener('input', () => adjustInputWidth(input));
input.addEventListener('keydown', handleKeyDown);
const initialInputValue = input.value;

function adjustInputWidth(input) {
    // Create a temporary span element to measure the width of the text
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.whiteSpace = 'pre';
    tempSpan.style.fontSize = window.getComputedStyle(input).fontSize;
    tempSpan.style.fontFamily = window.getComputedStyle(input).fontFamily;
    tempSpan.style.fontWeight = window.getComputedStyle(input).fontWeight;
    tempSpan.textContent = input.value;

    // Append the span to the body to measure its width
    document.body.appendChild(tempSpan);
    const width = tempSpan.offsetWidth;

    // Remove the temporary span from the DOM
    document.body.removeChild(tempSpan);

    // Set the input width to the measured width
    input.style.width = `${width}px`;
}

function handleKeyDown(event) {
    if (event.key === 'Enter') {
        if (input.value === "") {
            input.value = initialInputValue;
            updateBoardName(input.value);
            return;
        }
        event.target.blur();
        updateBoardName(input.value);
    }
}

async function updateBoardName(value) {
    const formData = new FormData();
    formData.append('value', value);

    try {
        const response = await fetch(`/api/board-name-edit/${boardId}/`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            console.log("successsss");
        } else {
            console.error(data.message);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

async function createTasko(e, listId) {
    e.preventDefault();

    const formData = new FormData(e.target);
    formData.append('list_id', listId);
    try {
        const response = await fetch(`/api/list/create-card/`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            console.log("yehe");
            fetchLists();
            closeModal("task-modal");
        } else {
            console.error('Error:', data.message);
        }
    } catch (error) {
        console.error('Error creating task:', error);
    }
    e.target.reset();
}

async function updateTaskParentList(taskId, listId) {
    try {
        const response = await fetch(`/api/destination-list-${listId}/card-${taskId}/`,{
            method: 'PUT',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            }
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            console.log("Hehe ho gaya baba");
        } else {
            console.error('Error:', data.message);
        }
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeSidebar();
    initializeBackgroundPicker();
    fetchLists();
});



import { openModal, closeModal, getCookie, initThemeToggle } from "./utils.js"
import { icon_left, icon_right } from "./constants.js";

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

const cardModal = document.getElementById("card-modal");
const cardModalCloseBtn = document.getElementById("card-modal-close-btn");
cardModalCloseBtn.addEventListener("click", () => closeModal("card-modal"));

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
    e.target.reset();
}

function createList(listObj) {
    listCounter++;
    const list = document.createElement("div");
    list.className = "bg-secondary dark:bg-[#383838] dark:border-border-dark/50 dark:text-white py-4 px-2 rounded-md w-80 h-fit border border-border/80";
    list.setAttribute("draggable", "true");
    list.id = `list-${listObj.id}`;
    list.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium text-[1.2rem] cursor-pointer">${listObj.list_name}</h3>
            <div>
                <button class="rename-list text-blue-500 hover:text-blue-700 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-list text-gray-400 hover:text-gray-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="tasks space-y-2"></div>
        <button class="add-task bg-black dark:bg-indigo-600 text-white font-medium px-2 py-2 rounded-md text-sm hover:bg-gray-800 dark:hover:bg-indigo-500 transition duration-200 mt-4">Add Task</button>
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
    task.className = "bg-primary dark:bg-primary-dark p-4 rounded-md border border-stone-300  dark:border-border-dark/50 hover:shadow-lg cursor-move group relative hover:rotate-2 transition-transform duration-100 ease-in-out";
    task.setAttribute("draggable", "true");
    task.id = `task-${taskCard.id}`;
    task.innerHTML = `
        <div>
            <div class="flex justify-between items-center">
            <span class="task-text">${taskCard.card_name}</span>
            <button class="edit-task text-blue-500 hover:text-blue-700 hidden group-hover:block absolute right-2">
            <i class="fas fa-edit"></i>
            </button>
        </div>
        <div class="flex items-center mt-2">
            <div class="w-full"></div>
            <span class="opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-messages-square-icon lucide-messages-square"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg></span>
        </div>
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
    let clickTimeout;
    task.addEventListener("click", () => {
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            openModal("card-modal");
        }, 200);
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
    addListDiv.className = "bg-secondary p-4 rounded-xl w-72 h-fit flex items-center justify-center cursor-pointer hover:bg-white/60 dark:bg-secondary-dark dark:hover:bg-secondary/20 transition duration-200 ease-in-out border border-border/80 dark:border-border-dark/50";
    addListDiv.innerHTML = `
        <div class="dark:text-[#7d828c] text-center">
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
const sidebarIcon = document.getElementById("wsp");
const toggleicon = document.getElementsByClassName("toggle-icon");
const headerlogo = document.getElementById("header-logo");
const profile = document.getElementById("profile");

function initializeSidebar() {

    sidebarIcon.insertAdjacentHTML('beforeend', icon_left);
    sidebarIcon.insertAdjacentHTML('beforeend', icon_right);
    sidebarIcon.classList.add("hover:bg-[#e8e6dc]","dark:hover:bg-secondary/20", "p-1", "rounded-lg");

    const panelIcon = sidebarIcon.querySelector(".lucide-panel-right");
    const leftArrow = document.getElementById("arrow-left-icon");
    const rightArrow = document.getElementById("arrow-right-icon");

    // Add hover event listeners
    sidebarIcon.addEventListener("mouseenter", () => {
        panelIcon.classList.add("hidden");
        if (isSidebarOpen) {
            leftArrow.classList.remove("hidden");
        } else {
            rightArrow.classList.remove("hidden");
        }
    });

    sidebarIcon.addEventListener("mouseleave", () => {
        panelIcon.classList.remove("hidden");
        leftArrow.classList.add("hidden");
        rightArrow.classList.add("hidden");
    });

    sidebarIcon.addEventListener("click", () => {
        if (isSidebarOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
        isSidebarOpen = !isSidebarOpen;

        if (sidebarIcon.matches(':hover')) {
            panelIcon.classList.add("hidden");
            leftArrow.classList.add("hidden");
            rightArrow.classList.add("hidden");

            if (isSidebarOpen) {
                leftArrow.classList.remove("hidden");
            } else {
                rightArrow.classList.remove("hidden");
            }
        }
    });
}

function closeSidebar() {
    sidebar.classList.remove("w-[20rem]");
    sidebar.classList.add("w-[3rem]", "items-center");
    sidebarnav.classList.add("hidden");
    headerlogo.classList.add("hidden");
    profile.classList.add("hidden");
}

function openSidebar() {
    sidebar.classList.remove("w-[3rem]", "items-center");
    sidebar.classList.add("w-[20rem]");
    sidebarnav.classList.remove("hidden");
    headerlogo.classList.remove("hidden");
    profile.classList.remove("hidden");
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
    dragOver.classList.add("rotate-2")

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
        const response = await fetch(`/api/destination-list-${listId}/card-${taskId}/`, {
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

const addMemberBtn = document.getElementById('add-members-btn');
addMemberBtn.addEventListener('click', () => {
    openModal('invite-member-modal')
});
const closeInviteModalBtn = document.getElementById('close-invite-modal');
closeInviteModalBtn.addEventListener('click', () => {
    closeModal('invite-member-modal')
});
const inviteModalForm = document.getElementById('inviteModalForm');
inviteModalForm.addEventListener('submit', sendInvitation)

async function sendInvitation(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log(formData);
    const text = document.getElementById("wait-to-invite");
    text.classList.remove("hidden");
    text.innerHTML = "Just wait for a while...";
    try {
        const response = await fetch(`/api/board-${boardId}/invite`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            }
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            text.innerHTML = `<div data-aos="fade-out">Invitation send successfully</div>`;
            setTimeout(() => {
                closeModal('invite-member-modal');
                text.classList.add("hidden");
            }, 1000);
        } else {
            console.error('Error:', data.message);
        }
    } catch (error) {
        console.error('Error sending invitation', error);
    }
}

const selfUserId = document.getElementById("self-user");
const workspaceCreatorId = document.getElementById("workspace-creator");
const addMemBtnDiv = document.getElementById("add-mem-btn-div");


document.addEventListener("DOMContentLoaded", () => {
    initializeSidebar();
    initializeBackgroundPicker();
    fetchLists();
    if ((selfUserId.textContent) !== (workspaceCreatorId.textContent)) {
        addMemBtnDiv.classList.add("hidden");
    }
});




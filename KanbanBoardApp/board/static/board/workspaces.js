import { openModal, closeModal } from "./utils.js";
import { renderBoards } from "./boards.js";

export let workspaces = [];
export let currentWorkspace = null;
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
document.getElementById("confirmDeleteWorkspace").addEventListener("click", function () {
    if (workspaceToDelete !== null) {
        deleteWorkspace(workspaceToDelete); // ✅ Use workspaceToDelete
        workspaceToDelete = null;
        closeModal("deleteWorkspaceModal");
    }
});
addWorkspaceForm.addEventListener("submit", handleAddWorkspace);
cancelDeleteWorkspaceBtn.addEventListener("click", () => closeModal("deleteWorkspaceModal"))

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px"><path d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"/></svg>`

export function renderWorkspaces() {
    console.log(workspaces);
    workspaceList.innerHTML = workspaces
        .map(
            (workspace) => `
                <div class="flex justify-between items-left w-full px-4 py-4 rounded-lg hover:bg-gray-200 ${currentWorkspace?.id === workspace.id ? 'bg-gray-100' : ""}">
                    <button class="flex-1" id="select-${workspace.id}">
                        ${workspace.name}
                    </button>
                    <button id="delete-${workspace.id}">
                        ${svg}
                    </button>
                </div>
    `).join("");

    workspaces.forEach((workspace) => {
        const selectButton = document.getElementById(`select-${workspace.id}`)
        if (selectButton) {
            selectButton.addEventListener("click", ()=>selectWorkspace(workspace.id))
        }
    });

    workspaces.forEach((workspace) => {
        const deleteButton = document.getElementById(`delete-${workspace.id}`);
        if (deleteButton) {
            deleteButton.addEventListener("click", () => confirmDeleteWorkspace(workspace.id)); // ✅ Pass workspace ID
        }
    });    
}

async function handleAddWorkspace(e) {
    e.preventDefault();
    const workspaceName = e.target.querySelector("#workspace_name").value;

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
        console.log(data)
        if (data.success) {
            fetchWorkspaces()
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));

    closeModal("addWorkspaceModal");
    e.target.reset();
}

function confirmDeleteWorkspace(workspaceId) {
    workspaceToDelete = workspaceId;  // ✅ Store the workspace ID
    openModal("deleteWorkspaceModal"); // ✅ Open modal
}

function selectWorkspace(workspaceId) {
    console.log(workspaceId);
    currentWorkspace = workspaces.find((w) => w.id === workspaceId);
    currentWorkspaceTitle.textContent = currentWorkspace.name;
    workspaceTabs.classList.remove("hidden");
    renderBoards();
}

function deleteWorkspace(workspaceId) {
    fetch('/delete-workspace/', {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() },
        body: JSON.stringify({ workspace_id: workspaceId })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);
        if (data.success) {
            alert("Workspace deleted!");
            location.reload();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error deleting workspace:", error));
}

// Function to get CSRF token from cookies
function getCSRFToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
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

export async function fetchWorkspaces() {
    try {
        const response = await fetch('/all-workspaces/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'), // Ensure CSRF token is included
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
        } else {
            console.error('Error fetching workspaces:', data.message);
        }
    } catch (error) {
        console.error('Error fetching workspaces:', error);
    }
}

// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
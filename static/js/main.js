const API = "/api/v1/";

function getCookie(name) {
  const row = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
  return row ? decodeURIComponent(row.slice(name.length + 1)) : null;
}

async function api(method, url, body) {
  const headers = {};
  const csrf = getCookie("csrftoken");
  if (csrf) headers["X-CSRFToken"] = csrf;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || data.detail || "Request failed"), { status: response.status });
  return data;
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const INPUT_CLASS = "h-9 w-full min-w-0 rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-1 text-base md:text-sm text-foreground placeholder:text-muted-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

let workspaceManagerInstance = null;

function workspaceManager() {
  return {
    showWorkspaceModal: false,
    showBoardModal: false,
    showDeleteModal: false,
    currentWorkspaceId: null,
    workspaceToDelete: null,
    workspaces: [],

    init() {
      workspaceManagerInstance = this;
      this.loadWorkspaces();
    },

    openWorkspaceModal() { this.showWorkspaceModal = true; },
    closeWorkspaceModal() { this.showWorkspaceModal = false; },
    openBoardModal() {
      if (!this.currentWorkspaceId) return;
      this.showBoardModal = true;
    },
    closeBoardModal() { this.showBoardModal = false; },
    openDeleteModal(id) { this.workspaceToDelete = id; this.showDeleteModal = true; },
    closeDeleteModal() { this.showDeleteModal = false; this.workspaceToDelete = null; },

    async loadWorkspaces() {
      try {
        const [mine, others] = await Promise.all([
          api("GET", `${API}workspaces/?page_size=100`),
          api("GET", `${API}workspaces/other-workspaces/`),
        ]);
        this.workspaces = mine.results || [];
        this.renderWorkspaces(this.workspaces, "workspaceList", true);
        this.renderWorkspaces(others.workspaces || [], "workspaceListOthers", false);
      } catch (error) {
        console.error(error);
      }
    },

    renderWorkspaces(workspaces, containerId, owned) {
      const container = document.getElementById(containerId);
      if (!workspaces.length) {
        container.innerHTML = '<p class="text-sm text-muted-foreground">No workspaces found</p>';
        return;
      }
      container.innerHTML = workspaces.map((ws) => `
        <div role="button" tabindex="0" class="btn btn-ghost justify-between w-full" data-ws-id="${ws.id}" onclick="workspaceManagerInstance.selectWorkspace(${ws.id})">
          <span class="font-medium text-foreground">${esc(ws.workspace_name)}</span>
          ${owned ? `<button aria-label="Delete workspace" class="btn btn-ghost btn-xs btn-circle text-destructive hover:bg-destructive/10" onclick="event.stopPropagation(); workspaceManagerInstance.openDeleteModal(${ws.id})">&times;</button>` : ""}
        </div>`).join("");
    },

    selectWorkspace(id) {
      const ws = this.workspaces.find((w) => w.id === id);
      if (!ws) return;
      this.currentWorkspaceId = id;
      document.getElementById("currentWorkspaceTitle").textContent = ws.workspace_name;
      document.getElementById("workspaceTabs").classList.remove("hidden");
      this.loadBoards();
    },

    async loadBoards() {
      try {
        const data = await api("GET", `${API}boards/?workspace=${this.currentWorkspaceId}&page_size=100`);
        this.renderBoards(data.results || []);
      } catch (error) {
        console.error(error);
      }
    },

    renderBoards(boards) {
      const create = `<button onclick="workspaceManagerInstance.openBoardModal()" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">+ Create Board</button>`;
      const container = document.getElementById("tabContent");
      if (!boards.length) {
        container.innerHTML = `<div class="text-center py-12"><p class="text-muted-foreground mb-4">No boards yet</p>${create}</div>`;
        return;
      }
      container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-foreground">Your Boards</h3>${create}
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${boards.map((b) => `
            <a href="/workspace/${this.currentWorkspaceId}/get-board/${b.id}/" class="block">
              <div class="p-6 rounded-lg border hover:shadow-lg transition-all cursor-pointer" style="background: ${b.background_color}">
                <h3 class="text-lg font-semibold text-white mb-2">${esc(b.name)}</h3>
                <p class="text-sm text-white/80">${esc(b.description || "No description")}</p>
              </div>
            </a>`).join("")}
        </div>`;
    },

    async createWorkspace() {
      const input = document.getElementById("id_workspace_name");
      try {
        await api("POST", `${API}workspaces/`, { workspace_name: input.value.trim() });
        this.closeWorkspaceModal();
        input.value = "";
        this.loadWorkspaces();
      } catch (error) {
        alert(error.message);
      }
    },

    async createBoard() {
      try {
        await api("POST", `${API}boards/`, {
          name: document.getElementById("id_name").value.trim(),
          description: document.getElementById("id_description").value.trim(),
          workspace: this.currentWorkspaceId,
        });
        this.closeBoardModal();
        this.loadBoards();
      } catch (error) {
        alert(error.message);
      }
    },

    async confirmDeleteWorkspace() {
      if (!this.workspaceToDelete) return;
      const id = this.workspaceToDelete;
      try {
        await api("DELETE", `${API}workspaces/${id}/`);
        this.closeDeleteModal();
        if (this.currentWorkspaceId === id) {
          this.currentWorkspaceId = null;
          document.getElementById("currentWorkspaceTitle").textContent = "Select a workspace";
          document.getElementById("workspaceTabs").classList.add("hidden");
          document.getElementById("tabContent").innerHTML = "";
        }
        this.loadWorkspaces();
      } catch (error) {
        alert(error.message);
      }
    },
  };
}

function boardPage() {
  const app = document.getElementById("board-app");
  if (!app) return;
  const boardId = Number(app.dataset.boardId);
  const container = document.getElementById("list-container");

  const cardHtml = (card) => `
    <div draggable="true" data-card-id="${card.id}" class="bg-background p-3 rounded-md border border-border hover:border-ring cursor-pointer transition-colors flex items-start justify-between gap-2">
      <p class="text-sm text-foreground font-medium">${esc(card.card_name)}</p>
      <button data-del-card aria-label="Delete card" class="text-muted-foreground hover:text-foreground">&times;</button>
    </div>`;

  const columnHtml = (list) => `
    <div class="w-72 flex-shrink-0" data-list-id="${list.id}">
      <div class="bg-card rounded-lg border border-border h-full flex flex-col shadow-sm">
        <div class="p-3 border-b border-border flex items-center justify-between">
          <h3 class="font-semibold text-foreground">${esc(list.list_name)}</h3>
          <button data-del-list aria-label="Delete list" class="text-muted-foreground hover:text-foreground">&times;</button>
        </div>
        <div data-cards class="flex-1 overflow-y-auto p-3 space-y-2">${(list.cards || []).map(cardHtml).join("")}</div>
        <form data-add-card class="p-3 border-t border-border">
          <input name="card_name" required autocomplete="off" placeholder="+ Add a card" aria-label="New card name" class="${INPUT_CLASS}" />
        </form>
      </div>
    </div>`;

  async function refresh() {
    try {
      const data = await api("GET", `${API}lists/?board=${boardId}`);
      container.querySelectorAll("[data-list-id]").forEach((n) => n.remove());
      document.getElementById("add-list-tile").insertAdjacentHTML("beforebegin", (data.boardlists || []).map(columnHtml).join(""));
    } catch (error) {
      console.error(error);
    }
  }

  container.addEventListener("click", async (e) => {
    try {
      const cardBtn = e.target.closest("[data-del-card]");
      if (cardBtn) {
        await api("DELETE", `${API}cards/${cardBtn.closest("[data-card-id]").dataset.cardId}/`);
        return refresh();
      }
      const listBtn = e.target.closest("[data-del-list]");
      if (listBtn) {
        await api("DELETE", `${API}lists/${listBtn.closest("[data-list-id]").dataset.listId}/`);
        return refresh();
      }
    } catch (error) {
      console.error(error);
    }
  });

  container.addEventListener("submit", async (e) => {
    const form = e.target.closest("[data-add-card]");
    if (!form) return;
    e.preventDefault();
    try {
      await api("POST", `${API}cards/`, { card_name: form.elements.card_name.value.trim(), list_id: Number(form.closest("[data-list-id]").dataset.listId) });
      form.reset();
      refresh();
    } catch (error) {
      console.error(error);
    }
  });

  let draggedCardId = null;
  container.addEventListener("dragstart", (e) => {
    const card = e.target.closest("[data-card-id]");
    if (!card) return;
    draggedCardId = Number(card.dataset.cardId);
    e.dataTransfer.effectAllowed = "move";
  });
  container.addEventListener("dragover", (e) => {
    if (draggedCardId && e.target.closest("[data-cards]")) e.preventDefault();
  });
  container.addEventListener("drop", async (e) => {
    const zone = e.target.closest("[data-cards]");
    if (!zone || !draggedCardId) return;
    e.preventDefault();
    const cardId = draggedCardId;
    draggedCardId = null;
    const listId = Number(zone.closest("[data-list-id]").dataset.listId);
    const cards = [...zone.querySelectorAll("[data-card-id]")];
    const over = e.target.closest("[data-card-id]");
    const position = over ? cards.indexOf(over) : cards.length;
    try {
      await api("PUT", `${API}cards/${cardId}/move-to-list/${listId}/`, { position });
      refresh();
    } catch (error) {
      console.error(error);
    }
  });

  const inviteModal = document.getElementById("invite-modal");
  for (const id of ["open-invite-modal", "add-members-btn"]) {
    document.getElementById(id)?.addEventListener("click", () => inviteModal.classList.add("modal-open"));
  }
  inviteModal.querySelector("[data-close-invite]").addEventListener("click", () => {
    inviteModal.classList.remove("modal-open");
    document.getElementById("invite-feedback").classList.add("hidden");
  });
  document.getElementById("invite-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const feedback = document.getElementById("invite-feedback");
    feedback.className = "text-sm";
    try {
      await api("POST", `${API}invitations/`, { email: e.target.elements.email.value.trim(), board: boardId });
      feedback.textContent = "Invitation sent.";
      e.target.reset();
    } catch (error) {
      feedback.textContent = error.status === 400 ? "Enter a valid email address." : error.message;
      feedback.classList.add("text-destructive");
    }
  });

  const nameInput = document.getElementById("edit-name");
  nameInput.addEventListener("change", async () => {
    try {
      await api("POST", `${API}boards/${boardId}/update-name/`, { value: nameInput.value });
    } catch (error) {
      console.error(error);
    }
  });

  const showListBtn = document.getElementById("show-add-list");
  const listForm = document.getElementById("add-list-form");
  const toggleAddList = (showForm) => {
    showListBtn.classList.toggle("hidden", showForm);
    listForm.classList.toggle("hidden", !showForm);
    if (showForm) listForm.elements.list_name.focus();
  };
  showListBtn.addEventListener("click", () => toggleAddList(true));
  document.getElementById("cancel-add-list").addEventListener("click", () => toggleAddList(false));
  listForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("POST", `${API}lists/`, { list_name: listForm.elements.list_name.value.trim(), board: boardId });
      listForm.reset();
      toggleAddList(false);
      refresh();
    } catch (error) {
      console.error(error);
    }
  });

  refresh();
}

boardPage();

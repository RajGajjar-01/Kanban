const API = "/api/v1/";

function getCookie(name) {
  const c = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
  return c ? decodeURIComponent(c.split("=")[1]) : null;
}

async function api(method, url, body) {
  const headers = {};
  const csrf = getCookie("csrftoken");
  if (csrf) headers["X-CSRFToken"] = csrf;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || data.detail || "Request failed"), { status: res.status });
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
    openBoardModal() { if (this.currentWorkspaceId) this.showBoardModal = true; },
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
      } catch (e) { console.error(e); }
    },

    renderWorkspaces(list, containerId, owned) {
      const container = document.getElementById(containerId);
      if (!container) return;
      if (!list.length) {
        container.innerHTML = '<p class="text-sm text-muted-foreground">No workspaces found</p>';
        return;
      }
      container.innerHTML = list.map((ws) => `
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
      } catch (e) { console.error(e); }
    },

    renderBoards(boards) {
      const createBtn = `<button onclick="workspaceManagerInstance.openBoardModal()" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">+ Create Board</button>`;
      const container = document.getElementById("tabContent");
      if (!container) return;
      if (!boards.length) {
        container.innerHTML = `<div class="text-center py-12"><p class="text-muted-foreground mb-4">No boards yet</p>${createBtn}</div>`;
        return;
      }
      container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-foreground">Your Boards</h3>${createBtn}
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
      } catch (e) { alert(e.message); }
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
      } catch (e) { alert(e.message); }
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
      } catch (e) { alert(e.message); }
    },
  };
}

function boardPage() {
  const app = document.getElementById("board-app");
  if (!app) return;
  const boardId = Number(app.dataset.boardId);
  const container = document.getElementById("list-container");

  const cardHtml = (c) => `
    <div draggable="true" data-card-id="${c.id}" class="bg-background p-3 rounded-md border border-border hover:border-ring cursor-pointer transition-colors flex items-start justify-between gap-2">
      <p class="text-sm text-foreground font-medium">${esc(c.card_name)}</p>
      <button data-del-card aria-label="Delete card" class="text-muted-foreground hover:text-foreground">&times;</button>
    </div>`;

  const columnHtml = (l) => `
    <div class="w-72 flex-shrink-0 flex flex-col" data-list-id="${l.id}" style="max-height: calc(100vh - 8rem)">
      <div class="bg-card rounded-lg border border-border flex flex-col shadow-sm overflow-hidden">
        <div class="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
          <h3 class="font-semibold text-foreground">${esc(l.list_name)}</h3>
          <button data-del-list aria-label="Delete list" class="text-muted-foreground hover:text-foreground">&times;</button>
        </div>
        <div data-cards class="overflow-y-auto p-3 space-y-2 flex-1">${(l.cards || []).map(cardHtml).join("")}</div>
        <form data-add-card class="p-3 border-t border-border flex-shrink-0">
          <input name="card_name" required autocomplete="off" placeholder="+ Add a card" aria-label="New card name" class="${INPUT_CLASS}" />
        </form>
      </div>
    </div>`;

  async function refresh() {
    try {
      const data = await api("GET", `${API}lists/?board=${boardId}`);
      container.querySelectorAll("[data-list-id]").forEach((n) => n.remove());
      document.getElementById("add-list-tile")?.insertAdjacentHTML("beforebegin", (data.boardlists || []).map(columnHtml).join(""));
    } catch (e) { console.error(e); }
  }

  container?.addEventListener("click", async (e) => {
    try {
      const cardBtn = e.target.closest("[data-del-card]");
      if (cardBtn) {
        await api("DELETE", `${API}cards/${cardBtn.closest("[data-card-id]").dataset.cardId}/`);
        return refresh();
      }
      const card = e.target.closest("[data-card-id]");
      if (card && !e.target.closest("button")) return openCardModal(Number(card.dataset.cardId));
      const listBtn = e.target.closest("[data-del-list]");
      if (listBtn) {
        await api("DELETE", `${API}lists/${listBtn.closest("[data-list-id]").dataset.listId}/`);
        return refresh();
      }
    } catch (e) { console.error(e); }
  });

  const cardModal = document.getElementById("card-modal");
  const cardForm = document.getElementById("card-detail-form");
  const cardFeedback = document.getElementById("card-feedback");
  let editingCardId = null;

  async function openCardModal(id) {
    editingCardId = id;
    try {
      const c = await api("GET", `${API}cards/${id}/`);
      cardForm.elements.card_name.value = c.card_name;
      cardForm.elements.card_description.value = c.card_description || "";
      cardForm.elements.due_date.value = c.due_date ? c.due_date.slice(0, 16) : "";
      cardForm.elements.label.value = c.label || "";
    } catch (e) { return console.error(e); }
    cardFeedback?.classList.add("hidden");
    cardModal?.classList.add("modal-open");
  }

  cardModal?.querySelector("[data-close-card]")?.addEventListener("click", () => cardModal.classList.remove("modal-open"));

  cardForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("PATCH", `${API}cards/${editingCardId}/`, {
        card_name: cardForm.elements.card_name.value.trim(),
        card_description: cardForm.elements.card_description.value,
        due_date: cardForm.elements.due_date.value || null,
        label: cardForm.elements.label.value || null,
      });
      cardModal.classList.remove("modal-open");
      refresh();
    } catch (e) {
      if (cardFeedback) {
        cardFeedback.textContent = e.message;
        cardFeedback.classList.remove("hidden");
      }
    }
  });

  container?.addEventListener("submit", async (e) => {
    const form = e.target.closest("[data-add-card]");
    if (!form) return;
    e.preventDefault();
    try {
      await api("POST", `${API}cards/`, { card_name: form.elements.card_name.value.trim(), list_id: Number(form.closest("[data-list-id]").dataset.listId) });
      form.reset();
      refresh();
    } catch (e) { console.error(e); }
  });

  let draggedCardId = null;
  container?.addEventListener("dragstart", (e) => {
    const card = e.target.closest("[data-card-id]");
    if (card) { draggedCardId = Number(card.dataset.cardId); e.dataTransfer.effectAllowed = "move"; }
  });
  container?.addEventListener("dragover", (e) => { if (draggedCardId && e.target.closest("[data-cards]")) e.preventDefault(); });
  container?.addEventListener("drop", async (e) => {
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
    } catch (e) { console.error(e); }
  });

  const inviteModal = document.getElementById("invite-modal");
  ["open-invite-modal", "add-members-btn"].forEach((id) => document.getElementById(id)?.addEventListener("click", () => inviteModal?.classList.add("modal-open")));
  inviteModal?.querySelector("[data-close-invite]")?.addEventListener("click", () => {
    inviteModal.classList.remove("modal-open");
    document.getElementById("invite-feedback")?.classList.add("hidden");
  });
  document.getElementById("invite-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const feedback = document.getElementById("invite-feedback");
    if (feedback) feedback.className = "text-sm";
    try {
      await api("POST", `${API}invitations/`, { email: e.target.elements.email.value.trim(), board: boardId });
      if (feedback) feedback.textContent = "Invitation sent.";
      e.target.reset();
    } catch (err) {
      if (feedback) {
        feedback.textContent = err.status === 400 ? "Enter a valid email address." : err.message;
        feedback.classList.add("text-destructive");
      }
    }
  });

  document.getElementById("edit-name")?.addEventListener("change", async (e) => {
    try { await api("POST", `${API}boards/${boardId}/update-name/`, { value: e.target.value }); }
    catch (err) { console.error(err); }
  });

  const showListBtn = document.getElementById("show-add-list");
  const listForm = document.getElementById("add-list-form");
  const toggleAddList = (show) => {
    showListBtn?.classList.toggle("hidden", show);
    listForm?.classList.toggle("hidden", !show);
    if (show) listForm?.elements.list_name?.focus();
  };
  showListBtn?.addEventListener("click", () => toggleAddList(true));
  document.getElementById("cancel-add-list")?.addEventListener("click", () => toggleAddList(false));
  listForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("POST", `${API}lists/`, { list_name: listForm.elements.list_name.value.trim(), board: boardId });
      listForm.reset();
      toggleAddList(false);
      refresh();
    } catch (err) { console.error(err); }
  });

  refresh();
}

boardPage();

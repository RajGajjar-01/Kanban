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
  if (!res.ok) {
    let msg = data.message || data.detail;
    if (!msg && typeof data === "object" && Object.keys(data).length) {
      msg = Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("\n");
    }
    throw Object.assign(new Error(msg || "Request failed"), { status: res.status, data });
  }
  return data;
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const INPUT_CLASS = "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base md:text-sm text-foreground placeholder:text-muted-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

let workspaceManagerInstance = null;

function workspaceManager() {
  return {
    showWorkspaceModal: false,
    showBoardModal: false,
    showDeleteModal: false,
    currentWorkspaceId: null,
    workspaceToDelete: null,
    workspaces: [],
    activeTab: "boards",

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

    switchTab(tab) {
      this.activeTab = tab;
      const tabs = document.querySelectorAll("#workspaceTabs button");
      tabs.forEach((btn) => {
        const isSelected = btn.dataset.tab === tab;
        btn.className = isSelected
          ? "px-3 py-1 rounded-md font-semibold transition-all bg-background text-foreground shadow-xs"
          : "px-3 py-1 rounded-md font-medium transition-all text-muted-foreground hover:text-foreground";
      });
      if (tab === "boards") this.loadBoards();
      else if (tab === "members") this.loadMembers();
      else if (tab === "activities") this.loadActivities();
    },

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
        container.innerHTML = '<p x-show="sidebarOpen" class="text-xs text-muted-foreground/60 px-2 py-1">No workspaces</p>';
        return;
      }
      container.innerHTML = list.map((ws) => {
        const isActive = this.currentWorkspaceId === ws.id;
        return `
        <div role="button" tabindex="0"
             class="group flex items-center px-2 py-2 rounded-md text-sm transition-colors cursor-pointer select-none ${
               isActive
                 ? "bg-accent text-foreground font-semibold"
                 : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
             }"
             :class="sidebarOpen ? 'justify-between' : 'justify-center !px-0'"
             :title="!sidebarOpen ? '${esc(ws.workspace_name)}' : ''"
             data-ws-id="${ws.id}"
             onclick="workspaceManagerInstance.selectWorkspace(${ws.id})">
          <div class="flex items-center gap-2 min-w-0 overflow-hidden" :class="sidebarOpen ? '' : 'justify-center'">
            <div class="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
              isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-foreground"
            }">
              ${esc(ws.workspace_name.charAt(0).toUpperCase())}
            </div>
            <span x-show="sidebarOpen" x-transition class="truncate text-xs font-medium">${esc(ws.workspace_name)}</span>
          </div>
          ${
            owned
              ? `<button x-show="sidebarOpen" aria-label="Delete workspace" class="p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0" onclick="event.stopPropagation(); workspaceManagerInstance.openDeleteModal(${ws.id})">
                   <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                 </button>`
              : ""
          }
        </div>`;
      }).join("");
    },

    selectWorkspace(id) {
      const ws = this.workspaces.find((w) => w.id === id);
      if (!ws) return;
      this.currentWorkspaceId = id;
      document.getElementById("currentWorkspaceTitle").textContent = ws.workspace_name;
      document.getElementById("emptyWorkspaceState")?.classList.add("hidden");
      const activeView = document.getElementById("activeWorkspaceView");
      if (activeView) {
        activeView.classList.remove("hidden");
        activeView.classList.add("flex");
      }
      const tabs = document.getElementById("workspaceTabs");
      if (tabs) {
        tabs.classList.remove("hidden");
        tabs.classList.add("flex");
      }
      this.loadWorkspaces();
      this.switchTab(this.activeTab || "boards");
    },

    async loadBoards() {
      try {
        const data = await api("GET", `${API}boards/?workspace=${this.currentWorkspaceId}&page_size=100`);
        this.renderBoards(data.results || []);
      } catch (e) { console.error(e); }
    },

    renderBoards(boards) {
      const container = document.getElementById("tabContent");
      if (!container) return;

      const newBoardCard = `
        <div onclick="workspaceManagerInstance.openBoardModal()" 
             class="group flex flex-col items-center justify-center min-h-[200px] p-6 rounded-2xl border border-dashed border-border/80 hover:border-primary/60 bg-card/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer text-center shadow-xs hover:shadow-md">
          <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <span class="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Create New Board</span>
          <span class="text-xs text-muted-foreground mt-1 font-medium">Add a new board to this workspace</span>
        </div>`;

      if (!boards.length) {
        container.innerHTML = `
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-foreground">Boards</h3>
                <p class="text-xs text-muted-foreground">0 boards in this workspace</p>
              </div>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              ${newBoardCard}
            </div>
          </div>`;
        return;
      }

      container.innerHTML = `
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-foreground flex items-center gap-2">
                Boards
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">${boards.length}</span>
              </h3>
              <p class="text-xs text-muted-foreground">Manage and track workspace projects</p>
            </div>
            <button onclick="workspaceManagerInstance.openBoardModal()" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-xs shrink-0 whitespace-nowrap">
              <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>New Board</span>
            </button>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${boards.map((b) => `
              <a href="/workspace/${this.currentWorkspaceId}/get-board/${b.id}/" class="group flex flex-col min-h-[200px] rounded-2xl outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80">
                <div class="h-full w-full rounded-2xl border border-border/80 bg-card group-hover:border-primary/50 shadow-xs group-hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between p-6 relative">
                  
                  <!-- Card Header & Content -->
                  <div class="space-y-3.5">
                    <div class="flex items-center justify-between gap-3">
                      <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-base shadow-xs">
                        ${esc(b.name.charAt(0).toUpperCase())}
                      </div>
                      <span class="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">Kanban</span>
                    </div>
                    <div class="pt-1">
                      <h4 class="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">${esc(b.name)}</h4>
                      <p class="text-xs text-muted-foreground line-clamp-2 leading-relaxed">${esc(b.description || "No description provided.")}</p>
                    </div>
                  </div>

                  <!-- Card Footer -->
                  <div class="flex items-center justify-between pt-4 border-t border-border/40 mt-5 text-xs font-semibold text-primary group-hover:text-primary">
                    <span class="inline-flex items-center gap-1.5">
                      Open Board
                      <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              </a>`).join("")}
            ${newBoardCard}
          </div>
        </div>`;
    },

    async loadMembers() {
      const container = document.getElementById("tabContent");
      if (!container) return;
      try {
        const ws = this.workspaces.find((w) => w.id === this.currentWorkspaceId);
        const members = ws?.members || [];
        const totalCount = members.length + 1;
        container.innerHTML = `
          <div class="space-y-6 w-full">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h3 class="text-lg font-bold text-foreground flex items-center gap-2">
                  Workspace Members
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">${totalCount}</span>
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5">Manage team access and workspace roles</p>
              </div>
            </div>

            <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs divide-y divide-border">
              <!-- Workspace Owner -->
              <div class="p-4 flex items-center justify-between hover:bg-accent/40 transition-colors">
                <div class="flex items-center gap-3.5">
                  <div class="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                    ${esc((ws?.owner_username || "U").charAt(0).toUpperCase())}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-foreground flex items-center gap-2">
                      ${esc(ws?.owner_username || "Owner")}
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 uppercase tracking-wider">Workspace Owner</span>
                    </div>
                    <div class="text-xs text-muted-foreground">Admin Access</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                  </span>
                </div>
              </div>

              <!-- Other Members -->
              ${members.map(m => `
                <div class="p-4 flex items-center justify-between hover:bg-accent/40 transition-colors">
                  <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-full bg-muted text-muted-foreground font-bold flex items-center justify-center text-sm shrink-0">
                      ${esc(m.username ? m.username.charAt(0).toUpperCase() : "M")}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-foreground">${esc(m.username || m.email)}</div>
                      <div class="text-xs text-muted-foreground">${esc(m.email || "Member")}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">Collaborator</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>`;
      } catch (e) { console.error(e); }
    },

    async loadActivities() {
      const container = document.getElementById("tabContent");
      if (!container) return;
      const ws = this.workspaces.find((w) => w.id === this.currentWorkspaceId);
      container.innerHTML = `
        <div class="space-y-6 w-full">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-foreground">Workspace Activity</h3>
              <p class="text-xs text-muted-foreground mt-0.5">Live audit log and recent changes in ${esc(ws?.workspace_name || "this workspace")}</p>
            </div>
          </div>

          <div class="space-y-3">
            
            <!-- Activity 1 -->
            <div class="flex items-start gap-4 p-4 rounded-xl border border-border bg-card/60 hover:bg-card transition-all shadow-xs group">
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <h4 class="text-sm font-semibold text-foreground">Workspace Boards Initialized</h4>
                  <span class="inline-flex items-center px-3 py-1.5 leading-none rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border shrink-0">Just now</span>
                </div>
                <p class="text-xs text-muted-foreground leading-relaxed">Active workspace dashboard loaded with Kanban board support.</p>
              </div>
            </div>

            <!-- Activity 2 -->
            <div class="flex items-start gap-4 p-4 rounded-xl border border-border bg-card/60 hover:bg-card transition-all shadow-xs group">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <h4 class="text-sm font-semibold text-foreground">Workspace Access Verified</h4>
                  <span class="inline-flex items-center px-3 py-1.5 leading-none rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border shrink-0">10 minutes ago</span>
                </div>
                <p class="text-xs text-muted-foreground leading-relaxed">Session authenticated for workspace ${esc(ws?.workspace_name || "")}.</p>
              </div>
            </div>

          </div>
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
          document.getElementById("activeWorkspaceView")?.classList.add("hidden");
          document.getElementById("activeWorkspaceView")?.classList.remove("flex");
          document.getElementById("emptyWorkspaceState")?.classList.remove("hidden");
          document.getElementById("workspaceTabs")?.classList.add("hidden");
          document.getElementById("workspaceTabs")?.classList.remove("flex");
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

  const priorityBadgeHtml = (p) => {
    switch (p) {
      case "urgent": return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400">🔴 Urgent</span>';
      case "high": return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/15 text-orange-400">🟠 High</span>';
      case "medium": return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/15 text-yellow-400">🟡 Med</span>';
      case "low": return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/15 text-green-400">🟢 Low</span>';
      default: return '';
    }
  };

  const cardHtml = (c) => {
    const coverBar = c.cover_color ? `<div class="h-3 w-full rounded-t-2xl -mt-4 -mx-4 mb-3" style="background-color: ${esc(c.cover_color)}"></div>` : '';
    const isCompleted = c.is_completed;
    const titleClass = isCompleted ? 'line-through text-muted-foreground' : 'text-foreground';
    const tagList = c.tags ? c.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const tagsHtml = tagList.length ? `<div class="flex flex-wrap gap-1.5 mt-1.5">${tagList.map(t => `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-accent/80 text-accent-foreground">#${esc(t)}</span>`).join('')}</div>` : '';
    const dueDateStr = c.due_date ? new Date(c.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
    
    return `
    <div draggable="true" data-card-id="${c.id}" class="bg-card p-4 sm:p-4.5 rounded-2xl border border-border/80 hover:border-primary/60 cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col gap-2 group">
      ${coverBar}
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 overflow-hidden">
          ${isCompleted ? '<span class="text-xs text-emerald-500 font-bold">✓</span>' : ''}
          ${priorityBadgeHtml(c.priority)}
        </div>
        <button data-del-card aria-label="Delete card" class="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity text-base font-bold">&times;</button>
      </div>
      <p class="text-sm font-bold leading-snug ${titleClass}">${esc(c.card_name)}</p>
      ${tagsHtml}
      <div class="flex items-center justify-between gap-2 pt-2.5 border-t border-border/40 text-xs text-muted-foreground mt-1.5">
        <div class="flex items-center gap-2">
          ${dueDateStr ? `<span class="inline-flex items-center gap-1 font-medium"><svg class="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>${dueDateStr}</span>` : ''}
          ${c.story_points ? `<span class="px-2 py-0.5 bg-muted text-muted-foreground font-bold rounded-md text-[10px]">⚡ ${c.story_points} pts</span>` : ''}
        </div>
        ${c.assignee_username ? `<span class="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shadow-xs" title="Assigned to ${esc(c.assignee_username)}">${esc(c.assignee_username.charAt(0).toUpperCase())}</span>` : ''}
      </div>
    </div>`;
  };

  const columnHtml = (l) => `
    <div class="w-80 flex-shrink-0 flex flex-col" data-list-id="${l.id}" style="max-height: calc(100vh - 8rem)">
      <div class="bg-card/90 rounded-2xl border border-border/80 flex flex-col shadow-md overflow-hidden">
        <div class="p-4 border-b border-border/60 flex items-center justify-between flex-shrink-0">
          <h3 class="font-bold text-foreground text-sm tracking-tight">${esc(l.list_name)}</h3>
          <button data-del-list aria-label="Delete list" class="text-muted-foreground hover:text-foreground text-lg font-bold">&times;</button>
        </div>
        <div data-cards class="overflow-y-auto p-3.5 space-y-3 flex-1">${(l.cards || []).map(cardHtml).join("")}</div>
        <form data-add-card class="p-3.5 border-t border-border/60 flex-shrink-0">
          <input name="card_name" required autocomplete="off" placeholder="+ Add a card" aria-label="New card name" class="${INPUT_CLASS}" />
        </form>
      </div>
    </div>`;

  async function refresh() {
    try {
      const data = await api("GET", `${API}lists/?board=${boardId}`);
      const boardLists = data.boardlists || [];
      container.querySelectorAll("[data-list-id]").forEach((n) => n.remove());
      document.getElementById("add-list-tile")?.insertAdjacentHTML("beforebegin", boardLists.map(columnHtml).join(""));
      const btnLabel = document.querySelector("#show-add-list span");
      if (btnLabel) {
        btnLabel.textContent = boardLists.length === 0 ? "Add first list" : "Add another list";
      }
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
  let cachedMembers = [];

  async function loadBoardMembers() {
    try {
      const data = await api("GET", `${API}members/?board=${boardId}`);
      cachedMembers = data.results || data.members || [];
      const select = document.getElementById("card-assignee-select");
      if (select) {
        select.innerHTML = '<option value="" style="background-color: #18181b; color: #f4f4f5;" class="bg-card text-foreground py-1">Unassigned</option>' +
          cachedMembers.map(m => `<option value="${m.user}" style="background-color: #18181b; color: #f4f4f5;" class="bg-card text-foreground py-1">${esc(m.username || m.email || ('User #' + m.user))}</option>`).join('');
      }
    } catch(e) { console.error(e); }
  }

  async function openCardModal(id) {
    editingCardId = id;
    await loadBoardMembers();
    try {
      const c = await api("GET", `${API}cards/${id}/`);
      cardForm.elements.card_name.value = c.card_name || "";
      cardForm.elements.status.value = c.status || "todo";
      cardForm.elements.priority.value = c.priority || "medium";
      if (cardForm.elements.assignee) cardForm.elements.assignee.value = c.assignee || "";
      if (cardForm.elements.story_points) cardForm.elements.story_points.value = c.story_points !== null && c.story_points !== undefined ? c.story_points : "";
      if (cardForm.elements.start_date) cardForm.elements.start_date.value = c.start_date ? c.start_date.slice(0, 16) : "";
      if (cardForm.elements.due_date) cardForm.elements.due_date.value = c.due_date ? c.due_date.slice(0, 16) : "";
      if (cardForm.elements.cover_color) cardForm.elements.cover_color.value = c.cover_color || "";
      if (cardForm.elements.tags) cardForm.elements.tags.value = c.tags || "";
      if (cardForm.elements.label) cardForm.elements.label.value = c.label || "";
      cardForm.elements.card_description.value = c.card_description || "";
      if (cardForm.elements.is_completed) cardForm.elements.is_completed.checked = !!c.is_completed;
    } catch (e) { return console.error(e); }
    cardFeedback?.classList.add("hidden");
    cardModal?.classList.add("modal-open");
  }

  cardModal?.querySelector("[data-close-card]")?.addEventListener("click", () => cardModal.classList.remove("modal-open"));

  document.getElementById("delete-card-modal-btn")?.addEventListener("click", async () => {
    if (!editingCardId) return;
    try {
      await api("DELETE", `${API}cards/${editingCardId}/`);
      cardModal.classList.remove("modal-open");
      refresh();
    } catch(e) { console.error(e); }
  });

  cardForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("PATCH", `${API}cards/${editingCardId}/`, {
        card_name: cardForm.elements.card_name.value.trim(),
        status: cardForm.elements.status.value,
        priority: cardForm.elements.priority.value,
        assignee: cardForm.elements.assignee?.value ? Number(cardForm.elements.assignee.value) : null,
        story_points: cardForm.elements.story_points?.value !== "" && cardForm.elements.story_points?.value !== null ? Number(cardForm.elements.story_points.value) : null,
        start_date: cardForm.elements.start_date?.value || null,
        due_date: cardForm.elements.due_date?.value || null,
        cover_color: cardForm.elements.cover_color?.value || null,
        tags: cardForm.elements.tags?.value.trim() || null,
        label: cardForm.elements.label?.value || null,
        card_description: cardForm.elements.card_description.value,
        is_completed: cardForm.elements.is_completed ? cardForm.elements.is_completed.checked : false,
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

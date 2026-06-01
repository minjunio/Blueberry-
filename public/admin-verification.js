const adminKeyInput = document.getElementById("adminKey");
const adminKey = adminKeyInput ? adminKeyInput.value : "";

const form = document.getElementById("machineForm");
const machinesTable = document.getElementById("machinesTable");

const editIdInput = document.getElementById("editId");
const keyNameInput = document.getElementById("keyName");
const machineInput = document.getElementById("machineInput");
const hostnameInput = document.getElementById("hostname");
const statusInput = document.getElementById("status");
const expiresAtInput = document.getElementById("expiresAt");
const foreverInput = document.getElementById("forever");
const noteInput = document.getElementById("note");

const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const uploadBtn = document.getElementById("uploadBtn");
const uploadFile = document.getElementById("uploadFile");
const importMode = document.getElementById("importMode");
const searchBox = document.getElementById("searchBox");

const viewJsonBtn = document.getElementById("viewJsonBtn");
const jsonCard = document.getElementById("jsonCard");
const jsonViewer = document.getElementById("jsonViewer");

const totalMachines = document.getElementById("totalMachines");
const activeMachines = document.getElementById("activeMachines");
const pendingMachines = document.getElementById("pendingMachines");
const badMachines = document.getElementById("badMachines");

let machinesCache = [];

function adminUrl(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}adminKey=${encodeURIComponent(adminKey)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeJsonForHtml(value) {
  return escapeHtml(JSON.stringify(value));
}

function formatDate(value) {
  if (!value) return "Forever";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function isExpiredLocal(machine) {
  if (!machine.expiresAt) return false;

  const expiryTime = new Date(machine.expiresAt).getTime();

  if (Number.isNaN(expiryTime)) return false;

  return expiryTime < Date.now();
}

function getFinalStatus(machine) {
  if (isExpiredLocal(machine)) return "expired";
  return machine.status || "unknown";
}

function updateStats() {
  const total = machinesCache.length;

  const active = machinesCache.filter(machine =>
    getFinalStatus(machine) === "active"
  ).length;

  const pending = machinesCache.filter(machine =>
    getFinalStatus(machine) === "pending"
  ).length;

  const bad = machinesCache.filter(machine => {
    const status = getFinalStatus(machine);
    return status === "blocked" || status === "expired";
  }).length;

  if (totalMachines) totalMachines.textContent = total;
  if (activeMachines) activeMachines.textContent = active;
  if (pendingMachines) pendingMachines.textContent = pending;
  if (badMachines) badMachines.textContent = bad;
}

async function fetchJson(url, options = {}) {
  const res = await fetch(adminUrl(url), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await res.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || "Invalid server response" };
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.reason || "Request failed");
  }

  return data;
}

async function loadMachines() {
  machinesTable.innerHTML = `
    <tr>
      <td colspan="7">Loading...</td>
    </tr>
  `;

  try {
    const data = await fetchJson("/api/admin/machines");
    machinesCache = Array.isArray(data) ? data : [];
    renderMachines();
  } catch (err) {
    machinesTable.innerHTML = `
      <tr>
        <td colspan="7">${escapeHtml(err.message)}</td>
      </tr>
    `;
  }
}

function renderMachines() {
  updateStats();

  const searchText = searchBox ? searchBox.value.trim().toLowerCase() : "";

  const filtered = machinesCache.filter(machine => {
    const joined = [
      machine.keyName,
      machine.hostname,
      machine.note,
      machine.status,
      machine.city,
      machine.country,
      machine.os,
      machine.lastIp
    ].join(" ").toLowerCase();

    return joined.includes(searchText);
  });

  if (filtered.length === 0) {
    machinesTable.innerHTML = `
      <tr>
        <td colspan="7">No keys found.</td>
      </tr>
    `;
    return;
  }

  machinesTable.innerHTML = filtered.map(machine => {
    const status = getFinalStatus(machine);
    const statusClass = `status-${escapeHtml(status)}`;

    return `
      <tr>
        <td>
          <strong>${escapeHtml(machine.keyName || "Unnamed Key")}</strong>
          <div class="small">Hostname: ${escapeHtml(machine.hostname || "-")}</div>
          <div class="small">${escapeHtml(machine.note || "")}</div>
        </td>

        <td class="${statusClass}">
          ${escapeHtml(status)}
        </td>

        <td>
          ${escapeHtml(formatDate(machine.expiresAt))}
        </td>

        <td>
          ${escapeHtml(formatDate(machine.lastSeenAt))}
          <div class="small">IP: ${escapeHtml(machine.lastIp || "-")}</div>
        </td>

        <td>
          ${escapeHtml(machine.city || "-")}, ${escapeHtml(machine.country || "-")}
          <div class="small">OS: ${escapeHtml(machine.os || "-")}</div>
          <div class="small">Admin: ${escapeHtml(machine.isAdmin || "-")}</div>
        </td>

        <td>
          <code>${escapeHtml(machine.sessionToken || "-")}</code>
        </td>

        <td>
          <div class="actions">
            <button type="button" onclick='editMachineFromButton(this)' data-machine='${safeJsonForHtml(machine)}'>Edit</button>
            <button type="button" class="green" onclick='approveMachineFromButton(this)' data-machine='${safeJsonForHtml(machine)}'>Approve</button>
            <button type="button" class="gray" onclick="regenerateToken('${escapeHtml(machine.id)}')">New Token</button>
            <button type="button" class="red" onclick="deleteMachine('${escapeHtml(machine.id)}')">Remove</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function getMachineFromButton(button) {
  try {
    return JSON.parse(button.dataset.machine);
  } catch {
    alert("Could not read machine data");
    return null;
  }
}

function editMachineFromButton(button) {
  const machine = getMachineFromButton(button);
  if (!machine) return;
  editMachine(machine);
}

function approveMachineFromButton(button) {
  const machine = getMachineFromButton(button);
  if (!machine) return;
  quickApprove(machine);
}

function clearForm() {
  if (editIdInput) editIdInput.value = "";
  if (keyNameInput) keyNameInput.value = "";
  if (machineInput) machineInput.value = "";
  if (hostnameInput) hostnameInput.value = "";
  if (statusInput) statusInput.value = "active";
  if (expiresAtInput) expiresAtInput.value = "";
  if (foreverInput) foreverInput.checked = true;
  if (expiresAtInput) expiresAtInput.disabled = true;
  if (noteInput) noteInput.value = "";
}

function editMachine(machine) {
  editIdInput.value = machine.id || "";
  keyNameInput.value = machine.keyName || "";
  machineInput.value = "";
  hostnameInput.value = machine.hostname || "";
  statusInput.value = machine.status || "active";
  noteInput.value = machine.note || "";

  if (machine.expiresAt) {
    foreverInput.checked = false;
    expiresAtInput.disabled = false;

    const date = new Date(machine.expiresAt);

    expiresAtInput.value = Number.isNaN(date.getTime())
      ? ""
      : date.toISOString().slice(0, 16);
  } else {
    foreverInput.checked = true;
    expiresAtInput.disabled = true;
    expiresAtInput.value = "";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function quickApprove(machine) {
  try {
    await fetchJson("/api/admin/machines", {
      method: "POST",
      body: JSON.stringify({
        id: machine.id,
        keyName: machine.keyName || "Approved Key",
        machineInput: "",
        hostname: machine.hostname || "",
        note: machine.note || "",
        status: "active",
        forever: true,
        expiresAt: null
      })
    });

    await loadMachines();
  } catch (err) {
    alert(err.message || "Failed to approve key");
  }
}

async function deleteMachine(id) {
  if (!confirm("Remove this key?")) return;

  try {
    await fetchJson(`/api/admin/machines/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    await loadMachines();
  } catch (err) {
    alert(err.message || "Failed to remove key");
  }
}

async function regenerateToken(id) {
  if (!confirm("Regenerate session token?")) return;

  try {
    await fetchJson(`/api/admin/machines/${encodeURIComponent(id)}/regenerate-token`, {
      method: "POST"
    });

    await loadMachines();
  } catch (err) {
    alert(err.message || "Failed to regenerate token");
  }
}

if (form) {
  form.addEventListener("submit", async event => {
    event.preventDefault();

    let expiresAt = null;

    if (!foreverInput.checked && expiresAtInput.value) {
      expiresAt = new Date(expiresAtInput.value).toISOString();
    }

    const payload = {
      id: editIdInput.value,
      keyName: keyNameInput.value.trim(),
      machineInput: machineInput.value.trim(),
      hostname: hostnameInput.value.trim(),
      status: statusInput.value,
      note: noteInput.value.trim(),
      forever: foreverInput.checked,
      expiresAt
    };

    if (!payload.keyName) {
      alert("Enter a key name");
      return;
    }

    if (!payload.id && !payload.machineInput) {
      alert("Enter a machine ID");
      return;
    }

    try {
      await fetchJson("/api/admin/machines", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      clearForm();
      await loadMachines();
    } catch (err) {
      alert(err.message || "Failed to save key");
    }
  });
}

if (foreverInput) {
  foreverInput.addEventListener("change", () => {
    expiresAtInput.disabled = foreverInput.checked;

    if (foreverInput.checked) {
      expiresAtInput.value = "";
    }
  });
}

if (clearBtn) {
  clearBtn.addEventListener("click", clearForm);
}

if (searchBox) {
  searchBox.addEventListener("input", renderMachines);
}

if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    window.location.href = adminUrl("/api/admin/machines/export");
  });
}

if (uploadBtn && uploadFile) {
  uploadBtn.addEventListener("click", () => {
    uploadFile.click();
  });
}

if (uploadFile) {
  uploadFile.addEventListener("change", async () => {
    const file = uploadFile.files[0];

    if (!file) return;

    let parsed;

    try {
      const text = await file.text();
      parsed = JSON.parse(text);
    } catch {
      alert("Invalid JSON file");
      uploadFile.value = "";
      return;
    }

    if (!parsed || !Array.isArray(parsed.machines)) {
      alert("JSON must contain a machines array");
      uploadFile.value = "";
      return;
    }

    const mode = importMode ? importMode.value : "merge";

    if (mode === "replace") {
      const ok = confirm("Replace current JSON list?");
      if (!ok) {
        uploadFile.value = "";
        return;
      }
    }

    try {
      await fetchJson("/api/admin/machines/import", {
        method: "POST",
        body: JSON.stringify({
          mode,
          importData: JSON.stringify(parsed)
        })
      });

      alert("Import complete");
      uploadFile.value = "";
      await loadMachines();
    } catch (err) {
      alert(err.message || "Import failed");
      uploadFile.value = "";
    }
  });
}

if (viewJsonBtn && jsonCard && jsonViewer) {
  viewJsonBtn.addEventListener("click", async () => {
    if (!jsonCard.classList.contains("hidden")) {
      jsonCard.classList.add("hidden");
      return;
    }

    jsonCard.classList.remove("hidden");
    jsonViewer.textContent = "Loading...";

    try {
      const res = await fetch(adminUrl("/api/admin/machines/json"));
      const text = await res.text();

      if (!res.ok) {
        jsonViewer.textContent = text || "Failed to load JSON";
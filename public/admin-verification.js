const adminKey = document.getElementById("adminKey").value;

const form = document.getElementById("machineForm");
const machinesTable = document.getElementById("machinesTable");

const editIdInput = document.getElementById("editId");
const keyNameInput = document.getElementById("keyName");
const machineInput = document.getElementById("machineInput");
const displayKeyInput = document.getElementById("displayKey");
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

function formatDate(value) {
  if (!value) return "Forever";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString();
}

function isExpiredLocal(machine) {
  if (!machine.expiresAt) return false;

  const t = new Date(machine.expiresAt).getTime();

  if (Number.isNaN(t)) return false;

  return t < Date.now();
}

function updateStats() {
  const total = machinesCache.length;

  const active = machinesCache.filter(m =>
    m.status === "active" && !isExpiredLocal(m)
  ).length;

  const pending = machinesCache.filter(m => m.status === "pending").length;

  const bad = machinesCache.filter(m =>
    m.status === "blocked" ||
    m.status === "expired" ||
    isExpiredLocal(m)
  ).length;

  totalMachines.textContent = total;
  activeMachines.textContent = active;
  pendingMachines.textContent = pending;
  badMachines.textContent = bad;
}

async function loadMachines() {
  machinesTable.innerHTML = `
    <tr>
      <td colspan="7">Loading...</td>
    </tr>
  `;

  const res = await fetch(adminUrl("/api/admin/machines"));
  const data = await res.json();

  machinesCache = Array.isArray(data) ? data : [];

  renderMachines();
}

function renderMachines() {
  updateStats();

  const q = searchBox.value.trim().toLowerCase();

  const filtered = machinesCache.filter(machine => {
    const text = [
      machine.keyName,
      machine.displayKey,
      machine.hostname,
      machine.note,
      machine.status,
      machine.city,
      machine.country,
      machine.os,
      machine.lastIp
    ].join(" ").toLowerCase();

    return text.includes(q);
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
    const expired = isExpiredLocal(machine);
    const status = expired ? "expired" : machine.status;
    const statusClass = `status-${escapeHtml(status)}`;

    return `
      <tr>
        <td>
          <strong>${escapeHtml(machine.keyName || "Unnamed Key")}</strong>
          <div class="small">Display Key:</div>
          <code>${escapeHtml(machine.displayKey || "-")}</code>
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
            <button onclick='editMachine(${JSON.stringify(machine).replaceAll("'", "&apos;")})'>Edit</button>
            <button class="green" onclick='quickApprove(${JSON.stringify(machine).replaceAll("'", "&apos;")})'>Approve</button>
            <button class="gray" onclick="regenerateToken('${escapeHtml(machine.id)}')">New Token</button>
            <button class="red" onclick="deleteMachine('${escapeHtml(machine.id)}')">Remove</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function clearForm() {
  editIdInput.value = "";
  keyNameInput.value = "";
  machineInput.value = "";
  displayKeyInput.value = "";
  hostnameInput.value = "";
  statusInput.value = "active";
  expiresAtInput.value = "";
  foreverInput.checked = true;
  expiresAtInput.disabled = true;
  noteInput.value = "";
}

function editMachine(machine) {
  editIdInput.value = machine.id || "";
  keyNameInput.value = machine.keyName || "";
  machineInput.value = "";
  displayKeyInput.value = machine.displayKey || "";
  hostnameInput.value = machine.hostname || "";
  statusInput.value = machine.status || "active";
  noteInput.value = machine.note || "";

  if (machine.expiresAt) {
    foreverInput.checked = false;
    expiresAtInput.disabled = false;

    const d = new Date(machine.expiresAt);

    expiresAtInput.value = Number.isNaN(d.getTime())
      ? ""
      : d.toISOString().slice(0, 16);
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
  const payload = {
    id: machine.id,
    machineInput: "",
    keyName: machine.keyName || "Approved Key",
    displayKey: machine.displayKey || "",
    hostname: machine.hostname || "",
    note: machine.note || "",
    status: "active",
    forever: true,
    expiresAt: null
  };

  const res = await fetch(adminUrl("/api/admin/machines"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    alert("Failed to approve key");
    return;
  }

  await loadMachines();
}

async function deleteMachine(id) {
  if (!confirm("Remove this key?")) return;

  const res = await fetch(adminUrl(`/api/admin/machines/${encodeURIComponent(id)}`), {
    method: "DELETE"
  });

  if (!res.ok) {
    alert("Failed to remove key");
    return;
  }

  await loadMachines();
}

async function regenerateToken(id) {
  if (!confirm("Regenerate session token? Old token will stop working.")) return;

  const res = await fetch(adminUrl(`/api/admin/machines/${encodeURIComponent(id)}/regenerate-token`), {
    method: "POST"
  });

  if (!res.ok) {
    alert("Failed to regenerate token");
    return;
  }

  await loadMachines();
}

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
    displayKey: displayKeyInput.value.trim(),
    hostname: hostnameInput.value.trim(),
    status: statusInput.value,
    note: noteInput.value.trim(),
    forever: foreverInput.checked,
    expiresAt
  };

  const res = await fetch(adminUrl("/api/admin/machines"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed to save key");
    return;
  }

  clearForm();
  await loadMachines();
});

foreverInput.addEventListener("change", () => {
  expiresAtInput.disabled = foreverInput.checked;

  if (foreverInput.checked) {
    expiresAtInput.value = "";
  }
});

clearBtn.addEventListener("click", clearForm);

searchBox.addEventListener("input", renderMachines);

downloadBtn.addEventListener("click", () => {
  window.location.href = adminUrl("/api/admin/machines/export");
});

uploadBtn.addEventListener("click", () => {
  uploadFile.click();
});

uploadFile.addEventListener("change", async () => {
  const file = uploadFile.files[0];

  if (!file) return;

  const text = await file.text();

  let parsed;

  try {
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

  const mode = importMode.value;

  if (mode === "replace") {
    const ok = confirm("Replace current JSON list? This will remove current keys.");
    if (!ok) {
      uploadFile.value = "";
      return;
    }
  }

  const res = await fetch(adminUrl("/api/admin/machines/import"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      mode,
      importData: JSON.stringify(parsed)
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Import failed");
    uploadFile.value = "";
    return;
  }

  alert("Import complete");
  uploadFile.value = "";

  await loadMachines();
});

viewJsonBtn.addEventListener("click", async () => {
  if (!jsonCard.classList.contains("hidden")) {
    jsonCard.classList.add("hidden");
    return;
  }

  jsonViewer.textContent = "Loading...";
  jsonCard.classList.remove("hidden");

  const res = await fetch(adminUrl("/api/admin/machines/json"));
  const text = await res.text();

  jsonViewer.textContent = text;
});

clearForm();
loadMachines();
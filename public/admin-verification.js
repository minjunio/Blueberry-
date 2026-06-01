const adminKey = document.getElementById("adminKey").value;

const form = document.getElementById("machineForm");
const machinesTable = document.getElementById("machinesTable");

const machineIdInput = document.getElementById("machineId");
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

const totalMachines = document.getElementById("totalMachines");
const activeMachines = document.getElementById("activeMachines");
const expiredMachines = document.getElementById("expiredMachines");

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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function isExpiredLocal(machine) {
  if (!machine.expiresAt) return false;

  const expiry = new Date(machine.expiresAt).getTime();

  if (Number.isNaN(expiry)) return false;

  return expiry < Date.now();
}

function updateStats(machines) {
  const total = machines.length;

  const active = machines.filter(m =>
    m.status === "active" && !isExpiredLocal(m)
  ).length;

  const bad = machines.filter(m =>
    m.status !== "active" || isExpiredLocal(m)
  ).length;

  totalMachines.textContent = total;
  activeMachines.textContent = active;
  expiredMachines.textContent = bad;
}

async function loadMachines() {
  machinesTable.innerHTML = `
    <tr>
      <td colspan="7">Loading...</td>
    </tr>
  `;

  const res = await fetch(adminUrl("/api/admin/machines"));
  const machines = await res.json();

  machinesCache = Array.isArray(machines) ? machines : [];

  renderMachines();
}

function renderMachines() {
  const q = searchBox.value.trim().toLowerCase();

  const filtered = machinesCache.filter(machine => {
    const joined = [
      machine.machineId,
      machine.hostname,
      machine.note,
      machine.status,
      machine.city,
      machine.country,
      machine.os,
      machine.lastIp
    ].join(" ").toLowerCase();

    return joined.includes(q);
  });

  updateStats(machinesCache);

  if (filtered.length === 0) {
    machinesTable.innerHTML = `
      <tr>
        <td colspan="7">No machines found.</td>
      </tr>
    `;
    return;
  }

  machinesTable.innerHTML = filtered.map(machine => {
    const expired = isExpiredLocal(machine);
    const status = expired ? "expired" : machine.status || "unknown";
    const statusClass = `status-${escapeHtml(status)}`;

    return `
      <tr>
        <td>
          <strong>${escapeHtml(machine.hostname || "Unknown PC")}</strong>
          <div class="small">Machine ID:</div>
          <code>${escapeHtml(machine.machineId)}</code>
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
            <button class="gray" onclick="copyMachineId('${escapeHtml(machine.machineId)}')">Copy ID</button>
            <button class="gray" onclick="regenerateToken('${escapeHtml(machine.machineId)}')">New Token</button>
            <button class="red" onclick="deleteMachine('${escapeHtml(machine.machineId)}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function clearForm() {
  machineIdInput.value = "";
  hostnameInput.value = "";
  statusInput.value = "active";
  expiresAtInput.value = "";
  foreverInput.checked = true;
  noteInput.value = "";
  expiresAtInput.disabled = true;
}

function editMachine(machine) {
  machineIdInput.value = machine.machineId || "";
  hostnameInput.value = machine.hostname || "";
  statusInput.value = machine.status || "active";
  noteInput.value = machine.note || "";

  if (machine.expiresAt) {
    foreverInput.checked = false;

    const d = new Date(machine.expiresAt);

    if (!Number.isNaN(d.getTime())) {
      expiresAtInput.value = d.toISOString().slice(0, 16);
    } else {
      expiresAtInput.value = "";
    }

    expiresAtInput.disabled = false;
  } else {
    foreverInput.checked = true;
    expiresAtInput.value = "";
    expiresAtInput.disabled = true;
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function copyMachineId(machineId) {
  try {
    await navigator.clipboard.writeText(machineId);
    alert("Machine ID copied");
  } catch {
    prompt("Copy machine ID:", machineId);
  }
}

async function deleteMachine(machineId) {
  if (!confirm("Delete this machine?")) return;

  const res = await fetch(adminUrl(`/api/admin/machines/${encodeURIComponent(machineId)}`), {
    method: "DELETE"
  });

  if (!res.ok) {
    alert("Failed to delete machine");
    return;
  }

  await loadMachines();
}

async function regenerateToken(machineId) {
  if (!confirm("Regenerate token? The old token will stop working.")) return;

  const res = await fetch(adminUrl(`/api/admin/machines/${encodeURIComponent(machineId)}/regenerate-token`), {
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
    machineId: machineIdInput.value.trim(),
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
    alert(data.error || "Failed to save machine");
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
    const ok = confirm("Replace current list with uploaded list? This will delete current machines.");
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

clearForm();
loadMachines();
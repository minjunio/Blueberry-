const form = document.getElementById("machineForm");
const machinesTable = document.getElementById("machinesTable");

const editIdInput = document.getElementById("editId");
const keyNameInput = document.getElementById("keyName");
const rawSerialInput = document.getElementById("rawSerial"); // Added new field
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

function statusClass(status) {
    if (status === "active") return "text-green-600";
    if (status === "pending") return "text-yellow-500";
    if (status === "blocked" || status === "expired") return "text-red-500";
    return "text-gray-500";
}

async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
        credentials: "include",
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const text = await res.text();

    let data;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { error: text || "Invalid server response" };
    }

    if (!res.ok) {
        throw new Error(data?.error || data?.reason || text || "Request failed");
    }

    return data;
}

function updateStats() {
    const total = machinesCache.length;

    const active = machinesCache.filter(machine => getFinalStatus(machine) === "active").length;
    const pending = machinesCache.filter(machine => getFinalStatus(machine) === "pending").length;

    const bad = machinesCache.filter(machine => {
        const status = getFinalStatus(machine);
        return status === "blocked" || status === "expired";
    }).length;

    totalMachines.textContent = total;
    activeMachines.textContent = active;
    pendingMachines.textContent = pending;
    badMachines.textContent = bad;
}

async function loadMachines() {
    machinesTable.innerHTML = `
        <tr>
            <td colspan="7" class="p-4 text-sm font-bold text-gray-400">Loading...</td>
        </tr>
    `;

    try {
        const data = await fetchJson("/api/admin/whitelist/machines");
        machinesCache = Array.isArray(data) ? data : [];
        renderMachines();
    } catch (err) {
        machinesTable.innerHTML = `
            <tr>
                <td colspan="7" class="p-4 text-sm font-bold text-red-500">
                    ${escapeHtml(err.message)}
                </td>
            </tr>
        `;
    }
}

function renderMachines() {
    updateStats();

    const q = searchBox.value.trim().toLowerCase();

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

        return joined.includes(q);
    });

    if (filtered.length === 0) {
        machinesTable.innerHTML = `
            <tr>
                <td colspan="7" class="p-4 text-sm font-bold text-gray-400">No keys found.</td>
            </tr>
        `;
        return;
    }

    machinesTable.innerHTML = filtered.map(machine => {
        const status = getFinalStatus(machine);

        return `
            <tr class="border-b-2 border-gray-100">
                <td class="p-3">
                    <div class="font-black text-gray-900">${escapeHtml(machine.keyName || "Unnamed Key")}</div>
                    <div class="text-xs text-blue-600 font-bold mt-0.5 bg-blue-50 inline-block px-2 py-0.5 rounded-md break-all">Serial/Note: ${escapeHtml(machine.note || "None Saved")}</div>
                    <div class="text-xs font-bold text-gray-400 mt-1">Hostname: ${escapeHtml(machine.hostname || "-")}</div>
                    <div class="text-[10px] text-gray-400 font-mono mt-1 break-all" title="${escapeHtml(machine.machineIdHash || machine.id)}">Hash: ${escapeHtml(machine.machineIdHash || machine.id).substring(0, 16)}...</div>
                </td>

                <td class="p-3 font-black ${statusClass(status)}">${escapeHtml(status)}</td>

                <td class="p-3 text-sm font-bold text-gray-600">${escapeHtml(formatDate(machine.expiresAt))}</td>

                <td class="p-3 text-sm font-bold text-gray-600">
                    ${escapeHtml(formatDate(machine.lastSeenAt))}
                </td>

                <td class="p-3">
                    <div class="font-black text-gray-900">${escapeHtml(machine.lastIp || "0.0.0.0")}</div>
                    <div class="text-xs text-gray-500 font-bold mt-0.5">${escapeHtml(machine.city || "-")}, ${escapeHtml(machine.country || "-")}</div>
                    <div class="text-[10px] text-gray-400 mt-1">OS: ${escapeHtml(machine.os || "-")} | Admin: ${escapeHtml(machine.isAdmin || "-")}</div>
                </td>

                <td class="p-3">
                    <code class="text-xs bg-gray-100 text-gray-700 rounded-lg px-2 py-1 break-all">
                        ${escapeHtml(machine.sessionToken || "-")}
                    </code>
                </td>

                <td class="p-3">
                    <div class="flex flex-wrap gap-2">
                        <button type="button" onclick="editMachineFromButton(this)" data-machine="${safeJsonForHtml(machine)}" class="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-blue-500 hover:text-white transition">Edit</button>

                        <button type="button" onclick="approveMachineFromButton(this)" data-machine="${safeJsonForHtml(machine)}" class="bg-green-100 text-green-600 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-green-500 hover:text-white transition">Approve</button>

                        <button type="button" onclick="regenerateToken('${escapeHtml(machine.id)}')" class="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-gray-800 hover:text-white transition">New Token</button>

                        <button type="button" onclick="deleteMachine('${escapeHtml(machine.id)}')" class="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-red-500 hover:text-white transition">Remove</button>
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

    editIdInput.value = machine.id || "";
    keyNameInput.value = machine.keyName || "";
    machineInput.value = "";
    hostnameInput.value = machine.hostname || "";
    statusInput.value = machine.status || "active";
    noteInput.value = machine.note || "";
    
    // Clear out the raw serial helper when editing
    if (rawSerialInput) rawSerialInput.value = "";

    if (machine.expiresAt) {
        foreverInput.checked = false;
        expiresAtInput.disabled = false;

        const date = new Date(machine.expiresAt);
        expiresAtInput.value = Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
    } else {
        foreverInput.checked = true;
        expiresAtInput.disabled = true;
        expiresAtInput.value = "";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function approveMachineFromButton(button) {
    const machine = getMachineFromButton(button);
    if (!machine) return;

    try {
        await fetchJson("/api/admin/whitelist/machines", {
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

function clearForm() {
    editIdInput.value = "";
    keyNameInput.value = "";
    if (rawSerialInput) rawSerialInput.value = "";
    machineInput.value = "";
    hostnameInput.value = "";
    statusInput.value = "active";
    expiresAtInput.value = "";
    foreverInput.checked = true;
    expiresAtInput.disabled = true;
    noteInput.value = "";
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
        await fetchJson("/api/admin/whitelist/machines", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        clearForm();
        await loadMachines();
    } catch (err) {
        alert(err.message || "Failed to save key");
    }
});

async function deleteMachine(id) {
    if (!confirm("Remove this key?")) return;

    try {
        await fetchJson(`/api/admin/whitelist/machines/${encodeURIComponent(id)}`, {
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
        await fetchJson(`/api/admin/whitelist/machines/${encodeURIComponent(id)}/regenerate-token`, {
            method: "POST"
        });

        await loadMachines();
    } catch (err) {
        alert(err.message || "Failed to regenerate token");
    }
}

foreverInput.addEventListener("change", () => {
    expiresAtInput.disabled = foreverInput.checked;

    if (foreverInput.checked) {
        expiresAtInput.value = "";
    }
});

clearBtn.addEventListener("click", clearForm);

searchBox.addEventListener("input", renderMachines);

downloadBtn.addEventListener("click", () => {
    window.location.href = "/api/admin/whitelist/export";
});

uploadBtn.addEventListener("click", () => {
    uploadFile.click();
});

uploadFile.addEventListener("change", async () => {
    const file = uploadFile.files[0];
    if (!file) return;

    let parsed;

    try {
        parsed = JSON.parse(await file.text());
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
        const ok = confirm("Replace current JSON list?");
        if (!ok) {
            uploadFile.value = "";
            return;
        }
    }

    try {
        await fetchJson("/api/admin/whitelist/import", {
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

viewJsonBtn.addEventListener("click", async () => {
    if (!jsonCard.classList.contains("hidden")) {
        jsonCard.classList.add("hidden");
        return;
    }

    jsonCard.classList.remove("hidden");
    jsonViewer.textContent = "Loading...";

    try {
        const res = await fetch("/api/admin/whitelist/json", {
            credentials: "include"
        });

        const text = await res.text();

        if (!res.ok) {
            jsonViewer.textContent = text || "Failed to load JSON";
            return;
        }

        jsonViewer.textContent = text;
    } catch (err) {
        jsonViewer.textContent = err.message || "Failed to load JSON";
    }
});

clearForm();
loadMachines();

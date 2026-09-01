/* =========================================================
   dashboard.js
   Auth-guarded overview: stats, application tracking with
   status changes, profile completeness and saved jobs.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;

  const user = Store.getCurrentUser();
  document.getElementById("dashGreeting").textContent = `Welcome back, ${
    user.name.split(" ")[0]
  }`;

  // Empty-state icons
  const appsIcon = document.getElementById("ic-apps");
  if (appsIcon) appsIcon.innerHTML = Icons.file;

  renderStats();
  renderApplications();
  renderProfileStrength();
  renderSavedMini();

  // Delegated: status change + withdraw
  document.getElementById("appsList").addEventListener("change", (e) => {
    const sel = e.target.closest("[data-status]");
    if (!sel) return;
    updateStatus(Number(sel.dataset.status), sel.value);
  });
  document.getElementById("appsList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-withdraw]");
    if (!btn) return;
    withdraw(Number(btn.dataset.withdraw));
  });
});

const STATUSES = ["Applied", "Under Review", "Interview", "Offer", "Rejected"];

function renderStats() {
  const apps = Store.getApplications();
  const saved = Store.getSavedJobs();
  const interviews = apps.filter(
    (a) => a.status === "Interview" || a.status === "Offer"
  ).length;
  const offers = apps.filter((a) => a.status === "Offer").length;

  const stats = [
    { label: "Applications", value: apps.length, icon: Icons.file, tone: "indigo" },
    { label: "Saved jobs", value: saved.length, icon: Icons.heart, tone: "rose" },
    { label: "Interviews", value: interviews, icon: Icons.briefcase, tone: "amber" },
    { label: "Offers", value: offers, icon: Icons.sparkles, tone: "green" },
  ];

  document.getElementById("statsGrid").innerHTML = stats
    .map(
      (s) => `
    <div class="stat-card stat-${s.tone}">
      <span class="stat-ic">${s.icon}</span>
      <div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    </div>`
    )
    .join("");
}

function renderApplications() {
  const apps = Store.getApplications()
    .slice()
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  const list = document.getElementById("appsList");
  const empty = document.getElementById("appsEmpty");
  document.getElementById("appCountLabel").textContent = apps.length
    ? `${apps.length} total`
    : "";

  if (!apps.length) {
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  list.innerHTML = apps
    .map((a) => {
      const options = STATUSES.map(
        (s) => `<option value="${s}" ${s === a.status ? "selected" : ""}>${s}</option>`
      ).join("");
      return `
      <div class="app-row">
        ${companyLogo(a.company, "app-logo")}
        <div class="app-main">
          <h3>${escapeHtml(a.title)}</h3>
          <p class="muted">${escapeHtml(a.company)} &middot; ${escapeHtml(a.location)}</p>
          <span class="app-date">Applied ${formatDate(a.appliedAt)}</span>
        </div>
        <div class="app-actions">
          <span class="status-dot status-${slug(a.status)}" aria-hidden="true"></span>
          <select class="status-select" data-status="${a.jobId}" aria-label="Application status">
            ${options}
          </select>
          <button class="icon-btn" data-withdraw="${a.jobId}" title="Withdraw application" aria-label="Withdraw application">${Icons.close}</button>
        </div>
      </div>`;
    })
    .join("");
}

function updateStatus(jobId, status) {
  const apps = Store.getApplications();
  const app = apps.find((a) => a.jobId === jobId);
  if (!app) return;
  app.status = status;
  Store.set(Store.keys.applications, apps);
  renderStats();
  // update dot without full re-render
  const row = document
    .querySelector(`[data-status="${jobId}"]`)
    .closest(".app-row");
  const dot = row.querySelector(".status-dot");
  dot.className = `status-dot status-${slug(status)}`;
  toast(`Status updated to "${status}".`, "success");
}

function withdraw(jobId) {
  const apps = Store.getApplications().filter((a) => a.jobId !== jobId);
  Store.set(Store.keys.applications, apps);
  renderApplications();
  renderStats();
  toast("Application withdrawn.", "success");
}

function renderProfileStrength() {
  const profile = Store.getProfile() || {};
  const fields = ["name", "email", "phone", "title", "location", "about"];
  let filled = fields.filter((f) => profile[f] && String(profile[f]).trim()).length;
  if (profile.skills && profile.skills.length) filled += 1;
  if (Store.getResume()) filled += 1;
  const total = fields.length + 2;
  const pct = Math.round((filled / total) * 100);

  const ring = document.getElementById("profileRing");
  ring.style.background = `conic-gradient(var(--brand) ${pct}%, var(--line) 0)`;
  document.getElementById("profilePct").textContent = pct + "%";

  const hint = document.getElementById("profileHint");
  if (pct >= 100) hint.textContent = "Your profile is complete. Nice work!";
  else if (pct >= 60) hint.textContent = "Almost there — add a few more details.";
  else hint.textContent = "Complete your profile to stand out to employers.";
}

function renderSavedMini() {
  const ids = Store.getSavedJobs().slice(0, 4);
  const jobs = ids.map((id) => Store.getJobById(id)).filter(Boolean);
  const wrap = document.getElementById("savedMini");
  const empty = document.getElementById("savedMiniEmpty");

  if (!jobs.length) {
    wrap.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  wrap.innerHTML = jobs
    .map(
      (j) => `
    <a class="saved-mini-row" href="jobs.html?job=${j.id}">
      ${companyLogo(j.company, "mini-logo")}
      <div>
        <h4>${escapeHtml(j.title)}</h4>
        <p class="muted">${escapeHtml(j.company)}</p>
      </div>
    </a>`
    )
    .join("");
}

/* ---- small utils ---- */
function slug(s) {
  return String(s).toLowerCase().replace(/\s+/g, "-");
}
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

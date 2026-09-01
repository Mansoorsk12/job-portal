/* =========================================================
   jobs.js
   Browse page: search, multi-facet filtering, sorting,
   detail modal and the apply flow.
   ========================================================= */

const JobsPage = {
  all: [],
  filtered: [],
  filters: {
    q: "",
    loc: "",
    type: new Set(),
    mode: new Set(),
    exp: new Set(),
    location: new Set(),
    skills: new Set(),
  },
  sort: "recent",
  currentJobId: null,
};

document.addEventListener("DOMContentLoaded", () => {
  // Icons
  const setIcon = (id, svg) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = svg;
  };
  setIcon("ic-search", Icons.search);
  setIcon("ic-pin", Icons.pin);
  setIcon("ic-close-apply", Icons.close);

  JobsPage.all = Store.getJobs();

  buildFilterOptions();
  applyUrlParams();
  bindEvents();
  runFilters();

  // Open a specific job if ?job= is present.
  const params = new URLSearchParams(location.search);
  if (params.get("job")) {
    openJobModal(Number(params.get("job")));
  }
});

/* ---- Build filter checkboxes from the data ---- */
function buildFilterOptions() {
  const jobs = JobsPage.all;
  const uniq = (arr) => [...new Set(arr)];

  const types = uniq(jobs.map((j) => j.type));
  const modes = uniq(jobs.map((j) => j.mode));
  const exps = [
    "Fresher",
    "0-2 Years",
    "1-3 Years",
    "2-5 Years",
    "3-5 Years",
    "5+ Years",
  ].filter((e) => jobs.some((j) => j.experience === e));
  const locations = uniq(jobs.map((j) => j.location)).sort();
  const skills = uniq(jobs.flatMap((j) => j.skills)).sort();

  const render = (containerId, values, group) => {
    document.getElementById(containerId).innerHTML = values
      .map(
        (v) => `
      <label class="check">
        <input type="checkbox" value="${escapeHtml(v)}" data-group="${group}" />
        <span>${escapeHtml(v)}</span>
      </label>`
      )
      .join("");
  };

  render("fType", types, "type");
  render("fMode", modes, "mode");
  render("fExp", exps, "exp");
  render("fLoc", locations, "location");
  render("fSkills", skills.slice(0, 14), "skills");
}

/* ---- Seed filters from URL (?q, ?loc, ?exp, ?company) ---- */
function applyUrlParams() {
  const p = new URLSearchParams(location.search);
  if (p.get("q")) {
    JobsPage.filters.q = p.get("q");
    document.getElementById("kw").value = p.get("q");
  }
  if (p.get("loc")) {
    JobsPage.filters.loc = p.get("loc");
    document.getElementById("loc").value = p.get("loc");
  }
  if (p.get("exp")) {
    const exp = p.get("exp");
    const cb = document.querySelector(
      `input[data-group="exp"][value="${CSS.escape(exp)}"]`
    );
    if (cb) {
      cb.checked = true;
      JobsPage.filters.exp.add(exp);
    }
  }
  if (p.get("company")) {
    // Company acts like a keyword match.
    JobsPage.filters.q = p.get("company");
    document.getElementById("kw").value = p.get("company");
  }
}

/* ---- Events ---- */
function bindEvents() {
  // Search form
  document.getElementById("jobSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    JobsPage.filters.q = document.getElementById("kw").value.trim();
    JobsPage.filters.loc = document.getElementById("loc").value.trim();
    if (JobsPage.filters.q) Store.addRecentSearch(JobsPage.filters.q);
    runFilters();
  });

  // Checkbox filters (delegated)
  document.getElementById("filters").addEventListener("change", (e) => {
    const cb = e.target.closest('input[type="checkbox"]');
    if (!cb) return;
    const set = JobsPage.filters[cb.dataset.group];
    if (cb.checked) set.add(cb.value);
    else set.delete(cb.value);
    runFilters();
  });

  // Clear filters
  document.getElementById("clearFilters").addEventListener("click", () => {
    ["type", "mode", "exp", "location", "skills"].forEach((g) =>
      JobsPage.filters[g].clear()
    );
    JobsPage.filters.q = "";
    JobsPage.filters.loc = "";
    document.getElementById("kw").value = "";
    document.getElementById("loc").value = "";
    document
      .querySelectorAll('#filters input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    runFilters();
  });

  // Sort
  document.getElementById("sort").addEventListener("change", (e) => {
    JobsPage.sort = e.target.value;
    renderResults();
  });

  // Mobile filter toggle
  document.getElementById("filterToggle").addEventListener("click", () => {
    document.getElementById("filters").classList.toggle("mobile-open");
  });

  // Save buttons + re-render nothing extra needed
  wireGlobalSaveButtons();

  // View details (delegated)
  document.getElementById("jobsList").addEventListener("click", (e) => {
    const view = e.target.closest("[data-view]");
    if (view) openJobModal(Number(view.dataset.view));
  });

  // Modal close handlers
  setupModal("jobModal");
  setupModal("applyModal", "[data-close-apply]");

  // Apply form
  document.getElementById("applyForm").addEventListener("submit", submitApply);

  // Resume file label feedback
  document.getElementById("apResume").addEventListener("change", (e) => {
    const name = e.target.files[0]?.name;
    document.getElementById("apResumeLabel").textContent = name
      ? `Attached: ${name}`
      : "Click to attach your resume (PDF, DOC)";
  });
}

/* ---- Core filtering ---- */
function runFilters() {
  const f = JobsPage.filters;
  const q = f.q.toLowerCase();
  const loc = f.loc.toLowerCase();

  JobsPage.filtered = JobsPage.all.filter((j) => {
    // Keyword: title, company or skills
    if (q) {
      const hay = (
        j.title +
        " " +
        j.company +
        " " +
        j.skills.join(" ")
      ).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (loc && !j.location.toLowerCase().includes(loc)) return false;
    if (f.type.size && !f.type.has(j.type)) return false;
    if (f.mode.size && !f.mode.has(j.mode)) return false;
    if (f.exp.size && !f.exp.has(j.experience)) return false;
    if (f.location.size && !f.location.has(j.location)) return false;
    if (f.skills.size && !j.skills.some((s) => f.skills.has(s))) return false;
    return true;
  });

  renderResults();
}

function renderResults() {
  const list = JobsPage.filtered.slice();

  switch (JobsPage.sort) {
    case "salary-high":
      list.sort((a, b) => b.salaryMin - a.salaryMin);
      break;
    case "salary-low":
      list.sort((a, b) => a.salaryMin - b.salaryMin);
      break;
    case "title":
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      list.sort((a, b) => a.postedDays - b.postedDays);
  }

  const wrap = document.getElementById("jobsList");
  document.getElementById("resultCount").textContent = list.length;

  if (!list.length) {
    wrap.innerHTML = `
      <div class="empty">
        <div class="empty-ic">${Icons.search}</div>
        <h3>No jobs match your filters</h3>
        <p>Try removing some filters or searching for a different keyword.</p>
        <button class="btn btn-primary" onclick="document.getElementById('clearFilters').click()">Clear all filters</button>
      </div>`;
    return;
  }

  wrap.innerHTML = list.map(jobCardHTML).join("");
}

/* ---- Job detail modal ---- */
function openJobModal(id) {
  const job = Store.getJobById(id);
  if (!job) return;
  JobsPage.currentJobId = id;
  const saved = Store.isSaved(id);
  const applied = Store.hasApplied(id);

  document.getElementById("modalContent").innerHTML = `
    <div class="modal-header" style="padding:0 0 20px;border-bottom:1px solid var(--line);margin-bottom:20px">
      ${companyLogo(job.company)}
      <div class="modal-title">
        <h2 id="modalTitle">${escapeHtml(job.title)}</h2>
        <span class="company-name">${escapeHtml(job.company)} &middot; ${escapeHtml(
    job.location
  )}</span>
      </div>
      <button class="modal-close" data-close aria-label="Close">${Icons.close}</button>
    </div>

    <div class="tags">${job.skills
      .map((s) => `<span class="tag">${escapeHtml(s)}</span>`)
      .join("")}</div>

    <div class="detail-grid">
      <div class="d-item"><span>Experience</span><b>${escapeHtml(
        job.experience
      )}</b></div>
      <div class="d-item"><span>Salary</span><b>${escapeHtml(
        job.salary
      )}</b></div>
      <div class="d-item"><span>Job Type</span><b>${escapeHtml(
        job.type
      )}</b></div>
      <div class="d-item"><span>Work Mode</span><b>${escapeHtml(
        job.mode
      )}</b></div>
      <div class="d-item"><span>Posted</span><b>${escapeHtml(
        job.posted
      )}</b></div>
    </div>

    <div class="detail-section">
      <h4>About the role</h4>
      <p>${escapeHtml(job.description)}</p>
    </div>
    <div class="detail-section">
      <h4>Responsibilities</h4>
      <ul>${job.responsibilities
        .map((r) => `<li>${escapeHtml(r)}</li>`)
        .join("")}</ul>
    </div>
    <div class="detail-section">
      <h4>Requirements</h4>
      <ul>${job.requirements
        .map((r) => `<li>${escapeHtml(r)}</li>`)
        .join("")}</ul>
    </div>
    <div class="detail-section">
      <h4>Benefits</h4>
      <ul>${job.benefits
        .map((r) => `<li>${escapeHtml(r)}</li>`)
        .join("")}</ul>
    </div>

    <div class="modal-footer" style="padding:18px 0 0;margin-top:22px">
      <button class="btn btn-primary" id="modalApply" ${
        applied ? "disabled" : ""
      }>${applied ? "Already Applied" : "Apply Now"}</button>
      <button class="btn ${
        saved ? "btn-primary" : "btn-outline"
      }" id="modalSave" data-save="${job.id}">
        ${saved ? "Saved" : "Save Job"}
      </button>
    </div>`;

  // wire modal-specific buttons
  const applyBtn = document.getElementById("modalApply");
  if (applyBtn && !applied) {
    applyBtn.addEventListener("click", () => {
      closeModal("jobModal");
      openApplyModal(job);
    });
  }
  document.getElementById("modalSave").addEventListener("click", (e) => {
    const nowSaved = Store.isSaved(job.id);
    e.currentTarget.textContent = nowSaved ? "Saved" : "Save Job";
    e.currentTarget.classList.toggle("btn-primary", nowSaved);
    e.currentTarget.classList.toggle("btn-outline", !nowSaved);
    // update any matching card
    const card = document.querySelector(`[data-save="${job.id}"].save-btn`);
    if (card) card.classList.toggle("saved", nowSaved);
  });

  document
    .querySelector("#jobModal [data-close]")
    .addEventListener("click", () => closeModal("jobModal"));

  openModal("jobModal");
}

/* ---- Apply flow ---- */
function openApplyModal(job) {
  if (!Store.getCurrentUser()) {
    toast("Please log in to apply for jobs.", "error");
    setTimeout(() => (window.location.href = "login.html?redirect=jobs.html"), 900);
    return;
  }
  JobsPage.currentJobId = job.id;
  document.getElementById("applyFor").textContent = `${job.title} at ${job.company}`;

  // Prefill from profile / current user.
  const user = Store.getCurrentUser();
  const profile = Store.getProfile() || {};
  document.getElementById("apName").value = profile.name || user.name || "";
  document.getElementById("apEmail").value = profile.email || user.email || "";
  document.getElementById("apPhone").value = profile.phone || "";

  openModal("applyModal");
}

function submitApply(e) {
  e.preventDefault();
  const fields = [
    ["apName", (v) => v.trim().length >= 2],
    ["apEmail", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
    ["apPhone", (v) => /^[0-9+\-\s]{10,15}$/.test(v.trim())],
  ];
  let ok = true;
  fields.forEach(([id, test]) => {
    const input = document.getElementById(id);
    const field = input.closest(".field");
    if (!test(input.value)) {
      field.classList.add("invalid");
      ok = false;
    } else {
      field.classList.remove("invalid");
    }
  });
  if (!ok) return;

  const job = Store.getJobById(JobsPage.currentJobId);
  Store.addApplication({
    jobId: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    appliedAt: new Date().toISOString(),
    status: "Applied",
    name: document.getElementById("apName").value.trim(),
    email: document.getElementById("apEmail").value.trim(),
    phone: document.getElementById("apPhone").value.trim(),
    cover: document.getElementById("apCover").value.trim(),
  });

  closeModal("applyModal");
  document.getElementById("applyForm").reset();
  document.getElementById("apResumeLabel").textContent =
    "Click to attach your resume (PDF, DOC)";
  toast("Application submitted successfully!", "success");
}

/* ---- Modal utilities ---- */
function openModal(id) {
  const m = document.getElementById(id);
  m.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.body.style.overflow = "";
}
function setupModal(id, closeSel) {
  const overlay = document.getElementById(id);
  // click outside closes
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal(id);
  });
  if (closeSel) {
    overlay
      .querySelectorAll(closeSel)
      .forEach((btn) => btn.addEventListener("click", () => closeModal(id)));
  }
  // Esc closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open"))
      closeModal(id);
  });
}

/* =========================================================
   saved-jobs.js
   Standalone page that lists the user's saved jobs and lets
   them unsave or view details. Reuses shared helpers from
   app.js (jobCardHTML, companyLogo, Icons, toast).
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const emptyIcon = document.getElementById("ic-empty");
  if (emptyIcon) emptyIcon.innerHTML = Icons.heart;

  render();

  // Delegated save-toggle: when a job is unsaved from here, re-render.
  wireGlobalSaveButtons(() => render());

  // View details (delegated)
  document.getElementById("savedGrid").addEventListener("click", (e) => {
    const view = e.target.closest("[data-view]");
    if (view) openDetail(Number(view.dataset.view));
  });

  // Modal outside-click + Esc close
  const overlay = document.getElementById("jobModal");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDetail();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeDetail();
  });
});

function render() {
  const ids = Store.getSavedJobs();
  const jobs = ids.map((id) => Store.getJobById(id)).filter(Boolean);
  const grid = document.getElementById("savedGrid");
  const empty = document.getElementById("savedEmpty");

  document.getElementById("savedCount").textContent = jobs.length;

  if (!jobs.length) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.innerHTML = jobs.map(jobCardHTML).join("");
}

/* ---- Detail modal (lightweight, read-only + apply link) ---- */
function openDetail(id) {
  const job = Store.getJobById(id);
  if (!job) return;
  const applied = Store.hasApplied(id);

  document.getElementById("jobModalContent").innerHTML = `
    <div class="modal-header" style="padding:0 0 20px;border-bottom:1px solid var(--line);margin-bottom:20px">
      ${companyLogo(job.company)}
      <div class="modal-title">
        <h2 id="jobModalTitle">${escapeHtml(job.title)}</h2>
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
      <div class="d-item"><span>Experience</span><b>${escapeHtml(job.experience)}</b></div>
      <div class="d-item"><span>Salary</span><b>${escapeHtml(job.salary)}</b></div>
      <div class="d-item"><span>Job Type</span><b>${escapeHtml(job.type)}</b></div>
      <div class="d-item"><span>Work Mode</span><b>${escapeHtml(job.mode)}</b></div>
      <div class="d-item"><span>Posted</span><b>${escapeHtml(job.posted)}</b></div>
    </div>

    <div class="detail-section">
      <h4>About the role</h4>
      <p>${escapeHtml(job.description)}</p>
    </div>
    <div class="detail-section">
      <h4>Responsibilities</h4>
      <ul>${job.responsibilities.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
    </div>
    <div class="detail-section">
      <h4>Requirements</h4>
      <ul>${job.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
    </div>
    <div class="detail-section">
      <h4>Benefits</h4>
      <ul>${job.benefits.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
    </div>

    <div class="modal-footer" style="padding:18px 0 0;margin-top:22px">
      <a class="btn btn-primary" href="jobs.html?job=${job.id}">
        ${applied ? "View Application" : "Apply Now"}
      </a>
      <button class="btn btn-outline" data-save="${job.id}">Remove from saved</button>
    </div>`;

  document
    .querySelector("#jobModal [data-close]")
    .addEventListener("click", closeDetail);

  const overlay = document.getElementById("jobModal");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeDetail() {
  document.getElementById("jobModal").classList.remove("open");
  document.body.style.overflow = "";
}

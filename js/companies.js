/* =========================================================
   companies.js
   Companies listing with live open-job counts and a modal
   that lists all jobs for the selected company.
   ========================================================= */

const CompaniesPage = { jobs: [], list: [] };

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("ic-search").innerHTML = Icons.search;

  CompaniesPage.jobs = Store.getJobs();

  // Build the company list from the seed COMPANIES plus any company
  // that appears in jobs but is missing from the curated list.
  const namesInJobs = [...new Set(CompaniesPage.jobs.map((j) => j.company))];
  const known = new Map(COMPANIES.map((c) => [c.name, c]));
  namesInJobs.forEach((n) => {
    if (!known.has(n)) {
      const sample = CompaniesPage.jobs.find((j) => j.company === n);
      known.set(n, {
        name: n,
        industry: "Technology",
        location: sample ? sample.location : "Multiple",
      });
    }
  });
  CompaniesPage.list = [...known.values()];

  render(CompaniesPage.list);

  document.getElementById("companySearch").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("companyKw").value.trim().toLowerCase();
    const filtered = CompaniesPage.list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q)
    );
    render(filtered);
  });

  document.getElementById("companiesGrid").addEventListener("click", (e) => {
    const card = e.target.closest("[data-company]");
    if (card) openCompanyModal(card.dataset.company);
  });

  // modal utils
  const overlay = document.getElementById("companyModal");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.classList.remove("open");
  });

  wireGlobalSaveButtons();
});

function openCount(name) {
  return CompaniesPage.jobs.filter((j) => j.company === name).length;
}

function render(list) {
  const wrap = document.getElementById("companiesGrid");
  document.getElementById("companyCount").textContent = list.length;

  if (!list.length) {
    wrap.innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <div class="empty-ic">${Icons.building}</div>
        <h3>No companies found</h3>
        <p>Try a different search term.</p>
      </div>`;
    return;
  }

  wrap.innerHTML = list
    .map((c) => {
      const count = openCount(c.name);
      return `
      <button class="company-card" data-company="${escapeHtml(c.name)}" style="cursor:pointer">
        ${companyLogo(c.name)}
        <h3>${escapeHtml(c.name)}</h3>
        <div class="industry">${escapeHtml(c.industry)}</div>
        <div class="c-meta">${escapeHtml(c.location)} &middot; ${count} open ${
        count === 1 ? "job" : "jobs"
      }</div>
        <span class="btn btn-outline btn-sm">View Openings</span>
      </button>`;
    })
    .join("");
}

function openCompanyModal(name) {
  const jobs = CompaniesPage.jobs.filter((j) => j.company === name);
  const company =
    CompaniesPage.list.find((c) => c.name === name) || { name, industry: "" };

  const jobsHtml = jobs.length
    ? `<div class="jobs-list" style="margin-top:16px">${jobs
        .map(jobCardHTML)
        .join("")}</div>`
    : `<div class="empty" style="margin-top:16px"><div class="empty-ic">${Icons.briefcase}</div><h3>No open roles right now</h3><p>Check back soon for new openings.</p></div>`;

  document.getElementById("companyModalContent").innerHTML = `
    <div class="modal-header" style="padding:0 0 20px;border-bottom:1px solid var(--line);margin-bottom:4px">
      ${companyLogo(company.name)}
      <div class="modal-title">
        <h2 id="companyModalTitle">${escapeHtml(company.name)}</h2>
        <span class="company-name">${escapeHtml(company.industry)} &middot; ${
    jobs.length
  } open ${jobs.length === 1 ? "position" : "positions"}</span>
      </div>
      <button class="modal-close" id="closeCompany" aria-label="Close">${Icons.close}</button>
    </div>
    ${jobsHtml}`;

  document
    .getElementById("closeCompany")
    .addEventListener("click", () =>
      document.getElementById("companyModal").classList.remove("open")
    );

  // View details inside the company modal -> go to jobs page & open job
  document
    .getElementById("companyModalContent")
    .querySelectorAll("[data-view]")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        window.location.href = "jobs.html?job=" + btn.dataset.view;
      })
    );

  const overlay = document.getElementById("companyModal");
  overlay.classList.add("open");
}

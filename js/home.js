/* =========================================================
   home.js
   Home page: hero search, recent searches, popular searches,
   trending jobs and featured companies.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Fill inline icons in the search bar.
  const setIcon = (id, svg) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = svg;
  };
  setIcon("ic-search", Icons.search);
  setIcon("ic-pin", Icons.pin);
  setIcon("ic-brief", Icons.briefcase);

  const jobs = Store.getJobs();
  document.getElementById("statJobs").textContent = jobs.length;

  renderHeroArt(jobs);
  renderRecentSearches();
  renderPopularSearches();
  renderTrendingJobs(jobs);
  renderFeaturedCompanies(jobs);

  // Search -> save the term and jump to jobs page with query params.
  const form = document.getElementById("homeSearch");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const kw = document.getElementById("kw").value.trim();
    const loc = document.getElementById("loc").value.trim();
    const exp = document.getElementById("exp").value;

    // Record a friendly recent-search label.
    const label =
      kw || (loc ? `Jobs in ${loc}` : "") || (exp ? `${exp} jobs` : "");
    if (label) Store.addRecentSearch(label);

    const params = new URLSearchParams();
    if (kw) params.set("q", kw);
    if (loc) params.set("loc", loc);
    if (exp) params.set("exp", exp);
    window.location.href = "jobs.html?" + params.toString();
  });

  // Save-buttons on trending jobs.
  wireGlobalSaveButtons();

  // View details -> open the job on the jobs page.
  document.addEventListener("click", (e) => {
    const view = e.target.closest("[data-view]");
    if (view) {
      window.location.href = "jobs.html?job=" + view.dataset.view;
    }
  });
});

/* Floating cards in the hero (three most recent jobs). */
function renderHeroArt(jobs) {
  const wrap = document.getElementById("heroArt");
  if (!wrap) return;
  const picks = [...jobs]
    .sort((a, b) => a.postedDays - b.postedDays)
    .slice(0, 3);
  wrap.innerHTML = picks
    .map(
      (j) => `
      <div class="float-card">
        ${companyLogo(j.company)}
        <div>
          <strong style="font-family:var(--font-head)">${escapeHtml(
            j.title
          )}</strong>
          <div style="color:var(--muted);font-size:.85rem">${escapeHtml(
            j.company
          )} &middot; ${escapeHtml(j.location)}</div>
          <div style="color:var(--accent);font-weight:600;font-size:.85rem;margin-top:2px">${escapeHtml(
            j.salary
          )}</div>
        </div>
      </div>`
    )
    .join("");
}

/* Recent searches from LocalStorage. Click to re-run. */
function renderRecentSearches() {
  const wrap = document.getElementById("recentSearches");
  const recents = Store.getRecentSearches();
  if (!recents.length) {
    wrap.innerHTML = "";
    return;
  }
  wrap.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="color:var(--muted);font-size:.88rem;font-weight:600">Recent:</span>
      ${recents
        .map(
          (t) =>
            `<button class="chip" data-recent="${escapeHtml(
              t
            )}">${escapeHtml(t)}</button>`
        )
        .join("")}
      <button class="chip" id="clearRecent" style="color:var(--danger)">Clear</button>
    </div>`;

  wrap.querySelectorAll("[data-recent]").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href =
        "jobs.html?q=" + encodeURIComponent(btn.dataset.recent);
    });
  });
  const clear = document.getElementById("clearRecent");
  if (clear)
    clear.addEventListener("click", () => {
      Store.clearRecentSearches();
      renderRecentSearches();
    });
}

/* Popular searches are a curated static list of keywords. */
function renderPopularSearches() {
  const wrap = document.getElementById("popularSearches");
  const popular = [
    "Frontend Developer",
    "Java Developer",
    "Python Developer",
    "Data Analyst",
    "React",
    "DevOps Engineer",
    "Remote",
    "Fresher",
    "Full Stack Developer",
  ];
  wrap.innerHTML = popular
    .map(
      (p) =>
        `<a class="chip" href="jobs.html?q=${encodeURIComponent(
          p
        )}">${Icons.search}${escapeHtml(p)}</a>`
    )
    .join("");
}

/* Trending = the 6 most recently posted jobs. */
function renderTrendingJobs(jobs) {
  const wrap = document.getElementById("trendingJobs");
  const trending = [...jobs]
    .sort((a, b) => a.postedDays - b.postedDays)
    .slice(0, 6);
  wrap.innerHTML = trending.map(jobCardHTML).join("");
}

/* Featured companies with a live open-jobs count. */
function renderFeaturedCompanies(jobs) {
  const wrap = document.getElementById("featuredCompanies");
  const featured = COMPANIES.slice(0, 6);
  wrap.innerHTML = featured
    .map((c) => {
      const count = jobs.filter((j) => j.company === c.name).length;
      return `
      <a class="company-card" href="jobs.html?company=${encodeURIComponent(
        c.name
      )}">
        ${companyLogo(c.name)}
        <h3>${escapeHtml(c.name)}</h3>
        <div class="industry">${escapeHtml(c.industry)}</div>
        <div class="c-meta">${Icons.pin ? "" : ""}${escapeHtml(
        c.location
      )} &middot; ${count} open ${count === 1 ? "job" : "jobs"}</div>
        <span class="btn btn-outline btn-sm">View Jobs</span>
      </a>`;
    })
    .join("");
}

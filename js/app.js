/* =========================================================
   app.js
   Shared UI + helpers used on every page:
     - SVG icon set
     - Header / footer rendering with live auth state
     - Mobile navigation
     - Toast notifications
     - Reusable job-card + company-logo builders
   This file is loaded on every page after data.js + storage.js.
   ========================================================= */

/* ---------- Icon set (inline SVG strings) ---------- */
const Icons = {
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  briefcase:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  wallet:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  layers:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>',
  heart:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  sparkles:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.94 14.34A2 2 0 0 0 8.66 13L3 11l5.66-2A2 2 0 0 0 9.94 7.66L12 2l2.06 5.66A2 2 0 0 0 15.34 9L21 11l-5.66 2a2 2 0 0 0-1.28 1.34L12 20Z"/></svg>',
  building:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/></svg>',
  bookmark:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
  download:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  filter:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  logout:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
};

/* ---------- Small helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* Company logo avatar markup (colored initials). */
function companyLogo(company, extraClass = "") {
  const color =
    (typeof COMPANY_COLORS !== "undefined" && COMPANY_COLORS[company]) ||
    "#4f46e5";
  return `<div class="company-logo ${extraClass}" style="background:${color}">${escapeHtml(
    initials(company)
  )}</div>`;
}

/* ---------- Toast notifications ---------- */
function toast(message, type = "default") {
  let stack = $(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  const ic = type === "success" ? Icons.check : type === "error" ? Icons.close : "";
  el.innerHTML = `${ic}<span>${escapeHtml(message)}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .3s, transform .3s";
    el.style.opacity = "0";
    el.style.transform = "translateX(20px)";
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

/* ---------- Reusable job card ---------- */
function jobCardHTML(job) {
  const saved = Store.isSaved(job.id);
  const skills = job.skills
    .slice(0, 4)
    .map((s) => `<span class="tag">${escapeHtml(s)}</span>`)
    .join("");
  return `
    <article class="job-card" data-id="${job.id}">
      <div class="job-card-top">
        ${companyLogo(job.company)}
        <div>
          <h3>${escapeHtml(job.title)}</h3>
          <div class="company-name">${escapeHtml(job.company)}</div>
        </div>
        <button class="save-btn ${saved ? "saved" : ""}" data-save="${job.id}"
          aria-label="${saved ? "Remove from saved jobs" : "Save job"}"
          aria-pressed="${saved}">${Icons.heart}</button>
      </div>
      <div class="job-meta">
        <span>${Icons.pin}${escapeHtml(job.location)}</span>
        <span>${Icons.briefcase}${escapeHtml(job.experience)}</span>
        <span>${Icons.wallet}${escapeHtml(job.salary)}</span>
        <span>${Icons.layers}${escapeHtml(job.mode)}</span>
      </div>
      <p class="job-desc">${escapeHtml(job.description)}</p>
      <div class="tags">${skills}</div>
      <div class="job-card-foot">
        <div style="display:flex;gap:8px;align-items:center">
          <span class="pill pill-type">${escapeHtml(job.type)}</span>
          <span class="posted">${Icons.clock ? "" : ""}${escapeHtml(job.posted)}</span>
        </div>
        <button class="btn btn-outline btn-sm" data-view="${job.id}">View Details</button>
      </div>
    </article>`;
}

/* ---------- Header / footer chrome ---------- */
const NAV_ITEMS = [
  { key: "home", label: "Home", href: "index.html" },
  { key: "jobs", label: "Jobs", href: "jobs.html" },
  { key: "companies", label: "Companies", href: "companies.html" },
  { key: "resources", label: "Career Resources", href: "#resources" },
];

function buildHeader(active) {
  const user = Store.getCurrentUser();
  const links = NAV_ITEMS.map(
    (n) =>
      `<a href="${n.href}" class="${n.key === active ? "active" : ""}">${n.label}</a>`
  ).join("");

  let actions;
  let mobileAuth;
  if (user) {
    actions = `
      <a href="dashboard.html" class="user-chip">
        <span class="avatar">${
          user.photo
            ? `<img src="${user.photo}" alt="">`
            : escapeHtml(initials(user.name))
        }</span>
        <span>${escapeHtml(user.name.split(" ")[0])}</span>
      </a>
      <button class="btn btn-ghost btn-sm desktop-only" id="logoutBtn">Logout</button>`;
    mobileAuth = `<a href="dashboard.html" class="btn btn-outline">Dashboard</a>
      <button class="btn btn-ghost" id="logoutBtnMobile">Logout</button>`;
  } else {
    actions = `
      <a href="login.html" class="btn btn-ghost btn-sm">Login</a>
      <a href="register.html" class="btn btn-primary btn-sm">Register</a>`;
    mobileAuth = `<a href="login.html" class="btn btn-ghost">Login</a>
      <a href="register.html" class="btn btn-primary">Register</a>`;
  }

  return `
  <div class="container nav">
    <a href="index.html" class="logo">
      <span class="logo-mark">J</span>Job<span>Nest</span>
    </a>
    <nav class="nav-links" id="navLinks" aria-label="Primary">
      ${links}
      <div class="mobile-auth">${mobileAuth}</div>
    </nav>
    <div class="nav-actions">
      ${actions}
      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">${Icons.menu}</button>
    </div>
  </div>`;
}

function buildFooter() {
  const year = new Date().getFullYear();
  return `
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="logo"><span class="logo-mark">J</span>Job<span>Nest</span></div>
        <p>Smart job search portal helping you discover roles, track applications and land your dream job.</p>
      </div>
      <div class="footer-col">
        <h4>For Job Seekers</h4>
        <a href="jobs.html">Browse Jobs</a>
        <a href="companies.html">Companies</a>
        <a href="saved-jobs.html">Saved Jobs</a>
        <a href="dashboard.html">Dashboard</a>
      </div>
      <div class="footer-col">
        <h4>Resources</h4>
        <a href="#">Resume Tips</a>
        <a href="#">Interview Prep</a>
        <a href="#">Salary Guide</a>
        <a href="#">Career Advice</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="#">About Us</a>
        <a href="#">Contact</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; ${year} JobNest. A frontend demo project &mdash; built with HTML, CSS &amp; vanilla JavaScript.
    </div>
  </div>`;
}

/* Mount chrome + wire shared interactions. */
function mountChrome() {
  const active = document.body.dataset.page || "";
  const header = $("#site-header");
  const footer = $("#site-footer");
  if (header) {
    header.className = "site-header";
    header.innerHTML = buildHeader(active);
  }
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = buildFooter();
  }

  // Mobile nav toggle
  const toggle = $("#navToggle");
  const navLinks = $("#navLinks");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("mobile-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Logout (desktop + mobile)
  ["logoutBtn", "logoutBtnMobile"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        Store.logout();
        toast("You have been logged out.", "success");
        setTimeout(() => (window.location.href = "index.html"), 700);
      });
    }
  });
}

/* Redirect guard for pages that require login. */
function requireAuth() {
  if (!Store.getCurrentUser()) {
    window.location.href = "login.html?redirect=" + encodeURIComponent(
      location.pathname.split("/").pop()
    );
    return false;
  }
  return true;
}

/* Delegated save-button handling works on every page that lists jobs. */
function wireGlobalSaveButtons(onChange) {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-save]");
    if (!btn) return;
    const id = Number(btn.dataset.save);
    const nowSaved = Store.toggleSaved(id);
    btn.classList.toggle("saved", nowSaved);
    btn.setAttribute("aria-pressed", String(nowSaved));
    btn.setAttribute(
      "aria-label",
      nowSaved ? "Remove from saved jobs" : "Save job"
    );
    toast(nowSaved ? "Job saved to your list." : "Removed from saved jobs.", "success");
    if (typeof onChange === "function") onChange(id, nowSaved);
  });
}

document.addEventListener("DOMContentLoaded", mountChrome);

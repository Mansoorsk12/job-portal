/* =========================================================
   storage.js
   Thin wrapper around LocalStorage so every page reads and
   writes data in a consistent way. All keys live under the
   `jobnest_` prefix.
   ========================================================= */

const Store = {
  keys: {
    users: "jobnest_users",
    currentUser: "jobnest_currentUser",
    savedJobs: "jobnest_savedJobs",
    applications: "jobnest_applications",
    profile: "jobnest_profile",
    recentSearches: "jobnest_recentSearches",
    jobs: "jobnest_jobs",
    resume: "jobnest_resume",
    seeded: "jobnest_seeded",
  },

  /* Generic getters / setters (JSON serialised). */
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      console.log("[v0] Store.get parse error for", key, e.message);
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  /* Seed the job catalogue once, so users can still see jobs
     persist across refreshes exactly like the rest of the data. */
  init() {
    if (!this.get(this.keys.seeded, false)) {
      this.set(this.keys.jobs, SEED_JOBS);
      this.set(this.keys.seeded, true);
      console.log("[v0] Seeded", SEED_JOBS.length, "jobs into LocalStorage");
    }
    // Safety net: if jobs were cleared but seed flag remained.
    if (!this.get(this.keys.jobs, null)) {
      this.set(this.keys.jobs, SEED_JOBS);
    }
  },

  /* ---- Domain helpers ---- */
  getJobs() {
    return this.get(this.keys.jobs, SEED_JOBS);
  },

  getJobById(id) {
    return this.getJobs().find((j) => j.id === Number(id));
  },

  /* Users / auth */
  getUsers() {
    return this.get(this.keys.users, []);
  },

  saveUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.set(this.keys.users, users);
  },

  getCurrentUser() {
    return this.get(this.keys.currentUser, null);
  },

  setCurrentUser(user) {
    this.set(this.keys.currentUser, user);
  },

  logout() {
    this.remove(this.keys.currentUser);
  },

  /* Saved jobs (array of job ids) */
  getSavedJobs() {
    return this.get(this.keys.savedJobs, []);
  },

  isSaved(id) {
    return this.getSavedJobs().includes(Number(id));
  },

  toggleSaved(id) {
    id = Number(id);
    let saved = this.getSavedJobs();
    if (saved.includes(id)) {
      saved = saved.filter((x) => x !== id);
    } else {
      saved.push(id);
    }
    this.set(this.keys.savedJobs, saved);
    return saved.includes(id);
  },

  removeSaved(id) {
    id = Number(id);
    const saved = this.getSavedJobs().filter((x) => x !== id);
    this.set(this.keys.savedJobs, saved);
  },

  /* Applications */
  getApplications() {
    return this.get(this.keys.applications, []);
  },

  hasApplied(jobId) {
    return this.getApplications().some((a) => a.jobId === Number(jobId));
  },

  addApplication(app) {
    const apps = this.getApplications();
    apps.push(app);
    this.set(this.keys.applications, apps);
  },

  /* Profile */
  getProfile() {
    return this.get(this.keys.profile, null);
  },

  setProfile(profile) {
    this.set(this.keys.profile, profile);
  },

  /* Resume */
  getResume() {
    return this.get(this.keys.resume, null);
  },

  setResume(resume) {
    this.set(this.keys.resume, resume);
  },

  /* Recent searches (most-recent first, capped at 6) */
  getRecentSearches() {
    return this.get(this.keys.recentSearches, []);
  },

  addRecentSearch(term) {
    term = (term || "").trim();
    if (!term) return;
    let list = this.getRecentSearches().filter(
      (t) => t.toLowerCase() !== term.toLowerCase()
    );
    list.unshift(term);
    list = list.slice(0, 6);
    this.set(this.keys.recentSearches, list);
  },

  clearRecentSearches() {
    this.remove(this.keys.recentSearches);
  },
};

// Seed immediately when the script loads.
Store.init();

/* =========================================================
   auth.js
   Handles registration + login against LocalStorage.
   Loaded on login.html and register.html. Each form is wired
   only if it exists on the current page.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Fill aside checkmark icons if present.
  ["ic-p1", "ic-p2", "ic-p3"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = Icons.check;
  });

  // If already logged in, bounce to dashboard.
  if (Store.getCurrentUser()) {
    window.location.href = "dashboard.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (registerForm) registerForm.addEventListener("submit", handleRegister);
});

function redirectTarget() {
  const p = new URLSearchParams(location.search);
  const r = p.get("redirect");
  // Only allow local page redirects.
  if (r && /^[\w-]+\.html$/.test(r)) return r;
  return "dashboard.html";
}

function setInvalid(id, invalid) {
  const field = document.getElementById(id).closest(".field");
  if (field) field.classList.toggle("invalid", invalid);
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/* ---- Login ---- */
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const emailBad = !isEmail(email);
  const passBad = password.length < 6;
  setInvalid("email", emailBad);
  setInvalid("password", passBad);
  if (emailBad || passBad) return;

  const user = Store.getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user || user.password !== password) {
    toast("Invalid email or password. Please try again.", "error");
    setInvalid("password", true);
    return;
  }

  Store.setCurrentUser({
    id: user.id,
    name: user.name,
    email: user.email,
    photo: user.photo || null,
  });
  toast(`Welcome back, ${user.name.split(" ")[0]}!`, "success");
  setTimeout(() => (window.location.href = redirectTarget()), 700);
}

/* ---- Register ---- */
function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  const nameBad = name.length < 2;
  const emailBad = !isEmail(email);
  const passBad = password.length < 6;
  const confirmBad = password !== confirm || confirm.length === 0;

  setInvalid("name", nameBad);
  setInvalid("email", emailBad);
  setInvalid("password", passBad);
  setInvalid("confirm", confirmBad);
  if (nameBad || emailBad || passBad || confirmBad) return;

  // Duplicate email guard.
  if (
    Store.getUsers().some((u) => u.email.toLowerCase() === email.toLowerCase())
  ) {
    toast("An account with that email already exists. Try logging in.", "error");
    setInvalid("email", true);
    return;
  }

  const user = {
    id: "u_" + Date.now(),
    name,
    email,
    password, // demo only — never store plaintext passwords in production
    photo: null,
    createdAt: new Date().toISOString(),
  };
  Store.saveUser(user);
  Store.setCurrentUser({
    id: user.id,
    name: user.name,
    email: user.email,
    photo: null,
  });

  // Seed a matching profile record.
  Store.setProfile({
    name,
    email,
    phone: "",
    title: "",
    location: "",
    about: "",
    skills: [],
  });

  toast("Account created! Welcome to JobNest.", "success");
  setTimeout(() => (window.location.href = "dashboard.html"), 800);
}

/**
 * Opportunity Finder - Système d'Authentification
 */

const API_BASE_URL = "https://opportunity-finder-api.onrender.com/api";

let currentUser = null;

const Auth = {
  _initPromise: null,

  async init() {
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      await this.loadSession();
      this.bindEvents();
      this.updateUI();
    })();

    return this._initPromise;
  },

  bindEvents() {
    const loginForm = DOM.$("#loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }

    const signupForm = DOM.$("#signupForm");
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleSignup();
      });
    }

    DOM.$$('[data-action="logout"]').forEach((btn) => {
      btn.addEventListener("click", () => this.logout());
    });
  },

  async loadSession() {
    const token = Storage.get("token", null);
    const savedUser = Storage.get("currentUser", null);

    if (!token) {
      currentUser = null;
      return;
    }

    if (savedUser) {
      currentUser = savedUser;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        this.logout(false);
        return;
      }

      currentUser = data.user;
      Storage.set("currentUser", data.user);
    } catch (error) {
      console.error("Erreur loadSession:", error);

      if (!savedUser) {
        this.logout(false);
      }
    }
  },

  async handleLogin() {
    const email = DOM.$("#email")?.value.trim();
    const password = DOM.$("#password")?.value;
    const remember = DOM.$("#remember")?.checked || false;

    if (!email || !password) {
      Toast.error("Veuillez entrer votre email et mot de passe");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        Toast.error(data.error || "Email ou mot de passe invalide");
        return;
      }

      this.setSession(data.user, data.token, remember);

      Toast.success("Bon retour !", "Connexion réussie");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } catch (error) {
      console.error("Erreur login:", error);
      Toast.error("Impossible de se connecter au serveur");
    }
  },

  async handleSignup() {
    const name = DOM.$("#name")?.value.trim();
    const email = DOM.$("#email")?.value.trim();
    const password = DOM.$("#password")?.value;
    const confirmPassword = DOM.$("#confirmPassword")?.value;
    const terms = DOM.$("#terms")?.checked;

    if (!name || !email || !password) {
      Toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (!Validation.email(email)) {
      Toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    if (password.length < 6) {
      Toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      Toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (terms !== undefined && !terms) {
      Toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        Toast.error(data.error || "Impossible de créer le compte");
        return;
      }

      this.setSession(data.user, data.token);

      Toast.success("Compte créé avec succès !", "Bienvenue sur Opportunity Finder");

      window.location.href = "dashboard.html";

    } catch (error) {
      console.error("Erreur signup:", error);
      Toast.error("Impossible de se connecter au serveur");
    }
  },

  setSession(user, token, remember = false) {
    currentUser = {
      ...user,
      analysesUsed: user.analysesUsed ?? 0,
      analysesLimit: user.analysesLimit ?? 2
    };

    Storage.set("currentUser", currentUser);
    Storage.set("token", token);
    Storage.set("session", {
      userId: currentUser.id,
      loggedInAt: new Date().toISOString(),
      remember
    });

    this.updateUI();
  },

  logout(redirect = true) {
    currentUser = null;
    Storage.remove("currentUser");
    Storage.remove("token");
    Storage.remove("session");

    if (redirect) {
      Toast.info("Vous avez été déconnecté");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    }
  },

  getUser() {
    return currentUser;
  },

  getToken() {
    return Storage.get("token", null);
  },

  isLoggedIn() {
  const token = Storage.get("token", null);
  const savedUser = Storage.get("currentUser", null);

  if (!currentUser && savedUser) {
    currentUser = savedUser;
  }

  return !!token;
},

  hasAccess(feature) {
    if (!currentUser) return false;

    const plan = currentUser.plan;

    const features = {
      free: ["basic_analysis"],
      premium: [
        "basic_analysis",
        "detailed_analysis",
        "save_ideas",
        "history",
        "favorites"
      ],
      pro: [
        "basic_analysis",
        "detailed_analysis",
        "save_ideas",
        "history",
        "favorites",
        "competitor_analysis",
        "difficulty_estimate",
        "business_plan",
        "export",
        "email_reports"
      ]
    };

    return features[plan]?.includes(feature) || false;
  },

  canAnalyze() {
    if (!currentUser) return false;

    if (currentUser.plan === "free") {
      return currentUser.analysesUsed < currentUser.analysesLimit;
    }

    return true;
  },

  getRemainingAnalyses() {
    if (!currentUser) return 0;

    if (currentUser.plan === "free") {
      return Math.max(0, currentUser.analysesLimit - currentUser.analysesUsed);
    }

    return Infinity;
  },

  updateUser(updates) {
    if (!currentUser) return false;

    Object.assign(currentUser, updates);
    Storage.set("currentUser", currentUser);
    this.updateUI();
    return true;
  },

  updateUI() {
    const authNav = DOM.$(".navbar-auth");

    if (authNav) {
      if (currentUser) {
        // Insert toggle button BEFORE navbar-auth (as sibling, not child)
        // so auth.js innerHTML replacement never destroys it
        // Insert toggle AFTER authNav so it sits right of the avatar, not floating left
        const existingToggle = authNav.nextElementSibling;
        if (!existingToggle || !existingToggle.hasAttribute('data-theme-toggle')) {
          const toggleBtn = document.createElement('button');
          toggleBtn.className = 'theme-toggle-btn';
          toggleBtn.setAttribute('data-theme-toggle', '');
          toggleBtn.setAttribute('aria-label', 'Basculer le thème');
          toggleBtn.innerHTML = '<span class="theme-icon">🌙</span>';
          authNav.parentNode.insertBefore(toggleBtn, authNav.nextSibling);
          if (typeof Theme !== 'undefined') Theme._updateButtons();
        }

        authNav.innerHTML = `
          <div class="navbar-user">
            <div class="user-menu">
              <button class="user-menu-toggle">
                <span class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</span>
                <span class="user-name">${currentUser.name}</span>
                <span class="user-arrow">▾</span>
              </button>
              <div class="user-menu-dropdown">
                <a href="dashboard.html" class="user-menu-item">Tableau de bord</a>
                <a href="profile.html" class="user-menu-item">Profil</a>
                <hr class="user-menu-divider">
                <button class="user-menu-item user-menu-item--logout" data-action="logout">Déconnexion</button>
              </div>
            </div>
          </div>
        `;

        DOM.$$('[data-action="logout"]').forEach((btn) => {
          btn.addEventListener("click", () => this.logout());
        });

        // ── User menu toggle — works on every page (dashboard has no main.js) ──
        this._bindUserMenuToggle();
      } else {
        // Insert toggle AFTER auth nav (right of login/signup buttons)
        const existingToggle2 = authNav.nextElementSibling;
        if (!existingToggle2 || !existingToggle2.hasAttribute('data-theme-toggle')) {
          const toggleBtn2 = document.createElement('button');
          toggleBtn2.className = 'theme-toggle-btn';
          toggleBtn2.setAttribute('data-theme-toggle', '');
          toggleBtn2.setAttribute('aria-label', 'Basculer le thème');
          toggleBtn2.innerHTML = '<span class="theme-icon">🌙</span>';
          authNav.parentNode.insertBefore(toggleBtn2, authNav.nextSibling);
          if (typeof Theme !== 'undefined') Theme._updateButtons();
        }

        authNav.innerHTML = `
          <a href="login.html" class="btn btn-ghost">Se connecter</a>
          <a href="signup.html" class="btn btn-primary">Commencer</a>
        `;
      }
    }

    const profileName = DOM.$('[data-profile="name"]');
    if (profileName && currentUser) profileName.textContent = currentUser.name;

    const profileEmail = DOM.$('[data-profile="email"]');
    if (profileEmail && currentUser) profileEmail.textContent = currentUser.email;

    const profilePlan = DOM.$('[data-profile="plan"]');
    if (profilePlan && currentUser) {
      profilePlan.textContent =
        currentUser.plan === "free"
          ? "Gratuit"
          : currentUser.plan === "premium"
          ? "Premium"
          : "Pro";
    }

    const profileAvatar = DOM.$('[data-profile="avatar"]');
    if (profileAvatar && currentUser) {
      profileAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    }
  },

  requireAuth() {
    return this.Auth();
  },

  Auth() {
    const token = Storage.get("token", null);
    const savedUser = Storage.get("currentUser", null);

    if (!currentUser && token && savedUser) {
      currentUser = savedUser;
    }

    if (!token || !currentUser) {
      Toast.warning("Veuillez vous connecter pour accéder à cette page");
      window.location.href =
        "login.html?redirect=" + encodeURIComponent(window.location.pathname);
      return false;
    }

    return true;
  },

  // ── Bind user-menu toggle — only on pages WITHOUT main.js (e.g. dashboard) ──
  // main.js already handles this on index/profile/pricing — binding twice causes
  // double-toggle (opens then immediately closes). We use a global flag to prevent it.
  _bindUserMenuToggle() {
    if (window.__userMenuBound) return;
    window.__userMenuBound = true;

    document.addEventListener("click", (e) => {
      const toggle = e.target.closest(".user-menu-toggle");
      const menu   = e.target.closest(".user-menu");

      document.querySelectorAll(".user-menu").forEach(m => {
        if (m !== menu) m.classList.remove("open");
      });

      if (toggle && menu) {
        e.stopPropagation();
        menu.classList.toggle("open");
      } else if (!menu) {
        document.querySelectorAll(".user-menu").forEach(m => m.classList.remove("open"));
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await Auth.init();
});
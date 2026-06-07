/**
 * Business Finder IA — business-finder.js
 * Opportunity Finder
 */

const API_BASE = "https://opportunity-finder-api.onrender.com";
const BF_API  = "https://opportunity-finder-api.onrender.com/api/booster/business-finder";

/* ── Questions ─────────────────────────────────────────── */
const QUESTIONS = [
  { id: "age", type: "single", title: "Quel âge as-tu ?",
    options: ["Moins de 18 ans", "18 à 25 ans", "25 à 40 ans", "40 ans et plus"] },

  { id: "status", type: "single", title: "Quel est ton statut actuel ?",
    options: ["Étudiant", "Salarié", "Entrepreneur", "Freelance", "Sans emploi"] },

  { id: "weeklyHours", type: "single", title: "Combien d'heures peux-tu consacrer à un projet chaque semaine ?",
    options: ["1 à 5 heures", "5 à 10 heures", "10 à 20 heures", "Plus de 20 heures"] },

  { id: "budget", type: "single", title: "Quel budget peux-tu investir pour démarrer ?",
    options: ["0€", "100€", "500€", "1 000€", "Plus de 5 000€"] },

  { id: "businessLevel", type: "single", title: "Quel est ton niveau en business ?",
    options: ["Débutant", "Intermédiaire", "Avancé"] },

  { id: "techLevel", type: "single", title: "Quel est ton niveau en technologie ?",
    options: ["Débutant", "Intermédiaire", "Avancé"] },

  { id: "interests", type: "multi", title: "Quels domaines t'intéressent le plus ? (Choix multiples)",
    options: ["Intelligence artificielle", "SaaS", "E-commerce", "Création de contenu", "Marketing", "Services", "Business local", "Éducation", "Finance"] },

  { id: "goal", type: "single", title: "Quel est ton objectif principal ?",
    options: ["Générer un revenu complémentaire", "Remplacer mon salaire", "Créer une startup", "Atteindre la liberté financière", "Construire une entreprise revendable"] },

  { id: "businessPreference", type: "single", title: "Quel type de business préfères-tu ?",
    options: ["100% en ligne", "Local / physique", "Hybride", "Peu importe"] },

  { id: "learning", type: "single", title: "Es-tu prêt à apprendre de nouvelles compétences ?",
    options: ["Oui", "Non"] },

  { id: "timeGoal", type: "single", title: "Dans combien de temps souhaites-tu obtenir tes premiers résultats ?",
    options: ["Le plus rapidement possible", "1 à 3 mois", "3 à 6 mois", "Plus de 6 mois"] },

  { id: "riskLevel", type: "single", title: "Quel niveau de risque es-tu prêt à accepter ?",
    options: ["Faible", "Moyen", "Élevé"] },

  { id: "workStyle", type: "single", title: "Préfères-tu travailler seul ou avec une équipe ?",
    options: ["Seul", "Petite équipe", "Peu importe"] },

  { id: "location", type: "text", title: "Quel est ton pays ou ta région ?",
    placeholder: "Ex : France, Paris, Québec..." },

  { id: "experience", type: "single", title: "As-tu déjà lancé un business auparavant ?",
    options: ["Oui", "Non"] },
];

/* ── State ─────────────────────────────────────────────── */
let currentQ = 0;
let answers = {};
let currentResult = null;

/* ── DOM helpers ───────────────────────────────────────── */
const $ = id => document.getElementById(id);
const show = id => $( id )?.classList.remove("hidden");
const hide = id => $( id )?.classList.add("hidden");

function showScreen(id) {
  ["bfWelcome","bfQuestionnaire","bfLoading","bfResults"].forEach(s => hide(s));
  show(id);
}

/* ── Init ───────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
  await Auth.init();

  // Update sidebar avatar/name
  const user = Auth.getUser();
  if (user) {
    const av = $("sidebarAvatar");
    if (av) av.textContent = user.name?.charAt(0)?.toUpperCase() || "U";
    document.querySelectorAll(".sidebar-user-name").forEach(el => el.textContent = user.name || "");
    document.querySelectorAll(".sidebar-user-plan").forEach(el => {
      const dot = el.querySelector(".db-plan-dot");
      const txt = el.querySelector("span:last-child") || el;
      if (txt !== dot) txt.textContent = user.plan === "pro" ? "Forfait Pro" : user.plan === "premium" ? "Forfait Premium" : "Forfait Gratuit";
    });
  }

  // Check premium access
  if (!user || user.plan === "free") {
    showFreeGate();
    return;
  }

  // Welcome screen
  showScreen("bfWelcome");
  $("bfStartBtn")?.addEventListener("click", startQuestionnaire);
  $("bfPrevBtn")?.addEventListener("click", prevQuestion);
  $("bfNextBtn")?.addEventListener("click", nextQuestion);
});

/* ── Free gate ─────────────────────────────────────────── */
function showFreeGate() {
  const main = document.getElementById("bfMain");
  if (!main) return;
  main.innerHTML = `
    <div class="bf-screen">
      <div class="bf-welcome-card db-card" style="max-width:540px;margin:0 auto;">
        <div class="bf-welcome-hero">
          <div class="bf-welcome-icon">🔒</div>
          <h2 class="bf-welcome-title">Débloquez Business Finder IA</h2>
          <p class="bf-welcome-desc">Découvrez le business le plus adapté à votre profil grâce à une analyse IA avancée.</p>
          <div class="bf-welcome-features">
            <div class="bf-welcome-feat"><span>✅</span> Recommandation personnalisée</div>
            <div class="bf-welcome-feat"><span>✅</span> Score de compatibilité</div>
            <div class="bf-welcome-feat"><span>✅</span> Analyse du profil</div>
            <div class="bf-welcome-feat"><span>✅</span> Difficulté estimée</div>
            <div class="bf-welcome-feat"><span>✅</span> Budget recommandé</div>
          </div>
          <a href="pricing.html" class="bf-start-btn db-cta-btn" style="text-decoration:none;">
            ⭐ Passer Premium
          </a>
        </div>
      </div>
    </div>`;
}

/* ── Questionnaire ─────────────────────────────────────── */
function startQuestionnaire() {
  currentQ = 0;
  answers = {};
  showScreen("bfQuestionnaire");
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const total = QUESTIONS.length;
  const pct = Math.round((currentQ / total) * 100);

  // Progress
  const fill = document.getElementById("bfProgressFill");
  if (fill) fill.style.width = pct + "%";
  const txt = $("bfProgressText");
  if (txt) txt.textContent = `Question ${currentQ + 1} sur ${total}`;
  const pctEl = $("bfProgressPct");
  if (pctEl) pctEl.textContent = pct + "%";

  // Prev/Next buttons
  const prev = $("bfPrevBtn");
  if (prev) prev.disabled = currentQ === 0;
  const next = $("bfNextBtn");
  if (next) {
    next.innerHTML = currentQ === total - 1
      ? `Analyser mon profil <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
      : `Suivant <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;
  }

  // Render question
  const area = $("bfQuestionArea");
  if (!area) return;

  const saved = answers[q.id];
  let html = `<h3 class="bf-question-title">${escapeHtml(q.title)}</h3>`;

  if (q.type === "single") {
    html += `<div class="bf-options">`;
    q.options.forEach(opt => {
      const sel = saved === opt ? "selected" : "";
      html += `<button type="button" class="bf-option ${sel}" data-value="${escapeHtml(opt)}">
        <span class="bf-option-dot"></span>${escapeHtml(opt)}
      </button>`;
    });
    html += `</div>`;
  } else if (q.type === "multi") {
    const savedArr = Array.isArray(saved) ? saved : [];
    html += `<div class="bf-options-multi">`;
    q.options.forEach(opt => {
      const sel = savedArr.includes(opt) ? "selected" : "";
      html += `<button type="button" class="bf-option-chip ${sel}" data-value="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`;
    });
    html += `</div>`;
  } else if (q.type === "text") {
    html += `<input type="text" class="bf-text-input" id="bfTextInput" placeholder="${escapeHtml(q.placeholder || "")}" value="${escapeHtml(saved || "")}">`;
  }

  area.innerHTML = html;
  area.style.opacity = "0";
  area.style.transform = "translateY(8px)";
  requestAnimationFrame(() => {
    area.style.transition = "opacity .2s ease, transform .2s ease";
    area.style.opacity = "1";
    area.style.transform = "translateY(0)";
  });

  // Bind option clicks
  area.querySelectorAll(".bf-option").forEach(btn => {
    btn.addEventListener("click", () => {
      area.querySelectorAll(".bf-option").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      answers[q.id] = btn.dataset.value;
    });
  });

  area.querySelectorAll(".bf-option-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("selected");
      const selected = [...area.querySelectorAll(".bf-option-chip.selected")].map(b => b.dataset.value);
      answers[q.id] = selected;
    });
  });
}

function prevQuestion() {
  if (currentQ > 0) {
    saveCurrentAnswer();
    currentQ--;
    renderQuestion();
  }
}

function nextQuestion() {
  saveCurrentAnswer();
  const q = QUESTIONS[currentQ];

  // Validate required
  if (q.type !== "text" && !answers[q.id] || (Array.isArray(answers[q.id]) && answers[q.id].length === 0)) {
    if (q.type !== "text") {
      if (!answers[q.id]) {
        Toast.warning("Veuillez sélectionner une réponse");
        return;
      }
    }
  }

  if (currentQ < QUESTIONS.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    submitQuestionnaire();
  }
}

function saveCurrentAnswer() {
  const q = QUESTIONS[currentQ];
  if (q.type === "text") {
    const input = $("bfTextInput");
    if (input) answers[q.id] = input.value.trim();
  }
}

/* ── Submission & API ──────────────────────────────────── */
async function submitQuestionnaire() {
  showScreen("bfLoading");
  animateLoadingSteps();

  const token = Auth.getToken();
  if (!token) {
    Toast.error("Veuillez vous reconnecter");
    showScreen("bfQuestionnaire");
    return;
  }

  try {
    const response = await fetch(BF_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ answers })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Erreur lors de l'analyse");
    }

    // Dedicated route returns the exact fields needed — no remapping required
    const result = data.result;
    currentResult = result;
    await new Promise(r => setTimeout(r, 1800));
    showResults(result);

  } catch (err) {
    console.error("BF error:", err);
    Toast.error(err.message || "Erreur lors de l'analyse");
    showScreen("bfQuestionnaire");
  }
}

function buildPrompt() {
  const interests = Array.isArray(answers.interests)
    ? answers.interests.join(", ")
    : (answers.interests || "Non précisé");

  // Send as a structured user profile description that the evaluate endpoint
  // can analyze and return as a business recommendation
  return `Business Finder IA — Profil utilisateur :
Âge : ${answers.age || "Non précisé"}
Statut : ${answers.status || "Non précisé"}
Heures disponibles par semaine : ${answers.weeklyHours || "Non précisé"}
Budget de départ : ${answers.budget || "Non précisé"}
Niveau business : ${answers.businessLevel || "Non précisé"}
Niveau technologique : ${answers.techLevel || "Non précisé"}
Domaines d'intérêt : ${interests}
Objectif : ${answers.goal || "Non précisé"}
Type de business préféré : ${answers.businessPreference || "Non précisé"}
Prêt à apprendre : ${answers.learning || "Non précisé"}
Délai pour premiers résultats : ${answers.timeGoal || "Non précisé"}
Tolérance au risque : ${answers.riskLevel || "Non précisé"}
Préférence travail : ${answers.workStyle || "Non précisé"}
Localisation : ${answers.location || "Non précisé"}
Expérience entrepreneuriale : ${answers.experience || "Non précisé"}

En te basant sur ce profil, recommande LE business le plus adapté avec le meilleur potentiel de réussite pour cette personne. Analyse la demande du marché, la concurrence et l'opportunité.`;
}

function animateLoadingSteps() {
  const steps = [
    { id: "bfStep1", emoji: "🔍", title: "Analyse de votre profil", delay: 0 },
    { id: "bfStep2", emoji: "📊", title: "Recherche des meilleures opportunités", delay: 1200 },
    { id: "bfStep3", emoji: "🤖", title: "Génération de recommandations personnalisées", delay: 2400 },
  ];

  steps.forEach(({ id, emoji, title, delay }) => {
    setTimeout(() => {
      // Mark previous as done
      const prev = document.querySelector(".bf-loading-step.active");
      if (prev) { prev.classList.remove("active"); prev.classList.add("done"); }

      const el = $(id);
      if (el) el.classList.add("active");
      const emojiEl = $("bfLoadingEmoji");
      if (emojiEl) emojiEl.textContent = emoji;
      const titleEl = $("bfLoadingTitle");
      if (titleEl) titleEl.textContent = title;
    }, delay);
  });
}

/* ── Render Results ────────────────────────────────────── */
function showResults(r) {
  const user = Auth.getUser();
  const isPro = user?.plan === "pro";
  const isPremium = isPro || user?.plan === "premium";

  const score = r.compatibilityScore || 0;
  const scoreColor = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
  const circ = 2 * Math.PI * 45;
  const offset = circ - (score / 100) * circ;

  const roadmapHtml = buildRoadmapHtml(r.roadmap30Days || []);

  // Show Pro lock for both free AND premium users (premium can't see Pro features)
  const proLockedHtml = !isPro ? `
    <div class="bf-pro-locked">
      <div class="bf-pro-locked-header">
        <span style="font-size:1.3rem">🔒</span>
        <div>
          <div class="bf-pro-locked-title">Analyse complète — Plan Pro</div>
          <div class="bf-pro-locked-sub">Débloquez revenus, avantages, risques et roadmap détaillée</div>
        </div>
      </div>
      <div class="bf-pro-locked-items">
        <div class="bf-pro-item"><span>🔒</span> Temps avant 1er revenu</div>
        <div class="bf-pro-item"><span>🔒</span> Potentiel de revenus</div>
        <div class="bf-pro-item"><span>🔒</span> Avantages détaillés</div>
        <div class="bf-pro-item"><span>🔒</span> Risques identifiés</div>
        <div class="bf-pro-item"><span>🔒</span> Roadmap 30 jours</div>
      </div>
      <a href="pricing.html" class="bf-btn-primary" style="text-decoration:none;display:inline-flex;">Débloquer Pro →</a>
    </div>` : "";

  // Premium sees: recommendedBusiness, compatibilityScore, whyItFits, difficulty, estimatedBudget
  // Pro also sees: timeToFirstRevenue, revenuePotential, advantages, risks, roadmap
  const proContent = isPro ? `
    <div class="bf-result-section">
      <div class="bf-result-section-title">⏱ Délai & potentiel</div>
      <div class="bf-result-meta" style="background:transparent;border:none;padding:0;grid-template-columns:1fr 1fr;gap:10px;">
        <div class="bf-meta-card">
          <span class="bf-meta-icon">⏱</span>
          <div>
            <div class="bf-meta-label">1er revenu</div>
            <div class="bf-meta-value">${escapeHtml(r.timeToFirstRevenue || "—")}</div>
          </div>
        </div>
        <div class="bf-meta-card">
          <span class="bf-meta-icon">💸</span>
          <div>
            <div class="bf-meta-label">Potentiel</div>
            <div class="bf-meta-value">${escapeHtml(r.revenuePotential || "—")}</div>
          </div>
        </div>
      </div>
    </div>
    ${r.advantages?.length ? `
    <div class="bf-result-section">
      <div class="bf-result-section-title">✅ Avantages</div>
      <div class="bf-result-list">
        ${r.advantages.map(a => `<div class="bf-result-list-item"><span class="bf-result-list-check">✓</span>${escapeHtml(a)}</div>`).join("")}
      </div>
    </div>` : ""}
    ${r.risks?.length ? `
    <div class="bf-result-section">
      <div class="bf-result-section-title">⚠️ Risques</div>
      <div class="bf-result-list">
        ${r.risks.map(risk => `<div class="bf-result-list-item"><span class="bf-result-list-x">→</span>${escapeHtml(risk)}</div>`).join("")}
      </div>
    </div>` : ""}
    ${r.roadmap30Days?.length ? `
    <div class="bf-result-section">
      <div class="bf-result-section-title">🚀 Roadmap 30 jours</div>
      ${roadmapHtml}
    </div>` : ""}
  ` : "";

  const html = `
    <div class="bf-result-card">
      <div class="bf-result-hero">
        <div class="bf-result-score-ring">
          <svg viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="8"/>
            <circle cx="55" cy="55" r="45" fill="none"
              stroke="${scoreColor}" stroke-width="8"
              stroke-linecap="round"
              stroke-dasharray="${circ}"
              stroke-dashoffset="${offset}"
              transform="rotate(-90 55 55)"
              style="transition:stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)"/>
          </svg>
          <div class="bf-result-score-inner">
            <span class="bf-result-score-num">${score}</span>
            <span class="bf-result-score-sub">/100</span>
            <span class="bf-result-score-lbl">Compatibilité</span>
          </div>
        </div>
        <div class="bf-result-hero-info">
          <div class="bf-result-hero-label">🎯 Business recommandé</div>
          <div class="bf-result-hero-name">${escapeHtml(r.recommendedBusiness || "Business Opportunity")}</div>
          <div class="bf-result-hero-why">${escapeHtml(r.whyItFits || "")}</div>
        </div>
      </div>

      <div class="bf-result-meta">
        <div class="bf-meta-card">
          <span class="bf-meta-icon">⚡</span>
          <div>
            <div class="bf-meta-label">Difficulté</div>
            <div class="bf-meta-value">${escapeHtml(r.difficulty || "—")}</div>
          </div>
        </div>
        <div class="bf-meta-card">
          <span class="bf-meta-icon">💰</span>
          <div>
            <div class="bf-meta-label">Budget estimé</div>
            <div class="bf-meta-value">${escapeHtml(r.estimatedBudget || "—")}</div>
          </div>
        </div>
      </div>

      ${proContent}
      ${proLockedHtml}

      <div class="bf-result-actions">
        <button class="bf-btn-primary" id="bfSaveBtn" onclick="saveBfResult()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Sauvegarder
        </button>
        <button class="bf-btn-secondary" onclick="restartFinder()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.09-5.18"/></svg>
          Recommencer
        </button>
        <a href="dashboard.html" class="bf-btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Tableau de bord
        </a>
      </div>
    </div>`;

  const container = $("bfResults");
  if (container) container.innerHTML = html;
  showScreen("bfResults");
}

function buildRoadmapHtml(items) {
  if (!items?.length) return "";
  const WEEK_SIZE = 2;
  const colors = ["#2563eb","#4f46e5","#7c3aed","#6d28d9","#0891b2","#059669"];
  const labels = ["Semaine 1","Semaine 2","Semaine 3","Semaine 4","Semaine 5","Semaine 6"];
  const weeks = [];
  for (let i = 0; i < items.length; i += WEEK_SIZE) weeks.push(items.slice(i, i + WEEK_SIZE));

  return `<div class="bf-roadmap">${weeks.map((grp, wi) => `
    <div class="bf-roadmap-week">
      <div class="bf-roadmap-week-label" style="color:${colors[wi]||"#7c3aed"}">
        <span class="bf-roadmap-dot" style="background:${colors[wi]||"#7c3aed"}"></span>
        ${labels[wi] || `Semaine ${wi+1}`}
      </div>
      ${grp.map(task => `
        <div class="bf-roadmap-task">
          <span class="bf-roadmap-task-check">✓</span>
          <span>${escapeHtml(task)}</span>
        </div>`).join("")}
    </div>`).join("")}</div>`;
}

function restartFinder() {
  currentQ = 0;
  answers = {};
  showScreen("bfQuestionnaire");
  renderQuestion();
}

async function saveBfResult() {
  const user = Auth.getUser();
  if (!user) {
    Toast.error("Veuillez vous connecter");
    return;
  }

  if (user.plan === "free") {
    Toast.warning("La sauvegarde est réservée aux plans Premium et Pro");
    setTimeout(() => { window.location.href = "pricing.html"; }, 1200);
    return;
  }

  const id = currentResult?._analysisId;
  if (!id) {
    Toast.error("Aucune analyse à sauvegarder");
    return;
  }

  const btn = document.getElementById("bfSaveBtn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/></svg> Sauvegarde…`;
  }

  try {
    const token = Auth.getToken();
    const response = await fetch(
      `https://opportunity-finder-api.onrender.com/api/analyze/save/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Erreur lors de la sauvegarde");
    }

    Toast.success("Analyse sauvegardée ! Retrouvez-la dans le tableau de bord.");

    if (btn) {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Sauvegardée`;
      btn.style.background = "linear-gradient(135deg,#059669,#10b981)";
    }

  } catch (err) {
    console.error("Save error:", err);
    Toast.error(err.message || "Impossible de sauvegarder");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Sauvegarder`;
    }
  }
}

function escapeHtml(str) {
  if (typeof str !== "string") return String(str || "");
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/**
 * Business Finder IA — business-finder.js v3
 * Premium one-question-at-a-time experience
 * Inspired by MyIQ / BetterMe / Duolingo onboarding
 */

const API_BASE = "https://opportunity-finder-api.onrender.com";
const BF_API   = `${API_BASE}/api/booster/business-finder`;

/* ── Questions ────────────────────────────────────────── */
const QUESTIONS = [
  { id:"age",               type:"single", title:"Quel âge as-tu ?",
    options:["Moins de 18 ans","18 à 25 ans","25 à 40 ans","40 ans et plus"] },
  { id:"status",            type:"single", title:"Quel est ton statut actuel ?",
    options:["Étudiant","Salarié","Entrepreneur","Freelance","Sans emploi"] },
  { id:"weeklyHours",       type:"single", title:"Combien d'heures peux-tu consacrer à un projet chaque semaine ?",
    options:["1 à 5 heures","5 à 10 heures","10 à 20 heures","Plus de 20 heures"] },
  { id:"budget",            type:"single", title:"Quel budget peux-tu investir pour démarrer ?",
    options:["0€","100€","500€","1 000€","Plus de 5 000€"] },
  { id:"businessLevel",     type:"single", title:"Quel est ton niveau en business ?",
    options:["Débutant","Intermédiaire","Avancé"] },
  { id:"techLevel",         type:"single", title:"Quel est ton niveau en technologie ?",
    options:["Débutant","Intermédiaire","Avancé"] },
  { id:"interests",         type:"multi",  title:"Quels domaines t'intéressent le plus ? (Plusieurs choix possibles)",
    options:["Intelligence artificielle","SaaS","E-commerce","Création de contenu","Marketing","Services","Business local","Éducation","Finance"] },
  { id:"goal",              type:"single", title:"Quel est ton objectif principal ?",
    options:["Générer un revenu complémentaire","Remplacer mon salaire","Créer une startup","Atteindre la liberté financière","Construire une entreprise revendable"] },
  { id:"businessPreference",type:"single", title:"Quel type de business préfères-tu ?",
    options:["100% en ligne","Local / physique","Hybride","Peu importe"] },
  { id:"learning",          type:"single", title:"Es-tu prêt à apprendre de nouvelles compétences ?",
    options:["Oui, volontiers","Non, je préfère mes compétences actuelles"] },
  { id:"timeGoal",          type:"single", title:"Dans combien de temps souhaites-tu obtenir tes premiers résultats ?",
    options:["Le plus rapidement possible","1 à 3 mois","3 à 6 mois","Plus de 6 mois"] },
  { id:"riskLevel",         type:"single", title:"Quel niveau de risque es-tu prêt à accepter ?",
    options:["Faible — je veux quelque chose de sûr","Moyen — je peux prendre quelques risques","Élevé — je joue le tout pour le tout"] },
  { id:"workStyle",         type:"single", title:"Comment préfères-tu travailler ?",
    options:["Seul","Petite équipe","Peu importe"] },
  { id:"location",          type:"text",   title:"Dans quel pays ou quelle ville te trouves-tu ?",
    placeholder:"Ex : France, Paris, Montréal…" },
  { id:"experience",        type:"single", title:"As-tu déjà lancé un business auparavant ?",
    options:["Oui, avec succès","Oui, sans succès","Non, jamais"] },
];

/* ── State ─────────────────────────────────────────────── */
let currentQ = 0;
let answers  = {};
let currentResult = null;

/* ── DOM helpers ────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const bfxHide = id => { const el=$(id); if(el) el.classList.add("bfx-hidden"); };
const bfxShow = id => { const el=$(id); if(el) el.classList.remove("bfx-hidden"); };

function showScreen(id) {
  ["bfIntro","bfQuiz","bfLoading","bfResults"].forEach(bfxHide);
  bfxShow(id);
}

/* ── Init ───────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
  await Auth.init();

  const user = Auth.getUser();
  if (user) {
    const av = $("sidebarAvatar");
    if (av) av.textContent = user.name?.charAt(0)?.toUpperCase() || "U";
    document.querySelectorAll(".sidebar-user-name").forEach(el => el.textContent = user.name || "");
    document.querySelectorAll(".sidebar-user-plan").forEach(el => {
      el.textContent = user.plan === "pro" ? "Forfait Pro"
        : user.plan === "premium" ? "Forfait Premium" : "Forfait Gratuit";
    });
  }

  if (!user || user.plan === "free") {
    showFreeGate();
    return;
  }

  showScreen("bfIntro");
  $("bfStartBtn")?.addEventListener("click", startQuestionnaire);
  $("bfQuitBtn")?.addEventListener("click",  () => { window.location.href = "dashboard.html"; });
  $("bfBackBtn")?.addEventListener("click",  goBack);
  $("bfNextBtn")?.addEventListener("click",  goNext);
});

/* ── Free gate ─────────────────────────────────────────── */
function showFreeGate() {
  const main = $("bfMain");
  if (!main) return;
  main.innerHTML = `
    <div class="bfx-screen">
      <div class="bfx-intro-card" style="text-align:center">
        <div class="bfx-intro-emoji">🔒</div>
        <h1 class="bfx-intro-title">Débloquez Business Finder IA</h1>
        <p class="bfx-intro-desc">Découvrez le business le plus adapté à votre profil grâce à une analyse IA avancée.</p>
        <div class="bfx-intro-benefits">
          <div class="bfx-intro-benefit"><span>✅</span> Recommandation personnalisée</div>
          <div class="bfx-intro-benefit"><span>✅</span> Score de compatibilité</div>
          <div class="bfx-intro-benefit"><span>✅</span> Difficulté & budget estimés</div>
          <div class="bfx-intro-benefit"><span>✅</span> Plan d'action sur mesure</div>
        </div>
        <a href="pricing.html" class="bfx-start-btn" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;">
          ⭐ Passer Premium
        </a>
      </div>
    </div>`;
}

/* ── Quiz ───────────────────────────────────────────────── */
function startQuestionnaire() {
  currentQ = 0;
  answers  = {};
  showScreen("bfQuiz");
  renderQuestion();
}

function renderQuestion() {
  const q     = QUESTIONS[currentQ];
  const total = QUESTIONS.length;
  const pct   = Math.round(((currentQ) / total) * 100);

  // Progress
  const fill = $("bfProgressFill");
  if (fill) fill.style.width = Math.max(pct, 4) + "%";

  const lbl = $("bfStepLabel");
  if (lbl) lbl.textContent = `Question ${currentQ + 1} sur ${total}`;

  const pctEl = $("bfStepPct");
  if (pctEl) pctEl.textContent = Math.max(pct, 4) + "%";

  // Back / Next buttons
  const backBtn = $("bfBackBtn");
  const nextBtn = $("bfNextBtn");
  if (backBtn) backBtn.disabled = currentQ === 0;
  if (nextBtn) {
    const isLast = currentQ === total - 1;
    nextBtn.innerHTML = isLast
      ? `Analyser <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
      : `Continuer <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;
  }

  // Question text
  const qText = $("bfQuestionText");
  if (qText) qText.textContent = q.title;

  // Options area — animate out/in
  const area = $("bfOptionsArea");
  if (!area) return;

  area.style.opacity = "0";
  area.style.transform = "translateX(12px)";

  const saved = answers[q.id];
  let html = "";

  if (q.type === "single") {
    html = `<div class="bfx-options">` +
      q.options.map(opt => {
        const sel = saved === opt ? " selected" : "";
        return `<button type="button" class="bfx-option${sel}" data-value="${escapeHtml(opt)}">
          <span class="bfx-option-radio"></span>${escapeHtml(opt)}
        </button>`;
      }).join("") + `</div>`;
  } else if (q.type === "multi") {
    const savedArr = Array.isArray(saved) ? saved : [];
    html = `<div class="bfx-options-multi">` +
      q.options.map(opt => {
        const sel = savedArr.includes(opt) ? " selected" : "";
        return `<button type="button" class="bfx-option-chip${sel}" data-value="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`;
      }).join("") + `</div>`;
  } else if (q.type === "text") {
    html = `<div class="bfx-options">
      <input type="text" class="bfx-text-input" id="bfTextInput"
        placeholder="${escapeHtml(q.placeholder || "")}"
        value="${escapeHtml(saved || "")}">
    </div>`;
  }

  area.innerHTML = html;

  requestAnimationFrame(() => {
    area.style.transition = "opacity .22s ease, transform .22s ease";
    area.style.opacity = "1";
    area.style.transform = "translateX(0)";
  });

  // Bind option clicks — single-select
  area.querySelectorAll(".bfx-option").forEach(btn => {
    btn.addEventListener("click", () => {
      area.querySelectorAll(".bfx-option").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      answers[q.id] = btn.dataset.value;
      // Auto-advance after short delay for single-select
      setTimeout(() => goNext(), 280);
    });
  });

  // Multi-select chips
  area.querySelectorAll(".bfx-option-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("selected");
      const selected = [...area.querySelectorAll(".bfx-option-chip.selected")].map(b => b.dataset.value);
      answers[q.id] = selected;
    });
  });
}

function saveCurrentAnswer() {
  const q = QUESTIONS[currentQ];
  if (q.type === "text") {
    const inp = $("bfTextInput");
    if (inp) answers[q.id] = inp.value.trim();
  }
}

function goBack() {
  if (currentQ <= 0) return;
  saveCurrentAnswer();
  currentQ--;
  renderQuestion();
}

function goNext() {
  saveCurrentAnswer();
  const q = QUESTIONS[currentQ];

  // Validate
  if (q.type === "single" && !answers[q.id]) {
    Toast.warning("Sélectionne une réponse pour continuer.");
    return;
  }
  if (q.type === "multi" && (!Array.isArray(answers[q.id]) || !answers[q.id].length)) {
    Toast.warning("Sélectionne au moins une option.");
    return;
  }

  if (currentQ < QUESTIONS.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    submitQuestionnaire();
  }
}

/* ── Submit & API ───────────────────────────────────────── */
async function submitQuestionnaire() {
  showScreen("bfLoading");
  animateLoadingSteps();

  const token = Auth.getToken();
  if (!token) {
    Toast.error("Veuillez vous reconnecter");
    showScreen("bfQuiz");
    return;
  }

  try {
    const response = await fetch(BF_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ answers })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || "Erreur lors de l'analyse");

    const result = data.result;
    currentResult = result;
    currentResult._analysisId = data?.analysis?.id || null;

    await new Promise(r => setTimeout(r, 1800));
    showResults(result);

  } catch (err) {
    console.error("BF error:", err);
    Toast.error(err.message || "Erreur lors de l'analyse");
    showScreen("bfQuiz");
  }
}

/* ── Loading animation ──────────────────────────────────── */
function animateLoadingSteps() {
  const steps = [
    { id:"bfLStep1", check:"bfLCheck1", delay:0 },
    { id:"bfLStep2", check:"bfLCheck2", delay:900 },
    { id:"bfLStep3", check:"bfLCheck3", delay:1800 },
    { id:"bfLStep4", check:"bfLCheck4", delay:2700 },
  ];

  const emojis = ["🔍","📊","🤖","🚀"];

  steps.forEach(({ id, check, delay }, i) => {
    setTimeout(() => {
      // Mark previous as done
      if (i > 0) {
        const prev = $(steps[i-1].id);
        if (prev) { prev.classList.remove("active"); prev.classList.add("done"); }
        const prevCheck = $(steps[i-1].check);
        if (prevCheck) prevCheck.textContent = "✓";
      }
      const el = $(id);
      if (el) el.classList.add("active");
      const emojiEl = $("bfLoadingEmoji");
      if (emojiEl) emojiEl.textContent = emojis[i];
    }, delay);
  });
}

/* ── Results ────────────────────────────────────────────── */
function showResults(r) {
  const user = Auth.getUser();
  const isPro     = user?.plan === "pro";
  const isPremium = isPro || user?.plan === "premium";

  const score = r.compatibilityScore || 0;
  const scoreColor  = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel  = score >= 75 ? "Excellente compatibilité" : score >= 50 ? "Bonne compatibilité" : "Compatibilité correcte";
  const scoreBg     = score >= 75 ? "background:#ecfdf5;color:#059669" : score >= 50 ? "background:#fffbeb;color:#d97706" : "background:#fef2f2;color:#dc2626";

  const circ  = 2 * Math.PI * 50;
  const offset = circ - (score / 100) * circ;

  // Pro content sections
  const proContent = isPro ? `
    <div class="bfx-result-card">
      <div class="bfx-card-label">⏱ Délai & Potentiel</div>
      <div class="bfx-meta-row">
        <div class="bfx-meta-item">
          <div class="bfx-meta-icon">⏱</div>
          <div class="bfx-meta-label">1er revenu</div>
          <div class="bfx-meta-val">${escapeHtml(r.timeToFirstRevenue || "—")}</div>
        </div>
        <div class="bfx-meta-item">
          <div class="bfx-meta-icon">💸</div>
          <div class="bfx-meta-label">Potentiel</div>
          <div class="bfx-meta-val">${escapeHtml(r.revenuePotential || "—")}</div>
        </div>
      </div>
    </div>
    ${r.advantages?.length ? `
    <div class="bfx-result-card">
      <div class="bfx-card-label">✅ Points forts</div>
      ${r.advantages.map(a => `<div style="display:flex;gap:9px;align-items:flex-start;margin-bottom:8px;font-size:14px;color:#334155"><span style="color:#10b981;font-weight:800;flex-shrink:0">✓</span>${escapeHtml(a)}</div>`).join("")}
    </div>` : ""}
    ${r.risks?.length ? `
    <div class="bfx-result-card">
      <div class="bfx-card-label">⚠️ Risques à anticiper</div>
      ${r.risks.map(risk => `<div style="display:flex;gap:9px;align-items:flex-start;margin-bottom:8px;font-size:14px;color:#334155"><span style="color:#f59e0b;font-weight:800;flex-shrink:0">→</span>${escapeHtml(risk)}</div>`).join("")}
    </div>` : ""}
    ${r.roadmap30Days?.length ? `
    <div class="bfx-result-card">
      <div class="bfx-card-label">🗓 Roadmap 30 jours</div>
      ${r.roadmap30Days.map((step, i) => `
        <div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f1f5f9">
          <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
          <div style="font-size:13.5px;color:#334155;line-height:1.5">${escapeHtml(step)}</div>
        </div>`).join("")}
    </div>` : ""}
  ` : "";

  const proLock = !isPro ? `
    <div class="bfx-pro-lock">
      <span class="bfx-pro-lock-icon">🔒</span>
      <div class="bfx-pro-lock-title">Débloquez le plan Pro</div>
      <div class="bfx-pro-lock-desc">Accédez à l'analyse complète avec revenus, avantages, risques et roadmap détaillée.</div>
      <div class="bfx-pro-lock-items">
        <div class="bfx-lock-item"><span>🔒</span> 1er revenu estimé</div>
        <div class="bfx-lock-item"><span>🔒</span> Potentiel de revenus</div>
        <div class="bfx-lock-item"><span>🔒</span> Avantages clés</div>
        <div class="bfx-lock-item"><span>🔒</span> Risques identifiés</div>
        <div class="bfx-lock-item"><span>🔒</span> Roadmap 30 jours</div>
      </div>
      <a href="pricing.html" class="bfx-pro-cta">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Passer au plan Pro
      </a>
    </div>` : "";

  const container = $("bfResults");
  if (!container) return;

  container.innerHTML = `
    <div class="bfx-results-wrap">

      <!-- Card 1: Business recommandé -->
      <div class="bfx-result-card bfx-result-card--hero">
        <div class="bfx-hero-badge">🎯 Business recommandé</div>
        <div class="bfx-hero-name">${escapeHtml(r.recommendedBusiness || "Business Opportunity")}</div>
        <div class="bfx-hero-desc">${escapeHtml(r.whyItFits?.slice(0, 120) || "")}</div>
      </div>

      <!-- Card 2: Score cercle centré -->
      <div class="bfx-result-card bfx-result-card--score">
        <div class="bfx-card-label">Compatibilité</div>
        <div class="bfx-score-ring-wrap">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" stroke-width="10"/>
            <circle cx="60" cy="60" r="50" fill="none"
              stroke="${scoreColor}" stroke-width="10"
              stroke-linecap="round"
              stroke-dasharray="${circ}"
              stroke-dashoffset="${offset}"
              transform="rotate(-90 60 60)"
              style="transition:stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)"/>
          </svg>
          <div class="bfx-score-inner">
            <span class="bfx-score-num">${score}</span>
            <span class="bfx-score-sub">/100</span>
          </div>
        </div>
        <div class="bfx-score-label" style="${scoreBg}">${escapeHtml(scoreLabel)}</div>
      </div>

      <!-- Card 3: Pourquoi -->
      <div class="bfx-result-card">
        <div class="bfx-card-label">💬 Pourquoi cette opportunité ?</div>
        <p class="bfx-why-text">${escapeHtml(r.whyItFits || "")}</p>
      </div>

      <!-- Card 4+5: Difficulté + Budget -->
      <div class="bfx-result-card">
        <div class="bfx-meta-row">
          <div class="bfx-meta-item">
            <div class="bfx-meta-icon">⚡</div>
            <div class="bfx-meta-label">Difficulté</div>
            <div class="bfx-meta-val">${escapeHtml(r.difficulty || "—")}</div>
          </div>
          <div class="bfx-meta-item">
            <div class="bfx-meta-icon">💰</div>
            <div class="bfx-meta-label">Budget estimé</div>
            <div class="bfx-meta-val">${escapeHtml(r.estimatedBudget || "—")}</div>
          </div>
        </div>
      </div>

      ${proContent}
      ${proLock}

      <!-- Actions -->
      <div class="bfx-result-card" style="padding:18px">
        <div class="bfx-result-actions">
          <button class="bfx-action-primary" id="bfSaveBtn" onclick="saveBfResult()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
            Sauvegarder
          </button>
          <button class="bfx-action-ghost" onclick="restartFinder()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.09-5.18"/></svg>
            Recommencer
          </button>
          <a href="dashboard.html" class="bfx-action-ghost" style="text-decoration:none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
        </div>
      </div>

    </div>`;

  showScreen("bfResults");
}

/* ── Restart ────────────────────────────────────────────── */
function restartFinder() {
  currentQ = 0;
  answers  = {};
  showScreen("bfIntro");
}

/* ── Save ───────────────────────────────────────────────── */
async function saveBfResult() {
  const user = Auth.getUser();
  if (!user) { Toast.error("Veuillez vous connecter"); return; }
  if (user.plan === "free") {
    Toast.warning("La sauvegarde est réservée aux plans Premium et Pro");
    setTimeout(() => { window.location.href = "pricing.html"; }, 1200);
    return;
  }

  const id = currentResult?._analysisId;
  if (!id) { Toast.error("Aucune analyse à sauvegarder"); return; }

  const btn = $("bfSaveBtn");
  if (btn) { btn.disabled = true; btn.innerHTML = `⏳ Sauvegarde…`; }

  try {
    const token = Auth.getToken();
    const response = await fetch(`${API_BASE}/api/analyze/save/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erreur lors de la sauvegarde");
    Toast.success("Analyse sauvegardée !");
    if (btn) {
      btn.innerHTML = `✓ Sauvegardée`;
      btn.style.background = "linear-gradient(135deg,#059669,#10b981)";
    }
  } catch (err) {
    Toast.error(err.message || "Impossible de sauvegarder");
    if (btn) { btn.disabled = false; btn.innerHTML = `Sauvegarder`; }
  }
}

/* ── Utility ────────────────────────────────────────────── */
function escapeHtml(str) {
  if (typeof str !== "string") return String(str || "");
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

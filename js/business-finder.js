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

/* ── Results ─── Premium Dashboard Layout ──────────────── */
function showResults(r) {
  const user     = Auth.getUser();
  const isPro    = user?.plan === "pro";

  const score       = r.compatibilityScore || 0;
  const scoreColor  = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel  = score >= 75 ? "Excellente compatibilité ✨" : score >= 50 ? "Bonne compatibilité" : "Compatibilité correcte";
  const scoreLabelBg= score >= 75 ? "rgba(16,185,129,.15)" : score >= 50 ? "rgba(245,158,11,.15)" : "rgba(239,68,68,.15)";
  const scoreLabelClr= score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  const circ   = 2 * Math.PI * 52;
  const offset = circ - (score / 100) * circ;

  const diffScore  = r.difficultyScore || 5;
  const diffWidth  = (diffScore / 10) * 100;
  const diffColor  = diffScore <= 3 ? "#10b981" : diffScore <= 6 ? "#f59e0b" : "#ef4444";

  // Tags
  const tags = Array.isArray(r.tags) && r.tags.length
    ? r.tags.slice(0,3).map(t => `<span class="bfr-tag">${escapeHtml(t)}</span>`).join("")
    : `<span class="bfr-tag">${escapeHtml(r.businessType||"Business")}</span>`;

  // Advantages — support both object {title,description} and string
  const advHtml = Array.isArray(r.advantages) && r.advantages.length
    ? r.advantages.slice(0,4).map(a => {
        const title = typeof a === "object" ? (a.title||"") : a;
        const desc  = typeof a === "object" ? (a.description||"") : "";
        const icons = ["💰","⏱","📈","🎓","🌍","⚡","🎯","🔄"];
        const icon  = icons[Math.floor(Math.random()*icons.length)];
        return `<div class="bfr-adv-card">
          <div class="bfr-adv-icon">${icon}</div>
          <div class="bfr-adv-title">${escapeHtml(title)}</div>
          ${desc ? `<div class="bfr-adv-desc">${escapeHtml(desc)}</div>` : ""}
        </div>`;
      }).join("")
    : "";

  // Risks
  const risksHtml = Array.isArray(r.risks) && r.risks.length
    ? r.risks.map(risk => `<div class="bfr-risk-item">
        <span class="bfr-risk-arrow">→</span>
        <span>${escapeHtml(typeof risk === "object" ? risk.title||risk : risk)}</span>
      </div>`).join("")
    : "";

  // Roadmap — support both {title,days,emoji} and string
  const roadmapHtml = Array.isArray(r.roadmap30Days) && r.roadmap30Days.length
    ? r.roadmap30Days.map((step, i) => {
        const title = typeof step === "object" ? step.title||step : step;
        const days  = typeof step === "object" ? step.days||`Jours ${i*5+1}-${(i+1)*5}` : `Étape ${i+1}`;
        const emoji = typeof step === "object" ? step.emoji||"🎯" : "🎯";
        const colors= ["#2563eb","#7c3aed","#06b6d4","#10b981","#f59e0b","#ef4444"];
        const color = colors[i % colors.length];
        const isLast= i === r.roadmap30Days.length - 1;
        return `<div class="bfr-timeline-item">
          <div class="bfr-timeline-left">
            <div class="bfr-timeline-dot" style="background:${color};box-shadow:0 0 0 4px ${color}22">${i+1}</div>
            ${!isLast ? '<div class="bfr-timeline-line"></div>' : ""}
          </div>
          <div class="bfr-timeline-content">
            <div class="bfr-timeline-days">${escapeHtml(days)}</div>
            <div class="bfr-timeline-title">${escapeHtml(title)}</div>
          </div>
          <div class="bfr-timeline-emoji">${emoji}</div>
        </div>`;
      }).join("")
    : "";

  // Pro sections
  const proSection = isPro ? `
    <!-- Row: Delay + Potential + Advantages + Risks -->
    <div class="bfr-row-3">
      <div class="bfr-card bfr-card--delay">
        <div class="bfr-card-label">⏱ DÉLAI & POTENTIEL</div>
        <div class="bfr-delay-grid">
          <div class="bfr-delay-item">
            <div class="bfr-delay-icon">⏱</div>
            <div class="bfr-delay-lbl">1ER REVENU</div>
            <div class="bfr-delay-val">${escapeHtml(r.timeToFirstRevenue||"—")}</div>
            <div class="bfr-delay-sub">Délai estimé</div>
          </div>
          <div class="bfr-delay-sep"></div>
          <div class="bfr-delay-item">
            <div class="bfr-delay-icon">💸</div>
            <div class="bfr-delay-lbl">POTENTIEL</div>
            <div class="bfr-delay-val bfr-delay-val--green">${escapeHtml(r.revenuePotential||"—")}</div>
            <div class="bfr-delay-sub">Revenu potentiel</div>
          </div>
        </div>
      </div>

      <div class="bfr-card">
        <div class="bfr-card-label">✅ POINTS FORTS</div>
        <div class="bfr-strengths">
          ${Array.isArray(r.advantages) ? r.advantages.map(a => `
            <div class="bfr-strength-item">
              <span class="bfr-strength-check">✓</span>
              <span>${escapeHtml(typeof a === "object" ? a.title||(a.description||"") : a)}</span>
            </div>`).join("") : ""}
        </div>
      </div>

      <div class="bfr-card">
        <div class="bfr-card-label">⚠️ RISQUES À ANTICIPER</div>
        <div class="bfr-risks">
          ${risksHtml}
        </div>
      </div>
    </div>

    <!-- Roadmap 30 jours -->
    <div class="bfr-card bfr-card--roadmap">
      <div class="bfr-roadmap-header">
        <div class="bfr-card-label" style="margin:0">🗓 ROADMAP 30 JOURS</div>
        <div class="bfr-roadmap-badge">Plan personnalisé</div>
      </div>
      <div class="bfr-timeline">
        ${roadmapHtml}
      </div>
    </div>
  ` : `
    <!-- Pro lock -->
    <div class="bfr-pro-lock">
      <div class="bfr-pro-lock-inner">
        <div class="bfr-pro-lock-icon">🔒</div>
        <div class="bfr-pro-lock-text">
          <div class="bfr-pro-lock-title">Débloquez le plan Pro</div>
          <div class="bfr-pro-lock-desc">Revenus estimés, points forts, risques et roadmap 30 jours complète.</div>
        </div>
      </div>
      <div class="bfr-pro-lock-items">
        <div class="bfr-lock-item"><span>🔒</span> 1er revenu estimé</div>
        <div class="bfr-lock-item"><span>🔒</span> Potentiel mensuel</div>
        <div class="bfr-lock-item"><span>🔒</span> Points forts</div>
        <div class="bfr-lock-item"><span>🔒</span> Risques identifiés</div>
        <div class="bfr-lock-item bfr-lock-item--wide"><span>🔒</span> Roadmap 30 jours</div>
      </div>
      <a href="pricing.html" class="bfr-pro-cta">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Passer au plan Pro
      </a>
    </div>`;

  const container = $("bfResults");
  if (!container) return;

  container.style.cssText = "width:100%;max-width:960px;margin:0 auto";

  container.innerHTML = `
    <div class="bfr-dashboard">

      <!-- Page title -->
      <div class="bfr-page-header">
        <div>
          <h1 class="bfr-page-title">Résultat de votre analyse 🎉</h1>
          <p class="bfr-page-sub">Voici le business le plus adapté à votre profil</p>
        </div>
        <a href="dashboard.html" class="bfr-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Retour au tableau de bord
        </a>
      </div>

      <!-- Row 1: Business hero + Score -->
      <div class="bfr-row-hero">

        <!-- Business card (large left) -->
        <div class="bfr-card bfr-card--business">
          <div class="bfr-business-content">
            <div class="bfr-business-badge">
              <span class="bfr-badge-dot"></span> BUSINESS RECOMMANDÉ
            </div>
            <h2 class="bfr-business-name">${escapeHtml(r.recommendedBusiness||"Business Opportunity")} <span class="bfr-name-dot">●</span></h2>
            <p class="bfr-business-desc">${escapeHtml(r.businessDescription || r.whyItFits?.slice(0,150) || "")}</p>
            <div class="bfr-tags">${tags}</div>
          </div>
          <div class="bfr-business-illustration" aria-hidden="true">
            <div class="bfr-illustration-inner">
              <div class="bfr-ill-chart">
                <div class="bfr-ill-bar" style="height:40%;background:#3b82f6;animation-delay:0s"></div>
                <div class="bfr-ill-bar" style="height:65%;background:#7c3aed;animation-delay:.1s"></div>
                <div class="bfr-ill-bar" style="height:85%;background:#2563eb;animation-delay:.2s"></div>
                <div class="bfr-ill-bar" style="height:55%;background:#818cf8;animation-delay:.3s"></div>
                <div class="bfr-ill-bar" style="height:95%;background:#7c3aed;animation-delay:.4s"></div>
              </div>
              <div class="bfr-ill-coins">💰</div>
            </div>
          </div>
        </div>

        <!-- Score card (right) -->
        <div class="bfr-card bfr-card--score">
          <div class="bfr-card-label">COMPATIBILITÉ</div>
          <div class="bfr-score-ring-wrap">
            <svg viewBox="0 0 130 130" style="width:130px;height:130px">
              <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="11"/>
              <circle cx="65" cy="65" r="52" fill="none"
                stroke="${scoreColor}" stroke-width="11"
                stroke-linecap="round"
                stroke-dasharray="${circ}"
                stroke-dashoffset="${offset}"
                transform="rotate(-90 65 65)"
                style="transition:stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)"/>
            </svg>
            <div class="bfr-score-inner">
              <span class="bfr-score-num">${score}</span>
              <span class="bfr-score-den">/100</span>
            </div>
          </div>
          <div class="bfr-score-label" style="background:${scoreLabelBg};color:${scoreLabelClr}">${scoreLabel}</div>
          <p class="bfr-score-text">Ce business correspond parfaitement à votre profil et à vos objectifs.</p>
        </div>

      </div>

      <!-- Row 2: Why + Difficulty + Budget -->
      <div class="bfr-row-2">

        <!-- Why card (left large) -->
        <div class="bfr-card bfr-card--why">
          <div class="bfr-card-label">💡 POURQUOI CETTE OPPORTUNITÉ ?</div>
          <p class="bfr-why-text">${escapeHtml(r.whyItFits||"")}</p>
          ${advHtml ? `<div class="bfr-adv-grid">${advHtml}</div>` : ""}
        </div>

        <!-- Right column: Difficulty + Budget -->
        <div class="bfr-right-col">
          <div class="bfr-card bfr-card--diff">
            <div class="bfr-card-label">⚡ DIFFICULTÉ</div>
            <div class="bfr-diff-val">${escapeHtml(r.difficulty||"Intermédiaire")}</div>
            <div class="bfr-gauge-track">
              <div class="bfr-gauge-fill" style="width:${diffWidth}%;background:${diffColor}"></div>
            </div>
            <div class="bfr-diff-score">${diffScore}/10</div>
          </div>
          <div class="bfr-card bfr-card--budget">
            <div class="bfr-card-label">💰 BUDGET ESTIMÉ</div>
            <div class="bfr-budget-val">${escapeHtml(r.estimatedBudget||"À définir")}</div>
            <div class="bfr-budget-sub">Budget de démarrage recommandé.</div>
          </div>
        </div>

      </div>

      ${proSection}

      <!-- Actions -->
      <div class="bfr-actions">
        <button class="bfr-btn-ghost" id="bfSaveBtn" onclick="saveBfResult()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
          Sauvegarder cette analyse
        </button>
        <a href="dashboard.html" class="bfr-btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Voir mes analyses
        </a>
        <button class="bfr-btn-ghost" onclick="restartFinder()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.09-5.18"/></svg>
          Nouvelle analyse
        </button>
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

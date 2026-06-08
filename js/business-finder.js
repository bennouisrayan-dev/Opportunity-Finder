/**
 * Business Finder IA — v4 Premium
 * MyIQ-style · Mascotte IA · One question at a time
 * Profile preview · Contextual AI messages · Premium cards
 */

const API_BASE = "https://opportunity-finder-api.onrender.com";
const BF_API   = `${API_BASE}/api/booster/business-finder`;

/* ── Nova — Mascotte premium Opportunity Finder ─────────── */
/* Inspirée de Duolingo · Linear · Arc Browser               */
/* Style: orbe IA futuriste avec loupe d'opportunités        */
const MASCOT_SVG = `<svg class="bfm-svg nova-svg" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Body gradient: deep violet to blue -->
    <radialGradient id="nBodyG" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="60%" stop-color="#3b4fd8"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </radialGradient>
    <!-- Head glow -->
    <radialGradient id="nHeadG" cx="38%" cy="28%" r="65%">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="55%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#312e81"/>
    </radialGradient>
    <!-- Eye left: magnifier/opportunity lens -->
    <radialGradient id="nEyeL" cx="45%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="40%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </radialGradient>
    <!-- Eye right: data eye -->
    <radialGradient id="nEyeR" cx="45%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#d8b4fe"/>
      <stop offset="40%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </radialGradient>
    <!-- Chest glow -->
    <radialGradient id="nChestG" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#0e7490" stop-opacity=".2"/>
    </radialGradient>
    <!-- Halo -->
    <radialGradient id="nHaloG" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity=".18"/>
      <stop offset="100%" stop-color="#4f46e5" stop-opacity="0"/>
    </radialGradient>
    <!-- Arm gradient -->
    <linearGradient id="nArmG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="nGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="nSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- ── Halo ambiant ── -->
  <ellipse cx="70" cy="90" rx="56" ry="44" fill="url(#nHaloG)"/>

  <!-- ── Orbite décorative ── -->
  <ellipse cx="70" cy="80" rx="62" ry="22" stroke="#818cf8" stroke-width="1" stroke-dasharray="3 4" opacity=".35" class="nova-orbit"/>

  <!-- ── Corps principal ── -->
  <rect x="26" y="72" width="88" height="70" rx="24" fill="url(#nBodyG)" filter="url(#nSoftGlow)"/>
  <!-- Reflet supérieur sur le corps -->
  <ellipse cx="70" cy="76" rx="32" ry="7" fill="white" opacity=".07"/>

  <!-- ── Tête ── -->
  <rect x="20" y="18" width="100" height="62" rx="26" fill="url(#nHeadG)" filter="url(#nSoftGlow)"/>
  <!-- Reflet tête -->
  <ellipse cx="58" cy="26" rx="24" ry="7" fill="white" opacity=".14" transform="rotate(-8 58 26)"/>

  <!-- ── Antenne ── -->
  <line x1="70" y1="18" x2="70" y2="5" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Antenne orbe animé -->
  <circle cx="70" cy="4" r="5" fill="#4f46e5" class="nova-antenna-orb"/>
  <circle cx="70" cy="4" r="8" fill="#4f46e5" opacity=".2" class="nova-antenna-pulse"/>

  <!-- ── ŒIL GAUCHE: loupe opportunity ── -->
  <circle cx="45" cy="45" r="16" fill="#0f172a"/>
  <circle cx="45" cy="45" r="13" fill="url(#nEyeL)" class="nova-eye-l"/>
  <!-- Loupe superposée -->
  <circle cx="43" cy="43" r="7" fill="none" stroke="white" stroke-width="2" opacity=".9"/>
  <line x1="48" y1="48" x2="53" y2="53" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>
  <!-- Highlight -->
  <circle cx="40" cy="40" r="2.5" fill="white" opacity=".85"/>

  <!-- ── ŒIL DROIT: data / analyse ── -->
  <circle cx="95" cy="45" r="16" fill="#0f172a"/>
  <circle cx="95" cy="45" r="13" fill="url(#nEyeR)" class="nova-eye-r"/>
  <!-- Lignes données -->
  <line x1="88" y1="43" x2="102" y2="43" stroke="white" stroke-width="1.5" opacity=".7"/>
  <line x1="90" y1="47" x2="100" y2="47" stroke="white" stroke-width="1.2" opacity=".5"/>
  <line x1="92" y1="51" x2="98" y2="51" stroke="white" stroke-width="1" opacity=".35"/>
  <!-- Highlight -->
  <circle cx="91" cy="40" r="2.5" fill="white" opacity=".85"/>

  <!-- ── Sourire premium ── -->
  <path d="M52 66 Q70 78 88 66" stroke="url(#nArmG)" stroke-width="3" stroke-linecap="round" fill="none" opacity=".9"/>

  <!-- ── Joues ── -->
  <ellipse cx="30" cy="58" rx="8" ry="5" fill="#ec4899" opacity=".25"/>
  <ellipse cx="110" cy="58" rx="8" ry="5" fill="#ec4899" opacity=".25"/>

  <!-- ── Panneau de contrôle (hologramme) ── -->
  <rect x="40" y="86" width="60" height="36" rx="12" fill="#0c1445" opacity=".6"/>
  <!-- Mini graphique ascendant -->
  <polyline points="47,112 53,107 60,110 67,100 74,103 81,93 88,96" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" class="nova-chart"/>
  <!-- Indicateur circulaire -->
  <circle cx="92" cy="104" r="5" fill="none" stroke="#a78bfa" stroke-width="1.5" opacity=".8"/>
  <circle cx="92" cy="104" r="2.5" fill="#a78bfa" opacity=".9" class="nova-dot"/>

  <!-- ── Bras ── -->
  <rect x="2" y="80" width="24" height="11" rx="5.5" fill="url(#nArmG)" opacity=".85"/>
  <rect x="114" y="80" width="24" height="11" rx="5.5" fill="url(#nArmG)" opacity=".85"/>
  <!-- Mains -->
  <circle cx="3" cy="85" r="5" fill="#4f46e5" opacity=".7"/>
  <circle cx="137" cy="85" r="5" fill="#06b6d4" opacity=".7"/>

  <!-- ── Pieds arrondis ── -->
  <rect x="34" y="133" width="26" height="14" rx="7" fill="#1e3a8a" opacity=".9"/>
  <rect x="80" y="133" width="26" height="14" rx="7" fill="#312e81" opacity=".9"/>

  <!-- ── Particules holographiques ── -->
  <circle cx="15" cy="38" r="3" fill="#06b6d4" opacity=".5" class="nova-particle p1"/>
  <circle cx="125" cy="55" r="2.5" fill="#a78bfa" opacity=".6" class="nova-particle p2"/>
  <circle cx="18" cy="110" r="2" fill="#38bdf8" opacity=".5" class="nova-particle p3"/>
  <circle cx="122" cy="115" r="3" fill="#818cf8" opacity=".55" class="nova-particle p4"/>

  <!-- Mini graph flottant gauche -->
  <rect x="4" y="58" width="16" height="12" rx="4" fill="#0f172a" opacity=".8" class="nova-float-card"/>
  <polyline points="7,67 10,63 13,65 16,60" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" fill="none"/>

  <!-- Mini % flottant droit -->
  <rect x="120" y="60" width="16" height="12" rx="4" fill="#0f172a" opacity=".8" class="nova-float-card"/>
  <text x="128" y="70" font-size="6" fill="#f59e0b" font-weight="900" text-anchor="middle" font-family="Inter,sans-serif">92%</text>
</svg>`;

/* ── Option icons per question ────────────────────────── */
const OPTION_ICONS = {
  age:               ["🎓","🚀","💼","👔"],
  status:            ["📚","💻","🏢","💡","🌟"],
  weeklyHours:       ["🌙","⚡","🔥","🚀"],
  budget:            ["🌱","💵","💰","💎","🏦"],
  businessLevel:     ["🌱","📈","🎯"],
  techLevel:         ["🖱️","⚙️","💻"],
  interests:         ["🤖","☁️","🛒","🎬","📢","🤝","🏪","📖","💹"],
  goal:              ["💰","🔄","🚀","🌅","🏆"],
  businessPreference:["🌐","📍","🔀","✨"],
  learning:          ["✅","❌"],
  timeGoal:          ["⚡","📅","🗓️","🌱"],
  riskLevel:         ["🛡️","⚖️","🎲"],
  workStyle:         ["🧘","👥","🎯"],
  location:          [],
  experience:        ["🏆","📚","🌟"],
};

/* ── Mascotte contextual messages ────────────────────────── */
const MASCOT_HINTS = {
  age:               "🎓 Cela m'aide à adapter les opportunités à ton niveau d'expérience.",
  status:            "💼 Ton statut actuel influence le temps et les ressources disponibles.",
  weeklyHours:       "⏰ Le temps disponible est un facteur clé pour choisir le bon business.",
  budget:            "💰 Je vais éviter les idées qui dépassent ton budget de départ.",
  businessLevel:     "📈 J'adapte mes recommandations à ton niveau de connaissance.",
  techLevel:         "💻 Je prendrai en compte tes compétences tech pour trouver le bon fit.",
  interests:         "🎯 Plus tu sélectionnes, plus ma recommandation sera précise !",
  goal:              "🌟 Ton objectif principal guide toute l'analyse.",
  businessPreference:"🌐 Le type de business influe sur la flexibilité et les revenus.",
  learning:          "📚 Être ouvert à apprendre ouvre beaucoup plus de portes.",
  timeGoal:          "⏱ Le délai attendu m'aide à calibrer les stratégies adaptées.",
  riskLevel:         "⚖️ Chaque profil de risque correspond à des opportunités différentes.",
  workStyle:         "🤝 La façon de travailler est très importante pour réussir.",
  location:          "📍 La localisation influence les opportunités locales et internationales.",
  experience:        "🏆 Ton expérience passée est un atout que je prendrai en compte.",
};

/* ── Profile preview fields ────────────────────────────── */
const PROFILE_LABELS = {
  age:               { label: "Âge",        icon: "👤" },
  budget:            { label: "Budget",     icon: "💰" },
  weeklyHours:       { label: "Temps",      icon: "⏰" },
  goal:              { label: "Objectif",   icon: "🎯" },
};

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
  { id:"interests",         type:"multi",  title:"Quels domaines t'intéressent le plus ?",
    options:["Intelligence artificielle","SaaS","E-commerce","Création de contenu","Marketing","Services","Business local","Éducation","Finance"] },
  { id:"goal",              type:"single", title:"Quel est ton objectif principal ?",
    options:["Générer un revenu complémentaire","Remplacer mon salaire","Créer une startup","Atteindre la liberté financière","Construire une entreprise revendable"] },
  { id:"businessPreference",type:"single", title:"Quel type de business préfères-tu ?",
    options:["100% en ligne","Local / physique","Hybride","Peu importe"] },
  { id:"learning",          type:"single", title:"Es-tu prêt à apprendre de nouvelles compétences ?",
    options:["Oui, volontiers","Non, je préfère mes compétences actuelles"] },
  { id:"timeGoal",          type:"single", title:"Dans combien de temps veux-tu tes premiers résultats ?",
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
let currentQ      = 0;
let answers       = {};
let currentResult = null;

/* ── DOM helpers ────────────────────────────────────────── */
const $         = id => document.getElementById(id);
const bfxHide   = id => { const el=$(id); if(el) el.classList.add("bfx-hidden"); };
const bfxShow   = id => { const el=$(id); if(el) el.classList.remove("bfx-hidden"); };
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

  if (!user || user.plan === "free") { showFreeGate(); return; }

  showScreen("bfIntro");
  $("bfStartBtn")?.addEventListener("click", startQuestionnaire);
  $("bfQuitBtn")?.addEventListener("click", () => { window.location.href = "dashboard.html"; });
  $("bfBackBtn")?.addEventListener("click", goBack);
  $("bfNextBtn")?.addEventListener("click", goNext);

  // Inject mascot into intro
  const mascotIntro = $("bfMascotIntro");
  if (mascotIntro) mascotIntro.innerHTML = MASCOT_SVG;
  const mascotQuiz  = $("bfMascotQuiz");
  if (mascotQuiz)  mascotQuiz.innerHTML  = MASCOT_SVG;
  const mascotLoad  = $("bfMascotLoad");
  if (mascotLoad)  mascotLoad.innerHTML  = MASCOT_SVG;
});

/* ── Free gate ─────────────────────────────────────────── */
function showFreeGate() {
  const main = $("bfMain");
  if (!main) return;
  main.innerHTML = `
    <div class="bfx-screen">
      <div class="bfx-intro-card" style="text-align:center">
        <div class="bfm-wrap bfm-float" style="margin:0 auto 16px">${MASCOT_SVG}</div>
        <h1 class="bfx-intro-title">Débloquez Business Finder IA</h1>
        <p class="bfx-intro-desc">Découvrez le business le plus adapté à votre profil grâce à une analyse IA avancée.</p>
        <div class="bfx-intro-benefits">
          <div class="bfx-intro-benefit"><span>✅</span> Recommandation personnalisée</div>
          <div class="bfx-intro-benefit"><span>✅</span> Score de compatibilité</div>
          <div class="bfx-intro-benefit"><span>✅</span> Budget & difficulté estimés</div>
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
  const pct   = Math.max(Math.round((currentQ / total) * 100), 4);

  // Progress bar
  const fill = $("bfProgressFill");
  if (fill) fill.style.width = pct + "%";
  const lbl = $("bfStepLabel");
  if (lbl) lbl.textContent = `Question ${currentQ + 1} sur ${total}`;
  const pctEl = $("bfStepPct");
  if (pctEl) pctEl.textContent = pct + "%";

  // Buttons
  const backBtn = $("bfBackBtn");
  const nextBtn = $("bfNextBtn");
  if (backBtn) backBtn.disabled = currentQ === 0;
  if (nextBtn) {
    const isLast = currentQ === total - 1;
    nextBtn.innerHTML = isLast
      ? `Analyser mon profil <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
      : `Continuer <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;
  }

  // Question text
  const qText = $("bfQuestionText");
  if (qText) qText.textContent = q.title;

  // Mascotte hint
  updateMascotHint(q.id);

  // Profile preview
  updateProfilePreview();

  // Animate options
  const area = $("bfOptionsArea");
  if (!area) return;
  area.style.opacity = "0";
  area.style.transform = "translateY(10px)";

  const icons = OPTION_ICONS[q.id] || [];
  const saved = answers[q.id];
  let html = "";

  if (q.type === "single") {
    html = `<div class="bfx-options bfx-options-cards">` +
      q.options.map((opt, i) => {
        const icon = icons[i] || "💡";
        const sel  = saved === opt ? " selected" : "";
        return `<button type="button" class="bfx-card-option${sel}" data-value="${escapeHtml(opt)}">
          <span class="bfx-card-option-icon">${icon}</span>
          <span class="bfx-card-option-text">${escapeHtml(opt)}</span>
          <span class="bfx-card-option-check">✓</span>
        </button>`;
      }).join("") + `</div>`;
  } else if (q.type === "multi") {
    const savedArr = Array.isArray(saved) ? saved : [];
    html = `<div class="bfx-options-multi">` +
      q.options.map((opt, i) => {
        const icon = icons[i] || "💡";
        const sel  = savedArr.includes(opt) ? " selected" : "";
        return `<button type="button" class="bfx-chip-option${sel}" data-value="${escapeHtml(opt)}">
          <span>${icon}</span> ${escapeHtml(opt)}
        </button>`;
      }).join("") + `</div>
      <p class="bfx-multi-hint">Sélectionne tous les domaines qui t'intéressent</p>`;
  } else if (q.type === "text") {
    html = `<div style="padding:4px 0">
      <input type="text" class="bfx-text-input" id="bfTextInput"
        placeholder="${escapeHtml(q.placeholder || "")}"
        value="${escapeHtml(saved || "")}">
    </div>`;
  }

  area.innerHTML = html;

  requestAnimationFrame(() => {
    area.style.transition = "opacity .25s ease, transform .25s ease";
    area.style.opacity = "1";
    area.style.transform = "translateY(0)";
  });

  // Bind single-select — auto advance after 320ms
  area.querySelectorAll(".bfx-card-option").forEach(btn => {
    btn.addEventListener("click", () => {
      area.querySelectorAll(".bfx-card-option").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      answers[q.id] = btn.dataset.value;
      updateProfilePreview();
      // mascot react
      mascotReact();
      setTimeout(() => goNext(), 320);
    });
  });

  area.querySelectorAll(".bfx-chip-option").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("selected");
      answers[q.id] = [...area.querySelectorAll(".bfx-chip-option.selected")].map(b => b.dataset.value);
    });
  });
}

function updateMascotHint(qId) {
  const hint    = $("bfMascotHint");
  const hintWrap= $("bfMascotHintWrap");
  const text    = MASCOT_HINTS[qId] || "🤖 Je construis ton profil en temps réel.";
  if (hint) {
    hint.style.opacity = "0";
    hint.style.transform = "translateY(4px)";
    setTimeout(() => {
      hint.textContent = text;
      hint.style.transition = "opacity .3s ease, transform .3s ease";
      hint.style.opacity = "1";
      hint.style.transform = "translateY(0)";
    }, 100);
  }
}

function mascotReact() {
  const wrap = $("bfMascotQuiz");
  if (!wrap) return;
  wrap.classList.add("bfm-react");
  setTimeout(() => wrap.classList.remove("bfm-react"), 500);
}

function updateProfilePreview() {
  const preview = $("bfProfilePreview");
  if (!preview) return;
  const fields = Object.entries(PROFILE_LABELS);
  preview.innerHTML = fields.map(([key, { label, icon }]) => {
    const val = answers[key];
    const display = val
      ? (Array.isArray(val) ? val.join(", ").slice(0,20) + (val.join("").length>20?"…":"") : val.slice(0,22) + (val.length>22?"…":""))
      : "—";
    const filled = !!val;
    return `<div class="bfx-profile-field${filled ? " filled" : ""}">
      <span class="bfx-profile-icon">${icon}</span>
      <div>
        <div class="bfx-profile-label">${label}</div>
        <div class="bfx-profile-val">${escapeHtml(display)}</div>
      </div>
    </div>`;
  }).join("");
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
  if (q.type === "single" && !answers[q.id]) { Toast.warning("Sélectionne une réponse pour continuer."); return; }
  if (q.type === "multi" && (!Array.isArray(answers[q.id]) || !answers[q.id].length)) { Toast.warning("Sélectionne au moins un domaine."); return; }
  if (currentQ < QUESTIONS.length - 1) { currentQ++; renderQuestion(); }
  else submitQuestionnaire();
}

/* ── Submit ─────────────────────────────────────────────── */
async function submitQuestionnaire() {
  showScreen("bfLoading");
  animateLoadingSteps();

  const token = Auth.getToken();
  if (!token) { Toast.error("Veuillez vous reconnecter"); showScreen("bfQuiz"); return; }

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
    await new Promise(r => setTimeout(r, 2200));
    showResults(result);
  } catch (err) {
    console.error("BF error:", err);
    Toast.error(err.message || "Erreur lors de l'analyse");
    showScreen("bfQuiz");
  }
}

/* ── Loading steps ─────────────────────────────────────── */
function animateLoadingSteps() {
  const steps = [
    { id:"bfLStep1", check:"bfLCheck1", delay:0,    text:"Analyse de vos réponses" },
    { id:"bfLStep2", check:"bfLCheck2", delay:800,  text:"Recherche d'opportunités" },
    { id:"bfLStep3", check:"bfLCheck3", delay:1600, text:"Évaluation du potentiel" },
    { id:"bfLStep4", check:"bfLCheck4", delay:2400, text:"Génération du plan personnalisé" },
  ];
  const emojis = ["🔍","📊","⚡","🚀"];
  steps.forEach(({ id, check, delay }, i) => {
    setTimeout(() => {
      if (i > 0) {
        const prev = $(steps[i-1].id);
        if (prev) { prev.classList.remove("active"); prev.classList.add("done"); }
        const pc = $(steps[i-1].check);
        if (pc) pc.textContent = "✓";
      }
      const el = $(id); if (el) el.classList.add("active");
      const em = $("bfLoadingEmoji"); if (em) em.textContent = emojis[i];
    }, delay);
  });
  // Loading bar progress
  let prog = 5;
  const bar = $("bfLoadingBar");
  const interval = setInterval(() => {
    prog = Math.min(prog + 3, 95);
    if (bar) bar.style.width = prog + "%";
    if (prog >= 95) clearInterval(interval);
  }, 80);
}

/* ── Results — Premium Dashboard ─────────────────────────── */
function showResults(r) {
  const user   = Auth.getUser();
  const isPro  = user?.plan === "pro";

  const score       = r.compatibilityScore || 0;
  const scoreColor  = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel  = score >= 75 ? "Excellente compatibilité ✨" : score >= 50 ? "Bonne compatibilité" : "Compatibilité correcte";
  const scoreLabelBg= score >= 75 ? "rgba(16,185,129,.15)" : score >= 50 ? "rgba(245,158,11,.15)" : "rgba(239,68,68,.15)";
  const scoreLabelClr= score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  // Mascot message based on score
  const mascotMsg = score >= 80
    ? "🎉 J'ai trouvé une opportunité qui correspond très bien à ton profil !"
    : score >= 60
    ? "🚀 Cette opportunité a un excellent potentiel selon tes réponses."
    : "💡 Avec ton profil, voici la recommandation la plus réaliste à lancer.";

  const circ   = 2 * Math.PI * 52;
  const offset = circ - (score / 100) * circ;
  const diffScore = r.difficultyScore || 5;
  const diffWidth = (diffScore / 10) * 100;
  const diffColor = diffScore <= 3 ? "#10b981" : diffScore <= 6 ? "#f59e0b" : "#ef4444";

  const tags = Array.isArray(r.tags) && r.tags.length
    ? r.tags.slice(0,3).map(t => `<span class="bfr-tag">${escapeHtml(t)}</span>`).join("")
    : `<span class="bfr-tag">${escapeHtml(r.businessType||"Business")}</span>`;

  const advHtml = Array.isArray(r.advantages) && r.advantages.length
    ? r.advantages.slice(0,4).map((a, i) => {
        const title = typeof a === "object" ? (a.title||"") : a;
        const desc  = typeof a === "object" ? (a.description||"") : "";
        const icons = ["💰","⏱","📈","🎓"];
        return `<div class="bfr-adv-card">
          <div class="bfr-adv-icon">${icons[i]||"💡"}</div>
          <div class="bfr-adv-title">${escapeHtml(title)}</div>
          ${desc ? `<div class="bfr-adv-desc">${escapeHtml(desc)}</div>` : ""}
        </div>`;
      }).join("") : "";

  const proSection = isPro ? `
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
          ${Array.isArray(r.advantages) ? r.advantages.map(a =>
            `<div class="bfr-strength-item"><span class="bfr-strength-check">✓</span><span>${escapeHtml(typeof a==="object"?a.title||a.description||"":a)}</span></div>`
          ).join("") : ""}
        </div>
      </div>
      <div class="bfr-card">
        <div class="bfr-card-label">⚠️ RISQUES À ANTICIPER</div>
        <div class="bfr-risks">
          ${Array.isArray(r.risks) ? r.risks.map(risk =>
            `<div class="bfr-risk-item"><span class="bfr-risk-arrow">→</span><span>${escapeHtml(typeof risk==="object"?risk.title||risk:risk)}</span></div>`
          ).join("") : ""}
        </div>
      </div>
    </div>
    ${Array.isArray(r.roadmap30Days) && r.roadmap30Days.length ? `
    <div class="bfr-card bfr-card--roadmap">
      <div class="bfr-roadmap-header">
        <div class="bfr-card-label" style="margin:0">🗓 ROADMAP 30 JOURS</div>
        <div class="bfr-roadmap-badge">Plan personnalisé</div>
      </div>
      <div class="bfr-timeline">
        ${r.roadmap30Days.map((step, i) => {
          const title = typeof step==="object"?step.title||step:step;
          const days  = typeof step==="object"?step.days||`Étape ${i+1}`:`Étape ${i+1}`;
          const emoji = typeof step==="object"?step.emoji||"🎯":"🎯";
          const colors= ["#2563eb","#7c3aed","#06b6d4","#10b981","#f59e0b","#ef4444"];
          const color = colors[i%colors.length];
          const isLast= i===r.roadmap30Days.length-1;
          return `<div class="bfr-timeline-item">
            <div class="bfr-timeline-left">
              <div class="bfr-timeline-dot" style="background:${color};box-shadow:0 0 0 4px ${color}22">${i+1}</div>
              ${!isLast?'<div class="bfr-timeline-line"></div>':""}
            </div>
            <div class="bfr-timeline-content">
              <div class="bfr-timeline-days">${escapeHtml(days)}</div>
              <div class="bfr-timeline-title">${escapeHtml(title)}</div>
            </div>
            <div class="bfr-timeline-emoji">${emoji}</div>
          </div>`;
        }).join("")}
      </div>
    </div>` : ""}
  ` : `
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

      <!-- Page header with mascot message -->
      <div class="bfr-page-header">
        <div class="bfr-mascot-result-wrap">
          <div class="bfm-wrap bfm-float bfm-small">${MASCOT_SVG}</div>
          <div class="bfr-mascot-bubble">${mascotMsg}</div>
        </div>
        <a href="dashboard.html" class="bfr-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Retour au tableau de bord
        </a>
      </div>
      <div class="bfr-result-title-row">
        <h1 class="bfr-page-title">Résultat de votre analyse 🎉</h1>
        <p class="bfr-page-sub">Voici le business le plus adapté à votre profil</p>
      </div>

      <!-- Row 1: Business hero + Score -->
      <div class="bfr-row-hero">
        <div class="bfr-card bfr-card--business">
          <div class="bfr-business-content">
            <div class="bfr-business-badge"><span class="bfr-badge-dot"></span> BUSINESS RECOMMANDÉ</div>
            <h2 class="bfr-business-name">${escapeHtml(r.recommendedBusiness||"Business Opportunity")} <span class="bfr-name-dot">●</span></h2>
            <p class="bfr-business-desc">${escapeHtml(r.businessDescription||r.whyItFits?.slice(0,150)||"")}</p>
            <div class="bfr-tags">${tags}</div>
          </div>
          <div class="bfr-business-illustration" aria-hidden="true">
            <div class="bfr-illustration-inner">
              <div class="bfr-ill-chart">
                <div class="bfr-ill-bar" style="height:40%;background:#3b82f6"></div>
                <div class="bfr-ill-bar" style="height:65%;background:#7c3aed"></div>
                <div class="bfr-ill-bar" style="height:85%;background:#2563eb"></div>
                <div class="bfr-ill-bar" style="height:55%;background:#818cf8"></div>
                <div class="bfr-ill-bar" style="height:95%;background:#7c3aed"></div>
              </div>
              <div class="bfr-ill-coins">💰</div>
            </div>
          </div>
        </div>
        <div class="bfr-card bfr-card--score">
          <div class="bfr-card-label">COMPATIBILITÉ</div>
          <div class="bfr-score-ring-wrap">
            <svg viewBox="0 0 130 130" style="width:130px;height:130px">
              <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="11"/>
              <circle cx="65" cy="65" r="52" fill="none" stroke="${scoreColor}" stroke-width="11"
                stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
                transform="rotate(-90 65 65)" style="transition:stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)"/>
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
        <div class="bfr-card bfr-card--why">
          <div class="bfr-card-label">💡 POURQUOI CETTE OPPORTUNITÉ ?</div>
          <p class="bfr-why-text">${escapeHtml(r.whyItFits||"")}</p>
          ${advHtml ? `<div class="bfr-adv-grid">${advHtml}</div>` : ""}
        </div>
        <div class="bfr-right-col">
          <div class="bfr-card bfr-card--diff">
            <div class="bfr-card-label">⚡ DIFFICULTÉ</div>
            <div class="bfr-diff-val">${escapeHtml(r.difficulty||"Intermédiaire")}</div>
            <div class="bfr-gauge-track"><div class="bfr-gauge-fill" style="width:${diffWidth}%;background:${diffColor}"></div></div>
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
    if (!response.ok) throw new Error(data.error || "Erreur");
    Toast.success("Analyse sauvegardée !");
    if (btn) { btn.innerHTML = `✓ Sauvegardée`; btn.style.background = "linear-gradient(135deg,#059669,#10b981)"; btn.style.color = "white"; btn.style.borderColor = "transparent"; }
  } catch (err) {
    Toast.error(err.message || "Impossible de sauvegarder");
    if (btn) { btn.disabled = false; btn.innerHTML = `Sauvegarder cette analyse`; }
  }
}

function escapeHtml(str) {
  if (typeof str !== "string") return String(str || "");
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

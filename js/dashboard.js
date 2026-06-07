/**
 * Opportunity Finder - Dashboard
 */

let currentAnalysis = null;
let currentMode = "generate";
let selectedCategory = null;
let loadingInterval = null;

const dashboardState = {
  history: [],
  saved: []
};

let showAllHistory = false;
let showAllSaved = false;

async function initDashboard() {
  renderUserInfo();
  renderAnalysisLimit();
  bindDashboardEvents();
  await refreshDashboardData();
}

async function refreshDashboardData() {
  await Promise.all([
    renderHistory(),
    loadSavedAnalyses()
  ]);

  renderUserInfo();
  renderAnalysisLimit();
  updateDashboardStats();
  renderHeroCard();
  renderLastResult();
}

function renderUserInfo() {
  const user = Auth.getUser();
  if (!user) return;

  const sidebarName = DOM.$(".sidebar-user-name");
  const sidebarPlan = DOM.$(".sidebar-user-plan");
  const sidebarAvatar = DOM.$("#sidebarAvatar");

  if (sidebarName) sidebarName.textContent = user.name;
  if (sidebarAvatar) {
    sidebarAvatar.textContent = user.name?.charAt(0)?.toUpperCase() || "U";
  }

  if (sidebarPlan) {
    const planName =
      user.plan === "free"
        ? "Forfait Gratuit"
        : user.plan === "premium"
        ? "Forfait Premium"
        : "Forfait Pro";

    sidebarPlan.textContent = planName;
  }
}

function updateDashboardStats() {
  const user = Auth.getUser();
  const generated = dashboardState.history.filter(h => h.analysisType === "generate").length;
  const evaluated = dashboardState.history.filter(h => h.analysisType === "evaluate").length;
  const savedCount = dashboardState.saved.length;

  const creditsEl = document.getElementById("statCredits");
  const generatedEl = document.getElementById("statGenerated");
  const evaluatedEl = document.getElementById("statEvaluated");
  const savedEl = document.getElementById("statSaved");

  if (creditsEl && user) {
    const remaining =
      user.plan === "free"
        ? Math.max(0, (user.analysesLimit || 2) - (user.analysesUsed || 0))
        : "∞";
    creditsEl.textContent = remaining;
  }

  if (generatedEl) generatedEl.textContent = generated;
  if (evaluatedEl) evaluatedEl.textContent = evaluated;
  if (savedEl) savedEl.textContent = savedCount;
}

function renderAnalysisLimit() {
  const user = Auth.getUser();
  if (!user) return;

  const limitContainer = DOM.$("#analysisLimitContainer");
  if (!limitContainer) return;

  if (user.plan !== "free") {
    limitContainer.innerHTML = "";
    return;
  }

  const remaining = Auth.getRemainingAnalyses();
  const used = user.analysesUsed || 0;
  const limit = user.analysesLimit || 2;

  if (remaining === 0) {
    limitContainer.innerHTML = `
      <div class="limit-warning limit-warning-premium">
        <div class="limit-warning-header">
          <span class="limit-warning-icon">🚀</span>
          <div>
            <div class="limit-warning-title">Vous avez déjà découvert ${used} opportunité${used > 1 ? "s" : ""}</div>
            <div class="limit-warning-text">La plupart des utilisateurs Premium analysent 15 à 20 idées avant de lancer leur projet.</div>
          </div>
        </div>
        <div class="limit-features-grid">
          <span class="limit-feature-item">✓ Analyses illimitées</span>
          <span class="limit-feature-item">✓ Sauvegarde des idées</span>
          <span class="limit-feature-item">✓ Historique complet</span>
          <span class="limit-feature-item">✓ GPT-4o Premium</span>
          <span class="limit-feature-item">✓ Futures fonctionnalités exclusives</span>
        </div>
        <a href="pricing.html" class="btn btn-primary limit-cta-btn">Passer Premium →</a>
      </div>
    `;
    return;
  }

  limitContainer.innerHTML = `
    <div class="upgrade-banner">
      <div class="upgrade-title">Forfait Gratuit</div>
      <div class="upgrade-description">
        Vous avez utilisé ${used} crédit${used > 1 ? "s" : ""} sur ${limit}. 
        <strong>${remaining} crédit${remaining > 1 ? "s" : ""} restant${remaining > 1 ? "s" : ""}</strong>
      </div>
      <a href="pricing.html" class="btn btn-white btn-sm">Passer à l'Illimité</a>
    </div>
  `;
}

function bindDashboardEvents() {
  bindModeSwitcher();
  bindCategoryTags();

  DOM.$("#generateBtn")?.addEventListener("click", handleGenerate);
  DOM.$("#evaluateBtn")?.addEventListener("click", handleEvaluate);

  document.removeEventListener("click", handleDashboardDynamicClicks);
  document.addEventListener("click", handleDashboardDynamicClicks);
}

function handleDashboardDynamicClicks(e) {
  const saveBtn = e.target.closest("#saveBtn");
  const favoriteBtn = e.target.closest("#favoriteBtn");
  const exportBtn = e.target.closest("#exportBtn");
  const shareBtn = e.target.closest("#shareBtn");
  const newAnalysisBtn = e.target.closest("#newAnalysisBtn");
  const boosterLaunchBtn = e.target.closest("#boosterLaunchBtn");
  const boosterSubmitBtn = e.target.closest("#boosterSubmitBtn");
  const boosterCloseModal = e.target.closest("#boosterCloseModal, .ob-modal-overlay");
  const toggleHistoryBtn = e.target.closest("#toggleHistoryBtn");
const toggleSavedBtn = e.target.closest("#toggleSavedBtn");
const historyItem = e.target.closest("[data-history-id]");
const savedItem = e.target.closest("[data-saved-id]");

// Expand/collapse detail rows on click
const detailRow = e.target.closest(".rv-detail-row");
if (detailRow && !saveBtn && !newAnalysisBtn) {
  detailRow.classList.toggle("rv-expanded");
}

if (toggleHistoryBtn) {
  showAllHistory = !showAllHistory;
  renderHistoryList();
}

if (toggleSavedBtn) {
  showAllSaved = !showAllSaved;
  renderSavedAnalyses(dashboardState.saved);
}

if (historyItem) {
  const id = historyItem.dataset.historyId;
  openAnalysisFromList(id, dashboardState.history);
}

if (savedItem) {
  const id = savedItem.dataset.savedId;
  openAnalysisFromList(id, dashboardState.saved);
}

  if (saveBtn) handleSave();
  if (favoriteBtn) handleFavorite();
  if (exportBtn) handleExport();
  if (shareBtn) handleShare();
  if (newAnalysisBtn) hideResults();
  if (boosterLaunchBtn) handleBoosterLaunch();
  if (boosterSubmitBtn) handleBoosterSubmit();
  if (boosterCloseModal) closeBoosterModal();
}

function bindModeSwitcher() {
  const btnModeGenerate = DOM.$("#btnModeGenerate");
  const btnModeEvaluate = DOM.$("#btnModeEvaluate");

  if (btnModeGenerate && !btnModeGenerate.dataset.bound) {
    btnModeGenerate.addEventListener("click", () => switchMode("generate"));
    btnModeGenerate.dataset.bound = "true";
  }

  if (btnModeEvaluate && !btnModeEvaluate.dataset.bound) {
    btnModeEvaluate.addEventListener("click", () => switchMode("evaluate"));
    btnModeEvaluate.dataset.bound = "true";
  }

  const btnModeFinder = DOM.$("#btnModeFinder");
  if (btnModeFinder && !btnModeFinder.dataset.bound) {
    btnModeFinder.addEventListener("click", () => {
      const user = Auth.getUser();
      if (!user || user.plan === "free") {
        Toast.warning("Business Finder IA est réservé aux plans Premium et Pro");
        setTimeout(() => { window.location.href = "pricing.html"; }, 1200);
        return;
      }
      window.location.href = "business-finder.html";
    });
    btnModeFinder.dataset.bound = "true";
  }
}

function switchMode(mode) {
  currentMode = mode;

  const btnModeGenerate = DOM.$("#btnModeGenerate");
  const btnModeEvaluate = DOM.$("#btnModeEvaluate");
  const modeGenerate = DOM.$("#modeGenerate");
  const modeEvaluate = DOM.$("#modeEvaluate");

  if (btnModeGenerate) btnModeGenerate.classList.toggle("active", mode === "generate");
  if (btnModeEvaluate) btnModeEvaluate.classList.toggle("active", mode === "evaluate");
  if (modeGenerate) modeGenerate.classList.toggle("active", mode === "generate");
  if (modeEvaluate) modeEvaluate.classList.toggle("active", mode === "evaluate");

  hideResults();
}

function bindCategoryTags() {
  const tags = document.querySelectorAll(".category-tag");

  tags.forEach(tag => {
    if (tag.dataset.bound === "true") return;

    tag.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      tags.forEach(t => t.classList.remove("active", "selected"));
      tag.classList.add("active", "selected");

      selectedCategory = tag.dataset.category;
      console.log("Catégorie sélectionnée:", selectedCategory);
    });

    tag.dataset.bound = "true";
  });
}

async function handleGenerate(e) {
  e.preventDefault();

  const user = Auth.getUser();
  if (!user) {
    Toast.error("Veuillez vous connecter pour générer des idées");
    return;
  }

  if (!Auth.canAnalyze()) {
    Toast.warning("Vous avez épuisé vos crédits. Passez à la version supérieure.");
    return;
  }

  showLoading("generate");

  try {
    const token = Auth.getToken();

    const response = await fetch("https://opportunity-finder-api.onrender.com/api/analyze/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        category: selectedCategory
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Erreur lors de la génération");
    }

    currentAnalysis = {
      id: data.analysis.id,
      analysisType: data.analysis.analysisType,
      category: data.analysis.category,
      ...data.analysis.result
    };

    if (data.user) {
  Auth.updateUser(data.user);
}

await refreshDashboardData();

showGenerateResults(currentAnalysis);

Toast.success("Idée générée avec succès");
  } catch (error) {
    console.error("Erreur generate:", error);
    Toast.error(error.message || "Impossible de générer l'idée");
  } finally {
    hideLoading();
  }
}

async function handleEvaluate(e) {
  e.preventDefault();

  const user = Auth.getUser();
  if (!user) {
    Toast.error("Veuillez vous connecter pour évaluer votre idée");
    return;
  }

  if (!Auth.canAnalyze()) {
    Toast.warning("Vous avez épuisé vos crédits. Passez à la version supérieure.");
    return;
  }

  const ideaInput = DOM.$("#ideaInput");
  const userIdea = ideaInput?.value?.trim() || "";

  if (!userIdea || userIdea.length < 10) {
    Toast.error("Veuillez décrire votre idée en au moins 10 caractères");
    return;
  }

  showLoading("evaluate");

  try {
    const token = Auth.getToken();

    const response = await fetch("https://opportunity-finder-api.onrender.com/api/analyze/evaluate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        idea: userIdea
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Erreur lors de l'évaluation");
    }

    currentAnalysis = {
      id: data.analysis.id,
      analysisType: data.analysis.analysisType,
      input: data.analysis.input,
      ...data.analysis.result
    };

   if (data.user) {
  Auth.updateUser(data.user);
}

await refreshDashboardData();

showEvaluateResults(currentAnalysis);

Toast.success("Idée évaluée avec succès");
  } catch (error) {
    console.error("Erreur evaluate:", error);
    Toast.error(error.message || "Impossible d'évaluer l'idée");
  } finally {
    hideLoading();
  }
}

function showLoading(type = "generate") {
  const loadingEl = DOM.$("#loadingState");
  const resultsEl = DOM.$("#resultsContainer");
  const loadingText = DOM.$("#loadingText");
  const generateBtn = DOM.$("#generateBtn");
  const evaluateBtn = DOM.$("#evaluateBtn");

  const generateSteps = [
    "Analyse du marché en cours...",
    "Recherche d’une opportunité rentable...",
    "Évaluation de la demande...",
    "Analyse de la concurrence...",
    "Construction du plan business...",
    "Finalisation de votre idée..."
  ];

  const evaluateSteps = [
    "Analyse de votre idée...",
    "Évaluation du potentiel marché...",
    "Analyse de la concurrence...",
    "Détection des forces et faiblesses...",
    "Recherche d’améliorations possibles...",
    "Préparation de la recommandation finale..."
  ];

  const steps = type === "evaluate" ? evaluateSteps : generateSteps;
  let index = 0;

  if (resultsEl) resultsEl.classList.add("hidden");
  if (loadingEl) loadingEl.classList.remove("hidden");

  if (loadingText) {
    loadingText.innerHTML = `
      <strong>${steps[index]}</strong>
      <span style="display:block;margin-top:8px;color:var(--gray-500);font-size:0.95rem;">
        Cela peut prendre quelques secondes, l’IA prépare une analyse complète.
      </span>
    `;
  }

  clearInterval(loadingInterval);

  loadingInterval = setInterval(() => {
    index = (index + 1) % steps.length;

    if (loadingText) {
      loadingText.innerHTML = `
        <strong>${steps[index]}</strong>
        <span style="display:block;margin-top:8px;color:var(--gray-500);font-size:0.95rem;">
          Cela peut prendre quelques secondes, l’IA prépare une analyse complète.
        </span>
      `;
    }
  }, 2200);

  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="loading-spinner" style="width:16px;height:16px;border-width:2px;margin:0;"></span> Génération...';
  }

  if (evaluateBtn) {
    evaluateBtn.disabled = true;
    evaluateBtn.innerHTML = '<span class="loading-spinner" style="width:16px;height:16px;border-width:2px;margin:0;"></span> Analyse...';
  }
}

function hideLoading() {
  const loadingEl = DOM.$("#loadingState");
  const generateBtn = DOM.$("#generateBtn");
  const evaluateBtn = DOM.$("#evaluateBtn");

  clearInterval(loadingInterval);
  loadingInterval = null;

  if (loadingEl) loadingEl.classList.add("hidden");

  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span class="icon">✨</span><span>Générer une idée business</span>';
  }

  if (evaluateBtn) {
    evaluateBtn.disabled = false;
    evaluateBtn.innerHTML = '<span class="icon">📊</span><span>Analyser mon idée</span>';
  }
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderList(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<div class="result-value">Non disponible</div>`;
  }

  return `
    <ul style="padding-left: 20px; margin: 0;">
      ${items.map(item => `<li style="margin-bottom: 8px;">${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderTargetUsersGenerate(targetUsers) {
  if (Array.isArray(targetUsers)) {
    return renderList(targetUsers);
  }

  return `<div class="result-value">${escapeHtml(targetUsers || "Non disponible")}</div>`;
}

function renderPersona(persona) {
  if (!persona) return "";

  return `
    <div class="result-section">
      <div class="result-label">🎯 Persona Principal</div>
      <div class="result-value">
        <div><strong>Nom :</strong> ${escapeHtml(persona.name || "-")}</div>
        <div><strong>Problème :</strong> ${escapeHtml(persona.painPoint || "-")}</div>
        <div><strong>Objectif :</strong> ${escapeHtml(persona.goal || "-")}</div>
        ${persona.whereToFind ? `<div><strong>Où le trouver :</strong> ${escapeHtml(persona.whereToFind)}</div>` : ""}
      </div>
    </div>
  `;
}

function renderCompetitors(competitors) {
  if (!Array.isArray(competitors) || competitors.length === 0) return "";

  return `
    <div class="result-section">
      <div class="result-label">⚔️ Concurrents Potentiels</div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${competitors.map(item => `
          <div style="background: white; padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--gray-200);">
            <div style="font-weight: 700; color: var(--gray-900);">${escapeHtml(item.name || "Concurrent")}</div>
            ${item.strength ? `<div style="margin-top: 6px; color: var(--gray-700);"><strong>Force :</strong> ${escapeHtml(item.strength)}</div>` : ""}
            ${item.weakness ? `<div style="margin-top: 6px; color: var(--gray-700);"><strong>Faiblesse :</strong> ${escapeHtml(item.weakness)}</div>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderPlanSteps(title, icon, steps) {
  if (!Array.isArray(steps) || steps.length === 0) return "";

  return `
    <div class="result-section">
      <div class="result-label">${icon} ${escapeHtml(title)}</div>
      <div class="result-value">
        <ol style="padding-left: 20px; margin: 0;">
          ${steps.map(step => `<li style="margin-bottom: 8px;">${escapeHtml(step)}</li>`).join("")}
        </ol>
      </div>
    </div>
  `;
}

function getOpportunityLabel(score) {
  if (score >= 80) return "🔥 Opportunité excellente";
  if (score >= 65) return "🟢 Très bonne opportunité";
  if (score >= 45) return "🟡 Opportunité correcte";
  return "🔴 Opportunité risquée";
}

function getScoreClass(score) {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function renderPremiumSection(icon, title, content) {
  if (!content) return "";

  return `
    <div class="premium-result-section">
      <div class="premium-section-title">
        <span>${icon}</span>
        <span>${title}</span>
      </div>
      <div class="premium-section-content">
        ${content}
      </div>
    </div>
  `;
}

function renderPremiumList(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<p>Non disponible</p>`;
  }

  return `
    <div class="premium-list">
      ${items.map(item => `
        <div class="premium-list-item">
          <span>✓</span>
          <p>${escapeHtml(item)}</p>
        </div>
      `).join("")}
    </div>
  `;
}


/* ─────────────────────────────────────────────────────────
   RESULT RENDERING — Premium redesign v3
   ───────────────────────────────────────────────────────── */

/* Helpers shared by both result views */
function buildScoreCircle(score) {
  const r = 52, cx = 64, cy = 64, size = 128;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 70 ? "#10b981" : pct >= 45 ? "#f59e0b" : "#ef4444";
  return `
    <div class="rv-score-ring">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="9"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
          stroke="${color}" stroke-width="9"
          stroke-linecap="round"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
          transform="rotate(-90 ${cx} ${cy})"
          style="transition:stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)"/>
      </svg>
      <div class="rv-score-ring-inner">
        <span class="rv-score-num">${score}</span>
        <span class="rv-score-sub">/100</span>
      </div>
    </div>`;
}

function buildKpiCard(icon, label, score) {
  const barColor = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
  const sparkPoints = Array.from({length: 8}, (_, i) => {
    const x = 4 + i * 16;
    const y = 36 - Math.round(Math.random() * 18 + (score / 100) * 10);
    return `${x},${y}`;
  }).join(" ");
  return `
    <div class="rv-kpi-card">
      <div class="rv-kpi-top">
        <span class="rv-kpi-icon">${icon}</span>
        <span class="rv-kpi-label">${label}</span>
      </div>
      <div class="rv-kpi-score">${score}<span class="rv-kpi-denom">/100</span></div>
      <svg class="rv-kpi-spark" viewBox="0 0 132 40" preserveAspectRatio="none">
        <polyline points="${sparkPoints}" fill="none" stroke="${barColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
      </svg>
      <div class="rv-kpi-bar-bg">
        <div class="rv-kpi-bar-fill" style="width:${score}%;background:${barColor}"></div>
      </div>
    </div>`;
}

function buildDetailRow(icon, title, content) {
  if (!content || content === "<p>Non disponible</p>") return "";
  return `
    <div class="rv-detail-row">
      <div class="rv-detail-row-left">
        <div class="rv-detail-icon">${icon}</div>
        <div class="rv-detail-body">
          <div class="rv-detail-title">${title}</div>
          <div class="rv-detail-content">${content}</div>
        </div>
      </div>
      <svg class="rv-detail-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>`;
}

/* Splits roadmap items into weekly groups of ~2-3 tasks each */
function buildRoadmap(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "<p>Non disponible</p>";

  const WEEK_SIZE = 2;
  const weeks = [];
  for (let i = 0; i < items.length; i += WEEK_SIZE) {
    weeks.push(items.slice(i, i + WEEK_SIZE));
  }

  const weekLabels = ["Semaine 1", "Semaine 2", "Semaine 3", "Semaine 4", "Semaine 5", "Semaine 6"];
  const weekColors = ["#2563eb", "#4f46e5", "#7c3aed", "#6d28d9", "#0891b2", "#059669"];

  return `<div class="rv-roadmap">${weeks.map((group, wi) => `
    <div class="rv-roadmap-week">
      <div class="rv-roadmap-week-label" style="color:${weekColors[wi] || "#7c3aed"}">
        <span class="rv-roadmap-week-dot" style="background:${weekColors[wi] || "#7c3aed"}"></span>
        ${weekLabels[wi] || `Semaine ${wi + 1}`}
      </div>
      <div class="rv-roadmap-tasks">
        ${group.map((task, ti) => `
          <div class="rv-roadmap-task">
            <span class="rv-roadmap-check">✓</span>
            <span class="rv-roadmap-task-text">${escapeHtml(task)}</span>
          </div>`).join("")}
      </div>
    </div>`).join("")}
  </div>`;
}

function buildResultLayout({ badges, nameHtml, sloganHtml, scoreVal, scoreLabel, scorePotential, kpis, detailRows, upgradeBox, analysisDate, analysisDuration, analysisModel, analysisTip }) {
  const now = analysisDate || new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const potentialText = scorePotential || (scoreVal >= 80 ? "Très fort potentiel" : scoreVal >= 65 ? "Fort potentiel" : scoreVal >= 45 ? "Potentiel correct" : "Potentiel risqué");
  const heroDesc = scoreVal >= 80
    ? "Très fort potentiel de succès pour cette idée de business."
    : scoreVal >= 65 ? "Bonne opportunité avec un fort potentiel de marché."
    : scoreVal >= 45 ? "Opportunité correcte, à valider avec soin."
    : "Opportunité risquée — analysez bien les faiblesses avant de vous lancer.";

  return `
    <div class="rv-card fade-in">

      <!-- ══ HERO ══ -->
      <div class="rv-hero">
        <div class="rv-hero-score-col">
          ${buildScoreCircle(scoreVal)}
        </div>
        <div class="rv-hero-info-col">
          <div class="rv-badges">${badges}</div>
          ${nameHtml ? `<div class="rv-hero-name">${nameHtml}</div>` : ""}
          ${sloganHtml ? `<div class="rv-hero-slogan">${sloganHtml}</div>` : ""}
          <h2 class="rv-hero-label">${scoreLabel}</h2>
          <div class="rv-hero-potential">
            <span class="rv-potential-dot"></span>${potentialText}
          </div>
          <p class="rv-hero-desc">${heroDesc}</p>
        </div>
        <div class="rv-hero-kpis">
          ${kpis}
        </div>
      </div>

      <!-- ══ BODY ══ -->
      <div class="rv-body">

        <!-- Detail list -->
        <div class="rv-detail-card">
          <div class="rv-detail-header">Analyse détaillée</div>
          <div class="rv-detail-list">
            ${detailRows}
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="rv-sidebar">
          <div class="rv-sidebar-card">
            <div class="rv-sidebar-title">À propos de cette analyse</div>
            <div class="rv-sidebar-rows">
              <div class="rv-sidebar-row">
                <div class="rv-sidebar-row-icon" style="background:#eff6ff;color:#2563eb">📅</div>
                <div>
                  <div class="rv-sidebar-row-label">Date d'analyse</div>
                  <div class="rv-sidebar-row-val">${now}</div>
                </div>
              </div>
              <div class="rv-sidebar-row">
                <div class="rv-sidebar-row-icon" style="background:#f5f3ff;color:#7c3aed">✨</div>
                <div>
                  <div class="rv-sidebar-row-label">Modèle utilisé</div>
                  <div class="rv-sidebar-row-val">${analysisModel || "GPT-4o"} <span class="rv-badge-premium">Premium</span></div>
                </div>
              </div>
              <div class="rv-sidebar-row">
                <div class="rv-sidebar-row-icon" style="background:#ecfdf5;color:#10b981">⏱</div>
                <div>
                  <div class="rv-sidebar-row-label">Durée d'analyse</div>
                  <div class="rv-sidebar-row-val">${analysisDuration || "~2 min"}</div>
                </div>
              </div>
              <div class="rv-sidebar-row">
                <div class="rv-sidebar-row-icon" style="background:#eff6ff;color:#2563eb">🛡</div>
                <div>
                  <div class="rv-sidebar-row-label">Fiabilité des données</div>
                  <div class="rv-sidebar-row-val" style="color:#10b981;font-weight:700">Élevée</div>
                </div>
              </div>
            </div>
          </div>

          <div class="rv-tip-card">
            <div class="rv-tip-header">
              <span class="rv-tip-icon">✦</span>
              <span class="rv-tip-title">Conseil</span>
            </div>
            <p class="rv-tip-text">${escapeHtml(analysisTip || "Validez cette idée en créant une landing page et en testant l'intérêt de votre audience avant de développer votre MVP.")}</p>
          </div>
        </aside>

      </div><!-- /rv-body -->

      ${upgradeBox ? `<div class="rv-upgrade-box">${upgradeBox}</div>` : ""}

      <!-- ══ PREMIUM LOCKED SECTION (free users) ══ -->
      ${upgradeBox ? `
      <div class="rv-premium-locked">
        <div class="rv-premium-locked-header">
          <span>🔒</span>
          <div>
            <div class="rv-premium-locked-title">Analyse avancée Premium</div>
            <div class="rv-premium-locked-sub">Débloquez l'analyse complète pour prendre la bonne décision</div>
          </div>
        </div>
        <div class="rv-premium-locked-items">
          <div class="rv-locked-item"><span class="rv-locked-icon">🔒</span><span>Budget de lancement estimé</span></div>
          <div class="rv-locked-item"><span class="rv-locked-icon">🔒</span><span>Difficulté de mise en œuvre</span></div>
          <div class="rv-locked-item"><span class="rv-locked-icon">🔒</span><span>Analyse concurrentielle avancée</span></div>
          <div class="rv-locked-item"><span class="rv-locked-icon">🔒</span><span>Plan marketing recommandé</span></div>
          <div class="rv-locked-item"><span class="rv-locked-icon">🔒</span><span>Roadmap 30 jours</span></div>
        </div>
        <a href="pricing.html" class="btn btn-primary rv-locked-cta">Débloquer Premium →</a>
      </div>` : ""}

      <!-- ══ ACTIONS ══ -->
      <div class="rv-actions">
        <button class="rv-btn-primary btn btn-primary" id="saveBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Sauvegarder cette idée
        </button>
        <button class="rv-btn-secondary btn btn-ghost" id="newAnalysisBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.09-5.18"/></svg>
          Générer une autre idée
        </button>
      </div>

      <!-- ══ OPPORTUNITY BOOSTER AI ══ -->
      <div class="ob-card" id="opportunityBoosterCard">
        <div class="ob-card-inner">
          <div class="ob-card-left">
            <div class="ob-badge">✨ PREMIUM</div>
            <h3 class="ob-title">🚀 Opportunity Booster AI</h3>
            <p class="ob-desc">Découvrez si cette opportunité est vraiment adaptée à votre profil, votre budget et votre expérience.</p>
            <div class="ob-benefits">
              <div class="ob-benefit"><span class="ob-benefit-icon">🎯</span> Analyse personnalisée selon votre profil</div>
              <div class="ob-benefit"><span class="ob-benefit-icon">💰</span> Plan d'action adapté à votre budget</div>
              <div class="ob-benefit"><span class="ob-benefit-icon">⚡</span> Conseils concrets pour lancer plus vite</div>
            </div>
          </div>
          <div class="ob-card-right">
            <button class="ob-cta-btn" id="boosterLaunchBtn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Lancer mon analyse personnalisée
            </button>
          </div>
        </div>
      </div>

      <!-- ══ BOOSTER RESULT (injected here) ══ -->
      <div id="boosterResultContainer"></div>

    </div>`;
}

/* ─ showGenerateResults ─────────────────────────────────── */
function showGenerateResults(analysis) {
  const resultsEl = DOM.$("#resultsContainer");
  if (!resultsEl) return;

  const user = Auth.getUser();
  const isPremium = user && (user.plan === "premium" || user.plan === "pro");
  const isPro = user && user.plan === "pro";

  const demand      = analysis?.scores?.demand      ?? 0;
  const competition = analysis?.scores?.competition ?? 0;
  const opportunity = analysis?.scores?.opportunity ?? 0;
  const scoreLabel  = getOpportunityLabel(opportunity);

  const targetUsers = Array.isArray(analysis.targetUsers)
    ? analysis.targetUsers.join(", ")
    : (analysis.targetUsers || "Non disponible");

  const badges = `
    <span class="rv-badge">💡 Idée générée</span>
    <span class="rv-badge">${escapeHtml(analysis.businessType || "Business")}</span>
  `;

  const kpis =
    buildKpiCard("📈", "Demande",      demand)     +
    buildKpiCard("👥", "Concurrence",  competition) +
    buildKpiCard("🎯", "Opportunité",  opportunity);

  const detailRows = [
    buildDetailRow("🛡", "Problème détecté",
      `<p>${escapeHtml(analysis.problem || "Non disponible")}</p>`),
    buildDetailRow("💡", "Idée de business",
      `<p>${escapeHtml(analysis.idea || "Non disponible")}</p>`),
    buildDetailRow("👥", "Utilisateurs ciblés",
      `<p>${escapeHtml(targetUsers)}</p>`),
    buildDetailRow("💰", "Monétisation",
      `<p>${escapeHtml(analysis.pricing || analysis.monetization || "Non disponible")}</p>`),
    isPremium && analysis.features?.length
      ? buildDetailRow("✨", "Offres / fonctionnalités clés", renderPremiumList(analysis.features))
      : "",
    isPremium && analysis.whyNow
      ? buildDetailRow("⏰", "Pourquoi maintenant",
          `<p>${escapeHtml(analysis.whyNow)}</p>`)
      : "",
    isPro && analysis.acquisitionChannels?.length
      ? buildDetailRow("📣", "Canaux d'acquisition", renderPremiumList(analysis.acquisitionChannels))
      : "",
    isPro && analysis.positioning
      ? buildDetailRow("🧭", "Positionnement",
          `<p>${escapeHtml(analysis.positioning)}</p>`)
      : "",
    isPro && analysis.roadmap30Days?.length
      ? buildDetailRow("🚀", "Roadmap 30 jours", buildRoadmap(analysis.roadmap30Days))
      : "",
  ].filter(Boolean).join("");

  const upgradeBox = !isPremium ? `
    <div class="rv-upgrade-inner">
      <div>
        <strong>🔒 Débloquez l'analyse complète</strong>
        <p>Cible détaillée, pricing, plan de lancement, acquisition et insights avancés.</p>
      </div>
      <a href="pricing.html" class="btn btn-primary rv-upgrade-btn">Passer à Premium</a>
    </div>` : "";

  resultsEl.innerHTML = buildResultLayout({
    badges,
    nameHtml: analysis.name ? `<span class="rv-hero-business-name">${escapeHtml(analysis.name)}</span>` : "",
    sloganHtml: analysis.slogan ? escapeHtml(analysis.slogan) : "",
    scoreVal: opportunity, scoreLabel, kpis,
    detailRows, upgradeBox,
    analysisTip: analysis.tip || analysis.advice || null,
  });
  resultsEl.classList.remove("hidden");
}

/* ─ showEvaluateResults ─────────────────────────────────── */
function showEvaluateResults(analysis) {
  const resultsEl = DOM.$("#resultsContainer");
  if (!resultsEl) return;

  const user = Auth.getUser();
  const isPro = user && user.plan === "pro";

  const demand        = analysis?.scores?.demand        ?? 0;
  const competition   = analysis?.scores?.competition   ?? 0;
  const opportunity   = analysis?.scores?.opportunity   ?? 0;
  const profitability = analysis?.scores?.profitability;
  const launchSpeed   = analysis?.scores?.launchSpeed;
  const scoreLabel    = getOpportunityLabel(opportunity);

  const badges = `
    <span class="rv-badge">📊 Idée évaluée</span>
    <span class="rv-badge">${escapeHtml(analysis.businessType || "Business")}</span>
  `;

  const kpis =
    buildKpiCard("📈", "Demande",     demand)      +
    buildKpiCard("👥", "Concurrence", competition) +
    buildKpiCard("🎯", "Opportunité", opportunity);

  const targetUsersHtml = Array.isArray(analysis.targetUsers) && analysis.targetUsers.length
    ? `<div class="premium-list">${analysis.targetUsers.map(t => `
        <div class="premium-list-item">
          <span>✓</span>
          <p><strong>${escapeHtml(t.name || "Cible")}</strong><br>${escapeHtml(t.description || "")}</p>
        </div>`).join("")}</div>`
    : `<p>Non disponible</p>`;

  const detailRows = [
    buildDetailRow("📈", "Taille du marché", `
      <p><strong>${escapeHtml(analysis?.scores?.marketSize?.value || "-")}</strong></p>
      <p>${escapeHtml(analysis?.scores?.marketSize?.description || "Non disponible")}</p>`),
    buildDetailRow("⚙️", "Difficulté de lancement", `
      <p><strong>${escapeHtml(analysis?.difficulty?.level || "-")}</strong></p>
      <p>${escapeHtml((analysis?.difficulty?.time || "") + (analysis?.difficulty?.reason ? " – " + analysis.difficulty.reason : ""))}</p>`),
    buildDetailRow("💪", "Forces",                renderPremiumList(analysis?.swot?.strengths   || [])),
    buildDetailRow("⚠️", "Faiblesses",            renderPremiumList(analysis?.swot?.weaknesses  || [])),
    buildDetailRow("💡", "Améliorations possibles",renderPremiumList(analysis?.swot?.improvements|| [])),
    buildDetailRow("🎯", "Utilisateurs ciblés",   targetUsersHtml),
    isPro && profitability !== undefined
      ? buildDetailRow("💰", "Rentabilité",        `<p>${profitability}/100</p>`) : "",
    isPro && launchSpeed !== undefined
      ? buildDetailRow("⚡", "Vitesse de lancement",`<p>${launchSpeed}/100</p>`) : "",
    isPro && analysis.marketingAngle
      ? buildDetailRow("📣", "Angle marketing",    `<p>${escapeHtml(analysis.marketingAngle)}</p>`) : "",
    isPro && analysis.launchPlan?.length
      ? buildDetailRow("🚀", "Plan de lancement",  buildRoadmap(analysis.launchPlan)) : "",
    isPro && analysis.competitors?.length
      ? buildDetailRow("⚔️", "Concurrents potentiels", `<div class="premium-list">${analysis.competitors.map(c => `
          <div class="premium-list-item"><span>•</span>
            <p><strong>${escapeHtml(c.name || "Concurrent")}</strong><br>
            ${c.strength ? `Force : ${escapeHtml(c.strength)}<br>` : ""}
            ${c.weakness ? `Faiblesse : ${escapeHtml(c.weakness)}` : ""}</p>
          </div>`).join("")}</div>`) : "",
    isPro && analysis.persona
      ? buildDetailRow("👤", "Persona client", `
          <p><strong>${escapeHtml(analysis.persona.name || "Persona")}</strong></p>
          <p>Problème : ${escapeHtml(analysis.persona.painPoint || "-")}</p>
          <p>Objectif : ${escapeHtml(analysis.persona.goal || "-")}</p>`) : "",
    isPro && analysis.recommendation
      ? buildDetailRow("✅", "Recommandation finale",`<p>${escapeHtml(analysis.recommendation)}</p>`) : "",
  ].filter(Boolean).join("");

  const upgradeBox = !isPro ? `
    <div class="rv-upgrade-inner">
      <div>
        <strong>🔒 Débloquez l'analyse Pro</strong>
        <p>Rentabilité, vitesse de lancement, concurrents, angle marketing, persona et plan d'action complet.</p>
      </div>
      <a href="pricing.html" class="btn btn-primary rv-upgrade-btn">Passer à Pro</a>
    </div>` : "";

  resultsEl.innerHTML = buildResultLayout({
    badges,
    nameHtml: analysis.name ? `<span class="rv-hero-business-name">${escapeHtml(analysis.name)}</span>` : "",
    sloganHtml: "",
    scoreVal: opportunity, scoreLabel, kpis,
    detailRows, upgradeBox,
    analysisTip: "Validez cette idée en créant une landing page et en testant l'intérêt de votre audience avant de développer votre MVP.",
  });
  resultsEl.classList.remove("hidden");
}

function hideResults() {
  const resultsEl = DOM.$("#resultsContainer");
  if (resultsEl) {
    resultsEl.classList.add("hidden");
    resultsEl.innerHTML = "";
  }
  currentAnalysis = null;
}

function openPremiumPopup() {
  Toast.warning("La sauvegarde est réservée aux plans Premium et Pro");
}

async function handleSave() {
  try {
    const user = Auth.getUser();

    if (!user) {
      Toast.error("Veuillez vous connecter");
      return;
    }

    if (!currentAnalysis || !currentAnalysis.id) {
      Toast.error("Aucune analyse à sauvegarder");
      return;
    }

    if (user.plan === "free") {
      openPremiumPopup();
      return;
    }

    const token = Auth.getToken();

    const response = await fetch(`https://opportunity-finder-api.onrender.com/api/analyze/save/${currentAnalysis.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Erreur lors de la sauvegarde");
    }

    Toast.success("Analyse sauvegardée avec succès");
    await refreshDashboardData();
  } catch (error) {
    console.error("Erreur save:", error);
    Toast.error(error.message || "Impossible de sauvegarder l'analyse");
  }
}

async function handleFavorite() {
  try {
    const user = Auth.getUser();

    if (!user) {
      Toast.error("Veuillez vous connecter");
      return;
    }

    if (!currentAnalysis || !currentAnalysis.id) {
      Toast.error("Aucune analyse sélectionnée");
      return;
    }

    if (user.plan === "free") {
      Toast.warning("Les favoris sont réservés aux plans Premium et Pro");
      return;
    }

    Toast.success("Ajouté aux favoris");
  } catch (error) {
    console.error("Erreur favori:", error);
    Toast.error("Impossible d'ajouter aux favoris");
  }
}

function handleExport() {
  const user = Auth.getUser();

  if (!currentAnalysis) {
    Toast.error("Aucune analyse à exporter");
    return;
  }

  if (!user || user.plan !== "pro") {
    Toast.warning("L’export est réservé au plan Pro");
    return;
  }

  exportAsText(currentAnalysis);
}

function handleShare() {
  if (!currentAnalysis) {
    Toast.error("Aucune analyse à partager");
    return;
  }

  shareOpportunity(currentAnalysis);
}

function openAnalysisFromList(id, list) {
  const item = list.find(a => a.id === id);
  if (!item) {
    Toast.error("Analyse introuvable");
    return;
  }

  const result = item.result || item.resultJson || {};

  currentAnalysis = {
    id: item.id,
    analysisType: item.analysisType,
    input: item.input,
    category: item.category,
    ...result
  };

  if (item.analysisType === "generate") {
    showGenerateResults(currentAnalysis);
  } else {
    showEvaluateResults(currentAnalysis);
  }

  const resultsEl = document.getElementById("resultsContainer");
  if (resultsEl) {
    resultsEl.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

async function renderHistory() {
  const historyContainer = DOM.$("#historyList");
  if (!historyContainer) return;

  const token = Auth.getToken();

  if (!token) {
    historyContainer.innerHTML = '<p style="color: var(--gray-500);">Aucun historique disponible.</p>';
    dashboardState.history = [];
    return;
  }

  try {
    const response = await fetch("https://opportunity-finder-api.onrender.com/api/analyze", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      historyContainer.innerHTML = `<p style="color: var(--error-600);">Erreur lors du chargement de l’historique.</p>`;
      dashboardState.history = [];
      return;
    }

    dashboardState.history = data.analyses || [];
    renderHistoryList();
  } catch (error) {
    console.error("Erreur renderHistory:", error);
    historyContainer.innerHTML = `<p style="color: var(--error-600);">Impossible de charger l’historique.</p>`;
    dashboardState.history = [];
  }
}

function renderHistoryList() {
  const historyContainer = DOM.$("#historyList");
  if (!historyContainer) return;

  const history = dashboardState.history;

  if (!history.length) {
    historyContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-title">Aucune analyse</div>
        <div class="empty-state-text">Commencez par générer ou évaluer une idée ci-dessus</div>
      </div>
    `;
    return;
  }

  const visibleHistory = showAllHistory ? history : history.slice(0, 3);

  historyContainer.innerHTML = `
    ${visibleHistory.map(item => {
      // Fix: Business Finder should show recommendedBusiness, not the raw prompt/input
      const title =
        item.analysisType === "generate"
          ? (item.result?.idea || item.result?.name || "Idée générée")
          : item.analysisType === "finder"
          ? (item.result?.recommendedBusiness || item.result?.businessType || "Business recommandé")
          : (item.result?.userIdea || item.input?.slice(0, 60) || "Idée évaluée");

      const score = item.result?.scores?.opportunity ?? null;
      const scoreColor = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";

      const date = new Date(item.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      const typeLabel = item.analysisType === "generate" ? "💡 Générée" : item.analysisType === "finder" ? "🎯 Finder" : "📊 Évaluée";
      const typeBg    = item.analysisType === "generate"
        ? "background:rgba(37,99,235,.1);color:#2563eb;"
        : item.analysisType === "finder"
        ? "background:rgba(245,158,11,.1);color:#d97706;"
        : "background:rgba(124,58,237,.1);color:#7c3aed;";

      return `
        <div 
          class="history-item"
          data-history-id="${item.id}"
          style="cursor:pointer;"
        >
          <div class="history-item-left">
            <span class="history-item-type" style="${typeBg}">${typeLabel}</span>
            <span class="history-item-title">${escapeHtml(title.length > 60 ? title.slice(0,60)+"…" : title)}</span>
          </div>
          <div class="history-item-right">
            ${score !== null ? `<span class="history-item-score" style="color:${scoreColor}">${score}<span style="font-size:.7rem;opacity:.7">/100</span></span>` : ""}
            <span class="history-item-date">${date}</span>
          </div>
        </div>
      `;
    }).join("")}

    ${history.length > 3 ? `
      <button id="toggleHistoryBtn" class="db-btn-ghost btn btn-sm" type="button" style="margin-top:8px;width:100%;">
        ${showAllHistory ? "Voir moins" : `Voir tout (${history.length})`}
      </button>
    ` : ""}
  `;
}

async function loadSavedAnalyses() {
  const token = Auth.getToken();
  if (!token) return;

  try {
    const response = await fetch("https://opportunity-finder-api.onrender.com/api/analyze/saved", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Erreur chargement sauvegardes");
    }

    dashboardState.saved = data.savedAnalyses || [];
    renderSavedAnalyses(dashboardState.saved);
  } catch (error) {
    console.error("Erreur loadSavedAnalyses:", error);
    dashboardState.saved = [];
    renderSavedAnalyses([]);
  }
}

function renderSavedAnalyses(items) {
  const container = document.getElementById("savedIdeasList");
  const toggleBtn = document.getElementById("toggleSavedBtn");

  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding:40px 20px;">
        <div class="empty-state-icon">💡</div>
        <div class="empty-state-title">Aucune idée sauvegardée</div>
        <div class="empty-state-text">Sauvegardez les opportunités intéressantes pour les consulter plus tard</div>
      </div>
    `;

    if (toggleBtn) toggleBtn.style.display = "none";
    return;
  }

  if (toggleBtn) {
    toggleBtn.style.display = items.length > 3 ? "inline-flex" : "none";
    toggleBtn.textContent = showAllSaved ? "Voir moins" : `Voir plus (${items.length - 3})`;
  }

  const visibleItems = showAllSaved ? items : items.slice(0, 3);

  container.innerHTML = visibleItems.map(item => {
    const result = item.resultJson || item.result || {};

    const title =
      item.analysisType === "generate"
        ? (result.idea || item.category || "Idée générée")
        : item.analysisType === "finder"
          ? (result?.recommendedBusiness || result?.businessType || "Business recommandé")
          : (result?.userIdea || item.input?.slice(0, 80) || "Idée évaluée");

    const score = result?.scores?.opportunity ?? "-";
    const date = new Date(item.createdAt).toLocaleDateString("fr-FR");

    return `
      <div 
        class="card"
        data-saved-id="${item.id}"
        style="margin-bottom:12px; cursor:pointer;"
      >
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:start;">
            <div>
              <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;color:var(--primary-600);margin-bottom:6px;">
                ${item.analysisType === "generate" ? "Idée générée" : "Idée évaluée"}
              </div>
              <div style="font-weight:700;color:var(--gray-900);margin-bottom:6px;">
                ${escapeHtml(title)}
              </div>
              <div style="font-size:0.9375rem;color:var(--gray-600);">
                Score : ${score}/100
              </div>
            </div>
            <div style="font-size:0.875rem;color:var(--gray-500);white-space:nowrap;">
              ${date}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function scrollToSection(sectionId) {
  const section = DOM.$("#" + sectionId);
  if (!section) return;

  const offset = 100;
  const top = section.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", async () => {
  await Auth.init();

  if (!Auth.getToken()) {
  window.location.href = "login.html";
  return;
}

  await initDashboard();
});
/* ══════════════════════════════════════════════════════════
   OPPORTUNITY BOOSTER AI
══════════════════════════════════════════════════════════ */

const BOOSTER_API = "https://opportunity-finder-api.onrender.com/api/booster/analyze";

function handleBoosterLaunch() {
  const user = Auth.getUser();
  if (!user || user.plan === "free") {
    showBoosterModal();
  } else {
    showBoosterQuestionnaire();
  }
}

/* ── Premium gate modal ─────────────────────────────────── */
function showBoosterModal() {
  const existing = document.getElementById("boosterModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "boosterModal";
  modal.innerHTML = `
    <div class="ob-modal-overlay" id="boosterCloseModal">
      <div class="ob-modal" role="dialog" aria-modal="true">
        <button class="ob-modal-close" id="boosterCloseModal" aria-label="Fermer">✕</button>
        <div class="ob-modal-icon">🚀</div>
        <h3 class="ob-modal-title">Opportunity Booster AI</h3>
        <p class="ob-modal-desc">Opportunity Booster AI est réservé aux membres Premium.<br>Obtenez une analyse personnalisée basée sur votre profil exact.</p>
        <div class="ob-modal-features">
          <div class="ob-modal-feat">✅ Score d'adéquation profil/opportunité</div>
          <div class="ob-modal-feat">✅ Points forts et risques personnalisés</div>
          <div class="ob-modal-feat">✅ Plan d'action 30 jours sur mesure</div>
          <div class="ob-modal-feat">✅ Première action concrète à faire aujourd'hui</div>
        </div>
        <div class="ob-modal-actions">
          <a href="pricing.html" class="ob-modal-cta">⭐ Passer Premium</a>
          <button class="ob-modal-skip" id="boosterCloseModal">Plus tard</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.querySelector(".ob-modal-overlay").classList.add("ob-modal-visible"));
}

function closeBoosterModal() {
  const modal = document.getElementById("boosterModal");
  if (!modal) return;
  const overlay = modal.querySelector(".ob-modal-overlay");
  overlay.classList.remove("ob-modal-visible");
  setTimeout(() => modal.remove(), 280);
}

/* ── Questionnaire modal ─────────────────────────────────── */
function showBoosterQuestionnaire() {
  const existing = document.getElementById("boosterModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "boosterModal";
  modal.innerHTML = `
    <div class="ob-modal-overlay" id="boosterCloseModal">
      <div class="ob-modal ob-modal-quiz" role="dialog" aria-modal="true">
        <button class="ob-modal-close" id="boosterCloseModal" aria-label="Fermer">✕</button>
        <div class="ob-quiz-header">
          <div class="ob-quiz-icon">🎯</div>
          <h3 class="ob-modal-title">Analyse personnalisée</h3>
          <p class="ob-modal-desc">Répondez à 6 questions pour personnaliser l'analyse.</p>
        </div>
        <form class="ob-quiz-form" id="boosterForm">
          <div class="ob-field">
            <label class="ob-label">1. Quel âge avez-vous ?</label>
            <select class="ob-input" name="age" required>
              <option value="">Sélectionner…</option>
              <option>Moins de 20 ans</option>
              <option>20 à 30 ans</option>
              <option>30 à 40 ans</option>
              <option>40 ans et plus</option>
            </select>
          </div>
          <div class="ob-field">
            <label class="ob-label">2. Quel budget pouvez-vous investir ?</label>
            <select class="ob-input" name="budget" required>
              <option value="">Sélectionner…</option>
              <option>0€ (Bootstrap)</option>
              <option>100€ à 500€</option>
              <option>500€ à 2 000€</option>
              <option>2 000€ à 10 000€</option>
              <option>Plus de 10 000€</option>
            </select>
          </div>
          <div class="ob-field">
            <label class="ob-label">3. Avez-vous déjà lancé un projet ou un business ?</label>
            <select class="ob-input" name="experience" required>
              <option value="">Sélectionner…</option>
              <option>Non, c'est mon premier projet</option>
              <option>J'ai essayé sans succès</option>
              <option>Oui, avec un succès partiel</option>
              <option>Oui, j'ai déjà un business actif</option>
            </select>
          </div>
          <div class="ob-field">
            <label class="ob-label">4. Combien de temps par semaine pouvez-vous consacrer à cette opportunité ?</label>
            <select class="ob-input" name="weeklyTime" required>
              <option value="">Sélectionner…</option>
              <option>Moins de 5h</option>
              <option>5h à 10h</option>
              <option>10h à 20h</option>
              <option>Plus de 20h (temps plein)</option>
            </select>
          </div>
          <div class="ob-field">
            <label class="ob-label">5. Quelles sont vos compétences principales ?</label>
            <input type="text" class="ob-input" name="skills" placeholder="Ex: marketing, développement web, vente…" required>
          </div>
          <div class="ob-field">
            <label class="ob-label">6. Quel est votre objectif principal ?</label>
            <div class="ob-radio-group">
              <label class="ob-radio"><input type="radio" name="goal" value="Revenu complémentaire" required><span>💰 Revenu complémentaire</span></label>
              <label class="ob-radio"><input type="radio" name="goal" value="Business complet"><span>🏢 Business complet</span></label>
              <label class="ob-radio"><input type="radio" name="goal" value="Apprentissage"><span>📚 Apprentissage</span></label>
              <label class="ob-radio"><input type="radio" name="goal" value="Autre"><span>🎯 Autre</span></label>
            </div>
          </div>
          <button type="button" class="ob-submit-btn" id="boosterSubmitBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Lancer mon analyse
          </button>
        </form>
      </div>
    </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.querySelector(".ob-modal-overlay").classList.add("ob-modal-visible"));
}

async function handleBoosterSubmit() {
  const form = document.getElementById("boosterForm");
  if (!form) return;

  // Validate
  const age = form.age?.value;
  const budget = form.budget?.value;
  const experience = form.experience?.value;
  const weeklyTime = form.weeklyTime?.value;
  const skills = form.skills?.value?.trim();
  const goal = form.querySelector('input[name="goal"]:checked')?.value;

  if (!age || !budget || !experience || !weeklyTime || !skills || !goal) {
    Toast.warning("Veuillez répondre à toutes les questions.");
    return;
  }

  const submitBtn = document.getElementById("boosterSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4"/></svg> Analyse en cours…`;
  }

  closeBoosterModal();

  // Show inline loading
  const container = document.getElementById("boosterResultContainer");
  if (container) {
    container.innerHTML = `
      <div class="ob-result-loading">
        <div class="ob-result-loading-ring"></div>
        <div class="ob-result-loading-text">🤖 Analyse de votre profil en cours…</div>
        <div class="ob-result-loading-hint">Notre IA analyse la compatibilité entre votre profil et cette opportunité</div>
      </div>`;
    container.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  try {
    const token = Auth.getToken();
    const response = await fetch(BOOSTER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        opportunity: currentAnalysis,
        profile: { age, budget, experience, weeklyTime, skills, goal }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de l'analyse Booster");
    }

    renderBoosterResult(data.result);

  } catch (err) {
    console.error("Booster error:", err);
    if (container) {
      container.innerHTML = `
        <div class="ob-result-error">
          <span>⚠️</span> ${escapeHtml(err.message || "Erreur lors de l'analyse. Réessayez.")}
          <button class="ob-retry-btn" onclick="handleBoosterLaunch()">Réessayer</button>
        </div>`;
    }
  }
}

/* ── Render result ───────────────────────────────────────── */
function renderBoosterResult(r) {
  const container = document.getElementById("boosterResultContainer");
  if (!container || !r) return;

  const score = r.fitScore || 0;
  const scoreColor = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const circ = 2 * Math.PI * 32;
  const offset = circ - (score / 100) * circ;

  const roadmapHtml = Array.isArray(r.actionPlan30Days) && r.actionPlan30Days.length
    ? r.actionPlan30Days.map((step, i) => `
        <div class="ob-roadmap-item">
          <div class="ob-roadmap-num">${i + 1}</div>
          <div class="ob-roadmap-text">${escapeHtml(step)}</div>
        </div>`).join("")
    : "<p>Non disponible</p>";

  container.innerHTML = `
    <div class="ob-result-card" id="boosterResult">
      <div class="ob-result-header">
        <div class="ob-result-score-wrap">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="7"/>
            <circle cx="40" cy="40" r="32" fill="none"
              stroke="${scoreColor}" stroke-width="7"
              stroke-linecap="round"
              stroke-dasharray="${circ}"
              stroke-dashoffset="${offset}"
              transform="rotate(-90 40 40)"
              style="transition:stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)"/>
          </svg>
          <div class="ob-result-score-inner">
            <span class="ob-result-score-num">${score}</span>
            <span class="ob-result-score-sub">/100</span>
          </div>
        </div>
        <div class="ob-result-header-info">
          <div class="ob-result-badge">🚀 Opportunity Booster AI</div>
          <div class="ob-result-fit-label">${escapeHtml(r.fitLabel || "Analyse complète")}</div>
          <p class="ob-result-advice">${escapeHtml(r.personalizedAdvice || "")}</p>
        </div>
      </div>

      <div class="ob-result-grid">
        <div class="ob-result-section">
          <div class="ob-result-section-title">💪 Points forts de votre profil</div>
          <div class="ob-result-list">
            ${(r.strengths || []).map(s => `
              <div class="ob-result-item ob-result-item--green">
                <span>✓</span>${escapeHtml(s)}
              </div>`).join("")}
          </div>
        </div>
        <div class="ob-result-section">
          <div class="ob-result-section-title">⚠️ Risques pour votre profil</div>
          <div class="ob-result-list">
            ${(r.risks || []).map(risk => `
              <div class="ob-result-item ob-result-item--orange">
                <span>→</span>${escapeHtml(risk)}
              </div>`).join("")}
          </div>
        </div>
      </div>

      <div class="ob-result-meta-row">
        <div class="ob-result-meta-card">
          <div class="ob-result-meta-icon">💰</div>
          <div>
            <div class="ob-result-meta-label">Budget conseillé</div>
            <div class="ob-result-meta-val">${escapeHtml(r.recommendedBudget || "—")}</div>
          </div>
        </div>
        <div class="ob-result-meta-card ob-result-meta-card--highlight">
          <div class="ob-result-meta-icon">⚡</div>
          <div>
            <div class="ob-result-meta-label">Première action aujourd'hui</div>
            <div class="ob-result-meta-val">${escapeHtml(r.firstActionToday || "—")}</div>
          </div>
        </div>
      </div>

      <div class="ob-result-roadmap-section">
        <div class="ob-result-section-title">🗓️ Plan d'action personnalisé sur 30 jours</div>
        <div class="ob-roadmap">${roadmapHtml}</div>
      </div>
    </div>`;

  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD REDESIGN — Hero card + Last Result
══════════════════════════════════════════════════════════ */

function renderHeroCard() {
  const user = Auth.getUser();
  if (!user) return;

  // User name in hero
  const heroName = document.getElementById("heroUserName");
  if (heroName) heroName.textContent = user.name?.split(" ")[0] || user.name || "toi";

  // Plan badge in sidebar
  const planBadge = document.getElementById("sidebarPlanBadge");
  if (planBadge) {
    planBadge.textContent = user.plan === "pro" ? "Pro" : user.plan === "premium" ? "Premium" : "Free";
    planBadge.style.background = user.plan === "pro"
      ? "linear-gradient(135deg,#059669,#10b981)"
      : user.plan === "premium"
      ? "linear-gradient(135deg,#d97706,#f59e0b)"
      : "linear-gradient(135deg,#2563eb,#7c3aed)";
  }

  const history = dashboardState.history || [];
  const saved   = dashboardState.saved   || [];

  // Total generated
  const generated = history.filter(h => h.analysisType === "generate").length;
  const heroGen = document.getElementById("heroStatGenerated");
  if (heroGen) heroGen.textContent = generated;

  const heroGenSub = document.getElementById("heroStatGeneratedSub");
  if (heroGenSub && generated > 0) {
    const thisWeek = history.filter(h => {
      const d = new Date(h.createdAt);
      const now = new Date();
      return (now - d) < 7 * 24 * 3600 * 1000 && h.analysisType === "generate";
    }).length;
    if (thisWeek > 0) heroGenSub.textContent = `+${thisWeek} cette semaine`;
  }

  // Average score
  const scores = history
    .map(h => h.result?.scores?.opportunity ?? h.result?.compatibilityScore ?? null)
    .filter(s => s !== null && !isNaN(s));

  const heroScore = document.getElementById("heroStatScore");
  if (heroScore) {
    if (scores.length > 0) {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      heroScore.textContent = avg + "%";
      const sub = document.getElementById("heroStatScoreSub");
      if (sub) {
        sub.textContent = avg >= 75 ? "Très bon potentiel" : avg >= 55 ? "Bon potentiel" : "Potentiel correct";
        sub.style.color = avg >= 75 ? "#10b981" : avg >= 55 ? "#f59e0b" : "#94a3b8";
      }
    }
  }

  // Saved count
  const heroSaved = document.getElementById("heroStatSaved");
  if (heroSaved) heroSaved.textContent = saved.length;
}

function renderLastResult() {
  const card = document.getElementById("lastResultCard");
  if (!card) return;

  const history = dashboardState.history || [];
  if (!history.length) return; // keep empty state

  const last = history[0];
  const result = last.result || {};
  const score = result.scores?.opportunity ?? result.compatibilityScore ?? null;
  const summary = last.analysisType === "finder"
    ? (result.recommendedBusiness || result.businessType || "Business recommandé")
    : last.analysisType === "generate"
    ? (result.idea || result.name || "Idée générée")
    : (result.userIdea || (last.input || "").slice(0, 80) || "Analyse récente");
  const typeLabel = last.analysisType === "generate" ? "Idée Générée" : "Idée Évaluée";
  const typeCls   = last.analysisType === "generate" ? "generate" : "evaluate";
  const scoreColor = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";

  const date = new Date(last.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });

  card.innerHTML = `
    <div class="db-last-result-header">
      <span class="db-last-result-label">Dernier résultat</span>
      ${score !== null ? `<span class="db-last-result-score" style="color:${scoreColor};background:${scoreColor}18">Score : ${score}/100</span>` : ""}
    </div>
    <div class="db-last-result-body">
      <span class="db-last-result-badge db-last-result-badge--${typeCls}">${typeLabel}</span>
      <div class="db-last-result-summary">${escapeHtml(summary)}</div>
      <div style="font-size:11.5px;color:var(--db-text3)">${date}</div>
    </div>
    <div class="db-last-result-actions">
      <button class="db-last-result-btn db-last-result-btn--ghost" onclick="openAnalysisFromList('${last.id}', dashboardState.history)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        Voir le détail
      </button>
      <button class="db-last-result-btn db-last-result-btn--ghost" onclick="currentAnalysis={id:'${last.id}',...(dashboardState.history.find(h=>h.id==='${last.id}')?.result||{})};handleSave()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
        Sauvegarder
      </button>
      <button class="db-last-result-btn db-last-result-btn--primary" onclick="openAnalysisFromList('${last.id}', dashboardState.history)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Partager
      </button>
    </div>`;
}

// Hook into refreshDashboardData
const _origRefresh = typeof refreshDashboardData === "function" ? refreshDashboardData : null;
const _wrappedRefresh = async function() {
  if (_origRefresh) await _origRefresh();
  renderHeroCard();
  renderLastResult();
};

// Override refreshDashboardData if it exists
if (typeof window !== "undefined") {
  window.addEventListener("dashboardRefreshed", () => {
    renderHeroCard();
    renderLastResult();
  });
}

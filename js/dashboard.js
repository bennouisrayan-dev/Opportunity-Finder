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
      <div class="limit-warning">
        <div class="limit-warning-icon">🚫</div>
        <div class="limit-warning-title">Crédits Épuisés</div>
        <div class="limit-warning-text">
          Vous avez utilisé vos ${limit} crédits gratuits. Passez à la version supérieure pour débloquer des analyses illimitées.
        </div>
        <a href="pricing.html" class="btn btn-primary">Passer à la Version Supérieure</a>
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
  const toggleHistoryBtn = e.target.closest("#toggleHistoryBtn");
const toggleSavedBtn = e.target.closest("#toggleSavedBtn");
const historyItem = e.target.closest("[data-history-id]");
const savedItem = e.target.closest("[data-saved-id]");

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

    const response = await fetch("http://localhost:3000/api/analyze/generate", {
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

    const response = await fetch("http://localhost:3000/api/analyze/evaluate", {
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

function showGenerateResults(analysis) {
  
  const resultsEl = DOM.$("#resultsContainer");
  if (!resultsEl) return;

  const user = Auth.getUser();
  const isPremium = user && (user.plan === "premium" || user.plan === "pro");
  const isPro = user && user.plan === "pro";

  const demand = analysis?.scores?.demand ?? 0;
  const competition = analysis?.scores?.competition ?? 0;
  const opportunity = analysis?.scores?.opportunity ?? 0;

  const scoreClass = getScoreClass(opportunity);
  const opportunityLabel = getOpportunityLabel(opportunity);

  resultsEl.innerHTML = `
    <div class="premium-result-card fade-in">
      <div class="premium-result-hero">
        <div>
          <div class="premium-badges">
            <span>💡 Idée générée</span>
            <span>${escapeHtml(analysis.businessType || "Business")}</span>
          </div>

          ${analysis.name ? `<h1 class="premium-business-name">${analysis.name}</h1>` : ""}
          ${analysis.slogan ? `<p style="opacity:0.8;">${analysis.slogan}</p>` : ""}

          <h2>${escapeHtml(analysis.idea || "Opportunité business")}</h2>
          <p>${escapeHtml(analysis.problem || "Problème détecté non disponible")}</p>
        </div>

        <div class="premium-score ${scoreClass}">
          <span>${opportunity}</span>
          <small>/100</small>
          <strong>${opportunityLabel}</strong>
        </div>
      </div>

      <div class="premium-score-grid">
        <div class="premium-mini-score">
          <span>Demande</span>
          <strong>${demand}</strong>
          <div><i style="width:${demand}%"></i></div>
        </div>

        <div class="premium-mini-score">
          <span>Concurrence</span>
          <strong>${competition}</strong>
          <div><i style="width:${competition}%"></i></div>
        </div>

        <div class="premium-mini-score">
          <span>Opportunité</span>
          <strong>${opportunity}</strong>
          <div><i style="width:${opportunity}%"></i></div>
        </div>
      </div>

      <div class="premium-result-grid">
        ${renderPremiumSection("🎯", "Problème détecté", `<p>${escapeHtml(analysis.problem || "Non disponible")}</p>`)}
        ${renderPremiumSection("💡", "Idée de business", `<p>${escapeHtml(analysis.idea || "Non disponible")}</p>`)}
        ${renderPremiumSection("👥", "Utilisateurs cibles", `<p>${escapeHtml(
          Array.isArray(analysis.targetUsers)
            ? analysis.targetUsers.join(", ")
            : analysis.targetUsers || "Non disponible"
        )}</p>`)}
        ${renderPremiumSection("💰", "Monétisation", `<p>${escapeHtml(analysis.pricing || analysis.monetization || "Non disponible")}</p>`)}

        ${isPremium ? renderPremiumSection("✨", "Offres / fonctionnalités clés", renderPremiumList(analysis.features)) : ""}
        ${isPremium && analysis.whyNow ? renderPremiumSection("⏰", "Pourquoi maintenant", `<p>${escapeHtml(analysis.whyNow)}</p>`) : ""}

        ${isPro && analysis.acquisitionChannels ? renderPremiumSection("📣", "Canaux d’acquisition", renderPremiumList(analysis.acquisitionChannels)) : ""}
        ${isPro && analysis.positioning ? renderPremiumSection("🧭", "Positionnement", `<p>${escapeHtml(analysis.positioning)}</p>`) : ""}
        ${isPro && analysis.roadmap30Days ? renderPremiumSection("🚀", "Roadmap 30 jours", renderPremiumList(analysis.roadmap30Days)) : ""}
      </div>

      ${!isPremium ? `
        <div class="premium-upgrade-box">
          <div>
            <strong>🔒 Débloquez l’analyse complète</strong>
            <p>Cible détaillée, pricing, plan de lancement, acquisition et insights avancés.</p>
          </div>
          <a href="pricing.html" class="btn btn-primary">Passer à Premium</a>
        </div>
      ` : ""}

      <div class="results-actions premium-actions">
        <button class="btn btn-primary" id="saveBtn">💾 Sauvegarder</button>
        <button class="btn btn-ghost" id="newAnalysisBtn" style="margin-left:auto;">Nouvelle Analyse</button>
      </div>
    </div>
  `;

  resultsEl.classList.remove("hidden");
}

function showEvaluateResults(analysis) {
  const resultsEl = DOM.$("#resultsContainer");
  if (!resultsEl) return;

  const user = Auth.getUser();
  const isPro = user && user.plan === "pro";

  const demand = analysis?.scores?.demand ?? 0;
  const competition = analysis?.scores?.competition ?? 0;
  const opportunity = analysis?.scores?.opportunity ?? 0;
  const profitability = analysis?.scores?.profitability;
  const launchSpeed = analysis?.scores?.launchSpeed;

  const scoreClass = getScoreClass(opportunity);
  const opportunityLabel = getOpportunityLabel(opportunity);

  const titleIdea = analysis.userIdea || analysis.input || "Idée évaluée";

  resultsEl.innerHTML = `
    <div class="premium-result-card fade-in">
      <div class="premium-result-hero">
        <div>
          <div class="premium-badges">
            <span>📊 Idée évaluée</span>
            <span>${escapeHtml(analysis.businessType || "Business")}</span>
          </div>

          <h2>${escapeHtml(titleIdea)}</h2>
          <p>${escapeHtml(analysis.recommendation || "Analyse complète de votre idée business avec score, forces, faiblesses et pistes d'amélioration.")}</p>
        </div>

        <div class="premium-score ${scoreClass}">
          <span>${opportunity}</span>
          <small>/100</small>
          <strong>${opportunityLabel}</strong>
        </div>
      </div>

      <div class="premium-score-grid">
        <div class="premium-mini-score">
          <span>Demande</span>
          <strong>${demand}</strong>
          <div><i style="width:${demand}%"></i></div>
        </div>

        <div class="premium-mini-score">
          <span>Concurrence</span>
          <strong>${competition}</strong>
          <div><i style="width:${competition}%"></i></div>
        </div>

        <div class="premium-mini-score">
          <span>Opportunité</span>
          <strong>${opportunity}</strong>
          <div><i style="width:${opportunity}%"></i></div>
        </div>
      </div>

      <div class="premium-result-grid">
        ${renderPremiumSection("📈", "Taille du marché", `
          <p><strong>${escapeHtml(analysis?.scores?.marketSize?.value || "-")}</strong></p>
          <p>${escapeHtml(analysis?.scores?.marketSize?.description || "Non disponible")}</p>
        `)}

        ${renderPremiumSection("⚙️", "Difficulté de lancement", `
          <p><strong>${escapeHtml(analysis?.difficulty?.level || "-")}</strong></p>
          <p>${escapeHtml(analysis?.difficulty?.time || "")}${analysis?.difficulty?.reason ? " - " + escapeHtml(analysis.difficulty.reason) : ""}</p>
        `)}

        ${renderPremiumSection("💪", "Forces", renderPremiumList(analysis?.swot?.strengths || []))}
        ${renderPremiumSection("⚠️", "Faiblesses", renderPremiumList(analysis?.swot?.weaknesses || []))}
        ${renderPremiumSection("💡", "Améliorations possibles", renderPremiumList(analysis?.swot?.improvements || []))}

        ${renderPremiumSection("🎯", "Utilisateurs cibles", `
          <div class="premium-list">
            ${(analysis.targetUsers || []).map(target => `
              <div class="premium-list-item">
                <span>✓</span>
                <p>
                  <strong>${escapeHtml(target.name || "Cible")}</strong><br>
                  ${escapeHtml(target.description || "")}
                </p>
              </div>
            `).join("") || "<p>Non disponible</p>"}
          </div>
        `)}

        ${isPro && profitability !== undefined ? renderPremiumSection("💰", "Rentabilité", `<p>${profitability}/100</p>`) : ""}
        ${isPro && launchSpeed !== undefined ? renderPremiumSection("⚡", "Vitesse de lancement", `<p>${launchSpeed}/100</p>`) : ""}
        ${isPro && analysis.marketingAngle ? renderPremiumSection("📣", "Angle marketing", `<p>${escapeHtml(analysis.marketingAngle)}</p>`) : ""}
        ${isPro && analysis.launchPlan ? renderPremiumSection("🚀", "Plan de lancement", renderPremiumList(analysis.launchPlan)) : ""}
        ${isPro && analysis.competitors ? renderPremiumSection("⚔️", "Concurrents potentiels", `
          <div class="premium-list">
            ${analysis.competitors.map(item => `
              <div class="premium-list-item">
                <span>•</span>
                <p>
                  <strong>${escapeHtml(item.name || "Concurrent")}</strong><br>
                  ${item.strength ? `<strong>Force :</strong> ${escapeHtml(item.strength)}<br>` : ""}
                  ${item.weakness ? `<strong>Faiblesse :</strong> ${escapeHtml(item.weakness)}` : ""}
                </p>
              </div>
            `).join("")}
          </div>
        `) : ""}
        ${isPro && analysis.persona ? renderPremiumSection("👤", "Persona client", `
          <p><strong>${escapeHtml(analysis.persona.name || "Persona")}</strong></p>
          <p><strong>Problème :</strong> ${escapeHtml(analysis.persona.painPoint || "-")}</p>
          <p><strong>Objectif :</strong> ${escapeHtml(analysis.persona.goal || "-")}</p>
        `) : ""}
        ${isPro && analysis.recommendation ? renderPremiumSection("✅", "Recommandation finale", `<p>${escapeHtml(analysis.recommendation)}</p>`) : ""}
      </div>

      ${!isPro ? `
        <div class="premium-upgrade-box">
          <div>
            <strong>🔒 Débloquez l’analyse Pro</strong>
            <p>Rentabilité, vitesse de lancement, concurrents, angle marketing, persona et plan d’action complet.</p>
          </div>
          <a href="pricing.html" class="btn btn-primary">Passer à Pro</a>
        </div>
      ` : ""}

      <div class="results-actions premium-actions">
        <button class="btn btn-primary" id="saveBtn">💾 Sauvegarder</button>
        <button class="btn btn-ghost" id="newAnalysisBtn" style="margin-left:auto;">Nouvelle Analyse</button>
      </div>
    </div>
  `;

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

    const response = await fetch(`http://localhost:3000/api/analyze/save/${currentAnalysis.id}`, {
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
    const response = await fetch("http://localhost:3000/api/analyze", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      historyContainer.innerHTML = '<p style="color: var(--error-600);">Erreur lors du chargement de l’historique.</p>';
      dashboardState.history = [];
      return;
    }

    dashboardState.history = data.analyses || [];
    renderHistoryList();
  } catch (error) {
    console.error("Erreur renderHistory:", error);
    historyContainer.innerHTML = '<p style="color: var(--error-600);">Impossible de charger l’historique.</p>';
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
      const title =
        item.analysisType === "generate"
          ? (item.result?.idea || "Idée générée")
          : (item.input || item.result?.userIdea || "Idée évaluée");

      const subtitle =
        item.analysisType === "generate"
          ? (item.result?.problem || item.result?.businessType || "Analyse générée")
          : `Score opportunité : ${item.result?.scores?.opportunity ?? "-"}/100`;

      const date = new Date(item.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      return `
        <div 
          class="card"
          data-history-id="${item.id}"
          style="margin-bottom:16px; cursor:pointer;"
        >
          <div class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
              <div>
                <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;color:var(--primary-600);margin-bottom:6px;">
                  ${item.analysisType === "generate" ? "Idée générée" : "Idée évaluée"}
                </div>
                <div style="font-weight:700;color:var(--gray-900);margin-bottom:6px;">
                  ${escapeHtml(title)}
                </div>
                <div style="color:var(--gray-600);font-size:0.9375rem;">
                  ${escapeHtml(subtitle)}
                </div>
              </div>
              <div style="font-size:0.875rem;color:var(--gray-500);white-space:nowrap;">
                ${date}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("")}

    ${history.length > 3 ? `
      <button id="toggleHistoryBtn" class="btn btn-secondary btn-full" type="button">
        ${showAllHistory ? "Voir moins" : `Voir plus (${history.length - 3})`}
      </button>
    ` : ""}
  `;
}

async function loadSavedAnalyses() {
  const token = Auth.getToken();
  if (!token) return;

  try {
    const response = await fetch("http://localhost:3000/api/analyze/saved", {
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
        : (item.input || result.userIdea || "Idée évaluée");

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
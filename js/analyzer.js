/**
 * Opportunity Finder - Moteur d'Analyse d'Opportunités
 */

// Base de données de problèmes par créneau
const PROBLEM_DATABASE = {
  productivity: [
    {
      problem: "Les gens ont du mal à gérer tous leurs abonnements et paiements récurrents.",
      idea: "SaaS de gestion d'abonnements qui suit tous les paiements récurrents et aide à optimiser les dépenses.",
      features: ["Tableau de bord unifié", "Rappels de paiement", "Analyses de dépenses", "Assistant de résiliation", "Alertes de changement de prix"],
      pricing: "Freemium : 9€/mois pour les fonctionnalités premium",
      targetUsers: "Consommateurs avec 5+ abonnements, propriétaires de petites entreprises",
      demand: "high",
      competition: "medium"
    },
    {
      problem: "Les télétravailleurs ont du mal à maintenir leur concentration et à suivre leur productivité.",
      idea: "Assistant de concentration IA qui bloque les distractions et fournit des insights de productivité.",
      features: ["Blocage intelligent des distractions", "Sessions de concentration", "Analyses de productivité", "Coaching IA", "Tableaux de bord d'équipe"],
      pricing: "12€/mois individuel, 29€/mois équipe",
      targetUsers: "Télétravailleurs, freelances, nomades digitaux",
      demand: "high",
      competition: "high"
    },
    {
      problem: "Les petites équipes manquent d'outils simples pour suivre les tâches sans gestion de projet complexe.",
      idea: "Outil de suivi de tâches léger pour petites équipes avec configuration minimale.",
      features: ["Création rapide de tâches", "Tableau kanban simple", "Assignations d'équipe", "Rapports basiques", "Intégration Slack"],
      pricing: "Gratuit jusqu'à 5 utilisateurs, 8€/utilisateur/mois",
      targetUsers: "Petites équipes, startups, agences",
      demand: "high",
      competition: "high"
    }
  ],

  ai: [
    {
      problem: "Les entreprises ont du mal à intégrer l'IA dans leurs flux de travail existants sans expertise technique.",
      idea: "Constructeur de flux de travail IA no-code pour l'automatisation métier.",
      features: ["Constructeur visuel de flux", "Templates IA pré-construits", "Intégrations API", "Entraînement de modèles personnalisés", "Tableau de bord d'analyses"],
      pricing: "49€/mois starter, 199€/mois business",
      targetUsers: "PME, équipes marketing, responsables opérations",
      demand: "very high",
      competition: "medium"
    },
    {
      problem: "Les créateurs de contenu passent trop de temps à adapter leur contenu pour différentes plateformes.",
      idea: "Outil de réadaptation de contenu IA qui transforme un contenu en plusieurs formats.",
      features: ["Conversion auto de format", "Optimisation par plateforme", "Planification", "Suivi de performance", "Entraînement voix de marque"],
      pricing: "29€/mois créateur, 79€/mois agence",
      targetUsers: "Créateurs de contenu, community managers, marketeurs",
      demand: "high",
      competition: "medium"
    },
    {
      problem: "Les équipes de support client sont débordées par les demandes répétitives.",
      idea: "Assistant de support client IA qui gère les questions courantes et escalade les problèmes complexes.",
      features: ["Génération de réponses auto", "Catégorisation de tickets", "Intégration base de connaissances", "Analyse de sentiment", "Transfert humain"],
      pricing: "99€/mois par agent",
      targetUsers: "E-commerce, entreprises SaaS, services",
      demand: "high",
      competition: "high"
    }
  ],

  fitness: [
    {
      problem: "Les gens ont du mal à rester cohérents avec leurs routines de fitness sans responsabilité personnelle.",
      idea: "Application de coach fitness IA qui fournit des entraînements personnalisés et de la responsabilité.",
      features: ["Plans d'entraînement personnalisés", "Suivi de progression", "Conseils nutritionnels", "Défis communautaires", "Intégration wearables"],
      pricing: "14,99€/mois premium",
      targetUsers: "Passionnés de fitness, professionnels occupés, débutants",
      demand: "high",
      competition: "high"
    },
    {
      problem: "Les propriétaires de salles de sport ont du mal avec la rétention et l'engagement des membres.",
      idea: "Plateforme de gestion de salle de sport avec outils d'engagement des membres intégrés.",
      features: ["Portail membre", "Réservation de cours", "Suivi de progression", "Campagnes automatisées", "Analyses de rétention"],
      pricing: "149€/mois par site",
      targetUsers: "Propriétaires de salles, studios fitness, boxes CrossFit",
      demand: "medium",
      competition: "medium"
    },
    {
      problem: "Les athlètes ont besoin de meilleures façons de suivre et analyser leurs données de performance.",
      idea: "Plateforme d'analyse sportive unifiée qui agrège les données de multiples sources.",
      features: ["Agrégation de données", "Insights de performance", "Prévention des blessures", "Comparaison d'équipe", "Rapports de scouts"],
      pricing: "29€/mois amateur, 99€/mois pro",
      targetUsers: "Athlètes amateurs, coachs, équipes sportives",
      demand: "medium",
      competition: "low"
    }
  ],

  marketing: [
    {
      problem: "Les petites entreprises ne peuvent pas se payer des agences marketing coûteuses mais ont besoin de campagnes professionnelles.",
      idea: "Générateur de campagnes marketing IA pour petites entreprises.",
      features: ["Templates de campagnes", "Rédaction IA", "Génération visuelle", "Optimisation canal", "Suivi de performance"],
      pricing: "39€/mois basique, 99€/mois pro",
      targetUsers: "Propriétaires de petites entreprises, indépendants, startups",
      demand: "high",
      competition: "medium"
    },
    {
      problem: "Les marketeurs ont du mal à prouver le ROI de leurs campagnes aux parties prenantes.",
      idea: "Tableau de bord de reporting d'attribution marketing et de ROI.",
      features: ["Attribution multi-touch", "Calculs ROI", "Rapports personnalisés", "Visualisation de données", "Options d'export"],
      pricing: "79€/mois starter, 249€/mois growth",
      targetUsers: "Responsables marketing, CMOs, agences",
      demand: "high",
      competition: "medium"
    },
    {
      problem: "Les listes d'email marketing se dégradent avec le temps avec des adresses invalides ou inactives.",
      idea: "Service de nettoyage et vérification de listes email avec surveillance continue.",
      features: ["Vérification en masse", "API temps réel", "Surveillance de liste", "Score de délivrabilité", "Outils d'intégration"],
      pricing: "Paiement à l'utilisation : 0,001€ par email",
      targetUsers: "Marketeurs email, entreprises SaaS, e-commerce",
      demand: "medium",
      competition: "high"
    }
  ],

  finance: [
    {
      problem: "Les freelances ont du mal avec les revenus irréguliers et la planification fiscale.",
      idea: "Outil de planification financière spécialement conçu pour les freelances.",
      features: ["Prévision de revenus", "Estimation fiscale", "Objectifs d'épargne", "Suivi de dépenses", "Gestion de factures"],
      pricing: "12€/mois individuel, 29€/mois avec déclaration fiscale",
      targetUsers: "Freelances, consultants, travailleurs indépendants",
      demand: "high",
      competition: "medium"
    },
    {
      problem: "Les petites entreprises ont besoin d'une meilleure visibilité et prévision de trésorerie.",
      idea: "Plateforme de gestion de trésorerie avec analyses prédictives.",
      features: ["Tableau de bord de trésorerie", "Prévision prédictive", "Suivi de factures", "Gestion de dépenses", "Système d'alertes"],
      pricing: "49€/mois PME, 149€/mois entreprise",
      targetUsers: "Propriétaires de PME, CFOs, comptables",
      demand: "high",
      competition: "medium"
    },
    {
      problem: "Les gens veulent commencer à investir mais ne savent pas par où commencer.",
      idea: "Plateforme de micro-investissement avec guidance éducative.",
      features: ["Investissement par arrondi", "Templates de portefeuille", "Contenu éducatif", "Suivi d'objectifs", "Fonctionnalités sociales"],
      pricing: "3€/mois ou 0,5% des actifs sous gestion",
      targetUsers: "Jeunes professionnels, premiers investisseurs",
      demand: "high",
      competition: "high"
    }
  ],

  education: [
    {
      problem: "Les créateurs de cours en ligne ont du mal avec l'engagement des étudiants et les taux d'achèvement.",
      idea: "Plateforme de cours axée sur la gamification et l'apprentissage communautaire.",
      features: ["Suivi de progression", "Discussions communautaires", "Gamification", "Sessions en direct", "Certificats"],
      pricing: "29€/mois + 5% de frais de transaction",
      targetUsers: "Créateurs de cours, éducateurs, entreprises de formation",
      demand: "high",
      competition: "high"
    },
    {
      problem: "Les étudiants ont besoin d'aide personnalisée mais ne peuvent pas se payer de tutorat privé.",
      idea: "Plateforme de tutorat IA qui s'adapte aux styles d'apprentissage individuels.",
      features: ["Parcours d'apprentissage personnalisés", "Explications IA", "Problèmes de pratique", "Suivi de progression", "Couverture des matières"],
      pricing: "19€/mois tutorat illimité",
      targetUsers: "Étudiants, parents, apprenants tout au long de la vie",
      demand: "high",
      competition: "medium"
    },
    {
      problem: "Les entreprises ont besoin de monter en compétence leurs employés mais manquent de programmes de formation structurés.",
      idea: "Plateforme de formation d'entreprise avec suivi des compétences et certification.",
      features: ["Parcours d'apprentissage", "Évaluations de compétences", "Programmes de certification", "Tableaux de bord managers", "Intégration LMS"],
      pricing: "15€/utilisateur/mois",
      targetUsers: "Équipes RH, départements L&D, managers",
      demand: "high",
      competition: "medium"
    }
  ],

  health: [
    {
      problem: "Les patients ont du mal à suivre leurs dossiers médicaux entre différents prestataires.",
      idea: "Plateforme de dossiers de santé unifiée pour les patients.",
      features: ["Agrégation de dossiers", "Suivi de rendez-vous", "Rappels de médicaments", "Partage avec prestataires", "Insights de santé"],
      pricing: "Gratuit basique, 9€/mois premium",
      targetUsers: "Patients avec maladies chroniques, personnes âgées, parents",
      demand: "high",
      competition: "low"
    },
    {
      problem: "Le soutien en santé mentale est coûteux et difficile d'accès.",
      idea: "Application de bien-être mental abordable avec soutien par les pairs et exercices guidés.",
      features: ["Méditations guidées", "Suivi d'humeur", "Groupes de soutien par les pairs", "Exercices TCC", "Ressources de crise"],
      pricing: "12,99€/mois ou 99€/an",
      targetUsers: "Jeunes adultes, professionnels stressés, étudiants",
      demand: "very high",
      competition: "high"
    },
    {
      problem: "Les nutritionnistes passent trop de temps à créer des plans de repas manuellement.",
      idea: "Logiciel de planification de repas pour nutritionnistes et diététiciens.",
      features: ["Gestion des clients", "Génération auto de repas", "Suivi de macros", "Base de données de recettes", "App client"],
      pricing: "49€/mois par nutritionniste",
      targetUsers: "Nutritionnistes, diététiciens, coachs santé",
      demand: "medium",
      competition: "low"
    }
  ],

  default: [
    {
      problem: "Les entreprises de ce créneau ont du mal avec des outils et flux de travail fragmentés.",
      idea: "Plateforme tout-en-un qui consolide les outils essentiels pour cette industrie.",
      features: ["Tableau de bord unifié", "Automatisation des flux", "Collaboration d'équipe", "Analyses", "Intégrations"],
      pricing: "49€/mois starter, 149€/mois business",
      targetUsers: "PME de ce créneau",
      demand: "medium",
      competition: "medium"
    },
    {
      problem: "Les professionnels de ce domaine manquent de moyens efficaces pour gérer leurs opérations quotidiennes.",
      idea: "Outil de gestion des opérations spécialisé pour cette industrie.",
      features: ["Gestion des tâches", "Planification", "Gestion des clients", "Rapports", "App mobile"],
      pricing: "29€/mois individuel, 79€/mois équipe",
      targetUsers: "Professionnels et petites équipes de ce domaine",
      demand: "medium",
      competition: "medium"
    },
    {
      problem: "Les clients sur ce marché sont mal desservis par les solutions existantes.",
      idea: "Plateforme centrée sur le client qui comble les lacunes des offres actuelles.",
      features: ["Interface conviviale", "Personnalisation", "Support rapide", "Tarification abordable", "Intégrations clés"],
      pricing: "Modèle freemium avec niveaux premium",
      targetUsers: "Clients grand public sur ce marché",
      demand: "high",
      competition: "medium"
    }
  ]
};

// Mappings de mots-clés
const KEYWORD_MAPPINGS = {
  'productivité': 'productivity',
  'productivity': 'productivity',
  'gestion du temps': 'productivity',
  'concentration': 'productivity',
  'tâche': 'productivity',
  'gestion de projet': 'productivity',
  
  'ia': 'ai',
  'ai': 'ai',
  'intelligence artificielle': 'ai',
  'machine learning': 'ai',
  'automatisation': 'ai',
  'chatbot': 'ai',
  
  'fitness': 'fitness',
  'santé': 'fitness',
  'sport': 'fitness',
  'salle de sport': 'fitness',
  'exercice': 'fitness',
  'bien-être': 'fitness',
  
  'marketing': 'marketing',
  'publicité': 'marketing',
  'seo': 'marketing',
  'réseaux sociaux': 'marketing',
  'contenu': 'marketing',
  'email marketing': 'marketing',
  
  'finance': 'finance',
  'argent': 'finance',
  'investissement': 'finance',
  'comptabilité': 'finance',
  'budget': 'finance',
  'crypto': 'finance',
  
  'éducation': 'education',
  'apprentissage': 'education',
  'cours': 'education',
  'enseignement': 'education',
  'formation': 'education',
  'e-learning': 'education',
  
  'santé': 'health',
  'médical': 'health',
  'bien-être': 'health',
  'santé mentale': 'health',
  'thérapie': 'health',
  'nutrition': 'health'
};

// Analyseur d'Opportunités
const Analyzer = {
  // Analyser un mot-clé/créneau
  analyze(keyword) {
    const normalizedKeyword = keyword.toLowerCase().trim();
    
    // Trouver la catégorie correspondante
    let category = 'default';
    for (const [key, value] of Object.entries(KEYWORD_MAPPINGS)) {
      if (normalizedKeyword.includes(key)) {
        category = value;
        break;
      }
    }

    // Obtenir les problèmes pour la catégorie
    const problems = PROBLEM_DATABASE[category] || PROBLEM_DATABASE.default;
    
    // Sélectionner un problème (dans une vraie app, ce serait plus sophistiqué)
    const problem = Random.choice(problems);
    
    // Générer les scores
    const demandScore = this.calculateDemandScore(problem, normalizedKeyword);
    const competitionScore = this.calculateCompetitionScore(problem);
    const opportunityScore = this.calculateOpportunityScore(demandScore, competitionScore);
    
    // Générer des insights supplémentaires pour premium/pro
    const difficulty = this.estimateDifficulty(problem);
    const buildTime = this.estimateBuildTime(problem);
    const competitors = this.generateCompetitors(normalizedKeyword);
    
    return {
      id: Random.id('opp-'),
      keyword: normalizedKeyword,
      category,
      timestamp: new Date().toISOString(),
      problem: problem.problem,
      idea: problem.idea,
      features: problem.features,
      pricing: problem.pricing,
      targetUsers: problem.targetUsers,
      scores: {
        demand: demandScore,
        competition: competitionScore,
        opportunity: opportunityScore
      },
      insights: {
        difficulty,
        buildTime,
        competitors
      },
      saved: false,
      favorited: false
    };
  },

  // Calculer le score de demande (1-100)
  calculateDemandScore(problem, keyword) {
    const baseScore = problem.demand === 'very high' ? 90 : 
                      problem.demand === 'high' ? 75 : 
                      problem.demand === 'medium' ? 50 : 30;
    
    // Ajouter une variation
    const variation = Random.int(-10, 10);
    return Math.max(1, Math.min(100, baseScore + variation));
  },

  // Calculer le score de concurrence (1-100)
  calculateCompetitionScore(problem) {
    const baseScore = problem.competition === 'very high' ? 90 : 
                      problem.competition === 'high' ? 70 : 
                      problem.competition === 'medium' ? 45 : 25;
    
    // Ajouter une variation
    const variation = Random.int(-10, 10);
    return Math.max(1, Math.min(100, baseScore + variation));
  },

  // Calculer le score d'opportunité
  calculateOpportunityScore(demand, competition) {
    // Forte demande + faible concurrence = opportunité élevée
    const demandWeight = 0.6;
    const competitionWeight = 0.4;
    
    // Inverser la concurrence (plus faible est meilleur)
    const invertedCompetition = 100 - competition;
    
    const score = Math.round(
      (demand * demandWeight) + 
      (invertedCompetition * competitionWeight)
    );
    
    return Math.max(1, Math.min(100, score));
  },

  // Estimer la difficulté de développement
  estimateDifficulty(problem) {
    const difficulties = ['Facile', 'Moyen', 'Difficile', 'Complexe'];
    const weights = [0.3, 0.4, 0.2, 0.1];
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < difficulties.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return difficulties[i];
      }
    }
    
    return 'Moyen';
  },

  // Estimer le temps de construction
  estimateBuildTime(problem) {
    const times = [
      '2-3 mois (MVP)',
      '3-6 mois',
      '6-9 mois',
      '9-12 mois'
    ];
    const weights = [0.25, 0.4, 0.25, 0.1];
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < times.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return times[i];
      }
    }
    
    return '3-6 mois';
  },

  // Générer une liste de concurrents
  generateCompetitors(keyword) {
    const competitorTypes = [
      'Acteurs établis',
      'Startups émergentes',
      'Spécialistes de niche',
      'Grandes entreprises tech'
    ];
    
    const numCompetitors = Random.int(3, 6);
    const competitors = [];
    
    for (let i = 0; i < numCompetitors; i++) {
      competitors.push({
        name: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} ${Random.choice(['Pro', 'Hub', 'Central', 'Plus', 'Max', '360'])}`,
        type: Random.choice(competitorTypes),
        strength: Random.choice(['Fort', 'Modéré', 'Faible'])
      });
    }
    
    return competitors;
  },

  // Obtenir le libellé du score
  getScoreLabel(score) {
    if (score >= 80) return { text: 'Excellent', class: 'high' };
    if (score >= 60) return { text: 'Bon', class: 'high' };
    if (score >= 40) return { text: 'Modéré', class: 'medium' };
    if (score >= 20) return { text: 'Faible', class: 'low' };
    return { text: 'Faible', class: 'low' };
  },

  // Obtenir le libellé de la demande
  getDemandLabel(score) {
    if (score >= 80) return 'Très Forte';
    if (score >= 60) return 'Forte';
    if (score >= 40) return 'Moyenne';
    return 'Faible';
  },

  // Obtenir le libellé de la concurrence
  getCompetitionLabel(score) {
    if (score >= 80) return 'Très Forte';
    if (score >= 60) return 'Forte';
    if (score >= 40) return 'Moyenne';
    return 'Faible';
  }
};

// Gestionnaire d'Opportunités
const OpportunityManager = {
  // Sauvegarder une opportunité
  save(opportunity) {
    const saved = Storage.get('savedOpportunities', []);
    
    // Vérifier si déjà sauvegardé
    if (saved.some(o => o.id === opportunity.id)) {
      return false;
    }
    
    opportunity.saved = true;
    opportunity.savedAt = new Date().toISOString();
    saved.unshift(opportunity);
    
    Storage.set('savedOpportunities', saved);
    return true;
  },

  // Supprimer une opportunité sauvegardée
  remove(id) {
    let saved = Storage.get('savedOpportunities', []);
    saved = saved.filter(o => o.id !== id);
    Storage.set('savedOpportunities', saved);
  },

  // Basculer le favori
  toggleFavorite(id) {
    const saved = Storage.get('savedOpportunities', []);
    const opportunity = saved.find(o => o.id === id);
    
    if (opportunity) {
      opportunity.favorited = !opportunity.favorited;
      Storage.set('savedOpportunities', saved);
      return opportunity.favorited;
    }
    
    return false;
  },

  // Obtenir toutes les opportunités sauvegardées
  getAll() {
    return Storage.get('savedOpportunities', []);
  },

  // Obtenir les favoris
  getFavorites() {
    return this.getAll().filter(o => o.favorited);
  },

  // Obtenir par ID
  getById(id) {
    return this.getAll().find(o => o.id === id);
  },

  // Obtenir l'historique d'analyses
  getHistory() {
    return Storage.get('analysisHistory', []);
  },

  // Ajouter à l'historique
  addToHistory(opportunity) {
    const history = this.getHistory();
    history.unshift(opportunity);
    
    // Garder seulement les 50 derniers
    if (history.length > 50) {
      history.pop();
    }
    
    Storage.set('analysisHistory', history);
  },

  // Vider l'historique
  clearHistory() {
    Storage.set('analysisHistory', []);
  },

  // Obtenir les statistiques
  getStats() {
    const saved = this.getAll();
    const history = this.getHistory();
    
    return {
      totalAnalyses: history.length,
      savedIdeas: saved.length,
      favoriteIdeas: saved.filter(o => o.favorited).length,
      averageScore: saved.length > 0 
        ? Math.round(saved.reduce((sum, o) => sum + o.scores.opportunity, 0) / saved.length)
        : 0
    };
  }
};

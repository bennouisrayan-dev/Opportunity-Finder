import { Router } from "express";
import OpenAI from "openai";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Réponse IA invalide");
    }
    return JSON.parse(match[0]);
  }
}

function fixGenerateResult(result) {
  return {
    name: result.name || "Business Opportunity",
    slogan: result.slogan || "Une opportunité rentable à lancer rapidement",
    businessType: result.businessType || "Business",
    idea: result.idea || "Idée business non disponible",
    problem: result.problem || "Problème non disponible",
    targetUsers: Array.isArray(result.targetUsers) && result.targetUsers.length
      ? result.targetUsers
      : ["Entrepreneurs", "Freelances"],
    features: Array.isArray(result.features) && result.features.length
      ? result.features
      : ["Offre principale", "Canal de vente", "Support client", "Optimisation"],
    monetization: result.monetization || result.pricing || "Vente directe ou abonnement",
    pricing: result.pricing || result.monetization || "Prix à définir selon le marché",
    revenueEstimate: result.revenueEstimate || "500€ à 2000€/mois après validation",
    marketingHook: result.marketingHook || "Créer du contenu court montrant le problème et la solution",
    acquisitionChannels: Array.isArray(result.acquisitionChannels) && result.acquisitionChannels.length
      ? result.acquisitionChannels
      : ["TikTok", "SEO", "Prospection directe"],
    positioning: result.positioning || "Solution simple, rapide et accessible",
    roadmap30Days: Array.isArray(result.roadmap30Days) && result.roadmap30Days.length
      ? result.roadmap30Days
      : ["Valider le problème", "Créer une offre simple", "Trouver 10 prospects", "Lancer une première vente"],
    scores: {
      demand: Number(result?.scores?.demand) || 65,
      competition: Number(result?.scores?.competition) || 45,
      opportunity: Number(result?.scores?.opportunity) || 70
    }
  };
}

function buildUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    analysesUsed: user.analysesUsed,
    analysesLimit: user.analysesLimit
  };
}

async function getCurrentUser(req) {
  return prisma.user.findUnique({
    where: { id: req.user.userId }
  });
}

function buildGenerateSystemPrompt(plan) {
  const isPro = plan === "pro";

  if (isPro) {
    return `
Tu es un expert en opportunités business modernes.

Tu dois générer des idées de BUSINESS VARIÉES, pas seulement des SaaS.

Types de business autorisés :
- SaaS
- application mobile
- e-commerce
- agence
- service local scalable
- produit digital (formation, ebook)
- business basé sur l'IA
- marketplace
- abonnement
- business physique innovant
- contenu monétisé (YouTube, TikTok, newsletter)
- automatisation business
- autre opportunité rentable

INTERDICTION :
❌ Ne donne pas uniquement des idées de SaaS
❌ Varie les modèles de business

OBJECTIF :
Proposer une opportunité réaliste, rentable et différenciante.

Réponds uniquement en JSON.

Structure exacte :
{
  "name": "nom du business",
  "slogan": "phrase marketing simple",
  "businessType": "",
  "idea": "",
  "problem": "",
  "targetUsers": [],
  "features": [],
  "monetization": "",
  "pricing": "",
  "revenueEstimate": "ex: 1000€/mois en 3 mois",
  "marketingHook": "ex: idée de contenu viral TikTok",
  "acquisitionChannels": [],
  "positioning": "",
  "roadmap30Days": [],
  "scores": {
    "demand": 0,
    "competition": 0,
    "opportunity": 0
  }
}

Règles :
- Réponse en français.
- Scores entre 0 et 100.
- Idée réaliste, rentable et lançable.
`;
  }

  return `
Tu es un expert en validation d'idées de business et opportunités entrepreneuriales.

Réponds uniquement en JSON valide.
Aucun texte hors JSON.

Le business peut être :
SaaS, application mobile, agence, e-commerce, produit IA, marketplace, service en ligne, produit digital, business local scalable ou autre business moderne.

Structure exacte :
{
  "businessType": "",
  "problem": "",
  "idea": "",
  "targetUsers": "",
  "features": ["", "", "", ""],
  "pricing": "",
  "scores": {
    "demand": 0,
    "competition": 0,
    "opportunity": 0
  }
}

Règles :
- Réponse en français.
- Scores entre 0 et 100.
- Idée crédible et monétisable.
`;
}

function buildGenerateUserPrompt(category, plan) {
  const isPro = plan === "pro";

  const types = [
    "e-commerce de niche",
    "service local rentable",
    "agence spécialisée",
    "produit digital",
    "contenu monétisé",
    "marketplace",
    "business physique innovant",
    "abonnement non-SaaS",
    "automatisation pour petites entreprises",
    "formation en ligne"
  ];

  const randomType = types[Math.floor(Math.random() * types.length)];
  const finalType = category || randomType;

  return `
Trouve une idée de business rentable de type : ${finalType}.

Important :
- Ne propose pas automatiquement un SaaS.
- Respecte le type demandé.
- L’idée doit être concrète, lançable rapidement et monétisable.
- Retourne tous les champs demandés.
- Aucun tableau vide.
- Les scores doivent être entre 0 et 100.

${isPro ? `
Analyse avancée demandée :
- nom du business
- slogan
- type de business
- problème
- idée
- cible
- offres clés
- monétisation
- pricing
- estimation de revenu
- hook marketing
- acquisition
- positionnement
- roadmap 30 jours
- scores
` : `
Analyse standard demandée :
- type de business
- problème
- idée
- cible
- offres clés
- pricing
- scores
`}
`;
}

function buildEvaluateSystemPrompt(plan) {
  const isPro = plan === "pro";

  if (isPro) {
    return `
Tu es un expert senior en validation de business, go-to-market et opportunités entrepreneuriales.

Réponds uniquement en JSON valide.
Aucun texte hors JSON.

Structure exacte :
{
  "userIdea": "",
  "businessType": "",
  "scores": {
    "demand": 0,
    "competition": 0,
    "opportunity": 0,
    "profitability": 0,
    "launchSpeed": 0,
    "marketSize": {
      "value": "",
      "description": ""
    }
  },
  "difficulty": {
    "level": "",
    "time": "",
    "reason": ""
  },
  "swot": {
    "strengths": ["", "", ""],
    "weaknesses": ["", ""],
    "improvements": ["", "", ""]
  },
  "targetUsers": [
    { "name": "", "description": "" },
    { "name": "", "description": "" }
  ],
  "competitors": [
    { "name": "", "strength": "", "weakness": "" },
    { "name": "", "strength": "", "weakness": "" }
  ],
  "marketingAngle": "",
  "launchPlan": ["", "", ""],
  "persona": {
    "name": "",
    "painPoint": "",
    "goal": ""
  },
  "recommendation": ""
}

Règles :
- Réponse en français.
- Scores entre 0 et 100.
- Analyse réaliste, utile et actionnable.
`;
  }

  return `
Tu es un expert en validation d'idées de business.

Réponds uniquement en JSON valide.
Aucun texte hors JSON.

Structure exacte :
{
  "userIdea": "",
  "businessType": "",
  "scores": {
    "demand": 0,
    "competition": 0,
    "opportunity": 0,
    "marketSize": {
      "value": "",
      "description": ""
    }
  },
  "difficulty": {
    "level": "",
    "time": "",
    "reason": ""
  },
  "swot": {
    "strengths": ["", "", ""],
    "weaknesses": ["", ""],
    "improvements": ["", "", ""]
  },
  "targetUsers": [
    { "name": "", "description": "" },
    { "name": "", "description": "" }
  ]
}

Règles :
- Réponse en français.
- Scores entre 0 et 100.
- Analyse concise et utile.
`;
}

function buildEvaluateUserPrompt(idea, plan) {
  const isPro = plan === "pro";

  return `
Analyse cette idée de business :
"${idea}"

${isPro ? `
Analyse avancée :
- type de business
- demande
- concurrence
- opportunité
- rentabilité
- vitesse de lancement
- taille de marché
- difficulté
- forces/faiblesses/améliorations
- 2 profils clients
- 2 concurrents potentiels
- angle marketing
- mini plan de lancement
- persona principal
- recommandation finale
` : `
Analyse standard :
- type de business
- demande
- concurrence
- opportunité
- taille de marché
- difficulté
- forces/faiblesses/améliorations
- 2 profils clients
`}
`;
}

router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { category } = req.body;
    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (user.plan === "free" && user.analysesUsed >= user.analysesLimit) {
      return res.status(403).json({
        error: "Vous avez utilisé tous vos crédits gratuits"
      });
    }

    const responseAI = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: user.plan === "pro" ? 0.9 : 0.8,
      messages: [
        {
          role: "system",
          content: buildGenerateSystemPrompt(user.plan)
        },
        {
          role: "user",
          content: buildGenerateUserPrompt(category, user.plan)
        }
      ]
    });

    const content = responseAI.choices[0]?.message?.content || "{}";
    const rawResult = safeJsonParse(content);
    const result = fixGenerateResult(rawResult);

    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        analysisType: "generate",
        category: category || null,
        resultJson: result
      }
    });

    const updatedUser =
      user.plan === "free"
        ? await prisma.user.update({
            where: { id: user.id },
            data: {
              analysesUsed: {
                increment: 1
              }
            }
          })
        : user;

    return res.json({
      message: "Analyse générée avec succès",
      analysis: {
        id: analysis.id,
        analysisType: analysis.analysisType,
        category: analysis.category,
        result,
        createdAt: analysis.createdAt
      },
      user: buildUserResponse(updatedUser)
    });
  } catch (error) {
    console.error("Erreur /analyze/generate :", error);
    return res.status(500).json({
      error: "Erreur lors de la génération de l'idée business"
    });
  }
});

router.post("/evaluate", requireAuth, async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 10) {
      return res.status(400).json({
        error: "Veuillez décrire votre idée en au moins 10 caractères"
      });
    }

    const cleanIdea = idea.trim();
    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (user.plan === "free" && user.analysesUsed >= user.analysesLimit) {
      return res.status(403).json({
        error: "Vous avez utilisé tous vos crédits gratuits"
      });
    }

    const responseAI = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: user.plan === "pro" ? 0.75 : 0.65,
      messages: [
        {
          role: "system",
          content: buildEvaluateSystemPrompt(user.plan)
        },
        {
          role: "user",
          content: buildEvaluateUserPrompt(cleanIdea, user.plan)
        }
      ]
    });

    const content = responseAI.choices[0]?.message?.content || "{}";
    const result = safeJsonParse(content);

    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        analysisType: "evaluate",
        input: cleanIdea,
        resultJson: result
      }
    });

    const updatedUser =
      user.plan === "free"
        ? await prisma.user.update({
            where: { id: user.id },
            data: {
              analysesUsed: {
                increment: 1
              }
            }
          })
        : user;

    return res.json({
      message: "Analyse évaluée avec succès",
      analysis: {
        id: analysis.id,
        analysisType: analysis.analysisType,
        input: analysis.input,
        result,
        createdAt: analysis.createdAt
      },
      user: buildUserResponse(updatedUser)
    });
  } catch (error) {
    console.error("Erreur /analyze/evaluate :", error);
    return res.status(500).json({
      error: "Erreur lors de l'évaluation de l'idée business"
    });
  }
});

router.post("/save/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (user.plan === "free") {
      return res.status(403).json({
        error: "La sauvegarde est réservée aux plans Premium et Pro"
      });
    }

    const analysis = await prisma.analysis.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analyse introuvable" });
    }

    const savedAnalysis = await prisma.analysis.update({
      where: { id },
      data: {
        isSaved: true
      }
    });

    return res.json({
      message: "Analyse sauvegardée",
      analysis: savedAnalysis
    });
  } catch (error) {
    console.error("Erreur POST /save/:id :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/saved", requireAuth, async (req, res) => {
  try {
    const savedAnalyses = await prisma.analysis.findMany({
      where: {
        userId: req.user.userId,
        isSaved: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({
      savedAnalyses
    });
  } catch (error) {
    console.error("Erreur GET /saved:", error);
    return res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const analyses = await prisma.analysis.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({
      analyses: analyses.map((analysis) => ({
        id: analysis.id,
        analysisType: analysis.analysisType,
        input: analysis.input,
        category: analysis.category,
        result: analysis.resultJson,
        isSaved: analysis.isSaved,
        isFavorite: analysis.isFavorite,
        createdAt: analysis.createdAt
      }))
    });
  } catch (error) {
    console.error("Erreur GET /api/analyze :", error);
    return res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

export default router;
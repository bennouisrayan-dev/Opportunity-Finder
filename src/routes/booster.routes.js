import { Router } from "express";
import OpenAI from "openai";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function safeJsonParse(text) {
  try { return JSON.parse(text); }
  catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Réponse IA invalide");
    return JSON.parse(match[0]);
  }
}

// POST /api/booster/analyze
// Premium/Pro only — does NOT consume analysis tokens
router.post("/analyze", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Enforce Premium/Pro only
    if (user.plan === "free") {
      return res.status(403).json({
        error: "Opportunity Booster AI est réservé aux membres Premium et Pro."
      });
    }

    const { opportunity, profile } = req.body;

    if (!opportunity || !profile) {
      return res.status(400).json({ error: "Opportunité et profil requis." });
    }

    const systemPrompt = `
Tu es un expert en entrepreneuriat et en coaching de lancement de business.

Tu reçois une opportunité business et le profil d'un utilisateur.
Tu dois analyser si cette opportunité est adaptée à ce profil spécifique.

Réponds uniquement en JSON valide. Aucun texte hors JSON.

Structure exacte :
{
  "fitScore": 0,
  "fitLabel": "",
  "strengths": ["", "", ""],
  "risks": ["", ""],
  "recommendedBudget": "",
  "actionPlan30Days": ["", "", "", "", ""],
  "firstActionToday": "",
  "personalizedAdvice": ""
}

Règles :
- fitScore entre 0 et 100 (adéquation profil/opportunité)
- fitLabel : "Excellent", "Très bon", "Bon", "Correct" ou "Risqué"
- strengths : 3 points forts du profil pour cette opportunité
- risks : 2 risques principaux pour ce profil
- recommendedBudget : budget adapté au profil (ex: "300€ à 600€")
- actionPlan30Days : 5 étapes concrètes sur 30 jours
- firstActionToday : UNE seule action à faire aujourd'hui
- personalizedAdvice : conseil personnalisé en 2-3 phrases
- Réponse en français
- Sois précis, honnête et bienveillant
- IMPORTANT : Ne jamais recommander un budget supérieur au budget indiqué par l'utilisateur
- Si le budget est 0€, recommande uniquement des actions gratuites ou quasi-gratuites
- Le plan d'action doit être RÉALISTE selon l'âge, le budget et l'expérience réels
`;

    const userPrompt = `
Opportunité business :
${JSON.stringify(opportunity, null, 2)}

Profil de l'utilisateur :
- Âge : ${profile.age || "Non précisé"}
- Budget disponible : ${profile.budget || "Non précisé"}
- Expérience entrepreneuriale : ${profile.experience || "Non précisé"}
- Temps disponible par semaine : ${profile.weeklyTime || "Non précisé"}
- Compétences principales : ${profile.skills || "Non précisé"}
- Objectif principal : ${profile.goal || "Non précisé"}

Analyse si cette opportunité correspond bien à ce profil et fournis des recommandations personnalisées.
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   }
      ]
    });

    const content = aiResponse.choices[0]?.message?.content || "{}";
    const result  = safeJsonParse(content);

    // ⚠️ Ne pas incrémenter analysesUsed — le Booster ne consomme pas de token
    return res.json({
      message: "Analyse Booster générée avec succès",
      result
    });

  } catch (error) {
    console.error("Erreur /api/booster/analyze :", error);
    return res.status(500).json({ error: "Erreur lors de l'analyse Booster." });
  }
});

export default router;

// POST /api/booster/business-finder
// Dedicated route with proper prompt — Premium/Pro only
// Does NOT consume analysis tokens
router.post("/business-finder", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    if (user.plan === "free") {
      return res.status(403).json({ error: "Business Finder IA est réservé aux plans Premium et Pro." });
    }

    const { answers } = req.body;
    if (!answers) return res.status(400).json({ error: "Profil requis." });

    const interests = Array.isArray(answers.interests)
      ? answers.interests.join(", ")
      : (answers.interests || "Non précisé");

    const systemPrompt = `
Tu es un expert en entrepreneuriat et en création de business.
Ta mission : analyser le profil d'un entrepreneur et recommander LE business le plus adapté.

Réponds UNIQUEMENT en JSON valide. Aucun texte hors JSON.

Structure exacte :
{
  "recommendedBusiness": "nom court et précis du business recommandé",
  "businessType": "type (ex: E-commerce, SaaS, Agence, Contenu digital...)",
  "businessDescription": "description courte et claire du business en 1-2 phrases",
  "tags": ["tag1", "tag2", "tag3"],
  "compatibilityScore": 0,
  "whyItFits": "explication détaillée pourquoi ce business correspond au profil (3-4 phrases)",
  "difficulty": "Facile / Intermédiaire / Avancé",
  "difficultyScore": 5,
  "estimatedBudget": "ex: 300€ à 800€",
  "timeToFirstRevenue": "ex: 1 à 2 mois",
  "revenuePotential": "ex: 500€ à 3 000€/mois",
  "advantages": [{"title":"","description":""}, {"title":"","description":""}, {"title":"","description":""}],
  "risks": ["", ""],
  "roadmap30Days": [{"title":"","days":"","emoji":""}, {"title":"","days":"","emoji":""}, {"title":"","days":"","emoji":""}, {"title":"","days":"","emoji":""}, {"title":"","days":"","emoji":""}]
}

Règles :
- Réponse en français
- compatibilityScore entre 0 et 100
- Sois précis et concret
- Le business doit être réaliste et adapté au profil
- tags : 2 à 3 tags courts décrivant le business (ex: "SaaS", "IA", "Contenu", "Faible coût", "Revenu récurrent")
- businessDescription : description claire et vendeuse du business en 1-2 phrases
- difficultyScore : note entre 1 et 10 correspondant à la difficulté
- advantages : tableau d'objets avec title (court) et description (1 phrase)
- roadmap30Days : tableau d'objets avec title (action concrète), days (ex: "Jours 1-5"), emoji
- whyItFits : explication personnalisée et détaillée en 3-4 phrases
- IMPORTANT : Le estimatedBudget ne doit JAMAIS dépasser le budget indiqué par l'utilisateur
- Pour un budget de 0€ : recommander uniquement des business sans investissement initial
- Pour un étudiant avec peu de temps : recommander quelque chose de simple à lancer
`;

    const userPrompt = `
Profil entrepreneur :
- Âge : ${answers.age || "Non précisé"}
- Statut : ${answers.status || "Non précisé"}
- Heures disponibles/semaine : ${answers.weeklyHours || "Non précisé"}
- Budget de départ : ${answers.budget || "Non précisé"}
- Niveau business : ${answers.businessLevel || "Non précisé"}
- Niveau technologique : ${answers.techLevel || "Non précisé"}
- Domaines d'intérêt : ${interests}
- Objectif : ${answers.goal || "Non précisé"}
- Type de business préféré : ${answers.businessPreference || "Non précisé"}
- Prêt à apprendre : ${answers.learning || "Oui"}
- Délai souhaité : ${answers.timeGoal || "Non précisé"}
- Tolérance au risque : ${answers.riskLevel || "Non précisé"}
- Préférence de travail : ${answers.workStyle || "Non précisé"}
- Localisation : ${answers.location || "France"}
- Expérience entrepreneuriale : ${answers.experience || "Non précisé"}

Recommande le business le plus adapté à ce profil.
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.75,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   }
      ]
    });

    const content = aiResponse.choices[0]?.message?.content || "{}";
    const result  = safeJsonParse(content);

    // Ne pas incrémenter analysesUsed
    return res.json({ message: "Business Finder IA généré avec succès", result });

  } catch (error) {
    console.error("Erreur /api/booster/business-finder :", error);
    return res.status(500).json({ error: "Erreur lors de l'analyse." });
  }
});

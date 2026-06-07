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

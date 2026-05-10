import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Tous les champs sont obligatoires"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caractères"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Cet email est déjà utilisé"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });

    const token = jwt.sign(
  { userId: user.id },
  "SECRET_KEY",
  { expiresIn: "7d" }
  );

    return res.status(201).json({
  message: "Utilisateur créé avec succès",
  token, // 🔥 IMPORTANT
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    analysesUsed: user.analysesUsed,
    analysesLimit: user.analysesLimit
  }
});
  } catch (error) {
    console.error("Erreur signup :", error);
    return res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email et mot de passe requis"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: "Utilisateur introuvable"
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({
        error: "Mot de passe incorrect"
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      "SECRET_KEY",
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        analysesUsed: user.analysesUsed,
        analysesLimit: user.analysesLimit
      }
    });
  } catch (error) {
    console.error("Erreur login :", error);
    return res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur introuvable"
      });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        analysesUsed: user.analysesUsed,
        analysesLimit: user.analysesLimit,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Erreur /me :", error);
    return res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

router.post("/use-credit", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur introuvable"
      });
    }

    if (user.plan === "free" && user.analysesUsed >= user.analysesLimit) {
      return res.status(403).json({
        error: "Vous avez utilisé tous vos crédits"
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        analysesUsed: {
          increment: 1
        }
      }
    });

    return res.json({
      message: "Crédit consommé",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.plan,
        analysesUsed: updatedUser.analysesUsed,
        analysesLimit: updatedUser.analysesLimit
      }
    });
  } catch (error) {
    console.error("Erreur use-credit :", error);
    return res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

export default router;
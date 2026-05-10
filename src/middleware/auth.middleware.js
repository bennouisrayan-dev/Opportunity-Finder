import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Vérifier si le header existe
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token manquant"
      });
    }

    // Récupérer le token
    const token = authHeader.split(" ")[1];

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Injecter l'user dans la requête
    req.user = {
      userId: decoded.userId
    };

    next(); // passer à la suite
  } catch (error) {
    return res.status(401).json({
      error: "Token invalide ou expiré"
    });
  }
}
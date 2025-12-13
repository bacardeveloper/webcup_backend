const PasswordUtil = require("../utils/password_utils");

class Authentification {
  static async authVerify(req, res, next) {
    console.time('authVerify'); // ← Début de mesure
    const token = req.params.token || req.body.token;

    if (!token) return res.status(401).json({ message: "Non authentifié" });

    try {
      const decodedToken = PasswordUtil.verifyToken(token);

      // suppression des propriétés non necessaires
      const { iat, exp, ...cleanToken } = decodedToken;

      // appel de next() pour passer middleware suivant
      console.timeEnd('authVerify'); // ← Fin de mesure
      return res.status(200).json(cleanToken);
    } catch (err) {
      return res.status(401).json({ message: "Non authentifié" });
    }
  }

  static async authRoute(req, res, next) {
    const token = req.params.token || req.body.token;
    console.log(token);

    if (!token) return res.status(401).json({ message: "Non authentifié" });

    try {
      const decodedToken = PasswordUtil.verifyToken(token);

      // suppression des propriétés non necessaires
      delete decodedToken.iat;
      delete decodedToken.exp;

      // appel de next() pour passer middleware suivant
      next();
    } catch (err) {
      return res.status(401).json({ message: "Non authentifié" });
    }
  }
}

module.exports = Authentification;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const EnvConfig = require("../config/env.config");

class PasswordUtil {
  static hashPassword = async (plainPassword) => {
    const saltRounds = 10; // plus c’est élevé, plus c’est sécurisé mais lent
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  };

  static checkPassword = async (plainPassword, hashedPassword) => {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match; // true si le mot de passe correspond
  };

  static isValidPassword(plainPassword) {
    if (typeof plainPassword !== "string") return false;

    const hasMinimumLength = plainPassword.length >= 6;
    const hasNumber = /\d/.test(plainPassword); // au moins un chiffre
    const hasLetter = /[a-zA-Z]/.test(plainPassword); // au moins une lettre (maj ou min)

    return hasMinimumLength && hasNumber && hasLetter;
  }

  static generateToken = (payload) =>
    jwt.sign(payload, "ADMOO856xarrd@zerdodau", { expiresIn: "90d" });

  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, "ADMOO856xarrd@zerdodau");
      return { valid: true, decoded };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }
}

module.exports = PasswordUtil;

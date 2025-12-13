const UserService = require("../services/user.service");
const User = require("../models/user.model");
const PasswordUtil = require("../utils/password_utils");

// Fonction pour vérifier si une chaîne est vide ou ne contient que des espaces
const isEmpty = (value) =>
  !value || typeof value !== "string" || value.trim() === "";

const signupUser = async (req, res) => {
  const { email, password, name, status } = req.body;

  // Vérification des champs requis
  if (isEmpty(email) || isEmpty(password) || isEmpty(name) || isEmpty(status)) {
    return res.status(400).json({
      message:
        "Tous les champs (email, mot de passe, nom) sont requis et ne doivent pas être vides.",
    });
  }

  try {
    let usertExist = await UserService.userExist(email);
    console.log(usertExist);
    if (usertExist)
      return res.status(401).json({ message: "l'email de utilisateur existe" });

    let isValidPassword = PasswordUtil.isValidPassword(password);
    if (isValidPassword === false)
      return res.status(401).json({ message: "mot de passe invalide" });

    let hashedPassword = await PasswordUtil.hashPassword(password);

    // mettre le hashage de mot de passe
    let newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
      status: status,
    });

    let addUser = await UserService.addUser(newUser);
    if (addUser)
      return res.status(200).json({ message: "inscription reussit" });

    return res.status(401).json({ message: "echec inscription" });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Erreur : inscription" });
  }
};

const signIn = async (req, res) => {
  console.log("la requete est arrivée ici");
  console.log(req.body);
  const { email, password } = req.body;

  // Vérification des champs requis
  if (isEmpty(email) || isEmpty(password)) {
    return res.status(400).json({
      message:
        "Tous les champs (email, mot de passe, nom) sont requis et ne doivent pas être vides.",
    });
  }

  let userData = await UserService.getUser(email);

  try {
    if (userData) {
      let user = new User({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        status: userData.status,
      });

      let passwordTest = await PasswordUtil.checkPassword(
        password,
        user.password
      );

      let token = PasswordUtil.generateToken({
        email: user.email,
        status: user.status,
      });

      return passwordTest
        ? res.status(201).json({
            message: "utilisateur trouvée et mot de passe correct",
            data: { name: user.name, email: user.email, status: user.status },
            token: token,
          })
        : res.status(404).json({
            message: "Mot de passe incorrect",
          });
    }
    return res.status(401).json({ message: "utilisateur non trouvée" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { signupUser, signIn };

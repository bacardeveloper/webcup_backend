const UserService = require("../services/user.service");
const { findAffinityCouple } = require("../services/ai.service");

const matchingCouple = async (req, res) => {
  let { email } = req.userData.decoded;
  let userData = await UserService.getUser(email);
  let idUser = userData["id"];
  let allUsers = await UserService.getAllUser();
  let matchingProcess = await findAffinityCouple(userData, allUsers);

  // Nettoyer la réponse de l'IA avant de la parser
  let cleanedResponse = matchingProcess
    .replace(/```json\n?/g, "")
    .replace(/\n?```/g, "")
    .trim();

  console.log("clean response");
  console.log(cleanedResponse);
  
  // console.log("Réponse brute:", matchingProcess);
  // console.log("Réponse nettoyée:", cleanedResponse);

  try {
    let listJS = JSON.parse(cleanedResponse);
    console.log(listJS);
    console.log("matching ---- ");
    console.log(listJS);
    console.log("matching ---- ");

    for (let i = 0; i < listJS.length; i++) {
      let exists = await UserService.matchExists(listJS[i], idUser);
      if (!exists) {
        await UserService.addMatch(listJS[i], idUser);
      }
    }

    console.log("ICI LIST JS");
    console.log(listJS);

    let listUserMatch = await UserService.getUsersByIds(listJS);

    // Filtrer les données sensibles
    const filteredMatches = listUserMatch.map((user) => ({
      name: user.name,
      status: user.status,
      atmosphere: user.atmosphere,
      objectif: user.objectif,
      species: user.species, // Si vous voulez garder ce champ
    }));

    return res.status(201).json({
      message: "arriver à matching",
      matches: filteredMatches,
    });
  } catch (error) {
    console.error("Erreur de parsing JSON:", error);
    return res.status(500).json({
      message: "Erreur lors du parsing des résultats",
      error: error.message,
    });
  }
};

const getProfil = async (req, res) => {
  let { email } = req.userData.decoded;
  let user = await UserService.getUser(email);
  const { password, ...userWithoutPassword } = user;
  console.log(userWithoutPassword);
  return res.status(201).json({
    message: "get profil",
    user: userWithoutPassword,
  });
};
module.exports = { matchingCouple, getProfil };

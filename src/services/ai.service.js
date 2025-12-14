const { initializeApp } = require("firebase/app");
const { getAI, getGenerativeModel, GoogleAIBackend } = require("firebase/ai");

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPI7RcMk9eDcQwT3sw15JO3Wc2S8JUfxo",
  authDomain: "ai-project-dart.firebaseapp.com",
  projectId: "ai-project-dart",
  storageBucket: "ai-project-dart.firebasestorage.app",
  messagingSenderId: "136195615543",
  appId: "1:136195615543:web:2b7cbd70f7d0975728c8b2",
};

const firebaseApp = initializeApp(firebaseConfig);
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

async function findAffinityCouple(specieUser, speciesList) {
  const prompt = `Voici une liste d'espèces/entités avec leurs caractéristiques :

${speciesList
  .map(
    (user) =>
      `-ID: ${user.id}, Espèce: ${user.specie}, Status: ${user.status}, Atmosphère: ${user.atmosphere}, Objectif: ${user.objectif}`
  )
  .join("\n")}

Trouve au moins 2 espèces qui peuvent matcher avec cette espèce :
- Espèce: ${specieUser.status}
- Atmosphère: ${specieUser.atmosphere}
- Objectif: ${specieUser.objectif}

RÈGLES STRICTES :
1. Si tu trouves 2 espèces ou plus avec de bonnes compatibilités (objectifs similaires, status complémentaires, atmosphères compatibles) : retourne exactement 2 IDs des meilleures correspondances
2. Si tu trouves seulement des correspondances partielles (quelques similitudes mais pas parfaites) : retourne exactement 1 ID de la meilleure correspondance partielle
3. Tu DOIS toujours retourner au minimum 1 ID, même si les correspondances ne sont pas parfaites
4. Ne jamais retourner un array vide []
5. Évite absolument d'inclure l'ID ${specieUser.id}

FORMAT DE RÉPONSE OBLIGATOIRE :
- Pour 2+ bonnes correspondances : ["id1", "id2"]
- Pour 1 correspondance partielle : ["id1"]

Renvoie UNIQUEMENT le JSON array, aucun autre texte, aucune explication, aucun formatage markdown.`;

  try {
    const result = await model.generateContent(prompt);
    
    const response = result.response;
    const text = response.text();
    console.log(
      `Matching pour "${specieUser.specie || specieUser.species}": ${text}`
    );

    // Fallback au cas où l'IA retourne quand même vide
    if (text.trim() === "[]" || !text.includes("[")) {
      console.log(
        "IA a retourné vide, fallback sur le premier utilisateur disponible"
      );
      const fallbackId = speciesList.find((u) => u.id !== specieUser.id)?.id;
      return fallbackId ? `["${fallbackId}"]` : "[]";
    }

    return text;
  } catch (error) {
    console.error("Erreur:", error);

    // Fallback en cas d'erreur
    const fallbackId = speciesList.find((u) => u.id !== specieUser.id)?.id;
    return fallbackId ? `["${fallbackId}"]` : "[]";
  }
}

module.exports = { findAffinityCouple };

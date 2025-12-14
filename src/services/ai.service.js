const OpenAI = require("openai");
const EnvConfig = require("../config/env.config");

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.API_KEY_OPENAI,
  // Utilise la variable d'environnement
});

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
    console.log("🤖 Tentative avec OpenAI GPT");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en matching d'espèces fantasy. Tu réponds UNIQUEMENT en format JSON array sans aucun autre texte.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    let text = response.choices[0].message.content.trim();
    console.log(
      `Matching pour "${specieUser.specie || specieUser.species}": ${text}`
    );

    // Nettoyer et extraire le JSON
    text = text
      .replace(/```json\n?/g, "")
      .replace(/\n?```/g, "")
      .trim();
    text = text.replace(/^.*?(\[.*?\]).*$/s, "$1");

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

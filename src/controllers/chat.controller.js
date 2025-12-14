const UserService = require("../services/user.service");
const OpenAI = require("openai");
const EnvConfig = require("../config/env.config"); // Ajoutez cet import

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.API_KEY_OPENAI, // N'oubliez pas les parenthèses ()
});

const chatIAcouple = async (req, res) => {
  let { email } = req.userData.decoded;
  let { message } = req.body;

  try {
    let dataUser = await UserService.getUser(email);
    let dataUserForIa = `Nom: ${dataUser.name}, Espèce: ${dataUser.status}, Atmosphère: ${dataUser.atmosphere}, Objectif: ${dataUser.objectif}`;

    let prompt = `Tu es ARIA, une IA spécialisée dans l'assistance aux rencontres inter-espèces entre Anges, Démons, Humains et Néphilims.

PROFIL DE L'UTILISATEUR :
${dataUserForIa}

TON RÔLE ET MISSION :
- Faciliter les rencontres harmonieuses entre différentes espèces
- Offrir des conseils personnalisés basés sur les caractéristiques de chaque espèce
- Résoudre les malentendus culturels inter-espèces
- Suggérer des activités et lieux de rencontre adaptés
- Maintenir un ton bienveillant et respectueux envers toutes les espèces

CONNAISSANCES SPÉCIALISÉES :
- Anges : Recherchent harmonie, lumière, paix spirituelle
- Démons : Apprécient l'intensité, la passion, l'authenticité
- Humains : Valorisent la simplicité, la sincérité, les émotions
- Néphilims : Équilibrent les aspects célestes et terrestres

MESSAGE DE L'UTILISATEUR :
"${message}"

INSTRUCTIONS :
- Réponds avec empathie et expertise
- Adapte tes conseils à son espèce et sa personnalité
- Propose des solutions concrètes et réalisables
- Reste positif et encourageant
- Utilise un langage accessible mais mystique
- Réponds en français
- Garde un ton chaleureux et professionnel
- Message court en 2 lignes maximum

Réponds maintenant à ${dataUser.name} :`;

    console.log("=== DEBUG CHAT ===");
    console.log("User:", dataUser.email);
    console.log("Message:", message);

    // Appel à l'IA OpenAI GPT
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // ou "gpt-4" si vous avez accès
      messages: [
        {
          role: "system",
          content:
            "Tu es ARIA, une IA experte en rencontres inter-espèces fantasy. Tu donnes des conseils courts, empathiques et mystiques.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const aiResponse = response.choices[0].message.content.trim();

    console.log("Réponse IA:", aiResponse);

    return res.status(200).json({
      success: true,
      message: aiResponse,
    });
  } catch (error) {
    console.error("Erreur chat IA:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors du traitement du chat",
      error: error.message,
      data: {
        fallbackResponse: `Bonjour ! Je suis ARIA, votre assistante inter-espèces. Je rencontre actuellement des difficultés techniques, mais je reste à votre disposition pour vous aider dans vos rencontres. Pouvez-vous reformuler votre question ?`,
      },
    });
  }
};

module.exports = { chatIAcouple };

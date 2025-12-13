# API Documentation - Backend OISIA MVP

Ce document décrit comment appeler les endpoints exposés par l'application, les types de requêtes, et les formats des données envoyées / renvoyées.

Base URL (local)
- http://localhost:3000
- Préfixe des routes utilisateurs : /api/users

Endpoints
1) Inscription - POST /api/users/signup
- Description : Crée un nouvel utilisateur.
- Route implémentée dans : [src/routes/user.routes.js](src/routes/user.routes.js) -> [`signupUser`](src/controllers/user.controller.js)
- Méthode : POST
- Headers :
  - Content-Type: application/json
- Body (JSON) :
  {
    "name": "Nom complet",
    "email": "utilisateur@example.com",
    "password": "MotDePasse1",
    "status": "string" // ex: "admin" ou "user"
  }
- Réponses possibles :
  - 200 OK
    {
      "message": "inscription reussit"
    }
  - 400 Bad Request
    {
      "message": "Tous les champs (...) sont requis et ne doivent pas être vides."
    }
  - 401 Unauthorized (ex : email déjà existant ou échec)
    {
      "message": "l'email de utilisateur existe"
    }
  - 500 Internal Server Error
    {
      "message": "Erreur : inscription"
    }

2) Connexion - POST /api/users/signin
- Description : Vérifie les identifiants et renvoie un token si OK.
- Route implémentée dans : [src/routes/user.routes.js](src/routes/user.routes.js) -> [`signIn`](src/controllers/user.controller.js)
- Méthode : POST
- Headers :
  - Content-Type: application/json
- Body (JSON) :
  {
    "email": "utilisateur@example.com",
    "password": "MotDePasse1"
  }
- Réponses possibles :
  - 201 Created (auth ok)
    {
      "message": "utilisateur trouvée et mot de passe correct",
      "data": { "name": "...", "email": "...", "status": "..." },
      "token": "JWT_TOKEN_STRING"
    }
    - Le token est généré par [`PasswordUtil.generateToken`](src/utils/password_utils.js).
  - 404 Not Found (mot de passe incorrect)
    {
      "message": "Mot de passe incorrect"
    }
  - 401 Unauthorized (utilisateur non trouvé)
    {
      "message": "utilisateur non trouvée"
    }
  - 400 Bad Request (champs manquants)
    {
      "message": "Tous les champs (...) sont requis et ne doivent pas être vides."
    }

3) Vérification token (auth) - GET http://localhost:3000/api/users/auth/user/:token
- Description : Vérifie et retourne le token décodé (sans iat/exp côté middleware).
- Route implémentée dans : [src/routes/user.routes.js](src/routes/user.routes.js) -> [`authVerify`](src/middlewares/auth.middleware.js)
- Méthode : GET
- Params : token dans l'URL (ou peut être envoyé dans le body)
- Exemple : GET /api/users/auth/user/eyJhbGciOi...
- Réponses possibles :
  - {
    "valid": true,
    "decoded": {
        "email": "utilisateur@example.com",
        "status": "active",
        "iat": 1761317516,
        "exp": 1769093516
    }
}
- La vérification utilise [`PasswordUtil.verifyToken`](src/utils/password_utils.js).

Formats et validations importantes
- Les requêtes acceptent/renvoient du JSON.
- Le mot de passe doit respecter la validation de [`PasswordUtil.isValidPassword`](src/utils/password_utils.js) : au moins 6 caractères, au moins une lettre et un chiffre.
- Les mots de passe sont hashés par [`PasswordUtil.hashPassword`](src/utils/password_utils.js) (bcrypt) avant insertion.
- Les opérations vers la base utilisent le client Supabase initialisé par [src/config/database.js](src/config/database.js) (utilise [src/config/env.config.js](src/config/env.config.js) pour les variables d'environnement).

Exemples curl
- Signup
curl -X POST http://localhost:3000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Jean Dupont","email":"jean@example.com","password":"MotDePasse1","status":"user"}'

- Signin
curl -X POST http://localhost:3000/api/users/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"jean@example.com","password":"MotDePasse1"}'

- Vérifier token
curl -X GET http://localhost:3000/api/users/auth/user/<TOKEN>

Fichiers et symboles utiles (référence rapide)
- Routes : [src/routes/user.routes.js](src/routes/user.routes.js)
- Contrôleur : [`signupUser`](src/controllers/user.controller.js), [`signIn`](src/controllers/user.controller.js) — [src/controllers/user.controller.js](src/controllers/user.controller.js)
- Middleware auth : [`authVerify`](src/middlewares/auth.middleware.js) — [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js)
- Utilitaires mot de passe / JWT : [`PasswordUtil.generateToken`](src/utils/password_utils.js), [`PasswordUtil.verifyToken`](src/utils/password_utils.js), [`PasswordUtil.isValidPassword`](src/utils/password_utils.js) — [src/utils/password_utils.js](src/utils/password_utils.js)
- Service utilisateur (DB) : [`UserService.userExist`](src/services/user.service.js), [`UserService.addUser`](src/services/user.service.js), [`UserService.getUser`](src/services/user.service.js) — [src/services/user.service.js](src/services/user.service.js)
- Configuration env : [src/config/env.config.js](src/config/env.config.js)
- Connexion DB Supabase : [src/config/database.js](src/config/database.js)

Autres fichiers du projet
- [server.js](server.js)
- [src/app.js](src/app.js)
- [src/models/user.model.js](src/models/user.model.js)
- [src/middlewares/error.middleware.js](src/middlewares/error.middleware.js)
- [package.json](package.json)
- [.gitignore](.gitignore)

Notes
- Assurez-vous d'avoir les variables d'environnement définies dans `.env` : SUPABASE_URL, SUPABASE_ANONKEY, JWT_TOKEN (selon [src/config/env.config.js](src/config/env.config.js)).
- Le client Supabase est initialisé dans [src/config/database.js](src/config/database.js). Si les variables manquent, le process se termine.

const request = require('supertest');
const app = require('../app');
const UserService = require('../services/user.service');

// Mock du service utilisateur pour éviter les vraies insertions en base
jest.mock('../services/user.service');

describe('User API Tests', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/signup - Création d\'utilisateur', () => {
    
    const validUserData = {
      email: 'test@example.com',
      password: 'MotDePasse123!',
      name: 'John Doe',
      status: 'active'
    };

    test('✅ Devrait créer un utilisateur avec des données valides', async () => {
      // Mock des méthodes du service
      UserService.userExist.mockResolvedValue(false);
      UserService.addUser.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/users/signup')
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(UserService.userExist).toHaveBeenCalledWith(validUserData.email);
      expect(UserService.addUser).toHaveBeenCalled();
    });

    test('❌ Devrait échouer si l\'email existe déjà', async () => {
      UserService.userExist.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/users/signup')
        .send(validUserData)
        .expect(401);

      expect(response.body.message).toBe('l\'email de utilisateur existe');
      expect(UserService.addUser).not.toHaveBeenCalled();
    });

    test('❌ Devrait échouer avec des champs manquants', async () => {
      const incompleteData = {
        email: 'test@example.com',
        password: 'MotDePasse123!'
        // name et status manquants
      };

      const response = await request(app)
        .post('/api/users/signup')
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toContain('Tous les champs');
    });

    test('❌ Devrait échouer avec un email vide', async () => {
      const invalidData = {
        ...validUserData,
        email: ''
      };

      const response = await request(app)
        .post('/api/users/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Tous les champs');
    });

    test('❌ Devrait échouer avec un mot de passe vide', async () => {
      const invalidData = {
        ...validUserData,
        password: '   ' // Espaces uniquement
      };

      const response = await request(app)
        .post('/api/users/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Tous les champs');
    });

    test('❌ Devrait échouer avec un nom vide', async () => {
      const invalidData = {
        ...validUserData,
        name: null
      };

      const response = await request(app)
        .post('/api/users/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Tous les champs');
    });

    test('❌ Devrait échouer avec un mot de passe invalide', async () => {
      UserService.userExist.mockResolvedValue(false);
      
      const invalidPasswordData = {
        ...validUserData,
        password: '123' // Mot de passe trop simple
      };

      const response = await request(app)
        .post('/api/users/signup')
        .send(invalidPasswordData)
        .expect(401);

      expect(response.body.message).toBe('mot de passe invalide');
    });

    test('❌ Devrait gérer les erreurs de service', async () => {
      UserService.userExist.mockResolvedValue(false);
      UserService.addUser.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/users/signup')
        .send(validUserData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

  });

  describe('POST /api/users/signin - Connexion utilisateur', () => {
    
    const validLoginData = {
      email: 'test@example.com',
      password: 'MotDePasse123!'
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'John Doe',
      password: '$2b$10$hashedpassword',
      status: 'active'
    };

    test('✅ Devrait connecter un utilisateur avec des identifiants valides', async () => {
      UserService.getUser.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .post('/api/users/signin')
        .send(validLoginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('message');
      expect(UserService.getUser).toHaveBeenCalledWith(validLoginData.email);
    });

    test('❌ Devrait échouer avec un email inexistant', async () => {
      UserService.getUser.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/signin')
        .send(validLoginData)
        .expect(401);

      expect(response.body.message).toContain('Utilisateur non trouvé');
    });

    test('❌ Devrait échouer avec un mot de passe incorrect', async () => {
      UserService.getUser.mockResolvedValue(mockUser);

      const invalidPasswordData = {
        email: 'test@example.com',
        password: 'MauvaisMotDePasse'
      };

      const response = await request(app)
        .post('/api/users/signin')
        .send(invalidPasswordData)
        .expect(401);

      expect(response.body.message).toContain('Mot de passe incorrect');
    });

    test('❌ Devrait échouer avec des champs manquants', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // password manquant
      };

      const response = await request(app)
        .post('/api/users/signin')
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toContain('Email et mot de passe requis');
    });

    test('❌ Devrait échouer avec un email vide', async () => {
      const invalidData = {
        email: '',
        password: 'MotDePasse123!'
      };

      const response = await request(app)
        .post('/api/users/signin')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Email et mot de passe requis');
    });

    test('❌ Devrait gérer les erreurs de service lors de la connexion', async () => {
      UserService.getUser.mockRejectedValue(new Error('Erreur de base de données'));

      const response = await request(app)
        .post('/api/users/signin')
        .send(validLoginData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

  });

  describe('GET /api/users/auth/user/:token - Vérification de token', () => {
    
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example';

    test('✅ Devrait valider un token correct', async () => {
      const response = await request(app)
        .get(`/api/users/auth/user/${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('valid');
    });

    test('❌ Devrait échouer avec un token invalide', async () => {
      const invalidToken = 'invalid.token.here';

      const response = await request(app)
        .get(`/api/users/auth/user/${invalidToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    test('❌ Devrait échouer sans token', async () => {
      const response = await request(app)
        .get('/api/users/auth/user/')
        .expect(404);
    });

  });

});

// Tests d'intégration (optionnels - à activer pour les tests complets)
describe.skip('Integration Tests - Real Database', () => {
  
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User',
    status: 'active'
  };

  test('Cycle complet : Création -> Connexion -> Vérification', async () => {
    // 1. Créer un utilisateur
    let response = await request(app)
      .post('/api/users/signup')
      .send(testUser)
      .expect(201);

    // 2. Se connecter avec cet utilisateur
    response = await request(app)
      .post('/api/users/signin')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    const { token } = response.body;
    expect(token).toBeDefined();

    // 3. Vérifier le token
    response = await request(app)
      .get(`/api/users/auth/user/${token}`)
      .expect(200);

    expect(response.body.valid).toBe(true);
  });

});

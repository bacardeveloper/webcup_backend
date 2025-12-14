// models/user.model.js

class User {
  constructor({ name, email, password, status,  atmosphere, objectif }) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.status = status; 
    this.atmosphere = atmosphere;
    this.objectif =objectif
  }
}

module.exports = User;

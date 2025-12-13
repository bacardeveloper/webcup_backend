// models/user.model.js

class User {
  constructor({ name, email, password, status }) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.status = status; 
  }
}

module.exports = User;

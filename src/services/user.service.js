const User = require("../models/user.model");
const connectDB = require("../config/database");

const supabase = connectDB();

const dataBaseTable = "users_boulou";

class UserService {
  static userExist = async (email) => {
    try {
      const { data, error } = await supabase
        .from(dataBaseTable)
        .select("email")
        .eq("email", email);

      console.log("Data :", data.length);
      console.log("Error :", error);

      if (data.length > 0) return true;
      return false;
    } catch (err) {
      console.error("Exception :", err);
      return false;
    }
  };

  static async addUser(user) {
    try {
      const { data, error } = await supabase.from(dataBaseTable).insert({
        name: user.name,
        email: user.email,
        password: user.password,
        status: user.status,
      });
      console.error("Erreur de insertion user", error);
      return true;
    } catch (err) {
      console.error("Exception :", err);
      return false;
    }
  }

  static async getUser(email) {
    try {
      const { data, error } = await supabase
        .from(dataBaseTable)
        .select()
        .eq("email", email)
        .single();
      if (data) return data;
      return false;
    } catch (error) {
      return false;
    }
  }
}

module.exports = UserService;

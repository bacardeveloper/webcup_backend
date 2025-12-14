const User = require("../models/user.model");
const connectDB = require("../config/database");

const supabase = connectDB();

const dataBaseTable = "users_boulou_duplicate";
const dataBaseTableMatch = "table_match_ia";

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

  static addMatch = async (idMatch, idUser) => {
    try {
      const { data, error } = await supabase.from(dataBaseTableMatch).insert({
        idMatch: idMatch,
        idUser: idUser,
      });
    } catch (err) {
      return false;
    }
  };

  static async addUser(user) {
    console.log(user);
    try {
      const { data, error } = await supabase.from(dataBaseTable).insert({
        name: user.name,
        email: user.email,
        password: user.password,
        status: user.status,
        species: user.species,
        atmosphere: user.atmosphere,
        objectif: user.objectif,
      });
      console.error("Erreur de insertion user", error);
      return true;
    } catch (err) {
      console.error("Exception :", err);
      return false;
    }
  }

  static async getAllUser() {
    try {
      const { data, error } = await supabase.from(dataBaseTable).select();
      return data;
    } catch (err) {
      return [];
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

  static async getUsersByIds(idList) {
    try {
      const { data, error } = await supabase
        .from(dataBaseTable)
        .select()
        .in("id", idList); // Filtre par liste d'IDs

      if (error) {
        console.error("Erreur getUsersByIds:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Exception getUsersByIds:", err);
      return [];
    }
  }

  static matchExists = async (idMatch, idUser) => {
  try {
    const { data, error } = await supabase
      .from(dataBaseTableMatch)
      .select("*")
      .eq("idMatch", idMatch)
      .eq("idUser", idUser);

    if (error) {
      console.error("Erreur matchExists:", error);
      return false;
    }

    return data.length > 0; // Retourne true si le match existe déjà
  } catch (err) {
    console.error("Exception matchExists:", err);
    return false;
  }
};
}

module.exports = UserService;

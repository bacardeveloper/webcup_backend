const dotenv = require("dotenv");
dotenv.config();

const jwt_token = process.env.JWT_TOKEN;
const supabase_url = process.env.SUPABASE_URL;
const supabase_anon_key = process.env.SUPABASE_ANON_KEY;

class EnvConfig {
  static get_jwt_token = () => jwt_token;
  static get_supabase_url = () => supabase_url;
  static get_supabase_anon_key = () => supabase_anon_key;
}

module.exports = EnvConfig;

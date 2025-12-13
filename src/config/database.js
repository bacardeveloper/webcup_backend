const { createClient } = require("@supabase/supabase-js");
const EnvConfig = require("./env.config");
const dotenv = require("dotenv");

dotenv.config();

const connectDB =  () => {
  const supabaseUrl = EnvConfig.get_supabase_url();
  const supabaseKey = EnvConfig.get_supabase_anon_key();

  if (!supabaseUrl || !supabaseKey) {
    console.debug("❌ Supabase URL ou clé manquante dans .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  console.debug("✅ Supabase client initialisé avec succès");

  return supabase;
};

module.exports = connectDB;

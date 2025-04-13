// supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = process.env.SUPABASE_URL || "https://qiblwjpijwhtlmylrlxl.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpYmx3anBpandodGxteWxybHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4Nzk2MzcsImV4cCI6MjA1NzQ1NTYzN30.WyNSVoxb3y0-2wJooTJUsqPdzCpkpGjb3Xr2YyDazVQ";

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseClient;

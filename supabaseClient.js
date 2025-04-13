// supabaseClient.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://qiblwjpijwhtlmylrlxl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpYmx3anBpandodGxteWxybHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4Nzk2MzcsImV4cCI6MjA1NzQ1NTYzN30.WyNSVoxb3y0-2wJooTJUsqPdzCpkpGjb3Xr2YyDazVQ";

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseClient;

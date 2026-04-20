import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

// Клиент для API-роутов (серверный, с admin правами)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Клиент для клиентского кода (ограниченные права)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Название бакета для файлов
export const BUCKET_NAME = "dfk-files";

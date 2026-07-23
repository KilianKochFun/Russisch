// Supabase-Client (Phase 2) — Supabase-JS v2 als ES-Modul von esm.sh, kein Bundler nötig.
// Dieses Modul wird in main.js dynamisch importiert, damit die App auch ohne
// Internet (oder wenn esm.sh down ist) noch startet — dann ohne Login/Sync.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function logout() {
  await supabase.auth.signOut();
}

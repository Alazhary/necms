import { supabase } from '../supabase';

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', userId)
    .single();
  return data;
}

export default supabase;

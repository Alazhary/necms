import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfglgtufrbivtximmrfv.supabase.co';
const supabaseAnonKey = 'sb_publishable_IthrPMku353AhYQG2QaZbQ_RJs8WWhc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

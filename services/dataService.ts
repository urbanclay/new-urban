import { supabase } from './supabaseClient';

export type Table = 'work_records' | 'projects' | 'memos';

// --- Records ---
export async function fetchRecords(userId: string) {
  const { data, error } = await supabase
    .from('work_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertRecord(payload: any) {
  const { data, error } = await supabase.from('work_records').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateRecord(id: string, patch: any) {
  const { data, error } = await supabase.from('work_records').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteRecord(id: string) {
  const { error } = await supabase.from('work_records').delete().eq('id', id);
  if (error) throw error;
}

// --- Projects ---
export async function fetchProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertProject(payload: any) {
  const { data, error } = await supabase.from('projects').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, patch: any) {
  const { data, error } = await supabase.from('projects').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

// --- Memos ---
export async function fetchMemos(userId: string) {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertMemo(payload: any) {
  const { data, error } = await supabase.from('memos').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateMemo(id: string, patch: any) {
  const { data, error } = await supabase.from('memos').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteMemo(id: string) {
  const { error } = await supabase.from('memos').delete().eq('id', id);
  if (error) throw error;
}

// --- Realtime subscribe ---
export function subscribeTable(userId: string, table: Table, onChange: () => void) {
  const channel = supabase
    .channel(`${table}-changes-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` }, (_payload) => {
      onChange();
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

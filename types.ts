
export type RecordType = 'promotional' | 'meeting_minutes' | 'policy_application' | 'project_proposal';
export type FileType = 'pdf' | 'doc' | 'txt' | 'link' | 'image' | 'video';
export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'delayed' | 'deleted';
export type Priority = 'high' | 'medium' | 'low';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Only for local mock storage
  avatar_url?: string;
  is_verified: boolean;
}

export interface WorkRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  record_type: RecordType;
  content?: string;
  file_url?: string;
  link_url?: string;
  file_type?: FileType;
  status: 'active' | 'archived' | 'deleted';
  priority: Priority;
  progress: number;
  created_at: string;
  ai_summary?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  project_type: string;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  start_date: string;
  end_date?: string;
  target_date?: string;
  file_name?: string;
  linked_record_ids: string[];
}

export interface Memo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  type: 'meeting' | 'reminder' | 'memo';
  priority: Priority;
  is_notified: boolean;
}

export interface AIAnalysisResult {
  summary: string;
  keywords: string[];
  suggested_type: RecordType;
  extracted_tasks: string[];
}

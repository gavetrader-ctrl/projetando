export type ProjectStatus = 'planning' | 'active' | 'paused' | 'finished';
export type ProjectType = 'personal' | 'professional' | 'study' | 'financial' | 'health' | 'spiritual' | 'other';
export type Priority = 'high' | 'medium' | 'low';
export type ReturnTimeline = 'short' | 'medium' | 'long';
export type ReturnFrequency = 'once' | 'recurring';

export interface Attachment {
  id: string;
  name: string;
  description: string;
  type: 'link' | 'document' | 'image' | 'other';
  url: string;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
}

export interface CostItem {
  id: string;
  description: string;
  value: number;
}

export interface ProjectFinancial {
  totalBudget: number;
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
  reserve: CostItem[];
  unexpected: CostItem[];
  goal: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  hasParticipants: boolean;
  participants: Participant[];
  studyAttachments: Attachment[];
  projectAttachments: Attachment[];
  financial: ProjectFinancial;
  returnTimeline: ReturnTimeline;
  returnFrequency: ReturnFrequency;
  observations: string;
  activities: Activity[];
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  observation: string;
  attachments: Attachment[];
  createdAt: string;
}

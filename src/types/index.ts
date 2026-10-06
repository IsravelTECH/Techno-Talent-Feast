export type UserRole = 'admin' | 'judge' | 'participant' | 'viewer';

export type EventStatus = 'DRAFT' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'ARCHIVED';

export type CompetitionStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'PAUSED';

export type EvaluationStatus = 'PENDING' | 'DRAFT' | 'SUBMITTED' | 'LOCKED' | 'REVIEWED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  organization: string;
  phone?: string;
  specialization?: string;
}

export interface TTFEvent {
  id: string;
  name: string;
  edition: string;
  theme: string;
  date: string;
  venue: string;
  city: string;
  status: EventStatus;
  totalParticipants: number;
  totalSchools: number;
  totalJudges: number;
  totalCompetitions: number;
  description: string;
  bannerImage: string;
  scoringProgress: number; // e.g. 78%
}

export interface School {
  id: string;
  name: string;
  code: string;
  logo: string;
  city: string;
  state: string;
  principalName: string;
  coordinatorName: string;
  contactNumber: string;
  email: string;
  totalParticipants: number;
  totalCompetitions: number;
  averageScore: number;
  rank: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxMarks: number;
  weight: number;
  order: number;
  isMandatory: boolean;
}

export interface Rubric {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  maxScore: number;
  passingScore: number;
  criteria: RubricCriterion[];
}

export interface Competition {
  id: string;
  name: string;
  category: 'Robotics' | 'Coding' | 'AI & Data' | 'STEM' | 'Digital Design' | 'Innovation' | 'Quiz';
  description: string;
  gradeEligibility: string;
  maxParticipants: number;
  registeredCount: number;
  completedCount: number;
  pendingCount: number;
  assignedJudgesCount: number;
  timeLimit: string;
  maxScore: number;
  status: CompetitionStatus;
  icon: string;
  venueHall: string;
  rubricId: string;
}

export interface Participant {
  id: string;
  participantId: string; // e.g. TTF-2026-00421
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  grade: number;
  schoolId: string;
  schoolName: string;
  city: string;
  competitionId: string;
  competitionName: string;
  category: string;
  teamName?: string;
  email: string;
  phone: string;
  parentName: string;
  parentContact: string;
  status: EvaluationStatus;
  finalScore: number;
  percentage: number;
  rank?: number;
  award?: 'WINNER' | 'RUNNER_UP' | 'SECOND_RUNNER_UP' | 'SPECIAL_AWARD' | 'PARTICIPATION';
  photo: string;
  projectTitle: string;
  projectSummary: string;
}

export interface JudgeAssignment {
  judgeId: string;
  judgeName: string;
  competitionId: string;
  competitionName: string;
  assignedCount: number;
  completedCount: number;
  pendingCount: number;
  status: 'ACTIVE' | 'IDLE' | 'COMPLETED' | 'OFFLINE';
  lastActivity: string;
}

export interface EvaluationScore {
  criterionId: string;
  criterionName: string;
  score: number;
  maxMarks: number;
  remarks?: string;
}

export interface Evaluation {
  id: string;
  participantId: string;
  participantName: string;
  participantCode: string;
  schoolName: string;
  competitionId: string;
  competitionName: string;
  judgeId: string;
  judgeName: string;
  scores: EvaluationScore[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: EvaluationStatus;
  generalComments?: string;
  submittedAt?: string;
  updatedAt: string;
}

export interface ScoringActivity {
  id: string;
  judgeName: string;
  judgeAvatar: string;
  action: string;
  participantName: string;
  competitionName: string;
  score?: number;
  timestamp: string;
  timeAgo: string;
}

export interface LeaderboardItem {
  rank: number;
  participantId: string;
  participantCode: string;
  participantName: string;
  photo: string;
  schoolName: string;
  competitionName: string;
  category: string;
  grade: number;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'EVALUATED' | 'IN_PROGRESS';
  award?: string;
  recentChange?: 'up' | 'down' | 'same';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  type: 'score' | 'competition' | 'result' | 'system';
  isRead: boolean;
  actionLink?: string;
}

export interface AuditLogItem {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

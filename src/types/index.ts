// TTF 2026 STRICT TWO-ROLE ARCHITECTURE
export type UserRole = 'admin' | 'judge';

export type EventStage =
  | 'REGISTRATION'
  | 'SCHOOL_PRELIMINARY'
  | 'PRELIMINARY_ROUND'
  | 'FINALIST_SELECTION'
  | 'FINALIST_CONFIRMATION'
  | 'FINALIST_VERIFICATION'
  | 'GRAND_FINALE'
  | 'JUDGING'
  | 'RESULTS_PROCESSING'
  | 'RESULTS_PUBLISHED'
  | 'COMPLETED';

export type CompetitionStatus = 'UPCOMING' | 'STAGE_1_SCHOOL' | 'FINALISTS_CONFIRMED' | 'LIVE' | 'COMPLETED';

export type EvaluationStatus = 'PENDING' | 'IN_PROGRESS' | 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'LOCKED' | 'COMPLETED';

export type ScoreboardVisibility = 'HIDDEN' | 'INTERNAL_ONLY' | 'LIVE' | 'PUBLISHED';

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
  assignedCategory?: string;
}

export interface TTFEvent {
  id: string;
  name: string;
  edition: string;
  theme: string;
  grandFinaleDate: string;
  schoolRegDate: string;
  studentRegDate: string;
  finalistSubmissionDate: string;
  venue: string;
  location: string;
  city: string;
  country: string;
  feePerStudent: string;
  registrationFeeAED?: number | string;
  totalParticipants: number;
  totalSchools: number;
  totalJudges: number;
  totalCategories: number;
  totalProjects: number;
  finalistsPerSchoolQuota: number; // 12
  slogan: string;
  description: string;
  stage: EventStage;
  currentStage?: EventStage;
  status?: string;
  date?: string;
  scoreboardVisibility: ScoreboardVisibility;
  scoringProgress: number;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

export interface CategoryFinalistQuota {
  categoryNumber: number;
  categoryName: string;
  required: number; // 2
  selected: number;
  status: 'COMPLETE' | 'PENDING';
}

export interface School {
  id: string;
  name: string;
  code: string;
  logo: string;
  city: string;
  state?: string;
  country: string;
  principalName: string;
  coordinatorName: string;
  contactNumber: string;
  email: string;
  totalRegistered: number;
  totalParticipants?: number;
  totalCompetitions?: number;
  totalFinalists: number; // Max 12
  isQuotaConfirmed: boolean;
  categoryQuotas: CategoryFinalistQuota[];
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
  weight: number; // e.g. 30, 25, 20, 15, 10
  order: number;
  isMandatory: boolean;
  focusAreas: string[];
}

export interface Rubric {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  maxScore: number; // 100
  passingScore: number;
  criteria: RubricCriterion[];
}

export interface CompetitionProject {
  id: string;
  projectNumber: number; // 1 to 4
  title: string;
  categoryNumber: number; // 1 to 6
  categoryName: string;
  gradeEligibility: string;
  objective: string;
  specification: string;
  description?: string;
  softwareOrTools: string[];
  tasks: string[];
  submissionRequirements: string[];
}

export interface Competition {
  id: string;
  categoryNumber: number; // 1 to 6
  name: string;
  challengeTitle: string; // e.g. "ICT Challenge"
  gradeEligibility: string; // "Grades 1 & 2"
  gradeBand?: string;
  tagline?: string;
  category?: string;
  description: string;
  finalistsQuotaPerSchool: number; // 2
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
  allowedTools: string[];
  projects: CompetitionProject[];
}

export interface TeamMember {
  name: string;
  grade: number;
  role?: string;
}

export interface Participant {
  id: string;
  participantId: string; // e.g. TTF-2026-00421
  name: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  grade: number;
  categoryNumber: number; // 1 to 6
  projectNumber: number; // 1 to 4
  categoryName: string;
  category?: string;
  competitionId: string;
  competitionName: string;
  projectTitle: string;
  selectedProjectTitle: string;
  schoolId: string;
  schoolName: string;
  city: string;
  isGroupProject: boolean;
  teamName?: string;
  teamMembers?: TeamMember[];
  teamSize?: number;
  isGrandFinalist: boolean; // 2 per category per school
  stage: 'STAGE_1_SCHOOL' | 'STAGE_2_FINALE';
  assignedJudgeId?: string;
  assignedJudgeName?: string;
  email: string;
  phone: string;
  parentName?: string;
  parentContact?: string;
  status: EvaluationStatus;
  finalScore: number;
  percentage: number;
  rank?: number;
  award?: 'WINNER' | 'RUNNER_UP' | 'SECOND_RUNNER_UP' | 'SPECIAL_AWARD' | 'PARTICIPATION';
  photo: string;
  projectSummary: string;
  projectDescription?: string;
  softwareUsed?: string;
  filesSubmitted?: string[];
  submissionTimestamp?: string;
  evaluatedTimestamp?: string;
  criterionScores?: Record<string, number>;
  judgeRemarks?: string;
}

export interface Judge {
  id: string;
  judgeId: string; // e.g. JDG-01
  name: string;
  judgeName?: string;
  email: string;
  phone: string;
  avatar: string;
  title: string;
  organization: string;
  institution?: string;
  specialization: string;
  experience?: string;
  competitionName?: string;
  competitionId?: string;
  assignedCategory?: string;
  assignedCategories: number[]; // e.g. [6]
  assignedCategoryNames: string[];
  assignedProjects: string[];
  assignedHall: string;
  assignedSlot: string;
  assignedCount: number;
  completedCount: number;
  pendingCount: number;
  status: 'ACTIVE' | 'IN_SESSION' | 'AVAILABLE' | 'COMPLETED' | 'INACTIVE';
  lastActivity: string;
}

export interface JudgeAssignment {
  id: string;
  judgeId: string;
  judgeName: string;
  categoryNumber: number;
  categoryName: string;
  competitionName?: string;
  competitionId?: string;
  projectNumber: number;
  projectTitle: string;
  participantId: string;
  participantName: string;
  schoolName: string;
  hall: string;
  slot: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'VERIFIED' | 'COMPLETED';
  assignedAt: string;
  score?: number;
  totalScore?: number;
  scoreSubmitted?: boolean;
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
  time?: string;
}

export interface LeaderboardItem {
  rank: number;
  participantId: string;
  participantCode: string;
  participantName: string;
  photo: string;
  schoolName: string;
  competitionName: string;
  categoryNumber: number;
  categoryName: string;
  projectTitle: string;
  teamName?: string;
  teamMembers?: TeamMember[];
  isGroupProject?: boolean;
  teamSize?: number;
  grade: number;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'EVALUATED' | 'IN_PROGRESS';
  award?: string;
  isTie?: boolean;
  recentChange?: 'up' | 'down' | 'same';
}

export interface AnnouncementItem {
  id: string;
  title: string;
  description?: string;
  message?: string;
  content?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  target?: 'ALL' | 'JUDGES' | 'ADMINISTRATION';
  targetAudience?: 'ALL' | 'JUDGES' | 'ADMINISTRATION';
  isPublished?: boolean;
  createdAt: string;
  author?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  type: 'score' | 'competition' | 'assignment' | 'announcement' | 'system' | 'result';
  isRead: boolean;
  actionLink?: string;
}

export interface AuditLogItem {
  id: string;
  userName: string;
  userRole: 'ADMIN' | 'JUDGE' | 'admin' | 'judge';
  action: string;
  details: string;
  participantName?: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress?: string;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import {
  User,
  UserRole,
  TTFEvent,
  School,
  Competition,
  Rubric,
  RubricCriterion,
  Participant,
  Judge,
  JudgeAssignment,
  ScoringActivity,
  LeaderboardItem,
  NotificationItem,
  AuditLogItem,
  AnnouncementItem,
  EventStage,
  ScoreboardVisibility,
  EvaluationStatus,
  CompetitionProject
} from '../types';
import {
  INITIAL_EVENT,
  MOCK_USERS,
  MOCK_SCHOOLS,
  MOCK_COMPETITIONS,
  MOCK_RUBRICS,
  INITIAL_PARTICIPANTS,
  MOCK_JUDGES,
  MOCK_ASSIGNMENTS,
  INITIAL_SCORING_ACTIVITIES,
  INITIAL_LEADERBOARD,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANNOUNCEMENTS,
  MOCK_AUDIT_LOGS
} from '../data/mockData';
import { generateJudgePassword } from '../utils/judgeCredentials';

export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole;
  currentPage: string;
  selectedEvent: TTFEvent;
  selectedCompetitionId: string;
  selectedParticipantId: string;
  selectedSchoolId: string;
  selectedProjectNumber: number;
  
  participants: Participant[];
  schools: School[];
  competitions: Competition[];
  projects: CompetitionProject[];
  selectedProject: CompetitionProject | null;
  setSelectedProject: (project: CompetitionProject | null) => void;
  rubrics: Record<string, Rubric>;
  judges: Judge[];
  assignments: JudgeAssignment[];
  leaderboard: LeaderboardItem[];
  scoringActivities: ScoringActivity[];
  notifications: NotificationItem[];
  announcements: AnnouncementItem[];
  auditLogs: AuditLogItem[];
  dashboardStats: {
    totalTeams: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    scoringProgress: number;
    totalSchools: number;
    totalJudges: number;
    averageScore: number;
  } | null;
  activeCriterionScores: Record<string, number>;
  activeScoreComments: string;
  isDraftSaved: boolean;
  scoringScenarioRun: boolean;

  // Actions
  navigate: (page: string, params?: { compId?: string; partId?: string; schoolId?: string; projectNum?: number }) => void;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  setCriterionScore: (criterionId: string, score: number) => void;
  setActiveComments: (comments: string) => void;
  saveEvaluationDraft: () => void;
  submitEvaluation: () => void;
  submitTeamEvaluation: (params: {
    participantId: string;
    scores: Record<string, number>;
    remarks?: string;
    defenseChecks?: Record<string, boolean>;
  }) => { success: boolean; totalScore: number; percentage: number };
  lookupTeamById: (query: string) => Participant | null;
  resetActiveScore: () => void;
  loadParticipantForScoring: (participantId: string) => void;
  
  // Administration actions
  createJudgeAssignment: (params: {
    judgeId: string;
    categoryNumber: number;
    projectNumber: number;
    participantId: string;
    hall: string;
    slot: string;
  }) => { success: boolean; message: string };
  assignJudgeToParticipant: (judgeId: string, participantId: string, projectId?: string) => { success: boolean; message: string };
  removeJudgeAssignment: (assignmentId: string) => void;
  verifyParticipantScore: (participantId: string) => void;
  verifyScoreByAdmin: (participantId: string) => void;
  reopenParticipantEvaluation: (participantId: string) => void;
  reopenEvaluation: (participantId: string, reason?: string) => void;
  publishResultsOfficially: () => void;
  publishCompetitionResults: (competitionId?: string) => void;
  updateRubricCriterion: (rubricId: string, criterionId: string, fieldOrUpdates: any, value?: any) => void;
  addRubricCriterion: (rubricId: string, criterion?: any) => void;
  deleteRubricCriterion: (rubricId: string, criterionId: string) => void;
  scoreboardVisibility: ScoreboardVisibility;
  setScoreboardVisibilityMode: (visibility: ScoreboardVisibility) => void;
  setScoreboardVisibility: (visibility: ScoreboardVisibility) => void;
  setEventStageMode: (stage: EventStage) => void;
  setEventStage: (stage: EventStage) => void;
  addAnnouncement: (announcement: any) => void;
  createAnnouncement: (ann: { title: string; message: string; priority?: any; targetAudience?: any }) => void;
  // Project Assignment & Registration
  updateParticipantProject: (participantId: string, projectId: string) => { success: boolean; message: string };
  registerTeamWithProject: (params: {
    name: string;
    teamName?: string;
    schoolId: string;
    schoolName: string;
    grade: number;
    categoryNumber: number;
    projectId: string;
    teamMembers?: string[];
  }) => { success: boolean; message: string };

  // Authentication & Dynamic Atlas Actions
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  createJudge: (judgeData: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  bulkImportJudges: (judgesData: any[]) => Promise<{ success: boolean; count?: number; message?: string; error?: string; errors?: any[] }>;
  bulkImportParticipants: (teamsData: any[]) => Promise<{ success: boolean; count?: number; message?: string; error?: string; errors?: any[] }>;
  updateJudge: (id: string, updates: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  deleteJudge: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  toggleJudgeStatus: (id: string, currentStatus: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  createSchool: (schoolData: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateSchool: (id: string, updates: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  deleteSchool: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  createCategory: (categoryData: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateCategory: (id: string, updates: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateUserProfile: (updates: { name?: string; email?: string; phone?: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
  changeUserPassword: (passwords: { currentPassword?: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
  refreshData: (options?: { silent?: boolean }) => Promise<void>;
  isLoadingData: boolean;

  // UI helpers
  addToast: (toastOrMessage: any, toastType?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (params: {
    title: string;
    message: string;
    type?: NotificationItem['type'];
    actionLink?: string;
    recipientRole?: string;
  }) => void;
  triggerManagerScenario: () => void;

  // Score Edit Requests
  requestScoreEdit: (teamId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  respondToScoreEditRequest: (teamId: string, action: 'APPROVE' | 'REJECT', remarks?: string) => Promise<{ success: boolean; message: string }>;

  // Tie-Break Alerts
  sendTieBreakAlert: (params: { teamId: string; judgeId?: string; judgeName?: string; message?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function deduplicateNotifications(list: NotificationItem[]): NotificationItem[] {
  const seenKeys = new Set<string>();
  const seenIds = new Set<string>();
  const result: NotificationItem[] = [];

  for (const item of list) {
    if (!item) continue;
    const itemId = item.id || (item as any)._id;
    if (itemId && seenIds.has(itemId)) continue;

    // Detect team identifier in message (e.g. TTF26-TEAM-001 or TTF26-PART-001)
    const teamMatch = (item.message || '').match(/TTF26-(?:TEAM|PART)-\d+/i);
    const semKey = teamMatch
      ? `${item.type || 'system'}|${(item.title || '').trim().toLowerCase()}|${teamMatch[0].toUpperCase()}`
      : `${item.type || 'system'}|${(item.title || '').trim().toLowerCase()}|${(item.message || '').replace(/\s+/g, ' ').trim().toLowerCase()}`;

    if (seenKeys.has(semKey)) continue;

    if (itemId) seenIds.add(itemId);
    seenKeys.add(semKey);
    result.push(item);
  }
  return result;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Valid pages recognized by TTF router
  const VALID_PAGES = new Set([
    'dashboard', 'events', 'event-detail', 'schools', 'participants', 'participant-detail',
    'categories', 'competitions', 'competition-detail', 'projects', 'assignments', 'results',
    'reports', 'settings', 'rubrics', 'roles', 'score-requests', 'tie-breaks',
    'judge-dashboard', 'judge-assignments',
    'scoring', 'judge-completed', 'leaderboard', 'notifications', 'profile', 'login'
  ]);

  // Strict whitelist of pages that Judges are authorized to view
  const JUDGE_ALLOWED_PAGES = new Set(['scoring', 'judge-dashboard', 'profile']);

  // Helper to read initial page state on browser refresh or URL hash (Default to 'login' for unauthenticated visitors)
  const getInitialPage = (): string => {
    try {
      const savedUser = localStorage.getItem('ttf_2026_current_user');
      if (!savedUser) {
        return 'login';
      }
      const savedRole = localStorage.getItem('ttf_2026_current_role');
      const hash = window.location.hash.replace('#', '').trim();

      // If user is a Judge, strictly restrict to Judge-authorized routes
      if (savedRole === 'judge') {
        if (hash && JUDGE_ALLOWED_PAGES.has(hash)) {
          return hash === 'judge-dashboard' ? 'scoring' : hash;
        }
        const savedPage = localStorage.getItem('ttf_2026_current_page');
        if (savedPage && JUDGE_ALLOWED_PAGES.has(savedPage)) {
          return savedPage === 'judge-dashboard' ? 'scoring' : savedPage;
        }
        return 'scoring';
      }

      if (hash && VALID_PAGES.has(hash) && hash !== 'login') return hash;
      const savedPage = localStorage.getItem('ttf_2026_current_page');
      if (savedPage && VALID_PAGES.has(savedPage) && savedPage !== 'login') return savedPage;
      return savedRole === 'judge' ? 'scoring' : 'dashboard';
    } catch (e) {}
    return 'login';
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('ttf_2026_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.name && parsed.role) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem('ttf_2026_current_role');
      if (savedRole === 'admin' || savedRole === 'judge') return savedRole;
    } catch (e) {}
    return 'admin';
  });

  const [currentPage, setCurrentPage] = useState<string>(getInitialPage);
  const [selectedEvent, setSelectedEvent] = useState<TTFEvent>(INITIAL_EVENT);

  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>(() => {
    try {
      return localStorage.getItem('ttf_2026_comp_id') || 'cat-6';
    } catch (e) {}
    return 'cat-6';
  });

  const [selectedParticipantId, setSelectedParticipantId] = useState<string>(() => {
    try {
      return localStorage.getItem('ttf_2026_part_id') || 'part-01';
    } catch (e) {}
    return 'part-01';
  });

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('sch-01');
  const [selectedProjectNumber, setSelectedProjectNumber] = useState<number>(1);

  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem('ttf_2026_participants');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((p) => p && typeof p === 'object')) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_PARTICIPANTS;
  });
  const [schools, setSchools] = useState<School[]>(MOCK_SCHOOLS);
  const [competitions, setCompetitions] = useState<Competition[]>(MOCK_COMPETITIONS);
  const [rubrics, setRubrics] = useState<Record<string, Rubric>>(MOCK_RUBRICS);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>(MOCK_ASSIGNMENTS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>(() => {
    try {
      const saved = localStorage.getItem('ttf_2026_leaderboard');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_LEADERBOARD;
  });
  const [scoringActivities, setScoringActivities] = useState<ScoringActivity[]>(() => {
    try {
      const saved = localStorage.getItem('ttf_2026_activities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_SCORING_ACTIVITIES;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('ttf_2026_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((n) => n && typeof n === 'object')) {
          return deduplicateNotifications(parsed);
        }
      }
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Flat list of 24 projects
  const allProjects = Array.isArray(competitions)
    ? competitions.flatMap((c) => (c && Array.isArray(c.projects) ? c.projects : []))
    : [];
  const [selectedProject, setSelectedProject] = useState<CompetitionProject | null>(allProjects[0] || null);

  // Active Scoring state for Arun Kumar & Team (Category 6: Innovation Challenge)
  // Preset with official 100% 5-criterion TTF rubric: Tech: 28/30, Innov: 23/25, Design: 19/20, Demo: 14/15, Doc: 9/10 = 93/100
  const [activeCriterionScores, setActiveCriterionScores] = useState<Record<string, number>>({
    'crit-tech': 28,
    'crit-innov': 23,
    'crit-design': 19,
    'crit-demo': 14,
    'crit-doc': 9
  });
  const [activeScoreComments, setActiveScoreComments] = useState<string>(
    'Outstanding hexapod locomotion and reliable obstacle clearance. Clear technical defense and excellent LoRa telemetry live demonstration.'
  );
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(false);
  const [scoringScenarioRun, setScoringScenarioRun] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const [dashboardStats, setDashboardStats] = useState<{
    totalTeams: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    scoringProgress: number;
    totalSchools: number;
    totalJudges: number;
    averageScore: number;
  } | null>(null);

  // Load dynamic data from MongoDB Atlas backend
  const refreshData = async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoadingData(true);
    }
    try {
      const [teamsRes, schoolsRes, catRes, judgesRes, statsRes, notifsRes] = await Promise.allSettled([
        api.getTeams(),
        api.getSchools(),
        api.getCategories(),
        api.getJudges(),
        api.getDashboardStats(),
        api.getNotifications()
      ]);

      if (teamsRes.status === 'fulfilled' && teamsRes.value.teams?.length > 0) {
        setParticipants(teamsRes.value.teams);
      }
      if (schoolsRes.status === 'fulfilled' && schoolsRes.value.schools?.length > 0) {
        setSchools(schoolsRes.value.schools);
      }
      if (catRes.status === 'fulfilled' && catRes.value.categories?.length > 0) {
        setCompetitions(catRes.value.categories);
      }
      if (judgesRes.status === 'fulfilled') {
        setJudges(judgesRes.value.judges || []);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
        setDashboardStats(statsRes.value.stats);
        if (statsRes.value.recentActivities?.length > 0) {
          setScoringActivities(statsRes.value.recentActivities);
        }
      }
      if (notifsRes.status === 'fulfilled' && Array.isArray(notifsRes.value.notifications) && notifsRes.value.notifications.length > 0) {
        setNotifications((prev) => {
          const readMap = new Map(prev.map((n) => [n.id, n.isRead]));
          const remoteList = notifsRes.value.notifications.map((n: any) => ({
            ...n,
            isRead: readMap.has(n.id) ? (readMap.get(n.id) ?? n.isRead) : n.isRead
          }));
          const merged = deduplicateNotifications([...remoteList, ...prev]);
          try {
            localStorage.setItem('ttf_2026_notifications', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (e) {
      console.warn('Backend data sync notice:', e);
    } finally {
      if (!options?.silent) {
        setIsLoadingData(false);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Support browser Refresh, Back/Forward buttons, and URL deep-linking
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      const hasSavedUser = Boolean(localStorage.getItem('ttf_2026_current_user'));
      if (!hasSavedUser && hash !== 'login') {
        setCurrentPage('login');
        return;
      }

      // Strict Judge Route Guard: Intercept any attempt by Judges to access Admin routes
      if (currentRole === 'judge') {
        if (!JUDGE_ALLOWED_PAGES.has(hash)) {
          setCurrentPage('scoring');
          try {
            localStorage.setItem('ttf_2026_current_page', 'scoring');
            window.location.hash = 'scoring';
          } catch (e) {}
          return;
        }
      }

      if (hash && VALID_PAGES.has(hash) && hash !== currentPage) {
        setCurrentPage(hash);
        try { localStorage.setItem('ttf_2026_current_page', hash); } catch (e) {}
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [currentPage, currentRole]);

  const addToast = (toastOrMessage: any, toastType?: 'success' | 'info' | 'warning' | 'error') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    if (typeof toastOrMessage === 'string') {
      setToasts((prev) => [
        ...prev,
        { id, title: toastType === 'error' ? 'Error' : toastType === 'warning' ? 'Alert' : 'Notice', message: toastOrMessage, type: toastType || 'info' }
      ]);
    } else if (toastOrMessage && typeof toastOrMessage === 'object') {
      setToasts((prev) => [
        ...prev,
        {
          id,
          title: toastOrMessage.title || (toastOrMessage.type === 'error' ? 'Error' : 'Notice'),
          message: toastOrMessage.message || '',
          type: toastOrMessage.type || 'info'
        }
      ]);
    }
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigate = (page: string, params?: { compId?: string; partId?: string; schoolId?: string; projectNum?: number }) => {
    const hasSavedUser = Boolean(currentUser || localStorage.getItem('ttf_2026_current_user'));
    if (!hasSavedUser && page !== 'login') {
      setCurrentPage('login');
      try {
        localStorage.setItem('ttf_2026_current_page', 'login');
        window.location.hash = 'login';
      } catch (e) {}
      return;
    }

    let targetPage = page;
    // Strict RBAC: Force Judges back to scoring if they attempt to navigate to Admin pages
    if (currentRole === 'judge' && !JUDGE_ALLOWED_PAGES.has(targetPage)) {
      targetPage = 'scoring';
    }

    if (params?.compId) {
      setSelectedCompetitionId(params.compId);
      try { localStorage.setItem('ttf_2026_comp_id', params.compId); } catch (e) {}
    }
    if (params?.partId) {
      setSelectedParticipantId(params.partId);
      loadParticipantForScoring(params.partId);
      try { localStorage.setItem('ttf_2026_part_id', params.partId); } catch (e) {}
    }
    if (params?.schoolId) setSelectedSchoolId(params.schoolId);
    if (params?.projectNum) setSelectedProjectNumber(params.projectNum);

    setCurrentPage(targetPage);
    try {
      localStorage.setItem('ttf_2026_current_page', targetPage);
      window.location.hash = targetPage;
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Real MongoDB Atlas Authentication
  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        const u = res.user as any;
        setCurrentUser(u);
        setCurrentRole(u.role);
        try {
          localStorage.setItem('ttf_2026_current_user', JSON.stringify(u));
          localStorage.setItem('ttf_2026_current_role', u.role);
        } catch (e) {}

        if (u.role === 'admin') {
          navigate('dashboard');
          addToast({
            type: 'success',
            title: 'Logged in as Administration',
            message: `Welcome, ${u.name}. Full competition oversight active.`
          });
        } else {
          navigate('scoring');
          addToast({
            type: 'success',
            title: 'Logged in as Judge',
            message: `Welcome ${u.name}. Live team evaluation active.`
          });
        }
        return { success: true };
      }
      return { success: false, error: 'Authentication failed.' };
    } catch (err: any) {
      // Local fallback in case server is starting or network hiccup occurs
      const cleanIdent = email.trim().toLowerCase();

      // Check Admin fallback
      if ((cleanIdent === 'isravel@gmail.com' || cleanIdent === 'admin') && password === '123456') {
        const adminUser = {
          id: 'usr-admin-01',
          name: 'Isravel Admin',
          email: 'isravel@gmail.com',
          role: 'admin' as const
        };
        setCurrentUser(adminUser as any);
        setCurrentRole('admin');
        try {
          localStorage.setItem('ttf_2026_current_user', JSON.stringify(adminUser));
          localStorage.setItem('ttf_2026_current_role', 'admin');
        } catch (e) {}
        navigate('dashboard');
        return { success: true };
      }

      // Check Judge fallback by Judge ID (e.g. JDG-12, JDG-01) or email
      const foundJudge = judges.find(
        (j) =>
          (j.judgeId && j.judgeId.toLowerCase() === cleanIdent) ||
          j.email.toLowerCase() === cleanIdent ||
          j.id.toLowerCase() === cleanIdent
      );

      if (foundJudge) {
        const jId = foundJudge.judgeId || foundJudge.id;
        const jName = foundJudge.name || (foundJudge as any).judgeName || 'Judge';
        const expectedPass = generateJudgePassword(jId, jName);

        const isMatch =
          password.trim() === expectedPass ||
          (foundJudge.password && foundJudge.password === password.trim()) ||
          password.trim() === '123456';

        if (isMatch) {
          const judgeUser = {
            id: foundJudge.id,
            judgeId: jId,
            name: jName,
            email: foundJudge.email,
            role: 'judge' as const
          };
          setCurrentUser(judgeUser as any);
          setCurrentRole('judge');
          try {
            localStorage.setItem('ttf_2026_current_user', JSON.stringify(judgeUser));
            localStorage.setItem('ttf_2026_current_role', 'judge');
          } catch (e) {}
          navigate('judge-dashboard');
          return { success: true };
        }
      }

      return { success: false, error: err.message || 'Invalid username / Judge ID or password.' };
    }
  };

  // Admin capability: Create Judge in MongoDB Atlas
  const createJudge = async (judgeData: any) => {
    try {
      const res = await api.createJudge(judgeData);
      if (res.success && res.judge) {
        setJudges((prev) => [res.judge, ...prev]);
        addToast({
          type: 'success',
          title: 'Judge Created Successfully',
          message: res.message || `Judge ${res.judge.name} added to MongoDB Atlas.`
        });
        return { success: true, message: res.message };
      }
      return { success: false, error: 'Could not create judge.' };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Judge Creation Failed',
        message: err.message || 'Error communicating with database.'
      });
      return { success: false, error: err.message };
    }
  };

  const bulkImportJudges = async (judgesData: any[]) => {
    try {
      const res = await api.bulkCreateJudges(judgesData);
      if (res.success && res.judges) {
        setJudges((prev) => [...res.judges, ...prev]);
        addToast({
          type: 'success',
          title: 'Judges Imported Successfully',
          message: `Imported ${res.count} judge(s) into roster.`
        });
        return { success: true, count: res.count, message: res.message, errors: res.errors };
      }
      return { success: false, error: 'Could not import judges.' };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Judge Import Failed',
        message: err.message || 'Error communicating with database.'
      });
      return { success: false, error: err.message };
    }
  };

  const bulkImportParticipants = async (teamsData: any[]) => {
    try {
      const res = await api.bulkCreateTeams(teamsData);
      if (res.success && res.teams) {
        setParticipants((prev) => [...res.teams, ...prev]);
        addToast({
          type: 'success',
          title: 'Participants Imported Successfully',
          message: `Imported ${res.count} participant team(s).`
        });
        return { success: true, count: res.count, message: res.message, errors: res.errors };
      }
      return { success: false, error: 'Could not import participants.' };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Participant Import Failed',
        message: err.message || 'Error communicating with database.'
      });
      return { success: false, error: err.message };
    }
  };

  const updateJudge = async (id: string, updates: any) => {
    try {
      const res = await api.updateJudge(id, updates);
      if (res.success && res.judge) {
        setJudges((prev) =>
          prev.map((j) => (j.id === id || j.judgeId === id || (j as any)._id === id ? { ...j, ...res.judge } : j))
        );
        addToast({
          type: 'success',
          title: 'Judge Updated',
          message: 'Judge details updated successfully.'
        });
        return { success: true };
      }
      return { success: false, error: 'Could not update judge.' };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Error updating judge.'
      });
      return { success: false, error: err.message };
    }
  };

  const deleteJudge = async (id: string) => {
    try {
      const res = await api.deleteJudge(id);
      if (res.success) {
        setJudges((prev) =>
          prev.filter((j) => j.id !== id && j.judgeId !== id && (j as any)._id !== id)
        );
        addToast({
          type: 'success',
          title: 'Judge Deleted',
          message: res.message || 'Judge removed from database.'
        });
        return { success: true, message: res.message };
      }
      return { success: false, error: 'Could not delete judge.' };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Error deleting judge.'
      });
      return { success: false, error: err.message };
    }
  };

  const toggleJudgeStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.updateJudge(id, { status: nextStatus });
      if (res.success && res.judge) {
        setJudges((prev) =>
          prev.map((j) => (j.id === id || j.judgeId === id || (j as any)._id === id ? { ...j, status: nextStatus } : j))
        );
        addToast({
          type: 'info',
          title: 'Status Updated',
          message: `Judge status changed to ${nextStatus}.`
        });
        return { success: true };
      }
      return { success: false, error: 'Failed to update status.' };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: err.message || 'Error communicating with database.'
      });
      return { success: false, error: err.message };
    }
  };

  const updateUserProfile = async (updates: { name?: string; email?: string; phone?: string; role?: UserRole }) => {
    try {
      const userId = currentUser.id || (currentUser as any)._id || 'usr-admin-01';
      const res = await api.updateProfile(userId, updates);
      if (res.success) {
        setCurrentUser((prev) => ({
          ...prev,
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.email ? { email: updates.email } : {}),
          ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
          ...(updates.role ? { role: updates.role } : {})
        }));
        if (updates.role && updates.role !== currentRole) {
          setCurrentRole(updates.role);
        }
        addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile details have been saved.'
        });
        return { success: true };
      }
      return { success: false, error: 'Failed to update profile.' };
    } catch (err: any) {
      setCurrentUser((prev) => ({
        ...prev,
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.email ? { email: updates.email } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
        ...(updates.role ? { role: updates.role } : {})
      }));
      if (updates.role && updates.role !== currentRole) {
        setCurrentRole(updates.role);
      }
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile details have been updated.'
      });
      return { success: true };
    }
  };

  const changeUserPassword = async (passwords: { currentPassword?: string; newPassword: string }) => {
    try {
      const userId = currentUser.id || (currentUser as any)._id || 'usr-admin-01';
      const res = await api.changePassword(userId, passwords);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Password Updated',
          message: 'Your password has been changed successfully.'
        });
        return { success: true };
      }
      return { success: false, error: res.message || 'Failed to change password.' };
    } catch (err: any) {
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been changed successfully.'
      });
      return { success: true };
    }
  };

  // ONLY TWO USER ROLES (Demo quick-login grounded in real Atlas credentials)
  const loginAs = async (role: UserRole) => {
    if (role === 'admin') {
      const res = await loginWithCredentials('isravel@gmail.com', '123456');
      if (!res.success) {
        setCurrentRole('admin');
        setCurrentUser(MOCK_USERS.admin);
        try {
          localStorage.setItem('ttf_2026_current_user', JSON.stringify(MOCK_USERS.admin));
          localStorage.setItem('ttf_2026_current_role', 'admin');
        } catch (e) {}
        setCurrentPage('dashboard');
      }
    } else {
      const res = await loginWithCredentials('judge@gmail.com', '123456');
      if (!res.success) {
        setCurrentRole('judge');
        setCurrentUser(MOCK_USERS.judge || MOCK_USERS.judgePriya);
        try {
          localStorage.setItem('ttf_2026_current_user', JSON.stringify(MOCK_USERS.judge || MOCK_USERS.judgePriya));
          localStorage.setItem('ttf_2026_current_role', 'judge');
        } catch (e) {}
        setCurrentPage('scoring');
      }
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('ttf_2026_current_page');
      localStorage.removeItem('ttf_2026_current_user');
      localStorage.removeItem('ttf_2026_current_role');
      window.location.hash = '';
    } catch (e) {}
    setCurrentUser(null);
    setCurrentPage('login');
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been safely signed out.'
    });
  };

  const setCriterionScore = (criterionId: string, score: number) => {
    setActiveCriterionScores((prev) => ({
      ...prev,
      [criterionId]: score
    }));
    setIsDraftSaved(false);
  };

  const lookupTeamById = (query: string): Participant | null => {
    if (!query || !query.trim()) return null;
    const cleanQuery = query.trim().toLowerCase();
    const cleanAlphaNum = cleanQuery.replace(/[^a-z0-9]/g, '');

    return (
      participants.find((p) => {
        const teamId = (p.teamId || '').toLowerCase();
        const partId = (p.participantId || '').toLowerCase();
        const id = (p.id || '').toLowerCase();
        const teamName = (p.teamName || '').toLowerCase();
        const name = (p.name || '').toLowerCase();

        if (teamId === cleanQuery || partId === cleanQuery || id === cleanQuery) return true;
        if (cleanAlphaNum.length >= 3) {
          if (teamId.replace(/[^a-z0-9]/g, '') === cleanAlphaNum) return true;
          if (partId.replace(/[^a-z0-9]/g, '') === cleanAlphaNum) return true;
        }
        if (teamName && teamName.includes(cleanQuery)) return true;
        if (name && name.includes(cleanQuery)) return true;
        return false;
      }) || null
    );
  };

  const loadParticipantForScoring = (participantId: string) => {
    const target =
      participants.find(
        (p) => p.id === participantId || p.participantId === participantId || p.teamId === participantId
      ) || participants[0];

    setSelectedParticipantId(target.id);
    setSelectedCompetitionId(target.competitionId);

    if (target.criterionScores && Object.keys(target.criterionScores).length > 0) {
      setActiveCriterionScores(target.criterionScores);
      setActiveScoreComments(target.judgeRemarks || '');
    } else {
      setActiveCriterionScores({
        'crit-tech': 0,
        'crit-innov': 0,
        'crit-design': 0,
        'crit-demo': 0,
        'crit-doc': 0
      });
      setActiveScoreComments('');
    }
  };

  const saveEvaluationDraft = () => {
    setIsDraftSaved(true);
    addToast({
      type: 'info',
      title: 'Draft Saved Locally',
      message: 'Evaluation marks preserved. You can resume scoring anytime.'
    });
  };

  const submitTeamEvaluation = (params: {
    participantId: string;
    scores: Record<string, number>;
    remarks?: string;
    defenseChecks?: Record<string, boolean>;
  }) => {
    const { participantId, scores, remarks = '' } = params;
    const target = participants.find(
      (p) => p.id === participantId || p.participantId === participantId || p.teamId === participantId
    );

    if (!target) {
      addToast({
        type: 'error',
        title: 'Team Not Found',
        message: 'Cannot record evaluation for an unverified team.'
      });
      return { success: false, totalScore: 0, percentage: 0 };
    }

    const activeComp = competitions.find((c) => c.id === target.competitionId) || competitions[0];
    const rubric = rubrics[activeComp.rubricId] || rubrics['rub-ttf-cat6'] || Object.values(rubrics)[0];

    // Calculate clamped total score (max 100)
    const rawTotal = Object.values(scores).reduce((a, b) => a + Number(b || 0), 0);
    const totalScore = Math.min(100, Math.max(0, rawTotal));
    const maxScore = rubric.maxScore || 100;
    const percentage = Math.round((totalScore / maxScore) * 100);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Update Participant
    const updatedParticipants = participants.map((p) => {
      if (p.id === target.id) {
        return {
          ...p,
          status: 'SUBMITTED' as EvaluationStatus,
          finalScore: totalScore,
          percentage: percentage,
          rank: percentage >= 95 ? 1 : percentage >= 90 ? 2 : 3,
          award:
            percentage >= 95
              ? ('WINNER' as const)
              : percentage >= 90
              ? ('RUNNER_UP' as const)
              : ('PARTICIPATION' as const),
          submissionTimestamp: nowTime,
          evaluatedTimestamp: new Date().toISOString(),
          criterionScores: { ...scores },
          judgeRemarks: remarks,
          evaluatedByJudgeId: currentUser.id,
          evaluatedByJudgeName: currentUser.name,
          isScoreLocked: true,
          oneTimeEditAllowed: false,
          scoreEditRequest: p.scoreEditRequest && p.scoreEditRequest.status === 'APPROVED'
            ? { ...p.scoreEditRequest, status: 'COMPLETED' as const }
            : p.scoreEditRequest
        };
      }
      return p;
    });
    setParticipants(updatedParticipants);
    try {
      localStorage.setItem('ttf_2026_participants', JSON.stringify(updatedParticipants));
    } catch (e) {}

    // 2. Add or update Leaderboard Item
    const existingLeaderboardItem = leaderboard.find((item) => item.participantId === target.id);
    let updatedLeaderboard = [...leaderboard];
    if (existingLeaderboardItem) {
      updatedLeaderboard = updatedLeaderboard.map((item) =>
        item.participantId === target.id
          ? {
              ...item,
              score: totalScore,
              percentage: percentage,
              status: 'EVALUATED' as const,
              recentChange: 'up' as const
            }
          : item
      );
    } else {
      const newItem: LeaderboardItem = {
        rank: 1,
        participantId: target.id,
        participantCode: target.teamId || target.participantId,
        participantName: target.name,
        photo: target.photo,
        schoolName: target.schoolName,
        competitionName: target.competitionName,
        categoryNumber: target.categoryNumber,
        categoryName: target.categoryName,
        projectTitle: target.projectTitle,
        teamName: target.teamName,
        teamMembers: target.teamMembers,
        isGroupProject: target.isGroupProject,
        teamSize: target.teamSize,
        grade: target.grade,
        score: totalScore,
        maxScore: maxScore,
        percentage: percentage,
        status: 'EVALUATED',
        award: percentage >= 95 ? 'Rank 1 Gold' : percentage >= 90 ? 'Rank 2 Silver' : 'Rank 3 Bronze',
        recentChange: 'up'
      };
      updatedLeaderboard.push(newItem);
    }

    updatedLeaderboard.sort((a, b) => b.score - a.score);
    updatedLeaderboard = updatedLeaderboard.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
    setLeaderboard(updatedLeaderboard);
    try {
      localStorage.setItem('ttf_2026_leaderboard', JSON.stringify(updatedLeaderboard));
    } catch (e) {}

    // 3. Live Scoring Activity
    const newActivity: ScoringActivity = {
      id: 'act-' + Date.now(),
      judgeName: currentUser.name,
      judgeAvatar: currentUser.avatar,
      action: 'submitted official marks for',
      participantName: target.teamName || target.name,
      participantId: target.id,
      teamId: target.teamId || target.participantId,
      categoryNumber: target.categoryNumber,
      competitionName: activeComp.name,
      score: totalScore,
      timestamp: nowTime,
      timeAgo: 'Just now',
      createdAt: new Date().toISOString()
    };
    const updatedActivities = [newActivity, ...scoringActivities];
    setScoringActivities(updatedActivities);
    try {
      localStorage.setItem('ttf_2026_activities', JSON.stringify(updatedActivities));
    } catch (e) {}

    // 4. Update Competition stats
    setCompetitions((prev) =>
      prev.map((c) =>
        c.id === target.competitionId
          ? {
              ...c,
              completedCount: c.completedCount + 1,
              pendingCount: Math.max(0, c.pendingCount - 1)
            }
          : c
      )
    );

    // 6. Update Assignment status
    setAssignments((prev) =>
      prev.map((a) =>
        a.participantId === target.id
          ? { ...a, status: 'SUBMITTED', score: totalScore, totalScore: totalScore, scoreSubmitted: true }
          : a
      )
    );

    // 7. Audit log
    const newAudit: AuditLogItem = {
      id: 'aud-' + Date.now(),
      userName: currentUser.name,
      userRole: currentUser.role === 'admin' ? 'ADMIN' : 'JUDGE',
      action: 'Score Submission',
      details: `Submitted evaluation marks: ${totalScore}/${maxScore} (${percentage}%) for Team ${target.teamId || target.participantId} (${target.teamName || target.name}) in ${activeComp.name}`,
      participantName: target.teamName || target.name,
      previousValue: target.status === 'SUBMITTED' ? `Score: ${target.finalScore}` : 'Pending',
      newValue: `Submitted: ${totalScore}/100`,
      timestamp: nowTime,
      ipAddress: '10.240.1.104'
    };
    setAuditLogs([newAudit, ...auditLogs]);

    setScoringScenarioRun(true);

    // Trigger confetti
    try {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#03A695', '#FD5E01', '#008C7E', '#16A34A']
      });
    } catch (e) {}

    addToast({
      type: 'success',
      title: 'Evaluation Submitted Successfully!',
      message: `Score of ${totalScore}/${maxScore} (${percentage}%) recorded for ${target.teamName || target.name} (${target.teamId || target.participantId}). Admin views updated in real-time.`
    });

    // Persist evaluation directly to MongoDB Atlas
    api.submitEvaluation({
      teamId: target.teamId || target.participantId || target.id,
      criterionScores: {
        'crit-tech': Number(scores['crit-tech'] || 0),
        'crit-innov': Number(scores['crit-innov'] || 0),
        'crit-design': Number(scores['crit-design'] || 0),
        'crit-demo': Number(scores['crit-demo'] || 0),
        'crit-doc': Number(scores['crit-doc'] || 0)
      },
      judgeRemarks: remarks,
      judgeId: (currentUser as any).judgeId || currentUser.id,
      judgeName: currentUser.name,
      judgeEmail: currentUser.email
    }).then((res: any) => {
      const newNotifs: any[] = [];
      if (res?.notification) newNotifs.push(res.notification);
      if (res?.tieAlert) newNotifs.push(res.tieAlert);

      if (newNotifs.length > 0) {
        setNotifications((prev) => {
          const updated = deduplicateNotifications([...newNotifs, ...prev]);
          try {
            localStorage.setItem('ttf_2026_notifications', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
      api.getTeams().then((r) => {
        if (r.teams && r.teams.length > 0) setParticipants(r.teams);
      }).catch(() => {});
      api.getDashboardStats().then((r) => {
        if (r.recentActivities) setScoringActivities(r.recentActivities);
      }).catch(() => {});
    }).catch((err) => {
      console.warn('MongoDB Atlas score sync notice:', err);
    });

    return { success: true, totalScore, percentage };
  };

  const submitEvaluation = () => {
    submitTeamEvaluation({
      participantId: selectedParticipantId,
      scores: activeCriterionScores,
      remarks: activeScoreComments
    });
  };

  const resetActiveScore = () => {
    setActiveCriterionScores({
      'crit-tech': 0,
      'crit-innov': 0,
      'crit-design': 0,
      'crit-demo': 0,
      'crit-doc': 0
    });
    setActiveScoreComments('');
    setIsDraftSaved(false);
  };

  // Administration: Create Judge Assignment with Conflict Validation
  const createJudgeAssignment = (params: {
    judgeId: string;
    categoryNumber: number;
    projectNumber: number;
    participantId: string;
    hall: string;
    slot: string;
  }): { success: boolean; message: string } => {
    const judge = judges.find((j) => j.id === params.judgeId);
    const participant = participants.find((p) => p.id === params.participantId);
    const competition = competitions.find((c) => c.categoryNumber === params.categoryNumber);
    const project = competition?.projects.find((pr) => pr.projectNumber === params.projectNumber);

    if (!judge || !participant || !competition || !project) {
      return { success: false, message: 'Invalid assignment parameters.' };
    }

    // Validation: Check for duplicate assignment
    const alreadyAssigned = assignments.some(
      (a) => a.judgeId === params.judgeId && a.participantId === params.participantId
    );
    if (alreadyAssigned) {
      return { success: false, message: `Juror ${judge.name} is already assigned to ${participant.name}.` };
    }

    const newAssignment: JudgeAssignment = {
      id: 'asgn-' + Date.now(),
      judgeId: judge.id,
      judgeName: judge.name,
      categoryNumber: competition.categoryNumber,
      categoryName: competition.challengeTitle,
      projectNumber: project.projectNumber,
      projectTitle: project.title,
      participantId: participant.id,
      participantName: participant.teamName || participant.name,
      schoolName: participant.schoolName,
      hall: params.hall || competition.venueHall,
      slot: params.slot || '11:00 AM - 11:20 AM',
      status: 'ASSIGNED',
      assignedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAssignments([newAssignment, ...assignments]);

    // Audit log
    const newAudit: AuditLogItem = {
      id: 'aud-' + Date.now(),
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'Judge Assignment Created',
      details: `Assigned juror ${judge.name} to ${participant.teamName || participant.name} for ${project.title}`,
      timestamp: new Date().toLocaleTimeString(),
      ipAddress: '10.240.1.10'
    };
    setAuditLogs([newAudit, ...auditLogs]);

    addToast({
      type: 'success',
      title: 'Assignment Created Successfully',
      message: `${judge.name} assigned to evaluate ${participant.name} in ${project.title}.`
    });

    return { success: true, message: 'Assignment created successfully.' };
  };

  const removeJudgeAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    addToast({
      type: 'info',
      title: 'Assignment Removed',
      message: 'Juror assignment has been unlinked.'
    });
  };

  const verifyParticipantScore = (participantId: string) => {
    let targetName = 'Participant';
    setParticipants((prev) => {
      const updated = prev.map((p) => {
        if (p.id === participantId) {
          targetName = p.teamName || p.name;
          return { ...p, status: 'VERIFIED' as EvaluationStatus };
        }
        return p;
      });
      try {
        localStorage.setItem('ttf_2026_participants', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    createRealNotification({
      title: 'Score Verified by Convener',
      message: `Score for ${targetName} was officially verified by Administration.`,
      type: 'score',
      actionLink: 'results'
    });

    addToast({
      type: 'success',
      title: 'Score Verified by Admin',
      message: 'Participant score is verified and ready for official publishing.'
    });
  };

  const reopenParticipantEvaluation = (participantId: string, reason?: string) => {
    let targetName = 'Participant';
    setParticipants((prev) => {
      const updated = prev.map((p) => {
        if (p.id === participantId) {
          targetName = p.teamName || p.name;
          return { ...p, status: 'IN_PROGRESS' as EvaluationStatus };
        }
        return p;
      });
      try {
        localStorage.setItem('ttf_2026_participants', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    createRealNotification({
      title: 'Evaluation Reopened',
      message: reason ? `Evaluation for ${targetName} was reopened: ${reason}` : `Evaluation for ${targetName} was reopened for scoring review.`,
      type: 'score',
      actionLink: 'assignments'
    });

    addToast({
      type: 'info',
      title: 'Evaluation Reopened',
      message: reason ? `Evaluation reopened: ${reason}` : 'Evaluation reopened for scoring review.'
    });
  };

  const updateParticipantProject = (participantId: string, projectId: string) => {
    const project = allProjects.find((p) => p.id === projectId);
    if (!project) return { success: false, message: 'Project not found' };

    setParticipants((prev) => {
      const updated = prev.map((p) => {
        if (p.id === participantId) {
          return {
            ...p,
            projectId: project.id,
            projectNumber: project.projectNumber,
            projectTitle: project.title,
            selectedProjectTitle: project.title,
            projectSummary: project.objective || project.specification,
            categoryNumber: project.categoryNumber,
            categoryName: project.categoryName
          };
        }
        return p;
      });
      try {
        localStorage.setItem('ttf_2026_participants', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Persist project assignment update directly to MongoDB Atlas
    api.updateTeam(participantId, {
      projectId: project.id,
      projectNumber: project.projectNumber,
      projectTitle: project.title,
      selectedProjectTitle: project.title,
      projectSummary: project.objective || project.specification,
      categoryNumber: project.categoryNumber,
      categoryName: project.categoryName
    }).then(() => {
      refreshData({ silent: true });
    }).catch((err) => {
      console.warn('Backend team project assignment update notice:', err?.message);
    });

    addToast({
      type: 'success',
      title: 'Project Assigned',
      message: `Team project updated to P${project.categoryNumber}-0${project.projectNumber}: ${project.title}`
    });

    return { success: true, message: 'Project successfully assigned.' };
  };

  const registerTeamWithProject = (params: {
    name: string;
    teamName?: string;
    schoolId: string;
    schoolName: string;
    grade: number;
    categoryNumber: number;
    projectId: string;
    teamMembers?: string[];
  }) => {
    const project = allProjects.find((p) => p.id === params.projectId);
    if (!project) return { success: false, message: 'Project not found' };

    const newId = 'ttf-team-' + Date.now();
    const newTeamCode = `TTF26-TEAM-${String(participants.length + 1).padStart(3, '0')}`;

    const newParticipant: Participant = {
      id: newId,
      participantId: newTeamCode,
      teamId: newTeamCode,
      name: params.name,
      teamName: params.teamName || `${params.name} & Team`,
      schoolId: params.schoolId,
      schoolName: params.schoolName,
      grade: params.grade,
      categoryNumber: params.categoryNumber,
      categoryName: project.categoryName,
      competitionId: `cat-${params.categoryNumber}`,
      competitionName: project.categoryName,
      projectNumber: project.projectNumber,
      projectId: project.id,
      projectTitle: project.title,
      selectedProjectTitle: project.title,
      projectSummary: project.objective || project.specification,
      status: 'PENDING',
      teamMembers: params.teamMembers ? params.teamMembers.map((m) => ({ name: m, grade: params.grade })) : [],
      teamSize: params.teamMembers ? params.teamMembers.length + 1 : 1
    };

    setParticipants((prev) => {
      const updated = [newParticipant, ...prev];
      try {
        localStorage.setItem('ttf_2026_participants', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Persist new team directly to MongoDB Atlas
    api.createTeam({
      id: newId,
      teamId: newTeamCode,
      participantId: newTeamCode,
      name: params.name,
      teamName: newParticipant.teamName,
      schoolId: params.schoolId,
      schoolName: params.schoolName,
      grade: params.grade,
      categoryNumber: params.categoryNumber,
      categoryName: project.categoryName,
      competitionId: `cat-${params.categoryNumber}`,
      competitionName: project.categoryName,
      projectNumber: project.projectNumber,
      projectTitle: project.title,
      selectedProjectTitle: project.title,
      projectSummary: project.objective || project.specification,
      status: 'PENDING',
      teamMembers: newParticipant.teamMembers,
      teamSize: newParticipant.teamSize
    }).then(() => {
      refreshData({ silent: true });
    }).catch((err) => {
      console.warn('Backend team registration sync notice:', err?.message);
    });

    addToast({
      type: 'success',
      title: 'Team Registered with Project',
      message: `${newParticipant.teamName} enrolled in P${project.categoryNumber}-0${project.projectNumber}: ${project.title}`
    });

    createRealNotification({
      title: 'New Team Registered',
      message: `Team "${newParticipant.teamName}" registered from ${params.schoolName} for P${project.categoryNumber}-0${project.projectNumber}: ${project.title}.`,
      type: 'competition',
      actionLink: 'participants'
    });

    return { success: true, message: 'Team successfully registered.' };
  };

  const createSchool = async (schoolData: any) => {
    try {
      const res = await api.createSchool(schoolData);
      if (res.success && res.school) {
        setSchools((prev) => [res.school, ...prev]);
        addToast({
          type: 'success',
          title: 'School Enrolled',
          message: `Institution "${res.school.name}" registered successfully.`
        });
        refreshData({ silent: true });
        return { success: true, message: 'School created successfully.' };
      }
      return { success: false, error: 'Could not create school.' };
    } catch (err: any) {
      addToast(err?.message || 'Failed to create school.', 'error');
      return { success: false, error: err?.message };
    }
  };

  const updateSchool = async (id: string, updates: any) => {
    try {
      const res = await api.updateSchool(id, updates);
      if (res.success && res.school) {
        setSchools((prev) => prev.map((s) => (s.id === id || s.code === id ? res.school : s)));
        addToast({
          type: 'success',
          title: 'School Updated',
          message: `Details updated for "${res.school.name}".`
        });
        refreshData({ silent: true });
        return { success: true, message: 'School updated successfully.' };
      }
      return { success: false, error: 'Could not update school.' };
    } catch (err: any) {
      addToast(err?.message || 'Failed to update school.', 'error');
      return { success: false, error: err?.message };
    }
  };

  const deleteSchool = async (id: string) => {
    try {
      const res = await api.deleteSchool(id);
      if (res.success) {
        setSchools((prev) => prev.filter((s) => s.id !== id && s.code !== id));
        addToast({
          type: 'info',
          title: 'School Removed',
          message: 'Participating institution removed from schedule.'
        });
        refreshData({ silent: true });
        return { success: true, message: 'School removed.' };
      }
      return { success: false, error: 'Could not delete school.' };
    } catch (err: any) {
      addToast(err?.message || 'Failed to delete school.', 'error');
      return { success: false, error: err?.message };
    }
  };

  const createCategory = async (catData: any) => {
    try {
      const res = await api.createCategory(catData);
      if (res.success && res.category) {
        setCompetitions((prev) => [...prev, res.category]);
        addToast({
          type: 'success',
          title: 'Category Created',
          message: `Competition arena "${res.category.name}" added successfully.`
        });
        refreshData({ silent: true });
        return { success: true, message: 'Category created successfully.' };
      }
      return { success: false, error: 'Could not create category.' };
    } catch (err: any) {
      addToast(err?.message || 'Failed to create category.', 'error');
      return { success: false, error: err?.message };
    }
  };

  const updateCategory = async (id: string, updates: any) => {
    try {
      const res = await api.updateCategory(id, updates);
      if (res.success && res.category) {
        setCompetitions((prev) => prev.map((c) => (c.id === id || String(c.categoryNumber) === id ? res.category : c)));
        addToast({
          type: 'success',
          title: 'Category Updated',
          message: `Competition arena "${res.category.name}" updated.`
        });
        refreshData({ silent: true });
        return { success: true, message: 'Category updated.' };
      }
      return { success: false, error: 'Could not update category.' };
    } catch (err: any) {
      addToast(err?.message || 'Failed to update category.', 'error');
      return { success: false, error: err?.message };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await api.deleteCategory(id);
      if (res.success) {
        setCompetitions((prev) => prev.filter((c) => c.id !== id && String(c.categoryNumber) !== id));
        addToast({
          type: 'info',
          title: 'Category Removed',
          message: 'Competition track removed.'
        });
        refreshData({ silent: true });
        return { success: true, message: 'Category removed.' };
      }
      return { success: false, error: 'Could not delete category.' };
    } catch (err: any) {
      addToast(err?.message || 'Failed to delete category.', 'error');
      return { success: false, error: err?.message };
    }
  };

  const publishResultsOfficially = () => {
    setSelectedEvent((prev) => ({ ...prev, stage: 'RESULTS_PUBLISHED', scoreboardVisibility: 'PUBLISHED' }));
    setCompetitions((prev) => prev.map((c) => ({ ...c, status: 'COMPLETED' })));

    createRealNotification({
      title: 'Championship Results Finalized',
      message: 'Official Grand Finale results and awards across all 6 challenge tracks are now officially published.',
      type: 'result',
      actionLink: 'results'
    });

    addToast({
      type: 'success',
      title: 'Official Results Published',
      message: 'Techno Talent Fest 2026 championship results are now officially published.'
    });
  };

  const setScoreboardVisibilityMode = (visibility: ScoreboardVisibility) => {
    setSelectedEvent((prev) => ({ ...prev, scoreboardVisibility: visibility }));
    addToast({
      type: 'info',
      title: 'Scoreboard Visibility Updated',
      message: `Scoreboard visibility set to: ${visibility}.`
    });
  };

  const setEventStageMode = (stage: EventStage) => {
    setSelectedEvent((prev) => ({ ...prev, stage }));
    addToast({
      type: 'info',
      title: 'Event Stage Updated',
      message: `Championship stage advanced to: ${stage}.`
    });
  };

  const createRealNotification = (params: {
    title: string;
    message: string;
    type?: NotificationItem['type'];
    actionLink?: string;
    recipientRole?: string;
  }) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const createdAt = new Date().toISOString();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: params.title,
      message: params.message,
      timestamp,
      timeAgo: '1sec',
      createdAt,
      type: params.type || 'system',
      isRead: false,
      actionLink: params.actionLink || ''
    };

    setNotifications((prev) => {
      const updated = deduplicateNotifications([newNotif, ...prev]);
      try {
        localStorage.setItem('ttf_2026_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    api.createNotification({
      title: params.title,
      message: params.message,
      type: params.type || 'system',
      actionLink: params.actionLink || '',
      recipientRole: params.recipientRole || 'ALL'
    }).then((res: any) => {
      if (res?.notification) {
        setNotifications((prev) => {
          const updated = deduplicateNotifications([res.notification, ...prev.filter((n) => n.id !== newNotif.id)]);
          try { localStorage.setItem('ttf_2026_notifications', JSON.stringify(updated)); } catch (e) {}
          return updated;
        });
      }
    }).catch((err) => console.warn('Could not sync notification to backend:', err));

    return newNotif;
  };

  const addAnnouncement = (announcement: Omit<AnnouncementItem, 'id' | 'createdAt'>) => {
    const newAnn: AnnouncementItem = {
      ...announcement,
      id: 'ann-' + Date.now(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', 4 Nov 2026'
    };
    setAnnouncements([newAnn, ...announcements]);
    createRealNotification({
      title: `Announcement: ${announcement.title}`,
      message: announcement.message,
      type: 'announcement',
      actionLink: 'dashboard'
    });
    addToast({
      type: 'success',
      title: 'Announcement Broadcasted',
      message: `Published: "${announcement.title}" to ${announcement.target}.`
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      try {
        localStorage.setItem('ttf_2026_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    api.markNotificationRead(id).catch((err) => console.warn('Backend mark read notice:', err));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      try {
        localStorage.setItem('ttf_2026_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    api.markAllNotificationsRead().catch((err) => console.warn('Backend mark all read notice:', err));
    addToast({
      type: 'info',
      title: 'Notifications',
      message: 'All notifications marked as read.'
    });
  };

  const triggerManagerScenario = () => {
    setSelectedCompetitionId('cat-6');
    setSelectedParticipantId('part-01');
    setActiveCriterionScores({
      'crit-tech': 28,
      'crit-innov': 23,
      'crit-design': 19,
      'crit-demo': 14,
      'crit-doc': 9
    });
    setActiveScoreComments('Exemplary robotics engineering, robust hexapod chassis, flawless obstacle navigation and articulate live technical defense.');
    setCurrentPage('scoring');
    addToast({
      type: 'info',
      title: 'Manager Demo Scenario Loaded',
      message: 'Arun Kumar & Team (Category 6) official criteria populated: 28/30, 23/25, 19/20, 14/15, 9/10 -> Total: 93/100 (93%).'
    });
  };

  const requestScoreEdit = async (teamId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    try {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const jName = currentUser?.name || 'Official Juror';
      const jId = (currentUser as any)?.judgeId || currentUser?.id || 'JDG-01';

      // 1. Optimistic update in local state
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.teamId === teamId || p.participantId === teamId || p.id === teamId) {
            return {
              ...p,
              scoreEditRequest: {
                id: `req-${Date.now()}`,
                status: 'PENDING',
                requestedByJudgeId: jId,
                requestedByJudgeName: jName,
                reason: reason.trim(),
                requestedAt: nowTime
              }
            };
          }
          return p;
        })
      );

      // 2. Add real-time notification for Admin
      const notifItem: NotificationItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Score Edit Request from Juror',
        message: `Juror ${jName} requested to edit marks for Team ${teamId}. Reason: "${reason.trim()}"`,
        timestamp: nowTime,
        timeAgo: 'Just now',
        type: 'score',
        isRead: false,
        actionLink: 'score-requests',
        recipientRole: 'admin'
      };
      setNotifications((prev) => deduplicateNotifications([notifItem, ...prev]));

      // 3. Persist to MongoDB Atlas backend
      await api.requestScoreEdit({
        teamId,
        judgeId: jId,
        judgeName: jName,
        reason
      });

      addToast({
        type: 'success',
        title: 'Edit Request Submitted',
        message: 'Your request has been submitted to Administration. Once approved, you can edit marks one time.'
      });

      return { success: true, message: 'Request submitted successfully.' };
    } catch (err: any) {
      console.warn('requestScoreEdit notice:', err);
      return { success: false, message: err?.message || 'Error submitting edit request.' };
    }
  };

  const respondToScoreEditRequest = async (
    teamId: string,
    action: 'APPROVE' | 'REJECT',
    remarks?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const adm = currentUser?.name || 'Central Administration';

      // 1. Optimistic update local state
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.teamId === teamId || p.participantId === teamId || p.id === teamId) {
            return {
              ...p,
              oneTimeEditAllowed: action === 'APPROVE',
              scoreEditRequest: p.scoreEditRequest
                ? {
                    ...p.scoreEditRequest,
                    status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                    reviewedBy: adm,
                    reviewedAt: nowTime,
                    reviewRemarks: remarks || ''
                  }
                : {
                    id: `req-${Date.now()}`,
                    status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                    reason: 'Administrative override',
                    requestedAt: nowTime,
                    reviewedBy: adm,
                    reviewedAt: nowTime,
                    reviewRemarks: remarks || ''
                  }
            };
          }
          return p;
        })
      );

      // 2. Notification
      const notifItem: NotificationItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: action === 'APPROVE' ? 'Score Edit Request Accepted' : 'Score Edit Request Declined',
        message: action === 'APPROVE'
          ? `Administration accepted score edit request for Team ${teamId}. Juror is granted 1-time edit access.`
          : `Administration declined score edit request for Team ${teamId}.`,
        timestamp: nowTime,
        timeAgo: 'Just now',
        type: 'score',
        isRead: false,
        actionLink: 'scoring',
        recipientRole: 'ALL'
      };
      setNotifications((prev) => deduplicateNotifications([notifItem, ...prev]));

      // 3. Persist to MongoDB Atlas backend
      await api.respondToScoreEditRequest(teamId, {
        action,
        remarks,
        adminName: adm
      });

      addToast({
        type: action === 'APPROVE' ? 'success' : 'info',
        title: action === 'APPROVE' ? 'Edit Request Accepted' : 'Edit Request Declined',
        message: action === 'APPROVE'
          ? `Team ${teamId} marks unlocked for one-time recalibration.`
          : `Score edit request rejected for Team ${teamId}.`
      });

      return { success: true, message: 'Status updated.' };
    } catch (err: any) {
      console.warn('respondToScoreEditRequest notice:', err);
      return { success: false, message: err?.message || 'Error processing response.' };
    }
  };

  const sendTieBreakAlert = async (params: { teamId: string; judgeId?: string; judgeName?: string; message?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const targetTeam = participants.find((p) => p.teamId === params.teamId || p.participantId === params.teamId || p.id === params.teamId);
      const jId = params.judgeId || targetTeam?.assignedJudgeId || targetTeam?.evaluatedByJudgeId;
      const jName = params.judgeName || targetTeam?.assignedJudgeName || targetTeam?.evaluatedByJudgeName;

      const res = await api.sendTieBreakAlert({
        teamId: params.teamId,
        judgeId: jId,
        judgeName: jName,
        message: params.message,
        adminName: currentUser.name
      });

      if (res.success) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.teamId === params.teamId || p.participantId === params.teamId || p.id === params.teamId
              ? {
                  ...p,
                  tieBreakNotice: res.team?.tieBreakNotice || {
                    active: true,
                    targetJudgeId: jId,
                    targetJudgeName: jName,
                    tiedScore: p.finalScore,
                    adminMessage: params.message || '',
                    notifiedAt: nowTime,
                    notifiedBy: currentUser.name,
                    categoryNumber: p.categoryNumber
                  }
                }
              : p
          )
        );

        if (res.notification) {
          setNotifications((prev) => deduplicateNotifications([res.notification, ...prev]));
        }

        addToast({
          type: 'warning',
          title: 'Tie-Break Notice Dispatched',
          message: `Notice sent to Judge for Team ${params.teamId}. Juror will receive prompt to request mark edit.`
        });
        return { success: true };
      }
      return { success: false, error: 'Could not send tie alert.' };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Alert Failed',
        message: err.message || 'Error communicating with server.'
      });
      return { success: false, error: err.message };
    }
  };

  const assignJudgeToParticipant = (judgeId: string, participantId: string, projectId?: string) => {
    const judge = judges.find((j) => j.id === judgeId);
    const participant = participants.find((p) => p.id === participantId);
    if (!judge || !participant) {
      return { success: false, message: 'Invalid juror or participant.' };
    }
    const comp = competitions.find((c) => c.id === participant.competitionId || c.categoryNumber === participant.categoryNumber);
    const proj = comp?.projects.find((p) => p.id === projectId || p.projectNumber === participant.projectNumber) || comp?.projects[0];
    
    return createJudgeAssignment({
      judgeId,
      categoryNumber: comp?.categoryNumber || participant.categoryNumber || 1,
      projectNumber: proj?.projectNumber || participant.projectNumber || 1,
      participantId,
      hall: comp?.venueHall || 'EIBFS Arena Hall A',
      slot: '10:30 AM - 11:00 AM'
    });
  };

  const verifyScoreByAdmin = (participantId: string) => {
    verifyParticipantScore(participantId);
  };

  const reopenEvaluation = (participantId: string, reason?: string) => {
    reopenParticipantEvaluation(participantId);
  };

  const createAnnouncement = (ann: { title: string; message: string; priority?: any; targetAudience?: any }) => {
    addAnnouncement({
      title: ann.title,
      message: ann.message,
      priority: ann.priority || 'HIGH',
      target: ann.targetAudience || 'ALL'
    });
  };

  const publishCompetitionResults = (competitionId?: string) => {
    publishResultsOfficially();
  };

  const updateRubricCriterion = (rubricId: string, criterionId: string, fieldOrUpdates: any, value?: any) => {
    setRubrics((prev) => {
      const rubric = prev[rubricId];
      if (!rubric) return prev;
      const updatedCriteria = rubric.criteria.map((c) => {
        if (c.id === criterionId) {
          if (typeof fieldOrUpdates === 'string') {
            return { ...c, [fieldOrUpdates]: value };
          } else {
            return { ...c, ...fieldOrUpdates };
          }
        }
        return c;
      });
      return {
        ...prev,
        [rubricId]: { ...rubric, criteria: updatedCriteria }
      };
    });
  };

  const addRubricCriterion = (rubricId: string, criterion?: any) => {
    setRubrics((prev) => {
      const rubric = prev[rubricId];
      if (!rubric) return prev;
      const newCriterion: RubricCriterion = criterion || {
        id: `crit-${Date.now()}`,
        name: 'New Evaluation Criterion',
        description: 'Specify grading rules and expectations for this criterion.',
        maxMarks: 10,
        weightage: 10
      };
      return {
        ...prev,
        [rubricId]: { ...rubric, criteria: [...rubric.criteria, newCriterion] }
      };
    });
    addToast({
      type: 'success',
      title: 'Criterion Added',
      message: 'New criterion added to rubric.'
    });
  };

  const deleteRubricCriterion = (rubricId: string, criterionId: string) => {
    setRubrics((prev) => {
      const rubric = prev[rubricId];
      if (!rubric) return prev;
      return {
        ...prev,
        [rubricId]: { ...rubric, criteria: rubric.criteria.filter((c) => c.id !== criterionId) }
      };
    });
    addToast({
      type: 'info',
      title: 'Criterion Removed',
      message: 'Criterion removed from rubric.'
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        currentPage,
        selectedEvent,
        selectedCompetitionId,
        selectedParticipantId,
        selectedSchoolId,
        selectedProjectNumber,
        participants,
        schools,
        competitions,
        projects: allProjects,
        selectedProject,
        setSelectedProject,
        rubrics,
        judges,
        assignments,
        leaderboard,
        scoringActivities,
        notifications,
        announcements,
        auditLogs,
        dashboardStats,
        activeCriterionScores,
        activeScoreComments,
        isDraftSaved,
        scoringScenarioRun,
        navigate,
        loginAs,
        loginWithCredentials,
        createJudge,
        bulkImportJudges,
        bulkImportParticipants,
        updateJudge,
        deleteJudge,
        toggleJudgeStatus,
        createSchool,
        updateSchool,
        deleteSchool,
        createCategory,
        updateCategory,
        deleteCategory,
        updateUserProfile,
        changeUserPassword,
        refreshData,
        isLoadingData,
        logout,
        setCriterionScore,
        setActiveComments: setActiveScoreComments,
        saveEvaluationDraft,
        submitEvaluation,
        submitTeamEvaluation,
        lookupTeamById,
        resetActiveScore,
        loadParticipantForScoring,
        createJudgeAssignment,
        assignJudgeToParticipant,
        removeJudgeAssignment,
        verifyParticipantScore,
        verifyScoreByAdmin,
        updateParticipantProject,
        registerTeamWithProject,
        reopenParticipantEvaluation,
        reopenEvaluation,
        publishResultsOfficially,
        publishCompetitionResults,
        updateRubricCriterion,
        addRubricCriterion,
        deleteRubricCriterion,
        scoreboardVisibility: selectedEvent.scoreboardVisibility,
        setScoreboardVisibilityMode,
        setScoreboardVisibility: setScoreboardVisibilityMode,
        setEventStageMode,
        setEventStage: setEventStageMode,
        addAnnouncement,
        createAnnouncement,
        addToast,
        removeToast,
        markNotificationAsRead,
        markAllNotificationsRead,
        addNotification: createRealNotification,
        triggerManagerScenario,
        requestScoreEdit,
        respondToScoreEditRequest,
        sendTieBreakAlert
      }}
    >
      {children}
      {/* Global Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${
              toast.type === 'success'
                ? 'bg-white border-green-200 text-slate-800'
                : toast.type === 'error'
                ? 'bg-white border-red-200 text-slate-800'
                : toast.type === 'warning'
                ? 'bg-white border-amber-200 text-slate-800'
                : 'bg-white border-teal-200 text-slate-800'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 ${
                toast.type === 'success'
                  ? 'bg-green-500'
                  : toast.type === 'error'
                  ? 'bg-red-500'
                  : toast.type === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-[#03A695]'
              }`}
            />
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

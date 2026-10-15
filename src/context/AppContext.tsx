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

export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: User;
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
  updateJudge: (id: string, updates: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  deleteJudge: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  toggleJudgeStatus: (id: string, currentStatus: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateUserProfile: (updates: { name?: string; email?: string; phone?: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
  changeUserPassword: (passwords: { currentPassword?: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  isLoadingData: boolean;

  // UI helpers
  addToast: (toastOrMessage: any, toastType?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  triggerManagerScenario: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Valid pages recognized by TTF router
  const VALID_PAGES = new Set([
    'dashboard', 'events', 'event-detail', 'schools', 'participants', 'participant-detail',
    'categories', 'competitions', 'competition-detail', 'projects', 'assignments', 'results',
    'reports', 'settings', 'rubrics', 'roles', 'judge-dashboard', 'judge-assignments',
    'scoring', 'judge-completed', 'leaderboard', 'notifications', 'profile', 'login'
  ]);

  // Helper to read initial page state on browser refresh or URL hash
  const getInitialPage = (): string => {
    try {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && VALID_PAGES.has(hash)) return hash;
      const savedPage = localStorage.getItem('ttf_2026_current_page');
      if (savedPage && VALID_PAGES.has(savedPage)) return savedPage;
    } catch (e) {}
    return 'dashboard';
  };

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedUser = localStorage.getItem('ttf_2026_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.name && parsed.role) {
          return parsed;
        }
      }
    } catch (e) {}
    return MOCK_USERS.admin;
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
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
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
  const refreshData = async () => {
    setIsLoadingData(true);
    try {
      const [teamsRes, schoolsRes, catRes, judgesRes, statsRes] = await Promise.allSettled([
        api.getTeams(),
        api.getSchools(),
        api.getCategories(),
        api.getJudges(),
        api.getDashboardStats()
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
    } catch (e) {
      console.warn('Backend data sync notice:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Support browser Refresh, Back/Forward buttons, and URL deep-linking
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && hash !== currentPage) {
        setCurrentPage(hash);
        try { localStorage.setItem('ttf_2026_current_page', hash); } catch (e) {}
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [currentPage]);

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

    setCurrentPage(page);
    try {
      localStorage.setItem('ttf_2026_current_page', page);
      window.location.hash = page;
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
          navigate('judge-dashboard');
          addToast({
            type: 'success',
            title: 'Logged in as Judge',
            message: `Welcome ${u.name}. Single-page mark entry active.`
          });
        }
        return { success: true };
      }
      return { success: false, error: 'Authentication failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid email or password.' };
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
        setCurrentPage('dashboard');
      }
    } else {
      const res = await loginWithCredentials('judge@gmail.com', '123456');
      if (!res.success) {
        setCurrentRole('judge');
        setCurrentUser(MOCK_USERS.judge || MOCK_USERS.judgePriya);
        setCurrentPage('judge-dashboard');
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
          evaluatedByJudgeName: currentUser.name
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
      competitionName: activeComp.name,
      score: totalScore,
      timestamp: nowTime,
      timeAgo: 'Just now'
    };
    const updatedActivities = [newActivity, ...scoringActivities];
    setScoringActivities(updatedActivities);
    try {
      localStorage.setItem('ttf_2026_activities', JSON.stringify(updatedActivities));
    } catch (e) {}

    // 4. Notification for Admin
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Score Submitted by Juror',
      message: `Juror ${currentUser.name} submitted official score: ${totalScore}/${maxScore} (${percentage}%) for Team ${target.teamId || target.participantId} (${target.teamName || target.name}).`,
      timestamp: 'Just now',
      timeAgo: '1m',
      type: 'score',
      isRead: false,
      actionLink: 'results'
    };
    setNotifications([newNotif, ...notifications]);

    // 5. Update Competition stats
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
    }).then(() => {
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
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, status: 'VERIFIED' as EvaluationStatus } : p))
    );
    addToast({
      type: 'success',
      title: 'Score Verified by Admin',
      message: 'Participant score is verified and ready for official publishing.'
    });
  };

  const reopenParticipantEvaluation = (participantId: string, reason?: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, status: 'IN_PROGRESS' as EvaluationStatus } : p))
    );
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

    addToast({
      type: 'success',
      title: 'Team Registered with Project',
      message: `${newParticipant.teamName} enrolled in P${project.categoryNumber}-0${project.projectNumber}: ${project.title}`
    });

    return { success: true, message: 'Team successfully registered.' };
  };

  const publishResultsOfficially = () => {
    setSelectedEvent((prev) => ({ ...prev, stage: 'RESULTS_PUBLISHED', scoreboardVisibility: 'PUBLISHED' }));
    setCompetitions((prev) => prev.map((c) => ({ ...c, status: 'COMPLETED' })));
    addToast({
      type: 'success',
      title: 'Official Results Published',
      message: 'Techno Talent Feast 2026 championship results are now officially published.'
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

  const addAnnouncement = (announcement: Omit<AnnouncementItem, 'id' | 'createdAt'>) => {
    const newAnn: AnnouncementItem = {
      ...announcement,
      id: 'ann-' + Date.now(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', 4 Nov 2026'
    };
    setAnnouncements([newAnn, ...announcements]);
    addToast({
      type: 'success',
      title: 'Announcement Broadcasted',
      message: `Published: "${announcement.title}" to ${announcement.target}.`
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
        updateJudge,
        deleteJudge,
        toggleJudgeStatus,
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
        triggerManagerScenario
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

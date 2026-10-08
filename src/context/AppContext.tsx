import React, { createContext, useContext, useState } from 'react';
import confetti from 'canvas-confetti';
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
  announcements: AnnouncementItem[];
  auditLogs: AuditLogItem[];
  
  // Scoring state
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
  createAnnouncement: (announcement: { title: string; message: string; priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; targetAudience?: 'ALL' | 'JUDGES' | 'ADMINISTRATION' }) => void;
  
  // UI helpers
  addToast: (toastOrMessage: any, toastType?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  triggerManagerScenario: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS.admin);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<TTFEvent>(INITIAL_EVENT);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('cat-6');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('part-01'); // Arun Kumar & Team
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('sch-01');
  const [selectedProjectNumber, setSelectedProjectNumber] = useState<number>(1);

  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [schools, setSchools] = useState<School[]>(MOCK_SCHOOLS);
  const [competitions, setCompetitions] = useState<Competition[]>(MOCK_COMPETITIONS);
  const [rubrics, setRubrics] = useState<Record<string, Rubric>>(MOCK_RUBRICS);
  const [judges, setJudges] = useState<Judge[]>(MOCK_JUDGES);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>(MOCK_ASSIGNMENTS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>(INITIAL_LEADERBOARD);
  const [scoringActivities, setScoringActivities] = useState<ScoringActivity[]>(INITIAL_SCORING_ACTIVITIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Flat list of 24 projects
  const allProjects = competitions.flatMap((c) => c.projects || []);
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
    if (params?.compId) setSelectedCompetitionId(params.compId);
    if (params?.partId) {
      setSelectedParticipantId(params.partId);
      loadParticipantForScoring(params.partId);
    }
    if (params?.schoolId) setSelectedSchoolId(params.schoolId);
    if (params?.projectNum) setSelectedProjectNumber(params.projectNum);

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ONLY TWO USER ROLES
  const loginAs = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentUser(MOCK_USERS.admin);
      setCurrentPage('dashboard');
      addToast({
        type: 'info',
        title: 'Logged in as Administration',
        message: 'Welcome back, James Techno. Full event control & oversight enabled.'
      });
    } else {
      setCurrentUser(MOCK_USERS.judgePriya);
      setCurrentPage('judge-dashboard');
      addToast({
        type: 'info',
        title: 'Logged in as Judge',
        message: 'Welcome Dr. Priya Sharma. Active category evaluation loaded.'
      });
    }
  };

  const logout = () => {
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

  const loadParticipantForScoring = (participantId: string) => {
    setSelectedParticipantId(participantId);
    const target = participants.find((p) => p.id === participantId);
    if (target?.criterionScores) {
      setActiveCriterionScores(target.criterionScores);
      setActiveScoreComments(target.judgeRemarks || '');
    } else if (participantId === 'part-01') {
      setActiveCriterionScores({
        'crit-tech': 28,
        'crit-innov': 23,
        'crit-design': 19,
        'crit-demo': 14,
        'crit-doc': 9
      });
      setActiveScoreComments('Outstanding hexapod locomotion and reliable obstacle clearance. Clear technical defense and excellent LoRa telemetry live demonstration.');
    } else {
      setActiveCriterionScores({
        'crit-tech': 25,
        'crit-innov': 21,
        'crit-design': 17,
        'crit-demo': 13,
        'crit-doc': 8
      });
      setActiveScoreComments('Good functional prototype. Recommend refining wire management and stress-testing under longer battery runs.');
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

  const submitEvaluation = () => {
    const activeComp = competitions.find((c) => c.id === selectedCompetitionId) || competitions[0];
    const rubric = rubrics[activeComp.rubricId] || rubrics['rub-ttf-cat6'] || Object.values(rubrics)[0];
    
    // Calculate total score
    const totalScore = Object.values(activeCriterionScores).reduce((a, b) => a + Number(b || 0), 0);
    const maxScore = rubric.maxScore || 100;
    const percentage = Math.round((totalScore / maxScore) * 100);

    // 1. Update participant status & score
    const currentPart = participants.find((p) => p.id === selectedParticipantId) || participants[0];
    const updatedParticipants = participants.map((p) => {
      if (p.id === selectedParticipantId) {
        return {
          ...p,
          status: 'SUBMITTED' as EvaluationStatus,
          finalScore: totalScore,
          percentage: percentage,
          rank: percentage >= 95 ? 1 : percentage >= 90 ? 2 : 3,
          submissionTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          criterionScores: { ...activeCriterionScores },
          judgeRemarks: activeScoreComments
        };
      }
      return p;
    });
    setParticipants(updatedParticipants);

    // 2. Add or update Leaderboard Item
    const existingLeaderboardItem = leaderboard.find((item) => item.participantId === selectedParticipantId);
    let updatedLeaderboard = [...leaderboard];
    if (existingLeaderboardItem) {
      updatedLeaderboard = updatedLeaderboard.map((item) =>
        item.participantId === selectedParticipantId
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
        rank: 2,
        participantId: currentPart.id,
        participantCode: currentPart.participantId,
        participantName: currentPart.name,
        photo: currentPart.photo,
        schoolName: currentPart.schoolName,
        competitionName: currentPart.competitionName,
        categoryNumber: currentPart.categoryNumber,
        categoryName: currentPart.categoryName,
        projectTitle: currentPart.projectTitle,
        teamName: currentPart.teamName,
        teamMembers: currentPart.teamMembers,
        isGroupProject: currentPart.isGroupProject,
        teamSize: currentPart.teamSize,
        grade: currentPart.grade,
        score: totalScore,
        maxScore: maxScore,
        percentage: percentage,
        status: 'EVALUATED',
        award: percentage >= 94 ? 'Rank 1 Gold' : percentage >= 90 ? 'Rank 2 Silver' : 'Rank 3 Bronze',
        recentChange: 'up'
      };
      updatedLeaderboard.push(newItem);
    }

    // Re-sort leaderboard by score descending and re-assign ranks
    updatedLeaderboard.sort((a, b) => b.score - a.score);
    updatedLeaderboard = updatedLeaderboard.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
    setLeaderboard(updatedLeaderboard);

    // 3. Add to live scoring activity
    const newActivity: ScoringActivity = {
      id: 'act-' + Date.now(),
      judgeName: currentUser.name,
      judgeAvatar: currentUser.avatar,
      action: 'submitted official score for',
      participantName: currentPart.teamName || currentPart.name,
      competitionName: activeComp.name,
      score: totalScore,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeAgo: 'Just now'
    };
    setScoringActivities([newActivity, ...scoringActivities]);

    // 4. Add Notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Score Submitted & Recorded',
      message: `Juror ${newActivity.judgeName} submitted ${totalScore}/${maxScore} (${percentage}%) for ${currentPart.teamName || currentPart.name}.`,
      timestamp: 'Just now',
      timeAgo: '1m',
      type: 'score',
      isRead: false,
      actionLink: 'score-review'
    };
    setNotifications([newNotif, ...notifications]);

    // 5. Update Competition stats
    setCompetitions((prev) =>
      prev.map((c) =>
        c.id === selectedCompetitionId
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
        a.participantId === selectedParticipantId
          ? { ...a, status: 'SUBMITTED', score: totalScore }
          : a
      )
    );

    // 7. Audit log
    const newAudit: AuditLogItem = {
      id: 'aud-' + Date.now(),
      userName: currentUser.name,
      userRole: currentUser.role === 'admin' ? 'ADMIN' : 'JUDGE',
      action: 'Score Submission',
      details: `Submitted evaluation score of ${totalScore}/${maxScore} (${percentage}%) for ${currentPart.teamName || currentPart.name} (${currentPart.participantId}) in ${activeComp.name}`,
      participantName: currentPart.teamName || currentPart.name,
      previousValue: 'Draft Saved',
      newValue: `Submitted: ${totalScore}/100`,
      timestamp: new Date().toLocaleTimeString(),
      ipAddress: '10.240.1.104'
    };
    setAuditLogs([newAudit, ...auditLogs]);

    setScoringScenarioRun(true);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0057B8', '#F36C21', '#FF8A3D', '#16A34A']
      });
    } catch (e) {
      // ignore
    }

    addToast({
      type: 'success',
      title: 'Evaluation Submitted Successfully!',
      message: `Score of ${totalScore}/${maxScore} (${percentage}%) locked for ${currentPart.name}. Standings updated.`
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

  const reopenParticipantEvaluation = (participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, status: 'IN_PROGRESS' as EvaluationStatus } : p))
    );
    addToast({
      type: 'warning',
      title: 'Evaluation Reopened',
      message: 'Juror can now make adjustments to the scoring sheet.'
    });
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
        activeCriterionScores,
        activeScoreComments,
        isDraftSaved,
        scoringScenarioRun,
        navigate,
        loginAs,
        logout,
        setCriterionScore,
        setActiveComments: setActiveScoreComments,
        saveEvaluationDraft,
        submitEvaluation,
        resetActiveScore,
        loadParticipantForScoring,
        createJudgeAssignment,
        assignJudgeToParticipant,
        removeJudgeAssignment,
        verifyParticipantScore,
        verifyScoreByAdmin,
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
                : 'bg-white border-blue-200 text-slate-800'
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
                  : 'bg-[#0057B8]'
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

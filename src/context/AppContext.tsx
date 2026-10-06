import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  UserRole,
  TTFEvent,
  School,
  Competition,
  Rubric,
  Participant,
  JudgeAssignment,
  ScoringActivity,
  LeaderboardItem,
  NotificationItem,
  AuditLogItem,
  EvaluationStatus
} from '../types';
import {
  INITIAL_EVENT,
  MOCK_USERS,
  MOCK_SCHOOLS,
  MOCK_COMPETITIONS,
  MOCK_RUBRICS,
  INITIAL_PARTICIPANTS,
  MOCK_JUDGES,
  INITIAL_SCORING_ACTIVITIES,
  INITIAL_LEADERBOARD,
  INITIAL_NOTIFICATIONS,
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
  participants: Participant[];
  schools: School[];
  competitions: Competition[];
  rubrics: Record<string, Rubric>;
  judges: JudgeAssignment[];
  leaderboard: LeaderboardItem[];
  scoringActivities: ScoringActivity[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  
  // Scoring state
  activeCriterionScores: Record<string, number>;
  activeScoreComments: string;
  isDraftSaved: boolean;
  scoringScenarioRun: boolean;

  // Actions
  navigate: (page: string, params?: { compId?: string; partId?: string; schoolId?: string }) => void;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  setCriterionScore: (criterionId: string, score: number) => void;
  setActiveComments: (comments: string) => void;
  saveEvaluationDraft: () => void;
  submitEvaluation: () => void;
  resetActiveScore: () => void;
  loadParticipantForScoring: (participantId: string) => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateRubricCriterion: (rubricId: string, criterionId: string, field: string, value: any) => void;
  addRubricCriterion: (rubricId: string) => void;
  deleteRubricCriterion: (rubricId: string, criterionId: string) => void;
  publishCompetitionResults: (compId: string) => void;
  triggerManagerScenario: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS.admin);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<TTFEvent>(INITIAL_EVENT);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('comp-01');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('part-01'); // Arun Kumar
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('sch-01');

  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [schools, setSchools] = useState<School[]>(MOCK_SCHOOLS);
  const [competitions, setCompetitions] = useState<Competition[]>(MOCK_COMPETITIONS);
  const [rubrics, setRubrics] = useState<Record<string, Rubric>>(MOCK_RUBRICS);
  const [judges, setJudges] = useState<JudgeAssignment[]>(MOCK_JUDGES);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>(INITIAL_LEADERBOARD);
  const [scoringActivities, setScoringActivities] = useState<ScoringActivity[]>(INITIAL_SCORING_ACTIVITIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Active Scoring state for Arun Kumar (Robotics Championship)
  // Preset with standard demo scenario: Innovation: 18, Tech: 19, Creativity: 17, Pres: 20, Exec: 18
  const [activeCriterionScores, setActiveCriterionScores] = useState<Record<string, number>>({
    'crit-01': 18,
    'crit-02': 19,
    'crit-03': 17,
    'crit-04': 20,
    'crit-05': 18
  });
  const [activeScoreComments, setActiveScoreComments] = useState<string>(
    'Outstanding hexapod locomotion and reliable obstacle clearance. Clear technical articulation and excellent LoRa telemetry demo.'
  );
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(false);
  const [scoringScenarioRun, setScoringScenarioRun] = useState<boolean>(false);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigate = (page: string, params?: { compId?: string; partId?: string; schoolId?: string }) => {
    if (params?.compId) setSelectedCompetitionId(params.compId);
    if (params?.partId) {
      setSelectedParticipantId(params.partId);
      loadParticipantForScoring(params.partId);
    }
    if (params?.schoolId) setSelectedSchoolId(params.schoolId);

    // Special route check for /live
    if (page === 'live') {
      setCurrentPage('live');
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginAs = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentUser(MOCK_USERS.admin);
      setCurrentPage('dashboard');
      addToast({
        type: 'info',
        title: 'Logged in as Super Admin',
        message: 'Welcome back, Dr. S. Ranganathan. Full event administration enabled.'
      });
    } else if (role === 'judge') {
      setCurrentUser(MOCK_USERS.judgePriya);
      setCurrentPage('judge-dashboard');
      addToast({
        type: 'info',
        title: 'Logged in as Judge',
        message: 'Welcome Priya Sharma. Robotics Championship evaluation loaded.'
      });
    } else if (role === 'participant') {
      setCurrentUser(MOCK_USERS.participantArun);
      setSelectedParticipantId('part-01');
      setCurrentPage('participant-detail');
      addToast({
        type: 'info',
        title: 'Participant Portal',
        message: 'Welcome Arun Kumar (ABC Matriculation School).'
      });
    } else if (role === 'viewer') {
      setCurrentUser(MOCK_USERS.viewer);
      setCurrentPage('live');
    }
  };

  const logout = () => {
    setCurrentPage('login');
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been safely logged out.'
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
    if (participantId === 'part-01') {
      setActiveCriterionScores({
        'crit-01': 18,
        'crit-02': 19,
        'crit-03': 17,
        'crit-04': 20,
        'crit-05': 18
      });
    } else {
      setActiveCriterionScores({
        'crit-01': 16,
        'crit-02': 17,
        'crit-03': 18,
        'crit-04': 18,
        'crit-05': 17
      });
    }
  };

  const saveEvaluationDraft = () => {
    setIsDraftSaved(true);
    addToast({
      type: 'info',
      title: 'Draft Saved Locally',
      message: 'Participant scores preserved. You can resume evaluation anytime.'
    });
  };

  const submitEvaluation = () => {
    const activeComp = competitions.find((c) => c.id === selectedCompetitionId) || competitions[0];
    const rubric = rubrics[activeComp.rubricId] || rubrics['rub-robotics'];
    
    // Calculate total score
    const totalScore = Object.values(activeCriterionScores).reduce((a, b) => a + b, 0);
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
          rank: percentage >= 95 ? 1 : percentage >= 90 ? 2 : 3
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
              status: 'EVALUATED',
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
        category: currentPart.category,
        grade: currentPart.grade,
        score: totalScore,
        maxScore: maxScore,
        percentage: percentage,
        status: 'EVALUATED',
        award: percentage >= 92 ? 'Winner Distinction' : 'Top Finisher',
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
      judgeName: currentUser.role === 'judge' ? currentUser.name : 'Priya Sharma',
      judgeAvatar: currentUser.avatar,
      action: 'submitted official score for',
      participantName: currentPart.name,
      competitionName: activeComp.name,
      score: totalScore,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeAgo: 'Just now'
    };
    setScoringActivities([newActivity, ...scoringActivities]);

    // 4. Add Notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Score Submitted & Verified',
      message: `Judge ${newActivity.judgeName} submitted ${totalScore}/${maxScore} (${percentage}%) for ${currentPart.name}.`,
      timestamp: 'Just now',
      timeAgo: '1m',
      type: 'score',
      isRead: false,
      actionLink: 'leaderboard'
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

    // 6. Update Judge assignment count
    setJudges((prev) =>
      prev.map((j) =>
        j.judgeId === 'jdg-01'
          ? {
              ...j,
              completedCount: j.completedCount + 1,
              pendingCount: Math.max(0, j.pendingCount - 1),
              lastActivity: 'Scored just now'
            }
          : j
      )
    );

    // 7. Audit log
    const newAudit: AuditLogItem = {
      id: 'aud-' + Date.now(),
      userName: currentUser.name,
      userRole: currentUser.role.toUpperCase(),
      action: 'Score Submission',
      details: `Submitted evaluation score of ${totalScore}/${maxScore} (${percentage}%) for participant ${currentPart.name} (${currentPart.participantId}) in ${activeComp.name}`,
      timestamp: new Date().toLocaleTimeString(),
      ipAddress: '192.168.1.104'
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
      message: `Score of ${totalScore}/${maxScore} (${percentage}%) locked for ${currentPart.name}. Leaderboard updated.`
    });
  };

  const resetActiveScore = () => {
    setActiveCriterionScores({
      'crit-01': 0,
      'crit-02': 0,
      'crit-03': 0,
      'crit-04': 0,
      'crit-05': 0
    });
    setActiveScoreComments('');
    setIsDraftSaved(false);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast({
      type: 'info',
      title: 'Notifications',
      message: 'All notifications marked as read.'
    });
  };

  const updateRubricCriterion = (rubricId: string, criterionId: string, field: string, value: any) => {
    setRubrics((prev) => {
      const rubric = prev[rubricId];
      if (!rubric) return prev;
      const updatedCriteria = rubric.criteria.map((crit) =>
        crit.id === criterionId ? { ...crit, [field]: value } : crit
      );
      return {
        ...prev,
        [rubricId]: {
          ...rubric,
          criteria: updatedCriteria,
          maxScore: updatedCriteria.reduce((sum, c) => sum + Number(c.maxMarks || 0), 0)
        }
      };
    });
  };

  const addRubricCriterion = (rubricId: string) => {
    setRubrics((prev) => {
      const rubric = prev[rubricId];
      if (!rubric) return prev;
      const newCrit = {
        id: 'crit-' + Date.now(),
        name: 'New Evaluation Parameter',
        description: 'Specify evaluation benchmark for judges.',
        maxMarks: 20,
        weight: 1,
        order: rubric.criteria.length + 1,
        isMandatory: true
      };
      const updatedCriteria = [...rubric.criteria, newCrit];
      return {
        ...prev,
        [rubricId]: {
          ...rubric,
          criteria: updatedCriteria,
          maxScore: updatedCriteria.reduce((sum, c) => sum + Number(c.maxMarks || 0), 0)
        }
      };
    });
    addToast({
      type: 'success',
      title: 'Rubric Updated',
      message: 'New evaluation criterion appended to rubric.'
    });
  };

  const deleteRubricCriterion = (rubricId: string, criterionId: string) => {
    setRubrics((prev) => {
      const rubric = prev[rubricId];
      if (!rubric) return prev;
      const updatedCriteria = rubric.criteria.filter((c) => c.id !== criterionId);
      return {
        ...prev,
        [rubricId]: {
          ...rubric,
          criteria: updatedCriteria,
          maxScore: updatedCriteria.reduce((sum, c) => sum + Number(c.maxMarks || 0), 0)
        }
      };
    });
    addToast({
      type: 'info',
      title: 'Criterion Removed',
      message: 'Criterion removed and maximum score recalculated.'
    });
  };

  const publishCompetitionResults = (compId: string) => {
    setCompetitions((prev) =>
      prev.map((c) => (c.id === compId ? { ...c, status: 'COMPLETED' } : c))
    );
    addToast({
      type: 'success',
      title: 'Results Published Officially',
      message: 'Final results are now publicly visible on the live scoreboard and participant portals.'
    });
  };

  const triggerManagerScenario = () => {
    // Exact requested scenario: Arun Kumar, Robotics, 18, 19, 17, 20, 18 => 92
    setSelectedCompetitionId('comp-01');
    setSelectedParticipantId('part-01');
    setActiveCriterionScores({
      'crit-01': 18,
      'crit-02': 19,
      'crit-03': 17,
      'crit-04': 20,
      'crit-05': 18
    });
    setActiveScoreComments('Exemplary robotics engineering, robust chassis and agile PID motor tuning.');
    setCurrentPage('scoring');
    addToast({
      type: 'info',
      title: 'Manager Demo Scenario Loaded',
      message: 'Arun Kumar (Robotics) criteria populated: 18, 19, 17, 20, 18 -> Total: 92/100 (92%).'
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
        participants,
        schools,
        competitions,
        rubrics,
        judges,
        leaderboard,
        scoringActivities,
        notifications,
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
        addToast,
        removeToast,
        markNotificationAsRead,
        markAllNotificationsRead,
        updateRubricCriterion,
        addRubricCriterion,
        deleteRubricCriterion,
        publishCompetitionResults,
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
              className="text-slate-400 hover:text-slate-600 text-xs p-1"
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

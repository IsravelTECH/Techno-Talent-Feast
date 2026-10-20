import test from 'node:test';
import assert from 'node:assert/strict';
import { getNormalizedTeamMembers, formatTeamStudentNames } from '../src/utils/studentUtils.ts';
import { calculateOverallSchoolStandings, calculateCategorySchoolStandings, getPodiumTiedGroups } from '../src/utils/trophyCalculator.ts';

// Helper matching JudgeSinglePageScoring.tsx juror normalization logic
function areJudgeIdsMatching(id1, id2) {
  if (!id1 || !id2) return false;
  const s1 = String(id1).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = String(id2).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s1 === s2) return true;
  const num1 = s1.replace(/[^0-9]/g, '');
  const num2 = s2.replace(/[^0-9]/g, '');
  if (num1 && num2 && parseInt(num1, 10) === parseInt(num2, 10)) {
    return true;
  }
  return false;
}

function isNoticeForCurrentJudge(team, currentJudgeId) {
  if (!team?.tieBreakNotice?.active) return false;
  const noticeTarget = team.tieBreakNotice?.targetJudgeId;
  if (!noticeTarget) {
    const assigned = team.evaluatedByJudgeId || team.assignedJudgeId;
    return assigned ? areJudgeIdsMatching(assigned, currentJudgeId) : true;
  }
  return areJudgeIdsMatching(noticeTarget, currentJudgeId);
}

// Helper matching AppContext.tsx router whitelist logic
const VALID_PAGES = [
  'dashboard',
  'live-board',
  'participants',
  'schools',
  'categories',
  'scoring-hub',
  'results',
  'profile',
  'score-requests',
  'tie-breaks',
  'judge-roaster'
];

function resolvePageFromHash(hash) {
  const clean = (hash || '').replace('#', '').trim();
  return VALID_PAGES.includes(clean) ? clean : 'dashboard';
}

// -------------------------------------------------------------
// TEST SUITE 1: Student Normalization & Role Cleaning
// -------------------------------------------------------------
test('Suite 1: Student Normalization & Role Cleaning (studentUtils)', async (t) => {
  await t.test('1.1 Strips parenthetical annotations like (Lead) from string names', () => {
    const input = {
      teamMembers: ['Priya Raj (Lead)', 'Rohan Sharma (Captain)', 'Zoya Khan']
    };
    const res = getNormalizedTeamMembers(input);
    assert.equal(res.length, 3);
    assert.equal(res[0].name, 'Priya Raj');
    assert.equal(res[1].name, 'Rohan Sharma');
    assert.equal(res[2].name, 'Zoya Khan');
  });

  await t.test('1.2 Strips (Lead) from member objects while preserving separate role field', () => {
    const input = {
      teamMembers: [
        { name: 'Priya Raj (Lead)', role: 'Autonomous Navigation Architect', grade: 11 },
        { name: 'Rohan Sharma', role: 'Motor Drive & Power Circuitry', grade: 11 },
        { name: 'Zoya Khan', role: 'RFID Drop-off Mechanism', grade: 11 },
        { name: 'Ayaan Ahmed', role: 'System Testing Lead', grade: 12 }
      ]
    };
    const res = getNormalizedTeamMembers(input);
    assert.equal(res.length, 4);
    assert.equal(res[0].name, 'Priya Raj');
    assert.equal(res[0].role, 'Autonomous Navigation Architect');
    assert.equal(res[0].grade, 11);
    assert.equal(res[1].name, 'Rohan Sharma');
    assert.equal(res[2].name, 'Zoya Khan');
    assert.equal(res[3].name, 'Ayaan Ahmed');
  });

  await t.test('1.3 Filters out invalid [object Object] artifacts safely', () => {
    const input = {
      teamMembers: ['[object Object]', 'Valid Student Name', null, undefined]
    };
    const res = getNormalizedTeamMembers(input);
    assert.equal(res.length, 1);
    assert.equal(res[0].name, 'Valid Student Name');
  });

  await t.test('1.4 Handles fallback teamName / studentName when teamMembers array is empty', () => {
    const input = { teamName: 'Zahra & Fatima (Lead)', grade: 10 };
    const res = getNormalizedTeamMembers(input);
    assert.equal(res.length, 1);
    assert.equal(res[0].name, 'Zahra & Fatima');
    assert.equal(res[0].grade, 10);
  });

  await t.test('1.5 formatTeamStudentNames produces comma-separated clean names', () => {
    const input = {
      teamMembers: [
        { name: 'Priya Raj (Lead)' },
        { name: 'Rohan Sharma' },
        { name: 'Zoya Khan' },
        { name: 'Ayaan Ahmed' }
      ]
    };
    const formatted = formatTeamStudentNames(input);
    assert.equal(formatted, 'Priya Raj, Rohan Sharma, Zoya Khan, Ayaan Ahmed');
  });
});

// -------------------------------------------------------------
// TEST SUITE 2: Strict Juror Tie-Break Routing & Isolation
// -------------------------------------------------------------
test('Suite 2: Strict Juror Tie-Break Routing & Isolation', async (t) => {
  await t.test('2.1 areJudgeIdsMatching correctly handles case & dash normalization', () => {
    assert.equal(areJudgeIdsMatching('JDG-01', 'JDG-01'), true);
    assert.equal(areJudgeIdsMatching('jud-01', 'JDG-01'), true);
    assert.equal(areJudgeIdsMatching('jdg-1', 'JDG-01'), true);
    assert.equal(areJudgeIdsMatching('JDG-06', 'jud-06'), true);
  });

  await t.test('2.2 areJudgeIdsMatching strictly differentiates between different jurors', () => {
    assert.equal(areJudgeIdsMatching('JDG-01', 'JDG-02'), false);
    assert.equal(areJudgeIdsMatching('jud-01', 'jud-06'), false);
    assert.equal(areJudgeIdsMatching('JDG-03', 'JDG-05'), false);
  });

  await t.test('2.3 Targeted tie-break alert is visible ONLY to target judge (JDG-01)', () => {
    const teamWithTargetNotice = {
      teamId: 'TTF26-TEAM-002',
      finalScore: 98,
      tieBreakNotice: {
        active: true,
        targetJudgeId: 'JDG-01',
        targetJudgeName: 'Official Competition Judge'
      }
    };

    // Target Juror JDG-01 must see it
    assert.equal(isNoticeForCurrentJudge(teamWithTargetNotice, 'JDG-01'), true);
    assert.equal(isNoticeForCurrentJudge(teamWithTargetNotice, 'jud-01'), true);

    // Other Jurors (JDG-02, JDG-06) must NOT see it
    assert.equal(isNoticeForCurrentJudge(teamWithTargetNotice, 'JDG-02'), false);
    assert.equal(isNoticeForCurrentJudge(teamWithTargetNotice, 'JDG-06'), false);
    assert.equal(isNoticeForCurrentJudge(teamWithTargetNotice, 'jud-03'), false);
  });
});

// -------------------------------------------------------------
// TEST SUITE 3: Trophy & Standings Calculation Engine
// -------------------------------------------------------------
test('Suite 3: Trophy & Standings Calculation Engine', async (t) => {
  const mockParticipants = [
    {
      id: 'p1',
      schoolName: 'The Indian High School Dubai',
      categoryNumber: 1,
      finalScore: 98,
      status: 'SUBMITTED'
    },
    {
      id: 'p2',
      schoolName: 'Delhi Private School Sharjah',
      categoryNumber: 1,
      finalScore: 98, // TIED!
      status: 'SUBMITTED'
    },
    {
      id: 'p3',
      schoolName: 'GEMS Modern Academy Dubai',
      categoryNumber: 1,
      finalScore: 92,
      status: 'SUBMITTED'
    },
    {
      id: 'p4',
      schoolName: 'The Indian High School Dubai',
      categoryNumber: 2,
      finalScore: 95,
      status: 'SUBMITTED'
    }
  ];

  await t.test('3.1 calculateOverallSchoolStandings accurately calculates totals and ranks', () => {
    const overall = calculateOverallSchoolStandings(mockParticipants);
    assert.ok(Array.isArray(overall));
    assert.ok(overall.length >= 2);
    // Highest total school should be ranked #1
    assert.equal(overall[0].schoolName, 'The Indian High School Dubai');
    assert.equal(overall[0].totalScore, 193); // 98 + 95
  });

  await t.test('3.2 calculateCategorySchoolStandings groups by category and detects ties', () => {
    const categoryStandings = calculateCategorySchoolStandings(mockParticipants);
    assert.ok(categoryStandings[1]);
    const cat1 = categoryStandings[1];
    assert.equal(cat1.length, 3);
    // Both tied schools should have 98 pts
    assert.equal(cat1[0].totalScore, 98);
    assert.equal(cat1[1].totalScore, 98);
  });
});

// -------------------------------------------------------------
// TEST SUITE 4: Page Routing Whitelist & Reload Persistence
// -------------------------------------------------------------
test('Suite 4: Page Routing Whitelist & Reload Persistence', async (t) => {
  await t.test('4.1 Whitelist includes score-requests and tie-breaks', () => {
    assert.ok(VALID_PAGES.includes('score-requests'));
    assert.ok(VALID_PAGES.includes('tie-breaks'));
    assert.ok(VALID_PAGES.includes('schools'));
    assert.ok(VALID_PAGES.includes('dashboard'));
  });

  await t.test('4.2 Resolves hash correctly upon browser reload', () => {
    assert.equal(resolvePageFromHash('#score-requests'), 'score-requests');
    assert.equal(resolvePageFromHash('#tie-breaks'), 'tie-breaks');
    assert.equal(resolvePageFromHash('#schools'), 'schools');
    assert.equal(resolvePageFromHash('#participants'), 'participants');
  });

  await t.test('4.3 Invalid or malformed hash falls back safely to dashboard', () => {
    assert.equal(resolvePageFromHash('#invalid-random-path'), 'dashboard');
    assert.equal(resolvePageFromHash(''), 'dashboard');
    assert.equal(resolvePageFromHash(null), 'dashboard');
  });
});

// -------------------------------------------------------------
// TEST SUITE 5: Live Backend API Health & Schema Checks
// -------------------------------------------------------------
test('Suite 5: Live Backend API Health & Schema Checks', async (t) => {
  await t.test('5.1 Backend health endpoint responds with status ok', async () => {
    const res = await fetch('http://localhost:5000/api/health');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
  });

  await t.test('5.2 Backend teams endpoint returns verified teams data', async () => {
    const res = await fetch('http://localhost:5000/api/teams');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.teams));
    assert.ok(data.teams.length > 0);

    const first = data.teams[0];
    assert.ok(first.teamId || first.participantId);
    assert.ok(first.schoolName);
  });

  await t.test('5.3 Backend schools endpoint returns registered schools', async () => {
    const res = await fetch('http://localhost:5000/api/schools');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.schools));
    assert.ok(data.schools.length > 0);
  });

  await t.test('5.4 Notification schema accepts valid enum types and rejects invalid ones', async () => {
    const { default: Notification } = await import('../server/models/Notification.js');
    
    // Valid notification instance with tie_alert
    const validNotif1 = new Notification({
      id: 'notif-test-1',
      recipientRole: 'judge',
      targetJudgeId: 'JDG-01',
      type: 'tie_alert',
      title: 'Tie Alert',
      message: 'Test alert'
    });
    assert.equal(validNotif1.validateSync(), undefined, 'tie_alert must be a valid notification enum type');

    // Valid notification instance with tie-alert
    const validNotif2 = new Notification({
      id: 'notif-test-2',
      recipientRole: 'judge',
      targetJudgeId: 'JDG-01',
      type: 'tie-alert',
      title: 'Tie Alert',
      message: 'Test alert'
    });
    assert.equal(validNotif2.validateSync(), undefined, 'tie-alert must be a valid notification enum type');

    // Invalid notification instance
    const invalidNotif = new Notification({
      id: 'notif-test-3',
      recipientRole: 'judge',
      type: 'random-invalid-type',
      title: 'Invalid',
      message: 'Test'
    });
    const invalidErr = invalidNotif.validateSync();
    assert.ok(invalidErr, 'random-invalid-type should fail validation');
    assert.ok(invalidErr.errors.type, 'type must trigger validator error');
  });

  await t.test('5.5 Team tieBreakNotice schema supports targetJudgeId and targetJudgeName', async () => {
    const { default: Team } = await import('../server/models/Team.js');
    const team = new Team({
      id: 'test-team-schema',
      teamId: 'TTF26-TEST-99',
      name: 'Test Team',
      schoolName: 'Test School',
      categoryName: 'Innovation Challenge',
      projectTitle: 'Solar Drone',
      tieBreakNotice: {
        active: true,
        tiedScore: 98,
        targetJudgeId: 'JDG-01',
        targetJudgeName: 'Official Competition Judge',
        notifiedAt: new Date().toISOString()
      }
    });
    const err = team.validateSync();
    assert.equal(err, undefined);
    assert.equal(team.tieBreakNotice.targetJudgeId, 'JDG-01');
    assert.equal(team.tieBreakNotice.targetJudgeName, 'Official Competition Judge');
  });
});

// -------------------------------------------------------------
// TEST SUITE 6: Podium-Only Tie Detection Engine (Champion, 1st & 2nd Runner-Up)
// -------------------------------------------------------------
test('Suite 6: Podium-Only Tie Detection Engine (getPodiumTiedGroups)', async (t) => {
  await t.test('6.1 Detects Rank 1 tie as Champion (Rank 1)', () => {
    const participants = [
      { id: 't1', teamId: 'T1', categoryNumber: 1, finalScore: 98, status: 'SUBMITTED', categoryName: 'Junior AI' },
      { id: 't2', teamId: 'T2', categoryNumber: 1, finalScore: 98, status: 'SUBMITTED', categoryName: 'Junior AI' },
      { id: 't3', teamId: 'T3', categoryNumber: 1, finalScore: 90, status: 'SUBMITTED', categoryName: 'Junior AI' },
      { id: 't4', teamId: 'T4', categoryNumber: 1, finalScore: 85, status: 'SUBMITTED', categoryName: 'Junior AI' },
    ];
    const ties = getPodiumTiedGroups(participants);
    assert.equal(ties.length, 1);
    assert.equal(ties[0].podiumRankAffected, 'Champion (Rank 1)');
    assert.equal(ties[0].rankIndex, 1);
    assert.equal(ties[0].score, 98);
    assert.equal(ties[0].teams.length, 2);
  });

  await t.test('6.2 Detects Rank 2 tie as 1st Runner-Up (Rank 2)', () => {
    const participants = [
      { id: 't1', teamId: 'T1', categoryNumber: 2, finalScore: 99, status: 'SUBMITTED', categoryName: 'Robotics' },
      { id: 't2', teamId: 'T2', categoryNumber: 2, finalScore: 94, status: 'SUBMITTED', categoryName: 'Robotics' },
      { id: 't3', teamId: 'T3', categoryNumber: 2, finalScore: 94, status: 'SUBMITTED', categoryName: 'Robotics' },
      { id: 't4', teamId: 'T4', categoryNumber: 2, finalScore: 88, status: 'SUBMITTED', categoryName: 'Robotics' },
    ];
    const ties = getPodiumTiedGroups(participants);
    assert.equal(ties.length, 1);
    assert.equal(ties[0].podiumRankAffected, '1st Runner-Up (Rank 2)');
    assert.equal(ties[0].rankIndex, 2);
    assert.equal(ties[0].score, 94);
    assert.equal(ties[0].teams.length, 2);
  });

  await t.test('6.3 Detects Rank 3 tie as 2nd Runner-Up (Rank 3)', () => {
    const participants = [
      { id: 't1', teamId: 'T1', categoryNumber: 3, finalScore: 99, status: 'SUBMITTED', categoryName: 'IoT' },
      { id: 't2', teamId: 'T2', categoryNumber: 3, finalScore: 95, status: 'SUBMITTED', categoryName: 'IoT' },
      { id: 't3', teamId: 'T3', categoryNumber: 3, finalScore: 90, status: 'SUBMITTED', categoryName: 'IoT' },
      { id: 't4', teamId: 'T4', categoryNumber: 3, finalScore: 90, status: 'SUBMITTED', categoryName: 'IoT' },
      { id: 't5', teamId: 'T5', categoryNumber: 3, finalScore: 82, status: 'SUBMITTED', categoryName: 'IoT' },
    ];
    const ties = getPodiumTiedGroups(participants);
    assert.equal(ties.length, 1);
    assert.equal(ties[0].podiumRankAffected, '2nd Runner-Up (Rank 3)');
    assert.equal(ties[0].rankIndex, 3);
    assert.equal(ties[0].score, 90);
    assert.equal(ties[0].teams.length, 2);
  });

  await t.test('6.4 Strictly IGNORES Rank 4+ ties (lower rank ties do not trigger alert)', () => {
    const participants = [
      { id: 't1', teamId: 'T1', categoryNumber: 4, finalScore: 100, status: 'SUBMITTED', categoryName: 'Game Dev' }, // Rank 1 (Champion)
      { id: 't2', teamId: 'T2', categoryNumber: 4, finalScore: 96, status: 'SUBMITTED', categoryName: 'Game Dev' },  // Rank 2 (1st Runner-Up)
      { id: 't3', teamId: 'T3', categoryNumber: 4, finalScore: 92, status: 'SUBMITTED', categoryName: 'Game Dev' },  // Rank 3 (2nd Runner-Up)
      { id: 't4', teamId: 'T4', categoryNumber: 4, finalScore: 85, status: 'SUBMITTED', categoryName: 'Game Dev' },  // Rank 4 (Tied)
      { id: 't5', teamId: 'T5', categoryNumber: 4, finalScore: 85, status: 'SUBMITTED', categoryName: 'Game Dev' },  // Rank 4 (Tied)
      { id: 't6', teamId: 'T6', categoryNumber: 4, finalScore: 80, status: 'SUBMITTED', categoryName: 'Game Dev' },  // Rank 6 (Tied)
      { id: 't7', teamId: 'T7', categoryNumber: 4, finalScore: 80, status: 'SUBMITTED', categoryName: 'Game Dev' },  // Rank 6 (Tied)
    ];
    const ties = getPodiumTiedGroups(participants);
    assert.equal(ties.length, 0, 'Ties for 4th and 6th place must be strictly ignored for podium purity');
  });

  await t.test('6.5 Three teams tied for Rank 1 occupy Ranks 1, 2, and 3; next score is Rank 4 and ignored', () => {
    const participants = [
      { id: 't1', teamId: 'T1', categoryNumber: 5, finalScore: 97, status: 'SUBMITTED', categoryName: 'Cybersecurity' },
      { id: 't2', teamId: 'T2', categoryNumber: 5, finalScore: 97, status: 'SUBMITTED', categoryName: 'Cybersecurity' },
      { id: 't3', teamId: 'T3', categoryNumber: 5, finalScore: 97, status: 'SUBMITTED', categoryName: 'Cybersecurity' },
      // Rank 4 tie below:
      { id: 't4', teamId: 'T4', categoryNumber: 5, finalScore: 89, status: 'SUBMITTED', categoryName: 'Cybersecurity' },
      { id: 't5', teamId: 'T5', categoryNumber: 5, finalScore: 89, status: 'SUBMITTED', categoryName: 'Cybersecurity' },
    ];
    const ties = getPodiumTiedGroups(participants);
    assert.equal(ties.length, 1);
    assert.equal(ties[0].podiumRankAffected, 'Champion (Rank 1)');
    assert.equal(ties[0].teams.length, 3);
    // The tie at 89 is Rank 4, so it should not appear
    const hasRank4Tie = ties.some(t => t.score === 89);
    assert.equal(hasRank4Tie, false);
  });
});

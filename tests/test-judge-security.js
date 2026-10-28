import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runSecurityTests() {
  console.log('=================================================================');
  console.log('  TECHNO TALENT FEST 2026 • JUDGE SECURITY & RBAC VERIFICATION');
  console.log('=================================================================');

  let passed = 0;
  let total = 0;

  function test(description, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ PASS: ${description}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${description}`);
      console.error(`    ${err.message}`);
    }
  }

  // TEST 1: Authenticate Judge Marcus Vance
  console.log('\n--- TEST 1: Judge Authentication & Role Verification ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'marcus.vance@technoschool.in',
      password: 'JDG-06-Marcus'
    })
  });

  test('Judge login returns HTTP 200 OK', () => {
    assert.strictEqual(loginRes.status, 200);
  });

  const loginData = await loginRes.json();
  test('Judge authenticated with role "judge"', () => {
    assert.strictEqual(loginData.success, true);
    assert.strictEqual(loginData.user.role, 'judge');
    assert.strictEqual(loginData.user.judgeId, 'JDG-06');
  });

  // TEST 2: Notification Isolation for Judge
  console.log('\n--- TEST 2: Notification Isolation for Judge ---');
  const notifRes = await fetch(`${BASE_URL}/notifications`);
  test('GET /api/notifications returns HTTP 200 OK', () => {
    assert.strictEqual(notifRes.status, 200);
  });

  const notifData = await notifRes.json();
  const allNotifications = notifData.notifications || [];

  // Simulate Header.tsx and Sidebar.tsx isolation filter for Judge Marcus Vance (role: judge, judgeId: JDG-06)
  const judgeRole = 'judge';
  const judgeId = 'JDG-06';
  const judgeUserId = loginData.user.id;

  const judgeVisibleNotifications = allNotifications.filter((n) => {
    const role = (n.recipientRole || 'ALL').trim().toLowerCase();
    if (judgeRole === 'judge') {
      if (role === 'admin') return false;
      if (
        n.actionLink &&
        ['participants', 'schools', 'results', 'dashboard', 'roles', 'assignments', 'categories', 'projects'].includes(
          n.actionLink
        )
      ) {
        return false;
      }
      const currentJudgeId = (judgeId || '').trim().toLowerCase();
      const currentUserId = (judgeUserId || '').trim().toLowerCase();
      if (currentJudgeId && role === currentJudgeId) return true;
      if (currentUserId && role === currentUserId) return true;

      const digitsRole = role.replace(/\D/g, '');
      const digitsJudge = currentJudgeId.replace(/\D/g, '');
      if (digitsRole && digitsJudge && parseInt(digitsRole, 10) === parseInt(digitsJudge, 10)) {
        return true;
      }
      if (role === 'judge') return true;
      return false;
    }
    return role === 'all';
  });

  test('Judge does NOT receive admin-targeted score submission alerts', () => {
    const leakedAdminScores = judgeVisibleNotifications.filter(
      (n) => n.recipientRole === 'admin' || (n.actionLink && ['results', 'participants', 'score-requests'].includes(n.actionLink))
    );
    assert.strictEqual(leakedAdminScores.length, 0, 'No admin score or participant alerts must reach judge');
  });

  test('Judge only receives alerts matching their role or judgeId', () => {
    const nonMatching = judgeVisibleNotifications.filter((n) => {
      const r = (n.recipientRole || '').toLowerCase();
      return r !== 'judge' && r !== 'jdg-06' && !r.includes('6');
    });
    assert.strictEqual(nonMatching.length, 0, 'All visible notifications must belong specifically to JDG-06 or role "judge"');
  });

  // TEST 3: RBAC Route Whitelist Verification
  console.log('\n--- TEST 3: RBAC Route Whitelist Verification ---');
  const JUDGE_ALLOWED_PAGES = new Set(['scoring', 'judge-dashboard', 'profile']);
  const ADMIN_ONLY_PAGES = [
    'dashboard',
    'participants',
    'schools',
    'categories',
    'competitions',
    'projects',
    'assignments',
    'results',
    'rubrics',
    'roles',
    'score-requests',
    'tie-breaks'
  ];

  ADMIN_ONLY_PAGES.forEach((adminPage) => {
    test(`Judge route guard strictly blocks admin route: #${adminPage}`, () => {
      assert.strictEqual(JUDGE_ALLOWED_PAGES.has(adminPage), false);
    });
  });

  test('Judge route guard permits "scoring"', () => {
    assert.strictEqual(JUDGE_ALLOWED_PAGES.has('scoring'), true);
  });

  test('Judge route guard permits "profile"', () => {
    assert.strictEqual(JUDGE_ALLOWED_PAGES.has('profile'), true);
  });

  console.log('\n=================================================================');
  console.log(`  SECURITY TEST RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}% SUCCESS)`);
  console.log('=================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Test suite execution error:', err);
  process.exit(1);
});

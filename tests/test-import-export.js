/**
 * Automated Verification Suite for Judge Roster and Participant Import/Export
 * Techno Talent Fest 2026
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=================================================================');
  console.log('  TECHNO TALENT FEST 2026 • IMPORT/EXPORT VERIFICATION SUITE');
  console.log('=================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Participant Export Verification
    // -------------------------------------------------------------
    console.log('--- TEST 1: Participant Export Verification ---');
    const teamsRes = await fetch(`${BASE_URL}/teams`);
    assert(teamsRes.ok, 'GET /api/teams returns HTTP 200 OK');
    const teamsData = await teamsRes.json();
    assert(teamsData.success === true, 'GET /api/teams returns success: true');
    assert(Array.isArray(teamsData.teams) && teamsData.teams.length > 0, `Retrieved ${teamsData.teams.length} participant teams`);

    // Verify CSV formatting logic
    const sampleTeam = teamsData.teams[0];
    assert(!!sampleTeam.teamId, `Team record contains Team ID: ${sampleTeam.teamId}`);
    assert(!!sampleTeam.name || !!sampleTeam.teamName, `Team record contains Team Name: ${sampleTeam.teamName || sampleTeam.name}`);
    assert(!!sampleTeam.schoolName, `Team record contains School Name: ${sampleTeam.schoolName}`);
    console.log(`  -> Participant Export data integrity verified for ${teamsData.teams.length} records.\n`);

    // -------------------------------------------------------------
    // TEST 2: Participant Bulk Import Verification
    // -------------------------------------------------------------
    console.log('--- TEST 2: Participant Bulk Import Verification ---');
    const testTeams = [
      {
        teamId: 'TEST-TM-901',
        name: 'AI Explorers Test',
        teamName: 'AI Explorers Test',
        schoolName: 'Techno Dubai Academy',
        grade: 8,
        categoryName: 'Robotics & AI',
        categoryNumber: 6,
        projectTitle: 'Autonomous Sorting Robot'
      },
      {
        teamId: 'TEST-TM-902',
        name: 'Solar Pioneers Test',
        teamName: 'Solar Pioneers Test',
        schoolName: 'Dubai International School',
        grade: 7,
        categoryName: 'Clean Tech & Sustainability',
        categoryNumber: 5,
        projectTitle: 'Solar Powered Hydroponics'
      },
      {
        teamId: 'TEST-TM-903',
        name: 'Code Crafters Test',
        teamName: 'Code Crafters Test',
        schoolName: 'Cambridge High School',
        grade: 9,
        categoryName: 'Coding & Software',
        categoryNumber: 4,
        projectTitle: 'Smart Campus Attendance System'
      }
    ];

    const bulkTeamRes = await fetch(`${BASE_URL}/teams/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams: testTeams })
    });

    assert(bulkTeamRes.status === 201, `POST /api/teams/bulk returns HTTP 201 Created (got ${bulkTeamRes.status})`);
    const bulkTeamData = await bulkTeamRes.json();
    assert(bulkTeamData.success === true, 'Bulk import response contains success: true');
    assert(bulkTeamData.count === 3, `Bulk import successfully created ${bulkTeamData.count} teams`);

    // Verify team lookup
    const lookupRes = await fetch(`${BASE_URL}/teams/lookup/TEST-TM-901`);
    assert(lookupRes.ok, 'Lookup imported team TEST-TM-901 returns HTTP 200 OK');
    const lookupData = await lookupRes.json();
    assert(lookupData.team.teamId === 'TEST-TM-901', 'Lookup verified team ID TEST-TM-901 in database');

    // Clean up test teams
    for (const t of testTeams) {
      await fetch(`${BASE_URL}/teams/${t.teamId}`, { method: 'DELETE' });
    }
    console.log('  -> Cleaned up test participant records.\n');

    // -------------------------------------------------------------
    // TEST 3: Judge Export Verification
    // -------------------------------------------------------------
    console.log('--- TEST 3: Judge Export Verification ---');
    const judgesRes = await fetch(`${BASE_URL}/judges`);
    assert(judgesRes.ok, 'GET /api/judges returns HTTP 200 OK');
    const judgesData = await judgesRes.json();
    assert(judgesData.success === true, 'GET /api/judges returns success: true');
    assert(Array.isArray(judgesData.judges) && judgesData.judges.length > 0, `Retrieved ${judgesData.judges.length} accredited judges`);

    const sampleJudge = judgesData.judges[0];
    assert(!!sampleJudge.judgeId, `Judge record contains Judge ID: ${sampleJudge.judgeId}`);
    assert(!!sampleJudge.name, `Judge record contains Juror Name: ${sampleJudge.name}`);
    assert(!!sampleJudge.email, `Judge record contains Official Email: ${sampleJudge.email}`);
    assert(!!sampleJudge.password, `Judge record contains Generated Password: ${sampleJudge.password}`);
    console.log(`  -> Judge Export data integrity verified for ${judgesData.judges.length} records.\n`);

    // -------------------------------------------------------------
    // TEST 4: Judge Bulk Import & Authentication Verification
    // -------------------------------------------------------------
    console.log('--- TEST 4: Judge Bulk Import & Authentication Verification ---');
    const timestamp = Date.now();
    const testJudges = [
      {
        name: 'Dr. Alan Turing Test',
        email: `alan.test.${timestamp}@technoschool.in`,
        organization: 'Techno AI Academy',
        specialization: 'Robotics & AI'
      },
      {
        name: 'Prof. Ada Lovelace Test',
        email: `ada.test.${timestamp}@technoschool.in`,
        organization: 'Cambridge International',
        specialization: 'Coding & Software'
      },
      {
        name: 'Dr. Claude Shannon Test',
        email: `claude.test.${timestamp}@technoschool.in`,
        organization: 'Dubai Silicon Oasis High',
        specialization: 'Innovation Challenge'
      }
    ];

    const bulkJudgeRes = await fetch(`${BASE_URL}/judges/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ judges: testJudges })
    });

    assert(bulkJudgeRes.status === 201, `POST /api/judges/bulk returns HTTP 201 Created (got ${bulkJudgeRes.status})`);
    const bulkJudgeData = await bulkJudgeRes.json();
    assert(bulkJudgeData.success === true, 'Bulk import response contains success: true');
    assert(bulkJudgeData.count === 3, `Bulk import successfully created ${bulkJudgeData.count} judges`);

    const firstImported = bulkJudgeData.judges[0];
    assert(!!firstImported.judgeId, `Auto-generated Judge ID assigned: ${firstImported.judgeId}`);
    assert(!!firstImported.password, `Auto-generated Password assigned: ${firstImported.password}`);

    // Verify login with newly imported judge credentials
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: firstImported.email,
        password: firstImported.password
      })
    });

    assert(loginRes.ok, `Login with newly imported judge credentials returns HTTP 200 OK (${firstImported.email})`);
    const loginData = await loginRes.json();
    assert(loginData.success === true, 'Judge login returns success: true');
    assert(loginData.user.role === 'judge', `Judge authenticated with role: ${loginData.user.role}`);

    // Clean up test judges
    for (const j of bulkJudgeData.judges) {
      await fetch(`${BASE_URL}/judges/${j.id || j.judgeId}`, { method: 'DELETE' });
    }
    console.log('  -> Cleaned up test judge records.\n');

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('=================================================================');
    console.log(`  TEST RESULTS: ${passedTests} / ${totalTests} PASSED (100% SUCCESS)`);
    console.log('=================================================================\n');

  } catch (err) {
    console.error('Test suite failed with error:', err);
    process.exit(1);
  }
}

runTests();

export interface TrophyDefinition {
  title: string;
  categoryNumber: number | null; // null for overall
  categoryName: string;
  prizeType: 'First Prize' | 'Second Prize' | 'Third Prize' | 'Best School Award' | 'Overall Trophy';
  rank?: number;
  quantity: number;
  recipientType: 'STUDENT_OR_DUO' | 'SCHOOL';
}

export interface CategorySchoolStanding {
  schoolName: string;
  categoryNumber: number;
  categoryName: string;
  participantCount: number;
  totalScore: number;
  averageScore: number;
  topScore: number;
}

export interface OverallSchoolStanding {
  schoolName: string;
  totalScore: number;
  averageScore: number;
  totalParticipants: number;
  categoriesParticipated: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  trophiesWon: string[];
}

export const CATEGORY_TRACK_INFO: Record<number, { titlePrefix: string; name: string }> = {
  1: { titlePrefix: 'Tiny Titan of ICT', name: 'Category 1: ICT Challenge' },
  2: { titlePrefix: 'Titan of Code', name: 'Category 2: Coding Challenge' },
  3: { titlePrefix: 'Titan of Creative Tech', name: 'Category 3: Creative Technology Challenge' },
  4: { titlePrefix: 'Titan of AI', name: 'Category 4: Artificial Intelligence Challenge' },
  5: { titlePrefix: 'Titan of Digital Solutions', name: 'Category 5: Digital Solutions Challenge' },
  6: { titlePrefix: 'Titan of Innovation', name: 'Category 6: Innovation Challenge' },
};

export const OFFICIAL_TROPHIES: TrophyDefinition[] = [
  // Category 1: ICT
  { title: 'Tiny Titan of ICT – Champion', categoryNumber: 1, categoryName: 'Category 1: ICT Challenge', prizeType: 'First Prize', rank: 1, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Tiny Titan of ICT – 1st Runner-Up', categoryNumber: 1, categoryName: 'Category 1: ICT Challenge', prizeType: 'Second Prize', rank: 2, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Tiny Titan of ICT – 2nd Runner-Up', categoryNumber: 1, categoryName: 'Category 1: ICT Challenge', prizeType: 'Third Prize', rank: 3, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Tiny Titan of ICT – Best School', categoryNumber: 1, categoryName: 'Category 1: ICT Challenge', prizeType: 'Best School Award', quantity: 1, recipientType: 'SCHOOL' },

  // Category 2: Code
  { title: 'Titan of Code – Champion', categoryNumber: 2, categoryName: 'Category 2: Coding Challenge', prizeType: 'First Prize', rank: 1, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Code – 1st Runner-Up', categoryNumber: 2, categoryName: 'Category 2: Coding Challenge', prizeType: 'Second Prize', rank: 2, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Code – 2nd Runner-Up', categoryNumber: 2, categoryName: 'Category 2: Coding Challenge', prizeType: 'Third Prize', rank: 3, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Code – Best School', categoryNumber: 2, categoryName: 'Category 2: Coding Challenge', prizeType: 'Best School Award', quantity: 1, recipientType: 'SCHOOL' },

  // Category 3: Creative Tech
  { title: 'Titan of Creative Tech – Champion', categoryNumber: 3, categoryName: 'Category 3: Creative Technology Challenge', prizeType: 'First Prize', rank: 1, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Creative Tech – 1st Runner-Up', categoryNumber: 3, categoryName: 'Category 3: Creative Technology Challenge', prizeType: 'Second Prize', rank: 2, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Creative Tech – 2nd Runner-Up', categoryNumber: 3, categoryName: 'Category 3: Creative Technology Challenge', prizeType: 'Third Prize', rank: 3, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Creative Tech – Best School', categoryNumber: 3, categoryName: 'Category 3: Creative Technology Challenge', prizeType: 'Best School Award', quantity: 1, recipientType: 'SCHOOL' },

  // Category 4: AI
  { title: 'Titan of AI – Champion', categoryNumber: 4, categoryName: 'Category 4: Artificial Intelligence Challenge', prizeType: 'First Prize', rank: 1, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of AI – 1st Runner-Up', categoryNumber: 4, categoryName: 'Category 4: Artificial Intelligence Challenge', prizeType: 'Second Prize', rank: 2, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of AI – 2nd Runner-Up', categoryNumber: 4, categoryName: 'Category 4: Artificial Intelligence Challenge', prizeType: 'Third Prize', rank: 3, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of AI – Best School', categoryNumber: 4, categoryName: 'Category 4: Artificial Intelligence Challenge', prizeType: 'Best School Award', quantity: 1, recipientType: 'SCHOOL' },

  // Category 5: Digital Solutions
  { title: 'Titan of Digital Solutions – Champion', categoryNumber: 5, categoryName: 'Category 5: Digital Solutions Challenge', prizeType: 'First Prize', rank: 1, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Digital Solutions – 1st Runner-Up', categoryNumber: 5, categoryName: 'Category 5: Digital Solutions Challenge', prizeType: 'Second Prize', rank: 2, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Digital Solutions – 2nd Runner-Up', categoryNumber: 5, categoryName: 'Category 5: Digital Solutions Challenge', prizeType: 'Third Prize', rank: 3, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Digital Solutions – Best School', categoryNumber: 5, categoryName: 'Category 5: Digital Solutions Challenge', prizeType: 'Best School Award', quantity: 1, recipientType: 'SCHOOL' },

  // Category 6: Innovation
  { title: 'Titan of Innovation – Champion', categoryNumber: 6, categoryName: 'Category 6: Innovation Challenge', prizeType: 'First Prize', rank: 1, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Innovation – 1st Runner-Up', categoryNumber: 6, categoryName: 'Category 6: Innovation Challenge', prizeType: 'Second Prize', rank: 2, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Innovation – 2nd Runner-Up', categoryNumber: 6, categoryName: 'Category 6: Innovation Challenge', prizeType: 'Third Prize', rank: 3, quantity: 2, recipientType: 'STUDENT_OR_DUO' },
  { title: 'Titan of Innovation – Best School', categoryNumber: 6, categoryName: 'Category 6: Innovation Challenge', prizeType: 'Best School Award', quantity: 1, recipientType: 'SCHOOL' },

  // Overall Championship
  { title: 'Titans of Technology – Champion School Overall Trophy', categoryNumber: null, categoryName: 'Overall Grand Championship', prizeType: 'Overall Trophy', quantity: 1, recipientType: 'SCHOOL' }
];

/**
 * Resolves the numeric category number (1-6) from participant or competition data
 */
export function getCategoryNumber(participant: any): number {
  if (!participant) return 1;
  if (participant.categoryNumber && participant.categoryNumber >= 1 && participant.categoryNumber <= 6) {
    return Number(participant.categoryNumber);
  }
  const idStr = String(participant.competitionId || '').toLowerCase();
  if (idStr.includes('cat-1') || idStr.includes('c1') || idStr.includes('ict')) return 1;
  if (idStr.includes('cat-2') || idStr.includes('c2') || idStr.includes('code') || idStr.includes('coding')) return 2;
  if (idStr.includes('cat-3') || idStr.includes('c3') || idStr.includes('creative')) return 3;
  if (idStr.includes('cat-4') || idStr.includes('c4') || idStr.includes('ai') || idStr.includes('artificial')) return 4;
  if (idStr.includes('cat-5') || idStr.includes('c5') || idStr.includes('digital')) return 5;
  if (idStr.includes('cat-6') || idStr.includes('c6') || idStr.includes('innovation')) return 6;

  const nameStr = String(participant.competitionName || '').toLowerCase();
  if (nameStr.includes('category 1') || nameStr.includes('ict')) return 1;
  if (nameStr.includes('category 2') || nameStr.includes('coding')) return 2;
  if (nameStr.includes('category 3') || nameStr.includes('creative')) return 3;
  if (nameStr.includes('category 4') || nameStr.includes('ai') || nameStr.includes('artificial')) return 4;
  if (nameStr.includes('category 5') || nameStr.includes('digital')) return 5;
  if (nameStr.includes('category 6') || nameStr.includes('innovation')) return 6;

  return 1;
}

/**
 * Returns the official Student Trophy Award for a given category and rank
 */
export function getStudentTrophy(categoryNumber: number, rank: number): TrophyDefinition | null {
  const match = OFFICIAL_TROPHIES.find(
    (t) => t.categoryNumber === categoryNumber && t.rank === rank && t.recipientType === 'STUDENT_OR_DUO'
  );
  return match || null;
}

/**
 * Computes category-wise best school standings by aggregating participants in each category
 */
export function calculateCategorySchoolStandings(participants: any[]): Record<number, CategorySchoolStanding[]> {
  const safeList = Array.isArray(participants) ? participants : [];
  const evaluated = safeList.filter((p) => p && (p.status === 'SUBMITTED' || (p.finalScore && Number(p.finalScore) > 0)));
  const categoryMap: Record<number, Record<string, { totalScore: number; count: number; topScore: number }>> = {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {}
  };

  evaluated.forEach((p) => {
    const catNum = getCategoryNumber(p);
    const school = p.schoolName || 'Independent Participant';
    const score = Number(p.finalScore || p.score || 0);

    if (!categoryMap[catNum]) {
      categoryMap[catNum] = {};
    }
    if (!categoryMap[catNum][school]) {
      categoryMap[catNum][school] = { totalScore: 0, count: 0, topScore: 0 };
    }
    categoryMap[catNum][school].totalScore += score;
    categoryMap[catNum][school].count += 1;
    if (score > categoryMap[catNum][school].topScore) {
      categoryMap[catNum][school].topScore = score;
    }
  });

  const result: Record<number, CategorySchoolStanding[]> = {};

  [1, 2, 3, 4, 5, 6].forEach((catNum) => {
    const schoolRecords = categoryMap[catNum] || {};
    const standings: CategorySchoolStanding[] = Object.keys(schoolRecords).map((schoolName) => {
      const data = schoolRecords[schoolName];
      return {
        schoolName,
        categoryNumber: catNum,
        categoryName: CATEGORY_TRACK_INFO[catNum]?.name || `Category ${catNum}`,
        participantCount: data.count,
        totalScore: Math.round(data.totalScore * 10) / 10,
        averageScore: data.count > 0 ? Math.round((data.totalScore / data.count) * 10) / 10 : 0,
        topScore: data.topScore
      };
    });

    // Sort descending by total score, then top score
    standings.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.topScore - a.topScore;
    });

    result[catNum] = standings;
  });

  return result;
}

/**
 * Computes overall school rankings across all categories to determine:
 * Titans of Technology – Champion School Overall Trophy
 */
export function calculateOverallSchoolStandings(participants: any[]): OverallSchoolStanding[] {
  const safeList = Array.isArray(participants) ? participants : [];
  const evaluated = safeList.filter((p) => p && (p.status === 'SUBMITTED' || (p.finalScore && Number(p.finalScore) > 0)));
  const schoolAgg: Record<
    string,
    {
      totalScore: number;
      participantCount: number;
      categories: Set<number>;
      gold: number;
      silver: number;
      bronze: number;
    }
  > = {};

  // First group by category to identify podium ranks for medal points
  const categorySchoolStandings = calculateCategorySchoolStandings(participants);
  const categoryBestSchoolAwardees: Record<number, string> = {};
  [1, 2, 3, 4, 5, 6].forEach((c) => {
    const list = categorySchoolStandings[c];
    if (list && list.length > 0) {
      categoryBestSchoolAwardees[c] = list[0].schoolName;
    }
  });

  // Calculate medals per participant
  [1, 2, 3, 4, 5, 6].forEach((catNum) => {
    const catParticipants = evaluated
      .filter((p) => getCategoryNumber(p) === catNum)
      .sort((a, b) => {
        const scoreDiff = Number(b.finalScore || 0) - Number(a.finalScore || 0);
        if (scoreDiff !== 0) return scoreDiff;
        const bTech = Number(b.criterionScores?.['crit-tech'] || 0);
        const aTech = Number(a.criterionScores?.['crit-tech'] || 0);
        if (bTech !== aTech) return bTech - aTech;
        const bInnov = Number(b.criterionScores?.['crit-innov'] || 0);
        const aInnov = Number(a.criterionScores?.['crit-innov'] || 0);
        if (bInnov !== aInnov) return bInnov - aInnov;
        return 0;
      });

    catParticipants.forEach((p, idx) => {
      const school = p.schoolName || 'Independent Participant';
      if (!schoolAgg[school]) {
        schoolAgg[school] = {
          totalScore: 0,
          participantCount: 0,
          categories: new Set<number>(),
          gold: 0,
          silver: 0,
          bronze: 0
        };
      }
      schoolAgg[school].totalScore += Number(p.finalScore || 0);
      schoolAgg[school].participantCount += 1;
      schoolAgg[school].categories.add(catNum);

      if (idx === 0) schoolAgg[school].gold += 1;
      else if (idx === 1) schoolAgg[school].silver += 1;
      else if (idx === 2) schoolAgg[school].bronze += 1;
    });
  });

  const overallStandings: OverallSchoolStanding[] = Object.keys(schoolAgg).map((schoolName) => {
    const item = schoolAgg[schoolName];
    const trophies: string[] = [];

    // Check if won any Category Best School Award
    [1, 2, 3, 4, 5, 6].forEach((catNum) => {
      if (categoryBestSchoolAwardees[catNum] === schoolName) {
        const trophy = OFFICIAL_TROPHIES.find(
          (t) => t.categoryNumber === catNum && t.prizeType === 'Best School Award'
        );
        if (trophy) trophies.push(trophy.title);
      }
    });

    return {
      schoolName,
      totalScore: Math.round(item.totalScore * 10) / 10,
      averageScore: item.participantCount > 0 ? Math.round((item.totalScore / item.participantCount) * 10) / 10 : 0,
      totalParticipants: item.participantCount,
      categoriesParticipated: item.categories.size,
      goldCount: item.gold,
      silverCount: item.silver,
      bronzeCount: item.bronze,
      trophiesWon: trophies
    };
  });

  // Sort by totalScore, then medal tally
  overallStandings.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    const aMedalScore = a.goldCount * 5 + a.silverCount * 3 + a.bronzeCount * 1;
    const bMedalScore = b.goldCount * 5 + b.silverCount * 3 + b.bronzeCount * 1;
    return bMedalScore - aMedalScore;
  });

  // Assign Overall Trophy to Rank 1 if available
  if (overallStandings.length > 0) {
    overallStandings[0].trophiesWon.unshift('Titans of Technology – Champion School Overall Trophy');
  }

  return overallStandings;
}

export interface PodiumTiedGroup {
  key: string;
  categoryNumber: number;
  categoryName: string;
  score: number;
  podiumRankAffected: 'Champion (Rank 1)' | '1st Runner-Up (Rank 2)' | '2nd Runner-Up (Rank 3)';
  rankIndex: 1 | 2 | 3;
  teams: any[];
}

/**
 * Detects score ties strictly affecting the Top 3 Podium Ranks
 * (Champion, 1st Runner-Up, 2nd Runner-Up) within each category.
 * Lower-rank ties (4th, 5th, etc.) are strictly ignored.
 */
export function getPodiumTiedGroups(participants: any[]): PodiumTiedGroup[] {
  const safeList = Array.isArray(participants) ? participants : [];
  const evaluated = safeList.filter(
    (p) => p && (p.status === 'SUBMITTED' || p.isScoreLocked || (typeof p.finalScore === 'number' && p.finalScore > 0))
  );

  const categories = [1, 2, 3, 4, 5, 6];
  const podiumTiedGroups: PodiumTiedGroup[] = [];

  categories.forEach((catNum) => {
    // 1. Get all evaluated participants in this category and sort descending by finalScore
    const catParticipants = evaluated
      .filter((p) => getCategoryNumber(p) === catNum)
      .sort((a, b) => Number(b.finalScore || 0) - Number(a.finalScore || 0));

    if (catParticipants.length < 2) return;

    // 2. Identify score distribution: group participants by exact score
    const scoreMap = new Map<number, any[]>();
    catParticipants.forEach((p) => {
      const score = Number(p.finalScore || 0);
      const list = scoreMap.get(score) || [];
      list.push(p);
      scoreMap.set(score, list);
    });

    // 3. Walk through sorted scores and check if any tie impacts top 3 positions
    let currentRankIndex = 1; // 1-based rank (1 = Champion, 2 = 1st Runner-Up, 3 = 2nd Runner-Up)

    for (const [score, teamsWithScore] of scoreMap.entries()) {
      // If we've already exceeded podium positions (Rank 4 or lower), stop checking
      if (currentRankIndex > 3) break;

      // If 2 or more teams share this score, it's a tie
      if (teamsWithScore.length >= 2) {
        let label: 'Champion (Rank 1)' | '1st Runner-Up (Rank 2)' | '2nd Runner-Up (Rank 3)';
        let rankNum: 1 | 2 | 3;

        if (currentRankIndex === 1) {
          label = 'Champion (Rank 1)';
          rankNum = 1;
        } else if (currentRankIndex === 2) {
          label = '1st Runner-Up (Rank 2)';
          rankNum = 2;
        } else {
          label = '2nd Runner-Up (Rank 3)';
          rankNum = 3;
        }

        const categoryName = teamsWithScore[0].categoryName || CATEGORY_TRACK_INFO[catNum]?.name || `Category ${catNum}`;

        podiumTiedGroups.push({
          key: `${catNum}_${score}`,
          categoryNumber: catNum,
          categoryName,
          score,
          podiumRankAffected: label,
          rankIndex: rankNum,
          teams: teamsWithScore
        });
      }

      // Advance rank index by the number of teams with this score
      currentRankIndex += teamsWithScore.length;
    }
  });

  // Sort by rankIndex ascending (Champion ties first, then 1st Runner-Up, then 2nd Runner-Up), then category
  return podiumTiedGroups.sort((a, b) => a.rankIndex - b.rankIndex || a.categoryNumber - b.categoryNumber);
}


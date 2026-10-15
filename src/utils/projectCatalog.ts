import { CompetitionProject } from '../types';
import { OFFICIAL_24_PROJECTS, PROJECTS_BY_CATEGORY } from '../data/officialProjects';

export interface CategoryInfo {
  categoryNumber: number;
  id: string;
  name: string;
  challengeTitle: string;
  gradeEligibility: string;
  minGrade: number;
  maxGrade: number;
  description: string;
  projects: CompetitionProject[];
}

export const CATEGORY_CATALOG: CategoryInfo[] = [
  {
    categoryNumber: 1,
    id: 'cat-1',
    name: 'Category 1: ICT Challenge',
    challengeTitle: 'ICT Challenge',
    gradeEligibility: 'Grades 1 & 2',
    minGrade: 1,
    maxGrade: 2,
    description: 'Foundational computer literacy, peripheral recognition, smart device classifications, and digital artistic expression.',
    projects: PROJECTS_BY_CATEGORY[1] || []
  },
  {
    categoryNumber: 2,
    id: 'cat-2',
    name: 'Category 2: Coding Challenge',
    challengeTitle: 'Coding Challenge',
    gradeEligibility: 'Grades 3 & 4',
    minGrade: 3,
    maxGrade: 4,
    description: 'Algorithmic logic, interactive animations, environment-aware computational models, and virtual maze pathfinding.',
    projects: PROJECTS_BY_CATEGORY[2] || []
  },
  {
    categoryNumber: 3,
    id: 'cat-3',
    name: 'Category 3: Creative Technology Challenge',
    challengeTitle: 'Creative Technology Challenge',
    gradeEligibility: 'Grades 5 & 6',
    minGrade: 5,
    maxGrade: 6,
    description: 'Pixel art mathematical modeling, 3D optical perspective illusions, 3D architectural city modeling, and digital health vlogging.',
    projects: PROJECTS_BY_CATEGORY[3] || []
  },
  {
    categoryNumber: 4,
    id: 'cat-4',
    name: 'Category 4: Artificial Intelligence Challenge',
    challengeTitle: 'Artificial Intelligence Challenge',
    gradeEligibility: 'Grades 7 & 8',
    minGrade: 7,
    maxGrade: 8,
    description: 'Intelligent task automations, physics platformer games, real-time web polling systems, and secure financial simulation engines.',
    projects: PROJECTS_BY_CATEGORY[4] || []
  },
  {
    categoryNumber: 5,
    id: 'cat-5',
    name: 'Category 5: Digital Solutions Challenge',
    challengeTitle: 'Digital Solutions Challenge',
    gradeEligibility: 'Grades 9 & 10',
    minGrade: 9,
    maxGrade: 10,
    description: 'Civic smart city apps, preventative health dashboards, computer vision edge classifiers, and personalized generative learning assistants.',
    projects: PROJECTS_BY_CATEGORY[5] || []
  },
  {
    categoryNumber: 6,
    id: 'cat-6',
    name: 'Category 6: Innovation Challenge',
    challengeTitle: 'Innovation Challenge',
    gradeEligibility: 'Grades 11 & 12',
    minGrade: 11,
    maxGrade: 12,
    description: 'Autonomous search & rescue rovers, last-mile delivery robots, smart micro-grid energy optimizers, and comprehensive smart city solutions.',
    projects: PROJECTS_BY_CATEGORY[6] || []
  }
];

/**
 * Returns the Category matching a student's grade (1 to 12)
 */
export function getCategoryForGrade(grade: number): CategoryInfo {
  const cleanGrade = Math.max(1, Math.min(12, Math.round(grade || 1)));
  if (cleanGrade <= 2) return CATEGORY_CATALOG[0];
  if (cleanGrade <= 4) return CATEGORY_CATALOG[1];
  if (cleanGrade <= 6) return CATEGORY_CATALOG[2];
  if (cleanGrade <= 8) return CATEGORY_CATALOG[3];
  if (cleanGrade <= 10) return CATEGORY_CATALOG[4];
  return CATEGORY_CATALOG[5];
}

/**
 * Returns all 4 projects designated for a specific category (1 to 6)
 */
export function getProjectsForCategory(categoryNumber: number): CompetitionProject[] {
  return PROJECTS_BY_CATEGORY[categoryNumber] || [];
}

/**
 * Retrieves a specific project by its ID (e.g. "c1-p2", "c6-p1")
 */
export function getProjectById(projectId: string): CompetitionProject | undefined {
  return OFFICIAL_24_PROJECTS.find((p) => p.id === projectId);
}

/**
 * Formats project code: e.g. "P1-02: Devising"
 */
export function formatProjectCode(categoryNumber: number, projectNumber: number, title?: string): string {
  const code = `P${categoryNumber || 1}-0${projectNumber || 1}`;
  return title ? `${code}: ${title}` : code;
}

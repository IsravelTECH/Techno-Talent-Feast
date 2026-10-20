/**
 * Utility functions for normalizing and formatting student and team member data.
 * Prevents [object Object] bugs when teamMembers contain object elements.
 */

export interface NormalizedStudent {
  name: string;
  role?: string;
  grade?: number;
}

export function getNormalizedTeamMembers(team: any): NormalizedStudent[] {
  if (!team) return [];

  if (Array.isArray(team.teamMembers) && team.teamMembers.length > 0) {
    const list: NormalizedStudent[] = [];

    team.teamMembers.forEach((m: any) => {
      if (!m) return;

      if (typeof m === 'string') {
        const trimmed = m.trim();
        if (trimmed && trimmed !== '[object Object]') {
          const cleanName = trimmed.replace(/\s*\([^)]*\)/g, '').trim();
          list.push({ name: cleanName || trimmed });
        }
      } else if (typeof m === 'object') {
        const rawName = m.name || m.studentName || m.fullName;
        if (rawName && typeof rawName === 'string' && rawName.trim() !== '[object Object]') {
          const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
          list.push({
            name: cleanName || rawName.trim(),
            role: m.role ? String(m.role).trim() : undefined,
            grade: m.grade ? Number(m.grade) : team.grade ? Number(team.grade) : undefined
          });
        }
      }
    });

    if (list.length > 0) {
      return list;
    }
  }

  // Fallback to name, studentName, or teamName
  const fallback = team.studentName || team.name || team.teamName;
  if (fallback && typeof fallback === 'string' && fallback.trim() !== '[object Object]') {
    const cleanFallback = fallback.replace(/\s*\([^)]*\)/g, '').trim();
    return [
      {
        name: cleanFallback || fallback.trim(),
        grade: team.grade ? Number(team.grade) : undefined
      }
    ];
  }

  return [{ name: 'Official Participant' }];
}

export function formatTeamStudentNames(team: any): string {
  const members = getNormalizedTeamMembers(team);
  if (members.length === 0) return 'Official Participant';
  return members.map((m) => m.name).join(', ');
}

// Utility functions for Judge Credentials and Passwords

const TITLE_PREFIXES = /^(dr|prof|eng|engr|mr|mrs|ms|miss|er|hon)\.?\s+/i;

/**
 * Extracts the first name of a judge from their full name,
 * stripping honorary titles like Dr., Prof., Eng., Mr., Ms., etc.
 * 
 * Example:
 * "Eng. Marcus Vance" -> "Marcus"
 * "Dr. Priya Sharma" -> "Priya"
 * "Ms. Fatima Al Zahra" -> "Fatima"
 * "Prof. Rajesh Khanna" -> "Rajesh"
 */
export function extractJudgeFirstName(fullName: string): string {
  if (!fullName) return 'Judge';
  // Strip common titles (e.g. "Eng. Marcus" -> "Marcus")
  const clean = fullName.trim().replace(TITLE_PREFIXES, '').trim();
  const parts = clean.split(/\s+/);
  const first = parts[0] || 'Judge';
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/**
 * Generates the standardized judge password formatted as:
 * <judgeId>-<firstname>
 * 
 * Example:
 * Judge ID "JDG-12" and Name "Eng. Marcus Vance" -> "JDG-12-Marcus"
 * Judge ID "JDG-01" and Name "Dr. Priya Sharma" -> "JDG-01-Priya"
 */
export function generateJudgePassword(judgeId?: string, fullName?: string): string {
  const cleanId = (judgeId || 'JDG-01').toUpperCase().trim();
  const firstName = extractJudgeFirstName(fullName || 'Judge');
  return `${cleanId}-${firstName}`;
}

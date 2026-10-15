import mongoose from 'mongoose';
import dns from 'dns';
import connectDB from './config/db.js';
import User from './models/User.js';
import Team from './models/Team.js';
import School from './models/School.js';
import Category from './models/Category.js';
import { Project } from './models/Project.js';
import { ScoringActivity } from './models/ScoringActivity.js';
import * as mockData from './mockData.bundled.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server override warning:', e.message);
}

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to MongoDB Atlas. Preparing to seed collections...');

    // 1. Clear existing collections
    await User.deleteMany({});
    await Team.deleteMany({});
    await School.deleteMany({});
    await Category.deleteMany({});
    await Project.deleteMany({});
    await ScoringActivity.deleteMany({});
    console.log('[Seed] Cleared existing User, Team, School, Category, Project, ScoringActivity data.');

    // 2. Seed Users
    const usersToInsert = [
      {
        id: 'usr-admin-01',
        name: 'Isravel Admin',
        email: 'isravel@gmail.com',
        password: '123456',
        role: 'admin',
        title: 'Head Administrator & Convener',
        organization: 'TechnoSchool Central Directorate',
        phone: '+971 56 510 4104',
        status: 'ACTIVE'
      },
      {
        id: 'usr-judge-01',
        judgeId: 'JDG-01',
        name: 'Official Competition Judge',
        email: 'judge@gmail.com',
        password: '123456',
        role: 'judge',
        title: 'Senior ICT & Robotics Juror',
        organization: 'TechnoSchool Judging Panel',
        specialization: 'Robotics, IoT & Digital Solutions',
        phone: '+971 50 840 9876',
        assignedCategories: [1, 2, 3, 4, 5, 6],
        assignedCategoryNames: [
          'Category 1: ICT Challenge',
          'Category 2: Coding Challenge',
          'Category 3: Creative Technology Challenge',
          'Category 4: Artificial Intelligence Challenge',
          'Category 5: Digital Solutions Challenge',
          'Category 6: Innovation Challenge'
        ],
        assignedHall: 'EIBFS Arena Hall A & B',
        assignedSlot: '09:00 AM - 02:00 PM',
        status: 'ACTIVE'
      }
    ];

    // Add additional mock judges
    if (mockData.MOCK_JUDGES && Array.isArray(mockData.MOCK_JUDGES)) {
      mockData.MOCK_JUDGES.forEach((j, index) => {
        // avoid duplicate email if already in usersToInsert
        if (j.email !== 'judge@gmail.com' && j.email !== 'isravel@gmail.com') {
          usersToInsert.push({
            id: j.id || `usr-judge-mock-${index + 2}`,
            judgeId: j.judgeId || `JDG-0${index + 2}`,
            name: j.name,
            email: j.email,
            password: '123456',
            role: 'judge',
            title: j.title || 'Official Juror',
            organization: j.organization || 'TechnoSchool Jurors Panel',
            specialization: j.specialization || 'STEM Education',
            phone: j.phone || '+971 50 123 4567',
            assignedCategories: j.assignedCategories || [1, 6],
            assignedCategoryNames: j.assignedCategoryNames || ['Category 1: ICT Challenge'],
            assignedProjects: j.assignedProjects || [],
            assignedHall: j.assignedHall || 'EIBFS Main Arena',
            assignedSlot: j.assignedSlot || '09:00 AM - 01:00 PM',
            assignedCount: j.assignedCount || 48,
            completedCount: j.completedCount || 35,
            pendingCount: j.pendingCount || 13,
            status: j.status || 'ACTIVE',
            lastActivity: j.lastActivity || 'Active'
          });
        }
      });
    }

    await User.insertMany(usersToInsert);
    console.log(`[Seed] Seeded ${usersToInsert.length} Users (including isravel@gmail.com and judge@gmail.com).`);

    // 3. Seed Schools
    if (mockData.MOCK_SCHOOLS && Array.isArray(mockData.MOCK_SCHOOLS)) {
      await School.insertMany(mockData.MOCK_SCHOOLS);
      console.log(`[Seed] Seeded ${mockData.MOCK_SCHOOLS.length} Schools.`);
    }

    // 4. Seed Categories and Projects
    if (mockData.MOCK_COMPETITIONS && Array.isArray(mockData.MOCK_COMPETITIONS)) {
      const categoriesToInsert = [];
      const projectsToInsert = [];

      mockData.MOCK_COMPETITIONS.forEach(comp => {
        const { projects, ...catData } = comp;
        categoriesToInsert.push(catData);
        if (projects && Array.isArray(projects)) {
          projects.forEach(p => {
            projectsToInsert.push(p);
          });
        }
      });

      await Category.insertMany(categoriesToInsert);
      console.log(`[Seed] Seeded ${categoriesToInsert.length} Categories.`);

      if (projectsToInsert.length > 0) {
        await Project.insertMany(projectsToInsert);
        console.log(`[Seed] Seeded ${projectsToInsert.length} Projects.`);
      }
    }

    // 5. Seed Teams / Participants
    if (mockData.INITIAL_PARTICIPANTS && Array.isArray(mockData.INITIAL_PARTICIPANTS)) {
      const teamsToInsert = mockData.INITIAL_PARTICIPANTS.map((part, idx) => {
        const teamId = part.teamId || `TTF26-TEAM-${String(idx + 1).padStart(3, '0')}`;
        return {
          id: part.id || `part-${idx + 1}`,
          teamId: teamId,
          participantId: part.participantId || `TTF-2026-${String(idx + 100).padStart(5, '0')}`,
          name: part.name,
          gender: part.gender || 'Male',
          grade: part.grade || 8,
          teamName: part.teamName || part.name,
          teamSize: part.teamSize || 3,
          teamMembers: part.teamMembers || [],
          isGroupProject: part.isGroupProject !== undefined ? part.isGroupProject : true,
          schoolId: part.schoolId || 'sch-01',
          schoolName: part.schoolName,
          city: part.city || 'Dubai',
          categoryNumber: part.categoryNumber || 1,
          categoryName: part.categoryName,
          competitionId: part.competitionId || `cat-${part.categoryNumber || 1}`,
          competitionName: part.competitionName || `Category ${part.categoryNumber}: ${part.categoryName}`,
          projectNumber: part.projectNumber || 1,
          projectTitle: part.projectTitle,
          selectedProjectTitle: part.selectedProjectTitle || part.projectTitle,
          projectSummary: part.projectSummary || '',
          softwareUsed: part.softwareUsed || '',
          filesSubmitted: part.filesSubmitted || [],
          isGrandFinalist: part.isGrandFinalist !== undefined ? part.isGrandFinalist : true,
          stage: part.stage || 'STAGE_2_FINALE',
          assignedJudgeId: part.assignedJudgeId || 'JDG-01',
          assignedJudgeName: part.assignedJudgeName || 'Official Competition Judge',
          email: part.email || '',
          phone: part.phone || '',
          photo: part.photo || '',
          status: part.status || 'PENDING',
          criterionScores: part.criterionScores || {
            'crit-tech': null,
            'crit-innov': null,
            'crit-design': null,
            'crit-demo': null,
            'crit-doc': null
          },
          finalScore: part.finalScore || 0,
          percentage: part.percentage || 0,
          rank: part.rank || null,
          award: part.award || null,
          judgeRemarks: part.judgeRemarks || '',
          evaluatedByJudgeId: part.evaluatedByJudgeId || null,
          evaluatedByJudgeName: part.evaluatedByJudgeName || null,
          submissionTimestamp: part.submissionTimestamp || null
        };
      });

      await Team.insertMany(teamsToInsert);
      console.log(`[Seed] Seeded ${teamsToInsert.length} Teams / Participants with full rubric & scoring data.`);
    }

    // 6. Seed Scoring Activities
    if (mockData.INITIAL_SCORING_ACTIVITIES && Array.isArray(mockData.INITIAL_SCORING_ACTIVITIES)) {
      await ScoringActivity.insertMany(mockData.INITIAL_SCORING_ACTIVITIES);
      console.log(`[Seed] Seeded ${mockData.INITIAL_SCORING_ACTIVITIES.length} Scoring Activities.`);
    }

    console.log('\n=============================================');
    console.log('✅ ATLAS MONGODB SEEDING COMPLETED SUCCESSFULLY');
    console.log('Credentials:');
    console.log('  Admin: isravel@gmail.com / 123456');
    console.log('  Judge: judge@gmail.com / 123456');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
};

seedDatabase();

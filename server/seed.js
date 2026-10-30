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

const TITLE_PREFIXES = /^(dr|prof|eng|engr|mr|mrs|ms|miss|er|hon)\.?\s+/i;

function extractJudgeFirstName(fullName) {
  if (!fullName) return 'Judge';
  const clean = fullName.trim().replace(TITLE_PREFIXES, '').trim();
  const parts = clean.split(/\s+/);
  const first = parts[0] || 'Judge';
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function generateJudgePassword(judgeId, fullName) {
  const cleanId = (judgeId || 'JDG-01').toUpperCase().trim();
  const firstName = extractJudgeFirstName(fullName);
  return `${cleanId}-${firstName}`;
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
        id: 'usr-admin-02',
        name: 'Techno Admin',
        email: 'admin@technoschool.edu',
        password: 'admin@1234',
        role: 'admin',
        title: 'Central System Administrator',
        organization: 'TechnoSchool Central Directorate',
        phone: '+971 50 123 4567',
        status: 'ACTIVE'
      },
      {
        id: 'usr-judge-01',
        judgeId: 'JDG-01',
        name: 'Official Competition Judge',
        email: 'judge@gmail.com',
        password: 'JDG-01-Official',
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

    await User.insertMany(usersToInsert);
    console.log(`[Seed] Seeded ${usersToInsert.length} Users (including isravel@gmail.com, admin@technoschool.edu, and single judge judge@gmail.com).`);

    // 3. Schools: Left clean for fresh live school registrations
    console.log('[Seed] Schools collection cleared and left clean for live institutional registrations.');

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

    // 5. Teams / Participants: Left clean for fresh production entries
    console.log('[Seed] Teams / Participants collection cleared and left clean for live competition entries.');

    // 6. Scoring Activities: Left clean for live scoring events
    console.log('[Seed] Scoring Activities cleared and left clean for live events.');

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

import { CompetitionProject } from '../types';

export const OFFICIAL_24_PROJECTS: CompetitionProject[] = [
  // --- Category 1: ICT Challenge (Grades 1 & 2) ---
  {
    id: 'c1-p1',
    projectNumber: 1,
    title: 'I Connect',
    categoryNumber: 1,
    categoryName: 'ICT Challenge',
    gradeEligibility: 'Grades 1 & 2',
    objective: 'Identify an Internet-connected computer device and recreate its diagram with functional description.',
    specification: 'Look around and choose one device connected to the internet. Recreate it in drawing software and document its function.',
    softwareOrTools: ['MS Paint', 'Tux Paint', 'Canva', 'Google Slides', 'Google Docs', 'MS Word'],
    tasks: ['Choose one device connected to internet', 'Recreate device in drawing software', 'Save drawing as JPG/PNG', 'Insert into Docs/Slides and type brief description'],
    submissionRequirements: ['Digital Drawing softcopy (JPG/PNG)', 'Word/Slide document with functional description']
  },
  {
    id: 'c1-p2',
    projectNumber: 2,
    title: 'Devising',
    categoryNumber: 1,
    categoryName: 'ICT Challenge',
    gradeEligibility: 'Grades 1 & 2',
    objective: 'Categorize and illustrate two computing devices into Input, Output, Processing, or Storage.',
    specification: 'Choose any two computing devices, draw them accurately using digital tools, and document their specific functions.',
    softwareOrTools: ['MS Paint', 'Tux Paint', 'Canva', 'Google Slides', 'MS Word'],
    tasks: ['Choose two computing devices', 'Draw devices in drawing software', 'Save image files', 'Type brief description of each device'],
    submissionRequirements: ['Drawing softcopy', 'Document containing written descriptions']
  },
  {
    id: 'c1-p3',
    projectNumber: 3,
    title: 'Apart',
    categoryNumber: 1,
    categoryName: 'ICT Challenge',
    gradeEligibility: 'Grades 1 & 2',
    objective: 'Compare and describe personal computing devices and computer parts.',
    specification: 'Choose any one part of a computer, recreate the object digitally, and explain its essential role in the computer system.',
    softwareOrTools: ['MS Paint', 'Tux Paint', 'Canva', 'Google Slides', 'Google Docs'],
    tasks: ['Choose one computer part', 'Recreate using drawing software', 'Save image file', 'Document what the part does'],
    submissionRequirements: ['Component artwork', 'Written summary document']
  },
  {
    id: 'c1-p4',
    projectNumber: 4,
    title: 'Sketch',
    categoryNumber: 1,
    categoryName: 'ICT Challenge',
    gradeEligibility: 'Grades 1 & 2',
    objective: 'Illustrate future smart city/school vehicles with digital brushes and color palettes.',
    specification: 'Select any two modern/future vehicles, illustrate them with digital drawing tools, and write a short explanatory paragraph.',
    softwareOrTools: ['MS Paint', 'Tux Paint', 'Canva', 'Google Slides', 'MS Word'],
    tasks: ['Choose two vehicles', 'Draw vehicles using digital tools', 'Save drawing', 'Type short paragraph about vehicles'],
    submissionRequirements: ['Vehicle illustration file', 'Word/Docs softcopy']
  },

  // --- Category 2: Coding Challenge (Grades 3 & 4) ---
  {
    id: 'c2-p1',
    projectNumber: 1,
    title: 'El Nino',
    categoryNumber: 2,
    categoryName: 'Coding Challenge',
    gradeEligibility: 'Grades 3 & 4',
    objective: 'Program an interactive temperature converter in Python.',
    specification: 'Code a program in Python (Thonny) that takes temperature in Celsius and converts it into Fahrenheit or Kelvin with output verification.',
    softwareOrTools: ['Python / Thonny', 'Google Docs', 'MS Word'],
    tasks: ['Write Python temperature converter', 'Handle Celsius to Fahrenheit/Kelvin', 'Format user options', 'Submit code and worked output screenshot'],
    submissionRequirements: ['Python source code (.py)', 'Worked output screenshots in doc']
  },
  {
    id: 'c2-p2',
    projectNumber: 2,
    title: 'Football Zone',
    categoryNumber: 2,
    categoryName: 'Coding Challenge',
    gradeEligibility: 'Grades 3 & 4',
    objective: 'Create an animated 30-second minimum interactive football simulation in Scratch 3.0.',
    specification: 'Recreate FIFA World Cup 2026 finals with sprite physics, goalkeeper blocking / striker scoring, flags, and jersey colors.',
    softwareOrTools: ['Scratch 3.0'],
    tasks: ['Design football pitch background', 'Code striker & goalkeeper sprites', 'Animate penalty shot mechanics', 'Include flags & team jerseys'],
    submissionRequirements: ['Scratch project file (.sb3)']
  },
  {
    id: 'c2-p3',
    projectNumber: 3,
    title: 'Zero Plastic',
    categoryNumber: 2,
    categoryName: 'Coding Challenge',
    gradeEligibility: 'Grades 3 & 4',
    objective: 'Design a digital collage on plastic alternatives in schools and classrooms.',
    specification: 'Create an attractive digital collage advocating alternatives to single-use plastics using creative clip-art, masking effects, and frames.',
    softwareOrTools: ['Canva', 'Photoshop', 'GIMP', 'Tux Paint', 'PowerPoint'],
    tasks: ['Identify plastic alternatives', 'Assemble collage in graphics software', 'Apply masking & borders', 'Export high-res graphic'],
    submissionRequirements: ['Source graphic file and exported image']
  },
  {
    id: 'c2-p4',
    projectNumber: 4,
    title: '(A)mazing',
    categoryNumber: 2,
    categoryName: 'Coding Challenge',
    gradeEligibility: 'Grades 3 & 4',
    objective: 'Design a maze map in RoboMind shaped as "TECHNO" and program autonomous navigation.',
    specification: 'Create a maze map spelling "TECHNO" from "T" to "O" and script autonomous robot navigation to solve it.',
    softwareOrTools: ['RoboMind'],
    tasks: ['Design TECHNO maze map', 'Set start at T and finish at O', 'Write autonomous navigation script', 'Test pathfinding loop'],
    submissionRequirements: ['Working RoboMind script and .map file']
  },

  // --- Category 3: Creative Technology Challenge (Grades 5 & 6) ---
  {
    id: 'c3-p1',
    projectNumber: 1,
    title: 'Cape',
    categoryNumber: 3,
    categoryName: 'Creative Technology Challenge',
    gradeEligibility: 'Grades 5 & 6',
    objective: 'Recreate a superhero as pixel art inside Microsoft Excel.',
    specification: 'Source an HD reference picture of a superhero and recreate it entirely as pixel art inside MS Excel using conditional formatting and cell colors.',
    softwareOrTools: ['MS Excel'],
    tasks: ['Select superhero HD reference', 'Map pixel grid in Excel', 'Apply cell formatting colors', 'Submit reference and .xlsx file'],
    submissionRequirements: ['Reference image', 'Excel pixel art file (.xlsx)']
  },
  {
    id: 'c3-p2',
    projectNumber: 2,
    title: 'Pop Out',
    categoryNumber: 3,
    categoryName: 'Creative Technology Challenge',
    gradeEligibility: 'Grades 5 & 6',
    objective: 'Create an eye-catching 3D pop-out perspective photo manipulation in Photoshop / GIMP.',
    specification: 'Transform a 2D photo of an athlete, animal, or vehicle so it appears to break out of a physical frame or phone screen.',
    softwareOrTools: ['Photoshop', 'GIMP'],
    tasks: ['Select high-res subject photo', 'Create 3D perspective frame', 'Mask and extract pop-out layers', 'Export high-res illusion image'],
    submissionRequirements: ['Final 3D image (JPEG/PNG)', 'Working layered file (.psd/.xcf)']
  },
  {
    id: 'c3-p3',
    projectNumber: 3,
    title: 'Micro City',
    categoryNumber: 3,
    categoryName: 'Creative Technology Challenge',
    gradeEligibility: 'Grades 5 & 6',
    objective: 'Design a 3D architectural sustainable city block.',
    specification: 'Design and build a 3D city block model featuring green buildings, solar rooftops, and urban infrastructure in 3D modeling tools.',
    softwareOrTools: ['Tinkercad', 'SketchUp', 'Blender', 'LEGO Digital Designer'],
    tasks: ['Plan city block layout', 'Model buildings & transit in 3D', 'Add eco-features (solar, trees)', 'Export 3D model & renders'],
    submissionRequirements: ['3D project file', 'Rendered images']
  },
  {
    id: 'c3-p4',
    projectNumber: 4,
    title: 'AI and Health',
    categoryNumber: 3,
    categoryName: 'Creative Technology Challenge',
    gradeEligibility: 'Grades 5 & 6',
    objective: 'Draft policies and build a Blog/Vlog on AI in Digital Mental Health.',
    specification: 'Research AI incorporation in youth mental well-being, draft 3 responsible policies, and develop a multimedia Blog or Vlog.',
    softwareOrTools: ['HTML/CSS', 'FrontPage', 'Web Form Builder Lite'],
    tasks: ['Research AI in mental health', 'Draft 3 responsible usage policies', 'Build web blog/vlog in HTML/CSS', 'Document findings'],
    submissionRequirements: ['Web files / blog source', 'Written policy document']
  },

  // --- Category 4: Artificial Intelligence Challenge (Grades 7 & 8) ---
  {
    id: 'c4-p1',
    projectNumber: 1,
    title: 'Will do it today',
    categoryNumber: 4,
    categoryName: 'Artificial Intelligence Challenge',
    gradeEligibility: 'Grades 7 & 8',
    objective: 'Code a digital To-Do list application with exact 8-inch width constraint.',
    specification: 'Develop a task manager in VB, Python, or browser JavaScript with task addition, strike-through completion, and deletion mechanics.',
    softwareOrTools: ['Visual Basic', 'Python', 'JavaScript'],
    tasks: ['Set strict 8-inch layout width', 'Implement task input & storage', 'Code strike-through & delete logic', 'Export working build'],
    submissionRequirements: ['Source code file', 'Exported executable / web app']
  },
  {
    id: 'c4-p2',
    projectNumber: 2,
    title: 'Run Boy Run',
    categoryNumber: 4,
    categoryName: 'Artificial Intelligence Challenge',
    gradeEligibility: 'Grades 7 & 8',
    objective: 'Build a complete 2D arcade physics platformer in Scratch 3.0.',
    specification: 'Program a hero navigating blocks, pipes, and traps; jumping on enemies; collecting mushrooms to grow; complete game loop.',
    softwareOrTools: ['Scratch 3.0'],
    tasks: ['Code player gravity & jump physics', 'Design enemy collision boxes', 'Create level obstacles & power-ups', 'Implement complete game over/win state'],
    submissionRequirements: ['Full Scratch project (.sb3)']
  },
  {
    id: 'c4-p3',
    projectNumber: 3,
    title: 'My Vote',
    categoryNumber: 4,
    categoryName: 'Artificial Intelligence Challenge',
    gradeEligibility: 'Grades 7 & 8',
    objective: 'Develop an interactive real-time classroom web voting application in PHP / HTML5.',
    specification: 'Create a digital voting system replacing paper ballots with browser vote casting, live graphical tallies, and duplicate prevention.',
    softwareOrTools: ['PHP', 'HTML5', 'CSS3', 'JavaScript'],
    tasks: ['Build responsive voting frontend', 'Code backend vote aggregation', 'Prevent duplicate casting', 'Render instant visual chart'],
    submissionRequirements: ['PHP/HTML5 source files', 'Live web deployment package']
  },
  {
    id: 'c4-p4',
    projectNumber: 4,
    title: 'Banking',
    categoryNumber: 4,
    categoryName: 'Artificial Intelligence Challenge',
    gradeEligibility: 'Grades 7 & 8',
    objective: 'Develop a C++ Mini Bank Account / ATM Simulator console application.',
    specification: 'Code an ATM engine initializing account balance, PIN verification, deposits, withdrawals, balance checks, and transaction logs.',
    softwareOrTools: ['C++', 'Python'],
    tasks: ['Initialize secure mock account', 'Implement terminal menu logic', 'Code deposit & withdrawal with checks', 'Maintain real-time balance ledger'],
    submissionRequirements: ['C++ source code (.cpp)', 'Console demo output log']
  },

  // --- Category 5: Digital Solutions Challenge (Grades 9 & 10) ---
  {
    id: 'c5-p1',
    projectNumber: 1,
    title: 'Smart City Connect',
    categoryNumber: 5,
    categoryName: 'Digital Solutions Challenge',
    gradeEligibility: 'Grades 9 & 10',
    objective: 'Develop a multi-screen mobile app solving modern urban city challenges.',
    specification: 'Build a mobile app for transport assistance, municipal service reporting, GPS emergency beacon, and community notices with clear UI.',
    softwareOrTools: ['Flutter', 'React Native', 'Firebase'],
    tasks: ['Identify urban civic challenge', 'Design multi-screen UI/UX workflow', 'Implement interactive maps & reporting', 'Prepare problem-solution deck'],
    submissionRequirements: ['Source code repository', 'Working mobile app build (APK)', 'Presentation deck']
  },
  {
    id: 'c5-p2',
    projectNumber: 2,
    title: 'Health & Wellness Tracker',
    categoryNumber: 5,
    categoryName: 'Digital Solutions Challenge',
    gradeEligibility: 'Grades 9 & 10',
    objective: 'Develop a comprehensive health tracking and biometric dashboard mobile application.',
    specification: 'Track sleep, hydration, exercise, and screen-time with charts, progress indicators, goal achievements, and secure data storage.',
    softwareOrTools: ['Flutter', 'React Native', 'SQLite / Cloud DB'],
    tasks: ['Design daily activity tracker', 'Implement biometric charting', 'Code goal achievement milestone logic', 'Test user scenarios'],
    submissionRequirements: ['Mobile app source', 'Working application', 'Documentation']
  },
  {
    id: 'c5-p3',
    projectNumber: 3,
    title: 'AI-Powered Waste Sorting',
    categoryNumber: 5,
    categoryName: 'Digital Solutions Challenge',
    gradeEligibility: 'Grades 9 & 10',
    objective: 'Train and deploy an AI computer vision classifier identifying waste categories.',
    specification: 'Develop dataset for plastic, paper, metal, glass, and organic waste; train model; test on unseen objects; display confidence scores.',
    softwareOrTools: ['Python OpenCV', 'TensorFlow Lite', 'Keras'],
    tasks: ['Curate diverse waste image dataset', 'Train classification model', 'Benchmark accuracy on unseen items', 'Propose automated bin integration'],
    submissionRequirements: ['Trained AI model file', 'Test accuracy logs', 'Demonstration video']
  },
  {
    id: 'c5-p4',
    projectNumber: 4,
    title: 'AI Learning Assistant',
    categoryNumber: 5,
    categoryName: 'Digital Solutions Challenge',
    gradeEligibility: 'Grades 9 & 10',
    objective: 'Develop an AI-powered personalized educational tutor for STEM subjects.',
    specification: 'Build an educational chatbot answering student questions, generating customized quizzes, and incorporating responsible AI safety safeguards.',
    softwareOrTools: ['Python', 'FastAPI', 'AI SDKs', 'Streamlit / React'],
    tasks: ['Select subject domain', 'Implement question answering & quiz engine', 'Add safety & reliability guardrails', 'Evaluate accuracy metrics'],
    submissionRequirements: ['AI tutor code repository', 'Testing report', 'Live demo']
  },

  // --- Category 6: Innovation Challenge (Grades 11 & 12) ---
  {
    id: 'c6-p1',
    projectNumber: 1,
    title: 'Autonomous Search & Rescue Robot',
    categoryNumber: 6,
    categoryName: 'Innovation Challenge',
    gradeEligibility: 'Grades 11 & 12',
    objective: 'Design and build an autonomous terrain robot capable of simulated rescue missions.',
    specification: 'Construct robot with sensors for obstacle detection, thermal vision, target identification, autonomous navigation, and emergency payload deployment.',
    softwareOrTools: ['Arduino / ESP32', 'Thermal Sensors', 'LiDAR', 'LoRa', '3D CAD'],
    tasks: ['Fabricate robot chassis & locomotion', 'Integrate obstacle & thermal sensors', 'Program autonomous mission loop', 'Optimize speed & reliability'],
    submissionRequirements: ['Working robot prototype', 'Program code (.ino/.py)', 'Design CAD drawings', 'Live demo']
  },
  {
    id: 'c6-p2',
    projectNumber: 2,
    title: 'Autonomous Delivery Robot',
    categoryNumber: 6,
    categoryName: 'Innovation Challenge',
    gradeEligibility: 'Grades 11 & 12',
    objective: 'Design and build an autonomous robot transporting cargo between checkpoints.',
    specification: 'Construct autonomous transport rover with line tracking, obstacle avoidance, motorized payload bay release, and RFID authorization.',
    softwareOrTools: ['Raspberry Pi / Arduino', 'Optical sensors', 'RFID', 'Motor drivers'],
    tasks: ['Build multi-destination rover', 'Program pathfinding & obstacle avoidance', 'Implement motorized drop-off mechanism', 'Stress-test reliability'],
    submissionRequirements: ['Working robot prototype', 'Source code', 'Technical documentation']
  },
  {
    id: 'c6-p3',
    projectNumber: 3,
    title: 'Smart Energy Management',
    categoryNumber: 6,
    categoryName: 'Innovation Challenge',
    gradeEligibility: 'Grades 11 & 12',
    objective: 'Develop an intelligent IoT system reducing energy consumption in buildings.',
    specification: 'Monitor occupancy, ambient lighting, and temperature to automatically throttle HVAC/lighting loads and record pre/post energy savings data.',
    softwareOrTools: ['ESP32', 'IoT Sensors', 'Cloud Dashboard', 'Data Analytics'],
    tasks: ['Deploy multi-sensor monitoring grid', 'Code automated power load switching', 'Record baseline vs optimized energy data', 'Analyze savings ROI'],
    submissionRequirements: ['Working IoT hardware prototype', 'Source code', 'Energy analytics report']
  },
  {
    id: 'c6-p4',
    projectNumber: 4,
    title: 'Smart City Solution',
    categoryNumber: 6,
    categoryName: 'Innovation Challenge',
    gradeEligibility: 'Grades 11 & 12',
    objective: 'Design and develop a technology-based solution for Dubai urban infrastructure.',
    specification: 'Develop prototype resolving traffic congestion, smart-pole solar lighting, emergency priority routing, or air quality telemetry.',
    softwareOrTools: ['IoT', 'AI / OpenCV', 'Embedded Microcontrollers', 'Cloud API'],
    tasks: ['Research Dubai urban challenge', 'Build functional hardware/software prototype', 'Conduct realistic scenario testing', 'Propose scaling architecture'],
    submissionRequirements: ['Functional prototype', 'Technical documentation', 'Testing results deck']
  }
];

export const PROJECTS_BY_CATEGORY: Record<number, CompetitionProject[]> = {
  1: OFFICIAL_24_PROJECTS.filter((p) => p.categoryNumber === 1),
  2: OFFICIAL_24_PROJECTS.filter((p) => p.categoryNumber === 2),
  3: OFFICIAL_24_PROJECTS.filter((p) => p.categoryNumber === 3),
  4: OFFICIAL_24_PROJECTS.filter((p) => p.categoryNumber === 4),
  5: OFFICIAL_24_PROJECTS.filter((p) => p.categoryNumber === 5),
  6: OFFICIAL_24_PROJECTS.filter((p) => p.categoryNumber === 6)
};

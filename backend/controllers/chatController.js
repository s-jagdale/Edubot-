// controllers/chatController.js
// EduBot — MIT Academy of Engineering, Pune | SPPU SE

const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ============================================================
// SYSTEM PROMPT
// ============================================================
const BASE_SYSTEM_PROMPT = `You are EduBot, an intelligent educational assistant for MIT Academy of Engineering (MIT AOE), Alandi(D), Pune — affiliated to Savitribai Phule Pune University (SPPU). You help B.Tech Software Engineering students.

RESPONSE RULES:
- Always respond in clear readable markdown (use **bold**, bullet points, numbered lists)
- Be concise, accurate, and student-friendly
- For subject/topic queries: give overview, key topics, tools used, exam tips
- For concept queries: definition → key points → example → real-world use
- For semester queries: list all subjects with one-line descriptions
- Always relate answers to SPPU SE curriculum (FY/SY/TY/BE)
- Only answer study-related questions relevant to MIT AOE / SPPU SE academic topics
- If the user asks anything outside SPPU SE studies, politely refuse and redirect to academics
- Example refusal: "I am EduBot for MIT AOE SPPU SE studies only. Please ask a study-related question."
- Do not answer personal advice, entertainment, politics, health, or unrelated general chat
- NEVER respond in raw JSON format

SPPU SE CURRICULUM:
FY Sem1: Engg Maths-I, Physics, Chemistry, Basic Electrical, Mechanics, Graphics, Workshop
FY Sem2: Engg Maths-II, C Programming (PPS), Basic Electronics, Communication Skills, EVS
SY Sem3: Maths-III (M3), Data Structures, DECO, OOP Java, DBMS, Discrete Maths
SY Sem4: Maths-IV (M4), Computer Networks, Operating Systems, TOC, Software Engineering, Web Technology
TY Sem5: Machine Learning, STQA, DAA, IoT, Mini Project
TY Sem6: Artificial Intelligence, Information Security, Cloud Computing, Project-I
BE Sem7: Deep Learning, Big Data Analytics, Elective, Project-II
BE Sem8: Industry Internship, Project Viva, Seminar, MOOCs

TOOLS BY YEAR: FY: GCC, AutoCAD, MATLAB | SY: Java/IntelliJ, MySQL, Linux, Node.js, VS Code, GitHub, Cisco Packet Tracer | TY: Python/Jupyter, Scikit-learn, Docker, AWS, Selenium, JIRA, Arduino | BE: TensorFlow/PyTorch, PySpark, MongoDB, Kafka, Tableau`;

// ============================================================
// FETCH CONTEXT FROM MYSQL
// ============================================================
async function fetchContext(userMessage) {
  const msg = userMessage.toLowerCase();
  let context = '';
  try {
    const [subjects] = await db.execute(
      `SELECT subject_name, short_name, overview, key_topics, tools_used
       FROM subjects
       WHERE LOWER(subject_name) LIKE ? OR LOWER(short_name) LIKE ? OR LOWER(key_topics) LIKE ?
       LIMIT 4`,
      [`%${msg}%`, `%${msg}%`, `%${msg}%`]
    );
    if (subjects.length > 0) {
      context += '\n\n--- SUBJECTS FROM DATABASE ---\n';
      subjects.forEach(s => {
        context += `\n${s.subject_name}${s.short_name ? ' (' + s.short_name + ')' : ''}: ${s.overview}`;
        if (s.key_topics) context += `\nTopics: ${s.key_topics}`;
        if (s.tools_used) context += `\nTools: ${s.tools_used}`;
        context += '\n';
      });
    }
    const [tools] = await db.execute(
      `SELECT tool_name, category, overview, pros, cons, official_url
       FROM tools WHERE LOWER(tool_name) LIKE ? OR LOWER(use_cases) LIKE ? LIMIT 2`,
      [`%${msg}%`, `%${msg}%`]
    );
    if (tools.length > 0) {
      context += '\n--- TOOLS FROM DATABASE ---\n';
      tools.forEach(t => {
        context += `\n${t.tool_name} (${t.category}): ${t.overview}`;
        if (t.pros) context += `\nPros: ${t.pros}`;
        if (t.official_url) context += `\nURL: ${t.official_url}`;
        context += '\n';
      });
    }
    let semNum = null;
    const semPatterns = [
      { re: /fy\s*sem(?:ester)?\s*1|sem(?:ester)?\s*1\b/, num: 1 },
      { re: /fy\s*sem(?:ester)?\s*2|sem(?:ester)?\s*2\b/, num: 2 },
      { re: /sy\s*sem(?:ester)?\s*3|sem(?:ester)?\s*3\b/, num: 3 },
      { re: /sy\s*sem(?:ester)?\s*4|sem(?:ester)?\s*4\b/, num: 4 },
      { re: /ty\s*sem(?:ester)?\s*5|sem(?:ester)?\s*5\b/, num: 5 },
      { re: /ty\s*sem(?:ester)?\s*6|sem(?:ester)?\s*6\b/, num: 6 },
      { re: /be\s*sem(?:ester)?\s*7|sem(?:ester)?\s*7\b/, num: 7 },
      { re: /be\s*sem(?:ester)?\s*8|sem(?:ester)?\s*8\b/, num: 8 },
    ];
    for (const p of semPatterns) {
      if (p.re.test(msg)) { semNum = p.num; break; }
    }
    if (semNum) {
      const [allSubs] = await db.execute(
        `SELECT s.subject_name, s.short_name, s.credits, s.subject_type, s.difficulty_level, sem.sem_label
         FROM subjects s JOIN semesters sem ON s.semester_id = sem.id
         WHERE sem.sem_number = ? ORDER BY s.id`,
        [semNum]
      );
      if (allSubs.length > 0) {
        context += `\n--- ALL SUBJECTS: ${allSubs[0].sem_label} ---\n`;
        allSubs.forEach((s, i) => {
          context += `${i + 1}. ${s.subject_name}${s.short_name ? ' (' + s.short_name + ')' : ''} — ${s.credits} credits — ${s.subject_type} — ${s.difficulty_level}\n`;
        });
      }
    }
  } catch (err) {
    console.error('Context fetch error:', err.message);
  }
  return context;
}

// ============================================================
// MAIN: Process chat message
// ============================================================
async function processChat(req, res) {
  const startTime = Date.now();
  const { message, session_id, history = [] } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }
  const sessionId = session_id || uuidv4();
  try {
    const dbContext = await fetchContext(message);
    const systemPrompt = BASE_SYSTEM_PROMPT + dbContext;
    const messages = [];
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-10).forEach(turn => {
        if (turn.role && turn.content) messages.push({ role: turn.role, content: String(turn.content) });
      });
    }
    messages.push({ role: 'user', content: message });
    if (!process.env.GROQ_API_KEY) {
      return res.json({ reply: '⚠️ GROQ_API_KEY not set. Please add it to your .env file.', session_id: sessionId });
    }
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    });
    const botReply = completion.choices?.[0]?.message?.content || 'Sorry, no response generated. Please try again.';
    const responseTime = Date.now() - startTime;
    try {
      await db.execute(
        `INSERT INTO chat_logs (session_id, user_message, bot_response, response_time_ms) VALUES (?, ?, ?, ?)`,
        [sessionId, message, botReply, responseTime]
      );
    } catch (e) { /* non-fatal */ }
    res.json({ reply: botReply, session_id: sessionId, response_time_ms: responseTime });
  } catch (err) {
    console.error('Chat error:', err.message);
    if (err.status === 401) return res.status(401).json({ error: 'Invalid GROQ API key.' });
    if (err.status === 429) return res.status(429).json({ error: 'Rate limit hit. Please wait a moment.' });
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}

// ============================================================
// QUIZ GENERATOR
// ============================================================
async function generateQuiz(req, res) {
  const { topic, count = 5 } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });
  const numQ = Math.min(Math.max(parseInt(count) || 5, 1), 10);
  const prompt = `Generate exactly ${numQ} multiple choice questions about "${topic}" for SPPU Software Engineering students.

Return ONLY this JSON, no extra text, no markdown fences:
{
  "topic": "${topic}",
  "questions": [
    {
      "q": "Question?",
      "options": ["A) option", "B) option", "C) option", "D) option"],
      "answer": "A",
      "explanation": "Why A is correct."
    }
  ]
}`;
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'API key not configured' });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 2000,
      temperature: 0.4,
      messages: [
        { role: 'system', content: 'You are a quiz generator. Return only valid JSON. No markdown, no explanation outside JSON.' },
        { role: 'user', content: prompt }
      ],
    });
    let raw = (completion.choices?.[0]?.message?.content || '{}')
      .replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const quiz = JSON.parse(raw);
    res.json({ quiz });
  } catch (err) {
    console.error('Quiz error:', err.message);
    res.status(500).json({ error: 'Failed to generate quiz. Please try again.' });
  }
}

// ============================================================
// PERSONALIZED STUDY PLAN GENERATOR
// ============================================================
async function generateStudyPlan(req, res) {
  const { year, semester, weakSubjects, examDate, hoursPerDay, goals } = req.body;

  if (!year || !semester || !examDate || !hoursPerDay) {
    return res.status(400).json({ error: 'Year, semester, exam date, and hours per day are required.' });
  }

  // Calculate days until exam
  const today = new Date();
  const exam = new Date(examDate);
  const daysLeft = Math.max(1, Math.ceil((exam - today) / (1000 * 60 * 60 * 24)));

  const weakList = weakSubjects && weakSubjects.length > 0
    ? weakSubjects.join(', ')
    : 'No specific weak subjects mentioned';

  const goalsText = goals ? `Student goals: ${goals}` : '';

  const SPPU_SUBJECTS = {
    'FY-Sem1': ['Engineering Maths-I', 'Engineering Physics', 'Engineering Chemistry', 'Basic Electrical Engineering', 'Engineering Mechanics', 'Engineering Graphics', 'Workshop Practice'],
    'FY-Sem2': ['Engineering Maths-II', 'C Programming (PPS)', 'Basic Electronics', 'Communication Skills', 'Environmental Studies'],
    'SY-Sem3': ['Engineering Maths-III (M3)', 'Data Structures', 'Digital Electronics & CO (DECO)', 'OOP using Java', 'Database Management Systems (DBMS)', 'Discrete Mathematics'],
    'SY-Sem4': ['Engineering Maths-IV (M4)', 'Computer Networks', 'Operating Systems', 'Theory of Computation (TOC)', 'Software Engineering', 'Web Technology'],
    'TY-Sem5': ['Machine Learning', 'Software Testing & QA (STQA)', 'Design & Analysis of Algorithms (DAA)', 'Internet of Things (IoT)', 'Mini Project'],
    'TY-Sem6': ['Artificial Intelligence', 'Information Security', 'Cloud Computing', 'Elective-II', 'Project-I'],
    'BE-Sem7': ['Deep Learning', 'Big Data Analytics', 'Elective-III', 'Project-II'],
    'BE-Sem8': ['Industry Internship', 'Project Viva', 'Technical Seminar', 'MOOCs/Certifications'],
  };

  const semKey = `${year}-${semester}`;
  const subjects = SPPU_SUBJECTS[semKey] || [];
  const subjectList = subjects.length > 0 ? subjects.join(', ') : 'subjects for this semester';

  const prompt = `Create a detailed personalized study plan for an SPPU B.Tech Software Engineering student at MIT Academy of Engineering, Pune.

STUDENT DETAILS:
- Year: ${year} | Semester: ${semester}
- Exam date: ${examDate} (${daysLeft} days from today)
- Available study hours per day: ${hoursPerDay} hours
- Subjects this semester: ${subjectList}
- Weak subjects (need extra focus): ${weakList}
- ${goalsText}

Return ONLY this JSON structure, no extra text, no markdown fences:
{
  "summary": {
    "totalDays": ${daysLeft},
    "hoursPerDay": ${hoursPerDay},
    "totalHours": ${daysLeft * parseFloat(hoursPerDay)},
    "strategy": "2-3 sentence overview of the study strategy"
  },
  "phases": [
    {
      "name": "Phase name (e.g. Foundation Building)",
      "duration": "X days",
      "startDay": 1,
      "endDay": 10,
      "focus": "What to focus on in this phase",
      "subjects": ["subject1", "subject2"],
      "dailyTasks": ["Task 1", "Task 2", "Task 3"]
    }
  ],
  "weeklySchedule": {
    "Monday": ["Subject/task - X hours", "Subject/task - Y hours"],
    "Tuesday": ["Subject/task - X hours"],
    "Wednesday": ["Subject/task - X hours"],
    "Thursday": ["Subject/task - X hours"],
    "Friday": ["Subject/task - X hours"],
    "Saturday": ["Subject/task - X hours", "Revision - X hours"],
    "Sunday": ["Light revision - X hours", "Rest and practice papers"]
  },
  "subjectPriority": [
    {
      "subject": "Subject name",
      "priority": "High/Medium/Low",
      "hoursAllocated": 10,
      "reason": "Why this priority",
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "importantTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
  "lastWeekPlan": ["Day 1: Full revision of weak topics", "Day 2: Mock tests", "Day 3: Previous year papers"]
}

Make the plan realistic for ${daysLeft} days with ${hoursPerDay} hours/day. Give extra focus to weak subjects: ${weakList}. Include SPPU exam-specific tips.`;

  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'API key not configured' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 3000,
      temperature: 0.5,
      messages: [
        { role: 'system', content: 'You are an expert academic planner for SPPU engineering students. Return only valid JSON. No markdown fences, no extra text outside the JSON object.' },
        { role: 'user', content: prompt }
      ],
    });

    let raw = (completion.choices?.[0]?.message?.content || '{}')
      .replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    // Extract JSON if wrapped in other text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) raw = jsonMatch[0];

    const plan = JSON.parse(raw);
    res.json({ plan, daysLeft, year, semester });

  } catch (err) {
    console.error('Study plan error:', err.message);
    res.status(500).json({ error: 'Failed to generate study plan. Please try again.' });
  }
}

module.exports = { processChat, generateQuiz, generateStudyPlan };
// js/chat.js — EduBot Frontend Logic
// MIT Academy of Engineering, Pune | SPPU SE

const API_BASE = '/api';

// ── State ─────────────────────────────────────────────────
const state = {
  sessionId: localStorage.getItem('edubot_session') || generateId(),
  history: [],
  isLoading: false,
  token: localStorage.getItem('edubot_token') || null,
  user: JSON.parse(localStorage.getItem('edubot_user') || 'null'),
};
localStorage.setItem('edubot_session', state.sessionId);

function generateId() {
  return 'sess_' + Math.random().toString(36).substring(2) + Date.now();
}

// ── DOM ───────────────────────────────────────────────────
const dom = {
  messages: document.getElementById('messages'),
  input: document.getElementById('msg-input'),
  sendBtn: document.getElementById('send-btn'),
};

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNavUser();
  dom.input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  dom.input.addEventListener('input', function () {
    this.style.height = '42px';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    const counter = document.getElementById('char-count');
    if (counter) {
      const len = this.value.length;
      counter.textContent = len > 0 ? `${len}/1000` : '';
      counter.style.color = len > 900 ? '#E24B4A' : '#8888aa';
    }
  });
  initVoice();
});

function goToProfile() { window.location.href = 'profile.html'; }

// ── Send Message ──────────────────────────────────────────
async function sendMessage() {
  const text = dom.input.value.trim();
  if (!text || state.isLoading) return;
  dom.input.value = '';
  dom.input.style.height = '42px';
  hideWelcome();
  sendQuery(text);
}

async function sendQuery(text) {
  if (state.isLoading) return;
  state.isLoading = true;
  dom.sendBtn.disabled = true;
  appendMessage('user', text);
  state.history.push({ role: 'user', content: text });
  const typingEl = showTyping();
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, session_id: state.sessionId, history: state.history.slice(-10) }),
    });
    const data = await res.json();
    removeTyping(typingEl);
    if (!res.ok) {
      appendMessage('bot', `❌ Error: ${data.error || 'Unknown error'}. Please try again.`);
    } else {
      appendMessage('bot', data.reply, true);
      state.history.push({ role: 'assistant', content: data.reply });
      if (state.history.length > 20) state.history = state.history.slice(-20);
    }
  } catch (err) {
    removeTyping(typingEl);
    appendMessage('bot', '❌ Network error. Please check your connection and try again.');
  }
  state.isLoading = false;
  dom.sendBtn.disabled = false;
  dom.input.focus();
}

// ── Rendering ─────────────────────────────────────────────
function appendMessage(role, text, showFeedback = false) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const avatarLabel = role === 'bot' ? 'E' : (state.user?.username?.[0]?.toUpperCase() || 'U');
  let feedbackHTML = '';
  if (showFeedback && role === 'bot') {
    feedbackHTML = `<div class="feedback-row">
      <span>Helpful?</span>
      <button class="fb-btn" onclick="submitFeedback(this,'positive')">👍 Yes</button>
      <button class="fb-btn" onclick="submitFeedback(this,'negative')">👎 No</button>
    </div>`;
  }
  div.innerHTML = `<div class="msg-avatar">${avatarLabel}</div><div class="bubble">${renderMarkdown(text)}${feedbackHTML}</div>`;
  dom.messages.appendChild(div);
  dom.messages.scrollTop = dom.messages.scrollHeight;
  return div;
}

function renderMarkdown(text) {
  return text
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre style="background:rgba(60,52,137,0.06);border-radius:6px;padding:10px;font-size:12px;overflow-x:auto;margin:6px 0;white-space:pre-wrap;"><code>$1</code></pre>')
    .replace(/`([^`\n]+)`/g, '<code style="background:rgba(60,52,137,0.08);padding:1px 5px;border-radius:4px;font-size:12px;">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)/gm, '<h3 style="font-size:14px;font-weight:600;margin:10px 0 4px;color:var(--primary);">$1</h3>')
    .replace(/^## (.+)/gm, '<h4 style="font-size:14px;font-weight:600;margin:8px 0 3px;">$1</h4>')
    .replace(/^\d+\. (.+)/gm, '<li style="margin:3px 0;">$1</li>')
    .replace(/^[-•*] (.+)/gm, '<li style="margin:3px 0;">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, m => `<ul style="margin:6px 0 6px 18px;">${m}</ul>`)
    .replace(/(https?:\/\/[^\s<"]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'msg bot'; div.id = 'typing-indicator';
  div.innerHTML = `<div class="msg-avatar">E</div><div class="bubble"><div class="typing-bubble"><span></span><span></span><span></span></div></div>`;
  dom.messages.appendChild(div);
  dom.messages.scrollTop = dom.messages.scrollHeight;
  return div;
}
function removeTyping(el) {
  if (el) el.remove();
  document.getElementById('typing-indicator')?.remove();
}

// ── Feedback ──────────────────────────────────────────────
function submitFeedback(btn, type) {
  const row = btn.closest('.feedback-row');
  row.querySelectorAll('.fb-btn').forEach(b => b.classList.remove('active-pos', 'active-neg'));
  btn.classList.add(type === 'positive' ? 'active-pos' : 'active-neg');
  showToast(type === 'positive' ? '✅ Thanks for the feedback!' : '📝 We\'ll improve that!');
}

// ── Welcome / Clear ───────────────────────────────────────
function hideWelcome() {
  const ws = document.getElementById('welcome-state');
  if (ws) ws.style.display = 'none';
}
function tryExample(text) { dom.input.value = text; dom.input.focus(); sendMessage(); }
function sendChip(text) { if (!state.isLoading) { hideWelcome(); sendQuery(text); } }
function clearChat() {
  dom.messages.innerHTML = '';
  state.history = [];
  state.sessionId = generateId();
  localStorage.setItem('edubot_session', state.sessionId);
  const ws = document.getElementById('welcome-state');
  if (ws) ws.style.display = 'flex';
}

// ── Sidebar ───────────────────────────────────────────────
function toggleYear(el) { el.closest('.year-card').classList.toggle('open'); }
function querySemester(num) {
  const labels = { 1: 'FY Semester 1', 2: 'FY Semester 2', 3: 'SY Semester 3', 4: 'SY Semester 4', 5: 'TY Semester 5', 6: 'TY Semester 6', 7: 'BE Semester 7', 8: 'BE Semester 8' };
  hideWelcome();
  sendQuery(`List all subjects for ${labels[num] || 'Semester ' + num} with a brief overview of each`);
}

// ============================================================
// VOICE INPUT — Web Speech API
// ============================================================
const voice = { recognition: null, supported: false, isListening: false, transcript: '' };

function initVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const voiceBtn = document.getElementById('voice-btn');
  if (!SpeechRecognition) {
    if (voiceBtn) { voiceBtn.title = 'Voice input not supported. Use Chrome or Edge.'; voiceBtn.style.opacity = '0.4'; voiceBtn.style.cursor = 'not-allowed'; voiceBtn.onclick = () => showToast('⚠️ Voice input requires Chrome or Edge browser.'); }
    return;
  }
  voice.supported = true;
  voice.recognition = new SpeechRecognition();
  voice.recognition.continuous = false;
  voice.recognition.interimResults = true;
  voice.recognition.lang = 'en-IN';
  voice.recognition.onstart = () => { setVoiceUI(true); dom.input.value = ''; voice.transcript = ''; };
  voice.recognition.onresult = (e) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t; else interim += t;
    }
    dom.input.value = interim || final;
    dom.input.style.height = '42px';
    dom.input.style.height = Math.min(dom.input.scrollHeight, 120) + 'px';
    if (interim) updateVoiceBannerText(`Hearing: "${interim}"`);
    if (final) voice.transcript = final.trim();
  };
  voice.recognition.onend = () => {
    setVoiceUI(false);
    if (voice.transcript.trim().length > 0) {
      dom.input.value = voice.transcript;
      setTimeout(() => { sendMessage(); voice.transcript = ''; }, 500);
    } else { showToast('🎤 No speech detected. Try again.'); }
  };
  voice.recognition.onerror = (e) => {
    setVoiceUI(false); voice.transcript = '';
    const msgs = { 'no-speech': 'No speech detected.', 'audio-capture': 'Microphone not found.', 'not-allowed': 'Mic access denied. Allow in browser settings.', 'network': 'Network error.' };
    if (e.error !== 'aborted') showToast('🎤 ' + (msgs[e.error] || 'Voice error: ' + e.error));
  };
}

function toggleVoice() {
  if (!voice.supported) { showToast('⚠️ Voice input requires Chrome or Edge browser.'); return; }
  if (voice.isListening) stopVoice(); else startVoice();
}
function startVoice() {
  if (!voice.supported || voice.isListening) return;
  try { voice.recognition.start(); } catch (e) { voice.recognition.stop(); setTimeout(() => voice.recognition.start(), 200); }
}
function stopVoice() {
  voice.transcript = '';
  try { voice.recognition.abort(); } catch (e) {}
  setVoiceUI(false);
}
function setVoiceUI(listening) {
  voice.isListening = listening;
  const btn = document.getElementById('voice-btn');
  const icon = document.getElementById('voice-icon');
  const banner = document.getElementById('voice-banner');
  if (listening) {
    btn?.classList.add('active');
    if (icon) icon.className = 'fa-solid fa-stop';
    if (banner) { banner.classList.add('visible'); updateVoiceBannerText('🎤 Listening... speak now'); }
  } else {
    btn?.classList.remove('active');
    if (icon) icon.className = 'fa-solid fa-microphone';
    if (banner) banner.classList.remove('visible');
  }
}
function updateVoiceBannerText(text) {
  const el = document.getElementById('voice-banner-text');
  if (el) el.textContent = text;
}
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT' && !e.target.isContentEditable) {
    e.preventDefault();
    if (!voice.isListening) startVoice();
  }
});
document.addEventListener('keyup', e => {
  if (e.code === 'Space' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
    if (voice.isListening) { try { voice.recognition.stop(); } catch (e) {} }
  }
});

// ============================================================
// QUIZ GENERATOR — Fixed auto-advance with countdown timer
// ============================================================
const quiz = {
  questions: [],
  current: 0,
  answers: {},
  active: false,
  autoAdvanceTimer: null,   // holds setTimeout id
  countdownInterval: null,  // holds setInterval id
};

const QUIZ_AUTO_ADVANCE_DELAY = 4000; // 4 seconds — enough to read explanation

function openQuizModal() {
  document.getElementById('quiz-modal-overlay').classList.add('open');
  resetQuizView();
}
function closeQuizModal() {
  clearQuizTimers();
  document.getElementById('quiz-modal-overlay').classList.remove('open');
}
document.getElementById('quiz-modal-overlay')?.addEventListener('click', function(e) {
  if (e.target === this) closeQuizModal();
});

function clearQuizTimers() {
  if (quiz.autoAdvanceTimer) { clearTimeout(quiz.autoAdvanceTimer); quiz.autoAdvanceTimer = null; }
  if (quiz.countdownInterval) { clearInterval(quiz.countdownInterval); quiz.countdownInterval = null; }
}

function resetQuizView() {
  clearQuizTimers();
  document.getElementById('quiz-setup').style.display = 'block';
  document.getElementById('quiz-loading').style.display = 'none';
  document.getElementById('quiz-content').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'none';
  document.getElementById('quiz-topic').value = '';
  quiz.questions = []; quiz.current = 0; quiz.answers = {}; quiz.active = false;
}

async function startQuiz() {
  const topic = document.getElementById('quiz-topic').value.trim();
  const count = parseInt(document.getElementById('quiz-count').value) || 5;
  if (!topic) { showToast('⚠️ Please enter a topic first!'); document.getElementById('quiz-topic').focus(); return; }
  document.getElementById('quiz-setup').style.display = 'none';
  document.getElementById('quiz-loading').style.display = 'block';
  try {
    const res = await fetch(`${API_BASE}/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, count }),
    });
    const data = await res.json();
    if (!res.ok || !data.quiz?.questions?.length) throw new Error(data.error || 'No questions returned');
    quiz.questions = data.quiz.questions;
    quiz.current = 0; quiz.answers = {}; quiz.active = true;
    document.getElementById('quiz-loading').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'block';
    renderQuestion();
  } catch (err) {
    document.getElementById('quiz-loading').style.display = 'none';
    document.getElementById('quiz-setup').style.display = 'block';
    showToast('❌ ' + (err.message || 'Failed to generate quiz. Please try again.'));
  }
}

function renderQuestion(direction = 'none') {
  clearQuizTimers();
  const q = quiz.questions[quiz.current];
  const total = quiz.questions.length;
  const answered = quiz.answers[quiz.current];
  const isLast = quiz.current === total - 1;

  // Update progress bar
  document.getElementById('quiz-progress-fill').style.width = ((quiz.current + 1) / total * 100) + '%';
  document.getElementById('quiz-counter').textContent = `${quiz.current + 1} / ${total}`;

  // Nav buttons
  document.getElementById('btn-prev').disabled = quiz.current === 0;
  document.getElementById('btn-next').style.display = quiz.current < total - 1 ? 'inline-block' : 'none';

  // Submit button — show only on last question after answering
  const allAnswered = quiz.questions.every((_, i) => quiz.answers[i] !== undefined);
  document.getElementById('btn-submit').style.display = (isLast && answered) ? 'block' : 'none';

  // Build question HTML
  let html = `<div class="quiz-container quiz-slide-${direction}">
    <div class="quiz-title">Question ${quiz.current + 1} <span class="quiz-topic-tag">${q.q.length > 0 ? '' : ''}</span></div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">`;

  q.options.forEach(opt => {
    const letter = opt.charAt(0);
    let cls = 'quiz-option';
    if (answered) {
      if (letter === q.answer) cls += ' correct';
      else if (letter === answered) cls += ' wrong';
    }
    const disabled = answered ? 'disabled' : '';
    html += `<button class="${cls}" onclick="selectAnswer('${letter}')" ${disabled}>${opt}</button>`;
  });

  html += '</div>';

  if (answered) {
    const isCorrect = answered === q.answer;
    html += `<div class="quiz-result-badge ${isCorrect ? 'correct-badge' : 'wrong-badge'}">
      ${isCorrect ? '✅ Correct!' : `❌ Wrong! Correct answer: ${q.answer}`}
    </div>`;
    html += `<div class="quiz-explanation">💡 <strong>Explanation:</strong> ${q.explanation}</div>`;

    // Auto-advance countdown bar (only if not last question)
    if (!isLast) {
      html += `<div class="quiz-countdown-wrap">
        <span id="quiz-countdown-text">Next question in <strong id="quiz-countdown-num">4</strong>s</span>
        <div class="quiz-countdown-bar"><div id="quiz-countdown-fill"></div></div>
        <button class="quiz-skip-btn" onclick="quizAdvanceNow()">Next Now →</button>
      </div>`;
    }
  }

  html += '</div>';

  const area = document.getElementById('quiz-question-area');
  area.innerHTML = html;

  // Trigger slide animation
  if (direction !== 'none') {
    const container = area.querySelector('.quiz-container');
    if (container) {
      container.classList.add('quiz-entering');
      requestAnimationFrame(() => {
        container.classList.remove('quiz-entering');
      });
    }
  }

  // Start countdown animation if answered and not last
  if (answered && !isLast) {
    startCountdown();
  }
}

function startCountdown() {
  let remaining = Math.ceil(QUIZ_AUTO_ADVANCE_DELAY / 1000); // 4
  const fill = document.getElementById('quiz-countdown-fill');
  const numEl = document.getElementById('quiz-countdown-num');

  // Start fill animation
  if (fill) {
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => {
      fill.style.transition = `width ${QUIZ_AUTO_ADVANCE_DELAY}ms linear`;
      fill.style.width = '0%';
    });
  }

  // Countdown number tick
  quiz.countdownInterval = setInterval(() => {
    remaining--;
    if (numEl) numEl.textContent = remaining;
    if (remaining <= 0) clearInterval(quiz.countdownInterval);
  }, 1000);

  // Auto advance
  quiz.autoAdvanceTimer = setTimeout(() => {
    quizAdvanceNow();
  }, QUIZ_AUTO_ADVANCE_DELAY);
}

function quizAdvanceNow() {
  clearQuizTimers();
  if (quiz.current < quiz.questions.length - 1) {
    quiz.current++;
    renderQuestion('right');
  }
}

function selectAnswer(letter) {
  if (quiz.answers[quiz.current] !== undefined) return;
  quiz.answers[quiz.current] = letter;
  renderQuestion('none'); // re-render in place to show result + start countdown
}

function quizNext() {
  clearQuizTimers();
  if (quiz.current < quiz.questions.length - 1) { quiz.current++; renderQuestion('right'); }
}
function quizPrev() {
  clearQuizTimers();
  if (quiz.current > 0) { quiz.current--; renderQuestion('left'); }
}

function submitQuiz() {
  clearQuizTimers();
  let score = 0;
  quiz.questions.forEach((q, i) => { if (quiz.answers[i] === q.answer) score++; });
  const total = quiz.questions.length;
  const pct = Math.round(score / total * 100);

  document.getElementById('quiz-content').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';
  document.getElementById('quiz-score-num').textContent = score;
  document.getElementById('quiz-total-num').textContent = total;

  const msgs = pct === 100 ? '🏆 Perfect score! Outstanding!' : pct >= 80 ? '🎉 Excellent! Keep it up!' : pct >= 60 ? '👍 Good job! A bit more practice.' : pct >= 40 ? '📚 Keep studying — you\'ll get there!' : '💪 Review the topic and try again!';
  document.getElementById('quiz-score-msg').textContent = msgs;

  let reviewHTML = '<div class="quiz-review-list">';
  quiz.questions.forEach((q, i) => {
    const userAns = quiz.answers[i] || '—';
    const correct = userAns === q.answer;
    reviewHTML += `<div class="quiz-review-item ${correct ? 'review-correct' : 'review-wrong'}">
      <div class="review-header">${correct ? '✅' : '❌'} <strong>Q${i + 1}:</strong> ${q.q}</div>
      <div class="review-detail">Your answer: <strong>${userAns}</strong> | Correct: <strong>${q.answer}</strong></div>
      <div class="review-exp">💡 ${q.explanation}</div>
    </div>`;
  });
  reviewHTML += '</div>';
  document.getElementById('quiz-review').innerHTML = reviewHTML;

  const resultMsg = `📊 **Quiz Result:** ${score}/${total} (${pct}%) — ${msgs}`;
  appendMessage('bot', resultMsg);
}

function resetQuiz() { resetQuizView(); }

// ============================================================
// PERSONALIZED STUDY PLAN
// ============================================================
const SEMESTER_BY_YEAR = {
  FY: ['Semester 1', 'Semester 2'],
  SY: ['Semester 3', 'Semester 4'],
  TY: ['Semester 5', 'Semester 6'],
  BE: ['Semester 7', 'Semester 8'],
};

const SUBJECTS_BY_SEM = {
  'FY-Semester 1': ['Engineering Maths-I', 'Engineering Physics', 'Engineering Chemistry', 'Basic Electrical Engineering', 'Engineering Mechanics', 'Engineering Graphics', 'Workshop Practice'],
  'FY-Semester 2': ['Engineering Maths-II', 'C Programming (PPS)', 'Basic Electronics', 'Communication Skills', 'Environmental Studies'],
  'SY-Semester 3': ['Engineering Maths-III (M3)', 'Data Structures', 'DECO', 'OOP using Java', 'DBMS', 'Discrete Mathematics'],
  'SY-Semester 4': ['Engineering Maths-IV (M4)', 'Computer Networks', 'Operating Systems', 'Theory of Computation (TOC)', 'Software Engineering', 'Web Technology'],
  'TY-Semester 5': ['Machine Learning', 'Software Testing & QA (STQA)', 'DAA', 'IoT', 'Mini Project'],
  'TY-Semester 6': ['Artificial Intelligence', 'Information Security', 'Cloud Computing', 'Elective', 'Project-I'],
  'BE-Semester 7': ['Deep Learning', 'Big Data Analytics', 'Elective', 'Project-II'],
  'BE-Semester 8': ['Industry Internship', 'Project Viva', 'Technical Seminar', 'MOOCs'],
};

function openStudyPlanModal() {
  document.getElementById('sp-modal-overlay').classList.add('open');
  resetStudyPlanView();
  updateSemesterOptions();
  updateSubjectCheckboxes();
}
function closeStudyPlanModal() {
  document.getElementById('sp-modal-overlay').classList.remove('open');
}
document.getElementById('sp-modal-overlay')?.addEventListener('click', function(e) {
  if (e.target === this) closeStudyPlanModal();
});

function resetStudyPlanView() {
  document.getElementById('sp-setup').style.display = 'block';
  document.getElementById('sp-loading').style.display = 'none';
  document.getElementById('sp-result').style.display = 'none';
  // Set default exam date to 30 days from now
  const d = new Date(); d.setDate(d.getDate() + 30);
  document.getElementById('sp-exam-date').value = d.toISOString().split('T')[0];
  document.getElementById('sp-exam-date').min = new Date().toISOString().split('T')[0];
}

function updateSemesterOptions() {
  const year = document.getElementById('sp-year').value;
  const semSelect = document.getElementById('sp-semester');
  semSelect.innerHTML = '';
  (SEMESTER_BY_YEAR[year] || []).forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    semSelect.appendChild(opt);
  });
  updateSubjectCheckboxes();
}

function updateSubjectCheckboxes() {
  const year = document.getElementById('sp-year').value;
  const semester = document.getElementById('sp-semester').value;
  const key = `${year}-${semester}`;
  const subjects = SUBJECTS_BY_SEM[key] || [];
  const container = document.getElementById('sp-subjects-list');
  container.innerHTML = subjects.map(s => `
    <label class="sp-subject-check">
      <input type="checkbox" value="${s}" class="sp-subject-cb">
      <span>${s}</span>
    </label>`).join('');
}

async function generateStudyPlan() {
  const year = document.getElementById('sp-year').value;
  const semester = document.getElementById('sp-semester').value;
  const examDate = document.getElementById('sp-exam-date').value;
  const hoursPerDay = parseFloat(document.getElementById('sp-hours').value) || 4;
  const goals = document.getElementById('sp-goals').value.trim();

  if (!examDate) { showToast('⚠️ Please select your exam date.'); return; }

  const weakSubjects = Array.from(document.querySelectorAll('.sp-subject-cb:checked')).map(cb => cb.value);

  document.getElementById('sp-setup').style.display = 'none';
  document.getElementById('sp-loading').style.display = 'block';

  try {
    const res = await fetch(`${API_BASE}/study-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, semester, weakSubjects, examDate, hoursPerDay, goals }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate plan');

    document.getElementById('sp-loading').style.display = 'none';
    document.getElementById('sp-result').style.display = 'block';
    renderStudyPlan(data);
  } catch (err) {
    document.getElementById('sp-loading').style.display = 'none';
    document.getElementById('sp-setup').style.display = 'block';
    showToast('❌ ' + (err.message || 'Failed to generate study plan. Try again.'));
  }
}

function renderStudyPlan(data) {
  const { plan, daysLeft, year, semester } = data;
  const container = document.getElementById('sp-plan-content');

  let html = `
    <div class="sp-header-card">
      <div class="sp-header-badge">${year} · ${semester}</div>
      <h3>${plan.summary?.strategy || 'Your Personalized Study Plan'}</h3>
      <div class="sp-stats">
        <div class="sp-stat"><span class="sp-stat-num">${daysLeft}</span><span class="sp-stat-label">Days Left</span></div>
        <div class="sp-stat"><span class="sp-stat-num">${plan.summary?.hoursPerDay || 0}h</span><span class="sp-stat-label">Per Day</span></div>
        <div class="sp-stat"><span class="sp-stat-num">${Math.round(plan.summary?.totalHours || 0)}h</span><span class="sp-stat-label">Total Study</span></div>
      </div>
    </div>`;

  // Subject Priority
  if (plan.subjectPriority?.length > 0) {
    html += `<div class="sp-section"><div class="sp-section-title">📊 Subject Priority</div><div class="sp-priority-grid">`;
    plan.subjectPriority.forEach(s => {
      const cls = s.priority === 'High' ? 'priority-high' : s.priority === 'Medium' ? 'priority-med' : 'priority-low';
      html += `<div class="sp-priority-card ${cls}">
        <div class="sp-priority-header"><span class="sp-priority-badge">${s.priority}</span> ${s.subject}</div>
        <div class="sp-priority-hours">⏱️ ${s.hoursAllocated}h allocated</div>
        <div class="sp-priority-reason">${s.reason}</div>
        ${s.tips ? `<ul class="sp-priority-tips">${s.tips.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
      </div>`;
    });
    html += `</div></div>`;
  }

  // Study Phases
  if (plan.phases?.length > 0) {
    html += `<div class="sp-section"><div class="sp-section-title">📅 Study Phases</div>`;
    plan.phases.forEach((phase, i) => {
      html += `<div class="sp-phase">
        <div class="sp-phase-header">
          <span class="sp-phase-num">Phase ${i + 1}</span>
          <span class="sp-phase-name">${phase.name}</span>
          <span class="sp-phase-dur">${phase.duration}</span>
        </div>
        <div class="sp-phase-focus">🎯 ${phase.focus}</div>
        <div class="sp-phase-subjects">Subjects: ${(phase.subjects || []).join(', ')}</div>
        <ul class="sp-phase-tasks">${(phase.dailyTasks || []).map(t => `<li>${t}</li>`).join('')}</ul>
      </div>`;
    });
    html += `</div>`;
  }

  // Weekly Schedule
  if (plan.weeklySchedule) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    html += `<div class="sp-section"><div class="sp-section-title">📆 Weekly Schedule</div><div class="sp-week-grid">`;
    days.forEach(day => {
      const tasks = plan.weeklySchedule[day] || [];
      const isWeekend = day === 'Saturday' || day === 'Sunday';
      html += `<div class="sp-day-card ${isWeekend ? 'weekend' : ''}">
        <div class="sp-day-name">${day.substring(0,3)}</div>
        <ul>${tasks.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>`;
    });
    html += `</div></div>`;
  }

  // Important Tips
  if (plan.importantTips?.length > 0) {
    html += `<div class="sp-section"><div class="sp-section-title">💡 Important Tips</div><ul class="sp-tips-list">`;
    plan.importantTips.forEach(tip => { html += `<li>${tip}</li>`; });
    html += `</ul></div>`;
  }

  // Last Week Plan
  if (plan.lastWeekPlan?.length > 0) {
    html += `<div class="sp-section sp-last-week"><div class="sp-section-title">🔥 Last Week Before Exam</div><ol class="sp-lastweek-list">`;
    plan.lastWeekPlan.forEach(item => { html += `<li>${item}</li>`; });
    html += `</ol></div>`;
  }

  container.innerHTML = html;

  // Send summary to chat
  const summary = `📚 **Study Plan Generated!**\n${year} ${semester} · ${daysLeft} days left · ${plan.summary?.hoursPerDay || 0}h/day\n\n${plan.summary?.strategy || ''}`;
  appendMessage('bot', summary);
}

function downloadStudyPlan() {
  const content = document.getElementById('sp-plan-content').innerText;
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'EduBot_StudyPlan.txt';
  a.click();
}

// ── Auth ──────────────────────────────────────────────────
function openLoginModal() {
  document.getElementById('modal-overlay').classList.add('open');
  showLoginForm();
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('auth-error').textContent = '';
}
function showLoginForm() {
  document.getElementById('modal-title').textContent = 'Welcome Back!';
  document.getElementById('modal-subtitle').textContent = 'Login to track your chat history.';
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
}
function showRegisterForm() {
  document.getElementById('modal-title').textContent = 'Create Account';
  document.getElementById('modal-subtitle').textContent = 'Join EduBot and save your learning history.';
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
}
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('auth-error');
  errEl.textContent = '';
  if (!email || !password) { errEl.textContent = 'Email and password required.'; return; }
  try {
    const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; return; }
    state.token = data.token; state.user = data.user;
    localStorage.setItem('edubot_token', data.token);
    localStorage.setItem('edubot_user', JSON.stringify(data.user));
    closeModal(); updateNavUser();
    showToast(`✅ Welcome back, ${data.user.full_name || data.user.username}!`);
  } catch (e) { errEl.textContent = 'Network error. Please try again.'; }
}
async function doRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const full_name = document.getElementById('reg-name').value.trim();
  const year_of_study = document.getElementById('reg-year').value;
  const errEl = document.getElementById('auth-error');
  errEl.textContent = '';
  if (!username || !email || !password) { errEl.textContent = 'Username, email and password required.'; return; }
  try {
    const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password, full_name, year_of_study }) });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; return; }
    state.token = data.token; state.user = data.user;
    localStorage.setItem('edubot_token', data.token);
    localStorage.setItem('edubot_user', JSON.stringify(data.user));
    closeModal(); updateNavUser();
    showToast(`🎉 Welcome to EduBot, ${data.user.username}!`);
  } catch (e) { errEl.textContent = 'Network error. Please try again.'; }
}
function doLogout() {
  state.token = null; state.user = null;
  localStorage.removeItem('edubot_token'); localStorage.removeItem('edubot_user');
  updateNavUser(); showToast('👋 Logged out successfully.');
}
function updateNavUser() {
  const navUser = document.getElementById('nav-user-info');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  if (state.user) {
    if (navUser) navUser.innerHTML = `<i class="fa-solid fa-user"></i> ${state.user.full_name || state.user.username} (${state.user.year_of_study || 'SE'})`;
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  } else {
    if (navUser) navUser.innerHTML = '<i class="fa-solid fa-user"></i> Guest';
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

// ── Utility ───────────────────────────────────────────────
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, duration);
}
document.getElementById('modal-overlay')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});


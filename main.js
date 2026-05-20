import { AgentPipeline } from './agents/agentPipeline.js';
import { CURRICULUM } from './data/curriculum.js';

document.addEventListener('DOMContentLoaded', () => {
    let currentQuestionIndex = 0;
    let pipeline;
    let behaviorSignals = { hesitated: false, requestedHint: false, timeMs: 0 };
    let questionStartTime = Date.now();

    const elements = {
        questionNum: document.getElementById('question-num'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        btnHesitate: document.getElementById('btn-hesitate'),
        btnHint: document.getElementById('btn-hint'),
        btnStartDemo: document.getElementById('btn-start-demo'),
        btnNext: document.getElementById('btn-next'),
        btnReset: document.getElementById('btn-reset'),
        coachingContainer: document.getElementById('coaching-container'),
        agentCards: document.querySelectorAll('.agent-card'),
        connectors: document.querySelectorAll('.connector'),
        metricScore: document.getElementById('metric-score'),
        metricIteration: document.getElementById('metric-iteration'),
        metricMastery: document.getElementById('metric-mastery'),
        snapshotTitle: document.getElementById('snapshot-title'),
        conceptBars: document.getElementById('concept-bars'),
        diffContainer: document.getElementById('diff-container'),
        checklistContainer: document.getElementById('checklist-container'),
        pipelineProgressFill: document.getElementById('pipeline-progress-fill')
    };

    function init() {
        pipeline = new AgentPipeline(handleAgentUpdate, handlePipelineComplete);
        loadQuestion(currentQuestionIndex);
        setupEventListeners();
    }

    function setupEventListeners() {
        elements.btnHesitate.addEventListener('click', () => {
            behaviorSignals.hesitated = true;
            elements.btnHesitate.style.background = 'rgba(246,173,85,0.3)';
        });

        elements.btnHint.addEventListener('click', () => {
            behaviorSignals.requestedHint = true;
            elements.btnHint.style.background = 'rgba(246,173,85,0.3)';
            triggerPipeline(null); // Hint request triggers pipeline without an answer
        });

        elements.btnNext.addEventListener('click', () => {
            currentQuestionIndex = (currentQuestionIndex + 1) % CURRICULUM.questions.length;
            loadQuestion(currentQuestionIndex);
            resetUI();
        });

        elements.btnReset.addEventListener('click', () => {
            currentQuestionIndex = 0;
            pipeline.reset();
            loadQuestion(currentQuestionIndex);
            resetUI();
            updateMetrics({ score: 0, iterationCount: 0, mastered: false });
        });

        elements.btnStartDemo.addEventListener('click', runDemo);
    }

    function loadQuestion(index) {
        const q = CURRICULUM.questions[index];
        elements.questionNum.textContent = `Question ${index + 1} of ${CURRICULUM.questions.length}`;
        elements.questionText.textContent = q.text;
        
        elements.optionsContainer.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="option-letter">${opt.id.toUpperCase()}</span> ${opt.text}`;
            btn.addEventListener('click', () => handleAnswer(opt));
            elements.optionsContainer.appendChild(btn);
        });

        questionStartTime = Date.now();
        behaviorSignals = { hesitated: false, requestedHint: false, timeMs: 0 };
        elements.btnHesitate.style.background = '';
        elements.btnHint.style.background = '';
        elements.btnNext.style.display = 'none';
        
        updateSnapshot();
    }

    function resetUI() {
        elements.coachingContainer.innerHTML = `
            <div class="empty-state">
                <span class="icon">🤖</span>
                <p>Waiting for student interaction...</p>
            </div>`;
        elements.checklistContainer.innerHTML = '';
        elements.diffContainer.innerHTML = '';
        
        elements.agentCards.forEach(card => {
            card.className = 'agent-card';
            const badge = card.querySelector('.agent-badge');
            if (badge) {
                badge.className = 'agent-badge badge-idle';
                badge.textContent = 'IDLE';
            }
            const output = card.querySelector('.agent-output');
            if (output) output.textContent = 'Waiting...';
            const logs = card.querySelector('.agent-logs');
            if (logs) logs.innerHTML = '';
        });

        elements.connectors.forEach(c => c.classList.remove('active'));
        elements.pipelineProgressFill.style.width = '0%';
    }

    function handleAnswer(selectedOption) {
        behaviorSignals.timeMs = Date.now() - questionStartTime;
        const q = CURRICULUM.questions[currentQuestionIndex];
        const correct = selectedOption.correct;
        
        // Highlight options
        Array.from(elements.optionsContainer.children).forEach(btn => {
            btn.disabled = true;
            const letterSpan = btn.querySelector('.option-letter').textContent.toLowerCase();
            if (letterSpan === q.options.find(o => o.correct).id) {
                btn.classList.add('correct');
            } else if (letterSpan === selectedOption.id && !correct) {
                btn.classList.add('wrong');
            }
        });

        triggerPipeline({
            questionId: q.id,
            questionDifficulty: q.difficulty,
            correct: correct,
            wrongAnswer: correct ? null : selectedOption.id,
            timeMs: behaviorSignals.timeMs,
            hesitated: behaviorSignals.hesitated,
            requestedHint: behaviorSignals.requestedHint,
            attemptNumber: 1
        });
    }

    async function triggerPipeline(studentEvent) {
        if (!studentEvent) { // hint case
            const q = CURRICULUM.questions[currentQuestionIndex];
            studentEvent = {
                questionId: q.id,
                questionDifficulty: q.difficulty,
                correct: false,
                wrongAnswer: null,
                timeMs: Date.now() - questionStartTime,
                hesitated: behaviorSignals.hesitated,
                requestedHint: true,
                attemptNumber: 1
            };
        }
        
        resetUI();
        elements.coachingContainer.innerHTML = `
            <div class="empty-state">
                <span class="icon spinner"></span>
                <p>Analyzing behavior...</p>
            </div>`;
            
        await pipeline.runCycle(studentEvent);
    }

    function handleAgentUpdate({ agentId, status, output, detail }) {
        const card = document.getElementById(`agent-${agentId}`);
        if (!card) return;

        const badge = card.querySelector('.agent-badge');
        const outputEl = card.querySelector('.agent-output');
        const logsEl = card.querySelector('.agent-logs');

        card.className = `agent-card ${status === 'analyzing' ? 'active' : ''} ${status === 'done' ? 'done' : ''}`;
        badge.className = `agent-badge badge-${status}`;
        badge.textContent = status.toUpperCase();
        outputEl.textContent = output;

        if (detail && detail.logs) {
            logsEl.innerHTML = detail.logs.map(log => `<div class="agent-log-line">${log}</div>`).join('');
            card.classList.add('expanded');
        }

        // Connectors logic
        const agentOrder = ['behavior', 'struggle', 'diagnosis', 'intervention', 'tutor', 'evaluation', 'validation'];
        const idx = agentOrder.indexOf(agentId);
        if (status === 'done' && idx < agentOrder.length - 1) {
             const connector = document.getElementById(`conn-${idx + 1}`);
             if (connector) connector.classList.add('active');
        }
        
        elements.pipelineProgressFill.style.width = `${((idx + (status==='done'?1:0)) / 7) * 100}%`;
    }

    function handlePipelineComplete({ iteration, results }) {
        elements.connectors.forEach(c => c.classList.remove('active'));
        
        // Render Coaching
        renderCoaching(results.tutor);
        
        // Render Checklist
        renderChecklist(results.validation);
        
        // Render Diff
        renderDiff(results.diagnosis, results.evaluation);

        // Update Metrics
        updateMetrics({
            score: results.struggle.score,
            iterationCount: pipeline.iterationCount,
            mastered: results.evaluation.mastered
        });
        
        // Enable Next
        elements.btnNext.style.display = 'block';
    }

    function renderCoaching(tutorData) {
        if (!tutorData || !tutorData.contentBlocks) return;
        elements.coachingContainer.innerHTML = tutorData.contentBlocks.map(block => `
            <div class="coaching-block">
                <div class="coaching-block-header">
                    <span class="coaching-emoji">${block.emoji}</span>
                    <span class="coaching-title">${block.title}</span>
                </div>
                <div class="coaching-content">${block.content}</div>
                ${block.formula ? `<div class="coaching-formula">${block.formula}</div>` : ''}
            </div>
        `).join('');
    }

    function renderChecklist(validationData) {
        if (!validationData || !validationData.checklist) return;
        elements.checklistContainer.innerHTML = validationData.checklist.map(item => `
            <div class="checklist-item ${item.pass ? 'pass' : 'fail'}">
                <span class="check-icon">${item.pass ? '✅' : '⏳'}</span>
                <span class="check-label">${item.label}</span>
            </div>
        `).join('');
    }
    
    function renderDiff(diagnosis, evaluation) {
        if (!diagnosis || !evaluation) return;
        
        let diffHTML = `<div class="diff-line ctx">@@ knowledge_state @@</div>`;
        
        if (diagnosis.rootCause !== 'No significant struggle') {
             diffHTML += `<div class="diff-line remove"><span class="diff-sign">-</span> <span>[Misconception] ${diagnosis.conceptGap}</span></div>`;
        }
        if (evaluation.mastered) {
             diffHTML += `<div class="diff-line add"><span class="diff-sign">+</span> <span>[Mastered] ${CURRICULUM.concepts.find(c => c.id === diagnosis.concept?.id)?.name || 'Concept'} verified.</span></div>`;
        } else if (diagnosis.rootCause !== 'No significant struggle') {
             diffHTML += `<div class="diff-line add"><span class="diff-sign">+</span> <span>[Intervention] Applying ${diagnosis.concept?.name} correction...</span></div>`;
        } else {
             diffHTML += `<div class="diff-line ctx"><span class="diff-sign"> </span> <span>No changes detected.</span></div>`;
        }
        
        elements.diffContainer.innerHTML = diffHTML;
        updateSnapshot(evaluation.conceptScores);
    }

    function updateMetrics({ score, iterationCount, mastered }) {
        elements.metricScore.textContent = score;
        elements.metricScore.parentElement.className = `metric-pill ${score > 60 ? 'danger' : score > 30 ? 'warning' : 'success'}`;
        
        elements.metricIteration.textContent = iterationCount;
        
        elements.metricMastery.textContent = mastered ? 'YES' : 'NO';
        elements.metricMastery.parentElement.className = `metric-pill ${mastered ? 'success' : 'warning'}`;
    }
    
    function updateSnapshot(scores = null) {
        const c = CURRICULUM.concepts[0]; // Simplified for demo
        elements.snapshotTitle.textContent = `Concept: ${c.name}`;
        
        if (scores && scores[c.id]) {
            const p = (scores[c.id].correct / scores[c.id].total) * 100;
            elements.conceptBars.innerHTML = `
                <div class="snapshot-concept">
                    <span>Accuracy</span>
                    <div class="concept-bar-wrap">
                        <div class="concept-bar-fill" style="width: ${p}%; background: ${p>70?'var(--green)':'var(--orange)'}"></div>
                    </div>
                </div>
            `;
        } else {
            elements.conceptBars.innerHTML = `
                 <div class="snapshot-concept">
                    <span>Accuracy</span>
                    <div class="concept-bar-wrap"><div class="concept-bar-fill" style="width: 0%;"></div></div>
                </div>
            `;
        }
    }

    async function runDemo() {
        elements.btnStartDemo.disabled = true;
        elements.btnStartDemo.textContent = 'Running Demo...';
        
        resetUI();
        currentQuestionIndex = 1; // Load q2 (discriminant)
        loadQuestion(currentQuestionIndex);
        
        // Simulate thinking
        await new Promise(r => setTimeout(r, 1000));
        
        // Simulate hesitation
        elements.btnHesitate.click();
        await new Promise(r => setTimeout(r, 1500));
        
        // Simulate wrong answer (selecting option B - common mistake)
        const wrongOptionBtn = Array.from(elements.optionsContainer.children)[1]; // Option B is index 1
        wrongOptionBtn.click();
        
        setTimeout(() => {
            elements.btnStartDemo.disabled = false;
            elements.btnStartDemo.textContent = '▶ Start Demo';
        }, 5000);
    }

    init();
});

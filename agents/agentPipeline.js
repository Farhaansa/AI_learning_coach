// agentPipeline.js — Orchestrates all 7 agents in sequence
import { BehaviorAgent } from './behaviorAgent.js';
import { StruggleAgent } from './struggleAgent.js';
import { DiagnosisAgent } from './diagnosisAgent.js';
import { InterventionAgent } from './interventionAgent.js';
import { TutorAgent } from './tutorAgent.js';
import { EvaluationAgent } from './evaluationAgent.js';
import { ValidationAgent } from './validationAgent.js';

export class AgentPipeline {
  constructor(onAgentUpdate, onPipelineComplete) {
    this.onAgentUpdate = onAgentUpdate;
    this.onPipelineComplete = onPipelineComplete;

    this.behavior = new BehaviorAgent();
    this.struggle = new StruggleAgent();
    this.diagnosis = new DiagnosisAgent();
    this.intervention = new InterventionAgent();
    this.tutor = new TutorAgent();
    this.evaluation = new EvaluationAgent();
    this.validation = new ValidationAgent();

    this.sessionHistory = [];
    this.iterationCount = 0;
  }

  async emit(agentId, status, output, detail = null) {
    this.onAgentUpdate({ agentId, status, output, detail });
    await this._delay(status === 'analyzing' ? 400 : 150);
  }

  _delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  async runCycle(studentEvent) {
    this.iterationCount++;
    const iteration = this.iterationCount;
    const results = {};

    // ── 1. BEHAVIOR ANALYSIS ──────────────────────────────────────────────────
    await this.emit('behavior', 'analyzing', 'Collecting behavior signals...', null);
    const behaviorData = this.behavior.analyze(studentEvent);
    results.behavior = behaviorData;
    await this.emit('behavior', 'done', `Behavior vector computed`, {
      logs: [
        `⏱ Response time: ${behaviorData.responseTime}ms`,
        `❌ Error rate: ${(behaviorData.errorRate * 100).toFixed(0)}%`,
        `🔁 Hesitation count: ${behaviorData.hesitationCount}`,
        `📋 Hint requests: ${behaviorData.hintRequests}`,
        `📊 Confidence score: ${behaviorData.confidence}/10`
      ]
    });

    // ── 2. STRUGGLE DETECTION ────────────────────────────────────────────────
    await this.emit('struggle', 'analyzing', 'Detecting struggle patterns...', null);
    const struggleData = this.struggle.detect(behaviorData, this.sessionHistory);
    results.struggle = struggleData;
    await this.emit('struggle', 'done', `Struggle score: ${struggleData.score}/100`, {
      logs: [
        `🌡 Struggle Level: ${struggleData.level} (${struggleData.score}/100)`,
        `📈 Trend: ${struggleData.trend}`,
        `🔍 Trigger: ${struggleData.triggerReason}`,
        struggleData.score >= 40 ? `⚠️ Intervention threshold EXCEEDED` : `✅ Within acceptable range`
      ]
    });

    // ── 3. DIAGNOSIS ──────────────────────────────────────────────────────────
    await this.emit('diagnosis', 'analyzing', 'Running root cause analysis...', null);
    const diagnosisData = this.diagnosis.analyze(struggleData, studentEvent, this.sessionHistory);
    results.diagnosis = diagnosisData;
    await this.emit('diagnosis', 'done', `Root cause: ${diagnosisData.rootCause}`, {
      logs: [
        `🧩 Root Cause: ${diagnosisData.rootCause}`,
        `📌 Concept Gap: ${diagnosisData.conceptGap}`,
        `🔬 Pattern: ${diagnosisData.pattern}`,
        `💯 Confidence in diagnosis: ${diagnosisData.confidence}%`
      ]
    });

    // ── 4. INTERVENTION SELECTION ─────────────────────────────────────────────
    await this.emit('intervention', 'analyzing', 'Selecting optimal strategy...', null);
    const interventionData = this.intervention.select(diagnosisData, studentEvent, this.sessionHistory);
    results.intervention = interventionData;
    await this.emit('intervention', 'done', `Strategy: "${interventionData.strategy}"`, {
      logs: [
        `🎯 Strategy: ${interventionData.strategy}`,
        `📚 Method: ${interventionData.method}`,
        `🔄 Adaptation: ${interventionData.adaptation}`,
        `📊 Expected uplift: +${interventionData.expectedUplift}%`
      ]
    });

    // ── 5. AI TUTOR ───────────────────────────────────────────────────────────
    await this.emit('tutor', 'analyzing', 'Generating personalized coaching...', null);
    const tutorData = this.tutor.coach(interventionData, diagnosisData, studentEvent);
    results.tutor = tutorData;
    await this.emit('tutor', 'done', 'Coaching content ready ✓', {
      logs: [
        `📝 Mode: ${tutorData.mode}`,
        `🗣 Tone: ${tutorData.tone}`,
        `📦 Content blocks: ${tutorData.contentBlocks.length}`,
        `⏳ Est. read time: ${tutorData.readTime}s`
      ]
    });

    // ── 6. EVALUATION ─────────────────────────────────────────────────────────
    await this.emit('evaluation', 'analyzing', 'Measuring learning outcome...', null);
    const evalData = this.evaluation.measure(studentEvent, this.sessionHistory, iteration);
    results.evaluation = evalData;
    await this.emit('evaluation', 'done', `Score: ${evalData.score}% (Δ${evalData.delta > 0 ? '+' : ''}${evalData.delta}%)`, {
      logs: [
        `📊 Current Score: ${evalData.score}%`,
        `📈 Delta: ${evalData.delta > 0 ? '+' : ''}${evalData.delta}%`,
        `🔁 Iterations: ${iteration}`,
        `🎯 Mastery: ${evalData.mastered ? '✅ ACHIEVED' : '⏳ In progress'}`
      ]
    });

    // ── 7. VALIDATION CHECKLIST ───────────────────────────────────────────────
    await this.emit('validation', 'analyzing', 'Running validation checklist...', null);
    const validationData = this.validation.check(evalData, diagnosisData, studentEvent, this.sessionHistory);
    results.validation = validationData;
    await this.emit('validation', 'done',
      `${validationData.passed}/${validationData.total} criteria passed`,
      { logs: validationData.checklist.map(c => `${c.pass ? '✅' : '❌'} ${c.label}`) }
    );

    // Save to history
    this.sessionHistory.push({ iteration, studentEvent, ...results });

    // Notify complete
    this.onPipelineComplete({ iteration, results });
  }

  reset() {
    this.sessionHistory = [];
    this.iterationCount = 0;
    this.behavior.reset();
    this.struggle.reset();
    this.evaluation.reset();
  }
}

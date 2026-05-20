# Learning Coach & Intervention System

The **Learning Coach & Intervention System** is a simulated, browser-based multi-agent educational application. It is designed to track a student's learning behaviors, diagnose the root causes of their struggles, and deliver highly personalized interventions to improve learning outcomes.

This project is built using vanilla HTML, CSS, and JavaScript. It currently utilizes an "Expert System" architecture (rule-based heuristics, decision trees, and templates) to simulate AI reasoning without requiring a backend server or an active LLM API connection.

---

## ⚙️ How It Works

The application operates as a single-page web app (SPA) featuring a 3-panel layout that visually demonstrates the flow of data.

### 1. The 3-Panel User Interface
*   **Left Panel (Student Simulator):** Acts as the interface for the student. It presents multiple-choice questions and tracks behavioral signals such as response time, hesitation, incorrect answers, and hint requests.
*   **Center Panel (Agent Pipeline):** Visualizes the internal "thought process" of the system. It displays 7 distinct agents lighting up sequentially as data flows through the pipeline.
*   **Right Panel (Coaching & Diff Viewer):** Displays the final outputs. It presents the generated AI Tutor content and features a "Knowledge State Diff Viewer" highlighting exactly what misconceptions were removed and what understandings were solidified.

### 2. The 7-Agent Pipeline
When a student interacts with the simulator (e.g., answers incorrectly or requests a hint), an orchestrator (`AgentPipeline`) triggers the following sequence:

1.  **Behavior Agent:** Ingests raw interaction data (clicks, time spent) and computes a structured "behavior vector" and confidence score.
2.  **Struggle Agent:** Analyzes the behavior vector against historical data to compute a definitive "Struggle Score" (0–100) and establish a performance trend.
3.  **Diagnosis Agent:** Performs Root Cause Analysis based on the struggle score and specific wrong answers (e.g., *Conceptual Misconception*, *Knowledge Gap*).
4.  **Intervention Agent:** Maps the diagnosed root cause to the optimal pedagogical strategy (e.g., *Scaffolded Explanation*).
5.  **Tutor Agent:** Generates personalized educational content using emojis, encouraging tones, and analogies based on the selected intervention strategy.
6.  **Evaluation Agent:** Measures the improvement differential (Delta %) after an intervention is delivered.
7.  **Validation Agent:** Runs an 8-point checklist to confirm if the student has met the criteria for "Mastery."

---

## 📂 Project Components

The project is organized into the following directory structure:

\`\`\`text
learning-coach/
├── index.html              # Main application shell and UI layout
├── style.css               # Design system (deep space theme, glassmorphism)
├── main.js                 # Frontend logic bridging the UI and the agents
├── data/
│   └── curriculum.js       # Hardcoded dataset containing concepts, questions, and misconceptions
└── agents/
    ├── agentPipeline.js    # Orchestrates the sequential firing of all 7 agents
    ├── behaviorAgent.js    # Tracks student response metrics
    ├── struggleAgent.js    # Calculates the struggle score
    ├── diagnosisAgent.js   # Determines the root cause of errors
    ├── interventionAgent.js# Selects the teaching strategy
    ├── tutorAgent.js       # Generates coaching content
    ├── evaluationAgent.js  # Measures learning outcomes
    └── validationAgent.js  # Validates mastery criteria
\`\`\`

---

## 🚀 How to Run the Project

Because the project uses modern ES Modules (\`import\` and \`export\` syntax in JavaScript), opening the \`index.html\` file directly by double-clicking it will cause Cross-Origin Resource Sharing (CORS) errors in your browser. 

You must serve the files using a local web server. Follow these steps:

### Step 1: Open Your Terminal
Open PowerShell, Command Prompt, or your preferred terminal application.

### Step 2: Navigate to the Project Folder
Use the \`cd\` command to navigate to the project directory:
\`\`\`powershell
cd C:\Users\yasme\.gemini\antigravity\scratch\learning-coach
\`\`\`

### Step 3: Start a Local Web Server
You can start a lightweight server using Python or Node.js.

**If you have Python installed (Recommended for Windows):**
\`\`\`powershell
python -m http.server 8080
\`\`\`

**If you have Node.js installed:**
\`\`\`powershell
npx http-server -p 8080
\`\`\`

### Step 4: Open the Application in Your Browser
Once the terminal indicates the server is running, open your web browser (Chrome, Edge, Firefox, etc.) and navigate to:
**http://localhost:8080**

### Step 5: Interact with the Demo
*   **Run Automated Demo:** Click the blue **"▶ Start Demo"** button in the top right corner. The system will automatically simulate a student getting a question wrong and trigger the 7-agent pipeline.
*   **Try it Manually:** 
    *   Click **"🤔 Hesitate"** or **"💡 Request Hint"** in the left panel.
    *   Select a multiple-choice option (try picking a wrong one on purpose).
    *   Watch the Agent Pipeline process your behavior and generate custom coaching on the right.

### Step 6: Stop the Server
When you are finished testing the application, return to your terminal window and press \`Ctrl + C\` to stop the local web server.

const screens = document.querySelectorAll('.screen');
const navTabs = document.querySelectorAll('.nav-tab');

function showScreen(screenId) {
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId)?.classList.add('active');

    navTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-screen') === screenId) {
            tab.classList.add('active');
        }
    });

    if (screenId === 'generate') {
        simulateProgress();
    }
}

navTabs.forEach(tab => {
    tab.addEventListener('click', () => showScreen(tab.getAttribute('data-screen')));
});

function copyToClipboard(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅';
        setTimeout(() => { btn.innerHTML = originalText; }, 1500);
    });
}

// --- Generation Simulation ---
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const generationLog = document.getElementById('generationLog');
const viewResultsBtn = document.getElementById('viewResultsBtn');
let simulationInterval;

function typeLog(line, onComplete) {
    let i = 0;
    const logElement = document.createElement('div');
    logElement.className = line.type === 'success' ? 'log-line success' : 'log-line info';
    generationLog.appendChild(logElement);
    
    const typing = setInterval(() => {
        if (i < line.text.length) {
            logElement.innerHTML = line.text.substring(0, i + 1) + '<span class="cursor"></span>';
            i++;
        } else {
            clearInterval(typing);
            logElement.innerHTML = line.text;
            if (onComplete) onComplete();
        }
         generationLog.scrollTop = generationLog.scrollHeight;
    }, 30);
}

function simulateProgress() {
    clearInterval(simulationInterval);
    progressFill.style.width = '0%';
    progressText.textContent = 'Initializing...';
    generationLog.innerHTML = '';
    viewResultsBtn.style.display = 'none';

    const steps = [
        { percent: 25, log: { text: "Parsing API specification...", type: 'info' } },
        { percent: 25, log: { text: "Found 3 endpoints: /users, /users/{id}, /users/{id}", type: 'success' } },
        { percent: 50, log: { text: "Generating Happy Path & Validation tests...", type: 'info' } },
        { percent: 75, log: { text: "Crafting Security tests (SQLi, Auth)...", type: 'info' } },
        { percent: 100, log: { text: "Finalizing Edge Cases and exporting...", type: 'info' } },
        { percent: 100, log: { text: "Generation complete!", type: 'success' } }
    ];
    
    let currentStep = 0;
    function nextStep() {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            progressFill.style.width = step.percent + '%';
            progressText.textContent = step.log.text;
            typeLog(step.log, () => {
                currentStep++;
                setTimeout(nextStep, 500);
            });
        } else {
            viewResultsBtn.style.display = 'inline-block';
        }
    }
    nextStep();
}

// Set initial screen
document.addEventListener('DOMContentLoaded', () => showScreen('input'));
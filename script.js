document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables ---
    const screens = document.querySelectorAll('.screen');
    const navTabs = document.querySelectorAll('.nav-tab');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfoDiv = document.getElementById('fileInfo');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const generationLog = document.getElementById('generationLog');
    const viewResultsBtn = document.getElementById('viewResultsBtn');

    // --- Screen Navigation ---
    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            activeScreen.classList.add('active');
        }

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

    // Make functions globally accessible for inline onclick attributes in the HTML
    window.showScreen = showScreen;

    // --- Copy to Clipboard ---
    function copyToClipboard(btn, text) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅';
            setTimeout(() => { btn.innerHTML = originalText; }, 1500);
        });
    }
    window.copyToClipboard = copyToClipboard;

    // --- File Upload Functionality ---
    async function handleFile(file) {
        if (!file) return;

        fileInfoDiv.textContent = `Processing file: ${file.name}...`;
        fileInfoDiv.style.display = 'block';

        const reader = new FileReader();

        reader.onload = async (event) => {
            const fileContent = event.target.result;
            
            try {
                // IMPORTANT: Replace with your actual Render URL
                const serverUrl = 'https://smartapitest.onrender.com/';
                
                const response = await fetch(serverUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ openapi_spec: fileContent }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Something went wrong on the server.');
                }

                const data = await response.json();
                
                fileInfoDiv.textContent = `Successfully generated ${data.testCases.length} test cases!`;
                console.log("Generated Test Cases:", data.testCases); 
                
                // TODO: Add your logic here to take the test cases from `data.testCases` 
                // and display them in the "Results" screen UI.

            } catch (error) {
                fileInfoDiv.textContent = `Error: ${error.message}`;
                console.error('Failed to generate test cases:', error);
            }
        };
        
        reader.readAsText(file);
    }

    if (uploadArea) {
        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (event) => {
            event.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFile(files[0]);
            }
        });
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                handleFile(fileInput.files[0]);
            }
        });
    }

    // --- Generation Simulation (Placeholder) ---
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
        if (window.simulationInterval) clearInterval(window.simulationInterval);
        
        progressFill.style.width = '0%';
        progressText.textContent = 'Initializing...';
        generationLog.innerHTML = '';
        viewResultsBtn.style.display = 'none';

        const steps = [
            { percent: 25, log: { text: "Parsing API specification...", type: 'info' } },
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

    // Set initial screen on page load
    showScreen('input');
});

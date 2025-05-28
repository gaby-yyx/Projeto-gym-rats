document.addEventListener('DOMContentLoaded', () => {
    const webcamFeed = document.getElementById('webcam-feed');
    const overlayCanvas = document.getElementById('overlay-canvas');
    const correctionLinesOverlay = document.getElementById('correction-lines-overlay');
    const toggleCameraButton = document.getElementById('toggle-camera-btn');
    const startMonitoringBtn = document.getElementById('start-monitoring-btn');
    const stopMonitoringBtn = document.getElementById('stop-monitoring-btn');
    const feedbackMessage = document.getElementById('feedback-message');
    const repCounter = document.getElementById('rep-counter');
    const formStatus = document.getElementById('form-status');
    const notificationToast = document.getElementById('notification-toast');

    let currentStream = null;
    let cameraFacingMode = 'user';
    let monitoringInterval = null;
    let reps = 0;
    let isMonitoring = false;
    let isAtBottom = false;
    let isAtTop = false;
    let exerciseStage = 'waiting'; // 'waiting', 'firstSet', 'corrections', 'secondSet', 'finished'
    let firstSetData = []; // Array para armazenar dados da primeira série para análise (simulado)
    let corrections = []; // Array para armazenar as correções identificadas (simulado)
    let audioFeedback = null; // Objeto para controlar a síntese de fala

    // Elementos das linhas de correção (inicialmente escondidos)
    const lineShoulders = document.createElement('div');
    lineShoulders.classList.add('correction-line', 'line-shoulders');
    const lineElbows = document.createElement('div');
    lineElbows.classList.add('correction-line', 'line-elbows');
    const lineWrists = document.createElement('div');
    lineWrists.classList.add('correction-line', 'line-wrists');

    correctionLinesOverlay.appendChild(lineShoulders);
    correctionLinesOverlay.appendChild(lineElbows);
    correctionLinesOverlay.appendChild(lineWrists);

    const showToast = (message, duration = 3000) => {
        notificationToast.textContent = message;
        notificationToast.classList.add('show');
        setTimeout(() => {
            notificationToast.classList.remove('show');
        }, duration);
    };

    const startWebcam = async (facingMode) => {
        console.log(`Tentando iniciar a webcam com facingMode: ${facingMode}`);
        if (currentStream) {
            console.log('Parando a stream anterior.');
            currentStream.getTracks().forEach(track => track.stop());
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            console.log('Stream da webcam obtida com sucesso.');
            webcamFeed.srcObject = stream;
            currentStream = stream;
            webcamFeed.onloadedmetadata = () => {
                overlayCanvas.width = webcamFeed.videoWidth;
                overlayCanvas.height = webcamFeed.videoHeight;
                const aspectRatio = webcamFeed.videoHeight / webcamFeed.videoWidth;
                webcamFeed.parentElement.style.paddingTop = `${aspectRatio * 100}%`;
                showToast(`Câmera ${facingMode === 'user' ? 'frontal' : 'traseira'} ativada.`);
            };
        } catch (err) {
            console.error("Erro ao acessar a webcam: ", err);
            showToast("Não foi possível acessar a câmera. Verifique as permissões.", 5000);
            feedbackMessage.textContent = "Erro: Câmera não acessível.";
            feedbackMessage.className = "feedback-message feedback-error";
        }
    };

    toggleCameraButton.addEventListener('click', () => {
        cameraFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';
        startWebcam(cameraFacingMode);
    });

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            if (!audioFeedback) {
                audioFeedback = new SpeechSynthesisUtterance();
                audioFeedback.lang = 'pt-BR';
            }
            audioFeedback.text = text;
            window.speechSynthesis.speak(audioFeedback);
        } else {
            console.log('A síntese de fala não é suportada neste navegador.');
            showToast('Feedback de áudio não suportado.', 3000);
        }
    };

    const analyzeRepetition = (/* videoData */) => {
        // *** SIMULAÇÃO DE ANÁLISE PARA PROPÓSITO ILUSTRATIVO ***
        const movementDetected = Math.random() > 0.5;
        const reachedTop = Math.random() > 0.7 && movementDetected;
        const reachedBottom = Math.random() < 0.3 && movementDetected;
        const formIssue = Math.random() < 0.3 ? (Math.random() < 0.5 ? 'elevação_excessiva' : 'cotovelos_flexionados') : null;

        return { reachedTop, reachedBottom, formIssue };
    };

    const processFrame = () => {
        if (!isMonitoring || !webcamFeed.videoWidth) return;

        // *** SIMULAÇÃO DE ANÁLISE POR FRAME PARA A PRIMEIRA SÉRIE ***
        if (exerciseStage === 'firstSet') {
            const analysisResult = analyzeRepetition();
            firstSetData.push(analysisResult); // Simula coleta de dados

            if (analysisResult.reachedTop && isAtBottom) {
                reps++;
                repCounter.textContent = `Repetições: ${reps}`;
                isAtTop = true;
                isAtBottom = false;
            } else if (analysisResult.reachedBottom) {
                isAtBottom = true;
                isAtTop = false;
            }

            if (reps >= 10) {
                clearInterval(monitoringInterval);
                isMonitoring = false;
                exerciseStage = 'corrections';
                feedbackMessage.textContent = "Analisando suas repetições...";
                setTimeout(() => {
                    // *** SIMULAÇÃO DA ANÁLISE DA PRIMEIRA SÉRIE E GERAÇÃO DE CORREÇÕES ***
                    let issues = {};
                    firstSetData.forEach(data => {
                        if (data.formIssue) {
                            issues[data.formIssue] = (issues[data.formIssue] || 0) + 1;
                        }
                    });

                    corrections = [];
                    if (issues['elevação_excessiva'] > firstSetData.length / 2) {
                        corrections.push('Não eleve os braços acima dos ombros.');
                    }
                    if (issues['cotovelos_flexionados'] > firstSetData.length / 2) {
                        corrections.push('Mantenha os cotovelos levemente flexionados.');
                    }

                    let feedbackText = "Você completou a primeira série. ";
                    if (corrections.length > 0) {
                        feedbackText += "As correções são: " + corrections.join(', ') + ". ";
                    } else {
                        feedbackText += "Sua forma parece boa. ";
                    }
                    feedbackText += "Vamos para a próxima série com guias visuais.";

                    feedbackMessage.textContent = "Correções identificadas. Preparando feedback de áudio.";
                    speak(feedbackText);

                    setTimeout(() => {
                        exerciseStage = 'secondSet';
                        reps = 0;
                        repCounter.textContent = `Repetições: ${reps}`;
                        feedbackMessage.textContent = "Iniciando a segunda série com guias visuais.";
                        startSecondSetGuidance();
                    }, 6000); // Tempo para o feedback de áudio
                }, 3000); // Tempo para análise simulada
            }
        } else if (exerciseStage === 'secondSet') {
            const analysisResult = analyzeRepetition();

            if (analysisResult.reachedTop && isAtBottom) {
                reps++;
                repCounter.textContent = `Repetições: ${reps}`;
                isAtTop = true;
                isAtBottom = false;
            } else if (analysisResult.reachedBottom) {
                isAtBottom = true;
                isAtTop = false;
            }

            // Exibir as linhas de correção com base nas 'corrections'
            lineShoulders.classList.remove('show');
            lineElbows.classList.remove('show');

            if (corrections.includes('Não eleve os braços acima dos ombros.')) {
                lineShoulders.classList.add('show');
                lineShoulders.style.backgroundColor = 'red';
                lineShoulders.style.top = '15%'; // Ajuste a posição conforme necessário
            }
            if (corrections.includes('Mantenha os cotovelos levemente flexionados.')) {
                lineElbows.classList.add('show');
                lineElbows.style.backgroundColor = 'yellow';
                lineElbows.style.top = '55%'; // Ajuste a posição conforme necessário
            }

            if (reps >= 10) {
                clearInterval(monitoringInterval);
                isMonitoring = false;
                exerciseStage = 'finished';
                feedbackMessage.textContent = "Você completou as 20 repetições!";
                speak("Parabéns! Você completou o exercício.");
                startMonitoringBtn.classList.remove('hidden');
                stopMonitoringBtn.classList.add('hidden');
                // Resetar o estado para um próximo uso
                exerciseStage = 'waiting';
                reps = 0;
                repCounter.textContent = `Repetições: ${reps}`;
                formStatus.textContent = "Forma: Neutra";
                formStatus.className = "status-neutral";
                lineShoulders.classList.remove('show');
                lineElbows.classList.remove('show');
                lineWrists.classList.remove('show');
            }
        }
    };

    const startFirstSet = () => {
        if (!currentStream) {
            showToast("Ative a câmera primeiro.", 3000);
            return;
        }
        if (exerciseStage === 'waiting') {
            exerciseStage = 'firstSet';
            reps = 0;
            repCounter.textContent = `Repetições: ${reps}`;
            feedbackMessage.textContent = "Iniciando a primeira série. Faça 10 repetições.";
            isMonitoring = true;
            startMonitoringBtn.classList.add('hidden');
            stopMonitoringBtn.classList.remove('hidden');
            monitoringInterval = setInterval(processFrame, 100); // Analisar frames frequentemente (simulado)
            firstSetData = []; // Limpar dados da série anterior
            corrections = []; // Limpar correções anteriores
            lineShoulders.classList.remove('show');
            lineElbows.classList.remove('show');
            lineWrists.classList.remove('show');
        }
    };

    const startSecondSetGuidance = () => {
        reps = 0;
        repCounter.textContent = `Repetições: ${reps}`;
        feedbackMessage.textContent = "Iniciando a segunda série com guias visuais. Faça 10 repetições.";
        isMonitoring = true;
        monitoringInterval = setInterval(processFrame, 100);
        // As linhas de correção são controladas dentro da função processFrame na fase 'secondSet'
    };

    stopMonitoringBtn.addEventListener('click', () => {
        if (isMonitoring) {
            clearInterval(monitoringInterval);
            isMonitoring = false;
            startMonitoringBtn.classList.remove('hidden');
            stopMonitoringBtn.classList.add('hidden');
            feedbackMessage.textContent = "Monitoramento parado.";
            exerciseStage = 'waiting'; // Resetar o estado
            reps = 0;
            repCounter.textContent = `Repetições: ${reps}`;
            formStatus.textContent = "Forma: Neutra";
            formStatus.className = "status-neutral";
            lineShoulders.classList.remove('show');
            lineElbows.classList.remove('show');
            lineWrists.classList.remove('show');
            if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        }
    });

    startMonitoringBtn.addEventListener('click', startFirstSet);

    startWebcam(cameraFacingMode);
});
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
    let firstSetData = []; // Array para armazenar dados da primeira série para análise
    let corrections = []; // Array para armazenar as correções identificadas
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
        // ... (mesma implementação da função startWebcam) ...
    };

    toggleCameraButton.addEventListener('click', () => {
        // ... (mesma implementação do evento de alternar câmera) ...
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

    const analyzeRepetition = (videoData) => {
        // *** Lógica de ANÁLISE DE VÍDEO REAL AQUI ***
        // Esta função receberia dados do vídeo (pontos chave do corpo, ângulos, etc.)
        // e determinaria se uma repetição foi concluída e se houve erros na forma.

        // *** SIMULAÇÃO BÁSICA PARA PROPÓSITO ILUSTRATIVO ***
        const movementDetected = Math.random() > 0.5; // Simula detecção de movimento
        const reachedTop = Math.random() > 0.7 && movementDetected;
        const reachedBottom = Math.random() < 0.3 && movementDetected;
        const formIssue = Math.random() < 0.2 ? 'elevação_excessiva' : null;

        return { reachedTop, reachedBottom, formIssue };
    };

    const processFrame = () => {
        if (!isMonitoring || !webcamFeed.videoWidth) return;

        // *** Obter dados do frame da webcam para análise (usando uma biblioteca de análise de vídeo) ***
        // const videoData = captureVideoData(webcamFeed);

        // *** SIMULAÇÃO DE ANÁLISE PARA PROPÓSITO ILUSTRATIVO ***
        const analysisResult = analyzeRepetition(/* videoData */);

        if (exerciseStage === 'firstSet') {
            // Armazenar dados para análise posterior
            // firstSetData.push(analysisResult);

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
                    // *** Lógica para ANALISAR 'firstSetData' e gerar 'corrections' ***
                    corrections = ['Não eleve os braços acima dos ombros.', 'Mantenha os cotovelos levemente flexionados.'];
                    feedbackMessage.textContent = "Correções identificadas. Preparando feedback de áudio.";
                    speak("Você completou a primeira série. As correções são: " + corrections.join(', ') + ". Vamos para a próxima série com guias visuais.");
                    setTimeout(() => {
                        exerciseStage = 'secondSet';
                        reps = 0;
                        repCounter.textContent = `Repetições: ${reps}`;
                        feedbackMessage.textContent = "Iniciando a segunda série com guias visuais.";
                        startSecondSetGuidance();
                    }, 5000); // Tempo para o feedback de áudio
                }, 3000); // Tempo para análise
            }
        } else if (exerciseStage === 'secondSet') {
            // *** Lógica de ANÁLISE DE VÍDEO REAL E APLICAÇÃO DAS CORREÇÕES VISUAIS AQUI ***
            // Com base em 'corrections', você ajustaria a posição e visibilidade das 'correction-lines'.

            // *** SIMULAÇÃO BÁSICA PARA PROPÓSITO ILUSTRATIVO ***
            if (analysisResult.reachedTop && isAtBottom) {
                reps++;
                repCounter.textContent = `Repetições: ${reps}`;
                isAtTop = true;
                isAtBottom = false;
            } else if (analysisResult.reachedBottom) {
                isAtBottom = true;
                isAtTop = false;
            }

            // Simulação de exibição das linhas de correção (baseado nas correções)
            if (corrections.includes('Não eleve os braços acima dos ombros.')) {
                lineShoulders.classList.add('show');
                lineShoulders.style.backgroundColor = 'red';
            } else {
                lineShoulders.classList.remove('show');
            }
            if (corrections.includes('Mantenha os cotovelos levemente flexionados.')) {
                lineElbows.classList.add('show');
                lineElbows.style.backgroundColor = 'yellow'; // Cor diferente para distinguir
            } else {
                lineElbows.classList.remove('show');
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
            monitoringInterval = setInterval(processFrame, 100); // Analisar frames frequentemente
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
        // Exibir as linhas de correção com base nas 'corrections'
        if (corrections.includes('Não eleve os braços acima dos ombros.')) {
            lineShoulders.classList.add('show');
            lineShoulders.style.backgroundColor = 'red';
        }
        if (corrections.includes('Mantenha os cotovelos levemente flexionados.')) {
            lineElbows.classList.add('show');
            lineElbows.style.backgroundColor = 'yellow';
        }
        // Adicione lógica para outras correções e linhas visuais conforme necessário
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
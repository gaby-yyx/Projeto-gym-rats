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
    let cameraFacingMode = 'user'; // 'user' para frontal, 'environment' para traseira
    let monitoringInterval = null;
    let reps = 0;
    let isMonitoring = false;
    let isAtBottom = false; // Flag para detectar o ponto mais baixo do exercício
    let isAtTop = false;    // Flag para detectar o ponto mais alto do exercício
    
    // Elementos das linhas de correção (simuladas)
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

    // Função para iniciar a webcam
    const startWebcam = async (facingMode) => {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            webcamFeed.srcObject = stream;
            currentStream = stream;
            // Ajusta o canvas para o tamanho do vídeo
            webcamFeed.onloadedmetadata = () => {
                overlayCanvas.width = webcamFeed.videoWidth;
                overlayCanvas.height = webcamFeed.videoHeight;
                // Ajusta a proporção do container do vídeo também
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

    // Alternar entre câmera frontal e traseira
    toggleCameraButton.addEventListener('click', () => {
        cameraFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';
        startWebcam(cameraFacingMode);
    });

    // Função de simulação do monitoramento (IA aqui)
    const simulateMonitoring = () => {
        // Esta é a parte "mágica" onde uma IA de verdade processaria o vídeo.
        // Para o protótipo, vamos simular feedback e repetições.

        // Simulação de detecção de movimento para contagem de repetições
        // Imagine que detectamos os cotovelos subindo e descendo
        const randomValue = Math.random();

        // Simulação de ponto mais baixo (braços abaixados)
        if (randomValue < 0.2 && !isAtBottom) {
            isAtBottom = true;
            isAtTop = false;
            // Exibir dicas para início do movimento ou braços muito baixos
            feedbackMessage.textContent = "Início do movimento. Suba os halteres controladamente!";
            feedbackMessage.className = "feedback-message feedback-correct";
            formStatus.textContent = "Forma: Boa";
            formStatus.className = "status-good";

            // Mostrar linhas de referência para o ponto mais baixo (braços quase na linha do quadril)
            lineShoulders.classList.remove('show');
            lineElbows.classList.remove('show'); // Esconde as linhas superiores
            lineWrists.classList.add('show'); // Linha para pulsos/mãos no ponto baixo
            lineWrists.style.top = '80%'; // Ajusta a posição
            lineWrists.style.backgroundColor = 'var(--color-yellow)';

        } 
        // Simulação de ponto mais alto (braços elevados)
        else if (randomValue > 0.8 && !isAtTop && isAtBottom) {
            isAtTop = true;
            isAtBottom = false;
            reps++;
            repCounter.textContent = `Repetições: ${reps}`;
            feedbackMessage.textContent = "Ótimo! Braços paralelos ao chão. Mantenha os ombros relaxados.";
            feedbackMessage.className = "feedback-message feedback-correct";
            formStatus.textContent = "Forma: Ótima";
            formStatus.className = "status-good";

            // Mostrar linhas de referência para o ponto mais alto (braços paralelos ao chão)
            lineShoulders.classList.remove('show'); // Esconde a linha dos ombros
            lineElbows.classList.add('show'); // Linha para cotovelos na altura do ombro
            lineElbows.style.top = '50%';
            lineElbows.style.backgroundColor = 'var(--color-yellow)';
            lineWrists.classList.remove('show'); // Esconde a linha dos pulsos
        }
        // Simulação de erros comuns
        else if (randomValue > 0.5 && randomValue <= 0.6) {
            feedbackMessage.textContent = "Cuidado! Não eleve os braços acima dos ombros. Mantenha os cotovelos levemente flexionados.";
            feedbackMessage.className = "feedback-message feedback-warning";
            formStatus.textContent = "Forma: Atenção";
            formStatus.className = "status-bad";
            lineShoulders.classList.add('show'); // Mostra linha para ombro (indicando que está subindo demais)
            lineShoulders.style.backgroundColor = '#F44336'; // Vermelho
            lineElbows.classList.remove('show');
            lineWrists.classList.remove('show');
        } else if (randomValue > 0.6 && randomValue <= 0.7) {
            feedbackMessage.textContent = "Não use o trapézio! Concentre o movimento nos ombros.";
            feedbackMessage.className = "feedback-message feedback-error";
            formStatus.textContent = "Forma: Ruim";
            formStatus.className = "status-bad";
            // Pode-se adicionar uma linha superior para indicar elevação excessiva do trapézio
            lineShoulders.classList.add('show');
            lineShoulders.style.backgroundColor = '#F44336';
            lineElbows.classList.remove('show');
            lineWrists.classList.remove('show');
        } else if (randomValue > 0.7 && randomValue <= 0.8) {
            feedbackMessage.textContent = "Movimento muito rápido! Controle a descida do halter.";
            feedbackMessage.className = "feedback-message feedback-warning";
            formStatus.textContent = "Forma: Atenção";
            formStatus.className = "status-warning";
            // Não exibe linhas de correção nesse caso, pois é sobre velocidade.
            lineShoulders.classList.remove('show');
            lineElbows.classList.remove('show');
            lineWrists.classList.remove('show');
        } else {
            // Estado neutro ou boa execução em andamento
            if (feedbackMessage.classList.contains('feedback-initial')) {
                 feedbackMessage.textContent = "Ajuste-se à câmera e inicie o exercício!";
                 feedbackMessage.className = "feedback-message feedback-initial";
            } else if (feedbackMessage.classList.contains('feedback-warning') || feedbackMessage.classList.contains('feedback-error')) {
                 // Mantém a mensagem de erro até uma correção clara ou nova repetição
                 feedbackMessage.textContent = "Mantenha a forma correta!"; // Lembrete
                 feedbackMessage.className = "feedback-message feedback-warning";
                 lineShoulders.classList.remove('show');
                 lineElbows.classList.remove('show');
                 lineWrists.classList.remove('show');
            } else {
                 feedbackMessage.textContent = "Execute o movimento de elevação lateral de forma controlada.";
                 feedbackMessage.className = "feedback-message feedback-correct";
                 formStatus.textContent = "Forma: Boa";
                 formStatus.className = "status-good";
                 lineShoulders.classList.remove('show');
                 lineElbows.classList.remove('show');
                 lineWrists.classList.remove('show');
            }
        }
    };

    // Iniciar monitoramento
    startMonitoringBtn.addEventListener('click', () => {
        if (!currentStream) {
            showToast("Ative a câmera primeiro para iniciar o monitoramento.", 3000);
            return;
        }
        if (!isMonitoring) {
            reps = 0;
            repCounter.textContent = `Repetições: ${reps}`;
            feedbackMessage.textContent = "Iniciando monitoramento... Faça o exercício lentamente.";
            feedbackMessage.className = "feedback-message feedback-initial";
            formStatus.textContent = "Forma: Neutra";
            formStatus.className = "status-neutral";

            // Inicia a simulação da "IA" a cada X milissegundos
            monitoringInterval = setInterval(simulateMonitoring, 1500); // Roda a simulação a cada 1.5 segundos
            isMonitoring = true;
            startMonitoringBtn.classList.add('hidden');
            stopMonitoringBtn.classList.remove('hidden');
            showToast("Monitoramento iniciado!");
        }
    });

    // Parar monitoramento
    stopMonitoringBtn.addEventListener('click', () => {
        if (isMonitoring) {
            clearInterval(monitoringInterval);
            isMonitoring = false;
            startMonitoringBtn.classList.remove('hidden');
            stopMonitoringBtn.classList.add('hidden');
            feedbackMessage.textContent = "Monitoramento parado. Total de repetições: " + reps;
            feedbackMessage.className = "feedback-message feedback-initial";
            formStatus.textContent = "Forma: Neutra";
            formStatus.className = "status-neutral";
            // Esconde todas as linhas de correção
            lineShoulders.classList.remove('show');
            lineElbows.classList.remove('show');
            lineWrists.classList.remove('show');
            showToast("Monitoramento encerrado.");
        }
    });

    // Inicia a câmera frontal por padrão ao carregar a página
    startWebcam(cameraFacingMode);
});
document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('cameraFeed');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const canvasCtx = overlayCanvas.getContext('2d');
    const toggleCameraButton = document.getElementById('toggleCameraButton');
    const startStopButton = document.getElementById('startStopButton');
    const textFeedback = document.getElementById('textFeedback');
    const loadingIndicator = document.getElementById('loadingIndicator');

    let currentStream;
    let isMonitoring = false;
    let useFrontCamera = true; // Preferência inicial
    let animationFrameId;

    // Configurações para desenho e feedback (simulados)
    const idealArmAngle = 90; // Graus para elevação lateral
    const shoulderYPosition = 0.4; // % da altura do canvas (simulado)
    const handRadius = 10; // Raio para desenhar as mãos (simulado)

    // Inicializar a câmera ao carregar
    setupCamera();

    async function setupCamera() {
        loadingIndicator.style.display = 'flex';
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: useFrontCamera ? 'user' : 'environment',
                width: { ideal: 1280 }, // Solicita HD, mas o navegador pode ajustar
                height: { ideal: 720 }
            },
            audio: false
        };

        try {
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = currentStream;
            videoElement.onloadedmetadata = () => {
                // Ajusta o tamanho do canvas para o tamanho real do vídeo
                // Isso é importante para o desenho ser preciso sobre o vídeo
                overlayCanvas.width = videoElement.videoWidth;
                overlayCanvas.height = videoElement.videoHeight;
                loadingIndicator.style.display = 'none';
                if (isMonitoring) { // Se estava monitorando, reinicia o loop de desenho
                    startDrawingLoop();
                }
            };
        } catch (error) {
            console.error('Erro ao acessar a câmera:', error);
            textFeedback.textContent = 'Erro ao acessar câmera. Verifique as permissões.';
            loadingIndicator.style.display = 'none';
            speakFeedback('Erro ao acessar a câmera. Verifique as permissões.');
        }
    }

    toggleCameraButton.addEventListener('click', () => {
        useFrontCamera = !useFrontCamera;
        setupCamera();
        textFeedback.textContent = `Câmera ${useFrontCamera ? 'frontal' : 'traseira'} ativada.`;
    });

    startStopButton.addEventListener('click', () => {
        isMonitoring = !isMonitoring;
        if (isMonitoring) {
            startStopButton.innerHTML = '<i class="fas fa-stop"></i> Parar';
            textFeedback.textContent = 'Monitoramento iniciado. Prepare-se!';
            speakFeedback('Monitoramento iniciado. Prepare-se para a elevação lateral.');
            startDrawingLoop();
            // Aqui você iniciaria o modelo de IA (PoseNet, MoveNet, MediaPipe)
        } else {
            startStopButton.innerHTML = '<i class="fas fa-play"></i> Iniciar';
            textFeedback.textContent = 'Monitoramento pausado.';
            speakFeedback('Monitoramento pausado.');
            cancelAnimationFrame(animationFrameId);
            clearCanvas();
            // Aqui você pararia o modelo de IA
        }
    });

    function startDrawingLoop() {
        if (!isMonitoring) return;

        // Limpa o canvas antes de desenhar
        clearCanvas();

        // >>> INÍCIO DA SIMULAÇÃO DA IA E DESENHO <<<
        // Em uma aplicação real, aqui você obteria os pontos da pose da IA
        // e tomaria decisões baseadas neles.

        // Exemplo: Desenhar linhas guias para elevação lateral
        canvasCtx.strokeStyle = 'yellow';
        canvasCtx.lineWidth = 4;
        canvasCtx.fillStyle = 'yellow';
        canvasCtx.font = '18px Arial';
        canvasCtx.textAlign = 'center';

        const canvasWidth = overlayCanvas.width;
        const canvasHeight = overlayCanvas.height;

        // Linha de referência horizontal (altura dos ombros - simulado)
        const shoulderLineY = canvasHeight * shoulderYPosition;
        canvasCtx.beginPath();
        canvasCtx.moveTo(canvasWidth * 0.1, shoulderLineY);
        canvasCtx.lineTo(canvasWidth * 0.9, shoulderLineY);
        canvasCtx.stroke();
        canvasCtx.fillText('Altura Ideal', canvasWidth / 2, shoulderLineY - 10);

        // Posições simuladas das mãos (variaria com o movimento real)
        // Esses valores seriam derivados da IA
        const leftHandX = canvasWidth * 0.25; // Simulado
        const rightHandX = canvasWidth * 0.75; // Simulado
        let currentHandY = canvasHeight * 0.7; // Posição inicial simulada (braços para baixo)

        // Simular movimento de subida e descida para demonstração
        // Em um app real, isso viria da IA
        const time = Date.now() / 1000; // Tempo para animar
        const movementAmplitude = canvasHeight * 0.3;
        currentHandY = shoulderLineY + movementAmplitude * Math.sin(time * 1.5); // Simula subida e descida

        // Desenhar "mãos" simuladas
        canvasCtx.beginPath();
        canvasCtx.arc(leftHandX, currentHandY, handRadius, 0, Math.PI * 2);
        canvasCtx.fill();
        canvasCtx.beginPath();
        canvasCtx.arc(rightHandX, currentHandY, handRadius, 0, Math.PI * 2);
        canvasCtx.fill();

        // Desenhar linhas dos ombros (simulados) até as mãos
        const shoulderSimulatedXLeft = canvasWidth * 0.35;
        const shoulderSimulatedXRight = canvasWidth * 0.65;
        canvasCtx.beginPath();
        canvasCtx.moveTo(shoulderSimulatedXLeft, shoulderLineY);
        canvasCtx.lineTo(leftHandX, currentHandY);
        canvasCtx.stroke();
        canvasCtx.beginPath();
        canvasCtx.moveTo(shoulderSimulatedXRight, shoulderLineY);
        canvasCtx.lineTo(rightHandX, currentHandY);
        canvasCtx.stroke();


        // Lógica de feedback simulada (baseada na posição simulada de currentHandY)
        if (currentHandY < shoulderLineY - 20) { // Subiu demais (simulado)
            textFeedback.textContent = 'Atenção: Não ultrapasse a altura dos ombros!';
            speakFeedback('Muito alto!', true); // true para debouncing simples
            canvasCtx.strokeStyle = 'red'; // Mudar cor das linhas para indicar erro
        } else if (currentHandY > shoulderLineY + movementAmplitude * 0.8) { // Não subiu o suficiente (simulado)
            textFeedback.textContent = 'Eleve mais os braços, até a linha.';
            speakFeedback('Suba um pouco mais.', true);
        } else {
            textFeedback.textContent = 'Boa forma! Continue assim.';
            // Não falar "Boa forma" continuamente, talvez a cada X repetições corretas
        }
        // >>> FIM DA SIMULAÇÃO DA IA E DESENHO <<<

        animationFrameId = requestAnimationFrame(startDrawingLoop);
    }

    function clearCanvas() {
        canvasCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    let lastSpokenMessage = '';
    let lastSpokenTime = 0;
    const debounceSpeakTime = 3000; // Não repetir a mesma mensagem por 3s

    function speakFeedback(message, debounce = false) {
        if (debounce) {
            const now = Date.now();
            if (message === lastSpokenMessage && (now - lastSpokenTime) < debounceSpeakTime) {
                return; // Evita spam da mesma mensagem
            }
            lastSpokenMessage = message;
            lastSpokenTime = now;
        }

        try {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.lang = 'pt-BR';
                // Você pode configurar voz, tom, velocidade aqui se desejar
                // const voices = window.speechSynthesis.getVoices();
                // utterance.voice = voices.find(voice => voice.lang === 'pt-BR');
                window.speechSynthesis.speak(utterance);
            } else {
                console.warn('API de Síntese de Voz não suportada.');
            }
        } catch (e) {
            console.error("Erro na síntese de voz:", e);
        }
    }

    // Ajustar o aspect-ratio da camera-area com base no vídeo real, se necessário
    videoElement.addEventListener('loadedmetadata', () => {
        const cameraArea = document.querySelector('.camera-area');
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
            const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
            cameraArea.style.aspectRatio = `${aspectRatio}`;
        }
    });

});
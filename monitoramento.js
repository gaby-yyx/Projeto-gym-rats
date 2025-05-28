// Elementos do DOM
const cameraView = document.getElementById('cameraView');
const overlay = document.getElementById('overlay');
const iniciarCameraBtn = document.getElementById('iniciarCamera');
const cameraSelect = document.getElementById('cameraSelect');
const feedbackText = document.getElementById('feedbackText');
const repetirInstrucaoBtn = document.getElementById('repetirInstrucao');
const canvasContext = overlay.getContext('2d');

// Variáveis de estado
let cameraStream = null;
let exercicioIniciado = false;
let repetiçõesCorretas = 0;
const REPETICOES_PARA_AVALIAR = 5;

// Configurações do exercício (ângulos, etc.)
const ANGULO_OMBRO_MAXIMO = 90; // Exemplo
const ANGULO_TOLERANCIA = 15; // Exemplo

// Funções Auxiliares
function desenharLinhasGuia() {
    // **Lógica de desenho das linhas de guia na tela**
    // Isso vai depender da biblioteca de visão computacional que você usar
    // Exemplo simplificado (precisa de ajustes):
    canvasContext.clearRect(0, 0, overlay.width, overlay.height);
    canvasContext.strokeStyle = 'red';
    canvasContext.lineWidth = 2;

    // Linha horizontal (ombro)
    canvasContext.beginPath();
    canvasContext.moveTo(0, overlay.height / 2);
    canvasContext.lineTo(overlay.width, overlay.height / 2);
    canvasContext.stroke();

    // ... Outras linhas para guiar o movimento
}

function analisarPosicao(pose) {
    // **Lógica para analisar a posição do usuário (ângulos, etc.)**
    // Isso vai depender da biblioteca de visão computacional
    // Exemplo simplificado (PRECISA SER AJUSTADO):

    // Supondo que 'pose' contenha informações sobre os pontos-chave do corpo
    // (ombros, cotovelos, etc.)
    const anguloOmbroDireito = calcularAngulo(pose.ombroDireito, pose.cotoveloDireito, pose.quadrilDireito);
    const anguloOmbroEsquerdo = calcularAngulo(pose.ombroEsquerdo, pose.cotoveloEsquerdo, pose.quadrilEsquerdo);

    let feedback = "";
    if (anguloOmbroDireito > ANGULO_OMBRO_MAXIMO + ANGULO_TOLERANCIA ||
        anguloOmbroEsquerdo > ANGULO_OMBRO_MAXIMO + ANGULO_TOLERANCIA) {
        feedback = "Não eleve os braços acima da linha dos ombros.";
    } else if (anguloOmbroDireito < ANGULO_OMBRO_MAXIMO - ANGULO_TOLERANCIA ||
               anguloOmbroEsquerdo < ANGULO_OMBRO_MAXIMO - ANGULO_TOLERANCIA) {
        feedback = "Eleve os braços até a linha dos ombros.";
    } else {
        feedback = "Movimento correto!";
        repetiçõesCorretas++;
    }

    return feedback;
}

function calcularAngulo(ponto1, ponto2, ponto3) {
    // **Função para calcular o ângulo entre três pontos**
    // (Implementação matemática, pode usar bibliotecas)
    // Exemplo simplificado (PRECISA SER IMPLEMENTADO):
    return 0; // Substituir pela lógica correta
}

function falarFeedback(texto) {
    // **Lógica para o feedback de áudio (Web Speech API)**
    // Exemplo:
    const utterance = new SpeechSynthesisUtterance(texto);
    speechSynthesis.speak(utterance);
}

function atualizarFeedback(feedback) {
    feedbackText.textContent = feedback;
    falarFeedback(feedback);
}

function iniciarExercicio() {
    exercicioIniciado = true;
    repetiçõesCorretas = 0;
    atualizarFeedback("Inicie a elevação lateral.");
}

function avaliarExercicio() {
    if (repetiçõesCorretas >= REPETICOES_PARA_AVALIAR) {
        atualizarFeedback("Ótimo! Continue assim.");
    } else {
        atualizarFeedback("Vamos tentar novamente. Concentre-se na postura.");
        repetiçõesCorretas = 0; // Reiniciar contagem
    }
}

// Event Listeners
iniciarCameraBtn.addEventListener('click', async () => {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: cameraSelect.value },
            audio: false
        });
        cameraView.srcObject = cameraStream;
        cameraView.onloadedmetadata = () => {
            overlay.width = cameraView.videoWidth;
            overlay.height = cameraView.videoHeight;
        };
        iniciarExercicio();
    } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
        atualizarFeedback("Erro ao acessar a câmera. Verifique as permissões.");
    }
});

cameraSelect.addEventListener('change', () => {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    iniciarCameraBtn.click(); // Recarrega a câmera com a seleção
});

repetirInstrucaoBtn.addEventListener('click', () => {
    atualizarFeedback("Posicione-se de frente para a câmera. Eleve os braços até a linha dos ombros.");
});

// **Loop Principal (Animação do Frame)**
function mainLoop() {
    if (cameraView.srcObject && exercicioIniciado) {
        // **1. Obter a pose do usuário (Visão Computacional)**
        // (Isso é o mais complexo e precisa de uma biblioteca)
        // Exemplo simplificado:
        const pose = obterPose(cameraView); // Função fictícia!

        // 2. Analisar a posição e obter o feedback
        const feedback = analisarPosicao(pose);
        atualizarFeedback(feedback);

        // 3. Desenhar as linhas de guia
        desenharLinhasGuia();

        // 4. Se necessário, avaliar o exercício (a cada 5 repetições)
        if (repetiçõesCorretas % REPETICOES_PARA_AVALIAR === 0 && repetiçõesCorretas > 0) {
            avaliarExercicio();
        }
    }
    requestAnimationFrame(mainLoop);
}

mainLoop();


// **Funções Fictícias (Substituir pela Biblioteca de Visão Computacional)**
function obterPose(videoElement) {
    // **Função que deveria retornar a pose do usuário (pontos-chave do corpo)**
    // Isso é onde a biblioteca de visão computacional entraria
    // Exemplo: usar PoseNet (TensorFlow.js) ou MediaPipe
    // (A implementação completa é MUITO complexa para este escopo)
    return {
        ombroDireito: { x: 0, y: 0 },
        ombroEsquerdo: { x: 0, y: 0 },
        cotoveloDireito: { x: 0, y: 0 },
        cotoveloEsquerdo: { x: 0, y: 0 },
        quadrilDireito: { x: 0, y: 0 },
        quadrilEsquerdo: { x: 0, y: 0 }
    };
}
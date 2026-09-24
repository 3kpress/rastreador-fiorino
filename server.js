const express = require('express');
const app = express();
const path = require('path');

// Permite que o servidor entenda o JSON enviado pelo ESP32/SIM7000
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Variável global temporária para guardar a última posição recebida
let ultimaPosicao = {
    wifi: 0,
    lat: -23.550520, // Coordenada padrão (São Paulo) até receber a primeira
    lon: -46.633309,
    bloqueado: 0,
    atualizadoEm: "Ainda sem dados"
};

// --- ROTA DE RECEBIMENTO (O ESP32 vai disparar o POST aqui) ---
app.post('/api/fiorino01/telemetria', (req, res) => {
    console.log("📥 Dados recebidos da Fiorino:", req.body);
    
    // Valida se os dados chegaram no formato correto
    if (req.body && req.body.lat && req.body.lon) {
        ultimaPosicao = {
            wifi: req.body.wifi,
            lat: parseFloat(req.body.lat),
            lon: parseFloat(req.body.lon),
            bloqueado: req.body.bloqueado,
            atualizadoEm: new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        };
        
        // Responde 200 OK para o modem desligar o socket sabendo que deu certo
        return res.status(200).send("Dados gravados com sucesso!");
    }
    
    // Se o payload vier mal formatado, avisa o modem
    res.status(400).send("Erro: JSON inválido ou incompleto.");
});

// --- ROTA DA PÁGINA WEB (Painel de Monitoramento) ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- ROTA QUE RETORNA A POSIÇÃO ATUAL PARA A PÁGINA WEB ---
app.get('/api/fiorino01/posicao', (req, res) => {
    res.json(ultimaPosicao);
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
// O Railway exige ler primeiro a variável interna process.env.PORT para validar o Healthcheck
const PORT = process.env.PORT || 80;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor definitivo rodando na porta ${PORT}`);
});

export default function handler(req, res) {
    if (req.method === 'POST') {
        // Recebe os dados do jogador e salva no JSON
        const { username, score } = req.body;

        let scores = JSON.parse(process.env.SCORES || '{}');
        scores[username] = score;
        
        // Atualiza os dados
        process.env.SCORES = JSON.stringify(scores);

        return res.status(200).json({ message: "Pontuação salva!", scores });
    }

    if (req.method === 'GET') {
        // Retorna o ranking
        const scores = JSON.parse(process.env.SCORES || '{}');
        return res.status(200).json(scores);
    }

    res.status(405).json({ message: "Método não permitido" });
}

import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./api/scores.json'); // Caminho do arquivo JSON

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { username, score } = req.body;

        // Lê o arquivo JSON existente
        let scores = {};
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath);
            scores = JSON.parse(data);
        }

        // Atualiza ou adiciona a pontuação do usuário
        scores[username] = score;

        // Salva no arquivo JSON
        fs.writeFileSync(filePath, JSON.stringify(scores, null, 2));

        return res.status(200).json({ message: "Pontuação salva!", scores });
    }

    if (req.method === 'GET') {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath);
            const scores = JSON.parse(data);
            return res.status(200).json(scores);
        }
        return res.status(200).json({});
    }

    res.status(405).json({ message: "Método não permitido" });
}

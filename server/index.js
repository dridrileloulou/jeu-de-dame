require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY manquant");
  process.exit(1);
}

// ── Validation ────────────────────────────────────────────────────

function isValidBoard(board) {
  if (!Array.isArray(board) || board.length !== 10) return false;
  for (const row of board) {
    if (!Array.isArray(row) || row.length !== 10) return false;
    for (const cell of row) {
      if (cell !== 0 && cell !== 1 && cell !== 2) return false;
    }
  }
  return true;
}

function isValidMove(move) {
  if (!move || !Array.isArray(move.from) || !Array.isArray(move.to)) return false;
  const [fy, fx] = move.from;
  const [ty, tx] = move.to;
  for (const v of [fy, fx, ty, tx]) {
    if (typeof v !== "number" || v < 0 || v > 9) return false;
  }
  return true;
}

// ── Construction des prompts ──────────────────────────────────────

const DIFFICULTY_TEMPERATURES = {
  facile:   1.5,
  normal:   1.0,
  difficile: 0.5,
  expert:   0.2,
};

function buildPrompt(difficulty, board, currentPlayer) {
  const boardStr = JSON.stringify(board);
  const format = `{"from":[row,col],"to":[row,col]}`;
  const rules = `\
Tu joues aux dames françaises sur un plateau 10x10.
Règles :
- Les pions se déplacent en diagonale d'une case vers l'avant uniquement.
- La capture est OBLIGATOIRE si elle est possible (saut par-dessus un adversaire).
- Le joueur 1 (en bas) avance vers les rows décroissants (row 9 → row 0), le joueur 2 (en haut) avance vers les rows croissants (row 0 → row 9).
- 0 = case vide, 1 = pion joueur 1, 2 = pion joueur 2.`;

  const formatInstruction = `Réponds UNIQUEMENT en JSON valide (aucun texte autour).
Format exact : ${format}
row et col sont des entiers entre 0 et 9.
Indique uniquement la case de départ et la case d'arrivée du coup.`;

  if (difficulty === "facile") {
    return `\
${rules}
Tu joues comme un débutant : choisis un coup valide au hasard parmi tes pions, sans chercher à capturer ni à te protéger.

${formatInstruction}

Plateau actuel :
${boardStr}
currentPlayer: ${currentPlayer}`.trim();
  }

  if (difficulty === "normal") {
    return `\
${rules}
Joue un coup valide correct. Respecte la capture obligatoire si elle est disponible, sinon avance normalement.

${formatInstruction}

Plateau actuel :
${boardStr}
currentPlayer: ${currentPlayer}`.trim();
  }

  if (difficulty === "difficile") {
    return `\
${rules}
Joue de manière solide : priorité aux captures, protège tes pièces exposées, avance vers la promotion quand possible.

${formatInstruction}

Plateau actuel :
${boardStr}
currentPlayer: ${currentPlayer}`.trim();
  }

  if (difficulty === "expert") {
    return `\
${rules}
Tu joues comme un expert : maximise le nombre de captures, protège toutes tes pièces, force la promotion. Anticipe les contre-attaques adverses.

${formatInstruction}

Plateau actuel :
${boardStr}
currentPlayer: ${currentPlayer}`.trim();
  }

  // Fallback → normal
  return buildPrompt("normal", board, currentPlayer);
}

// ── Routes ────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/ai/move", async (req, res) => {
  try {
    const {
      board,
      currentPlayer,
      difficulty = "normal",
      model      = "gemini-2.5-flash",
    } = req.body;

    if (!isValidBoard(board)) {
      return res.status(400).json({ error: "board invalide (10x10, valeurs 0/1/2)" });
    }
    if (currentPlayer !== 1 && currentPlayer !== 2) {
      return res.status(400).json({ error: "currentPlayer doit être 1 ou 2" });
    }
    if (!["facile", "normal", "difficile", "expert"].includes(difficulty)) {
      return res.status(400).json({ error: "difficulty invalide (facile | normal | difficile | expert)" });
    }

    const instruction = buildPrompt(difficulty, board, currentPlayer);
    const temperature = DIFFICULTY_TEMPERATURES[difficulty];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const startTime = Date.now();

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: instruction }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature,
        },
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(502).json({ error: "Gemini error", details: errText });
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: "Réponse Gemini inattendue", raw: data });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "JSON non parseable", rawText: text });
    }

    if (!isValidMove(parsed)) {
      return res.status(502).json({ error: "move invalide reçu de Gemini", raw: parsed });
    }

    return res.json({ move: parsed, latencyMs });

  } catch (e) {
    res.status(500).json({ error: "server exception", details: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy Gemini lancé: http://localhost:${PORT}`);
});

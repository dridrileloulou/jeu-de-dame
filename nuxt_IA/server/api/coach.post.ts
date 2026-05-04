import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  const { board, from, to, captured } = await readBody(event)

  const config = useRuntimeConfig()
  const genAI = new GoogleGenerativeAI(config.geminiApiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json' }
  })

  const moveDesc = (from && to)
    ? `de la case (${from.y},${from.x}) vers (${to.y},${to.x})${captured ? ' en prenant un pion adverse' : ''}`
    : 'un coup'

  const prompt = `Tu es un coach de jeu de dames qui commente la partie en cours.
Le joueur (pions blancs = 2) vient de jouer ${moveDesc}.
Voici le plateau après ce coup (0=vide, 1=IA noirs, 2=joueur blancs) :
${JSON.stringify(board)}
En 1-2 phrases courtes et directes EN FRANÇAIS, dis-lui si son coup était judicieux et ce à quoi il doit faire attention. Parle-lui directement (tu/toi).
Réponds UNIQUEMENT avec un objet JSON valide : {"analysis": "..."}`

  try {
    const result = await model.generateContent(prompt)
    const parsed = JSON.parse(result.response.text().trim())
    return { analysis: parsed.analysis || null }
  } catch (e) {
    console.error('[Coach] Erreur Gemini:', e)
    return { analysis: null }
  }
})

import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  const { history, winner, whiteCaptured, blackCaptured } = await readBody(event)

  const config = useRuntimeConfig()
  const genAI = new GoogleGenerativeAI(config.geminiApiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.6, responseMimeType: 'application/json' }
  })

  const winnerLabel = winner === 'white' ? 'le joueur (blancs) a gagné' : "l'IA (noirs) a gagné"
  const totalMoves = history?.length ?? 0

  const moveSummary = (history ?? []).map((m: any, i: number) => {
    const who = m.player === 'white' ? 'Blancs' : 'Noirs'
    const cap = m.captured ? ' [prise]' : ''
    return `Coup ${i + 1} – ${who}: (${m.from?.y},${m.from?.x})→(${m.to?.y},${m.to?.x})${cap}`
  }).join('\n')

  const prompt = `Tu es un analyste expert en jeu de dames qui fait le bilan d'une partie.
Résultat : ${winnerLabel}.
Prises réalisées : blancs ${whiteCaptured}, noirs ${blackCaptured}. Total de coups joués : ${totalMoves}.
Historique des coups :
${moveSummary || '(aucun historique disponible)'}

En 3-4 phrases concises et directes EN FRANÇAIS, donne un bilan personnalisé au joueur (blancs) :
- Comment la partie s'est déroulée globalement
- Le tournant ou l'erreur décisive si tu peux l'identifier
- Un conseil concret et actionnable pour progresser

Parle directement au joueur (tu/toi). Sois précis et engagé, pas générique.
Réponds UNIQUEMENT avec un objet JSON valide : {"debrief": "..."}`

  try {
    const result = await model.generateContent(prompt)
    const parsed = JSON.parse(result.response.text().trim())
    return { debrief: parsed.debrief || null }
  } catch (e) {
    console.error('[Debrief] Erreur Gemini:', e)
    return { debrief: null }
  }
})

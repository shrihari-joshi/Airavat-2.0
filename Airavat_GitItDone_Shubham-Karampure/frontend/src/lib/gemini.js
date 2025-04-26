// gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

export async function fetchTermExplanation(word) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

  const prompt = `Give a short one-sentence explanation or definition of "${word}" suitable for beginners.`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  return text.trim()
}

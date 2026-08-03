import { NextResponse } from "next/server"
import OpenAI from "openai"

// Point the SDK to OpenRouter's base URL instead of DeepSeek directly
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { columns, rowCount, sampleRows, fileName } = await req.json()

    const prompt = `You are an expert data analyst. Review this dataset context:
File: ${fileName}
Rows: ${rowCount}
Columns: ${columns.join(", ")}
Sample Data: ${JSON.stringify(sampleRows)}

Provide a strict JSON response with no markdown formatting containing:
{
  "summary": "A 2-sentence executive summary of what this data represents",
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Actionable step 1", "Actionable step 2"]
}`

    const completion = await openrouter.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      // Match the exact model string you are using in your config
      model: "deepseek/deepseek-chat", // Note: OpenRouter uses deepseek/deepseek-chat for their standard V3/V4 models
      response_format: { type: "json_object" },
      temperature: 0.2,
    })

    const result = JSON.parse(completion.choices[0].message.content || "{}")
    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to analyze data" }, { status: 500 })
  }
}

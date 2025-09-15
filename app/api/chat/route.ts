import { NextRequest, NextResponse } from "next/server"

// We dynamically import the SDK to avoid SSR issues if not installed yet
export async function POST(req: NextRequest) {
  try {
    const { messages, detectedColor } = await req.json()

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GOOGLE_GEMINI_API_KEY" }, { status: 500 })
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const systemPreamble = `You are ColorSense, an expert assistant about colors.
You explain color theory, accessibility (contrast guidance, WCAG pointers), palette suggestions, history/meaning, and creative descriptions.
When giving palettes, keep to concise bullet points and include HEX codes.
When asked for accessibility, mention contrast guidance in practical terms.
Detected color context (may be null): ${JSON.stringify(detectedColor || null)}`

    const prompt = [
      { role: "user", parts: [{ text: systemPreamble }] },
      ...messages.map((m: any) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
    ]

    const result = await model.generateContent({ contents: prompt })
    const text = result.response.text()

    return NextResponse.json({ reply: text })
  } catch (err: any) {
    console.error("Gemini chat error", err)
    return NextResponse.json({ error: "Gemini error" }, { status: 500 })
  }
}



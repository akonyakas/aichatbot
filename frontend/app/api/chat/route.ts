import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { messages, instructions } = await req.json()

    // Get the API URL from environment variables with fallback
    const apiUrl = process.env.API_URL || "http://localhost:3000"
    const apiKey = process.env.API_SECRET_KEY || "default_api_key"
    const fullUrl = `${apiUrl}/chat/stream`

    // Forward the request to your actual endpoint
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        instructions,
        input: messages,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `API responded with status: ${response.status}` }, { status: response.status })
    }

    // Get the response body as a readable stream
    const stream = response.body

    if (!stream) {
      throw new Error("No response stream available")
    }

    // Return the streaming response directly
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}

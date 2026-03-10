import { NextRequest, NextResponse } from "next/server"

const MANUS_API_URL = "https://api.manus.ai/v1/tasks"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, taskMode = "chat" } = body

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.MANUS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "MANUS_API_KEY is not configured" },
        { status: 500 }
      )
    }

    const response = await fetch(MANUS_API_URL, {
      method: "POST",
      headers: {
        "API_KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        agentProfile: "manus-1.6",
        taskMode,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Manus API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error calling Manus API:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

// Get task status with convert=true for final output
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get("taskId")

  if (!taskId) {
    return NextResponse.json(
      { error: "Task ID is required" },
      { status: 400 }
    )
  }

  const apiKey = process.env.MANUS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "MANUS_API_KEY is not configured" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(`${MANUS_API_URL}/${taskId}?convert=true`, {
      method: "GET",
      headers: {
        "API_KEY": apiKey,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Manus API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching task status:", error)
    return NextResponse.json(
      { error: "Failed to fetch task status" },
      { status: 500 }
    )
  }
}

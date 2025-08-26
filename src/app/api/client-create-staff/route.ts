import { NextResponse } from "next/server";

// Handle POST request (create staff)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Insert into Supabase or your DB here
    console.log("New Staff Created:", { email, name });

    return NextResponse.json({
      success: true,
      message: "Staff created successfully",
    });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Optionally block GET
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

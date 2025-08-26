import { NextRequest, NextResponse } from "next/server";

// Example: in-memory store (replace with Supabase or DB)
const staffDB: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Here, you would insert into your DB (Supabase example)
    // await supabase.from("users").insert({ name, email, password, role });

    staffDB.push({ name, email, password, role, createdAt: new Date() });

    return NextResponse.json({ success: true, message: "Staff created!" });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

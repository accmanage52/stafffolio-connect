import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // 1. Create staff user in Supabase Auth
    const { data: user, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) throw authError;

    // 2. Add to profiles table
    const { error: profileError } = await supabaseAdmin.from("profiles").insert([
      {
        user_id: user.user.id,
        full_name: name,
        role: "staff",
        status: "active",
      },
    ]);

    if (profileError) throw profileError;

    return NextResponse.json(
      { message: "✅ Staff created successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// Block GET to avoid confusion
export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}

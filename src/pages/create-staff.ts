// /pages/api/create-staff.ts
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key (backend only)
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, name } = req.body;

  try {
    // 1. Create staff user in auth.users
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email verification
    });

    if (authError) throw authError;

    // 2. Create matching profile entry
    const { error: profileError } = await supabaseAdmin.from("profiles").insert([
      {
        user_id: user.user.id, // link to auth.users
        name,
        role: "staff",
        status: "active",
      },
    ]);

    if (profileError) throw profileError;

    return res.status(200).json({ message: "✅ Staff created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
}

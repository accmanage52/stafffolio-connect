console.log("Incoming body:", req.body);

// /pages/api/create-staff.ts
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, name } = req.body;

  try {
    // 1. Create staff user
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    const userId = data?.user?.id;
    if (!userId) throw new Error("User creation failed: no userId returned");

    // 2. Create profile
    const { error: profileError } = await supabaseAdmin.from("profiles").insert([
      {
        user_id: userId,
        name,
        role: "staff",
        status: "active",
      },
    ]);

    if (profileError) throw profileError;

    return res.status(200).json({ message: "✅ Staff created successfully" });
  } catch (err) {
    console.error("Create staff error:", err);
    return res.status(400).json({ error: err?.message || "Unknown error" });
  }
}

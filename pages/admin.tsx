// pages/admin.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const router = useRouter();

  // Change this to YOUR user id from Supabase
  const ADMIN_ID = "2797933a-0d59-47b2-b991-8f2ff91914a0";

  // 🟢 Check if current user is admin
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/auth");
        return;
      }
      if (user.id !== ADMIN_ID) {
        router.replace("/"); // not admin → redirect home
        return;
      }
      setAdmin(true);
      fetchProfiles();
    });
  }, []);

  // 🟢 Fetch profiles
  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) console.error("Error fetching profiles:", error.message);
    else setProfiles(data || []);
    setLoading(false);
  };

  // 🟢 Reset docs_generated for a user
  const resetDocs = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ docs_generated: 0 })
      .eq("id", id);
    if (error) {
      alert("Failed to reset docs: " + error.message);
    } else {
      alert("Docs reset!");
      fetchProfiles();
    }
  };

  if (!admin) return <p className="p-4">Checking access…</p>;
  if (loading) return <p className="p-4">Loading profiles…</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-4">
        <p className="text-lg font-semibold">Total Users: {profiles.length}</p>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Docs</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id}>
              <td className="p-2 border">{p.id.slice(0, 6)}…</td>
              <td className="p-2 border">{p.email || "N/A"}</td>
              <td className="p-2 border">{p.subscription_status}</td>
              <td className="p-2 border">
                {p.docs_generated}/{p.docs_limit}
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => resetDocs(p.id)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                >
                  Reset Docs
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

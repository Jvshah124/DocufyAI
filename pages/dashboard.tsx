import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

type Document = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth"); // redirect if not logged in
      } else {
        setUser(user);
      }
    };

    getUser();
  }, [router]);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching docs:", error);
      } else {
        setDocs(data || []);
      }
    };

    fetchDocs();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) {
      console.error("Error deleting doc:", error);
      alert("Error deleting document!");
    } else {
      setDocs(docs.filter((doc) => doc.id !== id)); // update state
      alert("Document deleted!");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">MyDocs</h2>
        <nav className="space-y-3">
          <Link href="/" className="block text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link
            href="/dashboard"
            className="block text-gray-700 hover:text-blue-600"
          >
            Dashboard
          </Link>
          <Link href="#" className="block text-gray-700 hover:text-blue-600">
            Settings
          </Link>
        </nav>
        {user && (
          <button
            onClick={handleLogout}
            className="mt-6 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome {user?.email || "Buddy"} 👋
        </h1>
        <Link
          href="/editor"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          + New Document
        </Link>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Your Documents</h2>
          {docs.length === 0 ? (
            <p className="text-gray-500">No documents yet.</p>
          ) : (
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-white shadow rounded-md hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <Link
                      href={`/editor?id=${doc.id}`}
                      className="block font-semibold text-blue-600 hover:underline"
                    >
                      {doc.title || "Untitled Document"}
                    </Link>
                    <p className="text-gray-500 text-sm truncate max-w-md">
                      {doc.content || "No content yet..."}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(doc.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

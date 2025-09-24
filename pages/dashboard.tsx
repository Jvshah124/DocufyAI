// pages/dashboard.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import {
  FaFileAlt,
  FaFileInvoiceDollar,
  FaEnvelopeOpenText,
  FaUserCircle,
  FaPlus,
} from "react-icons/fa";
import { getUserProfile, ensureUserProfile, Profile } from "../lib/profile";

type Document = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [openMenu, setOpenMenu] = useState(false);
  const [input, setInput] = useState("");

  // 🟢 Auth check + subscription
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/auth"); // redirect guests
        } else {
          setUser(user);
          // ensure profile exists and fetch it
          const prof = await ensureUserProfile(user.id, {
            email: (user.email as string) || undefined,
          });
          if (prof) setProfile(prof);
        }
      } catch (err) {
        console.error("Error checking user:", err);
        router.replace("/auth");
      }
    };
    checkUser();

    // Subscribe to auth state changes (login/logout)
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setUser(null);
          setProfile(null);
          router.replace("/auth");
        } else {
          setUser(session.user);
          getUserProfile(session.user.id).then((p) => {
            if (p) setProfile(p);
          });
        }
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [router]);

  // 🟢 Fetch docs
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
        setDocs((data as any) || []);
      }
    };
    fetchDocs();
  }, [user]);

  // 🟢 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  // 🟢 Delete doc
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      console.error("Error deleting doc:", error);
      alert("Error deleting document!");
    } else {
      setDocs(docs.filter((doc) => doc.id !== id));
      alert("Document deleted!");
    }
  };

  // 🟢 Smart AI navigation + save
  const handleCreate = async () => {
    if (!input.trim()) return;
    const text = input.toLowerCase();
    let path = "/";
    let title = "Untitled Document";

    if (text.includes("resume")) {
      path = "/resume-template";
      title = "New Resume";
    } else if (text.includes("invoice")) {
      path = "/invoice-template";
      title = "New Invoice";
    } else if (text.includes("cover")) {
      path = "/cover-letter";
      title = "New Cover Letter";
    }

    if (user) {
      const { data, error } = await supabase
        .from("documents")
        .insert([
          {
            user_id: user.id,
            title,
            content: input,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error saving doc:", error);
      } else if (data) {
        setDocs([data, ...docs]);
        router.push({
          pathname: path,
          query: { prompt: input, id: data.id },
        });
      }
    } else {
      router.push("/auth");
    }
  };

  // 🟢 Razorpay Checkout
  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/razorpay-order", { method: "POST" });
      const order = await res.json();

      if (!order?.id) {
        alert("Failed to create Razorpay order");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "DocufyAI",
        description: "Pro Plan Subscription",
        order_id: order.id,
        handler: async function (response: any) {
          alert("✅ Payment successful!");
          if (user) {
            await supabase
              .from("profiles")
              .update({
                subscription_status: "pro",
                docs_limit: 50,
                docs_generated: 0,
                subscription_current_period_end: new Date(
                  new Date().setMonth(new Date().getMonth() + 1)
                ).toISOString(),
              })
              .eq("id", user.id);
            const prof = await getUserProfile(user.id);
            setProfile(prof);
          }
        },
        prefill: {
          email: user?.email,
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay Checkout Error:", err);
      alert("Something went wrong starting checkout.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 text-xl font-bold text-blue-600">DocufyAI</div>

        {/* New Document Menu */}
        <div className="relative mx-4 mb-4">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md"
            title="Create new document"
          >
            <FaPlus /> New Document
          </button>
          {openMenu && (
            <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
              <Link
                href="/resume-template"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpenMenu(false)}
              >
                Resume
              </Link>
              <Link
                href="/invoice-template"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpenMenu(false)}
              >
                Invoice
              </Link>
              <Link
                href="/cover-letter"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpenMenu(false)}
              >
                Cover Letter
              </Link>
            </div>
          )}
        </div>

        {/* Recent Docs */}
        <div className="flex-1 overflow-y-auto">
          {docs.length === 0 ? (
            <p className="px-4 py-2 text-gray-500">No documents yet.</p>
          ) : (
            docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Link
                  href={`/editor?id=${doc.id}`}
                  className="block font-medium text-sm text-blue-600 hover:underline"
                >
                  {doc.title || "Untitled Document"}
                </Link>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Profile + Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <FaUserCircle className="text-3xl text-gray-500" />
            <div>
              <div className="text-sm font-medium">{user?.email || "—"}</div>
              <div className="text-xs text-gray-500">
                {profile ? (
                  <>
                    {profile.subscription_status || "free"} •{" "}
                    {profile.docs_generated ?? 0}/{profile.docs_limit ?? 0}
                  </>
                ) : (
                  "Loading profile..."
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleLogout}
              className="text-red-500 text-xs hover:underline"
            >
              Logout
            </button>
            <button
              onClick={handleUpgrade}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded"
            >
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* AI Input Box */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <textarea
            placeholder="Ask anything... (e.g. 'create a resume for a software engineer')"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-transparent outline-none resize-none text-gray-800 dark:text-gray-200"
          />
          <div className="mt-2 text-right">
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Create Document
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/resume-template">
            <Card
              icon={<FaFileAlt className="text-green-500 text-2xl" />}
              title="Modern Resume"
              desc="Design a modern, ATS-friendly resume"
            />
          </Link>
          <Link href="/invoice-template">
            <Card
              icon={<FaFileInvoiceDollar className="text-blue-500 text-2xl" />}
              title="Professional Invoice"
              desc="Generate professional invoices for clients"
            />
          </Link>
          <Link href="/cover-letter">
            <Card
              icon={<FaEnvelopeOpenText className="text-purple-500 text-2xl" />}
              title="Cover Letter"
              desc="Write a compelling cover letter instantly"
            />
          </Link>
        </div>

        {/* Testimonials */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">What our users say</h3>
          <p className="text-gray-600 dark:text-gray-400">
            ⭐⭐⭐⭐⭐ “This tool saved me hours! The AI-generated resume landed
            me interviews immediately.”
          </p>
        </div>
      </main>
    </div>
  );
}

function Card({
  icon,
  title,
  desc,
}: {
  icon: JSX.Element;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
      <div className="mb-3">{icon}</div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );
}

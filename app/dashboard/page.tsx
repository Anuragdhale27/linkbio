"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import "@/app/CSSStyling/DashboardStyling.css";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // Load user + data
  // ----------------------------
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/";
      return;
    }

    setUser(data.user);

    await ensureProfile(data.user);
    await loadLinks(data.user.id);

    setLoading(false);
  };

  // ----------------------------
  // Create profile if missing
  // ----------------------------
  const ensureProfile = async (user: any) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!data) {
      await supabase.from("profiles").insert({
        id: user.id,
        username: user.email.split("@")[0],
      });
    }
  };

  // ----------------------------
  // Load links
  // ----------------------------
  const loadLinks = async (userId: string) => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setLinks(data || []);
  };

  // ----------------------------
  // Add link
  // ----------------------------
  const addLink = async () => {
    if (!title || !url) return;

    await supabase.from("links").insert({
      user_id: user.id,
      title,
      url,
    });

    setTitle("");
    setUrl("");
    loadLinks(user.id);
  };

  // ----------------------------
  // Logout
  // ----------------------------
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "12px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>
          Welcome to <b>{user.email}</b> Dashboard
        </h2>
        <button onClick={logout}>Logout</button>
      </div>
      <br></br>
      <h3>Add Your Links</h3>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <button onClick={addLink}>Add</button>
      </div>

      {/* <h3>Your Already Added Links</h3>
      {links.length === 0 ? (
        <p>No links added yet</p>
      ) : (
        links.map((l) => (
          <div key={l.id}>
            <li>{l.title}</li> — {l.url}
          </div>
        ))
      )} */}

      <h3>Your Already Added Links</h3>

      {links.length === 0 ? (
        <p>No links added yet</p>
      ) : (
        <table className="links-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Link</th>
              <th>Link Created At</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>
                  <a href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.url}
                  </a>
                </td>
                <td className="date">
                  {new Date(l.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

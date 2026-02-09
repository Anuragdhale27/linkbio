'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [links, setLinks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)

  // ----------------------------
  // Load user + data
  // ----------------------------
  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      window.location.href = '/'
      return
    }

    setUser(data.user)

    await ensureProfile(data.user)
    await loadLinks(data.user.id)

    setLoading(false)
  }

  // ----------------------------
  // Create profile if missing
  // ----------------------------
  const ensureProfile = async (user: any) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!data) {
      await supabase.from('profiles').insert({
        id: user.id,
        username: user.email.split('@')[0],
      })
    }
  }

  // ----------------------------
  // Load links
  // ----------------------------
  const loadLinks = async (userId: string) => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', userId)
      .order('created_at', { ascending: false })

    if (!error) setLinks(data || [])
  }

  // ----------------------------
  // Add link
  // ----------------------------
  const addLink = async () => {
    if (!title || !url) return

    await supabase.from('links').insert({
      user_id: user.id,
      title,
      url,
    })

    setTitle('')
    setUrl('')
    loadLinks(user.id)
  }

  // ----------------------------
  // Logout
  // ----------------------------
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <h3>Your Links</h3>

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

      {links.length === 0 ? (
        <p>No links added yet</p>
      ) : (
        links.map((l) => (
          <div key={l.id}>
            <b>{l.title}</b> — {l.url}
          </div>
        ))
      )}
    </div>
  )
}

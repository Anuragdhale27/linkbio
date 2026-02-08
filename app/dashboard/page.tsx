'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  /* -----------------------------
     WAIT FOR SESSION FIRST
  -----------------------------*/
  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        await loadLinks(session.user.id)
      }

      setLoading(false)
    }

    loadSession()
  }, [])

  /* -----------------------------
     LOAD LINKS
  -----------------------------*/
  const loadLinks = async (userId: string) => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.log(error)
      return
    }

    console.log('Loaded links:', data)
    setLinks(data || [])
  }

  /* -----------------------------
     ADD LINK
  -----------------------------*/
  const addLink = async () => {
    if (!user) return alert('User not logged in')

    const { error } = await supabase.from('links').insert({
      user_id: user.id,
      title,
      url,
    })

    if (error) {
      console.log(error)
      return
    }

    setTitle('')
    setUrl('')
    loadLinks(user.id)
  }

  const deleteLink = async (id: string) => {
  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)

  if (error) {
    console.log(error)
    return
  }

  loadLinks(user.id)
 }

  /* -----------------------------
     LOGOUT
  -----------------------------*/
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

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
          style={{ marginRight: 10, padding: 8 }}
        />

        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ marginRight: 10, padding: 8 }}
        />

        <button onClick={addLink}>Add</button>
      </div>

      {links.length === 0 ? (
        <p>No links added yet</p>
      ) : (
        links.map((link) => (
          <div key={link.id}>
            <b>{link.title}</b> — {link.url}
          </div>
        ))
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  const [links, setLinks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    loadLinks()
  }, [])

  // Load links + create profile if missing
  const loadLinks = async () => {
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user

    if (!user) {
      router.push('/')
      return
    }

    // create profile if not exists
    await supabase.from('profiles').upsert({
      id: user.id,
      username: user.email?.split('@')[0],
    })

    // get profile (for public URL)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setUsername(profile?.username)

    // load links
    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)

    setLinks(linksData || [])
  }

  // Add new link
  const addLink = async () => {
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user

    if (!user) return

    if (!title || !url) {
      alert('Please enter title and URL')
      return
    }

    const { error } = await supabase.from('links').insert({
      user_id: user.id,
      title,
      url,
    })

    if (error) {
      alert(error.message)
      return
    }

    setTitle('')
    setUrl('')
    loadLinks()
  }

  // Logout
  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: 'auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <h2>Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      {/* Public Link */}
      {username && (
        <p>
          Your public page:{' '}
          <a href={`/${username}`} target="_blank">
            /{username}
          </a>
        </p>
      )}

      {/* Add Link */}
      <div style={{ marginTop: 20 }}>
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

      {/* Links List */}
      <div style={{ marginTop: 30 }}>
        <h3>Your Links</h3>

        {links.length === 0 && <p>No links added yet</p>}

        {links.map((link) => (
          <div
            key={link.id}
            style={{
              padding: 10,
              border: '1px solid #333',
              marginTop: 10,
            }}
          >
            {link.title}
          </div>
        ))}
      </div>
    </div>
  )
}

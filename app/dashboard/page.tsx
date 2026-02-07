'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [links, setLinks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    loadLinks()
  }, [])

  // Load links + auto create profile
  const loadLinks = async () => {
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user

    if (!user) {
      alert('User not logged in')
      return
    }

    // auto create profile
    await supabase.from('profiles').upsert({
      id: user.id,
      username: user.email?.split('@')[0]
    })

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

    if (!user) {
      alert('User not logged in')
      return
    }

    if (!title || !url) {
      alert('Please enter title and URL')
      return
    }

    const { error } = await supabase.from('links').insert({
      user_id: user.id,
      title,
      url
    })

    if (error) {
      console.log(error)
      alert('Error adding link')
      return
    }

    setTitle('')
    setUrl('')
    loadLinks()
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Your Links</h2>

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

      <div>
        {links.map((l) => (
          <div key={l.id} style={{ marginBottom: 10 }}>
            {l.title}
          </div>
        ))}
      </div>
    </div>
  )
}

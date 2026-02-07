'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  // auto redirect if already logged in
  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      router.push('/dashboard')
    }
  }

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) alert(error.message)
    else alert('User created. Now login.')
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>LinkBio</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: 10 }}
      />

      <button onClick={signIn}>Login</button>
      <button onClick={signUp} style={{ marginLeft: 10 }}>
        Signup
      </button>
    </div>
  )
}

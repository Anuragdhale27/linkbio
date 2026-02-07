export default async function Page({ params }: any) {
  const { username } = await params

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?username=eq.${username}`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      cache: 'no-store',
    }
  )

  const profiles = await res.json()
  const profile = profiles[0]

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        User not found
      </div>
    )
  }

  const linksRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/links?user_id=eq.${profile.id}`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      cache: 'no-store',
    }
  )

  const links = await linksRes.json()

  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: 60,
        maxWidth: 400,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <h1>@{profile.username}</h1>

      {links.map((link: any) => (
        <div key={link.id}>
          <a href={link.url} target="_blank">
            <button
              style={{
                width: '100%',
                padding: 12,
                marginTop: 10,
                cursor: 'pointer',
              }}
            >
              {link.title}
            </button>
          </a>
        </div>
      ))}
    </div>
  )
}

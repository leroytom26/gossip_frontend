'use client'

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../utils/supabase'
import Image from 'next/image'
import { Session } from '@supabase/supabase-js'
import TweetBox from '../components/TweetBox'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  twitter_username: string | null
  bio: string | null
  twitter_post_count: number
  last_tweet_at: string | null
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/profile/${userId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      alert('Failed to fetch profile. Please try again later.')
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['twitter']}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="mb-8">
        {profile?.avatar_url && (
          <Image
            src={profile.avatar_url}
            alt="Profile"
            width={100}
            height={100}
            className="rounded-full"
          />
        )}
        <h2 className="mt-4 text-2xl font-bold">
          Welcome, {profile?.full_name || session.user.email}
        </h2>
      </div>
      <TweetBox userId={session.user.id} />
      <button
        className="rounded bg-red-500 px-4 py-2 text-white"
        onClick={() => supabase.auth.signOut()}
      >
        Sign Out
      </button>
    </div>
  )
}

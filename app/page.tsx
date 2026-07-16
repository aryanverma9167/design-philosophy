'use client'

import { useEffect } from 'react'

export default function Page() {
  useEffect(() => {
    window.location.href = '/survey.html'
  }, [])

  return <div>Redirecting to survey...</div>
}

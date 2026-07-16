'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalResponses: number
  teamCounts: Record<string, number>
  traitCounts: Record<string, number>
  sliderAverages: {
    fast_to_delightful: number
    minimal_to_expressive: number
    functional_to_emotional: number
    familiar_to_innovative: number
    direct_to_nuanced: number
  }
  sampleResponses: {
    color_palette: string[]
    design_elements: string[]
    user_experience: string[]
    personality: string[]
    additional_notes: string[]
    person_description: string[]
  }
}

// Reference examples shown when no real responses exist yet
const REFERENCE_EXAMPLES = {
  always: [
    'Make users feel confident before they take the next step.',
    'Clearly communicate what\'s happening and what comes next.',
    'Reduce friction at every decision point — buy, sell, or finance.',
  ],
  never: [
    'Leave users wondering if an action was successful.',
    'Surprise users with unexpected navigation or behavior.',
    'Use jargon that only insiders understand.',
  ],
  feel: [
    'In control throughout the journey.',
    'Reassured that Cars24 is handling the complicated parts.',
    'Confident that they made the right decision.',
  ],
  missing: [
    'A clear sense of progress — users often feel lost mid-flow.',
    'Moments of delight that make the experience feel premium.',
    'Consistent visual language across buyer and seller flows.',
  ],
  person: [
    'A knowledgeable friend who helps you buy your first car — calm, honest, and never pushy.',
    'A trusted advisor: composed, modern, and always thinking two steps ahead.',
    'Someone professional yet warm — like a senior colleague who genuinely wants you to win.',
  ],
}

function SliderBar({ label, leftLabel, rightLabel, value }: { label: string; leftLabel: string; rightLabel: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{value}</span>
      </div>
      <div className="relative">
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${value}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">{leftLabel}</span>
          <span className="text-xs text-muted-foreground">{rightLabel}</span>
        </div>
      </div>
    </div>
  )
}

function QuoteCard({ text, index }: { text: string; index: number }) {
  return (
    <div className="flex gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
      <span className="text-primary font-bold text-sm mt-0.5 shrink-0">{index + 1}.</span>
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  )
}

function ExampleSection({
  title,
  subtitle,
  items,
  isReference,
}: {
  title: string
  subtitle?: string
  items: string[]
  isReference: boolean
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        {isReference && (
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Reference examples
          </span>
        )}
      </div>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item, i) => <QuoteCard key={i} text={item} index={i} />)
        ) : (
          <p className="text-sm text-muted-foreground italic">No responses yet.</p>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/results')
      .then(r => {
        if (!r.ok) throw new Error('failed')
        return r.json()
      })
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block w-7 h-7 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-foreground font-medium">Could not load results</p>
          <Link href="/survey.html" className="text-sm text-primary hover:underline">
            Take the survey
          </Link>
        </div>
      </div>
    )
  }

  const hasResponses = stats.totalResponses > 0
  const mostSelectedTeam = Object.entries(stats.teamCounts).sort(([, a], [, b]) => b - a)[0]
  const topTraits = Object.entries(stats.traitCounts).sort(([, a], [, b]) => b - a).slice(0, 5)

  // Use real responses if available, fall back to reference examples
  const alwaysItems = hasResponses && stats.sampleResponses.color_palette.length > 0
    ? stats.sampleResponses.color_palette : REFERENCE_EXAMPLES.always
  const neverItems = hasResponses && stats.sampleResponses.design_elements.length > 0
    ? stats.sampleResponses.design_elements : REFERENCE_EXAMPLES.never
  const feelItems = hasResponses && stats.sampleResponses.user_experience.length > 0
    ? stats.sampleResponses.user_experience : REFERENCE_EXAMPLES.feel
  const missingItems = hasResponses && stats.sampleResponses.personality.length > 0
    ? stats.sampleResponses.personality : REFERENCE_EXAMPLES.missing
  const personItems = hasResponses && stats.sampleResponses.person_description.length > 0
    ? stats.sampleResponses.person_description : REFERENCE_EXAMPLES.person

  const usingReference = !hasResponses

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Cars24 Design Philosophy</h1>
            <p className="text-xs text-muted-foreground">Survey Results &amp; Insights</p>
          </div>
          <Link
            href="/survey.html"
            className="text-xs px-4 py-2 rounded-lg bg-foreground text-background hover:opacity-80 transition-opacity font-medium"
          >
            Take Survey
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-foreground mb-1">{stats.totalResponses}</div>
            <p className="text-xs text-muted-foreground">Total Responses</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="text-xl font-semibold text-foreground mb-1 truncate">
              {mostSelectedTeam ? mostSelectedTeam[0] : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              Most Active Team{mostSelectedTeam ? ` · ${mostSelectedTeam[1]} votes` : ''}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-xs text-muted-foreground mb-3">Top Traits Selected</p>
            <div className="space-y-1.5">
              {topTraits.length > 0 ? topTraits.map(([trait, count]) => (
                <div key={trait} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{trait}</span>
                  <span className="text-xs font-semibold text-primary">{count}</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground italic">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Team distribution + Design preferences side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-5">Team Distribution</h2>
            {Object.keys(stats.teamCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.teamCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([team, count]) => (
                    <div key={team}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm text-foreground">{team}</span>
                        <span className="text-xs text-muted-foreground">
                          {count} · {Math.round((count / stats.totalResponses) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${(count / stats.totalResponses) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No responses yet.</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-5">Design Preferences (Average)</h2>
            <div className="space-y-5">
              <SliderBar label="Speed vs. Delight" leftLabel="Fast" rightLabel="Delightful" value={stats.sliderAverages.fast_to_delightful} />
              <SliderBar label="Tone" leftLabel="Minimal" rightLabel="Expressive" value={stats.sliderAverages.minimal_to_expressive} />
              <SliderBar label="Purpose" leftLabel="Functional" rightLabel="Emotional" value={stats.sliderAverages.functional_to_emotional} />
              <SliderBar label="Innovation" leftLabel="Familiar" rightLabel="Innovative" value={stats.sliderAverages.familiar_to_innovative} />
              <SliderBar label="Communication" leftLabel="Direct" rightLabel="Nuanced" value={stats.sliderAverages.direct_to_nuanced} />
            </div>
          </div>
        </div>

        {/* Open-ended responses */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-base font-semibold">Open-Ended Responses</h2>
            {usingReference && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Showing reference examples — submit a survey to see real responses
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ExampleSection
              title="Cars24 should always..."
              subtitle="Q9 · What Cars24 must always do"
              items={alwaysItems}
              isReference={usingReference}
            />
            <ExampleSection
              title="Cars24 should never..."
              subtitle="Q10 · What Cars24 must avoid"
              items={neverItems}
              isReference={usingReference}
            />
            <ExampleSection
              title="After using Cars24, users should feel..."
              subtitle="Q11 · Desired emotional outcome"
              items={feelItems}
              isReference={usingReference}
            />
            <ExampleSection
              title="The biggest thing missing is..."
              subtitle="Q12 · Current experience gaps"
              items={missingItems}
              isReference={usingReference}
            />
            <div className="lg:col-span-2">
              <ExampleSection
                title="If Cars24 were a person..."
                subtitle="Q13 · Brand personality in human terms"
                items={personItems}
                isReference={usingReference}
              />
            </div>
          </div>
        </div>

        <footer className="pt-4 border-t border-border text-center text-xs text-muted-foreground">
          Results update automatically with each submission
        </footer>
      </main>
    </div>
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    // Fetch all responses using Supabase REST API
    const res = await fetch(
      `${supabaseUrl}/rest/v1/design_philosophy_responses?select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    const responses = await res.json()

    // Calculate statistics
    const stats = {
      totalResponses: responses.length,
      teamCounts: {} as Record<string, number>,
      traitCounts: {} as Record<string, number>,
      sliderAverages: {
        fast_to_delightful: 0,
        minimal_to_expressive: 0,
        functional_to_emotional: 0,
        familiar_to_innovative: 0,
        direct_to_nuanced: 0,
      },
      sampleResponses: {
        color_palette: [] as string[],
        design_elements: [] as string[],
        user_experience: [] as string[],
        personality: [] as string[],
        additional_notes: [] as string[],
        person_description: [] as string[],
      },
    }

    // Process responses
    responses.forEach((resp: any) => {
      // Team counts
      if (resp.team_selected) {
        stats.teamCounts[resp.team_selected] =
          (stats.teamCounts[resp.team_selected] || 0) + 1
      }

      // Trait counts
      if (resp.traits_selected) {
        const traits = resp.traits_selected
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
        traits.forEach((trait: string) => {
          stats.traitCounts[trait] = (stats.traitCounts[trait] || 0) + 1
        })
      }

      // Sliders
      if (resp.slider_fast_to_delightful)
        stats.sliderAverages.fast_to_delightful += resp.slider_fast_to_delightful
      if (resp.slider_minimal_to_expressive)
        stats.sliderAverages.minimal_to_expressive +=
          resp.slider_minimal_to_expressive
      if (resp.slider_functional_to_emotional)
        stats.sliderAverages.functional_to_emotional +=
          resp.slider_functional_to_emotional
      if (resp.slider_familiar_to_innovative)
        stats.sliderAverages.familiar_to_innovative +=
          resp.slider_familiar_to_innovative
      if (resp.slider_direct_to_nuanced)
        stats.sliderAverages.direct_to_nuanced += resp.slider_direct_to_nuanced

      // Collect sample responses (up to 3 each)
      if (
        resp.response_color_palette &&
        stats.sampleResponses.color_palette.length < 3
      ) {
        stats.sampleResponses.color_palette.push(resp.response_color_palette)
      }
      if (
        resp.response_design_elements &&
        stats.sampleResponses.design_elements.length < 3
      ) {
        stats.sampleResponses.design_elements.push(
          resp.response_design_elements
        )
      }
      if (
        resp.response_user_experience &&
        stats.sampleResponses.user_experience.length < 3
      ) {
        stats.sampleResponses.user_experience.push(
          resp.response_user_experience
        )
      }
      if (
        resp.response_personality &&
        stats.sampleResponses.personality.length < 3
      ) {
        stats.sampleResponses.personality.push(resp.response_personality)
      }
      if (
        resp.response_additional_notes &&
        stats.sampleResponses.additional_notes.length < 3
      ) {
        stats.sampleResponses.additional_notes.push(
          resp.response_additional_notes
        )
      }
      if (
        resp.person_description &&
        stats.sampleResponses.person_description.length < 3
      ) {
        stats.sampleResponses.person_description.push(resp.person_description)
      }
    })

    // Calculate averages
    if (stats.totalResponses > 0) {
      stats.sliderAverages.fast_to_delightful = Math.round(
        stats.sliderAverages.fast_to_delightful / stats.totalResponses
      )
      stats.sliderAverages.minimal_to_expressive = Math.round(
        stats.sliderAverages.minimal_to_expressive / stats.totalResponses
      )
      stats.sliderAverages.functional_to_emotional = Math.round(
        stats.sliderAverages.functional_to_emotional / stats.totalResponses
      )
      stats.sliderAverages.familiar_to_innovative = Math.round(
        stats.sliderAverages.familiar_to_innovative / stats.totalResponses
      )
      stats.sliderAverages.direct_to_nuanced = Math.round(
        stats.sliderAverages.direct_to_nuanced / stats.totalResponses
      )
    }

    return Response.json(stats)
  } catch (err) {
    console.error('Results API error:', err)
    return Response.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

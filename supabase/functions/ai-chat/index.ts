import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], location } = await req.json();

    // Build location context for AI
    let locationContext = '';
    if (location?.country && location?.region) {
      locationContext = `\nYou are assisting a farmer/user from ${location.region}, ${location.country}. Tailor your advice to regional diseases, climate, local veterinary practices, and available resources in this specific area.`;
    } else if (location?.country) {
      locationContext = `\nYou are assisting a farmer/user from ${location.country}. Consider country-specific diseases, climate, and veterinary practices.`;
    }

    const messages = [
      {
        role: 'system',
        content: `You are VetixAI, an expert veterinary assistant specializing in Swahili-speaking communities.${locationContext}
        Provide practical, culturally-sensitive advice for animal health and farming practices.
        When relevant, mention location-specific diseases, climate considerations, and locally available treatments.
        Always emphasize when to seek professional veterinary care.
        Respond in Swahili when appropriate, with English translations when helpful.
        Keep responses concise but informative.`
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
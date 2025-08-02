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
    const { symptoms, imageBase64, animalType = 'ng\'ombe' } = await req.json();

    if (!symptoms && !imageBase64) {
      throw new Error('Either symptoms or image is required');
    }

    const messages = [
      {
        role: 'system',
        content: `You are VetixAI, an expert veterinary diagnostic assistant for East African farming communities.
        Analyze symptoms and/or images to provide preliminary diagnoses.
        Always include:
        1. Possible conditions (most to least likely)
        2. Immediate care recommendations
        3. When to seek professional veterinary help
        4. Prevention tips
        Respond in both Swahili and English for accessibility.
        IMPORTANT: Always emphasize this is preliminary guidance, not a replacement for professional veterinary care.`
      }
    ];

    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please analyze this image of a ${animalType}. Symptoms reported: ${symptoms || 'No additional symptoms provided'}`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: `Animal type: ${animalType}\nSymptoms: ${symptoms}\n\nPlease provide a preliminary diagnosis and recommendations.`
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const diagnosis = data.choices[0].message.content;

    return new Response(JSON.stringify({ diagnosis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in smart-diagnosis function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
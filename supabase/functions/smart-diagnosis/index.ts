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
    const { symptoms, imageBase64, animalType = 'ng\'ombe', location } = await req.json();

    if (!symptoms && !imageBase64) {
      throw new Error('Either symptoms or image is required');
    }

    // Server-side input validation
    if (symptoms && symptoms.length > 2000) {
      throw new Error('Symptoms description too long (max 2000 characters)');
    }
    if (imageBase64) {
      const sizeInBytes = (imageBase64.length * 3) / 4;
      if (sizeInBytes > 10 * 1024 * 1024) {
        throw new Error('Image too large (max 10MB)');
      }
    }
    const validAnimals = ['ng\'ombe', 'mbuzi', 'kondoo', 'kuku', 'nguruwe', 'cattle', 'goat', 'sheep', 'chicken', 'pig'];
    if (animalType && !validAnimals.includes(animalType.toLowerCase())) {
      throw new Error('Invalid animal type');
    }

    // Build location context for AI
    let locationContext = '';
    if (location?.country && location?.region) {
      locationContext = `\nLocation Context: The user is from ${location.region}, ${location.country}. Consider regional diseases, climate conditions, and local veterinary practices specific to this area when providing recommendations.`;
    } else if (location?.country) {
      locationContext = `\nLocation Context: The user is from ${location.country}. Consider country-specific diseases, climate, and veterinary practices.`;
    }

    // Fetch knowledge base for context
    let knowledgeContext = '';
    try {
      const { data: diseases } = await supabase
        .from('disease_knowledge')
        .select('disease_name, common_symptoms, causes, treatment_protocol, severity')
        .contains('animal_types', [animalType])
        .limit(10);
      
      if (diseases && diseases.length > 0) {
        knowledgeContext = `\n\nKnowledge Base Context:\n${diseases.map(d => 
          `- ${d.disease_name} (${d.severity}): Symptoms include ${d.common_symptoms.join(', ')}. Treatment: ${d.treatment_protocol}`
        ).join('\n')}`;
      }
    } catch (error) {
      console.error('Failed to fetch knowledge base:', error);
    }

    const messages = [
      {
        role: 'system',
        content: `You are VetixAI, an expert veterinary diagnostic assistant with access to a comprehensive veterinary knowledge base.

Your approach:
1. Analyze symptoms carefully and consider differential diagnoses
2. If information is incomplete, identify what additional details would help
3. Provide structured, evidence-based analysis
4. Consider regional factors and available treatments
${locationContext}
${knowledgeContext}

Response Format:
**Primary Assessment:**
- Most likely condition(s) with confidence level
- Reasoning based on symptoms and knowledge base

**Additional Information Needed (if any):**
- Specific questions to refine diagnosis

**Immediate Actions:**
- Step-by-step care instructions
- Warning signs requiring immediate veterinary attention

**Treatment Recommendations:**
- Home care measures
- Expected timeline
- When to escalate to professional care

**Prevention:**
- Measures to prevent recurrence or spread

Respond in both English and Swahili (Kiswahili) for accessibility.

CRITICAL: Always emphasize this is preliminary guidance. Professional veterinary care is irreplaceable.`
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
        max_tokens: 1200,
        temperature: 0.2,
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
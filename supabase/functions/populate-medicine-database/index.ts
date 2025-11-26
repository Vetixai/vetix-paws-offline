import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use AI to generate comprehensive Kenyan veterinary medicine database
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a veterinary pharmaceutical expert with deep knowledge of the Kenyan veterinary medicine market. Generate a comprehensive database of veterinary medicines commonly available in Kenya.

For each medicine, provide:
- medication_name: Brand or generic name
- generic_name: Active ingredient
- drug_class: Category (antibiotic, antiparasitic, anti-inflammatory, etc.)
- target_animals: Array of animals (cattle, goat, sheep, chicken, pig, etc.)
- target_conditions: Array of conditions treated
- dosage_formula: Specific dosage (e.g., "10mg/kg body weight")
- administration_route: How administered (IM, IV, Oral, Topical, etc.)
- frequency: How often given
- duration: Treatment duration
- contraindications: When not to use
- side_effects: Potential adverse effects
- approximate_cost_ksh: Realistic Kenyan Shilling price range (e.g., "500-800")
- available_in_kenya: true
- prescription_required: boolean
- withdrawal_period_meat: Days before slaughter
- withdrawal_period_milk: Days before milk consumption
- storage_conditions: Storage requirements
- warnings: Important warnings

Focus on commonly used veterinary medicines in Kenya including antibiotics, antiparasitics, anti-inflammatories, vitamins, vaccines, and growth promoters. Use realistic Kenyan market prices based on 2024 pricing.`
          },
          {
            role: 'user',
            content: 'Generate 30 commonly used veterinary medicines in Kenya with realistic pricing and complete details. Return as a JSON array.'
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const medicinesData = JSON.parse(content);
    
    // Extract the medicines array from the response
    const medicines = medicinesData.medicines || medicinesData.medications || Object.values(medicinesData)[0];

    if (!Array.isArray(medicines)) {
      throw new Error('Invalid response format from AI');
    }

    // Insert medicines into database
    const { data: insertedData, error: insertError } = await supabase
      .from('medication_knowledge')
      .upsert(medicines, { 
        onConflict: 'medication_name',
        ignoreDuplicates: false 
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log(`Successfully populated ${medicines.length} medicines`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: medicines.length,
        medicines: medicines.map(m => m.medication_name)
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in populate-medicine-database function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

-- Seed Knowledge Base Data for Vetix AI
-- Run this file in Supabase SQL Editor to populate the knowledge base
-- This data is curated from authoritative veterinary sources

-- Insert Disease Knowledge
INSERT INTO public.disease_knowledge (disease_name, animal_types, common_symptoms, causes, transmission_method, incubation_period, severity, mortality_rate, treatment_protocol, prevention_measures, vaccination_available, zoonotic, reportable, regional_prevalence, seasonal_pattern, economic_impact, source_url)
VALUES 
('East Coast Fever', 
 ARRAY['cattle'], 
 ARRAY['High fever (40-42°C)', 'Swollen lymph nodes', 'Difficulty breathing', 'Loss of appetite', 'Nasal discharge', 'Weight loss', 'Weakness'],
 'Caused by Theileria parva parasite transmitted by brown ear ticks',
 'Tick-borne (Rhipicephalus appendiculatus)',
 '8-25 days',
 'critical',
 '80-90% if untreated',
 'Immediate treatment with Buparvaquone (Butalex) 2.5mg/kg body weight IM. Early treatment critical. Supportive care with fluids and vitamins. Repeat dose after 48-72 hours if needed.',
 ARRAY['Tick control through acaricide dipping/spraying every 7 days', 'Infection and treatment method (controlled exposure)', 'Pasture rotation', 'Remove ticks manually', 'Quarantine new animals'],
 true,
 false,
 true,
 '{"Kenya": "very high", "Tanzania": "high", "Uganda": "high", "Coast Region": "endemic", "Rift Valley": "high"}'::jsonb,
 'Peaks during rainy seasons when tick population increases',
 'Devastating - estimated $300 million annual losses in East Africa. Single most important disease constraint to cattle production.',
 'https://www.ilri.org/research/projects/infectious-diseases-east-african-livestock-ideal'
),

('Rift Valley Fever',
 ARRAY['cattle', 'sheep', 'goat', 'camel'],
 ARRAY['High fever', 'Sudden death in young animals', 'Abortion in pregnant animals', 'Bloody diarrhea', 'Jaundice', 'Weakness'],
 'RNA virus (Phlebovirus) transmitted by mosquitoes',
 'Mosquito-borne, contact with infected blood/tissue',
 '2-6 days',
 'critical',
 '10-20% in adults, 70-100% in young animals',
 'NO CURE. Supportive care only. Isolate affected animals immediately. Use PPE when handling. Notify authorities immediately as this is reportable and zoonotic.',
 ARRAY['Vaccination before rainy season', 'Mosquito control', 'Avoid handling sick animals without protection', 'Proper disposal of dead animals', 'Quarantine movement restrictions during outbreaks'],
 true,
 true,
 true,
 '{"Kenya": "periodic outbreaks", "Marsabit": "recent 2024", "Isiolo": "alert", "Coast": "risk", "Rift Valley": "high risk"}'::jsonb,
 'Outbreaks occur during heavy rains and flooding',
 'Severe - threatens human lives, livestock deaths, trade restrictions. Recent 2024 outbreak in Marsabit County.',
 'https://www.gavi.org/vaccineswork/rift-valley-fever-kills-both-livestock-people-becoming-more-common'
),

('Foot and Mouth Disease',
 ARRAY['cattle', 'sheep', 'goat', 'pig'],
 ARRAY['Fever', 'Blisters on mouth and feet', 'Excessive salivation', 'Lameness', 'Loss of appetite', 'Drop in milk production'],
 'Highly contagious viral disease (Aphthovirus)',
 'Direct contact, contaminated feed/water, airborne',
 '2-14 days',
 'high',
 'Low mortality but high morbidity',
 'NO CURE. Supportive treatment: wound care, soft feed, pain relief, antibiotics for secondary infections. Isolate immediately. Report to authorities.',
 ARRAY['Vaccination (biannual)', 'Quarantine new animals 21 days', 'Limit animal movement during outbreaks', 'Disinfect facilities', 'Control visitors to farm'],
 true,
 false,
 true,
 '{"Kenya": "endemic", "All regions": "present"}'::jsonb,
 'Year-round but worse during dry season stress',
 'Major economic loss - reduced milk, weight loss, trade restrictions. Recovery takes 2-3 weeks.',
 'https://www.aphis.usda.gov/livestock-poultry-disease'
),

('Pneumonia',
 ARRAY['cattle', 'sheep', 'goat', 'pig'],
 ARRAY['Coughing', 'Rapid breathing', 'Fever', 'Nasal discharge', 'Loss of appetite', 'Depression'],
 'Bacterial or viral infection, often stress-related',
 'Airborne, direct contact, poor ventilation',
 '3-7 days',
 'medium',
 '5-30% depending on treatment',
 'Antibiotics (Oxytetracycline 20mg/kg IM daily for 3-5 days). Anti-inflammatory drugs. Supportive care with good nutrition and shelter.',
 ARRAY['Good ventilation', 'Reduce stress', 'Avoid overcrowding', 'Vaccination', 'Quarantine sick animals'],
 true,
 false,
 false,
 '{"Kenya": "common", "All regions": "present"}'::jsonb,
 'More common during cold/wet seasons and when animals stressed',
 'Moderate - reduced growth, treatment costs, possible deaths',
 'https://www.veterinaryhandbook.com.au/'
)

ON CONFLICT DO NOTHING;

-- Insert Medication Knowledge
INSERT INTO public.medication_knowledge (medication_name, generic_name, drug_class, target_animals, target_conditions, dosage_formula, administration_route, frequency, duration, contraindications, side_effects, withdrawal_period_meat, withdrawal_period_milk, available_in_kenya, approximate_cost_ksh, prescription_required, warnings, source_url)
VALUES
('Butalex', 'Buparvaquone', 'Antiparasitic', 
 ARRAY['cattle'], 
 ARRAY['East Coast Fever', 'Theileriosis'],
 '2.5 mg/kg body weight',
 'Intramuscular injection',
 'Single dose, repeat after 48-72hrs if needed',
 'Single dose or 2 doses',
 ARRAY['Do not use in very weak animals without supportive care', 'Not for use in animals with liver disease'],
 ARRAY['Injection site swelling', 'Temporary loss of appetite'],
 '28 days',
 'Not applicable (treat only sick animals)',
 true,
 '2,500-3,500 KSh per dose',
 true,
 ARRAY['Early treatment is critical - do not delay', 'Keep refrigerated', 'Expensive but life-saving'],
 'https://vetmed.wsu.edu/'
),

('Oxytetracycline LA', 'Oxytetracycline', 'Antibiotic',
 ARRAY['cattle', 'sheep', 'goat'],
 ARRAY['Pneumonia', 'Foot rot', 'Bacterial infections', 'Secondary infections'],
 '20 mg/kg body weight',
 'Intramuscular or intravenous injection',
 'Once daily or every 48-72 hours (long-acting)',
 '3-5 days',
 ARRAY['Do not use in animals with kidney disease', 'Avoid in young animals with developing teeth'],
 ARRAY['Injection site reactions', 'May cause temporary diarrhea'],
 '21 days',
 '7 days',
 true,
 '500-800 KSh per 100ml bottle',
 false,
 ARRAY['Rotate injection sites', 'Do not mix with calcium-containing solutions'],
 'https://www.vet-ebooks.com/'
),

('Ivermectin', 'Ivermectin', 'Antiparasitic',
 ARRAY['cattle', 'sheep', 'goat', 'pig'],
 ARRAY['Worms', 'Ticks', 'Lice', 'Mange'],
 '0.2 mg/kg body weight (200 mcg/kg)',
 'Subcutaneous injection or pour-on',
 'Single dose, repeat after 14-21 days for heavy infestations',
 'Single dose or 2 doses',
 ARRAY['Do not use in lactating dairy animals', 'Toxic to fish and aquatic life'],
 ARRAY['Mild injection site swelling', 'Rare: nervous signs if overdosed'],
 '28-35 days',
 'Do not use in dairy animals',
 true,
 '300-600 KSh per dose',
 false,
 ARRAY['Proper disposal of packaging', 'Keep animals away from water sources for 48 hours', 'Rotate dewormers to prevent resistance'],
 'https://www.vet-ebooks.com/'
),

('Albendazole', 'Albendazole', 'Antiparasitic',
 ARRAY['cattle', 'sheep', 'goat'],
 ARRAY['Roundworms', 'Tapeworms', 'Liver flukes'],
 '10 mg/kg body weight',
 'Oral drench',
 'Single dose',
 'Single dose, repeat after 21 days if needed',
 ARRAY['Do not use in first trimester of pregnancy', 'Not for severely debilitated animals'],
 ARRAY['Rare: temporary loss of appetite'],
 '14 days',
 '3 days',
 true,
 '100-250 KSh per dose',
 false,
 ARRAY['Rotate dewormers every 6-12 months', 'Do not underdose', 'Fast animals before treatment for best results'],
 'https://www.vet-ebooks.com/'
)

ON CONFLICT DO NOTHING;

-- Insert Vaccination Schedules
INSERT INTO public.vaccination_schedules (animal_type, vaccine_name, disease_prevention, age_at_first_dose, number_of_doses, interval_between_doses, booster_frequency, season_recommended, critical_priority, cost_range_ksh, administration_method, regional_requirement, notes, source_url)
VALUES
('cattle', 'ECF Vaccine (Muguga Cocktail)', 'East Coast Fever', '3-4 months', 1, NULL, 'Not required (lifelong immunity)', ARRAY['Before tick season'], 'essential', '1,500-2,000 KSh', 'Infection and treatment method', 'Mandatory in endemic areas like Coast, Rift Valley', 'Involves controlled infection followed by treatment. Must be done by trained personnel. Do not vaccinate sick or stressed animals.', 'https://www.ilri.org/'),

('cattle', 'FMD Vaccine', 'Foot and Mouth Disease', '4-6 months', 2, '21-28 days', 'Every 6 months', ARRAY['Before dry season'], 'essential', '200-400 KSh per dose', 'Subcutaneous', 'Mandatory in most regions', 'Very important for trade and herd health. Keep vaccine cold chain.', 'https://www.farmstandapp.com/'),

('cattle', 'Lumpy Skin Disease Vaccine', 'Lumpy Skin Disease', '3 months', 1, NULL, 'Annual', ARRAY['Before rainy season'], 'recommended', '150-300 KSh', 'Intradermal or subcutaneous', 'Recommended nationwide', 'Protects against severe economic losses from reduced milk and weight loss.', 'https://www.bivatec.com/'),

('cattle', 'Anthrax Vaccine', 'Anthrax', '6 months', 1, NULL, 'Annual', ARRAY['Before rainy season'], 'essential', '50-150 KSh', 'Subcutaneous', 'Mandatory in endemic areas', 'Critical for human health safety. Reportable disease.', 'https://www.aphis.usda.gov/'),

('sheep', 'PPR Vaccine', 'Peste des Petits Ruminants', '3-4 months', 1, NULL, 'Every 3 years', ARRAY['Dry season'], 'essential', '50-100 KSh', 'Subcutaneous', 'Essential in all regions', 'Provides long-lasting immunity. Very cost-effective.', 'https://www.bivatec.com/'),

('goat', 'PPR Vaccine', 'Peste des Petits Ruminants', '3-4 months', 1, NULL, 'Every 3 years', ARRAY['Dry season'], 'essential', '50-100 KSh', 'Subcutaneous', 'Essential in all regions', 'Provides long-lasting immunity against deadly viral disease.', 'https://www.bivatec.com/'),

('poultry', 'Newcastle Disease Vaccine', 'Newcastle Disease', '7-14 days old', 3, '14-21 days', 'Every 3-4 months', ARRAY['Year-round'], 'essential', '2-5 KSh per bird', 'Eye drop or drinking water', 'Mandatory', 'Most important vaccine for chickens. Can wipe out entire flock if not vaccinated.', 'https://grow.ifa.coop/'),

('poultry', 'Infectious Bursal Disease Vaccine (Gumboro)', 'Infectious Bursal Disease', '14-21 days old', 2, '14 days', 'Every 6 months', ARRAY['Year-round'], 'essential', '3-7 KSh per bird', 'Drinking water or injection', 'Essential', 'Protects immune system. Critical for young birds.', 'https://www.bivatec.com/')

ON CONFLICT DO NOTHING;

-- Insert Emergency Procedures
INSERT INTO public.emergency_procedures (emergency_type, animal_types, immediate_signs, immediate_actions, do_not_do, when_critical, call_vet_immediately, time_sensitive_minutes, supplies_needed, step_by_step_guide, prevention_tips, source_url)
VALUES
('Bloat (Gas buildup in rumen)',
 ARRAY['cattle', 'sheep', 'goat'],
 ARRAY['Swollen left side (behind ribs)', 'Difficulty breathing', 'Standing with legs apart', 'Kicking at belly', 'Salivation', 'Collapse'],
 ARRAY['Move animal immediately - keep walking', 'Elevate front legs (hindquarters lower)', 'Massage left side vigorously', 'If severe - call vet for trocar insertion'],
 ARRAY['Do not lay animal down', 'Do not pour water/oil down throat', 'Do not give feed', 'Do not delay treatment'],
 true,
 true,
 30,
 ARRAY['Vegetable oil (1 liter)', 'Stomach tube if trained', 'Trocar and cannula (vet use)', 'Rope or halter'],
 ARRAY['Keep animal standing and moving', 'Massage swollen area to help release gas', 'Give 500ml-1L vegetable oil by mouth if animal can swallow', 'If bloat severe after 20 minutes, call vet immediately for trocar insertion', 'After recovery, gradually return to feed over 24 hours'],
 ARRAY['Avoid sudden diet changes', 'Limit legume pasture (clover, alfalfa) especially when wet', 'Introduce new feeds gradually over 7-10 days', 'Provide dry hay before green pasture', 'Use anti-bloat blocks'],
 'https://www.vet.cornell.edu/'
),

('Dystocia (Difficult Birth)',
 ARRAY['cattle', 'sheep', 'goat'],
 ARRAY['Labor for more than 2 hours with no progress', 'Only one leg or head visible', 'Exhausted animal', 'Bloody discharge before calf appears'],
 ARRAY['Wash hands and arms thoroughly with soap', 'Wear long gloves if available', 'Check position of calf', 'If normal position but stuck - gentle pulling during contractions only'],
 ARRAY['Never force pull continuously', 'Do not pull when mother is not contracting', 'Do not wait more than 30 minutes if making no progress', 'Do not use ropes around neck'],
 true,
 true,
 60,
 ARRAY['Long obstetric gloves or clean plastic sleeves', 'Lubricant or soap and warm water', 'Clean towels', 'Rope (smooth, not rough)', 'Disinfectant'],
 ARRAY['Clean the birth area with soap and water', 'Gently examine internally to determine calf position', 'If calf positioned normally but large - pull ONLY during contractions', 'If malpresented (legs back, breech) - call vet immediately', 'After birth - ensure calf breathes and mother passes placenta within 12 hours'],
 ARRAY['Proper nutrition during pregnancy - not too fat, not too thin', 'First-time mothers need extra monitoring', 'Know when to call for help - do not wait too long', 'Have vet number ready during calving season'],
 'https://www.farmkeep.com/'
),

('Snake Bite',
 ARRAY['cattle', 'sheep', 'goat', 'pig'],
 ARRAY['Sudden swelling (face, leg, or body)', 'Two puncture marks', 'Difficulty breathing if bitten on face/neck', 'Weakness', 'Drooling'],
 ARRAY['Keep animal calm and still', 'Identify snake if safe to do so', 'Clean bite area with water', 'Apply ice pack if available', 'Call vet immediately'],
 ARRAY['Do not cut the bite area', 'Do not apply tourniquet', 'Do not give alcohol or herbs without vet advice', 'Do not chase the snake'],
 true,
 true,
 120,
 ARRAY['Ice pack', 'Clean water', 'Phone to call vet', 'Clean cloth'],
 ARRAY['Restrict animal movement - carry if possible', 'Remove collar if on neck', 'Keep bite area below heart level if possible', 'Monitor breathing closely', 'Transport to vet as quickly as possible'],
 ARRAY['Keep grass around pens short', 'Remove woodpiles and debris', 'Use boots and long pants when in bush', 'Be cautious during dawn and dusk', 'Store feed in sealed containers to avoid attracting rodents'],
 'https://www.vet.cornell.edu/'
),

('Choking',
 ARRAY['cattle', 'sheep', 'goat'],
 ARRAY['Sudden distress while eating', 'Drooling', 'Extended neck', 'Repeated swallowing attempts', 'Bloat developing'],
 ARRAY['Remove all feed immediately', 'Gently massage throat area', 'Pour small amounts of vegetable oil down throat', 'Keep animal standing'],
 ARRAY['Do not force water down throat', 'Do not push object with stick or hand', 'Do not wait more than 30 minutes'],
 true,
 true,
 45,
 ARRAY['Vegetable oil (500ml)', 'Clean water', 'Phone to call vet'],
 ARRAY['Identify and remove cause if visible at mouth', 'Massage external throat gently', 'Give 250-500ml vegetable oil slowly', 'If no improvement in 30 minutes - call vet for stomach tube', 'Watch for bloat development'],
 ARRAY['Cut root crops into small pieces', 'Avoid feeding whole apples/potatoes', 'Ensure adequate water available during feeding', 'Do not feed when animals very hungry'],
 'https://www.veterinaryhandbook.com.au/'
)

ON CONFLICT DO NOTHING;

-- Insert Farming Best Practices
INSERT INTO public.farming_best_practices (category, animal_types, practice_title, description, benefits, implementation_steps, cost_implication, roi_timeframe, suitable_for_smallholder, climate_considerations, regional_adaptations, common_mistakes, source_url)
VALUES
('disease_prevention', 
 ARRAY['cattle', 'sheep', 'goat'],
 'Quarantine New Animals (21-Day Rule)',
 'Always isolate new animals for at least 21 days before introducing them to your herd. This prevents introduction of diseases that may be incubating.',
 ARRAY['Prevents disease outbreaks', 'Identifies sick animals before they spread disease', 'Reduces vet costs', 'Protects your entire herd investment'],
 ARRAY['Build a separate pen away from main herd (at least 50 meters)', 'Keep new animals there for 21 days', 'Observe daily for any signs of illness', 'Deworm and treat for external parasites during quarantine', 'Only after 21 days with no problems, introduce to herd gradually'],
 'low cost',
 'immediate',
 true,
 ARRAY['Ensure quarantine pen has shade in hot areas', 'Provide shelter during rainy season'],
 '{"Kenya": "Essential practice especially when buying from markets or different regions", "Arid areas": "Critical due to movement of animals during drought"}'::jsonb,
 ARRAY['Skipping quarantine to save time', 'Quarantine pen too close to main herd', 'Not observing animals daily', 'Introducing animals too quickly after 21 days'],
 'https://www.farmkeep.com/'
),

('nutrition',
 ARRAY['cattle', 'sheep', 'goat'],
 'Mineral Supplementation with Salt Licks',
 'Provide mineral blocks or salt licks year-round to prevent deficiencies that cause poor growth, weak bones, and reduced milk production.',
 ARRAY['Improved growth rates', 'Better milk production', 'Stronger bones and teeth', 'Better reproduction', 'Reduced pica (eating soil/plastic)'],
 ARRAY['Place mineral blocks in sheltered feeding area', 'Provide one block per 10-15 animals', 'Replace when consumed or contaminated', 'Ensure fresh water always available', 'In arid areas, mix minerals with salt to encourage consumption'],
 'low cost',
 '6 months',
 true,
 ARRAY['More critical in areas with poor soils', 'Essential during dry season when pasture quality is low'],
 '{"Coast Region": "High need for phosphorus", "Rift Valley": "May need copper supplementation", "Western Kenya": "Focus on selenium"}'::jsonb,
 ARRAY['Placing blocks where they get rained on', 'Not providing enough blocks for herd size', 'Using only plain salt instead of complete mineral blocks'],
 'https://grow.ifa.coop/'
),

('housing',
 ARRAY['poultry'],
 'Biosecurity at Farm Entrance',
 'Establish a simple biosecurity protocol at farm entrance to prevent disease introduction through visitors, vehicles, and equipment.',
 ARRAY['Dramatically reduces disease risk', 'Prevents costly outbreaks', 'Shows professionalism to buyers', 'Low cost high impact'],
 ARRAY['Create footbath at farm entrance with disinfectant', 'Post sign: "Visitors Must Report to Owner"', 'Keep visitor logbook', 'Require hand washing or sanitizer', 'Provide coveralls or boots for visitors entering pens', 'No visitors who have been to other farms same day'],
 'low cost',
 'immediate',
 true,
 ARRAY['Change footbath solution more frequently in rainy season'],
 '{"High density farming areas": "Critical to prevent spread between farms", "All regions": "Essential practice"}'::jsonb,
 ARRAY['Empty or dirty footbath', 'Not enforcing rules with family members', 'Allowing visitors into pens without changing footwear', 'Using same equipment on different farms without disinfection'],
 'https://www.bivatec.com/'
),

('welfare',
 ARRAY['cattle', 'sheep', 'goat'],
 'Hoof Trimming Schedule',
 'Regular hoof trimming (every 6-12 months) prevents lameness, improves mobility, and increases productivity.',
 ARRAY['Prevents lameness and foot rot', 'Improves animal comfort', 'Better weight gain and milk production', 'Reduces treatment costs'],
 ARRAY['Learn proper technique from vet or experienced farmer', 'Trim cattle hooves every 12 months, sheep/goats every 6 months', 'Use proper hoof trimming tools', 'Work in clean, dry area', 'Treat any problems found during trimming'],
 'low cost',
 '1 year',
 true,
 ARRAY['More frequent in wet areas', 'Can be less frequent in dry, rocky areas'],
 '{"Coastal Kenya": "Trim more frequently due to soft ground", "Arid areas": "Natural wear may reduce need"}'::jsonb,
 ARRAY['Trimming too much - causes bleeding', 'Waiting until animal is lame', 'Using dull or improper tools', 'Not restraining animal properly'],
 'https://www.veterinaryhandbook.com.au/'
)

ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Knowledge base seeded successfully!' as message,
       (SELECT COUNT(*) FROM disease_knowledge) as diseases,
       (SELECT COUNT(*) FROM medication_knowledge) as medications,
       (SELECT COUNT(*) FROM vaccination_schedules) as vaccinations,
       (SELECT COUNT(*) FROM emergency_procedures) as emergencies,
       (SELECT COUNT(*) FROM farming_best_practices) as practices;

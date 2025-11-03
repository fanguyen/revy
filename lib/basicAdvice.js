export function basicAdvice(activity){
  const dist = activity?.distance || 0; // meters
  const moving = activity?.moving_time || 0; // seconds
  const elev = activity?.total_elevation_gain || activity?.elevation_gain || 0;
  const t = activity?.type || 'Run';

  const km = (dist/1000).toFixed(1);
  const min = Math.round(moving/60);

  const tips = [];
  // Nutrition
  if (dist > 8000 || moving > 45*60) {
    tips.push(`Dans les 30 min: vise 20–30 g de protéines et 1–1.2 g/kg de glucides. Hydrate-toi avec 500–700 ml d’eau.`);
  } else {
    tips.push(`Snack léger riche en protéines (yaourt grec, œuf, tofu) et un fruit. Hydrate-toi.`);
  }
  // Mobility
  if (elev > 300) {
    tips.push(`Étire mollets/quadris et auto-massage des quadriceps/ischios 8–10 min. Bain tiède si jambes lourdes.`);
  } else {
    tips.push(`5–8 min de mobilité hanches/chevilles et 2–3 étirements légers.`);
  }
  // Sleep
  tips.push(`Priorise le sommeil ce soir: coupe les écrans 60 min avant, vise +30–60 min de sommeil.`);

  return `Dernier entraînement: ${t} • ${km} km • ${min} min

` + tips.map((t,i)=>`${i+1}. ${t}`).join('\n');
}
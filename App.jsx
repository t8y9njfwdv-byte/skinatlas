import { useState, useMemo, useEffect } from "react";

/* Lagring i nettleseren (localStorage) */
const storage = {
  get: async (k) => { const v = localStorage.getItem(k); return v ? { value: v } : null; },
  set: async (k, v) => { localStorage.setItem(k, v); return { key: k }; },
};


/* ============ INGREDIENS-KUNNSKAP ============ */
const ING = {
  ceramider: { s:"Bygger opp hudbarrieren", d:"Ceramider er fettstoffer huden selv består av – som mørtelen mellom mursteinene i hudcellene. Tilført ceramid tetter «sprekker», så huden holder på fukt og slipper inn færre irritanter.", u:"https://pubmed.ncbi.nlm.nih.gov/29692196/" },
  hyaluron: { s:"Binder fukt i huden", d:"Hyaluronsyre kan binde opptil 1000x sin egen vekt i vann – en svamp som trekker fukt inn i hudens ytterste lag.", u:"https://pubmed.ncbi.nlm.nih.gov/22052267/" },
  niacinamid: { s:"Jevner hudtone, roer rødhet", d:"Niacinamid (vitamin B3) demper betennelsessignaler og bremser overføring av pigment til hudoverflaten – jevnere tone, roligere rødhet. Øker også hudens egen ceramidproduksjon.", u:"https://pubmed.ncbi.nlm.nih.gov/16766489/" },
  salisylsyre: { s:"Renser porene innenfra (BHA)", d:"Fettløselig syre som går NED i porene og løser opp talg og døde hudceller der kviser starter. Betennelsesdempende.", u:"https://pubmed.ncbi.nlm.nih.gov/26480473/", freq:"Start 2–3 kvelder/uke → øk gradvis. Gjør huden mer solfølsom: SPF hver dag er obligatorisk.", sun:true, preg:true },
  glykolsyre: { s:"Eksfolierer overflaten (AHA)", d:"Løsner «limet» mellom døde hudceller så de slipper taket – glattere hud som reflekterer lys bedre.", u:"https://pubmed.ncbi.nlm.nih.gov/32090395/", freq:"Start 1–2 kvelder/uke → maks annenhver kveld. Øker solfølsomhet betydelig.", sun:true },
  retinol: { s:"Gullstandard mot linjer og tekstur", d:"Vitamin A som skrur opp cellefornyelse og kollagenproduksjon – den mest dokumenterte anti-aldringsingrediensen. Kun kveld (brytes ned av UV-lys).", u:"https://pubmed.ncbi.nlm.nih.gov/17515510/", freq:"Uke 1–2: 2 kvelder/uke · Uke 3–4: annenhver kveld · Deretter: hver kveld hvis huden tåler det. Litt flassing i starten er normalt.", sun:true, preg:true },
  bakuchiol: { s:"Mildt retinol-alternativ", d:"Planteekstrakt med retinol-lignende effekt på linjer og pigment i studier – uten irritasjonen. Trygt ved graviditet.", u:"https://pubmed.ncbi.nlm.nih.gov/29947134/", freq:"Kan brukes hver kveld fra dag én." },
  "vitamin-c": { s:"Antioksidant – glød og beskyttelse", d:"Nøytraliserer frie radikaler fra sol og forurensning FØR de skader kollagen – derfor hører den hjemme om MORGENEN, under solkremen. Bremser også pigmentproduksjon.", u:"https://pubmed.ncbi.nlm.nih.gov/28805671/", freq:"Hver morgen, under solkrem. Litt kribling første ukene er vanlig." },
  centella: { s:"Roer og reparerer (K-beauty-klassiker)", d:"Centella asiatica («cica») demper betennelse og stimulerer sårheling – førstehjelp for stresset hud.", u:"https://pubmed.ncbi.nlm.nih.gov/23075185/", freq:"Daglig, morgen og/eller kveld." },
  azelainsyre: { s:"Mot kviser og rødhet – veldig mild", d:"Dreper kvisebakterier, roer rødhet og jevner pigment – så mild at den brukes ved rosacea og i graviditet.", u:"https://pubmed.ncbi.nlm.nih.gov/26244269/", freq:"1x daglig første uken → øk til morgen + kveld." },
  peptider: { s:"Signalstoffer for fastere hud", d:"Små proteinbiter som «lurer» huden til å produsere mer kollagen. Mild og godt tolerert.", u:"https://pubmed.ncbi.nlm.nih.gov/32671986/", freq:"Daglig." },
  mucin: { s:"Sneglemucin – fukt og glød", d:"Rikt på glykoproteiner og hyaluron – fukt, heling og den koreanske «glass skin»-gløden.", u:"https://pubmed.ncbi.nlm.nih.gov/32671986/", freq:"Daglig." },
  skvalan: { s:"Lett olje som ligner hudens egen talg", d:"Skvalan er en stabil, ikke-komedogen olje som etterligner hudens naturlige lipider. Mykgjør uten å tette porer – derfor elsket av både tørr og fet hud.", u:"https://pubmed.ncbi.nlm.nih.gov/30061924/", },
  panthenol: { s:"Pro-vitamin B5 – roer og reparerer", d:"Panthenol omdannes til pantotensyre i huden og støtter sårheling og barrierereparasjon. En av de mest veldokumenterte beroligende ingrediensene.", u:"https://pubmed.ncbi.nlm.nih.gov/28217909/", },
  "vitamin-e": { s:"Antioksidant som beskytter hudens fett", d:"Tokoferol beskytter hudens lipider mot oksidering og forsterker effekten av vitamin C – klassisk antioksidant-duo.", u:"https://pubmed.ncbi.nlm.nih.gov/27559512/", },
  urea: { s:"Fuktbinder og mild eksfoliant", d:"I lave prosenter binder urea fukt; i høyere løser den opp hard, tørr hud. Standard i medisinsk hudpleie for svært tørr hud.", u:"https://pubmed.ncbi.nlm.nih.gov/30085366/", },
  pha: { s:"Den mildeste syrefamilien", d:"Polyhydroksysyrer (glukonolakton m.fl.) eksfolierer som AHA, men med større molekyler som ikke trenger like dypt – mindre irritasjon, fin for sensitiv hud.", u:"https://pubmed.ncbi.nlm.nih.gov/15841642/", freq:"2–4 kvelder/uke, mildere enn AHA.", sun:true },
  sink: { s:"Roer og regulerer talg", d:"Sink (ofte som PCA eller oksid) virker antiinflammatorisk og talgregulerende – vanlig i produkter mot uren hud.", u:"https://pubmed.ncbi.nlm.nih.gov/25120566/", },
  "gronn-te": { s:"Antioksidant, roer huden", d:"EGCG demper betennelse og beskytter mot UV-relatert stress.", u:"https://pubmed.ncbi.nlm.nih.gov/29672394/" },
};

/* ============ PRODUKTER ============ */
/* cf = dyretestfritt (Leaping Bunny/PETA-listet e.l.), vg = vegansk. Demo-data – verifiseres mot offisielle lister i full versjon. */
const P = [
  { id:"k1", cat:"maske", name:"Indian Healing Clay", brand:"Aztec Secret", tier:1, ings:[], for:["fet","kombi","normal"], hue:"#E8DDC8", cf:true, vg:true },
  { id:"k2", cat:"maske", name:"Rich Moist Soothing Sheet Mask", brand:"Klairs", tier:1, ings:["centella","hyaluron"], for:["torr","sens","normal","kombi"], hue:"#E8DDC8", cf:true, vg:true },
  { id:"k3", cat:"maske", name:"Water Sleeping Mask", brand:"Laneige", tier:2, ings:["hyaluron"], for:["torr","normal","kombi","fet"], hue:"#E8DDC8", cf:false, vg:false },
  { id:"k4", cat:"maske", name:"Honey Mask", brand:"I'm From", tier:2, ings:[], for:["torr","sens","normal"], hue:"#E8DDC8", cf:true, vg:false },
  { id:"o1", cat:"olje", name:"Clean It Zero Original", brand:"Banila Co", tier:1, ings:[], for:["torr","fet","kombi","normal","sens"], hue:"#FFE9D6", cf:true, vg:false },
  { id:"o2", cat:"olje", name:"All Clean Balm", brand:"Heimish", tier:1, ings:[], for:["torr","fet","kombi","normal","sens"], hue:"#FFE9D6", cf:true, vg:false },
  { id:"o3", cat:"olje", name:"Ginseng Cleansing Oil", brand:"Beauty of Joseon", tier:1, ings:[], for:["torr","normal","kombi","sens"], hue:"#FFE9D6", cf:true, vg:true },
  { id:"o4", cat:"olje", name:"Deep Cleansing Oil", brand:"DHC", tier:2, ings:[], for:["torr","normal","kombi","fet"], hue:"#FFE9D6", cf:true, vg:true },
  { id:"c7", cat:"rens", name:"Heartleaf Quercetinol Cleanser", brand:"Anua", tier:1, ings:["centella"], for:["sens","torr","normal","kombi"], hue:"#D9F2E6", cf:true, vg:true },
  { id:"c8", cat:"rens", name:"Creamy Jelly Cleanser", brand:"Byoma", tier:1, ings:["ceramider"], for:["torr","normal","sens","kombi"], hue:"#D9F2E6", cf:true, vg:true },
  { id:"s12", cat:"serum", name:"C-Glow Vitamin C", brand:"Geek & Gorgeous", tier:1, ings:["vitamin-c"], goal:"glow", for:["normal","kombi","fet","torr"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"s13", cat:"serum", name:"Snail 96 Mucin Power Essence", brand:"COSRX", tier:1, ings:["mucin","hyaluron"], goal:"ro", for:["torr","normal","kombi","fet"], hue:"#E2F3D5", cf:true, vg:false },
  { id:"s14", cat:"serum", name:"Hyaluronic Acid Serum", brand:"The Inkey List", tier:1, ings:["hyaluron"], goal:"ro", for:["torr","normal","sens","kombi","fet"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"m7", cat:"krem", name:"Moisturizing Rich Cream", brand:"Byoma", tier:1, ings:["ceramider","hyaluron"], for:["torr","normal","sens"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"m8", cat:"krem", name:"Holy Hydration! Face Cream", brand:"e.l.f.", tier:1, ings:["hyaluron","niacinamid","peptider"], for:["torr","normal","kombi","fet"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"c1", cat:"rens", name:"Hydrating Cleanser", brand:"CeraVe", tier:1, ings:["ceramider","hyaluron","niacinamid"], for:["torr","normal","sens"], hue:"#D9F2E6", cf:false, vg:false },
  { id:"c2", cat:"rens", name:"Toleriane Dermo-Cleanser", brand:"La Roche-Posay", tier:2, ings:["ceramider","niacinamid"], for:["torr","sens","normal"], hue:"#D9F2E6", cf:false, vg:false },
  { id:"c3", cat:"rens", name:"Low pH Good Morning Gel", brand:"COSRX", tier:1, ings:["gronn-te","salisylsyre"], for:["fet","kombi","normal","sens"], hue:"#D9F2E6", cf:true, vg:true },
  { id:"c4", cat:"rens", name:"Green Clean Balm", brand:"Farmacy", tier:3, ings:["gronn-te"], for:["torr","normal","kombi"], hue:"#D9F2E6", cf:true, vg:false },
  { id:"c6", cat:"rens", name:"Matcha Hemp Hydrating Cleanser", brand:"Krave Beauty", tier:2, ings:["gronn-te","hyaluron"], for:["torr","sens","normal","kombi"], hue:"#D9F2E6", cf:true, vg:true },
  { id:"c5", cat:"rens", name:"Foaming Cleanser", brand:"CeraVe", tier:1, ings:["ceramider","niacinamid","hyaluron"], for:["fet","kombi"], hue:"#D9F2E6", cf:false, vg:false },
  { id:"t1", cat:"toner", name:"Supple Preparation Toner", brand:"Klairs", tier:2, ings:["centella","hyaluron"], for:["torr","sens","normal","kombi"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"t2", cat:"toner", name:"Advanced Snail 96 Mucin", brand:"COSRX", tier:2, ings:["mucin","hyaluron"], for:["torr","normal","kombi","fet"], hue:"#EAE2FF", cf:true, vg:false },
  { id:"s10", cat:"serum", name:"Lactic Acid 10% + HA", brand:"The Ordinary", tier:1, ings:["glykolsyre","hyaluron"], goal:"glow", for:["normal","kombi","fet","torr"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"s11", cat:"serum", name:"Glow Tonic (AHA)", brand:"Pixi", tier:2, ings:["glykolsyre","gronn-te"], goal:"glow", for:["normal","kombi","fet"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"s1", cat:"serum", name:"2% BHA Liquid Exfoliant", brand:"Paula's Choice", tier:2, ings:["salisylsyre","gronn-te"], goal:"kviser", for:["fet","kombi","normal"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"s2", cat:"serum", name:"Azelaic Acid 10%", brand:"The Ordinary", tier:1, ings:["azelainsyre"], goal:"kviser", for:["sens","torr","normal","kombi","fet"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"s3", cat:"serum", name:"Vitamin C 23% + Ferulic", brand:"Timeless", tier:2, ings:["vitamin-c","hyaluron"], goal:"glow", for:["normal","kombi","fet","torr"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"s4", cat:"serum", name:"C E Ferulic", brand:"SkinCeuticals", tier:3, ings:["vitamin-c"], goal:"glow", for:["normal","torr","kombi"], hue:"#FFF2BD", cf:false, vg:false },
  { id:"s5", cat:"serum", name:"Crystal Retinal 3", brand:"Medik8", tier:3, ings:["retinol","hyaluron"], goal:"aldring", for:["normal","kombi","torr","fet"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"s6", cat:"serum", name:"Granactive Retinoid 2%", brand:"The Ordinary", tier:1, ings:["retinol"], goal:"aldring", for:["normal","kombi","fet"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"s7", cat:"serum", name:"Bakuchiol Serum", brand:"Herbivore", tier:3, ings:["bakuchiol"], goal:"aldring", for:["sens","torr","normal"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"s8", cat:"serum", name:"Centella Unscented Serum", brand:"Purito", tier:1, ings:["centella","niacinamid"], goal:"ro", for:["sens","torr","normal","kombi","fet"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"s9", cat:"serum", name:"Niacinamide 10% + Zinc", brand:"The Ordinary", tier:1, ings:["niacinamid"], goal:"glow", for:["fet","kombi","normal"], hue:"#D6E9FF", cf:true, vg:true },
  { id:"m1", cat:"krem", name:"Moisturising Cream", brand:"CeraVe", tier:1, ings:["ceramider","hyaluron"], for:["torr","normal","sens"], hue:"#E1E8FF", cf:false, vg:false },
  { id:"m2", cat:"krem", name:"Cicaplast Baume B5+", brand:"La Roche-Posay", tier:2, ings:["centella","niacinamid"], for:["sens","torr","normal"], hue:"#E1E8FF", cf:false, vg:false },
  { id:"m6", cat:"krem", name:"Natural Moisturizing Factors + HA", brand:"The Ordinary", tier:1, ings:["hyaluron","ceramider"], for:["torr","normal","sens","kombi"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"m3", cat:"krem", name:"Water Cream", brand:"Tatcha", tier:3, ings:["gronn-te","hyaluron"], for:["fet","kombi","normal"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"m4", cat:"krem", name:"Hydro Boost Gel", brand:"Neutrogena", tier:1, ings:["hyaluron"], for:["fet","kombi","normal"], hue:"#E1E8FF", cf:false, vg:false },
  { id:"m5", cat:"krem", name:"Dynamic Skin Recovery", brand:"Dermalogica", tier:3, ings:["peptider","hyaluron"], for:["normal","torr","kombi"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"f1", cat:"spf", name:"Anthelios UVMune 400", brand:"La Roche-Posay", tier:2, ings:["hyaluron"], for:["sens","torr","normal","kombi","fet"], hue:"#FFE59A", cf:false, vg:false },
  { id:"f2", cat:"spf", name:"Relief Sun SPF50", brand:"Beauty of Joseon", tier:1, ings:["mucin","gronn-te"], for:["torr","normal","kombi","sens"], hue:"#FFE59A", cf:true, vg:false },
  { id:"f4", cat:"spf", name:"Rice + Probiotics SPF50 (vegansk)", brand:"Beauty of Joseon", tier:1, ings:["niacinamid"], for:["torr","normal","kombi","sens","fet"], hue:"#FFE59A", cf:true, vg:true },
  { id:"f3", cat:"spf", name:"Unseen Sunscreen", brand:"Supergoop!", tier:3, ings:[], for:["fet","kombi","normal"], hue:"#FFE59A", cf:true, vg:true },
];

const NAVN = { skvalan:"Skvalan", panthenol:"Panthenol (B5)", "vitamin-e":"Vitamin E", urea:"Urea", pha:"PHA-syre", sink:"Sink", "gronn-te":"Grønn te", "vitamin-c":"Vitamin C", ceramider:"Ceramider", hyaluron:"Hyaluronsyre", niacinamid:"Niacinamid", salisylsyre:"Salisylsyre (BHA)", glykolsyre:"AHA-syre", retinol:"Retinol", bakuchiol:"Bakuchiol", centella:"Centella", azelainsyre:"Azelainsyre", peptider:"Peptider", mucin:"Sneglemucin" };
const nvn = (i) => NAVN[i] || i;

const SENS_OPTS = [
  { v:"parfyme", t:"Parfyme/duft" }, { v:"alkohol", t:"Alkohol" },
  { v:"retinol", t:"Retinol" }, { v:"vitamin-c", t:"Vitamin C" },
  { v:"salisylsyre", t:"Syrer (AHA/BHA)" },
];

const HELSE = [
  { v:"gravid", t:"Gravid eller ammer", d:"Vi bytter ut retinol og sterke syrer med trygge alternativer" },
  { v:"hudsykdom", t:"Hudsykdom", d:"Rosacea, eksem, psoriasis, perioral dermatitt o.l." },
  { v:"hormon", t:"Hormonelle forstyrrelser", d:"PCOS, skjoldbruskkjertel o.l. – kan påvirke huden" },
  { v:"behandling", t:"Kreftbehandling / sterke medisiner", d:"Cellegift, isotretinoin (Roaccutan) o.l." },
];

const GOALS = [
  { v:"kviser", t:"Kviser & urenheter", d:"Rense porene og forebygge utbrudd" },
  { v:"glow", t:"Glød & jevn hudtone", d:"Lysere, friskere hud" },
  { v:"aldring", t:"Fine linjer & fasthet", d:"Forebygge og glatte ut" },
  { v:"ro", t:"Roe sensitiv hud", d:"Styrke barrieren, mindre rødhet" },
];

const NYBEGYNNER = {
  olje: { how:"Kveld, som steg 1 av dobbelrensen: masser inn på TØRR hud i 60 sek – oljen løser opp solkrem, sminke og talg. Skyll, og følg opp med vanlig rens. Dette er K-beauty-metoden for å faktisk få av dagens SPF.", amount:"1–2 pumper / mandelstor klatt" },
  rens: { how:"Kveld: masser inn med lunkent vann i ~60 sek, klapp tørt. Morgen: for de fleste holder det å skylle med lunkent vann – huden er allerede ren fra kvelden, og mindre rens = sterkere hudbarriere. Unntak: veldig fet hud, eller hvis du brukte tunge produkter natten før.", amount:"1 pump / kirsebærstor klatt" },
  toner: { how:"K-beauty-laget: klapp inn på lett fuktig hud rett etter rens, morgen og kveld. Gir ekstra fukt og forbereder huden på serum.", amount:"3–4 dråper" },
  maske: { how:"1–2 ganger i uken, på ren hud. Leirmasker: 10–15 min, skyll før det tørker helt. Sheet/sleeping masks: la virke lenger. Unngå maske samme kveld som syre/retinol.", amount:"Ett jevnt lag / én maske" },
  serum: { how:"På ren, tørr hud. Vent 1–2 min før neste steg.", amount:"3–4 dråper / ertestor" },
  krem: { how:"Jevnt lag over hele ansiktet – låser inn alt under.", amount:"Hasselnøttstor klatt" },
  spf: { how:"Siste steg om morgenen. HVER dag, også i skyet vær.", amount:"2 fingerlengder" },
};

/* ============ LOGIKK ============ */
function pregnancyUnsafe(p) { return p.ings.some((i) => ING[i]?.preg); }

function scoreProduct(p, ans, avoid, dislikedIngs) {
  for (const s of avoid) {
    if (p.ings.includes(s)) return -999;
    if (s === "salisylsyre" && p.ings.includes("glykolsyre")) return -999;
  }
  if (ans.helse.includes("gravid") && pregnancyUnsafe(p)) return -999;
  let sc = 0;
  if (p.for.includes(ans.hudtype)) sc += 3;
  const gentle = ans.sensitiv === "ja" || ans.helse.includes("hudsykdom") || ans.helse.includes("behandling");
  if (gentle && p.for.includes("sens")) sc += 3;
  if (gentle && !p.for.includes("sens")) sc -= 3;
  if (p.goal && p.goal === ans.maal) sc += 4;
  if (ans.budsjett.includes(p.tier)) sc += 2; else sc -= 2;
  if (ans.etikk?.includes("parfymefri") && p.ings.includes("parfyme")) return -999;
  if (!p.cf && !p.custom) return -999; /* Dyretestfritt er standard */
  if (ans.toleranse === "erfaren" && p.ings.some((i) => ING[i]?.sun || i === "retinol")) sc += 1;
  if (ans.toleranse === "ny" && ans.sensitiv !== "nei" && p.ings.includes("retinol")) sc -= 1;
  for (const d of dislikedIngs) if (p.ings.includes(d)) sc -= 3;
  return sc;
}

function whyText(p, ans) {
  const bits = [];
  if (p.custom) return "Ditt eget produkt – rutinen er bygget rundt det.";
  if (p.for.includes(ans.hudtype)) bits.push(`passer ${ans.hudtype === "torr" ? "tørr" : ans.hudtype} hud`);
  if (ans.sensitiv === "ja" && p.for.includes("sens")) bits.push("trygg for sensitiv hud");
  if (ans.helse.includes("gravid") && !pregnancyUnsafe(p) && p.cat === "serum") bits.push("trygg ved graviditet");
  if (p.goal === ans.maal) bits.push("treffer hovedmålet ditt");
  const hero = p.ings.find((i) => ING[i]);
  if (hero) bits.push(`inneholder ${hero} (${ING[hero].s.toLowerCase()})`);
  return bits.length ? "Valgt fordi den " + bits.join(" · ") : "Solid allrounder for din profil";
}

function analyse(p, ans) {
  const rows = [];
  if (p.for.includes(ans.hudtype)) rows.push(["Matcher hudtypen din", "+3"]);
  if ((ans.sensitiv === "ja") && p.for.includes("sens")) rows.push(["Dokumentert mild nok for sensitiv hud", "+3"]);
  if ((ans.sensitiv === "ja") && !p.for.includes("sens")) rows.push(["Ikke merket sensitiv-trygg", "−3"]);
  if (p.goal && p.goal === ans.maal) rows.push(["Hovedingrediens rettet mot målet ditt", "+4"]);
  if (ans.budsjett.includes(p.tier)) rows.push(["I prisklassene du valgte", "+2"]);
  rows.push(["Dyretestfri (vår standard)", "✓"]);
  if (ans.toleranse === "erfaren" && p.ings.some((i) => ING[i]?.sun || i === "retinol")) rows.push(["Skin-geek: god toleranse for aktive", "+1"]);
  if (ans.helse.includes("gravid") && !p.ings.includes("retinol") && !p.ings.includes("salisylsyre")) rows.push(["Trygg ved graviditet", "✓"]);
  if (ans.etikk?.includes("cf") && p.cf) rows.push(["Dyretestfri (ditt krav)", "✓"]);
  if (ans.etikk?.includes("vegan") && p.vg) rows.push(["Vegansk (ditt krav)", "✓"]);
  for (const st of ans.sensList) if (!p.ings.includes(st)) {} 
  if (ans.sensList.length) rows.push(["Fri for ingrediensene du ikke tåler", "✓"]);
  return rows;
}

function oppsummering(nivaa, routine, ans, cycling) {
  const amIng = routine.serumAM?.main?.ings.find((i) => ING[i]);
  const pmP = cycling ? null : routine.serumPM?.main;
  const pmIng = pmP?.ings.find((i) => ING[i]?.freq) || pmP?.ings[0];
  const kremIng = routine.krem?.main?.ings[0];
  const hud = { torr:"tørr", fet:"fet", kombi:"kombinert", normal:"balansert" }[ans.hudtype];
  const maal = { kviser:"urenheter", glow:"glød og jevnere hudtone", aldring:"fine linjer", ro:"roligere hud" }[ans.maal];

  if (nivaa === 1) return `Rutinen din er bygget for ${hud} hud med mål om ${maal} – og den følger en enkel logikk: rens skånsomt, behandle målrettet, beskytt alltid. Om morgenen gjør du minst mulig (vann, ${amIng ? nvn(amIng).toLowerCase() + "-serum, " : ""}krem og solkrem), for morgenens viktigste jobb er beskyttelse. Om kvelden gjør du selve jobben: dobbelrens fjerner dagens solkrem og smuss, ${cycling ? "og de aktive ingrediensene dine veksler mellom kvelder så huden får hvile mellom øktene" : pmIng ? "og " + nvn(pmIng).toLowerCase() + " jobber mens du sover" : "og huden får ro"}. Fuktighetskremen til slutt låser alt inn. Hvorfor funker dette? Fordi hvert steg har én tydelig jobb, ingenting krangler med hverandre, og det viktigste steget av alle – solkrem – er med hver eneste dag.`;

  if (nivaa === 2) return `Strukturen følger prinsippet tynnest til tykkest, og deler døgnet i to roller: dagen beskytter, natten reparerer. ${amIng ? nvn(amIng) + " om morgenen er plassert der med vilje – antioksidanter jobber best under solkremen, hvor de fanger frie radikaler før de når kollagenet." : "Morgenrutinen er bevisst minimal for å bevare hudbarrieren."} ${cycling ? "Kveldene dine kjører skin-cycling: eksfoliering og retinol på hver sine kvelder, med pausenetter imellom – slik får du effekten av begge uten irritasjonen av å stable dem." : pmIng ? "Kveldens " + nvn(pmIng).toLowerCase() + " ligger på kvelden fordi " + (ING[pmIng]?.sun ? "den gjør huden mer lysfølsom og brytes ned av UV" : "natten er hudens reparasjonsvindu") + "."} ${kremIng ? "Fuktighetskremen med " + nvn(kremIng).toLowerCase() + " er støtteapparatet: den styrker barrieren slik at de aktive ingrediensene kan virke uten å tære på huden." : ""} Ingrediensene er valgt for å komplementere, ikke konkurrere – ingen overlappende syrer, ingen kombinasjoner som nøytraliserer hverandre.`;

  return `For nerden: rutinen er komponert rundt barriere-først-prinsippet. ${amIng === "vitamin-c" ? "L-askorbinsyre/C-derivat i AM gir fotoprotektiv synergi med SPF – antioksidant + filter demper UV-indusert oksidativt stress bedre enn filter alene." : amIng ? nvn(amIng) + " i AM gir antiinflammatorisk støtte uten fotosensitivisering." : ""} ${cycling ? "PM kjører syklisk eksponering: kjemisk eksfoliering øker celleturnover og penetrasjon, retinoid oppregulerer kollagensyntese via retinsyrereseptorene, og recovery-netter lar TEWL normaliseres – dokumentert strategi for å bevare retinoid-effekt med lavere irritasjonsscore." : pmIng ? nvn(pmIng) + " i PM: " + (ING[pmIng]?.d || "").split(".")[0].toLowerCase() + "." : ""} ${kremIng === "ceramider" ? "Ceramid-dominant okklusjon post-aktiver reduserer irritasjonsrisiko og støtter lamellær lipidstruktur." : kremIng === "niacinamid" ? "Niacinamid i fuktighetslaget øker endogen ceramidsyntese – smart pairing med aktive." : ""} ${routine.olje?.main ? "Dobbelrensen sikrer fullstendig fjerning av filmdannende UV-filtre uten å stripped barrieren (lav-pH andretrinn)." : ""} Ingen ingrediens-antagonisme: syrer og retinoider er temporalt separert, og pH-avhengige aktiver ligger på egne tidspunkt.`;
}

function serumTiming(p) {
  if (!p) return "PM";
  if (p.ings.includes("vitamin-c")) return "AM – antioksidant-skjold under solkremen";
  if (p.ings.includes("retinol")) return "PM – kun kveld";
  if (p.ings.includes("salisylsyre") || p.ings.includes("glykolsyre")) return "PM";
  return "AM eller PM";
}

function sunWarning(p) { return p?.ings.some((i) => ING[i]?.sun); }
function freqText(p) { const i = p?.ings.find((x) => ING[x]?.freq); return i ? ING[i].freq : null; }

/* Ukeplan: hvilke kvelder er serum-kvelder i tilvenningsuken? */
function serumDays(p) {
  if (!p) return [];
  if (p.ings.includes("retinol")) return [1, 4]; // tir + fre
  if (p.ings.includes("salisylsyre") || p.ings.includes("glykolsyre")) return [0, 2, 4];
  if (p.ings.includes("vitamin-c")) return [0,1,2,3,4,5,6];
  return [0,1,2,3,4,5,6];
}

/* ============ PRISER ============ */
const BASE = { 1: 149, 2: 329, 3: 749 };
function offers(p) {
  const base = BASE[p.tier] + ((p.id.charCodeAt(1) || 5) % 7) * 10;
  return [
    { store: "Lyko", price: base, ship: "Fri frakt over 299 kr" },
    { store: "Blivakker", price: Math.round(base * 1.06), ship: "39 kr frakt" },
    { store: "Coverbrands", price: Math.round(base * 1.11), ship: "Fri frakt over 500 kr" },
    { store: "Boozt", price: Math.round(base * 1.15), ship: "Fri frakt" },
  ].sort((a, b) => a.price - b.price);
}

/* ============ PRODUKTBILDE ============ */
const SHAPE = { rens: "18px 18px 8px 8px", toner: "50% 50% 10px 10px", serum: "8px", krem: "50%", spf: "12px 12px 20px 20px" };
const Flaske = ({ p, size = 60 }) => (
  <div style={{ width: size, minWidth: size, height: size * 1.3, background: `linear-gradient(165deg, #FFFFFF 10%, ${p.hue || "#E5E5E0"} 90%)`, border: "1px solid rgba(0,0,0,.07)", borderRadius: SHAPE[p.cat] || "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,.06)" }}>
    <div style={{ width: "36%", height: 6, background: "#1C1B1A", borderRadius: 2, marginBottom: 6, opacity: .8 }} />
    <div style={{ fontFamily: "'Fraunces',serif", fontSize: size * .3, color: "#1C1B1A", fontWeight: 600 }}>{p.brand.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
    <div style={{ fontSize: 6.5, letterSpacing: ".16em", color: "#6B6862", textTransform: "uppercase", marginTop: 3 }}>{p.cat}</div>
  </div>
);

/* ============ STIL ============ */
const ink = "#1C1B1A", coral = "#F0634F", sage = "#5F8465", line = "#E8E6E1";
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box}
.page{min-height:100vh;background:#FAFAF7;font-family:Inter,system-ui,sans-serif;color:${ink};display:flex;justify-content:center;padding:28px 16px 64px}
.wrap{width:100%;max-width:560px}
.eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${sage};font-weight:700;text-align:center}
h1{font-family:'Fraunces',serif;font-weight:600;font-size:32px;line-height:1.12;text-align:center;margin:10px 0 8px;letter-spacing:-.01em}
.sub{color:#6B6862;font-size:14.5px;line-height:1.6;text-align:center;margin:0 auto;max-width:430px}
.opt{display:block;width:100%;text-align:left;background:#fff;border:1.5px solid ${line};border-radius:14px;padding:15px 16px;font-size:15px;font-weight:600;color:${ink};cursor:pointer;margin-top:10px;transition:border-color .15s, transform .1s;font-family:Inter}
.opt:hover{border-color:${ink};transform:translateY(-1px)}
.opt.on{border-color:${coral};background:#FEF1EE}
.opt small{display:block;color:#8B8880;font-weight:400;margin-top:3px;font-size:12.5px}
.primary{width:100%;background:${ink};color:#fff;border:none;border-radius:99px;padding:16px;font-size:14px;font-weight:700;cursor:pointer;margin-top:20px;font-family:Inter;transition:transform .1s}
.primary:hover{transform:translateY(-1px)}
.ghost{width:100%;background:none;border:none;color:#8B8880;font-size:13px;padding:12px;cursor:pointer;font-family:Inter}
.prog{display:flex;gap:5px;justify-content:center;margin:16px 0 22px}
.prog i{width:24px;height:3px;border-radius:2px;background:${line}}
.prog i.on{background:${coral}}
.chip{display:inline-flex;align-items:center;gap:6px;background:#EFF4EE;border:1px solid ${sage};border-radius:99px;padding:6px 12px;font-size:12.5px;font-weight:600;margin:4px 4px 0 0;cursor:pointer;font-family:Inter;color:${sage}}
.search{width:100%;border:1.5px solid ${line};border-radius:14px;padding:14px;font-size:15px;font-family:Inter;outline:none;background:#fff}
.search:focus{border-color:${ink}}
.hit{display:flex;justify-content:space-between;align-items:center;padding:11px 6px;border-bottom:1px solid ${line};font-size:14px}
.stepcard{background:#fff;border:1px solid ${line};border-radius:18px;padding:16px;margin-top:12px;position:relative}
.pname{font-size:16.5px;font-weight:700;margin-top:2px;letter-spacing:-.01em}
.pbrand{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8B8880;font-weight:700}
.badge{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:${sage};background:#EFF4EE;border-radius:99px;padding:4px 9px;font-weight:700;white-space:nowrap}
.altbtn{background:#F6F5F1;border:1px solid ${line};border-radius:10px;padding:9px 11px;font-size:12.5px;cursor:pointer;font-family:Inter;text-align:left;width:100%;margin-top:6px;font-weight:500}
.altbtn:hover{border-color:${ink}}
.mini{font-size:12px;color:#8B8880;background:none;border:none;cursor:pointer;padding:6px 8px;font-family:Inter;text-decoration:underline}
.ingtag{display:inline-block;font-size:11.5px;background:#F1EFEA;border-radius:6px;padding:4px 9px;margin:3px 3px 0 0;color:#5A5750;cursor:pointer;font-weight:600}
.ingtag:hover{background:#E7E4DC}
.buy{font-size:12px;font-weight:700;color:#fff;background:${coral};border:none;border-radius:99px;padding:10px 16px;cursor:pointer;margin-top:10px;font-family:Inter}
.buy:hover{filter:brightness(.95)}
.note{font-size:12.5px;background:#F6F5F1;border-radius:10px;padding:9px 11px;margin-top:8px;color:#5A5750;line-height:1.55}
.warn{font-size:12.5px;background:#FEF6E7;border:1px solid #F0D9A8;border-radius:10px;padding:10px 12px;margin-top:8px;color:#7A5C1E;line-height:1.55}
.sunwarn{font-size:12.5px;background:#FEF1EE;border:1px solid #F5C4BB;border-radius:10px;padding:10px 12px;margin-top:8px;color:#8C3B2E;line-height:1.55}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:${ink};color:#fff;font-size:13px;padding:11px 18px;border-radius:99px;box-shadow:0 8px 30px rgba(0,0,0,.3);z-index:40;font-family:Inter}
.learn{font-size:12px;color:${coral};text-decoration:underline;cursor:pointer;background:none;border:none;font-family:Inter;padding:0;font-weight:600}
.overlay{position:fixed;inset:0;background:rgba(28,27,26,.45);display:flex;align-items:stretch;justify-content:flex-end;z-index:30}
.drawer{background:#FAFAF7;width:100%;max-width:380px;padding:22px 18px;overflow:auto;animation:slidein .22s ease;border-left:1px solid ${line}}
@keyframes slidein{from{transform:translateX(60px);opacity:.4}to{transform:translateX(0);opacity:1}}
.offer{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1.5px solid ${line};border-radius:14px;padding:13px 14px;margin-top:8px}
.offer.best{border-color:${sage}}
.gostore{font-size:12px;font-weight:700;color:#fff;background:${ink};border:none;border-radius:99px;padding:9px 14px;cursor:pointer;font-family:Inter;white-space:nowrap}
.pricetag{font-size:17px;font-weight:700}
.week{width:100%;border-collapse:collapse;font-size:11px;margin-top:10px}
.week th{font-weight:700;padding:6px 2px;color:#8B8880;text-transform:uppercase;letter-spacing:.06em;font-size:9.5px}
.week td{border:1px solid ${line};padding:5px 3px;text-align:center;background:#fff;border-radius:4px}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin:1px}
`;

const Shell = ({ eyebrow, title, subtitle, children }) => (
  <div className="page"><style>{css}</style><div className="wrap">
    <div className="eyebrow">{eyebrow}</div>
    <h1>{title}</h1>
    {subtitle && <p className="sub">{subtitle}</p>}
    <div style={{height:16}} />
    {children}
  </div></div>
);

/* ============ APP ============ */
export default function Klinikk() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({ hudtype:null, sensitiv:null, toleranse:null, sensList:[], helse:[], maal:null, budsjett:[], etikk:[] });
  const [liked, setLiked] = useState([]);
  const [custom, setCustom] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [q, setQ] = useState("");
  const [addingCat, setAddingCat] = useState(null);
  const [swaps, setSwaps] = useState({});
  const [removed, setRemoved] = useState([]);
  const [openIng, setOpenIng] = useState(null);
  const [deepIng, setDeepIng] = useState(null);
  const [toast, setToast] = useState(null);
  const [saved, setSaved] = useState(null);
  const [priceFor, setPriceFor] = useState(null);
  const [showTrust, setShowTrust] = useState(false);
  const [showPersonvern, setShowPersonvern] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [layers, setLayers] = useState({ tonerCount:0, maske:false });
  const [oppsNivaa, setOppsNivaa] = useState(1);
  const [custIngs, setCustIngs] = useState([]);
  const [ingSok, setIngSok] = useState("");
  const [maskeFreq, setMaskeFreq] = useState(1);
  const [lockedIn, setLockedIn] = useState(false);
  const [openAnalyse, setOpenAnalyse] = useState(null);
  const [custDays, setCustDays] = useState(null);
  const [amRens, setAmRens] = useState(false);
  const [rotations, setRotations] = useState({});
  const [showWeek, setShowWeek] = useState(false);

  useEffect(() => {
    (async () => {
      try { const r = await storage.get("min-rutine"); if (r) { const sv = JSON.parse(r.value); if (typeof sv.ans?.budsjett === "number") sv.ans.budsjett = [sv.ans.budsjett]; if (!sv.ans?.toleranse) sv.ans.toleranse = "litt"; if (!sv.ans?.etikk) sv.ans.etikk = []; setSaved(sv); } } catch (e) {}
    })();
  }, []);

  const ping = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };
  const set = (k, v) => { setAns({ ...ans, [k]: v }); setStep(step + 1); };
  const allProducts = [...P, ...custom];
  const daysSince = (iso) => Math.floor((Date.now() - new Date(iso)) / 86400000);

  const words = q.toLowerCase().split(" ").filter(Boolean);
  const hits = q.length > 1 ? allProducts.filter((p) => words.every((w) => (p.brand + " " + p.name).toLowerCase().includes(w))).slice(0, 6) : [];

  const routine = useMemo(() => {
    if (!ans.budsjett) return null;
    const avoid = [...ans.sensList];
    const dislikedIngs = disliked.flatMap((id) => allProducts.find((x) => x.id === id)?.ings || []);
    const etikkOK = (p) => p.custom || ((!ans.etikk?.includes("cf") || p.cf) && (!ans.etikk?.includes("vegan") || p.vg));
    const isAMserum = (p) => p.ings.includes("vitamin-c") || (p.ings.includes("niacinamid") && !p.ings.some((i) => ING[i]?.sun));
    const build = (cat, filterFn) => {
      const likedHere = [...liked, ...custom.map((c) => c.id)].find((id) => { const x = allProducts.find((y) => y.id === id); return x?.cat === cat && (!filterFn || filterFn(x)); });
      const pool = allProducts.filter((p) => p.cat === cat && !disliked.includes(p.id) && !p.custom && etikkOK(p) && (!filterFn || filterFn(p)))
        .map((p) => ({ p, sc: scoreProduct(p, ans, avoid, dislikedIngs) }))
        .filter((x) => x.sc > -100).sort((a, b) => b.sc - a.sc);
      const key = filterFn ? cat + (filterFn === isAMserum ? "AM" : "PM") : cat;
      const main = swaps[key] || (likedHere ? allProducts.find((x) => x.id === likedHere) : pool[0]?.p || null);
      return { main, locked: !!likedHere && !swaps[key], alts: pool.filter((x) => x.p.id !== main?.id).slice(0, 3).map((x) => x.p) };
    };
    const out = {};
    out.olje = build("olje");
    out.toner = build("toner");
    /* Full rangert liste for toner-lag (K-beauty layering) */
    out.tonerRanked = allProducts.filter((p) => p.cat === "toner" && !disliked.includes(p.id) && etikkOK(p))
      .map((p) => ({ p, sc: p.custom ? 999 : scoreProduct(p, ans, avoid, dislikedIngs) }))
      .filter((x) => x.sc > -100).sort((a, b) => b.sc - a.sc).map((x) => x.p);
    out.maske = build("maske");
    out.rens = build("rens");
    out.serumAM = build("serum", isAMserum);
    out.serumPM = build("serum", (p) => !isAMserum(p));
    /* Skin-cycling for erfarne: både eksfoliering og retinol */
    const wantCycle = ans.toleranse !== "ny" && !ans.helse.includes("gravid") && (ans.maal === "aldring" || ans.maal === "glow") && !ans.sensList.includes("retinol") && !ans.sensList.includes("salisylsyre");
    if (wantCycle) {
      const ex = build("serum", (p) => p.ings.includes("glykolsyre") || p.ings.includes("salisylsyre"));
      const ret = build("serum", (p) => p.ings.includes("retinol") || p.ings.includes("bakuchiol"));
      if (ex.main && ret.main) { out.serumEx = ex; out.serumRet = ret; out.serumPM = { main:null }; }
    }
    out.krem = build("krem");
    out.spf = build("spf");
    /* Unngå duplikat-effekt: hvis AM og PM endte med samme hero, dropp AM */
    if (out.serumAM.main && out.serumPM.main && out.serumAM.main.id === out.serumPM.main.id) out.serumAM.main = null;
    return out;
  }, [ans, liked, disliked, swaps, custom]);

  /* ---- INTRO ---- */
  if (step === 0) return (
    <Shell eyebrow="Skinatlas · Kartet til rutinen din" title="Huden din fortjener en resept, ikke en gjetning" subtitle="Ingen hype, ingen mirakler – en rutine bygget på hudtypen din, helsen din og ingredienser med dokumentert effekt.">
      {saved && (
        <div className="stepcard" style={{textAlign:"center"}}>
          <div className="pbrand">Velkommen tilbake</div>
          <div style={{fontSize:14, marginTop:6}}>Lagret rutine fra {new Date(saved.date).toLocaleDateString("no")}.</div>
          {daysSince(saved.date) >= 21
            ? <div className="note">✍️ {daysSince(saved.date)} dager – på tide å notere: ser du forskjell? Mindre rødhet? Jevnere hud?</div>
            : <div className="note">📅 Sjekkpunkt om {21 - daysSince(saved.date)} dager – huden trenger ~3 uker før du kan bedømme effekt.</div>}
          <button className="altbtn" style={{marginTop:8}} onClick={() => { setAns(saved.ans); setLiked(saved.liked); setCustom(saved.custom || []); setDisliked(saved.disliked); setSwaps(saved.swaps || {}); setLockedIn(saved.lockedIn || false); setStep(8); }}>Åpne min rutine →</button>
        </div>
      )}
      <button className="primary" onClick={() => setStep(1)}>Begynn konsultasjonen</button>
      <div style={{display:"flex", gap:0}}>
        <button className="ghost" onClick={() => { setShowHow(!showHow); setShowTrust(false); setShowPersonvern(false); }}>🤖 Hvordan funker veilederen?</button>
        <button className="ghost" onClick={() => { setShowTrust(!showTrust); setShowHow(false); setShowPersonvern(false); }}>Hvorfor stole på oss? ↓</button>
      </div>
      {showHow && (
        <div className="stepcard" style={{fontSize:13.5, lineHeight:1.65, textAlign:"left"}}>
          <div style={{fontFamily:"'Fraunces',serif", fontSize:20, marginBottom:8}}>Hvordan funker veilederen?</div>
          <p style={{margin:"0 0 10px"}}><b>Veilederen er automatisert og bruker kunstig intelligens</b> – ikke et menneske. Svarene dine analyseres mot produktenes ingredienser: modellen vurderer kompatibilitet med hudtypen din, sensitiviteten din, helsesituasjonen og målene dine, og velger produktene som scorer best for akkurat deg.</p>
          <p style={{margin:"0 0 10px"}}><b>Kunnskapen bygger på publisert forskning.</b> Hver aktiv ingrediens vi anbefaler lenker til dokumentasjon (PubMed), og du kan alltid åpne «Vis analysen» på et produkt for å se nøyaktig hvorfor det ble valgt. Ingen merker kan betale seg inn i rutinen din.</p>
          <p style={{margin:"0 0 10px"}}><b>Men – og dette er viktig – veilederen er ikke lege.</b> Den kan ikke undersøke huden din, stille diagnoser eller kjenne hele helsebildet ditt. Er du i tvil om hva huden din tåler, <b>oppsøk lege eller hudlege</b> – og det gjelder spesielt hvis du har ekstra grunn til forsiktighet: graviditet eller amming, hudsykdom (som eksem, rosacea eller psoriasis), pågående medisinsk behandling, eller tidligere kraftige reaksjoner på hudpleie.</p>
          <p style={{margin:0}}>Tenk på veilederen som et kunnskapsrikt kart 🗺️ – men legen din er alltid den endelige autoriteten på din hud.</p>
        </div>
      )}
      {showTrust && (
        <div className="stepcard" style={{fontSize:13.5, lineHeight:1.65, color:"#4A4842"}}>
          <div style={{fontFamily:"'Fraunces',serif", fontSize:20, marginBottom:8}}>Slik jobber vi</div>
          <p style={{margin:"0 0 10px"}}><b>Ingrediensene bestemmer – ikke betalinger.</b> Anbefalingene velges av en åpen logikk basert på hudtypen, helsen og målene dine. Ingen produkter kan kjøpe seg plass.</p>
          <p style={{margin:"0 0 10px"}}><b>Vi tjener penger på annonselenker.</b> Handler du via «til butikk», får vi en liten provisjon – uten ekstra kostnad for deg, og uten å påvirke anbefalingene. Billigst sorteres alltid først.</p>
          <p style={{margin:"0 0 10px"}}><b>Dokumentasjon fremfor hype.</b> Hver ingrediens lenker til publisert forskning.</p>
          <p style={{margin:"0 0 10px"}}><b>Åpen bruk av kunstig intelligens.</b> Vi bruker KI til å analysere produkter, ingredienser og kompatibilitet mot huden din. Analysen bak hvert valg kan alltid åpnes («Vis analysen»).</p>
          <p style={{margin:0}}><b>Vi er nysgjerrige nerder, ikke leger.</b> Ved hudsykdom eller behandling: rådfør deg alltid med lege.</p>
        </div>
      )}
      {showPersonvern && (
        <div className="stepcard" style={{fontSize:13, lineHeight:1.65, textAlign:"left"}}>
          <div style={{fontFamily:"'Fraunces',serif", fontSize:20, marginBottom:8}}>Personvern</div>
          <p style={{margin:"0 0 8px"}}><b>Kort versjon:</b> Svarene dine lagres kun lokalt i din egen nettleser. Ingen brukerkontoer, ingenting sendes til noen server, og vi selger aldri opplysninger om deg.</p>
          <p style={{margin:"0 0 8px"}}><b>Rutinen din:</b> Beregningen skjer i nettleseren. Lagrer du rutinen, ligger den i nettleserens lokale lagring på din enhet – vi kan ikke se den. Helsesvar (som graviditet) forlater aldri enheten din. Sletter du nettleserdata, slettes rutinen.</p>
          <p style={{margin:"0 0 8px"}}><b>Annonselenker:</b> Klikker du «Se beste pris», sendes du videre via et annonsenettverk som kan bruke cookies for å registrere at kjøpet kom fra oss. Vi mottar kun anonym statistikk – aldri hvem du er eller hva du kjøpte.</p>
          <p style={{margin:"0 0 8px"}}><b>Cookies:</b> Skinatlas setter ingen egne sporingscookies. Lokal lagring brukes kun til «lagre min rutine».</p>
          <p style={{margin:"0 0 8px"}}><b>Dine rettigheter (GDPR):</b> Innsyn, retting, sletting og klage til Datatilsynet (datatilsynet.no).</p>
          <p style={{margin:0}}><b>Behandlingsansvarlig:</b> Skinatlas · hei@skinatlas.no</p>
        </div>
      )}
      <div style={{textAlign:"center", marginTop:18, fontSize:12, color:"#8B8880"}}>
        <button className="learn" onClick={() => { setShowPersonvern(!showPersonvern); setShowTrust(false); }}>Personvern</button>
        {" · "}
        <a className="learn" href="mailto:hei@skinatlas.no">hei@skinatlas.no</a>
        <div style={{marginTop:6}}>Skinatlas © 2026 · Uavhengig · Generell veiledning, ikke medisinsk rådgivning</div>
      </div>
    </Shell>
  );

  const answered = (i) => i === 1 ? !!ans.hudtype : i === 2 ? true : i === 3 ? (!!ans.sensitiv && !!ans.toleranse) : i === 4 ? true : i === 5 ? !!ans.maal : i === 6 ? ans.budsjett.length > 0 : true;
  const canGo = (i) => { for (let j = 1; j < i; j++) if (!answered(j)) return false; return true; };
  const Prog = () => <div className="prog">{[1,2,3,4,5,6,7].map((i) => <i key={i} className={i <= step ? "on" : ""} style={{cursor: canGo(i) ? "pointer" : "default", width: i === step ? 34 : 26}} onClick={() => canGo(i) && setStep(i)} title={"Steg " + i} />)}</div>;

  /* ---- 1 HUDTYPE ---- */
  if (step === 1) return (
    <Shell eyebrow="Steg 1 av 7" title="Hvordan oppfører huden din seg?">
      <Prog />
      {[{v:"torr",t:"Tørr",d:"Stram, flasser lett, drikker krem"},{v:"fet",t:"Fet",d:"Blank utover dagen, synlige porer"},{v:"kombi",t:"Kombinert",d:"Fet T-sone, tørre kinn"},{v:"normal",t:"Balansert",d:"Sjelden problemer, vil optimalisere"}].map((o) => (
        <button key={o.v} className="opt" onClick={() => set("hudtype", o.v)}>{o.t}<small>{o.d}</small></button>
      ))}
      <p className="sub" style={{fontSize:12, marginTop:14}}>Usikker? Vask ansiktet, vent 1 time uten produkter: stram = tørr, blank = fet, blank kun i T-sonen = kombinert.</p>
    </Shell>
  );

  /* ---- 2 HELSE ---- */
  if (step === 2) return (
    <Shell eyebrow="Steg 2 av 7" title="Noe vi bør ta hensyn til?" subtitle="Dette påvirker hvilke ingredienser som er trygge for deg. Velg alt som gjelder – eller hopp over.">
      <Prog />
      {HELSE.map((o) => (
        <button key={o.v} className={"opt" + (ans.helse.includes(o.v) ? " on" : "")} onClick={() => setAns({ ...ans, helse: ans.helse.includes(o.v) ? ans.helse.filter((x) => x !== o.v) : [...ans.helse, o.v] })}>{o.t}<small>{o.d}</small></button>
      ))}
      {ans.helse.includes("behandling") && <div className="warn">⚕️ Under kreftbehandling eller på isotretinoin blir huden ofte ekstremt sensitiv. Vi foreslår kun det mildeste – men <b>avklar all hudpleie med behandlende lege først.</b></div>}
      {ans.helse.includes("hudsykdom") && <div className="warn">⚕️ Ved aktiv hudsykdom bør rutinen avklares med lege/dermatolog – noen ingredienser kan forverre tilstanden.</div>}
      {ans.helse.includes("gravid") && <div className="note">🤰 Vi utelukker retinol og sterke syrer, og velger dokumentert trygge alternativer som azelainsyre og bakuchiol.</div>}
      <button className="primary" onClick={() => setStep(3)}>{ans.helse.length ? "Fortsett" : "Ingenting av dette – fortsett"}</button>
      <button className="ghost" onClick={() => setStep(step - 1)}>← Tilbake</button>
    </Shell>
  );

  /* ---- 3 SENSITIV + TOLERANSE ---- */
  if (step === 3) return (
    <Shell eyebrow="Steg 3 av 7" title="Sensitivitet og erfaring">
      <Prog />
      <div style={{fontSize:13, fontWeight:700, margin:"4px 0 2px"}}>Er huden din sensitiv?</div>
      {[{v:"ja",t:"Ja",d:"Blir lett rød, svir eller klør av nye produkter"},{v:"litt",t:"Litt",d:"Reagerer av og til"},{v:"nei",t:"Nei",d:"Tåler det meste"}].map((o) => (
        <button key={o.v} className={"opt" + (ans.sensitiv === o.v ? " on" : "")} onClick={() => setAns({ ...ans, sensitiv: o.v })}>{o.t}<small>{o.d}</small></button>
      ))}
      <div style={{fontSize:13, fontWeight:700, margin:"18px 0 2px"}}>Erfaring med aktive ingredienser (syrer/retinol)?</div>
      {[{v:"ny",t:"Helt ny",d:"Aldri brukt – vi starter forsiktig med opptrapping"},{v:"litt",t:"Litt erfaren",d:"Har prøvd, tålte det greit"},{v:"erfaren",t:"Skin-geek 🤓",d:"Bruker aktive jevnlig med god toleranse – vi hopper over babysteget"}].map((o) => (
        <button key={o.v} className={"opt" + (ans.toleranse === o.v ? " on" : "")} onClick={() => setAns({ ...ans, toleranse: o.v })}>{o.t}<small>{o.d}</small></button>
      ))}
      <button className="primary" onClick={() => { if (ans.sensitiv && ans.toleranse) setStep(4); else ping("Velg ett svar på begge"); }}>Fortsett</button>
      <button className="ghost" onClick={() => setStep(step - 1)}>← Tilbake</button>
      {toast && <div className="toast">{toast}</div>}
    </Shell>
  );

  /* ---- 4 SENS-INGREDIENSER ---- */
  if (step === 4) return (
    <Shell eyebrow="Steg 4 av 7" title="Ingredienser huden ikke tåler?" subtitle="Velg alt som gjelder – vi styrer unna disse overalt.">
      <Prog />
      {SENS_OPTS.map((o) => (
        <button key={o.v} className={"opt" + (ans.sensList.includes(o.v) ? " on" : "")} onClick={() => setAns({ ...ans, sensList: ans.sensList.includes(o.v) ? ans.sensList.filter((x) => x !== o.v) : [...ans.sensList, o.v] })}>{o.t}</button>
      ))}
      <button className="primary" onClick={() => setStep(5)}>{ans.sensList.length ? "Fortsett" : "Ingen kjente – fortsett"}</button>
      <button className="ghost" onClick={() => setStep(step - 1)}>← Tilbake</button>
    </Shell>
  );

  /* ---- 5 MÅL ---- */
  if (step === 5) return (
    <Shell eyebrow="Steg 5 av 7" title="Hva er hovedmålet ditt?">
      <Prog />
      {GOALS.map((o) => (
        <button key={o.v} className="opt" onClick={() => set("maal", o.v)}>{o.t}<small>{o.d}</small></button>
      ))}
      <div className="note" style={{maxWidth:430, margin:"14px auto 0"}}>💡 <b>Psst:</b> Konsistens slår skippertak. Det du gjør hver dag betyr mer enn en intens kur hver tredje uke.</div>
      <button className="ghost" onClick={() => setStep(step - 1)}>← Tilbake</button>
    </Shell>
  );

  /* ---- 6 BUDSJETT ---- */
  if (step === 6) return (
    <Shell eyebrow="Steg 6 av 7" title="Hvilket nivå skal vi handle på?">
      <Prog />
      <p className="sub" style={{fontSize:13, marginBottom:6}}>Velg ett eller flere – mange kombinerer billig rens med luksus-serum. Vi finner beste match i nivåene du åpner for.</p>
      {[{v:1,t:"Smart budsjett",d:"Effektivt uten å blø – The Ordinary, K-beauty"},{v:2,t:"Klinikk-klassikere",d:"Paula's Choice, Klairs, Pixi"},{v:3,t:"Luksus",d:"Tatcha, Medik8, Herbivore"}].map((o) => (
        <button key={o.v} className={"opt" + (ans.budsjett.includes(o.v) ? " on" : "")} onClick={() => setAns({ ...ans, budsjett: ans.budsjett.includes(o.v) ? ans.budsjett.filter((x) => x !== o.v) : [...ans.budsjett, o.v] })}>{o.t}<small>{o.d}</small></button>
      ))}
      <button className="primary" onClick={() => { if (ans.budsjett.length) setStep(7); else ping("Velg minst ett nivå"); }}>Fortsett</button>
      <div className="note" style={{maxWidth:430, margin:"14px auto 0"}}>🐇 <b>Alt vi anbefaler er dyretestfritt</b> – merker på uavhengige lister (Leaping Bunny er strengest, med revisjoner av hele leverandørkjeden). Det er ikke et valg hos oss, det er standarden.</div>
      <div className="note" style={{maxWidth:430, margin:"14px auto 0"}}>💡 <b>Myteknuser:</b> Dyrere er ikke bedre. Pris er ofte merkevarestrategi – huden bryr seg om ingrediensene, ikke prislappen.</div>
      {toast && <div className="toast">{toast}</div>}
      <div style={{maxWidth:430, margin:"14px auto 0"}}>
        <div style={{fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#8B8880", marginBottom:4}}>Flere valg (valgfritt)</div>
        {[["vegan","🌱 Kun veganske produkter","Uten animalske ingredienser som sneglemucin, honning og lanolin"],["parfymefri","🌸 Parfymefritt","Duft er en av de vanligste årsakene til hudreaksjoner"]].map(([v,t,d]) => (
          <button key={v} className={"opt" + (ans.etikk.includes(v) ? " on" : "")} onClick={() => setAns({ ...ans, etikk: ans.etikk.includes(v) ? ans.etikk.filter((x) => x !== v) : [...ans.etikk, v] })}>{t}<small>{d}</small></button>
        ))}
      </div>
      <button className="ghost" onClick={() => setStep(step - 1)}>← Tilbake</button>
    </Shell>
  );

  /* ---- 7 LIKER / MISLIKER ---- */
  if (step === 7) return (
    <Shell eyebrow="Steg 7 av 7" title="Produkter du allerede har et forhold til?" subtitle="Elsker du noe? Vi bygger rutinen rundt det. Hater du noe? Vi unngår lignende.">
      <Prog />
      <input className="search" placeholder="Søk på merke eller produkt – f.eks. «snail» eller «cerave»" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      {hits.map((p) => (
        <div key={p.id} className="hit">
          <span style={{display:"flex", gap:10, alignItems:"center"}}><Flaske p={p} size={32} /><span><span className="pbrand" style={{fontSize:9.5}}>{p.brand}</span><br/><b>{p.name}</b></span></span>
          <span style={{whiteSpace:"nowrap"}}>
            <button className="mini" onClick={() => { setLiked([...new Set([...liked, p.id])]); setDisliked(disliked.filter((x) => x !== p.id)); setQ(""); ping("Lagt til som favoritt ♥"); }}>♥ Liker</button>
            <button className="mini" onClick={() => { setDisliked([...new Set([...disliked, p.id])]); setLiked(liked.filter((x) => x !== p.id)); setQ(""); ping("Vi unngår denne og lignende ✕"); }}>✕ Unngå</button>
          </span>
        </div>
      ))}
      {q.length > 2 && hits.length === 0 && !addingCat && (
        <button className="altbtn" style={{marginTop:10}} onClick={() => setAddingCat("velg")}>+ Fant ikke «{q}» – legg til som mitt eget produkt</button>
      )}
      {addingCat === "velg" && (
        <div className="stepcard">
          <div style={{fontSize:13, fontWeight:700}}>Hva slags produkt er «{q}»?</div>
          {[["olje","Oljerens/balm"],["rens","Rens"],["toner","Toner/essence"],["serum","Serum"],["krem","Fuktighetskrem"],["maske","Maske"],["spf","Solkrem"]].map(([v,t]) => (
            <button key={v} className="altbtn" onClick={() => { setAddingCat({ cat:v, navn:q }); setCustIngs([]); setIngSok(""); }}>{t}</button>
          ))}
        </div>
      )}
      {addingCat && addingCat.cat && (
        <div className="stepcard" style={{marginTop:10}}>
          <div style={{fontSize:13, fontWeight:700}}>Hvilke hovedingredienser har «{addingCat.navn}»?</div>
          <div style={{fontSize:12, color:"#6B6862", marginTop:2}}>Sjekk baksiden av produktet eller søk det opp på incidecoder.com – velg de 1–4 viktigste, så analyserer vi det mot resten av rutinen din (soltimer, hyppighet, kollisjoner osv.).</div>
          <input className="search" style={{marginTop:8}} placeholder="Filtrer ingredienser..." value={ingSok} onChange={(e) => setIngSok(e.target.value)} />
          <div style={{marginTop:8}}>
            {Object.keys(ING).filter((k) => nvn(k).toLowerCase().includes(ingSok.toLowerCase())).map((k) => (
              <button key={k} className="chip" style={{background: custIngs.includes(k) ? "#16130F" : "#fff", color: custIngs.includes(k) ? "#fff" : "#16130F"}} onClick={() => setCustIngs(custIngs.includes(k) ? custIngs.filter((x) => x !== k) : custIngs.length < 4 ? [...custIngs, k] : custIngs)}>{custIngs.includes(k) ? "✓ " : "+ "}{nvn(k)}</button>
            ))}
          </div>
          <a className="learn" href={`https://incidecoder.com/search?query=${encodeURIComponent(addingCat.navn)}`} target="_blank" rel="noreferrer" style={{display:"inline-block", marginTop:8}}>🔍 Slå opp «{addingCat.navn}» på INCIDecoder →</a>
          <button className="primary" style={{marginTop:12}} onClick={() => {
            const np = { id:"cu"+Date.now(), cat:addingCat.cat, name:addingCat.navn, brand:"Ditt produkt", tier:(ans.budsjett && ans.budsjett[0]) || 2, ings:custIngs, for:["torr","fet","kombi","normal","sens"], custom:true, hue:"#EFEDE6" };
            setCustom([...custom, np]); setQ(""); setAddingCat(null); setCustIngs([]);
            ping(custIngs.length ? "Lagt inn med " + custIngs.length + " ingredienser – analyseres i rutinen ♥" : "Lagt inn i rutinen din ♥");
          }}>{custIngs.length ? `Lagre med ${custIngs.length} ingrediens${custIngs.length > 1 ? "er" : ""}` : "Lagre uten ingredienser"}</button>
        </div>
      )}
      <div style={{marginTop:14}}>
        {[...liked, ...custom.map((c) => c.id)].map((id) => { const p = allProducts.find((x) => x.id === id); return p && <span key={id} className="chip" onClick={() => { setLiked(liked.filter((x) => x !== id)); setCustom(custom.filter((c) => c.id !== id)); }}>♥ {p.name} ✕</span>; })}
        {disliked.map((id) => { const p = allProducts.find((x) => x.id === id); return p && <span key={id} className="chip" style={{borderColor:"#D9A29A", color:"#A65648", background:"#FBEFEC"}} onClick={() => setDisliked(disliked.filter((x) => x !== id))}>✕ {p.name}</span>; })}
      </div>
      <button className="primary" onClick={() => setStep(8)}>Lag min rutine</button>
      <button className="ghost" onClick={() => setStep(step - 1)}>← Tilbake</button>
      {toast && <div className="toast">{toast}</div>}
    </Shell>
  );

  /* ---- RESULTAT ---- */
  const order = [
    { cat:"olje", label:"Oljerens (dobbelrens steg 1)", when:"PM · løser opp SPF og sminke", n:NYBEGYNNER.olje },
    { cat:"rens", label:"Rens (dobbelrens steg 2)", when:"PM · om morgenen holder lunkent vann", n:NYBEGYNNER.rens },
    { cat:"serumAM", label:"Dagserum", when:"AM – antioksidant-skjold under solkremen", n:NYBEGYNNER.serum },
    ...(routine?.serumEx?.main ? [
      { cat:"serumEx", label:"Kveld A – Eksfoliering", when:"PM · syre-kveld i syklusen", n:NYBEGYNNER.serum },
      { cat:"serumRet", label:"Kveld B – Retinol", when:"PM · retinol-kveld i syklusen", n:NYBEGYNNER.serum },
    ] : [
      { cat:"serumPM", label:"Kveldsserum (aktiv)", when:serumTiming(routine?.serumPM?.main), n:NYBEGYNNER.serum },
    ]),
    ...tonerSlots.map((_, i) => ({ cat:"tonerL" + i, tslot:i, label: i === 0 ? "Toner/essence · lag 1" : `Essence · lag ${i + 1}`, when:"AM + PM · tynnest først", n:NYBEGYNNER.toner, layer:true })),
    { cat:"krem", label:"Fuktighet", when:"AM + PM", n:NYBEGYNNER.krem },
    ...(layers.maske ? [{ cat:"maske", label:"Maske (ukentlig)", when:`${maskeFreq}x i uken · kveld uten aktive`, n:NYBEGYNNER.maske, layer:true }] : []),
    { cat:"spf", label:"Solbeskyttelse", when:"AM – hver dag, hele året", n:NYBEGYNNER.spf },
  ].filter((o) => !removed.includes(o.cat));

  const tonerSlots = [...Array(layers.tonerCount)].map((_, i) => {
    const used = [...Array(i)].map((__, j) => (swaps["tonerL" + j] || routine.tonerRanked[j])?.id);
    const pool = routine.tonerRanked.filter((p) => !used.includes(p.id));
    const main = swaps["tonerL" + i] || pool[0] || null;
    return { main, locked:false, alts: pool.filter((p) => p.id !== main?.id).slice(0, 3) };
  });
  const serum = routine?.serumPM?.main;
  const cycling = !!routine?.serumEx?.main;
  const exP = routine?.serumEx?.main, retP = routine?.serumRet?.main;
  /* Skin-cycling: Syre → Retinol → Pause → Pause (erfaren: kortere pause) */
  const CYCLE = ans.toleranse === "erfaren" ? ["ex","ret","pause","ex","ret","pause","pause"] : ["ex","ret","pause","pause","ex","ret","pause"];
  const sDays = custDays ?? serumDays(serum);
  const serumAMp = routine?.serumAM?.main;
  const serumIsAM = false;
  const DAGER = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];
  const GOALNAVN = { kviser:"Kviser", glow:"Glød", aldring:"Linjer", ro:"Roe hud" };
  const HUDNAVN = { torr:"Tørr", fet:"Fet", kombi:"Kombinert", normal:"Balansert" };

  return (
    <div className="page"><style>{css}</style><div className="wrap" style={{maxWidth:720}}>
      <div className="eyebrow">{lockedIn ? "Din faste rutine" : "Deres personlige resept"}</div>
      <h1>{lockedIn ? "Rutinen din, klar til bruk" : "Rutinen, kuratert for deg"}</h1>

      <div style={{display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", marginTop:10}}>
        <span className="chip" onClick={() => setStep(1)}>🧬 {HUDNAVN[ans.hudtype]} ✎</span>
        <span className="chip" onClick={() => setStep(2)}>🌡️ Sensitiv: {ans.sensitiv} ✎</span>
        <span className="chip" onClick={() => setStep(5)}>🎯 {GOALNAVN[ans.maal]} ✎</span>
        <span className="chip" onClick={() => setStep(6)}>💳 Nivå {ans.budsjett.join("+")} ✎</span>
        <span className="chip" onClick={() => setStep(7)}>♥ Produkter ✎</span>
      </div>
      <p className="sub" style={{marginTop:10}}>
        {ans.sensitiv === "ja" || ans.helse.length ? "Introduser ETT nytt produkt om gangen, 3–4 dager mellom hver." : "Introduser gjerne ett produkt om gangen, så vet du hva som virker."}
        {ans.sensList.length > 0 && ` Alt er fritt for: ${ans.sensList.map(nvn).join(", ")}.`}
        {ans.etikk?.includes("cf") && " Kun dyretestfrie merker."}
        {ans.etikk?.includes("vegan") && " Kun veganske produkter."}
      </p>

      {ans.helse.includes("gravid") && <div className="note" style={{maxWidth:460, margin:"12px auto 0"}}>🤰 Tilpasset graviditet/amming: uten retinol og sterke syrer.</div>}
      {(ans.helse.includes("hudsykdom") || ans.helse.includes("behandling") || ans.helse.includes("hormon")) && <div className="warn" style={{maxWidth:460, margin:"12px auto 0"}}>⚕️ Med helsesituasjonen du oppga: vis denne rutinen til lege/dermatolog før du starter. Generell veiledning erstatter ikke medisinsk vurdering.</div>}

      <div style={{height:10}} />

      {order.map((o, i) => {
        const slot = o.tslot !== undefined ? tonerSlots[o.tslot] : routine[o.cat];
        if (!slot?.main) return null;
        const p = slot.main;
        return (
          <div key={o.cat} className="stepcard">
            <div style={{display:"flex", gap:14, alignItems:"flex-start"}}>
              <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:6}}>
                <div style={{fontFamily:"'Fraunces',serif", fontSize:17, color:coral, fontWeight:600}}>{String(i + 1).padStart(2, "0")}</div>
                <Flaske p={p} />
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex", justifyContent:"space-between", gap:8, alignItems:"center"}}>
                  <div style={{fontSize:10.5, letterSpacing:".14em", textTransform:"uppercase", color:"#8B8880", fontWeight:700}}>{o.label} · {o.when}</div>
                  {slot.locked && <span className="badge">Din favoritt</span>}
                </div>
                <div className="pbrand" style={{marginTop:6}}>{p.brand}</div>
                <div className="pname">{p.name}</div>
                <div style={{display:"flex", gap:5, marginTop:4, flexWrap:"wrap"}}>
                  {p.cf && <span className="ingtag" style={{background:"#EAF4E6", cursor:"default"}}>🐇 Dyretestfri</span>}
                  {p.vg && <span className="ingtag" style={{background:"#EAF4E6", cursor:"default"}}>🌱 Vegansk</span>}
                  {!p.custom && !p.cf && <span className="ingtag" style={{background:"#FBEFEC", cursor:"default"}} title="Merket er ikke på uavhengige dyretestfri-lister (Leaping Bunny/PETA)">⚠️ Ikke sertifisert dyretestfri</span>}
                </div>
                <div style={{fontSize:13, color:"#6B6862", marginTop:5, lineHeight:1.55}}>{whyText(p, ans)} <button className="learn" onClick={() => setOpenAnalyse(openAnalyse === o.cat ? null : o.cat)}>{openAnalyse === o.cat ? "Skjul analysen" : "Vis analysen →"}</button></div>
                {openAnalyse === o.cat && (
                  <div className="note">
                    <b>🤖 Slik ble dette produktet valgt</b>
                    <div style={{marginTop:4}}>Svarene dine kjøres gjennom en analysemodell som scorer hvert produkt på ingredienser, hudtype-kompatibilitet, sensitivitet og målet ditt. Høyest score vinner – ingen kan betale seg forbi:</div>
                    {analyse(p, ans).map(([t, v], j) => <div key={j} style={{display:"flex", justifyContent:"space-between", marginTop:3}}><span>{t}</span><b>{v}</b></div>)}
                    <div style={{marginTop:6, fontSize:11.5, color:"#8B8880"}}>Hele regelverket er åpent – KI brukes til analyse og matching, aldri til å skjule sponsing. Uenig i et valg? «Passer ikke meg»-knappen lærer modellen dine preferanser.</div>
                  </div>
                )}
                {(rotations[o.cat] || []).length > 0 && (
                  <div className="note">🔄 <b>I rotasjon (ditt skin-geek-valg):</b> {rotations[o.cat].map((id) => { const rp = allProducts.find((x) => x.id === id); return rp && <span key={id} className="chip" style={{padding:"3px 9px"}} onClick={() => setRotations({ ...rotations, [o.cat]: rotations[o.cat].filter((x) => x !== id) })}>{rp.brand} {rp.name} ✕</span>; })} Veksle etter humør eller annenhver dag – helt trygt så lenge de aktive følger syklusen.</div>
                )}
                <div className="note">🧑‍🎓 <b>{o.n.amount}:</b> {o.n.how}</div>
                {o.cat === "serumPM" && freqText(p) && <div className="note">📅 <b>Hvor ofte:</b> {freqText(p)}</div>}
                {o.cat === "serumPM" && sunWarning(p) && <div className="sunwarn">☀️ <b>Solvarsel:</b> Denne ingrediensen gjør huden mer solfølsom i flere uker. Solkrem SPF 30+ hver dag er ikke valgfritt – uten den kan du få pigmentflekker og skade i stedet for effekt. Vent med oppstart hvis du skal på solferie.</div>}
                {o.cat === "spf" && <div className="note">☀️ <b>Hvorfor så viktig?</b> UV-stråler står for opptil 80 % av synlig hudaldring – og SPF beskytter mot hudkreft. Solkremen er limet som gjør at resten av rutinen virker.</div>}
                <div style={{marginTop:8}}>
                  {p.ings.map((ing) => <span key={ing} className="ingtag" onClick={() => { setOpenIng(openIng === ing ? null : ing); setDeepIng(null); }}>{nvn(ing)}</span>)}
                  {!p.custom && <a className="ingtag" style={{textDecoration:"none"}} href={`https://incidecoder.com/search?query=${encodeURIComponent(p.brand + " " + p.name)}`} target="_blank" rel="noreferrer">📋 Full ingrediensliste (INCIDecoder) →</a>}
                </div>
                {openIng && p.ings.includes(openIng) && (
                  <div className="note">
                    <b>{nvn(openIng)}</b> – {ING[openIng].s}.
                    {deepIng === openIng
                      ? <><div style={{marginTop:6}}>{ING[openIng].d}</div><a className="learn" href={ING[openIng].u} target="_blank" rel="noreferrer" style={{display:"inline-block", marginTop:6}}>📄 Les forskningen (PubMed) →</a></>
                      : <button className="learn" style={{marginLeft:6}} onClick={() => setDeepIng(openIng)}>Lær mer →</button>}
                  </div>
                )}
                {!lockedIn && slot.alts.length > 0 && (
                  <div style={{marginTop:10}}>
                    <div style={{fontSize:10.5, letterSpacing:".1em", textTransform:"uppercase", color:"#8B8880", fontWeight:700}}>Eller velg:</div>
                    {slot.alts.map((a) => (
                      <div key={a.id} style={{display:"flex", gap:4}}>
                        <button className="altbtn" style={{flex:1}} onClick={() => { setSwaps({ ...swaps, [o.cat]: a }); ping("Byttet! Rutinen er sjekket og henger fortsatt sammen ✓"); }}>↺ {a.brand} — {a.name}</button>
                        <button className="altbtn" style={{width:"auto", whiteSpace:"nowrap"}} title="Skin-geek-modus: ha flere i rotasjon" onClick={() => { const r = rotations[o.cat] || []; if (!r.includes(a.id)) setRotations({ ...rotations, [o.cat]: [...r, a.id] }); ping("Lagt i rotasjon 🔄"); }}>🔄 +</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{display:"flex", gap:4, marginTop:8, alignItems:"center", flexWrap:"wrap"}}>
                  <button className="buy" onClick={() => setPriceFor(p)}>Se beste pris</button>
                  {!p.custom && <button className="mini" onClick={() => { setDisliked([...new Set([...disliked, p.id])]); const ns = { ...swaps }; delete ns[o.cat]; setSwaps(ns); ping("Notert! Vi husker det og har byttet til nest beste match ✓"); }}>✕ Passer ikke meg</button>}
                  {!lockedIn && <button className="mini" onClick={() => setRemoved([...removed, o.cat])}>Fjern steg</button>}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {!lockedIn && removed.length > 0 && <button className="ghost" onClick={() => setRemoved([])}>+ Legg tilbake fjernede steg</button>}

      {/* OPPSUMMERING */}
      <div className="stepcard" style={{marginTop:14}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8}}>
          <div style={{fontFamily:"'Fraunces',serif", fontSize:19}}>Hvorfor denne rutinen? 💡</div>
          <div style={{display:"flex", gap:4}}>
            {[[1,"Helt enkelt"],[2,"Litt nerdete"],[3,"Full nerd 🤓"]].map(([v,t]) => (
              <button key={v} className="altbtn" style={{width:"auto", marginTop:0, padding:"6px 10px", background: oppsNivaa === v ? "#16130F" : undefined, color: oppsNivaa === v ? "#fff" : undefined}} onClick={() => setOppsNivaa(v)}>{t}</button>
            ))}
          </div>
        </div>
        <p style={{fontSize:13.5, lineHeight:1.7, color:"#4A4842", margin:"10px 0 0"}}>{oppsummering(oppsNivaa, routine, ans, cycling)}</p>
      </div>

      {/* LAG-VELGER */}
      <div className="stepcard" style={{marginTop:14}}>
        <div style={{fontFamily:"'Fraunces',serif", fontSize:19}}>Bygg på med flere lag 🧅</div>
        <div style={{fontSize:12.5, color:"#6B6862", marginTop:2}}>K-beauty handler om lag. Legg til det du vil – fjern det igjen med ett trykk.</div>
        <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap"}}>
          <button className="altbtn" style={{width:"auto"}} onClick={() => { if (layers.tonerCount < 3) { setLayers({ ...layers, tonerCount: layers.tonerCount + 1 }); ping(`Lag ${layers.tonerCount + 1} lagt til +`); } }}>+ Toner/essence-lag {layers.tonerCount > 0 ? `(${layers.tonerCount}/3)` : ""}</button>
          {layers.tonerCount > 0 && <button className="altbtn" style={{width:"auto"}} onClick={() => { setLayers({ ...layers, tonerCount: layers.tonerCount - 1 }); ping("Lag fjernet −"); }}>− Fjern siste lag</button>}
          <button className="altbtn" style={{width:"auto"}} onClick={() => { setLayers({ ...layers, maske: !layers.maske }); ping(layers.maske ? "Maske fjernet −" : "Maske lagt til +"); }}>{layers.maske ? "− Fjern maske" : "+ Ukentlig maske"}</button>
          {layers.maske && (
            <span style={{display:"inline-flex", alignItems:"center", gap:6, fontSize:13}}>
              <button className="altbtn" style={{width:"auto", padding:"6px 12px"}} onClick={() => setMaskeFreq(Math.max(1, maskeFreq - 1))}>−</button>
              <b>{maskeFreq}x/uke</b>
              <button className="altbtn" style={{width:"auto", padding:"6px 12px"}} onClick={() => setMaskeFreq(Math.min(2, maskeFreq + 1))}>+</button>
            </span>
          )}
        </div>
      </div>

      {/* UKEPLAN */}
      <div className="stepcard">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{fontFamily:"'Fraunces',serif", fontSize:19}}>Ukeplanen din 📅</div>
          <button className="mini" onClick={() => setShowWeek(!showWeek)}>{showWeek ? "Skjul" : "Vis"}</button>
        </div>
        {showWeek && (
          <>
            <div style={{fontSize:12, color:"#6B6862", marginTop:4}}>Tilvenningsuke – {serum ? `«${serum.name}» kun på markerte dager` : "uten aktivt serum"}.</div>
            <table className="week">
              <thead><tr><th></th>{DAGER.map((d) => <th key={d}>{d}</th>)}</tr></thead>
              <tbody>
                <tr>
                  <td style={{fontWeight:700}}>☀️ AM</td>
                  {DAGER.map((_, d) => (
                    <td key={d} style={{fontSize:9.5, lineHeight:1.7, textAlign:"left", padding:"5px 4px"}}>
                      <div style={{color:"#8B8880"}}>{amRens ? "Rens" : "Vann"}</div>
                      {layers.tonerCount > 0 && <div style={{background:"#EAE2FF", borderRadius:4, padding:"1px 4px"}}>Toner{layers.tonerCount > 1 ? " ×" + layers.tonerCount : ""}</div>}
                      {serumAMp && <div style={{background:serumAMp.hue, borderRadius:4, padding:"1px 4px", fontWeight:700}}>Dagserum</div>}
                      <div style={{background:routine.krem?.main?.hue, borderRadius:4, padding:"1px 4px"}}>Krem</div>
                      <div style={{background:routine.spf?.main?.hue, borderRadius:4, padding:"1px 4px", fontWeight:700}}>SPF</div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{fontWeight:700}}>🌙 PM</td>
                  {DAGER.map((_, d) => (
                    <td key={d} style={{fontSize:9.5, lineHeight:1.7, textAlign:"left", padding:"5px 4px"}}>
                      {routine.olje?.main && <div style={{background:routine.olje.main.hue, borderRadius:4, padding:"1px 4px"}}>Olje</div>}
                      <div style={{background:routine.rens?.main?.hue, borderRadius:4, padding:"1px 4px"}}>Rens</div>
                      {layers.tonerCount > 0 && <div style={{background:"#EAE2FF", borderRadius:4, padding:"1px 4px"}}>Toner{layers.tonerCount > 1 ? " ×" + layers.tonerCount : ""}</div>}
                      {layers.maske && routine.maske?.main && (maskeFreq === 2 ? [2,6] : [6]).includes(d) && <div style={{background:routine.maske.main.hue, borderRadius:4, padding:"1px 4px", fontWeight:700}}>Maske</div>}
                      {cycling && CYCLE[d] === "ex" && <div style={{background:exP.hue, borderRadius:4, padding:"1px 4px", fontWeight:700}}>Syre</div>}
                      {cycling && CYCLE[d] === "ret" && <div style={{background:retP.hue, borderRadius:4, padding:"1px 4px", fontWeight:700}}>Retinol</div>}
                      {cycling && CYCLE[d] === "pause" && <div style={{color:"#B8B4AA"}}>Pause</div>}
                      {!cycling && serum && sDays.includes(d) && <div style={{background:serum.hue, borderRadius:4, padding:"1px 4px", fontWeight:700}}>Aktiv</div>}
                      <div style={{background:routine.krem?.main?.hue, borderRadius:4, padding:"1px 4px"}}>Krem</div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div style={{fontSize:12, color:"#6B6862", marginTop:10, lineHeight:1.7}}>
              {order.map((o, i) => routine[o.cat]?.main && <div key={o.cat}><b style={{background:routine[o.cat].main.hue, borderRadius:4, padding:"0 5px"}}>{o.label}</b> = {routine[o.cat].main.brand} {routine[o.cat].main.name} · {o.n.amount}</div>)}
              <div style={{marginTop:12, paddingTop:10, borderTop:"1px solid #E4E1DA"}}>
                <b style={{fontSize:12.5}}>⚙️ Juster selv</b>
                {serum && (
                  <div style={{marginTop:6}}>
                    <div style={{fontSize:11.5, marginBottom:4}}>Kvelder med aktivt serum ({serum.name}):</div>
                    {DAGER.map((d, di) => (
                      <button key={d} className="chip" style={{padding:"4px 9px", background: sDays.includes(di) ? "#16130F" : "#fff", color: sDays.includes(di) ? "#fff" : "#16130F"}} onClick={() => setCustDays(sDays.includes(di) ? sDays.filter((x) => x !== di) : [...sDays, di].sort())}>{d}</button>
                    ))}
                    <div style={{marginTop:4}}>
                      <button className="mini" onClick={() => setCustDays([1,4])}>Forsiktig (2/uke)</button>
                      <button className="mini" onClick={() => setCustDays([0,2,4])}>Middels (3/uke)</button>
                      <button className="mini" onClick={() => setCustDays([0,1,2,3,4,5,6])}>Hver kveld</button>
                      <button className="mini" onClick={() => setCustDays(null)}>↺ Anbefalt</button>
                    </div>
                    {sDays.length >= 6 && sunWarning(serum) && <div className="sunwarn" style={{marginTop:6}}>⚠️ Hver kveld fra start er tøft for huden med denne ingrediensen – flassing og irritasjon er vanlig. Vi anbefaler gradvis opptrapping, men det er din hud og ditt valg.</div>}
                  </div>
                )}
                <div style={{marginTop:8}}>
                  <button className="chip" style={{background: amRens ? "#16130F" : "#fff", color: amRens ? "#fff" : "#16130F"}} onClick={() => setAmRens(!amRens)}>{amRens ? "✓ Rens om morgenen" : "+ Legg til rens om morgenen"}</button>
                  <span style={{fontSize:11.5, color:"#8B8880", marginLeft:6}}>{amRens ? "Ditt valg – helt greit for fet hud!" : "Anbefalt: kun vann"}</span>
                </div>
              </div>
              {cycling && <div className="note" style={{marginTop:10}}>🔄 <b>Skin-cycling:</b> Du roterer syre-kveld → retinol-kveld → pausekvelder (kun fukt). Idéen, popularisert av dermatolog Whitney Bowe, er at pausenettene lar hudbarrieren reparere seg – slik at du får effekten av begge aktive uten irritasjonen av å stable dem. Konseptet bygger på dokumentasjonen for at gradvis, ikke-daglig retinoidbruk gir mindre irritasjon med bevart effekt. <a className="learn" href="https://pubmed.ncbi.nlm.nih.gov/17515510/" target="_blank" rel="noreferrer">Retinoid-forskning →</a> <a className="learn" href="https://pubmed.ncbi.nlm.nih.gov/32090395/" target="_blank" rel="noreferrer">AHA-forskning →</a> Aldri syre og retinol samme kveld i starten.</div>}
              <div style={{marginTop:6}}>💧 <b>Vann</b> = skyll med lunkent vann – rens er unødvendig om morgenen for de fleste. Mindre rens = sterkere hudbarriere. <a className="learn" href="https://pubmed.ncbi.nlm.nih.gov/29692196/" target="_blank" rel="noreferrer">Om hudbarrieren →</a></div>
            </div>
          </>
        )}
      </div>

      <div className="note" style={{marginTop:14}}>🤝 <b>Åpenhet:</b> «Se beste pris» inneholder annonselenker – handler du der, får vi provisjon uten ekstra kostnad for deg. Anbefalingene er valgt av ingredienser og din profil, aldri av hvem som betaler.</div>

      {!lockedIn
        ? <button className="primary" onClick={async () => {
            setLockedIn(true); setShowWeek(true);
            try { await storage.set("min-rutine", JSON.stringify({ date: new Date().toISOString(), ans, liked, custom, disliked, swaps, lockedIn: true })); ping("Rutinen er låst og lagret! Sjekkpunkt om 3 uker 📅"); } catch (e) { ping("Rutinen er låst!"); }
          }}>Ferdig – lås og lagre rutinen ✓</button>
        : <button className="ghost" onClick={() => setLockedIn(false)}>🔓 Lås opp for å justere</button>}
      <button className="primary" style={{background:"#fff", color:"#16130F", border:"1.5px solid #16130F"}} onClick={() => {
        const lines = order.filter((o) => routine[o.cat]?.main).map((o, i) => `${i + 1}. ${o.label} (${o.when}): ${routine[o.cat].main.brand} ${routine[o.cat].main.name} – ${o.n.amount}`);
        const body = encodeURIComponent(`Min hudpleierutine fra Skinatlas:\n\n${lines.join("\n")}\n\nHusk: SPF hver morgen, og introduser ett produkt om gangen.\n\nLaget med Skinatlas – skinatlas.no`);
        window.open(`mailto:?subject=${encodeURIComponent("Min hudpleierutine ✨")}&body=${body}`);
      }}>📧 Send rutinen på e-post</button>
      <p style={{fontSize:11.5, color:"#8B8880", textAlign:"center", marginTop:8}}>Rutinen lagres automatisk på denne enheten når du låser den – du kan komme tilbake og justere når som helst. Innlogging på tvers av enheter kommer i full versjon.</p>
      <button className="ghost" onClick={() => { setStep(0); setSwaps({}); setRemoved([]); setLockedIn(false); }}>Start ny konsultasjon</button>

      {priceFor && (
        <div className="overlay" onClick={() => setPriceFor(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{display:"flex", gap:14, alignItems:"center"}}>
              <Flaske p={priceFor} size={48} />
              <div>
                <div className="pbrand">{priceFor.brand}</div>
                <div className="pname" style={{marginTop:2}}>{priceFor.name}</div>
                <div style={{fontSize:11, color:"#8B8880", marginTop:3}}>4 butikker · <span style={{textDecoration:"underline"}}>Annonselenker</span></div>
              </div>
            </div>
            <div style={{height:14}} />
            {offers(priceFor).map((o, i) => (
              <div key={o.store} className={"offer" + (i === 0 ? " best" : "")}>
                <div>
                  <div style={{fontWeight:700, fontSize:14}}>{o.store} {i === 0 && <span className="badge" style={{marginLeft:6}}>Billigst</span>}</div>
                  <div style={{fontSize:11.5, color:"#8B8880", marginTop:2}}>{o.ship}</div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <div className="pricetag">{o.price} kr</div>
                  <button className="gostore" onClick={() => ping(`I ekte versjon: affiliate-lenke til ${o.store} 💰`)}>Til butikk</button>
                </div>
              </div>
            ))}
            <p style={{fontSize:11, color:"#8B8880", marginTop:12, lineHeight:1.5}}>Demo-priser. Ekte versjon henter live priser og produktbilder via butikkenes produktfeeder (Adtraction/Partner-ads).</p>
            <button className="ghost" onClick={() => setPriceFor(null)}>Lukk</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div></div>
  );
}

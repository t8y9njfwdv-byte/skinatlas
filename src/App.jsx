import { useState, useMemo, useEffect } from "react";

/* Lagring i nettleseren (localStorage) */
const storage = {
  get: async (k) => { const v = localStorage.getItem(k); return v ? { value: v } : null; },
  set: async (k, v) => { localStorage.setItem(k, v); return { key: k }; },
};


/* ============ INGREDIENS-KUNNSKAP ============ */
const ING = {
  ceramider: { s:"Bygger opp hudbarrieren", d:"Ceramider er fettstoffer huden selv består av – som mørtelen mellom mursteinene i hudcellene. Tilført ceramid tetter «sprekker», så huden holder på fukt og slipper inn færre irritanter.", u:"https://pmc.ncbi.nlm.nih.gov/articles/PMC6197824/" },
  hyaluron: { s:"Binder fukt i huden", d:"Hyaluronsyre kan binde opptil 1000x sin egen vekt i vann – en svamp som trekker fukt inn i hudens ytterste lag.", u:"https://pmc.ncbi.nlm.nih.gov/articles/PMC8322246/" },
  niacinamid: { s:"Jevner hudtone, roer rødhet", d:"Niacinamid (vitamin B3) demper betennelsessignaler og bremser overføring av pigment til hudoverflaten – jevnere tone, roligere rødhet. Øker også hudens egen ceramidproduksjon.", u:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8389214/" },
  salisylsyre: { s:"Renser porene innenfra (BHA)", d:"Fettløselig syre som går NED i porene og løser opp talg og døde hudceller der kviser starter. Betennelsesdempende.", freq:"Start 2–3 kvelder/uke → øk gradvis. Gjør huden mer solfølsom: SPF hver dag er obligatorisk.", sun:true, preg:true , u:"https://pmc.ncbi.nlm.nih.gov/articles/PMC12274963/"},
  glykolsyre: { s:"Eksfolierer overflaten (AHA)", d:"Løsner «limet» mellom døde hudceller så de slipper taket – glattere hud som reflekterer lys bedre.", u:"https://pubmed.ncbi.nlm.nih.gov/22916351/", freq:"Start 1–2 kvelder/uke → maks annenhver kveld. Øker solfølsomhet betydelig.", sun:true },
  retinol: { s:"Gullstandard mot linjer og tekstur", d:"Vitamin A som skrur opp cellefornyelse og kollagenproduksjon – den mest dokumenterte anti-aldringsingrediensen. Finnes i ulik styrke: retinylester (mildest) → retinol → retinaldehyd (retinal, sterkere) → tretinoin (reseptbelagt, sterkest). Nybegynnere bør starte lavt og bygge opp. Kun kveld (brytes ned av UV-lys).", u:"https://pubmed.ncbi.nlm.nih.gov/25738849/", freq:"Uke 1–2: 2 kvelder/uke · Uke 3–4: annenhver kveld · Deretter: hver kveld hvis huden tåler det. Litt flassing i starten er normalt.", sun:true, preg:true },
  bakuchiol: { s:"Mildt retinol-alternativ", d:"Planteekstrakt (ikke en ekte retinoid) med retinol-lignende effekt på linjer og pigment i studier – med langt mindre irritasjon. En kjent studie i British Journal of Dermatology fant effekt på linjer sammenlignbar med retinol, men bedre tålt. Ved graviditet/amming: mildere enn retinol, men det finnes lite forskning på trygghet, så mange hudleger anbefaler å heller velge azelainsyre eller niacinamid, som har mer dokumentasjon – rådfør deg med lege.", freq:"Kan brukes hver kveld fra dag én." , u:"https://pubmed.ncbi.nlm.nih.gov/29947134/"},
  "vitamin-c": { s:"Antioksidant – glød og beskyttelse", d:"Nøytraliserer frie radikaler fra sol og forurensning FØR de skader kollagen – derfor hører den hjemme om MORGENEN, under solkremen. Bremser også pigmentproduksjon.", freq:"Hver morgen, under solkrem. Litt kribling første ukene er vanlig." },
  centella: { s:"Roer og reparerer (K-beauty-klassiker)", d:"Centella asiatica («cica») demper betennelse og stimulerer sårheling – førstehjelp for stresset hud.", freq:"Daglig, morgen og/eller kveld." , u:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8956065/"},
  azelainsyre: { s:"Mot kviser og rødhet – veldig mild", d:"Dreper kvisebakterier, roer rødhet og jevner pigment – så mild at den brukes ved rosacea og i graviditet.", freq:"1x daglig første uken → øk til morgen + kveld." , u:"https://pubmed.ncbi.nlm.nih.gov/37550898/"},
  peptider: { s:"Signalstoffer for fastere hud", d:"Små proteinbiter som «signaliserer» til huden om å produsere mer kollagen. Mild og godt tolerert, og lovende i studier – men effekten er gradvis og subtil, ikke dramatisk.", freq:"Daglig." },
  pdrn: { s:"«Laks-DNA» – hypet, men les det lille med skriften", d:"PDRN (polydeoxyribonukleotid, ofte fra laksesæd) er en av de mest virale ingrediensene akkurat nå. Som INJEKSJON (f.eks. Rejuran hos hudpleieklinikk) har den god dokumentasjon på hudfornyelse. MEN i serum er evidensen svak: DNA-fragmentene er trolig for store til å trenge gjennom huden (500-Dalton-regelen), så mye av «effekten» i et serum kommer sannsynligvis fra fukt- og barriereingrediensene rundt. Fint fuktprodukt – bare ikke forvent injeksjon-resultater fra en krukke.", freq:"Daglig, som et fukt-/pleietrinn.", u:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11763902/" },
  kollagen: { s:"Myten: kollagen i krem bygger IKKE kollagen", d:"Kollagen-molekylet er altfor stort til å trenge ned i huden der kollagen faktisk bygges – så en kollagenkrem bygger ikke ny kollagen slik markedsføringen antyder. Den virker som en god fuktbinder på overflaten, men vil du faktisk STIMULERE kollagenproduksjon, er retinol, vitamin C og peptider veien å gå. Ærlig snakk: spar pengene på «kollagen-serum» og velg dokumenterte ingredienser.", freq:"Som fuktprodukt." },
  mucin: { s:"Sneglemucin – fukt og glød", d:"Rikt på glykoproteiner og hyaluron – fukt, heling og den koreanske «glass skin»-gløden. Godt tolerert og populært i K-beauty.", freq:"Daglig." },
  skvalan: { s:"Lett olje som ligner hudens egen talg", d:"Skvalan er en stabil, ikke-komedogen olje som etterligner hudens naturlige lipider. Mykgjør uten å tette porer – derfor elsket av både tørr og fet hud.", },
  panthenol: { s:"Pro-vitamin B5 – roer og reparerer", d:"Panthenol omdannes til pantotensyre i huden og støtter sårheling og barrierereparasjon. En av de mest veldokumenterte beroligende ingrediensene.", },
  "vitamin-e": { s:"Antioksidant som beskytter hudens fett", d:"Tokoferol beskytter hudens lipider mot oksidering og forsterker effekten av vitamin C – klassisk antioksidant-duo.", },
  urea: { s:"Fuktbinder og mild eksfoliant", d:"I lave prosenter binder urea fukt; i høyere løser den opp hard, tørr hud. Standard i medisinsk hudpleie for svært tørr hud.", },
  pha: { s:"Den mildeste syrefamilien", d:"Polyhydroksysyrer (glukonolakton m.fl.) eksfolierer som AHA, men med større molekyler som ikke trenger like dypt – mindre irritasjon. En 12-ukers studie fant lik anti-aldringseffekt som AHA, men bedre tålt og mindre svie. Styrker faktisk hudbarrieren, og gir ikke økt solfølsomhet slik AHA gjør.", freq:"2–4 kvelder/uke, mildere enn AHA.", u:"https://pubmed.ncbi.nlm.nih.gov/15002657/" },
  sink: { s:"Roer og regulerer talg", d:"Sink (ofte som PCA eller oksid) virker antiinflammatorisk og talgregulerende – vanlig i produkter mot uren hud.", },
  "gronn-te": { s:"Antioksidant, roer huden", d:"EGCG demper betennelse og beskytter mot UV-relatert stress." },
};

/* ============ PRODUKTER ============ */
/* cf = Leaping Bunny-sertifisert, vg = vegansk, tester = vet at merket tester på dyr (utelukkes alltid). Demo-data – verifiseres mot offisielle lister i full versjon. */
const P = [
  { id:"a9", cat:"olje", name:"Lipikar Cleansing Oil", brand:"La Roche-Posay", tier:4, ings:["niacinamid"], for:["torr","sens","normal","kombi"], hue:"#FFE9D6", cf:false, tester:true, vg:false },
  // ===== DINE PRODUKTER + HARUHARU + UTVIDET THE ORDINARY/COSRX =====
  { id:"u1", cat:"serum", name:"Reedle Shot 100", brand:"VT Cosmetics", tier:2, ings:["niacinamid","hyaluron","centella"], goal:"glow", for:["normal","kombi","fet","torr","sens"], hue:"#FFF2BD", cf:true, vg:false, inci:"Purified Water, Dipropylene Glycol, Glycerin, Niacinamide, Butylene Glycol, Macadamia Ternifolia Seed Oil, 1,2-Hexanediol, Hydrolyzed Sponge, Centella Asiatica Extract, Sodium Hyaluronate, Propolis Extract, Panthenol, Tromethamine, Disodium EDTA" },
  { id:"u2", cat:"krem", name:"PDRN Capsule Cream 100", brand:"VT Cosmetics", tier:2, ings:["niacinamid","hyaluron"], for:["torr","normal","kombi","sens"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"u3", cat:"serum", name:"Lactic Acid 10% + HA", brand:"The Ordinary", tier:1, ings:["glykolsyre","hyaluron"], goal:"glow", for:["normal","kombi","fet","torr"], hue:"#FFD9C7", cf:true, vg:true, inci:"Aqua, Lactic Acid, Sodium Hydroxide, Sodium Hyaluronate, Potassium Citrate, Hydroxyethylcellulose, Ethoxydiglycol, Phenoxyethanol" },
  { id:"u4", cat:"serum", name:"Youthtopia Refining Apple Peel", brand:"Origins", tier:2, ings:["glykolsyre"], goal:"glow", for:["normal","kombi","fet"], hue:"#FFD9C7", cf:false, vg:false },
  { id:"u5", cat:"serum", name:"C-Firma Fresh Day Serum", brand:"Drunk Elephant", tier:3, ings:["vitamin-c","vitamin-e"], goal:"glow", for:["normal","kombi","torr","fet"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"u6", cat:"serum", name:"Skin Perfecting 2% BHA Liquid", brand:"Paula's Choice", tier:2, ings:["salisylsyre"], goal:"kviser", for:["fet","kombi","normal"], hue:"#FFD9C7", cf:true, vg:true, inci:"Water, Methylpropanediol, Butylene Glycol, Salicylic Acid, Polysorbate 20, Camellia Oleifera Leaf Extract, Sodium Hydroxide, Tetrasodium EDTA" },
  { id:"u7", cat:"serum", name:"The 6 Peptide Skin Booster Serum", brand:"COSRX", tier:1, ings:["peptider","niacinamid"], goal:"aldring", for:["normal","kombi","torr","sens"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"u8", cat:"serum", name:"Advanced Snail 96 Mucin Power Essence", brand:"COSRX", tier:1, ings:["mucin"], goal:"ro", for:["torr","normal","kombi","sens","fet"], hue:"#E2F3D5", cf:true, vg:false, inci:"Snail Secretion Filtrate 96.3%, Betaine, Butylene Glycol, 1,2-Hexanediol, Sodium Hyaluronate, Panthenol, Arginine, Allantoin, Ethyl Hexanediol, Sodium Polyacrylate, Carbomer, Phenoxyethanol" },
  { id:"u9", cat:"krem", name:"Barrier Restore Cream", brand:"Rhode", tier:3, ings:["ceramider","peptider"], for:["torr","normal","sens","kombi"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"u10", cat:"krem", name:"Glazing Milk", brand:"Rhode", tier:3, ings:["niacinamid","panthenol"], for:["torr","normal","sens","kombi"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"u11", cat:"krem", name:"Advanced Repair Ointment", brand:"CeraVe", tier:4, ings:["ceramider"], for:["torr","sens","normal"], hue:"#E1E8FF", cf:false, tester:true, vg:false },
  { id:"u12", cat:"toner", name:"Vegan Kombucha Tea Essence", brand:"Dr. Ceuracle", tier:2, ings:["niacinamid","gronn-te"], for:["normal","kombi","torr","sens","fet"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"u13", cat:"serum", name:"Secret of Sahara Oil Essence Torridien", brand:"Huxley", tier:2, ings:["vitamin-e"], goal:"ro", for:["torr","normal","kombi"], hue:"#E2F3D5", cf:true, vg:false },
  { id:"u14", cat:"krem", name:"Hyaluronic Acid Moist Cream", brand:"Isntree", tier:1, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"u15", cat:"krem", name:"345 Relief Cream", brand:"Dr. Althea", tier:1, ings:["ceramider","panthenol"], for:["sens","torr","normal"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"u16", cat:"toner", name:"Milky Toner", brand:"Byoma", tier:1, ings:["ceramider","niacinamid"], for:["sens","torr","normal","kombi"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"u17", cat:"krem", name:"PDRN Hyaluronic Acid 100 Moisturizing Cream", brand:"Medicube", tier:2, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"u18", cat:"olje", name:"Gentle Black Deep Cleansing Oil", brand:"Klairs", tier:2, ings:[], for:["torr","normal","kombi","sens","fet"], hue:"#FFE9D6", cf:true, vg:true },
  { id:"u19", cat:"rens", name:"AHA Cleansing Foam", brand:"Hanskin", tier:2, ings:["glykolsyre"], for:["fet","kombi","normal"], hue:"#D9F2E6", cf:true, vg:false },
  { id:"u20", cat:"rens", name:"BHA Pore Cleansing Foam", brand:"Hanskin", tier:2, ings:["salisylsyre"], for:["fet","kombi","normal"], hue:"#D9F2E6", cf:true, vg:false },
  { id:"u21", cat:"rens", name:"Low pH Good Morning Gel Cleanser", brand:"COSRX", tier:1, ings:["gronn-te"], for:["fet","kombi","normal","sens"], hue:"#D9F2E6", cf:true, vg:true, inci:"Water, Butylene Glycol, Cocamidopropyl Betaine, Sodium Lauroyl Methyl Isethionate, Sodium Methyl Cocoyl Taurate, Sodium Chloride, Tea Tree Leaf Oil, Betaine Salicylate, Ethyl Hexanediol, Allantoin" },
  // Haruharu Wonder (populært i Norge)
  { id:"h1", cat:"toner", name:"Black Rice Hyaluronic Toner", brand:"Haruharu Wonder", tier:1, ings:["hyaluron"], for:["torr","normal","kombi","sens","fet"], hue:"#EAE2FF", cf:true, vg:true, inci:"Water, Betaine, Glycerin, Propanediol, Oryza Sativa (Rice) Extract, Phyllostachys Pubescens Shoot Bark Extract, Aspergillus Ferment Extract Filtrate, Panax Ginseng Root Extract, Sodium Hyaluronate" },
  { id:"h2", cat:"serum", name:"Black Rice Hyaluronic Serum", brand:"Haruharu Wonder", tier:1, ings:["hyaluron","niacinamid"], goal:"ro", for:["torr","normal","kombi","sens"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"h3", cat:"krem", name:"Black Rice Hyaluronic Cream", brand:"Haruharu Wonder", tier:1, ings:["hyaluron","ceramider"], for:["torr","normal","sens","kombi"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"h4", cat:"serum", name:"Black Rice Bakuchiol Eye Serum", brand:"Haruharu Wonder", tier:1, ings:["bakuchiol"], goal:"aldring", for:["sens","normal","kombi","torr"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"h5", cat:"spf", name:"Black Rice Pure Mild Sunscreen SPF50+", brand:"Haruharu Wonder", tier:1, ings:[], for:["sens","normal","kombi","torr","fet"], hue:"#FFE59A", cf:true, vg:true },
  // The Ordinary – utvidet (stort i Norge)
  { id:"to1", cat:"serum", name:"Niacinamide 10% + Zinc 1%", brand:"The Ordinary", tier:1, ings:["niacinamid","sink"], goal:"kviser", for:["fet","kombi","normal"], hue:"#FFF2BD", cf:true, vg:true, inci:"Aqua, Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol" },
  { id:"to2", cat:"serum", name:"Hyaluronic Acid 2% + B5", brand:"The Ordinary", tier:1, ings:["hyaluron","panthenol"], goal:"ro", for:["torr","normal","kombi","sens","fet"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"to3", cat:"serum", name:"Ascorbyl Glucoside Solution 12%", brand:"The Ordinary", tier:1, ings:["vitamin-c"], goal:"glow", for:["normal","kombi","fet","torr","sens"], hue:"#FFF2BD", cf:true, vg:true, inci:"Aqua, Ascorbyl Glucoside, Propanediol, Triethanolamine, Aminomethyl Propanol, Isoceteth-20, Xanthan Gum, Dimethyl Isosorbide, Ethoxydiglycol, Trisodium Ethylenediamine Disuccinate, 1,2-Hexanediol, Caprylyl Glycol" },
  { id:"to4", cat:"serum", name:"Retinol 0.5% in Squalane", brand:"The Ordinary", tier:1, ings:["retinol","skvalan"], goal:"aldring", for:["normal","kombi","torr","fet"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"to5", cat:"serum", name:"Granactive Retinoid 2% Emulsion", brand:"The Ordinary", tier:1, ings:["retinol"], goal:"aldring", for:["sens","normal","kombi","torr"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"to6", cat:"serum", name:"Azelaic Acid Suspension 10%", brand:"The Ordinary", tier:1, ings:["azelainsyre"], goal:"kviser", for:["fet","kombi","normal","sens"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"to7", cat:"serum", name:"Salicylic Acid 2% Solution", brand:"The Ordinary", tier:1, ings:["salisylsyre"], goal:"kviser", for:["fet","kombi","normal"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"to8", cat:"serum", name:"Glycolic Acid 7% Toning Solution", brand:"The Ordinary", tier:1, ings:["glykolsyre"], goal:"glow", for:["normal","kombi","fet"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"to9", cat:"serum", name:"Marine Hyaluronics", brand:"The Ordinary", tier:1, ings:["hyaluron"], goal:"ro", for:["fet","kombi","normal","sens"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"to10", cat:"serum", name:"Buffet Multi-Peptide Serum", brand:"The Ordinary", tier:1, ings:["peptider","hyaluron"], goal:"aldring", for:["normal","kombi","torr","sens"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"to11", cat:"krem", name:"Natural Moisturizing Factors + HA", brand:"The Ordinary", tier:1, ings:["hyaluron"], for:["normal","kombi","torr","sens"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"to12", cat:"olje", name:"Squalane Cleanser", brand:"The Ordinary", tier:1, ings:["skvalan"], for:["torr","sens","normal","kombi"], hue:"#FFE9D6", cf:true, vg:true },
  // COSRX – utvidet
  { id:"cx1", cat:"serum", name:"The Vitamin C 23 Serum", brand:"COSRX", tier:1, ings:["vitamin-c"], goal:"glow", for:["normal","kombi","fet","torr"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"cx2", cat:"serum", name:"Retinol 0.1 Cream", brand:"COSRX", tier:1, ings:["retinol"], goal:"aldring", for:["normal","kombi","torr","fet"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"cx3", cat:"toner", name:"AHA/BHA Clarifying Treatment Toner", brand:"COSRX", tier:1, ings:["glykolsyre","salisylsyre"], for:["fet","kombi","normal"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"cx4", cat:"serum", name:"Propolis Light Ampoule", brand:"COSRX", tier:1, ings:["niacinamid"], goal:"glow", for:["torr","normal","kombi","sens"], hue:"#FFF2BD", cf:true, vg:false },
  { id:"cx5", cat:"serum", name:"BHA Blackhead Power Liquid", brand:"COSRX", tier:1, ings:["salisylsyre"], goal:"kviser", for:["fet","kombi","normal"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"cx6", cat:"spf", name:"Aloe Soothing Sun Cream SPF50+", brand:"COSRX", tier:1, ings:[], for:["sens","normal","kombi","torr","fet"], hue:"#FFE59A", cf:true, vg:false },

  // ===== K-BEAUTY & MERKELISTE (verifisert via research) =====
  { id:"b1", cat:"toner", name:"Heartleaf 77% Soothing Toner", brand:"Anua", tier:1, ings:["centella","hyaluron","panthenol"], for:["sens","torr","normal","kombi","fet"], hue:"#EAE2FF", cf:true, vg:true, inci:"Houttuynia Cordata Extract 77%, Water, 1,2-Hexanediol, Glycerin, Betaine, Panthenol, Centella Asiatica Extract, Sodium Hyaluronate, Butylene Glycol, Tromethamine, Disodium EDTA" },
  { id:"b2", cat:"serum", name:"Glow Serum Propolis + Niacinamide", brand:"Beauty of Joseon", tier:1, ings:["niacinamid"], goal:"glow", for:["torr","normal","kombi","sens"], hue:"#FFF2BD", cf:true, vg:false },
  { id:"b3", cat:"serum", name:"Revive Eye Serum Ginseng + Retinal", brand:"Beauty of Joseon", tier:1, ings:["retinol"], goal:"aldring", for:["normal","kombi","torr"], hue:"#FFD6E4", cf:true, vg:false },
  { id:"b4", cat:"spf", name:"Relief Sun Rice + Probiotics SPF50+", brand:"Beauty of Joseon", tier:1, ings:[], for:["torr","normal","kombi","sens","fet"], hue:"#FFE59A", cf:true, vg:false },
  { id:"b5", cat:"serum", name:"Madagascar Centella Ampoule", brand:"Skin1004", tier:1, ings:["centella"], goal:"ro", for:["sens","torr","normal","kombi","fet"], hue:"#E2F3D5", cf:true, vg:true, inci:"Centella Asiatica Extract, Water, Glycerin, Butylene Glycol, 1,2-Hexanediol, Phenoxyethanol, Cellulose Gum" },
  { id:"b6", cat:"serum", name:"Centella Unscented Serum", brand:"Purito", tier:1, ings:["centella","niacinamid","peptider","ceramider"], goal:"ro", for:["sens","torr","normal","kombi"], hue:"#E2F3D5", cf:true, vg:true, inci:"Centella Asiatica Extract 49%, Water, Glycerin, Dipropylene Glycol, Niacinamide, Butylene Glycol, 1,2-Hexanediol, Ceramide NP, Sodium Hyaluronate, Asiaticoside, Palmitoyl Hexapeptide-12, Panthenol, Camellia Sinensis Leaf Extract, Disodium EDTA, Adenosine" },
  { id:"b7", cat:"spf", name:"Daily Go-To Sunscreen SPF50+", brand:"Purito", tier:1, ings:["centella"], for:["sens","normal","kombi","torr","fet"], hue:"#FFE59A", cf:true, vg:true },
  { id:"b8", cat:"toner", name:"Hyaluronic Acid Toner Plus", brand:"Isntree", tier:1, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"b9", cat:"spf", name:"Hyaluronic Acid Watery Sun Gel SPF50+", brand:"Isntree", tier:1, ings:["hyaluron"], for:["fet","kombi","normal","sens","torr"], hue:"#FFE59A", cf:true, vg:true },
  { id:"b10", cat:"serum", name:"Dark Spot Correcting Glow Serum", brand:"Axis-Y", tier:1, ings:["niacinamid"], goal:"glow", for:["normal","kombi","fet","torr"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"b12", cat:"serum", name:"Advanced Snail 96 Mucin Essence", brand:"COSRX", tier:1, ings:["mucin"], goal:"ro", for:["torr","normal","kombi","sens","fet"], hue:"#E2F3D5", cf:true, vg:false },
  { id:"b13", cat:"krem", name:"Advanced Snail 92 All In One Cream", brand:"COSRX", tier:1, ings:["mucin"], for:["torr","normal","kombi","sens"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"b14", cat:"serum", name:"Vitamin C 23 Serum", brand:"Dr. Althea", tier:1, ings:["vitamin-c","vitamin-e"], goal:"glow", for:["normal","kombi","fet","torr"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"b15", cat:"olje", name:"Clean It Zero Cleansing Balm", brand:"Banila Co", tier:1, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#FFE9D6", cf:true, vg:false },
  { id:"b16", cat:"serum", name:"Vegan Active Berry First Serum", brand:"Dr. Ceuracle", tier:2, ings:["niacinamid","hyaluron"], goal:"glow", for:["normal","kombi","torr","sens"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"b17", cat:"krem", name:"Real Barrier Cream", brand:"Hanskin", tier:2, ings:["ceramider","panthenol"], for:["sens","torr","normal"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"b18", cat:"olje", name:"Hyaluron Cleansing Oil PHA", brand:"Hanskin", tier:2, ings:["pha","hyaluron"], for:["torr","normal","kombi","sens"], hue:"#FFE9D6", cf:true, vg:true },
  { id:"b19", cat:"serum", name:"Deep Hydration Serum", brand:"Medicube", tier:2, ings:["hyaluron","niacinamid"], goal:"ro", for:["torr","normal","kombi","sens"], hue:"#E2F3D5", cf:true, vg:false },
  { id:"b20", cat:"maske", name:"Zero Pore Pad", brand:"Medicube", tier:2, ings:["glykolsyre","salisylsyre"], for:["fet","kombi","normal"], hue:"#E8DDC8", cf:true, vg:false },
  // ===== VESTLIGE MERKER =====
  { id:"b21", cat:"serum", name:"C E Ferulic", brand:"SkinCeuticals", tier:3, ings:["vitamin-c","vitamin-e"], goal:"glow", for:["normal","kombi","torr","fet"], hue:"#FFF2BD", cf:false, vg:false, tier_note:"apotek/klinikk" },
  { id:"b22", cat:"serum", name:"Crystal Retinal 3", brand:"Medik8", tier:3, ings:["retinol"], goal:"aldring", for:["normal","kombi","torr","fet"], hue:"#FFD6E4", cf:true, vg:false },
  { id:"b23", cat:"serum", name:"C-Tetra Vitamin C Serum", brand:"Medik8", tier:3, ings:["vitamin-c","vitamin-e"], goal:"glow", for:["normal","kombi","torr","sens"], hue:"#FFF2BD", cf:true, vg:false },
  { id:"b24", cat:"serum", name:"Retinol Youth Renewal Serum", brand:"Murad", tier:3, ings:["retinol"], goal:"aldring", for:["normal","kombi","torr"], hue:"#FFD6E4", cf:false, vg:false },
  { id:"b25", cat:"maske", name:"Water Bank Blue Hyaluronic Mask", brand:"Laneige", tier:2, ings:["hyaluron"], for:["torr","normal","kombi","sens","fet"], hue:"#E8DDC8", cf:false, vg:false },
  { id:"b26", cat:"maske", name:"Water Sleeping Mask", brand:"Laneige", tier:2, ings:["hyaluron"], for:["torr","normal","kombi","fet"], hue:"#E8DDC8", cf:false, vg:false },
  { id:"b27", cat:"krem", name:"BB Cream Skin Perfecting", brand:"Erborian", tier:2, ings:["centella"], for:["normal","kombi","torr","sens"], hue:"#E1E8FF", cf:false, vg:false },
  { id:"b28", cat:"krem", name:"Nordic Hydra Lumene Cream", brand:"Lumene", tier:1, ings:["hyaluron","vitamin-c"], for:["torr","normal","kombi","sens"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"b29", cat:"rens", name:"White Tea Foaming Cleanser", brand:"Korres", tier:2, ings:["gronn-te"], for:["normal","kombi","fet","sens"], hue:"#D9F2E6", cf:true, vg:false },
  { id:"b30", cat:"serum", name:"Greek Yoghurt Probiotic Serum", brand:"Korres", tier:2, ings:["hyaluron"], goal:"ro", for:["sens","torr","normal","kombi"], hue:"#E2F3D5", cf:true, vg:false },
  { id:"b31", cat:"toner", name:"Green Tea Balancing Toner", brand:"Innisfree", tier:1, ings:["gronn-te"], for:["fet","kombi","normal","sens"], hue:"#EAE2FF", cf:false, vg:false },
  { id:"b32", cat:"serum", name:"Black Tea Youth Enhancing Serum", brand:"Origins", tier:2, ings:["gronn-te"], goal:"aldring", for:["normal","kombi","torr"], hue:"#FFD6E4", cf:false, vg:false },
  { id:"b33", cat:"serum", name:"Bakuchiol Retinol Alternative", brand:"The Inkey List", tier:1, ings:["bakuchiol"], goal:"aldring", for:["sens","normal","kombi","torr"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"b34", cat:"serum", name:"Niacinamide 10% Serum", brand:"The Inkey List", tier:1, ings:["niacinamid","hyaluron"], goal:"kviser", for:["fet","kombi","normal"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"b35", cat:"serum", name:"Anti-Wrinkle Retinoid Serum", brand:"Exuviance", tier:2, ings:["retinol"], goal:"aldring", for:["normal","kombi","torr"], hue:"#FFD6E4", cf:false, vg:false },
  { id:"b36", cat:"serum", name:"Hydra-Collagen Prep Essence", brand:"Huxley", tier:2, ings:["hyaluron"], goal:"ro", for:["torr","normal","sens","kombi"], hue:"#E2F3D5", cf:true, vg:false },
  { id:"a10", cat:"serum", name:"Pure Vitamin C10 Serum", brand:"La Roche-Posay", tier:4, ings:["vitamin-c","hyaluron"], goal:"glow", for:["normal","kombi","fet","torr"], hue:"#FFF2BD", cf:false, tester:true, vg:false, inci:"Aqua, Ascorbic Acid, Alcohol Denat, Propylene Glycol, Glycerin, Triethanolamine, Sodium Hyaluronate, Tocopherol" },
  { id:"a11", cat:"serum", name:"Retinol B3 Serum", brand:"La Roche-Posay", tier:4, ings:["retinol","niacinamid"], goal:"aldring", for:["normal","kombi","torr","fet"], hue:"#FFD6E4", cf:false, tester:true, vg:false },
  { id:"a12", cat:"serum", name:"Retrinal 0.1 Intensive Cream", brand:"Avène", tier:4, ings:["retinol"], goal:"aldring", for:["normal","torr","kombi"], hue:"#FFD6E4", cf:true, vg:false },
  { id:"a13", cat:"serum", name:"Azelaic Acid Serum", brand:"Naturium", tier:4, ings:["azelainsyre","niacinamid"], goal:"kviser", for:["fet","kombi","sens","normal"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"a14", cat:"serum", name:"Hydrating B5 Gel", brand:"SkinCeuticals", tier:4, ings:["hyaluron","panthenol"], goal:"ro", for:["torr","sens","normal","kombi"], hue:"#E2F3D5", cf:false, vg:false },
  { id:"a15", cat:"krem", name:"Cicaplast Baume B5+", brand:"La Roche-Posay", tier:4, ings:["panthenol","ceramider"], for:["sens","torr","normal","kombi"], hue:"#E1E8FF", cf:false, tester:true, vg:false, inci:"Aqua, Glycerin, Butyrospermum Parkii Butter, Panthenol, Zinc Gluconate, Madecassoside, Phenoxyethanol" },
  { id:"a16", cat:"maske", name:"Cicalfate Repair Mask", brand:"Avène", tier:4, ings:["panthenol","sink"], for:["sens","torr","normal"], hue:"#E8DDC8", cf:true, vg:false },
  { id:"a17", cat:"maske", name:"Rehydrating Sheet Mask", brand:"Eucerin", tier:4, ings:["hyaluron"], for:["torr","normal","sens","kombi","fet"], hue:"#E8DDC8", cf:false, tester:true, vg:false },
  { id:"a18", cat:"toner", name:"Thermal Spring Water", brand:"Avène", tier:4, ings:[], for:["sens","torr","normal","kombi","fet"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"a19", cat:"toner", name:"Effaclar Micellar Water", brand:"La Roche-Posay", tier:4, ings:["niacinamid"], for:["fet","kombi","normal"], hue:"#EAE2FF", cf:false, tester:true, vg:false },
  { id:"a20", cat:"krem", name:"AtoPalm MLE Cream", brand:"AtoPalm", tier:4, ings:["ceramider"], for:["torr","sens","normal"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"a21", cat:"spf", name:"Photoderm Nude Touch SPF50+", brand:"Bioderma", tier:4, ings:[], for:["fet","kombi","normal","sens","torr"], hue:"#FFE59A", cf:false, tester:true, vg:false },
  { id:"a22", cat:"olje", name:"Lipikar Cleansing Oil AP+", brand:"Avène", tier:4, ings:[], for:["torr","sens","normal"], hue:"#FFE9D6", cf:true, vg:false },
  { id:"a1", cat:"rens", name:"Toleriane Caring Wash", brand:"La Roche-Posay", tier:4, ings:["ceramider","niacinamid"], for:["sens","torr","normal","kombi"], hue:"#D9F2E6", cf:false, tester:true, vg:false },
  { id:"a2", cat:"serum", name:"Hyalu B5 Serum", brand:"La Roche-Posay", tier:4, ings:["hyaluron","panthenol"], goal:"ro", for:["torr","sens","normal","kombi"], hue:"#E2F3D5", cf:false, tester:true, vg:false },
  { id:"a3", cat:"serum", name:"Sebiaclear Serum", brand:"Avène", tier:4, ings:["niacinamid"], goal:"kviser", for:["fet","kombi","sens"], hue:"#FFF2BD", cf:true, vg:false },
  { id:"a4", cat:"krem", name:"Tolérance Control Cream", brand:"Avène", tier:4, ings:["ceramider"], for:["sens","torr","normal"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"a5", cat:"krem", name:"Aquaphor / Repair Balm", brand:"Eucerin", tier:4, ings:["panthenol"], for:["torr","sens","normal"], hue:"#E1E8FF", cf:false, tester:true, vg:false },
  { id:"a6", cat:"serum", name:"Hyaluron-Filler Serum", brand:"Eucerin", tier:4, ings:["hyaluron"], goal:"aldring", for:["torr","normal","kombi","sens"], hue:"#FFD6E4", cf:false, tester:true, vg:false },
  { id:"a7", cat:"spf", name:"Anthelios Fluid SPF50+", brand:"La Roche-Posay", tier:4, ings:[], for:["fet","kombi","normal","sens"], hue:"#FFE59A", cf:false, tester:true, vg:false },
  { id:"a8", cat:"toner", name:"Sensibio Micellar Water", brand:"Bioderma", tier:4, ings:[], for:["sens","torr","normal","kombi","fet"], hue:"#EAE2FF", cf:false, tester:true, vg:false },
  { id:"c9", cat:"rens", name:"Salicylic Acid Cleanser", brand:"CeraVe", tier:4, ings:["salisylsyre","niacinamid"], for:["fet","kombi"], hue:"#D9F2E6", cf:false, tester:true, vg:false },
  { id:"c10", cat:"rens", name:"Pure Clay Cleanser", brand:"L'Oréal", tier:1, ings:["gronn-te"], for:["fet","kombi","normal"], hue:"#D9F2E6", cf:false, tester:true, vg:false },
  { id:"c11", cat:"rens", name:"Soy Face Cleanser", brand:"Fresh", tier:3, ings:[], for:["torr","normal","sens","kombi"], hue:"#D9F2E6", cf:true, vg:false },
  { id:"t3", cat:"toner", name:"Centella Toner", brand:"Skin1004", tier:1, ings:["centella"], for:["sens","torr","normal","kombi","fet"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"t5", cat:"toner", name:"Daily Reviving Concentrate", brand:"Kiehl's", tier:2, ings:["gronn-te","skvalan"], for:["normal","torr","kombi"], hue:"#EAE2FF", cf:false, tester:true, vg:false },
  { id:"t6", cat:"toner", name:"Ginseng Essence Water", brand:"Beauty of Joseon", tier:1, ings:["niacinamid"], for:["torr","normal","kombi","sens"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"s15", cat:"serum", name:"Alpha Arbutin 2% + HA", brand:"The Ordinary", tier:1, ings:["hyaluron"], goal:"glow", for:["normal","kombi","fet","torr","sens"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"s16", cat:"serum", name:"Revitalizing Supreme Serum", brand:"Estée Lauder", tier:3, ings:["peptider","hyaluron"], goal:"aldring", for:["torr","normal","kombi"], hue:"#FFD6E4", cf:false, tester:true, vg:false },
  { id:"s17", cat:"serum", name:"B-Hydra Intensive Hydration", brand:"Drunk Elephant", tier:3, ings:["niacinamid","hyaluron"], goal:"ro", for:["torr","normal","kombi","sens","fet"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"s18", cat:"serum", name:"PHA Facial Serum", brand:"The Inkey List", tier:1, ings:["pha"], goal:"glow", for:["sens","normal","kombi","torr"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"s19", cat:"serum", name:"Retinal Serum 0.05%", brand:"Naturium", tier:2, ings:["retinol"], goal:"aldring", for:["normal","kombi","torr","fet"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"m9", cat:"krem", name:"Ultra Facial Cream", brand:"Kiehl's", tier:2, ings:["skvalan","hyaluron"], for:["torr","normal","kombi"], hue:"#E1E8FF", cf:false, tester:true, vg:false },
  { id:"m10", cat:"krem", name:"Protini Polypeptide Cream", brand:"Drunk Elephant", tier:3, ings:["peptider"], for:["normal","kombi","torr"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"m11", cat:"krem", name:"Panthenol Barrier Cream", brand:"Byoma", tier:1, ings:["panthenol","ceramider"], for:["sens","torr","normal"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"m12", cat:"krem", name:"Oil-Free Moisturizer", brand:"Cetaphil", tier:4, ings:["hyaluron"], for:["fet","kombi"], hue:"#E1E8FF", cf:false, tester:true, vg:false },
  { id:"f5", cat:"spf", name:"UV Clear SPF 46", brand:"EltaMD", tier:2, ings:["niacinamid"], for:["fet","kombi","sens","normal"], hue:"#FFE59A", cf:false, vg:false },
  { id:"f6", cat:"spf", name:"Vitamin C SPF 40", brand:"Naturium", tier:1, ings:["vitamin-c","vitamin-e"], for:["normal","kombi","torr","fet"], hue:"#FFE59A", cf:true, vg:true },
  { id:"k1", cat:"maske", name:"Indian Healing Clay", brand:"Aztec Secret", tier:1, ings:[], for:["fet","kombi","normal"], hue:"#E8DDC8", cf:true, vg:true },
  { id:"k2", cat:"maske", name:"Rich Moist Soothing Sheet Mask", brand:"Klairs", tier:1, ings:["centella","hyaluron"], for:["torr","sens","normal","kombi"], hue:"#E8DDC8", cf:true, vg:true },
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
  { id:"c1", cat:"rens", name:"Hydrating Cleanser", brand:"CeraVe", tier:4, ings:["ceramider","hyaluron","niacinamid"], for:["torr","normal","sens"], hue:"#D9F2E6", cf:false, tester:true, vg:false },
  { id:"c2", cat:"rens", name:"Toleriane Dermo-Cleanser", brand:"La Roche-Posay", tier:4, ings:["ceramider","niacinamid"], for:["torr","sens","normal"], hue:"#D9F2E6", cf:false, tester:true, vg:false },
  { id:"c3", cat:"rens", name:"Low pH Good Morning Gel", brand:"COSRX", tier:1, ings:["gronn-te"], for:["fet","kombi","normal","sens"], hue:"#D9F2E6", cf:true, vg:true },
  { id:"c4", cat:"rens", name:"Green Clean Balm", brand:"Farmacy", tier:3, ings:["gronn-te"], for:["torr","normal","kombi"], hue:"#D9F2E6", cf:true, vg:false },
  { id:"c6", cat:"rens", name:"Matcha Hemp Hydrating Cleanser", brand:"Krave Beauty", tier:2, ings:["gronn-te","hyaluron"], for:["torr","sens","normal","kombi"], hue:"#D9F2E6", cf:true, vg:true },
  { id:"c5", cat:"rens", name:"Foaming Cleanser", brand:"CeraVe", tier:4, ings:["ceramider","niacinamid","hyaluron"], for:["fet","kombi"], hue:"#D9F2E6", cf:false, tester:true, vg:false },
  { id:"t1", cat:"toner", name:"Supple Preparation Toner", brand:"Klairs", tier:2, ings:["centella","hyaluron"], for:["torr","sens","normal","kombi"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"t2", cat:"toner", name:"Advanced Snail 96 Mucin", brand:"COSRX", tier:2, ings:["mucin","hyaluron"], for:["torr","normal","kombi","fet"], hue:"#EAE2FF", cf:true, vg:false },
  { id:"s11", cat:"serum", name:"Glow Tonic (AHA)", brand:"Pixi", tier:2, ings:["glykolsyre","gronn-te"], goal:"glow", for:["normal","kombi","fet"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"s1", cat:"serum", name:"2% BHA Liquid Exfoliant", brand:"Paula's Choice", tier:2, ings:["salisylsyre","gronn-te"], goal:"kviser", for:["fet","kombi","normal"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"s2", cat:"serum", name:"Azelaic Acid 10%", brand:"The Ordinary", tier:1, ings:["azelainsyre"], goal:"kviser", for:["sens","torr","normal","kombi","fet"], hue:"#FFD9C7", cf:true, vg:true },
  { id:"s3", cat:"serum", name:"Vitamin C 23% + Ferulic", brand:"Timeless", tier:2, ings:["vitamin-c","hyaluron"], goal:"glow", for:["normal","kombi","fet","torr"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"s6", cat:"serum", name:"Granactive Retinoid 2%", brand:"The Ordinary", tier:1, ings:["retinol"], goal:"aldring", for:["normal","kombi","fet"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"s7", cat:"serum", name:"Bakuchiol Serum", brand:"Herbivore", tier:3, ings:["bakuchiol"], goal:"aldring", for:["sens","torr","normal"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"s9", cat:"serum", name:"Niacinamide 10% + Zinc", brand:"The Ordinary", tier:1, ings:["niacinamid"], goal:"glow", for:["fet","kombi","normal"], hue:"#D6E9FF", cf:true, vg:true },
  { id:"m1", cat:"krem", name:"Moisturising Cream", brand:"CeraVe", tier:4, ings:["ceramider","hyaluron"], for:["torr","normal","sens"], hue:"#E1E8FF", cf:false, tester:true, vg:false },
  { id:"m3", cat:"krem", name:"Water Cream", brand:"Tatcha", tier:3, ings:["gronn-te","hyaluron"], for:["fet","kombi","normal"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"m4", cat:"krem", name:"Hydro Boost Gel", brand:"Neutrogena", tier:1, ings:["hyaluron"], for:["fet","kombi","normal"], hue:"#E1E8FF", cf:false, tester:true, vg:false },
  { id:"m5", cat:"krem", name:"Dynamic Skin Recovery", brand:"Dermalogica", tier:3, ings:["peptider","hyaluron"], for:["normal","torr","kombi"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"f1", cat:"spf", name:"Anthelios UVMune 400", brand:"La Roche-Posay", tier:4, ings:["hyaluron"], for:["sens","torr","normal","kombi","fet"], hue:"#FFE59A", cf:false, tester:true, vg:false },
  { id:"f2", cat:"spf", name:"Relief Sun SPF50", brand:"Beauty of Joseon", tier:1, ings:["mucin","gronn-te"], for:["torr","normal","kombi","sens"], hue:"#FFE59A", cf:true, vg:false },
  { id:"f4", cat:"spf", name:"Rice + Probiotics SPF50 (vegansk)", brand:"Beauty of Joseon", tier:1, ings:["niacinamid"], for:["torr","normal","kombi","sens","fet"], hue:"#FFE59A", cf:true, vg:true },
  { id:"f3", cat:"spf", name:"Unseen Sunscreen", brand:"Supergoop!", tier:3, ings:[], for:["fet","kombi","normal"], hue:"#FFE59A", cf:true, vg:true },
  /* ── UTVIDET RETINOID-UTVALG (potens svakest→sterkest) ── */
  { id:"r10", cat:"serum", name:"Retinyl Palmitate Gentle Serum", brand:"Naturium", tier:2, ings:["retinol"], goal:"aldring", for:["sens","torr","normal","kombi"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"r11", cat:"serum", name:"Retinol 0.2% in Squalane", brand:"The Ordinary", tier:1, ings:["retinol","skvalan"], goal:"aldring", for:["sens","normal","kombi","torr"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"r12", cat:"serum", name:"Retinol 1% in Squalane", brand:"The Ordinary", tier:1, ings:["retinol","skvalan"], goal:"aldring", for:["normal","kombi","torr","fet"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"r13", cat:"serum", name:"Retinal 0.1% Night Serum", brand:"Naturium", tier:2, ings:["retinol"], goal:"aldring", for:["normal","kombi","torr","fet"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"r14", cat:"serum", name:"Crystal Retinal 6", brand:"Medik8", tier:3, ings:["retinol"], goal:"aldring", for:["normal","kombi","torr","fet"], hue:"#FFD6E4", cf:true, vg:false },
  { id:"r15", cat:"serum", name:"Crystal Retinal 10", brand:"Medik8", tier:3, ings:["retinol"], goal:"aldring", for:["normal","kombi","fet"], hue:"#FFD6E4", cf:true, vg:false },
  { id:"r16", cat:"serum", name:"A-Passioni Retinol Cream", brand:"Drunk Elephant", tier:3, ings:["retinol"], goal:"aldring", for:["normal","kombi","torr"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"r17", cat:"serum", name:"Retinol24 Night Serum", brand:"Olay", tier:2, ings:["retinol","niacinamid"], goal:"aldring", for:["normal","kombi","torr","fet"], hue:"#FFD6E4", cf:false, vg:false },
  { id:"r18", cat:"serum", name:"Bakuchiol + Niacinamide Serum", brand:"Beauty of Joseon", tier:1, ings:["bakuchiol","niacinamid"], goal:"aldring", for:["sens","normal","kombi","torr"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"r19", cat:"serum", name:"Phyto-A+ Bakuchiol Retinol Alternative", brand:"Purito", tier:1, ings:["bakuchiol","centella"], goal:"aldring", for:["sens","torr","normal","kombi"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"r20", cat:"serum", name:"Bakuchiol Boosting Serum", brand:"Paula's Choice", tier:3, ings:["bakuchiol"], goal:"aldring", for:["sens","normal","kombi","torr"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"r21", cat:"serum", name:"Azelaic Acid Suspension 10%", brand:"The Ordinary", tier:1, ings:["azelainsyre"], goal:"aldring", for:["sens","normal","kombi","fet"], hue:"#FFE5CC", cf:true, vg:true },
  { id:"r22", cat:"serum", name:"Facial Redness Relief Azelaic Acid", brand:"Paula's Choice", tier:3, ings:["azelainsyre","salisylsyre"], goal:"ro", for:["sens","normal","kombi"], hue:"#FFE5CC", cf:true, vg:true },
  /* ── POPULÆRE K-BEAUTY & VIRALE (med reelt belegg) ── */
  { id:"k30", cat:"serum", name:"Advanced Snail 96 Mucin Power Essence", brand:"COSRX", tier:1, ings:["mucin","niacinamid"], goal:"glow", for:["torr","normal","kombi","sens"], hue:"#EAE2FF", cf:true, vg:false },
  { id:"k31", cat:"toner", name:"Heartleaf 77 Soothing Toner", brand:"Anua", tier:1, ings:["centella"], goal:"ro", for:["sens","fet","kombi","normal"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"k32", cat:"serum", name:"Glow Serum Propolis + Niacinamide", brand:"Beauty of Joseon", tier:1, ings:["niacinamid"], goal:"glow", for:["torr","normal","kombi"], hue:"#EAE2FF", cf:true, vg:false },
  { id:"k33", cat:"serum", name:"Green Tea Hyaluronic Serum", brand:"Isntree", tier:1, ings:["hyaluron","gronn-te"], goal:"ro", for:["sens","torr","normal","kombi","fet"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"k34", cat:"toner", name:"Green Tea 80 Hydrating Toner", brand:"Isntree", tier:1, ings:["gronn-te","hyaluron"], goal:"ro", for:["sens","torr","normal","kombi"], hue:"#E2F3D5", cf:true, vg:true },
  { id:"k35", cat:"serum", name:"Relief Sun Rice + Probiotics", brand:"Purito", tier:1, ings:["niacinamid"], goal:"glow", for:["sens","torr","normal","kombi"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"k36", cat:"krem", name:"Dynasty Cream", brand:"Beauty of Joseon", tier:1, ings:["niacinamid","ceramider"], goal:"aldring", for:["torr","normal","kombi"], hue:"#D6E9FF", cf:true, vg:false },
  { id:"k37", cat:"krem", name:"Madagascar Centella Cream", brand:"Skin1004", tier:1, ings:["centella","hyaluron"], goal:"ro", for:["sens","torr","normal","kombi"], hue:"#D6E9FF", cf:true, vg:true },
  { id:"k38", cat:"serum", name:"Centella Ampoule", brand:"Skin1004", tier:1, ings:["centella"], goal:"ro", for:["sens","fet","kombi","normal"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"k39", cat:"toner", name:"Ginseng Essence Water", brand:"Beauty of Joseon", tier:1, ings:["niacinamid"], goal:"glow", for:["torr","normal","kombi"], hue:"#E2F3D5", cf:true, vg:false },
  { id:"k40", cat:"rens", name:"Salicylic Acid Daily Gentle Cleanser", brand:"COSRX", tier:1, ings:["salisylsyre"], for:["fet","kombi","normal"], hue:"#D9F2E6", cf:true, vg:true },
  { id:"k41", cat:"serum", name:"Rice Toner (glow, viral)", brand:"I'm From", tier:2, ings:["niacinamid"], goal:"glow", for:["torr","normal","kombi","sens"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"k42", cat:"maske", name:"Dead Sea Mud Mask", brand:"Innisfree", tier:1, ings:["gronn-te"], goal:"kviser", for:["fet","kombi"], hue:"#EAD9C7", cf:true, vg:true },
  { id:"k43", cat:"serum", name:"PDRN Pink Peptide Serum", brand:"Medicube", tier:2, ings:["pdrn","peptider"], goal:"aldring", for:["torr","normal","kombi","sens"], hue:"#FFD6E4", cf:true, vg:false },
  { id:"k44", cat:"serum", name:"Salmon DNA PDRN Ampoule", brand:"VT Cosmetics", tier:2, ings:["pdrn","niacinamid"], goal:"glow", for:["torr","normal","kombi"], hue:"#FFD6E4", cf:true, vg:false },
  { id:"k45", cat:"serum", name:"Multi-Peptide + HA Serum", brand:"The Ordinary", tier:1, ings:["peptider","hyaluron"], goal:"aldring", for:["torr","normal","kombi","fet"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"k46", cat:"serum", name:"Peptide Bond Repair Serum", brand:"The Inkey List", tier:1, ings:["peptider"], goal:"aldring", for:["torr","normal","kombi"], hue:"#EAE2FF", cf:true, vg:true },

  // ===== APOTEK / PHARMACY =====
  { id:"ph1", cat:"rens", name:"Toleriane Caring Wash", brand:"La Roche-Posay", tier:2, ings:["niacinamid"], for:["sens","torr","normal"], hue:"#EAF2FF", cf:false, tester:true, vg:true },
  { id:"ph2", cat:"krem", name:"Cicaplast Baume B5+", brand:"La Roche-Posay", tier:2, ings:["panthenol","centella"], goal:"ro", for:["sens","torr","normal","kombi"], hue:"#EAF2FF", cf:false, tester:true, vg:true },
  { id:"ph3", cat:"serum", name:"Mela B3 Serum", brand:"La Roche-Posay", tier:3, ings:["niacinamid"], goal:"glow", for:["normal","kombi","fet","torr"], hue:"#FFE6D6", cf:false, tester:true, vg:true },
  { id:"ph4", cat:"spf", name:"Anthelios UVMune 400 SPF50+", brand:"La Roche-Posay", tier:3, ings:[], for:["sens","torr","normal","kombi","fet"], hue:"#FFF3C4", cf:false, tester:true, vg:true },
  { id:"ph5", cat:"rens", name:"Tolerance Extremely Gentle Cleanser", brand:"Avène", tier:2, ings:[], for:["sens","torr"], hue:"#EAF7F2", cf:false, tester:true, vg:false },
  { id:"ph6", cat:"krem", name:"Tolerance Control Soothing Cream", brand:"Avène", tier:2, ings:["skvalan"], goal:"ro", for:["sens","torr"], hue:"#EAF7F2", cf:false, tester:true, vg:false },
  { id:"ph7", cat:"krem", name:"Cicalfate+ Restorative Cream", brand:"Avène", tier:2, ings:["sink"], goal:"ro", for:["sens","torr","normal"], hue:"#EAF7F2", cf:false, tester:true, vg:false },
  { id:"ph8", cat:"rens", name:"Hydrating Facial Cleanser", brand:"CeraVe", tier:1, ings:["ceramider","hyaluron"], for:["torr","normal","sens"], hue:"#EAF4FF", cf:false, tester:true, vg:false },
  { id:"ph9", cat:"rens", name:"Foaming Facial Cleanser", brand:"CeraVe", tier:1, ings:["niacinamid","ceramider"], for:["fet","kombi","normal"], hue:"#EAF4FF", cf:false, tester:true, vg:false },
  { id:"ph10", cat:"krem", name:"Moisturising Cream", brand:"CeraVe", tier:1, ings:["ceramider","hyaluron"], for:["torr","normal","sens"], hue:"#EAF4FF", cf:false, tester:true, vg:false },
  { id:"ph11", cat:"serum", name:"Resurfacing Retinol Serum", brand:"CeraVe", tier:2, ings:["retinol","ceramider"], goal:"kviser", for:["normal","kombi","fet"], hue:"#F3E8D6", cf:false, tester:true, vg:false },
  { id:"ph12", cat:"rens", name:"Sensibio H2O Micellar Water", brand:"Bioderma", tier:2, ings:[], for:["sens","torr","normal","kombi"], hue:"#EAF2FF", cf:false, tester:true, vg:true },
  { id:"ph13", cat:"krem", name:"Hydrabio Gel-Cream", brand:"Bioderma", tier:2, ings:["hyaluron"], for:["normal","kombi","fet"], hue:"#EAF2FF", cf:false, tester:true, vg:true },
  { id:"ph14", cat:"krem", name:"Ultra Sensitive Soothing Cream", brand:"Eucerin", tier:2, ings:["skvalan"], goal:"ro", for:["sens","torr"], hue:"#EFF4F8", cf:false, tester:true, vg:false },
  { id:"ph15", cat:"serum", name:"Hyaluron-Filler Vitamin C Booster", brand:"Eucerin", tier:3, ings:["vitamin-c","hyaluron"], goal:"glow", for:["normal","kombi","torr"], hue:"#FFE9C9", cf:false, tester:true, vg:false },

  // ===== K-BEAUTY =====
  { id:"kb1", cat:"serum", name:"Glow Serum: Propolis + Niacinamide", brand:"Beauty of Joseon", tier:1, ings:["niacinamid","gronn-te"], goal:"glow", for:["normal","kombi","torr","sens"], hue:"#FFEFB8", cf:true, vg:false },
  { id:"kb2", cat:"spf", name:"Relief Sun: Rice + Probiotics SPF50+", brand:"Beauty of Joseon", tier:1, ings:[], for:["normal","kombi","torr","sens"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"kb3", cat:"serum", name:"Revive Serum: Ginseng + Snail Mucin", brand:"Beauty of Joseon", tier:2, ings:["mucin","peptider"], goal:"aldring", for:["torr","normal","kombi"], hue:"#F0E4D0", cf:true, vg:false },
  { id:"kb4", cat:"rens", name:"Green Tea Cleansing Oil", brand:"Beauty of Joseon", tier:1, ings:["gronn-te"], for:["normal","kombi","fet","torr"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"kb5", cat:"toner", name:"Heartleaf 77% Soothing Toner", brand:"Anua", tier:1, ings:["centella"], goal:"ro", for:["sens","fet","kombi","normal"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"kb6", cat:"rens", name:"Heartleaf Pore Control Cleansing Oil", brand:"Anua", tier:1, ings:["centella"], for:["fet","kombi","normal"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"kb7", cat:"serum", name:"Niacinamide 10% + TXA 4%", brand:"Anua", tier:1, ings:["niacinamid"], goal:"glow", for:["normal","kombi","fet"], hue:"#FFE6D6", cf:true, vg:true },
  { id:"kb8", cat:"serum", name:"Centella Ampoule", brand:"SKIN1004", tier:1, ings:["centella"], goal:"ro", for:["sens","normal","kombi","fet"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"kb9", cat:"spf", name:"Centella Air-Fit Sun SPF50+", brand:"SKIN1004", tier:1, ings:["centella"], for:["sens","normal","kombi","fet","torr"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"kb10", cat:"toner", name:"Birch Juice Moisturizing Toner", brand:"Round Lab", tier:1, ings:["hyaluron"], for:["torr","normal","sens"], hue:"#EAF4FF", cf:true, vg:true },
  { id:"kb11", cat:"spf", name:"Birch Juice Moisturizing Sun SPF50+", brand:"Round Lab", tier:1, ings:[], for:["normal","kombi","torr","sens"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"kb12", cat:"toner", name:"Dokdo Toner", brand:"Round Lab", tier:1, ings:["panthenol"], for:["normal","kombi","fet"], hue:"#EAF4FF", cf:true, vg:true },
  { id:"kb13", cat:"serum", name:"Hyaluronic Acid Water Essence", brand:"Isntree", tier:1, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#EAF4FF", cf:true, vg:true },
  { id:"kb14", cat:"toner", name:"Green Tea Fresh Toner", brand:"Isntree", tier:1, ings:["gronn-te"], for:["fet","kombi","normal"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"kb15", cat:"serum", name:"Dive-In Low Molecular Hyaluronic Acid", brand:"Torriden", tier:1, ings:["hyaluron"], for:["torr","normal","kombi","sens","fet"], hue:"#EAF4FF", cf:true, vg:true },
  { id:"kb16", cat:"krem", name:"Dive-In Soothing Cream", brand:"Torriden", tier:1, ings:["hyaluron","centella"], goal:"ro", for:["sens","normal","kombi","torr"], hue:"#EAF4FF", cf:true, vg:true },
  { id:"kb17", cat:"maske", name:"Madagascar Centella Ampoule Mask", brand:"SKIN1004", tier:1, ings:["centella"], goal:"ro", for:["sens","normal","torr"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"kb18", cat:"serum", name:"Snail 96 Mucin Power Essence", brand:"COSRX", tier:1, ings:["mucin"], goal:"glow", for:["torr","normal","kombi","sens"], hue:"#F0E4D0", cf:true, vg:false },

  // ===== SALONG-STANDARD / PROFESSIONAL =====
  { id:"sa1", cat:"serum", name:"C-Tetra Vitamin C Serum", brand:"Medik8", tier:3, ings:["vitamin-c"], goal:"glow", for:["normal","kombi","torr"], hue:"#FFE9C9", cf:true, vg:true },
  { id:"sa2", cat:"serum", name:"Crystal Retinal 3", brand:"Medik8", tier:4, ings:["retinol"], goal:"aldring", for:["normal","kombi","torr"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"sa3", cat:"serum", name:"Liquid Peptides Advanced MP", brand:"Medik8", tier:4, ings:["peptider"], goal:"aldring", for:["normal","kombi","torr","sens"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"sa4", cat:"rens", name:"Special Cleansing Gel", brand:"Dermalogica", tier:3, ings:[], for:["normal","kombi","fet"], hue:"#EFF4F8", cf:true, vg:true },
  { id:"sa5", cat:"serum", name:"Age Bright Clearing Serum", brand:"Dermalogica", tier:4, ings:["salisylsyre","niacinamid"], goal:"kviser", for:["fet","kombi"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"sa6", cat:"krem", name:"Skin Smoothing Cream", brand:"Dermalogica", tier:3, ings:["hyaluron","ceramider"], for:["normal","kombi","torr"], hue:"#EFF4F8", cf:true, vg:true },
  { id:"sa7", cat:"serum", name:"Youth Serum", brand:"iS Clinical", tier:4, ings:["peptider","centella"], goal:"aldring", for:["normal","kombi","torr","sens"], hue:"#EAE2FF", cf:true, vg:false },
  { id:"sa8", cat:"serum", name:"Pro-Heal Serum Advance+", brand:"iS Clinical", tier:4, ings:["vitamin-c","centella"], goal:"ro", for:["sens","normal","kombi"], hue:"#FFE9C9", cf:true, vg:false },
  { id:"sa9", cat:"serum", name:"Vitamin A, C & E Intense", brand:"Environ", tier:4, ings:["retinol","vitamin-c"], goal:"aldring", for:["normal","kombi","torr"], hue:"#F3E8D6", cf:false, vg:false },
  { id:"sa10", cat:"serum", name:"Skin Perfecting Serum 2% BHA", brand:"Paula's Choice", tier:3, ings:["salisylsyre"], goal:"kviser", for:["fet","kombi","normal"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"sa11", cat:"serum", name:"10% Niacinamide Booster", brand:"Paula's Choice", tier:3, ings:["niacinamid"], goal:"glow", for:["fet","kombi","normal"], hue:"#FFE6D6", cf:true, vg:true },
  { id:"sa12", cat:"krem", name:"Omega+ Complex Moisturizer", brand:"Paula's Choice", tier:3, ings:["ceramider"], for:["torr","normal","sens"], hue:"#EFF4F8", cf:true, vg:true },

  // ===== UTVIDET SORTIMENT: pharmacy, K-beauty, salong, mass =====
  { id:"x1", cat:"rens", name:"Low pH Good Morning Gel Cleanser", brand:"COSRX", tier:1, ings:["gronn-te"], for:["fet","kombi","normal"], hue:"#EAF2FF", cf:true, vg:true },
  { id:"x2", cat:"rens", name:"Salicylic Acid Daily Gentle Cleanser", brand:"COSRX", tier:1, ings:["salisylsyre"], goal:"kviser", for:["fet","kombi","normal"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"x3", cat:"rens", name:"Rice Water Bright Cleansing Foam", brand:"The Face Shop", tier:1, ings:[], for:["normal","kombi","torr"], hue:"#EAF7F2", cf:true, vg:false },
  { id:"x4", cat:"rens", name:"Green Tea Foam Cleanser", brand:"Innisfree", tier:1, ings:["gronn-te"], for:["fet","kombi","normal"], hue:"#FDEEE8", cf:true, vg:true },
  { id:"x5", cat:"rens", name:"Ultra Facial Cleanser", brand:"Kiehl's", tier:3, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#EAF2FF", cf:false, vg:false },
  { id:"x6", cat:"rens", name:"Rare Earth Deep Pore Cleanser", brand:"Kiehl's", tier:3, ings:[], for:["fet","kombi","normal"], hue:"#E6F2D9", cf:false, vg:false },
  { id:"x7", cat:"rens", name:"Gentle Skin Cleanser", brand:"Cetaphil", tier:1, ings:[], for:["sens","torr","normal"], hue:"#EAF7F2", cf:false, vg:true },
  { id:"x8", cat:"rens", name:"Oil-Free Acne Wash", brand:"Neutrogena", tier:1, ings:["salisylsyre"], goal:"kviser", for:["fet","kombi","normal"], hue:"#FDEEE8", cf:false, vg:true },
  { id:"x9", cat:"rens", name:"Hydro Boost Cleansing Gel", brand:"Neutrogena", tier:1, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#EAF2FF", cf:false, vg:true },
  { id:"x10", cat:"rens", name:"Effaclar Gel Cleanser", brand:"La Roche-Posay", tier:2, ings:[], for:["fet","kombi","normal"], hue:"#E6F2D9", cf:false, tester:true, vg:true },
  { id:"x11", cat:"rens", name:"Purifying Foaming Wash", brand:"Eucerin", tier:2, ings:[], for:["fet","kombi","normal"], hue:"#EAF7F2", cf:false, tester:true, vg:false },
  { id:"x12", cat:"rens", name:"Antioxidant Cleansing Balm", brand:"Farmacy", tier:3, ings:["gronn-te"], for:["torr","normal","kombi","sens"], hue:"#FDEEE8", cf:true, vg:true },
  { id:"x13", cat:"rens", name:"Ginger Milk Cleanser", brand:"Beauty of Joseon", tier:1, ings:[], for:["torr","normal","sens"], hue:"#EAF2FF", cf:true, vg:false },
  { id:"x14", cat:"rens", name:"Clarifying Cleanser", brand:"Paula's Choice", tier:3, ings:["salisylsyre"], goal:"kviser", for:["fet","kombi","normal"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"x15", cat:"rens", name:"Soy Face Cleanser", brand:"Fresh", tier:3, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#EAF7F2", cf:false, vg:false },
  { id:"x16", cat:"rens", name:"Cleansing Balm", brand:"Clinique Take The Day Off", tier:3, ings:[], for:["torr","normal","kombi","sens"], hue:"#FDEEE8", cf:false, vg:false },
  { id:"x17", cat:"rens", name:"Squalane Cleanser", brand:"The Ordinary", tier:1, ings:["skvalan"], for:["torr","normal","kombi","sens"], hue:"#EAF2FF", cf:true, vg:true },
  { id:"x18", cat:"rens", name:"Pure Cleansing Oil", brand:"DHC", tier:2, ings:[], for:["torr","normal","kombi","sens"], hue:"#E6F2D9", cf:false, vg:false },
  { id:"x19", cat:"rens", name:"Watermelon Glow PHA Cleanser", brand:"Glow Recipe", tier:3, ings:["pha"], for:["torr","normal","kombi","sens"], hue:"#EAF7F2", cf:true, vg:true },
  { id:"x20", cat:"rens", name:"Deep Cleansing Foam", brand:"Etude House", tier:1, ings:[], for:["fet","kombi","normal"], hue:"#FDEEE8", cf:true, vg:false },
  { id:"x21", cat:"rens", name:"AHA/BHA Clarifying Treatment Toner Cleanser", brand:"Some By Mi", tier:1, ings:["glykolsyre","salisylsyre"], goal:"kviser", for:["fet","kombi","normal"], hue:"#EAF2FF", cf:true, vg:true },
  { id:"x22", cat:"rens", name:"Heartleaf Quercetinol Cleansing Foam", brand:"Anua", tier:1, ings:["centella"], for:["torr","normal","kombi","sens"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"x23", cat:"rens", name:"Cica Cleanser", brand:"Dr.Jart+", tier:3, ings:["centella"], goal:"ro", for:["sens","normal","kombi"], hue:"#EAF7F2", cf:false, vg:false },
  { id:"x24", cat:"rens", name:"Vitamin C Brightening Cleanser", brand:"Mad Hippie", tier:2, ings:["vitamin-c"], goal:"glow", for:["normal","kombi"], hue:"#FDEEE8", cf:true, vg:true },
  { id:"x25", cat:"rens", name:"Micellar Cleansing Water", brand:"Garnier", tier:1, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#EAF2FF", cf:false, vg:true },
  { id:"x25b", cat:"rens", name:"Micellar Water Sensitive", brand:"Nivea", tier:1, ings:[], for:["sens","torr","normal"], hue:"#EAF2FF", cf:false, vg:true },
  { id:"x25c", cat:"rens", name:"Rose Micellar Cleansing Water", brand:"Garnier", tier:1, ings:[], for:["torr","normal","sens"], hue:"#EAF2FF", cf:false, vg:true },
  { id:"x25d", cat:"rens", name:"Micellar Gel Wash", brand:"CeraVe", tier:2, ings:["ceramider","niacinamid"], for:["normal","kombi","sens"], hue:"#EAF4FF", cf:false, tester:true, vg:false },
  { id:"x26", cat:"rens", name:"Blue Cocoon Cleanser", brand:"May Lindstrom", tier:4, ings:[], for:["sens","torr"], hue:"#E6F2D9", cf:true, vg:false },
  { id:"x27", cat:"rens", name:"Broad Spectrum Sunscreen Removing Balm", brand:"Then I Met You", tier:3, ings:[], for:["torr","normal","kombi","sens"], hue:"#EAF7F2", cf:true, vg:false },
  { id:"x28", cat:"rens", name:"Gentle Hydrating Cleanser", brand:"Krave Beauty", tier:2, ings:[], for:["torr","normal","sens"], hue:"#FDEEE8", cf:true, vg:true },
  { id:"x29", cat:"rens", name:"Matcha Hemp Hydrating Cleanser", brand:"Krave Beauty", tier:2, ings:["gronn-te"], for:["torr","normal","kombi","sens"], hue:"#EAF2FF", cf:true, vg:true },
  { id:"x30", cat:"toner", name:"AHA/BHA Clarifying Treatment Toner", brand:"COSRX", tier:1, ings:["glykolsyre","salisylsyre"], goal:"kviser", for:["fet","kombi","normal"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"x31", cat:"toner", name:"Galactomyces 95 Tone Balancing Essence", brand:"COSRX", tier:1, ings:["niacinamid"], goal:"glow", for:["torr","normal","kombi","fet","sens"], hue:"#EAF4FF", cf:true, vg:false },
  { id:"x32", cat:"toner", name:"Ginseng Essence Water", brand:"Beauty of Joseon", tier:1, ings:["peptider"], for:["torr","normal","sens"], hue:"#FFF6E5", cf:true, vg:false },
  { id:"x33", cat:"toner", name:"PHA Toner", brand:"Isntree", tier:1, ings:["pha"], for:["torr","normal","kombi","fet","sens"], hue:"#E7F0FA", cf:true, vg:true },
  { id:"x34", cat:"toner", name:"Bija Cica Balancing Toner", brand:"Isntree", tier:1, ings:["centella"], goal:"ro", for:["fet","kombi","normal"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"x35", cat:"toner", name:"Cleansing Water Radiance Toner", brand:"Fresh Rose", tier:3, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#EAF4FF", cf:false, vg:false },
  { id:"x36", cat:"toner", name:"Facial Treatment Essence", brand:"SK-II", tier:4, ings:[], goal:"glow", for:["torr","normal","kombi","fet","sens"], hue:"#FFF6E5", cf:false, vg:false },
  { id:"x37", cat:"toner", name:"The Treatment Lotion", brand:"La Mer", tier:4, ings:["skvalan"], for:["torr","normal","sens"], hue:"#E7F0FA", cf:false, vg:false },
  { id:"x38", cat:"toner", name:"Ultra Facial Toner", brand:"Kiehl's", tier:3, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#E6F2D9", cf:false, vg:false },
  { id:"x39", cat:"toner", name:"Watermelon Glow PHA+BHA Toner", brand:"Glow Recipe", tier:3, ings:["pha","salisylsyre"], for:["fet","kombi","normal"], hue:"#EAF4FF", cf:true, vg:true },
  { id:"x40", cat:"toner", name:"Daily Reviving Concentrate Toner", brand:"Kiehl's", tier:3, ings:["gronn-te"], for:["torr","normal","kombi","fet","sens"], hue:"#FFF6E5", cf:false, vg:false },
  { id:"x41", cat:"toner", name:"Centella Green Level Toner", brand:"Purito", tier:1, ings:["centella"], goal:"ro", for:["sens","normal","kombi"], hue:"#E7F0FA", cf:true, vg:true },
  { id:"x42", cat:"toner", name:"Yuja Niacin Brightening Toner", brand:"Some By Mi", tier:1, ings:["niacinamid"], goal:"glow", for:["normal","kombi"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"x43", cat:"toner", name:"Snail Bee Essence Toner", brand:"Benton", tier:1, ings:["mucin","niacinamid"], for:["torr","normal","kombi","sens"], hue:"#EAF4FF", cf:true, vg:false },
  { id:"x44", cat:"toner", name:"Aloe Soothing Toner", brand:"Nature Republic", tier:1, ings:["centella"], goal:"ro", for:["sens","normal"], hue:"#FFF6E5", cf:true, vg:true },
  { id:"x45", cat:"toner", name:"Vitamin B5 Hydrating Toner", brand:"Naturium", tier:2, ings:["panthenol","hyaluron"], for:["torr","normal","sens"], hue:"#E7F0FA", cf:true, vg:true },
  { id:"x46", cat:"toner", name:"Rice Toner", brand:"I'm From", tier:2, ings:[], for:["torr","normal","sens"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"x47", cat:"toner", name:"Mugwort Essence", brand:"I'm From", tier:2, ings:["centella"], goal:"ro", for:["sens","normal","kombi"], hue:"#EAF4FF", cf:true, vg:true },
  { id:"x48", cat:"toner", name:"Prebiotic Balancing Mist Toner", brand:"The Inkey List", tier:1, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#FFF6E5", cf:true, vg:true },
  { id:"x49", cat:"toner", name:"Glycolic Acid 7% Toning Solution", brand:"The Ordinary", tier:1, ings:["glykolsyre"], goal:"glow", for:["fet","kombi","normal"], hue:"#E7F0FA", cf:true, vg:true },
  { id:"x50", cat:"toner", name:"Hydrating Toner", brand:"La Roche-Posay", tier:2, ings:["hyaluron"], for:["torr","normal","sens"], hue:"#E6F2D9", cf:false, tester:true, vg:true },
  { id:"x51", cat:"toner", name:"Soothing Toner Cica", brand:"SKIN1004", tier:1, ings:["centella"], goal:"ro", for:["sens","normal","kombi"], hue:"#EAF4FF", cf:true, vg:true },
  { id:"x52", cat:"toner", name:"Green Plum Refreshing Toner AHA", brand:"Isntree", tier:1, ings:["glykolsyre"], for:["fet","kombi","normal"], hue:"#FFF6E5", cf:true, vg:true },
  { id:"x53", cat:"krem", name:"Ultra Facial Cream", brand:"Kiehl's", tier:3, ings:["skvalan"], for:["torr","normal","sens"], hue:"#E1E8FF", cf:false, vg:false },
  { id:"x54", cat:"krem", name:"Water Bank Blue Hyaluronic Cream", brand:"Laneige", tier:3, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#FDE7CF", cf:false, vg:false },
  { id:"x55", cat:"krem", name:"Cica Sleeping Mask", brand:"Laneige", tier:3, ings:["centella"], goal:"ro", for:["sens","normal"], hue:"#EAF7F2", cf:false, vg:false },
  { id:"x56", cat:"krem", name:"Water Sleeping Mask", brand:"Laneige", tier:3, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#EFF4F8", cf:false, vg:false },
  { id:"x57", cat:"krem", name:"Dynamic Cord Extra Firm Cream", brand:"Sulwhasoo", tier:4, ings:["peptider"], goal:"aldring", for:["torr","normal","sens"], hue:"#EAF4FF", cf:false, vg:false },
  { id:"x58", cat:"krem", name:"Time Revolution Night Repair Cream", brand:"Missha", tier:2, ings:["peptider"], goal:"aldring", for:["torr","normal","sens"], hue:"#E1E8FF", cf:true, vg:false },
  { id:"x59", cat:"krem", name:"Cicaplast Baume Rich", brand:"La Roche-Posay", tier:2, ings:["panthenol","centella"], goal:"ro", for:["sens","torr"], hue:"#FDE7CF", cf:false, tester:true, vg:true },
  { id:"x60", cat:"krem", name:"Toleriane Sensitive Fluid", brand:"La Roche-Posay", tier:2, ings:["ceramider"], for:["sens","normal","kombi"], hue:"#EAF7F2", cf:false, tester:true, vg:true },
  { id:"x61", cat:"krem", name:"Lipikar Balm AP+M", brand:"La Roche-Posay", tier:2, ings:["ceramider","niacinamid"], for:["torr","sens"], hue:"#EFF4F8", cf:false, tester:true, vg:true },
  { id:"x62", cat:"krem", name:"Skin Barrier Repair Cream", brand:"Dr.Jart+ Cicapair", tier:3, ings:["centella"], goal:"ro", for:["sens","torr"], hue:"#EAF4FF", cf:false, vg:false },
  { id:"x63", cat:"krem", name:"Ceramidin Cream", brand:"Dr.Jart+", tier:3, ings:["ceramider"], for:["torr","normal","sens"], hue:"#E1E8FF", cf:false, vg:false },
  { id:"x64", cat:"krem", name:"Advanced Night Repair Cream", brand:"Estée Lauder", tier:4, ings:["peptider"], goal:"aldring", for:["torr","normal","sens"], hue:"#FDE7CF", cf:false, vg:false },
  { id:"x65", cat:"krem", name:"Protini Polypeptide Cream", brand:"Drunk Elephant", tier:4, ings:["peptider"], goal:"aldring", for:["torr","normal","kombi","sens"], hue:"#EAF7F2", cf:true, vg:true },
  { id:"x66", cat:"krem", name:"Lala Retro Whipped Cream", brand:"Drunk Elephant", tier:4, ings:["ceramider"], for:["torr","normal","sens"], hue:"#EFF4F8", cf:true, vg:true },
  { id:"x67", cat:"krem", name:"Natural Moisturizing Factors + HA", brand:"The Ordinary", tier:1, ings:["hyaluron","ceramider"], for:["torr","normal","kombi","sens"], hue:"#EAF4FF", cf:true, vg:true },
  { id:"x68", cat:"krem", name:"Weightless Oil-Free Moisturizer", brand:"Neutrogena", tier:1, ings:["hyaluron"], for:["fet","kombi","normal"], hue:"#E1E8FF", cf:false, vg:true },
  { id:"x69", cat:"krem", name:"Daily Moisturizing Lotion", brand:"CeraVe", tier:1, ings:["ceramider","hyaluron"], for:["torr","normal","sens"], hue:"#FDE7CF", cf:false, tester:true, vg:false },
  { id:"x70", cat:"krem", name:"PM Facial Moisturizing Lotion", brand:"CeraVe", tier:1, ings:["ceramider","niacinamid"], for:["torr","normal","kombi","fet","sens"], hue:"#EAF7F2", cf:false, tester:true, vg:false },
  { id:"x71", cat:"krem", name:"Gel-Cream Oil-Free", brand:"Belif Aqua Bomb", tier:3, ings:["gronn-te"], for:["fet","kombi","normal"], hue:"#EFF4F8", cf:false, vg:false },
  { id:"x72", cat:"krem", name:"The True Cream Moisturizing Bomb", brand:"Belif", tier:3, ings:["ceramider"], for:["torr","normal","sens"], hue:"#EAF4FF", cf:false, vg:false },
  { id:"x73", cat:"krem", name:"Cloud Cream", brand:"Kiehl's", tier:3, ings:[], for:["torr","normal","sens"], hue:"#E1E8FF", cf:false, vg:false },
  { id:"x74", cat:"krem", name:"Watermelon Glow Sleeping Mask", brand:"Glow Recipe", tier:3, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#FDE7CF", cf:true, vg:true },
  { id:"x75", cat:"krem", name:"Dewy Skin Cream", brand:"Tatcha", tier:4, ings:[], for:["torr","normal","sens"], hue:"#EAF7F2", cf:false, vg:false },
  { id:"x76", cat:"krem", name:"The Water Cream", brand:"Tatcha", tier:4, ings:["gronn-te"], for:["fet","kombi","normal"], hue:"#EFF4F8", cf:false, vg:false },
  { id:"x77", cat:"krem", name:"Nutritious Moisturizer", brand:"Weleda Skin Food", tier:2, ings:[], for:["torr","sens"], hue:"#EAF4FF", cf:false, vg:true },
  { id:"x78", cat:"krem", name:"Redness Relief Moisturizer", brand:"Dr.Jart+", tier:3, ings:["centella"], goal:"ro", for:["sens"], hue:"#E1E8FF", cf:false, vg:false },
  { id:"x79", cat:"krem", name:"Barrier Restore Cream", brand:"Krave Beauty", tier:2, ings:["ceramider"], for:["torr","normal","sens"], hue:"#FDE7CF", cf:true, vg:true },
  { id:"x80", cat:"krem", name:"Vitamin B5 Gel Moisturizer", brand:"Naturium", tier:2, ings:["panthenol"], for:["fet","kombi","normal"], hue:"#EAF7F2", cf:true, vg:true },
  { id:"x81", cat:"krem", name:"Peptide + HA Recovery Cream", brand:"The Inkey List", tier:1, ings:["peptider","hyaluron"], goal:"aldring", for:["torr","normal","kombi","sens"], hue:"#EFF4F8", cf:true, vg:true },
  { id:"x82", cat:"krem", name:"Panthenol Barrier Cream", brand:"Torriden", tier:1, ings:["panthenol"], goal:"ro", for:["sens","torr","normal"], hue:"#EAF4FF", cf:true, vg:true },
  { id:"x83", cat:"krem", name:"Madagascar Centella Cream", brand:"SKIN1004", tier:1, ings:["centella"], goal:"ro", for:["sens","normal","kombi"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"x84", cat:"spf", name:"UV Clear SPF46", brand:"EltaMD", tier:4, ings:["niacinamid"], for:["sens","fet","kombi"], hue:"#FFE59A", cf:false, tester:true, vg:false },
  { id:"x85", cat:"spf", name:"UV Daily SPF40", brand:"EltaMD", tier:4, ings:["hyaluron"], for:["torr","normal","sens"], hue:"#FFF3C4", cf:false, tester:true, vg:false },
  { id:"x86", cat:"spf", name:"Unseen Sunscreen SPF40", brand:"Supergoop!", tier:3, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#FFE59A", cf:true, vg:true },
  { id:"x87", cat:"spf", name:"Glowscreen SPF40", brand:"Supergoop!", tier:3, ings:["hyaluron"], goal:"glow", for:["torr","normal","sens"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"x88", cat:"spf", name:"Watery Sun Gel SPF50+", brand:"Biore UV Aqua Rich", tier:1, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#FFE59A", cf:false, vg:true },
  { id:"x89", cat:"spf", name:"Probiotics Sun Cream SPF50+", brand:"Purito", tier:1, ings:["centella"], for:["sens","normal","kombi"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"x90", cat:"spf", name:"Comfort Sun Stick SPF50+", brand:"SKIN1004", tier:1, ings:[], for:["torr","normal","kombi","sens"], hue:"#FFE59A", cf:true, vg:true },
  { id:"x91", cat:"spf", name:"Airyfit Daily Sun SPF50+", brand:"Isntree", tier:1, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"x92", cat:"spf", name:"Hyaluronic Watery Sun Gel SPF50+", brand:"Isntree", tier:1, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#FFE59A", cf:true, vg:true },
  { id:"x93", cat:"spf", name:"Vita Propolis Sun Serum SPF50+", brand:"Some By Mi", tier:1, ings:["gronn-te"], for:["normal","kombi"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"x94", cat:"spf", name:"Invisible UV Fluid SPF50+", brand:"Beauty of Joseon", tier:1, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#FFE59A", cf:true, vg:true },
  { id:"x95", cat:"spf", name:"Ultra Light Daily UV Defense SPF50", brand:"Kiehl's", tier:3, ings:[], for:["fet","kombi","normal"], hue:"#FFF3C4", cf:false, vg:false },
  { id:"x96", cat:"spf", name:"Anthelios Ultra Light Fluid SPF50+", brand:"La Roche-Posay", tier:3, ings:[], for:["fet","kombi","normal"], hue:"#FFE59A", cf:false, tester:true, vg:true },
  { id:"x97", cat:"spf", name:"Anthelios Hydrating Lotion SPF50", brand:"La Roche-Posay", tier:3, ings:["hyaluron"], for:["torr","normal","sens"], hue:"#FFF3C4", cf:false, tester:true, vg:true },
  { id:"x98", cat:"spf", name:"Photoderm Nude Touch SPF50+", brand:"Bioderma", tier:3, ings:[], for:["torr","normal","kombi","sens"], hue:"#FFE59A", cf:false, tester:true, vg:true },
  { id:"x99", cat:"spf", name:"Sun Fluid Anti-Age SPF50", brand:"Eucerin", tier:3, ings:[], goal:"aldring", for:["normal","torr"], hue:"#FFF3C4", cf:false, tester:true, vg:false },
  { id:"x100", cat:"spf", name:"Sun Oil-Control Gel SPF50+", brand:"Eucerin", tier:3, ings:[], for:["fet","kombi","normal"], hue:"#FFE59A", cf:false, tester:true, vg:false },
  { id:"x101", cat:"spf", name:"Clear Face Sunscreen SPF50", brand:"Neutrogena", tier:1, ings:[], for:["fet","kombi","normal"], hue:"#FFF3C4", cf:false, vg:true },
  { id:"x102", cat:"spf", name:"Mineral UV Filters SPF30", brand:"The Ordinary", tier:1, ings:[], for:["sens","normal"], hue:"#FFE59A", cf:true, vg:true },
  { id:"x103", cat:"spf", name:"Facial Sunscreen SPF46", brand:"Paula's Choice", tier:3, ings:["niacinamid"], for:["normal","kombi"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"x104", cat:"spf", name:"Milky Tone Up Sun SPF50+", brand:"Round Lab", tier:1, ings:[], for:["torr","normal","kombi","sens"], hue:"#FFE59A", cf:true, vg:true },
  { id:"x105", cat:"spf", name:"Cotton Soft Sun SPF50+", brand:"Numbuzin", tier:1, ings:[], for:["torr","normal","kombi","sens"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"x106", cat:"spf", name:"Water Full Sun Cream SPF50+", brand:"Torriden", tier:1, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#FFE59A", cf:true, vg:true },
  { id:"x107", cat:"spf", name:"Physical Eye UV Defense SPF50", brand:"Supergoop!", tier:3, ings:[], for:["sens"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"x108", cat:"spf", name:"Mineral Sunscreen SPF30", brand:"Beauty of Joseon", tier:1, ings:[], for:["sens","normal"], hue:"#FFE59A", cf:true, vg:true },
  { id:"x109", cat:"spf", name:"Sun Serum SPF50+", brand:"Numbuzin", tier:1, ings:["niacinamid"], for:["normal","kombi"], hue:"#FFF3C4", cf:true, vg:true },
  { id:"x110", cat:"spf", name:"Daily UV Protection Aqua Fresh SPF50+", brand:"Purito", tier:1, ings:[], for:["torr","normal","kombi","fet","sens"], hue:"#FFE59A", cf:true, vg:true },
  { id:"x111", cat:"olje", name:"Midnight Recovery Concentrate", brand:"Kiehl's", tier:3, ings:[], for:["torr","normal","sens"], hue:"#FFE9D6", cf:false, vg:false },
  { id:"x112", cat:"olje", name:"Virgin Marula Luxury Facial Oil", brand:"Drunk Elephant", tier:4, ings:[], for:["torr","normal","sens"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"x113", cat:"olje", name:"100% Plant-Derived Squalane", brand:"The Ordinary", tier:1, ings:["skvalan"], for:["torr","normal","kombi","fet","sens"], hue:"#FFE9D6", cf:true, vg:true },
  { id:"x114", cat:"olje", name:"Rosehip Seed Oil", brand:"The Ordinary", tier:1, ings:[], for:["torr","normal","sens"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"x115", cat:"olje", name:"Cleansing Oil Green Tea", brand:"Innisfree", tier:1, ings:["gronn-te"], for:["torr","normal","kombi","sens"], hue:"#FFE9D6", cf:true, vg:true },
  { id:"x116", cat:"olje", name:"Facial Oil No.9", brand:"Votary", tier:4, ings:[], for:["torr","normal","sens"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"x117", cat:"olje", name:"Luminous Dewy Skin Nourishing Oil", brand:"Tatcha", tier:4, ings:[], for:["torr","normal","sens"], hue:"#FFE9D6", cf:false, vg:false },
  { id:"x118", cat:"olje", name:"Marula Oil", brand:"Paula's Choice", tier:3, ings:[], for:["torr","normal","sens"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"x119", cat:"olje", name:"Ginseng Oil Serum", brand:"Sulwhasoo", tier:4, ings:["peptider"], goal:"aldring", for:["torr","normal","sens"], hue:"#FFE9D6", cf:false, vg:false },
  { id:"x120", cat:"olje", name:"Squalane + Vitamin C Rose Oil", brand:"Biossance", tier:3, ings:["skvalan","vitamin-c"], goal:"glow", for:["torr","normal","sens"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"x121", cat:"olje", name:"Squalane + Omega Repair Oil", brand:"Biossance", tier:3, ings:["skvalan"], for:["torr","normal","sens"], hue:"#FFE9D6", cf:true, vg:true },
  { id:"x122", cat:"olje", name:"Camellia Cleansing Oil", brand:"Tatcha", tier:4, ings:[], for:["torr","normal","kombi","sens"], hue:"#F3E8D6", cf:false, vg:false },
  { id:"x123", cat:"olje", name:"Prickly Pear Facial Oil", brand:"The Inkey List", tier:1, ings:[], for:["torr","normal","sens"], hue:"#FFE9D6", cf:true, vg:true },
  { id:"x124", cat:"olje", name:"Bakuchiol Retinol Oil", brand:"Herbivore", tier:4, ings:["bakuchiol"], goal:"aldring", for:["normal","sens"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"x125", cat:"maske", name:"Overnight Sleeping Mask Cica", brand:"Laneige", tier:3, ings:["centella"], goal:"ro", for:["sens","normal"], hue:"#E6F2D9", cf:false, vg:false },
  { id:"x126", cat:"maske", name:"Clay Mask Green Tea", brand:"Innisfree Super Volcanic", tier:1, ings:["gronn-te"], goal:"kviser", for:["fet","kombi","normal"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"x127", cat:"maske", name:"AHA 30% + BHA 2% Peeling Solution", brand:"The Ordinary", tier:1, ings:["glykolsyre","salisylsyre"], goal:"glow", for:["fet","kombi","normal"], hue:"#EAD9C7", cf:true, vg:true },
  { id:"x128", cat:"maske", name:"Watermelon Glow Sleeping Mask", brand:"Glow Recipe", tier:3, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"x129", cat:"maske", name:"Cicapair Tiger Grass Mask", brand:"Dr.Jart+", tier:3, ings:["centella"], goal:"ro", for:["sens"], hue:"#E1E8FF", cf:false, vg:false },
  { id:"x130", cat:"maske", name:"Aztec Secret Healing Clay", brand:"Aztec", tier:1, ings:[], goal:"kviser", for:["fet","kombi","normal"], hue:"#EAD9C7", cf:true, vg:true },
  { id:"x131", cat:"maske", name:"Rice Wash Sake Polish Mask", brand:"Tatcha", tier:4, ings:[], goal:"glow", for:["normal","torr"], hue:"#E6F2D9", cf:false, vg:false },
  { id:"x132", cat:"maske", name:"Blueberry Bounce Gentle Mask", brand:"Glow Recipe", tier:3, ings:[], for:["torr","normal","kombi","sens"], hue:"#E1E8FF", cf:true, vg:true },
  { id:"x133", cat:"maske", name:"Instant Detox Clay Mask", brand:"Caudalie", tier:3, ings:[], goal:"kviser", for:["fet","kombi","normal"], hue:"#EAD9C7", cf:false, vg:true },
  { id:"y1", cat:"serum", name:"Vitamin C Suspension 23%", brand:"The Ordinary", tier:1, ings:["vitamin-c"], goal:"glow", for:["normal","kombi","fet"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"y2", cat:"serum", name:"Alpha Arbutin 2% + HA", brand:"The Ordinary", tier:1, ings:["hyaluron"], goal:"glow", for:["torr","normal","kombi","fet","sens"], hue:"#FFE6D6", cf:true, vg:true },
  { id:"y3", cat:"serum", name:"Azelaic Acid Suspension 10%", brand:"The Ordinary", tier:1, ings:["azelainsyre"], goal:"kviser", for:["kombi","fet","sens"], hue:"#FFE9C9", cf:true, vg:true },
  { id:"y4", cat:"serum", name:"Retinol 0.5% in Squalane", brand:"The Ordinary", tier:1, ings:["retinol","skvalan"], goal:"aldring", for:["normal","kombi"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"y5", cat:"serum", name:"Granactive Retinoid 2% Emulsion", brand:"The Ordinary", tier:1, ings:["retinol"], goal:"aldring", for:["normal","sens"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"y6", cat:"serum", name:"Hyaluronic Acid 2% + B5", brand:"The Ordinary", tier:1, ings:["hyaluron","panthenol"], for:["torr","normal","kombi","fet","sens"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"y7", cat:"serum", name:"Caffeine Solution 5% + EGCG", brand:"The Ordinary", tier:1, ings:["gronn-te"], for:["torr","normal","kombi","fet","sens"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"y8", cat:"serum", name:"15% Vitamin C + EGF Serum", brand:"Naturium", tier:2, ings:["vitamin-c"], goal:"glow", for:["normal","kombi"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"y9", cat:"serum", name:"Niacinamide Serum 12% Plus Zinc", brand:"Naturium", tier:2, ings:["niacinamid","sink"], goal:"glow", for:["fet","kombi","normal"], hue:"#FFE6D6", cf:true, vg:true },
  { id:"y10", cat:"serum", name:"Multi-Peptide Serum", brand:"Naturium", tier:2, ings:["peptider"], goal:"aldring", for:["torr","normal","kombi","sens"], hue:"#FFE9C9", cf:true, vg:true },
  { id:"y11", cat:"serum", name:"Tranexamic Topical Acid 5%", brand:"Naturium", tier:2, ings:[], goal:"glow", for:["normal","kombi"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"y12", cat:"serum", name:"Vitamin C Serum", brand:"La Roche-Posay Pure", tier:3, ings:["vitamin-c"], goal:"glow", for:["normal","kombi"], hue:"#FFF2BD", cf:false, tester:true, vg:true },
  { id:"y13", cat:"serum", name:"Retinol B3 Serum", brand:"La Roche-Posay", tier:3, ings:["retinol","niacinamid"], goal:"aldring", for:["normal","kombi"], hue:"#E6F2D9", cf:false, tester:true, vg:true },
  { id:"y14", cat:"serum", name:"Hyalu B5 Serum", brand:"La Roche-Posay", tier:3, ings:["hyaluron","panthenol"], for:["torr","normal","sens"], hue:"#FFD6E4", cf:false, tester:true, vg:true },
  { id:"y15", cat:"serum", name:"Vitamin C E Ferulic", brand:"SkinCeuticals CE Ferulic", tier:4, ings:["vitamin-c"], goal:"glow", for:["normal","torr"], hue:"#EAE2FF", cf:false, vg:false },
  { id:"y16", cat:"serum", name:"Phloretin CF", brand:"SkinCeuticals", tier:4, ings:["vitamin-c"], goal:"glow", for:["normal","kombi","fet"], hue:"#FFE6D6", cf:false, vg:false },
  { id:"y17", cat:"serum", name:"Hyaluronic Acid Intensifier", brand:"SkinCeuticals", tier:4, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#FFE9C9", cf:false, vg:false },
  { id:"y18", cat:"serum", name:"Discoloration Defense", brand:"SkinCeuticals", tier:4, ings:["niacinamid"], goal:"glow", for:["normal","kombi"], hue:"#F3E8D6", cf:false, vg:false },
  { id:"y19", cat:"serum", name:"Advanced Snail 92 All In One Serum", brand:"COSRX", tier:1, ings:["mucin"], goal:"glow", for:["torr","normal","kombi","sens"], hue:"#FFF2BD", cf:true, vg:false },
  { id:"y20", cat:"serum", name:"The Vitamin C 23 Serum", brand:"COSRX", tier:1, ings:["vitamin-c"], goal:"glow", for:["normal","kombi"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"y21", cat:"serum", name:"Retinol 0.1 Cream Serum", brand:"COSRX", tier:1, ings:["retinol"], goal:"aldring", for:["normal","kombi"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"y22", cat:"serum", name:"Propolis Light Ampoule", brand:"COSRX", tier:1, ings:["gronn-te"], goal:"glow", for:["torr","normal","sens"], hue:"#EAE2FF", cf:true, vg:false },
  { id:"y23", cat:"serum", name:"Peptide Booster", brand:"COSRX The 6", tier:1, ings:["peptider"], goal:"aldring", for:["torr","normal","kombi","sens"], hue:"#FFE6D6", cf:true, vg:true },
  { id:"y24", cat:"serum", name:"Time Revolution Ampoule 5X", brand:"Missha", tier:2, ings:["niacinamid"], goal:"glow", for:["torr","normal","kombi","fet","sens"], hue:"#FFE9C9", cf:true, vg:false },
  { id:"y25", cat:"serum", name:"Artemisia Ampoule", brand:"Missha", tier:2, ings:["centella"], goal:"ro", for:["sens","kombi"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"y26", cat:"serum", name:"Hydro Boost Serum", brand:"Neutrogena", tier:1, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#FFF2BD", cf:false, vg:true },
  { id:"y27", cat:"serum", name:"Rapid Wrinkle Repair Retinol", brand:"Neutrogena", tier:1, ings:["retinol"], goal:"aldring", for:["normal","kombi"], hue:"#E6F2D9", cf:false, vg:true },
  { id:"y28", cat:"serum", name:"B-Hydra Intensive Hydration Serum", brand:"Glow Recipe", tier:3, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"y29", cat:"serum", name:"Guava Vitamin C Dark Spot Serum", brand:"Glow Recipe", tier:3, ings:["vitamin-c"], goal:"glow", for:["normal","kombi"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"y30", cat:"serum", name:"Plum Plump Hyaluronic Serum", brand:"Glow Recipe", tier:3, ings:["hyaluron"], for:["torr","normal","kombi","sens"], hue:"#FFE6D6", cf:true, vg:true },
  { id:"y31", cat:"serum", name:"Truth Serum Vitamin C", brand:"Ole Henriksen", tier:3, ings:["vitamin-c"], goal:"glow", for:["normal","kombi"], hue:"#FFE9C9", cf:true, vg:false },
  { id:"y32", cat:"serum", name:"C-Firma Fresh Day Serum", brand:"Drunk Elephant", tier:4, ings:["vitamin-c"], goal:"glow", for:["normal","kombi"], hue:"#F3E8D6", cf:true, vg:true },
  { id:"y33", cat:"serum", name:"A-Passioni Retinol Cream", brand:"Drunk Elephant", tier:4, ings:["retinol"], goal:"aldring", for:["normal","kombi"], hue:"#FFF2BD", cf:true, vg:true },
  { id:"y34", cat:"serum", name:"Marula + Peptide Firming Serum", brand:"Biossance", tier:3, ings:["peptider"], goal:"aldring", for:["torr","normal","kombi","sens"], hue:"#E6F2D9", cf:true, vg:true },
  { id:"y35", cat:"serum", name:"Copper Peptide Serum", brand:"The Inkey List", tier:1, ings:["peptider"], goal:"aldring", for:["torr","normal","kombi","sens"], hue:"#FFD6E4", cf:true, vg:true },
  { id:"y36", cat:"serum", name:"Beta Hydroxy Acid Serum", brand:"The Inkey List", tier:1, ings:["salisylsyre"], goal:"kviser", for:["fet","kombi","normal"], hue:"#EAE2FF", cf:true, vg:true },
  { id:"y37", cat:"serum", name:"Vitamin B, C & E Moisturiser Serum", brand:"The Inkey List", tier:1, ings:["vitamin-c","niacinamid"], for:["normal","kombi"], hue:"#FFE6D6", cf:true, vg:true },
];

const STERKE = ["retinol", "glykolsyre", "salisylsyre"];
const KBEAUTY = ["Beauty of Joseon", "Anua", "SKIN1004", "Round Lab", "Isntree", "Torriden", "COSRX", "VT Cosmetics", "Haruharu", "Medicube"];

const NAVN = { skvalan:"Skvalan", panthenol:"Panthenol (B5)", "vitamin-e":"Vitamin E", urea:"Urea", pha:"PHA-syre", sink:"Sink", "gronn-te":"Grønn te", "vitamin-c":"Vitamin C", ceramider:"Ceramider", hyaluron:"Hyaluronsyre", niacinamid:"Niacinamid", salisylsyre:"Salisylsyre (BHA)", glykolsyre:"AHA-syre", retinol:"Retinol", bakuchiol:"Bakuchiol", centella:"Centella", azelainsyre:"Azelainsyre", peptider:"Peptider", mucin:"Sneglemucin", pdrn:"PDRN (laks-DNA)", kollagen:"Kollagen" };
const nvn = (i) => NAVN[i] || i;

/* INCI-gjenkjenning: mapper offisielle ingrediensnavn til våre nøkler. Utvid fritt. */
const INCI_MAP = {
  "vitamin-c": ["ascorbic acid","l-ascorbic acid","ascorbyl glucoside","sodium ascorbyl phosphate","magnesium ascorbyl phosphate","ascorbyl palmitate","tetrahexyldecyl ascorbate","3-o-ethyl ascorbic acid","ethyl ascorbic acid","ascorbyl tetraisopalmitate"],
  "niacinamid": ["niacinamide","nicotinamide"],
  "hyaluron": ["hyaluronic acid","sodium hyaluronate","hydrolyzed hyaluronic acid","sodium acetylated hyaluronate"],
  "ceramider": ["ceramide","ceramide np","ceramide ap","ceramide eop","ceramide ns"],
  "salisylsyre": ["salicylic acid","betaine salicylate"],
  "glykolsyre": ["glycolic acid","lactic acid","mandelic acid","citric acid","tartaric acid"],
  "retinol": ["retinol","retinal","retinaldehyde","hydroxypinacolone retinoate","retinyl palmitate","granactive retinoid","retinoic acid"],
  "bakuchiol": ["bakuchiol"],
  "centella": ["centella asiatica","asiaticoside","madecassoside","asiatic acid","cica"],
  "azelainsyre": ["azelaic acid","potassium azeloyl diglycinate"],
  "peptider": ["peptide","palmitoyl","copper tripeptide","matrixyl","acetyl hexapeptide","oligopeptide"],
  "mucin": ["snail secretion filtrate","snail mucin"],
  "gronn-te": ["camellia sinensis","green tea","egcg"],
  "skvalan": ["squalane","squalene"],
  "panthenol": ["panthenol","dexpanthenol","pantothenic acid"],
  "vitamin-e": ["tocopherol","tocopheryl acetate","vitamin e"],
  "urea": ["urea"],
  "pha": ["gluconolactone","lactobionic acid","galactose"],
  "sink": ["zinc pca","zinc oxide","zinc gluconate"],
  "parfyme": ["parfum","fragrance","perfume","aroma","linalool","limonene","citronellol","geraniol"],
  "alkohol": ["alcohol denat","denatured alcohol","sd alcohol","isopropyl alcohol"],
};
/* Ord som må matche som helord (unngår at f.eks. triethanolamine treffer "ethanol") */
function inneholderOrd(tekst, frag) {
  if (frag.includes(" ")) return tekst.includes(frag);
  const re = new RegExp("\\b" + frag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b");
  return re.test(tekst);
}
/* Funksjonelt ingrediensbibliotek: forklarer HVA en ingrediens gjør og HVORFOR den er i produktet.
   Dekker aktive + støtteingredienser (fuktbindere, emulgatorer, konservering, tekstur, pH). */
const INGREDIENS_INFO = [
  // Baser & fuktbindere
  { m:["aqua","water"], n:"Vann", r:"Base", d:"Løsemiddelet de fleste ingrediensene er blandet i. Står nesten alltid først." },
  { m:["propanediol","propylene glycol","butylene glycol","pentylene glycol"], n:"Glykol (fuktbinder)", r:"Fuktbinder", d:"Trekker fukt inn i huden og hjelper andre ingredienser å trenge inn. Mild og vanlig." },
  { m:["glycerin","glycerol"], n:"Glyserin", r:"Fuktbinder", d:"En av de mest brukte og best dokumenterte fuktgiverne – trekker vann inn i huden." },
  { m:["dimethyl isosorbide"], n:"Dimethyl Isosorbide", r:"Bærer", d:"Hjelper aktive ingredienser (som vitamin C) å løses opp og trenge bedre inn i huden." },
  { m:["ethoxydiglycol"], n:"Ethoxydiglycol", r:"Bærer", d:"Løsemiddel som øker opptak og stabilitet av aktive ingredienser." },
  { m:["1,2-hexanediol","hexanediol"], n:"Hexanediol", r:"Fukt + konservering", d:"Gir fukt og bidrar til å holde produktet friskt uten tradisjonelle konserveringsmidler." },
  // Emulgatorer & tekstur
  { m:["isoceteth","ceteth","steareth","laureth"], n:"Emulgator", r:"Tekstur", d:"Binder vann og olje sammen så kremen ikke skiller seg. Gir jevn tekstur." },
  { m:["xanthan gum"], n:"Xantangummi", r:"Fortykningsmiddel", d:"Naturlig fortykningsmiddel som gir produktet gel-/serumtekstur." },
  { m:["carbomer"], n:"Carbomer", r:"Fortykningsmiddel", d:"Skaper gelaktig konsistens og holder formelen stabil." },
  { m:["cetearyl alcohol","cetyl alcohol","stearyl alcohol"], n:"Fettalkohol", r:"Tekstur", d:"IKKE uttørkende alkohol – dette er mykgjørende fettstoffer som gir kremet konsistens." },
  { m:["caprylic/capric triglyceride"], n:"Triglyserid", r:"Mykgjører", d:"Lett olje fra kokos som glatter og mykgjør huden." },
  { m:["dimethicone","cyclopentasiloxane"], n:"Silikon", r:"Tekstur", d:"Gir silkeaktig gli og danner en pustende film som holder på fukt." },
  // pH & stabilitet
  { m:["triethanolamine","aminomethyl propanol","sodium hydroxide","tromethamine"], n:"pH-justerer", r:"pH", d:"Justerer produktets surhet til et hudvennlig nivå så det virker godt og ikke irriterer." },
  { m:["trisodium ethylenediamine","disodium edta","tetrasodium edta","edta"], n:"Chelateringsmiddel", r:"Stabilisator", d:"Binder metallioner i vannet så produktet holder seg stabilt og friskt lenger." },
  { m:["sodium metabisulfite","sodium sulfite"], n:"Antioksidant (stabilisator)", r:"Stabilisator", d:"Hindrer at aktive ingredienser (som vitamin C) oksiderer og mister effekt." },
  // Konserveringsmidler
  { m:["phenoxyethanol"], n:"Phenoxyethanol", r:"Konservering", d:"Vanlig, godt tolerert konserveringsmiddel som hindrer bakterie- og soppvekst." },
  { m:["caprylyl glycol"], n:"Caprylyl Glycol", r:"Fukt + konservering", d:"Gir fukt og forsterker konserveringen mildt – vanlig i «konserveringsmiddel-frie» formler." },
  { m:["ethylhexylglycerin"], n:"Ethylhexylglycerin", r:"Konservering", d:"Mildt konserveringsforsterkende stoff som også mykgjør." },
  { m:["potassium sorbate","sodium benzoate","benzoic acid"], n:"Mild konservering", r:"Konservering", d:"Matvaregodkjente konserveringsmidler som holder produktet trygt." },
  { m:["chlorphenesin"], n:"Chlorphenesin", r:"Konservering", d:"Konserveringsmiddel som hindrer mikrobevekst." },
];
function forklarIngrediens(navn) {
  const l = navn.toLowerCase().trim();
  // Først: er det en aktiv vi kjenner?
  for (const [key, syns] of Object.entries(INCI_MAP)) {
    if (syns.some((syn) => inneholderOrd(l, syn))) return { navn: nvn(key), rolle: "Aktiv", d: ING[key]?.s || "Aktiv ingrediens", aktivKey: key };
  }
  // Så: støtteingrediens?
  for (const it of INGREDIENS_INFO) {
    if (it.m.some((frag) => l.includes(frag))) return { navn: it.n, rolle: it.r, d: it.d };
  }
  return null;
}
function analyserFullListe(text) {
  const deler = (text || "").split(/,|\n/).map((x) => x.replace(/\([^)]*\)/g, "").trim()).filter((x) => x.length > 1);
  return deler.map((navn) => ({ raa: navn, info: forklarIngrediens(navn) }));
}

function matchINCI(text) {
  const lower = (text || "").toLowerCase();
  const funnet = [];
  for (const [key, syns] of Object.entries(INCI_MAP)) {
    if (syns.some((syn) => inneholderOrd(lower, syn))) funnet.push(key);
  }
  return funnet;
}

const SENS_OPTS = [
  { v:"parfyme", t:"Parfyme/duft" }, { v:"alkohol", t:"Alkohol" },
  { v:"retinol", t:"Retinol" }, { v:"vitamin-c", t:"Vitamin C" },
  { v:"salisylsyre", t:"Syrer (AHA/BHA)" },
  { v:"olje", t:"Oljer (f.eks. ved eksem)" },
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
    if (s === "olje") {
      // «Olje» er ikke én ingrediens, men en kategori + olje-baserte produkter
      if (p.cat === "olje") return -999;
      if (p.ings.includes("skvalan")) return -999;
      if (/\bolje\b|\boil\b|cleansing oil|facial oil/i.test(p.name)) return -999;
      continue;
    }
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
  if (!ans.budsjett.includes(p.tier)) return -999; /* Hardt budsjett-filter */
  sc += 2;
  if (ans.etikk?.includes("parfymefri") && p.ings.includes("parfyme")) return -999;
  if (p.tester && !p.custom) return -999; /* Utelukk merker vi vet tester på dyr */
  if (ans.etikk?.includes("lb") && !p.cf && !p.custom) return -999; /* Valgfritt: kun Leaping Bunny */
  if (ans.toleranse === "erfaren" && p.ings.some((i) => ING[i]?.sun || i === "retinol")) sc += 1;
  if (ans.toleranse === "ny" && ans.sensitiv !== "nei" && p.ings.includes("retinol")) sc -= 1;
  // Sensitiv hud: styr mot milde retinoider (bakuchiol, lav %), unna sterke som Granactive 2%/høy retinol
  const sterkRetinoid = (p) => {
    if (!p.ings.includes("retinol")) return false;
    const t = ((p.name || "") + " " + (p.inci || "")).toLowerCase();
    const pctM = t.match(/(\d*[.,]?\d+)\s*%/);
    const pct = pctM ? parseFloat(pctM[1].replace(",", ".")) : 0;
    if (pct > 0) return pct >= 0.5; // konsentrasjon oppgitt: 0.5%+ regnes som sterk for sensitiv hud
    return t.includes("granactive") || t.includes("retinaldehyde"); // ellers: kjente sterke uten oppgitt %
  };
  if (ans.sensitiv === "ja" && sterkRetinoid(p)) sc -= 5; // sterk retinoid er for tøft for sensitiv hud
  if (ans.sensitiv === "ja" && p.ings.includes("bakuchiol")) sc += 3; // mild retinol-alternativ favoriseres
  // Aldersjustering (finjustering – hudtype/toleranse veier tyngre)
  if (ans.alder === "ung") {
    // Under 20: styr mot mildt, fukt og SPF. Demp anti-aldring-aktive; behold BHA mot kviser.
    if (p.ings.includes("retinol")) sc -= 6;
    if (p.ings.includes("glykolsyre")) sc -= 2;
    if (p.ings.includes("peptider")) sc -= 3;
    if (p.goal === "aldring") sc -= 4;
    if (p.ings.includes("salisylsyre") || p.ings.includes("niacinamid")) sc += 1; // trygge mot kviser
    if (p.cat === "spf" || p.ings.includes("hyaluron") || p.ings.includes("centella")) sc += 1;
  } else if (ans.alder === "20") {
    if (p.ings.includes("vitamin-c")) sc += 1; // prevention-fasen: antioksidanter
  } else if (ans.alder === "30") {
    if (p.ings.includes("retinol") || p.ings.includes("peptider")) sc += 2;
  } else if (ans.alder === "45") {
    // Modnere hud: løft fukt, barriere og retinoider; syrer times forsiktigere (håndteres andre steder)
    if (p.ings.includes("retinol") || p.ings.includes("peptider")) sc += 2;
    if (p.ings.includes("ceramider") || p.ings.includes("hyaluron") || p.ings.includes("panthenol")) sc += 2;
    if (p.goal === "aldring") sc += 1;
  }
  for (const d of dislikedIngs) if (p.ings.includes(d)) sc -= 3;
  return sc;
}

function whyText(p, ans) {
  const bits = [];
  // Egne produkter: forklar ut fra gjenkjente ingredienser + quiz-svar
  if (p.custom) {
    if (!p.ings || p.ings.length === 0) return "Ditt eget produkt – lagt inn i rutinen. Legg til ingredienser for en personlig analyse.";
    const iBits = [];
    const heroer = p.ings.filter((i) => ING[i]).map((i) => nvn(i));
    if (p.ings.includes("vitamin-c")) iBits.push(ans.maal === "glow" ? "vitamin C treffer glød-målet ditt direkte – den bremser pigment og gir jevnere tone" : "vitamin C gir antioksidant-beskyttelse alle har nytte av, uansett mål");
    if (p.ings.includes("niacinamid")) iBits.push(ans.sensitiv === "ja" ? "niacinamid er mild og roer rødhet – trygt for sensitiv hud" : "niacinamid jevner tonen og styrker barrieren");
    if (p.ings.includes("hyaluron")) iBits.push(ans.hudtype === "torr" ? "hyaluronsyre gir tørr hud ekstra fukt" : "hyaluronsyre gir lett fukt");
    if (p.ings.includes("retinol")) iBits.push(ans.toleranse === "ny" ? "retinol er kraftig – start forsiktig siden du er ny på aktive" : "retinol jobber mot linjer og tekstur");
    if (p.ings.includes("salisylsyre")) iBits.push("salisylsyre renser porene – bra mot urenheter");
    if (p.ings.includes("centella")) iBits.push("centella roer og reparerer – snill mot huden");
    if (p.ings.includes("panthenol")) iBits.push("panthenol beroliger og støtter barrieren");
    const grunn = iBits.length ? iBits.join(". ") + "." : "Inneholder " + heroer.join(", ") + " – analysert mot resten av rutinen din.";
    let advarsel = "";
    if (p.ings.some((i) => ING[i]?.sun)) advarsel = " ☀️ Gir økt solfølsomhet – SPF hver morgen er ekstra viktig.";
    if (ans.sensitiv === "ja" && p.ings.includes("retinol")) advarsel += " ⚠️ Du oppga sensitiv hud – introduser dette sakte.";
    return "Ditt produkt. " + grunn + advarsel;
  }
  if (p.for.includes(ans.hudtype)) bits.push(`passer ${ans.hudtype === "torr" ? "tørr" : ans.hudtype} hud`);
  if (ans.sensitiv === "ja" && p.for.includes("sens")) bits.push("trygg for sensitiv hud");
  if (ans.helse.includes("gravid") && !pregnancyUnsafe(p) && p.cat === "serum") bits.push("trygg ved graviditet");
  if (p.goal === ans.maal) bits.push("treffer hovedmålet ditt");
  const hero = p.ings.find((i) => ING[i]);
  if (hero) bits.push(`inneholder ${nvn(hero)} (${ING[hero].s.toLowerCase()})`);
  return bits.length ? "Valgt fordi den " + bits.join(" · ") : "Solid allrounder for din profil";
}

function analyse(p, ans) {
  const rows = [];
  if (p.for.includes(ans.hudtype)) rows.push(["Matcher hudtypen din", "+3"]);
  if ((ans.sensitiv === "ja") && p.for.includes("sens")) rows.push(["Dokumentert mild nok for sensitiv hud", "+3"]);
  if ((ans.sensitiv === "ja") && !p.for.includes("sens")) rows.push(["Ikke merket sensitiv-trygg", "−3"]);
  if (p.goal && p.goal === ans.maal) rows.push(["Hovedingrediens rettet mot målet ditt", "+4"]);
  if (ans.budsjett.includes(p.tier)) rows.push(["I prisklassene du valgte", "+2"]);
  if (!p.tester) rows.push(["Ikke kjent for dyretesting", "✓"]);
  if (p.cf) rows.push(["Leaping Bunny-sertifisert", "✓"]);
  if (ans.toleranse === "erfaren" && p.ings.some((i) => ING[i]?.sun || i === "retinol")) rows.push(["Skin-geek: god toleranse for aktive", "+1"]);
  if (ans.helse.includes("gravid") && !p.ings.includes("retinol") && !p.ings.includes("salisylsyre")) rows.push(["Trygg ved graviditet", "✓"]);
  if (ans.etikk?.includes("lb") && p.cf) rows.push(["Leaping Bunny (ditt krav)", "✓"]);
  if (ans.etikk?.includes("vegan") && p.vg) rows.push(["Vegansk (ditt krav)", "✓"]);
  for (const st of ans.sensList) if (!p.ings.includes(st)) {} 
  if (ans.sensList.length) rows.push(["Fri for ingrediensene du ikke tåler", "✓"]);
  return rows;
}

function oppsummering(nivaa, routine, ans, cycling) {
  const amIng = routine.serumAM?.main?.ings.find((i) => ING[i]);
  const pmP = cycling ? null : routine.serumPM?.main;
  const pmIng = (pmP?.ings.find((i) => ING[i]?.freq)) || (pmP?.ings[0]);
  const kremIng = routine.krem?.main?.ings[0];
  const hud = { torr:"tørr", fet:"fet", kombi:"kombinert", normal:"balansert" }[ans.hudtype] || "din";
  const maal = { kviser:"urenheter", glow:"glød og jevnere hudtone", aldring:"fine linjer", ro:"roligere hud" }[ans.maal] || "sunn hud";

  if (nivaa === 1) {
    const am = amIng ? (nvn(amIng).toLowerCase() + "-serum, ") : "";
    let kveld;
    if (cycling) kveld = "og de aktive ingrediensene dine veksler mellom kvelder så huden får hvile mellom øktene";
    else if (pmIng) kveld = "og " + nvn(pmIng).toLowerCase() + " jobber mens du sover";
    else kveld = "og huden får ro";
    return "Rutinen din er bygget for " + hud + " hud med mål om " + maal + " – og den følger en enkel logikk: rens skånsomt, behandle målrettet, beskytt alltid. Om morgenen gjør du minst mulig (vann, " + am + "krem og solkrem), for morgenens viktigste jobb er beskyttelse. Om kvelden gjør du selve jobben: dobbelrens fjerner dagens solkrem og smuss, " + kveld + ". Fuktighetskremen til slutt låser alt inn. Hvorfor funker dette? Fordi hvert steg har én tydelig jobb, ingenting krangler med hverandre, og det viktigste steget av alle – solkrem – er med hver eneste dag.";
  }

  if (nivaa === 2) {
    const amDel = amIng ? (nvn(amIng) + " om morgenen er plassert der med vilje – antioksidanter jobber best under solkremen, hvor de fanger frie radikaler før de når kollagenet.") : "Morgenrutinen er bevisst minimal for å bevare hudbarrieren.";
    let pmDel = "";
    if (cycling) pmDel = "Kveldene dine kjører skin-cycling: eksfoliering og retinol på hver sine kvelder, med pausenetter imellom – slik får du effekten av begge uten irritasjonen av å stable dem.";
    else if (pmIng) { const grunn = ING[pmIng]?.sun ? "den gjør huden mer lysfølsom og brytes ned av UV" : "natten er hudens reparasjonsvindu"; pmDel = "Kveldens " + nvn(pmIng).toLowerCase() + " ligger på kvelden fordi " + grunn + "."; }
    const kremDel = kremIng ? ("Fuktighetskremen med " + nvn(kremIng).toLowerCase() + " er støtteapparatet: den styrker barrieren slik at de aktive ingrediensene kan virke uten å tære på huden.") : "";
    return "Strukturen følger prinsippet tynnest til tykkest, og deler døgnet i to roller: dagen beskytter, natten reparerer. " + amDel + " " + pmDel + " " + kremDel + " Ingrediensene er valgt for å komplementere, ikke konkurrere – ingen overlappende syrer, ingen kombinasjoner som nøytraliserer hverandre.";
  }

  let amN = "";
  if (amIng === "vitamin-c") amN = "L-askorbinsyre/C-derivat i AM gir fotoprotektiv synergi med SPF – antioksidant + filter demper UV-indusert oksidativt stress bedre enn filter alene.";
  else if (amIng) amN = nvn(amIng) + " i AM gir antiinflammatorisk støtte uten fotosensitivisering.";
  let pmN = "";
  if (cycling) pmN = "PM kjører syklisk eksponering: kjemisk eksfoliering øker celleturnover og penetrasjon, retinoid oppregulerer kollagensyntese via retinsyrereseptorene, og recovery-netter lar TEWL normaliseres – dokumentert strategi for å bevare retinoid-effekt med lavere irritasjonsscore.";
  else if (pmIng) pmN = nvn(pmIng) + " i PM: " + ((ING[pmIng]?.d || "").split(".")[0].toLowerCase()) + ".";
  let kremN = "";
  if (kremIng === "ceramider") kremN = "Ceramid-dominant okklusjon post-aktiver reduserer irritasjonsrisiko og støtter lamellær lipidstruktur.";
  else if (kremIng === "niacinamid") kremN = "Niacinamid i fuktighetslaget øker endogen ceramidsyntese – smart pairing med aktive.";
  const oljeN = routine.olje?.micellar ? "Micellarvann fjerner sminke og filmdannende UV-filtre skånsomt uten oljer – micellene binder smuss og fett uten å tette porer eller trigge eksem." : routine.olje?.main ? "Dobbelrensen sikrer fullstendig fjerning av filmdannende UV-filtre uten å stripped barrieren (lav-pH andretrinn)." : "";
  return "For nerden: rutinen er komponert rundt barriere-først-prinsippet. " + amN + " " + pmN + " " + kremN + " " + oljeN + " Ingen ingrediens-antagonisme: syrer og retinoider er temporalt separert, og pH-avhengige aktiver ligger på egne tidspunkt.";
}

function serumTiming(p) {
  if (!p) return "PM";
  if (p.ings.includes("vitamin-c")) return "AM – antioksidant-skjold under solkremen";
  if (p.ings.includes("retinol")) return "PM – kun kveld";
  if (p.ings.includes("salisylsyre") || p.ings.includes("glykolsyre")) return "PM";
  return "AM eller PM";
}

function erAktivEksfoliant(p) { return p?.ings?.some((i) => ["glykolsyre","salisylsyre","pha","azelainsyre"].includes(i)); }

/* Vurderer om et produkt har dokumentert virkestoff. Produkter uten kjent aktiv ingrediens
   (f.eks. rene ekstrakt-baserte «virale» produkter) får en nøytral note om at vi ikke kan
   love effekt – men de kan fortsatt brukes/roteres. Ærlighet framfor hype. */
function evidensNote(p) {
  if (!p || p.custom) return null;
  const dokumenterte = ["retinol","bakuchiol","glykolsyre","salisylsyre","pha","azelainsyre","niacinamid","vitamin-c","hyaluron","ceramider","centella","peptider","panthenol"];
  const harDokumentert = p.ings?.some((i) => dokumenterte.includes(i));
  // Rens, olje og SPF vurderes ikke på virkestoff (de har annen funksjon)
  if (p.cat === "rens" || p.cat === "olje" || p.cat === "spf") return null;
  if (!harDokumentert) return "Dette produktet er populært, men inneholder ingen av ingrediensene med sterkest forskningsbelegg. Det kan fint fukte og pleie huden, men vi kan ikke love spesifikk effekt på f.eks. linjer eller pigment. Bruk det gjerne – bare med realistiske forventninger.";
  return null;
}

/* Retinoid-potens etter forskningsbasert rekkefølge (svakest→sterkest):
   retinylester → retinol → retinaldehyd (retinal) → tretinoin (resept).
   Bakuchiol er IKKE en retinoid, men et mildt, plantebasert alternativ.
   Kilde: bl.a. Kang et al. 1995 (retinoid-penetrasjon), samt kliniske oversikter. */
function retinoidNiva(p) {
  if (!p) return null;
  const t = ((p.name || "") + " " + (p.inci || "")).toLowerCase();
  if (p.ings?.includes("bakuchiol")) return { niva: 0, navn: "Bakuchiol (mildt alternativ)", styrke: "mild" };
  if (!p.ings?.includes("retinol")) return null;
  if (t.includes("tretinoin") || t.includes("retinoic")) return { niva: 4, navn: "Tretinoin (resept, sterkest)", styrke: "sterk" };
  if (t.includes("retinal") || t.includes("retinaldehyd")) return { niva: 3, navn: "Retinaldehyd (retinal) – potent", styrke: "sterk" };
  if (t.includes("palmitate") || t.includes("retinyl")) return { niva: 1, navn: "Retinylester – mildest retinoid", styrke: "mild" };
  return { niva: 2, navn: "Retinol", styrke: "moderat" }; // standard
}
function erAktivPM(p) { return p?.ings?.some((i) => ING[i]?.sun || i === "retinol"); }

/* Helhetlig konfliktsjekk: ser på ALLE produktene i rutinen samlet og advarer om
   kombinasjoner som kan irritere eller nøytralisere hverandre. Returnerer liste med advarsler. */
function finnKonflikter(produkter, cycling) {
  const advarsler = [];
  const alle = produkter.filter(Boolean);
  const harIng = (ing) => alle.filter((p) => p.ings?.includes(ing));
  const navnliste = (ps) => ps.map((p) => `${p.brand} ${p.name}`).join(" + ");

  // Renseprodukter skylles av – syrer der teller ikke som aktiv konflikt
  const leaveOn = alle.filter((p) => p.cat !== "rens" && p.cat !== "olje");
  // 1. Flere eksfolierende syrer samtidig (AHA + BHA + PHA)
  const syrer = leaveOn.filter((p) => erAktivEksfoliant(p));
  if (syrer.length > 1 && !cycling) {
    advarsler.push({ niva:"advarsel", tekst:`Du har flere eksfolierende syrer i rutinen (${navnliste(syrer)}). Å bruke dem samtidig kan overeksfoliere og skade hudbarrieren. Bruk dem på ulike dager, eller velg én.` });
  }
  // 2. Syre + retinol (uten skin-cycling som separerer dem)
  const retinoler = leaveOn.filter((p) => p.ings?.includes("retinol"));
  if (syrer.length >= 1 && retinoler.length >= 1 && !cycling) {
    advarsler.push({ niva:"advarsel", tekst:`Syre (${navnliste(syrer)}) og retinol (${navnliste(retinoler)}) samme kveld kan gi kraftig irritasjon. Bruk dem på hver sine kvelder – eller la verktøyet sette opp skin-cycling for deg.` });
  }
  // 3. Flere retinoider/retinol-produkter
  if (retinoler.length > 1) {
    advarsler.push({ niva:"advarsel", tekst:`Du har flere retinol-produkter (${navnliste(retinoler)}). Å stable retinoider øker irritasjon uten ekstra effekt – hold deg til ett.` });
  }
  // 4. Ren vitamin C (L-askorbinsyre) + retinol – kan begge irritere; info-nivå
  const cvit = leaveOn.filter((p) => p.ings?.includes("vitamin-c"));
  if (cvit.length >= 1 && retinoler.length >= 1) {
    advarsler.push({ niva:"info", tekst:`Du har både vitamin C og retinol i rutinen. Det er helt fint – de jobber best til hver sin tid på døgnet, og rutinen din er allerede satt opp riktig: vitamin C om morgenen (antioksidant-skjold under solkremen), retinol om kvelden. Ingenting du trenger å endre.` });
  }
  // 5. Mange aktive totalt for nybegynner-lignende rutine
  const aktiveTotalt = leaveOn.filter((p) => erAktivEksfoliant(p) || p.ings?.includes("retinol")).length;
  if (aktiveTotalt >= 3 && !cycling) {
    advarsler.push({ niva:"info", tekst:`Rutinen inneholder ${aktiveTotalt} aktive ingredienser. Det er mye på én gang – vurder å introdusere dem gradvis, ett produkt hver 1–2 uke, så huden får venne seg til.` });
  }
  return advarsler;
}
/* Analyserer hvor invasivt/sterkt et aktivt produkt er, ut fra produkttype + konsentrasjon.
   Renseprodukter som skylles av er mildere enn leave-on serum med samme syre. */
function kortnavn(p) {
  if (!p) return "";
  const ord = (p.name || "").split(" ");
  return ord.slice(0, 2).join(" ");
}
function aktivStyrke(p) {
  if (!p || !erAktivEksfoliant(p) && !p.ings?.includes("retinol")) return null;
  const tekst = ((p.name || "") + " " + (p.inci || "")).toLowerCase();
  const pctMatch = tekst.match(/(\d*[.,]?\d+)\s*%/g);
  let pct = 0;
  if (pctMatch) pct = Math.max(...pctMatch.map((x) => parseFloat(x.replace(",", ".").replace("%", ""))));
  const skyllesAv = p.cat === "rens" || p.cat === "olje";
  let niva, tekst2;
  if (skyllesAv) { niva = "mild"; tekst2 = "Skylles av – syren har kort kontakttid, så dette er et mildt eksfolierings-trinn du trygt kan bruke ofte."; }
  else if (pct >= 10 || p.name?.toLowerCase().includes("peel")) { niva = "sterk"; tekst2 = pct ? `Høy konsentrasjon (~${pct}%) og ligger på huden – dette er et kraftig aktivt trinn. Start 1–2x/uke og bygg opp.` : "Konsentrert peel som ligger på huden – kraftig. Start forsiktig, 1–2x/uke."; }
  else if (pct >= 5) { niva = "moderat"; tekst2 = `Moderat konsentrasjon (~${pct}%), leave-on. Bygg opp til annenhver kveld etter toleranse.`; }
  else if (p.ings?.includes("retinol")) { niva = "moderat"; tekst2 = "Retinol/retinoid som ligger på huden – introduser gradvis, 2–3 kvelder/uke først."; }
  else { niva = "mild-moderat"; tekst2 = "Leave-on syre i lav/uoppgitt konsentrasjon – mild til moderat. Følg med på hvordan huden reagerer."; }
  return { niva, pct, skyllesAv, tekst: tekst2 };
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
const BASE = { 1: 149, 2: 329, 3: 749, 4: 219 };
// Trygge norske nettbutikker og hvilke merker de fører (basert på faktisk sortiment)
const BUTIKKER = {
  "Lyko":        { url:"https://www.lyko.com/no", ship:"Fri frakt over 299 kr" },
  "KICKS":       { url:"https://www.kicks.no", ship:"Fri frakt over 349 kr" },
  "VITA":        { url:"https://www.vita.no", ship:"Fri frakt over 349 kr" },
  "Blivakker":   { url:"https://www.blivakker.no", ship:"39 kr frakt" },
  "Coverbrands": { url:"https://www.coverbrands.no", ship:"Fri frakt over 500 kr" },
  "Boozt":       { url:"https://www.boozt.com/no/no", ship:"Fri frakt" },
  "H&M Beauty":  { url:"https://www2.hm.com/no_no/beauty.html", ship:"Fri frakt for medlemmer" },
  "Apotek 1":    { url:"https://www.apotek1.no", ship:"Klikk og hent / hjemlevering" },
  "Vitusapotek": { url:"https://www.vitusapotek.no", ship:"Hjemlevering" },
  "Farmasiet":   { url:"https://www.farmasiet.no", ship:"Fri frakt over 499 kr" },
  "Nordicfeel":  { url:"https://www.nordicfeel.no", ship:"Fri frakt over 349 kr" },
  "Parfym.no":   { url:"https://www.parfym.no", ship:"Fri frakt over 349 kr" },
};
// Hvilke butikker fører hvilke merker (apotekmerker → apotek, K-beauty → K-beauty-butikker, osv.)
const MERKE_BUTIKK = {
  "La Roche-Posay": ["Apotek 1","Vitusapotek","Farmasiet","VITA"],
  "Avène": ["Apotek 1","Vitusapotek","Farmasiet"],
  "CeraVe": ["Apotek 1","Vitusapotek","Farmasiet","VITA"],
  "Bioderma": ["Apotek 1","Vitusapotek","Farmasiet"],
  "Eucerin": ["Apotek 1","Vitusapotek","Farmasiet"],
  "Cetaphil": ["Apotek 1","Vitusapotek","Farmasiet"],
  "Neutrogena": ["Apotek 1","VITA","Vitusapotek"],
  "Beauty of Joseon": ["Nordicfeel","Blivakker","Lyko"],
  "COSRX": ["Nordicfeel","Blivakker","Lyko","VITA"],
  "Anua": ["Nordicfeel","Blivakker"],
  "SKIN1004": ["Nordicfeel","Blivakker"],
  "Round Lab": ["Nordicfeel","Blivakker"],
  "Isntree": ["Nordicfeel","Blivakker"],
  "Torriden": ["Nordicfeel","Blivakker"],
  "Purito": ["Nordicfeel","Blivakker"],
  "Some By Mi": ["Nordicfeel","Blivakker"],
  "Numbuzin": ["Nordicfeel","Blivakker"],
  "Benton": ["Nordicfeel","Blivakker"],
  "I'm From": ["Nordicfeel","Blivakker"],
  "Missha": ["Nordicfeel","Blivakker","Lyko"],
  "VT Cosmetics": ["Nordicfeel","Blivakker"],
  "Haruharu": ["Nordicfeel","Blivakker"],
  "Medicube": ["Nordicfeel","Blivakker","Parfym.no"],
  "The Ordinary": ["Lyko","KICKS","VITA","Nordicfeel"],
  "The Inkey List": ["Lyko","KICKS","Nordicfeel"],
  "Naturium": ["Lyko","Nordicfeel"],
  "Paula's Choice": ["Lyko","Coverbrands","Nordicfeel"],
  "SkinCeuticals": ["Coverbrands","Apotek 1","Farmasiet"],
  "Medik8": ["Coverbrands","Lyko"],
  "Environ": ["Coverbrands"],
  "iS Clinical": ["Coverbrands"],
  "Dermalogica": ["Coverbrands","Lyko","KICKS"],
  "Drunk Elephant": ["KICKS","Lyko","Boozt"],
  "Biossance": ["Lyko","Nordicfeel"],
  "Tatcha": ["KICKS","Boozt"],
  "Fresh": ["KICKS","Boozt"],
  "Kiehl's": ["KICKS","Boozt","Lyko"],
  "Estée Lauder": ["KICKS","Boozt","VITA"],
  "Clinique": ["KICKS","Boozt","VITA"],
  "Clinique Take The Day Off": ["KICKS","Boozt","VITA"],
  "SK-II": ["KICKS","Boozt"],
  "La Mer": ["KICKS","Boozt"],
  "Ole Henriksen": ["Lyko","KICKS"],
  "Farmacy": ["Lyko","Nordicfeel"],
  "Herbivore": ["Lyko","Nordicfeel"],
  "Glow Recipe": ["Lyko","KICKS","Nordicfeel"],
  "Laneige": ["Nordicfeel","Blivakker","Lyko"],
  "Sulwhasoo": ["Nordicfeel","Boozt"],
  "Dr.Jart+": ["Nordicfeel","Lyko","KICKS"],
  "Dr.Jart+ Cicapair": ["Nordicfeel","Lyko"],
  "Belif": ["Nordicfeel","Lyko"],
  "Innisfree": ["Nordicfeel","Blivakker"],
  "The Face Shop": ["Nordicfeel","Blivakker"],
  "Etude House": ["Nordicfeel","Blivakker"],
  "Nature Republic": ["Nordicfeel","Blivakker"],
  "Krave Beauty": ["Nordicfeel"],
  "Then I Met You": ["Nordicfeel"],
  "Mad Hippie": ["Nordicfeel"],
  "Biore": ["Nordicfeel","VITA"],
  "Biore UV Aqua Rich": ["Nordicfeel","VITA"],
  "DHC": ["Nordicfeel","VITA"],
  "Garnier": ["VITA","Blivakker","H&M Beauty"],
  "Neutrogena ": ["VITA","Apotek 1"],
  "EltaMD": ["Coverbrands","Nordicfeel"],
  "Supergoop!": ["Lyko","KICKS"],
  "Weleda Skin Food": ["Apotek 1","VITA","Farmasiet"],
  "Caudalie": ["KICKS","Apotek 1","Lyko"],
  "Votary": ["KICKS"],
  "May Lindstrom": ["KICKS"],
  "Aztec": ["Nordicfeel","Blivakker"],
  "Klairs": ["Nordicfeel","Blivakker"],
  "Axis-Y": ["Nordicfeel","Blivakker"],
  "Byoma": ["Nordicfeel","VITA","Lyko"],
  "Heimish": ["Nordicfeel","Blivakker"],
  "Banila Co": ["Nordicfeel","Blivakker"],
  "Haruharu Wonder": ["Nordicfeel","Blivakker"],
  "Skin1004": ["Nordicfeel","Blivakker"],
  "Dr. Ceuracle": ["Nordicfeel","Blivakker"],
  "Dr. Althea": ["Nordicfeel","Blivakker"],
  "Huxley": ["Nordicfeel","Blivakker"],
  "Hanskin": ["Nordicfeel","Blivakker"],
  "AtoPalm": ["Nordicfeel","Blivakker"],
  "Geek & Gorgeous": ["Nordicfeel"],
  "Timeless": ["Nordicfeel"],
  "Origins": ["KICKS","Boozt","Lyko"],
  "Rhode": ["Lyko"],
  "Murad": ["Lyko","KICKS","Coverbrands"],
  "Erborian": ["KICKS","Lyko","Boozt"],
  "Lumene": ["VITA","Nordicfeel","Lyko"],
  "Korres": ["Lyko","KICKS"],
  "Exuviance": ["Coverbrands","Lyko"],
  "L'Oréal": ["VITA","Blivakker","H&M Beauty"],
  "e.l.f.": ["H&M Beauty","VITA","Nordicfeel"],
  "Pixi": ["Lyko","Nordicfeel"],
  "Olay": ["VITA","Blivakker"],
  "Nivea": ["VITA","Blivakker","Apotek 1","H&M Beauty"],
};
function offers(p) {
  let navn = MERKE_BUTIKK[p.brand];
  // Delvis match: «Belif Aqua Bomb» → «Belif», «Skin1004» → «SKIN1004»
  if (!navn) {
    const noekler = Object.keys(MERKE_BUTIKK);
    const treff = noekler.find((k) => p.brand.toLowerCase().startsWith(k.toLowerCase()) || k.toLowerCase().startsWith(p.brand.toLowerCase()));
    if (treff) navn = MERKE_BUTIKK[treff];
  }
  if (!navn || navn.length === 0) navn = ["Lyko","KICKS","VITA","Nordicfeel"];
  return navn.filter((n) => BUTIKKER[n]).map((n) => ({ store: n, ship: BUTIKKER[n].ship, url: BUTIKKER[n].url }));
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
.wrap{width:100%;max-width:820px}
.eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${sage};font-weight:700;text-align:center}
h1{font-family:'Fraunces',serif;font-weight:600;font-size:32px;line-height:1.12;text-align:center;margin:10px 0 8px;letter-spacing:-.01em}
.sub{color:#6B6862;font-size:14.5px;line-height:1.6;text-align:center;margin:0 auto;max-width:560px}
.opt{display:block;width:100%;text-align:left;background:#fff;border:1.5px solid ${line};border-radius:14px;padding:15px 16px;font-size:15px;font-weight:600;color:${ink};cursor:pointer;margin-top:10px;transition:border-color .15s, transform .1s;font-family:Inter}
.opt:hover{border-color:${ink};transform:translateY(-1px)}
.opt.on{border-color:${sage};background:#EEF4EF}
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
.produktgrid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:900px){.produktgrid{grid-template-columns:1fr 1fr}}
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
.weekscroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:10px -4px 0;padding:0 4px}
.week{width:100%;min-width:560px;border-collapse:collapse;font-size:11px}
.week th{font-weight:700;padding:6px 2px;color:#8B8880;text-transform:uppercase;letter-spacing:.06em;font-size:9.5px}
.week td{border:1px solid ${line};padding:5px 3px;text-align:center;background:#fff;border-radius:4px}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin:1px}
`;

const Hjelp = ({ tekst }) => {
  const [open, setOpen] = useState(false);
  return (
    <span style={{display:"inline-block", position:"relative"}}>
      <button onClick={() => setOpen(!open)} aria-label="Hjelp" style={{border:"1.5px solid #C7614A", color:"#C7614A", background:"#fff", borderRadius:"50%", width:20, height:20, fontSize:12, fontWeight:700, cursor:"pointer", lineHeight:1, padding:0, marginLeft:6, verticalAlign:"middle"}}>?</button>
      {open && <span style={{display:"block", marginTop:6, background:"#FFF6E5", border:"1px solid #EADFC0", borderRadius:10, padding:"10px 12px", fontSize:12.5, color:"#4A4842", lineHeight:1.55, fontWeight:400}}>{tekst}</span>}
    </span>
  );
};

const ARTIKLER = [
  { url: "/hudpleierutine.html", tag: "Start her", t: "Hvordan bygge en hudpleierutine", d: "Steg for steg: riktig rekkefølge, hva du trenger (og ikke), og de vanligste feilene." },
  { url: "/pdrn.html", tag: "Viral", t: "PDRN: hype eller ekte?", d: "«Laks-DNA» er overalt akkurat nå. Vi går ærlig gjennom hva forskningen faktisk viser." },
  { url: "/niacinamid.html", tag: "Ingrediens", t: "Hva er niacinamid?", d: "Den milde allrounderen som roer rødhet, styrker barrieren og jevner ut huden." },
  { url: "/retinol.html", tag: "Nybegynner", t: "Retinol for nybegynnere", d: "Forskjellen på retinol, retinal og tretinoin – og hvordan du starter trygt." },
  { url: "/aha-vs-bha.html", tag: "Guide", t: "AHA eller BHA?", d: "To eksfolierende syrer – slik velger du riktig for akkurat din hud." },
  { url: "/kollagen.html", tag: "Myteknusing", t: "Bygger kollagenkrem kollagen?", d: "Dermatologer forklarer hvorfor svaret som regel er nei – og hva som virker." },
  { url: "/hyaluronsyre.html", tag: "Ingrediens", t: "Hyaluronsyre: fuktbomben", d: "Fuktmagneten alle snakker om – og den vanlige feilen som kan tørke huden ut." },
];

const Kunnskapsbank = ({ mork }) => (
  <div style={{marginTop:20}}>
    <div style={{fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:600, color: mork ? "#FBFAF7" : "#16130F"}}>Lær mer om hudpleie 📚</div>
    <div style={{fontSize:13, color: mork ? "#C9C6BE" : "#6B6862", marginTop:2, marginBottom:12}}>Ærlige, forskningsbaserte guider til ingrediensene – uten hype.</div>
    <div style={{display:"grid", gap:10}}>
      {ARTIKLER.map((a) => (
        <a key={a.url} href={a.url} style={{display:"block", textDecoration:"none", background: mork ? "#211D18" : "#fff", border:"1px solid " + (mork ? "#3A342C" : "#E4E1DA"), borderRadius:12, padding:"14px 16px"}}>
          <span style={{fontSize:10, letterSpacing:".1em", textTransform:"uppercase", fontWeight:700, color:"#C7614A"}}>{a.tag}</span>
          <div style={{fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:600, color: mork ? "#FBFAF7" : "#16130F", marginTop:2}}>{a.t}</div>
          <div style={{fontSize:12.5, color: mork ? "#C9C6BE" : "#6B6862", marginTop:3, lineHeight:1.5}}>{a.d}</div>
        </a>
      ))}
    </div>
  </div>
);

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
  const [ans, setAns] = useState({ hudtype:null, alder:null, sensitiv:null, toleranse:null, sensList:[], helse:[], maal:null, budsjett:[], etikk:[] });
  const [liked, setLiked] = useState([]);
  const [custom, setCustom] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [fbOpen, setFbOpen] = useState(null);
  const [cellEdit, setCellEdit] = useState(null);
  const [cellOverrides, setCellOverrides] = useState({});
  const [q, setQ] = useState("");
  const [addingCat, setAddingCat] = useState(null);
  const [swaps, setSwaps] = useState({});
  const [removed, setRemoved] = useState([]);
  const [openIng, setOpenIng] = useState(null);
  const [openFullIng, setOpenFullIng] = useState(null);
  const [deepIng, setDeepIng] = useState(null);
  const [toast, setToast] = useState(null);
  const [saved, setSaved] = useState(null);
  const [priceFor, setPriceFor] = useState(null);
  const [showTrust, setShowTrust] = useState(false);
  const [showPersonvern, setShowPersonvern] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [layers, setLayers] = useState({ tonerCount:0, maske:false });
  const [oppsNivaa, setOppsNivaa] = useState(1);
  const [visOpps, setVisOpps] = useState(true);
  const [stegFerdig, setStegFerdig] = useState({});
  const [apneSteg, setApneSteg] = useState(null);
  const [egetForslag, setEgetForslag] = useState({});
  const [visFlere, setVisFlere] = useState({});
  const [behovFilter, setBehovFilter] = useState({});
  const [custIngs, setCustIngs] = useState([]);
  /* Auto-aktiver valgfrie lag når brukeren har eget/likt produkt i kategorien */
  useEffect(() => {
    const mine = [...liked, ...custom.map((c) => c.id)].map((id) => allProducts.find((x) => x.id === id)).filter(Boolean);
    const harToner = mine.some((p) => p.cat === "toner");
    const harMaske = mine.some((p) => p.cat === "maske");
    setLayers((l) => ({ ...l, tonerCount: harToner && l.tonerCount === 0 ? 1 : l.tonerCount, maske: harMaske ? true : l.maske }));
  }, [liked, custom]);
  const [ingSok, setIngSok] = useState("");
  const [inciTekst, setInciTekst] = useState("");
  const [inciTreff, setInciTreff] = useState([]);
  const [maskeFreq, setMaskeFreq] = useState(1);
  const [lockedIn, setLockedIn] = useState(false);
  const [openAnalyse, setOpenAnalyse] = useState(null);
  const [custDays, setCustDays] = useState(null);
  const [amRens, setAmRens] = useState(false);
  const [rotations, setRotations] = useState({});
  const [showWeek, setShowWeek] = useState(false);

  useEffect(() => {
    (async () => {
      try { const r = await storage.get("min-rutine"); if (r) { const sv = JSON.parse(r.value); if (typeof sv.ans?.budsjett === "number") sv.ans.budsjett = [sv.ans.budsjett]; if (!sv.ans?.toleranse) sv.ans.toleranse = "litt"; if (!sv.ans?.etikk) sv.ans.etikk = []; if (!sv.ans?.alder) sv.ans.alder = "30"; setSaved(sv); } } catch (e) {}
      try { const fb = await storage.get("skinatlas-feedback"); if (fb) setFeedback(JSON.parse(fb.value)); } catch (e) {}
    })();
  }, []);

  const ping = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const allProducts = [...P, ...custom];
  const daysSince = (iso) => Math.floor((Date.now() - new Date(iso)) / 86400000);

  const words = q.toLowerCase().split(" ").filter(Boolean);
  const hits = q.length > 1 ? allProducts.filter((p) => words.every((w) => (p.brand + " " + p.name).toLowerCase().includes(w))).slice(0, 6) : [];

  const routine = useMemo(() => {
    if (!ans.budsjett) return null;
    const avoid = [...ans.sensList];
    const dislikedIngs = disliked.flatMap((id) => allProducts.find((x) => x.id === id)?.ings || []);
    const etikkOK = (p) => p.custom || (!p.tester && (!ans.etikk?.includes("lb") || p.cf) && (!ans.etikk?.includes("vegan") || p.vg) && (!ans.etikk?.includes("parfymefri") || !p.ings.includes("parfyme")));
    const isAMserum = (p) => p.ings.includes("vitamin-c") || (p.ings.includes("niacinamid") && !p.ings.some((i) => ING[i]?.sun));
    const scoreWith = (p, ignoreBudget) => {
      if (ignoreBudget) { const saved = ans.budsjett; const tmp = { ...ans, budsjett: [1,2,3,4] }; return scoreProduct(p, tmp, avoid, dislikedIngs); }
      return scoreProduct(p, ans, avoid, dislikedIngs);
    };
    const build = (cat, filterFn, slotKey) => {
      const likedHere = [...liked, ...custom.map((c) => c.id)].find((id) => { const x = allProducts.find((y) => y.id === id); return x?.cat === cat && (!filterFn || filterFn(x)); });
      const base = allProducts.filter((p) => p.cat === cat && !disliked.includes(p.id) && !p.custom && etikkOK(p) && (!filterFn || filterFn(p)));
      // Primær: kun valgt(e) budsjettnivå
      let pool = base.map((p) => ({ p, sc: scoreWith(p, false), off: false })).filter((x) => x.sc > -100).sort((a, b) => b.sc - a.sc);
      // Fallback: hvis ingen i valgt nivå, tillat andre nivåer (markeres off=true)
      if (pool.length === 0) pool = base.map((p) => ({ p, sc: scoreWith(p, true), off: true })).filter((x) => x.sc > -100).sort((a, b) => b.sc - a.sc);
      const key = slotKey || (filterFn ? cat + (filterFn === isAMserum ? "AM" : "PM") : cat);
      const main = swaps[key] || (likedHere ? allProducts.find((x) => x.id === likedHere) : pool[0]?.p || null);
      const offBudget = pool[0]?.off && !swaps[key] && !likedHere;
      return { main, locked: !!likedHere && !swaps[key], offBudget, alts: pool.filter((x) => x.p.id !== main?.id).slice(0, 12).map((x) => x.p) };
    };
    const out = {};
    const unngaarOlje = avoid.includes("olje");
    if (unngaarOlje) {
      // Oljerens er utelukket – tilby skånsomt micellarvann som førsterens i stedet
      const micellar = allProducts.filter((p) => /micellar/i.test(p.name) && !disliked.includes(p.id) && etikkOK(p))
        .map((p) => ({ p, sc: scoreProduct(p, { ...ans, budsjett:[1,2,3,4] }, avoid.filter((a) => a !== "olje"), dislikedIngs) }))
        .filter((x) => x.sc > -100).sort((a, b) => b.sc - a.sc);
      const m = swaps["olje"] || micellar[0]?.p || null;
      out.olje = m ? { main: m, locked: false, offBudget: false, micellar: true, alts: micellar.filter((x) => x.p.id !== m.id).slice(0, 12).map((x) => x.p) } : { main: null, alts: [] };
    } else {
      out.olje = build("olje");
    }
    out.toner = build("toner");
    /* Full rangert liste for toner-lag (K-beauty layering) */
    out.tonerRanked = allProducts.filter((p) => p.cat === "toner" && !disliked.includes(p.id) && etikkOK(p))
      .map((p) => ({ p, sc: p.custom ? 999 : scoreProduct(p, ans, avoid, dislikedIngs) }))
      .filter((x) => x.sc > -100).sort((a, b) => b.sc - a.sc).map((x) => x.p);
    out.maske = build("maske");
    out.rens = build("rens");
    const erCvit = (p) => p.ings.includes("vitamin-c");
    const erFuktserum = (p) => (p.ings.includes("hyaluron") || p.ings.includes("panthenol") || p.ings.includes("centella") || p.ings.includes("mucin")) && !p.ings.some((i) => ING[i]?.sun) && !p.ings.includes("vitamin-c") && !p.ings.includes("niacinamid");
    out.serumC = build("serum", erCvit, "serumC");                       // C-vitamin / antioksidant (AM)
    out.serumAM = build("serum", (p) => isAMserum(p) && !erCvit(p), "serumAM"); // annet dagserum (f.eks. niacinamid)
    out.serumHydra = build("serum", erFuktserum, "serumHydra");              // rent fuktserum – eget trinn
    out.serumPM = build("serum", (p) => !isAMserum(p) && !erFuktserum(p), "serumPM"); // aktivt kveldsserum
    /* Skin-cycling for erfarne: både eksfoliering og retinol */
    const wantCycle = ans.alder !== "ung" && ans.toleranse !== "ny" && !ans.helse.includes("gravid") && (ans.maal === "aldring" || ans.maal === "glow") && !ans.sensList.includes("retinol") && !ans.sensList.includes("salisylsyre");
    if (wantCycle) {
      const ex = build("serum", (p) => p.ings.includes("glykolsyre") || p.ings.includes("salisylsyre"), "serumEx");
      const ret = build("serum", (p) => p.ings.includes("retinol") || p.ings.includes("bakuchiol"), "serumRet");
      if (ex.main && ret.main) { out.serumEx = ex; out.serumRet = ret; out.serumPM = { main:null }; }
    }
    out.krem = build("krem");
    out.spf = build("spf");
    /* Unngå duplikat-effekt: hvis AM og PM endte med samme hero, dropp AM */
    // Fjern duplikater på tvers av serum-slots (samme produkt skal ikke stå to steder)
    const brukteSerum = new Set();
    ["serumC","serumAM","serumHydra","serumPM","serumEx","serumRet"].forEach((k) => {
      if (out[k]?.main) { if (brukteSerum.has(out[k].main.id)) out[k] = { main:null, alts:out[k].alts || [] }; else brukteSerum.add(out[k].main.id); }
    });
    return out;
  }, [ans, liked, disliked, swaps, custom]);

  // Auto-roter: har man flere likte fuktighetskremer, legg dem automatisk i krem-rotasjonen
  useEffect(() => {
    const likteKremer = [...liked, ...custom.map((c) => c.id)].map((id) => allProducts.find((x) => x.id === id)).filter((x) => x?.cat === "krem");
    if (likteKremer.length > 1 && routine?.krem?.main) {
      const andre = likteKremer.filter((k) => k.id !== routine.krem.main.id).map((k) => k.id);
      const mangler = andre.filter((id) => !(rotations.krem || []).includes(id));
      if (mangler.length > 0) setRotations((r) => ({ ...r, krem: [...(r.krem || []), ...mangler] }));
    }
  // eslint-disable-next-line
  }, [liked, custom, routine?.krem?.main?.id]);

  /* ---- INTRO ---- */
  if (step === 0) return (
    <Shell eyebrow="Kartet til hudpleierutinen din" title="Huden din fortjener en plan, ikke en gjetning" subtitle="Ingen hype, ingen mirakler – en rutine bygget på hudtypen din, helsen din og ingredienser med dokumentert effekt.">
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
      <p className="sub" style={{fontSize:11.5, marginTop:10, color:"#8B8880"}}>Nytt verktøy under utvikling. Gir generell veiledning basert på ingredienser – ikke medisinske råd. Introduser produkter forsiktig, og rådfør deg med lege ved graviditet, hudsykdom eller tvil.</p>
      <div style={{display:"flex", gap:0}}>
        <button className="ghost" onClick={() => { setShowHow(!showHow); setShowTrust(false); setShowPersonvern(false); }}>🤖 Hvordan funker veilederen?</button>
        <button className="ghost" onClick={() => { setShowTrust(!showTrust); setShowHow(false); setShowPersonvern(false); }}>Hvorfor stole på oss? ↓</button>
      </div>
      <Kunnskapsbank />
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

  const Prog = () => <div className="prog">{[1,2,3,4,5,6,7].map((i) => <i key={i} className={i <= step ? "on" : ""} style={{width: i === step ? 34 : 26}} title={"Steg " + i} />)}</div>;

  /* ---- 1 HUDTYPE ---- */
  if (step === 1) return (
    <Shell eyebrow="Steg 1 av 7" title="Hvordan oppfører huden din seg?">
      <Prog />
      <div style={{marginBottom:10}}><span style={{fontSize:13, color:"#6B6862"}}>Usikker på hudtypen din?</span><Hjelp tekst="Enkel test: Vask ansiktet med en mild rens, og vent 1 time uten å påføre noe. Kjenn så etter: Er huden stram og flassete? Da er den tørr. Blank over hele ansiktet? Fet. Blank kun i pannen/nesen (T-sonen), men normal/tørr på kinnene? Kombinert. Ingen særlige problemer? Balansert/normal." /></div>
      {[{v:"torr",t:"Tørr",d:"Stram, flasser lett, drikker krem"},{v:"fet",t:"Fet",d:"Blank utover dagen, synlige porer"},{v:"kombi",t:"Kombinert",d:"Fet T-sone, tørre kinn"},{v:"normal",t:"Balansert",d:"Sjelden problemer, vil optimalisere"}].map((o) => (
        <button key={o.v} className={"opt" + (ans.hudtype === o.v ? " on" : "")} onClick={() => setAns({ ...ans, hudtype: o.v })}>{o.t}<small>{o.d}</small></button>
      ))}
      <div style={{fontSize:13, fontWeight:700, margin:"20px 0 6px", display:"flex", alignItems:"center"}}>Hvor gammel er du?<Hjelp tekst="Alder brukes bare til å finjustere: yngre hud trenger sjelden sterke anti-aldringsingredienser, mens modnere hud har mer nytte av fukt og retinoider. Hudtype og toleranse betyr mer enn alder – så bare velg omtrentlig aldersgruppe." /></div>
      <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
        {[{v:"ung",t:"Under 20"},{v:"20",t:"20–29"},{v:"30",t:"30–44"},{v:"45",t:"45+"}].map((o) => (
          <button key={o.v} className="chip" style={{padding:"8px 14px", background: ans.alder === o.v ? "#16130F" : "#fff", color: ans.alder === o.v ? "#fff" : "#16130F"}} onClick={() => setAns({ ...ans, alder: o.v })}>{o.t}</button>
        ))}
      </div>
      <button className="primary" onClick={() => { if (ans.hudtype && ans.alder) setStep(2); else ping("Velg hudtype og alder"); }}>Fortsett</button>
      {toast && <div className="toast">{toast}</div>}
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
      <div style={{fontSize:13, fontWeight:700, margin:"18px 0 2px", display:"flex", alignItems:"center"}}>Erfaring med aktive ingredienser (syrer/retinol)?<Hjelp tekst="«Aktive ingredienser» er de kraftige virkestoffene som syrer (AHA/BHA) og retinol/retinoider. Har du aldri brukt slike, velg «Helt ny» – da starter vi forsiktig med opptrapping. Har du brukt dem uten problemer, velg «Litt erfaren». Bruker du dem jevnlig og tåler dem godt, velg «Skin-geek»." /></div>
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
      <div style={{marginTop:8}}><Hjelp tekst="Reagerer huden på oljer – for eksempel med eksem, perioral dermatitt eller tette porer? Velg «Oljer», så holder vi renseoljer, ansiktsoljer og oljebaserte produkter (inkl. skvalan) helt ute av rutinen din, og foreslår vannbaserte alternativer i stedet." /></div>
      <button className="primary" onClick={() => setStep(5)}>{ans.sensList.length ? "Fortsett" : "Ingen kjente – fortsett"}</button>
      <button className="ghost" onClick={() => setStep(step - 1)}>← Tilbake</button>
    </Shell>
  );

  /* ---- 5 MÅL ---- */
  if (step === 5) return (
    <Shell eyebrow="Steg 5 av 7" title="Hva er hovedmålet ditt?">
      <Prog />
      {GOALS.map((o) => (
        <button key={o.v} className={"opt" + (ans.maal === o.v ? " on" : "")} onClick={() => setAns({ ...ans, maal: o.v })}>{o.t}<small>{o.d}</small></button>
      ))}
      <div className="note" style={{maxWidth:430, margin:"14px auto 0"}}>💡 <b>Psst:</b> Konsistens slår skippertak. Det du gjør hver dag betyr mer enn en intens kur hver tredje uke.</div>
      <button className="primary" onClick={() => { if (ans.maal) setStep(6); else ping("Velg ett svar"); }}>Fortsett</button>
      <button className="ghost" onClick={() => setStep(step - 1)}>← Tilbake</button>
      {toast && <div className="toast">{toast}</div>}
      {toast && <div className="toast">{toast}</div>}
    </Shell>
  );

  /* ---- 6 BUDSJETT ---- */
  if (step === 6) return (
    <Shell eyebrow="Steg 6 av 7" title="Hvilket nivå skal vi handle på?">
      <Prog />
      <p className="sub" style={{fontSize:13, marginBottom:6}}>Velg ett eller flere prisnivåer – merkene under er bare eksempler, ikke en fasit. Mange kombinerer billig rens med dyrere serum. Vi finner beste match i nivåene du åpner for.</p>
      {[{v:1,t:"Smart budsjett",d:"Rimelig og effektivt. F.eks. The Ordinary, COSRX, The Inkey List, Byoma"},{v:4,t:"Apotek",d:"Dermatolog-testet, ofte for sensitiv hud. F.eks. La Roche-Posay, Avène, CeraVe, Eucerin, Bioderma"},{v:2,t:"Mellomsjikt",d:"F.eks. Paula's Choice, Klairs, Pixi, Naturium, Beauty of Joseon"},{v:3,t:"Luksus",d:"F.eks. Tatcha, Medik8, Drunk Elephant, Herbivore"}].map((o) => (
        <button key={o.v} className={"opt" + (ans.budsjett.includes(o.v) ? " on" : "")} onClick={() => setAns({ ...ans, budsjett: ans.budsjett.includes(o.v) ? ans.budsjett.filter((x) => x !== o.v) : [...ans.budsjett, o.v] })}>{o.t}<small>{o.d}</small></button>
      ))}
      <button className="primary" onClick={() => { if (ans.budsjett.length) setStep(7); else ping("Velg minst ett nivå"); }}>Fortsett</button>
      {toast && <div className="toast">{toast}</div>}
      <div className="note" style={{maxWidth:430, margin:"14px auto 0"}}>🐇 <b>Vi viser aldri merker vi vet tester på dyr.</b> Vil du ha den strengeste garantien, kan du filtrere på Leaping Bunny-sertifisering nedenfor – den gullstandarden reviderer hele leverandørkjeden.</div>
      <div className="note" style={{maxWidth:430, margin:"14px auto 0"}}>💡 <b>Myteknuser:</b> Dyrere er ikke bedre. Pris er ofte merkevarestrategi – huden bryr seg om ingrediensene, ikke prislappen.</div>
      {toast && <div className="toast">{toast}</div>}
      <div style={{maxWidth:430, margin:"14px auto 0"}}>
        <div style={{fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#8B8880", marginBottom:4}}>Flere valg (valgfritt)</div>
        {[["lb","🐇 Kun Leaping Bunny-sertifisert","Strengeste dyretestfri-garantien – reviderer hele leverandørkjeden. Skjuler merker uten sertifikat."],["vegan","🌱 Kun veganske produkter","Uten animalske ingredienser som sneglemucin, honning og lanolin"],["parfymefri","🌸 Parfymefritt","Duft er en vanlig årsak til hudreaksjoner"]].map(([v,t,d]) => (
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
          <div style={{fontSize:13, fontWeight:700}}>Lim inn ingredienslisten til «{addingCat.navn}»</div>
          <div style={{fontSize:12, color:"#6B6862", marginTop:2}}>Kopier hele INCI-listen fra produktsiden (f.eks. KICKS, incidecoder.com eller baksiden), lim inn her, og vi gjenkjenner de aktive ingrediensene automatisk – inkludert derivater som «Ascorbyl Glucoside» (vitamin C).</div>
          <textarea className="search" style={{marginTop:8, minHeight:80, resize:"vertical", fontFamily:"inherit"}} placeholder="Aqua, Ascorbyl Glucoside, Propanediol, Niacinamide, ..." value={inciTekst} onChange={(e) => { setInciTekst(e.target.value); setInciTreff(matchINCI(e.target.value)); }} />
          {inciTreff.length > 0 && (
            <div style={{marginTop:10}}>
              <div style={{fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"#8B8880"}}>Aktive ingredienser gjenkjent ({inciTreff.length}) – huk av det som skal telle i analysen:</div>
              <div style={{marginTop:6}}>
                {inciTreff.map((k) => (
                  <button key={k} className="chip" style={{background: custIngs.includes(k) ? "#16130F" : "#fff", color: custIngs.includes(k) ? "#fff" : "#16130F"}} onClick={() => setCustIngs(custIngs.includes(k) ? custIngs.filter((x) => x !== k) : [...custIngs, k])}>{custIngs.includes(k) ? "✓ " : "+ "}{nvn(k)}</button>
                ))}
              </div>
            </div>
          )}
          {inciTekst.length > 10 && (() => { const full = analyserFullListe(inciTekst); const kjent = full.filter((x) => x.info); return kjent.length > 0 && (
            <div style={{marginTop:12, paddingTop:10, borderTop:"1px solid #E4E1DA"}}>
              <div style={{fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"#8B8880", marginBottom:6}}>Hele lista forklart ({kjent.length} av {full.length} gjenkjent)</div>
              {full.map((x, i) => (
                <div key={i} style={{display:"flex", gap:8, padding:"6px 0", borderBottom:"1px solid #F0EEE8", fontSize:12.5, alignItems:"flex-start"}}>
                  <span style={{minWidth:130, fontWeight:600, color: x.info ? "#16130F" : "#B8B4AA"}}>{x.info ? x.info.navn : x.raa}</span>
                  {x.info ? <span style={{flex:1, color:"#4A4842"}}><b style={{fontSize:10, letterSpacing:".06em", textTransform:"uppercase", color:"#8B8880"}}>{x.info.rolle}</b> · {x.info.d}</span> : <span style={{flex:1, color:"#B8B4AA", fontStyle:"italic"}}>{x.raa} – ikke i databasen ennå</span>}
                </div>
              ))}
              <div style={{fontSize:11, color:"#8B8880", marginTop:8, fontStyle:"italic"}}>Aktive ingredienser påvirker rutine-analysen. Støtteingredienser (fuktbindere, emulgatorer, konservering) er med for kunnskapens skyld – de forteller hva produktet ellers inneholder og hvorfor.</div>
            </div>
          ); })()}
          {inciTekst.length > 20 && inciTreff.length === 0 && <div className="note" style={{marginTop:8}}>Ingen aktive ingredienser gjenkjent – produktet er nok en fukt-/støtteformel. Det kan fortsatt legges inn som eget steg.</div>}
          <div style={{marginTop:10, fontSize:11, color:"#8B8880"}}>Eller velg manuelt:</div>
          <div style={{marginTop:4}}>
            {Object.keys(ING).map((k) => (
              <button key={k} className="chip" style={{padding:"4px 9px", background: custIngs.includes(k) ? "#16130F" : "#fff", color: custIngs.includes(k) ? "#fff" : "#16130F"}} onClick={() => setCustIngs(custIngs.includes(k) ? custIngs.filter((x) => x !== k) : [...custIngs, k])}>{custIngs.includes(k) ? "✓ " : "+ "}{nvn(k)}</button>
            ))}
          </div>
          <button className="primary" style={{marginTop:12}} onClick={() => {
            const np = { id:"cu"+Date.now(), cat:addingCat.cat, name:addingCat.navn, brand:"Ditt produkt", tier:(ans.budsjett && ans.budsjett[0]) || 2, ings:custIngs, for:["torr","fet","kombi","normal","sens"], custom:true, hue:"#EFEDE6", vg:true, inci:inciTekst };
            setCustom([...custom, np]); setQ(""); setAddingCat(null); setCustIngs([]); setInciTekst(""); setInciTreff([]);
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

  const order = [
    { cat:"olje", label: routine?.olje?.micellar ? "Micellarvann (dobbelrens steg 1)" : "Oljerens (dobbelrens steg 1)", when: routine?.olje?.micellar ? "PM · skånsom, oljefri fjerning av SPF og sminke" : "PM · løser opp SPF og sminke", n:NYBEGYNNER.olje },
    { cat:"rens", label:"Rens (dobbelrens steg 2)", when:"PM · om morgenen holder lunkent vann", n:NYBEGYNNER.rens },
    ...(routine?.serumC?.main ? [{ cat:"serumC", label:"C-vitamin / antioksidant", when:"AM – antioksidant-skjold under solkremen", n:NYBEGYNNER.serum }] : []),
    ...(routine?.serumAM?.main ? [{ cat:"serumAM", label:"Dagserum", when:"AM – etter C-vitamin", n:NYBEGYNNER.serum }] : []),
    ...(routine?.serumHydra?.main ? [{ cat:"serumHydra", label:"Fuktserum", when:"AM + PM – hydrerende lag", n:NYBEGYNNER.serum }] : []),
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

  const DAGER = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];
  const GOALNAVN = { kviser:"Kviser", glow:"Glød", aldring:"Linjer", ro:"Roe hud" };
  const HUDNAVN = { torr:"Tørr", fet:"Fet", kombi:"Kombinert", normal:"Balansert" };

  return (
    <div className="page"><style>{css}</style><div className="wrap" style={{maxWidth:1140}}>
      <div className="eyebrow">{lockedIn ? "Din faste rutine" : "Din personlige rutine"}</div>
      <h1>{lockedIn ? "Rutinen din, klar til bruk" : "Rutinen, kuratert for deg"}</h1>

      <div style={{display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", marginTop:10}}>
        <span className="chip" onClick={() => setStep(1)}>🧬 {HUDNAVN[ans.hudtype]} ✎</span>
        <span className="chip" onClick={() => setStep(3)}>🌡️ Sensitiv: {ans.sensitiv} ✎</span>
        <span className="chip" onClick={() => setStep(5)}>🎯 {GOALNAVN[ans.maal]} ✎</span>
        <span className="chip" onClick={() => setStep(6)}>💳 Nivå {ans.budsjett.join("+")} ✎</span>
        <span className="chip" onClick={() => setStep(7)}>♥ Produkter ✎</span>
      </div>
      <p className="sub" style={{marginTop:10}}>
        {ans.sensitiv === "ja" || ans.helse.length ? "Introduser ETT nytt produkt om gangen, 3–4 dager mellom hver." : "Introduser gjerne ett produkt om gangen, så vet du hva som virker."}
        {ans.sensList.length > 0 && ` Alt er fritt for: ${ans.sensList.map(nvn).join(", ")}.`}
        {ans.etikk?.includes("lb") && " Kun Leaping Bunny-sertifiserte merker."}
        {ans.etikk?.includes("vegan") && " Kun veganske produkter."}
      </p>

      {ans.helse.includes("gravid") && <div className="note" style={{maxWidth:460, margin:"12px auto 0"}}>🤰 Tilpasset graviditet/amming: uten retinol og sterke syrer.</div>}
      {ans.alder === "ung" && <div className="note" style={{maxWidth:460, margin:"12px auto 0"}}>🌱 Tilpasset ung hud: fokus på mild rensing, fukt og solkrem. Vi holder igjen på retinol og sterke anti-aldringssyrer – ung hud fornyer seg raskt selv og trenger dem sjelden. Har du kviser, er mild BHA (salisylsyre) trygt. Er du under 18 og vurderer aktive ingredienser, snakk gjerne med en voksen eller lege først.</div>}
      {ans.alder === "45" && <div className="note" style={{maxWidth:460, margin:"12px auto 0"}}>🌿 Tilpasset modnere hud: ekstra vekt på fukt, barrierestøtte (ceramider, hyaluron) og dokumenterte anti-aldringsingredienser som retinoider og peptider. Aktive syrer times gjerne litt forsiktigere når huden er tørrere.</div>}
      {(ans.helse.includes("hudsykdom") || ans.helse.includes("behandling") || ans.helse.includes("hormon")) && <div className="warn" style={{maxWidth:460, margin:"12px auto 0"}}>⚕️ Med helsesituasjonen du oppga: vis denne rutinen til lege/dermatolog før du starter. Generell veiledning erstatter ikke medisinsk vurdering.</div>}

      <div style={{height:10}} />

      {/* OPPSUMMERING */}
      <div className="stepcard" style={{marginTop:0, marginBottom:14, borderColor:"#16130F"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8}}>
          <div style={{fontFamily:"'Fraunces',serif", fontSize:21}}>Rutinen din, oppsummert 💡</div>
          <div style={{display:"flex", gap:4, alignItems:"center"}}>
            {visOpps && [[1,"Helt enkelt"],[2,"Litt nerdete"],[3,"Full nerd 🤓"]].map(([v,t]) => (
              <button key={v} className="altbtn" style={{width:"auto", marginTop:0, padding:"6px 10px", background: oppsNivaa === v ? "#16130F" : undefined, color: oppsNivaa === v ? "#fff" : undefined}} onClick={() => setOppsNivaa(v)}>{t}</button>
            ))}
            <button className="mini" onClick={() => setVisOpps(!visOpps)}>{visOpps ? "Skjul" : "Vis"}</button>
          </div>
        </div>
        {visOpps && (<>
        <p style={{fontSize:13.5, lineHeight:1.7, color:"#4A4842", margin:"10px 0 0"}}>{oppsummering(oppsNivaa, routine, ans, cycling)}</p>
        <div style={{marginTop:12, paddingTop:12, borderTop:"1px solid #E4E1DA"}}>
          <div style={{fontSize:12, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#8B8880", marginBottom:8}}>Hva kan du forvente?</div>
          {[["Uke 1–2","Huden venner seg til. Litt tørrhet eller lett svie av aktive ingredienser er normalt – gå saktere hvis det svir.","🌱"],["Uke 3–4","Jevnere tekstur og fukt. Ta et bilde nå og sammenlign med dag 1 – endringer er lettere å se enn å huske.","📸"],["Uke 8–12","Her kommer de større resultatene: glød, jevnere tone, mindre urenheter."+ (routine.serumPM?.main?.ings.includes("retinol") || cycling ? " Retinol viser effekt på fine linjer først nå – tålmodighet lønner seg." : ""),"✨"],["Løpende","Solkrem hver dag er det som avgjør om resten virker. Uten den jobber du i motbakke.","☀️"]].map(([t,d,e],i) => (
            <div key={i} style={{display:"flex", gap:10, marginTop:8, alignItems:"flex-start"}}>
              <span style={{fontSize:18}}>{e}</span>
              <div><b style={{fontSize:13}}>{t}:</b> <span style={{fontSize:13, color:"#4A4842"}}>{d}</span></div>
            </div>
          ))}
          <div style={{fontSize:11.5, color:"#8B8880", marginTop:10, fontStyle:"italic"}}>Hud er individuelt – dette er typiske forløp, ikke løfter. Ser du vedvarende irritasjon, ta en pause og rådfør deg med lege/hudpleier.</div>
        </div>
        </>)}
      </div>

      {(() => {
        // Samle faktiske produkter i rutinen (respekterer bytter og rotasjon)
        const iRutinen = [];
        order.forEach((o) => { const sl = o.tslot !== undefined ? tonerSlots[o.tslot] : routine[o.cat]; if (sl?.main) iRutinen.push(sl.main); (rotations[o.cat] || []).forEach((id) => { const rp = allProducts.find((x) => x.id === id); if (rp) iRutinen.push(rp); }); });
        const konflikter = finnKonflikter(iRutinen, cycling);
        return konflikter.length > 0 && (
          <div className={konflikter.some((k) => k.niva === "advarsel") ? "warn" : "note"} style={{marginBottom:14}}>
            <div style={{fontWeight:700, marginBottom:6}}>{konflikter.some((k) => k.niva === "advarsel") ? "⚠️ Sjekk kombinasjonene dine" : "ℹ️ Om kombinasjonene dine"}</div>
            {konflikter.map((k, i) => (
              <p key={i} style={{margin: i === konflikter.length - 1 ? 0 : "0 0 8px", fontSize:13, lineHeight:1.55}}>{k.niva === "advarsel" ? "⚠️ " : "• "}{k.tekst}</p>
            ))}
          </div>
        );
      })()}

      {(() => { const totalt = order.filter((o) => (o.tslot !== undefined ? tonerSlots[o.tslot] : routine[o.cat])?.main).length; const ferdig = order.filter((o) => stegFerdig[o.cat]).length; return ferdig > 0 && (
        <div className="note" style={{display:"flex", justifyContent:"space-between", alignItems:"center", background:"#EAF4E6"}}>
          <span style={{fontSize:13}}>✓ <b>{ferdig} av {totalt}</b> steg lagret{ferdig === totalt ? " – rutinen din er komplett! 🎉" : ""}</span>
          <button className="mini" onClick={() => { setStegFerdig({}); setApneSteg(null); }}>Åpne alle igjen</button>
        </div>
      ); })()}
      <div style={{display:"flex", justifyContent:"flex-end", marginBottom:8}}>
        <button className="mini" onClick={() => setApneSteg(apneSteg === "ALLE" ? null : "ALLE")}>{apneSteg === "ALLE" ? "▤ Vis ett steg av gangen" : "▦ Vis alle steg samtidig"}</button>
      </div>
      {order.map((o, i) => {
        const slot = o.tslot !== undefined ? tonerSlots[o.tslot] : routine[o.cat];
        if (!slot?.main) return null;
        const p = slot.main;
        if (stegFerdig[o.cat]) return (
          <div key={o.cat} className="stepcard" style={{opacity:0.62, padding:"12px 16px"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:8}}>
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <span style={{fontSize:18, color:"#4A8B5C"}}>✓</span>
                <div>
                  <span style={{fontSize:10, letterSpacing:".1em", textTransform:"uppercase", fontWeight:700, color:"#8B8880"}}>{(o.label.split("(")[0]).trim()}</span>
                  <div style={{fontSize:13}}><b>{p.brand}</b> {p.name}</div>
                </div>
              </div>
              <button className="mini" onClick={() => setStegFerdig({ ...stegFerdig, [o.cat]: false })}>Endre</button>
            </div>
          </div>
        );
        // Accordion: hvilket steg er "åpent"? Default = første ikke-ferdige. Bruker kan overstyre.
        const forsteApne = order.find((oo) => { const sl = oo.tslot !== undefined ? tonerSlots[oo.tslot] : routine[oo.cat]; return sl?.main && !stegFerdig[oo.cat]; });
        const aktivtApent = apneSteg || forsteApne?.cat;
        const erApent = o.cat === aktivtApent || apneSteg === "ALLE";
        if (!erApent) return (
          <div key={o.cat} className="stepcard" style={{padding:"12px 16px", cursor:"pointer"}} onClick={() => setApneSteg(o.cat)}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:8}}>
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <span style={{fontFamily:"'Fraunces',serif", fontSize:15, color:coral, fontWeight:600}}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <span style={{fontSize:10, letterSpacing:".1em", textTransform:"uppercase", fontWeight:700, color:"#8B8880"}}>{(o.label.split("(")[0]).trim()}</span>
                  <div style={{fontSize:13, color:"#6B6862"}}><b>{p.brand}</b> {p.name}</div>
                </div>
              </div>
              <span style={{fontSize:12, color:"#8B8880"}}>Åpne ↓</span>
            </div>
          </div>
        );
        return (
          <div key={o.cat} className="stepcard">
            <div style={{display:"flex", gap:14, alignItems:"flex-start"}}>
              <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:6}}>
                <div style={{fontFamily:"'Fraunces',serif", fontSize:17, color:coral, fontWeight:600}}>{String(i + 1).padStart(2, "0")}</div>
                <Flaske p={p} />
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex", justifyContent:"space-between", gap:8, alignItems:"flex-start", flexWrap:"wrap"}}>
                  <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
                    <span style={{fontFamily:"'Fraunces',serif", fontSize:17, fontWeight:600, color:"#16130F"}}>{(o.label.split("(")[0]).trim()}</span>
                    <span style={{fontSize:10, letterSpacing:".1em", textTransform:"uppercase", fontWeight:700, color:"#8B8880", background:"#F3F0EA", borderRadius:20, padding:"2px 9px"}}>{(o.when.split("·")[0]).trim()}</span>
                  </div>
                  <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                    {p.vg && <span className="ingtag" style={{background:"#EAF4E6", cursor:"default", fontSize:11}} title="Vegansk – ingen animalske ingredienser">🌱</span>}
                    {p.cf && <span className="ingtag" style={{background:"#EAF4E6", cursor:"default", fontSize:11}} title="Leaping Bunny – dyretestfri">🐇</span>}
                    {slot.locked && <span className="badge">Favoritt</span>}
                    {slot.offBudget && <span className="ingtag" style={{background:"#FFF3EC", cursor:"default", fontSize:11}} title="Ingen match i valgt prisnivå – viser beste alternativ">ⓘ</span>}
                  </div>
                </div>
                <div style={{marginTop:6}}><span className="pbrand">{p.brand}</span> <span className="pname">{p.name}</span></div>
                <div style={{fontSize:12.5, color:"#8B8880", marginTop:2}}>{o.when}</div>
                <div style={{fontSize:13, color:"#6B6862", marginTop:6, lineHeight:1.55}}>{whyText(p, ans)} <button className="learn" onClick={() => setOpenAnalyse(openAnalyse === o.cat ? null : o.cat)}>{openAnalyse === o.cat ? "Skjul" : "Lær mer →"}</button></div>
                {openAnalyse === o.cat && (
                  <div className="note">
                    <b>🤖 Slik ble dette produktet valgt</b>
                    <div style={{marginTop:4}}>Svarene dine kjøres gjennom en analysemodell som scorer hvert produkt på ingredienser, hudtype-kompatibilitet, sensitivitet og målet ditt. Høyest score vinner – ingen kan betale seg forbi:</div>
                    {analyse(p, ans).map(([t, v], j) => <div key={j} style={{display:"flex", justifyContent:"space-between", marginTop:3}}><span>{t}</span><b>{v}</b></div>)}
                    <div style={{marginTop:6, fontSize:11.5, color:"#8B8880"}}>Hele regelverket er åpent – KI brukes til analyse og matching, aldri til å skjule sponsing. Uenig i et valg? «Passer ikke meg»-knappen lærer modellen dine preferanser.</div>
                  </div>
                )}
                {(rotations[o.cat] || []).length > 0 && (
                  <div className="note" style={{background:"#F3F0FF"}}>🔄 <b>Veksler mellom disse ({(rotations[o.cat].length) + 1} produkter):</b> {rotations[o.cat].map((id) => { const rp = allProducts.find((x) => x.id === id); return rp && <span key={id} className="chip" style={{padding:"3px 9px"}} onClick={() => setRotations({ ...rotations, [o.cat]: rotations[o.cat].filter((x) => x !== id) })}>{rp.brand} {rp.name} ✕</span>; })} Ukeplanen bruker et nytt produkt hver dag. Trykk ✕ for å ta ut. {o.cat.startsWith("serum") ? "For aktive syrer/retinol: hold syklusen så du ikke stabler dem samme kveld." : "Fukt, toner og krem kan roteres fritt."}</div>
                )}
                <div className="note">🧑‍🎓 <b>{o.n.amount}:</b> {o.n.how}</div>
                {o.cat === "serumPM" && freqText(p) && <div className="note">📅 <b>Hvor ofte:</b> {freqText(p)}</div>}
                {evidensNote(p) && <div className="note" style={{background:"#FFF6E5"}}>💡 <b>Ærlig om effekt:</b> {evidensNote(p)}</div>}
                {retinoidNiva(p) && (() => { const rn = retinoidNiva(p); const farge = rn.styrke === "mild" ? "#E2F3D5" : rn.styrke === "sterk" ? "#FFD1D1" : "#FFE0C7"; return <div className="note" style={{background:farge}}>🅰️ <b>Vitamin A-type: {rn.navn}.</b> {rn.niva === 0 ? "Bakuchiol er ikke en ekte retinoid, men et plantestoff som gir liknende effekt med minimal irritasjon – et godt startpunkt for sensitiv hud." : rn.niva === 1 ? "Retinylestere er det mildeste trinnet på retinoid-stigen – bra for førstegangsbrukere og sensitiv hud, men virker saktere." : rn.niva === 2 ? "Retinol er «gullstandarden» for nybegynnere: god effekt, håndterbar irritasjon. Start 2–3 kvelder/uke og bygg opp." : rn.niva === 3 ? "Retinaldehyd (retinal) er ett steg sterkere enn retinol og virker raskere – men kan irritere mer. Bygg opp forsiktig." : "Tretinoin er reseptbelagt retinsyre – sterkest og virker umiddelbart. Brukes under veiledning av lege/hudlege."}{" "}<a className="learn" href="https://pubmed.ncbi.nlm.nih.gov/9284094/" target="_blank" rel="noreferrer">Se forskning på retinoid-potens →</a></div>; })()}
                {aktivStyrke(p) && (() => { const st = aktivStyrke(p); const farge = { "mild":"#E2F3D5", "mild-moderat":"#FFF2BD", "moderat":"#FFE0C7", "sterk":"#FFD1D1" }[st.niva]; return <div className="note" style={{background:farge}}>💪 <b>Styrke: {st.niva}{st.pct ? ` (~${st.pct}%)` : ""}.</b> {st.tekst}</div>; })()}
                {o.cat.startsWith("tonerL") && erAktivEksfoliant(p) && <div className="sunwarn">🧪 <b>OBS – aktiv syre-toner:</b> Denne toneren inneholder eksfolierende syrer (AHA/BHA). Behandle den som et aktivt trinn: bruk den om kvelden, ikke samme kveld som retinol eller et annet syre-produkt, og bruk SPF dagen etter. Kjører du skin-cycling, legg denne på syre-kvelden.</div>}
                {o.cat === "serumPM" && sunWarning(p) && <div className="sunwarn">☀️ <b>Solvarsel:</b> Denne ingrediensen gjør huden mer solfølsom i flere uker. Solkrem SPF 30+ hver dag er ikke valgfritt – uten den kan du få pigmentflekker og skade i stedet for effekt. Vent med oppstart hvis du skal på solferie.</div>}
                {o.cat === "spf" && <div className="note">☀️ <b>Hvorfor så viktig?</b> UV-stråler står for opptil 80 % av synlig hudaldring – og SPF beskytter mot hudkreft. Solkremen er limet som gjør at resten av rutinen virker.</div>}
                <div style={{marginTop:8}}>
                  {p.ings.map((ing) => <span key={ing} className="ingtag" onClick={() => { setOpenIng(openIng === ing ? null : ing); setDeepIng(null); }}>{nvn(ing)}</span>)}
                  {p.inci && <span className="ingtag" style={{background: openFullIng === p.id ? "#16130F" : "#F0EEE8", color: openFullIng === p.id ? "#fff" : "#16130F"}} onClick={() => setOpenFullIng(openFullIng === p.id ? null : p.id)}>🔬 {openFullIng === p.id ? "Skjul" : "Forklar hele lista"}</span>}
                </div>
                {openFullIng === p.id && p.inci && (
                  <div className="note" style={{marginTop:6}}>
                    <div style={{fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"#8B8880", marginBottom:6}}>Ingredienslista forklart</div>
                    {analyserFullListe(p.inci).map((x, ix) => (
                      <div key={ix} style={{display:"flex", gap:8, padding:"5px 0", borderBottom:"1px solid #EDEAE3", fontSize:12.5, alignItems:"flex-start"}}>
                        <span style={{minWidth:120, fontWeight:600, color: x.info ? "#16130F" : "#B8B4AA"}}>{x.info ? x.info.navn : x.raa}</span>
                        {x.info ? <span style={{flex:1, color:"#4A4842"}}><b style={{fontSize:10, letterSpacing:".05em", textTransform:"uppercase", color:"#8B8880"}}>{x.info.rolle}</b> · {x.info.d}</span> : <span style={{flex:1, color:"#B8B4AA", fontStyle:"italic"}}>ikke i databasen ennå</span>}
                      </div>
                    ))}
                  </div>
                )}
                {openIng && p.ings.includes(openIng) && (
                  <div className="note">
                    <b>{nvn(openIng)}</b> – {ING[openIng].s}.
                    {deepIng === openIng
                      ? <><div style={{marginTop:6}}>{ING[openIng].d}</div>{ING[openIng].u && <a className="learn" href={ING[openIng].u} target="_blank" rel="noreferrer" style={{display:"inline-block", marginTop:6}}>📄 Se forskningen på PubMed →</a>}</>
                      : <button className="learn" style={{marginLeft:6}} onClick={() => setDeepIng(openIng)}>Lær mer →</button>}
                  </div>
                )}
                {(() => {
                  // Dine egne/likte produkter i samme kategori som kan roteres inn
                  const mineIKat = [...liked, ...custom.map((c) => c.id)]
                    .map((id) => allProducts.find((x) => x.id === id))
                    .filter((x) => x && x.cat === (o.tslot !== undefined ? "toner" : o.cat.replace(/AM|PM/, "")) && x.id !== p.id && !(rotations[o.cat] || []).includes(x.id));
                  return mineIKat.length > 0 && (
                    <div className="note" style={{background:"#F3F0FF"}}>
                      🔄 <b>Roter inn dine egne:</b> Du har flere produkter i denne kategorien.
                      {" "}{mineIKat.map((mp) => <button key={mp.id} className="chip" style={{padding:"3px 9px"}} onClick={() => { const r = rotations[o.cat] || []; setRotations({ ...rotations, [o.cat]: [...r, mp.id] }); ping("Lagt i rotasjon 🔄"); }}>+ {mp.brand} {mp.name}</button>)}
                      {(o.cat === "krem" || o.cat === "rens") && <div style={{marginTop:6, fontSize:11.5, fontStyle:"italic", color:"#6B6862"}}>💡 Tips: {o.cat === "krem" ? "Har kremene ulik funksjon (f.eks. lett gel-krem vs. tykk barriere-krem), er det ofte smartest å bruke riktig krem etter behov – lett når huden er i balanse, rik når den er tørr/irritert – heller enn fast rotasjon. Har de lik funksjon, roter fritt." : "Renseprodukter kan trygt veksles etter behov."}</div>}
                    </div>
                  );
                })()}
                {!lockedIn && slot.alts.length > 0 && (() => {
                  const BEHOV = [
                    { k:"sensitiv", t:"Skånsom / sensitiv-trygg", test:(p)=>p.for?.includes("sens") && !STERKE.some((s)=>p.ings?.includes(s)) },
                    { k:"oljefri", t:"Oljefri", test:(p)=>p.cat!=="olje" && !p.ings?.includes("skvalan") && !/\bolje\b|\boil\b/i.test(p.name) },
                    { k:"parfymefri", t:"Parfymefri", test:(p)=>p.pf === true || p.brand==="La Roche-Posay" || p.brand==="Avène" || p.brand==="CeraVe" || p.brand==="Bioderma" },
                    { k:"rimelig", t:"Rimeligere", test:(p)=>p.tier <= 2 },
                    { k:"vegansk", t:"Vegansk", test:(p)=>p.vg === true },
                    { k:"kbeauty", t:"K-beauty", test:(p)=>KBEAUTY.includes(p.brand) },
                  ];
                  const aktivt = behovFilter[o.cat];
                  let vis = slot.alts;
                  if (aktivt) { const f = BEHOV.find((b)=>b.k===aktivt); if (f) vis = slot.alts.filter(f.test); }
                  const antall = visFlere[o.cat] ? vis.length : 3;
                  return (
                  <div style={{marginTop:10}}>
                    <div style={{fontSize:10.5, letterSpacing:".1em", textTransform:"uppercase", color:"#8B8880", fontWeight:700}}>Liker du ikke forslaget? Bytt, eller filtrer på behov:</div>
                    <div style={{display:"flex", gap:5, flexWrap:"wrap", margin:"8px 0"}}>
                      {BEHOV.map((b) => {
                        const paa = aktivt === b.k;
                        const treff = slot.alts.filter(b.test).length;
                        if (treff === 0 && !paa) return null;
                        return <button key={b.k} onClick={() => { setBehovFilter({ ...behovFilter, [o.cat]: paa ? null : b.k }); setVisFlere({ ...visFlere, [o.cat]: true }); }} style={{fontSize:11.5, padding:"5px 11px", borderRadius:20, border:"1px solid " + (paa ? "#16130F" : "#D8D4CC"), background: paa ? "#16130F" : "#fff", color: paa ? "#fff" : "#4A4842", cursor:"pointer", fontWeight:500}}>{paa ? "✓ " : ""}{b.t}</button>;
                      })}
                    </div>
                    {vis.length === 0 && <div style={{fontSize:12, color:"#8B8880", fontStyle:"italic", marginBottom:6}}>Fant ingen som matcher akkurat dette behovet i databasen. Prøv et annet filter, eller legg til ditt eget produkt under.</div>}
                    <div style={{fontSize:11, color:"#8B8880", marginBottom:6}}>«Bytt» erstatter produktet. «+ Roter» lar deg veksle mellom flere i ukeplanen.</div>
                    {vis.slice(0, antall).map((a) => (
                      <div key={a.id} style={{display:"flex", gap:4, marginBottom:4}}>
                        <button className="altbtn" style={{flex:1, marginTop:0}} onClick={() => { setSwaps({ ...swaps, [o.cat]: a }); ping("Byttet til " + a.brand + " " + a.name + " ✓"); }}>↺ Bytt til {a.brand} — {a.name}</button>
                        <button className="altbtn" style={{width:"auto", whiteSpace:"nowrap", marginTop:0}} title="Legg dette produktet i rotasjon – ukeplanen veksler mellom produktene dine dag for dag" onClick={() => { const r = rotations[o.cat] || []; if (!r.includes(a.id)) setRotations({ ...rotations, [o.cat]: [...r, a.id] }); ping("Lagt i rotasjon – ukeplanen veksler nå 🔄"); }}>+ Roter</button>
                      </div>
                    ))}
                    {vis.length > antall && (
                      <button className="mini" onClick={() => setVisFlere({ ...visFlere, [o.cat]: true })}>Vis flere forslag ({vis.length - antall} til) ↓</button>
                    )}
                  </div>
                  );
                })()}
                {!lockedIn && (() => { const kat = o.tslot !== undefined ? "toner" : o.cat.replace(/AM|PM/, ""); const ek = egetForslag[o.cat]; return (
                  <div style={{marginTop:8}}>
                    {!ek ? (
                      <button className="mini" onClick={() => setEgetForslag({ ...egetForslag, [o.cat]: { navn:"", inci:"", ings:[] } })}>+ Ingen passer – legg til mitt eget produkt her</button>
                    ) : (
                      <div className="note" style={{background:"#F3F0FF"}}>
                        <div style={{fontSize:12.5, fontWeight:700, marginBottom:6}}>Ditt eget produkt til «{(o.label.split("(")[0]).trim()}»</div>
                        <input className="search" style={{marginTop:0, marginBottom:6}} placeholder="Søk i databasen, eller skriv produktnavn..." value={ek.navn} onChange={(e) => setEgetForslag({ ...egetForslag, [o.cat]: { ...ek, navn: e.target.value } })} />
                        {ek.navn.trim().length >= 2 && (() => {
                          const treff = allProducts.filter((x) => !x.custom && (x.brand + " " + x.name).toLowerCase().includes(ek.navn.toLowerCase())).slice(0, 5);
                          return treff.length > 0 && (
                            <div style={{marginBottom:8}}>
                              <div style={{fontSize:10.5, letterSpacing:".08em", textTransform:"uppercase", color:"#8B8880", fontWeight:700, marginBottom:4}}>Funnet i databasen – trykk for å velge:</div>
                              {treff.map((x) => (
                                <button key={x.id} className="altbtn" style={{textAlign:"left"}} onClick={() => { setSwaps({ ...swaps, [o.cat]: x }); setEgetForslag({ ...egetForslag, [o.cat]: null }); ping("Valgt: " + x.brand + " " + x.name + " ✓"); }}>↺ {x.brand} — {x.name} {x.cat !== kat && <span style={{color:"#C0392B", fontSize:11}}>· ({x.cat})</span>}</button>
                              ))}
                            </div>
                          );
                        })()}
                        <textarea className="search" style={{minHeight:60, resize:"vertical", fontFamily:"inherit"}} placeholder="Finner du det ikke? Lim inn ingredienslisten (valgfritt) – vi gjenkjenner de aktive automatisk" value={ek.inci} onChange={(e) => setEgetForslag({ ...egetForslag, [o.cat]: { ...ek, inci: e.target.value, ings: matchINCI(e.target.value) } })} />
                        {ek.ings.length > 0 && <div style={{marginTop:6, fontSize:12}}>Gjenkjent: {ek.ings.map(nvn).join(", ")}</div>}
                        <div style={{display:"flex", gap:6, marginTop:8}}>
                          <button className="primary" style={{width:"auto", marginTop:0}} disabled={!ek.navn.trim()} onClick={() => {
                            const np = { id:"cu"+Date.now(), cat:kat, name:ek.navn, brand:"Ditt produkt", tier:(ans.budsjett && ans.budsjett[0]) || 2, ings:ek.ings, for:["torr","fet","kombi","normal","sens"], custom:true, hue:"#EFEDE6", vg:true, inci:ek.inci };
                            setCustom([...custom, np]); setSwaps({ ...swaps, [o.cat]: np }); setEgetForslag({ ...egetForslag, [o.cat]: null });
                            ping("Ditt produkt er lagt inn i dette steget ✓");
                          }}>Bruk som eget produkt</button>
                          <button className="mini" onClick={() => setEgetForslag({ ...egetForslag, [o.cat]: null })}>Avbryt</button>
                        </div>
                      </div>
                    )}
                  </div>
                ); })()}
                <div style={{display:"flex", gap:4, marginTop:8, alignItems:"center", flexWrap:"wrap"}}>
                  <button className="buy" onClick={() => setPriceFor(p)}>Se beste pris</button>
                  <button className="buy" style={{background:"#4A8B5C"}} onClick={() => { setStegFerdig({ ...stegFerdig, [o.cat]: true }); setApneSteg(null); ping("Steg lagret ✓"); }}>✓ Ferdig med dette steget</button>
                  <button className="mini" onClick={() => setFbOpen(fbOpen === p.id ? null : p.id)}>💬 Tilbakemelding{feedback[p.id] ? " ✓" : ""}</button>
                  {!p.custom && <button className="mini" onClick={() => { setDisliked([...new Set([...disliked, p.id])]); const ns = { ...swaps }; delete ns[o.cat]; setSwaps(ns); ping("Notert! Vi husker det og har byttet til nest beste match ✓"); }}>✕ Passer ikke meg</button>}
                  {!lockedIn && <button className="mini" onClick={() => setRemoved([...removed, o.cat])}>Fjern steg</button>}
                </div>
                {fbOpen === p.id && (
                  <div className="note" style={{marginTop:8, background:"#F7F5FF"}}>
                    <div style={{fontSize:12.5, fontWeight:700}}>Hvordan reagerer huden på dette? 💬</div>
                    <div style={{fontSize:11.5, color:"#6B6862", marginTop:2, marginBottom:8}}>Etter 2–3 ukers bruk lærer dette verktøyet hvordan akkurat DIN hud reagerer – og bruker det til å justere fremtidige anbefalinger. Kom tilbake og oppdater etter hvert.</div>
                    {[["elsker","😍 Elsker det","#E2F3D5"],["ok","🙂 Greit","#FFF2BD"],["irriterer","😣 Irriterer / bryter ut","#FFD1D1"]].map(([v,t,c]) => (
                      <button key={v} className="chip" style={{background: feedback[p.id]?.reaksjon === v ? "#16130F" : c, color: feedback[p.id]?.reaksjon === v ? "#fff" : "#16130F"}} onClick={() => {
                        const nf = { ...feedback, [p.id]: { ...feedback[p.id], reaksjon: v, dato: Date.now(), ings: p.ings } };
                        setFeedback(nf); try { storage.set("skinatlas-feedback", JSON.stringify(nf)); } catch(e){}
                        if (v === "irriterer") { const badIngs = p.ings.filter((i) => ING[i]); ping(badIngs.length ? "Notert – vi blir mer forsiktige med " + badIngs.map(nvn).join(", ") + " 📝" : "Notert – takk! 📝"); }
                        else ping("Notert – takk for tilbakemeldingen! 📝");
                      }}>{t}</button>
                    ))}
                    {feedback[p.id]?.reaksjon === "irriterer" && p.ings.filter((i) => ING[i]).length > 0 && (
                      <div style={{fontSize:11.5, marginTop:8, color:"#4A4842"}}>Vil du at vi skal styre unna <b>{p.ings.filter((i) => ING[i]).map(nvn).join(", ")}</b> fremover? <button className="learn" onClick={() => { const ex = ans.sensList || []; const nye = [...new Set([...ex, ...p.ings.filter((i) => ING[i])])]; setAns({ ...ans, sensList: nye }); ping("Lagt til i «unngå»-lista – rutinen oppdateres ✓"); setFbOpen(null); }}>Ja, unngå disse →</button></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {!lockedIn && removed.length > 0 && <button className="ghost" onClick={() => setRemoved([])}>+ Legg tilbake fjernede steg</button>}

      {/* LAG-VELGER */}
      <div className="stepcard" style={{marginTop:14}}>
        <div style={{fontFamily:"'Fraunces',serif", fontSize:19}}>Bygg på med flere lag 🧅</div>
        <div style={{fontSize:12.5, color:"#6B6862", marginTop:2}}>K-beauty handler om lag. Dette er <b>helt valgfritt</b> – grunnrutinen virker utmerket alene. Men vil du bygge videre etter hvert, er dette gode tillegg.</div>
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
        {layers.tonerCount > 0 && <div className="note" style={{marginTop:10}}>💧 <b>Om toner/essence:</b> Et lett, vannaktig lag du påfører etter rens og før serum. Det gir et ekstra fuktighetslag og forbereder huden til å ta opp produktene etterpå bedre. I K-beauty bruker mange «7-skin»-metoden – flere tynne lag toner for dyp fukt. Du <b>trenger</b> det ikke, men det er et fint, mildt lag å bygge på med hvis huden føles tørr eller stram.</div>}
        {layers.maske && <div className="note" style={{marginTop:10}}>🧖 <b>Om maske:</b> En ukentlig «boost» – en konsentrert behandling 1–2x/uke, ikke daglig. Leiremasker trekker ut talg (fint for fet/kombinert hud), mens fukt-/arkmasker gir en intens fuktdusj (fint for tørr hud). Bruk den på en rolig kveld <b>uten</b> sterke aktive ingredienser, så du ikke overbelaster huden. Igjen: valgfritt ekstra, ikke et must.</div>}
      </div>

      {/* UKEPLAN */}
      <div className="stepcard">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{fontFamily:"'Fraunces',serif", fontSize:19}}>Ukeplanen din 📅</div>
          <button className="mini" onClick={() => setShowWeek(!showWeek)}>{showWeek ? "Skjul" : "Vis"}</button>
        </div>
        {showWeek && (() => {
          // Bygg celleinnhold per dag/tid: liste av {label, hue, prod, aktiv, warn}
          const spf = routine.spf?.main, krem = routine.krem?.main, dagS = routine.serumAM?.main, rens = routine.rens?.main, olje = routine.olje?.main;
          const kremRot = [krem?.id, ...(rotations.krem || [])].filter(Boolean);
          const serumRot = [serum?.id, ...(rotations.serumPM || [])].filter(Boolean);
          const byId = (id) => allProducts.find((x) => x.id === id);
          const buildCells = (dag, tid) => {
            const ov = cellOverrides[tid + dag];
            if (ov) return ov.map((id) => { const pr = byId(id); return pr && { id, navn: kortnavn(pr), hue: pr.hue, aktiv: erAktivEksfoliant(pr) || pr.ings?.includes("retinol"), prod: pr }; }).filter(Boolean);
            const cells = [];
            if (tid === "AM") {
              cells.push({ navn: amRens ? "Rens" : "Vann", hue: "#F3F0EA" });
              tonerSlots.forEach((ts) => ts.main && cells.push({ id: ts.main.id, navn: kortnavn(ts.main), hue: ts.main.hue, aktiv: erAktivEksfoliant(ts.main), prod: ts.main }));
              if (dagS) cells.push({ id: dagS.id, navn: kortnavn(dagS), hue: dagS.hue, aktiv: false, prod: dagS });
              const km = byId(kremRot[dag % kremRot.length]) || krem; if (km) cells.push({ id: km.id, navn: kortnavn(km), hue: km.hue, prod: km });
              if (spf) cells.push({ id: spf.id, navn: kortnavn(spf), hue: spf.hue, prod: spf, spf: true });
            } else {
              if (olje) cells.push({ id: olje.id, navn: kortnavn(olje), hue: olje.hue, prod: olje });
              if (rens) cells.push({ id: rens.id, navn: kortnavn(rens), hue: rens.hue, prod: rens });
              tonerSlots.forEach((ts) => ts.main && cells.push({ id: ts.main.id, navn: kortnavn(ts.main), hue: ts.main.hue, aktiv: erAktivEksfoliant(ts.main), prod: ts.main }));
              if (layers.maske && routine.maske?.main && (maskeFreq === 2 ? [2,6] : [6]).includes(dag)) cells.push({ id: routine.maske.main.id, navn: "Maske", hue: routine.maske.main.hue, prod: routine.maske.main });
              if (cycling) {
                if (CYCLE[dag] === "ex" && exP) cells.push({ id: exP.id, navn: kortnavn(exP), hue: exP.hue, aktiv: true, prod: exP });
                else if (CYCLE[dag] === "ret" && retP) cells.push({ id: retP.id, navn: kortnavn(retP), hue: retP.hue, aktiv: true, prod: retP });
                else cells.push({ navn: "Pause", hue: "#F3F0EA", pause: true });
              } else if (serum && sDays.includes(dag)) {
                const sv = byId(serumRot[dag % serumRot.length]) || serum;
                cells.push({ id: sv.id, navn: kortnavn(sv), hue: sv.hue, aktiv: erAktivEksfoliant(sv) || sv.ings?.includes("retinol"), prod: sv });
              }
              const km = byId(kremRot[dag % kremRot.length]) || krem; if (km) cells.push({ id: km.id, navn: kortnavn(km), hue: km.hue, prod: km });
            }
            return cells;
          };
          // Kollisjonssjekk: to aktive samme kveld?
          const cellWarn = (cells) => cells.filter((c) => c.aktiv).length > 1;
          return (
          <>
            <div style={{fontSize:12, color:"#6B6862", marginTop:4}}>Trykk en celle for å bytte, fjerne eller legge til produkt. Rødt = mulig kollisjon. <span style={{color:"#B8B4AA"}}>(Sveip sidelengs på mobil →)</span></div>
            <div className="weekscroll">
            <table className="week">
              <thead><tr><th></th>{DAGER.map((d) => <th key={d}>{d}</th>)}</tr></thead>
              <tbody>
                {["AM","PM"].map((tid) => (
                  <tr key={tid}>
                    <td style={{fontWeight:700}}>{tid === "AM" ? "☀️ AM" : "🌙 PM"}</td>
                    {DAGER.map((_, d) => { const cells = buildCells(d, tid); const warn = cellWarn(cells); return (
                      <td key={d} onClick={() => setCellEdit({ dag: d, tid, cells })} style={{fontSize:9.5, lineHeight:1.6, textAlign:"left", padding:"5px 4px", cursor:"pointer", background: warn ? "#FFECEC" : (cellEdit && cellEdit.dag === d && cellEdit.tid === tid ? "#F3F0FF" : "transparent"), borderRadius:6}}>
                        {cells.map((c, ci) => <div key={ci} style={{background:c.hue, borderRadius:4, padding:"1px 4px", fontWeight: c.aktiv || c.spf ? 700 : 400, color: c.pause ? "#B8B4AA" : "#16130F", marginBottom:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}} title={c.prod ? c.prod.brand + " " + c.prod.name : c.navn}>{c.navn}</div>)}
                        {warn && <div style={{color:"#C0392B", fontWeight:700, fontSize:9}}>⚠️ 2 aktive</div>}
                      </td>
                    ); })}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {cellEdit && (() => { const cells = buildCells(cellEdit.dag, cellEdit.tid); const key = cellEdit.tid + cellEdit.dag; const kat = order.filter((o) => routine[o.cat]?.main || (o.tslot !== undefined)); return (
              <div className="note" style={{background:"#F7F5FF", marginTop:8}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <b style={{fontSize:13}}>{DAGER[cellEdit.dag]} {cellEdit.tid} – juster</b>
                  <button className="mini" onClick={() => setCellEdit(null)}>Lukk ✕</button>
                </div>
                <div style={{fontSize:11.5, color:"#6B6862", margin:"4px 0 8px"}}>Produkter denne økten:</div>
                {cells.map((c, ci) => c.prod && (
                  <div key={ci} style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:6, padding:"3px 0"}}>
                    <span style={{fontSize:12}}>{c.prod.brand} {c.prod.name} {c.aktiv && <span style={{color:"#C0392B"}}>· aktiv</span>}</span>
                    <button className="mini" onClick={() => { const base = cells.map((x) => x.id).filter(Boolean); setCellOverrides({ ...cellOverrides, [key]: base.filter((id) => id !== c.id) }); }}>Fjern</button>
                  </div>
                ))}
                <div style={{fontSize:11.5, color:"#6B6862", margin:"8px 0 4px"}}>Legg til fra rutinen din:</div>
                <div>{[...new Set(order.map((o) => routine[o.cat]?.main).filter(Boolean).concat(tonerSlots.map((t) => t.main).filter(Boolean)).concat([...liked, ...custom.map((c) => c.id)].map((id) => byId(id)).filter(Boolean)))].map((mp) => (
                  <button key={mp.id} className="chip" style={{padding:"3px 9px"}} onClick={() => { const base = cells.map((x) => x.id).filter(Boolean); if (!base.includes(mp.id)) setCellOverrides({ ...cellOverrides, [key]: [...base, mp.id] }); }}>+ {kortnavn(mp)}</button>
                ))}</div>
                {cellWarn(cells) && <div style={{fontSize:11.5, color:"#C0392B", marginTop:8}}>⚠️ Du har to aktive ingredienser samme økt (f.eks. to syrer, eller syre + retinol). Det kan irritere huden – vurder å flytte den ene til en annen kveld.</div>}
                {cellOverrides[key] && <button className="learn" style={{marginTop:8}} onClick={() => { const no = { ...cellOverrides }; delete no[key]; setCellOverrides(no); }}>↺ Tilbakestill denne økten til anbefaling</button>}
              </div>
            ); })()}
            {Object.keys(cellOverrides).length > 0 && <button className="ghost" style={{marginTop:8}} onClick={() => { setCellOverrides({}); ping("Kalenderen er tilbakestilt til anbefaling ✓"); }}>↺ Tilbakestill HELE kalenderen til anbefaling</button>}
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
              {cycling && <div className="note" style={{marginTop:10}}>🔄 <b>Skin-cycling:</b> Du roterer syre-kveld → retinol-kveld → pausekvelder (kun fukt). Idéen, popularisert av dermatolog Whitney Bowe, er at pausenettene lar hudbarrieren reparere seg – slik at du får effekten av begge aktive uten irritasjonen av å stable dem. Konseptet bygger på dokumentasjonen for at gradvis, ikke-daglig retinoidbruk gir mindre irritasjon med bevart effekt. <a className="learn" href="https://pubmed.ncbi.nlm.nih.gov/25738849/" target="_blank" rel="noreferrer">Retinoid-forskning →</a> <a className="learn" href="https://pubmed.ncbi.nlm.nih.gov/22916351/" target="_blank" rel="noreferrer">AHA-forskning →</a> Aldri syre og retinol samme kveld i starten.</div>}
              <div style={{marginTop:6}}>💧 <b>Vann</b> = skyll med lunkent vann – rens er unødvendig om morgenen for de fleste. Mindre rens = sterkere hudbarriere.</div>
            </div>
          </>
          ); })()}
        </div>

      <div className="note" style={{marginTop:14}}>🤝 <b>Åpenhet:</b> «Se beste pris» inneholder annonselenker – handler du der, får vi provisjon uten ekstra kostnad for deg. Anbefalingene er valgt av ingredienser og din profil, aldri av hvem som betaler.</div>

      <div className="warn" style={{marginTop:14}}>
        <div style={{fontWeight:700, marginBottom:6}}>⚠️ Viktig – les før du starter</div>
        <p style={{margin:"0 0 8px"}}>Skinatlas er et <b>nytt verktøy under utvikling</b>. Forslagene er automatisk genererte ut fra det du oppga, og bygger på generell ingrediensvitenskap – ikke en undersøkelse av akkurat din hud. Behandle dem som et utgangspunkt til å tenke og lære, <b>ikke som en fasit du kan følge blindt.</b></p>
        <p style={{margin:"0 0 8px"}}>Introduser alltid ett nytt produkt om gangen, gjør en lappetest på innsiden av underarmen først, og lytt til huden din – opplever du svie, utslett eller vedvarende irritasjon, stopp og ta en pause. Verktøyet kan ta feil, mangle informasjon om et produkt, eller foreslå noe som ikke passer nettopp deg.</p>
        <p style={{margin:"0 0 8px"}}><b>Ved graviditet/amming, hudsykdom (eksem, rosacea, psoriasis), pågående behandling, eller hvis du er usikker på hva huden din tåler: rådfør deg med lege eller hudlege før du følger rutinen.</b> Skinatlas erstatter ikke medisinsk rådgivning.</p>
        <p style={{margin:0}}>📩 <b>Oppdager du en feil?</b> Feil ingrediens, et produkt som er feilkategorisert, en anbefaling som virker gal – eller har du et forslag? Si ifra til <a className="learn" href="mailto:hei@skinatlas.no?subject=Tilbakemelding%20om%20Skinatlas">hei@skinatlas.no</a>. Tilbakemeldingene dine gjør verktøyet tryggere og bedre for alle.</p>
      </div>

      <div style={{textAlign:"center", fontSize:12, color:"#8B8880", marginTop:14}}>Vil du dykke dypere i ingrediensene til et produkt? <a className="learn" href="https://incidecoder.com" target="_blank" rel="noreferrer">Slå opp på INCIDecoder →</a> (uavhengig ingrediensdatabase)</div>

      <Kunnskapsbank />

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
      <button className="ghost" onClick={() => {
        if (!window.confirm("Vil du starte helt på nytt? Dette sletter alle svarene og valgene dine i denne rutinen, og du begynner quizen fra begynnelsen. (En eventuell lagret rutine påvirkes ikke før du lagrer på nytt.)")) return;
        setAns({ hudtype:null, alder:null, sensitiv:null, toleranse:null, sensList:[], helse:[], maal:null, budsjett:[], etikk:[] });
        setLiked([]); setDisliked([]); setCustom([]); setSwaps({}); setRotations({}); setRemoved([]);
        setLayers({ tonerCount:0, maske:false }); setMaskeFreq(1); setLockedIn(false);
        setStegFerdig({}); setApneSteg(null); setEgetForslag({}); setCellOverrides({}); setCellEdit(null);
        setAmRens(false); setVisOpps(true); setOppsNivaa(1);
        setStep(0);
        ping("Alt nullstilt – du kan begynne helt på nytt ✓");
      }}>Start helt på nytt</button>

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
            <div style={{fontSize:12.5, color:"#6B6862", marginBottom:10}}>Vi henter ikke live priser ennå, men disse norske nettbutikkene fører vanligvis <b>{priceFor.brand}</b> – søk opp <b>{priceFor.name}</b> hos den du foretrekker:</div>
            {offers(priceFor).map((o, i) => (
              <div key={o.store} className="offer">
                <div>
                  <div style={{fontWeight:700, fontSize:14}}>{o.store}</div>
                  <div style={{fontSize:11.5, color:"#8B8880", marginTop:2}}>{o.ship}</div>
                </div>
                <a className="gostore" href={o.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>Til {o.store} →</a>
              </div>
            ))}
            <p style={{fontSize:11, color:"#8B8880", marginTop:12, lineHeight:1.5}}>Lenkene går til butikkenes egne søk. Når vi kobler på annonsenettverk (Adtraction/Partner-ads) blir dette direkte produktlenker med live priser og bilder.</p>
            <button className="ghost" onClick={() => setPriceFor(null)}>Lukk</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div></div>
  );
}

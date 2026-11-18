(function(){
'use strict';
const D = window.PED, POSTS = D.posts, FASI = D.fasi, STORIES = D.stories;
const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
const BASE = 'https://riccardo-morelli-01.github.io/ped-panarotta/';

const RUBRICHE = [
  {id:'piccoli', nome:'Piccoli sciatori, grandi emozioni', area:'Famiglie', formati:'Reel / carosello', desc:'La montagna attraverso gli occhi dei bambini: prime discese, sorrisi, progressi e giornate in famiglia.', es:'«La prima discesa non si dimentica mai»'},
  {id:'curva', nome:'La prima curva', area:'Principianti', formati:'Reel / carosello', desc:'Contenuti semplici per chi vuole iniziare a sciare: consigli, dubbi frequenti, preparazione e opportunità di apprendimento.', es:'«Vuoi imparare a sciare? Ecco cosa sapere prima della tua prima giornata»'},
  {id:'dubbi', nome:'Panarotta senza dubbi', area:'Informazioni', formati:'Carosello / Stories', desc:'Le domande pratiche: come arrivare, parcheggi, piste, skipass, impianti e organizzazione della giornata.', es:'«La tua prima giornata in Panarotta: tutte le informazioni utili»'},
  {id:'vivi', nome:'Vivi la Panarotta', area:'Emozione e territorio', formati:'Reel / foto', desc:'Panorami, nevicate, piste, momenti della giornata e bellezza della montagna, per far desiderare una visita.', es:'«Ci sono mattine che meritano di essere vissute quassù»'},
  {id:'quinte', nome:'Dietro le quinte', area:'Persone e lavoro', formati:'Reel / Stories', desc:'Un volto al lavoro di chi rende possibile la stazione: preparazione delle piste, personale, manutenzione, curiosità.', es:'«Cosa succede in Panarotta prima dell’arrivo degli sciatori?»'},
  {id:'nostra', nome:'La nostra Panarotta', area:'Community', formati:'Stories / Reel', desc:'Chi frequenta la montagna: testimonianze, fotografie condivise, ricordi e interazioni.', es:'«Qual è il tuo ricordo più bello in Panarotta? Raccontacelo»'},
  {id:'appuntamento', nome:'Appuntamento in Panarotta', area:'Promozioni ed eventi', formati:'Post / Stories', desc:'Offerte, iniziative locali, collaborazioni sportive, eventi e opportunità per visitare la stazione.', es:'«Una stagione sulla neve per i più piccoli: scopri le agevolazioni disponibili»'}
];
const RUBMAP = Object.fromEntries(RUBRICHE.map(r => [r.id, r]));
const FORMATI = [{id:'Reel', c:'var(--reel)'}, {id:'Carosello', c:'var(--car)'}, {id:'Post', c:'var(--post)'}, {id:'Stories', c:'var(--story)'}];
const FCOL = Object.fromEntries(FORMATI.map(f => [f.id, f.c]));
const MESI = [
  {k:'2026-11', nome:'Novembre', anno:2026, sub:'Facciamo crescere l’attesa'},
  {k:'2026-12', nome:'Dicembre', anno:2026, sub:'Prepariamo l’apertura e valorizziamo il Natale'},
  {k:'2027-01', nome:'Gennaio', anno:2027, sub:'Fidelizzazione e nuove esperienze'},
  {k:'2027-02', nome:'Febbraio', anno:2027, sub:'Famiglie, Carnevale e partecipazione'},
  {k:'2027-03', nome:'Marzo', anno:2027, sub:'Ultime giornate e racconto della stagione'}
];
const MN = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const MS = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const HOLIDAYS = [['2026-12-23','2027-01-06','Vacanze di Natale (Trentino)'], ['2027-02-08','2027-02-09','Vacanze di Carnevale (Trentino)']];

const pad = n => String(n).padStart(2,'0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rc = p => `var(--r-${p.rub})`;
const nn = n => pad(n);
const fmtDate = p => p.dataTesto || `${p.giorno} ${parse(p.date).getDate()} ${MN[parse(p.date).getMonth()]} ${p.date.slice(0,4)}`;
const shortDate = s => { const d = parse(s); return `${d.getDate()} ${MS[d.getMonth()]}`; };
const faseOf = id => FASI.find(f => f.id === id);
const isHoliday = s => HOLIDAYS.find(h => s >= h[0] && s <= h[1]);

// "today": real date, or ?oggi=YYYY-MM-DD for previews
const qs = new URLSearchParams(location.search);
const TODAY = /^\d{4}-\d{2}-\d{2}$/.test(qs.get('oggi')||'') ? qs.get('oggi') : iso(new Date());

// --- tiny markdown (bold, italics, lists, paragraphs) ---
function md(src){
  const inl = t => esc(t).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g,'$1<em>$2</em>');
  const out = []; let list = null;
  const flush = () => { if (list){ out.push(`<${list.t}>${list.items.map(i=>`<li>${inl(i)}</li>`).join('')}</${list.t}>`); list = null; } };
  let para = [];
  const fp = () => { if (para.length){ out.push(`<p>${para.map(inl).join('<br>')}</p>`); para = []; } };
  for (const raw of String(src).split('\n')){
    const l = raw.trim();
    let m;
    if (!l){ fp(); flush(); continue; }
    if ((m = l.match(/^\d+\.\s+(.*)$/))){ fp(); if (!list || list.t!=='ol'){ flush(); list = {t:'ol', items:[]}; } list.items.push(m[1]); continue; }
    if ((m = l.match(/^[-•]\s+(.*)$/))){ fp(); if (!list || list.t!=='ul'){ flush(); list = {t:'ul', items:[]}; } list.items.push(m[1]); continue; }
    flush(); para.push(l);
  }
  fp(); flush();
  return out.join('');
}

// --- state ---
const S = { view:'calendario', month:null, group:'settimana', q:'', formati:new Set(), rub:new Set(), mesi:new Set(), fase:'', piatt:'', verif:false };

function textOf(p){ return [p.titolo, p.rubrica, p.formato, p.obiettivo, ...p.sezioni.map(s => s.label+' '+s.text)].join(' ').toLowerCase(); }
const NORM = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
POSTS.forEach(p => p._t = NORM(textOf(p)));

function matches(p){
  if (S.formati.size && !S.formati.has(p.tipo)) return false;
  if (S.rub.size && !S.rub.has(p.rub)) return false;
  if (S.mesi.size && !S.mesi.has(p.date.slice(0,7))) return false;
  if (S.fase && String(p.fase) !== S.fase) return false;
  if (S.verif && !p.daConfermare) return false;
  if (S.q){ const words = NORM(S.q.toLowerCase()).split(/\s+/).filter(Boolean); if (!words.every(w => p._t.includes(w))) return false; }
  return true;
}
function storyMatches(st){
  if (S.formati.size && !S.formati.has('Stories')) return false;
  if (S.rub.size || S.verif || S.fase && !FASI.some(f => String(f.id)===S.fase && st.dal <= f.al && st.al >= f.dal)) return false;
  if (S.mesi.size && ![...S.mesi].some(m => st.dal.startsWith(m) || st.al.startsWith(m))) return false;
  if (S.q){ const words = NORM(S.q.toLowerCase()).split(/\s+/).filter(Boolean); const t = NORM((st.idee+' stories').toLowerCase()); if (!words.every(w => t.includes(w))) return false; }
  return true;
}
const filtered = () => POSTS.filter(matches);
const activeFilters = () => S.formati.size + S.rub.size + S.mesi.size + (S.fase?1:0) + (S.verif?1:0) + (S.q?1:0) + (S.piatt?1:0);

// --- hero kpis ---
function renderKpis(){
  const main = POSTS.filter(p => !p.extra);
  const c = t => main.filter(p => p.tipo === t).length;
  const k = [[main.length,'contenuti','k-gold'],[c('Reel'),'Reel'],[c('Carosello')+c('Post'),'caroselli e post'],[FASI.length,'fasi'],[7,'rubriche']];
  $('#kpis').innerHTML = k.map(([n,l,cl]) => `<div class="kpi ${cl||''}"><b data-count="${n}">${n}</b><span>${l}</span></div>`).join('');
}

// --- next ---
function renderNext(){
  const main = POSTS.filter(p => !p.extra);
  const first = main[0], last = main[main.length-1];
  let label, p, extra = '';
  const todayP = main.find(p => p.date === TODAY);
  const nextP = main.find(p => p.date > TODAY);
  const done = main.filter(p => p.date < TODAY || p.date === TODAY).length;
  if (TODAY < first.date){ label = 'Si parte con'; p = first; }
  else if (todayP){ label = 'Oggi in pubblicazione'; p = todayP; }
  else if (nextP){ const days = Math.round((parse(nextP.date) - parse(TODAY)) / 864e5); label = days === 1 ? 'Prossimo contenuto · domani' : `Prossimo contenuto · tra ${days} giorni`; p = nextP; }
  else { label = 'Stagione completata · ultimo contenuto'; p = last; }
  const after = main.filter(x => x.date > p.date).slice(0, 2);
  const d = parse(p.date);
  const pct = Math.round(done / main.length * 100);
  $('#prossimo').innerHTML = `
    <div class="next reveal" style="--rc:${rc(p)}">
      <div class="when"><div class="m">${MS[d.getMonth()]}</div><div class="d">${d.getDate()}</div><div class="m" style="color:var(--muted)">${p.giorno.slice(0,3)}</div></div>
      <div>
        <div class="lbl"><span class="pulse"></span>${esc(label)}</div>
        <h2>#${nn(p.n)} · ${esc(p.titolo)}</h2>
        <div class="meta">${esc(p.formato)} · ${esc(p.rubrica)} · Fase ${p.fase}: ${esc(faseOf(p.fase).nome)}</div>
        <div class="progress" title="${done} di ${main.length} contenuti già in calendario prima di oggi"><i style="width:${pct}%"></i></div>
        <div class="meta" style="margin-top:4px">${done} di ${main.length} date del piano già passate (oggi: ${shortDate(TODAY)} ${TODAY.slice(0,4)})</div>
      </div>
      <div class="side"><button class="btn btn-gold btn-small" data-open="${p.n}">Apri la scheda</button></div>
    </div>
    ${after.length ? `<p class="next-later">Poi: ${after.map(a => `<button data-open="${a.n}">#${nn(a.n)} ${esc(a.titolo)} (${shortDate(a.date)})</button>`).join(' · ')}</p>` : ''}`;
}

// --- filters UI ---
function chip(label, pressed, attrs, dotColor){ return `<button class="chip" aria-pressed="${pressed}" ${attrs}>${dotColor?`<span class="dot" style="background:${dotColor}"></span>`:''}${esc(label)}</button>`; }
function renderFilters(){
  const cnt = (fn) => POSTS.filter(p => !p.extra).filter(fn).length;
  $('#fFormato').innerHTML = FORMATI.map(f => chip(`${f.id} ${f.id==='Stories' ? '' : '· '+cnt(p => p.tipo===f.id)}`.trim(), S.formati.has(f.id), `data-f="formati" data-v="${f.id}"`, f.c)).join('');
  $('#fRubrica').innerHTML = RUBRICHE.map(r => chip(r.nome, S.rub.has(r.id), `data-f="rub" data-v="${r.id}"`, `var(--r-${r.id})`)).join('');
  $('#fMese').innerHTML = MESI.map(m => chip(m.nome, S.mesi.has(m.k), `data-f="mesi" data-v="${m.k}"`)).join('');
  $('#fFase').innerHTML = `<option value="">Tutte</option>` + FASI.map(f => `<option value="${f.id}" ${S.fase==String(f.id)?'selected':''}>${f.id}. ${esc(f.nome)}</option>`).join('');
  $('#fPiatt').value = S.piatt; $('#fVerif').checked = S.verif;
}
function updateCounts(){
  const n = filtered().length, a = activeFilters();
  const piattNote = S.piatt ? ` · tutti i contenuti escono su Instagram e Facebook: nelle schede vedi la versione ${S.piatt==='ig'?'Instagram':'Facebook'}` : '';
  $('#resultCount').textContent = `${n} contenut${n===1?'o':'i'} su ${POSTS.length}${piattNote}`;
  const b = $('#filterCount'); b.hidden = !a; b.textContent = a;
}
function bindFilters(){
  $('#filters').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    const set = S[c.dataset.f]; set.has(c.dataset.v) ? set.delete(c.dataset.v) : set.add(c.dataset.v);
    c.setAttribute('aria-pressed', set.has(c.dataset.v)); refresh();
  });
  let t; $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { S.q = e.target.value.trim(); refresh(); }, 120); });
  $('#fFase').addEventListener('change', e => { S.fase = e.target.value; refresh(); });
  $('#fPiatt').addEventListener('change', e => { S.piatt = e.target.value; refresh(); });
  $('#fVerif').addEventListener('change', e => { S.verif = e.target.checked; refresh(); });
  $('#reset').addEventListener('click', () => { Object.assign(S, {q:'', fase:'', piatt:'', verif:false}); S.formati.clear(); S.rub.clear(); S.mesi.clear(); $('#q').value=''; renderFilters(); refresh(); });
  $('#filterToggle').addEventListener('click', e => { const f = $('#filters'); const o = f.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); });
  $('#ics').addEventListener('click', () => downloadIcs(filtered(), 'ped-panarotta-2026-27.ics'));
}

// --- calendar ---
function renderCalendar(){
  const list = filtered(); const ids = new Set(list.map(p => p.n));
  if (!S.month){ const m = MESI.find(m => TODAY.startsWith(m.k)); S.month = m ? m.k : (TODAY < '2026-11' ? '2026-11' : '2027-03'); }
  const M = MESI.find(m => m.k === S.month);
  const [y, mo] = S.month.split('-').map(Number);
  const first = new Date(y, mo-1, 1), days = new Date(y, mo, 0).getDate();
  let lead = (first.getDay() + 6) % 7, startD = 1, endD = days;
  if (S.month === '2026-11'){ startD = 16; lead = 0; }   // la stagione parte lunedì 16/11 (primo post 17/11)
  if (S.month === '2027-03'){ endD = 21; }                // ultima settimana: 15–21 marzo
  const byDate = {}; POSTS.forEach(p => (byDate[p.date] ||= []).push(p));
  const monthCount = k => list.filter(p => p.date.startsWith(k) && !p.extra).length;
  let cells = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(d => `<div class="dow">${d}</div>`).join('');
  for (let i=0;i<lead;i++) cells += `<div class="day empty"></div>`;
  for (let d=startD; d<=endD; d++){
    const ds = `${y}-${pad(mo)}-${pad(d)}`;
    const inSeason = ds >= '2026-11-17' && ds <= '2027-03-16';
    const ph = FASI.find(f => f.dal === ds);
    const hol = isHoliday(ds);
    const chips = (byDate[ds]||[]).map(p => `<button class="pchip ${ids.has(p.n)?'':'dim'}" style="--c:${FCOL[p.tipo]}" data-open="${p.n}" aria-label="#${nn(p.n)} ${esc(p.titolo)}, ${esc(p.tipo)}"><span class="t">${p.extra?'Extra':'#'+nn(p.n)} ${p.tipo==='Carosello'?'Car.':p.tipo}</span><span class="tt">${esc(p.titolo)}</span></button>`).join('');
    cells += `<div class="day ${ds===TODAY?'today':''} ${inSeason?'':'out'} ${hol?'hol':''}" ${hol?`title="${esc(hol[2])}"`:''}><div class="num"><b>${d}</b>${ph?`<span class="phase-tag" title="Inizio fase ${ph.id}">F${ph.id} · ${esc(ph.nome)}</span>`:''}</div>${chips}</div>`;
  }
  $('#view-calendario').innerHTML = `
    <div class="cal-nav" role="group" aria-label="Mese">
      <button class="iconbtn" data-mstep="-1" aria-label="Mese precedente" ${S.month===MESI[0].k?'disabled':''}>‹</button>
      ${MESI.map(m => `<button class="mbtn" data-month="${m.k}" aria-pressed="${m.k===S.month}">${m.nome.slice(0,3)}<small>${monthCount(m.k)}</small></button>`).join('')}
      <button class="iconbtn" data-mstep="1" aria-label="Mese successivo" ${S.month===MESI[4].k?'disabled':''}>›</button>
    </div>
    <div class="cal-title"><h3>${M.nome} ${M.anno}</h3><p>${esc(M.sub)} · ${POSTS.filter(p => p.date.startsWith(S.month) && !p.extra).length} contenuti</p></div>
    <div class="grid">${cells}</div>
    <div class="legend">${FORMATI.slice(0,3).map(f => `<span><i class="dot" style="background:${f.c}"></i>${f.id}</span>`).join('')}<span><i class="bar"></i>Vacanze scolastiche (Natale 23/12–6/1, Carnevale 8–9/2)</span><span>Tocca un contenuto per la scheda completa</span></div>`;
}

// --- list ---
function weekLabel(w){ const s = new Date(2026,10,16 + (w-1)*7), e = new Date(s); e.setDate(s.getDate()+6); return `${s.getDate()} ${MS[s.getMonth()]} – ${e.getDate()} ${MS[e.getMonth()]}`; }
function card(p, i){
  const f = faseOf(p.fase);
  return `<button class="card" style="--rc:${rc(p)};animation-delay:${Math.min(i,12)*30}ms" data-open="${p.n}">
    <div class="top"><span><span class="no">${p.extra?'Extra':'#'+nn(p.n)}</span> · ${esc(p.dataTesto ? '15/16 mar 2027' : p.giorno+' '+shortDate(p.date))}</span><span class="tag fmt" style="--fc:${FCOL[p.tipo]}">${p.tipo}${p.durata?' · '+esc(p.durata):''}</span></div>
    <h4>${esc(p.titolo)}</h4>
    <div class="rub">${esc(p.rubrica || 'Fuori dalle 51 pubblicazioni')}</div>
    <div class="obj">${esc(p.obiettivo)}</div>
    <div class="tags"><span class="tag">Fase ${p.fase} · ${esc(f.nome)}</span>${p.daConfermare?'<span class="tag warn">Da verificare</span>':''}${p.extra?'<span class="tag extra">Extra · data da confermare</span>':''}</div>
  </button>`;
}
function storyCard(st){ return `<div class="story-card"><span class="story-ico" aria-hidden="true"></span><div><b>Stories · ${esc(st.periodo)}</b>${esc(st.idee)}</div></div>`; }
function renderList(){
  const list = filtered(); const sts = STORIES.filter(storyMatches);
  const onlyStories = S.formati.size === 1 && S.formati.has('Stories');
  let groups = [];
  if (S.group === 'settimana'){
    for (let w=1; w<=18; w++){
      const ps = list.filter(p => p.settimana === w);
      const s0 = iso(new Date(2026,10,16+(w-1)*7)), s1 = iso(new Date(2026,10,22+(w-1)*7));
      const ss = sts.filter(st => st.dal <= s1 && st.al >= s0 && st.dal >= s0);
      if (ps.length || ss.length) groups.push({h:`Settimana ${w}`, sub:weekLabel(w), ps, ss});
    }
  } else if (S.group === 'fase'){
    FASI.forEach(f => { const ps = list.filter(p => p.fase === f.id); const ss = sts.filter(st => st.dal >= f.dal && st.dal <= f.al); if (ps.length || ss.length) groups.push({h:`Fase ${f.id} · ${f.nome}`, sub:`${shortDate(f.dal)} – ${shortDate(f.al)} · ${f.obiettivo}`, ps, ss}); });
  } else {
    MESI.forEach(m => { const ps = list.filter(p => p.date.startsWith(m.k)); const ss = sts.filter(st => st.dal.startsWith(m.k)); if (ps.length || ss.length) groups.push({h:`${m.nome} ${m.anno}`, sub:m.sub, ps, ss}); });
  }
  let i = 0;
  const html = groups.map(g => `<div class="lgroup"><h3>${esc(g.h)} <small>${esc(g.sub)} · ${g.ps.length} contenut${g.ps.length===1?'o':'i'}</small></h3><div class="cards">${g.ps.map(p => card(p, i++)).join('')}${g.ss.map(storyCard).join('')}</div></div>`).join('');
  $('#view-lista').innerHTML = `<div class="groupby">Raggruppa per ${['settimana','fase','mese'].map(g => chip(g, S.group===g, `data-group="${g}"`)).join('')}</div>${S.formati.has('Stories')||!S.formati.size?'<p class="pnote" style="margin:-6px 0 14px">Le Stories sono linee guida settimanali, non post singoli.</p>':''}` + (html || `<div class="empty-state">Nessun contenuto con questi filtri. <button class="link" data-reset>Azzera filtri</button></div>`);
}

// --- phases ---
function renderPhases(){
  const list = filtered(); const ids = new Set(list.map(p => p.n));
  const total = (parse('2027-03-14') - parse('2026-11-17'))/864e5 + 1;
  const cols = ['#8C7B6E','#A38D68','#B9A07A','#D6C3A1','#BFD6E3','#8FB9A8'];
  const tl = FASI.map((f,i) => `<i title="Fase ${f.id}: ${esc(f.nome)}" style="flex:${(parse(f.al)-parse(f.dal))/864e5+1};background:${cols[i]}"></i>`).join('');
  $('#view-fasi').innerHTML = `<div class="timeline" aria-hidden="true">${tl}</div><div class="phases">${FASI.map((f,i) => {
    const ps = POSTS.filter(p => p.fase === f.id && !p.extra);
    const cur = TODAY >= f.dal && TODAY <= f.al;
    const reels = ps.filter(p => p.tipo==='Reel').length;
    return `<article class="phase ${cur?'current':''}" style="animation-delay:${i*60}ms;border-top:4px solid ${cols[i]}">
      <div class="ph-n"><span>Fase ${f.id}</span>${cur?'<span>● In corso</span>':''}</div>
      <h3>${esc(f.nome)}</h3>
      <div class="dates">${fmtRange(f.dal, f.al)} · ${ps.length} contenuti (${reels} Reel, ${ps.length-reels} caroselli/post)</div>
      <dl class="goal"><dt>Obiettivo</dt><dd>${esc(f.obiettivo)}</dd><dt>Invito</dt><dd>${esc(f.invito)}</dd>${f.messaggio?`<dt>Messaggio</dt><dd>${esc(f.messaggio)}</dd>`:''}</dl>
      <p>${esc(f.desc)}</p>
      <div class="minis">${POSTS.filter(p => p.fase===f.id).map(p => `<button class="mini ${ids.has(p.n)?'':'dim'}" style="--c:${FCOL[p.tipo]}" data-open="${p.n}" title="${esc(p.titolo)}">${p.extra?'Extra':'#'+nn(p.n)} ${shortDate(p.date)}</button>`).join('')}</div>
    </article>`; }).join('')}</div>
    <p class="pnote" style="margin-top:14px">Fasi e date sono proposte editoriali: aperture e giornate effettive vanno confermate con la gestione. Famiglie e principianti restano al centro in tutte le fasi.</p>`;
}
function fmtRange(a,b){ const A = parse(a), B = parse(b); return `${A.getDate()} ${MN[A.getMonth()]}${A.getFullYear()!==B.getFullYear()?' '+A.getFullYear():''} – ${B.getDate()} ${MN[B.getMonth()]} ${B.getFullYear()}`; }

// --- views ---
function setView(v, scroll){
  S.view = v;
  $$('.tabs [role=tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.view === v));
  ['calendario','lista','fasi'].forEach(k => $('#view-'+k).hidden = k !== v);
  render();
  if (scroll) $('#app').scrollIntoView({behavior:'smooth'});
}
function render(){ if (S.view==='calendario') renderCalendar(); else if (S.view==='lista') renderList(); else renderPhases(); }
function refresh(){ updateCounts(); render(); }

// --- modal ---
const FB_RULES = [['Caption','Più descrittiva e informativa'],['Reel','Stesso video, con descrizione contestualizzata'],['Informazioni','Link diretto al sito o alla pagina pertinente'],['Promozioni','Condizioni, requisiti e modalità pratiche'],['Community','Domande, condivisioni e valorizzazione del territorio']];
const IG_RULES = [['Caption','Più breve ed emozionale'],['Reel','Forte impatto visivo e apertura rapida'],['Informazioni','Rimando al link in bio, se configurato'],['Promozioni','Grafica chiara e invito a scoprire'],['Community','Sondaggi, commenti, condivisioni']];
let current = null, lastFocus = null, plat = 'ig';
function openPost(n, push){
  const p = POSTS.find(x => x.n === n); if (!p) return;
  current = p; plat = S.piatt === 'fb' ? 'fb' : 'ig';
  if (!$('#modal').hidden === false) lastFocus = document.activeElement;
  const id = `#post-${nn(n)}`;
  if (push && location.hash !== id) history.pushState({post:n}, '', id);
  drawSheet();
  $('#modal').hidden = false; document.body.style.overflow = 'hidden';
  $('#sheet').focus({preventScroll:true}); $('#sheet').scrollTop = 0;
}
function drawSheet(){
  const p = current, f = faseOf(p.fase), i = POSTS.indexOf(p);
  const prev = POSTS[i-1], next = POSTS[i+1];
  const facts = [['Formato', p.formato], ['Rubrica', p.rubrica || 'Fuori calendario (extra)'], ['Fase', `${f.id}. ${f.nome}`], ['Settimana', p.extra ? '—' : `${p.settimana} di 17`], ['Piattaforme', 'Instagram + Facebook'], ['Sessione di ripresa', p.sessione || (p.tipo==='Reel' || p.extra ? '—' : 'Grafico, su modelli ricorrenti')]];
  const secHtml = p.sezioni.map(s => {
    const L = s.label;
    if (L.startsWith('Caption')){
      const cond = L !== 'Caption Instagram' ? `<p class="pnote" style="margin:0 0 8px;color:#F0B3B3">${esc(L.replace(/^Caption( Instagram)?\s*—?\s*/,'') || '')}</p>` : '';
      const isInfo = ['dubbi','appuntamento'].includes(p.rub);
      return `<section class="sec caption"><h3>Caption</h3>
        <div class="plat" role="group" aria-label="Versione"><button data-plat="ig" aria-pressed="${plat==='ig'}">Instagram</button><button data-plat="fb" aria-pressed="${plat==='fb'}">Facebook</button></div>
        ${cond}
        ${plat==='ig' ? `<div class="md"><div class="ig-head"><img src="assets/mark.webp" alt="">Anteprima Instagram</div>${md(s.text)}</div>`
        : `<div class="fbnote">Il piano usa <b>gli stessi materiali visivi</b> con un linguaggio adattato a Facebook. ${isInfo ? '<b>Per questo contenuto informativo/commerciale va preparata una caption Facebook specifica</b>, più descrittiva e, quando utile, con link diretto al sito.' : 'Si parte dalla caption Instagram, con una descrizione più contestualizzata.'}
            <table>${FB_RULES.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
            <details style="margin-top:10px"><summary style="cursor:pointer;color:var(--goldl);font-weight:700">Caption di partenza (Instagram)</summary><div class="md" style="margin-top:8px">${md(s.text)}</div></details></div>`}
      </section>`;
    }
    const cls = ['Verifica','Pubblicazione','Piano alternativo','Alternativa','Nota editoriale'].includes(L) ? 'alert' : L === 'CTA' ? 'cta' : '';
    return `<section class="sec ${cls}"><h3>${esc(L)}</h3><div class="md">${md(s.text)}</div></section>`;
  }).join('');
  $('#sheet').style.setProperty('--rc', rc(p));
  $('#sheet').innerHTML = `
    <header class="sh-head">
      <div class="sh-bar"><span class="left">${p.extra ? 'CONTENUTO EXTRA' : `CONTENUTO ${nn(p.n)} / 51`}</span>
        <span style="display:flex;gap:6px"><button class="iconbtn" data-nav="${prev?prev.n:''}" ${prev?'':'disabled'} aria-label="Contenuto precedente">‹</button><button class="iconbtn" data-nav="${next?next.n:''}" ${next?'':'disabled'} aria-label="Contenuto successivo">›</button><button class="iconbtn" data-close aria-label="Chiudi">✕</button></span></div>
      <div class="sh-date">${esc(fmtDate(p))}</div>
      <h2 id="mTitle">${esc(p.titolo)}</h2>
      <div class="tags"><span class="tag fmt" style="--fc:${FCOL[p.tipo]}">${p.tipo}${p.durata?' · '+esc(p.durata):''}</span>${p.rubrica?`<span class="tag" style="color:${rc(p)}">${esc(p.rubrica)}</span>`:''}${p.daConfermare?'<span class="tag warn">Da verificare prima della pubblicazione</span>':''}</div>
    </header>
    <div class="sh-body">
      <section class="sec"><h3>Obiettivo</h3><div class="md"><p>${esc(p.obiettivo)}</p></div></section>
      <div class="facts">${facts.map(([k,v]) => `<div class="fact"><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
      ${secHtml}
      <p class="pnote">Hashtag: non previsti nel piano. Specifiche: ${p.tipo==='Reel' ? 'Reel verticale 9:16, 1080 × 1920 px, apertura coinvolgente nei primi 2 secondi, sottotitoli per le parti parlate, logo discreto in chiusura.' : 'formato 4:5, 1080 × 1350 px, copertina riconoscibile, titoli brevi, leggibile su smartphone.'}</p>
      <div class="sh-actions">
        <button class="btn btn-gold btn-small" data-copy>Copia link</button>
        ${navigator.share ? '<button class="btn btn-ghost btn-small" data-share>Condividi</button>' : ''}
        <button class="btn btn-ghost btn-small" data-ics1>Aggiungi al calendario</button>
      </div>
    </div>`;
}
function closeModal(fromPop){
  if ($('#modal').hidden) return;
  $('#modal').hidden = true; document.body.style.overflow = '';
  if (!fromPop && location.hash.startsWith('#post-')) history.pushState(null, '', location.pathname + location.search);
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({preventScroll:true});
  current = null;
}
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 1800); }
function linkFor(p){ return BASE + '#post-' + nn(p.n); }

// --- ICS ---
function icsEsc(s){ return String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
function fold(l){ const out = []; while (l.length > 73){ out.push(l.slice(0,73)); l = ' ' + l.slice(73); } out.push(l); return out.join('\r\n'); }
function downloadIcs(list, name){
  const stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const ev = list.map(p => {
    const d = p.date.replace(/-/g,''); const e = iso(new Date(parse(p.date).getTime() + 864e5 + 3600e3)).replace(/-/g,'');
    const cta = (p.sezioni.find(s => s.label==='CTA')||{}).text || '';
    const desc = `${p.formato} · ${p.rubrica || 'Extra'}\nObiettivo: ${p.obiettivo}${cta?'\nCTA: '+cta:''}${p.daConfermare?'\nDa verificare prima della pubblicazione.':''}\nScheda: ${linkFor(p)}`;
    return ['BEGIN:VEVENT', `UID:ped-panarotta-${nn(p.n)}@riccardo-morelli-01.github.io`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${e}`, fold(`SUMMARY:${icsEsc(`${p.extra?'Extra':'#'+nn(p.n)} ${p.tipo} · ${p.titolo}`)}`), fold(`DESCRIPTION:${icsEsc(desc)}`), `URL:${linkFor(p)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT'].join('\r\n');
  });
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PED Panarotta//IT','CALSCALE:GREGORIAN','X-WR-CALNAME:PED Panarotta 2026–2027', ...ev, 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], {type:'text/calendar'})); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast(`${list.length} contenut${list.length===1?'o':'i'} esportat${list.length===1?'o':'i'} in .ics`);
}

// --- strategy ---
function renderStrategy(){
  const main = POSTS.filter(p => !p.extra);
  const byM = MESI.map(m => ({m, ps: main.filter(p => p.date.startsWith(m.k))}));
  const max = Math.max(...byM.map(x => x.ps.length));
  const rubCount = id => main.filter(p => p.rub === id).length;
  $('#strategia').innerHTML = `
  <div class="s-head reveal"><p class="eyebrow">La strategia in breve</p><h2>Perché questi contenuti</h2><p>Il piano trasforma la Panarotta in una destinazione riconoscibile, desiderata e frequentata, partendo dalle famiglie e dal territorio.</p></div>
  <div class="bento">
    <div class="box w8 reveal"><h3>Posizionamento</h3><p class="quote">«Panarotta: la montagna da vivere, scoprire e condividere.»</p><p class="muted">Una destinazione vicina al territorio, accogliente e accessibile, per famiglie, bambini, principianti e appassionati. Non solo un luogo in cui acquistare uno skipass.</p><div class="pill-row"><span class="pill">Accessibilità</span><span class="pill">Esperienza</span><span class="pill">Appartenenza</span></div></div>
    <div class="box w4 reveal"><h3>Canali</h3><p><b>Instagram</b> · canale principale: emozionare, incuriosire, raggiungere nuove persone.</p><p><b>Facebook</b> · complementare: informare, coinvolgere il territorio, promuovere le visite.</p><p class="muted">Un unico calendario, stessi materiali visivi, linguaggio adattato. Programmazione con Meta Business Suite.</p></div>
    <div class="box reveal"><h3>I 5 obiettivi, in ordine di priorità</h3><ol class="olist">
      ${[['Aumentare gli ingressi','Più persone che scelgono la Panarotta per sciare'],['Far conoscere la Panarotta','Maggiore riconoscibilità, soprattutto sul territorio'],['Migliorare la comunicazione','Informazioni chiare che aiutano a organizzare una visita'],['Promuovere offerte ed eventi','Più interesse e adesioni alle iniziative'],['Creare una community attiva','Un pubblico fedele che interagisce e torna nel tempo']].map((o,i) => `<li><i>${i+1}</i><div><b>${o[0]}</b><span>${o[1]}</span></div></li>`).join('')}
    </ol></div>
    <div class="box reveal"><h3>A chi parliamo</h3><div class="targets">
      <div class="target"><b>Famiglie con bambini · primario</b><span>Genitori dell’Alta Valsugana, Valsugana e Trento: esperienze piacevoli per i figli, informazioni chiare, semplicità e opportunità interessanti.</span></div>
      <div class="target"><b>Principianti · primario</b><span>Bambini, ragazzi e adulti che iniziano o riprendono a sciare: ambiente accogliente, piste adatte, come iniziare.</span></div>
      <div class="target"><b>Sciatori e comunità locale · secondario</b><span>Giovani, appassionati, sci club, associazioni e visitatori: condizioni delle piste, eventi, esperienze autentiche, novità.</span></div>
    </div></div>
    <div class="box w12 reveal"><h3>Le 7 rubriche <span class="muted" style="text-transform:none;letter-spacing:0;font-weight:600">· tocca per filtrare i contenuti</span></h3><div class="rubs">
      ${RUBRICHE.map(r => `<button class="rubc" style="--rc:var(--r-${r.id})" data-rubfilter="${r.id}"><small>${esc(r.area)} · ${esc(r.formati)}</small><b>${esc(r.nome)}</b><span>${esc(r.desc)}</span><em>${esc(r.es)}</em><span style="color:var(--text);font-weight:700">${rubCount(r.id)} contenuti nel piano</span></button>`).join('')}
      <div class="rubc" style="--rc:var(--story);cursor:default"><small>Flusso operativo · Stories</small><b>Oggi in Panarotta</b><span>Comunicazioni tempestive su impianti e piste aperti, neve e meteo, variazioni e chiusure, informazioni per il weekend. Solo su informazioni operative verificate, fuori dal calendario creativo.</span></div>
    </div></div>
    <div class="box reveal"><h3>Il mix dei contenuti programmati</h3><div class="bars">
      ${[['Famiglie, principianti e informazioni utili',60,'var(--car)'],['Emozioni, territorio e community',25,'var(--gold)'],['Promozioni ed eventi',15,'var(--r-appuntamento)']].map(b => `<div class="barrow"><div class="lab"><span>${b[0]}</span><b>${b[1]}%</b></div><div class="track"><div class="fill" data-w="${b[1]}" style="background:${b[2]}"></div></div></div>`).join('')}
    </div><p class="muted" style="margin-top:12px;font-size:13px">Ripartizione strategica proposta, esclusi gli aggiornamenti urgenti.</p></div>
    <div class="box reveal"><h3>Contenuti per mese</h3><div class="months">
      ${byM.map(x => { const r = x.ps.filter(p => p.tipo==='Reel').length; return `<div class="mcol"><b>${x.ps.length}</b><div class="col" data-h="${x.ps.length/max*100}" title="${r} Reel, ${x.ps.length-r} caroselli/post"><i style="height:${(x.ps.length-r)/x.ps.length*100}%"></i></div><span>${x.m.nome.slice(0,3)}</span></div>`; }).join('')}
    </div><div class="legend"><span><i class="dot" style="background:var(--gold)"></i>Reel</span><span><i class="dot" style="background:var(--car)"></i>Caroselli e post</span></div></div>
    <div class="box w12 reveal"><h3>Il ritmo di ogni settimana</h3><div class="week">
      ${[['Lun','Stories leggere o pausa'],['Mar','Reel emozionale o educativo',1],['Mer','Stories interattive'],['Gio','Carosello informativo o promozionale',1],['Ven','Stories sul weekend'],['Sab','Reel esperienza o community',1],['Dom','Stories sul campo, quando possibile']].map(d => `<div class="wd ${d[2]?'key':''}"><b>${d[0]}</b><span>${d[1]}</span></div>`).join('')}
    </div><p class="muted" style="margin-top:12px;font-size:13px">Instagram: 2 Reel + 1 carosello a settimana, Stories 4–5 giorni. Facebook: 2–3 pubblicazioni e Stories 2–4 giorni. Il martedì raggiunge, il giovedì aiuta a programmare la visita, il sabato valorizza l’esperienza.</p></div>
    <div class="box reveal"><h3>Le Stories</h3><p>Non replicano i post principali: li rafforzano e fanno partecipare le persone. Sondaggi, box domande, quiz, backstage, aggiornamenti operativi, FAQ, contenuti dal campo.</p><p>A Carnevale si possono aumentare oltre le 4–5 giornate, se c’è materiale autentico.</p><div class="pill-row">${['Info utili','Skipass','Piste','Famiglie','Eventi'].map(h => `<span class="pill">${h}</span>`).join('')}</div><p class="muted" style="margin-top:8px;font-size:13px">Raccolte in evidenza suggerite per il profilo Instagram. <button class="link" data-storiesview>Vedi le idee settimana per settimana</button></p></div>
    <div class="box reveal"><h3>Come misuriamo i risultati</h3><table class="simple"><tbody>
      ${[['Reel emozionali','Copertura, visualizzazioni e condivisioni'],['Guide e caroselli','Salvataggi, condivisioni e visite al profilo'],['Promozioni','Clic al sito, richieste e interesse commerciale'],['Community','Commenti, risposte e interazioni'],['Aperture e informazioni','Copertura tempestiva, clic e richieste pertinenti']].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
    </tbody></table><p class="muted" style="margin-top:10px;font-size:13px">Indicatore principale: ingressi e skipass nelle giornate di apertura, confrontati quando possibile con la stagione precedente. KPI qualitativi: target numerici ancora da definire.</p></div>
    <div class="box w12 reveal"><h3>Produzione e approvazioni</h3>
      <p><b>Squadra:</b> responsabile social e piano editoriale · fotografo · videomaker · personale Panarotta. Una o due sessioni di riprese al mese, raggruppate per tipologia.</p>
      <p><b>Chi approva cosa:</b> contenuti creativi → approvazione editoriale ordinaria; contenuti informativi → revisione del referente operativo; contenuti commerciali e annunci di apertura → solo dopo conferma ufficiale della gestione.</p>
      <p style="margin-top:10px"><b>Stati di avanzamento proposti</b></p><div class="steps"><span>Da produrre</span><i>→</i><span>In produzione</span><i>→</i><span>Da approvare</span><i>→</i><span>Programmato</span><i>→</i><span>Pubblicato</span></div>
      <p class="muted" style="margin-top:12px;font-size:13px">Ancora da definire: calendario ufficiale di apertura, tariffe e agevolazioni 2026–2027, eventi e collaborazioni, responsabili nominativi e scadenze, budget e target numerici.</p></div>
  </div>`;
}

// --- events ---
document.addEventListener('click', e => {
  const t = e.target;
  const open = t.closest('[data-open]'); if (open){ openPost(+open.dataset.open, true); return; }
  const nav = t.closest('[data-nav]'); if (nav && nav.dataset.nav){ const n = +nav.dataset.nav; history.replaceState({post:n}, '', `#post-${nn(n)}`); openPost(n, false); return; }
  if (t.closest('[data-close]')){ closeModal(); return; }
  const pl = t.closest('[data-plat]'); if (pl){ plat = pl.dataset.plat; const st = $('#sheet').scrollTop; drawSheet(); $('#sheet').scrollTop = st; return; }
  if (t.closest('[data-copy]')){ const url = linkFor(current); (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('Link copiato'), () => prompt('Copia il link:', url)); return; }
  if (t.closest('[data-share]')){ navigator.share({title:`PED Panarotta · ${current.titolo}`, url:linkFor(current)}).catch(()=>{}); return; }
  if (t.closest('[data-ics1]')){ downloadIcs([current], `ped-panarotta-${nn(current.n)}.ics`); return; }
  const tab = t.closest('.tabs [role=tab]'); if (tab){ setView(tab.dataset.view); history.replaceState(null,'','#'+tab.dataset.view); return; }
  const go = t.closest('[data-goto]'); if (go){ e.preventDefault(); setView(go.dataset.goto, true); history.replaceState(null,'','#'+go.dataset.goto); return; }
  const mb = t.closest('[data-month]'); if (mb){ S.month = mb.dataset.month; renderCalendar(); return; }
  const ms = t.closest('[data-mstep]'); if (ms){ const i = MESI.findIndex(m => m.k===S.month) + +ms.dataset.mstep; if (MESI[i]){ S.month = MESI[i].k; renderCalendar(); } return; }
  const gb = t.closest('[data-group]'); if (gb){ S.group = gb.dataset.group; renderList(); return; }
  if (t.closest('[data-reset]')){ $('#reset').click(); return; }
  const rf = t.closest('[data-rubfilter]'); if (rf){ S.rub.clear(); S.rub.add(rf.dataset.rubfilter); renderFilters(); setView('lista', true); updateCounts(); return; }
  if (t.closest('[data-storiesview]')){ S.formati.clear(); S.formati.add('Stories'); S.group='settimana'; renderFilters(); updateCounts(); setView('lista', true); return; }
});
document.addEventListener('keydown', e => {
  if ($('#modal').hidden) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ const b = $(`[data-nav][aria-label^="Contenuto ${e.key==='ArrowRight'?'succ':'prec'}"]`); if (b && !b.disabled) b.click(); }
  if (e.key === 'Tab'){ const f = $$('button, a, summary, [tabindex="0"]', $('#sheet')).filter(x => !x.disabled); if (!f.length) return; const a = f[0], z = f[f.length-1]; if (e.shiftKey && document.activeElement === a){ e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z){ e.preventDefault(); a.focus(); } }
});
function route(fromPop){
  const h = location.hash;
  const m = h.match(/^#post-(\d{1,2})$/);
  if (m){ openPost(+m[1], false); return; }
  closeModal(true);
  if (['#calendario','#lista','#fasi'].includes(h)) setView(h.slice(1), !fromPop ? false : false);
}
window.addEventListener('popstate', () => route(true));
window.addEventListener('hashchange', () => route(true));
window.addEventListener('scroll', () => $('#topbar').classList.toggle('scrolled', scrollY > 10), {passive:true});

// reveal + chart animations
function observe(){
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add('in'); $$('.fill', en.target).forEach(f => f.style.width = f.dataset.w + '%'); $$('.col', en.target).forEach(c => c.style.height = c.dataset.h + '%'); io.unobserve(en.target); } }), {threshold:.12}) : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));
  if (!io){ $$('.fill').forEach(f => f.style.width = f.dataset.w+'%'); $$('.col').forEach(c => c.style.height = c.dataset.h+'%'); }
}

// init
renderKpis(); renderNext(); renderFilters(); bindFilters(); renderStrategy(); updateCounts();
const h0 = location.hash.slice(1);
setView(['lista','fasi'].includes(h0) ? h0 : 'calendario');
observe();
route(false);
window.addEventListener('beforeprint', () => { if (S.view !== 'lista'){ S._pv = S.view; } $('#view-lista').hidden = false; renderList(); });
window.addEventListener('afterprint', () => { if (S._pv){ setView(S._pv); S._pv = null; } });
})();

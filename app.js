(() => {
"use strict";

/* ---------------- i18n ---------------- */
const T = {
  de:{
    tagline:"Addition &amp; Subtraktion · Stein für Stein",
    rule:"Jeder Stein ist die Summe der beiden Steine darunter.",
    setup:"Aufgabe", rows:"Reihen", mode:"Modus", puzzle:"Rätsel", sandbox:"Freier Bau",
    range:"Zahlen", nat:"Natürlich", int:"Ganz", diff:"Stufe", easy:"Leicht", medium:"Mittel", hard:"Schwer",
    stats:"Fortschritt", time:"Zeit", left:"Offen", hints:"Tipps", best:"Bestzeit",
    nw:"Neue Aufgabe", hint:"Tipp", walk:"Lösungsweg", stop:"Stopp", check:"Prüfen", clear:"Leeren",
    sound:"Ton", drag:"Ziehen zum Drehen · Doppelklick zurück",
    kbd:'<kbd>↑↓←→</kbd> bewegen · <kbd>Enter</kbd> prüfen · <kbd>?</kbd> Tipp',
    start:"Klicke einen leeren Stein an und trage die passende Zahl ein.",
    sandboxMsg:"Freier Bau: Trage beliebige Zahlen ein — alles Ableitbare wird ergänzt.",
    sandboxConf:"Widerspruch: markierte Steine passen nicht zur Regel.",
    newTask:(n,d)=>`Neue Aufgabe: ${n} Reihen, Stufe ${d}. Viel Erfolg!`,
    sumStep:(v,a,b)=>`<b>${v}</b> = ${a} + ${b}`,
    difStep:(v,a,b)=>`<b>${v}</b> = ${a} − ${b}`,
    hintNone:"Keine weitere Zahl direkt ableitbar — prüfe deine Einträge.",
    allDone:"Alles ausgefüllt.",
    won:(t,h)=>`Pyramide vollständig! Zeit ${t}${h?`, ${h} Tipp${h>1?"s":""}`:" — ohne Tipps"}.`,
    newBest:(t)=>`Neue Bestzeit: ${t}!`,
    wrongN:(n)=>`${n} Stein${n>1?"e passen":" passt"} noch nicht.`,
    allRight:"Bisher alles richtig — weiter so.",
    empty:"Noch nichts eingetragen.",
    walkDone:"Lösungsweg beendet.",
    cleared:"Alle eigenen Einträge gelöscht.",
    brick:(r,i)=>`Reihe ${r} von unten, Stein ${i}`
  },
  en:{
    tagline:"Addition &amp; subtraction · brick by brick",
    rule:"Every brick is the sum of the two bricks below it.",
    setup:"Puzzle", rows:"Rows", mode:"Mode", puzzle:"Puzzle", sandbox:"Free build",
    range:"Numbers", nat:"Natural", int:"Integers", diff:"Level", easy:"Easy", medium:"Medium", hard:"Hard",
    stats:"Progress", time:"Time", left:"Open", hints:"Hints", best:"Best",
    nw:"New puzzle", hint:"Hint", walk:"Walkthrough", stop:"Stop", check:"Check", clear:"Clear",
    sound:"Sound", drag:"Drag to rotate · double-click resets",
    kbd:'<kbd>↑↓←→</kbd> move · <kbd>Enter</kbd> check · <kbd>?</kbd> hint',
    start:"Click an empty brick and type the number that belongs there.",
    sandboxMsg:"Free build: type any numbers — everything derivable is filled in.",
    sandboxConf:"Contradiction: the marked bricks break the rule.",
    newTask:(n,d)=>`New puzzle: ${n} rows, ${d} level. Good luck!`,
    sumStep:(v,a,b)=>`<b>${v}</b> = ${a} + ${b}`,
    difStep:(v,a,b)=>`<b>${v}</b> = ${a} − ${b}`,
    hintNone:"Nothing else follows directly — check your entries.",
    allDone:"Everything is filled in.",
    won:(t,h)=>`Pyramid complete! Time ${t}${h?`, ${h} hint${h>1?"s":""}`:" — no hints"}.`,
    newBest:(t)=>`New best time: ${t}!`,
    wrongN:(n)=>`${n} brick${n>1?"s don't":" doesn't"} fit yet.`,
    allRight:"Everything correct so far — keep going.",
    empty:"Nothing entered yet.",
    walkDone:"Walkthrough finished.",
    cleared:"Your entries were cleared.",
    brick:(r,i)=>`Row ${r} from the bottom, brick ${i}`
  }
};
const t = k => T[S.lang][k];

/* ---------------- state ---------------- */
const S = {
  rows:5, mode:"puzzle", range:"nat", diff:"medium", lang:"de",
  sound:false, three:true,
  sol:null, given:null, val:null,
  hints:0, solved:false, startedAt:null, elapsed:0, tick:null,
  tx:18, ty:-10, walking:false, walkTimer:null
};

const el = id => document.getElementById(id);
const board = el("board"), stage = el("stage"), fx = el("fx");

/* ---------------- pyramid maths ---------------- */
const grid = (rows, fill) => Array.from({length:rows}, (_,r)=>Array(rows-r).fill(fill));
const cellCount = n => n*(n+1)/2;

function randomPyramid(rows, range){
  const cap = rows<=3 ? 25 : rows<=5 ? 14 : rows<=6 ? 10 : 7;
  const g = grid(rows, 0);
  for(let i=0;i<rows;i++){
    g[0][i] = range==="int"
      ? Math.round((Math.random()*2-1)*cap) || 1
      : 1 + Math.floor(Math.random()*cap);
  }
  for(let r=1;r<rows;r++) for(let i=0;i<rows-r;i++) g[r][i] = g[r-1][i] + g[r-1][i+1];
  return g;
}

/** Fill everything that follows from the known values. Returns the ordered steps. */
function propagate(k, rows){
  const steps=[]; let changed=true, guard=0;
  while(changed && guard++ < 400){
    changed=false;
    for(let r=1;r<rows;r++) for(let i=0;i<rows-r;i++){
      const p=k[r][i], a=k[r-1][i], b=k[r-1][i+1];
      if(p==null && a!=null && b!=null){
        k[r][i]=a+b; steps.push({at:[r,i],from:[[r-1,i],[r-1,i+1]],op:"+",v:a+b,a,b}); changed=true;
      } else if(a==null && p!=null && b!=null){
        k[r-1][i]=p-b; steps.push({at:[r-1,i],from:[[r,i],[r-1,i+1]],op:"-",v:p-b,a:p,b}); changed=true;
      } else if(b==null && p!=null && a!=null){
        k[r-1][i+1]=p-a; steps.push({at:[r-1,i+1],from:[[r,i],[r-1,i]],op:"-",v:p-a,a:p,b:a}); changed=true;
      }
    }
  }
  return steps;
}
const isFull = (k,rows) => k.every(row=>row.every(v=>v!=null));
const copy = k => k.map(r=>r.slice());

function solvableFrom(sol, given, rows){
  const k = grid(rows, null);
  for(let r=0;r<rows;r++) for(let i=0;i<rows-r;i++) if(given[r][i]) k[r][i]=sol[r][i];
  propagate(k, rows);
  return isFull(k, rows);
}

function makePuzzle(rows, diff, range){
  const sol = randomPyramid(rows, range);
  const given = grid(rows, true);
  const coords = [];
  for(let r=0;r<rows;r++) for(let i=0;i<rows-r;i++) coords.push([r,i]);
  for(let i=coords.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [coords[i],coords[j]]=[coords[j],coords[i]]; }

  const total = cellCount(rows);
  const want = diff==="easy"   ? Math.max(rows+2, Math.round(total*0.58))
             : diff==="medium" ? Math.max(rows+1, Math.round(total*0.40))
             : rows;                         // hard → keep removing until minimal
  const target = Math.min(want, total-1);    // always leave at least one brick blank
  let count = total;
  for(const [r,i] of coords){
    if(count <= target) break;
    given[r][i] = false;
    if(!solvableFrom(sol, given, rows)) given[r][i] = true; else count--;
  }
  return {sol, given};
}

/* ---------------- sound ---------------- */
let actx=null;
function beep(freq, dur=.09, type="triangle", gain=.05){
  if(!S.sound) return;
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    if(actx.state==="suspended") actx.resume();
    const o=actx.createOscillator(), g=actx.createGain();
    o.type=type; o.frequency.value=freq; o.connect(g); g.connect(actx.destination);
    const n=actx.currentTime;
    g.gain.setValueAtTime(0,n); g.gain.linearRampToValueAtTime(gain,n+.012);
    g.gain.exponentialRampToValueAtTime(.0001,n+dur);
    o.start(n); o.stop(n+dur+.02);
  }catch(e){}
}
const sndOk = () => beep(660,.09), sndBad = () => beep(150,.16,"sawtooth",.04), sndType = () => beep(420,.04,"sine",.03);
function sndWin(){ if(!S.sound) return; [523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.22,"triangle",.05), i*110)); }

/* ---------------- storage ---------------- */
const bestKey = () => `zp:best:${S.rows}:${S.diff}:${S.range}`;
function getBest(){ try{ const v=localStorage.getItem(bestKey()); return v?+v:null; }catch(e){ return null; } }
function setBest(s){ try{ localStorage.setItem(bestKey(), String(s)); }catch(e){} }

/* ---------------- building the board ---------------- */
function newGame(keep){
  stopWalk();
  if(S.mode==="puzzle"){
    const p = makePuzzle(S.rows, S.diff, S.range);
    S.sol = p.sol; S.given = p.given;
    S.val = grid(S.rows, null);
    for(let r=0;r<S.rows;r++) for(let i=0;i<S.rows-r;i++) if(S.given[r][i]) S.val[r][i]=S.sol[r][i];
  } else {
    S.sol=null; S.given=grid(S.rows,false); S.val=grid(S.rows,null);
  }
  S.hints=0; S.solved=false; S.elapsed=0; S.startedAt=null;
  clearInterval(S.tick); S.tick=null;
  buildDOM(); sizeBoard(); render();
  if(!keep) say(S.mode==="puzzle" ? t("newTask")(S.rows, t(S.diff).toLowerCase()) : t("sandboxMsg"), "info");
  el("bWalk").disabled = S.mode!=="puzzle";
  el("bHint").disabled = S.mode!=="puzzle";
  el("bCheck").disabled = S.mode!=="puzzle";
  el("statCard").style.opacity = S.mode==="puzzle" ? "1" : ".55";
}

function buildDOM(){
  board.textContent = "";
  for(let r=S.rows-1;r>=0;r--){
    const row = document.createElement("div");
    row.className="row";
    for(let i=0;i<S.rows-r;i++){
      const b = document.createElement("div");
      b.className="brick"; b.dataset.r=r; b.dataset.i=i;
      b.innerHTML = '<div class="face top"></div><div class="face sl"></div><div class="face sr"></div>';
      const inp = document.createElement("input");
      inp.className="cell"; inp.type="text"; inp.inputMode = S.range==="int" ? "text" : "numeric";
      inp.autocomplete="off"; inp.spellcheck=false; inp.id=`c-${r}-${i}`;
      inp.setAttribute("aria-label", T[S.lang].brick(r+1, i+1));
      b.appendChild(inp);
      row.appendChild(b);
    }
    board.appendChild(row);
  }
  board.querySelectorAll(".cell").forEach(inp=>{
    inp.addEventListener("input", onInput);
    inp.addEventListener("keydown", onKey);
    inp.addEventListener("focus", e=>e.target.select());
  });
}

function cellAt(r,i){ return document.getElementById(`c-${r}-${i}`); }
function brickAt(r,i){ const c=cellAt(r,i); return c && c.parentElement; }

/* ---------------- sizing ---------------- */
function sizeBoard(){
  const w = stage.clientWidth - 30, h = stage.clientHeight - 54;
  const n = S.rows;
  const gap = Math.max(3, Math.min(8, Math.round(w/(n*15))));
  let bw = Math.floor((w - gap*(n-1))/n);
  bw = Math.min(bw, n<=3 ? 168 : n<=4 ? 142 : n<=6 ? 120 : 102);
  let bh = Math.max(26, Math.min(Math.round(bw*0.58), 80));
  const need = n*(bh+gap);
  if(need > h){ const k = Math.max(.55, h/need); bh = Math.max(24, Math.floor(bh*k)); bw = Math.max(30, Math.floor(bw*k)); }
  const d = S.three ? Math.max(5, Math.round(bh*0.28)) : 0;
  board.style.setProperty("--bw", bw+"px");
  board.style.setProperty("--bh", bh+"px");
  board.style.setProperty("--gap", gap+"px");
  board.style.setProperty("--d", d+"px");
  board.dataset.bw = bw; board.dataset.bh = bh;
  fitText();
}
function fitText(){
  const bw = +board.dataset.bw || 60, bh = +board.dataset.bh || 36;
  board.querySelectorAll(".cell").forEach(inp=>{
    const len = Math.max(1, (inp.value||"").length);
    const byH = bh*0.46, byW = (bw-8)/(0.78*len);
    inp.style.fontSize = Math.max(9, Math.min(byH, byW, 24)).toFixed(1)+"px";
  });
}

/* ---------------- rendering ---------------- */
function render(focusEl){
  const rows=S.rows;
  let derived=null, conflict=new Set();

  if(S.mode==="sandbox"){
    derived = copy(S.val);
    propagate(derived, rows);
    for(let r=1;r<rows;r++) for(let i=0;i<rows-r;i++){
      const p=derived[r][i], a=derived[r-1][i], b=derived[r-1][i+1];
      if(p!=null&&a!=null&&b!=null&&p!==a+b){ conflict.add(`${r},${i}`); conflict.add(`${r-1},${i}`); conflict.add(`${r-1},${i+1}`); }
    }
  }

  let open=0, wrong=0, filled=0, blanks=0;
  for(let r=0;r<rows;r++) for(let i=0;i<rows-r;i++){
    const b=brickAt(r,i), inp=cellAt(r,i); if(!b) continue;
    b.className="brick";
    const isGiven = S.mode==="puzzle" && S.given[r][i];
    const own = S.val[r][i];
    let shown = own, cls="";

    if(isGiven){ cls="given"; }
    else if(S.mode==="sandbox"){
      if(own!=null) cls="typed";
      else if(derived[r][i]!=null){ shown = derived[r][i]; cls="derived"; }
      else cls="blank";
      if(conflict.has(`${r},${i}`)) cls += " bad";
    } else {
      blanks++;
      if(own==null){ cls="blank"; open++; }
      else if(own===S.sol[r][i]){ cls="ok"; filled++; }
      else { cls="bad"; wrong++; filled++; }
    }
    b.className = "brick "+cls;
    const str = shown==null ? "" : String(shown);
    if(inp !== focusEl && inp.value !== str) inp.value = str;
    inp.readOnly = isGiven;
    inp.placeholder = isGiven ? "" : "·";
  }

  if(S.mode==="puzzle"){
    el("sLeft").textContent = open;
    const pct = blanks ? Math.round(((blanks-open)/blanks)*100) : 100;
    el("bar").firstElementChild.style.width = pct+"%";
    el("bar").classList.toggle("done", open===0 && wrong===0);
    if(blanks>0 && open===0 && wrong===0 && !S.solved) win();
  } else {
    el("sLeft").textContent = "—";
    el("bar").firstElementChild.style.width = "0%";
    if(conflict.size) say(t("sandboxConf"), "bad");
  }
  el("sHints").textContent = S.hints;
  const b = getBest(); el("sBest").textContent = b ? fmt(b) : "—";
  fitText();
  return {open, wrong};
}

/* ---------------- interaction ---------------- */
function parseVal(s){
  s = (s||"").trim().replace(/[–—−]/g,"-");
  if(s===""||s==="-") return null;
  if(!/^-?\d+$/.test(s)) return NaN;
  return parseInt(s,10);
}
function onInput(e){
  const inp=e.target, r=+inp.parentElement.dataset.r, i=+inp.parentElement.dataset.i;
  let raw = inp.value.replace(/[^\d\-]/g,"");
  if(S.range==="nat" && S.mode==="puzzle") raw = raw.replace(/-/g,"");
  raw = raw.replace(/(?!^)-/g,"").slice(0,6);
  if(raw!==inp.value) inp.value=raw;
  const v = parseVal(raw);
  S.val[r][i] = Number.isNaN(v) ? null : v;
  startTimer();
  sndType();
  const before = S.solved;
  const st = render(inp);
  if(S.mode==="puzzle" && v!=null && !Number.isNaN(v) && !before){
    if(v===S.sol[r][i]) { sndOk(); say(explain(r,i), "ok"); }
    else say(t("wrongN")(st.wrong), "bad");
  }
}
function explain(r,i){
  if(r>0) return T[S.lang].sumStep(S.sol[r][i], S.sol[r-1][i], S.sol[r-1][i+1]);
  // bottom row: explain it as the difference that determined it, if a parent is known
  const pr = 1, pi = Math.min(i, S.rows-2);
  const sib = (i === pi) ? pi+1 : pi;          // the other child of that parent
  return T[S.lang].difStep(S.sol[0][i], S.sol[pr][pi], S.sol[0][sib]);
}
function onKey(e){
  const p=e.target.parentElement, r=+p.dataset.r, i=+p.dataset.i;
  const go=(nr,ni)=>{ const c=cellAt(nr,ni); if(c){ c.focus(); e.preventDefault(); } };
  if(e.key==="ArrowLeft" && e.target.selectionStart===0) go(r, i-1);
  else if(e.key==="ArrowRight" && e.target.selectionStart===e.target.value.length) go(r, i+1);
  else if(e.key==="ArrowUp") go(r+1, Math.min(i, S.rows-r-2));
  else if(e.key==="ArrowDown") go(r-1, i);
  else if(e.key==="Enter"){ e.preventDefault(); check(); }
  else if(e.key==="?"){ e.preventDefault(); hint(); }
}

/* ---------------- actions ---------------- */
function check(){
  if(S.mode!=="puzzle") return;
  const st = render();
  if(st.wrong>0){ sndBad(); say(t("wrongN")(st.wrong), "bad"); flashBad(); }
  else if(st.open>0) say(t("allRight"), "ok");
  else if(!S.solved) win();
}
function flashBad(){
  board.querySelectorAll(".brick.bad").forEach(b=>{ b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad"); });
}
function hint(){
  if(S.mode!=="puzzle" || S.solved) return;
  const k = grid(S.rows, null);
  for(let r=0;r<S.rows;r++) for(let i=0;i<S.rows-r;i++){
    if(S.given[r][i] || S.val[r][i]===S.sol[r][i]) k[r][i]=S.sol[r][i];
  }
  if(isFull(k,S.rows)){ say(t("allDone"),"ok"); return; }
  const steps = propagate(copy(k), S.rows);
  if(!steps.length){ say(t("hintNone"),"bad"); return; }
  const s = steps[0];
  const [r,i]=s.at;
  S.val[r][i]=s.v; S.hints++;
  startTimer(); render();
  s.from.forEach(([fr,fi])=>{ const b=brickAt(fr,fi); if(b){ b.classList.add("src"); setTimeout(()=>b.classList.remove("src"),900); } });
  const tgt=brickAt(r,i); if(tgt){ tgt.classList.add("pop"); setTimeout(()=>tgt.classList.remove("pop"),420); }
  say((s.op==="+"?T[S.lang].sumStep:T[S.lang].difStep)(s.v, s.a, s.b), "info");
  sndOk();
}
function walk(){
  if(S.walking){ stopWalk(); return; }
  if(S.mode!=="puzzle") return;
  const k = grid(S.rows,null);
  for(let r=0;r<S.rows;r++) for(let i=0;i<S.rows-r;i++) if(S.given[r][i]) k[r][i]=S.sol[r][i];
  const steps = propagate(copy(k), S.rows);
  for(let r=0;r<S.rows;r++) for(let i=0;i<S.rows-r;i++) if(!S.given[r][i]) S.val[r][i]=null;
  render();
  S.walking=true; S.solved=true;
  clearInterval(S.tick); S.tick=null;
  el("bWalk").textContent = t("stop");
  let n=0;
  const next = () => {
    if(!S.walking || n>=steps.length){ stopWalk(); say(t("walkDone"),"info"); return; }
    const s=steps[n++], [r,i]=s.at;
    S.val[r][i]=s.v; render();
    s.from.forEach(([fr,fi])=>{ const b=brickAt(fr,fi); if(b){ b.classList.add("src"); setTimeout(()=>b.classList.remove("src"),800); } });
    const tgt=brickAt(r,i); if(tgt){ tgt.classList.add("pop"); setTimeout(()=>tgt.classList.remove("pop"),400); }
    say((s.op==="+"?T[S.lang].sumStep:T[S.lang].difStep)(s.v,s.a,s.b), "info");
    beep(380+n*18,.06,"sine",.03);
    S.walkTimer=setTimeout(next, 780);
  };
  next();
}
function stopWalk(){
  S.walking=false; clearTimeout(S.walkTimer); S.walkTimer=null;
  const b=el("bWalk"); if(b) b.textContent=t("walk");
}
function clearAll(){
  stopWalk();
  for(let r=0;r<S.rows;r++) for(let i=0;i<S.rows-r;i++) if(S.mode==="sandbox"||!S.given[r][i]) S.val[r][i]=null;
  S.solved=false; render(); say(t("cleared"),"info");
}
function win(){
  S.solved=true;
  clearInterval(S.tick); S.tick=null;
  const top=brickAt(S.rows-1,0); if(top) top.classList.add("crown");
  const secs=S.elapsed;
  const prev=getBest();
  let msg = t("won")(fmt(secs), S.hints);
  if(S.hints===0 && (prev==null || secs<prev)){ setBest(secs); msg += " " + t("newBest")(fmt(secs)); }
  say(msg,"ok"); sndWin(); wave(); confetti();
  el("sBest").textContent = getBest()?fmt(getBest()):"—";
}
function wave(){
  const bricks=[...board.querySelectorAll(".brick")];
  bricks.forEach(b=>{
    const r=+b.dataset.r;
    setTimeout(()=>{ b.classList.add("pop"); setTimeout(()=>b.classList.remove("pop"),260); }, (S.rows-r)*70);
  });
}

/* ---------------- timer & status ---------------- */
function fmt(s){ const m=Math.floor(s/60); return `${m}:${String(s%60).padStart(2,"0")}`; }
function startTimer(){
  if(S.tick || S.solved || S.mode!=="puzzle") return;
  S.startedAt = Date.now() - S.elapsed*1000;
  S.tick = setInterval(()=>{
    S.elapsed = Math.floor((Date.now()-S.startedAt)/1000);
    el("sTime").textContent = fmt(S.elapsed);
  },500);
}
function say(html, kind){
  el("status").innerHTML = html;
  const bar=el("statusbar");
  bar.className = "statusbar " + (kind||"info");
}

/* ---------------- confetti ---------------- */
let parts=[], raf=null;
function confetti(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const dpr=Math.min(2,devicePixelRatio||1), w=stage.clientWidth, h=stage.clientHeight;
  fx.width=w*dpr; fx.height=h*dpr; fx.style.width=w+"px"; fx.style.height=h+"px";
  const ctx=fx.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0);
  const cs=getComputedStyle(document.documentElement);
  const cols=[cs.getPropertyValue("--gold"),cs.getPropertyValue("--accent"),cs.getPropertyValue("--good"),cs.getPropertyValue("--ink")].map(c=>c.trim());
  parts=[];
  for(let i=0;i<110;i++) parts.push({
    x:w/2+(Math.random()-.5)*60, y:h*0.3, vx:(Math.random()-.5)*7, vy:-Math.random()*9-2,
    w:3+Math.random()*6, h:3+Math.random()*9, a:Math.random()*Math.PI, va:(Math.random()-.5)*.35,
    c:cols[i%cols.length], life:90+Math.random()*60
  });
  cancelAnimationFrame(raf);
  const step=()=>{
    ctx.clearRect(0,0,w,h);
    let alive=0;
    for(const p of parts){
      if(p.life<=0) continue; alive++;
      p.vy+=0.28; p.x+=p.vx; p.y+=p.vy; p.a+=p.va; p.life--;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a);
      ctx.globalAlpha=Math.min(1,p.life/40); ctx.fillStyle=p.c;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    }
    if(alive) raf=requestAnimationFrame(step); else ctx.clearRect(0,0,w,h);
  };
  step();
}

/* ---------------- 3D drag ---------------- */
let drag=null;
stage.addEventListener("pointerdown", e=>{
  if(!S.three) return;
  if(e.target.closest(".cell")) return;
  drag={x:e.clientX,y:e.clientY,tx:S.tx,ty:S.ty};
  board.classList.add("dragging");
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener("pointermove", e=>{
  if(!drag) return;
  S.ty = Math.max(-32, Math.min(32, drag.ty + (e.clientX-drag.x)*0.28));
  S.tx = Math.max(-8,  Math.min(46, drag.tx + (e.clientY-drag.y)*0.24));
  applyTilt();
});
const endDrag = e => { if(drag){ drag=null; board.classList.remove("dragging"); } };
stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);
stage.addEventListener("dblclick", e=>{ if(e.target.closest(".cell")) return; S.tx=18; S.ty=-10; applyTilt(); });
function applyTilt(){
  const tx = S.three ? S.tx : 0, ty = S.three ? S.ty : 0;
  board.style.setProperty("--tx", tx+"deg");
  board.style.setProperty("--ty", ty+"deg");
  board.classList.toggle("flat", !S.three);
}

/* ---------------- controls ---------------- */
function seg(id, key, after){
  el(id).addEventListener("click", e=>{
    const b=e.target.closest("button[data-v]"); if(!b) return;
    S[key]=b.dataset.v;
    [...e.currentTarget.querySelectorAll("button")].forEach(x=>x.setAttribute("aria-pressed", String(x===b)));
    after && after();
  });
}
seg("segMode","mode", ()=>newGame());
seg("segRange","range", ()=>newGame());
seg("segDiff","diff", ()=>newGame());
el("rowsUp").addEventListener("click", ()=>setRows(S.rows+1));
el("rowsDown").addEventListener("click", ()=>setRows(S.rows-1));
function setRows(n){
  S.rows = Math.max(2, Math.min(8, n));
  el("rowsOut").textContent = S.rows;
  newGame();
}
el("bNew").addEventListener("click", ()=>newGame());
el("bCheck").addEventListener("click", check);
el("bHint").addEventListener("click", hint);
el("bWalk").addEventListener("click", walk);
el("bClear").addEventListener("click", clearAll);
el("b3d").addEventListener("click", e=>{
  S.three=!S.three; e.currentTarget.setAttribute("aria-pressed", String(S.three));
  applyTilt(); sizeBoard();
});
el("bsound").addEventListener("click", e=>{
  S.sound=!S.sound; e.currentTarget.setAttribute("aria-pressed", String(S.sound));
  if(S.sound) beep(720,.08);
});
el("blang").addEventListener("click", e=>{
  S.lang = S.lang==="de" ? "en" : "de";
  e.currentTarget.textContent = S.lang.toUpperCase();
  e.currentTarget.setAttribute("aria-pressed", String(S.lang==="en"));
  applyLang();
});
function applyLang(){
  const d=T[S.lang];
  el("tagline").innerHTML=d.tagline; el("ruleText").textContent=d.rule;
  el("hSetup").textContent=d.setup; el("lRows").textContent=d.rows; el("lMode").textContent=d.mode;
  el("mPuzzle").textContent=d.puzzle; el("mSandbox").textContent=d.sandbox;
  el("lRange").textContent=d.range; el("rNat").textContent=d.nat; el("rInt").textContent=d.int;
  el("lDiff").textContent=d.diff; el("dEasy").textContent=d.easy; el("dMed").textContent=d.medium; el("dHard").textContent=d.hard;
  el("hStats").textContent=d.stats; el("lTime").textContent=d.time; el("lLeft").textContent=d.left;
  el("lHints").textContent=d.hints; el("lBest").textContent=d.best;
  el("bNew").textContent=d.nw; el("bHint").textContent=d.hint; el("bCheck").textContent=d.check;
  el("bClear").textContent=d.clear; el("bWalk").textContent = S.walking ? d.stop : d.walk;
  el("soundLbl").textContent=d.sound; el("stagenote").textContent=d.drag; el("kbdHint").innerHTML=d.kbd;
  board.querySelectorAll(".brick").forEach(b=>{
    const c=b.querySelector(".cell");
    c.setAttribute("aria-label", d.brick(+b.dataset.r+1, +b.dataset.i+1));
  });
  say(S.mode==="puzzle"?d.start:d.sandboxMsg, "info");
}

addEventListener("resize", ()=>{ sizeBoard(); });
document.addEventListener("keydown", e=>{
  if(e.target.closest("input")) return;
  if(e.key==="n"||e.key==="N") newGame();
  if(e.key==="?") hint();
});

/* ---------------- boot ---------------- */
function start(saved){
  if(saved && saved.rows){
    Object.assign(S, saved);
    S.tick=null; S.walking=false; S.walkTimer=null;
  }
  el("rowsOut").textContent=S.rows;
  el("blang").textContent=S.lang.toUpperCase();
  el("b3d").setAttribute("aria-pressed", String(S.three));
  el("bsound").setAttribute("aria-pressed", String(S.sound));
  [["segMode",S.mode],["segRange",S.range],["segDiff",S.diff]].forEach(([id,v])=>{
    el(id).querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed", String(b.dataset.v===v)));
  });
  applyTilt();
  if(saved && saved.sol!==undefined && saved.val){
    buildDOM(); sizeBoard(); render();
    el("bWalk").disabled = S.mode!=="puzzle"; el("bHint").disabled = S.mode!=="puzzle";
    el("bCheck").disabled = S.mode!=="puzzle";
    el("sTime").textContent=fmt(S.elapsed||0);
  } else {
    newGame(true);
  }
  applyLang();
  if(S.lang==="de") say(T.de.start,"info");
  requestAnimationFrame(sizeBoard);
}
// Standard DOM initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => start(null));
} else {
  start(null);
}
})();

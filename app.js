"use strict";
const C=window.CFG,$=(s,e=document)=>e.querySelector(s),act={};
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const LS=JSON.parse(localStorage.axc||"{}"),sv=()=>{localStorage.axc=JSON.stringify(LS)};
LS.uid=LS.uid||[...crypto.getRandomValues(new Uint8Array(20))].map(b=>b%10).join("").replace(/^0/,"7");LS.pl=LS.pl||{};LS.rate=LS.rate||{};sv();
const TYPES=["Manga","Manhwa","Manhua","Novella"],GENRES=["Harakat","Ramantika","Fantaziya","Komedia","Horror","Drama","Ilmiy-Fantastika","Sarguzasht","Sirli","Hayotdan parcha","Sport","Psixologik","G'ayratabiiy","O'zga dunyo"];
const slug=t=>String(t).toLowerCase().replace(/[ʻ'’‘`]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const toast=t=>{const e=$("#ts");e.textContent=t;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),2300)};
const gh=location.hostname.endsWith("github.io"),base=gh?"/"+location.pathname.split("/")[1]+"/":"/";
const SUB=!gh&&C.DOMAIN&&location.hostname.endsWith("."+C.DOMAIN)?location.hostname.slice(0,-C.DOMAIN.length-1):"";
let SL="",SITE=null,MG=[],OWN=false,P=[],BASES=[],CT=0,QS="",AT="mg",CS="desc",CM=null,EDIT=null,G=[],CVR="",PGB=[];
const CF={types:[],genres:[],status:"",sort:"pop",dir:"desc",q:"",bmin:"",bmax:"",ymin:"",ymax:"",open:false,sopen:false};
const SN={a:12,c:10,k:12};
const tsM=m=>Math.max(m.at||0,...(m.chapters||[]).map(c=>c.at||0));
const pgr=(l,key)=>{const n=SN[key];return `<div class="gr">${l.slice(0,n).map(card).join("")}</div>${l.length>12?`<div class="mrow">${n<l.length?`<button class="bt" data-a="more" data-k="${key}">Ko'proq (${l.length-n})</button>`:""}${n>12?`<button class="bt" data-a="less" data-k="${key}">Kamroq</button>`:""}</div>`:""}`};
act.more=async d=>{SN[d.k]+=12;const y=scrollY;await route();scrollTo(0,y)};act.less=d=>{SN[d.k]=12;route()};
const url=(...a)=>base+(SUB?"":SL?SL+"/":"")+a.filter(x=>x!==""&&x!=null).map(encodeURIComponent).join("/");
const murl=(m,n)=>url(m.type.toLowerCase(),slug(m.title)||m.id,n);
const sp=()=>"/api/s/"+encodeURIComponent(SL);
async function api(p,o={}){const h={"Content-Type":"application/json"};if(LS.tok)h.Authorization="Bearer "+LS.tok;let r;
try{r=await fetch(C.API+p,{method:o.method||"GET",headers:h,body:o.body?JSON.stringify(o.body):undefined})}catch(e){throw Error("Server bilan aloqa yo'q")}
const j=await r.json().catch(()=>({}));if(r.status==401&&LS.tok){LS.tok="";LS.user=null;LS.sites=[];sv()}if(!r.ok)throw Error(j.error||"Xato "+r.status);return j}
const app=h=>{$("#app").innerHTML=h;scrollTo(0,0)};
const F=(t,h)=>`<div class="fl"><span class="lb">${t}</span>${h}</div>`;
const chip=(a,v,on,l)=>`<span class="ch ${on?"on":""}" data-a="${a}" data-v="${E(v)}">${E(l||v)}</span>`;
const rt=m=>m.rating?m.rating.toFixed(1):"-";
const fresh=m=>(m.chapters||[]).some(c=>Date.now()-c.at<864e5);
const ago=t=>{const h=Math.floor((Date.now()-t)/36e5);return h<1?"hozirgina":h+" soat oldin"};
const fmtD=t=>{const d=new Date(t||0);return String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+String(d.getFullYear()).slice(2)};
const find=(t,s)=>MG.find(m=>m.type.toLowerCase()==String(t).toLowerCase()&&(slug(m.title)==String(s).toLowerCase()||m.id==s))||MG.find(m=>m.id==s);
const PL=()=>LS.pl[SL]||(LS.pl[SL]=[]);
const topL=()=>[...MG].sort((a,b)=>(b.reads||0)-(a.reads||0));

/* ---------- Google bilan kirish ---------- */
function gbtn(){const el=$("#gbtn");if(!el)return;let n=0;const t=setInterval(()=>{if(++n>60)clearInterval(t);if(!window.google||!google.accounts)return;clearInterval(t);
google.accounts.id.initialize({client_id:C.GCLIENT,callback:async r=>{try{const j=await api("/api/s/auth",{method:"POST",body:{credential:r.credential}});LS.tok=j.token;LS.user=j.user;LS.sites=j.sites;sv();toast("Xush kelibsiz!");route()}catch(e){toast(e.message)}}});
google.accounts.id.renderButton(el,{theme:"filled_black",size:"large",text:"signin_with",shape:"pill"})},200)}
act.logout=()=>{LS.tok="";LS.user=null;LS.sites=[];sv();route()};

/* ---------- Bosh sahifa (platforma): Google + sayt yaratish ---------- */
const wiz=()=>`${F("Sayt nomi *",`<input class="in" id="w_n" placeholder="Masalan: Mangalar Olami">`)}<p class="mu" id="w_u"></p>
<div class="note"><b>Cloudinary'ni ulang (bepul):</b><ol><li>cloudinary.com da hisob oching.</li><li>Settings → Upload → Upload presets → Add: <b>ikkita</b> preset yarating, ikkalasida ham Signing mode: <b>Unsigned</b>:<br>• <code>sayt</code> — Asset folder: <code>sayt</code> (faqat sizning saytingiz uchun)<br>• <code>animanxwa</code> — Asset folder: <code>animanxwa</code> (AniManxwa uchun)</li><li>Dashboard'dan <b>Cloud name</b> ni nusxalang.</li></ol></div>
${F("Cloud name *",`<input class="in" id="w_c">`)}${F("Sizning preset nomi (sayt) *",`<input class="in" id="w_o" placeholder="sayt">`)}${F("AniManxwa preset nomi *",`<input class="in" id="w_p" placeholder="animanxwa">`)}
<label class="ck"><input type="checkbox" id="w_a"> Cloudinary ma'lumotlari ham sizning saytingiz uchun, ham <b>AniManxwa kampaniyasi</b> tomonidan ilova uchun ishlatilishiga roziman. «animanxwa» papkasi AniManxwa uchun, «sayt» papkasi faqat sizning saytingiz uchun. Sayt shu evaziga bepul yaratiladi.</label>
<button class="btn" data-a="create">Saytni yaratish</button><p id="w_s" class="mu"></p>`;
function landing(){document.title="AniManxwa Creator";document.documentElement.style.setProperty("--ac","#7c5cff");
app(`<header class="top"><span class="logo">AniManxwa <b class="ac">Creator</b></span></header><section class="hero"><h1>O'z manga saytingizni yarating</h1><p>Google orqali kiring, sayt nomini yozing va Cloudinary'ni ulang. Sayt tayyor, havola bilan ulashasiz.</p>
${LS.tok?`<div class="card0"><p>Salom, <b>${E(LS.user.name||LS.user.email)}</b> <button class="bt" data-a="logout">Chiqish</button></p><h3>Saytlarim</h3>${(LS.sites||[]).map(s=>`<a class="mb" data-l href="${base}${s.slug}/">${E(s.title)}<br><small class="mu">${location.origin+base}${s.slug}/</small></a>`).join("")||'<p class="mu">Hali sayt yo\'q</p>'}<h3>Yangi sayt</h3>${wiz()}</div>`:'<div id="gbtn"></div>'}</section>`);if(!LS.tok)gbtn()}
act.create=async()=>{const s=$("#w_s");s.textContent="Yaratilmoqda...";try{const j=await api("/api/s/create",{method:"POST",body:{name:$("#w_n").value,cloud:$("#w_c").value,ownPreset:$("#w_o").value,platPreset:$("#w_p").value,agree:$("#w_a").checked}});
LS.sites=await api("/api/s/mine");sv();history.pushState(null,"",base+j.slug+"/admin");route()}catch(e){s.textContent="Xato: "+e.message}};

/* ---------- Sayt: umumiy qobiq ---------- */
function shell(inner,tab){const T=[["","Asosiy","🏠"],["search","Qidiruv","🔍"],["catalog","Katalog","▦"],["playlist","Playlist","♡"],["profile","Profil","👤"]];
app(`<header class="top"><a data-l href="${url()}" class="logo">${E(SITE.title)}</a></header><main>${inner}</main><nav>${T.map(t=>`<a data-l href="${url(t[0])}" class="${tab===t[0]?"on":""}"><i>${t[2]}</i>${t[1]}</a>`).join("")}</nav>`)}
const card=m=>`<a data-l href="${murl(m)}" class="cd"><div class="cp"><img src="${E(m.cover)}" loading="lazy" draggable="false"><i class="rt">★ ${rt(m)}</i>${fresh(m)?'<i class="nw">YANGI BOB</i>':""}</div><b>${E(m.title)}</b><small>${E(m.type)}</small></a>`;
const SEC={
search:()=>`<input class="q" readonly placeholder="🔍 Manga qidirish..." data-a="gosearch">`,
carousel:()=>{const l=[...new Set([...topL().slice(0,5),...MG.filter(fresh)])].slice(0,10);return l.length?`<div class="car" id="car">${l.map(m=>`<a data-l href="${murl(m)}" class="bn" style="background-image:url('${E(m.cover)}')"><i class="rt">★ ${rt(m)}</i><b>${E(m.title)}</b></a>`).join("")}</div>`:""},
top:()=>MG.length?`<section class="box"><h2>Top</h2>${topL().slice(0,7).map((m,i)=>`<a data-l href="${murl(m)}" class="tr"><span class="rk">${i+1}</span><img src="${E(m.cover)}" loading="lazy"><div><b>${E(m.title)}</b><small>${E(m.type)} · ★ ${rt(m)}</small></div><em>👁 ${m.reads||0}</em></a>`).join("")}</section>`:"",
fresh:()=>{const l=MG.map(m=>[m,(m.chapters||[]).filter(c=>Date.now()-c.at<864e5).sort((a,b)=>b.at-a.at)]).filter(x=>x[1].length).sort((a,b)=>b[1][0].at-a[1][0].at);
return l.length?`<h2>So'nggi yangilanishlar</h2>${l.slice(0,10).map(x=>`<div class="upd"><a data-l href="${murl(x[0])}" class="cp"><img src="${E(x[0].cover)}" loading="lazy"><i class="rt">★ ${rt(x[0])}</i></a><div><a data-l href="${murl(x[0])}"><b>${E(x[0].title)}</b></a>${x[1].slice(0,3).map(c=>`<a data-l href="${murl(x[0],c.num)}" class="ur"><span>Bob ${c.num}</span><small>${ago(c.at)}</small></a>`).join("")}</div></div>`).join("")}`:""},
all:()=>MG.length?`<h2>Barchasi</h2>${pgr([...MG].sort((a,b)=>tsM(b)-tsM(a)),"a")}`:'<p class="mu c">Hozircha manga yo\'q.</p>'};
function home(){shell((SITE.cfg.sections||[]).filter(s=>s.on&&SEC[s.k]).map(s=>SEC[s.k]()).join(""),"");const c=$("#car");
if(c)CT=setInterval(()=>{const f=c.firstElementChild;if(!f)return;const w=f.offsetWidth+10,i=Math.round(c.scrollLeft/w)+1;c.scrollTo({left:i*w>c.scrollWidth-c.clientWidth+4?0:i*w,behavior:"smooth"})},3500)}
act.gosearch=()=>{history.pushState(null,"",url("search"));route()};
act.soon=()=>toast("Tez orada");

/* ---------- Qidiruv, Katalog, Playlist, Profil ---------- */
const res=()=>{const q=QS.toLowerCase();return MG.filter(m=>(m.title+" "+(m.author||"")+" "+(m.tags||[]).join(" ")).toLowerCase().includes(q)).map(card).join("")||'<p class="mu">Hech narsa topilmadi</p>'};
function search(){shell(`<input class="q" id="qi" placeholder="Nom, muallif yoki teg..." value="${E(QS)}"><div class="gr" id="sg">${res()}</div>`,"search");$("#qi").focus()}
const SORTS=[["pop","Mashhurlik"],["rating","Reyting"],["chapters","Boblar soni"],["date","Chiqarilgan sana"],["name","Nomi (A-Z)"]];
const tg=(a,v)=>a.includes(v)?a.filter(x=>x!=v):[...a,v];
const cres=()=>{const l=MG.filter(m=>{const n=(m.chapters||[]).length;return(!CF.q||m.title.toLowerCase().includes(CF.q.toLowerCase()))&&(!CF.types.length||CF.types.includes(m.type))&&(!CF.genres.length||CF.genres.every(g=>(m.genres||[]).includes(g)))&&(!CF.status||m.status==CF.status)&&(CF.bmin===""||n>=+CF.bmin)&&(CF.bmax===""||n<=+CF.bmax)&&(CF.ymin===""||m.year>=+CF.ymin)&&(CF.ymax===""||m.year<=+CF.ymax)});
const k={pop:m=>m.reads||0,rating:m=>m.rating||0,chapters:m=>(m.chapters||[]).length,date:m=>m.at||0};l.sort((a,b)=>CF.sort=="name"?a.title.localeCompare(b.title):k[CF.sort](a)-k[CF.sort](b));if(CF.dir=="desc")l.reverse();return l};
const cgrid=()=>{const l=cres();return l.length?pgr(l,"k"):'<p class="mu c">Hech narsa topilmadi</p>'};
function catalog(){const gs=[...new Set(MG.flatMap(m=>m.genres||[]))];
shell(`<div class="row"><h2>Katalog</h2><span><button class="ib" data-a="sopen">⇅</button><button class="ib" data-a="fopen">☰ Filtr</button></span></div><input class="q" id="cq2" placeholder="Nom bo'yicha qidiring" value="${E(CF.q)}"><div id="cgd">${cgrid()}</div>
${CF.sopen?`<div class="mdl"><div class="mbg" data-a="sclose"></div><div class="mc"><div class="row"><b>Saralash</b><button class="ib" data-a="sclose">✕</button></div>${SORTS.map(o=>`<label class="rd"><input type="radio" name="so" ${CF.sort==o[0]?"checked":""} data-a="sset" data-v="${o[0]}"> ${o[1]}</label>`).join("")}<hr>${[["desc","Kamayish bo'yicha"],["asc","O'sish bo'yicha"]].map(o=>`<label class="rd"><input type="radio" name="sd" ${CF.dir==o[0]?"checked":""} data-a="sdir" data-v="${o[0]}"> ${o[1]}</label>`).join("")}</div></div>`:""}
${CF.open?`<div class="pnl"><div class="row ph"><button class="ib" data-a="fclose">‹</button><b>Filtrlar</b><span></span></div><div class="pb"><h4>Janrlar</h4><div class="chips">${gs.map(g=>chip("cg",g,CF.genres.includes(g))).join("")||'<small class="mu">Janr yo\'q</small>'}</div><h4>Boblar soni</h4><div class="two"><input class="in" id="f_b1" type="number" placeholder="Dan" value="${CF.bmin}"><input class="in" id="f_b2" type="number" placeholder="Gacha" value="${CF.bmax}"></div><h4>Chiqarilgan yili</h4><div class="two"><input class="in" id="f_y1" type="number" placeholder="Dan" value="${CF.ymin}"><input class="in" id="f_y2" type="number" placeholder="Gacha" value="${CF.ymax}"></div><h4>Turi</h4><div class="chips">${TYPES.map(t=>chip("ct",t,CF.types.includes(t))).join("")}</div><h4>Holat</h4><div class="chips">${["Ongoing","Tugallangan"].map(t=>chip("cst",t,CF.status==t)).join("")}</div></div><div class="pf2"><button class="bt" data-a="cclr">Tozalash</button><button class="btn" data-a="fclose">Qo'llash</button></div></div>`:""}`,"catalog")}
act.fopen=()=>{CF.open=true;catalog()};act.fclose=()=>{CF.open=false;catalog()};act.sopen=()=>{CF.sopen=true;catalog()};act.sclose=()=>{CF.sopen=false;catalog()};
act.sset=d=>{CF.sort=d.v;CF.sopen=false;catalog()};act.sdir=d=>{CF.dir=d.v;CF.sopen=false;catalog()};
act.ct=d=>{CF.types=tg(CF.types,d.v);catalog()};act.cg=d=>{CF.genres=tg(CF.genres,d.v);catalog()};act.cst=d=>{CF.status=CF.status==d.v?"":d.v;catalog()};
act.cclr=()=>{Object.assign(CF,{types:[],genres:[],status:"",bmin:"",bmax:"",ymin:"",ymax:"",q:""});catalog()};
document.addEventListener("input",e=>{const t=e.target,m={f_b1:"bmin",f_b2:"bmax",f_y1:"ymin",f_y2:"ymax"};if(m[t.id])CF[m[t.id]]=t.value;else if(t.id=="cq2"){CF.q=t.value;SN.k=12;$("#cgd").innerHTML=cgrid()}});
let PT="s";
function playlist(){const ids=PT=="s"?PL():((LS.hist||{})[SL]||[]),l=ids.map(id=>MG.find(m=>m.id==id)).filter(Boolean);
shell(`<h2>Kutubxona</h2><div class="tabs"><a class="${PT=="s"?"on":""}" data-a="ptab" data-v="s">Saqlanganlar</a><a class="${PT=="h"?"on":""}" data-a="ptab" data-v="h">Tarix</a></div>${l.length?`<div class="gr">${l.map(card).join("")}</div>`:`<p class="mu c" style="margin-top:50px">Bu bo'limda tayl yo'q.</p><a class="bt main c" data-l href="${url("catalog")}">Katalogga o'tish</a>`}`,"playlist")}
act.ptab=d=>{PT=d.v;playlist()};
function profile(){const L=SITE.cfg||{},items=L.items||[{t:"Obuna olish",u:L.sub},{t:"Qo'llab-quvvatlash",u:L.support}],lk=(t,u)=>u?`<a class="mb" href="${E(u)}" target="_blank" rel="noopener">${E(t)}</a>`:`<a class="mb" data-a="soon">${E(t)}</a>`;
shell(`<h2>Profil</h2>${items.map(x=>lk(x.t,x.u)).join("")}${lk("Ilovaga buyurtma berish",C.ORDER||"https://telegram.me/Shadow_Sxi")}${OWN?`<a class="mb red" data-l href="${url("admin")}">Admin paneli</a>`:""}
${LS.tok?`<p class="mu">Kirgan: ${E(LS.user.email)} <button class="bt" data-a="logout">Chiqish</button></p>`:`<p class="mu">Sayt egasimisiz? Google orqali kiring:</p><div id="gbtn"></div>`}`,"profile");if(!LS.tok)gbtn()}

/* ---------- Manga sahifasi va o'qish ---------- */
function crows(m,q){q=(q||"").trim().toLowerCase();let cs=[...(m.chapters||[])].sort((a,b)=>CS=="asc"?a.num-b.num:b.num-a.num);if(q)cs=cs.filter(c=>String(c.num).includes(q)||(c.title||"").toLowerCase().includes(q));
const n=q?cs.length:SN.c;return (cs.slice(0,n).map(c=>`<a data-l href="${murl(m,c.num)}" class="cr"><b>${c.num}-bob${c.title?" · "+E(c.title):""}</b><span class="mu">👁 ${c.views||0} · ${fmtD(c.at)}</span></a>`).join("")||'<p class="mu">Bob topilmadi</p>')+(!q&&cs.length>10?`<div class="mrow">${n<cs.length?`<button class="bt" data-a="cmore">Ko'proq (${cs.length-n})</button>`:""}${n>10?`<button class="bt" data-a="cless">Kamroq</button>`:""}</div>`:"")}
act.cmore=()=>{SN.c+=10;const m=find(P[0],P[1]);$("#cl").innerHTML=crows(m,$("#cq").value)};act.cless=()=>{SN.c=10;const m=find(P[0],P[1]);$("#cl").innerHTML=crows(m,$("#cq").value)};
function mpage(m){SN.c=10;const cs=[...(m.chapters||[])].sort((a,b)=>a.num-b.num),first=cs[0],my=LS.rate[SL+m.id]||0,on=PL().includes(m.id);
const sim=MG.filter(x=>x.id!=m.id).map(x=>[x,(x.genres||[]).filter(g=>(m.genres||[]).includes(g)).length]).filter(o=>o[1]).sort((a,b)=>b[1]-a[1]).slice(0,6).map(o=>o[0]);
shell(`<div class="dh"><img src="${E(m.cover)}"><div><h1>${E(m.title)}</h1><p class="mu">${E(m.type)} · ${E(m.status)}<br>${[m.author,m.studio,m.year].filter(Boolean).map(E).join(" · ")}</p><p class="rtg">★ ${rt(m)} <span class="mu">(${m.rc||0})</span> · ${cs.length} bob · 👁 ${m.reads||0}</p><button class="bt" data-a="pl" data-id="${m.id}">${on?"♥ Saqlangan":"♡ Playlistga"}</button></div></div>
<p>${E(m.desc)}</p><div class="chips">${(m.genres||[]).concat(m.tags||[]).map(g=>`<span class="ch">${E(g)}</span>`).join("")}</div>
<div class="stars" id="stars">Baholang: ${[1,2,3,4,5].map(n=>`<span class="${my>=n?"on":""}" data-a="rate" data-id="${m.id}" data-v="${n}">★</span>`).join("")}</div>
${first?`<a class="bt main" data-l href="${murl(m,first.num)}">O'qishni boshlash</a>`:""}<div class="row"><h3>Boblar ${cs.length}</h3><button class="bt" data-a="csrt">${CS=="asc"?"▲ 1→9":"▼ 9→1"}</button></div><input class="q" id="cq" placeholder="Bob qidirish..."><div id="cl">${crows(m,"")}</div>
${sim.length?`<h3>Bunga o'xshash asarlar</h3><div class="gr">${sim.map(card).join("")}</div>`:""}`,"")}
act.pl=d=>{const l=PL(),i=l.indexOf(d.id);if(i<0)l.push(d.id);else l.splice(i,1);sv();mpage(MG.find(m=>m.id==d.id))};
act.csrt=()=>{CS=CS=="asc"?"desc":"asc";mpage(find(P[0],P[1]))};
act.rate=d=>{LS.rate[SL+d.id]=+d.v;sv();document.querySelectorAll("#stars span").forEach((s,i)=>s.classList.toggle("on",i<+d.v));api(sp()+"/rate/"+d.id,{method:"POST",body:{uid:LS.uid,v:+d.v*2}}).catch(()=>{});toast("Bahoyingiz: "+d.v*2+"/10 ✓")};
async function reader(m,n){const c=(m.chapters||[]).find(x=>String(x.num)==n);if(!c)return shell('<div class="ld"><h2>Bob topilmadi</h2></div>');
app('<div class="ld">Yuklanmoqda...</div>');let pg;try{pg=(await api(sp()+"/chapter/"+c.id)).pages}catch(e){return shell(`<div class="ld"><p>${E(e.message)}</p></div>`)}
api(sp()+"/read/"+m.id+"/"+c.id,{method:"POST"}).catch(()=>{});LS.hist=LS.hist||{};{const h=LS.hist[SL]||(LS.hist[SL]=[]),i=h.indexOf(m.id);if(i>=0)h.splice(i,1);h.unshift(m.id);if(h.length>50)h.length=50;sv()}
const cs=[...m.chapters].sort((a,b)=>a.num-b.num),i=cs.indexOf(c),ar=(x,t)=>x?`<a data-l href="${murl(m,x.num)}">${t}</a>`:`<span>${t}</span>`;
app(`<div class="rb"><a data-l href="${murl(m)}">‹</a><div class="rtt"><b>${E(m.title)} · ${c.num}-bob</b><small id="rp">1/${pg.length} · 0%</small></div><div class="rbar"><i id="rpb"></i></div></div><div class="pgs" id="pgs">${pg.map(p=>{const u=p.u||p;return `<img src="${E(u)}" draggable="false" ${p.w?`loading="lazy" style="aspect-ratio:${p.w}/${p.h}"`:""}>`}).join("")}</div><div class="rf">${ar(cs[i-1],"‹ Oldingi")}${ar(cs[i+1],"Keyingi ›")}</div>`);
const g=$("#pgs");onscroll=()=>{const p=$("#rp");if(!p)return;const pc=Math.min(100,Math.round(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)*100)),y=scrollY+innerHeight/3,ch=g.children;let k=0;for(;k<ch.length;k++)if(ch[k].offsetTop+ch[k].offsetHeight>y)break;
p.textContent=Math.min(pg.length,k+1)+"/"+pg.length+" · "+pc+"%";$("#rpb").style.width=pc+"%"}}

/* ---------- Rasmlarni tayyorlash (1080 px, 1500 px li bo'laklar, WebP) va Cloudinary ---------- */
const MAXW=1080,CUT=1500;
const cutAt=(s,y,e)=>{const h=Math.min(240,e-y-500);if(h<=0)return e;const c=document.createElement("canvas");c.width=s.width;c.height=h;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(s,0,e-h,s.width,h,0,0,s.width,h);const d=x.getImageData(0,0,s.width,h).data;
for(let r=h-1;r>=0;r--){let lo=255,hi=0;for(let i=0;i<s.width;i+=6){const k=(r*s.width+i)*4,l=(d[k]+d[k+1]+d[k+2])/3;if(l<lo)lo=l;if(l>hi)hi=l}if(hi-lo<6)return e-h+r+1}return e};
async function enc(s,y,h){const c=document.createElement("canvas");c.width=s.width;c.height=h;c.getContext("2d").drawImage(s,0,y,s.width,h,0,0,s.width,h);let b;
for(const q of[.82,.7,.55]){b=await new Promise(r=>c.toBlob(r,"image/webp",q));if(!b||b.type!="image/webp"){b=null;break}if(b.size<7e5)break}
if(!b)b=await new Promise(r=>c.toBlob(r,"image/jpeg",.8));b.w=s.width;b.h=h;c.width=c.height=0;return b}
async function pack(s,cut){const o=[],H=cut?CUT:15000;let y=0;while(y<s.height){let e=Math.min(s.height,y+H);if(e<s.height)e=cutAt(s,y,e);o.push(await enc(s,y,e-y));y=e}return o}
const dim=f=>new Promise(r=>{const i=new Image(),u=URL.createObjectURL(f);i.onload=()=>{URL.revokeObjectURL(u);r(i.naturalWidth)};i.onerror=()=>r(0);i.src=u});
async function addImg(f,cut){const w=await dim(f);if(!w)throw Error("rasm emas");let b;try{b=await createImageBitmap(f,w>MAXW?{resizeWidth:MAXW,resizeQuality:"high"}:{})}catch(e){b=await createImageBitmap(f)}const o=await pack(b,cut);b.close&&b.close();return o}
async function pdfPages(f,cut,st){if(!window.pdfjsLib)throw Error("PDF kutubxonasi yuklanmadi");pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise,out=[];
for(let i=1;i<=pdf.numPages;i++){st("PDF: "+i+"/"+pdf.numPages);const p=await pdf.getPage(i),v0=p.getViewport({scale:1}),v=p.getViewport({scale:Math.min(3,MAXW/v0.width,Math.sqrt(9e6/(v0.width*v0.height)))}),c=document.createElement("canvas");c.width=Math.round(v.width);c.height=Math.round(v.height);
const g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);await p.render({canvasContext:g,viewport:v}).promise;out.push(...await pack(c,cut));c.width=c.height=0}return out}
const cropUrl=(f,w,h)=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas"),k=Math.max(w/i.width,h/i.height),sw=w/k,sh=h/k;c.width=w;c.height=h;c.getContext("2d").drawImage(i,(i.width-sw)/2,(i.height-sh)/2,sw,sh,0,0,w,h);r(c.toDataURL("image/jpeg",.85))};i.src=URL.createObjectURL(f)});
async function up(b){const l=BASES.filter(x=>!x.share);if(!l.length)throw Error("Avval Admin → Baza bo'limiga o'z Cloudinary ma'lumotingizni qo'shing");let err;
for(const z of l){try{const f=new FormData();f.append("file",b);f.append("upload_preset",z.preset);const j=await(await fetch(`https://api.cloudinary.com/v1_1/${z.cloud}/image/upload`,{method:"POST",body:f})).json();if(j.secure_url)return j.secure_url;err=j.error&&j.error.message}catch(e){err=e.message}}throw Error(err||"Yuklab bo'lmadi")}

/* ---------- Admin paneli (sayt egasi) ---------- */
const reload=async()=>{MG=await api(sp()+"/manga")};
async function admin(){if(!OWN)return shell('<div class="ld"><h2>Faqat sayt egasi uchun</h2><p>Profil bo\'limidan Google orqali kiring.</p></div>',"profile");
try{BASES=(await api(sp()+"/bases")).list}catch(e){BASES=[]}
shell(`<h2>Admin paneli</h2><div class="chips">${[["mg","Manga"],["cf","Bosh sahifa"],["bz","Baza"],["st","Sayt"]].map(t=>chip("atab",t[0],AT==t[0],t[1])).join("")}</div><div id="ab">${atab()}</div>`,"profile")}
const atab=()=>({mg:mgtab,cf:cftab,bz:bztab,st:sttab}[AT])();
act.atab=d=>{AT=d.v;admin()};
const mgtab=()=>`<button class="btn" data-a="mnew">+ Yangi manga</button>${MG.map(m=>`<div class="row"><img class="th" src="${E(m.cover)}"><b style="flex:1">${E(m.title)}</b><span><button class="bt" data-a="medit" data-id="${m.id}">✎</button> <button class="bt" data-a="cmg" data-id="${m.id}">📑</button> <button class="bt" data-a="mdel" data-id="${m.id}">🗑</button></span></div>`).join("")||'<p class="mu">Hali manga yo\'q</p>'}`;
act.mnew=()=>mform(null);act.medit=d=>mform(MG.find(m=>m.id==d.id));act.cmg=d=>cform(MG.find(m=>m.id==d.id));
act.mdel=async d=>{if(!confirm("Manga o'chirilsinmi?"))return;try{await api(sp()+"/manga/"+d.id,{method:"DELETE"});await reload();admin()}catch(e){toast(e.message)}};
const gch=()=>[...new Set([...GENRES,...G])].map(g=>chip("gt",g,G.includes(g))).join("");
act.gt=d=>{G=tg(G,d.v);$("#gc").innerHTML=gch()};act.gadd=()=>{const v=$("#gx").value.trim();if(v&&!G.includes(v))G.push(v);$("#gx").value="";$("#gc").innerHTML=gch()};
function mform(m){EDIT=m;G=[...(m?m.genres||[]:[])];CVR=m?m.cover:"";const d=m||{title:"",desc:"",author:"",studio:"",year:new Date().getFullYear(),type:"Manga",status:"Ongoing",tags:[]};
$("#ab").innerHTML=`<h3>${m?"Mangani tahrirlash":"Yangi manga"}</h3>${F("Nomi *",`<input class="in" id="f_t" value="${E(d.title)}">`)}${F("Tavsif",`<textarea class="in" id="f_d">${E(d.desc)}</textarea>`)}
<div class="two">${F("Muallif",`<input class="in" id="f_a" value="${E(d.author)}">`)}${F("Studiya",`<input class="in" id="f_s" value="${E(d.studio)}">`)}</div>
<div class="two">${F("Chiqqan yili",`<input class="in" id="f_y" type="number" value="${d.year||""}">`)}${F("Turi",`<select class="in" id="f_ty">${TYPES.map(t=>`<option ${d.type==t?"selected":""}>${t}</option>`).join("")}</select>`)}</div>
${F("Holat",`<select class="in" id="f_st">${["Ongoing","Tugallangan"].map(t=>`<option ${d.status==t?"selected":""}>${t}</option>`).join("")}</select>`)}
${F("Janrlar",`<div class="chips" id="gc">${gch()}</div><div class="two"><input class="in" id="gx" placeholder="Boshqa janr"><button class="bt" data-a="gadd">Qo'shish</button></div>`)}
${F("Teglar (vergul bilan)",`<input class="in" id="f_tg" value="${E((d.tags||[]).join(", "))}">`)}${F("Muqova rasmi (7:10)",`<label class="bt">Rasm tanlash<input type="file" id="f_c" accept="image/*" hidden></label><br><img id="cp" class="pv" src="${E(CVR)}" ${CVR?"":"hidden"}>`)}
<button class="btn" data-a="msave">Saqlash</button><button class="bt" data-a="atab" data-v="mg">Bekor</button><p id="ms" class="mu"></p>`}
act.msave=async()=>{const t=$("#f_t").value.trim();if(!t)return toast("Nomini yozing");const s=$("#ms");s.textContent="Saqlanmoqda...";
try{let cv=CVR;if(cv.startsWith("data:"))cv=await up(await(await fetch(cv)).blob());
const b={title:t,desc:$("#f_d").value.trim(),author:$("#f_a").value.trim(),studio:$("#f_s").value.trim(),year:+$("#f_y").value||0,type:$("#f_ty").value,status:$("#f_st").value,genres:G,tags:$("#f_tg").value.split(",").map(x=>x.trim()).filter(Boolean),cover:cv};
await api(sp()+"/manga"+(EDIT?"/"+EDIT.id:""),{method:EDIT?"PUT":"POST",body:b});await reload();AT="mg";admin()}catch(e){s.textContent="Xato: "+e.message}};
function cform(m){CM=m;PGB=[];const cs=[...(m.chapters||[])].sort((a,b)=>a.num-b.num);
$("#ab").innerHTML=`<h3>${E(m.title)} — boblar</h3>${cs.map(c=>`<div class="row"><b>${c.num}-bob ${c.title?E(c.title):""}</b><button class="bt" data-a="cdel" data-id="${m.id}" data-c="${c.id}">🗑</button></div>`).join("")||'<p class="mu">Bob yo\'q</p>'}
<h4>Yangi bob</h4>${F("BOB raqami *",`<input class="in" id="c_n" type="number" step="any" min="0">`)}${F("Sarlavha (ixtiyoriy)",`<input class="in" id="c_t">`)}${F("Sahifalar (PDF yoki rasmlar)",`<label class="bt">Fayl tanlash<input type="file" id="c_f" multiple accept=".pdf,image/*" hidden></label>`)}
<p id="cs2" class="mu"></p><button class="btn" data-a="csave">Bobni qo'shish</button><button class="bt" data-a="atab" data-v="mg">Orqaga</button>`}
act.cdel=async d=>{if(!confirm("Bob o'chirilsinmi?"))return;try{await api(sp()+"/manga/"+d.id+"/chapter/"+d.c,{method:"DELETE"});await reload();cform(MG.find(m=>m.id==d.id))}catch(e){toast(e.message)}};
act.csave=async()=>{const n=$("#c_n").value;if(n==="")return toast("BOB raqamini yozing");if(!PGB.length)return toast("Fayllarni tanlang");const s=$("#cs2"),urls=[];let k=0,done=0,fail=null;
const w=async()=>{while(k<PGB.length&&!fail){const i=k++;try{let u,er;for(let t=0;t<3&&!u;t++){try{u=await up(PGB[i])}catch(e){er=e}}if(!u)throw er;urls[i]=u;s.textContent="Yuklanmoqda "+(++done)+"/"+PGB.length}catch(e){fail=e}}};
await Promise.all([w(),w(),w()]);if(fail)return s.textContent="Xato: "+fail.message;
try{await api(sp()+"/manga/"+CM.id+"/chapter",{method:"POST",body:{num:+n,title:$("#c_t").value.trim(),pages:urls.map((u,i)=>({u,w:PGB[i].w,h:PGB[i].h}))}});await reload();CM=MG.find(x=>x.id==CM.id);PGB=[];toast("Bob qo'shildi ✓");cform(CM)}catch(e){s.textContent="Xato: "+e.message}};
const cftab=()=>{const c=SITE.cfg,L={search:"Qidiruv",carousel:"Aylanma (banner)",top:"Top",fresh:"Yangi boblar (24 soat)",all:"Barchasi"};
if(!c.items)c.items=[{t:"Obuna olish",u:c.sub||""},{t:"Qo'llab-quvvatlash",u:c.support||""}];
return `${F("Sayt nomi",`<input class="in" id="k_t" value="${E(SITE.title)}">`)}<h4>Bosh sahifa bo'limlari</h4>${c.sections.map((s,i)=>`<div class="row"><b>${L[s.k]}</b><span><button class="bt" data-a="sm" data-i="${i}" data-d="-1">↑</button> <button class="bt" data-a="sm" data-i="${i}" data-d="1">↓</button> <button class="bt" data-a="sx" data-i="${i}">${s.on?"✓ Yoqiq":"○ O'chiq"}</button></span></div>`).join("")}
<h4>Rang</h4><div class="chips">${["#9333ea","#e11d2e","#ff7a18","#16a34a","#0ea5e9","#ec4899"].map(x=>`<span class="sw" data-a="sc" data-v="${x}" style="background:${x};${c.accent==x?"outline:2px solid #fff":""}"></span>`).join("")}</div>
<h4>Profil tugmalari</h4>${c.items.map((x,i)=>`<div class="two"><input class="in it_t" value="${E(x.t)}" placeholder="Nomi"><input class="in it_u" value="${E(x.u)}" placeholder="Havola (https://...)"></div><button class="bt" data-a="idel" data-i="${i}">🗑 O'chirish</button>`).join("")}${c.items.length<5?`<p><button class="bt" data-a="iadd">+ Tugma qo'shish</button></p>`:""}<p class="mu">«Ilovaga buyurtma berish» tugmasi o'zgarmaydi.</p><button class="btn" data-a="cfsave">Saqlash</button>`};
const keep=()=>{SITE.title=$("#k_t").value;const u=document.querySelectorAll(".it_u");SITE.cfg.items=[...document.querySelectorAll(".it_t")].map((e,i)=>({t:e.value,u:u[i].value}))};
act.iadd=()=>{keep();SITE.cfg.items.push({t:"Yangi tugma",u:""});$("#ab").innerHTML=cftab()};act.idel=d=>{keep();SITE.cfg.items.splice(+d.i,1);$("#ab").innerHTML=cftab()};
act.sm=d=>{keep();const l=SITE.cfg.sections,i=+d.i,j=i+ +d.d;if(j<0||j>=l.length)return;[l[i],l[j]]=[l[j],l[i]];$("#ab").innerHTML=cftab()};
act.sx=d=>{keep();const s=SITE.cfg.sections[+d.i];s.on=!s.on;$("#ab").innerHTML=cftab()};
act.sc=d=>{keep();SITE.cfg.accent=d.v;document.documentElement.style.setProperty("--ac",d.v);$("#ab").innerHTML=cftab()};
act.cfsave=async()=>{keep();try{await api(sp()+"/cfg",{method:"PUT",body:{title:SITE.title,cfg:SITE.cfg}});toast("Saqlandi ✓")}catch(e){toast(e.message)}};
const bztab=()=>`<p class="mu">Cloudinary ma'lumotlari sizning saytingiz uchun va (ulashilgan preset) <b>AniManxwa kampaniyasi</b> tomonidan ilova uchun ishlatiladi.</p>${BASES.map((b,i)=>`<div class="row"><span><b>${E(b.cloud)}</b> / ${E(b.preset)}<br><small class="mu">${b.share?"AniManxwa kampaniyasi uchun":"Faqat sizning saytingiz uchun"}</small></span><button class="bt" data-a="bdel" data-i="${i}">🗑</button></div>`).join("")}
<h4>Yangi baza qo'shish</h4>${F("Cloud name",`<input class="in" id="b_c">`)}${F("Unsigned upload preset",`<input class="in" id="b_p">`)}<label class="ck"><input type="checkbox" id="b_sh"> Bu baza AniManxwa kampaniyasi (ilova) uchun ham ishlatilsin</label><button class="btn" data-a="badd">Qo'shish</button>`;
act.badd=async()=>{try{await api(sp()+"/bases",{method:"POST",body:{cloud:$("#b_c").value,preset:$("#b_p").value,share:$("#b_sh").checked}});admin()}catch(e){toast(e.message)}};
act.bdel=async d=>{if(!confirm("Baza o'chirilsinmi?"))return;try{await api(sp()+"/bases/"+d.i,{method:"DELETE"});admin()}catch(e){toast(e.message)}};
const sttab=()=>{const u=location.origin+url();return `<p>Sayt havolasi:</p><p><b>${E(u)}</b></p><button class="bt" data-a="cpy" data-u="${E(u)}">Nusxalash</button><p class="mu">Manga havolasi: <code>${E(u)}manhwa/manga-nomi/1</code></p>`};
act.cpy=async d=>{try{await navigator.clipboard.writeText(d.u);toast("Nusxalandi ✓")}catch(e){toast(d.u)}};

/* ---------- Yo'naltirish ---------- */
async function route(){onscroll=null;clearInterval(CT);const u=location.pathname.slice(base.length).split("/").filter(Boolean).map(decodeURIComponent);SL=SUB||u.shift()||"";P=u;
if(!SL)return landing();
if(!SITE||SITE.slug.toLowerCase()!=SL.toLowerCase()){app('<div class="ld">Yuklanmoqda...</div>');try{SITE=await api(sp());MG=await api(sp()+"/manga")}catch(e){SITE=null;return app(`<div class="ld"><h2>Sayt topilmadi</h2><p>${E(e.message)}</p><a class="bt" data-l href="${base}">Bosh sahifa</a></div>`)}}
document.documentElement.style.setProperty("--ac",SITE.cfg.accent||"#7c5cff");document.title=SITE.title;
OWN=!!LS.tok&&(LS.sites||[]).some(s=>s.slug.toLowerCase()==SL.toLowerCase());
const [a,b,c]=P;if(!a)return home();if(a=="search")return search();if(a=="catalog")return catalog();if(a=="playlist")return playlist();if(a=="profile")return profile();if(a=="admin")return admin();
const m=find(a,b||"");if(!m)return shell('<div class="ld"><h2>Topilmadi</h2></div>');return c?reader(m,c):mpage(m)}

document.addEventListener("click",e=>{const l=e.target.closest("a[data-l]");if(l&&l.origin==location.origin){e.preventDefault();history.pushState(null,"",l.getAttribute("href"));route();return}
const a=e.target.closest("[data-a]");if(a&&act[a.dataset.a])act[a.dataset.a](a.dataset,a)});
addEventListener("popstate",route);
document.addEventListener("contextmenu",e=>{if(e.target.closest(".pgs"))e.preventDefault()});
document.addEventListener("input",e=>{const t=e.target;
if(t.id=="qi"){QS=t.value;$("#sg").innerHTML=res()}
else if(t.id=="cq"){const m=find(P[0],P[1]);if(m)$("#cl").innerHTML=crows(m,t.value)}
else if(t.id=="w_n"){const s=t.value.replace(/['ʻ’‘`]/g,"").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-+|-+$/g,"");$("#w_u").textContent=s?location.origin+base+s+"/":""}});
document.addEventListener("change",async e=>{const t=e.target;
if(t.id=="cs"){CF.sort=t.value;$("#cg2").innerHTML=cres();return}
if(!t.files||!t.files[0])return;
if(t.id=="f_c"){CVR=await cropUrl(t.files[0],720,1028);const p=$("#cp");p.src=CVR;p.hidden=false}
else if(t.id=="c_f"){const L=[...t.files],cut=CM.type!="Manga",s=$("#cs2");t.value="";PGB=[];
for(let i=0;i<L.length;i++){const f=L[i];try{s.textContent="Tayyorlanmoqda "+(i+1)+"/"+L.length+": "+f.name;PGB.push(...(/pdf/i.test(f.type+f.name)?await pdfPages(f,cut,x=>{s.textContent=x}):await addImg(f,cut)))}catch(err){toast("O'qib bo'lmadi: "+f.name)}}
s.textContent=PGB.length+" ta bo'lak · "+(PGB.reduce((a,b)=>a+b.size,0)/1048576).toFixed(1)+" MB"}});
route();

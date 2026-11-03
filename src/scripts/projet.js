import { Courbes } from "./courbes.js";
import { apresPolices, initLangue, initTheme } from "./reglages.js";

const $=(id)=>document.getElementById(id),rang=+document.body.dataset.rang;
// Combien de projets on a enchaînés depuis l'accueil : gardé dans l'historique, pour que le retour arrière reste juste
let pasRetour=history.state?.n;
if(pasRetour==null){pasRetour=0;try{pasRetour=+sessionStorage.getItem("pas")||0;sessionStorage.removeItem("pas")}catch(x){}history.replaceState({n:pasRetour},"")}
// Les étapes
const liensE=[...document.querySelectorAll("[data-e]")],blocs=liensE.map(a=>$(a.dataset.e));
const suivre=()=>{const m=innerHeight*.45;let c=null;for(const b of blocs)if(b.getBoundingClientRect().top<=m)c=b;
  if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)c=blocs[blocs.length-1];liensE.forEach(l=>l.classList.toggle("on",c&&l.dataset.e==c.id))};
let att=false;addEventListener("scroll",()=>{if(!att){att=true;requestAnimationFrame(()=>{att=false;suivre()})}},{passive:true});suivre();
// Les courbes et leur réaction au survol
const TEXTES="h1,h2,.tete b,.tete p,.long p,.lignes p,.legende,.suite small";
const trace=()=>Courbes.dessine({page:$("page"),fond:$("champ"),couche:$("couche"),gras:$("gras"),graine:11+rang*13,textes:TEXTES});
trace();apresPolices(trace,TEXTES);let tm;addEventListener("resize",()=>{clearTimeout(tm);tm=setTimeout(trace,200)});
document.querySelectorAll(".fig,.suite .w,.vide,.tome,.carton,.carte").forEach(el=>{const h=el.closest("a")||el;h.addEventListener("mouseenter",()=>Courbes.actif(el,true));h.addEventListener("mouseleave",()=>Courbes.actif(el,false))});
initTheme();initLangue();
// La maison : retour direct à l'endroit quitté dans la liste, même après plusieurs projets
$("maison").addEventListener("click",(e)=>{let r=null;try{r=sessionStorage.getItem("retour")}catch(x){}if(r&&pasRetour>0&&history.length>pasRetour){e.preventDefault();history.go(-pasRetour)}});
// Vers le projet suivant : un pas de plus à refaire pour revenir à la liste
const suite=document.querySelector(".suite a");suite.addEventListener("click",()=>{try{sessionStorage.setItem("pas",String(pasRetour+1))}catch(x){}});
// Agrandir et tourner
const loupe=$("loupe"),lot=JSON.parse(loupe.dataset.lot),toutes=lot.map(x=>x.s),limg=loupe.querySelector("img");let cur=0,avantLoupe=null,tour=0;
const appliqueTour=()=>{const couche=tour%180!=0;limg.style.transform=`rotate(${tour}deg)`;limg.style.maxWidth=couche?"calc(100svh - 3rem)":"";limg.style.maxHeight=couche?"calc(100vw - 9rem)":""};
const voisine=(k)=>lot[(k+lot.length)%lot.length].u,fond=(oui)=>document.querySelectorAll("#page,#maison,#etapes,.jour").forEach(x=>x.inert=oui);
const ouvre=(k)=>{cur=(k+toutes.length)%toutes.length;limg.src=voisine(cur);[cur-1,cur+1].forEach(v=>{new Image().src=voisine(v)});limg.style.setProperty("--pre",lot[cur].pre);limg.style.filter=lot[cur].brut?"none":"";tour=0;appliqueTour();if(!loupe.classList.contains("ok")){avantLoupe=document.activeElement;loupe.classList.add("ok");fond(true);loupe.querySelector(".x").focus()}};
const ferme=()=>{loupe.classList.remove("ok");fond(false);avantLoupe?.focus?.()};
document.querySelectorAll("[data-src]").forEach(el=>el.addEventListener("click",()=>ouvre(toutes.indexOf(el.dataset.src))));
loupe.querySelector(".x").onclick=ferme;loupe.querySelector(".tourne").onclick=()=>{tour+=90;appliqueTour()};loupe.querySelector(".g").onclick=()=>ouvre(cur-1);loupe.querySelector(".dr").onclick=()=>ouvre(cur+1);
loupe.addEventListener("click",(e)=>{if(e.target==loupe)ferme()});
addEventListener("keydown",(e)=>{if(!loupe.classList.contains("ok"))return;if(e.key=="Escape")ferme();if(e.key=="ArrowLeft")ouvre(cur-1);if(e.key=="ArrowRight")ouvre(cur+1);if(e.key.toLowerCase()=="r"){tour+=90;appliqueTour()}});
// Podcast
const son=$("son");
if(son){const lire=$("lire"),ico=$("ico"),dur=$("dur"),pos=$("pos"),tps=$("tps"),fmt=(n)=>isFinite(n)?String(Math.floor(n/60)).padStart(2,"0")+":"+String(Math.floor(n%60)).padStart(2,"0"):"00:00";
  lire.onclick=()=>son.paused?son.play():son.pause();son.onplay=son.onpause=()=>ico.textContent=son.paused?"▶":"❚❚";son.onloadedmetadata=()=>dur.textContent=fmt(son.duration);if(son.readyState>0)dur.textContent=fmt(son.duration);
  son.ontimeupdate=()=>{if(son.duration)pos.value=son.currentTime/son.duration*1000;tps.textContent=fmt(son.currentTime)};pos.oninput=()=>{if(son.duration)son.currentTime=pos.value/1000*son.duration}}

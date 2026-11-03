import { contour, ringPath } from "./formes.js";
import { anticipe, apresPolices, initLangue, initTheme } from "./reglages.js";

// La forme de l'accueil, puis un vrai relevé de courbes de niveau sur toute la hauteur de la page :
// les lignes partent de la carte et continuent sans fin jusqu'en bas
const carte=document.getElementById("carte"),logo=document.getElementById("logo"),MAISON=document.querySelector(".fin svg path").getAttribute("d");
let SEG=[],TEXTES=[],LARG=0;const anims=new Map(),prets=new Map();
const fb=contour(11,.2),fb2=contour(47,.2);
const dessine=()=>{
  const P=document.getElementById("page"),W=P.offsetWidth,H=P.offsetHeight,c=carte,w=c.offsetWidth,h=c.offsetHeight;
  const r0=Math.min(w,h)*.385,sx=w/h>1?Math.min(1.25,(w/h)*.95):1;
  c.style.clipPath=`path("${ringPath(fb,w/2,h/2,r0,0,sx,1)}")`;
  const F2=document.getElementById("fin"),w2=F2.offsetWidth,h2=F2.offsetHeight,sx2=w2/h2>1?Math.min(1.25,(w2/h2)*.95):1;
  const b=c.getBoundingClientRect(),o=P.getBoundingClientRect();
  const col=[{x:b.left-o.left+w/2,y:b.top-o.top+h/2,sx,f:fb}];
  const pas=Math.max(780,W*.62);let k=1;
  const f0=F2.getBoundingClientRect(),yf=f0.top-o.top+h2/2;
  for(let y=col[0].y+pas*1.05;y<yf-pas*.55;y+=pas,k++)col.push({x:W*(k%2?.24:.74)+((k*137)%90-45),y,sx:1.15,f:contour(11+k*7,.34)});
  col.push({x:f0.left-o.left+w2/2,y:yf,sx:sx2,f:fb2});
  const hs=(x,y)=>{const h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h)};
  const vn=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,a=u*u*(3-2*u),b=v*v*(3-2*v);return (hs(i,j)*(1-a)+hs(i+1,j)*a)*(1-b)+(hs(i,j+1)*(1-a)+hs(i+1,j+1)*a)*b-.5};
  // Le relief : plusieurs échelles de bruit, des grandes pentes aux petits accidents de terrain
  const relief=(x,y)=>vn(x/460,y/460)*150+vn(x/210+9,y/210+4)*62+vn(x/90+3,y/90+8)*20+vn(x/38+5,y/38+2)*5;
  const A0=col[0],Z0=col[col.length-1];
  const champ=(px,py)=>{let e=0;for(const a of col){const dx=(px-a.x)/a.sx,dy=py-a.y,t=Math.atan2(dy,dx),r=Math.hypot(dx,dy)/a.f(t,0);e+=Math.exp(-r/110)}
    // Les courbes restent calmes autour des deux formes, puis le terrain prend le dessus
    const d=Math.min(Math.hypot(px-A0.x,py-A0.y),Math.hypot(px-Z0.x,py-Z0.y)),m=Math.max(0,Math.min(1,(d-290)/520));
    return -Math.log(e)*110+relief(px,py)*m*m*(3-2*m)};
  const C=9,nx=Math.ceil(W/C)+1,ny=Math.ceil(H/C)+1,v=new Float32Array(nx*ny);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)v[j*nx+i]=champ(i*C,j*C);
  const E=38;let fin="",fort="";SEG=[];TEXTES=[];LARG=W;
  const S=(a,b,va,vb,L)=>a+(b-a)*(L-va)/(vb-va),niveaux=new Map();
  for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){
    const A=v[j*nx+i],B=v[j*nx+i+1],D=v[(j+1)*nx+i],G2=v[(j+1)*nx+i+1],mn=Math.min(A,B,D,G2),mx=Math.max(A,B,D,G2),x=i*C,y=j*C;
    for(let l=Math.ceil(mn/E);l*E<=mx;l++){const L=l*E,q=[];
      if((A<L)!=(B<L))q.push([S(x,x+C,A,B,L),y]);
      if((B<L)!=(G2<L))q.push([x+C,S(y,y+C,B,G2,L)]);
      if((D<L)!=(G2<L))q.push([S(x,x+C,D,G2,L),y+C]);
      if((A<L)!=(D<L))q.push([x,S(y,y+C,A,D,L)]);
      for(let m=0;m+1<q.length;m+=2)(niveaux.get(l)||niveaux.set(l,[]).get(l)).push([q[m][0],q[m][1],q[m+1][0],q[m+1][1]]);
    }
  }
  // On relie les petits traits en lignes continues, puis on les arrondit
  const fmt=(n)=>n.toFixed(1);
  for(const [l,segs] of niveaux){
    const cle=(x,y)=>x.toFixed(2)+","+y.toFixed(2),ends=new Map(),vu=new Uint8Array(segs.length);
    segs.forEach((g,i)=>{for(const e of [cle(g[0],g[1]),cle(g[2],g[3])])(ends.get(e)||ends.set(e,[]).get(e)).push(i)});
    const pousse=(pts,avant)=>{for(;;){const c=avant?pts[0]:pts[pts.length-1],i=(ends.get(cle(c[0],c[1]))||[]).find(n=>!vu[n]);if(i==null)return;vu[i]=1;const g=segs[i],p=cle(g[0],g[1])==cle(c[0],c[1])?[g[2],g[3]]:[g[0],g[1]];if(avant)pts.unshift(p);else pts.push(p)}};
    const f=l%5==0?1:0;let d="";
    segs.forEach((g,i)=>{if(vu[i])return;vu[i]=1;const pts=[[g[0],g[1]],[g[2],g[3]]];pousse(pts,false);pousse(pts,true);
      let ax=pts[0][0],ay=pts[0][1];d+=`M${fmt(ax)} ${fmt(ay)}`;
      for(let n=1;n<pts.length;n++){const c=pts[n],fin_=n==pts.length-1,bx=fin_?c[0]:(c[0]+pts[n+1][0])/2,by=fin_?c[1]:(c[1]+pts[n+1][1])/2;
        d+=`Q${fmt(c[0])} ${fmt(c[1])} ${fmt(bx)} ${fmt(by)}`;
        const mx=.25*ax+.5*c[0]+.25*bx,my=.25*ay+.5*c[1]+.25*by;SEG.push(ax,ay,mx,my,f,mx,my,bx,by,f);ax=bx;ay=by}});
    if(f)fort+=d;else fin+=d;
  }
  champ_svg.setAttribute("width",W);champ_svg.setAttribute("height",H);champ_svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
  // Sans cadre : les courbes s'effacent doucement autour de chaque ligne de texte, comme sur une carte autour des cotes
  const trous=[];
  const garde=(el)=>{const fixe=getComputedStyle(el).position=="fixed"||el.closest(".haut")&&getComputedStyle(el.closest(".haut")).position=="fixed",g=document.createRange();g.selectNodeContents(el);
    for(const q of g.getClientRects()){if(q.width<2||q.height<2)continue;const X=q.left-(fixe?0:o.left)-8,Y=q.top-(fixe?0:o.top)-5;if(!fixe)TEXTES.push([X,Y,X+q.width+16,Y+q.height+10]);trous.push(`<rect x="${X.toFixed(0)}" y="${Y.toFixed(0)}" width="${(q.width+16).toFixed(0)}" height="${(q.height+10).toFixed(0)}" rx="8"/>`)}};
  document.querySelectorAll("#page h1,#page h2,#page h3,#page p,#page dt,#page dd,#contact a,#page .vide,.haut span,.haut.droite a").forEach(garde);
  const mx=document.querySelector(".fin svg").getScreenCTM();
  const silhouette=`<path d="${MAISON}" fill="#000" transform="matrix(${mx.a} ${mx.b} ${mx.c} ${mx.d} ${mx.e-o.left} ${mx.f-o.top})"/>`;
  const marge=W>900?`<rect x="${W-260}" y="0" width="260" height="${H}" fill="url(#fondu)"/>`:"";
  champ_svg.innerHTML=`<defs><linearGradient id="fondu" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".8"/></linearGradient>
    <filter id="flou" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feGaussianBlur stdDeviation="4"/></filter>
    <mask id="garde" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><g fill="#000" opacity=".5" filter="url(#flou)">${trous.join("")}</g>${marge}${silhouette}</mask>
    <g id="lignes" fill="none" stroke-linecap="round"><path d="${fin}" stroke-width=".65"/><path d="${fort}" stroke-width="1.4"/></g></defs>
    <use href="#lignes" style="stroke:var(--r)" mask="url(#garde)"/>`;
  // Les lignes en gras ont leur propre calque : les animer ne redessine pas tout le relief
  const couche=document.getElementById("couche");couche.setAttribute("width",W);couche.setAttribute("height",H);couche.setAttribute("viewBox",`0 0 ${W} ${H}`);
  document.getElementById("gras").innerHTML="";anims.clear();prets.clear();
};
const champ_svg=document.getElementById("champ");
dessine();apresPolices(dessine);
let tm;addEventListener("resize",()=>{clearTimeout(tm);tm=setTimeout(dessine,200)});

initTheme();initLangue();

// La maison ramène toujours à l'accueil
document.querySelectorAll("[data-logo]").forEach(a=>a.addEventListener("click",(e)=>{e.preventDefault();history.replaceState(null,"",location.pathname);scrollTo({top:0,behavior:"smooth"})}));
// Depuis un projet, on revient directement à l'endroit quitté, sans repasser par le haut de page
document.querySelectorAll(".it").forEach(it=>{anticipe(it);it.addEventListener("click",(e)=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  try{sessionStorage.setItem("retour",JSON.stringify({id:it.id,haut:it.getBoundingClientRect().top}));sessionStorage.setItem("pas","1")}catch(e){}})});
// Le fil et les projets se répondent
const liens=[...document.querySelectorAll("[data-p]")];
// Au survol, chaque bout de courbe s'épaissit selon sa distance au projet : pas de masque, donc pas de halo
const NIV=10,EPAIS=3.2,RAYON=230;
const lisse=(t)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const hors=(x,y,a,b,c,d)=>Math.hypot(Math.max(a-x,0,x-c),Math.max(b-y,0,y-d));
const proches=(it)=>{
  const o=document.getElementById("page").getBoundingClientRect(),r=it.querySelector(".pl,.vide").getBoundingClientRect();
  const a=r.left-o.left,b=r.top-o.top,c=r.right-o.left,d=r.bottom-o.top,M=RAYON+30;
  const tx=TEXTES.filter(t=>t[2]>a-M&&t[0]<c+M&&t[3]>b-M&&t[1]<d+M),out=[];
  for(let i=0;i<SEG.length;i+=5){
    const x=(SEG[i]+SEG[i+2])/2,y=(SEG[i+1]+SEG[i+3])/2,dist=hors(x,y,a,b,c,d);
    if(dist>=RAYON)continue;
    let w=(1-lisse(dist/RAYON))*(1-lisse((x-(LARG-230))/120));
    for(const t of tx)w*=lisse((hors(x,y,t[0],t[1],t[2],t[3])-2)/26);
    if(w>.02)out.push([SEG[i],SEG[i+1],SEG[i+2],SEG[i+3],SEG[i+4],w]);
  }
  return out;
};
const prepare=(it)=>{
  if(prets.has(it))return prets.get(it);
  const seaux=Array(NIV*2).fill("");
  for(const q of proches(it)){const n=Math.max(1,Math.round(q[5]*NIV));seaux[q[4]*NIV+n-1]+=`M${q[0].toFixed(1)} ${q[1].toFixed(1)}L${q[2].toFixed(1)} ${q[3].toFixed(1)}`}
  const g=document.createElementNS("http://www.w3.org/2000/svg","g"),traits=[];
  seaux.forEach((d,i)=>{if(!d)return;const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d",d);g.append(p);traits.push({p,base:i>=NIV?1.4:.65,n:((i%NIV)+1)/NIV})});
  document.getElementById("gras").append(g);const pret={g,traits};prets.set(it,pret);return pret;
};
const peindre=()=>{for(const [it,an] of anims){const e=lisse(an.p),pret=prepare(it);pret.g.style.display=e>0?"":"none";for(const t of pret.traits)t.p.setAttribute("stroke-width",(t.base*(1+(EPAIS-1)*t.n*e)).toFixed(2))}};
let enCours=false,avant=0;
const tic=(t)=>{
  const dt=t-avant;avant=t;let reste=false;
  for(const [it,an] of anims){an.p=Math.max(0,Math.min(1,an.p+(an.but?1:-1)*dt/170));if(an.p==0&&!an.but){prepare(it).g.style.display="none";anims.delete(it)}else if(an.p<1||!an.but)reste=true}
  peindre();
  if(reste)requestAnimationFrame(tic);else enCours=false;
};
const actif=(it,oui)=>{
  let an=anims.get(it);
  if(!an){if(!oui)return;an={p:0,but:true};anims.set(it,an)}
  an.but=oui;
  if(!enCours){enCours=true;avant=performance.now();requestAnimationFrame(tic)}
};
document.querySelectorAll(".it").forEach(it=>{it.addEventListener("mouseenter",()=>actif(it,true));it.addEventListener("mouseleave",()=>{if(!it.classList.contains("vu"))actif(it,false)})});
liens.forEach(a=>{const it=document.getElementById(a.dataset.p);a.onmouseenter=()=>{it.classList.add("vu");actif(it,true)};a.onmouseleave=()=>{it.classList.remove("vu");if(!it.matches(":hover"))actif(it,false)}});
const its=[...document.querySelectorAll(".it")],herop=document.querySelector(".hero"),prof=document.getElementById("profil");
const suivre=()=>{
  logo.classList.toggle("plie",herop.getBoundingClientRect().bottom<innerHeight*.35);
  const m=innerHeight/2;let cur=null,best=1e9;
  if(herop.getBoundingClientRect().bottom<m&&prof.getBoundingClientRect().top>m)for(const it of its){const r=it.getBoundingClientRect(),d=m<r.top?r.top-m:m>r.bottom?m-r.bottom:0;
    // à égalité (deux projets côte à côte), celui dont le centre est le plus proche
    const c=d*1000+Math.abs((r.top+r.bottom)/2-m);if(c<best){best=c;cur=it}}
  liens.forEach(l=>l.classList.toggle("on",cur!=null&&l.dataset.p==cur.id));
};
const revenir=()=>{let r=null;try{r=JSON.parse(sessionStorage.getItem("retour"))}catch(e){}const it=r&&document.getElementById(r.id);if(it)scrollBy({top:it.getBoundingClientRect().top-r.haut,behavior:"instant"})};
if(document.documentElement.classList.contains("retour")){revenir();const montre=()=>{revenir();suivre();document.documentElement.classList.remove("retour");try{sessionStorage.removeItem("retour")}catch(e){}};Promise.race([document.fonts?.ready,new Promise(k=>setTimeout(k,300))]).then(montre)}
addEventListener("pageshow",(e)=>{if(e.persisted){try{sessionStorage.removeItem("retour")}catch(x){}}});
let att=false;addEventListener("scroll",()=>{if(!att){att=true;requestAnimationFrame(()=>{att=false;suivre()})}},{passive:true});addEventListener("resize",suivre);suivre();

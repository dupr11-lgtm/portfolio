import { bandes, peintBandes } from "./formes.js";

// Le relief de la page projet : les mêmes courbes que l'accueil, rejouées à partir de la forme du haut
export const Courbes=(()=>{
  const NIV=10,EPAIS=3.2,RAYON=230,NS="http://www.w3.org/2000/svg";
  let SEG=[],TEXTES=[],LARG=0;const anims=new Map(),prets=new Map();
  const lisse=(t)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
  const hors=(x,y,a,b,c,d)=>Math.hypot(Math.max(a-x,0,x-c),Math.max(b-y,0,y-d));
  const hs=(x,y)=>{const h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h)};
  const vn=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,a=u*u*(3-2*u),b=v*v*(3-2*v);return (hs(i,j)*(1-a)+hs(i+1,j)*a)*(1-b)+(hs(i,j+1)*(1-a)+hs(i+1,j+1)*a)*b-.5};
  const dessine=({page,fond,couche,gras,graine,textes})=>{
    const W=page.offsetWidth,H=page.offsetHeight,o=page.getBoundingClientRect();
    // Une coupe de terrain : de longues strates, inclinées différemment pour chaque projet
    const an=((graine*47)%50-25)*Math.PI/180,gx=-Math.sin(an),gy=Math.cos(an),amp=1.15+(graine%5)*.22,dx=graine*91;
    const champ=(px,py)=>px*gx+py*gy+amp*(vn((px+dx)/520,py/360)*210+vn((px+dx)/190+9,py/150+4)*58+vn((px+dx)/70+3,py/60+8)*12);
    const C=9,nx=Math.ceil(W/C)+1,ny=Math.ceil(H/C)+1,v=new Float32Array(nx*ny);
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)v[j*nx+i]=champ(i*C,j*C);
    const E=31,S=(a,b,va,vb,L)=>a+(b-a)*(L-va)/(vb-va),niveaux=new Map(),B=bandes(H);SEG=[];TEXTES=[];LARG=W;
    for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){
      const A=v[j*nx+i],B=v[j*nx+i+1],D=v[(j+1)*nx+i],G=v[(j+1)*nx+i+1],mn=Math.min(A,B,D,G),mx=Math.max(A,B,D,G),x=i*C,y=j*C;
      for(let l=Math.ceil(mn/E);l*E<=mx;l++){const L=l*E,q=[];
        if((A<L)!=(B<L))q.push([S(x,x+C,A,B,L),y]);if((B<L)!=(G<L))q.push([x+C,S(y,y+C,B,G,L)]);if((D<L)!=(G<L))q.push([S(x,x+C,D,G,L),y+C]);if((A<L)!=(D<L))q.push([x,S(y,y+C,A,D,L)]);
        for(let m=0;m+1<q.length;m+=2)(niveaux.get(l)||niveaux.set(l,[]).get(l)).push([q[m][0],q[m][1],q[m+1][0],q[m+1][1]]);}
    }
    for(const [l,segs] of niveaux){
      const cle=(x,y)=>x.toFixed(2)+","+y.toFixed(2),ends=new Map(),vu=new Uint8Array(segs.length);
      segs.forEach((g,i)=>{for(const e of [cle(g[0],g[1]),cle(g[2],g[3])])(ends.get(e)||ends.set(e,[]).get(e)).push(i)});
      const pousse=(pts,avant)=>{for(;;){const c=avant?pts[0]:pts[pts.length-1],i=(ends.get(cle(c[0],c[1]))||[]).find(n=>!vu[n]);if(i==null)return;vu[i]=1;const g=segs[i],p=cle(g[0],g[1])==cle(c[0],c[1])?[g[2],g[3]]:[g[0],g[1]];if(avant)pts.unshift(p);else pts.push(p)}};
      const f=l%5==0?1:0;
      segs.forEach((g,i)=>{if(vu[i])return;vu[i]=1;const pts=[[g[0],g[1]],[g[2],g[3]]];pousse(pts,false);pousse(pts,true);
        let ax=pts[0][0],ay=pts[0][1];
        for(let n=1;n<pts.length;n++){const c=pts[n],z=n==pts.length-1,bx=z?c[0]:(c[0]+pts[n+1][0])/2,by=z?c[1]:(c[1]+pts[n+1][1])/2;B.courbe(f,ax,ay,c[0],c[1],bx,by);
          const qx=.25*ax+.5*c[0]+.25*bx,qy=.25*ay+.5*c[1]+.25*by;SEG.push(ax,ay,qx,qy,f,qx,qy,bx,by,f);ax=bx;ay=by}});
    }
    const trous=[];
    document.querySelectorAll(textes).forEach(el=>{const fixe=!!el.closest(".haut"),g=document.createRange();g.selectNodeContents(el);
      for(const q of g.getClientRects()){if(q.width<2||q.height<2)continue;const X=q.left-(fixe?0:o.left)-8,Y=q.top-(fixe?0:o.top)-5;if(!fixe)TEXTES.push([X,Y,X+q.width+16,Y+q.height+10]);trous.push({y:Y,h:q.height+10,r:`<rect x="${X.toFixed(0)}" y="${Y.toFixed(0)}" width="${(q.width+16).toFixed(0)}" height="${(q.height+10).toFixed(0)}" rx="8"/>`})}});
    couche.setAttribute("width",W);couche.setAttribute("height",H);couche.setAttribute("viewBox",`0 0 ${W} ${H}`);
    peintBandes(fond,B.lots,{W,H,trous,force:.72});
    gras.innerHTML="";anims.clear();prets.clear();Courbes.page=page;Courbes.gras=gras;
  };
  // Chaque bout de courbe proche de l'élément, avec le poids que lui donne sa distance
  const lignes=(el)=>{
    const o=Courbes.page.getBoundingClientRect(),r=el.getBoundingClientRect(),a=r.left-o.left,b=r.top-o.top,c=r.right-o.left,d=r.bottom-o.top,M=RAYON+30;
    const tx=TEXTES.filter(t=>t[2]>a-M&&t[0]<c+M&&t[3]>b-M&&t[1]<d+M),out=[];
    for(let i=0;i<SEG.length;i+=5){const x=(SEG[i]+SEG[i+2])/2,y=(SEG[i+1]+SEG[i+3])/2,dist=hors(x,y,a,b,c,d);if(dist>=RAYON)continue;
      let w=(1-lisse(dist/RAYON))*(1-lisse((x-(LARG-230))/120));for(const t of tx)w*=lisse((hors(x,y,t[0],t[1],t[2],t[3])-2)/26);
      if(w>.02)out.push([SEG[i],SEG[i+1],SEG[i+2],SEG[i+3],SEG[i+4],w])}
    return out;
  };
  const prepare=(el)=>{
    if(prets.has(el))return prets.get(el);
    const seaux=Array(NIV*2).fill("");
    for(const q of lignes(el))seaux[q[4]*NIV+Math.max(1,Math.round(q[5]*NIV))-1]+=`M${q[0].toFixed(1)} ${q[1].toFixed(1)}L${q[2].toFixed(1)} ${q[3].toFixed(1)}`;
    const g=document.createElementNS(NS,"g"),traits=[];
    seaux.forEach((q,i)=>{if(!q)return;const p=document.createElementNS(NS,"path");p.setAttribute("d",q);g.append(p);traits.push({p,base:i>=NIV?1.4:.65,n:((i%NIV)+1)/NIV})});
    Courbes.gras.append(g);const pret={g,traits};prets.set(el,pret);return pret;
  };
  const peindre=()=>{for(const [el,an] of anims){const e=lisse(an.p),p=prepare(el);p.g.style.display=e>0?"":"none";for(const t of p.traits)t.p.setAttribute("stroke-width",(t.base*(1+(EPAIS-1)*t.n*e)).toFixed(2))}};
  let enCours=false,avant=0;
  const tic=(t)=>{const dt=t-avant;avant=t;let reste=false;for(const [el,an] of anims){an.p=Math.max(0,Math.min(1,an.p+(an.but?1:-1)*dt/170));if(an.p==0&&!an.but){prepare(el).g.style.display="none";anims.delete(el)}else if(an.p<1||!an.but)reste=true}peindre();if(reste)requestAnimationFrame(tic);else enCours=false};
  const actif=(el,oui)=>{let an=anims.get(el);if(!an){if(!oui)return;an={p:0,but:true};anims.set(el,an)}an.but=oui;if(!enCours){enCours=true;avant=performance.now();requestAnimationFrame(tic)}};
  return {dessine,actif,lignes,NIV,EPAIS,page:null,gras:null};
})();

(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const ACTIONS = 'a[href],button,summary,[role="button"],[role="link"],[data-cursor="pull"],input[type="button"],input[type="submit"],input[type="reset"]';
  const NATIVE = 'textarea,select,iframe,input:not([type="button"]):not([type="submit"]):not([type="reset"]),[contenteditable]:not([contenteditable="false"]),[data-native-cursor]';
  let sequence = 0;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const smooth = value => value * value * (3 - 2 * value);
  const number = value => Number(value.toFixed(2));
  function svg(tag, attributes = {}) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }
  function indexFingerPose(extension, pressure) {
    const open=smooth(clamp(extension,0,1)),push=smooth(clamp(pressure,0,1));
    // The knuckle stays planted. PIP and DIP flex toward the palm, never backwards.
    const angles=[-90,mix(58*(1-open),78,push),mix(34*(1-open),52,push)];
    const lengths=[25,18,14],joints=[{x:36,y:63}],directions=[],normals=[];
    let angle=angles[0];
    for(let i=0;i<3;i++){
      if(i)angle+=angles[i];
      const radians=angle*Math.PI/180,t={x:Math.cos(radians),y:Math.sin(radians)},p=joints[i];
      directions.push(t);normals.push({x:-t.y,y:t.x});joints.push({x:p.x+t.x*lengths[i],y:p.y+t.y*lengths[i]});
    }
    const radius=[8.2,7.2,6.3,6],tip=joints[3],t=directions[2],n=normals[2],cap={x:tip.x-t.x*radius[3],y:tip.y-t.y*radius[3]};
    function offset(i,side,inset=0){
      const r=radius[i]-inset;
      if(i===0)return{x:joints[0].x+normals[0].x*r*side,y:joints[0].y+normals[0].y*r*side};
      if(i===3)return{x:cap.x+n.x*r*side,y:cap.y+n.y*r*side};
      const a=normals[i-1],b=normals[i],length=Math.hypot(a.x+b.x,a.y+b.y),m={x:(a.x+b.x)/length,y:(a.y+b.y)/length},scale=r/(m.x*a.x+m.y*a.y);
      return{x:joints[i].x+m.x*scale*side,y:joints[i].y+m.y*scale*side};
    }
    const point=p=>`${Number(p.x.toFixed(4))} ${Number(p.y.toFixed(4))}`;
    const lerp=(a,b,k)=>({x:mix(a.x,b.x,k),y:mix(a.y,b.y,k)});
    function sidePath(points){return `L${point(lerp(points[0],points[1],.82))}Q${point(points[1])} ${point(lerp(points[1],points[2],.22))}L${point(lerp(points[1],points[2],.78))}Q${point(points[2])} ${point(lerp(points[2],points[3],.22))}L${point(points[3])}`;}
    const a=[0,1,2,3].map(i=>offset(i,1)),b=[0,1,2,3].map(i=>offset(i,-1)),k=.5522847498*radius[3];
    const silhouette=`M${point(a[0])}${sidePath(a)}C${point({x:a[3].x+t.x*k,y:a[3].y+t.y*k})} ${point({x:tip.x+n.x*k,y:tip.y+n.y*k})} ${point(tip)}C${point({x:tip.x-n.x*k,y:tip.y-n.y*k})} ${point({x:b[3].x+t.x*k,y:b[3].y+t.y*k})} ${point(b[3])}${sidePath([...b].reverse())}Q36 69 ${point(a[0])}Z`;
    const folds=[1,2].map(i=>{
      const j=joints[i],a=normals[i-1],b=normals[i],length=Math.hypot(a.x+b.x,a.y+b.y),cross={x:(a.x+b.x)/length,y:(a.y+b.y)/length},r=radius[i]*.68,along=directions[i];
      return `M${point({x:j.x-cross.x*r,y:j.y-cross.y*r})}Q${point({x:j.x+along.x*2.5,y:j.y+along.y*2.5})} ${point({x:j.x+cross.x*r,y:j.y+cross.y*r})}`;
    }).join('');
    const stitch=[3,2,1,0].map(i=>offset(i,-1,1.6));
    const seam=`M${point(stitch[0])}${sidePath(stitch)}`;
    const highlight=`M${point({x:tip.x-t.x*2-n.x*2,y:tip.y-t.y*2-n.y*2})}Q${point({x:tip.x-t.x*.5,y:tip.y-t.y*.5})} ${point({x:tip.x-t.x*2+n.x*2,y:tip.y-t.y*2+n.y*2})}`;
    return {joints,angles,lengths,tip,silhouette,folds,seam,highlight,origin:{x:joints[1].x-directions[0].x*9+normals[0].x*2.5,y:joints[1].y-directions[0].y*9+normals[0].y*2.5}};
  }
  function mount({ reducedMotion = false } = {}) {
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const id = `mk-glove-${++sequence}`;
    const root = document.createElement('div');
    root.className = 'symbiote-cursor';
    root.setAttribute('aria-hidden', 'true');
    root.dataset.state = 'native';
    const web = svg('svg', { class: 'symbiote-webs', 'aria-hidden': 'true' });
    const glove = svg('svg', { class: 'symbiote-glove', viewBox: '0 0 100 122', 'aria-hidden': 'true' });
    // Five separate fingers, rolled cuff, running seams and worn cotton folds.
    // The index silhouette is articulated in paintGlove(), rather than stretched.
    glove.innerHTML = `<defs>
      <linearGradient id="${id}-cotton" x1=".15" y1="0" x2=".9" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#fffdf4"/><stop offset=".43" stop-color="#eee9de"/><stop offset="1" stop-color="#b4ac9e"/></linearGradient>
      <radialGradient id="${id}-palm" cx=".35" cy=".25" r=".85"><stop stop-color="#fffdf5"/><stop offset=".65" stop-color="#e9e4d9"/><stop offset="1" stop-color="#b8ae9e"/></radialGradient>
      <linearGradient id="${id}-cuff" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffaf0"/><stop offset=".5" stop-color="#d0c7b7"/><stop offset="1" stop-color="#f6f0e4"/></linearGradient>
    </defs>
    <g class="glove-hand">
      <path class="glove-outline" fill="url(#${id}-cotton)" d="M48 69C45 59 45 45 48 35C50 27 56 25 62 28C69 32 67 42 65 49L65 71Z"/>
      <path class="glove-crease" d="M49 42Q55 37 64 43M51 48Q56 44 63 48"/>
      <path class="glove-stitch" d="M60 30C64 37 59 45 60 56"/>
      <path class="glove-highlight" d="M51 33Q56 29 59 32"/>
      <path class="glove-outline" fill="url(#${id}-cotton)" d="M60 76C60 67 63 47 68 40C72 34 79 36 83 42C86 48 81 59 78 67L77 79Z"/>
      <path class="glove-crease" d="M67 52Q74 48 81 52M67 58Q73 54 78 58"/>
      <path class="glove-stitch" d="M78 40Q83 48 73 68"/>
      <path class="glove-highlight" d="M71 43Q75 39 78 43"/>
      <path class="glove-outline" fill="url(#${id}-cotton)" d="M72 86C72 77 80 56 86 53C92 50 98 56 96 63C95 72 87 81 85 88Z"/>
      <path class="glove-crease" d="M82 66Q87 62 93 66"/>
      <path class="glove-stitch" d="M91 56Q95 63 85 76"/>
      <path class="glove-outline glove-index" fill="url(#${id}-cotton)"/>
      <path class="glove-crease glove-index-fold"/>
      <path class="glove-stitch glove-index-seam"/>
      <path class="glove-highlight glove-index-light"/>
      <path class="glove-outline" fill="url(#${id}-palm)" d="M31 57C40 55 48 57 53 62C63 55 74 59 80 67C88 76 87 87 78 98C72 106 48 108 36 99C26 92 20 74 26 64Z"/>
      <path class="glove-outline" fill="url(#${id}-cotton)" d="M35 83C25 83 19 78 13 73C4 65 1 55 8 51C14 47 19 54 24 59C27 62 31 63 36 65C45 69 43 79 35 83Z"/>
      <path class="glove-crease" d="M14 57Q10 61 15 67M27 69Q29 73 26 78M40 76Q36 86 43 92M51 75Q56 82 55 90M64 72Q67 78 65 86"/>
      <path class="glove-stitch" d="M9 54C5 62 21 78 34 78M36 61C26 76 36 94 52 99C64 104 77 93 80 84"/>
      <path class="glove-highlight" d="M40 64Q46 61 50 65M68 65Q75 67 78 73M10 54Q14 53 18 58"/>
      <path class="glove-outline" fill="#756a5b" d="M38 99Q58 92 80 98L79 113Q62 122 40 114Z"/>
      <path class="glove-outline" fill="url(#${id}-cuff)" d="M35 99C44 93 69 93 82 98L83 111C70 119 46 118 35 112Z"/>
      <path class="glove-crease" d="M36 102Q59 111 82 102M40 113Q61 118 79 112"/>
      <path class="glove-stitch" d="M38 100Q58 107 80 100M38 111Q59 117 80 110"/>
      <path fill="#bd714f" d="M72 103L77 102L77 110L72 112Z"/>
      <path fill="none" stroke="#f4d4b6" stroke-width=".8" d="M73 104L76 107M76 103L73 108"/>
    </g>`;
    root.append(web, glove);
    document.body.append(root);
    const index=glove.querySelector('.glove-index'),fold=glove.querySelector('.glove-index-fold'),seam=glove.querySelector('.glove-index-seam'),highlight=glove.querySelector('.glove-index-light');
    const skin=svg('g',{class:'symbiote-skin'}),cuff=svg('path',{class:'symbiote-cuff-film'});
    const veins=Array.from({length:3},()=>svg('path',{class:'symbiote-hand-vein'}));skin.append(cuff,...veins);glove.append(skin);
    const disposers=[],connections=[];
    const pointer={x:0,y:0,inside:false,mouse:false,native:false,hover:null};
    const REACH=150, BREAK=216, RELEASE_MS=580, GLOVE_SCALE=.44;
    let paused=Boolean(reducedMotion),destroyed=false,keyboard=false,pressed=false;
    let frame=0,lastTime=0,lastMove=0,rectTime=-1000,dirty=true,host=document.body,targets=[],desired=null;
    let extension=0,press=0,tilt=0,lastX=0,lastY=0,motionX=0,motionY=0,pose=null;
    function listen(node,type,fn,options){node.addEventListener(type,fn,options);disposers.push(()=>node.removeEventListener(type,fn,options));}
    function eligible(){return !destroyed&&!paused&&!reduced.matches&&fine.matches&&pointer.mouse&&pointer.inside&&!pointer.native&&!keyboard&&!document.hidden;}
    function schedule(){if(!frame&&!destroyed)frame=requestAnimationFrame(tick);}
    function nativeCursor(){document.documentElement.classList.remove('symbiote-cursor-active');root.classList.remove('is-visible');root.dataset.state='native';root.dataset.idle='true';}
    function clearWebs(){connections.forEach(c=>c.group.remove());connections.length=0;desired=null;root.dataset.strands='0';root.dataset.connections='0';root.dataset.target='';skin.setAttribute('opacity','0');}
    function stop(){if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;motionX=motionY=tilt=press=extension=0;lastX=pointer.x;lastY=pointer.y;nativeCursor();clearWebs();}
    function updateHost(){const dialogs=Array.from(document.querySelectorAll('dialog[open]'));const next=dialogs[dialogs.length-1]||document.body;if(host!==next||root.parentNode!==next){host=next;host.append(root);clearWebs();dirty=true;}}
    function readTargets(time){
      if(!dirty&&time-rectTime<240)return;
      updateHost();
      targets=Array.from(host.querySelectorAll(ACTIONS)).filter(node=>!root.contains(node)&&!node.disabled&&node.getAttribute('aria-disabled')!=='true'&&!node.closest('[hidden],[inert]')).map(node=>({node,rect:node.getBoundingClientRect()})).filter(({node,rect})=>rect.width>0&&rect.height>0&&rect.bottom>=-BREAK&&rect.top<=innerHeight+BREAK&&rect.right>=-BREAK&&rect.left<=innerWidth+BREAK&&getComputedStyle(node).visibility!=='hidden');
      rectTime=time;dirty=false;
    }
    function distanceTo(rect){return Math.hypot(pointer.x-clamp(pointer.x,rect.left,rect.right),pointer.y-clamp(pointer.y,rect.top,rect.bottom));}
    function visibleAt(item){
      if(typeof document.elementFromPoint!=='function')return true;
      const r=item.rect,ix=Math.min(3,r.width/4),iy=Math.min(3,r.height/4);
      const x=clamp(pointer.x,r.left+ix,r.right-ix),y=clamp(pointer.y,r.top+iy,r.bottom-iy);
      if(x<0||x>=innerWidth||y<0||y>=innerHeight)return false;
      const hit=document.elementFromPoint(x,y);return Boolean(hit&&(hit===item.node||item.node.contains(hit)));
    }
    function chooseTarget(){
      const hovered=targets.find(item=>item.node===pointer.hover);
      if(hovered&&distanceTo(hovered.rect)<1&&visibleAt(hovered)){hovered.distance=distanceTo(hovered.rect);return hovered;}
      const nearby=targets.filter(item=>{item.distance=distanceTo(item.rect);return item.distance<REACH;}).sort((a,b)=>a.distance-b.distance);
      const best=nearby.find(visibleAt)||null,bestDistance=best?best.distance:REACH;
      const previous=desired&&targets.find(item=>item.node===desired.node),connection=previous&&connections.find(c=>c.node===previous.node&&c.released===null);
      if(previous){previous.distance=distanceTo(previous.rect);const limit=connection?.latched?BREAK:REACH;if(previous.distance<=limit&&visibleAt(previous)&&(!best||previous.node===best.node||previous.distance<=bestDistance+12))return previous;}
      return best;
    }
    function chooseSide(rect){
      const outsideX=Math.max(rect.left-pointer.x,0,pointer.x-rect.right),outsideY=Math.max(rect.top-pointer.y,0,pointer.y-rect.bottom);
      if(outsideX||outsideY)return outsideX>outsideY?(pointer.x<rect.left?0:1):(pointer.y<rect.top?2:3);
      const sides=[pointer.x-rect.left,rect.right-pointer.x,pointer.y-rect.top,rect.bottom-pointer.y];return sides.indexOf(Math.min(...sides));
    }
    function edgePoint(rect,side,offset=0){const inset=Math.min(3,(side<2?rect.height:rect.width)/4);return side<2?{x:side===0?rect.left:rect.right,y:clamp(pointer.y+offset,rect.top+inset,rect.bottom-inset)}:{x:clamp(pointer.x+offset,rect.left+inset,rect.right-inset),y:side===2?rect.top:rect.bottom};}
    function createConnection(item,time){
      let c=connections.find(c=>c.node===item.node);
      if(c){if(c.released!==null){c.resumeEnd={...c.end};c.resumeAt=time;}c.rect=item.rect;c.released=null;c.latched=c.latched||item.distance<20;return c;}
      const group=svg('g',{class:'symbiote-connection'});
      const limbs=Array.from({length:3},(_,i)=>{const body=svg('path',{class:'symbiote-tendon-body'}),shine=svg('path',{class:'symbiote-tendon-shine'});group.append(body,shine);return{body,shine,controls:null,points:[],index:i};});
      const branches=Array.from({length:6},()=>{const edge=svg('path',{class:'symbiote-branch-edge'}),core=svg('path',{class:'symbiote-branch-core'});group.append(edge,core);return{edge,core};});
      const bridges=Array.from({length:2},()=>svg('path',{class:'symbiote-membrane'}));group.append(...bridges);
      const contact=svg('path',{class:'symbiote-contact'}),rim=svg('path',{class:'symbiote-target-rim'}),ripple=svg('path',{class:'symbiote-target-ripple'});group.append(contact,rim,ripple);web.append(group);
      c={node:item.node,rect:item.rect,side:chooseSide(item.rect),group,limbs,branches,bridges,contact,rim,ripple,amount:0,growth:0,latched:item.distance<20,released:null,pulse:0,phase:connections.length*1.7+time*.001,tip:edgePoint(item.rect,chooseSide(item.rect)),end:null};
      connections.push(c);while(connections.length>2)connections.shift().group.remove();return c;
    }
    function release(c,time){if(c.released!==null)return;c.released=time;c.releaseEnd=c.end?{...c.end}:{...c.tip};c.releaseBranches=c.branches.map((_,i)=>edgePoint(c.rect,c.side,(i-2.5)*(3+c.amount*3)));c.pulse=Math.max(c.pulse,.25);c.group.setAttribute('data-phase','recoil');}
    function spring(p,x,y,dt){const steps=Math.ceil(dt*2),step=dt/steps;for(let i=0;i<steps;i++){p.vx=clamp((p.vx+(x-p.x)*.12*step)*Math.pow(.64,step),-160,160);p.vy=clamp((p.vy+(y-p.y)*.12*step)*Math.pow(.64,step),-160,160);p.x+=p.vx*step;p.y+=p.vy*step;}}
    function bezier(a,b,c,d,t){const q=1-t;return{x:q*q*q*a.x+3*q*q*t*b.x+3*q*t*t*c.x+t*t*t*d.x,y:q*q*q*a.y+3*q*q*t*b.y+3*q*t*t*c.y+t*t*t*d.y};}
    function curve(a,b,c,d){return `M${number(a.x)} ${number(a.y)}C${number(b.x)} ${number(b.y)} ${number(c.x)} ${number(c.y)} ${number(d.x)} ${number(d.y)}`;}
    function outline(points,radius,time,phase,pulse){
      const left=[],right=[];
      points.forEach((p,i)=>{const t=i/(points.length-1),a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],length=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y));const bulge=Math.max(0,1-Math.abs(t-(1-pulse))*6)*pulse;const width=Math.max(.12,radius*(.34+Math.pow(Math.sin(Math.PI*t),.7)*.66)*(1-t*.76)*(1+bulge*.9+Math.sin(t*9-time*.0018+phase)*.08));const nx=-(b.y-a.y)/length,ny=(b.x-a.x)/length;left.push({x:p.x+nx*width,y:p.y+ny*width});right.push({x:p.x-nx*width,y:p.y-ny*width});});
      const boundary=left.concat(right.reverse());return boundary.map((p,i)=>(i?'L':'M')+number(p.x)+' '+number(p.y)).join('')+'Z';
    }
    function paintGlove(amount,x,y,angle){
      const finger=indexFingerPose(amount,press),{x:tipX,y:tipY}=finger.tip;
      index.setAttribute('d',finger.silhouette);fold.setAttribute('d',finger.folds);seam.setAttribute('d',finger.seam);highlight.setAttribute('d',finger.highlight);
      // Cotton compresses slightly, but a click is the two finger hinges flexing.
      const scaleX=Number((GLOVE_SCALE*(1+press*.012)).toFixed(4)),scaleY=Number((GLOVE_SCALE*(1-press*.018)).toFixed(4)),rotation=Number(angle.toFixed(4)),radians=rotation*Math.PI/180,cos=Math.cos(radians),sin=Math.sin(radians);
      const paintedX=number(x),paintedY=number(y),localX=Number(tipX.toFixed(4)),localY=Number(tipY.toFixed(4));
      // SVG CSS viewport == viewBox: a single scale keeps the painted tip exact.
      glove.style.transform=`translate(${paintedX}px,${paintedY}px) rotate(${rotation}deg) scale(${scaleX},${scaleY}) translate(${-localX}px,${-localY}px)`;
      glove.dataset.tipX=String(localX);glove.dataset.tipY=String(localY);glove.dataset.scaleX=String(scaleX);glove.dataset.scaleY=String(scaleY);
      glove.dataset.indexPip=finger.angles[1].toFixed(3);glove.dataset.indexDip=finger.angles[2].toFixed(3);
      function world(px,py){const dx=(px-localX)*scaleX,dy=(py-localY)*scaleY;return{x:paintedX+dx*cos-dy*sin,y:paintedY+dx*sin+dy*cos};}
      skin.setAttribute('opacity',clamp(amount*.92,0,1).toFixed(3));
      cuff.setAttribute('d',`M35 103Q45 ${97+Math.sin(lastTime*.002)*2} 51 103Q63 97 81 101L81 112Q60 119 36 112Z`);
      const [mcp,pip,dip]=finger.joints;
      veins[0].setAttribute('d',`M58 107C35 95 44 77 ${mcp.x} ${mcp.y}L${finger.origin.x} ${finger.origin.y}Q${pip.x} ${pip.y} ${dip.x} ${dip.y}L${tipX} ${tipY}`);
      veins[1].setAttribute('d','M57 108C42 89 32 77 19 66M40 88Q36 67 32 62');
      veins[2].setAttribute('d','M65 106C80 95 72 80 74 64M68 91Q57 76 58 62');
      veins.forEach((vein,i)=>vein.setAttribute('stroke-width',(1.2+amount*(i?1.3:2.1)).toFixed(2)));
      root.dataset.extension=amount.toFixed(2);root.dataset.pointerX=x.toFixed(2);root.dataset.pointerY=y.toFixed(2);
      return{origins:[world(finger.origin.x,finger.origin.y),world(20,67),world(62,108)],world};
    }
    function paintConnection(c,time,dt,active){
      const retiring=c.released!==null,life=retiring?clamp((time-c.released)/RELEASE_MS,0,1):0;
      if(life>=1){c.group.remove();connections.splice(connections.indexOf(c),1);return;}
      const proximity=active?active.amount:0;
      c.amount=mix(c.amount,retiring?0:proximity,1-Math.pow(.77,dt));c.growth=mix(c.growth,retiring?0:1,1-Math.pow(retiring?.88:.83,dt));c.pulse*=Math.pow(.9,dt);
      c.latched=c.latched||Boolean(active&&active.distance<22&&c.growth>.65);
      const desiredTip=edgePoint(c.rect,c.side);c.tip.x=mix(c.tip.x,desiredTip.x,1-Math.pow(.72,dt));c.tip.y=mix(c.tip.y,desiredTip.y,1-Math.pow(.72,dt));
      const rootPoint=pose.origins[2],normal=c.side===0?{x:-1,y:0}:c.side===1?{x:1,y:0}:c.side===2?{x:0,y:-1}:{x:0,y:1};
      let end;
      if(retiring){const retract=1-smooth(life);end={x:mix(rootPoint.x,c.releaseEnd.x,retract)+normal.x*Math.sin(life*Math.PI)*18,y:mix(rootPoint.y,c.releaseEnd.y,retract)+normal.y*Math.sin(life*Math.PI)*18};}
      else if(c.resumeEnd){const progress=smooth(clamp((time-c.resumeAt)/180,0,1));end={x:mix(c.resumeEnd.x,c.tip.x,progress),y:mix(c.resumeEnd.y,c.tip.y,progress)};if(progress>=1)c.resumeEnd=null;}
      else end={x:mix(rootPoint.x,c.tip.x,smooth(c.growth)),y:mix(rootPoint.y,c.tip.y,smooth(c.growth))};
      c.end=end;c.group.setAttribute('opacity',((retiring?1-life:.25+.75*Math.sqrt(c.amount))*Math.min(1,c.growth*2)).toFixed(3));
      c.group.setAttribute('data-phase',retiring?'recoil':c.latched?'latched':'growing');
      c.limbs.forEach((limb,i)=>{
        const start=pose.origins[i],spread=(i-1)*(3+c.amount*6),edge=edgePoint(c.rect,c.side,spread),fan=c.growth*(retiring?1-smooth(life):1),tip={x:end.x+(edge.x-c.tip.x)*fan,y:end.y+(edge.y-c.tip.y)*fan};
        const dx=tip.x-start.x,dy=tip.y-start.y,length=Math.max(1,Math.hypot(dx,dy)),nx=-dy/length,ny=dx/length;
        const sway=Math.sin(time*.0018+c.phase+i*1.9)*Math.min(8,length*.09),bend=(i-1)*Math.min(38,length*.33)+sway;
        const a={x:start.x+dx*.28+nx*bend-motionX*(.8+i*.25),y:start.y+dy*.28+ny*bend-motionY*(.8+i*.25)};
        const b={x:start.x+dx*.74-nx*bend*.65-motionX*.35,y:start.y+dy*.74-ny*bend*.65-motionY*.35};
        if(!limb.controls)limb.controls=[{...a,vx:0,vy:0},{...b,vx:0,vy:0}];spring(limb.controls[0],a.x,a.y,dt);spring(limb.controls[1],b.x,b.y,dt);
        const [p,q]=limb.controls;limb.points=Array.from({length:19},(_,n)=>bezier(start,p,q,tip,n/18));
        const radius=(((i===2?2.4:1.4)+c.amount*(i===2?4.4:2.5))*(.18+.82*Math.sqrt(c.amount))+press*.4)*.78;
        limb.body.setAttribute('d',outline(limb.points,radius,time,c.phase+i,c.pulse));
        const glint=limb.points.slice(3,13).map((point,n)=>(n?'L':'M')+number(point.x+nx*radius*.35)+' '+number(point.y+ny*radius*.35)).join('');
        limb.shine.setAttribute('d',glint);limb.shine.setAttribute('opacity',(.25+c.amount*.48).toFixed(2));
      });
      c.branches.forEach((branch,i)=>{
        const limb=c.limbs[i%3],fork=limb.points[8+(i%2)*3],tip=retiring?c.releaseBranches[i]:edgePoint(c.rect,c.side,(i-2.5)*(3+c.amount*3));
        const target=retiring?{x:mix(rootPoint.x,tip.x,1-smooth(life)),y:mix(rootPoint.y,tip.y,1-smooth(life))}:{x:mix(fork.x,tip.x,smooth(c.growth)),y:mix(fork.y,tip.y,smooth(c.growth))};
        const d=curve(fork,{x:fork.x+(target.x-fork.x)*.42+normal.x*8,y:fork.y+(target.y-fork.y)*.42+normal.y*8},{x:target.x+normal.x*9,y:target.y+normal.y*9},target);
        branch.edge.setAttribute('d',d);branch.core.setAttribute('d',d);const width=.28+c.amount*(i%2?.8:1.15);branch.edge.setAttribute('stroke-width',(width+1).toFixed(2));branch.core.setAttribute('stroke-width',width.toFixed(2));
      });
      c.bridges.forEach((path,i)=>{const a=c.limbs[i].points[4],b=c.limbs[i+1].points[7],tip=c.limbs[i].points[12];path.setAttribute('d',`M${number(a.x)} ${number(a.y)}Q${number((a.x+b.x)*.5)} ${number((a.y+b.y)*.5)} ${number(b.x)} ${number(b.y)}Q${number((b.x+tip.x)*.5)} ${number((b.y+tip.y)*.5)} ${number(tip.x)} ${number(tip.y)}Q${number((tip.x+a.x)*.5+3)} ${number((tip.y+a.y)*.5-3)} ${number(a.x)} ${number(a.y)}Z`);path.setAttribute('opacity',(c.amount*.48).toFixed(2));});
      const span=Math.min(c.side<2?c.rect.height:c.rect.width,48)*(c.growth*.7),a=edgePoint(c.rect,c.side,-span/2),b=edgePoint(c.rect,c.side,span/2),center=edgePoint(c.rect,c.side),breath=(.5+.5*Math.sin(time*.003+c.phase))*c.amount,depth=1+c.amount*(4+breath*2)+c.pulse*3;
      const crest={x:center.x+normal.x*depth,y:center.y+normal.y*depth},lip=`M${number(a.x)} ${number(a.y)}Q${number(crest.x)} ${number(crest.y)} ${number(b.x)} ${number(b.y)}`;
      c.contact.setAttribute('d',`${lip}Q${number(center.x-normal.x*depth*.35)} ${number(center.y-normal.y*depth*.35)} ${number(a.x)} ${number(a.y)}Z`);
      c.contact.setAttribute('opacity',retiring?'0':(c.amount*.8*c.growth).toFixed(3));
      c.rim.setAttribute('d',lip);c.rim.setAttribute('opacity',retiring?'0':(c.amount*.6*c.growth).toFixed(3));
      const wave=1-c.pulse,reach=span*(.4+wave*.8),wa=edgePoint(c.rect,c.side,-reach),wb=edgePoint(c.rect,c.side,reach),inset=2+wave*6;
      c.ripple.setAttribute('d',curve({x:wa.x-normal.x*inset,y:wa.y-normal.y*inset},{x:center.x-normal.x*inset*2,y:wa.y-normal.y*inset*2},{x:center.x-normal.x*inset*2,y:wb.y-normal.y*inset*2},{x:wb.x-normal.x*inset,y:wb.y-normal.y*inset}));c.ripple.setAttribute('opacity',retiring?'0':(c.pulse*c.amount*.6).toFixed(3));
    }
    function tick(time){
      frame=0;if(!eligible()){stop();return;}
      if(lastTime&&connections.length&&time-lastMove>160&&time-lastTime<30){schedule();return;}
      const fresh=!lastTime,dt=fresh?1:clamp((time-lastTime)/16.667,.2,2);if(fresh){lastX=pointer.x;lastY=pointer.y;}lastTime=time;readTargets(time);
      desired=chooseTarget();if(desired){const previous=connections.find(c=>c.node===desired.node&&c.released===null),latched=previous?.latched;desired.amount=latched ? .12+.88*smooth(1-clamp(desired.distance/BREAK,0,1)) : Math.max(.008,smooth(1-clamp(desired.distance/REACH,0,1)));}
      const active=desired?createConnection(desired,time):null;
      connections.forEach(c=>{if(c!==active)release(c,time);});
      const strength=desired?desired.amount:0;extension=mix(extension,strength,1-Math.pow(.77,dt));press=mix(press,pressed?1:0,1-Math.pow(.58,dt));
      const inertia=1-Math.pow(.7,dt);motionX=mix(motionX,clamp((pointer.x-lastX)/dt,-35,35),inertia);motionY=mix(motionY,clamp((pointer.y-lastY)/dt,-35,35),inertia);lastX=pointer.x;lastY=pointer.y;
      const attachment=active?active.tip:{x:pointer.x,y:pointer.y};const dx=attachment.x-pointer.x,dy=attachment.y-pointer.y,length=Math.max(1,Math.hypot(dx,dy));
      tilt=mix(tilt,clamp(motionX*.16-motionY*.05+dx/length*strength*7,-13,13),1-Math.pow(.8,dt));
      pose=paintGlove(extension,pointer.x,pointer.y,tilt);
      [...connections].forEach(c=>paintConnection(c,time,dt,c===active?desired:null));
      root.dataset.state=pressed?'pressed':desired?desired.distance<1?'holding':active?.latched&&desired.distance>75?'stretching':'pulling':connections.length?'recoiling':'free';
      root.dataset.connections=String(connections.length);root.dataset.strands=String(connections.length*9);root.dataset.target=desired?desired.node.id||desired.node.tagName.toLowerCase():'';root.dataset.distance=desired?desired.distance.toFixed(1):'';root.dataset.tension=desired?(desired.distance/BREAK).toFixed(2):'0';root.dataset.pulse=active?active.pulse.toFixed(2):'0';
      root.classList.add('is-visible');document.documentElement.classList.add('symbiote-cursor-active');
      const settling=Math.abs(extension-strength)>.003||Math.abs(tilt)>.04||Math.abs(press-(pressed?1:0))>.003||Math.hypot(motionX,motionY)>.03;
      root.dataset.idle=String(!connections.length&&!settling);if(connections.length||settling)schedule();else lastTime=0;
    }
    function move(event){pointer.x=event.clientX;pointer.y=event.clientY;pointer.mouse=event.pointerType==='mouse'||!event.pointerType;pointer.inside=true;pointer.native=Boolean(event.target instanceof Element&&event.target.closest(NATIVE));pointer.hover=event.target instanceof Element?event.target.closest(ACTIONS):null;keyboard=false;lastMove=typeof performance!=='undefined'?performance.now():lastTime;if(eligible())schedule();else stop();}
    function leave(event){if(!event.relatedTarget){pointer.inside=false;pressed=false;stop();}else if(event.relatedTarget instanceof Element&&event.relatedTarget.closest(NATIVE)){pointer.native=true;stop();}}
    function invalidate(){dirty=true;if(eligible())schedule();}
    function availability(){if(!eligible())stop();else schedule();}
    listen(document,'pointermove',move,{passive:true});listen(document,'pointerout',leave,{passive:true});
    listen(document,'pointerdown',event=>{if(event.pointerType==='touch'){pointer.mouse=false;availability();return;}if(event.target instanceof Element&&event.target.closest(NATIVE)){pointer.native=true;availability();return;}pressed=true;connections.forEach(c=>{if(c.released===null)c.pulse=1;});if(eligible())schedule();},{passive:true});
    listen(document,'pointerup',()=>{pressed=false;if(eligible())schedule();},{passive:true});listen(document,'pointercancel',()=>{pressed=false;pointer.inside=false;availability();},{passive:true});
    listen(document,'keydown',event=>{if(event.key==='Tab'||event.key==='Escape'){keyboard=true;pressed=false;availability();}});listen(window,'blur',()=>{pointer.inside=false;pressed=false;availability();});
    listen(document,'visibilitychange',availability);listen(window,'resize',invalidate,{passive:true});listen(document,'scroll',invalidate,{passive:true,capture:true});listen(fine,'change',availability);listen(reduced,'change',availability);
    const observer=new MutationObserver(records=>{
      const relevant=records.some(record=>{
        if(root.contains(record.target))return false;
        if(record.type!=='childList')return true;
        return [...(record.addedNodes||[]),...(record.removedNodes||[])].some(node=>node!==root&&node instanceof Element&&(node.matches?.(ACTIONS)||node.querySelector?.(ACTIONS)||connections.some(c=>node===c.node||node.contains(c.node))));
      });
      if(relevant){updateHost();dirty=true;if(eligible())schedule();}
    });observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden','disabled','inert']});
    paintGlove(0,0,0,0);skin.setAttribute('opacity','0');
    return{setPaused(value){paused=Boolean(value);if(paused)stop();else if(eligible())schedule();},destroy(){if(destroyed)return;destroyed=true;stop();observer.disconnect();disposers.forEach(dispose=>dispose());root.remove();}};
  }
  window.SymbioteCursor=Object.freeze({mount});
})();

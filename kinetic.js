/* Original projected ribbon sculpture. Canvas 2D; no dependencies or image assets. */
(function (global) {
  'use strict';

  const TAU = Math.PI * 2;
  const instances = new WeakMap();
  const MODES = {
    flow:      { radius: 1.92, lobe: .81, rise: .91, width: .37, camber: .07, twist: -.32, wave: .32, rx: .48, ry: -.24, rz: -.30, speed: .095, contour: .20, body: 1, tracer: 1 },
    structure: { radius: 2.18, lobe: .57, rise: .49, width: .29, camber: .045, twist: .62, wave: .62, rx: .76, ry: .22, rz: .12, speed: .046, contour: .94, body: .60, tracer: .46 },
    signal:    { radius: 1.96, lobe: .94, rise: 1.12, width: .34, camber: .075, twist: -1.02, wave: .18, rx: .28, ry: .40, rz: -.42, speed: .125, contour: .42, body: .87, tracer: 1.9 }
  };
  const keys = Object.keys(MODES.flow);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
  const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  const mul = (a, s) => [a[0]*s, a[1]*s, a[2]*s];
  const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const norm = (a) => mul(a, 1/(Math.hypot(a[0], a[1], a[2]) || 1));
  const limit = (a, maximum) => {
    const length=Math.hypot(a[0],a[1],a[2]);
    return Number.isFinite(length) ? (length>maximum ? mul(a,maximum/length) : a) : [0,0,0];
  };
  const LIGHT = norm([-.48, -.55, .82]);
  const HALF = norm(add(LIGHT, [0, 0, 1]));

  function rotation(x, y, z) {
    const sx=Math.sin(x), cx=Math.cos(x), sy=Math.sin(y), cy=Math.cos(y), sz=Math.sin(z), cz=Math.cos(z);
    return function (p) {
      const ay=p[1]*cx-p[2]*sx, az=p[1]*sx+p[2]*cx;
      const bx=p[0]*cy+az*sy, bz=-p[0]*sy+az*cy;
      return [bx*cz-ay*sz, bx*sz+ay*cz, bz];
    };
  }

  // A closed (2,3) torus knot. Its Frenet frame and periodic ribbon twist
  // both close at 2π, including throughout every mode interpolation.
  function section(t, p, breath) {
    const c2=Math.cos(2*t), s2=Math.sin(2*t), c3=Math.cos(3*t), s3=Math.sin(3*t);
    const r=p.radius+p.lobe*c3, dr=-3*p.lobe*s3, ddr=-9*p.lobe*c3;
    const center=[r*c2, r*s2, p.rise*s3];
    const tangent=norm([dr*c2-2*r*s2, dr*s2+2*r*c2, 3*p.rise*c3]);
    const second=[(ddr-4*r)*c2-4*dr*s2, (ddr-4*r)*s2+4*dr*c2, -9*p.rise*s3];
    const binormal=norm(cross(tangent, second));
    const normal=norm(cross(binormal, tangent));
    const phi=p.twist+p.wave*Math.sin(3*t+breath);
    const across=add(mul(normal, Math.cos(phi)), mul(binormal, Math.sin(phi)));
    const face=norm(cross(tangent, across));
    const width=p.width*(1+.13*Math.cos(3*t-.6));
    return {center, tangent, across, face, width};
  }

  function pointOn(s, u, camber) {
    return add(add(s.center, mul(s.across, u*s.width)), mul(s.face, camber*(1-u*u)));
  }

  function normalOn(s, u, camber) {
    return norm(cross(s.tangent, sub(mul(s.across, s.width), mul(s.face, 2*camber*u))));
  }

  function metal(n, depth, body) {
    // An analytic studio environment: one wide softbox, a narrow strip light,
    // a dark reflection band and the edge reflection of a brushed metal sheet.
    if (n[2]<0) n=mul(n, -1);
    const diffuse=Math.max(0, dot(n, LIGHT));
    const specular=Math.pow(Math.max(0, dot(n, HALF)), 24);
    const strip=Math.exp(-Math.pow((n[0]+.22)/.24, 2));
    const softbox=Math.exp(-Math.pow((n[1]-.30)/.30, 2));
    const darkBand=Math.exp(-Math.pow((n[1]+.34)/.17, 2));
    const rim=Math.pow(1-Math.abs(n[2]), 2.4);
    let value=19+42*diffuse+108*strip+76*softbox+114*specular+47*rim-34*darkBand;
    value*=mix(.72, 1, body)*(1+depth*.025);
    return clamp(value, 13, 235);
  }

  function metalColor(value) {
    return `rgb(${Math.round(value*1.015)},${Math.round(value)},${Math.round(value*.97)})`;
  }

  function mount(canvas, options) {
    options=options || {};
    if (!canvas || typeof canvas.getContext!=='function') throw new TypeError('KineticScene.mount requires a canvas.');
    if (instances.has(canvas)) instances.get(canvas).destroy();
    const ctx=canvas.getContext('2d', {alpha:true, desynchronized:true});
    if (!ctx) return {setMode:function(){}, setPaused:function(){}, resetShape:function(){}, destroy:function(){}};

    const media=typeof global.matchMedia==='function' ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let reduced=options.reducedMotion===true || !!(media && media.matches);
    let destroyed=false, manualPause=false, visible=true, raf=0, last=0, time=0, spin=0;
    let width=0, height=0, dpr=1, scale=0, segments=144;
    let mode='flow', target=MODES.flow, params=Object.assign({}, target);
    const NODE_COUNT=96, CAMERA=10.5;
    const rest=Array.from({length:NODE_COUNT},()=>[0,0,0]);
    const displacement=Array.from({length:NODE_COUNT},()=>[0,0,0]);
    const velocity=Array.from({length:NODE_COUNT},()=>[0,0,0]);
    let pointer={x:0,y:0,inside:false,type:'mouse'}, physical={x:0,y:0};
    let translation={x:0,y:0,vx:0,vy:0}, grab=null, hitGeometry=[], view=null;
    const host=canvas.closest && canvas.closest('#home') || canvas;
    const previousCursor=canvas.style ? canvas.style.cursor : '';
    const previousTouchAction=canvas.style ? canvas.style.touchAction : '';
    if(canvas.style)canvas.style.touchAction='pan-y';
    let centerX=0, centerY=0;
    const cleanups=[];

    function listen(object, event, fn, opts) {
      object.addEventListener(event, fn, opts);
      cleanups.push(function(){ object.removeEventListener(event, fn, opts); });
    }

    function active() { return !destroyed && !manualPause && visible && !document.hidden && !reduced && width>0 && height>0; }
    function stop() { if(raf) global.cancelAnimationFrame(raf); raf=0; last=0; }
    function start() { if(active() && !raf) raf=global.requestAnimationFrame(tick); }
    function sync() { if(active()) start(); else stop(); }
    function inputFrame() { if(active()) start(); else if(!destroyed && visible && !document.hidden)draw(0,true); }

    function sample(array, parameter) {
      const position=((parameter%1+1)%1)*NODE_COUNT, i=Math.floor(position), f=position-i;
      return add(mul(array[i],1-f),mul(array[(i+1)%NODE_COUNT],f));
    }

    function pointerPosition(event) {
      const box=canvas.getBoundingClientRect();
      pointer.x=event.clientX-box.left;pointer.y=event.clientY-box.top;pointer.type=event.pointerType || 'mouse';
      pointer.inside=pointer.type!=='touch' || !!(grab && grab.active);
      if(canvas.style)canvas.style.cursor=pointer.type==='touch' ? previousCursor : (grab && grab.active ? 'grabbing' : 'grab');
    }

    function releaseGrab() {
      if(!grab)return;
      const id=grab.id;grab=null;
      canvas.dataset.held='false';
      try {if(canvas.hasPointerCapture && canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}catch(_){}
    }

    function unproject(x,y,depth) {
      const perspective=CAMERA/(CAMERA-depth);
      return view.inverse([(x-view.anchorX-translation.x)/(scale*perspective),
        -(y-view.anchorY-translation.y)/(scale*perspective),depth]);
    }

    function updateMould() {
      if(!grab || !grab.active || !grab.moved || !view)return;
      const center=section(grab.parameter*TAU,params,.18*Math.sin(time*.24)).center;
      const current=add(add(center,sample(displacement,grab.parameter)),grab.hitOffset);
      const depth=clamp(view.rotate(current)[2],-5,5);
      const desired=sub(sub(unproject(pointer.x,pointer.y,depth),center),grab.hitOffset);
      const delta=limit(sub(desired,grab.anchorOffset),2.4);
      for(let i=0;i<NODE_COUNT;i++)rest[i]=limit(add(grab.original[i],mul(delta,grab.weights[i])),2.2);
      canvas.dataset.shaped='true';
    }

    function integrate(dt,base,immediate) {
      const allowed=pointer.inside && (pointer.type!=='touch' || grab && grab.active);
      const tx=allowed ? clamp((pointer.x-width*.515)*.31,-width*.13,width*.13) : 0;
      const ty=allowed ? clamp((pointer.y-height*.495)*.31,-height*.13,height*.13) : 0;
      if(immediate) {
        translation.x=tx;translation.y=ty;translation.vx=translation.vy=0;
      } else if(dt>0) {
        translation.vx=clamp(translation.vx+((tx-translation.x)*36-translation.vx*10.7)*dt,-width*2,width*2);
        translation.vy=clamp(translation.vy+((ty-translation.y)*36-translation.vy*10.7)*dt,-height*2,height*2);
        translation.x=clamp(translation.x+translation.vx*dt,-width*.15,width*.15);
        translation.y=clamp(translation.y+translation.vy*dt,-height*.15,height*.15);
      }
      updateMould();
      const gravity=[];
      const radius=Math.min(width,height)*.35;
      for(let i=0;i<NODE_COUNT;i++) {
        const node=add(base[i].center,displacement[i]), world=view.rotate(node);
        const perspective=CAMERA/(CAMERA-clamp(world[2],-5,5));
        const sx=view.anchorX+translation.x+world[0]*perspective*scale;
        const sy=view.anchorY+translation.y-world[1]*perspective*scale;
        const dx=pointer.x-sx,dy=pointer.y-sy;
        const influence=allowed ? Math.exp(-(dx*dx+dy*dy)/(radius*radius)) : 0;
        const force=view.inverse([dx/(scale*perspective),-dy/(scale*perspective),.10]);
        gravity.push(limit(mul(force,.43*influence*(grab && grab.active ? .24 : 1)),.58));
      }
      if(immediate) {
        for(let i=0;i<NODE_COUNT;i++) {displacement[i]=limit(add(rest[i],gravity[i]),2.7);velocity[i]=[0,0,0];}
        return;
      }
      const steps=Math.max(1,Math.ceil(dt/.012)), h=dt/steps;
      for(let step=0;step<steps;step++) {
        const forces=[];
        for(let i=0;i<NODE_COUNT;i++) {
          const before=(i+NODE_COUNT-1)%NODE_COUNT,after=(i+1)%NODE_COUNT;
          const dynamic=sub(displacement[i],rest[i]);
          const lap=sub(add(sub(displacement[before],rest[before]),sub(displacement[after],rest[after])),mul(dynamic,2));
          const stiffness=grab && grab.active ? 72 : 39;
          forces.push(sub(add(mul(sub(add(rest[i],gravity[i]),displacement[i]),stiffness),mul(lap,13)),mul(velocity[i],grab && grab.active ? 15 : 10.4)));
        }
        for(let i=0;i<NODE_COUNT;i++) {
          velocity[i]=limit(add(velocity[i],mul(forces[i],h)),8);
          displacement[i]=limit(add(displacement[i],mul(velocity[i],h)),2.7);
        }
      }
    }

    function resize() {
      if(destroyed) return;
      const rect=canvas.getBoundingClientRect();
      width=Math.max(0, rect.width); height=Math.max(0, rect.height);
      dpr=Math.min(global.devicePixelRatio || 1, width<520 ? 1.5 : 2);
      const pixelWidth=Math.round(width*dpr), pixelHeight=Math.round(height*dpr);
      if(canvas.width!==pixelWidth || canvas.height!==pixelHeight) {
        canvas.width=pixelWidth; canvas.height=pixelHeight;
        ctx.setTransform(dpr,0,0,dpr,0,0);
      }
      segments=width<480 ? 112 : 144; // 224 or 288 depth-sorted face quads.
      scale=0;
      if(width && height) draw(0);
      sync();
    }

    function draw(dt,immediate) {
      if(destroyed || !width || !height) return;
      const ease=dt ? 1-Math.exp(-dt*4.3) : 1;
      for(const key of keys) params[key]=mix(params[key], target[key], ease);
      const spring=dt ? 1-Math.exp(-dt*3.1) : 1;
      physical.x=mix(physical.x,pointer.inside ? clamp((pointer.x/width-.5)*2,-1,1) : 0,spring);
      physical.y=mix(physical.y,pointer.inside ? clamp((pointer.y/height-.5)*2,-1,1) : 0,spring);
      const rot=rotation(params.rx+.09*Math.sin(time*.28)+physical.y*.025,
                         params.ry+.13*Math.sin(time*.23+.8)+physical.x*.035,
                         params.rz+spin+.045*Math.sin(time*.19));
      const samples=[], projected=[];
      let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
      const breath=.18*Math.sin(time*.24);
      const bases=Array.from({length:segments},(_,i)=>section(TAU*i/segments,params,breath));
      const physicsBase=Array.from({length:NODE_COUNT},(_,i)=>section(TAU*i/NODE_COUNT,params,breath));
      for(const s of bases)for(const u of [-1,1]) {
        const v=rot(pointOn(s,u,params.camber)),perspective=CAMERA/(CAMERA-v[2]);
        const x=v[0]*perspective,y=-v[1]*perspective;
        minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
      }
      // Fit only the undeformed reference. A user's mould must never be
      // cancelled by automatic recentering or scale compensation.
      const fit=Math.min(width*.76/(maxX-minX),height*.74/(maxY-minY));
      scale=scale ? mix(scale,fit,dt ? 1-Math.exp(-dt*2) : 1) : fit;
      const anchorX=width*.515-(minX+maxX)*scale*.5;
      const anchorY=height*.495-(minY+maxY)*scale*.5;
      const ex=rot([1,0,0]),ey=rot([0,1,0]),ez=rot([0,0,1]);
      view={rotate:rot,inverse:v=>[dot(v,ex),dot(v,ey),dot(v,ez)],anchorX,anchorY};
      integrate(dt,physicsBase,!!immediate);
      centerX=anchorX+translation.x;centerY=anchorY+translation.y;
      const centers=bases.map((s,i)=>add(s.center,sample(displacement,i/segments)));
      for(let i=0;i<=segments;i++) {
        const index=i%segments,base=bases[index];
        const tangent=norm(sub(centers[(index+1)%segments],centers[(index+segments-1)%segments]));
        let across=sub(base.across,mul(tangent,dot(base.across,tangent)));
        if(Math.hypot(...across)<.06)across=cross(base.face,tangent);
        across=norm(across);
        const s={center:centers[index],tangent,across,face:norm(cross(tangent,across)),width:base.width};
        const vertices=[], normals=[];
        for(let j=0;j<3;j++) {
          const u=j-1, v=rot(pointOn(s,u,params.camber));
          const perspective=CAMERA/(CAMERA-clamp(v[2],-5.5,5.5));
          const p=[v[0]*perspective,-v[1]*perspective,v[2]];
          vertices.push(p); normals.push(rot(normalOn(s,u,params.camber)));
        }
        samples.push({vertices,normals});
      }
      for(const sample of samples) projected.push(sample.vertices.map(v=>[centerX+v[0]*scale,centerY+v[1]*scale,v[2]]));

      const quads=[];
      for(let i=0;i<segments;i++) for(let j=0;j<2;j++) {
        const pts=[projected[i][j],projected[i+1][j],projected[i+1][j+1],projected[i][j+1]];
        const n=norm(add(add(samples[i].normals[j],samples[i].normals[j+1]),add(samples[i+1].normals[j],samples[i+1].normals[j+1])));
        quads.push({i,j,pts,n,z:(pts[0][2]+pts[1][2]+pts[2][2]+pts[3][2])*.25});
      }
      quads.sort((a,b)=>a.z-b.z);
      hitGeometry=quads;
      ctx.clearRect(0,0,width,height);
      ctx.lineJoin='round'; ctx.lineCap='round';

      const tracer=(time*.073 + .36)%1;
      for(const q of quads) {
        const p=q.pts;
        // Gouraud shading is represented by two analytical 2D gradients per
        // quad. Shared vertex luminance avoids a tiled/faceted reflection.
        const values=[metal(samples[q.i].normals[q.j],p[0][2],params.body),
          metal(samples[q.i+1].normals[q.j],p[1][2],params.body),
          metal(samples[q.i+1].normals[q.j+1],p[2][2],params.body),
          metal(samples[q.i].normals[q.j+1],p[3][2],params.body)];
        for(const ids of [[0,1,2],[0,2,3]]) {
          const a=p[ids[0]], b=p[ids[1]], c=p[ids[2]], ia=values[ids[0]], ib=values[ids[1]], ic=values[ids[2]];
          const dx1=b[0]-a[0], dy1=b[1]-a[1], dx2=c[0]-a[0], dy2=c[1]-a[1];
          const determinant=dx1*dy2-dy1*dx2;
          let fill=metalColor((ia+ib+ic)/3);
          if(Math.abs(determinant)>.01) {
            const gx=((ib-ia)*dy2-(ic-ia)*dy1)/determinant;
            const gy=(dx1*(ic-ia)-dx2*(ib-ia))/determinant;
            const magnitude=Math.hypot(gx,gy);
            if(magnitude>.01) {
              const ux=gx/magnitude, uy=gy/magnitude;
              const projections=[a,b,c].map(v=>v[0]*ux+v[1]*uy);
              const low=Math.min(...projections), high=Math.max(...projections);
              const perpendicular=-a[0]*uy+a[1]*ux;
              fill=ctx.createLinearGradient(ux*low-uy*perpendicular,uy*low+ux*perpendicular,
                                            ux*high-uy*perpendicular,uy*high+ux*perpendicular);
              fill.addColorStop(0,metalColor(clamp(ia+(low-projections[0])*magnitude,13,235)));
              fill.addColorStop(1,metalColor(clamp(ia+(high-projections[0])*magnitude,13,235)));
            }
          }
          ctx.fillStyle=fill;
          const mx=(a[0]+b[0]+c[0])/3, my=(a[1]+b[1]+c[1])/3;
          ctx.beginPath();
          [a,b,c].forEach((v,k)=>{
            const angle=Math.atan2(v[1]-my,v[0]-mx), x=v[0]+Math.cos(angle)*.23, y=v[1]+Math.sin(angle)*.23;
            if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
          });
          ctx.closePath();ctx.fill();
          ctx.strokeStyle=fill;ctx.lineWidth=.65;ctx.stroke();
        }

        // Contours belong to their face and are occluded by nearer geometry.
        ctx.lineWidth=.48;
        ctx.strokeStyle=`rgba(231,227,219,${.05+params.contour*.105})`;
        for(const u of [.26,.56,.82]) {
          ctx.beginPath();
          ctx.moveTo(mix(p[0][0],p[3][0],u),mix(p[0][1],p[3][1],u));
          ctx.lineTo(mix(p[1][0],p[2][0],u),mix(p[1][1],p[2][1],u));
          ctx.stroke();
        }
        const edge=q.j===0 ? [p[0],p[1]] : [p[3],p[2]];
        const rim=Math.pow(1-Math.abs(q.n[2]),2);
        ctx.strokeStyle=`rgba(231,227,219,${.19+.43*rim})`; ctx.lineWidth=.65+rim*.35;
        ctx.beginPath();ctx.moveTo(edge[0][0],edge[0][1]);ctx.lineTo(edge[1][0],edge[1][1]);ctx.stroke();
        if(params.contour>.5 && q.i%8===0) {
          ctx.strokeStyle=`rgba(231,227,219,${(params.contour-.5)*.25})`;ctx.lineWidth=.5;
          ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);ctx.lineTo(p[3][0],p[3][1]);ctx.stroke();
        }
        // One short ember signal, with a second delayed echo in Signal mode.
        const at=q.i/segments, distance=(at-tracer+1)%1;
        const echo=(at-tracer-.48+2)%1;
        const hot=Math.max(distance<.063 ? Math.sin(distance/.063*Math.PI) : 0,
                           params.tracer>1.25 && echo<.033 ? Math.sin(echo/.033*Math.PI)*.65 : 0);
        if(q.j===0 && hot>.015) {
          const u=.20, alpha=clamp(hot*params.tracer*.95,0,.98);
          ctx.strokeStyle=`rgba(255,106,53,${alpha})`;ctx.lineWidth=1.15+hot*.55;
          ctx.beginPath();
          ctx.moveTo(mix(p[0][0],p[3][0],u),mix(p[0][1],p[3][1],u));
          ctx.lineTo(mix(p[1][0],p[2][0],u),mix(p[1][1],p[2][1],u));ctx.stroke();
        }
      }
      if(pointer.inside && pointer.x>0 && pointer.x<width && pointer.y>0 && pointer.y<height) {
        const r=grab && grab.active ? 11 : 7.5;
        ctx.beginPath();ctx.arc(pointer.x,pointer.y,r,0,TAU);ctx.fillStyle='#08090B';ctx.fill();
        ctx.lineWidth=.65;ctx.strokeStyle='rgba(231,227,219,.44)';ctx.stroke();
        ctx.beginPath();ctx.ellipse(pointer.x,pointer.y,r*2.1,r*.68,-.42,0,TAU);
        ctx.lineWidth=.8;ctx.strokeStyle=grab && grab.active ? 'rgba(255,106,53,.85)' : 'rgba(255,106,53,.48)';ctx.stroke();
        ctx.beginPath();ctx.arc(pointer.x,pointer.y,r*1.48,time*.45,time*.45+1.32);
        ctx.lineWidth=.65;ctx.strokeStyle='rgba(255,106,53,.7)';ctx.stroke();
      }
    }

    function tick(stamp) {
      raf=0;
      if(!active()) { last=0;return; }
      // At most 60 paints per second, including high refresh-rate monitors.
      if(last && stamp-last<15) { raf=global.requestAnimationFrame(tick);return; }
      const dt=last ? Math.min((stamp-last)/1000,.045) : 1/60;
      last=stamp;time+=dt;spin+=dt*params.speed;
      draw(dt);raf=global.requestAnimationFrame(tick);
    }

    function updateReduced() {
      reduced=options.reducedMotion===true || !!(media && media.matches);
      if(reduced) {pointer.inside=false;params=Object.assign({},target);draw(0,true);}
      sync();
    }

    function insideTriangle(x,y,a,b,c) {
      const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
      if(Math.abs(area)<.015)return false;
      const sign=(p,q)=>(x-q[0])*(p[1]-q[1])-(p[0]-q[0])*(y-q[1]);
      const one=sign(a,b),two=sign(b,c),three=sign(c,a);
      return !((one<0 || two<0 || three<0) && (one>0 || two>0 || three>0));
    }

    function hitTest(x,y) {
      for(let i=hitGeometry.length-1;i>=0;i--) {
        const q=hitGeometry[i],p=q.pts;
        if(!insideTriangle(x,y,p[0],p[1],p[2]) && !insideTriangle(x,y,p[0],p[2],p[3]))continue;
        const ax=(p[0][0]+p[3][0])*.5,ay=(p[0][1]+p[3][1])*.5;
        const dx=(p[1][0]+p[2][0])*.5-ax,dy=(p[1][1]+p[2][1])*.5-ay;
        const fraction=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy || 1),0,1);
        return {parameter:(q.i+fraction)/segments,depth:q.z};
      }
      return null;
    }

    function captureGrab() {
      if(!grab)return;
      grab.active=true;pointer.inside=true;
      canvas.dataset.held='true';
      try {if(canvas.setPointerCapture)canvas.setPointerCapture(grab.id);}catch(_){}
    }

    listen(canvas,'pointerdown',function(event){
      if(destroyed || grab || !view || event.button!==undefined && event.button!==0)return;
      pointerPosition(event);
      const hit=hitTest(pointer.x,pointer.y);
      if(!hit) {inputFrame();return;}
      const anchor=sample(displacement,hit.parameter);
      const center=section(hit.parameter*TAU,params,.18*Math.sin(time*.24)).center;
      const weights=Array.from({length:NODE_COUNT},(_,i)=>{
        const d=Math.abs(i/NODE_COUNT-hit.parameter),wrapped=Math.min(d,1-d);
        return Math.exp(-.5*Math.pow(wrapped/.075,2));
      });
      grab={id:event.pointerId,parameter:hit.parameter,active:false,moved:false,startX:event.clientX,startY:event.clientY,
        original:rest.map(v=>v.slice()),anchorOffset:anchor,
        hitOffset:sub(sub(unproject(pointer.x,pointer.y,hit.depth),center),anchor),weights};
      if(event.pointerType!=='touch') {captureGrab();if(event.cancelable)event.preventDefault();}
      inputFrame();
    },{passive:false});

    listen(host,'pointermove',function(event){
      if(grab && event.pointerId!==grab.id)return;
      if(event.pointerType==='touch' && !grab)return;
      pointerPosition(event);
      if(grab && Math.hypot(event.clientX-grab.startX,event.clientY-grab.startY)>2)grab.moved=true;
      if(grab && !grab.active) {
        const dx=event.clientX-grab.startX,dy=event.clientY-grab.startY;
        if(Math.abs(dy)>9 && Math.abs(dy)>Math.abs(dx)*1.15) {releaseGrab();pointer.inside=false;inputFrame();return;}
        if(Math.abs(dx)>7 && Math.abs(dx)>Math.abs(dy)*1.12)captureGrab();
      }
      if(grab && grab.active && event.pointerType==='touch' && event.cancelable)event.preventDefault();
      inputFrame();
    },{passive:false});

    function endGrab(event) {
      if(!grab || event.pointerId!==grab.id)return;
      if(grab.active && event.type!=='pointercancel') {pointerPosition(event);updateMould();}
      releaseGrab();
      if(event.pointerType==='touch')pointer.inside=false;
      inputFrame();
    }
    listen(canvas,'pointerup',endGrab,{passive:true});
    listen(canvas,'pointercancel',endGrab,{passive:true});
    listen(canvas,'lostpointercapture',function(event){
      if(grab && event.pointerId===grab.id) {grab=null;inputFrame();}
    },{passive:true});
    listen(host,'pointerleave',function(){
      if(!grab) {pointer.inside=false;if(canvas.style)canvas.style.cursor=previousCursor;inputFrame();}
    },{passive:true});
    listen(global,'blur',function(){releaseGrab();pointer.inside=false;inputFrame();});
    listen(document,'visibilitychange',sync);
    if(media) {
      if(media.addEventListener) listen(media,'change',updateReduced);
      else if(media.addListener) {media.addListener(updateReduced);cleanups.push(()=>media.removeListener(updateReduced));}
    }
    const ro=typeof global.ResizeObserver==='function' ? new global.ResizeObserver(resize) : null;
    if(ro) ro.observe(canvas); else listen(global,'resize',resize,{passive:true});
    const io=typeof global.IntersectionObserver==='function' ? new global.IntersectionObserver(function(entries){
      const entry=entries[entries.length-1];visible=entry.isIntersecting;sync();
    },{rootMargin:'60px',threshold:0}) : null;
    if(io)io.observe(canvas);

    const api={
      setMode:function(next){
        if(destroyed || !Object.prototype.hasOwnProperty.call(MODES,next))return false;
        releaseGrab();
        mode=next;target=MODES[next];
        if(!active()) {params=Object.assign({},target);draw(0,true);} else start();
        return true;
      },
      setPaused:function(value){manualPause=!!value;sync();},
      resetShape:function(){
        if(destroyed)return;
        releaseGrab();pointer.inside=false;
        for(let i=0;i<NODE_COUNT;i++) {rest[i]=[0,0,0];velocity[i]=[0,0,0];if(!active())displacement[i]=[0,0,0];}
        translation.vx=translation.vy=0;
        canvas.dataset.shaped='false';
        inputFrame();
      },
      destroy:function(){
        if(destroyed)return;
        releaseGrab();
        destroyed=true;stop();if(ro)ro.disconnect();if(io)io.disconnect();
        if(canvas.style) {canvas.style.cursor=previousCursor;canvas.style.touchAction=previousTouchAction;}
        cleanups.forEach(fn=>fn());ctx.clearRect(0,0,width,height);instances.delete(canvas);
      }
    };
    instances.set(canvas,api);resize();return api;
  }

  global.KineticScene=Object.freeze({mount});
})(window);

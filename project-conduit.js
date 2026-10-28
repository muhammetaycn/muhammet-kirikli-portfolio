(() => {
  'use strict';
  const mounted=new WeakMap(),ns='http://www.w3.org/2000/svg';
  let serial=0;
  function vector(tag,attributes={}){const node=document.createElementNS(ns,tag);Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,String(value)));return node;}
  function mount({root,canMove=()=>true}={}){
    if(!root)return {setPaused(){},setSelected(){},destroy(){}};
    if(mounted.has(root))return mounted.get(root);
    const buttons=[...root.querySelectorAll('[data-open-project]')],media=matchMedia('(prefers-reduced-motion: reduce)'),cleanups=[];
    if(!buttons.length)return {setPaused(){},setSelected(){},destroy(){}};
    let destroyed=false,paused=false,visible=true,frame=0,selected=-1;
    const svg=vector('svg',{'aria-hidden':'true',focusable:'false',class:'conduit-drawing'}),defs=vector('defs'),gradient=vector('linearGradient',{id:'conduit-metal-'+ ++serial,x1:'0%',y1:'0%',x2:'0%',y2:'100%'});
    [[0,'#f0e8d8'],[.2,'#c6bba5'],[.48,'#8c8271'],[.61,'#d9ceb8'],[1,'#6d665a']].forEach(([offset,color])=>gradient.append(vector('stop',{offset,'stop-color':color})));
    defs.append(gradient);svg.append(defs);
    const trunk=vector('g',{class:'conduit-trunk'}),shadow=vector('path',{class:'conduit-cable-shadow'}),body=vector('path',{class:'conduit-cable',stroke:`url(#${gradient.id})`}),seam=vector('path',{class:'conduit-cable-seam'}),live=vector('path',{class:'conduit-current',pathLength:1});
    trunk.append(shadow,body,seam,live);svg.append(trunk);
    const branches=buttons.map((button,index)=>{
      const group=vector('g',{class:'conduit-branch','data-conduit-port':index}),under=vector('path',{class:'conduit-route-bed'}),route=vector('path',{class:'conduit-route',pathLength:1}),port=vector('circle',{class:'conduit-port',r:5.5}),contact=vector('circle',{class:'conduit-contact',r:1.8});
      group.append(under,route,port,contact);svg.append(group);
      return {button,group,under,route,port,contact};
    });
    root.prepend(svg);root.classList.add('has-conduit');
    function listen(node,type,fn,options){node.addEventListener(type,fn,options);cleanups.push(()=>node.removeEventListener(type,fn,options));}
    function active(){return !destroyed&&!paused&&!media.matches&&!document.hidden&&visible&&Boolean(canMove())&&!document.querySelector('dialog[open]');}
    function highlight(index){
      root.dataset.conduitPort=String(index);
      for(let i=0;i<branches.length;i++)branches[i].group.classList.toggle('is-selected',i===index);
    }
    function paint(){
      frame=0;if(!active())return;
      const box=root.getBoundingClientRect(),height=window.innerHeight||800;
      const progress=Math.max(0,Math.min(1,(height-box.top)/(height+box.height)));
      live.style.strokeDashoffset=String(1-progress);
      for(let i=0;i<branches.length;i++)branches[i].route.style.strokeDashoffset=String(Math.max(0,1-progress*1.65));
    }
    function request(){if(active()&&!frame)frame=requestAnimationFrame(paint);}
    function update(){
      if(destroyed)return;
      root.classList.toggle('is-conduit-still',!active());
      if(!active()){if(frame)cancelAnimationFrame(frame);frame=0;return;}
      request();
    }
    function layout(){
      if(destroyed)return;
      const box=root.getBoundingClientRect(),w=box.width,h=box.height;
      if(!w||!h)return;
      svg.setAttribute('viewBox',`0 0 ${w.toFixed(2)} ${h.toFixed(2)}`);
      const mobile=(window.innerWidth||w)<=760,jx=w*.5,jy=mobile?105:133;
      // An eyelet folds back over itself before it fans into the project contacts.
      const d=mobile?`M ${w*.75} -20 C ${w*.78} 35 ${w*.61} 72 ${w*.38} 61 C ${w*.12} 48 ${w*.24} -10 ${w*.46} 12 C ${w*.66} 32 ${w*.69} 96 ${jx} ${jy}`:`M ${w*.84} -22 C ${w*.85} 73 ${w*.64} 109 ${w*.4} 83 C ${w*.2} 60 ${w*.31} -7 ${w*.49} 17 C ${w*.68} 42 ${w*.68} 118 ${jx} ${jy}`;
      [shadow,body,seam,live].forEach(path=>path.setAttribute('d',d));
      for(let i=0;i<branches.length;i++){
        const item=branches[i],b=item.button.getBoundingClientRect(),x=b.left+b.width*.5-box.left,y=b.top-box.top-12;
        const shoulder=mobile?Math.max(jy+8,y-28):jy+22;
        const edge=i===2?10:w-10;
        const route=mobile&&i>=2?`M ${jx} ${jy} C ${jx} ${jy+16} ${edge} ${jy+4} ${edge} ${jy+45} L ${edge} ${y-16} Q ${edge} ${y} ${x} ${y}`:`M ${jx} ${jy} C ${jx} ${shoulder} ${x} ${shoulder} ${x} ${y}`;
        item.under.setAttribute('d',route);item.route.setAttribute('d',route);
        for(const circle of [item.port,item.contact]){circle.setAttribute('cx',x);circle.setAttribute('cy',y);}
      }
      root.dataset.conduitReady='true';request();
    }
    branches.forEach((item,index)=>{
      listen(item.button,'pointerenter',event=>{if(event.pointerType==='mouse')highlight(index);});
      listen(item.button,'pointerleave',()=>{if(document.activeElement!==item.button)highlight(selected);});
      listen(item.button,'focus',()=>highlight(index));
      listen(item.button,'blur',()=>highlight(selected));
      listen(item.button,'click',()=>{selected=index;highlight(index);});
    });
    listen(window,'scroll',request,{passive:true});listen(window,'resize',layout,{passive:true});listen(document,'visibilitychange',update);
    if(media.addEventListener)listen(media,'change',()=>{layout();update();});
    const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{rootMargin:'120px 0px'}):null;
    observer?.observe(root);
    const resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(layout):null;resizeObserver?.observe(root);
    const api={
      setPaused(value){if(destroyed)return;paused=Boolean(value);update();},
      setSelected(index){if(destroyed)return;selected=Number.isInteger(index)&&index>=0&&index<buttons.length?index:-1;highlight(selected);},
      destroy(){if(destroyed)return;destroyed=true;if(frame)cancelAnimationFrame(frame);observer?.disconnect();resizeObserver?.disconnect();cleanups.forEach(fn=>fn());svg.remove();root.classList.remove('has-conduit','is-conduit-still');delete root.dataset.conduitReady;delete root.dataset.conduitPort;mounted.delete(root);}
    };
    mounted.set(root,api);layout();update();return api;
  }
  window.ProjectConduit=Object.freeze({mount});
})();

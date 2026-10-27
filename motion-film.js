(() => {
  'use strict';
  const SVG='http://www.w3.org/2000/svg';
  function mount({canMove=()=>true}={}) {
    const layer=document.createElement('div'),poster=document.createElement('img'),video=document.createElement('video');
    layer.className='motion-film';layer.setAttribute('aria-hidden','true');
    poster.className='motion-film-poster';poster.alt='';poster.decoding='async';poster.src=new URL('assets/motion/suspended-poster.svg',document.baseURI).href;
    video.className='motion-film-video';video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.poster=poster.src;video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('tabindex','-1');
    layer.append(poster,video);document.body.insertBefore(layer,document.body.firstChild);
    const hadClass=document.body.classList.contains('has-motion-film');document.body.classList.add('has-motion-film');
    const media=window.matchMedia('(prefers-reduced-motion: reduce)'),cleanups=[],headings=[],textEdits=[];
    const darkSections=[...document.querySelectorAll('.hero')],visibleSections=new Set();
    let destroyed=false,paused=false,visible=typeof IntersectionObserver!=='function'||darkSections.length===0,playGeneration=0,playRequested=false,failed=false,loaded=false,headingObserver=null,visibilityObserver=null;
    function listen(node,type,fn){node.addEventListener(type,fn);cleanups.push(()=>node.removeEventListener(type,fn));}
    function eligible(){return !destroyed&&!paused&&!media.matches&&!document.hidden&&visible&&!document.querySelector('dialog[open]')&&Boolean(canMove());}
    function settleHeadings(){headings.forEach(entry=>{entry.node.classList.add('is-film-revealed');entry.node.dataset.filmReady='false';});headingObserver?.disconnect();}
    function stopVideo(){playGeneration++;playRequested=false;try{video.pause();}catch{}}
    function sync(){
      if(destroyed)return;
      layer.classList.toggle('is-reduced',media.matches);layer.dataset.paused=String(!eligible());
      if(!eligible()){stopVideo();if(paused||media.matches||!canMove())settleHeadings();return;}
      if(failed||playRequested)return;
      if(!loaded){video.src=new URL('assets/motion/suspended-ribbons.webm',document.baseURI).href;video.preload='metadata';loaded=true;}
      const token=++playGeneration;playRequested=true;
      try{
        Promise.resolve(video.play()).then(()=>{
          if(destroyed||token!==playGeneration)return;
          if(!eligible()){stopVideo();return;}
          layer.classList.add('is-film-playing');layer.dataset.playback='playing';
        },()=>{if(!destroyed&&token===playGeneration){playRequested=false;failed=true;layer.dataset.playback='poster';layer.classList.remove('is-film-playing');}});
      }catch{playRequested=false;failed=true;layer.dataset.playback='poster';layer.classList.remove('is-film-playing');}
    }
    function collectText(node,list){
      for(const child of [...node.childNodes]){
        if(child.nodeType===3){if(/\S/u.test(child.textContent))list.push(child);}
        else if(child.nodeType===1&&child.namespaceURI!==SVG&&!child.matches('script,style,[aria-hidden="true"]'))collectText(child,list);
      }
    }
    const sectionHeadings=new Set(['work-title']);
    for(const heading of document.querySelectorAll('main h2[id]')){
      if(!sectionHeadings.has(heading.id)||heading.closest('dialog,[hidden],.cos-screen'))continue;
      const texts=[],entry={node:heading,hadClass:heading.classList.contains('film-heading'),hadRevealed:heading.classList.contains('is-film-revealed'),ready:heading.getAttribute('data-film-ready'),words:heading.getAttribute('data-film-words')};
      collectText(heading,texts);let wordIndex=0;
      for(const text of texts){
        const parent=text.parentNode,marker=document.createComment('film-text'),tokens=[],fragment=document.createDocumentFragment();parent.insertBefore(marker,text);
        for(const token of text.textContent.split(/(\s+)/u)){
          if(!token)continue;
          if(/^\s+$/u.test(token)){const space=document.createTextNode(token);tokens.push(space);fragment.append(space);continue;}
          const mask=document.createElement('span'),word=document.createElement('span');mask.className='film-word';word.className='film-word-inner';word.textContent=token;word.style.setProperty('--film-delay',Math.min(wordIndex*55,385)+'ms');wordIndex++;mask.append(word);tokens.push(mask);fragment.append(mask);
        }
        parent.insertBefore(fragment,text);text.remove();textEdits.push({parent,marker,text,tokens});
      }
      if(wordIndex){heading.classList.add('film-heading');heading.dataset.filmWords=String(wordIndex);headings.push(entry);}
    }
    if(typeof IntersectionObserver==='function'&&!paused&&!media.matches&&!document.hidden&&Boolean(canMove())){
      headingObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-film-revealed');headingObserver.unobserve(entry.target);}},{threshold:.15,rootMargin:'0px 0px -3% 0px'});
      headings.forEach(({node})=>{node.dataset.filmReady='true';headingObserver.observe(node);});
    }else settleHeadings();
    if(typeof IntersectionObserver==='function'&&darkSections.length){
      // The fixed header covers the first 94px; sections behind it cannot show the film.
      visibilityObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)visibleSections.add(entry.target);else visibleSections.delete(entry.target);}visible=visibleSections.size>0;sync();},{threshold:0,rootMargin:'-96px 0px 0px 0px'});darkSections.forEach(section=>visibilityObserver.observe(section));
    }
    listen(document,'visibilitychange',sync);
    listen(video,'playing',()=>{if(!eligible())stopVideo();});
    listen(video,'error',()=>{failed=true;stopVideo();layer.dataset.playback='poster';layer.classList.remove('is-film-playing');});
    if(media.addEventListener)listen(media,'change',sync);
    else if(media.addListener){media.addListener(sync);cleanups.push(()=>media.removeListener(sync));}
    let dialogObserver=null;
    if(typeof MutationObserver==='function'){dialogObserver=new MutationObserver(sync);dialogObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});}
    sync();
    return {
      setPaused(value){if(destroyed)return;paused=Boolean(value);sync();},
      destroy(){
        if(destroyed)return;destroyed=true;stopVideo();cleanups.splice(0).forEach(remove=>remove());headingObserver?.disconnect();visibilityObserver?.disconnect();dialogObserver?.disconnect();
        for(const edit of textEdits){if(!edit.marker.parentNode)continue;edit.marker.parentNode.insertBefore(edit.text,edit.marker);edit.tokens.forEach(token=>token.remove());edit.marker.remove();}
        headings.forEach(entry=>{if(!entry.hadClass)entry.node.classList.remove('film-heading');if(!entry.hadRevealed)entry.node.classList.remove('is-film-revealed');if(entry.ready===null)entry.node.removeAttribute('data-film-ready');else entry.node.setAttribute('data-film-ready',entry.ready);if(entry.words===null)entry.node.removeAttribute('data-film-words');else entry.node.setAttribute('data-film-words',entry.words);});
        video.removeAttribute('src');try{video.load();}catch{}layer.remove();if(!hadClass)document.body.classList.remove('has-motion-film');
      }
    };
  }
  window.MotionFilm=Object.freeze({mount});
})();

(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const mounted = new WeakMap();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function element(name, className, text) {
    const node = document.createElement(name);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function vector(name, attributes) {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attributes || {})) node.setAttribute(key, String(value));
    return node;
  }
  function luci() {
    const svg = vector('svg', {viewBox: '0 0 112 112', class: 'narrator-luci', 'aria-hidden': 'true'});
    const tail = vector('g', {class: 'luci-tail'});
    const curl = 'M 35 75 C 7 84, 3 57, 15 49 C 26 42, 32 53, 23 58';
    tail.append(vector('path', {d: curl, fill: 'none', stroke: '#8b8781', 'stroke-opacity': '.65', 'stroke-width': '7', 'stroke-linecap': 'round'}));
    tail.append(vector('path', {d: curl, fill: 'none', stroke: '#050506', 'stroke-width': '4.6', 'stroke-linecap': 'round'}));
    tail.append(vector('path', {d: 'M 20 50 L 30 56 L 19 64 Z', class: 'luci-outline'}));
    svg.append(tail);
    const legs = vector('g', {class: 'luci-legs'});
    legs.append(vector('path', {d: 'M 39 78 L 34 96 L 25 100 Q 21 103 29 104 L 41 103 L 48 84 M 56 82 L 57 98 L 65 102 Q 69 105 60 105 L 50 103 L 48 84', class: 'luci-outline'}));
    svg.append(legs);
    svg.append(vector('path', {d: 'M 31 49 C 25 40 25 29 30 22 L 40 32 C 44 29 49 28 53 29 L 61 17 Q 66 22 64 35 C 69 39 70 44 69 49 L 79 52 Q 85 55 78 59 L 69 61 C 74 72 69 84 59 88 C 43 94 29 85 29 72 C 27 63 29 55 31 49 Z', class: 'luci-outline'}));
    const eye = vector('g', {class: 'luci-eye'});
    eye.append(vector('ellipse', {cx: 51, cy: 47, rx: '12.5', ry: '15.5', fill: '#e7e3db'}));
    const pupil = vector('ellipse', {cx: 54, cy: 47, rx: '3', ry: '8.5', fill: '#050506', class: 'luci-pupil'});
    eye.append(pupil);
    svg.append(eye);
    svg.append(vector('path', {d: 'M 65 61 Q 71 63 77 58 M 70 62 L 71 66 L 74 61', fill: 'none', stroke: '#e7e3db', 'stroke-width': '1.3', 'stroke-linecap': 'round', class: 'luci-mouth'}));
    const arm = vector('g', {class: 'luci-arm'});
    arm.append(vector('path', {d: 'M 62 72 Q 71 76 79 73 L 84 69 M 79 73 L 85 74 M 79 73 L 82 78', fill: 'none', stroke: '#9a958b', 'stroke-width': '1.5', 'stroke-linecap': 'round'}));
    svg.append(arm);
    return {svg, pupil};
  }




  const GLYPHS = {
    A:['01110','10001','10001','11111','10001','10001','10001'], B:['11110','10001','10001','11110','10001','10001','11110'],
    C:['01111','10000','10000','10000','10000','10000','01111'], D:['11110','10001','10001','10001','10001','10001','11110'],
    E:['11111','10000','10000','11110','10000','10000','11111'], F:['11111','10000','10000','11110','10000','10000','10000'],
    G:['01111','10000','10000','10111','10001','10001','01111'], H:['10001','10001','10001','11111','10001','10001','10001'],
    I:['11111','00100','00100','00100','00100','00100','11111'], J:['00111','00010','00010','00010','10010','10010','01100'],
    K:['10001','10010','10100','11000','10100','10010','10001'], L:['10000','10000','10000','10000','10000','10000','11111'],
    M:['10001','11011','10101','10101','10001','10001','10001'], N:['10001','11001','11001','10101','10011','10011','10001'],
    O:['01110','10001','10001','10001','10001','10001','01110'], P:['11110','10001','10001','11110','10000','10000','10000'],
    Q:['01110','10001','10001','10001','10101','10010','01101'], R:['11110','10001','10001','11110','10100','10010','10001'],
    S:['01111','10000','10000','01110','00001','00001','11110'], T:['11111','00100','00100','00100','00100','00100','00100'],
    U:['10001','10001','10001','10001','10001','10001','01110'], V:['10001','10001','10001','10001','10001','01010','00100'],
    W:['10001','10001','10001','10101','10101','11011','10001'], X:['10001','10001','01010','00100','01010','10001','10001'],
    Y:['10001','10001','01010','00100','00100','00100','00100'], Z:['11111','00001','00010','00100','01000','10000','11111'],
    '0':['01110','10011','10101','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],
    '2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],
    '4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],
    '6':['01111','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],
    '8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','11110'],
    '+':['00000','00100','00100','11111','00100','00100','00000']
  };
  const COMPACT = {
    A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['011','100','100','100','011'],D:['110','101','101','101','110'],
    E:['111','100','110','100','111'],F:['111','100','110','100','100'],G:['011','100','101','101','011'],H:['101','101','111','101','101'],
    I:['111','010','010','010','111'],J:['011','001','001','101','010'],K:['101','101','110','101','101'],L:['100','100','100','100','111'],
    M:['101','111','111','101','101'],N:['101','111','111','111','101'],O:['010','101','101','101','010'],P:['110','101','110','100','100'],
    Q:['010','101','101','111','011'],R:['110','101','110','101','101'],S:['011','100','010','001','110'],T:['111','010','010','010','010'],
    U:['101','101','101','101','111'],V:['101','101','101','101','010'],W:['101','101','111','111','101'],X:['101','101','010','101','101'],
    Y:['101','101','010','010','010'],Z:['111','001','010','100','111']
  };
  const COLORS = [
    {body:'#050506',ink:'#ff6a35',name:'siyah'}, {body:'#5865F2',ink:'#5865F2',name:'mavi'},
    {body:'#3c9b94',ink:'#4eb6aa',name:'teal'}, {body:'#b88432',ink:'#d4a34f',name:'amber'}, {body:'#b46a87',ink:'#ca819d',name:'rose'}
  ];
  const FADE_MS = 1600;
  const transliterate = value => String(value).replace(/[ıİ]/g,'I').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  const STOP = new Set(['VE','BIR','BU','ICIN','ILE','DA','DE','DAHA','SONRA','GIBI','OLAN','AYNI','BUNU','ADIMINI','ADIMI','UZERINDE','ICINDE','CALISMASINDA']);
  function keywords(value) {
    const separated=String(value).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2');
    const words = transliterate(separated).match(/[A-Z0-9+]+/g) || [];
    return words.filter((word,index) => word.length>1 && word.length<=13 && !STOP.has(word) && words.indexOf(word)===index).slice(0,4);
  }
  function narrativeBank() {
    const portfolio = window.PORTFOLIO || {};
    const bank = [
      {text:'ben Muhammet Kırıklı. Önce tanışalım.', words:['BEN','MUHAMMET','KIRIKLI']},
      {text:'Tekstil sahasındaki deneyimimi dijital sistemlere bağlıyorum.', words:['TEKSTIL','DIJITAL','SISTEM']},
      {text:'Bir fotoğraf QR ile geliyor; onaydan sonra sahneye ulaşıyor.', words:['QR','FOTOGRAF','ONAY','SAHNE']},
      {text:'Topluluk botunda bir olay, doğru kuraldan geçip role bağlanıyor.',words:['OLAY','KURAL','ROL']},
      {text:'İçerik otomasyonunda araştırma, taslak ve zamanlamayı aynı akışta tutuyorum.',words:['ARASTIRMA','TASLAK','ZAMANLAMA']},
      {text:'TekstilOS prototipinde sipariş formundan panoya uzanan akışı deniyorum.',words:['TEKSTILOS','SIPARIS','PANO']},
      {text:'GÖRGEZ’de yer ve rota verileri, doğrulamadan sonra haritaya ulaşıyor.',words:['GORGEZ','VERI','HARITA']},
      {text:'Bu yüzeyi tutup bükerken, hareketi arayüzün parçası olarak deniyorum.',words:['DOKUN','SEKIL','HAREKET']}
    ];
    // Source facts stay attached to their project and stage. These are varied
    // viewpoints on actual content, rather than a generated list of new claims.
    const views = [
      (p,s,n)=>`${p}: ${n}. adım «${s}».`,
      (p,s)=>`${p} akışında şimdi «${s}» var.`,
      (p,s)=>`${p} için notum: «${s}».`,
      (p,s)=>`${p} çalışmasında «${s}» adımını inceliyorum.`,
      (p,s)=>`${p} üzerinde «${s}» bağlantısına dönüyorum.`,
      (p,s)=>`${p} akışını «${s}» üzerinden okuyorum.`,
      (p,s)=>`${p} içinde bugün odak noktam «${s}».`,
      (p,s)=>`${p} için «${s}» adımının yerini düşünüyorum.`,
      (p,s)=>`${p}: bu kez «${s}» bölümüne bakıyorum.`,
      (p,s)=>`${p} notlarımda sıradaki başlık «${s}».`,
      (p,s)=>`${p} çalışmasını «${s}» noktasında durdurup inceliyorum.`,
      (p,s)=>`${p} içinde «${s}» adımına biraz daha yakından bakıyorum.`,
      (p,s)=>`${p}: «${s}» ile akışın bir parçasını takip ediyorum.`,
      (p,s)=>`${p} üzerinde düşünürken «${s}» adımına geliyorum.`,
      (p,s)=>`${p} taslağında «${s}» başlığını açıyorum.`,
      (p,s)=>`${p} için önümdeki adım «${s}».`,
      (p,s)=>`${p} akışının bu durağı: «${s}».`,
      (p,s)=>`${p} notu — şu an «${s}» bölümündeyim.`,
      (p,s)=>`${p} çalışmasında «${s}» aklımda.`,
      (p,s)=>`${p} üzerinde «${s}» adımını tekrar gözden geçiriyorum.`
    ];
    (portfolio.projects || []).forEach(project => {
      const title=project.title.split(' — ')[0];
      (project.flow || []).forEach((stage,index) => views.forEach(view => {
        const text=view(title,stage,index+1);
        const words=keywords(title+' '+stage);
        if(words.length) bank.push({text,words});
      }));
      [project.summary,...(project.features || [])].filter(Boolean).forEach(text=>{
        const words=keywords(title+' '+text); if(words.length) bank.push({text,words});
      });
    });
    (portfolio.capabilities || []).forEach(capability=>{
      bank.push({text:capability.description,words:keywords(capability.title)});
      (capability.tools||[]).forEach(tool=>bank.push({text:`${capability.title} çalışmalarımda kullandığım araçlardan biri: ${tool}.`,words:keywords(tool+' '+capability.title)}));
    });
    const unique=new Map();bank.forEach(entry=>{if(entry.text && entry.text.length<=112 && entry.words.length && !unique.has(entry.text))unique.set(entry.text,entry)});
    return [...unique.values()];
  }
  function compileWord(word, overlapping) {
    const compact=word.length>8, font=compact?COMPACT:GLYPHS, glyphWidth=compact?3:5, glyphHeight=compact?5:7;
    const width=word.length*(glyphWidth+1)-1;
    const left=Math.floor((52-width)/2), route=[];
    [...word].forEach((letter,letterIndex)=>{
      let glyph=font[letter];
      if(!glyph) glyph=compact?['111','101','010','000','010']:GLYPHS.O;
      for(let line=0;line<glyphHeight;line++) {
        const rowIndex=letterIndex%2?glyphHeight-1-line:line;
        const row=compact?1+rowIndex:rowIndex;
        const offsets=Array.from({length:glyphWidth},(_,i)=>i);if((line+letterIndex)%2)offsets.reverse();
        offsets.forEach(offset=>{if(glyph[rowIndex][offset]==='1')route.push({column:left+letterIndex*(glyphWidth+1)+offset,row,index:(left+letterIndex*(glyphWidth+1)+offset)*7+row,letter:letterIndex});});
      }
    });
    const intro=overlapping?400:350;
    const duration=clamp(1800+word.length*650,3400,7800);
    const firstCount=route.filter(point=>point.letter===0).length;
    const firstDuration=Math.max(1300,(duration-intro)*firstCount/route.length);
    const remaining=duration-intro-firstDuration;
    let cursor=intro;
    route.forEach((point,index)=>{
      point.start=cursor;
      point.duration=point.letter===0?firstDuration/firstCount:remaining/(route.length-firstCount || 1);
      point.end=cursor+point.duration;cursor=point.end;
    });
    return {word,width,route,end:cursor,hold:clamp(2200+word.length*110,2400,3500)};
  }
  function mount(options) {
    const {panel,grid,scroll}=options||{};
    if(!panel||!grid||!scroll)throw new Error('ActivityNarrator: panel, grid ve scroll gerekli.');
    if(mounted.has(panel))mounted.get(panel).destroy();
    const hadClass=panel.classList.contains('has-activity-narrator');panel.classList.add('has-activity-narrator');
    const root=element('div','activity-narrator');root.dataset.ready='false';root.dataset.active='false';
    const bubble=element('button','narrator-thought');bubble.type='button';
    const terminal=element('span','narrator-terminal');terminal.setAttribute('aria-hidden','true');
    const header=element('span','narrator-terminal-bar');const counter=element('span','narrator-counter');
    header.append(element('i','narrator-led'),element('span','','iç ses'),counter);
    const copy=element('span','narrator-copy'),line=element('span','narrator-line');line.append(copy,element('span','narrator-caret','▍'));
    terminal.append(header,line,element('span','narrator-tip','sonraki düşünce ↵'));bubble.append(terminal);
    const helper=element('span','narrator-sr','Renkli Luciler kelimeleri sırayla yazar. Önceki kelime arkadan silinirken yeni yazar gelir. Geçici renkli izler gerçek etkinlik kayıtlarını değiştirmez. Balon bir sonraki düşünceye geçer.');
    const announcement=element('span','narrator-sr');announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');
    root.append(bubble,helper,announcement);panel.append(root);
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced=Boolean(options.reducedMotion)||media.matches,paused=false,visible=false,destroyed=false;
    let frame=0,layoutFrame=0,previous=0,time=0,dirty=true,points=[],actors=[],active=null,actorNumber=0;
    let box={width:0,size:44,bubbleWidth:250,bubbleHeight:100,gridTop:180,pitch:16};
    let sentenceIndex=0,wordIndex=0,thoughtLetters=0,nextLetter=0,deck=[],deckCursor=0,cycle=0;
    const bank=narrativeBank(),cleanups=[];
    const data=(name,value)=>{const next=String(value);if(root.dataset[name]!==next)root.dataset[name]=next};
    data('bankSize',bank.length);data('fadeMs',FADE_MS);data('actors',0);
    function listen(target,type,fn,settings){target.addEventListener(type,fn,settings);cleanups.push(()=>target.removeEventListener(type,fn,settings));}
    function shuffleDeck(){
      deck=Array.from({length:Math.max(0,bank.length-8)},(_,i)=>i+8);let seed=28711+(cycle++*7919);
      for(let i=deck.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}deckCursor=0;
    }
    function setSentence(index,instant){
      sentenceIndex=index;wordIndex=0;thoughtLetters=instant?bank[index].text.length:0;
      copy.textContent=bank[index].text.slice(0,thoughtLetters);nextLetter=time+80;
      counter.textContent=String(index+1).padStart(3,'0')+' / '+bank.length;
      bubble.setAttribute('aria-label','İç ses: '+bank[index].text+' Sonraki düşünce için tıkla.');announcement.textContent=bank[index].text;
      data('thought',index);root.classList.toggle('is-typing',!instant);
    }
    function nextSentence(){
      let next;
      if(sentenceIndex<7&&cycle===0)next=sentenceIndex+1;
      else {if(!deck.length||deckCursor>=deck.length)shuffleDeck();next=deck[deckCursor++];}
      setSentence(next===undefined?0:next,reduced);
    }
    function createActor(word,overlapping){
      const palette=COLORS[actorNumber++%COLORS.length];
      const node=element('div','narrator-character');node.setAttribute('aria-hidden','true');node.style.setProperty('--luci-body',palette.body);
      const drawing=luci();node.append(drawing.svg);
      const shadow=element('span','narrator-shadow');root.append(shadow,node);
      const actor={node,drawing,shadow,palette,score:compileWord(word,overlapping),born:time,current:6,step:0,ink:new Map(),retire:null,lastPose:''};
      actors.push(actor);data('actors',actors.length);return actor;
    }
    function removeActor(actor){actor.ink.forEach(record=>record.node.remove());actor.ink.clear();actor.node.remove();actor.shadow.remove();actors=actors.filter(item=>item!==actor);data('actors',actors.length);}
    function startWord(overlapping){
      const entry=bank[sentenceIndex];
      active=createActor(entry.words[wordIndex],overlapping);data('message',active.score.word);data('phase','draw');data('inkCount',0);data('color',active.palette.name);
    }
    function advanceWord(){
      const old=active;
      // A single outgoing actor is the hard cap, even if the visitor skips.
      actors.filter(actor=>actor!==old).forEach(removeActor);
      if(old){old.retire=time;old.node.classList.add('is-retiring');}
      wordIndex++;
      if(wordIndex>=bank[sentenceIndex].words.length)nextSentence();
      startWord(Boolean(old));
    }
    function light(actor,point){
      const cell=points[point.index]&&points[point.index].cell;if(!cell||actor.ink.has(point.index))return;
      const node=element('span','narrator-ink-layer');node.setAttribute('aria-hidden','true');node.style.background=actor.palette.ink;cell.append(node);
      actor.ink.set(point.index,{node,column:point.column,row:point.row,opacity:1});
      if(actor===active)data('inkCount',actor.ink.size);
    }
    function activeMotion(){return !destroyed&&!paused&&!reduced&&visible&&!document.hidden&&points.length===364;}
    function paint(actor,x,y,scaleX,scaleY,tilt,arc){
      const size=box.size,top=y-size*.94,direction=actor.direction||1;
      actor.node.style.transform=`translate3d(${(x-size*.5).toFixed(2)}px,${top.toFixed(2)}px,0)`;
      actor.drawing.svg.style.transform=`rotate(${tilt.toFixed(2)}deg) scale(${(scaleX*direction).toFixed(3)},${scaleY.toFixed(3)})`;
      actor.shadow.style.transform=`translate3d(${x.toFixed(2)}px,${(y+arc*Math.min(24,box.pitch*1.7)).toFixed(2)}px,0) scale(${(1-arc*.45).toFixed(2)})`;
      actor.shadow.style.opacity=String(.45-arc*.25);
      actor.node.classList.toggle('is-airborne',arc>.1);
      if(actor===active){
        const bubbleX=clamp(x-box.bubbleWidth*.48,12,Math.max(12,box.width-box.bubbleWidth-12));
        const bubbleY=box.gridTop-box.bubbleHeight-Math.max(40,size*1.1);
        bubble.style.transform=`translate3d(${bubbleX.toFixed(2)}px,${bubbleY.toFixed(2)}px,0)`;
        bubble.style.setProperty('--narrator-tail-x',clamp(x-bubbleX,18,box.bubbleWidth-22).toFixed(2)+'px');
        bubble.style.setProperty('--narrator-accent',actor.palette.ink);
      }
    }
    function pose(actor){
      const current=points[actor.current];if(!current)return;
      const local=time-actor.born,next=actor.score.route[actor.step];
      if(!next||local<next.start){paint(actor,current.x,current.y,1,1,0,0);return;}
      const destination=points[next.index];if(!destination)return;
      const progress=clamp((local-next.start)/next.duration,0,1),arc=Math.sin(Math.PI*progress),travel=progress*progress*(3-2*progress);
      actor.direction=destination.x===current.x?actor.direction||1:destination.x>current.x?1:-1;
      const distance=Math.hypot(destination.x-current.x,destination.y-current.y),height=Math.min(box.size*.6,Math.max(box.pitch*.9,distance*.17));
      paint(actor,current.x+(destination.x-current.x)*travel,current.y+(destination.y-current.y)*travel-arc*height,1-arc*.05,1+arc*.07,actor.direction*arc*9,arc);
    }
    function measure(){
      dirty=false;const panelRect=panel.getBoundingClientRect(),gridRect=grid.getBoundingClientRect();
      points=[...grid.querySelectorAll('.rhythm-cell')].map(cell=>{const rect=cell.getBoundingClientRect();return{cell,x:rect.left+rect.width/2-panelRect.left,y:rect.top+rect.height*.65-panelRect.top}});
      box={width:panel.clientWidth,size:active?active.node.offsetWidth:44,bubbleWidth:bubble.offsetWidth,bubbleHeight:bubble.offsetHeight,gridTop:gridRect.top-panelRect.top,pitch:gridRect.width/52};
      data('ready',points.length===364);if(reduced)staticWord();else actors.forEach(pose);
    }
    function queueMeasure(){dirty=true;if(!frame&&!layoutFrame&&!destroyed)layoutFrame=requestAnimationFrame(()=>{layoutFrame=0;measure();sync()});}
    function staticWord(){if(!active)return;active.score.route.forEach(point=>light(active,point));active.step=active.score.route.length;active.current=active.score.route.at(-1).index;data('phase','hold');pose(active);}
    function update(){
      if(thoughtLetters<bank[sentenceIndex].text.length&&time>=nextLetter){thoughtLetters++;copy.textContent=bank[sentenceIndex].text.slice(0,thoughtLetters);nextLetter=time+43;if(thoughtLetters===bank[sentenceIndex].text.length)root.classList.remove('is-typing');}
      actors.slice().forEach(actor=>{
        const local=time-actor.born;
        if(actor.retire!==null){
          const elapsed=time-actor.retire;
          const columns=actor.score.width;
          actor.ink.forEach(record=>{
            const left=Math.floor((52-columns)/2),stagger=(record.column-left)/Math.max(1,columns-1)*650;
            const opacity=Math.round(clamp(1-(elapsed-stagger)/950,0,1)*36)/36;
            if(record.opacity!==opacity){record.opacity=opacity;record.node.style.opacity=String(opacity);}
          });
          actor.node.style.opacity=String(clamp(1-elapsed/FADE_MS,0,1));actor.shadow.style.opacity=actor.node.style.opacity;
          if(elapsed>=FADE_MS){removeActor(actor);return;}
          pose(actor);return;
        }
        while(actor.step<actor.score.route.length&&local>=actor.score.route[actor.step].end){const point=actor.score.route[actor.step++];light(actor,point);actor.current=point.index;}
        pose(actor);
        if(actor===active&&local>=actor.score.end){data('phase',actors.length>1?'overlap':'hold');if(local>=actor.score.end+actor.score.hold)advanceWord();}
      });
      if(active&&actors.length>1)data('phase','overlap');
      else if(active&&time-active.born<active.score.end)data('phase','draw');
    }
    function tick(now){frame=0;if(dirty)measure();if(!activeMotion()){sync();return;}time+=previous?Math.min(50,now-previous):0;previous=now;update();frame=requestAnimationFrame(tick);}
    function sync(){const on=activeMotion();data('active',on);data('reduced',reduced);if(on&&!frame){previous=0;frame=requestAnimationFrame(tick)}if(!on){if(frame)cancelAnimationFrame(frame);frame=0;previous=0;}}
    function inViewport(){const rect=panel.getBoundingClientRect();return rect.bottom>0&&rect.top<window.innerHeight;}
    function changeMotion(event){reduced=event.matches;actors.slice().forEach(removeActor);if(reduced)setSentence(sentenceIndex,true);startWord(false);if(reduced)staticWord();sync();}
    listen(bubble,'click',()=>{nextSentence();actors.slice().forEach(removeActor);startWord(false);if(reduced)staticWord();queueMeasure();});
    listen(scroll,'scroll',queueMeasure,{passive:true});listen(window,'resize',queueMeasure,{passive:true});listen(document,'visibilitychange',sync);
    if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)queueMeasure();sync()},{threshold:.02});io.observe(panel);cleanups.push(()=>io.disconnect());}
    else listen(window,'scroll',()=>{visible=inViewport();queueMeasure();sync()},{passive:true});
    if('ResizeObserver'in window){const ro=new ResizeObserver(queueMeasure);[panel,grid,scroll,bubble].forEach(node=>ro.observe(node));cleanups.push(()=>ro.disconnect());}
    const mo=new MutationObserver(queueMeasure);mo.observe(grid,{childList:true});cleanups.push(()=>mo.disconnect());
    if(media.addEventListener){media.addEventListener('change',changeMotion);cleanups.push(()=>media.removeEventListener('change',changeMotion));}
    else if(media.addListener){media.addListener(changeMotion);cleanups.push(()=>media.removeListener(changeMotion));}
    setSentence(0,reduced);startWord(false);visible=inViewport();measure();sync();
    const api=Object.freeze({setPaused(value){paused=Boolean(value);sync()},destroy(){if(destroyed)return;destroyed=true;sync();if(layoutFrame)cancelAnimationFrame(layoutFrame);cleanups.forEach(cleanup=>cleanup());actors.slice().forEach(removeActor);root.remove();if(!hadClass)panel.classList.remove('has-activity-narrator');mounted.delete(panel)}});
    mounted.set(panel,api);return api;
  }
  window.ActivityNarrator=Object.freeze({mount});
})();

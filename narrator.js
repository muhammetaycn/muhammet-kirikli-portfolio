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
  // Compact letters keep seven rows: the word never changes height mid-scene.
  const COMPACT = {
    A:['010','101','101','111','101','101','101'],B:['110','101','101','110','101','101','110'],C:['011','100','100','100','100','100','011'],D:['110','101','101','101','101','101','110'],
    E:['111','100','100','110','100','100','111'],F:['111','100','100','110','100','100','100'],G:['011','100','100','101','101','101','011'],H:['101','101','101','111','101','101','101'],
    I:['111','010','010','010','010','010','111'],J:['011','001','001','001','101','101','010'],K:['101','101','110','100','110','101','101'],L:['100','100','100','100','100','100','111'],
    M:['101','111','111','101','101','101','101'],N:['101','111','111','111','101','101','101'],O:['010','101','101','101','101','101','010'],P:['110','101','101','110','100','100','100'],
    Q:['010','101','101','101','101','111','011'],R:['110','101','101','110','110','101','101'],S:['011','100','100','010','001','001','110'],T:['111','010','010','010','010','010','010'],
    U:['101','101','101','101','101','101','111'],V:['101','101','101','101','101','101','010'],W:['101','101','101','101','111','111','101'],X:['101','101','101','010','101','101','101'],
    Y:['101','101','101','010','010','010','010'],Z:['111','001','001','010','100','100','111']
  };
  const SYNTAX = ['#9cdcfe','#4ec9b0','#dcdcaa','#ce9178','#f9a8d4'];
  const FADE_MS = 1600, MIN_HOLD = 4200, READ_MS = 5000, STAGGER = 900;
  const transliterate = value => String(value).replace(/[ıİ]/g,'I').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  // Handwritten micro-dialogues, not portfolio claims or sentence permutations.
  const TOPICS = [
    [['QUERY','INDEX'],['Read only the rows you need.','Let the index shorten the search.'],['SORGU','INDEKS'],['Yalnız gereken satırları sorgula.','İndeksle arama yolunu kısalt.']],
    [['NULL','GUARD'],['TypeError: cannot read null.','if (value == null) return null;'],['BOS','KORU'],['TypeError: boş değere erişildi.','Değeri kullanmadan önce boşluğu kontrol et.']],
    [['EVENT','QUEUE'],['An event arrived. Keep it small.','Queue the work; preserve the order.'],['OLAY','KUYRUK'],['Yeni olay geldi; sınırı belirle.','İşi sıraya al, düzeni koru.']],
    [['CACHE','FRESH'],['Reuse the value while it is valid.','Expire stale data before it spreads.'],['BELLEK','TAZE'],['Geçerli sonucu bellekte tut.','Eski veriyi yenisiyle değiştir.']],
    [['TOKEN','GUARD'],['A token identifies this request.','Check permission before the action.'],['JETON','YETKI'],['İstek kimliğini önce doğrula.','İşlemden önce yetkiyi kontrol et.']],
    [['INPUT','CHECK'],['Treat every input as untrusted.','Validate at the system boundary.'],['GIRDI','ONAY'],['Önce gelen veriyi doğrula.','Geçersiz veriyi akışa alma.']],
    [['STATE','STORE'],['Keep one clear source of state.','Change it through a small action.'],['DURUM','DEPO'],['Durum için tek kaynak belirle.','Değişikliği küçük adımla uygula.']],
    [['FETCH','RETRY'],['The request has a time budget.','Retry gently; avoid a request storm.'],['ISTEK','TEKRAR'],['İsteğin bir zaman sınırı olsun.','Tekrar denerken sisteme yüklenme.']],
    [['PATCH','TEST'],['Make the smallest useful change.','Test the behavior that could break.'],['YAMA','TEST'],['Gerekli olan en küçük yamayı yap.','Bozulabilecek davranışı test et.']],
    [['BUILD','SHIP'],['Build the artifact from the source.','Ship only after the checks pass.'],['DERLE','YAYIN'],['Kaynak koddan çıktıyı üret.','Kontroller geçince sürümü yayınla.']],
    [['ROUTE','PARAM'],['A route is an interface boundary.','Parse its parameters explicitly.'],['ROTA','PARAM'],['Rota bir arayüz sınırıdır.','Parametreleri açıkça ayrıştır.']],
    [['ERROR','CATCH'],['Failures need a visible path back.','Catch the error; keep its context.'],['HATA','YAKALA'],['Hata için dönüş yolu bırak.','Hatayı bağlamıyla birlikte yakala.']],
    [['SELECT','WHERE'],['Choose the columns before the scan.','Filter the rows close to the data.'],['SEC','KOSUL'],['Önce gereken sütunları seç.','Koşulu veriye yakın uygula.']],
    [['TABLE','ROW'],['Each row needs a stable identity.','Keep the key separate from the view.'],['TABLO','SATIR'],['Her satırın sabit kimliği olsun.','Anahtarı görünümden ayrı tut.']],
    [['SCHEMA','FIELD'],['Describe the shape before the write.','A field needs a name and a type.'],['SEMA','ALAN'],['Yazmadan önce veri şeklini tanımla.','Her alanın adı ve türü olsun.']],
    [['COMMIT','DIFF'],['Save one coherent unit of change.','Read the diff before the commit.'],['KAYDET','FARK'],['Bir bütün oluşturan değişikliği kaydet.','Kaydetmeden önce farkı incele.']],
    [['THREAD','LOCK'],['Shared state needs clear ownership.','Lock briefly; release on every path.'],['ISLEM','KILIT'],['Ortak durumun sahibini belirle.','Kilidi kısa tut, her yolda bırak.']],
    [['ASYNC','AWAIT'],['Start the work without blocking.','await job(); resumes when it settles.'],['ASENK','BEKLE'],['İşi başlat, arayüzü bekletme.','Sonuç gelince akışa devam et.']],
    [['STREAM','CHUNK'],['Process the stream in small pieces.','A chunk should fit the memory budget.'],['AKIS','PARCA'],['Akışı küçük parçalarla işle.','Her parça bellek sınırına uysun.']],
    [['ECONN','RESET'],['ECONNRESET: peer closed the socket.','Reconnect with a bounded retry budget.'],['SOKET','TEKRAR'],['ECONNRESET: bağlantı karşıdan kapandı.','Sınırlı beklemeyle yeniden bağlan.']],
    [['PARSE','FORMAT'],['Read structured text with a parser.','Format only after the data is valid.'],['AYIKLA','BICIM'],['Yapılı metni ayrıştırıcıyla oku.','Veri geçerliyse biçimlendirmeye geç.']],
    [['TYPE','ERROR'],['TypeError: value is not callable.','if (typeof fn !== "function") return;'],['TUR','HATA'],['TypeError: bu değer çağrılamıyor.','Çağırmadan önce fonksiyon türünü doğrula.']],
    [['LIMIT','OFFSET'],['Bound the size of every result.','Move through pages in a stable order.'],['SINIR','ATLA'],['Sonuç boyutuna bir sınır koy.','Sayfaları sabit sırayla dolaş.']],
    [['429','DELAY'],['HTTP 429: too many requests.','Respect Retry-After before retrying.'],['SINIR','BEKLE'],['HTTP 429: istek sınırı aşıldı.','Retry-After varsa belirtilen süreyi bekle.']],
    [['INSERT','UPDATE'],['New data enters through one path.','Update only the fields that changed.'],['EKLE','GUNCEL'],['Yeni veri tek bir yoldan girsin.','Yalnız değişen alanları güncelle.']],
    [['EPIPE','WRITE'],['EPIPE: write reached a closed pipe.','Check the connection before writing.'],['KOPTU','YAZMA'],['EPIPE: kapalı kanala yazma denemesi.','Yazmadan önce bağlantıyı kontrol et.']],
    [['CORS','ORIGIN'],['The origin failed the browser check.','Verify allowed origins at the server.'],['KOKEN','IZIN'],['CORS: tarayıcı bu kökene izin vermedi.','Sunucuda izin verilen kökenleri doğrula.']],
    [['PIXEL','FRAME'],['One frame has a small time budget.','Move only what the eye can follow.'],['PIKSEL','KARE'],['Bir karenin zaman payı küçüktür.','Gözün izleyebileceği kadar hareket et.']],
    [['ABORT','FETCH'],['AbortError: request was cancelled.','controller.abort(); stops this request.'],['IPTAL','ISTEK'],['AbortError: bu istek iptal edildi.','İptal edilen isteğin sonucunu kullanma.']],
    [['TRACE','DEBUG'],['Follow the cause across boundaries.','Trace the evidence across the call stack.'],['IZLE','AYIKLA'],['Nedeni sistem sınırları boyunca izle.','Çağrı yığınında hatanın kaynağını izle.']],
    [['LOG','WARN'],['Write the context that will matter.','A warning should suggest a next step.'],['KAYIT','UYARI'],['Sonra gerekecek bağlamı kaydet.','Uyarı bir sonraki adımı anlatsın.']],
    [['ASSERT','FAIL'],['assert(queue.length >= 0); // invariant','AssertionError: inspect the state first.'],['KOSUL','HATA'],['Invariant: durum varsayımını doğrula.','AssertionError: hatayı kaynağında ara.']]
  ];
  const ROUNDS = TOPICS.flatMap(topic => [
    {lang:'EN',words:topic[0],thoughts:topic[1]},
    {lang:'TR',words:topic[2],thoughts:topic[3]}
  ]);
  function compileWord(value, side) {
    const word = transliterate(value), compact = word.length > 4;
    const font = compact ? COMPACT : GLYPHS, glyphWidth = compact ? 3 : 5;
    const width = word.length * (glyphWidth + 1) - 1;
    const start = side === 0 ? 0 : 28, left = start + Math.floor((24 - width) / 2), route = [];
    [...word].forEach((letter, letterIndex) => {
      const glyph = font[letter] || font.O;
      for(let line = 0; line < 7; line++) {
        const row = letterIndex % 2 ? 6 - line : line;
        const offsets = Array.from({length:glyphWidth},(_,i)=>i);
        if((line + letterIndex) % 2) offsets.reverse();
        offsets.forEach(offset => {
          if(glyph[row][offset] === '1') {
            const column = left + letterIndex * (glyphWidth + 1) + offset;
            route.push({column,row,index:column * 7 + row,letter:letterIndex});
          }
        });
      }
    });
    return {word,width,left,route,hop:clamp(route.length * 95,4200,6500) / route.length};
  }
  function mount(options) {
    const {panel,grid,scroll} = options || {};
    if(!panel || !grid || !scroll) throw new Error('ActivityNarrator: panel, grid ve scroll gerekli.');
    if(mounted.has(panel)) mounted.get(panel).destroy();
    const hadClass = panel.classList.contains('has-activity-narrator'); panel.classList.add('has-activity-narrator');
    const root = element('div','activity-narrator');root.dataset.ready='false';root.dataset.active='false';
    const tethers = vector('svg',{class:'narrator-tethers','aria-hidden':'true'});
    root.append(tethers);
    const fracture = element('span','narrator-fracture');fracture.setAttribute('aria-hidden','true');root.append(fracture);
    const helper = element('span','narrator-sr','İki Luci aynı matriste ayrı alanlara yazar. Siyah Luci ve renkli yazar, İngilizce ve Türkçe teknik düşünceleri paylaşır. Renkli izler geçicidir; gerçek etkinlik kayıtları değişmez. Balona tıklamak, okunmakta olan düşünceyi kesmeden sıradakini kuyruğa alır.');
    const announcement = element('span','narrator-sr');announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');root.append(helper,announcement);panel.append(root);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cleanups = [], owners = new Map(), retired = [], errorInk = [];
    let reduced = Boolean(options.reducedMotion) || media.matches, paused=false, visible=false, destroyed=false;
    let frame=0,layoutFrame=0,previous=0,time=0,dirty=true,points=[],roundIndex=0,roundBorn=0,pendingRight=null,transitioning=false;
    let wordsStarted=0,generationId=0,errorCount=0,panelFaultUntil=0;
    let box={width:820,size:42,pitch:14,gridTop:200,bubbleTop:24};
    const data=(name,value)=>{const next=String(value);if(root.dataset[name]!==next)root.dataset[name]=next;};
    data('bankSize',ROUNDS.length);data('thoughtCount',ROUNDS.length*2);data('fadeMs',FADE_MS);data('holdMs',MIN_HOLD);data('errorCount',0);data('collisions',0);data('staggerMs',STAGGER);
    function listen(target,type,fn,settings){target.addEventListener(type,fn,settings);cleanups.push(()=>target.removeEventListener(type,fn,settings));}
    function createActor(side,color) {
      const node=element('div','narrator-character');node.setAttribute('aria-hidden','true');node.dataset.zone=side===0?'left':'right';node.dataset.color=side===0?'black':color;
      node.style.setProperty('--luci-body',side===0?'#050506':color);
      const drawing=luci(),shadow=element('span','narrator-shadow');node.append(drawing.svg);root.append(shadow,node);
      return {node,drawing,shadow,side,color,current:(side===0?1:29)*7+6,direction:1,retire:null};
    }
    const zones=[0,1].map(side=>{
      const bubble=element('button','narrator-thought');bubble.type='button';bubble.dataset.zone=side===0?'left':'right';
      const terminal=element('span','narrator-terminal');terminal.setAttribute('aria-hidden','true');
      const bar=element('span','narrator-terminal-bar'),led=element('i','narrator-led'),label=element('span','narrator-worker',`worker ${String(side+1).padStart(2,'0')}`),language=element('span','narrator-language'),status=element('span','narrator-status','RUN');
      bar.append(led,label,language,status);
      const line=element('span','narrator-line'),copy=element('span','narrator-copy'),caret=element('span','narrator-caret','▍');line.append(copy,caret);
      const tip=element('span','narrator-tip','sıradaki düşünce ↵');terminal.append(bar,line,tip);bubble.append(terminal);
      const tether=vector('path',{});tethers.append(tether);root.append(bubble);
      const zone={side,bubble,copy,language,status,tip,tether,actor:createActor(side,SYNTAX[0]),generation:null,requested:false,bubbleX:0,bubbleY:0,bubbleWidth:250,bubbleHeight:110};
      listen(bubble,'click',()=>{
        if(reduced){resetRound((roundIndex+1)%ROUNDS.length,true);return;}
        zone.requested=true;tip.textContent='kuyruğa alındı · okununca ↵';bubble.dataset.queued='true';
        bubble.setAttribute('aria-label',`Düşünce: ${ROUNDS[roundIndex].thoughts[side]} Sıradaki düşünce kuyruğa alındı.`);
      });
      return zone;
    });
    function removeActor(actor){actor.node.remove();actor.shadow.remove();}
    function removeRecord(record){
      record.node.remove();const list=owners.get(record.index);if(list){list.delete(record);if(!list.size)owners.delete(record.index);}
    }
    function clearGeneration(generation){if(!generation)return;generation.ink.forEach(removeRecord);generation.ink.clear();}
    function clearAll(){
      zones.forEach(zone=>clearGeneration(zone.generation));
      retired.splice(0).forEach(entry=>{clearGeneration(entry.generation);if(entry.actor)removeActor(entry.actor);});
      errorInk.splice(0).forEach(record=>record.node.remove());owners.clear();
    }
    function createGeneration(zone,index,born){
      const entry=ROUNDS[index],score=compileWord(entry.words[zone.side],zone.side),serial=++wordsStarted;
      const generation={id:++generationId,round:index,score,born,step:0,hopStart:null,hopFrom:zone.actor.current,ink:new Map(),doneAt:null,fullAt:null,letters:0,nextLetter:born+80,retire:null,error:null,errorDone:false,errorPlanned:serial%5===0,serial};
      zone.requested=false;zone.tip.textContent='sıradaki düşünce ↵';delete zone.bubble.dataset.queued;
      zone.copy.textContent='';zone.language.textContent=entry.lang;zone.status.textContent='RUN';zone.bubble.dataset.status='run';zone.bubble.dataset.lang=entry.lang;
      zone.bubble.setAttribute('aria-label',`Düşünce: ${entry.thoughts[zone.side]} Sonraki düşünceyi okununca sıraya almak için tıkla.`);
      zone.bubble.style.setProperty('--narrator-accent',zone.side===0?'#ff6a35':zone.actor.color);
      zone.bubble.classList.add('is-typing');zone.generation=generation;
      return generation;
    }
    function announceRound(){const entry=ROUNDS[roundIndex];announcement.textContent=`${entry.lang}. ${entry.thoughts.join(' ')}`;}
    function beginZone(zone,index,born,overlap){
      const old=zone.generation;
      if(old&&overlap){
        old.retire=time;
        if(zone.side===1){zone.actor.retire=time;zone.actor.node.classList.add('is-retiring');retired.push({generation:old,actor:zone.actor});zone.actor=createActor(1,SYNTAX[index%SYNTAX.length]);}
        else retired.push({generation:old,actor:null});
      } else if(old)clearGeneration(old);
      createGeneration(zone,index,born);
    }
    function resetRound(index,instant){
      clearAll();roundIndex=index;roundBorn=time;pendingRight=null;transitioning=false;panelFaultUntil=0;
      panel.classList.remove('narrator-has-warning');root.classList.remove('is-faulting');
      if(zones[1].actor.retire!==null){removeActor(zones[1].actor);zones[1].actor=createActor(1,SYNTAX[index%SYNTAX.length]);}
      zones.forEach(zone=>beginZone(zone,index,time+(instant?0:zone.side*STAGGER),false));
      if(instant)zones.forEach(zone=>staticWord(zone));announceRound();dirty=true;queueMeasure();
    }
    function nextRound(){
      roundIndex=(roundIndex+1)%ROUNDS.length;roundBorn=time;transitioning=true;
      beginZone(zones[0],roundIndex,time+600,true);pendingRight={index:roundIndex,at:time+STAGGER};announceRound();
    }
    function addInk(zone,generation,point){
      if(generation.ink.has(point.index))return;
      const cell=points[point.index]&&points[point.index].cell;if(!cell)return;
      const node=element('span','narrator-ink-layer');node.setAttribute('aria-hidden','true');node.dataset.zone=zone.side===0?'left':'right';node.dataset.generation=String(generation.id);node.style.background=zone.side===0?'#ff6a35':zone.actor.color;cell.append(node);
      const record={node,index:point.index,column:point.column,row:point.row,opacity:1,generation:generation.id};generation.ink.set(point.index,record);
      if(!owners.has(point.index))owners.set(point.index,new Set());owners.get(point.index).add(record);
    }
    function available(generation,point){const records=owners.get(point.index);return !records||[...records].every(record=>record.generation===generation.id||record.opacity<=.1);}
    function paint(actor,x,y,scaleX=1,scaleY=1,tilt=0,arc=0){
      const size=box.size;actor.node.style.transform=`translate3d(${(x-size*.5).toFixed(2)}px,${(y-size*.94).toFixed(2)}px,0)`;
      actor.drawing.svg.style.transform=`rotate(${tilt.toFixed(2)}deg) scale(${(scaleX*actor.direction).toFixed(3)},${scaleY.toFixed(3)})`;
      actor.shadow.style.transform=`translate3d(${x.toFixed(2)}px,${(y+arc*Math.min(22,box.pitch*1.4)).toFixed(2)}px,0) scale(${(1-arc*.4).toFixed(2)})`;
      actor.shadow.style.opacity=String(.4-arc*.2);actor.node.classList.toggle('is-airborne',arc>.1);
      const zone=zones[actor.side];
      if(zone.actor===actor){
        const startX=zone.bubbleX+zone.bubbleWidth*.5,startY=zone.bubbleY+zone.bubbleHeight+11,endY=y-size*.8;
        zone.tether.setAttribute('d',`M${startX.toFixed(1)} ${startY.toFixed(1)}Q${startX.toFixed(1)} ${((startY+endY)*.5).toFixed(1)} ${x.toFixed(1)} ${endY.toFixed(1)}`);
      }
    }
    function idlePose(zone){const p=points[zone.actor.current];if(p)paint(zone.actor,p.x,p.y);}
    function hopPose(zone,from,to,progress,warning=false){
      const actor=zone.actor,a=points[from],b=points[to];if(!a||!b)return;
      const travel=progress*progress*(3-2*progress),arc=Math.sin(Math.PI*progress);
      actor.direction=b.x===a.x?actor.direction:b.x>a.x?1:-1;
      const distance=Math.hypot(b.x-a.x,b.y-a.y),height=Math.min(box.size*.52,Math.max(box.pitch*.78,distance*.14))*(warning?1.15:1);
      paint(actor,a.x+(b.x-a.x)*travel,a.y+(b.y-a.y)*travel-arc*height,1-arc*.045,1+arc*.065,actor.direction*arc*(warning?12:7),arc);
    }
    function errorPath(zone,generation){
      const routeSet=new Set(generation.score.route.map(point=>point.index)),current=zone.actor.current,col=Math.floor(current/7),row=current%7,start=zone.side===0?0:28,candidates=[];
      for(let radius=1;radius<6;radius++)for(let dc=-radius;dc<=radius;dc++)for(let dr=-radius;dr<=radius;dr++){
        if(Math.max(Math.abs(dc),Math.abs(dr))!==radius)continue;
        const c=col+dc,r=row+dr,index=c*7+r;
        if(c<start||c>=start+24||r<0||r>6||routeSet.has(index)||owners.has(index)||candidates.includes(index))continue;
        candidates.push(index);if(candidates.length===3)return candidates;
      }
      return candidates;
    }
    function startError(zone,generation){
      const route=errorPath(zone,generation);generation.errorDone=true;if(route.length<3)return;
      generation.error={since:time,route,step:0,origin:zone.actor.current,from:zone.actor.current};generation.hopStart=null;
      errorCount++;data('errorCount',errorCount);data('error','warn');
      zone.bubble.dataset.status='warn';zone.status.textContent='WARN';zone.actor.node.classList.add('is-warning');
      panelFaultUntil=time+900;panel.classList.add('narrator-has-warning');root.classList.add('is-faulting');
      const point=points[route[0]];if(point)root.style.setProperty('--fault-y',point.y.toFixed(1)+'px');
    }
    function markError(index){
      const cell=points[index]&&points[index].cell;if(!cell)return;
      const node=element('span','narrator-error-ink');node.setAttribute('aria-hidden','true');cell.append(node);errorInk.push({node,born:time,index});
    }
    function updateError(zone,generation){
      const error=generation.error,elapsed=time-error.since;
      if(elapsed<510){
        const step=Math.min(2,Math.floor(elapsed/170));
        while(error.step<step){const landed=error.route[error.step++];markError(landed);error.from=landed;zone.actor.current=landed;}
        hopPose(zone,error.from,error.route[step],clamp((elapsed-step*170)/170,0,1),true);
      } else if(elapsed<790){
        while(error.step<3){const landed=error.route[error.step++];markError(landed);zone.actor.current=landed;}
        zone.status.textContent='RECOVER';zone.bubble.dataset.status='recover';
        hopPose(zone,error.route[2],error.origin,clamp((elapsed-510)/280,0,1),true);
      } else {
        zone.actor.current=error.origin;generation.error=null;generation.hopStart=null;zone.actor.node.classList.remove('is-warning');zone.status.textContent='RUN';zone.bubble.dataset.status='run';idlePose(zone);
      }
    }
    function updateThought(zone,generation){
      const text=ROUNDS[generation.round].thoughts[zone.side];
      if(time<generation.born||generation.letters>=text.length)return;
      while(generation.letters<text.length&&time>=generation.nextLetter){generation.letters++;generation.nextLetter+=29;}
      zone.copy.textContent=text.slice(0,generation.letters);
      if(generation.letters===text.length){generation.fullAt=time;zone.bubble.classList.remove('is-typing');}
    }
    function updateZone(zone){
      const generation=zone.generation;updateThought(zone,generation);
      if(time<generation.born){idlePose(zone);return;}
      if(generation.error){updateError(zone,generation);return;}
      const route=generation.score.route;
      if(generation.step>=route.length){if(generation.doneAt===null)generation.doneAt=time;idlePose(zone);return;}
      if(generation.errorPlanned&&!generation.errorDone&&generation.step>=Math.floor(route.length*.42)){startError(zone,generation);if(generation.error){updateError(zone,generation);return;}}
      const point=route[generation.step];
      if(!available(generation,point)){generation.hopStart=null;idlePose(zone);return;}
      if(generation.hopStart===null){
        generation.hopStart=time;generation.hopFrom=zone.actor.current;
      }
      const progress=clamp((time-generation.hopStart)/generation.score.hop,0,1);
      hopPose(zone,generation.hopFrom,point.index,progress);
      if(progress>=1){
        // The old generation can only fade while a hop is in flight; it cannot
        // acquire new ink. Check again anyway so ownership is explicit.
        if(available(generation,point)){addInk(zone,generation,point);zone.actor.current=point.index;generation.step++;}
        generation.hopStart+=generation.score.hop;generation.hopFrom=zone.actor.current;
        if(generation.step===route.length)generation.doneAt=time;
      }
    }
    function ready(zone){const g=zone.generation;return g.doneAt!==null&&g.fullAt!==null&&time>=g.doneAt+MIN_HOLD+(zone.requested?0:1000)&&time>=g.fullAt+Math.max(READ_MS,ROUNDS[g.round].thoughts[zone.side].length*88);}
    function fadeRetired(){
      for(let i=retired.length-1;i>=0;i--){
        const entry=retired[i],g=entry.generation,elapsed=time-g.retire;
        g.ink.forEach(record=>{
          const stagger=(record.column-g.score.left)/Math.max(1,g.score.width-1)*600;
          const opacity=clamp(1-(elapsed-stagger)/1000,0,1);record.opacity=opacity;record.node.style.opacity=opacity.toFixed(3);
        });
        if(entry.actor){const opacity=clamp(1-elapsed/FADE_MS,0,1);entry.actor.node.style.opacity=opacity.toFixed(3);entry.actor.shadow.style.opacity=String(opacity*.3);}
        if(elapsed>=FADE_MS){clearGeneration(g);if(entry.actor)removeActor(entry.actor);retired.splice(i,1);}
      }
    }
    function fadeErrors(){for(let i=errorInk.length-1;i>=0;i--){const record=errorInk[i],age=time-record.born;record.node.style.opacity=String(clamp(1-(age-600)/700,0,1));if(age>=1300){record.node.remove();errorInk.splice(i,1);}}}
    function staticWord(zone){const g=zone.generation;g.score.route.forEach(point=>addInk(zone,g,point));g.step=g.score.route.length;g.doneAt=time;g.fullAt=time;g.letters=ROUNDS[g.round].thoughts[zone.side].length;zone.copy.textContent=ROUNDS[g.round].thoughts[zone.side];zone.bubble.classList.remove('is-typing');zone.actor.current=g.score.route.at(-1).index;idlePose(zone);}
    function diagnostics(){
      const phase=[];
      zones.forEach(zone=>{
        const g=zone.generation,key=zone.side===0?'left':'right',currentPhase=g.error?'warn':time<g.born?'enter':g.doneAt!==null?'hold':'draw';
        data(key+'Word',g.score.word);data(key+'Phase',currentPhase);data(key+'Lang',ROUNDS[g.round].lang);data(key+'Ink',g.ink.size);data(key+'Step',g.step);data(key+'Serial',g.serial);data(key+'Body',zone.side===0?'#050506':zone.actor.color);
        data(key+'ReadMs',g.fullAt===null?0:Math.round(time-g.fullAt));data(key+'HoldMs',g.doneAt===null?0:Math.round(time-g.doneAt));phase.push(currentPhase);
      });
      data('phase',phase.includes('warn')?'warn':retired.length?'overlap':phase.includes('draw')||phase.includes('enter')?'draw':'hold');
      data('error',zones.some(zone=>zone.generation.error)?'warn':errorInk.length?'recover':'none');
      data('actors',2+retired.filter(entry=>entry.actor).length);data('round',roundIndex+1);data('lang',ROUNDS[zones[0].generation.round].lang===ROUNDS[zones[1].generation.round].lang?ROUNDS[zones[0].generation.round].lang:'mixed');
      data('message',zones.map(zone=>zone.generation.score.word).join(' / '));data('inkCount',zones.reduce((sum,zone)=>sum+zone.generation.ink.size,0));data('elapsed',Math.round(time));
    }
    function update(){
      fadeRetired();fadeErrors();
      if(pendingRight&&time>=pendingRight.at){beginZone(zones[1],pendingRight.index,time+600,true);pendingRight=null;transitioning=false;}
      zones.forEach(updateZone);
      if(panelFaultUntil&&time>=panelFaultUntil){panelFaultUntil=0;panel.classList.remove('narrator-has-warning');root.classList.remove('is-faulting');}
      if(!transitioning&&!pendingRight&&zones.every(ready))nextRound();
      diagnostics();
    }
    function measure(){
      dirty=false;const panelRect=panel.getBoundingClientRect(),gridRect=grid.getBoundingClientRect();
      points=[...grid.querySelectorAll('.rhythm-cell')].map(cell=>{const rect=cell.getBoundingClientRect();return {cell,x:rect.left+rect.width/2-panelRect.left,y:rect.top+rect.height*.65-panelRect.top};});
      box={width:panel.clientWidth,size:zones[0].actor.node.offsetWidth||42,pitch:gridRect.width/52,gridTop:gridRect.top-panelRect.top};
      const availableWidth=gridRect.width*24/52,bubbleWidth=Math.min(280,Math.max(100,availableWidth-5));
      zones.forEach(zone=>{
        zone.bubble.style.width=bubbleWidth.toFixed(2)+'px';zone.bubbleWidth=bubbleWidth;zone.bubbleHeight=zone.bubble.offsetHeight;
        const center=gridRect.left-panelRect.left+gridRect.width*((zone.side===0?12:40)/52);
        zone.bubbleX=clamp(center-bubbleWidth/2,8,Math.max(8,box.width-bubbleWidth-8));zone.bubbleY=Math.max(14,box.gridTop-zone.bubbleHeight-35);
        zone.bubble.style.transform=`translate3d(${zone.bubbleX.toFixed(2)}px,${zone.bubbleY.toFixed(2)}px,0)`;idlePose(zone);
      });
      data('ready',points.length===364);root.style.setProperty('--narrator-grid-top',box.gridTop.toFixed(2)+'px');
    }
    function activeMotion(){return !destroyed&&!paused&&!reduced&&visible&&!document.hidden&&points.length===364;}
    function queueMeasure(){dirty=true;if(!frame&&!layoutFrame&&!destroyed)layoutFrame=requestAnimationFrame(()=>{layoutFrame=0;measure();sync();});}
    function tick(now){frame=0;if(dirty)measure();if(!activeMotion()){sync();return;}time+=previous?Math.min(50,now-previous):0;previous=now;update();frame=requestAnimationFrame(tick);}
    function sync(){const on=activeMotion();data('active',on);data('reduced',reduced);if(on&&!frame){previous=0;frame=requestAnimationFrame(tick);}if(!on){if(frame)cancelAnimationFrame(frame);frame=0;previous=0;}}
    function inViewport(){const rect=panel.getBoundingClientRect();return rect.bottom>0&&rect.top<window.innerHeight;}
    function changeMotion(event){reduced=event.matches;resetRound(roundIndex,reduced);measure();diagnostics();sync();}
    listen(scroll,'scroll',queueMeasure,{passive:true});listen(window,'resize',queueMeasure,{passive:true});listen(document,'visibilitychange',sync);
    if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)queueMeasure();sync();},{threshold:.02});io.observe(panel);cleanups.push(()=>io.disconnect());}
    else listen(window,'scroll',()=>{visible=inViewport();queueMeasure();sync();},{passive:true});
    if('ResizeObserver'in window){const ro=new ResizeObserver(queueMeasure);[panel,grid,scroll,...zones.map(zone=>zone.bubble)].forEach(node=>ro.observe(node));cleanups.push(()=>ro.disconnect());}
    const mo=new MutationObserver(queueMeasure);mo.observe(grid,{childList:true});cleanups.push(()=>mo.disconnect());
    if(media.addEventListener){media.addEventListener('change',changeMotion);cleanups.push(()=>media.removeEventListener('change',changeMotion));}
    else if(media.addListener){media.addListener(changeMotion);cleanups.push(()=>media.removeListener(changeMotion));}
    zones.forEach(zone=>createGeneration(zone,0,zone.side*STAGGER));visible=inViewport();measure();
    if(reduced)zones.forEach(staticWord);announceRound();diagnostics();sync();
    const api=Object.freeze({setPaused(value){paused=Boolean(value);sync();},destroy(){if(destroyed)return;destroyed=true;sync();if(layoutFrame)cancelAnimationFrame(layoutFrame);cleanups.forEach(cleanup=>cleanup());clearAll();zones.forEach(zone=>removeActor(zone.actor));root.remove();panel.classList.remove('narrator-has-warning');if(!hadClass)panel.classList.remove('has-activity-narrator');mounted.delete(panel);}});
    mounted.set(panel,api);return api;
  }
  window.ActivityNarrator=Object.freeze({mount});
})();

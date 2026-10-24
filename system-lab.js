(function () {
  'use strict';
  const SVG = 'http://www.w3.org/2000/svg';
  const FLOWS = {
    fullstack: {title:'Full-stack · istekten kayda', description:'Bir başlık gönder. Doğrulamayı izle, kayda dönüşmeden önce karar ver.', sample:'Etkileşimli portföy', nodes:['İstek','Doğrulama','Onay','Yerel kayıt'], kind:'request', output:'Yerel proje kaydı'},
    automation: {title:'Otomasyon · olaydan kuyruğa', description:'Bir olay yaz. Kural girdiyi hazırlasın; kuyruğa ekleme kararı sende kalsın.', sample:'Yeni içerik taslağı', nodes:['Olay','Kural','Kontrol','Kuyruk'], kind:'job', output:'Yerel iş kuyruğu'},
    mobile: {title:'Mobil · formdan görünüme', description:'Bir form değeri gir. Aynı verinin doğrulama ve yerel görünüm adımlarını karşılaştır.', sample:'Yakındaki yerleri keşfet', nodes:['Form','Yerel durum','Onay','Görünüm'], kind:'form', output:'Yerel görünüm kaydı'},
    event: {title:'Etkinlik · paylaşımdan sahneye', description:'Örnek paylaşım metnini değiştir. Onay vermeden yerel galeriye eklenmez.', sample:'Sahneden bir an', nodes:['Paylaşım','Doğrula','Onay','Yerel galeri'], kind:'submission', output:'Yerel galeri kaydı'},
    textile: {title:'Operasyon · siparişten panoya', description:'Bir sipariş referansı gir. Hazırlık ve kalite kararından sonra yerel panoya taşınsın.', sample:'SIP-024 / örnek sipariş', nodes:['Sipariş','Plan','Kalite','Yerel pano'], kind:'order', output:'Yerel pano kaydı'},
    content: {title:'İçerik · taslaktan kuyruğa', description:'Taslağın başlığını yaz. Kontrol noktasında durdur veya yerel kuyruğa bırak.', sample:'Bir fikrin ilk sürümü', nodes:['Taslak','Hazırlık','Onay','Yerel kuyruk'], kind:'draft', output:'Yerel içerik kuyruğu'},
    community: {title:'Topluluk · olaydan karara', description:'Bir olay metni gir. Kuralın hazırladığı kaydı incele; gerçek hesaplara işlem gönderilmez.', sample:'Yeni bir topluluk fikri', nodes:['Olay','Kural','Onay','Yerel kayıt'], kind:'event', output:'Yerel olay kaydı'}
  };
  let serial = 0;
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
  const normalized = value => String(value).trim().replace(/\s+/g,' ').toLocaleLowerCase('tr-TR');
  function element(tag,cls,text) {const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  function svg(tag,attrs,text) {const e=document.createElementNS(SVG,tag);Object.entries(attrs||{}).forEach(([key,value])=>e.setAttribute(key,String(value)));if(text!==undefined)e.textContent=text;return e;}
  function cubic(a,b,c,d,t) {const q=1-t;return {x:q*q*q*a.x+3*q*q*t*b.x+3*q*t*t*c.x+t*t*t*d.x,y:q*q*q*a.y+3*q*q*t*b.y+3*q*t*t*c.y+t*t*t*d.y};}

  function mount() {
    const required=id=>{const e=document.getElementById(id);if(!e)throw new Error('SystemLab: #'+id+' bulunamadı.');return e;};
    const host=required('system-lab'),stage=required('lab-stage'),title=required('lab-title'),description=required('lab-description'),result=required('lab-result'),runButton=required('lab-run'),resetButton=required('lab-reset');
    const tabs=[...host.querySelectorAll('[data-lab-project]')],motion=window.matchMedia('(prefers-reduced-motion: reduce)'),small=window.matchMedia('(max-width: 900px)');
    const prefix='lab-live-'+(++serial),cleanups=[],graphCleanups=[];
    const records=new Map(Object.keys(FLOWS).map(key=>[key,new Map()]));
    let selected=tabs.find(tab=>tab.getAttribute('aria-pressed')==='true')?.dataset.labProject||'fullstack';
    if(!FLOWS[selected])selected='fullstack';
    let destroyed=false,paused=false,visible=true,generation=0,runSerial=0,recordSerial=0,clock=0,previous=0,frame=0;
    let phase='idle',current=null,travel=null,selectedStep=0,inspectorPinned=false,nodes=[],connections=[],packet=null;
    let snapshots=Array(4).fill(null),states=Array(4).fill('idle');
    const viewport=stage.parentNode,viewportParent=viewport.parentNode,viewportNext=viewport.nextSibling;
    const workbench=element('div','lab-workbench'),flowPanel=element('div','lab-flow-panel'),editor=element('div','lab-inputs');
    const sampleLabel=element('label','lab-field'),sampleCaption=element('span','','Örnek veri'),sample=element('input','lab-sample');
    sample.id=prefix+'-sample';sample.type='text';sample.maxLength=80;sample.autocomplete='off';sample.spellcheck=false;sample.value=FLOWS[selected].sample;sampleLabel.append(sampleCaption,sample);
    const scenarioLabel=element('label','lab-field'),scenario=element('select','lab-scenario');
    scenario.id=prefix+'-scenario';scenarioLabel.append(element('span','','Bir durum dene'),scenario);
    [['valid','Geçerli girdi'],['missing','Eksik girdi'],['repeat','Aynı girdiyi tekrar dene']].forEach(([value,text])=>{const option=element('option','',text);option.value=value;scenario.append(option);});scenario.value='valid';
    editor.append(sampleLabel,scenarioLabel);
    const choice=element('div','lab-choice');choice.hidden=true;
    const choiceCopy=element('p','','Veri hazır. Bu oturumdaki kayda geçsin mi?'),choiceActions=element('div','lab-choice-actions');
    const approve=element('button','lab-approve','Devam et →'),reject=element('button','lab-reject','Durdur');approve.type=reject.type='button';
    choiceActions.append(approve,reject);choice.append(choiceCopy,choiceActions);
    const inspector=element('aside','lab-inspector'),inspectorTop=element('div','lab-inspector-top'),inspectorTitle=element('h4','','01 / Girdi');
    const countWrap=element('div','lab-record-count'),count=element('strong','','0');countWrap.append(count,element('span','','bu oturumdaki kayıt'));
    inspectorTop.append(inspectorTitle,countWrap);
    const json=element('pre','lab-json');json.setAttribute('tabindex','0');json.setAttribute('aria-label','Seçilen aşamanın yerel verisi');
    const traceLabel=element('span','lab-trace-label','AKIŞ İZİ'),trace=element('ol','lab-trace');
    const recordNote=element('p','lab-record-note','Henüz yerel kayıt yok.');inspector.append(inspectorTop,json,traceLabel,trace,recordNote);
    viewportParent.insertBefore(workbench,viewport);flowPanel.append(editor,viewport,choice);workbench.append(flowPanel,inspector);host.classList.add('has-live-lab');
    result.setAttribute('role','status');result.setAttribute('aria-live','polite');result.setAttribute('aria-atomic','true');

    function listen(target,type,fn,list=cleanups) {target.addEventListener(type,fn);list.push(()=>target.removeEventListener(type,fn));}
    function status(text) {result.textContent=text;}
    function traceEvent(text,tone) {
      const line=element('li',''),stamp=element('span','lab-trace-time',((clock-(current?.startedAt??clock))/1000).toFixed(1)+'s');line.dataset.tone=tone||'info';line.append(stamp,element('span','',text));trace.append(line);
      while(trace.children.length>8)trace.firstElementChild.remove();host.dataset.traceCount=String(trace.children.length);
    }
    function countRecords() {return [...records.values()].reduce((sum,map)=>sum+map.size,0);}
    function updateCounts() {
      const total=countRecords(),local=records.get(selected).size;count.textContent=String(total);host.dataset.recordCount=String(total);host.dataset.flowRecords=String(local);
      recordNote.textContent=local?`${FLOWS[selected].output}: ${local}. Aynı girdi ikinci kez eklenmez.`:'Bu akışta henüz yerel kayıt yok. Onaydan önce kayıt eklenmez.';
    }
    function preview(index) {return snapshots[index]||{stage:index+1,name:FLOWS[selected].nodes[index],status:'henüz çalıştırılmadı',input:sample.value};}
    function inspect(index,pin) {
      selectedStep=index;if(pin)inspectorPinned=true;
      inspectorTitle.textContent=String(index+1).padStart(2,'0')+' / '+FLOWS[selected].nodes[index];json.textContent=JSON.stringify(preview(index),null,2);
      nodes.forEach((node,i)=>{node.group.setAttribute('aria-pressed',String(i===index));node.group.classList.toggle('is-inspected',i===index);});host.dataset.inspected=String(index);
    }
    function setState(index,state) {states[index]=state;if(nodes[index])nodes[index].group.dataset.state=state;}
    function updateDiagnostics() {
      host.dataset.flow=selected;host.dataset.phase=phase;host.dataset.running=String(phase==='travel'||phase==='awaiting');host.dataset.elapsed=String(Math.round(clock));host.dataset.awaiting=String(phase==='awaiting');stage.dataset.running=host.dataset.running;
      runButton.disabled=phase==='travel'||phase==='awaiting';runButton.textContent=phase==='travel'?'Veri ilerliyor…':phase==='awaiting'?'Kararını bekliyor':'Akışı çalıştır →';
      choice.hidden=phase!=='awaiting';sample.disabled=false;scenario.disabled=false;updateCounts();
    }
    function stopFrame() {if(frame)cancelAnimationFrame(frame);frame=0;previous=0;}
    function cancel(text) {
      generation++;stopFrame();travel=null;current=null;phase='idle';choice.hidden=true;if(packet)packet.setAttribute('opacity','0');
      states=Array(4).fill('idle');snapshots=Array(4).fill(null);nodes.forEach((_,index)=>setState(index,'idle'));connections.forEach(connection=>connection.path.dataset.state='idle');
      trace.replaceChildren();host.dataset.traceCount='0';inspectorPinned=false;inspect(0);updateDiagnostics();if(text)status(text);
    }
    function inViewport() {const rect=host.getBoundingClientRect();return rect.bottom>0&&rect.top<window.innerHeight;}
    function active() {return !destroyed&&!paused&&!motion.matches&&visible&&!document.hidden&&phase==='travel'&&Boolean(travel);}
    function schedule() {if(active()&&!frame){previous=performance.now();frame=requestAnimationFrame(tick);}}
    function sync() {if(!active())stopFrame();else schedule();host.dataset.paused=String(paused||document.hidden||!visible);}
    function paintPacket() {
      if(!packet||!travel)return;const curve=connections[travel.from];if(!curve)return;
      const t=clamp((clock-travel.born)/travel.duration,0,1),point=cubic(curve.a,curve.b,curve.c,curve.d,t);
      packet.setAttribute('cx',point.x.toFixed(2));packet.setAttribute('cy',point.y.toFixed(2));packet.setAttribute('opacity','1');
    }
    function tick(now) {
      frame=0;if(!active())return;clock+=Math.min(50,Math.max(0,now-previous));previous=now;paintPacket();host.dataset.elapsed=String(Math.round(clock));
      if(clock-travel.born>=travel.duration){const target=travel.to;connections[travel.from].path.dataset.state='done';travel=null;packet.setAttribute('opacity','0');arrive(target);}
      if(active())frame=requestAnimationFrame(tick);else previous=0;
    }
    function transit(target) {
      phase='travel';const from=target-1;connections[from].path.dataset.state='active';travel={from,to:target,born:clock,duration:650};updateDiagnostics();
      if(motion.matches||paused){connections[from].path.dataset.state='done';travel=null;arrive(target);}else{paintPacket();schedule();}
    }
    function stopAt(index,text,tone) {phase=tone==='duplicate'?'duplicate':'stopped';travel=null;stopFrame();setState(index,tone==='duplicate'?'duplicate':'error');traceEvent(text,tone==='duplicate'?'warn':'error');status(text);if(!inspectorPinned)inspect(index);updateDiagnostics();}
    function prepare(source) {
      const flow=FLOWS[selected],payload={flow:selected,source,kind:flow.kind,validation:{required:true,minLength:3,passed:true}};
      if(selected==='fullstack')payload.request={method:'POST',route:'/local/projects',body:{title:source}};
      if(selected==='automation')payload.job={queue:'local',input:source,state:'prepared'};
      if(selected==='mobile')payload.view={title:source,state:'prepared'};
      if(selected==='event')payload.submission={caption:source,visibility:'pending'};
      if(selected==='textile')payload.order={reference:source,quality:'pending'};
      if(selected==='content')payload.draft={title:source,publication:'pending'};
      if(selected==='community')payload.event={message:source,externalAction:false};
      return payload;
    }
    function arrive(index) {
      if(destroyed||!current||current.token!==generation||current.flow!==selected)return;
      setState(index-1,'done');setState(index,'active');
      if(index===1){
        if(current.source.length<3){snapshots[1]={input:current.source,validation:{passed:false,reason:'En az 3 karakter gerekli.'}};stopAt(1,'Girdi eksik. En az 3 karakter yaz; hiçbir kayıt eklenmedi.','error');return;}
        const existing=records.get(selected).get(current.key);
        if(existing){snapshots[1]={input:current.source,duplicate:true,existingRecord:existing};stopAt(1,'Bu girdi zaten bu oturumda kayıtlı. İkinci kayıt eklenmedi.','duplicate');return;}
        current.prepared=prepare(current.source);snapshots[1]=current.prepared;traceEvent('Girdi doğrulandı; yerel veri hazırlandı.','good');if(!inspectorPinned)inspect(1);transit(2);return;
      }
      if(index===2){
        phase='awaiting';stopFrame();snapshots[2]={...current.prepared,approval:{required:true,state:'pending'},stored:false};setState(2,'awaiting');traceEvent('İnsan kararı bekleniyor. Henüz kayıt yok.','warn');status('Kontrol noktası · Veriyi incele. Devam et veya durdur.');if(!inspectorPinned)inspect(2);updateDiagnostics();return;
      }
      if(index===3){
        if(!current.approved){stopAt(3,'Onay olmadan kayıt eklenmedi.','error');return;}
        let record=records.get(selected).get(current.key);
        if(!record){record={id:'local-'+(++recordSerial),flow:selected,source:current.source,data:current.prepared,approved:true,storage:'bu tarayıcı oturumu'};records.get(selected).set(current.key,record);}
        snapshots[3]={record,stored:true,externalRequest:false};setState(2,'done');setState(3,'done');phase='complete';travel=null;stopFrame();traceEvent(FLOWS[selected].output+' eklendi.','good');status('Tamamlandı · Onayladığın veri yalnız bu oturumdaki yerel kayda eklendi.');if(!inspectorPinned)inspect(3);updateDiagnostics();
      }
    }
    function run() {
      if(destroyed||phase==='travel'||phase==='awaiting')return;
      cancel();visible=inViewport();current={token:generation,flow:selected,source:sample.value.trim().replace(/\s+/g,' '),key:normalized(sample.value),id:++runSerial,startedAt:clock,approved:false};
      snapshots[0]={run:'local-run-'+current.id,flow:selected,input:current.source,externalRequest:false};setState(0,'active');traceEvent('Örnek girdi alındı.','info');status('Girdiyi doğrulama adımına taşıyoruz.');inspect(0);transit(1);
    }
    function decision(accepted) {
      if(destroyed||phase!=='awaiting'||!current||current.token!==generation||current.flow!==selected)return;
      if(!accepted){snapshots[2]={...snapshots[2],approval:{required:true,state:'rejected'},stored:false};setState(2,'stopped');phase='stopped';traceEvent('Sen durdurdun; kayıt eklenmedi.','warn');status('Durduruldu · Hazırlanan veri kayda eklenmedi.');if(!inspectorPinned)inspect(2);updateDiagnostics();return;}
      current.approved=true;snapshots[2]={...snapshots[2],approval:{required:true,state:'approved'},stored:false};setState(2,'done');traceEvent('Devam kararı verildi.','good');if(!inspectorPinned)inspect(2);transit(3);
    }
    function draw() {
      graphCleanups.splice(0).forEach(remove=>remove());stage.replaceChildren();nodes=[];connections=[];
      const mobile=small.matches,width=mobile?360:760,height=mobile?326:360,cardWidth=mobile?158:145,cardHeight=94;
      const positions=mobile?[{x:12,y:48},{x:190,y:48},{x:190,y:204},{x:12,y:204}]:[{x:20,y:56},{x:205,y:180},{x:390,y:56},{x:575,y:180}];
      stage.setAttribute('viewBox',`0 0 ${width} ${height}`);stage.setAttribute('role','group');stage.removeAttribute('aria-labelledby');stage.setAttribute('aria-label',FLOWS[selected].title+'. Dört aşama. Aşamalara basarak yerel veriyi incele.');stage.setAttribute('preserveAspectRatio','xMidYMid meet');stage.dataset.layout=mobile?'grid':'serpentine';
      stage.append(svg('title',{},FLOWS[selected].title),svg('desc',{},'Yerel bir deney. Veriyi değiştir, kontrol noktasında karar ver, aynı girdinin tekrar eklenmediğini gör.'));
      stage.append(svg('text',{x:mobile?12:20,y:23,class:'lab-flow-caption'},'04 AŞAMA / VERİYE DOKUN'));
      positions.slice(0,-1).forEach((point,index)=>{
        const next=positions[index+1],vertical=mobile&&point.x===next.x;let a,d,b,c;
        if(vertical){a={x:point.x+cardWidth/2,y:point.y+cardHeight};d={x:next.x+cardWidth/2,y:next.y};const middle=(a.y+d.y)/2;b={x:a.x,y:middle};c={x:d.x,y:middle};}
        else {const right=next.x>point.x;a={x:point.x+(right?cardWidth:0),y:point.y+cardHeight/2};d={x:next.x+(right?0:cardWidth),y:next.y+cardHeight/2};const middle=(a.x+d.x)/2;b={x:middle,y:a.y};c={x:middle,y:d.y};}
        const path=svg('path',{class:'lab-flow-path',d:`M${a.x} ${a.y}C${b.x} ${b.y} ${c.x} ${c.y} ${d.x} ${d.y}`});path.dataset.state=states[index]==='done'?'done':'idle';stage.append(path);connections.push({path,a,b,c,d});
      });
      packet=svg('circle',{class:'lab-flow-packet',r:4,opacity:0});stage.append(packet);
      positions.forEach((point,index)=>{
        const group=svg('g',{class:'lab-flow-node',transform:`translate(${point.x} ${point.y})`,role:'button',tabindex:0,'aria-label':`${index+1}. ${FLOWS[selected].nodes[index]}. Veriyi incele.`, 'aria-pressed':String(selectedStep===index)});group.dataset.labStep=String(index);group.dataset.state=states[index];
        group.append(svg('rect',{width:cardWidth,height:cardHeight,rx:16}),svg('text',{x:14,y:24,class:'lab-flow-number'},String(index+1).padStart(2,'0')),svg('circle',{cx:cardWidth-17,cy:20,r:3,class:'lab-flow-led'}),svg('text',{x:14,y:54,class:'lab-flow-name'},FLOWS[selected].nodes[index]),svg('text',{x:14,y:77,class:'lab-flow-kind'},['GİRDİ','KONTROL','SENİN KARARIN','YEREL ÇIKTI'][index]));
        listen(group,'click',()=>inspect(index,true),graphCleanups);listen(group,'keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();inspect(index,true);}},graphCleanups);nodes.push({group});stage.append(group);
      });
      inspect(selectedStep);if(travel){connections[travel.from].path.dataset.state='active';paintPacket();}
    }
    function selectFlow(key) {
      if(!FLOWS[key]||destroyed)return;cancel();selected=key;sample.value=FLOWS[key].sample;scenario.value='valid';title.textContent=FLOWS[key].title;description.textContent=FLOWS[key].description;
      tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.labProject===key)));draw();updateDiagnostics();status('Girdiyi değiştir veya bir durum seç. Aşamalara basıp veriyi inceleyebilirsin.');
    }
    tabs.forEach(tab=>listen(tab,'click',()=>selectFlow(tab.dataset.labProject)));
    listen(runButton,'click',run);listen(resetButton,'click',()=>{cancel('Akış sıfırlandı. Bu oturumdaki önceki kayıtlar korunuyor.');});
    listen(approve,'click',()=>decision(true));listen(reject,'click',()=>decision(false));
    listen(sample,'input',()=>{scenario.value='valid';cancel('Girdi değişti. Yeni değerle akışı başlatabilirsin.');});
    listen(scenario,'change',()=>{const mode=scenario.value,last=[...records.get(selected).values()].at(-1);sample.value=mode==='missing'?'':mode==='repeat'?(last?.source||FLOWS[selected].sample):FLOWS[selected].sample;cancel(mode==='repeat'?'Aynı girdiyi çalıştır. Daha önce kaydedildiyse ikinci kayıt eklenmez.':'Bu girdiyi çalıştırıp kontrol sonucunu izle.');});
    listen(document,'visibilitychange',sync);listen(window,'resize',draw);
    const preferenceChanged=()=>{if(motion.matches&&phase==='travel'&&travel){const target=travel.to;connections[travel.from].path.dataset.state='done';travel=null;stopFrame();arrive(target);}else sync();};
    if(motion.addEventListener)listen(motion,'change',preferenceChanged);
    if(typeof IntersectionObserver!=='undefined'){const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.02});observer.observe(host);cleanups.push(()=>observer.disconnect());}
    else listen(window,'scroll',()=>{visible=inViewport();sync();});
    visible=inViewport();selectFlow(selected);
    function destroy() {
      if(destroyed)return;destroyed=true;generation++;stopFrame();cleanups.splice(0).forEach(remove=>remove());graphCleanups.splice(0).forEach(remove=>remove());travel=null;current=null;
      if(viewportParent){if(viewportNext&&viewportNext.parentNode===viewportParent)viewportParent.insertBefore(viewport,viewportNext);else viewportParent.append(viewport);}workbench.remove();host.classList.remove('has-live-lab');runButton.disabled=false;
    }
    destroy.destroy=destroy;destroy.setPaused=value=>{paused=Boolean(value);sync();};return destroy;
  }
  window.SystemLab=Object.freeze({mount});
})();

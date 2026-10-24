(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const RELATIONS=[['idolog','textile','aciktinmi'],['content','dm','community'],['textile','idolog','aciktinmi'],['aciktinmi','gorgez'],['portfolio'],['portfolio','event'],['textile'],['idolog','event','paulukizlar']];
  function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function mount({host,capabilities,projects,onProject}){
    if(!host)return null;
    host.classList.add('capability-map');host.removeAttribute('aria-hidden');
    const heading=element('div','cap-map-heading'),label=element('span','','ALAN → ÇALIŞMA'),title=element('strong');
    heading.append(label,title);
    const network=element('div','cap-map-network'),wires=document.createElementNS(NS,'svg');wires.setAttribute('viewBox','0 0 360 300');wires.setAttribute('preserveAspectRatio','none');wires.setAttribute('aria-hidden','true');wires.classList.add('cap-map-wires');
    const core=element('span','cap-map-core','mk');core.setAttribute('aria-hidden','true');core.append(element('i','','✳'));
    const links=element('div','cap-map-links'),tools=element('div','cap-map-tools'),hint=element('p','cap-map-hint','Bir bağlantı seç; projenin içine gir.');
    network.append(wires,core,links);host.replaceChildren(heading,network,tools,hint);
    let destroyed=false,selected=-1;
    function select(index){
      if(destroyed||index===selected)return;
      selected=index;const capability=capabilities[index];if(!capability)return;
      title.textContent=capability.title;host.dataset.selection=String(index);
      const related=(RELATIONS[index]||[]).map(id=>projects.find(p=>p.id===id)).filter(Boolean);
      const slots=related.length===1?[1]:related.length===2?[0,2]:[0,1,2];
      const buttons=[],paths=[];
      related.forEach((project,i)=>{
        const slot=slots[i],button=element('button','cap-map-project'),name=project.title.split(' — ')[0];
        button.type='button';button.dataset.project=project.id;button.style.setProperty('--map-slot',slot);button.setAttribute('aria-label',capability.title+': '+project.title+' detaylarını aç');
        const meta=element('small','',project.status),text=element('b','',name),arrow=element('span','','↗');arrow.setAttribute('aria-hidden','true');button.append(meta,text,arrow);
        button.addEventListener('click',()=>onProject?.(projects.indexOf(project)));
        buttons.push(button);
        const path=document.createElementNS(NS,'path'),y=68+slot*90;
        path.setAttribute('d',`M94 150C122 150 112 ${y} 144 ${y}`);path.style.setProperty('--map-delay',i*80+'ms');paths.push(path);
      });
      links.replaceChildren(...buttons);wires.replaceChildren(...paths);
      tools.replaceChildren(...capability.tools.slice(0,3).map(tool=>element('span','',tool)));
      host.dataset.connections=String(related.length);
    }
    select(0);
    return {select,setPaused(value){host.classList.toggle('is-paused',Boolean(value));},destroy(){destroyed=true;host.replaceChildren();}};
  }
  window.CapabilityMap=Object.freeze({mount});
})();

(() => {
  'use strict';
  const SVG='http://www.w3.org/2000/svg',HTML='http://www.w3.org/1999/xhtml';
  const arrow='M4 12h16m-6-6 6 6-6 6';
  const symbols={
    '→':['arrow-right',arrow], '↗':['arrow-up-right',arrow,-45],
    '↑':['arrow-up',arrow,-90], '↖':['arrow-up-left',arrow,-135],
    '←':['arrow-left',arrow,180], '↙':['arrow-down-left',arrow,135],
    '↓':['arrow-down',arrow,90], '↘':['arrow-down-right',arrow,45],
    '↔':['arrows-horizontal','M3 12h18M7 8l-4 4 4 4m10-8 4 4-4 4'],
    '↕':['arrows-vertical','M12 3v18M8 7l4-4 4 4m-8 10 4 4 4-4'],
    '↺':['rotate-left','M4 11a8 8 0 1 1 2 7M4 4v7h7'],
    '↻':['rotate-right','M4 11a8 8 0 1 1 2 7M4 4v7h7',0,'translate(24 0) scale(-1 1)'],
    '↳':['turn-right','M5 4v9h14m-5-5 5 5-5 5'],
    '↵':['return','M20 5v8H4m5-5-5 5 5 5'],
    '✳':['asterisk','M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4 18.4 5.6'],
    '✦':['sparkle','m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z'],
    'Ⅱ':['pause','M8 5v14M16 5v14'],
    '▷':['play','m8 5 11 7-11 7Z'],
    '✓':['check','m5 12 4 4L19 6'],
    '✕':['close','m6 6 12 12M18 6 6 18'],
    '✖':['close','m6 6 12 12M18 6 6 18'],
    '×':['close','m6 6 12 12M18 6 6 18']
  };
  const pattern=/[→↗↑↖←↙↓↘↔↕↺↻↳↵✳✦Ⅱ▷✓✕✖×][\uFE0E\uFE0F]?/gu;
  const hasSymbol=/[→↗↑↖←↙↓↘↔↕↺↻↳↵✳✦Ⅱ▷✓✕✖×]/u;
  const excluded='script,style,template,noscript,pre,code,input,textarea,select,option,[contenteditable]:not([contenteditable="false"]),[data-ui-icons="off"],.luci-thought,.narrator-terminal,.cos-terminal-output,.cos-code,.cos-live-preview';
  let active=null,serial=0;
  function mount(){
    if(active)return active;
    const root=document.body;if(!root)return {destroy(){}};
    let destroyed=false;const owner=String(++serial);
    function blocked(node){
      return Boolean(node&&(node.namespaceURI&&node.namespaceURI!==HTML||node.isContentEditable||node.closest?.(excluded)));
    }
    function icon(glyph){
      const entry=symbols[glyph[0]],svg=document.createElementNS(SVG,'svg'),path=document.createElementNS(SVG,'path');
      svg.setAttribute('class','ui-icon');svg.setAttribute('viewBox','0 0 24 24');
      svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('role','presentation');
      svg.setAttribute('data-ui-icon',entry[0]);svg.setAttribute('data-ui-glyph',glyph);
      svg.setAttribute('data-ui-owner',owner);
      svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');
      svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
      path.setAttribute('d',entry[1]);
      if(entry[3])path.setAttribute('transform',entry[3]);else if(entry[2])path.setAttribute('transform','rotate('+entry[2]+' 12 12)');
      if(entry[0]==='pause')path.setAttribute('stroke-width','2.5');
      if(entry[0]==='play'){path.setAttribute('fill','currentColor');path.setAttribute('stroke','none');}
      svg.append(path);return svg;
    }
    function decorate(text){
      if(!text.parentNode||blocked(text.parentElement))return;
      const value=text.nodeValue;if(!value||!hasSymbol.test(value))return;
      const matches=[...value.matchAll(pattern)].filter(match=>match[0][0]!=='×'||value.trim()==='×'&&text.parentElement.closest('button,[role="button"]'));
      if(!matches.length)return;
      const fragment=document.createDocumentFragment();let cursor=0;
      for(const match of matches){
        if(match.index>cursor)fragment.append(document.createTextNode(value.slice(cursor,match.index)));
        fragment.append(icon(match[0]));cursor=match.index+match[0].length;
      }
      if(cursor<value.length)fragment.append(document.createTextNode(value.slice(cursor)));
      text.parentNode.replaceChild(fragment,text);
    }
    function scan(node){
      if(destroyed||!node)return;
      if(node.nodeType===3){decorate(node);return;}
      if(node.nodeType!==1&&node.nodeType!==11)return;
      if(node.nodeType===1&&blocked(node))return;
      for(const child of [...node.childNodes])scan(child);
    }
    scan(root);root.classList.add('has-ui-icons');
    const observer=typeof MutationObserver==='function'?new MutationObserver(records=>{
      if(destroyed)return;
      const nodes=new Set();
      for(const record of records){
        if(record.type==='characterData')nodes.add(record.target);
        else for(const node of record.addedNodes)nodes.add(node);
      }
      for(const node of nodes)if(node.isConnected!==false)scan(node);
    }):null;
    observer?.observe(root,{subtree:true,childList:true,characterData:true});
    const api={destroy(){
      if(destroyed)return;destroyed=true;observer?.disconnect();
      root.querySelectorAll('svg[data-ui-owner="'+owner+'"]').forEach(svg=>svg.replaceWith(document.createTextNode(svg.getAttribute('data-ui-glyph'))));
      root.classList.remove('has-ui-icons');if(active===api)active=null;
    }};
    active=api;return api;
  }
  window.UIIcons=Object.freeze({mount});
})();

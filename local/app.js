const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const refreshIcons = () => window.lucide?.createIcons();
const evidence = window.STYLE_ATLAS_EVIDENCE || [];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const caseConfig = {
  poster:{title:'从一张海报，带走一套配色。',palette:'color',fields:[['色彩关系','color','relationships'],['复用建议','color','application']],takeaway:'拿走主色、强调色和比例建议，为新的节庆视觉建立配色起点。'},
  lighting:{title:'从一张摄影，读懂光的方向。',palette:'toneAndSurface',fields:[['可见证据','lightEvidence','direction'],['影调关系','toneAndSurface','tonalRelations']],takeaway:'带走可尝试的布光方案与检查点。分析保留不确定项，便于试拍时验证。'},
  character:{title:'从一个角色，找到识别的关键。',palette:'identityFeatures',fields:[['形体语言','characterForm','shapeLanguage'],['变体原则','variationGuidance','invariants']],takeaway:'区分角色必须保留的识别特征和可以变化的部分，让表情与造型扩展有依据。'}
};
let activeCase='poster', activeShot='library', toastTimer;
const getEvidence = key => evidence.find(item => item.key === key);
function dataField(record,module,field){return record?.analysis.modules?.[module]?.data?.[field];}
function excerpt(value,limit=115){const text=Array.isArray(value)?value.join(' '):String(value||'');if(text.length<=limit)return text;const end=text.slice(0,limit).lastIndexOf('；');return text.slice(0,end>45?end:limit)+'…';}
function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('visible'),2800);}
async function copyText(text,label='内容'){
  const previous=document.activeElement;
  try{
    try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);}
    catch{const field=document.createElement('textarea');field.value=text;field.style.cssText='position:fixed;top:0;left:0;opacity:0';(document.querySelector('dialog[open]')||document.body).append(field);field.select();const copied=document.execCommand('copy');field.remove();previous?.focus({preventScroll:true});if(!copied)throw new Error('Copy denied');}
    toast(`${label}已复制`);
  }catch{toast(`复制未完成，请手动选择${label}`);}
}
const nativeFrame=$('#native-demo'), workspace=$('#native-workspace'), viewport=$('#native-viewport');
const dropTarget=document.createElement('div');
dropTarget.className='native-drop-target';dropTarget.setAttribute('aria-hidden','true');
dropTarget.innerHTML='<i data-lucide="image-plus" aria-hidden="true"></i><strong>松开图片，放入素材库</strong>';
viewport.append(dropTarget);
let demoReady=false, demoStage='import', expanded=false, previousOverflow='', priorFocus;
const guides={
  import:[0,'把左侧图片拖进素材库','也可以点击图片，开始这次光影研究。','放入参考图'],
  rule:[1,'选择「摄影与光影研究」','点击工具顶部高亮的规则选项，决定这次关注什么。','定位规则'],
  analyze:[2,'规则选好了，开始分析','点击工具右上角的分析按钮，让这张参考留下可复用的思路。','定位分析按钮'],
  processing:[2,'正在整理这次光影研究','准备光源、影调与布光建议，随后打开完整分析记录。','整理中'],
  result:[3,'光的方向，变成下次创作的起点','向下浏览右侧详情，查看光影依据、布光方案与可复制的提示词。','查看分析结果']
};
const messageToDemo=(action,extra={})=>nativeFrame.contentWindow?.postMessage({channel:'style-atlas-parent',action,...extra},'*');
function updateGuide(stage,detail={}){
  if(!guides[stage])return;
  demoStage=stage;
  const [step,title,description,action]=guides[stage];
  $('#guide-title').textContent=title;
  $('#guide-description').textContent=detail.label||description;
  if(stage==='result'&&detail.referenceKey&&detail.referenceKey!=='lighting'){
    $('#guide-title').textContent='分析已就位，带回下一次创作';
    $('#guide-description').textContent='浏览完整分析、参考色板与可复用提示词，把观察变成创作的依据。';
  }
  $('#guide-next').innerHTML=`${action}<i data-lucide="${stage==='processing'?'loader-circle':'arrow-right'}" aria-hidden="true"></i>`;
  $('#guide-next').disabled=!demoReady||stage==='processing';
  $$('[data-step]').forEach(node=>{const index=Number(node.dataset.step);node.classList.toggle('is-done',index<step);if(index===step)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');});
  $('#guide-progress').style.width=`${stage==='processing'?50+(detail.progress||0)/4:stage==='result'?100:step*25}%`;
  workspace.dataset.stage=stage;
  $('#reference-drag').classList.toggle('is-imported',stage!=='import');
  $('.experience-note span').textContent='样图流程演示 · 展示已有分析记录，不调用模型，不读取或上传你的图片。';
  refreshIcons();
}
function sizeDemo(){
  const available=viewport.clientWidth;
  const mobile=available<=600;
  const logicalWidth=mobile?Math.max(360,available):Math.max(1180,available);
  const scale=available/logicalWidth;
  const height=expanded?Math.max(320,innerHeight-(innerWidth<=600?213:194)):mobile?500:Math.round(670*scale);
  nativeFrame.style.width=`${logicalWidth}px`;
  nativeFrame.style.height=`${Math.round(height/scale)}px`;
  nativeFrame.style.transform=`scale(${scale})`;
  viewport.style.height=`${height}px`;
}
function expandDemo(value){
  if(value===expanded)return;
  expanded=value;
  if(value){priorFocus=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
  else document.body.style.overflow=previousOverflow;
  workspace.classList.toggle('is-expanded',value);
  if(value){workspace.setAttribute('role','dialog');workspace.setAttribute('aria-modal','true');workspace.setAttribute('aria-label','Style Atlas 交互体验');}
  else{workspace.removeAttribute('role');workspace.removeAttribute('aria-modal');workspace.removeAttribute('aria-label');}
  for(const node of $$('.header,.hero,.experience-intro,.demo-heading,.reference-source,.experience-note,main>section:not(.experience-section),.footer'))node.inert=value;
  const button=$('#expand-demo');button.setAttribute('aria-pressed',String(value));button.setAttribute('aria-label',value?'收起工具界面':'放大工具界面');button.title=value?'收起工具界面':'放大工具界面';button.innerHTML=`<i data-lucide="${value?'minimize-2':'maximize-2'}" aria-hidden="true"></i>`;
  refreshIcons();sizeDemo();if(value)button.focus();else priorFocus?.focus({preventScroll:true});
}
new ResizeObserver(sizeDemo).observe(viewport);
window.addEventListener('resize',sizeDemo);
nativeFrame.addEventListener('load',()=>messageToDemo('handshake'));
window.addEventListener('message',event=>{
  if(event.source!==nativeFrame.contentWindow||event.data?.channel!=='style-atlas-demo')return;
  const detail=event.data;
  if(detail.stage==='ready'){demoReady=true;$('#reference-drag').disabled=false;$('#source-import').disabled=false;updateGuide(detail.currentStage);return;}
  if(detail.stage==='escape'){if(expanded)expandDemo(false);return;}
  if(detail.stage==='copied')return;
  updateGuide(detail.stage,detail);
});
$('#reference-drag').addEventListener('dragstart',event=>{event.dataTransfer.setData('application/x-style-atlas-reference','lighting');event.dataTransfer.effectAllowed='copy';document.body.classList.add('reference-in-flight');});
$('#reference-drag').addEventListener('dragend',()=>document.body.classList.remove('reference-in-flight'));
dropTarget.addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect='copy';dropTarget.classList.add('is-over');});
dropTarget.addEventListener('dragleave',()=>dropTarget.classList.remove('is-over'));
dropTarget.addEventListener('drop',event=>{
  event.preventDefault();dropTarget.classList.remove('is-over');document.body.classList.remove('reference-in-flight');
  if(event.dataTransfer.getData('application/x-style-atlas-reference')==='lighting')messageToDemo('import-reference');
});
window.addEventListener('dragover',event=>{if(event.dataTransfer.types.includes('Files'))event.preventDefault();});
window.addEventListener('drop',event=>{if(event.dataTransfer.types.includes('Files')){event.preventDefault();toast('网页体验仅使用光影样图，点击样图即可开始');}});
function selectCase(key){
  const record=getEvidence(key);if(!record)return;activeCase=key;const config=caseConfig[key];
  $$('[data-case]').forEach(button=>{const selected=button.dataset.case===key;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
  $('#case-panel').setAttribute('aria-labelledby',`case-${key}`);$('#case-image').src=record.image;$('#case-image').alt=record.title;$('.case-artwork').dataset.case=key;
  $('#case-index').textContent=`REFERENCE / 00${evidence.indexOf(record)+1}`;$('#case-title').textContent=config.title;$('#case-lead').textContent=excerpt(record.analysis.summary,122);
  $('#case-observations').innerHTML=config.fields.map(([title,module,field])=>`<div class="observation-row"><strong>${title}</strong><p>${escapeHTML(excerpt(dataField(record,module,field),100))}</p></div>`).join('');
  $('#case-palette').innerHTML=(dataField(record,config.palette,'palette')||[]).map(color=>`<button class="case-swatch" data-color="${escapeHTML(color.hex)}" title="复制 ${escapeHTML(color.hex)}" aria-label="复制色值 ${escapeHTML(color.hex)}"><b style="background:${escapeHTML(color.hex)}"></b><span>${escapeHTML(color.hex)}</span></button>`).join('');
  $('#case-takeaway').textContent=config.takeaway;$('#case-model').textContent=`${record.model} · 规则 v${record.ruleVersion}`;
  if(!motion.matches)$('#case-panel').animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
}
const shots={library:['素材库','浏览、标签、收藏与搜索，让积累的参考真正找得到。'],analysis:['分析详情','设计观察、参考色板和提示词，与原图一起保存。'],skills:['Skills','浏览电脑上的 Skills，管理来源、收藏与 Agent 同步。'],mcps:['MCP','查看 MCP 配置、启停状态与连接信息。']};
function selectShot(key){activeShot=key;$$('[data-shot]').forEach(button=>{const selected=button.dataset.shot===key;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});$('#software-image').src=`assets/product/${key}.png`;$('#software-image').alt=`Style Atlas 真实${shots[key][0]}界面`;$('#shot-description').textContent=shots[key][1];$('#software-panel').setAttribute('aria-labelledby',`shot-${key}`);if(!motion.matches)$('#software-image').animate([{opacity:.4},{opacity:1}],{duration:350});}
document.addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.matches('[data-contact]'))$('#contact-dialog').showModal();
  else if(target.matches('[data-copy-wechat]'))copyText('HelloYahui','微信号');
  else if(target.matches('[data-close-dialog]'))target.closest('dialog').close();
  else if(target.matches('[data-color]'))copyText(target.dataset.color,'色值');
  else if(target.matches('[data-case]'))selectCase(target.dataset.case);
  else if(target.matches('[data-shot]'))selectShot(target.dataset.shot);
  else if(['reference-drag','source-import'].includes(target.id))messageToDemo('import-reference');
  else if(target.id==='guide-next')messageToDemo(demoStage==='import'?'import-reference':'guide-focus');
  else if(target.id==='reset-demo')messageToDemo('reset');
  else if(target.id==='expand-demo')expandDemo(!expanded);
  else if(target.id==='open-case'){messageToDemo('open-case',{key:activeCase});$('#playground').scrollIntoView({behavior:motion.matches?'auto':'smooth',block:'start'});}
  else if(target.id==='expand-shot'){$('#lightbox-image').src=`assets/product/${activeShot}.png`;$('#screenshot-dialog').showModal();}
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&expanded){expandDemo(false);return;}
  const tab=event.target.closest('[role="tab"]');if(!tab)return;
  const tabs=$$('[role="tab"]',tab.closest('[role="tablist"]'));const index=tabs.indexOf(tab);let next;
  if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
  event.preventDefault();tabs[next].focus();tabs[next].click();
});
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}));
if(!motion.matches){document.documentElement.classList.add('has-motion');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.06});$$('.reveal').forEach(node=>observer.observe(node));}
let framePending=false;window.addEventListener('scroll',()=>{if(framePending)return;framePending=true;requestAnimationFrame(()=>{framePending=false;const range=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.transform=`scaleX(${range?scrollY/range:0})`;});},{passive:true});
const sectionObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)$$('.header nav a').forEach(link=>link.classList.toggle('is-current',link.hash===`#${entry.target.id}`));});},{rootMargin:'-15% 0px -50% 0px'});$$('#playground,#insight,#software').forEach(node=>sectionObserver.observe(node));
selectCase('poster');refreshIcons();sizeDemo();
messageToDemo('handshake');
const showcase=$('#hero-showcase');
Promise.allSettled($$('.hero-art img').map(image=>image.decode())).then(()=>{
  if(motion.matches)return;
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){showcase.classList.add('is-arriving');observer.disconnect();}
  },{threshold:.12});observer.observe(showcase);
});

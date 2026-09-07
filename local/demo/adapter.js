(() => {
  'use strict';
  const fixtures = window.STYLE_ATLAS_DEMO_FIXTURES;
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const list = items => ({items, total:items.length});
  const photography = 'official-photography-lighting';
  const agents = {items:[{id:'codex',name:'Codex CLI',type:'builtin',adapter:'codex',command:'codex',builtIn:true,authMode:'account'},{id:'workbuddy',name:'WorkBuddy',type:'builtin',adapter:'workbuddy',command:'codebuddy',builtIn:true,authMode:'account'}],selectedId:'workbuddy'};
  const provider = () => ({id:agents.selectedId,label:agents.selectedId==='codex'?'Codex CLI':'WorkBuddy',ready:true,status:'ready',message:'网页流程演示，未连接实际模型',model:'演示模式'});
  let assets=[], jobs=[], collections=[], trash=[], rules=clone(fixtures.analysisRules), skills=clone(fixtures.skills), mcps=clone(fixtures.mcps);
  let stage='import', currentId=null, sequence=0, generation=0;
  const timers = new Map();
  const item = id => assets.find(asset => String(asset.id)===String(id));
  const reference = asset => fixtures.records.find(record => record.key===asset?.referenceKey);
  const expectedRule = asset => reference(asset)?.ruleId || photography;
  const targetSelector = () => stage==='import'?'#import-button':stage==='rule'?'#analysis-rule-select':stage==='analyze'?'#recognize-button':stage==='processing'?'#queue-bar':'.inspector-analysis-heading';
  function highlight() {
    const target = document.querySelector(targetSelector());
    document.querySelectorAll('.demo-guide-target').forEach(node => {if(node!==target)node.classList.remove('demo-guide-target');});
    if(stage!=='processing')target?.classList.add('demo-guide-target');
  }
  function send(next=stage, extra={}) {
    if(!['ready','copied','escape'].includes(next))stage=next;
    parent.postMessage({channel:'style-atlas-demo',stage:next,currentStage:stage,assetId:currentId,referenceKey:item(currentId)?.referenceKey||null,...extra},'*');
    requestAnimationFrame(highlight);
  }
  function ruleChanged(id) {
    rules.selectedId=id;
    if(['rule','analyze'].includes(stage))send(id===expectedRule(item(currentId))?'analyze':'rule');
  }
  function stats() {
    return {totalAssets:assets.length,availableAssets:assets.length,analyzedAssets:assets.filter(asset=>asset.currentAnalysis).length,pendingAssets:assets.filter(asset=>asset.analysisStatus==='pending').length,favoriteAssets:assets.filter(asset=>asset.favorite).length,collections:collections.length,trashItems:trash.length};
  }
  function bootstrap() {
    return {version:'1.1.1',stats:stats(),assets:list(assets),jobs:list(jobs),settings:{selectedAgentId:agents.selectedId,selectedAnalysisRuleId:rules.selectedId},provider:provider(),agents,analysisRules:rules,analysisContracts:fixtures.analysisContracts,skills:list(skills),mcps:list(mcps),collections,tags:[],trash,facets:{},paths:{inbox:'网页演示素材库',database:'当前浏览器内存'},appUpdate:{configured:false},license:{}};
  }
  function cancel(id) {
    (timers.get(String(id))||[]).forEach(clearTimeout);
    timers.delete(String(id));
  }
  async function complete(asset) {
    const version=generation;
    const record=reference(asset);
    if(!record)return;
    const analysis=clone(record.analysis);
    asset.analysisStatus='complete';
    asset.currentAnalysis={id:`analysis-${asset.id}`,version:1,provider:record?.provider||'网页演示',model:record?.model||'预设流程说明',ruleId:record?.ruleId||rules.selectedId,ruleVersion:record?.ruleVersion||'1.0.0',analysis,createdAt:record?.analyzedAt||now()};
    asset.updatedAt=now();
    const job=jobs.find(job=>job.assetId===asset.id);
    if(job){job.state='complete';job.progress=100;job.updatedAt=now();}
    currentId=asset.id;
    await window.styleAtlasDemoClient?.showResult(asset.id);
    if(version!==generation||!item(asset.id))return;
    send('result',{preset:!record});
  }
  async function importAsset(body) {
    const version=generation;
    const key=fixtures.records.find(record=>record.media===body.data)?.key;
    if(!key)throw new Error('网页体验仅支持内置样图');
    const image=new Image();image.src=body.data;
    try{await image.decode();}catch{throw new Error('图片无法读取，请换一张图片');}
    if(version!==generation)throw new Error('体验已重置，请重新导入');
    const existing=key&&assets.find(asset=>asset.referenceKey===key);
    if(existing){currentId=existing.id;send(existing.currentAnalysis?'result':rules.selectedId===expectedRule(existing)?'analyze':'rule');return {asset:existing};}
    const asset={id:String(++sequence),title:key==='lighting'?'窗边人像 · 光影研究':body.name,fileName:body.name,relativePath:body.name,mediaUrl:body.data,mimeType:body.type,width:image.naturalWidth,height:image.naturalHeight,fileSize:Math.round(body.data.length*.75),fileStatus:'available',analysisStatus:'pending',createdAt:now(),updatedAt:now(),sourceUrl:'',rightsNote:'',notes:key?'':'网页流程示例：不上传图片，不调用模型。',discipline:'',favorite:false,referenceKey:key||null};
    assets.unshift(asset);currentId=asset.id;
    send(rules.selectedId===expectedRule(asset)?'analyze':'rule',{preset:!key});
    return {asset};
  }
  async function route(path,method,body,url) {
    if(path==='/api/bootstrap')return bootstrap();
    if(path==='/api/import'&&method==='POST')return importAsset(body);
    if(path==='/api/assets'){
      let result=assets.slice();const query=url.searchParams.get('query')?.toLowerCase(),status=url.searchParams.get('status'),collectionId=url.searchParams.get('collectionId');
      if(query)result=result.filter(asset=>`${asset.title} ${asset.notes} ${asset.fileName}`.toLowerCase().includes(query));
      if(status)result=result.filter(asset=>asset.analysisStatus===status);
      if(collectionId)result=result.filter(asset=>collections.find(collection=>collection.id===collectionId)?.items?.includes(asset.id));
      if(url.searchParams.get('sort')==='oldest')result.reverse();
      return list(result);
    }
    if(path==='/api/jobs'){const states=url.searchParams.get('state')?.split(',');return list(states?jobs.filter(job=>states.includes(job.state)):jobs);}
    if(path==='/api/analysis-rules'||path==='/api/analysis-rules/sync')return rules;
    if(path==='/api/providers')return provider();
    if(path==='/api/agents')return agents;
    if(path==='/api/skills')return list(skills);
    if(path==='/api/mcps')return list(mcps);
    if(path==='/api/tags')return list([]);
    if(path==='/api/trash')return list(trash);
    if(path==='/api/collections'){
      if(method==='POST'){const collection={id:`collection-${++sequence}`,name:body.name,color:body.color,items:[],itemCount:0};collections.push(collection);return {collection};}
      return list(collections);
    }
    if(path==='/api/scan')return {imported:0,scanned:assets.length};
    let match=path.match(/^\/api\/analysis-rules\/([^/]+)\/select$/);
    if(match){ruleChanged(decodeURIComponent(match[1]));return rules;}
    match=path.match(/^\/api\/agents\/([^/]+)\/select$/);
    if(match){agents.selectedId=match[1];return {...agents,provider:provider()};}
    match=path.match(/^\/api\/jobs\/([^/]+)$/);
    if(match&&method==='DELETE'){
      const job=jobs.find(job=>job.id===match[1]);
      if(job){cancel(job.assetId);const asset=item(job.assetId);if(asset)asset.analysisStatus='pending';jobs=jobs.filter(entry=>entry!==job);send('analyze');}
      return {ok:true};
    }
    match=path.match(/^\/api\/assets\/([^/]+)(?:\/(analyze|analysis))?$/);
    if(match){
      const asset=item(decodeURIComponent(match[1]));if(!asset)throw new Error('素材已移除，请重新导入');
      if(match[2]==='analyze'&&method==='POST'){
        if(asset.referenceKey!=='lighting')throw new Error('这是已保存的案例记录，请导入光影样图体验分析');
        currentId=asset.id;
        if(body.ruleId!==expectedRule(asset)){send('rule');throw new Error('请先选择「摄影与光影研究」体验此案例');}
        if(timers.has(asset.id))return {job:jobs.find(job=>job.assetId===asset.id)};
        const version=generation;
        const job={id:`job-${++sequence}`,assetId:asset.id,state:'processing',stage:'准备光影分析示例',provider:agents.selectedId,ruleId:body.ruleId,progress:12,createdAt:now(),updatedAt:now()};
        jobs=jobs.filter(entry=>entry.assetId!==asset.id);jobs.unshift(job);asset.analysisStatus='processing';send('processing',{progress:12});
        const tasks=[[1100,42,'整理光源与明暗关系'],[2400,76,'整理布光建议与提示词'],[3700,100,'完成']].map(([delay,progress,label])=>setTimeout(()=>{
          if(version!==generation||!item(asset.id))return;
          job.progress=progress;job.stage=label;job.updatedAt=now();
          if(progress===100){cancel(asset.id);complete(asset);}else{send('processing',{progress,label});window.styleAtlasDemoClient?.updateQueue();}
        },delay));timers.set(asset.id,tasks);return {job};
      }
      if(match[2]==='analysis'&&method==='PATCH'){if(asset.currentAnalysis)asset.currentAnalysis.analysis=body.analysis||body;return asset;}
      if(method==='PATCH'){for(const key of ['title','notes','favorite','discipline','sourceUrl','rightsNote'])if(key in body)asset[key]=body[key];return asset;}
      if(method==='DELETE'){cancel(asset.id);assets=assets.filter(entry=>entry!==asset);trash.push({...asset,assetId:asset.id,deletedAt:now()});jobs=jobs.filter(job=>job.assetId!==asset.id);if(currentId===asset.id){currentId=null;send('import');}return {ok:true};}
      return asset;
    }
    match=path.match(/^\/api\/(skills|mcps)\/([^/]+)\/(favorite|enabled)$/);
    if(match){const entry=(match[1]==='skills'?skills:mcps).find(entry=>entry.id===match[2]);if(entry)entry[match[3]]=body[match[3]];return entry;}
    throw new Error('此操作请在 Style Atlas 客户端中体验');
  }
  // Every client API stays in this frame; no model, filesystem or network request is made.
  window.fetch=async(input,options={})=>{
    try{
      const url=new URL(typeof input==='string'?input:input.url,'https://style-atlas-demo.invalid');
      if(!url.pathname.startsWith('/api/'))throw new Error('网页演示不发送外部请求');
      const body=options.body?JSON.parse(options.body):{};
      return new Response(JSON.stringify(await route(url.pathname,options.method||'GET',body,url)),{status:200,headers:{'Content-Type':'application/json'}});
    }catch(error){return new Response(JSON.stringify({error:error.message}),{status:400,headers:{'Content-Type':'application/json'}});}
  };
  window.styleAtlasDemo={referenceKey:null,send,ruleChanged,targetSelector,
    async reset(){generation++;for(const id of timers.keys())cancel(id);assets=[];jobs=[];collections=[];trash=[];rules=clone(fixtures.analysisRules);currentId=null;send('import');await window.styleAtlasDemoClient?.reset();},
    async completeReference(key){const asset=assets.find(asset=>asset.referenceKey===key);if(asset){cancel(asset.id);await complete(asset);}},
    snapshot:()=>({stage,currentId,assets:assets.map(({mediaUrl,...asset})=>asset),jobs:clone(jobs)})
  };
  let scheduled=false;
  new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;highlight();});}).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pagehide',()=>{for(const id of timers.keys())cancel(id);});
})();

const menu=document.querySelector('.menu');const nav=document.querySelector('nav');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'收起导航':'展开导航');nav.classList.toggle('open',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','展开导航')}));document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>document.querySelector('#service').value=a.dataset.service));
const scenarios=[{title:'你的品牌，<br>值得一个更好的数字门面。',desc:'为成长中的企业搭建清晰、有辨识度的官网，把品牌故事、服务能力与咨询入口连在一起，让访客更快理解你。',list:['跨设备一致的浏览体验','清晰的内容结构与服务表达','围绕咨询转化设计的访问路径'],brand:'STUDIO / NEXT',caption:'A NEW PERSPECTIVE.',heading:'Designed<br>to move<br><em>you forward.</em>',url:'YOUR BRAND / DIGITAL EXPERIENCE',foot:'IDEAS INTO EXPERIENCES',bg:'#e4e9da'},{title:'让重复的工作，<br>交给更聪明的工作流。',desc:'从团队日常任务切入，把知识检索、内容草拟与流程处理串联起来。围绕真实业务设计 AI 工具，让人把精力留给判断与创造。',list:['基于业务资料的知识检索','支持人工审核的内容辅助','按场景连接工具与工作流程'],brand:'COMPASSIO / AI',caption:'LESS REPETITION. MORE CREATION.',heading:'Work smarter.<br>Create<br><em>more possibility.</em>',url:'AI WORKSPACE / CONCEPT',foot:'KNOWLEDGE → INSIGHT → ACTION',bg:'#dce4ed'},{title:'让业务的每个环节，<br>在同一套产品里协同。',desc:'从订单、会员到内部管理，把分散的业务流程整理成清晰的数字产品。先验证关键功能，再根据使用反馈逐步扩展。',list:['围绕角色设计的操作流程','清晰的业务数据与状态管理','从 MVP 到持续迭代的开发路径'],brand:'COMPASSIO / CLOUD',caption:'A CONNECTED WAY TO WORK.',heading:'One platform.<br>New<br><em>possibilities.</em>',url:'BUSINESS PLATFORM / CONCEPT',foot:'CONNECT → MANAGE → GROW',bg:'#e6dfd1'}];
const tabs=[...document.querySelectorAll('[data-tab]')];function selectTab(index){const data=scenarios[index];tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===index));t.tabIndex=i===index?0:-1});document.querySelector('#solution-panel').setAttribute('aria-labelledby',`tab-${index}`);document.querySelector('.pill').textContent=`SCENARIO / 0${index+1}`;document.querySelector('#solution-title').innerHTML=data.title;document.querySelector('#solution-desc').textContent=data.desc;document.querySelector('#solution-list').replaceChildren(...data.list.map(s=>{const li=document.createElement('li');li.textContent=s;return li}));['brand','caption','url','foot'].forEach(k=>document.querySelector('#demo-'+k).textContent=data[k]);document.querySelector('#demo-heading').innerHTML=data.heading;document.querySelector('.demo-body').style.background=data.bg}tabs.forEach((t,i)=>{t.tabIndex=i===0?0:-1;t.addEventListener('click',()=>selectTab(i));t.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%3;if(e.key==='ArrowLeft')next=(i+2)%3;if(e.key==='Home')next=0;if(e.key==='End')next=2;if(next!==undefined){e.preventDefault();selectTab(next);tabs[next].focus()}})});
const form=document.querySelector('#brief-form');
const formStatus=document.querySelector('#form-status');
const sendButton=form.querySelector('[type="submit"]');
const defaultSendLabel=sendButton.innerHTML;
let sending=false;
let lastSubmission='';
let downloadUrl;
function briefDetails(){return {name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),service:form.elements.service.selectedOptions[0].textContent,brief:form.elements.brief.value.trim()};}
function setStatus(message,error=false){formStatus.textContent=message;formStatus.classList.toggle('error',error);}
function validBrief(){if(!form.reportValidity())return false;const d=briefDetails();if(!d.name||d.brief.length<10){setStatus('请填写称呼，并用至少 10 个字描述你的项目。',true);return false;}return true;}
form.addEventListener('input',()=>{if(!sending){sendButton.disabled=false;sendButton.innerHTML=defaultSendLabel;setStatus('');}});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(sending||!validBrief())return;
 if(form.elements.botcheck.checked){setStatus('无法提交，请通过邮箱联系我们。',true);return;}
 const d=briefDetails();const signature=JSON.stringify(d);
 if(signature===lastSubmission){setStatus('这份需求已经提交，请勿重复发送。');return;}
 const key=window.COMPASS_CONTACT?.accessKey;
 if(!key){setStatus('在线发送暂未启用，请通过下方邮箱联系我们。',true);return;}
 sending=true;sendButton.disabled=true;sendButton.textContent='正在发送…';form.setAttribute('aria-busy','true');setStatus('正在发送，请稍候…');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),30000);
 try{
  const response=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},signal:controller.signal,body:JSON.stringify({access_key:key,subject:'HK Compassio — New project enquiry',from_name:'HK Compassio Website',name:d.name,email:d.email,service:d.service,message:d.brief,language:document.documentElement.lang,source:'https://hkcompass.org/',botcheck:false})});
  const result=await response.json();
  if(!response.ok||result.success!==true)throw new Error('submission_not_accepted');
  lastSubmission=signature;setStatus('需求已成功提交。我们会通过你填写的邮箱与你联系。');sendButton.textContent='已提交';
 }catch(error){
  setStatus(error.name==='AbortError'?'暂时无法确认发送结果，请勿连续提交。你也可以通过下方邮箱联系我们。':'发送未成功，填写内容已保留。请稍后重试，或通过下方邮箱联系我们。',true);
  sendButton.innerHTML=defaultSendLabel;sendButton.disabled=false;
 }finally{clearTimeout(timeout);sending=false;form.removeAttribute('aria-busy');}
});
document.querySelector('#download-brief').addEventListener('click',()=>{
 if(!validBrief())return;const d=briefDetails();
 const content=`项目需求单\n香港指南针科技有限公司\n\n称呼：${d.name}\n联系邮箱：${d.email}\n项目类型：${d.service}\n\n项目描述：\n${d.brief}\n\n此文件为本地副本。下载操作不会发送邮件。\n`;
 if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(new Blob(['\uFEFF'+content],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=downloadUrl;a.download='指南针科技-项目需求单.txt';a.click();
 setStatus('需求单已下载。下载操作不会发送邮件。');
});
document.querySelector('#year').textContent=new Date().getFullYear();

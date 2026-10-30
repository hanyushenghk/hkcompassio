const menu=document.querySelector('.menu');const nav=document.querySelector('nav');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'收起導航':'展開導航');nav.classList.toggle('open',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','展開導航')}));document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>document.querySelector('#service').value=a.dataset.service));
const scenarios=[{title:'你的品牌，<br>值得一個更好的數字門面。',desc:'為成長中的企業搭建清晰、有辨識度的官網，把品牌故事、服務能力與諮詢入口連在一起，讓訪客更快理解你。',list:['跨設備一致的瀏覽體驗','清晰的內容結構與服務表達','圍繞諮詢轉化設計的訪問路徑'],brand:'STUDIO / NEXT',caption:'A NEW PERSPECTIVE.',heading:'Designed<br>to move<br><em>you forward.</em>',url:'YOUR BRAND / DIGITAL EXPERIENCE',foot:'IDEAS INTO EXPERIENCES',bg:'#e4e9da'},{title:'讓重複的工作，<br>交給更聰明的工作流。',desc:'從團隊日常任務切入，把知識檢索、內容草擬與流程處理串聯起來。圍繞真實業務設計 AI 工具，讓人把精力留給判斷與創造。',list:['基於業務資料的知識檢索','支持人工審核的內容輔助','按場景連接工具與工作流程'],brand:'COMPASSIO / AI',caption:'LESS REPETITION. MORE CREATION.',heading:'Work smarter.<br>Create<br><em>more possibility.</em>',url:'AI WORKSPACE / CONCEPT',foot:'KNOWLEDGE → INSIGHT → ACTION',bg:'#dce4ed'},{title:'讓業務的每個環節，<br>在同一套產品里協同。',desc:'從訂單、會員到內部管理，把分散的業務流程整理成清晰的數字產品。先驗證關鍵功能，再根據使用反饋逐步擴展。',list:['圍繞角色設計的操作流程','清晰的業務數據與狀態管理','從 MVP 到持續迭代的開發路徑'],brand:'COMPASSIO / CLOUD',caption:'A CONNECTED WAY TO WORK.',heading:'One platform.<br>New<br><em>possibilities.</em>',url:'BUSINESS PLATFORM / CONCEPT',foot:'CONNECT → MANAGE → GROW',bg:'#e6dfd1'}];
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
function validBrief(){if(!form.reportValidity())return false;const d=briefDetails();if(!d.name||d.brief.length<10){setStatus('請填寫稱呼，並用至少 10 個字描述你的項目。',true);return false;}return true;}
form.addEventListener('input',()=>{if(!sending){sendButton.disabled=false;sendButton.innerHTML=defaultSendLabel;setStatus('');}});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(sending||!validBrief())return;
 if(form.elements.botcheck.checked){setStatus('無法提交，請通過郵箱聯繫我們。',true);return;}
 const d=briefDetails();const signature=JSON.stringify(d);
 if(signature===lastSubmission){setStatus('這份需求已經提交，請勿重複發送。');return;}
 const key=window.COMPASS_CONTACT?.accessKey;
 if(!key){setStatus('在線發送暫未啟用，請通過下方郵箱聯繫我們。',true);return;}
 sending=true;sendButton.disabled=true;sendButton.textContent='正在發送…';form.setAttribute('aria-busy','true');setStatus('正在發送，請稍候…');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),30000);
 try{
  const response=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},signal:controller.signal,body:JSON.stringify({access_key:key,subject:'HK Compassio — New project enquiry',from_name:'HK Compassio Website',name:d.name,email:d.email,service:d.service,message:d.brief,language:document.documentElement.lang,source:'https://hkcompass.org/',botcheck:false})});
  const result=await response.json();
  if(!response.ok||result.success!==true)throw new Error('submission_not_accepted');
  lastSubmission=signature;setStatus('需求已成功提交。我們會通過你填寫的郵箱與你聯繫。');sendButton.textContent='已提交';
 }catch(error){
  setStatus(error.name==='AbortError'?'暫時無法確認發送結果，請勿連續提交。你也可以通過下方郵箱聯繫我們。':'發送未成功，填寫內容已保留。請稍後重試，或通過下方郵箱聯繫我們。',true);
  sendButton.innerHTML=defaultSendLabel;sendButton.disabled=false;
 }finally{clearTimeout(timeout);sending=false;form.removeAttribute('aria-busy');}
});
document.querySelector('#download-brief').addEventListener('click',()=>{
 if(!validBrief())return;const d=briefDetails();
 const content=`項目需求單\n香港指南針科技有限公司\n\n稱呼：${d.name}\n聯繫郵箱：${d.email}\n項目類型：${d.service}\n\n項目描述：\n${d.brief}\n\n此文件為本地副本。下載操作不會發送郵件。\n`;
 if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(new Blob(['\uFEFF'+content],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=downloadUrl;a.download='指南針科技-項目需求單.txt';a.click();
 setStatus('需求單已下載。下載操作不會發送郵件。');
});
document.querySelector('#year').textContent=new Date().getFullYear();

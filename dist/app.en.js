const menu=document.querySelector('.menu');const nav=document.querySelector('nav');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');nav.classList.toggle('open',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu')}));document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>document.querySelector('#service').value=a.dataset.service));
const scenarios=[{title:'Your brand deserves<br>a better digital home.',desc:'Give your growing business a clear, distinctive website. Connect your story, services and enquiry journey so visitors understand what you offer.',list:['A consistent experience across devices','Clear content and service descriptions','A visitor journey designed around enquiries'],brand:'STUDIO / NEXT',caption:'A NEW PERSPECTIVE.',heading:'Designed<br>to move<br><em>you forward.</em>',url:'YOUR BRAND / DIGITAL EXPERIENCE',foot:'IDEAS INTO EXPERIENCES',bg:'#e4e9da'},{title:'Less repetitive work.<br>Smarter workflows.',desc:'Connect knowledge retrieval, content drafting and routine processes around your team’s daily tasks. Build AI tools for real business needs, leaving people more time for judgment and creativity.',list:['Knowledge retrieval grounded in your business materials','Content assistance with human review','Tools connected around your workflows'],brand:'COMPASSIO / AI',caption:'LESS REPETITION. MORE CREATION.',heading:'Work smarter.<br>Create<br><em>more possibility.</em>',url:'AI WORKSPACE / CONCEPT',foot:'KNOWLEDGE → INSIGHT → ACTION',bg:'#dce4ed'},{title:'Bring your operations<br>together in one product.',desc:'Connect orders, memberships and internal operations in a coherent digital product. Validate the key features first, then expand based on real usage and feedback.',list:['Workflows designed for each user role','Clear business data and status tracking','A development path from MVP to ongoing improvement'],brand:'COMPASSIO / CLOUD',caption:'A CONNECTED WAY TO WORK.',heading:'One platform.<br>New<br><em>possibilities.</em>',url:'BUSINESS PLATFORM / CONCEPT',foot:'CONNECT → MANAGE → GROW',bg:'#e6dfd1'}];
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
function validBrief(){if(!form.reportValidity())return false;const d=briefDetails();if(!d.name||d.brief.length<10){setStatus('Enter your name and describe your project in at least 10 characters.',true);return false;}return true;}
form.addEventListener('input',()=>{if(!sending){sendButton.disabled=false;sendButton.innerHTML=defaultSendLabel;setStatus('');}});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(sending||!validBrief())return;
 if(form.elements.botcheck.checked){setStatus('Unable to submit. Please contact us by email.',true);return;}
 const d=briefDetails();const signature=JSON.stringify(d);
 if(signature===lastSubmission){setStatus('This enquiry has already been submitted. Please avoid sending it again.');return;}
 const key=window.COMPASS_CONTACT?.accessKey;
 if(!key){setStatus('Online submission is not available yet. Please contact us at the email address below.',true);return;}
 sending=true;sendButton.disabled=true;sendButton.textContent='Sending…';form.setAttribute('aria-busy','true');setStatus('Sending your enquiry. Please wait…');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),30000);
 try{
  const response=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},signal:controller.signal,body:JSON.stringify({access_key:key,subject:'HK Compassio — New project enquiry',from_name:'HK Compassio Website',name:d.name,email:d.email,service:d.service,message:d.brief,language:document.documentElement.lang,source:'https://hkcompass.org/',botcheck:false})});
  const result=await response.json();
  if(!response.ok||result.success!==true)throw new Error('submission_not_accepted');
  lastSubmission=signature;setStatus('Your enquiry has been submitted successfully. We will contact you at the email address you provided.');sendButton.textContent='Submitted';
 }catch(error){
  setStatus(error.name==='AbortError'?'We could not confirm the result. Please avoid repeated submissions. You can also contact us by email below.':'Your enquiry could not be sent. Your details are still here. Please try again later or contact us by email below.',true);
  sendButton.innerHTML=defaultSendLabel;sendButton.disabled=false;
 }finally{clearTimeout(timeout);sending=false;form.removeAttribute('aria-busy');}
});
document.querySelector('#download-brief').addEventListener('click',()=>{
 if(!validBrief())return;const d=briefDetails();
 const content=`Project brief\nHK COMPASSIO TECHNOLOGY LIMITED\n\nName: ${d.name}\nEmail address：${d.email}\nProject type: ${d.service}\n\nProject description: \n${d.brief}\n\nThis file is a local copy. Downloading it does not send an email.\n`;
 if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(new Blob(['\uFEFF'+content],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=downloadUrl;a.download='Compassio-Project-Brief.txt';a.click();
 setStatus('Your brief has been downloaded. Downloading it does not send an email.');
});
document.querySelector('#year').textContent=new Date().getFullYear();

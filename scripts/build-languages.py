from pathlib import Path
import re, subprocess, tempfile, json
from seo import enrich, write_crawler_files
from contextlib import ExitStack
root=Path(__file__).resolve().parent.parent
# Foundation provides deterministic Simplified-to-Traditional conversion on macOS.
resources = ExitStack()
import atexit
atexit.register(resources.close)
work = Path(resources.enter_context(tempfile.TemporaryDirectory(prefix='compass-locales-')))
converter = work / 'traditional'
subprocess.run(['swiftc', '-module-cache-path', str(work / 'module-cache'), str(root / 'scripts/traditional.swift'), '-o', str(converter)], check=True)
pairs={}
for line in (root/'source/english.tsv').read_text().splitlines():
    key,value=line.split('\t',1);pairs[key]=value
pattern=re.compile('|'.join(re.escape(k) for k in sorted(pairs,key=len,reverse=True)))
def english(s): return pattern.sub(lambda m:pairs[m.group()],s)
def traditional(s):
    out=subprocess.run([str(converter)],input=s,text=True,capture_output=True,check=True).stdout
    for old,new in {'咨詢':'諮詢','重復':'重複','校准':'校準','啓':'啟','場景里':'場景中'}.items(): out=out.replace(old,new)
    return out
base=(root/'source/index.zh-CN.html').read_text()
app=(root/'source/app.zh-CN.js').read_text()
# Fixed option values keep service selection stable in every language.
services=['网站开发','小程序开发','AI 工具开发','SaaS 产品开发','还没确定，想先聊聊']
for i,name in enumerate(services):
    base=base.replace(f'<option>{name}</option>',f'<option value="service-{i}">{name}</option>')
    base=base.replace(f'data-service="{name}"',f'data-service="service-{i}"')
app=app.replace('form.elements.service.value}', 'form.elements.service.selectedOptions[0].textContent}')
langs=[('zh-Hant','index.html','繁體',traditional),('en','en.html','EN',english),('zh-Hans','zh-cn.html','简体',lambda s:s)]
origin='https://hkcompass.org/'
metadata=json.loads((root/'source/seo.json').read_text())
for lang,file,label,translate in langs:
    html=translate(base).replace('lang="zh-CN"',f'lang="{lang}"')
    script=f'app.{lang}.js'
    html=html.replace('src="app.js"',f'src="{script}"').replace('content="#101310"','content="#080f1b"')
    switch='<div class="language-switch" role="group" aria-label="'+{'zh-Hant':'選擇語言','en':'Choose language','zh-Hans':'选择语言'}[lang]+'">'
    for target,path,text,_ in langs:
        title={'zh-Hant':'繁體中文','en':'English','zh-Hans':'简体中文'}[target]
        href='/' if path=='index.html' else '/'+path
        switch+=f'<a href="{href}" lang="{target}" hreflang="{target}" aria-label="{title}"'+(' aria-current="page"' if target==lang else '')+f'>{text}</a>'
    switch+='</div>'
    html=html.replace('<button class="menu"',switch+'<button class="menu"')
    alternates=''.join(f'<link rel="alternate" hreflang="{code}" href="{origin}{"" if path=="index.html" else path}">' for code,path,_,_ in langs)
    alternates+=f'<link rel="alternate" hreflang="x-default" href="{origin}"><link rel="canonical" href="{origin}{"" if file=="index.html" else file}">'
    html=html.replace('</head>',alternates+'</head>')
    (root/'dist'/file).write_text(enrich(html, lang, file, metadata))
    (root/'dist'/script).write_text(translate(app))
# Prevent accidental use of the old Simplified-only script.
(root/'dist/app.js').unlink(missing_ok=True)
write_crawler_files(root/'dist', [file for _,file,_,_ in langs])
print('Generated Traditional Chinese (default), English and Simplified Chinese pages.')

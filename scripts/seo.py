"""Generate static SEO tags and crawler files from the same locale registry."""
import json
import re
from html import escape

ORIGIN = 'https://hkcompass.org/'

def page_url(filename):
    return ORIGIN + ('' if filename == 'index.html' else filename)

def enrich(html, lang, filename, metadata):
    data = metadata[lang]
    url = page_url(filename)
    title, description = data['title'], data['description']
    html = re.sub(r'<title>.*?</title>', '<title>' + escape(title) + '</title>', html)
    html = re.sub(r'<meta name="description" content="[^"]*">', '', html)
    image = ORIGIN + 'assets/hk-compassio-logo.png'
    tags = [('name', 'description', description), ('name', 'robots', 'index,follow,max-image-preview:large'),
            ('property', 'og:type', 'website'), ('property', 'og:site_name', 'HK Compassio Technology'),
            ('property', 'og:title', title), ('property', 'og:description', description),
            ('property', 'og:url', url), ('property', 'og:locale', data['locale']),
            ('property', 'og:image', image), ('property', 'og:image:type', 'image/png'),
            ('property', 'og:image:width', '1254'), ('property', 'og:image:height', '1254'),
            ('property', 'og:image:alt', data['name']), ('name', 'twitter:card', 'summary'),
            ('name', 'twitter:title', title), ('name', 'twitter:description', description),
            ('name', 'twitter:image', image), ('name', 'twitter:image:alt', data['name'])]
    tags += [('property', 'og:locale:alternate', item['locale']) for code, item in metadata.items() if code != lang]
    head = '\n'.join(f'<meta {attr}="{key}" content="{escape(value, quote=True)}">' for attr, key, value in tags)
    org_id = ORIGIN + '#organization'
    graph = [
        {'@type': 'Organization', '@id': org_id, 'name': data['name'],
         'alternateName': ['HK Compassio Technology Limited', '香港指南針科技有限公司', '香港指南针科技有限公司'],
         'url': ORIGIN, 'logo': {'@type': 'ImageObject', 'url': image, 'width': 1254, 'height': 1254},
         'email': 'hanyushenghk@gmail.com', 'description': description},
        {'@type': 'WebSite', '@id': ORIGIN + '#website', 'url': ORIGIN,
         'name': 'HK Compassio Technology', 'publisher': {'@id': org_id},
         'inLanguage': list(metadata)},
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': title,
         'description': description, 'inLanguage': lang, 'isPartOf': {'@id': ORIGIN + '#website'},
         'about': {'@id': org_id}}
    ]
    for index, service in enumerate(data['services']):
        graph.append({'@type': 'Service', '@id': url + '#service-' + str(index),
                      'name': service, 'serviceType': service, 'url': url + '#services',
                      'provider': {'@id': org_id}})
    schema = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('<', '\\u003c')
    return html.replace('</head>', head + '\n<script type="application/ld+json">' + schema + '</script>\n</head>')

def write_crawler_files(dist, filenames):
    # Preserve the existing default-open crawl policy; no special AI crawler policy.
    (dist / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: ' + ORIGIN + 'sitemap.xml\n')
    # Do not invent lastmod dates: deployment time is not content modification time.
    entries = ''.join('<url><loc>' + escape(page_url(file)) + '</loc></url>\n' for file in filenames)
    (dist / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries + '</urlset>\n')

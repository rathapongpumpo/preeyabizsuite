"""Build crawler-readable metadata for PHP and Vercel's static demo routes."""
import html
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = json.loads((ROOT/'src/SiteConfig.json').read_text(encoding='utf-8'))
BASE = SITE['origin']

def tags(path, meta):
    e = lambda value: html.escape(value, quote=True)
    meta = dict(meta, title=meta['title'].replace('{brand}', SITE['brand']))
    image = BASE + SITE['shareImage']
    rows = [f'<title>{e(meta["title"])}</title>',
            f'<meta name="description" content="{e(meta["description"])}">',
            f'<meta name="robots" content="{"index, follow" if meta["index"] else "noindex, follow"}">',
            f'<link rel="canonical" href="{BASE}{path}">']
    og = {'type':'website','url':BASE+path,'title':meta['title'],'description':meta['description'],
          'image':image,'image:width':'1200','image:height':'630','image:alt':SITE['brand']+' '+SITE['descriptor'],
          'site_name':SITE['brand'],'locale':'th_TH'}
    rows += [f'<meta property="og:{key}" content="{e(value)}">' for key,value in og.items()]
    twitter = {'card':'summary_large_image','title':meta['title'],'description':meta['description'],
               'image':image,'image:alt':og['image:alt']}
    rows += [f'<meta name="twitter:{key}" content="{e(value)}">' for key,value in twitter.items()]
    return '\n'.join(rows)

def generate():
    # This is generated public data only: never put credentials in SiteConfig.
    (ROOT/'public/assets/site-config.js').write_text('// Generated from src/SiteConfig.json\nwindow.SITE_CONFIG = Object.freeze('+json.dumps(SITE, ensure_ascii=False)+');\n',encoding='utf-8')
    pages = json.loads((ROOT/'src/PageMetadata.json').read_text(encoding='utf-8'))
    home = ROOT/'public/index.html'
    text = home.read_text(encoding='utf-8')
    text = re.sub(r'(data-site-brand>)[^<]*',lambda m:m[1]+html.escape(SITE['brand']),text)
    text = re.sub(r'(data-site-descriptor>)[^<]*',lambda m:m[1]+html.escape(SITE['descriptor']),text)
    text = re.sub(r'(data-site-email>)[^<]*',lambda m:m[1]+html.escape(SITE['email']),text)
    text = re.sub(r'(data-site-mailto[^>]*href=")[^"]*',lambda m:m[1]+'mailto:'+html.escape(SITE['email'],quote=True),text)
    text = re.sub(r'(class="brand"[^>]*aria-label=")[^"]*',lambda m:m[1]+html.escape(SITE['brand'])+' หน้าแรก',text)
    block = '<!-- PAGE METADATA -->\n' + tags('/',pages['/']) + '\n<!-- /PAGE METADATA -->'
    if '<!-- PAGE METADATA -->' in text:
        text = re.sub(r'<!-- PAGE METADATA -->.*?<!-- /PAGE METADATA -->',lambda _:block,text,flags=re.S)
    else:
        text = re.sub(r'\s*<meta name="description"[^>]+>', '',text,count=1)
        text = re.sub(r'<title>.*?</title>',lambda _:block,text,count=1,flags=re.S)
    home.write_text(text,encoding='utf-8')
    template = ROOT/'public/demo.html'
    text = template.read_text(encoding='utf-8')
    def registry_config(match):
        registry = json.loads(match[1])
        registry['/']['title'] = SITE['brand'] + ' | ' + SITE['descriptor']
        registry['/']['short'] = SITE['brand']
        return 'window.DEMO_PROJECTS = ' + json.dumps(registry, ensure_ascii=False, indent=2) + ';'
    text = re.sub(r'window\.DEMO_PROJECTS = (\{.*?\});', registry_config, text, count=1, flags=re.S)
    # Replace legacy SEO and the unverified Person entity in the old bootstrap.
    text = re.sub(r'\s*<script type="application/ld\+json">.*?</script>','',text,flags=re.S)
    if '<!-- PAGE METADATA -->' not in text:
        a=text.index('    <!-- Primary SEO Meta Tags -->');b=text.index('    <!-- Favicons -->',a)
        text=text[:a]+'<!-- PAGE METADATA -->\n<!-- /PAGE METADATA -->\n<meta name="theme-color" content="#f7f8fa">\n'+text[b:]
    fallback = {'title':'ตัวอย่างระบบ | {brand}','description':'ตัวอย่างระบบธุรกิจ ข้อมูลจำลองเก็บในเบราว์เซอร์','index':False}
    text = re.sub(r'<!-- PAGE METADATA -->.*?<!-- /PAGE METADATA -->',lambda _:'<!-- PAGE METADATA -->\n'+tags('/demo.html',fallback)+'\n<!-- /PAGE METADATA -->',text,flags=re.S)
    template.write_text(text,encoding='utf-8')
    out = ROOT/'public/route-pages';out.mkdir(exist_ok=True)
    rules=[]
    for path,meta in pages.items():
        if path=='/':continue
        filename = path.strip('/').replace('/','--')+'.html'
        page=re.sub(r'<!-- PAGE METADATA -->.*?<!-- /PAGE METADATA -->',lambda _:'<!-- PAGE METADATA -->\n'+tags(path,meta)+'\n<!-- /PAGE METADATA -->',text,flags=re.S)
        (out/filename).write_text(page,encoding='utf-8')
        rules += [{'source':path,'destination':'/route-pages/'+filename}]
    configpath=ROOT/'vercel.json';config=json.loads(configpath.read_text(encoding='utf-8'))
    remaining=[r for r in config['rewrites'] if not r['destination'].startswith('/route-pages/')]
    insertion=next(i for i,r in enumerate(remaining) if r['source']=='/(.*)')
    config['rewrites']=remaining[:insertion]+rules+remaining[insertion:]
    configpath.write_text(json.dumps(config,indent=2)+'\n',encoding='utf-8')
    urls='\n'.join(f'  <url><loc>{BASE}{path}</loc><lastmod>{date.today().isoformat()}</lastmod></url>' for path,meta in pages.items() if meta['index'])
    (ROOT/'public/sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls+'\n</urlset>\n',encoding='utf-8')
    (ROOT/'public/robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+BASE+'/sitemap.xml\n',encoding='utf-8')

if __name__=='__main__':generate()

"""Generate public agent documents from the same identity and price sources as the site."""
import html
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = json.loads((ROOT/'src/SiteConfig.json').read_text('utf8'))
CONFIG = json.loads((ROOT/'src/AgentConfig.json').read_text('utf8'))
ESTIMATE = json.loads((ROOT/'src/EstimateConfig.json').read_text('utf8'))
BASE = SITE['origin']
INFO_PAGES = {
    '/about': ('ข้อมูลบริการ', 'บริการพัฒนาเว็บไซต์และระบบจัดการธุรกิจของ BUZLIKE SYSTEMS และสถานะของผลิตภัณฑ์กับต้นแบบ'),
    '/contact': ('ติดต่อ BUZLIKE SYSTEMS', 'ติดต่อ BUZLIKE SYSTEMS ผ่าน LINE หรือ support@buzlike.com เพื่อปรึกษาและขอใบเสนอราคา'),
    '/pricing': ('ราคาและขอบเขตบริการ', 'ค่าพัฒนาเริ่มต้น 15,000 บาท กรอบราคาและระยะเวลาแยกตามรูปแบบงาน ไม่ใช่ค่าสมาชิก POS'),
    '/privacy': ('นโยบายความเป็นส่วนตัว', 'ข้อมูลที่แบบฟอร์ม BUZLIKE SYSTEMS เก็บ วัตถุประสงค์ ระยะเวลาเก็บ และช่องทางติดต่อเรื่องข้อมูล'),
    '/terms': ('เงื่อนไขการใช้เว็บไซต์และขอรับบริการ', 'สถานะเดโม การประเมินราคา ขอบเขตการว่าจ้าง และการรับประกันแก้ข้อผิดพลาด 60 วัน')
}
NOTE = 'ราคาเพื่อวางงบเบื้องต้น ไม่ใช่ใบเสนอราคายืนยัน และไม่ใช่ค่าสมาชิก BUZLIKE POS ขอบเขตและเงื่อนไขจริงต้องตกลงก่อนเริ่มงาน'


def compact(data):
    return json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')


def catalog():
    empty = {'type':'object', 'properties':{}, 'additionalProperties':False}
    tools = [
        {'name':'list_systems','description':'List BUZLIKE products and development services, including pilot/prototype status. Reads public data only.','inputSchema':empty},
        {'name':'estimate_project','description':'Estimate indicative development cost in THB from selected system categories. This is not a confirmed quotation or POS subscription. Does not save or send a request.',
         'inputSchema':{'type':'object','properties':{'systems':{'type':'array','items':{'type':'string','enum':list(ESTIMATE['systems'])},'minItems':1,'maxItems':6,'uniqueItems':True},'model':{'type':'string','enum':list(ESTIMATE['models']),'default':'template'}},'required':['systems'],'additionalProperties':False}},
        {'name':'get_contact','description':'Read public BUZLIKE contact channels and links. Does not open a message or contact anyone.','inputSchema':empty}
    ]
    return {'site':SITE,'products':CONFIG['products'],'estimate':ESTIMATE,'estimateNote':NOTE,'tools':tools,
            'contact':{'email':SITE['email'],'line':SITE['line'],'url':BASE+'/contact','quoteForm':BASE+'/#estimator-form'},
            'mcp':CONFIG['mcp']}


def graph(path, title):
    org = {'@type':'Organization','@id':BASE+'/#organization','name':SITE['brand'],'url':BASE+'/',
           'description':'รับพัฒนาเว็บไซต์และระบบจัดการธุรกิจตามขอบเขตงานที่ตกลง',
           'email':SITE['email'],'logo':BASE+'/assets/portfolio/favicon.svg','sameAs':SITE['sameAs'],
           'contactPoint':{'@type':'ContactPoint','contactType':'customer support','email':SITE['email'],'url':SITE['line'],'availableLanguage':['th']},
           'hasOfferCatalog':{'@id':BASE+'/pricing#catalog'}}
    offers=[]
    for model, tiers in ESTIMATE['rates'].items():
        for number, tier in enumerate(tiers, 1):
            offers.append({'@type':'Offer','@id':BASE+f'/pricing#{model}-{number}','name':ESTIMATE['models'][model],
                'url':BASE+'/pricing#'+model,'price':tier['min'],'priceCurrency':'THB',
                'description':f"ราคาเริ่มต้น กรอบ {tier['min']:,}–{tier['max']:,} บาท"+('ขึ้นไป' if tier.get('plus') else '')+('ต่อเดือน' if model=='retainer' else 'ต่อโปรเจกต์')+'; '+NOTE,
                'seller':{'@id':BASE+'/#organization'},'itemOffered':{'@id':BASE+'/#development-service'},
                'priceSpecification':{'@type':'UnitPriceSpecification','price':tier['min'],'priceCurrency':'THB','minPrice':tier['min'],'maxPrice':tier['max'],'unitText':'เดือน' if model=='retainer' else 'โปรเจกต์'}})
    page_type={'/about':'AboutPage','/contact':'ContactPage'}.get(path,'WebPage')
    return {'@context':'https://schema.org','@graph':[org,
        {'@type':'WebSite','@id':BASE+'/#website','name':SITE['brand'],'url':BASE+'/','publisher':{'@id':BASE+'/#organization'},'inLanguage':'th'},
        {'@type':page_type,'@id':BASE+path+'#webpage','url':BASE+path,'name':title,'isPartOf':{'@id':BASE+'/#website'},'about':{'@id':BASE+'/#organization'},'inLanguage':'th'},
        {'@type':'Service','@id':BASE+'/#development-service','name':'พัฒนาเว็บไซต์และระบบจัดการธุรกิจ','provider':{'@id':BASE+'/#organization'},'url':BASE+'/pricing','hasOfferCatalog':{'@id':BASE+'/pricing#catalog'}},
        {'@type':'OfferCatalog','@id':BASE+'/pricing#catalog','name':'กรอบค่าจ้างพัฒนา','itemListElement':[{'@id':offer['@id']} for offer in offers]},*offers]}


def agent_script():
    return (ROOT/'src/AgentTools.js').read_text('utf8').replace('__PUBLIC_CATALOG__',compact(catalog()))


def head(path, title):
    if path != '/' and path not in INFO_PAGES:
        return ''
    markdown = '/index.md' if path=='/' else path+'.md'
    css_version=hashlib.sha256((ROOT/'public/assets/public-info.css').read_bytes()).hexdigest()[:12]
    rows=[f'<link rel="alternate" type="text/markdown" href="{BASE}{markdown}">',
          f'<link rel="describedby" type="text/plain" href="{BASE}/llms.txt">',
          f'<link rel="stylesheet" href="/assets/public-info.css?v={css_version}">',
          '<script type="application/ld+json">'+compact(graph(path,title))+'</script>']
    if path=='/':
        js_version=hashlib.sha256(agent_script().encode('utf8')).hexdigest()[:12]
        rows.append(f'<script src="/assets/agent-tools.js?v={js_version}" defer></script>')
    return '\n'.join(rows)


def sections(path):
    contact=f'[LINE @486fpcll]({SITE["line"]}) หรือ [{SITE["email"]}](mailto:{SITE["email"]})'
    if path=='/about':
        return [('บริการที่นำเสนอ',['BUZLIKE SYSTEMS นำเสนอบริการพัฒนาเว็บไซต์และระบบจัดการธุรกิจ ตั้งแต่เว็บไซต์แนะนำบริการ ไปจนถึงคลังสินค้า หน้าร้าน งานขาย และการเชื่อมต่อข้อมูล ตามโจทย์และขอบเขตที่ตกลง']),
                ('ผลิตภัณฑ์และต้นแบบ',[f'[{p["name"]}]({p["url"]}) — {p["description"]}' for p in CONFIG['products']]),
                ('ก่อนเริ่มงาน',[f'เริ่มจากคุยโจทย์ ประเมินราคา และตกลงขอบเขตกับรอบตรวจรับเป็นลายลักษณ์อักษร [ดูกรอบราคา]({BASE}/pricing)',f'ดูโค้ดที่ผู้พัฒนาเปิดเผยได้ที่ [GitHub rathapongpumpo]({SITE["developerProfile"]})']),
                ('ปรึกษาและติดต่อ',[contact])]
    if path=='/contact':
        return [('ช่องทางติดต่อ',[contact,'แจ้งชื่อธุรกิจ งานที่อยากให้ระบบช่วย และช่องทางติดต่อกลับ ไม่จำเป็นต้องรู้รายละเอียดทางเทคนิคก่อน']),
                ('ขอประเมินงาน',[f'[เลือกระบบและกรอกแบบประเมิน]({BASE}/#estimator-form) เพื่อรับกรอบราคาเบื้องต้นและส่งคำขอให้ติดต่อกลับ',f'[ดูราคาและวิธีคิดขอบเขต]({BASE}/pricing) ก่อนเริ่มกรอก']),
                ('ข้อมูลส่วนตัว',[f'[อ่านวิธีใช้และเก็บข้อมูลคำขอ]({BASE}/privacy) หากต้องการสอบถามหรือลบข้อมูล ติดต่ออีเมลข้างต้น'])]
    if path=='/privacy':
        return [('ข้อมูลที่เก็บ',['เมื่อกดส่งแบบประเมิน เว็บไซต์รับชื่อผู้ติดต่อ โทรศัพท์หรือ LINE ID อีเมลถ้าระบุ ระบบที่สนใจ งบ รูปแบบบริการ และรายละเอียดงานที่กรอก พร้อมเลขอ้างอิงและสถานะการแจ้งเตือน',
                    'ระบบใช้ข้อมูลทางเทคนิคที่จำเป็น เช่น IP ในรูปแฮชสำหรับจำกัดการส่งซ้ำ คุกกี้เซสชันเพื่อความปลอดภัย และบันทึกการทำงานของโฮสต์']),
                ('ใช้ข้อมูลเพื่ออะไร',['ใช้รับคำขอ ประเมินขอบเขต ติดต่อกลับเกี่ยวกับงาน และป้องกันการส่งข้อมูลซ้ำหรือใช้งานผิดปกติ ระบบส่งแจ้งเตือนคำขอไปยังอีเมลของ BUZLIKE SYSTEMS ไม่ส่งอีเมลให้ผู้กรอกโดยอัตโนมัติ']),
                ('เก็บไว้นานแค่ไหน',['คำขอในระบบหลักมีนโยบายเก็บ 90 วัน และล้างรายการหมดอายุเมื่อ API หรืองานบำรุงรักษาทำงาน',
                    'สำเนากู้คืนเข้ารหัสเก็บย้อนหลัง 14 วัน โดยล้างสำเนาเก่าเมื่อรอบสำรองทำงาน การเปิดหน้าเว็บไม่เรียกงานสำรอง ไม่รับประกันเวลาลบที่แน่นอนหากงานบำรุงรักษายังไม่ทำงาน']),
                ('ข้อมูลในเบราว์เซอร์และผู้ให้บริการ',['แบบร่าง แบบจำลองเดโม และจุดกลับหน้าแรกอาจเก็บในพื้นที่เบราว์เซอร์ของคุณ ล้างแบบร่างได้ด้วยปุ่มในแบบประเมิน หรือผ่านการตั้งค่าเบราว์เซอร์',
                    'เว็บไซต์ใช้ผู้ให้บริการโฮสต์และอีเมลเพื่อดำเนินงาน และโหลดแบบอักษรบางส่วนจาก Google Fonts เมื่อเปิด LINE ผลิตภัณฑ์ หรือเดโมภายนอก การใช้งานส่วนนั้นอยู่ภายใต้นโยบายของผู้ให้บริการนั้น']),
                ('สอบถาม แก้ไข หรือลบข้อมูล',[f'ติดต่อ [{SITE["email"]}](mailto:{SITE["email"]}) พร้อมเลขอ้างอิงถ้ามี เราอาจขอข้อมูลเท่าที่จำเป็นเพื่อยืนยันว่าเป็นคำขอของคุณ'])]
    if path=='/terms':
        return [('การใช้เว็บไซต์และตัวอย่างระบบ',['เว็บไซต์นี้นำเสนอบริการ ผลิตภัณฑ์ และต้นแบบที่ระบุสถานะไว้ เดโมภายในใช้ข้อมูลจำลองและอาจเก็บในเบราว์เซอร์ ไม่ใช่ระบบงานจริงของลูกค้า และไม่ควรใช้กรอกข้อมูลลับ',
                    'BUZLIKE POS และดอกเตอร์ลอว์เยอร์เป็นเว็บไซต์แยก ให้ดูสถานะและเงื่อนไขบนเว็บไซต์ของแต่ละผลิตภัณฑ์']),
                ('ราคาและการว่าจ้าง',[NOTE,'การส่งแบบประเมินยังไม่ใช่การยืนยันจ้างงาน ต้องตกลงขอบเขต ราคา รอบส่งมอบ เกณฑ์ตรวจรับ และค่าใช้จ่ายที่เกี่ยวข้องในใบเสนอราคาหรือข้อตกลงก่อนเริ่มงาน']),
                ('การแก้ข้อผิดพลาดหลังส่งมอบ',['รับประกันแก้ข้อผิดพลาดตามขอบเขตที่ตกลง 60 วันหลังตรวจรับงาน รายละเอียดให้ยึดตามข้อตกลงงานจริง การเพิ่มฟีเจอร์หรือเปลี่ยนขอบเขตต้องประเมินแยก']),
                ('ติดต่อเกี่ยวกับเงื่อนไข',[contact,f'[นโยบายความเป็นส่วนตัว]({BASE}/privacy) อธิบายการรับและเก็บข้อมูลบนเว็บ'])]
    if path=='/pricing':
        rows=[]
        for model,tiers in ESTIMATE['rates'].items():
            lines=[]; previous=0
            for tier in tiers:
                count=f'{previous+1}–{tier["count"]} ประเภทระบบ' if previous+1<tier['count'] else f'{tier["count"]} ประเภทระบบ'
                lines.append(f'{count}: {tier["min"]:,}–{tier["max"]:,} บาท'+('ขึ้นไป' if tier.get('plus') else '')+(' / เดือน' if model=='retainer' else ' / โปรเจกต์')+' · '+tier['time']);previous=tier['count']
            rows.append((ESTIMATE['models'][model],lines))
        return rows+[('สิ่งที่ต้องคุยก่อนยืนยันราคา',[NOTE,'จำนวนหน้าจอ สิทธิ์ผู้ใช้ การย้ายข้อมูล และระบบภายนอกที่ต้องเชื่อมมีผลต่อขอบเขต ค่าโดเมน โฮสต์ และบริการภายนอกให้ระบุแยกในใบเสนอราคา',f'ค่าสมาชิก POS ให้ดูที่ [BUZLIKE POS]({CONFIG["products"][0]["url"]}#pricing) ตามสถานะการเปิดบริการของผลิตภัณฑ์นั้น']),('เริ่มประเมิน',[f'[เลือกโจทย์ในแบบประเมิน]({BASE}/#estimator-form) หรือ '+contact])]
    return [('บริการและราคา',['BUZLIKE SYSTEMS รับพัฒนาเว็บไซต์และระบบจัดการธุรกิจ เริ่มต้น 15,000 บาท กรอบราคาขึ้นกับขอบเขตงาน',f'[ราคาและขอบเขตบริการ]({BASE}/pricing)',NOTE]),
            ('ผลิตภัณฑ์และต้นแบบ',[f'[{p["name"]}]({p["url"]}) — {p["description"]}' for p in CONFIG['products']]),
            ('ติดต่อและเงื่อนไข',[contact,*[f'[{title}]({BASE}{url})' for url,(title,_) in INFO_PAGES.items()]]),
            ('ข้อมูลสำหรับเครื่องมืออ่านเว็บ',[f'[สรุปเว็บไซต์ llms.txt]({BASE}/llms.txt)',f'[MCP Server Card]({BASE}/.well-known/mcp/server-card.json)',f'MCP endpoint: {BASE}/mcp — อ่านข้อมูลบริการและประเมินงบ ไม่ส่งคำขอแทนผู้ใช้'])]


def markdown(path):
    title=SITE['brand'] if path=='/' else INFO_PAGES[path][0]+' — '+SITE['brand']
    intro='เว็บไซต์และระบบสำหรับธุรกิจ' if path=='/' else INFO_PAGES[path][1]
    rows=[f'# {title}',f'> {intro}',f'URL: {BASE}{path}']
    for heading,paragraphs in sections(path):rows+=['',f'## {heading}','',*['- '+p for p in paragraphs]]
    return '\n\n'.join(rows)+'\n'


def inline(text):
    safe=html.escape(text)
    return re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+|mailto:[^\s)]+)\)',r'<a href="\2">\1</a>',safe)


def footer():
    return '<nav class="information-footer-links" aria-label="ข้อมูลบริการและเงื่อนไข">'+''.join(f'<a href="{path}">{html.escape(title)}</a>' for path,(title,_) in INFO_PAGES.items())+'</nav>'


def generate(tags):
    data=catalog(); public=ROOT/'public'
    (public/'assets/agent-catalog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n','utf8')
    script=agent_script()
    (public/'assets/agent-tools.js').write_text(script,'utf8')
    (public/'index.md').write_text(markdown('/'),'utf8')
    llms=[f'# {SITE["brand"]}','> รับพัฒนาเว็บไซต์และระบบจัดการธุรกิจ เริ่มต้น 15,000 บาท ข้อมูลสาธารณะสำหรับค้นหาและอ้างอิง',
          '## ข้อมูลหลัก',f'- [หน้าแรก]({BASE}/index.md): สรุปบริการและผลิตภัณฑ์',
          *[f'- [{title}]({BASE}{path}.md): {description}' for path,(title,description) in INFO_PAGES.items()],
          '## ผลิตภัณฑ์',*[f'- [{p["name"]}]({p["url"]}): {p["description"]}' for p in CONFIG['products']],
          '## การเชื่อมต่อ',f'- [แคตตาล็อกสาธารณะ JSON]({BASE}/assets/agent-catalog.json)',f'- [MCP Server Card]({BASE}/.well-known/mcp/server-card.json)',f'- MCP endpoint: {BASE}/mcp (Streamable HTTP, JSON responses, read-only tools/resources)',
          '## ขอบเขตข้อมูล',NOTE,'ไม่เผยแพร่คำขอลูกค้า บัญชีผู้ดูแล หรือข้อมูลส่วนตัวผ่านเครื่องมือเหล่านี้',f'Content-Signal: {CONFIG["contentSignal"]}']
    (public/'llms.txt').write_text('\n\n'.join(llms)+'\n','utf8')
    directory=public/'info-pages';directory.mkdir(exist_ok=True)
    for path,(title,description) in INFO_PAGES.items():
        body=''
        for index,(heading,paragraphs) in enumerate(sections(path)):
            anchor=list(ESTIMATE['models'])[index] if path=='/pricing' and index<3 else 'section-'+str(index+1)
            body+=f'<section id="{anchor}"><h2>{html.escape(heading)}</h2>'+''.join('<p>'+inline(p)+'</p>' for p in paragraphs)+'</section>'
        price_note='<p class="info-note">'+html.escape(NOTE)+'</p>' if path=='/pricing' else ''
        page=f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">{tags(path,{'title':title+' | {brand}','description':description,'index':True})}<link rel="icon" href="/assets/portfolio/favicon.svg" type="image/svg+xml"></head>
<body class="info-page"><a class="info-skip" href="#main">ข้ามไปเนื้อหา</a><header class="info-header"><a class="info-brand" href="/">{html.escape(SITE['brand'])}</a><nav aria-label="เมนูหลัก"><a href="/">หน้าแรก</a><a href="/pricing">ราคาและขอบเขต</a><a href="/contact">ติดต่อ</a></nav></header>
<main id="main"><p class="info-kicker">BUZLIKE SYSTEMS</p><h1>{html.escape(title)}</h1><p class="info-lead">{html.escape(description)}</p>{price_note}{body}<p class="info-small">ข้อมูลหน้าเว็บปรับปรุง {CONFIG['updated']}</p><a class="info-button" href="{html.escape(SITE['line'],quote=True)}">ทัก LINE ปรึกษา</a><a class="info-button" href="/#estimator-form">ประเมินงบเบื้องต้น</a></main><footer class="info-footer">{footer()}<a href="mailto:{SITE['email']}">{SITE['email']}</a></footer></body></html>'''
        (directory/(path[1:]+'.html')).write_text(page,'utf8');(public/(path[1:]+'.md')).write_text(markdown(path),'utf8')
    mcp=CONFIG['mcp']
    card={'$schema':'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json','name':mcp['name'],'version':mcp['version'],
          'description':'Read public BUZLIKE services, indicative project prices and contact information.','title':SITE['brand']+' public information','websiteUrl':BASE+'/',
          'remotes':[{'type':'streamable-http','url':BASE+'/mcp'}],
          '_meta':{'com.buzlike/protocolVersions':mcp['protocolVersions'],'com.buzlike/capabilities':{'tools':{},'resources':{}},'com.buzlike/serverCardStatus':'experimental'}}
    cards=public/'.well-known/mcp';cards.mkdir(parents=True,exist_ok=True)
    (cards/'server-card.json').write_text(json.dumps(card,ensure_ascii=False,indent=2)+'\n','utf8')
    return [{'source':path,'destination':'/info-pages/'+path[1:]+'.html'} for path in INFO_PAGES]

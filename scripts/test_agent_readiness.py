"""Read-only HTTP checks against an isolated PHP server (default :8108). No inquiry submissions."""
import argparse
import itertools
import json
import re
import urllib.error
import urllib.request
from pathlib import Path

parser=argparse.ArgumentParser();parser.add_argument('--base',default='http://127.0.0.1:8108');args=parser.parse_args()
base=args.base.rstrip('/');root=Path(__file__).resolve().parents[1]
out=root/'output/agent-readiness';out.mkdir(parents=True,exist_ok=True)
checks=[]
def ck(name,value):
    checks.append({'name':name,'passed':bool(value)})
    if not value:raise AssertionError(name)
def request(path,method='GET',data=None,headers=None):
    req=urllib.request.Request(base+path,data=data,headers=headers or {},method=method)
    try:r=urllib.request.urlopen(req,timeout=10)
    except urllib.error.HTTPError as error:r=error
    return r.code,r.headers,r.read().decode('utf8')
headers={'Accept':'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-11-25'}
def rpc(method,params=None,extra=None):
    body={'jsonrpc':'2.0','id':1,'method':method}
    if params is not None:body['params']=params
    if extra:body.update(extra)
    status,h,text=request('/mcp','POST',json.dumps(body).encode(),headers)
    return status,json.loads(text) if text else None
try:
    status,h,home=request('/');ck('homepage is HTML with structured data',status==200 and 'text/html' in h['Content-Type'])
    graph=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',home,re.S)[1])['@graph']
    types={node['@type'] for node in graph};ck('organization site page service offer catalog and offers are described',{'Organization','WebSite','WebPage','Service','Offer','OfferCatalog'}<=types)
    org=next(node for node in graph if node['@type']=='Organization');ck('only the approved LINE identity is in sameAs',org['sameAs']==['https://line.me/R/ti/p/@486fpcll'] and org['email']=='support@buzlike.com')
    ck('no fabricated legal business identity',all(key not in org for key in ['address','legalName','taxID','aggregateRating','foundingDate']))
    ck('HTTP discovery links and Vary are present','llms.txt' in h['Link'] and 'index.md' in h['Link'] and 'Accept' in ','.join(h.get_all('Vary',[])))
    for path in ['/about','/contact','/pricing','/privacy','/terms']:
        status,h,text=request(path);ck('readable linked public page '+path,status==200 and '<h1>' in text and 'application/ld+json' in text and f'href="{path}"' in home)
        status,h,md=request(path,headers={'Accept':'text/markdown'});ck('Markdown negotiation '+path,status==200 and h['Content-Type'].startswith('text/markdown') and md.startswith('# ') and '<html' not in md)
        status,h,explicit=request(path+'.md');ck('direct Markdown '+path,status==200 and h['Content-Type'].startswith('text/markdown') and explicit==md)
    status,h,pricing=request('/pricing');ck('all price tiers are available without JavaScript',all(f'{rate["min"]:,}' in pricing and f'{rate["max"]:,}' in pricing for tiers in json.loads((root/'src/EstimateConfig.json').read_text('utf8'))['rates'].values() for rate in tiers))
    for accept,expected in [('text/markdown','text/markdown'),('text/markdown;q=0.5,text/html;q=1','text/html'),('text/markdown;q=0,text/html','text/html'),('*/*','text/html'),('text/html,text/markdown;q=0.8','text/html')]:
        status,h,text=request('/',headers={'Accept':accept});ck('Accept preference '+accept,status==200 and h['Content-Type'].startswith(expected))
    status,h,text=request('/',method='HEAD',headers={'Accept':'text/markdown'});ck('HEAD negotiates without a body',status==200 and text=='' and h['Content-Type'].startswith('text/markdown'))
    status,h,text=request('/robots.txt');ck('content signal and private admin exclusion are preserved',status==200 and 'Content-Signal: search=yes, ai-train=no' in text and 'Disallow: /admin' in text)
    status,h,text=request('/llms.txt');ck('llms summary links the public pages and products',status==200 and all(s in text for s in ['/pricing.md','/privacy.md','pos.buzlike.com','lawyer.buzlike.com','/mcp']))
    status,h,text=request('/.well-known/mcp/server-card.json');card=json.loads(text);ck('discovery card points at the actual remote transport',status==200 and card['remotes'][0]['url']=='https://buzlike.com/mcp')
    status,h,alt=request('/mcp/server-card');ck('recommended card alias returns the same identity',status==200 and json.loads(alt)==card)
    status,body=rpc('initialize',{'protocolVersion':'2025-11-25','capabilities':{},'clientInfo':{'name':'readonly-test','version':'1'}});ck('initialize negotiates real capabilities',status==200 and body['result']['serverInfo']['name']==card['name'] and set(body['result']['capabilities'])=={'tools','resources'})
    status,body=rpc('tools/list');tools=body['result']['tools'];ck('three tools with valid object schemas',status==200 and len(tools)==3 and all(isinstance(t['inputSchema']['properties'],dict) and t['annotations']['readOnlyHint'] for t in tools))
    estimate=json.loads((root/'src/EstimateConfig.json').read_text('utf8'))
    for size in range(1,7):
        for systems in itertools.combinations(estimate['systems'],size):
            for model,tiers in estimate['rates'].items():
                tier=next(t for t in tiers if size<=t['count']);status,result=rpc('tools/call',{'name':'estimate_project','arguments':{'systems':list(systems),'model':model}})
                value=result['result']['structuredContent'];ck(f'estimator parity {model} '+','.join(systems),status==200 and value['min']==tier['min'] and value['max']==tier['max'] and value['estimateOnly'] and value['unit']==('month' if model=='retainer' else 'project'))
    for bad in [{'systems':[]},{'systems':['wms','wms']},{'systems':['bad']},{'systems':['wms'],'model':'bad'},{'systems':['wms'],'model':None},{'systems':['wms'],'email':'do-not-send@example.invalid'},{'systems':['wms'],'callback':'https://example.invalid'},{'systems':{},'model':'template'}]:
        status,result=rpc('tools/call',{'name':'estimate_project','arguments':bad});ck('invalid tool input is rejected '+json.dumps(bad),status==200 and result['result']['isError'])
    status,result=rpc('tools/call',{'name':'submit_inquiry','arguments':{}});ck('no inquiry submission tool is exposed',result['error']['code']==-32602)
    status,result=rpc('resources/list');resources=result['result']['resources'];ck('only seven public documents are listed',len(resources)==7)
    for resource in resources:
        status,result=rpc('resources/read',{'uri':resource['uri']});ck('public resource is readable '+resource['uri'],status==200 and 'BUZLIKE' in result['result']['contents'][0]['text'])
    for uri in ['file:///etc/passwd','https://buzlike.com/admin/inquiries','https://buzlike.com/../var/inquiries.sqlite','https://example.invalid/']:
        status,result=rpc('resources/read',{'uri':uri});ck('arbitrary and private resource refused '+uri,result['error']['code']==-32602)
    status,h,text=request('/mcp','POST',b'{',headers);ck('malformed JSON fails safely',status==400 and json.loads(text)['error']['code']==-32700)
    status,h,text=request('/mcp','POST',b'[]',headers);ck('batch requests are rejected',status==400)
    status,h,text=request('/mcp','POST',b'{}',{**headers,'Origin':'https://example.invalid'});ck('foreign Origin is rejected',status==403)
    status,h,text=request('/mcp','POST',b'{}',{**headers,'Origin':'null'});ck('null Origin is rejected',status==403)
    status,h,text=request('/mcp','POST',b'{}',{**headers,'Accept':'application/json'});ck('MCP Accept negotiation is enforced',status==406)
    status,h,text=request('/mcp','POST',b'{}',{**headers,'Content-Type':'text/plain'});ck('unsupported request type refused',status==415)
    status,h,text=request('/mcp','POST',b' '*65537,headers);ck('oversized request bounded',status==413)
    status,h,text=request('/mcp');ck('no unsupported SSE stream advertised',status==405 and 'POST' in h.get('Allow',''))
    status,h,text=request('/mcp','POST',json.dumps({'jsonrpc':'2.0','method':'notifications/initialized'}).encode(),headers);ck('notification acknowledged with an empty 202',status==202 and text=='')
    status,h,text=request('/mcp','POST',json.dumps({'jsonrpc':'2.0','method':'ping','id':2,'params':None}).encode(),headers);ck('null params are invalid',status==400)
    status,result=rpc('ping',extra={'id':0});ck('numeric zero request id survives',status==200 and result['id']==0 and result['result']=={})
    ck('public browsing and MCP create no inquiry database',not (root/'output/agent-readiness/site/var/inquiries.sqlite').exists())
finally:
    (out/'http-results.json').write_text(json.dumps({'checks':checks},ensure_ascii=False,indent=2),'utf8')
    print(json.dumps({'checks':len(checks),'failed':sum(not c['passed'] for c in checks)}))

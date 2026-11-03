"""Build a self-contained PHP release; keep credentials out of the artifact."""
import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]

def build(base_url: str, output: Path, preview: bool) -> None:
    parsed = urlsplit(base_url)
    if parsed.scheme != 'https' or not parsed.hostname or parsed.path not in ('', '/') or parsed.query or parsed.fragment or parsed.username:
        raise ValueError('Use an HTTPS site origin without a path or credentials')
    base_url = base_url.rstrip('/')
    source_origin = json.loads((ROOT / 'src/SiteConfig.json').read_text(encoding='utf-8'))['origin']
    manifest = {'base_url': base_url, 'preview': preview, 'files': {}}
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for directory, target in [('public', 'public_html'), ('src', 'src')]:
            for source in sorted((ROOT / directory).rglob('*')):
                if not source.is_file():
                    continue
                relative = source.relative_to(ROOT / directory)
                if directory == 'public' and relative.parts[0] == 'route-pages':
                    continue  # Hostinger serves these routes through index.php.
                data = source.read_bytes()
                if source.suffix.lower() in {'.html', '.php', '.json', '.xml', '.txt', '.js'}:
                    text = data.decode('utf-8').replace(source_origin, base_url)
                    if preview:
                        text = text.replace('content="index, follow"', 'content="noindex, follow"')
                        if relative.name == 'PageMetadata.json':
                            pages = json.loads(text)
                            for page in pages.values():
                                page['index'] = False
                            text = json.dumps(pages, ensure_ascii=False, indent=2)
                    data = text.encode('utf-8')
                if directory == 'public' and relative.as_posix() == '.htaccess':
                    text = 'Options -Indexes\nDirectoryIndex index.php index.html\n' + data.decode('utf-8')
                    if preview:
                        text = re.sub(r'# Canonical production host.*?\[R=301,L,NE\]\n', '', text, flags=re.S)
                    if preview:
                        text += '\n<IfModule mod_headers.c>\nHeader always set X-Robots-Tag "noindex, follow"\n</IfModule>\n'
                    data = text.encode('utf-8')
                name = f'{target}/{relative.as_posix()}'
                archive.writestr(name, data)
                manifest['files'][name] = hashlib.sha256(data).hexdigest()
        archive.writestr('release-manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2))
    print(json.dumps({'archive': str(output.resolve()), 'files': len(manifest['files']), 'bytes': output.stat().st_size, 'preview': preview}))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--preview', action='store_true')
    args = parser.parse_args()
    build(args.base_url, args.output, args.preview)

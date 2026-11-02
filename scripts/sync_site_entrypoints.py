"""Keep Vercel's repository-root entries identical to the PHP public entries."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
for name in ('index.html', 'demo.html'):
    (root / name).write_bytes((root / 'public' / name).read_bytes())
    print(f'Synced {name}')

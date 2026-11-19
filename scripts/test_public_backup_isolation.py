"""Exercise real HTTP reads while the backup lock is held and today's copy is absent.

Uses isolated fake data and a fake mail sender. --baseline-ref demonstrates the old
page-entry stall without ever locking the production database or backup worker.
"""
import argparse
import json
import shutil
import socket
import sqlite3
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'playwright' / 'backup-isolation'
OUT.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument('--baseline-ref')
args = parser.parse_args()
php = shutil.which('php')
if not php:
    raise SystemExit('PHP CLI is required')
fixture = Path(tempfile.mkdtemp(prefix='fixture-', dir=OUT)).resolve()
server = locker = log = None
checks = []


def check(name, condition, **detail):
    checks.append({'name': name, 'passed': bool(condition), **detail})
    if not condition:
        raise AssertionError(name)


def run_php(code):
    return subprocess.run([php], input='<?php\n' + code, text=True, encoding='utf8',
                          cwd=fixture, capture_output=True, timeout=15, check=True).stdout


def stop(process):
    if process and process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)


try:
    shutil.copytree(ROOT / 'src', fixture / 'src')
    (fixture / 'public' / 'assets').mkdir(parents=True)
    for name in ['index.php', 'index.html', 'assets/site-navigation.css']:
        shutil.copy2(ROOT / 'public' / name, fixture / 'public' / name)
    shutil.copy2(ROOT / 'router.php', fixture / 'router.php')
    if args.baseline_ref:
        for name in ['public/index.php', 'src/InquiryService.php']:
            previous = subprocess.run(['git', 'show', args.baseline_ref + ':' + name],
                                      cwd=ROOT, capture_output=True, check=True)
            (fixture / name).write_bytes(previous.stdout)
    service = fixture / 'src' / 'InquiryService.php'
    service.write_text(service.read_text('utf8').replace('$sender ?? self::sendMail(...)',
                       '$sender ?? static fn() => true'), encoding='utf8')
    run_php("""
        require __DIR__.'/src/InquiryAdminStore.php';
        $owner=new InquiryAdminStore(__DIR__.'/var');
        $owner->provision('fixture@example.com','Fixture-backup-only-2026!');
        $db=new PDO('sqlite:'.__DIR__.'/var/inquiries.sqlite');
        $q=$db->prepare('INSERT INTO inquiries VALUES(?,?,?,?,?,?,?,?,?)');
        $q->execute(['BZ-EXPIRED-FIXTURE','fixture','fixture','fixture','{}',time()-91*86400,'queued',1,time()]);
        foreach(glob(__DIR__.'/var/backups/daily-*.bzbk') as $path){unlink($path);}
    """)
    storage = fixture / 'var'
    status_before = (storage / 'backups' / 'status.json').read_bytes()
    key_before = (storage / 'backup-encryption.key').read_bytes()
    locker_code = fixture / 'lock.php'
    locker_code.write_text("<?php $h=fopen(__DIR__.'/var/backups/backup.lock','r+b');"
                           "if(!flock($h,LOCK_EX)){exit(1);}echo \"ready\\n\";fflush(STDOUT);"
                           "fgets(STDIN);flock($h,LOCK_UN);fclose($h);", encoding='utf8')
    locker = subprocess.Popen([php, str(locker_code)], cwd=fixture, stdin=subprocess.PIPE,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    check('separate backup worker holds the lock', locker.stdout.readline().strip() == 'ready')
    with socket.socket() as probe:
        probe.bind(('127.0.0.1', 0))
        port = probe.getsockname()[1]
    log = (fixture / 'server.log').open('wb')
    server = subprocess.Popen([php, '-S', f'127.0.0.1:{port}', '-t', 'public', 'router.php'],
                              cwd=fixture, stdout=log, stderr=log)
    for attempt in range(100):
        try:
            with socket.create_connection(('127.0.0.1', port), timeout=0.1):
                break
        except OSError:
            if server.poll() is not None:
                raise RuntimeError('PHP server exited')
            time.sleep(0.02)
    base = f'http://127.0.0.1:{port}'
    if args.baseline_ref:
        start = time.monotonic()
        timed_out = False
        try:
            urllib.request.urlopen(base + '/', timeout=1.5).read()
        except (TimeoutError, socket.timeout):
            timed_out = True
        check('baseline page entry waits for backup lock', timed_out, elapsed=round(time.monotonic() - start, 3))
    else:
        for path, status, fragment in [('/', 200, 'BUZLIKE SYSTEMS'),
                                        ('/business-suite', 200, 'data-page="crm"'),
                                        ('/api/inquiries', 200, 'csrf'),
                                        ('/assets/site-navigation.css', 200, ''),
                                        ('/admin/login', 200, 'เข้าสู่หลังบ้าน'),
                                        ('/missing-fixture-page', 404, '404')]:
            start = time.monotonic()
            try:
                response = urllib.request.urlopen(base + path, timeout=1.5)
            except urllib.error.HTTPError as error:
                response = error
            body = response.read().decode('utf8')
            check('read completes while backup remains locked: ' + path,
                  response.code == status and fragment in body and locker.poll() is None,
                  elapsed=round(time.monotonic() - start, 4), status=response.code)
        with sqlite3.connect(storage / 'inquiries.sqlite') as db:
            check('GET still removes expired inquiries', db.execute('SELECT COUNT(*) FROM inquiries').fetchone()[0] == 0)
        db.close()
        check('reads create no daily snapshot', not list((storage / 'backups').glob('daily-*.bzbk')))
        check('reads leave backup status and recovery key unchanged',
              (storage / 'backups' / 'status.json').read_bytes() == status_before and
              (storage / 'backup-encryption.key').read_bytes() == key_before)
        locker.stdin.write('\n')
        locker.stdin.flush()
        locker.wait(timeout=5)
        worker = subprocess.run([php, 'src/BackupInquiries.php', '--verify'], cwd=fixture,
                                text=True, encoding='utf8', capture_output=True, timeout=15, check=True)
        result = json.loads(worker.stdout)
        check('independent CLI daily backup and restore still work',
              result['state'] == 'saved' and result['restore_test']['integrity'] == 'ok' and
              len(list((storage / 'backups').glob('daily-*.bzbk'))) == 1)
finally:
    stop(server)
    stop(locker)
    if locker:
        for stream in [locker.stdin, locker.stdout, locker.stderr]:
            if stream:
                stream.close()
    if log:
        log.close()
    result = {'baseline': args.baseline_ref, 'checks': checks}
    name = 'baseline.json' if args.baseline_ref else 'http-results.json'
    (OUT / name).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf8')
    print(json.dumps(result, ensure_ascii=True))
    # Recursive cleanup is restricted to the exact disposable fixture under OUT.
    assert fixture.parent == OUT.resolve() and fixture.name.startswith('fixture-') and not fixture.is_symlink()
    shutil.rmtree(fixture)

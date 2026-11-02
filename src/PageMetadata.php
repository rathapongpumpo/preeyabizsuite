<?php
declare(strict_types=1);

function pageMetadata(string $path): string {
    $pages = json_decode((string) file_get_contents(__DIR__ . '/PageMetadata.json'), true, 512, JSON_THROW_ON_ERROR);
    $meta = $pages[$path] ?? ['title' => 'ตัวอย่างระบบ | PREEYA SYSTEMS', 'description' => 'ตัวอย่างระบบธุรกิจ ข้อมูลจำลองเก็บในเบราว์เซอร์', 'index' => false];
    $url = 'https://preeyabizsuite.vercel.app' . $path;
    $image = 'https://preeyabizsuite.vercel.app/assets/portfolio/share-home-v1.png';
    $e = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    $html = '<title>' . $e($meta['title']) . '</title>';
    $html .= '<meta name="description" content="' . $e($meta['description']) . '">';
    $html .= '<meta name="robots" content="' . ($meta['index'] ? 'index, follow' : 'noindex, follow') . '">';
    $html .= '<link rel="canonical" href="' . $e($url) . '">';
    foreach (['type'=>'website','url'=>$url,'title'=>$meta['title'],'description'=>$meta['description'],'image'=>$image,'image:width'=>'1200','image:height'=>'630','image:alt'=>'PREEYA SYSTEMS เว็บไซต์และระบบสำหรับธุรกิจ','site_name'=>'PREEYA SYSTEMS','locale'=>'th_TH'] as $key=>$value) {
        $html .= '<meta property="og:' . $key . '" content="' . $e($value) . '">';
    }
    foreach (['card'=>'summary_large_image','title'=>$meta['title'],'description'=>$meta['description'],'image'=>$image,'image:alt'=>'PREEYA SYSTEMS เว็บไซต์และระบบสำหรับธุรกิจ'] as $key=>$value) {
        $html .= '<meta name="twitter:' . $key . '" content="' . $e($value) . '">';
    }
    return $html;
}

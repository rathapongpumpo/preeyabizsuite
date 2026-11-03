<?php
declare(strict_types=1);
require_once __DIR__ . '/SiteConfig.php';

function pageMetadata(string $path): string {
    $pages = json_decode((string) file_get_contents(__DIR__ . '/PageMetadata.json'), true, 512, JSON_THROW_ON_ERROR);
    $site = siteConfig();
    $meta = $pages[$path] ?? ['title' => 'ตัวอย่างระบบ | {brand}', 'description' => 'ตัวอย่างระบบธุรกิจ ข้อมูลจำลองเก็บในเบราว์เซอร์', 'index' => false];
    $meta['title'] = str_replace('{brand}', $site['brand'], $meta['title']);
    $url = $site['origin'] . $path;
    $image = $site['origin'] . $site['shareImage'];
    $imageAlt = $site['brand'] . ' ' . $site['descriptor'];
    $e = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    $html = '<title>' . $e($meta['title']) . '</title>';
    $html .= '<meta name="description" content="' . $e($meta['description']) . '">';
    $html .= '<meta name="robots" content="' . ($meta['index'] ? 'index, follow' : 'noindex, follow') . '">';
    $html .= '<link rel="canonical" href="' . $e($url) . '">';
    foreach (['type'=>'website','url'=>$url,'title'=>$meta['title'],'description'=>$meta['description'],'image'=>$image,'image:width'=>'1200','image:height'=>'630','image:alt'=>$imageAlt,'site_name'=>$site['brand'],'locale'=>'th_TH'] as $key=>$value) {
        $html .= '<meta property="og:' . $key . '" content="' . $e($value) . '">';
    }
    foreach (['card'=>'summary_large_image','title'=>$meta['title'],'description'=>$meta['description'],'image'=>$image,'image:alt'=>$imageAlt] as $key=>$value) {
        $html .= '<meta name="twitter:' . $key . '" content="' . $e($value) . '">';
    }
    return $html;
}

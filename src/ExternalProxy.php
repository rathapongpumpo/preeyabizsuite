<?php
declare(strict_types=1);

final class ExternalProxy
{
    private const TARGETS = [
        'ecommerce' => 'https://ecommerce-codex-demo.vercel.app',
        'tilt' => 'https://openai-landing-page-examples.vercel.app',
    ];

    public static function handle(string $demo, string $path): never
    {
        if (!isset(self::TARGETS[$demo])) {
            http_response_code(404);
            exit('Unknown external demo');
        }

        $origin = self::TARGETS[$demo];
        $path = '/' . ltrim($path, '/');
        $query = $_SERVER['QUERY_STRING'] ?? '';
        $url = $origin . $path . ($query !== '' ? '?' . $query : '');

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_USERAGENT => 'PreeyaDemoProxy/1.0',
            CURLOPT_HEADER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_CAINFO => __DIR__ . '/cacert.pem',
            CURLOPT_HTTPHEADER => ['Accept: ' . ($_SERVER['HTTP_ACCEPT'] ?? '*/*')],
        ]);
        $response = curl_exec($ch);
        if ($response === false) {
            self::errorPage('ไม่สามารถโหลดเดโมภายนอกได้ในขณะนี้');
        }

        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $headers = substr((string) $response, 0, $headerSize);
        $body = substr((string) $response, $headerSize);

        if (strlen($body) > 8_000_000) {
            self::errorPage('ไฟล์จากเดโมภายนอกมีขนาดใหญ่เกินกำหนด');
        }

        if ($status >= 300 && $status < 400 && preg_match('/^Location:\s*(.+)$/mi', $headers, $match)) {
            $location = trim($match[1]);
            $location = self::rewriteUrl($location, $demo, $origin);
            header('Location: ' . $location, true, $status);
            exit;
        }

        http_response_code($status > 0 ? $status : 502);
        header('Content-Type: ' . ($contentType ?: 'application/octet-stream'));
        header('Cache-Control: public, max-age=120');

        if (str_contains(strtolower($contentType), 'text/html')) {
            $body = self::rewriteHtml($body, $demo, $origin);
        } elseif (str_contains(strtolower($contentType), 'text/css')) {
            $prefix = '/external/' . $demo;
            $body = preg_replace_callback(
                '/url\((["\']?)(\/[^)"\']+)\1\)/i',
                static fn(array $m): string => 'url(' . $m[1] . $prefix . $m[2] . $m[1] . ')',
                $body
            ) ?? $body;
            $body = str_replace($origin, $prefix, $body);
        }

        echo $body;
        exit;
    }

    private static function rewriteHtml(string $html, string $demo, string $origin): string
    {
        $prefix = '/external/' . $demo;
        $html = str_replace($origin, $prefix, $html);
        $html = preg_replace_callback(
            '/\b(href|src|action|poster)=([\'"])(\/(?!\/)[^\'"]*)\2/i',
            static fn(array $m): string => $m[1] . '=' . $m[2] . $prefix . $m[3] . $m[2],
            $html
        ) ?? $html;
        $html = preg_replace_callback(
            '/\b(srcset|imagesrcset)=([\'"])([^\'"]+)\2/i',
            static function (array $m) use ($prefix): string {
                $attr = $m[1];
                $quote = $m[2];
                $content = $m[3];
                $parts = explode(',', $content);
                $newParts = array_map(static function ($part) use ($prefix) {
                    $trimmed = ltrim($part);
                    if (str_starts_with($trimmed, '/') && !str_starts_with($trimmed, '//') && !str_starts_with($trimmed, $prefix)) {
                        return $prefix . $trimmed;
                    }
                    return $part;
                }, $parts);
                return $attr . '=' . $quote . implode(',', $newParts) . $quote;
            },
            $html
        ) ?? $html;
        $html = preg_replace_callback(
            '/url\((["\']?)(\/(?!\/)[^)"\']+)\1\)/i',
            static fn(array $m): string => 'url(' . $m[1] . $prefix . $m[2] . $m[1] . ')',
            $html
        ) ?? $html;

        $base = '<base href="' . htmlspecialchars($prefix . '/', ENT_QUOTES) . '">';
        return preg_replace('/<head(\s[^>]*)?>/i', '$0' . $base, $html, 1) ?? $html;
    }

    private static function rewriteUrl(string $url, string $demo, string $origin): string
    {
        if (str_starts_with($url, $origin)) {
            return '/external/' . $demo . substr($url, strlen($origin));
        }
        if (str_starts_with($url, '/')) {
            return '/external/' . $demo . $url;
        }
        return $url;
    }

    private static function errorPage(string $message): never
    {
        http_response_code(502);
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><html lang="th"><meta charset="utf-8"><style>body{font-family:Tahoma,sans-serif;background:#0b1320;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0}.box{max-width:520px;padding:32px;border:1px solid #334155;border-radius:20px;background:#111c2d;text-align:center}a{color:#5eead4}</style><div class="box"><h1>External demo unavailable</h1><p>' . htmlspecialchars($message, ENT_QUOTES) . '</p><p>กรุณาลองใหม่อีกครั้ง</p></div></html>';
        exit;
    }
}

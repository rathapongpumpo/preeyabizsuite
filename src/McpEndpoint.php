<?php
declare(strict_types=1);
require_once __DIR__ . '/AgentCatalog.php';
require_once __DIR__ . '/SiteConfig.php';

/** Stateless JSON responses over MCP Streamable HTTP. All data/tools are public and read-only. */
function mcpJson(array $body, int $status = 200): never {
    http_response_code($status); header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR); exit;
}
function mcpError(string|int|float|null $id, int $code, string $message, int $status = 200): never {
    mcpJson(['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => $code, 'message' => $message]], $status);
}
function mcpAccepts(string $accept, string $type): bool {
    foreach (explode(',', strtolower($accept)) as $range) {
        $parts = array_map('trim', explode(';', $range));
        if (array_shift($parts) !== $type) { continue; }
        $quality = 1;
        foreach ($parts as $part) { if (str_starts_with($part, 'q=')) { $quality = is_numeric(substr($part, 2)) ? (float) substr($part, 2) : 0; } }
        if ($quality > 0 && $quality <= 1) { return true; }
    }
    return false;
}
function handleMcpEndpoint(): never {
    header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');
    header('Link: <' . siteConfig()['origin'] . '/.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"');
    $origins = [siteConfig()['origin']];
    if (PHP_SAPI === 'cli-server' && preg_match('/\A(?:127\.0\.0\.1|localhost)(?::\d+)?\z/', $_SERVER['HTTP_HOST'] ?? '')) { $origins[] = 'http://' . $_SERVER['HTTP_HOST']; }
    if ((isset($_SERVER['HTTP_ORIGIN']) && !in_array($_SERVER['HTTP_ORIGIN'], $origins, true)) || ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
        mcpError(null, -32000, 'Origin not allowed', 403);
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST'); mcpError(null, -32000, 'Use POST; this endpoint does not provide a standalone event stream', 405);
    }
    if (!mcpAccepts($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') || !mcpAccepts($_SERVER['HTTP_ACCEPT'] ?? '', 'text/event-stream')) {
        mcpError(null, -32000, 'Accept must include application/json and text/event-stream', 406);
    }
    if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') { mcpError(null, -32000, 'Use application/json', 415); }
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 65536) { mcpError(null, -32000, 'Request too large', 413); }
    $raw = file_get_contents('php://input', false, null, 0, 65537);
    if ($raw === false || strlen($raw) > 65536) { mcpError(null, -32000, 'Request too large', 413); }
    try { $request = json_decode($raw, false, 32, JSON_THROW_ON_ERROR); }
    catch (JsonException) { mcpError(null, -32700, 'Parse error', 400); }
    if (!$request instanceof stdClass || ($request->jsonrpc ?? null) !== '2.0') { mcpError(null, -32600, 'Expected a single JSON-RPC 2.0 object', 400); }
    if (!isset($request->method) && property_exists($request, 'id') && (property_exists($request, 'result') || property_exists($request, 'error'))) { http_response_code(202); exit; }
    if (!is_string($request->method ?? null) || $request->method === '' || (property_exists($request, 'params') && !($request->params instanceof stdClass))) { mcpError(null, -32600, 'Invalid request', 400); }
    if (!property_exists($request, 'id')) { http_response_code(202); exit; }
    $id = $request->id;
    if (!is_string($id) && !is_int($id) && !(is_float($id) && is_finite($id))) { mcpError(null, -32600, 'Invalid request id', 400); }
    $params = $request->params ?? new stdClass();
    try {
        $catalog = new AgentCatalog(); $data = $catalog->data(); $mcp = $data['mcp'];
        $version = $_SERVER['HTTP_MCP_PROTOCOL_VERSION'] ?? '2025-03-26';
        if ($request->method !== 'initialize' && !in_array($version, $mcp['protocolVersions'], true)) { mcpError($id, -32600, 'Unsupported MCP protocol version', 400); }
        $capabilities = ['tools' => ['listChanged' => false], 'resources' => ['subscribe' => false, 'listChanged' => false]];
        $server = ['name' => $mcp['name'], 'version' => $mcp['version'], 'title' => $data['site']['brand'] . ' public information', 'websiteUrl' => $data['site']['origin'] . '/'];
        switch ($request->method) {
            case 'initialize':
                if (!is_string($params->protocolVersion ?? null) || !(($params->capabilities ?? null) instanceof stdClass) || !(($params->clientInfo ?? null) instanceof stdClass) || !is_string($params->clientInfo->name ?? null) || !is_string($params->clientInfo->version ?? null)) {
                    mcpError($id, -32602, 'protocolVersion, capabilities and clientInfo are required');
                }
                $result = ['protocolVersion' => in_array($params->protocolVersion, $mcp['protocolVersions'], true) ? $params->protocolVersion : $mcp['protocolVersions'][0], 'capabilities' => $capabilities, 'serverInfo' => $server,
                    'instructions' => 'Public service/product information and indicative prices only. Tools do not save inquiries, send messages, access accounts or accept payments. Confirm scope and quotation with BUZLIKE SYSTEMS.'];
                break;
            case 'ping': $result = new stdClass(); break;
            case 'tools/list': $result = ['tools' => $catalog->tools()]; break;
            case 'tools/call':
                $names = array_column($catalog->tools(), 'name');
                if (!is_string($params->name ?? null) || !in_array($params->name, $names, true) || (property_exists($params, 'arguments') && !($params->arguments instanceof stdClass))) { mcpError($id, -32602, 'Unknown tool or invalid arguments'); }
                try {
                    $value = $catalog->call($params->name, get_object_vars($params->arguments ?? new stdClass()));
                    $result = ['content' => [['type' => 'text', 'text' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)]], 'structuredContent' => $value];
                } catch (InvalidArgumentException $error) { $result = ['content' => [['type' => 'text', 'text' => $error->getMessage()]], 'isError' => true]; }
                break;
            case 'resources/list': $result = ['resources' => $catalog->resources()]; break;
            case 'resources/read':
                if (!is_string($params->uri ?? null) || strlen($params->uri) > 512) { mcpError($id, -32602, 'A public resource URI is required'); }
                try { $resource = $catalog->read($params->uri); unset($resource['name']); $result = ['contents' => [$resource]]; }
                catch (InvalidArgumentException) { mcpError($id, -32602, 'Unknown public resource'); }
                break;
            case 'server/discover': $result = ['serverInfo' => $server, 'supportedVersions' => $mcp['protocolVersions']]; break;
            default: mcpError($id, -32601, 'Method not found');
        }
        mcpJson(['jsonrpc' => '2.0', 'id' => $id, 'result' => $result]);
    } catch (Throwable) { error_log('BUZLIKE public MCP unavailable'); mcpError($id, -32603, 'Public information temporarily unavailable', 500); }
}

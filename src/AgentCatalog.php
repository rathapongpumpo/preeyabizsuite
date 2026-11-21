<?php
declare(strict_types=1);

/** Public catalog only. No database, sessions, mail transport or customer data. */
final class AgentCatalog {
    private array $data;
    public static function publicDirectory(): string {
        $root = dirname(__DIR__);
        // The release builder maps public/ to public_html/ on Hostinger.
        return is_dir($root . '/public_html') ? $root . '/public_html' : $root . '/public';
    }
    public function __construct() {
        $this->data = json_decode((string) file_get_contents(self::publicDirectory() . '/assets/agent-catalog.json'), true, 32, JSON_THROW_ON_ERROR);
    }
    public function data(): array { return $this->data; }
    public function tools(): array {
        return array_map(static function(array $tool): array {
            // JSON Schema's empty properties map must remain {}, not PHP's [].
            if ($tool['inputSchema']['properties'] === []) { $tool['inputSchema']['properties'] = new stdClass(); }
            return $tool + ['annotations' => ['readOnlyHint' => true, 'destructiveHint' => false, 'idempotentHint' => true, 'openWorldHint' => false]];
        }, $this->data['tools']);
    }
    public function call(string $name, array $input): array {
        if ($name !== 'estimate_project') {
            if ($input) { throw new InvalidArgumentException('This tool takes no arguments'); }
            return match ($name) {
                'list_systems' => ['systems' => $this->data['products'], 'services' => $this->data['estimate']['systems']],
                'get_contact' => $this->data['contact'],
                default => throw new InvalidArgumentException('Unknown tool'),
            };
        }
        if (array_diff(array_keys($input), ['systems', 'model'])) { throw new InvalidArgumentException('Unknown argument'); }
        $systems = $input['systems'] ?? null; $model = array_key_exists('model', $input) ? $input['model'] : 'template'; $estimate = $this->data['estimate'];
        if (!is_array($systems) || !array_is_list($systems) || !$systems || count($systems) > 6 || !is_string($model) || !isset($estimate['models'][$model])) {
            throw new InvalidArgumentException('Invalid systems or model');
        }
        foreach ($systems as $system) {
            if (!is_string($system) || !isset($estimate['systems'][$system])) { throw new InvalidArgumentException('Invalid systems or model'); }
        }
        if (count(array_unique($systems)) !== count($systems)) { throw new InvalidArgumentException('Duplicate system'); }
        foreach ($estimate['rates'][$model] as $tier) {
            if (count($systems) <= $tier['count']) {
                return ['currency' => 'THB', 'min' => $tier['min'], 'max' => $tier['max'], 'plus' => !empty($tier['plus']), 'model' => $model,
                    'unit' => $model === 'retainer' ? 'month' : 'project', 'timeline' => $tier['time'], 'systems' => $systems,
                    'estimateOnly' => true, 'note' => $this->data['estimateNote'], 'pricingUrl' => $this->data['site']['origin'] . '/pricing'];
            }
        }
        throw new InvalidArgumentException('Invalid scope');
    }
    public function resources(): array {
        $base = $this->data['site']['origin'];
        $resources = [['uri' => $base . '/llms.txt', 'name' => 'Site summary', 'mimeType' => 'text/plain']];
        foreach (['index' => 'BUZLIKE SYSTEMS', 'about' => 'Service information', 'contact' => 'Contact', 'pricing' => 'Indicative prices', 'privacy' => 'Privacy', 'terms' => 'Website terms'] as $slug => $title) {
            $resources[] = ['uri' => $base . '/' . $slug . '.md', 'name' => $title, 'mimeType' => 'text/markdown'];
        }
        return $resources;
    }
    public function read(string $uri): array {
        foreach ($this->resources() as $resource) {
            if ($resource['uri'] !== $uri) { continue; }
            $file = basename((string) parse_url($uri, PHP_URL_PATH));
            return $resource + ['text' => (string) file_get_contents(self::publicDirectory() . '/' . $file)];
        }
        throw new InvalidArgumentException('Unknown public resource');
    }
}

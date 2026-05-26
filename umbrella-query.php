<?php
/**
 * Umbrella 天气记录查询 API
 * 部署位置: www.kisara.art/umbrella/umbrella-query.php
 * 支持 action: stats | latest | range | date
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// --- 自动加载 .env ---
function loadEnv() {
    $envPath = __DIR__ . '/.env';
    if (!file_exists($envPath)) return;
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $eq = strpos($line, '=');
        if ($eq === false) continue;
        $key = trim(substr($line, 0, $eq));
        $val = trim(substr($line, $eq + 1));
        if (!isset($_ENV[$key])) {
            $_ENV[$key] = $val;
            putenv("{$key}={$val}");
        }
    }
}
loadEnv();

// --- 配置 ---
$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_PORT = getenv('DB_PORT') ?: '3306';
$DB_NAME = getenv('DB_NAME') ?: 'umbrella';
$DB_USER = getenv('DB_USER') ?: 'umbrella_user';
$DB_PASS = getenv('DB_PASS') ?: '';
$API_KEY = getenv('UMBRELLA_API_KEY') ?: 'kisara-umbrella-2026';

// --- API Key 验证 ---
$headers = getallheaders();
$headerKey = isset($headers['X-API-Key']) ? $headers['X-API-Key'] : '';
$getKey = isset($_GET['key']) ? $_GET['key'] : '';
if ($headerKey !== $API_KEY && $getKey !== $API_KEY) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

// --- 数据库连接 ---
try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'DB connect failed: ' . $e->getMessage()]);
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : 'latest';

// ========== action = stats ==========
if ($action === 'stats') {
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM weather_records");
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    $stmt = $pdo->query("SELECT MIN(record_date) as min_date, MAX(record_date) as max_date FROM weather_records");
    $range = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT AVG(temp) as avg_temp, MIN(temp) as min_temp, MAX(temp) as max_temp FROM weather_records WHERE temp IS NOT NULL");
    $temp = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT AVG(humidity) as avg_humidity, MIN(humidity) as min_humidity, MAX(humidity) as max_humidity FROM weather_records WHERE humidity IS NOT NULL");
    $hum = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT COUNT(*) as alert_count FROM weather_records WHERE alert_sent = 1");
    $alertCount = $stmt->fetch(PDO::FETCH_ASSOC)['alert_count'];

    $stmt = $pdo->query("SELECT level, COUNT(*) as cnt FROM weather_records GROUP BY level ORDER BY cnt DESC LIMIT 5");
    $levels = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'stats' => [
            'total' => (int)$total,
            'date_range' => $range,
            'temperature' => $temp,
            'humidity' => $hum,
            'alert_count' => (int)$alertCount,
            'level_distribution' => $levels
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ========== action = latest ==========
if ($action === 'latest') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    if ($limit > 2000) $limit = 2000;

    $stmt = $pdo->prepare("SELECT * FROM weather_records ORDER BY record_date DESC, record_time DESC LIMIT :limit");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'total' => count($records),
        'records' => $records
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ========== action = range ==========
if ($action === 'range') {
    $start = isset($_GET['start']) ? $_GET['start'] : '';
    $end = isset($_GET['end']) ? $_GET['end'] : '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 1000;
    if ($limit > 5000) $limit = 5000;

    $where = [];
    $params = [];
    if ($start) {
        $where[] = "CONCAT(record_date, ' ', record_time) >= :start";
        $params[':start'] = $start;
    }
    if ($end) {
        $where[] = "CONCAT(record_date, ' ', record_time) <= :end";
        $params[':end'] = $end;
    }
    $whereSql = count($where) ? 'WHERE ' . implode(' AND ', $where) : '';

    $sql = "SELECT * FROM weather_records {$whereSql} ORDER BY record_date ASC, record_time ASC LIMIT :limit";
    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'total' => count($records),
        'records' => $records
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ========== action = date ==========
if ($action === 'date') {
    $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
    $stmt = $pdo->prepare("SELECT * FROM weather_records WHERE record_date = :date ORDER BY record_time ASC");
    $stmt->execute([':date' => $date]);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'date' => $date,
        'total' => count($records),
        'records' => $records
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 未知 action
echo json_encode(['success' => false, 'error' => 'Unknown action. Use: stats | latest | range | date']);

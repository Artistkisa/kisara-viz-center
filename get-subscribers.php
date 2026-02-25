<?php
/**
 * 获取订阅者列表（内部使用）
 * 路径: /umbrella/get-subscribers.php
 */

header('Content-Type: application/json; charset=utf-8');

// 简单鉴权（通过特定参数）
$secret = $_GET['secret'] ?? '';
if ($secret !== 'kisara2025') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Access denied']);
    exit;
}

// 数据库配置
$db_config = [
    'host' => 'localhost',
    'user' => 'svh_64dplug',
    'pass' => 'Ab123456@',
    'name' => 'svh_64dplug'
];

// 连接数据库
$db = new mysqli($db_config['host'], $db_config['user'], $db_config['pass'], $db_config['name']);

if ($db->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => '数据库连接失败']);
    exit;
}

$db->set_charset('utf8mb4');

// 查询所有活跃订阅者
$result = $db->query("SELECT email, unsubscribe_token FROM zbp_umbrella_subscribers WHERE status = 'active'");

$subscribers = [];
while ($row = $result->fetch_assoc()) {
    $subscribers[] = [
        'email' => $row['email'],
        'token' => $row['unsubscribe_token']
    ];
}

$db->close();

echo json_encode([
    'success' => true,
    'count' => count($subscribers),
    'subscribers' => $subscribers
]);

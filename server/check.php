<?php
require __DIR__ . '/functions.php';
header('Content-Type: application/json');

if ($id = _($_REQUEST, 'id')) {
    echo json_encode(['status' => 1, 'data' => []]);
} else {
    $data = $_REQUEST;
    $data['id'] = 666;
    $data['status'] = 'processing';
    $data['chunks'] = [];
    echo json_encode(['status' => 1, 'data' => $data]);
}

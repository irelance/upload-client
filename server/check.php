<?php
require __DIR__ . '/functions.php';
header('Content-Type: application/json');

$data = $_REQUEST;
if ($id = _($_REQUEST, 'id')) {
    $data['id'] = time();
    $data['status'] = 'processing';
    $data['chunks'] = [];
    echo json_encode(['status' => 1, 'data' => $data]);
} else {
    $data['id'] = time();
    $data['status'] = 'processing';
    $data['chunks'] = [];
    echo json_encode(['status' => 1, 'data' => $data]);
}

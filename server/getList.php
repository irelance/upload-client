<?php
require __DIR__ . '/functions.php';
header('Content-Type: application/json');
echo json_encode(['status' => 1, 'data' => [
    [
        'id' => 1,
        'name' => '官方sdk.zip',
        'status' => 'processing',
        'path' => '',
        'hash' => '3374d0055e6c4cd087f597a661d3151d',
        'size' => 10240,
        'chunk_size' => 1024,
        'chunk_number' => 4,
        //'chunks' => [0, 1, 3],
    ]
]]);

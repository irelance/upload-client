<?php
require __DIR__ . '/functions.php';
header('Content-Type: application/json');

$id = _($_POST, 'id');
$name = _($_POST, 'name');
$chunkNumber = _($_POST, 'chunk_number');
$start = _($_POST, 'start');
$end = _($_POST, 'end');
$data = _($_POST, 'data');
if (!is_dir(__DIR__ . '/uploads/' . $id)) {
    mkdir(__DIR__ . '/uploads/' . $id);
}
if (false === file_put_contents(__DIR__ . '/uploads/' . $id . '/' . $chunkNumber . '_' . $start . '_' . $end, base64_decode($data))) {
    echo json_encode(['status' => 0, 'msg' => 'chunk can not save']);
} else {
    echo json_encode(['status' => 1, 'msg' => 'success']);
}

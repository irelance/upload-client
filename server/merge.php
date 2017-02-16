<?php
require __DIR__ . '/functions.php';
header('Content-Type: application/json');

$id = _($_REQUEST, 'id');
$hash = _($_REQUEST, 'hash');
$dir = __DIR__ . '/uploads/' . $id;
if (!is_dir($dir)) {
    echo json_encode(['status' => 0, 'msg' => 'chunks not found']);
    exit;
}
if (!$dh = opendir($dir)) {
    echo json_encode(['status' => 0, 'msg' => 'chunks not found']);
    closedir($dh);
    exit;
}
$fps = [];
while (($fileSlice = readdir($dh)) !== false) {
    if (substr_count($fileSlice, "_") == 2) {
        list($currentChunk, $start, $end) = explode('_', $fileSlice);
        $fps[$currentChunk] = $dir . '/' . $fileSlice;
    }
}
closedir($dh);
$file=$dir . '/' . $hash;
$fileFp = fopen($file, 'w');
ksort($fps);
foreach ($fps as $k => $v) {
    if (!fputs($fileFp, file_get_contents($v))) {
        echo json_encode(['status' => 0, 'msg' => 'chunks not found']);
        fclose($fileFp);
        exit;
    }
}
fclose($fileFp);
if ($hash != hash_file('md5', $file)) {
    echo json_encode(['status' => 0, 'msg' => 'fail']);
    exit;
}
echo json_encode(['status' => 1, 'msg' => 'success']);

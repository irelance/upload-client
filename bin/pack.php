<?php
/**
 * Created by PhpStorm.
 * User: irelance
 * Date: 2017/2/21
 * Time: 下午1:10
 */
define('ROOT', dirname(__DIR__));
define('SRC', ROOT . '/src');
define('DIST', ROOT . '/dist');

class Pack
{
    public $target = null;

    public function __construct($targetName)
    {
        if (!$targetName) {
            $targetName = 'upload-client.min.js';
        }
        $this->target = fopen(DIST . '/' . $targetName, 'w');
    }

    public function __destruct()
    {
        fclose($this->target);
    }

    public function append($fileName)
    {
        $fileName = SRC . '/' . $fileName;
        if (is_file($fileName)) {
            fputs($this->target, file_get_contents($fileName));
        }
    }

    public function run($arr)
    {
        foreach ($arr as $item) {
            $this->append($item);
        }
    }
}

$pack = new Pack('');
$pack->run([
    'functions.js',
    'global.js',
    'creator.js',
    'hash-adapter.js',
    'item.js',
    'lang.js',
    'modal.js',
    'table.js',
    'lang/zh-cn.js'
]);

<?php
/**
 * Created by PhpStorm.
 * User: irelance
 * Date: 2017/2/15
 * Time: 下午5:48
 */
function _($arr, $index, $default = null)
{
    return isset($arr[$index]) ? $arr[$index] : $default;
}

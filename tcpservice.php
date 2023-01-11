<?php
echo ("OpenSwoole Version is" . phpversion("OpenSwoole")."\n");
$host = '0.0.0.0';
$port = 9501;
$mode = SWOOLE_PROCESS;
$socke_type = SWOOLE_SOCK_TCP;
$serv = new swoole_server($host, $port);

$serv->on('connect', function ($serv, $fd) {
    echo 'client ' . $fd . ': connection succeeded' . PHP_EOL;
});

// -------------------------------------------------------------------------

$serv->on('receive', function ($serv, $fd, $from_id, $data) {
    echo 'guest
client' . $fd . ':' . $data . PHP_EOL;
    $serv->send($fd, '{"data":[{"cardid":"123456","cjihao":0,"mjihao":
0,"status":1,"time":"0928162352","output":2}],"code":0,"message":""}');
    $time = date("Y-m-d H:i:s");
    $fp = fopen('index.php', 'a+');
    fwrite($fp, 'echo \'' . $time . '
' . '\';');
    fwrite($fp, "\n");
    fwrite($fp, print_r('echo \'' . $data . '\'.PHP_EOL;', true));
    fwrite($fp, "\n");
    fclose($fp);
});

// -------------------------------------------------------------------------

$serv->on('close', function ($ser, $fd) {
    echo 'client' . $fd . ':close connection' . PHP_EOL;
});

// -------------------------------------------------------------------------

$serv->start();
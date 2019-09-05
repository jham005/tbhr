<?php
session_start();
setcookie(session_name(), '', 100);
session_unset();
session_destroy();
$_SESSION = array();

session_start();

$_SESSION['token'] = $token = bin2hex(random_bytes(32));
$_SESSION['live'] = 'live-2019.csv';

header('Content-Type: application/json');
$preregistered = [];
$fd = @fopen("runners-2019.csv", 'rb');
if ($fd) {
  while ($row = fgetcsv($fd))
    $preregistered[] = $row;
  
  fclose($fd);
}

$start = 'Start';
$fd = @fopen("checkpoints.csv", 'rb');
if ($fd) {
  if ($row = fgetcsv($fd))
    $start = $row[0];
  fclose($fd);
}

echo json_encode(array('token' => $token, 'start' => $start, 'preregistered' => $preregistered));

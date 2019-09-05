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
$checkpoints = [];
$fd = @fopen("checkpoints.csv", 'rb');
if ($fd) {
  while ($row = fgetcsv($fd)) {
    $row[2] = floatval($row[2]);
    $row[3] = floatval($row[3]);
    $checkpoints[] = $row;
  }
  
  fclose($fd);
}

echo json_encode(array('token' => $token, 'checkpoints' => $checkpoints));

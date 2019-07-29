<?php
session_start();

if (!isset($_POST['token']) || !isset($_SESSION['token']) || !hash_equals($_SESSION['token'], $_POST['token'])) {
  http_response_code(403);
  exit;
}

$token = $_SESSION['token'] = bin2hex(random_bytes(32));

$fd = fopen("live.csv", 'a+b');
if (!$fd) {
  http_response_code(503);
  exit;
}

if (!flock($fd, LOCK_SH)) {
  fclose($fd);
  http_response_code(503);
  exit;
}


// Events:
//   CHECKPOINT,<checkpoint>,<description>,<longitude>,<latitude>
// or
//   UPDATE,<checkpoint>,<who>,<server-ts>
// followed by any of:
//   REGISTER,<bib>,<name>,<club>,<category>
//   DELETE,<event-id>,<client-ts>
//   TIME,<bib>,<time>,<client-ts>

// <bib> is an integer
// <event-id> is the ftell() offset of a previous event.
// (We prefer ftell() over, say, a line number, because it avoids the need to parse the entire log)
// <client-ts> and <server-ts> are Unix timestamps

$lastId = intval($_POST['lastId']);
$serverEvents = [];
$checkpoint = strval($_POST['checkpoint']);
$currentCheckpoint = '';
$lastUpdate = null;
fseek($fd, $lastId);
while ($row = fgetcsv($fd)) {
  $tag = $row[0];
  if ($tag == 'UPDATE') {
    $row[3] = intval($row[3]);
    $lastUpdate = $row;
    $currentCheckpoint = $row[2];
  } else if ($tag == 'REGISTER' || $tag == 'CHECKPOINT' || $currentCheckpoint == $checkpoint)  {
    if ($lastUpdate) {
      $serverEvents[] = $lastUpdate;
      $lastUpdate = null;
    }

    if ($tag == 'TIME') {
      $row[1] = intval($row[1]);
      $row[2] = intval($row[2]);
      $row[3] = intval($row[3]);
    } else if ($tag == 'DELETE') {
      $row[1] = intval($row[1]);
      $row[2] = intval($row[2]);
    } else if ($tag == 'REGISTER')
      $row[1] = intval($row[1]);
    else if ($tag == 'CHECKPOINT') {
      $row[3] = floatval($row[3]);
      $row[4] = floatval($row[4]);
    }
    
    $row[] = $lastId;
    $serverEvents[] = $row;
  }
  
  $lastId = ftell($fd);
}
  
if (!flock($fd, LOCK_EX)) {
  fclose($fd);
  http_response_code(503);
  exit;
}

$lastId = ftell($fd);
$clientEvents = [];
$user = strval($_POST['who']) ?? $checkpoint;
$updates = isset($_POST['updates']) ? json_decode($_POST['updates']) : [];
if (!empty($updates)) {
  fputcsv($fd, ["UPDATE", $user, $checkpoint, time()]);
  foreach ($updates as $row) {
    fputcsv($fd, $row);
    $row[] = $lastId;
    $lastId = ftell($fd);
    $clientEvents[] = $row;
  }
}

flock($fd, LOCK_UN);
fclose($fd);

header('Content-Type: application/json');
echo json_encode(['token' => $token,
		  'lastId' => $lastId,
		  'updates' => array_merge($serverEvents, $clientEvents)]);

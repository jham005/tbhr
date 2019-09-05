<?php
// Events:
//   UPDATE,<checkpoint>,<who>,<server-ts>
// followed by any of:
//   REGISTER,<bib>,<sname>,<fname>,<club>,<category>[,<start group>]
//   DELETE,<event-id>,<client-ts>
//   TIME,<bib>,<time>,<client-ts>,<retired>

// <bib> is an integer
// <event-id> is the ftell() offset of a previous event.
// (We prefer ftell() over, say, a line number, because it avoids the need to parse the entire log)
// <client-ts> and <server-ts> are Unix timestamps

session_start();

if (!isset($_POST['token']) || !isset($_SESSION['token']) || !hash_equals($_SESSION['token'], $_POST['token'])) {
  //  http_response_code(403);
  //  exit;
}

$token = $_SESSION['token'] = bin2hex(random_bytes(32));
$resultFile = isset($_SESSION['live']) ? $_SESSION['live'] : 'live.csv';

$fd = fopen($resultFile, 'a+b');
if (!$fd) {
  http_response_code(503);
  exit;
}

if (!flock($fd, LOCK_SH)) {
  fclose($fd);
  http_response_code(503);
  exit;
}

$lastId = isset($_POST['lastId']) ? intval($_POST['lastId']) : 0;
$serverEvents = [];
$checkpoint = isset($_POST['checkpoint']) ? strval($_POST['checkpoint']) : '?';
$currentCheckpoint = '';
$lastUpdate = null;
fseek($fd, $lastId);
while ($row = fgetcsv($fd)) {
  $tag = $row[0];
  if ($tag == 'UPDATE') {
    $row[3] = intval($row[3]);
    $lastUpdate = $row;
    $currentCheckpoint = $row[2];
  } else if ($tag == 'REGISTER' || ($tag == 'TIME' && $row[4] != '-') || $currentCheckpoint == $checkpoint) {
    // Caller is interested in: new registrations, withdrawn runners, times for own checkpoint
    if ($lastUpdate) {
      $serverEvents[] = $lastUpdate;
      $lastUpdate = null;
    }

    if ($tag == 'TIME') {
      $row[1] = intval($row[1]); // bib
      $row[2] = intval($row[2]); // time
      $row[3] = intval($row[3]); // editedAt
    } else if ($tag == 'DELETE') {
      $row[1] = intval($row[1]);
      $row[2] = intval($row[2]);
    } else if ($tag == 'REGISTER')
      $row[1] = intval($row[1]);
    
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
$user = isset($_POST['who']) ? strval($_POST['who']) : $checkpoint;
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

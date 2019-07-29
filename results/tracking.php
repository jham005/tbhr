<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

// REGISTER:
// event: REGISTER
// data: { bib: <bib>, name: <name>, club: <club>, category: <category> }

// TIME:
// event: TIME
// data: { bib: <bib>, checkpoint: <checkpoint>, time: <time>, id: <id> }

// event: DELETE
// data: <id>

$lastId = intval($_SERVER['HTTP_X_LAST_EVENT_ID']);

$checkpoint = '';
for (; !connection_aborted(); sleep(30)) {
  $fd = fopen('live.csv', 'rb');
  if (!$fd) continue;
  fseek($fd, $lastId);
  $registrations = [];
  $times = [];
  $deletes = [];
  flock($fd, LOCK_SH);
  echo "id: $lastId\ndata: Polling starting...\n\n";
  for (; $row = fgetcsv($fd); $lastId = ftell($fd)) {
    switch ($row[0]) {
    case 'REGISTER':
      $registrations[] = ['bib' => intval($row[1]), 'name' => $row[2], 'category' => $row[3] ?? '', 'club' => $row[4] ?? ''];
      break;
    case 'UPDATE':
      $checkpoint = $row[2];
      break;
    case 'TIME':
      $times[$lastId] = [
	'bib' => intval($row[1]),
	'checkpoint' => $checkpoint,
	'time' => intval($row[2]),
	'id' => $lastId];
      break;
    case 'DELETE':
      $id = intval($row[1]);
      if (isset($times[$id]))
	unset($times[$id]);
      else
	$deletes[] = $id;
      break;
    }
  }

  flock($fd, LOCK_UN);
  fclose($fd);

  if (!empty($registrations))
    echo "event: REGISTER\ndata: " . json_encode($registrations) . "\n\n";
  if (!empty($times))
    echo "event: TIME\ndata: " . json_encode(array_values($times)) . "\n\n";
  if (!empty($deletes))
    echo "event: DELETE\ndata: " . json_encode($deletes) . "\n\n";

  echo "id: $lastId\ndata: Poll complete\n\n";
  ob_flush();
  flush();
}

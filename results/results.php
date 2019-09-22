<?php
header('Content-Type: text/csv');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

$fd = fopen('live-2019.csv', 'rb');
if (!$fd) {
  http_response_code(503);
  exit;
}

$results = [];
$registrations = [];
$checkpoint = 'Start';
$out = fopen('php://output', 'w');
while ($row = fgetcsv($fd))
  switch ($row[0]) {
  case 'REGISTER':
    $bib = intval($row[1]);
    $name = "$row[3] $row[2]";
    $club = $row[4];
    $category = $row[5];
    $startGroup = $row[6];
    $registrations[$bib] = [$name, $category, $club, $startGroup];
    break;
  case 'UPDATE':
    $checkpoint = $row[2];
    break;
  case 'TIME':
    $bib = intval($row[1]);
    $results[$bib] = [$checkpoint, intval($row[2])];
    break;
  }

uasort($results, positionOrder);
$position = 1;
foreach ($results as $bib => $result) {
  list ($name, $category, $club, $startGroup) = $registrations[$bib];
  list ($checkpoint, $time) = $result;
  fputcsv($out, [$bib, date('c', $time), $position++, $name, $category, $club, $checkpoint, $startGroup]);
}

function positionOrder($a, $b) {
  if ($a[0] == $b[0])
    return $a[1] - $b[1];
  return $a[0] > $b[0] ? 1 : -1;
}
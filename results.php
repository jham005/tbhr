<?php
header('Content-Type: application/json');

function raceDay($year) {
  $firstDayInSeptember = date('w', mktime(0, 0, 0, 9, 1, $year));
  return mktime(12, 0, 0, 9, 4 * 7 - $firstDayInSeptember, $year);
}

$defaultYear = time() > raceDay(date('Y')) ? date('Y') : date('Y') - 1;
$year = $_REQUEST['y'] == 'ALL' ? 'ALL' : filter_var($_REQUEST['y'], FILTER_VALIDATE_INT, array('options' => array('default' => $defaultYear)));
$csvFile = @file("results/$year.csv");

echo '{';
if ($csvFile) {
  echo '"columns": ' . json_encode(str_getcsv($csvFile[0])) . ',';
  echo '"results": [';
  $sep = '';
  foreach ($csvFile as $i => $line)
    if ($i > 0 && trim($line) != '') {
      echo $sep . json_encode(str_getcsv($line));
      $sep = ',';
    }
  
  echo ']';
}

echo '}';
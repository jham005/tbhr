<?php
header('Content-Type: application/json');

echo '{"years": ["ALL"';
foreach (glob('[0123456789]*.csv') as $path) {
  $info = pathinfo($path);
  echo ",$info[filename]";
}

echo ']}';

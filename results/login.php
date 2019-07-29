<?php
session_start();
setcookie(session_name(), '', 100);
session_unset();
session_destroy();
$_SESSION = array();

session_start();

$_SESSION['token'] = $token = bin2hex(random_bytes(32));

header('Content-Type: text/plain; charset=us-ascii');
echo $token;

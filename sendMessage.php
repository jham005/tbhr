<?php
if (empty($_POST['name']) || empty($_POST['email']) || empty($_REQUEST['message']) || empty($_REQUEST['g-recaptcha-response'])) {
  header('Location: index.html#fail');
  exit(1);
}

$response =
  @file_get_contents(
    'https://www.google.com/recaptcha/api/siteverify',
    false,
    stream_context_create(
      array('http' => array('header' => "Content-type: application/x-www-form-urlencoded\r\n",
			    'method'  => 'POST',
			    'content' => http_build_query(array('secret'=> '6Le8jCwUAAAAAN2rv_qC4z3NbDIaoT9CNxyZAMbe',
								'response' => $_REQUEST['g-recaptcha-response'],
								'remoteip' => $_SERVER['REMOTE_ADDR']))))));

$message =
  "\n-- "
  . date(DATE_RFC2822)
  . "\nA message from $_POST[name] <$_POST[email]>:\n$_POST[message]\n\nRecaptcha: $response\nReferer: $_SERVER[HTTP_REFERER]\nIP: $_SERVER[REMOTE_ADDR]\nUser agent: $_SERVER[HTTP_USER_AGENT]";

file_put_contents('./messages.txt', $message, FILE_APPEND | LOCK_EX);

$from = 'twobreweries@gmail.com';
$success = mail('twobreweries@gmail.com', 'TBHR Enquiry', $message, "From: Two Breweries Hill Race <$from>\nX-Mailer: PHP\nReturn-Path: <PHP>\n");
if (!$success) {
  $error = error_get_last()['message'];
  file_put_contents('./messages.txt', $error, FILE_APPEND | LOCK_EX);
  header('Location: index.html#fail');
} else
  header('Location: index.html#sent');

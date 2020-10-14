<?php

/* 
 * The makeBidRow.php is the server side code for the 
 * AJAX makeBidRow call. It creates a new table row 
 * for the bid_table in the bid1846 database.
 * 
 * Input consists the "bid" json string to be stored.
 * 
 * Output is the bid_id of the new table row
 * or "0" if a failure occured. 
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

require_once('config.php');

$link = mysqli_connect(DB_HOST, DB_USER, 
        DB_PASSWORD, DB_DATABASE);
if ($link === false) {
  $logMessage = 'makeBidRow: MySQL Connect Error';
  error_log($logMessage);
  echo "fail";
  exit;
}

$bid = $_REQUEST['bid'];
//Create INSERT query
$qry1 = "INSERT INTO bid_table SET bid='$bid'";  
$result1 = mysqli_query($link,$qry1);
if (!$result1) {   // Did the query fail
  $logMessage = 'makeBidRow: INSERT Error.';
  error_log($logMessage);
  echo 0; 
  exit;
}

$bidid = mysqli_insert_id($link);
echo $bidid;


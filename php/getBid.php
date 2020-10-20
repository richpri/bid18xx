<?php

/* 
 * getBid.php is the server side code for the 
 * AJAX getRec call. It returns the specified table 
 * row from the bid_table in the bid18xx database.
 * 
 * Input consists the "bidid" for the table row to
 * be returned.
 * 
 * Output is a json encoded array. The "return" value in  
 * the array will be either "success" or "fail". If it
 * is "fail" then it will be the only item in the array.
 * If the "return" value is "success", then the rest of the
 * array will be the json string from the updated table row.
 *  
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

require_once('config.php');
$failrtn = array("return" => "fail");
$failreturn = json_encode($failrtn); 

$bidid = filter_input(INPUT_POST, 'bidid',FILTER_SANITIZE_NUMBER_INT);

$link = mysqli_connect(DB_HOST, DB_USER, 
        DB_PASSWORD, DB_DATABASE);
if ($link === false) {
  $logMessage = 'getBid: MySQL Connect Error';
  error_log($logMessage);
  echo $failreturn;
  exit;
}

//Create SELECT query
$qry1 = "SELECT * FROM bid_table WHERE bid_id ='$bidid'";
$result1 = mysqli_query($link, $qry1);
if ($result1) {
  if (mysqli_num_rows($result1) === 0) { // no such bid record
    error_log("getBid: Query failed: No bid record found!");
    echo $failreturn;
    exit;
  } 
} else {
  error_log("getBid: SELECT Query failed: general failure");
  mysqli_query($link, $qry0); // ROLLBACK
  echo $failreturn;
  exit;
}

$bidrow = mysqli_fetch_assoc($result1);
$bidjson = $bidrow['bid'];
$bidarray = json_decode($bidjson, true);
$bidarray["return"] = "success";
$bidjson2 = json_encode($bidarray);
echo $bidjson2; 

<?php

/* 
 * The updtBid.php is the server side code for the 
 * AJAX updtBid call. It updates the specified table 
 * row in the bid_table in the bid18xx database.
 * Before doing so, it tests and then increments the 
 * updtCount value in the "bid" json string. 
 * 
 * Input consists the "bidid" and the new value 
 * of "bid" for the table row.
 * 
 * Output is an echo return status of 
 * "success", "collision" or "fail". 
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

require_once('config.php');
$qry0 = "ROLLBACK";

$link = mysqli_connect(DB_HOST, DB_USER, 
        DB_PASSWORD, DB_DATABASE);
if ($link === false) {
  $logMessage = 'updtBid: MySQL Connect Error';
  error_log($logMessage);
  echo "fail";
  exit;
}

$bidid = filter_input(INPUT_POST, 'bidid',FILTER_SANITIZE_NUMBER_INT);
$bidinput = json_decode($_REQUEST['bid'], true);

// Start transaction.
$qry1 = "START TRANSACTION";
$result1 = mysqli_query($link, $qry1);
if (!$result1) {
  $logMessage = 'updtBid: MySQL START TRANSACTION Error.';
  error_log($logMessage);
  echo "fail";
  exit;
}
//Create SELECT query
$qry2 = "SELECT * FROM bid_table WHERE bid_id ='$bidid' FOR UPDATE";
$result2 = mysqli_query($link, $qry2);
if ($result2) {
  if (mysqli_num_rows($result2) === 0) { // no such bid row
    error_log("updtBid: SELECT Query failed: No bid row found!");
    mysqli_query($link, $qry0); // ROLLBACK
    echo "fail";
    exit;
  } 
} else {
  error_log("updtBid: SELECT Query failed: general failure");
  mysqli_query($link, $qry0); // ROLLBACK
  echo "fail";
  exit;
}

$bidrow = mysqli_fetch_assoc($result2);
$bidjson1 = $bidrow["bid"];
$bidarray = json_decode($bidjson1, true);

if ($bidarray["updtCount"] !== $bidinput["updtCount"]){
  error_log("updtBid: Mismatched updtCount");
  mysqli_query($link, $qry0); // ROLLBACK
  echo "collision";
  exit;
}

$bidinput["updtCount"] += 1; // Increment update counter

$bidjson3 = json_encode($bidinput);

//Create UPDATE query
$qry3 = "UPDATE bid_table SET bid='$bidjson3' WHERE bid_id='$bidid'";  
$result3 = mysqli_query($link,$qry3);
if (!$result3) {   // Did the query fail
  $logMessage = 'updtBid: UPDATE Query failed.';
  error_log($logMessage);
  mysqli_query($link, $qry0); // ROLLBACK
  echo "fail"; 
  exit;
}

$qry4 = "COMMIT";
mysqli_query($link, $qry4); // COMMIT

echo "success";


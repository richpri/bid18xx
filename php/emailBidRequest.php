<?php
/*
 * emailBidRequest.php is the server side code for the 
 * AJAX emailBidRequest call. It creates a bid request
 * email for a specific player. It then calls 
 * sendEmail.php and exits. This leaves it to 
 * sendEmail to return the final 'success' status. 
 * 
 * Input consists the following parameters:
 *   bidid
 *   playerid
 * Both parameters are intigers.
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */
require_once('sendEmail.php');
require_once('config.php');

$link = mysqli_connect(DB_HOST, DB_USER, 
        DB_PASSWORD, DB_DATABASE);
if ($link === false) {
  $logMessage = 'emailBidRequest: MySQL Connect Error';
  error_log($logMessage);
  echo "fail";
  exit;
}

// Insure that the input parameters are integers.
$bidid  = filter_input(INPUT_POST, 'bidid',FILTER_SANITIZE_NUMBER_INT);
$playerid  = filter_input(INPUT_POST, 'playerid',FILTER_SANITIZE_NUMBER_INT);
$server = $_SERVER['SERVER_NAME'];

//Create SELECT query
$qry1 = "SELECT * FROM bid_table WHERE bid_id ='$bidid'";
$result1 = mysqli_query($link, $qry1);
if ($result1) {
  if (mysqli_num_rows($result1) === 0) { // no such bid
    error_log("emailBidRequest: getbid: Query failed: No bid found!");
    echo 'fail';
    exit;
  } else {
    $bidrow = mysqli_fetch_assoc($result1);
    $bidjson = $bidrow["bid"];
    $bidarray = json_decode($bidjson, true);
    $gamename = $bidarray["gameName"];
    $playername = $bidarray["players"][$playerid-1]["name"];
    $address = $bidarray["players"][$playerid-1]["email"];
    $urlkey = $bidarray["players"][$playerid-1]["urlKey"];
  }
} else {
  error_log("emailBidRequest: getbid: Query failed: general failure");
  echo 'fail';
  exit;
}

$linkaddr = SERVER_NAME;
$subject = '[BID18xx] Please submit your bid for the game named ';
$subject .= $gamename;
$body = <<<XEOD
<p>This is a message from the BID18xx server at $server.</p>
<p>Hello $playername:</p>
<p>A new play by email game named <b>$gamename</b> has been created and 
you are a player in this game. <br>This Email initiates your part of 
the player order bidding process for this game.</p> 
<p style='font-weight:bold'>The Bid ID for this bidding process is $bidid.</p>
<p>To make your bid simply click on the URL below and fill in the form
on the page which will then be displayed in your broser.</p>
<p style='font-weight:bold'>
<a href="$linkaddr/bid18xxSubmit.php?urlkey=$urlkey">
$linkaddr/bid18xxSubmit.php?urlkey=$urlkey</a></p>
<p>Have fun!</p>
XEOD;
sendEmail($address, $subject, $body);

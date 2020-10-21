/*
 * The bid18xxSubmit script contains the functions used by the
 * bid18xxSubmit page.
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 *
 * All bid18xx global variables are contained in one 'master variable'
 * called BID18.  This isolates them from all other global variables.
 * The BID18 master variable is defined in the bid18xxCom.js file.
 */

/*
 * The getBidResult function is the call back function for 
 * the ajax calls to getBid.php. It  sets up the   
 * bid18xxSubmit page.
 *  
 * Output from getBid.php is ajson encoded array.   
 * The "return" value will be either "success" or "fail". If 
 * it is "fail" then it will be the only item in the array.
 * If the "return" value is "success", then the rest of the
 * array will be the json string from the specified table row.
 */
function getBidResult(result1) {
  BID18.bid = JSON.parse(result1);
  BID18.updtCount = BID18.bid.updtCount;
  var result = BID18.bid.return;
  if (result === 'fail') {
    var errmsg = 'bid18xxSubmit: getRec.php failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += BID18.adminName + '\n';
    errmsg += BID18.adminEmail;
    alert(errmsg);
    return;
  }
  else if (result !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from getRec.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += BID18.adminName + '\n';
    nerrmsg += BID18.adminEmail;
    alert(nerrmsg);
    return;
  }
  
  var thisPlayer = BID18.bid.players[BID18.input.playerid-1].name
  $('#pid').append( thisPlayer);
  $('#pid').append('.<br><br>This bid request is for the game named '); 
  $('#pid').append(BID18.bid.gameName).append('.');
  
  var urlkey = BID18.bid.players[BID18.input.playerid-1].urlKey;
  if (BID18.input.urlkey !== urlkey) {
    $('#bid').html('<br><br>The <b>urlkey</b> on this link is invalid.');
    $('#bid').append('<br>This should not occur.');
    $('.allforms').hide();
    $('#canform').show();
    return;
  }

// Is this bid done?
  if (BID18.bid.status === 'Done') {
    bidDone();
    return;
  }
  
// Display player status.
  var playerHTML = '<br><table id="rptlist" >';
  playerHTML+= '<caption><b>Status Report</b></caption>';
  playerHTML+= '<tr style="background-color: #ddffdd"><th>Player<br>Name</th>';
  playerHTML+= '<th>Player\'s<br>Status</th></tr>';
  $.each(BID18.bid.players,function(index,listInfo) {
    playerHTML+= '<tr> <td>' + listInfo.name + '</td><td>';
    playerHTML+= listInfo.status + '</td></tr>';
  }); // end of each
  playerHTML+= '</table>';
  $("#rptlist").remove();
  $('#bidrpt').append(playerHTML);
  
// Setup actual bid display.
  $('.allforms').hide();
  $('#bidform').show();
}

/*
 * The processBid function uses the entered bid   
 * to update the current player. It then checks
 * if all players have submitted a bid and calls  
 * the updtBid.php function to update the database.
 */
function processBid() {
  var bidin = $("input[name='bid']:checked").val(); // bid that was selected.
  var playerIndex = BID18.input.playerid - 1;
  BID18.bid.players[playerIndex].bid = bidin;
  BID18.bid.players[playerIndex].status = 'Done';
  // Check if all players have submitted a bid.
  var allDone = 'Yes';
  $.each(BID18.bid.players,function(index,playerInfo) {
    if (playerInfo.status === "Pending") {
      allDone = 'No';
    }
  }); // end of each
  if (allDone === "Yes") {
    BID18.bid.status = "Done";
  }
  var dataString = JSON.stringify(BID18.bid);
  var cString = "bidid=" + BID18.input.bidid;
  cString += "&bid=" + dataString;
  $.post("php/updtBid.php", cString, updateBidResult);
};

/* 
 * Function updtBidResult is the success callback function  
 * for the ajax updtBid.php call made by the processBid()
 * function. It checks for a failure or a collision
 * and then it checks if all bids are done and if not it
 * sets up the response screen for this bid.
 * 
 * Output from updateBid is an echo return status of 
 * "success", "collision" or "fail".
 */
function updateBidResult(result) {
  if (result === 'fail') {
    var errmsg = 'bid18xxSubmit: updtBid.php failed.\n';
    errmsg += 'Please contact the BID18xx webmaster.\n';
    errmsg += BID18.adminName + '\n';
    errmsg += BID18.adminEmail;
    alert(errmsg);
    return;
  }
  if (result === 'collision') { // Back out and perhaps try again
    $('.allforms').hide();
    $('#collform').show();
    return;
  }
  if (result !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'bid18xxSubmit: Invalid return code from updtBid.php.\n';
    nerrmsg += 'Please contact the BID18xx webmaster.\n';
    nerrmsg += BID18.adminName + '\n';
    nerrmsg += BID18.adminEmail;
    alert(nerrmsg);
    return;
  }

// Check if all bids are done.
  if (BID18.bid.status === "Done") {
    bidDone();
// send result emails 
    $("#bid").append("<br>Bid result emails will now be sent to all players.");
    BID18.mailError = false;
    BID18.firstReply = true;
    var cString, pl, pLine;
    for (i=0; i<BID18.playercount; i++) {
      pl = i+1;
      cString = 'bidid=' + BID18.bidID;
      cString += '&playerid=' + pl;
      $.post("php/emailBidResult.php", cString, emailResultCallback);
      pLine = "<br>Prepairing bid result email for player ";
      pLine += BID18.bid.players[i].name; 
      $("#bid").append(pLine);
    }
  } else {
    window.location.assign("bid18xxGoodby.html?msgtype=2");
  }
}

/*
 * The bidDone function deletes any previously displayed bid 
 * status table. It then appends the final bid status table
 * to the bidrpt div. The final bid status table shows all
 * bids for all players. It then calls the sortPlayers 
 * function. Finally, The bidDone function appends
 * a completed message to the 'bid' paragraph.
 */
function bidDone() {
  var rptHTML = '<br><table id="rptlist" >';
  rptHTML+= '<caption><b>Final Bid Status</b></caption>';
  rptHTML+= '<tr style="background-color: #ddffdd"><th>Player<br>Name</th>';
  rptHTML+= '<th>Player\'s<br>Bid</th></tr>';
  $.each(BID18.bid.players,function(index,listInfo) {
    rptHTML+= '<tr> <td>' + listInfo.name + '</td><td>';
    rptHTML+= listInfo.bid + '</td></tr>';
  }); // end of each
  rptHTML+= '</table>';
  $("#rptlist").remove();
  $('#bidrpt').append(rptHTML);
  sortPlayers();
  $('#bid').append('<br><br>This bid is completed.');
  $('.allforms').hide();
  $('#doneform').show();
}

/*
 * The sortPlayers function deletes any previously displayed  
 * playerOrder table. It then appends the sorted player order 
 * table to the player order div. 
 */
function sortPlayers() {
  var orderHTML = '<br><table id="orderlist" >';
  orderHTML+= '<caption><b>Player Order</b></caption>';
  orderHTML+= '<tr style="background-color: #ddffdd">';
  orderHTML+= '<th>Player<br>Name</th></tr>';
  $.each(BID18.bid.players,function(index,listInfo) {
    if (listInfo.bid === "10") {
      orderHTML += '<tr> <td>' + listInfo.name + '</td></tr>';
    }
  }); // end of each 10
  $.each(BID18.bid.players,function(index,listInfo) {
    if (listInfo.bid === "5") {
      orderHTML += '<tr> <td>' + listInfo.name + '</td></tr>';
    }
  }); // end of each 5
  $.each(BID18.bid.players,function(index,listInfo) {
    if (listInfo.bid === "0") {
      orderHTML += '<tr> <td>' + listInfo.name + '</td></tr>';
    }
  }); // end of each 0
  orderHTML+= '</table>';
  $("#orderlist").remove();
  $("#playerorder").append(orderHTML).show();
}

/* 
 * Function emailResultCallback is the call back function for
 * the ajax calls to emailBidResult.php. It will have to
 * process returns from multiple emails for the same call.
 * It only needs to check for errors and it only needs to  
 * report the first error. 
 *  
 * Output from emailBidResult.php 
 * is an echo return status:
 *   "success" - Email sent.
 *   "fail"    - Uexpected error - This email not sent.
 */
function emailResultCallback(response) {
  var pLine;
  if (response === 'fail') {
    if (BID18.mailError === false) {
      var errmsg = 'Sending an email to a player failed.\n';
      errmsg += 'Please contact the BID18xx webmaster.\n';
      errmsg += BID18.adminName + '\n';
      errmsg += BID18.adminEmail;
      alert(errmsg);
      BID18.mailError = true;
    }
  }
  else if (response !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from emailPlayer.php.\n';
    nerrmsg += 'Please contact the BID18xx webmaster.\n';
    nerrmsg += BID18.adminName + '\n';
    nerrmsg += BID18.adminEmail;
    alert(nerrmsg);
  }
  else {
    pLine = "<br>A bid request email has been sent."; 
    $("#bid").append(pLine);
  }
}
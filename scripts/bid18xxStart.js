/*
 * The bid18xxStart script contains the functions used by the
 * bid18xxStart page.
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 *
 * All bid18xx global variables are contained in one 'master variable'
 * called BID18.  This isolates them from all other global variables.
 * The BID18 master variable is defined in the bid18xxCom.js file.
 */

/*
 * The SetupBid function uses the functions below to setup a
 * new bid by creating a new row in the bid_table and then 
 * sending an email to each player to kick off the bid process.
 */
function SetupBid() {
  BID18.gname = $("#game").val();
  if (BID18.gname === "") {
    $("#game_error").show();  
    $("#game").focus();  
    return false; 
  }
  BID18.nlist = [];
  BID18.alist = [];

  makePinfo();
  if (BID18.errtxt !== "") {
  BID18.nlist = [];
  BID18.alist = [];
  return false;
  }

  makeBidRow();
  if (BID18.errtxt !== "") {
  BID18.nlist = [];
  BID18.alist = [];
  return false;
  }
}

/*
 * The makePinfo function sets up the BID18.nlist array 
 * and the BID18.alist array by accessing the player
 * name and email addresse fields from the setup form
 * on the bid18xxStart page. It also checks for 
 * duplicate names.
 */
function makePinfo() {
  $("#emsg").text("").hide(); 
  var j, k, n, pp;
  $('.fn1').each(function(i){
    n = BID18.playercount - i-1;
    BID18.nlist[n] = $(this).val();
    if (BID18.nlist[n] === "" && i < BID18.playercount) {
      pp = i + 1;
      BID18.errtxt = 'Player ' + pp + ' is missing.';
      $("#emsg").text(BID18.errtxt).show();  
      $(this).focus();  
      return false; 
    }
  });
  for(j=0; j< BID18.nlist.size; j++) { 
    for(k=0; k<j; k++) { // test for duplicate player.
      if (BID18.nlist[j] === BID18.nlist[k]) {
        BID18.errtxt = 'Do not duplicate player names.';
        $("#emsg").text(BID18.errtxt).show(); 
        return false;
      }
    }
  }
    
  if (BID18.errtxt === "") {
    $('.fn2').each(function(i){
      n = BID18.playercount - i-1;
      BID18.alist[n] = $(this).val();
      if (BID18.alist[n] === "" && i < BID18.playercount) {
        pp = i + 1;
        BID18.errtxt = 'Player ' + pp + ' Email is missing.';
        $("#emsg").text(BID18.errtxt).show();  
        $(this).focus();  
        return false; 
      }
    });
  }
}

/* 
 * Function makeBidRow creates "BID18.bid",
 * and then uses JSON.stringify to convert it 
 * to the JSON component of the new bid_table 
 * row for this bid.
 * It then does an ajax call to makeBidRow.php.
 */
function makeBidRow() {
  var i, j;
  BID18.bid = {};
  BID18.bid.gameName = BID18.gname;
  BID18.bid.status = "Active";
  BID18.bid.numbPlayers = BID18.playercount;
  BID18.bid.updtCount = 0;  
  BID18.bid.players = [];
  for (i=0; i<BID18.playercount; i++) {
    j = BID18.playercount - i - 1;
    BID18.bid.players[i] = {};
    BID18.bid.players[i].order = i+1;
    BID18.bid.players[i].name = BID18.nlist[j];
    BID18.bid.players[i].email = BID18.alist[j];
    BID18.bid.players[i].status = "Pending";
    BID18.bid.players[i].bid = 0;
  }
  var dataString = JSON.stringify(BID18.bid);
  var postString = 'bid=' + dataString;
//  alert(postString);
  $.post("php/makeBidRow.php", postString, newBidOK);
  return;
}

/* 
 * Function newBidOK is the success callback function for 
 * the ajax makeBidRow.php call. It checks for a failure
 * and then reports the new bid ID to the start page.
 * Finally it adds a psudorandom url key to the array for
 * each player calls the updatebid.php function.
 * 
 * The php/makeBid.php call returns the numeric bid_id of 
 * the new table row or the intiger 0 if a failure occured.
 */
function newBidOK(response) {
  if (response === "0") {
    var errmsg = 'The bid_table row creation failed.\n';
    errmsg += 'Please contact the BID18xx webmaster.\n';
    errmsg += BID18.adminName + '\n';
    errmsg += BID18.adminEmail;
    alert(errmsg);
    window.location = 'index.html';
    return false;    
  }
  BID18.bidID = response;
  for (i=0; i<BID18.playercount; i++) {
    BID18.bid.players[i].urlKey = urlKeyGen(BID18.bidID, i+1);
  }
  var dataString = JSON.stringify(BID18.bid);
  var cString = "bidid=" + BID18.bidID;
  cString += "&bid=" + dataString;
  $.post("php/updtBid.php", cString, updtBidResult);
}

/* 
 * Function updtBidResult is the success callback function  
 * for the ajax updtBid.php call made by the newBidOK()
 * function. It checks for a failure or a collision
 * and then it calls the emailBidRequests.php function.
 * 
 * Output from updateBid is an echo return status of 
 * "success", "collision" or "fail".
 */
function updtBidResult(result) {
  if (result === 'fail') {
    var errmsg = 'bid18xxStart: updtBid.php failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += BID18.adminName + '\n';
    errmsg += BID18.adminEmail;
    alert(errmsg);
    return;
  }
  if (result === 'collision') { // This should never happen
    var errmsg2 = 'bid18xxStart: updtBid.php failed.\n';
    errmsg2 += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg2 += BID18.adminName + '\n';
    errmsg2 += BID18.adminEmail;
    alert(errmsg2);
    return;
  }
  if (result !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'bid18xxStart: Invalid return code from updtBid.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += BID18.adminName + '\n';
    nerrmsg += BID18.adminEmail;
    alert(nerrmsg);
    return;
  }
  var didmsg = "The new bid ID = " + BID18.bidID;
  $("#did").text(didmsg).show();
  $("#did").append(".<br>Bid request emails will now be sent to all players.");
  BID18.mailError = false;
  BID18.firstReply = true;
  var cString, pl, pLine;
  for (i=0; i<BID18.playercount; i++) {
    pl = i+1;
    cString = 'bidid=' + BID18.bidID;
    cString += '&playerid=' + pl;
    $.post("php/emailBidRequest.php", cString, startupEmailsResult);
    pLine = "<br>Prepairing bid request email for player ";
    pLine += BID18.bid.players[i].name; 
    $("#did").append(pLine);
  }
}

/* 
 * Function startupEmailsResult is the call back function for
 * the ajax calls to emailBidRequests.php. It will have to
 * process returns from multiple emails for the same call.
 * It only needs to check for errors and it only needs to  
 * report the first error. 
 *  
 * Output from emailBidRequests.php 
 * is an echo return status:
 *   "success" - Email sent.
 *   "fail"    - Uexpected error - This email not sent.
 */
function startupEmailsResult(response) {
  var pLine;
  if (response === 'fail') {
    if (BID18.mailError === false) {
      var errmsg = 'Sending an email to a player failed.\n';
      errmsg += 'Please contact the DRAFT1846 webmaster.\n';
      errmsg += BID18.adminName + '\n';
      errmsg += BID18.adminEmail;
      alert(errmsg);
      BID18.mailError = true;
    }
  }
  else if (response !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from emailPlayer.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += BID18.adminName + '\n';
    nerrmsg += BID18.adminEmail;
    alert(nerrmsg);
  }
  else {
    pLine = "<br>A bid request email has been sent."; 
    $("#did").append(pLine);
    if (BID18.firstReply === true){ // Only do this once.
      BID18.firstReply = false;
      BID18.dbDone = true;
      // Clear Game Name field on form.
      $("#game").val("");
      // Clear player fields on form.
      $('.fn1').each(function(i){
        $(this).val("");
      });
      $('.fn2').each(function(i){
        $(this).val("");
      });
      // Hide "Process Form" button.
      $("#button1").hide();
    }
  }
}
  
/* 
 * The urlKeyGen() function creates a random url key  
 * for a given bidID and playerID.  
 * 
 * Input consists of the bidID and the playerID
 * 
 * Output is a psudorandom url key based on the input.
 */
function urlKeyGen(bidID, playerID) {
  var length = 7;
  var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var urlkey = ("00000" + bidID).slice(-4) + playerID;
  for (var i = 0, n = charset.length; i < length; ++i) {
    urlkey += charset.charAt(Math.floor(Math.random() * n));
  }
  return urlkey;
}


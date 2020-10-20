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
 * The getRecResult function is the call back function for 
 * the ajax calls to getRec.php. It  sets up the   
 * bid18xxSubmit page.
 *  
 * Output from getRec.php is ajson encoded array.   
 * The "return" value will be either "success" or "fail". If 
 * it is "fail" then it will be the only item in the array.
 * If the "return" value is "success", then the rest of the
 * array will be the json string from the specified table row.
 */
function getRecResult(result1) {
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
  $('#pid').append( thisPlayer).append('.');

  var urlkey = BID18.bid.players[BID18.input.playerid-1].urlKey;
  if (BID18.input.urlkey !== urlkey) {
    $('#did').append('<br><br>The <b>urlkey</b> on this link is invalid.');
    $('#did').append('<br>This should not occur.');
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
 
// Setup actual bid display.

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
  rptHTML+= '<caption><b>The Final Bid Status</b></caption>';
  rptHTML+= '<tr style="background-color: #ddffdd"><th>Player<br>Name</th>';
  rptHTML+= '<th>Player\'s<br>Bid</th></tr>';
  $.each(BID18.bid.players,function(index,listInfo) {
    rptHTML+= '<tr> <td>' + listInfo.name + '</td><td>';
    rptHTML+= listInfo.bid + '</td><td></tr>';
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
 * table to the playerOrder div. 
 */
function sortPlayers() {
  var orderHTML = '<br><table id="orderlist" >';
  orderHTML+= '<caption><b>The Final Player Order</b></caption>';
  orderHTML+= '<tr style="background-color: #ddffdd">';
  orderHTML+= '<th>Player<br>Name</th></tr>';
  $.each(BID18.bid.players,function(index,listInfo) {
    if (listInfo.bid === 10) {
      orderHTML += '<tr> <td>' + listInfo.name + '</td><td></tr>';
    }
  }); // end of each 10
  $.each(BID18.bid.players,function(index,listInfo) {
    if (listInfo.bid === 5) {
      orderHTML += '<tr> <td>' + listInfo.name + '</td><td></tr>';
    }
  }); // end of each 5
  $.each(BID18.bid.players,function(index,listInfo) {
    if (listInfo.bid === 0) {
      orderHTML += '<tr> <td>' + listInfo.name + '</td><td></tr>';
    }
  }); // end of each 0
  orderHTML+= '</table>';
  $("#orderlist").remove();
  $('#playerOrder').append(orderHTML);
}

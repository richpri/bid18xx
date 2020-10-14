<?php

/* 
 * The bid18xxStart page is called by the index.html page. 
 * This page sets up a new 18xx player order bid. It then
 * sends an email to each player to kick off the bid process.
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

// Insure that the players value is an intiger from 2 to 6.
$myplayer1  = filter_input(INPUT_GET, 'players',FILTER_SANITIZE_NUMBER_INT);
$myplayer2 = max($myplayer1, 2);
$myplayers = min($myplayer2, 6);

?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>BID18xx - Player Order Bid Tool For 18xx Games</title>
    <link rel="shortcut icon" href="images/favicon.ico" >
    <link rel="stylesheet" href="style/bid18xxCom.css" />
    <link rel="stylesheet" href="style/bid18xxStart.css" />
    <script type="text/javascript" src="scripts/jquery.js">
    </script> 
    <script type="text/javascript" src="scripts/bid18xxCom.js">
    </script>
    <script type="text/javascript" src="scripts/bid18xxConfig.js">
    </script>
    <script type="text/javascript" src="scripts/bid18xxStart.js">
    </script>
    <script>
      $(function() {
        $('.error').hide();
        BID18.dbDone = false;
        BID18.playercount = parseInt(<?php echo "$myplayers"; ?>);
        $('#showcount').append(BID18.playercount, ".");
        if (BID18.playercount === 2) {
          $('.play03').hide();
          $('.play04').hide();
          $('.play05').hide();
          $('.play06').hide();
        }
        if (BID18.playercount === 3) {
          $('.play04').hide();
          $('.play05').hide();
          $('.play06').hide();
        }
        if (BID18.playercount === 4) {
          $('.play05').hide();
          $('.play06').hide();
        }
        if (BID18.playercount === 5) {
          $('.play06').hide();
        }
        $("#button1").on("click",function(){
          BID18.errtxt = "";
          SetupBid();
          return false;          
        }); // end button1 click
        $("#button2").on("click",function(){
          if (BID18.dbDone === true) {
            window.location.assign("bid18xxGoodby.html?msgtype=1");
          } else {
            window.location.assign("index.html");
          }
          return false;          
        }); // end button2 click 
      });
    </script>
  </head>
  <body>

    <div id="topofpage">
      <div id="logo">
        <img src="images/logo.png" alt="Logo"/> 
      </div>
      <div id="heading">
        <h1>BID18xx</h1>
        <h1>The Player Order Bid Tool For 18xx Games</h1>
      </div>
    </div>
    
    <div id="restofpage"> 
      <p style="font-size: 130%; padding: 5px; padding-left: 25px;">
        <b>Start New 18xx Player Order Bid Session</b></p>
      <p id="showcount" style="padding-left: 25px;">
        The number of players is </p>
      <div id="content" style="max-width:9.0in;"> 
        <p id="did">bid ID message</p>
        <p class="error" id="emsg">error message</p>
        <form name="setupform" id="setupform" action="">
          <fieldset>
            <p>
              <label for="game">Game Name:</label>
              <input type="text" name="game" id="game" >
              <label class="error" for="game" id="game_error">
                This field is required.</label>
            </p>
            <p><b>Enter players in normal player order.</b></p>
            <p>
              <label for="play1" class="label2">Player 1:</label>
              <input type="text" name="play1" 
                     id="player1" class="fn1">
              <label class="error" for="play1" id="p1_error">
                This field is required.</label>
              <label for="email1" class="label2">Player 1 Email:</label>
              <input type="text" name="email1" 
                     id="player1" class="fn2">
              <label class="error" for="email1" id="e1_error">
                This field is required.</label>
            </p>
            <p>
              <label for="play2" class="label2">Player 2:</label>
              <input type="text" name="play2" 
                     id="play2" class="fn1">
              <label class="error" for="play2" id="p2_error">
                This field is required.</label>
              <label for="email2" class="label2">Player 2 Email:</label>
              <input type="text" name="email2" 
                     id="email2" class="fn2">
              <label class="error" for="email2" id="e2_error">
                This field is required.</label>
            </p>
            <p class="play03">
              <label for="play3" class="label2">Player 3:</label>
              <input type="text" name="play3" 
                     id="play3" class="fn1">
              <label class="error" for="play3" id="p3_error">
                This field is required.</label>
              <label for="email3" class="label2">Player 3 Email:</label>
              <input type="text" name="email3" 
                     id="email3" class="fn2">
              <label class="error" for="email3" id="e3_error">
                This field is required.</label>
            </p>
            <p class="play04">
              <label for="play4" class="label2">Player 4:</label>
              <input type="text" name="play4" 
                     id="play4" class="fn1">
              <label class="error" for="play4" id="p4_error">
                This field is required.</label>
              <label for="email4" class="label2">Player 4 Email:</label>
              <input type="text" name="email4" 
                     id="email4" class="fn2">
              <label class="error" for="email4" id="e4_error">
                This field is required.</label>
            </p>
            <p class="play05">
              <label for="play5" class="label2">Player 5:</label>
              <input type="text" name="play5" 
                     id="play5" class="fn1">
              <label class="error" for="play5" id="p5_error">
                This field is required.</label>
              <label for="email5" class="label2">Player 5 Email:</label>
              <input type="text" name="email5" 
                     id="email5" class="fn2">
              <label class="error" for="email5" id="e5_error">
                This field is required.</label>
            </p>
            <p class="play06">
              <label for="play6" class="label2">Player 6:</label>
              <input type="text" name="play6" 
                     id="play5" class="fn1">
              <label class="error" for="play6" id="p6_error">
                This field is required.</label>
              <label for="email5" class="label2">Player 6 Email:</label>
              <input type="text" name="email6" 
                     id="email6" class="fn2">
              <label class="error" for="email6" id="e6_error">
                This field is required.</label>
            </p>
          </fieldset>
          <br>
          <fieldset>
            <input type="submit" name="pwbutton" class="pwbutton" 
                 id="button1" value="Process Form" >
            <input type="button" name="canbutton" class="pwbutton"  
                 id="button2" value="Exit" >
          </fieldset>
        </form>
      </div> 
    </div> 

  </body>
</html>

/* 
 * This file contains scripts that are common to 
 * all bid18xx web pages.
 *
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

/* All bid18xx global variables are contained in one
 * 'master variable' called BID18.  This isolates 
 * them from global variables in other packages. 
 */
var BID18 = {}; // The master variable.
BID18.version = "1.0.0";

/* Function setPage() adjusts the height and width
 * of rightofpage and the height of lefttofpage.
 */
function setPage()
{
  var winH = $(window).height();
  var winW = $(window).width();
  var winName = location.pathname.
          substring(location.pathname.lastIndexOf("/") + 1);
  $('#restofpage').css('height', winH-90);
  $('#restofpage').css('width', winW);
}

/* Function resize() waits for 200 ms before
 * executing setPage. Multiple window resize  
 * events that occur within this time peroid 
 * will only trigger the setPage function once.
 */  
$(window).on("resize", function()
{
  if(this.resizeTO) clearTimeout(this.resizeTO);
  this.resizeTO = setTimeout(function() 
  {
    $(this).trigger('resizeEnd');
  }, 200);
});
$(window).on('resizeEnd', function() {
  setPage();
});

/* Initial page resizing. */
$(function(){
  setPage();  
});
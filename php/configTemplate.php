<?php
/*
 * config.php is included at the start of all pages and php routines
 * that access the board18 database.  Modify DB_HOST and if necessary
 * DB_DATABASE to contain the correct host and database name. You can
 * also change the database user ID and password here if you wish. 
 *  
 * SERVER_NAME is the prefix that will be used in the URLs that are
 * included in the bid request emails sent to players.
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */
define('DB_HOST', 'localhost');
define('DB_DATABASE', 'bid18xx');
define('DB_USER', 'bid18xx');
define('DB_PASSWORD', 'somepassword');
  
define('SERVER_NAME', 'https://your.server.org');
  
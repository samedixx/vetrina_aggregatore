<?php 
// Use in the “Post-Receive URLs” section of your GitHub repo. 
if ( $_POST['payload'] ) { 
  shell_exec( ‘cd /srv/prod_git/vetrina_aggregatore/ && git reset –hard HEAD && git pull’ ); 
} 

?>hi

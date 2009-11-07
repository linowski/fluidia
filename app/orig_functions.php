<?php
/*
Main Server App
*/
class main{

   // which function to run.
   var $controller_function = 'index';
   // If we are being called from cli, http_get, http_post, ajax_request
   var $calling_from = false;

   // autoload
   function main(){
      // Ensure session is started
      $this->start_session() or die("Error Starting session\n");
      // Determin how the script is being called
      $this->whos_calling() or die("Can't determine how the script is being called\n");
      //
   }

   function whos_calling(){
      if(isset($_SERVER['REQUEST_METHOD'])){
         $this->calling_from = 'http_' . strtolower($_SERVER['REQUEST_METHOD']);
         return true;
      }
      if(1==1){
         $this->calling_from = 'cli';
         return true;
      }
   }

   function parse_controller(){
      if($this->calling_from == 'cli'){
         global $argv;
         $ARGV = $argv;
      } elseif($this->calling_from == 'http_get' || $this->calling_from == 'http_post') {
         $ARGV = explode('/',$_SERVER['REQUEST_URI']);
      }else{
         $ARGV = array();
      }
      // Go through the values and see if any of them are methods
      foreach($ARGV as $key => $val){
         // cli first param is the script name
         if($this->calling_from == 'cli' && $key == 0) continue;
         // look for a method that is named after the ARGV
         if(method_exists($this,$val)) $this->controller_function = $val;
      }
   }

   // Run dynamic controller method
   function go(){
      if(method_exists($this,$this->controller_function)){
         $function = $this->controller_function;
         $this->$function();
      }
   }

   // Session Handling
   function start_session(){
      return session_start();
   }
 
   // Controller methods
   function index(){
      echo 'index';
   }

   function save_to_session(){
      if($_SERVER['REQUEST_METHOD'] == 'POST'){
         if(isset($_POST['fluidia_object'])){
            if(isset($_SESSION['fluidia_object'])){
               $_SESSION['fluidia_object'][] = json_decode($_POST['fluidia_object'], true);
            } else {
               $_SESSION['fluidia_object'][0] = json_decode($_POST['fluidia_object'], true);
            }
         } else die("fluidia_object not defined");
      } else die("Must be done over a POST request, sorry");
   }

   function view_session(){
      var_dump($_SESSION);
   }

   function download(){
      header("Pragma: public"); // required
      header("Expires: 0");
      header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
      header("Cache-Control: private", false); // required for certain browsers
      header("Content-Type: application/fluidia");
      header("Content-Disposition: attachment; filename=\"fluidia-save.fld\";");
      header("Content-Transfer-Encoding: binary");
      //ob_start(); echo contents, then header content-length
      //header("Content-Length: " . filesize($parsed_url['localpath']));
      $key = count($_SESSION['fluidia_object']) - 1;
      var_dump($_SESSION['fluidia_object'][$key]);
      exit();
   }
}

$main = new main();

// First things first, what controller function are we running on this call?
$main->parse_controller();

// Run
$main->go();

//var_dump($main);

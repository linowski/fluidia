<?php
$config = parse_ini_file('restapi.ini', TRUE);
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<html>
<head>
	<title>REST Browser</title>
	<link rel="stylesheet" type="text/css" href="style.css">
	<script type="text/javascript" src="http://jqueryjs.googlecode.com/files/jquery-1.3.2.min.js"></script>
	
	<script type="text/javascript" src="restbrowser.js"></script>
	<script type="text/javascript" src="webtoolkit.base64.js"></script>
	<script type="text/javascript">
		$(document).ready(function () {
			RESTBrowser.show($("#browser"), "..");
			$(".rest").click(RESTBrowser.updateUrl);

		});
	</script>
</head>

<body>
	
	<div id="page">
		<div id="content">
		<h2>Rest Browser</h2>
		<p>The following is a javascript REST client for basic testing</p>
		<h3>Tables</h3>
		<ul>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/users">users</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/users.html">.html</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/users.xml">.xml</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/users.json">.json</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/users_has_projects">users_has_projects</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/users_has_projects.html">.html</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/users_has_projects.xml">.xml</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/users_has_projects.json">.json</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/projects">projects</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/projects.html">.html</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/projects.xml">.xml</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/projects.json">.json</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/revisions">revisions</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/revisions.html">.html</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/revisions.xml">.xml</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/revisions.json">.json</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/sessions">sessions</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/sessions.html">.html</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/sessions.xml">.xml</a>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/sessions.json">.json</a>
		   </li>
		</ul>
		<h3>Methods</h3>
		<ul>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/login.json">login</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/logged_in.json">logged_in</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/logout">logout</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/email_exists">email_exists</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/register">register</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/save_session">save_session</a>
		   </li>
		</ul>
		</div>		
	</div>

<!-- Email Exists Test -->
<h3>Check Email Exists</h3>
<p>
<form>
<table>
<tr><td>Email:</td><td><input type="text" name="email" id="email"></td><tr>
<tr><td colspan=2><input value="Check" type="button" onclick="checkemail();"></td><tr>
</table>
</form>
</p>
<!-- Email Exists Test -->

<!-- Register Test -->
<h3>Register Form</h3>
<p>
<form>
<table>
<tr><td>First Name:</td><td><input type="text" name="fname" id="fname"></td><tr>
<tr><td>Last Name:</td><td><input type="text" name="lname" id="lname"></td><tr>
<tr><td>Email:</td><td><input type="text" name="username" id="username1"></td><tr>
<tr><td>Password:</td><td><input type="password" name="passwd" id="passwd1"></td><tr>
<tr><td colspan=2><input value="Register" type="button" onclick="doregister();"></td><tr>
</table>
</form>
</p>
<!-- Register Test -->

<!-- Login Test -->
<h3>Login Form</h3>
<p>
<form>
<table>
<tr><td>Email:</td><td><input type="text" name="username" id="username"></td><tr>
<tr><td>Password:</td><td><input type="password" name="passwd" id="passwd"></td><tr>
<tr><td colspan=2><input value="Login" type="button" onclick="dologin();"></td><tr>
</table>
</form>
</p>
<!-- Login Test -->

<script type="text/javascript">
function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}

function doregister(){
 var fname = document.getElementById('fname').value;
 var lname = document.getElementById('lname').value;
 var username = document.getElementById('username1').value;
 var password = document.getElementById('passwd1').value;

 var auth = make_base_auth(username, password);
 var url = '<?php echo $config['settings']['baseURL'];?>/register.json';

 // jQuery
 $.post(url, { email : username, passwd : password } );

}

function dologin(){
 var username = document.getElementById('username').value;
 var password = document.getElementById('passwd').value;

 var auth = make_base_auth(username, password);
 var url = '<?php echo $config['settings']['baseURL'];?>/login.json';

 // jQuery
 $.ajax({
    url : url,
    method : 'GET',
    beforeSend : function(req) {
        req.setRequestHeader('Authorization', auth);
    }
 });

}

function checkemail(){
 var email = document.getElementById('email').value;
 var url = '<?php echo $config['settings']['baseURL'];?>/email_exists.json';
 // jQuery
 $.get(url, { email: email} );
}
</script>
<!-- Login Test -->

	<div id="browser"></div>	
</body>
</html>

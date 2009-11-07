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
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/login">login</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/logout">logout</a>
		   </li>
		   <li>
			<a class="rest" href="<?php echo $config['settings']['baseURL'] ?>/save_session">save_session</a>
		   </li>
		</ul>
		</div>		
	</div>

	<div id="browser"></div>	
</body>
</html>

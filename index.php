<?php

//echo PHP_EOL;
include 'db_methods.php';

$path = $_SERVER['REQUEST_URI'];

// Turns the JSON sent in http request into an array
function getPageData() {
	$json = file_get_contents('php://input');
        $data = json_decode($json, true);

	return $data;
}

function render_php($path) {
	ob_start();
	include($path);
	$var=ob_get_contents();
	ob_end_clean();
	return $var;
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
// header('Content-Type: application/json; charset=utf-8');


$uriArray = explode('/',$path);

/*
echo "<pre>";
print_r($userdata[$indexOfUser]);
editSettings($userdata);
try {
*/
if ($uriArray[1] == 'users'){
	// Return list of users
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(dbGetUsers($conn));
}
else if ($uriArray[1] == 'user'){
	// Add user if no username comes after /user
	if (count($uriArray) == 2){
	        $data = getPageData();
                $isAdded = dbAddUser($data, $conn);
                header('Content-Type: application/json; charset=utf-8');

		if ($isAdded) {
                        echo json_encode("user added");
                }
                else {
                        echo json_encode("error");
                }
	}
	else if (count($uriArray) == 3) {
		// Retrieve user record from the db and return to page
		$user = $uriArray[2];
		header('Content-Type: application/json; charset=utf-8');

		echo json_encode(dbGetUserRecord($user, $conn));
	}
	//If a username is included, check what comes after
	else {
		switch($uriArray[3]){
			case 'edit':
				// Save user settings
				$data = getPageData();
				$isUpdated = dbUpdateSettings($data, $conn);
				header('Content-Type: application/json; charset=utf-8');

				if ($isUpdated) {
					echo json_encode("settings updated");
				}
				else {
					echo json_encode("error");
				}
				break;
			case 'setStyles':
				// Save custom styles
				$data = getPageData();
				$fileName = 'user_styles/' . $uriArray[2] . '.css';
				$fileCreated = file_put_contents($fileName, $data);
				header('Content-Type: application/json; charset=utf-8');
				if ($fileCreated !== false) {
					echo json_encode("styles created");
				}
				else {
					echo json_encode("error");
				}
				break;
			case 'getStyles':
				// Retrieve custom styles
				$fileName = 'user_styles/' . $uriArray[2] . '.css';
				$fileExists = file_exists($fileName);
				header('Content-Type: application/json; charset=utf-8');
				if ($fileExists) {
					echo json_encode($fileName);
				}
				else {
					echo json_encode("");
				}
				break;
			case 'delete':
				// Delete user and settings
				$data = getPageData();
				$isDeleted = dbDeleteUser($data, $conn);
				header('Content-Type: application/json; charset=utf-8');

				if ($isDeleted) {
					echo json_encode("user deleted");
				}
				else {
					echo json_encode("error");
				}
				break;
			default:
				echo 'no data';
				break;
		}
	}
}
else {
	echo render_php('template_parts/header.php');
	switch($uriArray[1]) {
		case '':
			include 'index.html';
			break;
		case 'products':
			include 'productpage.html';
			break;
		default:
			echo 'no data';
			break;
	}
	echo render_php('template_parts/footer.php');
}


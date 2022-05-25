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

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

$uriArray = explode('?',$path);

/*
echo "<pre>";
print_r($userdata[$indexOfUser]);
editSettings($userdata);
try {
*/
switch($uriArray[0]){
	case '/users':
		echo json_encode(dbGetUsers($conn));
		break;
	case '/userdata':
		// Retrieve user record from the db and return to page
		$user = $_SERVER['QUERY_STRING'];
		echo json_encode(dbGetUserRecord($user, $conn));

		break;
	case '/edit':
		$data = getPageData();
		$isUpdated = dbUpdateSettings($data, $conn);
		if ($isUpdated) {
			echo json_encode("settings updated");
		}
		else {
			echo json_encode("error");
		}
		break;
	case '/adduser':
		$data = getPageData();
		$isAdded = dbAddUser($data, $conn);
		if ($isAdded) {
			echo json_encode("user added");
		}
		else {
			echo json_encode("error");
		}
		break;
	case '/deleteuser':
		$data = getPageData();
		$isDeleted = dbDeleteUser($data, $conn);
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
/*
} catch(\Exception $e) {
var_dump($e);
}
/*
if($path == "/users")
{
	echo json_encode($userpass);
};

if($uriArray[0] == "/userdata")
{
	$indexOfUser = -1;
	for($i = 0; $i < count($userdata); $i++) {
		if($userdata[$i]['user']== $_SERVER['QUERY_STRING']) {
			$indexOfUser = $i;
		}
	} 
	echo json_encode($userdata[$indexOfUser]);
}
*/

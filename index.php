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

$uriArray = explode('/',$path);

/*
echo "<pre>";
print_r($userdata[$indexOfUser]);
editSettings($userdata);
try {
*/
if ($uriArray[1] == 'users'){
	// Return list of users
	echo json_encode(dbGetUsers($conn));
}
else if ($uriArray[1] == 'user'){
	// Add user if no username comes after /user
	if (is_null($uriArray[2])){
	        $data = getPageData();
                $isAdded = dbAddUser($data, $conn);
                if ($isAdded) {
                        echo json_encode("user added");
                }
                else {
                        echo json_encode("error");
                }
	}
	else{
		//If a username is included, check what comes after
		switch($uriArray[3]){
			case NULL:
				// Retrieve user record from the db and return to page
				$user = $uriArray[2];
				echo json_encode(dbGetUserRecord($user, $conn));

				break;
			case 'edit':
				// Save user settings
				$data = getPageData();
				$isUpdated = dbUpdateSettings($data, $conn);
				if ($isUpdated) {
					echo json_encode("settings updated");
				}
				else {
					echo json_encode("error");
				}
				break;
			case 'delete':
				// Delete user and settings
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
	}
}
else {
	echo 'no data';
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

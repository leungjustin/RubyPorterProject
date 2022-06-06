<?php

$servername = "localhost";
$username = "devintern";
$password = "NavigationFun2233";
$dbname = "navigation";

// Open connection to database
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
}


// Get a list of users
function dbGetUsers($conn) {
        // Get list of users from database
        $users = $conn->query("SELECT user FROM userdata");
        // Return array of users
	return $users->fetch_all(MYSQLI_ASSOC);
}

// Returns settings array for a user if it exists
function dbGetUserRecord($user, $conn) {
        $settingsArray = null;
        // Prepared statement to SELECT user record
        $stmt = $conn->prepare("SELECT * FROM userdata WHERE user = ?");
        $stmt->bind_param("s", $user);
        $stmt->execute();
        $result = $stmt->get_result();
        $resultArray = $result->fetch_assoc();
        if(!is_null($resultArray)) {
                $settingsArray = [
                'userId' => $resultArray['id'],
                'user' => $resultArray['user'],
                'navStyle' => $resultArray['navStyle'],
                'items' => [],
                ];

                $settingsArray = dbGetUserMenuItems($settingsArray, $conn);
        }

        return $settingsArray;
}

// Called by dbGetUserRecord. Adds items to settings array
function dbGetUserMenuItems($settingsArray, $conn){
        // SELECT all top level menu items
        $stmt = $conn->prepare("SELECT * FROM items WHERE userId = ? AND parent = -1 ORDER BY sortOrder");
        $stmt->bind_param("i", $settingsArray['userId']);
        $stmt->execute();
        $result = $stmt->get_result();
        $resultArray = $result->fetch_all(MYSQLI_ASSOC);
        if(!empty($resultArray)) {
                foreach($resultArray as $result2){
                        $disabled = (bool)$result2['disabled'] ?? false;
                        $itemArray =
                                    ['id' => $result2['itemId'],
                                     'parentId' => $result2['parent'],
                                     'layer' => $result2['layer'],
                                     'name' => $result2['name'],
                                     'link' => $result2['link'],
                                     'isDisabled' => $disabled,
                                     'items' => dbGetUserMenuSubItems($result2['itemId'], $conn),
                                     ];

                        // Pushes top level item into menu item array
                        array_push($settingsArray['items'], $itemArray);
                }
        }
        return $settingsArray;
}

// Called by dbGetUserMenuItems. Returns items based on their parentId
function dbGetUserMenuSubItems($parentId, $conn){
	// SELECT next level menu items and add them to itemArray

	$itemsArray = [];
	$stmt = $conn->prepare("SELECT * FROM items WHERE parent = ? ORDER BY sortOrder");
	$stmt->bind_param("i", $parentId);
	$stmt->execute();
	$result = $stmt->get_result();
	$resultArray = $result->fetch_all(MYSQLI_ASSOC);
	//exit early
	if(empty($resultArray)){
		return [];
	}
	foreach($resultArray as $result2){
		//do code to format
		$disabled = (bool)$result2['disabled'] ?? false;
		$itemArray = [
			'id' => $result2['itemId'],
			'parentId' => $result2['parent'],
			'layer' => $result2['layer'],
			'name' => $result2['name'],
			'link' => $result2['link'],
			'isDisabled' => $disabled,
			'items' => dbGetUserMenuSubItems($result2['itemId'], $conn),
		 ]; 
		array_push($itemsArray, $itemArray);
	}
	 return $itemsArray;
	}

// Change settings and delete all menu items and insert new menu items for existing user
function dbUpdateSettings($data, $conn) {
	$navUpdated = false;
	$itemsDeleted = false;
	$allInserted = true;
	if (!is_null($data['user'])) {
		// Prepared statement to UPDATE user navStyle
		$stmt = $conn->prepare("UPDATE userdata SET navStyle = ? WHERE user = ?");
		$stmt->bind_param("ss", $data['navStyle'],  $data['user']);
		$navUpdated = $stmt->execute();

		// Find userId
		$stmt2 = $conn->prepare("SELECT id FROM userdata WHERE user = ?");
		$stmt2->bind_param("s", $data['user']);
		$stmt2->execute();
		$result = $stmt2->get_result();
		$resultArray = $result->fetch_assoc();
		$userId = $resultArray['id'];

		// DELETE all items restricted by userId
		$stmt3 = $conn->prepare("DELETE FROM items WHERE userId = ?");
		$stmt3->bind_param("i", $userId);
		$itemsDeleted = $stmt3->execute();

		// Insert each menu item
		$sortIndex = 0;
		foreach ($data['items'] as $item) {
			// INSERT new record into item table
			$sql = "INSERT INTO items (parent, layer, name, link, disabled, userId, sortOrder) ";
			$sql .= "VALUES (?, ?, ?, ?, ?, ?, ?)";
			$stmt4 = $conn->prepare($sql);

			// Parent set to -1 because these are all top level menu items
			$parent = -1;
			$layer = $item['layer'];
			$name = $item['name'];
			$link = $item['link'];
			$disabled = (int)$item['isDisabled'] ?? 0;
			$sort = $sortIndex;

			$stmt4->bind_param("iissiii", $parent, $layer, $name, $link, $disabled, $userId, $sort);
			$itemInserted = $stmt4->execute();

			// Get last inserted primary key
			$itemId = $conn->insert_id;

			// Insert all subitems
			$subItemsInserted = dbInsertMenuSubItems($item, $itemId, $userId, $conn);

			// Update $allInserted boolean to reflect if all items are inserted successfully
			$allInserted = $allInserted && $itemInserted && $subItemsInserted;
			$sortIndex++;
		}
	}
	return $navUpdated && $itemsDeleted && $allInserted;
}

function dbInsertMenuSubItems($data, $parentId, $userId, $conn) {
	$allInserted = true;
	$sortIndex = 0;
	if (empty($data['items'])) {
		return true;
	}
	foreach ($data['items'] as $item) {
		// INSERT new record into item table
		$sql = "INSERT INTO items (parent, layer, name, link, disabled, userId, sortOrder) ";
		$sql .= "VALUES (?, ?, ?, ?, ?, ?, ?)";
		$stmt = $conn->prepare($sql);

		// Parent set to itemId of the record inserted just before this function was called
		$parent = $parentId;
		$layer = $item['layer'];
		$name = $item['name'];
		$link = $item['link'];
		$disabled = (int)$item['isDisabled'] ?? 0;
		$sort = $sortIndex;

		$stmt->bind_param("iissiii", $parent, $layer, $name, $link, $disabled, $userId, $sort);
		$itemInserted = $stmt->execute();

		// Get last inserted primary key
		$itemId = $conn->insert_id;

		// Insert all subitems
		$subItemsInserted = dbInsertMenuSubItems($item, $itemId, $userId, $conn);

		// Update $allInserted boolean to reflect if all items are inserted successfully
		$allInserted = $allInserted && $itemInserted && $subItemsInserted;
		$sortIndex++;
	}

	return $allInserted;
}

// Add a user to user table and userdata table
function dbAddUser($data, $conn) {
	$isAdded = false;
	if ($data['user'] != null){
		// INSERT new record into userdata table
		$sql = "INSERT INTO userdata (user, navStyle) VALUES (?, ?)";
		$stmt2 = $conn->prepare($sql);
		$stmt2->bind_param("ss", $data['user'], $data['navStyle']);
		$isAddData = $stmt2->execute();

		// Get last insert ID
		$userId = $conn->insert_id;

		// INSERT new record into item table
		$sql2 = "INSERT INTO items (parent, layer, name, link, disabled, userId, sortOrder) ";
		$sql2 .= "VALUES (?, ?, ?, ?, ?, ?, ?)";
		$stmt4 = $conn->prepare($sql2);

		$data2 = $data['items'][0];
		$layer = $data2['layer'];
		$name = $data2['name'];
		$link = $data2['link'];
		$disabled = (int)$data2['isDisabled'] ?? 0;
		$parent = -1;
		$sort = 0;

		$stmt4->bind_param("iissiii", $parent, $layer, $name, $link, $disabled, $userId, $sort);
		$isAddItems = $stmt4->execute();

		// Check if all INSERTs were successful
		$isAdded = $isAddData && $isAddItems;
	}
	return $isAdded;
}

function dbDeleteUser($data, $conn) {
	$isDeleted = false;
	if (!is_null($data['user'])) {
		// Delete menu items from items table
		$stmt = $conn->prepare("DELETE items FROM items JOIN userdata ON id = userId WHERE user = ?");
		$stmt->bind_param("s", $data['user']);
		$deleteItems = $stmt->execute();

		// Delete record from userdata table
		$stmt2 = $conn->prepare("DELETE FROM userdata WHERE user = ?");
		$stmt2->bind_param("s", $data['user']);
		$deleteUser = $stmt2->execute();

		$isDeleted = $deleteUser && $deleteItems;
	}
	return $isDeleted;
}


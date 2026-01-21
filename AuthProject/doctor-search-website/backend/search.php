<?php
$host = "sql109.infinityfree.com";
$user = "if0_39893102";
$password = "S1v2i3t4";
$database = "if0_39893102_doctorsearch_db";

// Connect to the database
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get search parameters safely
$specialization = isset($_GET['specialization']) ? $_GET['specialization'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';

// Prepare SQL statement to prevent SQL injection
$stmt = $conn->prepare("SELECT * FROM doctors WHERE specialization LIKE ? AND location LIKE ?");
$spec = "%$specialization%";
$loc = "%$location%";
$stmt->bind_param("ss", $spec, $loc);

// Execute and fetch results
$stmt->execute();
$result = $stmt->get_result();

$doctors = [];
while ($row = $result->fetch_assoc()) {
    $doctors[] = $row;
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($doctors);

// Close connections
$stmt->close();
$conn->close();
?>

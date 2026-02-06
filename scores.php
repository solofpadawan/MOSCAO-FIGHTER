<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
/*
$allowed_origins = [
    "https://saulofpadovan.itch.io",
    "https://html-classic.itch.zone"
];

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
*/

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database file path - detect environment (local vs remote)
$isLocal = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1']) ||
    strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost:') === 0;

if ($isLocal) {
    $dbFile = __DIR__ . '/scores.db';
} else {
    $dbFile = 'https://maggiore-sys.com.br/game/scores.db';
}

try {
    // Create/Open SQLite database
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create table if it doesn't exist
    $db->exec("CREATE TABLE IF NOT EXISTS high_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(6) NOT NULL,
        score INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Get action parameter
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'getTopScores') {
        // Get top 10 scores
        $stmt = $db->query("SELECT name, score, timestamp 
                           FROM high_scores 
                           ORDER BY score DESC, timestamp ASC 
                           LIMIT 15");
        $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'scores' => $scores
        ]);

    } elseif ($action === 'saveScore') {
        // Get POST data
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            // Try form data
            $data = $_POST;
        }

        $name = isset($data['name']) ? $data['name'] : '';
        $score = isset($data['score']) ? intval($data['score']) : 0;

        // Validate name (1-6 alphanumeric characters)
        $name = strtoupper(trim($name));
        $name = preg_replace('/[^A-Z0-9]/', '', $name);

        if (strlen($name) === 0) {
            $name = 'PLAYER'; // Default name
        } elseif (strlen($name) > 6) {
            $name = substr($name, 0, 6);
        }

        // Validate score
        if ($score < 0) {
            echo json_encode([
                'success' => false,
                'error' => 'Invalid score'
            ]);
            exit;
        }

        // Check if player name already exists
        $checkStmt = $db->prepare("SELECT id, score FROM high_scores WHERE name = :name LIMIT 1");
        $checkStmt->bindParam(':name', $name, PDO::PARAM_STR);
        $checkStmt->execute();
        $existingPlayer = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existingPlayer) {
            // Player exists - only update if new score is higher
            if ($score > $existingPlayer['score']) {
                $updateStmt = $db->prepare("UPDATE high_scores SET score = :score, timestamp = CURRENT_TIMESTAMP WHERE id = :id");
                $updateStmt->bindParam(':score', $score, PDO::PARAM_INT);
                $updateStmt->bindParam(':id', $existingPlayer['id'], PDO::PARAM_INT);
                $updateStmt->execute();

                echo json_encode([
                    'success' => true,
                    'message' => 'Score updated successfully',
                    'updated' => true,
                    'id' => $existingPlayer['id']
                ]);
            } else {
                // New score is not higher, don't update
                echo json_encode([
                    'success' => true,
                    'message' => 'Score not high enough to update',
                    'updated' => false,
                    'current_score' => $existingPlayer['score']
                ]);
            }
        } else {
            // New player - insert score
            $stmt = $db->prepare("INSERT INTO high_scores (name, score) VALUES (:name, :score)");
            $stmt->bindParam(':name', $name, PDO::PARAM_STR);
            $stmt->bindParam(':score', $score, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode([
                'success' => true,
                'message' => 'Score saved successfully',
                'updated' => false,
                'id' => $db->lastInsertId()
            ]);
        }

    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid action'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
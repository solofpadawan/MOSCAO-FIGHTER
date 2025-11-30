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

$dir = 'assets/music/';
$files = [];

if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
        while (($file = readdir($dh)) !== false) {
            if ($file != "." && $file != ".." && strpos($file, '.ogg') !== false) {
                $files[] = $file;
            }
        }
        closedir($dh);
    }
}

echo json_encode(['success' => true, 'files' => $files]);
?>
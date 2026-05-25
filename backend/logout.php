<?php
// logout.php - Destruye la sesión PHP

session_start();
session_destroy();

header('Content-Type: application/json; charset=UTF-8');
echo json_encode(['ok' => true]);
?>

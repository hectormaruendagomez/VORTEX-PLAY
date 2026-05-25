<?php
// comentar.php - CU-04 Comentar en el Blog/Noticias

session_start();
include 'conexion.php';

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['ok' => false, 'message' => 'Debes iniciar sesión para comentar.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'message' => 'Método no permitido.']);
    exit;
}

$id_contenido = (int)($_POST['id_contenido'] ?? 0);
$texto        = trim($_POST['texto'] ?? '');
$id_usuario   = (int)$_SESSION['id_usuario'];

if ($id_contenido <= 0 || empty($texto)) {
    echo json_encode(['ok' => false, 'message' => 'Datos del comentario no válidos.']);
    exit;
}

$stmt = $conexion->prepare(
    "INSERT INTO comentarios (id_contenido, id_usuario, texto) VALUES (?, ?, ?)"
);
$stmt->bind_param('iis', $id_contenido, $id_usuario, $texto);

if ($stmt->execute()) {
    echo json_encode(['ok' => true, 'message' => 'Comentario registrado.', 'id' => $stmt->insert_id]);
} else {
    echo json_encode(['ok' => false, 'message' => 'No se pudo guardar el comentario.']);
}

$stmt->close();
$conexion->close();
?>

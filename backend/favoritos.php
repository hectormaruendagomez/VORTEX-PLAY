<?php
// favoritos.php - Gestión de videojuegos favoritos del usuario

session_start();
include 'conexion.php';

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['ok' => false, 'message' => 'No autenticado.']);
    exit;
}

$id_usuario = (int)$_SESSION['id_usuario'];
$method     = $_SERVER['REQUEST_METHOD'];

// GET → lista de IDs favoritos del usuario
if ($method === 'GET') {
    $stmt = $conexion->prepare("SELECT id_videojuego FROM favoritos WHERE id_usuario = ?");
    $stmt->bind_param('i', $id_usuario);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $ids  = array_map(fn($r) => (int)$r['id_videojuego'], $rows);
    echo json_encode(['ok' => true, 'data' => $ids]);
    $stmt->close();

// POST ?id_videojuego=X → añadir favorito
} elseif ($method === 'POST' && ($_POST['_method'] ?? '') === '') {
    $id_videojuego = (int)($_POST['id_videojuego'] ?? 0);
    if ($id_videojuego <= 0) {
        echo json_encode(['ok' => false, 'message' => 'id_videojuego requerido.']);
        exit;
    }

    $stmt = $conexion->prepare(
        "INSERT IGNORE INTO favoritos (id_usuario, id_videojuego) VALUES (?, ?)"
    );
    $stmt->bind_param('ii', $id_usuario, $id_videojuego);
    $stmt->execute();
    echo json_encode(['ok' => true]);
    $stmt->close();

// POST _method=DELETE → quitar favorito
} elseif ($method === 'POST' && ($_POST['_method'] ?? '') === 'DELETE') {
    $id_videojuego = (int)($_POST['id_videojuego'] ?? 0);
    if ($id_videojuego <= 0) {
        echo json_encode(['ok' => false, 'message' => 'id_videojuego requerido.']);
        exit;
    }

    $stmt = $conexion->prepare(
        "DELETE FROM favoritos WHERE id_usuario = ? AND id_videojuego = ?"
    );
    $stmt->bind_param('ii', $id_usuario, $id_videojuego);
    $stmt->execute();
    echo json_encode(['ok' => true]);
    $stmt->close();
} else {
    echo json_encode(['ok' => false, 'message' => 'Método no permitido.']);
}

$conexion->close();
?>

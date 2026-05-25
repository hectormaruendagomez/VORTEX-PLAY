<?php
// usuarios.php - Gestión de usuarios (solo Administrador)

session_start();
include 'conexion.php';

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['id_usuario']) || $_SESSION['rol'] !== 'Administrador') {
    echo json_encode(['ok' => false, 'message' => 'Sin permisos de administrador.']);
    exit;
}

$id_admin = (int)$_SESSION['id_usuario'];
$method   = $_SERVER['REQUEST_METHOD'];

// ── Mapas ──────────────────────────────────────────────────────
function rolToJS($r) {
    return ['Administrador' => 'admin', 'Redactor' => 'writer', 'Colaborador' => 'collaborator', 'Suscriptor' => 'subscriber'][$r] ?? 'subscriber';
}
function rolToDB($r) {
    return ['admin' => 'Administrador', 'writer' => 'Redactor', 'collaborator' => 'Colaborador', 'subscriber' => 'Suscriptor'][$r] ?? 'Suscriptor';
}

// GET → todos los usuarios (excluye al admin en sesión)
if ($method === 'GET') {
    $stmt = $conexion->prepare(
        "SELECT id, nombre_usuario, email, rol, fecha_registro, estado FROM usuarios WHERE id != ? ORDER BY id ASC"
    );
    $stmt->bind_param('i', $id_admin);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    foreach ($rows as &$r) {
        $r['id']   = (int)$r['id'];
        $r['role'] = rolToJS($r['rol']);
        $r['name'] = $r['nombre_usuario'];
    }
    echo json_encode(['ok' => true, 'data' => $rows], JSON_UNESCAPED_UNICODE);
    $stmt->close();

// POST _method=PATCH → cambiar rol
} elseif ($method === 'POST' && ($_POST['_method'] ?? '') === 'PATCH') {
    $id      = (int)($_POST['id'] ?? 0);
    $roleJS  = $_POST['role'] ?? 'subscriber';
    $rolDB   = rolToDB($roleJS);

    if ($id <= 0 || $id === $id_admin) {
        echo json_encode(['ok' => false, 'message' => 'ID no válido.']);
        exit;
    }

    $stmt = $conexion->prepare("UPDATE usuarios SET rol = ? WHERE id = ?");
    $stmt->bind_param('si', $rolDB, $id);
    $stmt->execute();
    echo json_encode(['ok' => $stmt->affected_rows > 0]);
    $stmt->close();

// POST _method=DELETE → suspender (eliminar) usuario
} elseif ($method === 'POST' && ($_POST['_method'] ?? '') === 'DELETE') {
    $id = (int)($_POST['id'] ?? 0);

    if ($id <= 0 || $id === $id_admin) {
        echo json_encode(['ok' => false, 'message' => 'ID no válido.']);
        exit;
    }

    $stmt = $conexion->prepare("DELETE FROM usuarios WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['ok' => $stmt->affected_rows > 0]);
    $stmt->close();
} else {
    echo json_encode(['ok' => false, 'message' => 'Método no permitido.']);
}

$conexion->close();
?>

<?php
// session_check.php - Devuelve el usuario activo de la sesión PHP

session_start();
include 'conexion.php';

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['ok' => false, 'user' => null]);
    exit;
}

$id   = (int)$_SESSION['id_usuario'];
$stmt = $conexion->prepare("SELECT id, nombre_usuario, email, rol FROM usuarios WHERE id = ? AND estado = 'Activo'");
$stmt->bind_param('i', $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if (!$row) {
    session_destroy();
    echo json_encode(['ok' => false, 'user' => null]);
    exit;
}

$rolMap = [
    'Administrador' => 'admin',
    'Redactor'      => 'writer',
    'Colaborador'   => 'collaborator',
    'Suscriptor'    => 'subscriber',
];
$roleJS = $rolMap[$row['rol']] ?? 'subscriber';

$partes   = explode(' ', $row['nombre_usuario']);
$initials = '';
foreach ($partes as $p) {
    $initials .= strtoupper(mb_substr($p, 0, 1));
}
$initials = mb_substr($initials, 0, 2);

echo json_encode([
    'ok'   => true,
    'user' => [
        'id'             => (int)$row['id'],
        'nombre_usuario' => $row['nombre_usuario'],
        'name'           => $row['nombre_usuario'],
        'email'          => $row['email'],
        'role'           => $roleJS,
        'avatar'         => $initials,
    ]
]);

$stmt->close();
$conexion->close();
?>

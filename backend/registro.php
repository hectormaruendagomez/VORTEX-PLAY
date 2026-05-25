<?php
// registro.php - CU-01 Registrarse

session_start();
include 'conexion.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'message' => 'Método no permitido.']);
    exit;
}

$nombre   = trim($_POST['nombre_usuario'] ?? '');
$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$roleJS   = $_POST['role'] ?? 'subscriber';

if (!$nombre || !$email || !$password) {
    echo json_encode(['ok' => false, 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

$rolMap = [
    'admin'        => 'Suscriptor',
    'writer'       => 'Suscriptor',
    'collaborator' => 'Colaborador',
    'subscriber'   => 'Suscriptor',
];
$rol = $rolMap[$roleJS] ?? 'Suscriptor';

$stmt = $conexion->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['ok' => false, 'message' => 'El email ya está registrado.']);
    exit;
}

$hash  = password_hash($password, PASSWORD_BCRYPT);
$fecha = date('Y-m-d');
$estado = 'Activo';

$stmt2 = $conexion->prepare(
    "INSERT INTO usuarios (nombre_usuario, email, password, rol, fecha_registro, estado) VALUES (?, ?, ?, ?, ?, ?)"
);
$stmt2->bind_param('ssssss', $nombre, $email, $hash, $rol, $fecha, $estado);
$stmt2->execute();

if ($stmt2->affected_rows > 0) {
    echo json_encode(['ok' => true, 'message' => 'Usuario registrado correctamente.']);
} else {
    echo json_encode(['ok' => false, 'message' => 'No se pudo guardar en la base de datos.']);
}

$stmt->close();
$stmt2->close();
$conexion->close();
?>

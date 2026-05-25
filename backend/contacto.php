<?php
// contacto.php - Guardar mensajes de contacto

session_start();
include 'conexion.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'message' => 'Método no permitido.']);
    exit;
}

$nombre  = trim($_POST['nombre']  ?? '');
$email   = trim($_POST['email']   ?? '');
$asunto  = trim($_POST['asunto']  ?? '');
$mensaje = trim($_POST['mensaje'] ?? '');

if (!$nombre || !$email || !$mensaje) {
    echo json_encode(['ok' => false, 'message' => 'Nombre, email y mensaje son obligatorios.']);
    exit;
}

$id_usuario = isset($_SESSION['id_usuario']) ? (int)$_SESSION['id_usuario'] : null;

$stmt = $conexion->prepare(
    "INSERT INTO mensajes_contacto (id_usuario, nombre_remitente, email_remitente, asunto, mensaje) VALUES (?, ?, ?, ?, ?)"
);
$stmt->bind_param('issss', $id_usuario, $nombre, $email, $asunto, $mensaje);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['ok' => true, 'message' => 'Mensaje enviado correctamente.']);
} else {
    echo json_encode(['ok' => false, 'message' => 'No se pudo guardar el mensaje.']);
}

$stmt->close();
$conexion->close();
?>

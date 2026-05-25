<?php
// login.php - CU-02 Iniciar Sesión

session_start();
include 'conexion.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'message' => 'Método no permitido.']);
    exit;
}

$email         = trim($_POST['email'] ?? '');
$password_plana = $_POST['password'] ?? '';

if (!$email || !$password_plana) {
    echo json_encode(['ok' => false, 'message' => 'Email y contraseña son obligatorios.']);
    exit;
}

$stmt = $conexion->prepare("SELECT * FROM usuarios WHERE email = ? AND estado = 'Activo'");
$stmt->bind_param('s', $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode(['ok' => false, 'message' => 'El email no está registrado o la cuenta está inactiva.']);
    exit;
}

$usuario = $resultado->fetch_assoc();

if (!password_verify($password_plana, $usuario['password'])) {
    echo json_encode(['ok' => false, 'message' => 'Contraseña incorrecta.']);
    exit;
}

$_SESSION['id_usuario']     = $usuario['id'];
$_SESSION['nombre_usuario'] = $usuario['nombre_usuario'];
$_SESSION['rol']            = $usuario['rol'];

$rolMap = [
    'Administrador' => 'admin',
    'Redactor'      => 'writer',
    'Colaborador'   => 'collaborator',
    'Suscriptor'    => 'subscriber',
];
$roleJS = $rolMap[$usuario['rol']] ?? 'subscriber';

$partes  = explode(' ', $usuario['nombre_usuario']);
$initials = '';
foreach ($partes as $p) {
    $initials .= strtoupper(mb_substr($p, 0, 1));
}
$initials = mb_substr($initials, 0, 2);

echo json_encode([
    'ok'   => true,
    'user' => [
        'id'             => (int)$usuario['id'],
        'nombre_usuario' => $usuario['nombre_usuario'],
        'name'           => $usuario['nombre_usuario'],
        'email'          => $usuario['email'],
        'role'           => $roleJS,
        'avatar'         => $initials,
    ]
]);

$stmt->close();
$conexion->close();
?>

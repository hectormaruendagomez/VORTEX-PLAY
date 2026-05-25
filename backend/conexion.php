<?php
// conexion.php se encarga de establecer conexion con la db
$servidor = "localhost";
$usuario_bd = "root"; // Usuario por defecto de XAMPP
$password_bd = ""; // XAMPP viene sin contraseña por defecto
$nombre_bd = "gamehub_db"; // Nombre exacto de la db en el .sql

// Crear conexión
$conexion = new mysqli($servidor, $usuario_bd, $password_bd, $nombre_bd);

// Comprobar si hay errores
if ($conexion->connect_error) {
    die("Error de conexión a la base de datos: " . $conexion->connect_error);
}

// Si todo va bien, no imprimimos nada
?>

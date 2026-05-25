<?php
// comentar.php - Maneja el CU-04 (Comentar en el Blog)

include 'conexion.php';
session_start(); // Nos conectamos a la sesión activa

// Verificar sesión activa
if (!isset($_SESSION['id_usuario'])) {
    die("ERROR: Debes iniciar sesión para poder comentar.");
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Capturamos y aseguramos que los IDs sean tratados estrictamente como enteros
    $id_contenido = isset($_POST['id_contenido']) ? (int)$_POST['id_contenido'] : 0;
    $texto = isset($_POST['texto']) ? trim($_POST['texto']) : '';
    $id_usuario = (int)$_SESSION['id_usuario']; 

    if ($id_contenido <= 0 || empty($texto)) {
        die("ERROR: Datos del comentario no válidos.");
    }

    // Usamos sentencias preparadas para evitar problemas
    $stmt = $conexion->prepare("INSERT INTO comentarios (id_contenido, id_usuario, texto) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $id_contenido, $id_usuario, $texto);

    if ($stmt->execute()) {
        echo "ÉXITO: Comentario registrado.";
    } else {
        echo "ERROR: No se pudo guardar el comentario. " . $conexion->error;
    }
    
    $stmt->close();
} else {
    echo "ERROR: Acceso no permitido.";
}

$conexion->close();
?>
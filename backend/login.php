<?php
// login.php - Maneja el CU-02 (Iniciar Sesión)

include 'conexion.php';

// Iniciamos el sistema de sesiones de PHP para recordar al usuario
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Capturamos los datos del formulario de login
    $email = $_POST['email'];
    $password_plana = $_POST['password'];

    // Buscamos al usuario por su email
    $stmt = $conexion->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        // El email existe, así que extraemos los datos del usuario
        $usuario = $resultado->fetch_assoc();

        // Comparamos la clave plana con la encriptada de la BD
        if (password_verify($password_plana, $usuario['password'])) {
            
            // Caso contraseña correcta. Guardamos sus datos en la SESIÓN del servidor
            $_SESSION['id_usuario'] = $usuario['id'];
            $_SESSION['nombre_usuario'] = $usuario['nombre_usuario'];
            $_SESSION['rol'] = $usuario['rol']; // 'Suscriptor', 'Redactor' o 'Administrador'

            echo "ÉXITO: Login correcto. Rol: " . $usuario['rol'];
        } else {
            // Caso contraseña mal introducida
            echo "ERROR: Contraseña incorrecta.";
        }
    } else {
        // Caso en que el correo no existe en el sistema
        echo "ERROR: El email no está registrado.";
    }
} else {
    echo "ERROR: Acceso no permitido.";
}

$conexion->close();
?>
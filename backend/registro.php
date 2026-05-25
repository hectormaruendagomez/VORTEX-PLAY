<?php
// registro.php - Maneja el CU-01 (Registrarse)

include 'conexion.php';

// Verificamos que los datos vengan a través de un formulario
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Capturamos los datos reales que enviará el Frontend
    $nuevo_usuario = $_POST['nombre_usuario'];
    $nuevo_email = $_POST['email'];
    $password_plana = $_POST['password'];

    // Encriptamos la contraseña de forma segura
    $password_encriptada = password_hash($password_plana, PASSWORD_BCRYPT);

    // Valores por defecto del sistema
    $rol_por_defecto = "Suscriptor";
    $fecha_actual = date("Y-m-d");
    $estado_por_defecto = "Activo";

    // Comprobar si el email ya existe
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $nuevo_email);
    $stmt->execute();
    $resultado_comprobacion = $stmt->get_result();

    if ($resultado_comprobacion->num_rows > 0) {
        echo "ERROR: El email ya está registrado.";
    } else {
        // Si todo está bien, insertar datos de usuario en la DB
        $stmt2 = $conexion->prepare("INSERT INTO usuarios (nombre_usuario, email, password, 
        rol, fecha_registro, estado) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt2->bind_param("ssssss", $nuevo_usuario, $nuevo_email, $password_encriptada, 
        $rol_por_defecto, $fecha_actual, $estado_por_defecto);
        $stmt2->execute();

        if ($stmt2->affected_rows > 0) {
            echo "ÉXITO: Usuario registrado correctamente.";
        } else {
            echo "ERROR: No se pudo guardar en la base de datos.";
        }
    }
} else {
    echo "ERROR: Acceso no permitido.";
}

$conexion->close();
?>
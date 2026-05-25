<?php
// videojuegos.php - Maneja el CU-11 (Buscar/Consultar Videojuegos) 

include 'conexion.php';

header('Content-Type: application/json');

$criterio = isset($_GET['criterio']) ? $_GET['criterio'] : '';

if (!empty($criterio)) {
    // Filtro LIKE 
    $buscar = "%" . $criterio . "%";
    $stmt = $conexion->prepare("SELECT * FROM videojuegos WHERE titulo LIKE ?");
    $stmt->bind_param("s", $buscar);
    $stmt->execute();
    $resultado = $stmt->get_result();
} else {
    // Si no hay búsqueda, traemos todo el catálogo inicial
    $sql = "SELECT * FROM videojuegos";
    $resultado = $conexion->query($sql);
}

$videojuegos = [];

if ($resultado && $resultado->num_rows > 0) {
    while($fila = $resultado->fetch_assoc()) {
        $videojuegos[] = $fila;
    }
}

echo json_encode($videojuegos, JSON_UNESCAPED_UNICODE);

if (isset($stmt)) {
    $stmt->close();
}
$conexion->close();
?>
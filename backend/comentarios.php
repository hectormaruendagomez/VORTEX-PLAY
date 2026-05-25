<?php
// comentarios.php - Listar y eliminar comentarios

session_start();
include 'conexion.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

// GET ?id_contenido=X → comentarios de un artículo
// GET ?mine=1        → comentarios del usuario en sesión
if ($method === 'GET') {

    if (isset($_GET['mine']) && $_GET['mine'] == 1) {
        if (!isset($_SESSION['id_usuario'])) {
            echo json_encode(['ok' => false, 'message' => 'No autenticado.']);
            exit;
        }
        $id_usuario = (int)$_SESSION['id_usuario'];
        $stmt = $conexion->prepare(
            "SELECT c.id, c.id_contenido, c.texto, c.fecha_comentario,
                    co.titulo AS titulo_contenido, co.tipo
             FROM comentarios c
             JOIN contenidos co ON co.id = c.id_contenido
             WHERE c.id_usuario = ?
             ORDER BY c.fecha_comentario DESC"
        );
        $stmt->bind_param('i', $id_usuario);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        foreach ($rows as &$r) {
            $r['id']          = (int)$r['id'];
            $r['id_contenido'] = (int)$r['id_contenido'];
        }
        echo json_encode(['ok' => true, 'data' => $rows]);
        $stmt->close();
    } else {
        $id_contenido = (int)($_GET['id_contenido'] ?? 0);
        if ($id_contenido <= 0) {
            echo json_encode(['ok' => false, 'message' => 'id_contenido requerido.']);
            exit;
        }
        $stmt = $conexion->prepare(
            "SELECT c.id, c.texto, c.fecha_comentario, u.nombre_usuario, u.rol
             FROM comentarios c
             JOIN usuarios u ON u.id = c.id_usuario
             WHERE c.id_contenido = ?
             ORDER BY c.fecha_comentario ASC"
        );
        $stmt->bind_param('i', $id_contenido);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        foreach ($rows as &$r) {
            $r['id'] = (int)$r['id'];
        }
        echo json_encode(['ok' => true, 'data' => $rows]);
        $stmt->close();
    }

// DELETE → eliminar comentario (dueño o admin)
} elseif ($method === 'DELETE' || ($method === 'POST' && ($_POST['_method'] ?? '') === 'DELETE')) {
    if (!isset($_SESSION['id_usuario'])) {
        echo json_encode(['ok' => false, 'message' => 'No autenticado.']);
        exit;
    }

    $id_comentario = (int)($_GET['id'] ?? $_POST['id'] ?? 0);
    if ($id_comentario <= 0) {
        echo json_encode(['ok' => false, 'message' => 'id requerido.']);
        exit;
    }

    $id_usuario = (int)$_SESSION['id_usuario'];
    $rol        = $_SESSION['rol'];

    if ($rol === 'Administrador') {
        $stmt = $conexion->prepare("DELETE FROM comentarios WHERE id = ?");
        $stmt->bind_param('i', $id_comentario);
    } else {
        $stmt = $conexion->prepare("DELETE FROM comentarios WHERE id = ? AND id_usuario = ?");
        $stmt->bind_param('ii', $id_comentario, $id_usuario);
    }

    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['ok' => true, 'message' => 'Comentario eliminado.']);
    } else {
        echo json_encode(['ok' => false, 'message' => 'No se pudo eliminar.']);
    }
    $stmt->close();
} else {
    echo json_encode(['ok' => false, 'message' => 'Método no permitido.']);
}

$conexion->close();
?>

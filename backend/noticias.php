<?php
// noticias.php - CRUD de contenidos (Noticias y Artículos)

session_start();
include 'conexion.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

// ── Mapas ──────────────────────────────────────────────────────
function estadoToDB($s) {
    return ['published' => 'Publicado', 'draft' => 'Borrador', 'pending' => 'Pendiente'][$s] ?? 'Borrador';
}
function estadoToJS($s) {
    return ['Publicado' => 'published', 'Borrador' => 'draft', 'Pendiente' => 'pending'][$s] ?? 'draft';
}
function fmtFecha($dt) {
    $ts = strtotime($dt);
    $meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return intval(date('d', $ts)) . ' de ' . $meses[intval(date('m', $ts)) - 1] . ' de ' . date('Y', $ts);
}

// ── GET ────────────────────────────────────────────────────────
if ($method === 'GET') {
    $tipo     = $_GET['tipo']     ?? 'Noticia';   // Noticia | Articulo
    $estado   = $_GET['estado']   ?? '';
    $categoria = $_GET['categoria'] ?? '';

    $sql  = "SELECT c.*, u.nombre_usuario FROM contenidos c
             JOIN usuarios u ON u.id = c.id_autor
             WHERE c.tipo = ?";
    $params = [$tipo];
    $types  = 's';

    if ($estado) {
        $sql .= " AND c.estado = ?";
        $params[] = estadoToDB($estado);
        $types   .= 's';
    }
    if ($categoria) {
        $sql .= " AND c.categoria = ?";
        $params[] = $categoria;
        $types   .= 's';
    }
    $sql .= " ORDER BY c.fecha_publicacion DESC";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    $out = [];
    foreach ($rows as $r) {
        $out[] = [
            'id'            => (int)$r['id'],
            'title'         => $r['titulo'],
            'excerpt'       => $r['resumen'] ?? '',
            'content'       => $r['contenido'],
            'category'      => $r['categoria'] ?? '',
            'imageGradient' => $r['imagen'] ?? 'linear-gradient(135deg, #09091e, #151535)',
            'status'        => estadoToJS($r['estado']),
            'date'          => fmtFecha($r['fecha_publicacion']),
            'author'        => $r['nombre_usuario'],
            'views'         => (int)$r['visitas'],
            'tipo'          => $r['tipo'],
        ];
    }

    echo json_encode(['ok' => true, 'data' => $out], JSON_UNESCAPED_UNICODE);
    $stmt->close();

// ── POST: crear contenido ─────────────────────────────────────
} elseif ($method === 'POST' && ($_POST['_method'] ?? '') === '') {
    if (!isset($_SESSION['id_usuario'])) {
        echo json_encode(['ok' => false, 'message' => 'No autenticado.']);
        exit;
    }

    $titulo   = trim($_POST['titulo']   ?? '');
    $resumen  = trim($_POST['resumen']  ?? '');
    $contenido = trim($_POST['contenido'] ?? '');
    $tipo     = $_POST['tipo']     ?? 'Noticia';
    $categoria = trim($_POST['categoria'] ?? '');
    $statusJS = $_POST['status']   ?? 'draft';
    $imagen   = trim($_POST['imagen']   ?? '');

    if (!$titulo || !$contenido) {
        echo json_encode(['ok' => false, 'message' => 'Título y contenido son obligatorios.']);
        exit;
    }

    $rolSesion = $_SESSION['rol'];
    if (!in_array($rolSesion, ['Redactor', 'Colaborador', 'Administrador'])) {
        echo json_encode(['ok' => false, 'message' => 'Sin permisos para crear contenido.']);
        exit;
    }

    // Colaboradores solo pueden enviar a revisión
    if ($rolSesion === 'Colaborador') $statusJS = 'pending';

    $estado     = estadoToDB($statusJS);
    $id_autor   = (int)$_SESSION['id_usuario'];
    $fecha      = date('Y-m-d H:i:s');

    $stmt = $conexion->prepare(
        "INSERT INTO contenidos (id_autor, titulo, resumen, contenido, tipo, categoria, imagen, fecha_publicacion, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param('issssssss', $id_autor, $titulo, $resumen, $contenido, $tipo, $categoria, $imagen, $fecha, $estado);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['ok' => true, 'id' => $stmt->insert_id, 'status' => $statusJS]);
    } else {
        echo json_encode(['ok' => false, 'message' => 'Error al guardar.']);
    }
    $stmt->close();

// ── PATCH: cambiar estado ─────────────────────────────────────
} elseif ($method === 'POST' && ($_POST['_method'] ?? '') === 'PATCH') {
    if (!isset($_SESSION['id_usuario'])) {
        echo json_encode(['ok' => false, 'message' => 'No autenticado.']);
        exit;
    }

    $id       = (int)($_POST['id'] ?? 0);
    $statusJS = $_POST['status'] ?? 'published';
    $estado   = estadoToDB($statusJS);
    $fecha    = date('Y-m-d H:i:s');

    $rolSesion = $_SESSION['rol'];
    if (!in_array($rolSesion, ['Redactor', 'Administrador'])) {
        echo json_encode(['ok' => false, 'message' => 'Sin permisos.']);
        exit;
    }

    $stmt = $conexion->prepare("UPDATE contenidos SET estado = ?, fecha_publicacion = ? WHERE id = ?");
    $stmt->bind_param('ssi', $estado, $fecha, $id);
    $stmt->execute();

    echo json_encode(['ok' => $stmt->affected_rows > 0]);
    $stmt->close();

// ── DELETE ────────────────────────────────────────────────────
} elseif ($method === 'POST' && ($_POST['_method'] ?? '') === 'DELETE') {
    if (!isset($_SESSION['id_usuario'])) {
        echo json_encode(['ok' => false, 'message' => 'No autenticado.']);
        exit;
    }

    $id        = (int)($_POST['id'] ?? 0);
    $rolSesion = $_SESSION['rol'];

    if (!in_array($rolSesion, ['Redactor', 'Administrador'])) {
        echo json_encode(['ok' => false, 'message' => 'Sin permisos.']);
        exit;
    }

    $stmt = $conexion->prepare("DELETE FROM contenidos WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();

    echo json_encode(['ok' => $stmt->affected_rows > 0]);
    $stmt->close();
} else {
    echo json_encode(['ok' => false, 'message' => 'Método no permitido.']);
}

$conexion->close();
?>

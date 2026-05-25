-- =================================================================
-- 1. CREACIÓN DE LA BASE DE DATOS Y CONFIGURACIÓN
-- =================================================================
CREATE DATABASE IF NOT EXISTS gamehub_db;
USE gamehub_db;

-- =================================================================
-- 2. ELIMINACIÓN DE TABLAS EN ORDEN INVERSO DE DEPENDENCIAS
-- =================================================================
DROP TABLE IF EXISTS valoraciones;
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS multimedia;
DROP TABLE IF EXISTS eventos;
DROP TABLE IF EXISTS mensajes_contacto;
DROP TABLE IF EXISTS contenidos;
DROP TABLE IF EXISTS videojuegos;
DROP TABLE IF EXISTS usuarios;

-- =================================================================
-- 3. CREACIÓN DE TABLAS MAESTRAS (Sin claves foráneas)
-- =================================================================

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('Suscriptor', 'Redactor', 'Colaborador', 'Administrador')),
    fecha_registro DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

-- Tabla de Videojuegos
CREATE TABLE videojuegos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    desarrollador VARCHAR(100) NOT NULL,
    fecha_lanzamiento DATE NOT NULL,
    genero VARCHAR(50) NOT NULL,
    plataforma VARCHAR(50) NOT NULL,
    puntuacion_prensa DECIMAL(3,1) DEFAULT 0.0,
    puntuacion_comunidad DECIMAL(3,1) DEFAULT 0.0
);

-- =================================================================
-- 4. CREACIÓN DE TABLAS DEPENDIENTES (Contienen Claves Foráneas)
-- =================================================================

-- Tabla de Contenidos (Noticias y Artículos de Blog)
CREATE TABLE contenidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_autor INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    resumen VARCHAR(500) NULL,
    contenido TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Noticia', 'Articulo')),
    categoria VARCHAR(50) NULL,
    imagen TEXT NULL,
    fecha_publicacion DATETIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Publicado',
    visitas INT NOT NULL DEFAULT 0,
    FOREIGN KEY (id_autor) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- Tabla de Comentarios (Acción de que un usuario escriba un comentario)
CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_contenido INT NOT NULL,
    id_usuario INT NOT NULL,
    texto TEXT NOT NULL,
    fecha_comentario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    FOREIGN KEY (id_contenido) REFERENCES contenidos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de Valoraciones (Acción de puntuar juegos de la Comunidad)
CREATE TABLE valoraciones (
    id_usuario INT NOT NULL,
    id_videojuego INT NOT NULL,
    puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 10),
    fecha_valoracion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_videojuego),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_videojuego) REFERENCES videojuegos(id) ON DELETE CASCADE
);

-- Tabla de Multimedia (Videos, imágenes, links...)
CREATE TABLE multimedia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_videojuego INT NOT NULL,
    id_usuario INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    url_recurso VARCHAR(255) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('Imagen', 'Video')),
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    fecha_subida DATE NOT NULL,
    FOREIGN KEY (id_videojuego) REFERENCES videojuegos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de Favoritos (Videojuegos marcados como favoritos por usuario)
CREATE TABLE favoritos (
    id_usuario INT NOT NULL,
    id_videojuego INT NOT NULL,
    fecha_favorito DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_videojuego),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_videojuego) REFERENCES videojuegos(id) ON DELETE CASCADE
);

-- Tabla de Mensajes de Contacto (Mensajes al equipo de desarrollo, para errores o mejoras)
CREATE TABLE mensajes_contacto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    nombre_remitente VARCHAR(100) NOT NULL,
    email_remitente VARCHAR(100) NOT NULL,
    asunto VARCHAR(150) NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de Eventos (Torneos, lives y cosas del estilo)
CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    fecha_inicio DATETIME NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_admin) REFERENCES usuarios(id) ON DELETE RESTRICT
);


-- =================================================================
-- 5. INSERCIÓN DE DATOS DE PRUEBA (DML)
-- =================================================================

-- 5.1. Usuarios de prueba (Contraseñas reales y personalizadas en formato BCRYPT)
INSERT INTO usuarios (nombre_usuario, email, password, rol, fecha_registro, estado) VALUES
('admin_carlos', 'carlos@gamehub.com', '$2y$12$5ZDFsnWPo4.t34Mmp90AqOsTA0XKh/ya3CVwbsKrKJUo0Ob2yLmW2', 'Administrador', '2026-05-01', 'Activo'),
('redactor_hector', 'hector@gamehub.com', '$2y$12$IedNHXyzvxH.UUyJUa9keelIeQOoiKK8qcB4h/2Perp7.fxmT457S', 'Redactor', '2026-05-02', 'Activo'),
('colaborador_conesa', 'conesa@gamehub.com', '$2y$12$aMTTW11HGhlXRR4Jg.D2fuU4O9wG6tWcA928EvCZPIZTT.ACM5YTq', 'Colaborador', '2026-05-05', 'Activo'),
('suscriptor_pepe', 'pepe@gamehub.com', '$2y$12$7X12.kLsr8Jy/HlihN6uxus3gU43eU1OI8Dd7ku3iNx3/neKshT4e', 'Suscriptor', '2026-05-03', 'Activo'),
('suscriptor_pacotony', 'pacotony@gamehub.com', '$2y$12$7X12.kLsr8Jy/HlihN6uxus3gU43eU1OI8Dd7ku3iNx3/neKshT4e', 'Suscriptor', '2026-05-04', 'Activo'),
('suscriptor_profe', 'profe@gamehub.com', '$2y$12$4E.eu0GEtrx5/c1eeKMGHOP9WRHp3K.qXRkVo2iYOJRx79FyRElXO', 'Suscriptor', '2026-05-26', 'Activo');
-- Las contraseñas de los administradores son 'admin', de los redactores 'redactor', de los colaboradores 'colaborador', de los subscriptores 'subscriptor', y de los 
-- Contraseña del usuario del profesor es 'profe'

-- 5.2. Catálogo inicial de Videojuegos
INSERT INTO videojuegos (titulo, descripcion, desarrollador, fecha_lanzamiento, genero, plataforma, puntuacion_prensa, puntuacion_comunidad) VALUES
('The Legend of Zelda: Tears of the Kingdom', 'Aventura épica en el reino de Hyrule.', 'Nintendo', '2023-05-12', 'Aventura', 'Nintendo Switch', 9.6, 4.8),
('Elden Ring', 'Acción y rol en un mundo oscuro y abierto.', 'FromSoftware', '2022-02-25', 'RPG', 'PC / PS5 / Xbox', 9.5, 4.9),
('Cyberpunk 2077', 'RPG futurista en la megalópolis de Night City.', 'CD Projekt Red', '2020-12-10', 'RPG / Sci-Fi', 'PC / PS5', 8.0, 4.2);

-- 5.3. Contenidos del Blog y Noticias
INSERT INTO contenidos (id_autor, titulo, resumen, contenido, tipo, categoria, imagen, fecha_publicacion, estado, visitas) VALUES
(2, 'Análisis de Elden Ring: Una obra maestra imperecedera',
 'Tras jugar más de 100 horas, os contamos por qué este juego es el Dark Souls de los Dark Souls.',
 'Tras jugar más de 100 horas, os contamos por qué este juego es el Dark Souls de los Dark Souls. El mundo abierto diseñado junto a George R.R. Martin es una maravilla de diseño.',
 'Articulo', 'Análisis', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', '2026-05-10 12:00:00', 'Publicado', 0),
(2, 'Gran evento de eSports 2026 confirma récord de participantes',
 'El torneo de eSports más esperado del año: 5 millones en premios, más de 50 países y expectativas de superar los 100 millones de espectadores.',
 'El torneo de eSports más esperado del año ya tiene fecha y cifras: 5 millones de dólares en premios, más de 50 países participantes. Las clasificatorias han arrancado con una competencia que no se veía desde hace tiempo.',
 'Noticia', 'Esports', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '2026-05-21 16:30:00', 'Publicado', 2540),
(2, 'Nuevo motor gráfico revolucionario lanzado',
 'Ray-tracing en tiempo real, física predictiva y machine learning integrado. Los primeros juegos que lo usan llegarán antes de que acabe el año.',
 'Ray-tracing en tiempo real, física predictiva y machine learning integrado en el pipeline de renderizado. Las primeras demostraciones muestran resultados que costaba imaginar hace apenas dos años.',
 'Noticia', 'Tecnología', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', '2026-05-20 10:00:00', 'Publicado', 1240),
(2, 'Tendencias en gaming 2026: Cloud y comunidad lideran',
 'Cloud gaming, realidad aumentada y comunidades integradas: los analistas apuntan a que el 70% de los jugadores usarán servicios en la nube en 2027.',
 'Cloud gaming, realidad aumentada y comunidades integradas en el propio juego. Los analistas apuntan a que el 70% de los jugadores usarán servicios en la nube de aquí a 2027.',
 'Noticia', 'Tendencias', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', '2026-05-19 09:00:00', 'Publicado', 980),
(2, 'Lanzamiento plataforma cloud gaming revoluciona el sector',
 'Más de 500 títulos desde el primer día, latencia por debajo de 10ms y soporte para cualquier dispositivo.',
 'Más de 500 títulos disponibles desde el primer día, latencia por debajo de 10ms y soporte para cualquier dispositivo con conexión a internet.',
 'Noticia', 'Plataformas', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', '2026-05-18 14:00:00', 'Publicado', 860),
(2, 'Colectivo de streamers rompe récord histórico de audiencia',
 '50 millones de espectadores simultáneos, sin previo aviso, solo boca a boca en redes. Un fenómeno que nadie vio venir.',
 '50 millones de espectadores simultáneos en una sola transmisión. Lo más llamativo es que no hubo promoción previa: fue todo boca a boca en redes durante las 48 horas anteriores.',
 'Noticia', 'Streaming', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', '2026-05-17 20:00:00', 'Publicado', 1980);

-- 5.4. Comentarios en los artículos (Hechos por suscriptores)
-- id_contenido 1 = Artículo Elden Ring, id_contenido 2 = Noticia eSports
INSERT INTO comentarios (id_contenido, id_usuario, texto, fecha_comentario) VALUES
(1, 3, 'El mejor juego de mundo abierto que he probado, cine absoluto.', '2026-05-10 14:22:00'),
(1, 4, 'Llevo quince días intentando acabar con Malenia... me voy a tirar de un puente', '2026-05-11 09:15:00'),
(2, 4, 'Buen análisis. La profesionalización era inevitable, pero hay que hacerlo sin perder lo que hace especiales a los eSports.', '2026-05-21 18:00:00');

-- 5.4b. Favoritos de muestra
INSERT INTO favoritos (id_usuario, id_videojuego, fecha_favorito) VALUES
(3, 1, '2026-05-12 18:00:00'),
(3, 2, '2026-05-12 18:05:00'),
(4, 2, '2026-05-13 11:30:00'),
(4, 3, '2026-05-13 11:35:00');

-- 5.5. Valoraciones de videojuegos de la comunidad (Puntuaciones del 1 al 5)
INSERT INTO valoraciones (id_usuario, id_videojuego, puntuacion, fecha_valoracion) VALUES
(3, 1, 5, '2026-05-12 18:00:00'), -- un 5 al zelda
(3, 2, 5, '2026-05-12 18:05:00'), -- un 5 al elden ring
(4, 2, 4, '2026-05-13 11:30:00'); -- un 4 al elden ring

-- 5.6. Recursos Multimedia (Son de ejemplo)
INSERT INTO multimedia (id_videojuego, id_usuario, titulo, url_recurso, tipo, estado, fecha_subida) VALUES
(1, 2, 'Tráiler oficial de Zelda TotK', 'https://www.youtube.com/watch?v=fe_test', 'Video', 'Aprobado', '2026-05-05'),
(2, 3, 'Captura de pantalla de mi personaje en el jefe final', 'https://gamehub.com/uploads/screenshot1.jpg', 'Imagen', 'Aprobado', '2026-05-12');

-- 5.7. Mensajes de Contacto recibidos
INSERT INTO mensajes_contacto (id_usuario, nombre_remitente, email_remitente, asunto, mensaje, leido) VALUES
(3, 'Paco Tony', 'pacotony@gamehub.com', 'Problema con las valoraciones', 'Ey gente no me deja cambiar mi voto de un juego que ya había valorado. podeis revisar ese bug?', FALSE);

-- 5.8. Eventos creados en la agenda (Por el administrador con id=1)
INSERT INTO eventos (id_admin, nombre, descripcion, fecha_inicio, tipo) VALUES
(1, 'Torneo Comunitario: Speedrun Elden Ring', 'Competición en directo en nuestro canal de Discord con premios para los tres primeros puestos.', '2026-06-01 20:00:00', 'Torneo');



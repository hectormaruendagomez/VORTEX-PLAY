const EVENTS = [
    {
        id: 1,
        title: 'Elden Ring 2 — Anuncio Oficial',
        date: '2026-06-05',
        type: 'launch',
        description: 'FromSoftware y Bandai Namco revelan la secuela de Elden Ring con un nuevo tráiler cinemático. Lanzamiento confirmado para finales de 2027 en PC y consolas. El mundo se expande con regiones completamente nuevas.',
    },
    {
        id: 2,
        title: 'Summer Games Fest 2026',
        date: '2026-06-12',
        type: 'event',
        description: 'El mayor show de anuncios independiente del año. Más de 40 estudios confirman su participación, con reveals exclusivos y demos jugables disponibles para todo el público durante 72 horas.',
    },
    {
        id: 3,
        title: 'Torneo Mundial CS2 — Fase de Grupos',
        date: '2026-06-15',
        type: 'tournament',
        description: 'Las 32 mejores organizaciones del planeta se enfrentan en la fase de grupos del torneo más importante del año. Premio total de 2 millones de dólares. Streaming gratuito en todas las plataformas.',
    },
    {
        id: 4,
        title: 'League of Legends — Patch 14.12',
        date: '2026-06-18',
        type: 'update',
        description: 'Gran actualización con balanceo profundo de campeones, nuevo ítem mítico y cambios en el sistema de objetivos del mapa. Riot Games comparte las notas completas del parche.',
    },
    {
        id: 5,
        title: 'Nintendo Direct — Junio 2026',
        date: '2026-06-22',
        type: 'event',
        description: 'Nintendo presenta su lineup completo para el segundo semestre del año. Se esperan anuncios de Metroid Prime 4 Beyond, un nuevo Zelda y sorpresas de estudios third-party.',
    },
    {
        id: 6,
        title: 'Cyberpunk 2077 — DLC "Axiom Protocol"',
        date: '2026-06-28',
        type: 'launch',
        description: 'CD Projekt Red lanza la segunda gran expansión de Cyberpunk 2077 con más de 15 horas de contenido narrativo, nuevas misiones secundarias y una región completamente nueva de Night City.',
    },
    {
        id: 7,
        title: 'Xbox Game Pass — Actualización Julio',
        date: '2026-07-01',
        type: 'update',
        description: 'Microsoft añade 18 nuevos títulos al servicio durante julio, incluyendo cinco lanzamientos del día uno de Xbox Game Studios y un paquete especial de RPGs japoneses.',
    },
    {
        id: 8,
        title: 'Gran Torneo eSports Madrid 2026',
        date: '2026-07-04',
        type: 'tournament',
        description: 'Evento presencial en el WiZink Center con 15.000 asistentes. Competiciones de Valorant, Rocket League y FC25. Premio acumulado de 500.000€ y cobertura en directo por Movistar eSports.',
    },
    {
        id: 9,
        title: 'GTA VI — Lanzamiento PC',
        date: '2026-07-10',
        type: 'launch',
        description: 'Rockstar Games confirma la versión de PC de Grand Theft Auto VI. Incluye soporte para ray tracing completo, DLSS 4 y FSR 4. Los requisitos técnicos y la fecha exacta se anuncian hoy.',
    },
    {
        id: 10,
        title: 'Valorant Champions Tour — Finales',
        date: '2026-07-19',
        type: 'tournament',
        description: 'Las cuatro mejores regiones del mundo se dan cita en las finales globales del VCT. Formato de doble eliminatoria con el primer puesto llevándose 600.000 dólares y la corona mundial.',
    },
    {
        id: 11,
        title: 'Steam — Rebajas de Verano 2026',
        date: '2026-07-24',
        type: 'event',
        description: 'Valve lanza las rebajas más grandes del año con descuentos de hasta el 90% en miles de títulos. Miniconcurso de insignias y tarjetas coleccionables con premios exclusivos para los participantes.',
    },
    {
        id: 12,
        title: 'Gamescom 2026 — Apertura',
        date: '2026-08-26',
        type: 'event',
        description: 'La mayor feria de videojuegos de Europa abre sus puertas en Colonia con más de 1.200 expositores. Cinco días de conferencias, demos jugables y la ceremonia de los Gamescom Awards.',
    },
];

function getTypeLabel(type) {
    return t(`agenda.type.${type}`) || type;
}

function getMonthNames() {
    return Array.from({ length: 12 }, (_, i) => t(`agenda.month.${i}`));
}

let currentYear = 2026;
let currentMonth = 5;
let activeFilter = 'all';
let selectedDay = null;

document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();

    document.addEventListener('translationsApplied', function() {
        renderCalendar();
        if (selectedDay === null) resetDetailPanel();
    });

    document.getElementById('btnPrevMonth').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        selectedDay = null;
        renderCalendar();
        resetDetailPanel();
    });

    document.getElementById('btnNextMonth').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        selectedDay = null;
        renderCalendar();
        resetDetailPanel();
    });

    document.getElementById('agendaFilters').addEventListener('click', function(e) {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-type');
        selectedDay = null;
        renderCalendar();
        resetDetailPanel();
    });
});

function getFilteredEvents() {
    if (activeFilter === 'all') return EVENTS;
    return EVENTS.filter(ev => ev.type === activeFilter);
}

function getEventsForDay(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return getFilteredEvents().filter(ev => ev.date === dateStr);
}

function renderCalendar() {
    const monthNames = getMonthNames();
    document.getElementById('calendarTitle').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const today = new Date();

    for (let i = 0; i < offset; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-cell empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = getEventsForDay(currentYear, currentMonth, day);
        const cell = document.createElement('div');

        const isToday = today.getFullYear() === currentYear
            && today.getMonth() === currentMonth
            && today.getDate() === day;

        const isSelected = selectedDay === day;

        cell.className = `calendar-cell${isToday ? ' today' : ''}${dayEvents.length > 0 ? ' has-events' : ''}${isSelected ? ' selected' : ''}`;

        let dotsHtml = '';
        if (dayEvents.length > 0) {
            dotsHtml = '<div class="event-dots">' +
                dayEvents.slice(0, 4).map(ev => `<div class="event-dot ${ev.type}"></div>`).join('') +
                '</div>';
        }

        cell.innerHTML = `<div class="cell-day">${day}</div>${dotsHtml}`;

        if (dayEvents.length > 0) {
            cell.addEventListener('click', function() {
                selectedDay = day;
                document.querySelectorAll('.calendar-cell.selected').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                showDayDetail(day, dayEvents);
            });
        }

        grid.appendChild(cell);
    }
}

function showDayDetail(day, events) {
    const monthNames = getMonthNames();
    const panel = document.getElementById('detailPanel');
    panel.classList.remove('empty-state');

    let html = `<h3 style="color:#00d4ff; margin-bottom:15px; font-size:1.1rem;">${day} ${t('agenda.date.of')} ${monthNames[currentMonth]}</h3>`;

    events.forEach(ev => {
        html += `
            <div class="event-detail-card ${ev.type}">
                <div class="event-card-type ${ev.type}">${getTypeLabel(ev.type)}</div>
                <div class="event-card-title">${ev.title}</div>
                <div class="event-card-desc">${ev.description}</div>
                <div class="event-card-date">📅 ${formatDate(ev.date)}</div>
            </div>
        `;
    });

    panel.innerHTML = html;
}

function resetDetailPanel() {
    const panel = document.getElementById('detailPanel');
    panel.classList.add('empty-state');
    panel.innerHTML = `<span>📅</span><p>${t('agenda.empty')}</p>`;
}

function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    const monthNames = getMonthNames();
    const of = t('agenda.date.of');
    return `${parseInt(d)} ${of} ${monthNames[parseInt(m) - 1]} ${of} ${y}`;
}

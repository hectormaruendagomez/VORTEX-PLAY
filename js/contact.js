document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const user = getCurrentUser();
    if (user) {
        const nameEl = document.getElementById('contactName');
        const emailEl = document.getElementById('contactEmail');
        if (nameEl && !nameEl.value) nameEl.value = user.name;
        if (emailEl && !emailEl.value) emailEl.value = user.email;
    }

    setupRealtimeContactValidation();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateContactForm()) {
            submitContactForm();
        }
    });
});

function validateContactForm() {
    clearContactErrors();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    const terms = document.getElementById('contactTerms').checked;

    let valid = true;

    if (!name || name.length < 2) {
        showContactError('err-name', 'contactName', 'El nombre debe tener al menos 2 caracteres.');
        valid = false;
    }

    if (!email) {
        showContactError('err-email', 'contactEmail', 'El email es obligatorio.');
        valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showContactError('err-email', 'contactEmail', 'Introduce un email válido (ej: usuario@dominio.com).');
        valid = false;
    }

    if (!subject || subject.length < 5) {
        showContactError('err-subject', 'contactSubject', 'El asunto debe tener al menos 5 caracteres.');
        valid = false;
    }

    if (!message || message.length < 20) {
        showContactError('err-message', 'contactMessage', `El mensaje debe tener al menos 20 caracteres (${message.length}/20).`);
        valid = false;
    }

    if (!terms) {
        showContactError('err-terms', null, 'Debes aceptar la política de privacidad.');
        valid = false;
    }

    return valid;
}

function showContactError(errorId, inputId, message) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
    if (inputId) {
        const input = document.getElementById(inputId);
        if (input) input.classList.add('error');
    }
}

function clearContactErrors() {
    document.querySelectorAll('.contact-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.querySelectorAll('.contact-form .form-input').forEach(el => {
        el.classList.remove('error');
    });
}

function submitContactForm() {
    const btn = document.getElementById('btnContactSubmit');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    setTimeout(function() {
        document.getElementById('contactForm').style.display = 'none';
        const successEl = document.getElementById('contactSuccess');
        successEl.style.display = 'block';
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 800);
}

function setupRealtimeContactValidation() {
    const fields = [
        { id: 'contactName', errId: 'err-name', minLen: 2, label: 'nombre' },
        { id: 'contactEmail', errId: 'err-email', isEmail: true },
        { id: 'contactSubject', errId: 'err-subject', minLen: 5, label: 'asunto' },
        { id: 'contactMessage', errId: 'err-message', minLen: 20, label: 'mensaje' },
    ];

    fields.forEach(({ id, errId, minLen, isEmail, label }) => {
        const input = document.getElementById(id);
        if (!input) return;

        input.addEventListener('blur', function() {
            const val = this.value.trim();
            const errEl = document.getElementById(errId);
            if (!val) {
                showContactError(errId, id, `Este campo es obligatorio.`);
            } else if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                showContactError(errId, id, 'Introduce un email válido.');
            } else if (minLen && val.length < minLen) {
                showContactError(errId, id, `Mínimo ${minLen} caracteres (${val.length}/${minLen}).`);
            } else {
                if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
                this.classList.remove('error');
                this.style.borderColor = 'rgba(46, 204, 113, 0.5)';
            }
        });

        input.addEventListener('input', function() {
            const val = this.value.trim();
            if (val) {
                this.classList.remove('error');
                const errEl = document.getElementById(errId);
                if (errEl && !errEl.textContent.includes('válido')) {
                    errEl.textContent = '';
                    errEl.style.display = 'none';
                }
            }
        });
    });

    const msgInput = document.getElementById('contactMessage');
    if (msgInput) {
        const counter = document.createElement('span');
        counter.style.cssText = 'font-size:0.75rem; color:#7f8c8d; display:block; text-align:right; margin-top:4px;';
        counter.textContent = '0 / mínimo 20 caracteres';
        msgInput.parentNode.insertBefore(counter, msgInput.nextElementSibling);

        msgInput.addEventListener('input', function() {
            const len = this.value.trim().length;
            counter.textContent = `${len} caracteres${len < 20 ? ` (faltan ${20 - len})` : ''}`;
            counter.style.color = len >= 20 ? '#2ecc71' : '#7f8c8d';
        });
    }
}

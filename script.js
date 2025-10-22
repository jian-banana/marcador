// script.js

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('registerTimeBtn');
    const displayArea = document.getElementById('times');
    const countdownEl = document.getElementById('workCountdown');
    let countdownInterval = null;

    // Load recorded times from local storage
    const loadTimes = () => {
        const getTodayKey = () => new Date().toISOString().slice(0, 10);
        const normalize = (entry) => {
            if (typeof entry === 'string') {
                const d = new Date(entry);
                const key = isNaN(d) ? null : d.toISOString().slice(0, 10);
                return { display: entry, dateKey: key, timestamp: isNaN(d) ? null : d.toISOString() };
            }
            return entry;
        };
        const times = JSON.parse(localStorage.getItem('recordedTimes')) || [];
        displayArea.innerHTML = times
            .map((t) => {
                const e = normalize(t);
                return `<li>${e.display || ''}</li>`;
            })
            .join('');
        const todayKey = getTodayKey();
        const todayCount = times.map((t) => normalize(t)).filter((e) => e.dateKey === todayKey).length;
        if (todayCount === 0) {
            button.disabled = false;
            button.textContent = 'Registrar ingreso';
        } else if (todayCount === 1) {
            button.disabled = false;
            button.textContent = 'Registrar salida';
        } else {
            button.disabled = true;
            button.textContent = 'Turno completo';
        }

        const localNormalize = (entry) => {
            if (typeof entry === 'string') {
                const d = new Date(entry);
                return { display: entry, dateKey: isNaN(d) ? null : d.toISOString().slice(0, 10), timestamp: isNaN(d) ? null : d.toISOString() };
            }
            if (!entry.timestamp && entry.display) {
                const cleaned = String(entry.display).replace(/^Ingreso:\s*/i, '').replace(/^Salida:\s*/i, '');
                const d = new Date(cleaned);
                return { ...entry, timestamp: isNaN(d) ? null : d.toISOString() };
            }
            return entry;
        };

        const updateCountdown = () => {
            if (!countdownEl) return;
            const today = getTodayKey();
            const normalized = (JSON.parse(localStorage.getItem('recordedTimes')) || []).map(localNormalize).filter((e) => e.dateKey === today);
            const first = normalized[0];
            if (!first || !first.timestamp) {
                countdownEl.textContent = 'Registra ingreso para iniciar la jornada';
                if (countdownInterval) clearInterval(countdownInterval);
                countdownInterval = null;
                return;
            }
            const start = new Date(first.timestamp);
            const end = new Date(start.getTime() + (10 * 60 + 36) * 60 * 1000);
            const render = () => {
                const now = new Date();
                const diffMs = end.getTime() - now.getTime();
                if (diffMs <= 0) {
                    countdownEl.textContent = `Jornada completa a las ${end.toLocaleTimeString()}`;
                    if (countdownInterval) clearInterval(countdownInterval);
                    countdownInterval = null;
                    return;
                }
                const totalSec = Math.floor(diffMs / 1000);
                const h = Math.floor(totalSec / 3600);
                const m = Math.floor((totalSec % 3600) / 60);
                const s = totalSec % 60;
                const pad = (n) => String(n).padStart(2, '0');
                countdownEl.textContent = `Termina a las ${end.toLocaleTimeString()} · Restante: ${pad(h)}:${pad(m)}:${pad(s)}`;
            };
            render();
            if (countdownInterval) clearInterval(countdownInterval);
            countdownInterval = setInterval(render, 1000);
        };

        updateCountdown();
    };

    // Register current time
    button.addEventListener('click', () => {
        const now = new Date();
        const getTodayKey = () => new Date().toISOString().slice(0, 10);
        const normalize = (entry) => {
            if (typeof entry === 'string') {
                const d = new Date(entry);
                const key = isNaN(d) ? null : d.toISOString().slice(0, 10);
                return { display: entry, dateKey: key, timestamp: isNaN(d) ? null : d.toISOString() };
            }
            return entry;
        };
        const recordedTimes = JSON.parse(localStorage.getItem('recordedTimes')) || [];
        const todayKey = getTodayKey();
        const todayCount = recordedTimes.map((t) => normalize(t)).filter((e) => e.dateKey === todayKey).length;
        if (todayCount >= 2) {
            alert('Ya registraste dos veces hoy.');
            return;
        }
        const label = todayCount === 0 ? 'Ingreso' : 'Salida';
        recordedTimes.push({ display: `${label}: ${now.toLocaleString()}`, dateKey: todayKey, timestamp: now.toISOString() });
        localStorage.setItem('recordedTimes', JSON.stringify(recordedTimes));
        loadTimes();
    });

    // Initial load of recorded times
    loadTimes();
});
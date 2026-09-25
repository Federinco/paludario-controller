// Struttura dati Terrari
let terrari = JSON.parse(localStorage.getItem('terrari_list')) || [
    { id: '1', nome: 'Paludario Libreria', ip: '', minUmi: 80, minTemp: 22 }
];

let activeId = localStorage.getItem('terrario_active_id') || terrari[0].id;

// Dizionario dei preset climatici pre-impostati
const PRESETS_CLIMATICI = {
    tropicale: { minUmi: 80, minTemp: 22 },
    subtropicale: { minUmi: 70, minTemp: 20 },
    deserto: { minUmi: 40, minTemp: 26 },
    temperato: { minUmi: 60, minTemp: 18 }
};

let anomalieTimer = { umidita: null, temperatura: null };
const TEMPO_RITARDO_NOTIFICA = 180000; // 3 minuti

document.addEventListener('DOMContentLoaded', () => {
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    aggiornaSelectTerrari();
    aggiornaListaModal();
});

function getTerrarioAttivo() {
    return terrari.find(t => t.id === activeId) || terrari[0];
}

function aggiornaSelectTerrari() {
    let select = document.getElementById('selettoreTerritorio');
    select.innerHTML = '';
    terrari.forEach(t => {
        let opt = document.createElement('option');
        opt.value = t.id;
        opt.text = `${t.nome} (${t.ip || 'IP non impostato'})`;
        if (t.id === activeId) opt.selected = true;
        select.appendChild(opt);
    });
}

function cambiaTerrarioAttivo() {
    let select = document.getElementById('selettoreTerritorio');
    activeId = select.value;
    localStorage.setItem('terrario_active_id', activeId);
    anomalieTimer = { umidita: null, temperatura: null };
    pulisciNotificheDinamiche();
    aggiornaSensori();
}

// Gestione Modale
function apriModalConfig() {
    document.getElementById('modalConfig').classList.remove('hidden');
    aggiornaListaModal();
    resetFormTerrario();
}

function chiudiModalConfig() {
    document.getElementById('modalConfig').classList.add('hidden');
    aggiornaSelectTerrari();
    aggiornaSensori();
}

// Applicazione automatica dei preset climatici nel form
function applicaPresetClimatico() {
    let chiavePreset = document.getElementById('selectPreset').value;
    if (chiavePreset && PRESETS_CLIMATICI[chiavePreset]) {
        let preset = PRESETS_CLIMATICI[chiavePreset];
        document.getElementById('inputMinUmi').value = preset.minUmi;
        document.getElementById('inputMinTemp').value = preset.minTemp;
    }
}

// Aggiungi o Modifica Terrario (Corretto bug salvataggio)
function salvaTerrario() {
    let nome = document.getElementById('inputNome').value.trim();
    let ip = document.getElementById('inputIp').value.trim();
    let minUmi = parseFloat(document.getElementById('inputMinUmi').value) || 70;
    let minTemp = parseFloat(document.getElementById('inputMinTemp').value) || 20;
    let editIndexVal = document.getElementById('editIndex').value;

    if (!nome) {
        alert("Inserisci un nome per il terrario!");
        return;
    }

    if (editIndexVal === "" || editIndexVal === "-1") {
        // Creazione Nuovo Terrario
        let nuovoId = Date.now().toString();
        terrari.push({ id: nuovoId, nome, ip, minUmi, minTemp });
        activeId = nuovoId;
        localStorage.setItem('terrario_active_id', activeId);
    } else {
        // Modifica Terrario Esistente basato sull'indice dell'array
        let index = parseInt(editIndexVal);
        if (terrari[index]) {
            terrari[index].nome = nome;
            terrari[index].ip = ip;
            terrari[index].minUmi = minUmi;
            terrari[index].minTemp = minTemp;
        }
    }

    localStorage.setItem('terrari_list', JSON.stringify(terrari));
    aggiornaListaModal();
    resetFormTerrario();
}

function preparaModificaTerrario(index) {
    let t = terrari[index];
    if (!t) return;
    
    document.getElementById('inputNome').value = t.nome;
    document.getElementById('inputIp').value = t.ip || '';
    document.getElementById('inputMinUmi').value = t.minUmi;
    document.getElementById('inputMinTemp').value = t.minTemp;
    document.getElementById('selectPreset').value = ""; // Reset tendina preset
    
    document.getElementById('editIndex').value = index;
    document.getElementById('formTitle').innerText = "Modifica Terrario: " + t.nome;
    document.getElementById('btnSalvaTerrario').innerText = "Aggiorna Terrario";
    document.getElementById('btnAnnullaMod').classList.remove('hidden');
}

function resetFormTerrario() {
    document.getElementById('inputNome').value = '';
    document.getElementById('inputIp').value = '';
    document.getElementById('inputMinUmi').value = '70';
    document.getElementById('inputMinTemp').value = '20';
    document.getElementById('selectPreset').value = '';
    document.getElementById('editIndex').value = '-1';
    document.getElementById('formTitle').innerText = "Aggiungi Nuovo Terrario";
    document.getElementById('btnSalvaTerrario').innerText = "Salva Terrario";
    document.getElementById('btnAnnullaMod').classList.add('hidden');
}

function eliminaTerrario(id) {
    if (terrari.length <= 1) {
        alert("Devi mantenere almeno un terrario configurato!");
        return;
    }
    terrari = terrari.filter(t => t.id !== id);
    localStorage.setItem('terrari_list', JSON.stringify(terrari));

    if (activeId === id) {
        activeId = terrari[0].id;
        localStorage.setItem('terrario_active_id', activeId);
    }

    aggiornaListaModal();
    aggiornaSelectTerrari();
    aggiornaSensori();
}

function aggiornaListaModal() {
    let container = document.getElementById('listaTerrariModal');
    container.innerHTML = '';

    terrari.forEach((t, index) => {
        let div = document.createElement('div');
        div.className = "flex justify-between items-center bg-slate-900 p-2.5 rounded-lg border border-slate-700 text-sm";
        div.innerHTML = `
            <div>
                <strong class="text-emerald-400 block">${t.nome}</strong>
                <span class="text-xs text-slate-400">IP: ${t.ip || 'Non impostato'} | Soglie: ≥${t.minUmi}% Umi, ≥${t.minTemp}°C</span>
            </div>
            <div class="flex gap-1">
                <button onclick="preparaModificaTerrario(${index})" class="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded bg-blue-500/10 cursor-pointer">Modifica</button>
                <button onclick="eliminaTerrario('${t.id}')" class="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-500/10 cursor-pointer">Elimina</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// --- COMUNICAZIONE & SENSORI ---

async function inviaComando(dispositivo, azione) {
    let terrario = getTerrarioAttivo();
    if (!terrario.ip) {
        alert("Il terrario attivo non ha un indirizzo IP ESP32 configurato!");
        return;
    }

    try {
        let response = await fetch(`http://${terrario.ip}/control?device=${dispositivo}&action=${azione}`, { method: 'GET' });
        if (response.ok) {
            let data = await response.json();
            aggiornaStatoUI(data);
        } else {
            alert("Errore nell'esecuzione del comando da parte dell'ESP32.");
        }
    } catch (error) {
        console.error("Errore connessione ESP32:", error);
        document.getElementById('connessioneStato').innerText = "● Errore di comunicazione";
        document.getElementById('connessioneStato').className = "text-red-400 font-medium";
    }
}

async function aggiornaSensori() {
    let terrario = getTerrarioAttivo();
    if (!terrario.ip) {
        document.getElementById('connessioneStato').innerText = "● IP non configurato";
        document.getElementById('connessioneStato').className = "text-amber-400 font-medium";
        return;
    }

    try {
        let response = await fetch(`http://${terrario.ip}/status`, { method: 'GET', signal: AbortSignal.timeout(4000) });
        if (response.ok) {
            let data = await response.json();
            aggiornaStatoUI(data);
            verificaAnomalie(data, terrario);

            document.getElementById('connessioneStato').innerText = `● Connesso (${terrario.nome})`;
            document.getElementById('connessioneStato').className = "text-emerald-400 font-medium";
            document.getElementById('ultimoAggiornamento').innerText = `Ultimo agg: ${new Date().toLocaleTimeString()}`;
        }
    } catch (error) {
        document.getElementById('connessioneStato').innerText = "● Disconnesso (Timeout)";
        document.getElementById('connessioneStato').className = "text-red-400 font-medium";
    }
}

function aggiornaStatoUI(data) {
    let terrario = getTerrarioAttivo();
    document.getElementById('valoreUmidita').innerText = data.umidita + "%";
    document.getElementById('valoreTemp').innerText = data.temperatura + "°C";

    document.getElementById('statoUmiditaTxt').innerText = `Soglia min: ${terrario.minUmi}%`;
    document.getElementById('statoTempTxt').innerText = `Soglia min: ${terrario.minTemp}°C`;

    gestisciStatoPulsante('btnFogger', data.fogger);
    gestisciStatoPulsante('btnIrrigazione', data.irrigazione);
    gestisciStatoPulsante('btnCascata', data.cascata);
    gestisciStatoPulsante('btnLuci', data.luci);

    let warningBox = document.getElementById('waterWarning');
    if (data.acqua_ok === false) {
        warningBox.classList.remove('hidden');
    } else {
        warningBox.classList.add('hidden');
    }
}

function gestisciStatoPulsante(idBtn, acceso) {
    let btn = document.getElementById(idBtn);
    if (acceso) {
        btn.innerText = "ON";
        btn.className = "bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold transition text-white shadow-lg shadow-emerald-900/50 cursor-pointer";
    } else {
        btn.innerText = "OFF";
        btn.className = "bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition text-slate-300 cursor-pointer";
    }
}

function verificaAnomalie(data, terrario) {
    let oraCorrente = Date.now();

    let cardUmi = document.getElementById('cardUmidita');
    if (data.umidita < terrario.minUmi) {
        if (!anomalieTimer.umidita) {
            anomalieTimer.umidita = oraCorrente;
        } else if (oraCorrente - anomalieTimer.umidita >= TEMPO_RITARDO_NOTIFICA) {
            cardUmi.className = "bg-red-500/20 p-4 rounded-xl border border-red-500 text-center shadow-lg transition animate-pulse";
            mostraNotificaDinamica('notificaUmi', `Umidità bassa in '${terrario.nome}': ${data.umidita}% (Soglia: ${terrario.minUmi}%)`);
        }
    } else {
        anomalieTimer.umidita = null;
        cardUmi.className = "bg-slate-800 p-4 rounded-xl border border-slate-700 text-center shadow-lg transition";
        rimuoviNotificaDinamica('notificaUmi');
    }

    let cardTemp = document.getElementById('cardTemp');
    if (data.temperatura < terrario.minTemp) {
        if (!anomalieTimer.temperatura) {
            anomalieTimer.temperatura = oraCorrente;
        } else if (oraCorrente - anomalieTimer.temperatura >= TEMPO_RITARDO_NOTIFICA) {
            cardTemp.className = "bg-amber-500/20 p-4 rounded-xl border border-amber-500 text-center shadow-lg transition animate-pulse";
            mostraNotificaDinamica('notificaTemp', `Temperatura bassa in '${terrario.nome}': ${data.temperatura}°C (Soglia: ${terrario.minTemp}°C)`);
        }
    } else {
        anomalieTimer.temperatura = null;
        cardTemp.className = "bg-slate-800 p-4 rounded-xl border border-slate-700 text-center shadow-lg transition";
        rimuoviNotificaDinamica('notificaTemp');
    }
}

function mostraNotificaDinamica(id, messaggio) {
    let container = document.getElementById('containerNotifiche');
    let elem = document.getElementById(id);
    if (!elem) {
        elem = document.createElement('div');
        elem.id = id;
        elem.className = "bg-amber-500/10 border border-amber-500/50 rounded-xl p-3 flex items-center gap-3";
        elem.innerHTML = `
            <span class="text-amber-400 text-xl">⏳</span>
            <div>
                <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wide">Anomalia Persistente</h4>
                <p class="text-xs text-amber-300">${messaggio}</p>
            </div>
        `;
        container.appendChild(elem);

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Terraria Alert", { body: messaggio });
        }
    }
}

function rimuoviNotificaDinamica(id) {
    let elem = document.getElementById(id);
    if (elem) elem.remove();
}

function pulisciNotificheDinamiche() {
    let container = document.getElementById('containerNotifiche');
    let warningAcqua = document.getElementById('waterWarning');
    container.innerHTML = '';
    container.appendChild(warningAcqua);
}

setInterval(aggiornaSensori, 5000);
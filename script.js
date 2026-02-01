// Elemente
const fehlerItems = document.querySelectorAll('.fehler-item');
const fehlerCountDisplay = document.getElementById('fehlerCount');
const klasseSelect = document.getElementById('klasse');
const modal = document.getElementById('resultModal');
const closeModalBtn = document.getElementById('closeModal');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');

// Klassenspezifische Fehler ein-/ausblenden
klasseSelect.addEventListener('change', function() {
    const selectedKlasse = this.value;
    const classeSpecificItems = document.querySelectorAll('.classe-specific');
    
    classeSpecificItems.forEach(item => {
        const allowedClasses = item.dataset.classes.split(',');
        if (allowedClasses.includes(selectedKlasse)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
            // Reset count wenn nicht sichtbar
            item.dataset.count = '0';
            item.querySelector('.fehler-badge').textContent = '0';
            item.classList.remove('selected');
        }
    });
    
    updateFehlerCount();
});

// Event Listeners für Fehler-Items (Mehrfach-Klick)
fehlerItems.forEach(item => {
    // Linksklick - Fehler erhöhen
    item.addEventListener('click', function(e) {
        // Verhindere, dass der Klick auf das Badge selbst zählt
        if (e.target.classList.contains('fehler-badge')) return;
        
        let count = parseInt(this.dataset.count) || 0;
        count++;
        this.dataset.count = count;
        
        // Badge aktualisieren
        const badge = this.querySelector('.fehler-badge');
        badge.textContent = count;
        
        // Visual Feedback
        if (count > 0) {
            this.classList.add('selected');
        }
        
        updateFehlerCount();
    });
    
    // Rechtsklick - Fehler verringern
    item.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        let count = parseInt(this.dataset.count) || 0;
        if (count > 0) {
            count--;
            this.dataset.count = count;
            
            // Badge aktualisieren
            const badge = this.querySelector('.fehler-badge');
            badge.textContent = count;
            
            // Visual Feedback
            if (count === 0) {
                this.classList.remove('selected');
            }
            
            updateFehlerCount();
        }
    });
});

// Fehler Counter aktualisieren
function updateFehlerCount() {
    let totalFehler = 0;
    
    fehlerItems.forEach(item => {
        const count = parseInt(item.dataset.count) || 0;
        const isUnfall = item.dataset.unfall === 'true';
        
        if (count > 0) {
            if (isUnfall) {
                totalFehler += count * 2; // Unfall zählt als 2 Fehler pro Vorkommnis
            } else {
                totalFehler += count;
            }
        }
    });
    
    fehlerCountDisplay.textContent = `${totalFehler} Fehler`;
    fehlerCountDisplay.style.background = totalFehler > 5 ? 'var(--error)' : 'var(--primary)';
}

// Auswertung generieren und Modal öffnen
generateBtn.addEventListener('click', function() {
    generateAuswertung();
});

function generateAuswertung() {
    // Validierung
    const robloxUsername = document.getElementById('robloxUsername').value.trim();
    const klasse = document.getElementById('klasse').value;
    const fahrzeug = document.getElementById('fahrzeug').value.trim();
    const kennzeichen = document.getElementById('kennzeichen').value.trim();
    const farbe = document.getElementById('farbe').value.trim();
    const zeitVon = document.getElementById('zeitVon').value;
    const zeitBis = document.getElementById('zeitBis').value;

    if (!robloxUsername || !klasse || !fahrzeug || !kennzeichen || !farbe || !zeitVon || !zeitBis) {
        alert('Bitte füllen Sie alle Pflichtfelder aus!');
        return;
    }

    // Fehler sammeln
    const selectedFehler = [];
    let totalFehler = 0;
    
    fehlerItems.forEach(item => {
        const count = parseInt(item.dataset.count) || 0;
        if (count > 0) {
            const label = item.querySelector('label').textContent.replace('⚠️ ', '').trim();
            const isUnfall = item.dataset.unfall === 'true';
            
            if (isUnfall) {
                // Unfall mehrmals
                for (let i = 0; i < count; i++) {
                    selectedFehler.push('Unfall');
                    totalFehler += 2;
                }
            } else {
                // Normale Fehler
                for (let i = 0; i < count; i++) {
                    selectedFehler.push(label);
                    totalFehler += 1;
                }
            }
        }
    });

    // Ergebnis bestimmen
    const bestanden = totalFehler <= 5;

    // Text generieren
    let resultText = `Fahrprüfung - Klasse ${klasse}\n`;
    resultText += `${'='.repeat(50)}\n\n`;
    resultText += `Prüfling: ${robloxUsername}\n`;
    resultText += `Fahrzeug: ${fahrzeug}\n`;
    resultText += `Kennzeichen: ${kennzeichen}\n`;
    resultText += `Farbe: ${farbe}\n`;
    resultText += `Prüfungszeit: ${zeitVon} - ${zeitBis}\n\n`;
    resultText += `${'='.repeat(50)}\n\n`;

    if (selectedFehler.length > 0) {
        resultText += `Dokumentierte Fehler (${totalFehler}):\n`;
        selectedFehler.forEach((fehler, index) => {
            const suffix = fehler === 'Unfall' ? ' (2 Fehler)' : '';
            resultText += `${index + 1}. ${fehler}${suffix}\n`;
        });
    } else {
        resultText += `Keine Fehler dokumentiert.\n`;
    }

    resultText += `\n${'='.repeat(50)}\n\n`;
    resultText += `**PRÜFUNGSERGEBNIS**: ${bestanden ? 'BESTANDEN ✓' : 'NICHT BESTANDEN ✗'}\n`;
    resultText += `Gesamtfehler: ${totalFehler} / 5 erlaubt\n\n`;
    resultText += `Mit freundlichen Grüßen\n`;
    resultText += `Moritz Grevemayer`;

    // Modal mit Ergebnis befüllen und anzeigen
    document.getElementById('resultText').textContent = resultText;
    document.getElementById('resultBadge').textContent = bestanden ? 'Bestanden' : 'Nicht bestanden';
    document.getElementById('resultBadge').className = `result-badge ${bestanden ? 'bestanden' : 'nicht-bestanden'}`;
    
    // Modal anzeigen
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Verhindert Scrollen im Hintergrund
}

// Modal schließen
closeModalBtn.addEventListener('click', closeModal);

// Modal schließen bei Klick außerhalb
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// ESC-Taste zum Schließen
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});

function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Scrollen wieder aktivieren
}

// Text kopieren
copyBtn.addEventListener('click', function() {
    const text = document.getElementById('resultText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✓ Kopiert!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        alert('Fehler beim Kopieren. Bitte manuell markieren und kopieren.');
        console.error('Copy failed:', err);
    });
});

// Auto-fill current time
window.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('zeitVon').value = timeString;
});
# 🌿 Paludario Smart Controller

Un sistema di automazione e monitoraggio IoT per un mini paludario ricavato all'interno di una libreria ($60 \times 36 \times 27$ cm). Il sistema è gestito da un **ESP32** connesso al Wi-Fi e controllato tramite una Web App ospitata su GitHub Pages.

---

## 🚀 Funzionalità
* **Monitoraggio Ambientale:** Lettura in tempo reale di umidità e temperatura dell'aria tramite sensore DHT22.
* **Controllo Nebulizzazione:** Cicli automatici/manuali di nebbia (tramite mini fogger a ultrasuoni) per mattina e sera.
* **Sistema di Irrigazione:** Irrigazione diurna tramite mini pompa a membrana e ugelli, protetta da un sensore di livello dell'acqua per evitare il funzionamento a secco.
* **Illuminazione:** Gestione della barra LED a spettro pieno.
* **Web App Remota:** Interfaccia grafica responsive per monitorare i dati e comandare manualmente i dispositivi dalla stessa rete locale.

---

## 🛠️ Lista Materiali (Hardware)
* **Microcontrollore:** ESP32 NodeMCU
* **Sensori:**
  * Sensore temperatura/umidità **DHT22** (o AM2302)
  * Interruttore a galleggiante (Sensore di livello acqua)
* **Attuatori & Elettricità:**
  * Modulo relè a 4 canali
  * Alimentatore 12V (min. 5A)
  * Convertitore Buck DC-DC (LM2596 per i 5V dell'ESP32)
* **Parte Idraulica & Effetti:**
  * Mini pompa a membrana 12V (modello 385) + ugelli nebulizzatori
  * Mini maker di nebbia a ultrasuoni (Fogger)
  * Tubi in silicone/PU ($4/6$ mm) e raccordi
  * Barra LED 12V a spettro pieno

---

## 📱 Web App (GitHub Pages)
L'interfaccia grafica è sviluppata in **HTML, Tailwind CSS e JavaScript**. 
Consente di:
1. Inserire l'indirizzo IP locale dell'ESP32.
2. Visualizzare i valori aggiornati di temperatura e umidità.
3. Attivare o disattivare manualmente i singoli componenti (Fogger, Pompa Irrigazione, Luci).

---

## ⚙️ Prossimi Sviluppi / Firmware ESP32
Il codice sorgente in C++ per l'IDE Arduino (gestione Wi-Fi, web server locale ed endpoint JSON) verrà aggiunto prossimamente nella cartella `/firmware`.
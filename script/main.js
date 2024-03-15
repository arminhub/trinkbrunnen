// Globale Variable
let userOrt;

// Initialisieren der Karte (default view)
let meineKarte = L.map('karte').setView([48.210033, 16.363449], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(meineKarte);

// Markers
const erzeugeMarker = async () => {

    let trinkBrunnenKoords = [];
    let data = await ladeDaten();
    data = data.features;

    if (data) {
        for (let i = 0; i < data.length; i++) {
            let koord = data[i].geometry.coordinates;
            let typ = data[i].properties.BASIS_TYP_TXT;
            let dis = meineKarte.distance(userOrt, koord);
            if (dis <= 1000) {
                trinkBrunnenKoords.push({ koord, typ, dis });
            }
        }
        console.log('Trinkbrunnen in der Umgebung:', trinkBrunnenKoords);

        const Marker = function (lat, long, typ, dis) {
            this.lat = lat;
            this.long = long;
            this.typ = typ;
            this.dis = dis;
            L.marker([lat, long]).addTo(meineKarte)
                .bindPopup(`<b>Trinkbrunnen (Umkreis 1 km)</b><br><br>
                <b>Art:</b> ${this.typ}<br>
                <b>Entfernung:</b> ${this.dis.toFixed(1).replace('.', ',')} m (Luftlinie)`);
        }

        trinkBrunnenKoords.forEach(element => {
            let userMarker = new Marker(element.koord[1], element.koord[0], element.typ, element.dis);
        });
    } else {
        console.log('Fehler beim laden der Daten (erzeugeMarker):');
    }

}

// Lade Daten vom Server
const ladeDaten = async () => {

    try {
        const res = await fetch('http://api.beispiel/url');
        const data = await res.json();
        console.log('data:', data);
        return data;
    }
    catch (error) {
        console.log('Fehler beim laden der Daten:', error)
    }
}

// Geolocation API (im Browser)
const ort = function (callback) {
    navigator.geolocation.getCurrentPosition((position) => {

        userOrt = [position.coords.longitude, position.coords.latitude]

        console.log('Dein aktueller Standort:', userOrt);
        meineKarte.setView([position.coords.latitude, position.coords.longitude], 15);
        callback();

        document.querySelector('#reset').classList.remove('d-none');
        document.querySelector('button').classList.add('d-none');
        document.querySelector('.spinner-border').style.display = "none";
    }, (err) => {
        console.log('ERROR', err)
    });
}

// klickHandler Funktion
const klickHandler = () => {
    document.querySelector('.spinner-border').style.display = "block";
    ort(erzeugeMarker);
}

// resetHandler Funktion
const resetHandler = () => {
    location.reload();
}

// Eventhandlers
document.querySelector('.btn').addEventListener('click', klickHandler);
document.querySelector('#reset').addEventListener('click', resetHandler);
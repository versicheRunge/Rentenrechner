// src/App.tsx
// KORRIGIERTE VERSION

import React, { useState } from 'react';
import { UserInput, CalculationResult, Einkunft } from './config';
import { berechneNettoRente } from './rechenkern';

// --- Eingabeformular Komponente ---
const EingabeFormular: React.FC<{ onCalculate: (data: UserInput) => void }> = ({ onCalculate }) => {
    const [einkuenfte, setEinkuenfte] = useState<Einkunft[]>([{ id: '1', art: 'GRV', betrag: 1800 }]);
    const [istVerheiratet, setIstVerheiratet] = useState(false);
    const [hatKinder, setHatKinder] = useState(true);
    const [istInGKV, setIstInGKV] = useState(true);
    const [renteneintrittsjahr, setRenteneintrittsjahr] = useState(2025);

    const handleAddEinkunft = () => {
        setEinkuenfte([...einkuenfte, { id: Date.now().toString(), art: 'bAV', betrag: 300 }]);
    };

    // KORRIGIERTE FUNKTION: Diese Funktion stellt sicher, dass die Typen immer stimmen.
    const handleEinkunftChange = (id: string, field: keyof Einkunft, value: string) => {
        setEinkuenfte(einkuenfte.map(e => {
            if (e.id === id) {
                if (field === 'betrag') {
                    // Wandelt den Text-Input sofort in eine Zahl um. Ein leeres Feld wird zu 0.
                    return { ...e, [field]: Number(value) || 0 };
                }
                if (field === 'art') {
                    // Stellt sicher, dass der Wert als korrekter Typ für 'art' behandelt wird.
                    return { ...e, [field]: value as Einkunft['art'] };
                }
            }
            return e;
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Die Umwandlung in eine Zahl ist hier nicht mehr nötig, da sie schon im State korrekt ist.
        onCalculate({
            einkuenfte,
            istVerheiratet,
            hatKinder,
            istInGKV,
            renteneintrittsjahr: Number(renteneintrittsjahr),
            kapitalauszahlung: null,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-lg shadow-md space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Persönliche Angaben</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">Renteneintrittsjahr:
                        <input type="number" value={renteneintrittsjahr} onChange={e => setRenteneintrittsjahr(parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                    </label>
                    <div className="flex items-center space-x-4">
                        <label><input type="checkbox" checked={istVerheiratet} onChange={e => setIstVerheiratet(e.target.checked)} /> Verheiratet</label>
                        <label><input type="checkbox" checked={hatKinder} onChange={e => setHatKinder(e.target.checked)} /> Kinder</label>
                        <label><input type="checkbox" checked={istInGKV} onChange={e => setIstInGKV(e.target.checked)} /> In GKV</label>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monatliche Brutto-Einkünfte im Ruhestand</h3>
                {einkuenfte.map((e) => (
                    <div key={e.id} className="flex items-center gap-2 mb-2">
                        <select value={e.art} onChange={ev => handleEinkunftChange(e.id, 'art', ev.target.value)} className="rounded-md border-gray-300 shadow-sm">
                            <option value="GRV">Gesetzl. Rente</option>
                            <option value="bAV">Betriebl. AV</option>
                            <option value="Ruerup">Rürup-Rente</option>
                            <option value="Privat">Private Rente</option>
                            <option value="Miete">Mieteinnahmen</option>
                        </select>
                        <input type="number" value={e.betrag} onChange={ev => handleEinkunftChange(e.id, 'betrag', ev.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm" placeholder="Betrag in €"/>
                    </div>
                ))}
                <button type="button" onClick={handleAddEinkunft} className="text-sm text-blue-600 hover:underline mt-2">+ Weitere Einkunft hinzufügen</button>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Rentenlücke berechnen
            </button>
        </form>
    );
};

// --- Ergebnis-Dashboard Komponente (unverändert) ---
const ErgebnisDashboard: React.FC<{ ergebnis: CalculationResult | null; nettoBedarf: number }> = ({ ergebnis, nettoBedarf }) => {
    const [detailsAnzeigen, setDetailsAnzeigen] = useState(false);

    if (!ergebnis) return null;

    const luecke = nettoBedarf - ergebnis.nettoEinkommenMonatlich;
    const istLuecke = luecke > 0;

    return (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Ihr Ergebnis auf einen Blick</h2>
            <div className={`p-4 rounded-md text-center ${istLuecke ? 'bg-red-100' : 'bg-green-100'}`}>
                <p className="text-lg">{istLuecke ? 'Ihre monatliche Netto-Rentenlücke:' : 'Ihr monatlicher Netto-Überschuss:'}</p>
                <p className={`text-4xl font-bold ${istLuecke ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(luecke).toFixed(2)} €
                </p>
            </div>
            
            <div className="mt-4 flex justify-between items-end">
                <div>
                    <p className="text-sm text-gray-500">Ihr Netto-Bedarf</p>
                    <p className="text-xl font-semibold text-gray-700">{nettoBedarf.toFixed(2)} €</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Ihr Netto-Einkommen</p>
                    <p className="text-xl font-semibold text-gray-700">{ergebnis.nettoEinkommenMonatlich.toFixed(2)} €</p>
                </div>
            </div>

            <button onClick={() => setDetailsAnzeigen(!detailsAnzeigen)} className="mt-6 text-blue-600 hover:underline font-semibold">
                {detailsAnzeigen ? '[-] Details ausblenden' : '[+] Details & Lösungswege anzeigen'}
            </button>

            {detailsAnzeigen && (
                <div className="mt-6 border-t pt-6 space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg">Analyse Ihrer Finanzen</h4>
                        <p>Jährliche Steuerlast: {ergebnis.steuerlastJaehrlich.toFixed(2)} €</p>
                        <p>Jährliche SV-Beiträge: {ergebnis.svLastJaehrlich.toFixed(2)} €</p>
                    </div>
                    {istLuecke ? (
                        <div>
                            <h4 className="font-semibold text-lg">Lösungsweg: Kapitalbedarf</h4>
                            <p>Um die Lücke von {luecke.toFixed(2)} € zu schließen, benötigen Sie bei einer angenommenen Netto-Rendite von 2% p.a. ein Kapital von ca. <span className="font-bold">{((luecke * 12) / 0.02).toFixed(2)} €</span>.</p>
                        </div>
                    ) : (
                         <div>
                            <h4 className="font-semibold text-lg">Potenzial Ihres Überschusses</h4>
                            <p>Ihr Überschuss von {Math.abs(luecke).toFixed(2)} € pro Monat kann über 20 Jahre bei 3% Rendite zu einem zusätzlichen Vermögen von ca. <span className="font-bold">{((Math.abs(luecke) * 12) * ((Math.pow(1.03, 20) - 1) / 0.03)).toFixed(2)} €</span> anwachsen.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


// --- Haupt-App (unverändert) ---
function App() {
    const [ergebnis, setErgebnis] = useState<CalculationResult | null>(null);
    const [nettoBedarf, setNettoBedarf] = useState(2500);

    const handleBerechnung = (data: UserInput) => {
        const result = berechneNettoRente(data);
        setErgebnis(result);
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Rentenlücken-Rechner</h1>
                    <p className="text-lg text-gray-600 mt-2">Ermitteln Sie präzise Ihre finanzielle Situation im Ruhestand.</p>
                </header>
                <main>
                    <div className="p-6 bg-gray-50 rounded-lg shadow-md mb-8">
                        <label className="block text-lg font-semibold text-gray-800 mb-2">Ihr monatlicher Netto-Bedarf im Ruhestand:
                            <input 
                                type="number" 
                                value={nettoBedarf} 
                                onChange={e => setNettoBedarf(Number(e.target.value))} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            />
                        </label>
                    </div>
                    <EingabeFormular onCalculate={handleBerechnung} />
                    <ErgebnisDashboard ergebnis={ergebnis} nettoBedarf={nettoBedarf} />
                </main>
                 <footer className="text-center mt-12 text-sm text-gray-500">
                    <p>Dieses Tool dient nur zu Demonstrationszwecken. Alle Berechnungen ohne Gewähr.</p>
                    <p>Entwickelt in Kooperation mit einer KI.</p>
                </footer>
            </div>
        </div>
    );
}

export default App;

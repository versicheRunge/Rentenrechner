// src/rechenkern.ts

import { config2025, UserInput, CalculationResult } from './config';

// Eine realistischere, aber immer noch vereinfachte Steuerberechnungsfunktion
const berechneSteuer = (zde: number, istVerheiratet: boolean): number => {
    const grundfreibetrag = istVerheiratet ? config2025.grundfreibetragVerheiratet : config2025.grundfreibetragSingle;
    const steuerpflichtigesEinkommen = Math.max(0, zde);
    
    if (steuerpflichtigesEinkommen <= grundfreibetrag) return 0;

    // Vereinfachter progressiver Tarif für Demo-Zwecke
    const zuVersteuern = steuerpflichtigesEinkommen - grundfreibetrag;
    if (zuVersteuern <= 15000) return zuVersteuern * 0.15;
    if (zuVersteuern <= 60000) return (15000 * 0.15) + (zuVersteuern - 15000) * 0.28;
    return (15000 * 0.15) + (45000 * 0.28) + (zuVersteuern - 60000) * 0.42;
};

export const berechneNettoRente = (input: UserInput): CalculationResult => {
    let zuVersteuerndesEinkommen = 0;
    let svPflichtigesEinkommenGkv = 0;
    let sonderausgaben = 0;
    let bruttoGesamt = 0;

    // 1. Einkünfte aggregieren
    input.einkuenfte.forEach(einkunft => {
        const jahresbetrag = einkunft.betrag * 12;
        bruttoGesamt += jahresbetrag;
        let steuerpflichtigerAnteil = 0;

        switch (einkunft.art) {
            case 'GRV':
                steuerpflichtigerAnteil = jahresbetrag * config2025.rentenbesteuerungsanteil(input.renteneintrittsjahr);
                if (input.istInGKV) svPflichtigesEinkommenGkv += jahresbetrag;
                break;
            case 'bAV':
            case 'Ruerup':
                steuerpflichtigerAnteil = jahresbetrag;
                if (input.istInGKV && einkunft.art === 'bAV') {
                    const freibetragJaehrlich = config2025.bavKvFreibetrag_pm * 12;
                    svPflichtigesEinkommenGkv += Math.max(0, jahresbetrag - freibetragJaehrlich);
                }
                break;
            case 'Miete':
            case 'Kapital':
            case 'Privat':
                steuerpflichtigerAnteil = jahresbetrag;
                break;
        }
        zuVersteuerndesEinkommen += steuerpflichtigerAnteil;
    });

    // Werbungskostenpauschale & Sonderausgabenpauschale
    zuVersteuerndesEinkommen -= config2025.werbungskostenpauschaleRente;
    const sonderausgabenPauschale = input.istVerheiratet ? config2025.sonderausgabenPauschbetragVerheiratet : config2025.sonderausgabenPauschbetragSingle;

    // 2. SV-Beiträge berechnen
    let svLastJaehrlich = 0;
    if (input.istInGKV) {
        const kvBeitragssatz = config2025.kvBeitragssatzAllgemein + config2025.kvZusatzbeitragDurchschnitt;
        const pvBeitragssatz = input.hatKinder ? config2025.pvBeitragssatzMitKind : config2025.pvBeitragssatzOhneKind;
        const beitragspflichtigesEinkommen = Math.min(svPflichtigesEinkommenGkv, config2025.bbgKvPv_pa);
        
        const kvBeitrag = beitragspflichtigesEinkommen * kvBeitragssatz;
        const pvBeitrag = beitragspflichtigesEinkommen * pvBeitragssatz;
        svLastJaehrlich = kvBeitrag + pvBeitrag;
        sonderausgaben += svLastJaehrlich;
    }

    // 3. Finale Steuerberechnung
    const zde = zuVersteuerndesEinkommen - sonderausgaben - sonderausgabenPauschale;
    const steuerlastJaehrlich = berechneSteuer(zde, input.istVerheiratet);

    // 4. Nettoeinkommen berechnen
    const nettoEinkommenJaehrlich = bruttoGesamt - steuerlastJaehrlich - svLastJaehrlich;

    return {
        nettoEinkommenMonatlich: nettoEinkommenJaehrlich / 12,
        steuerlastJaehrlich,
        svLastJaehrlich,
        detailAufschluesselung: { bruttoGesamt, nettoProEinkunft: [] }, // Detaillogik hier einfügen
    };
};

// src/config.ts

export const config2025 = {
    // Einkommensteuer
    grundfreibetragSingle: 11784,
    grundfreibetragVerheiratet: 23568,
    // Vereinfachte Tarifzonen für die Demo-Berechnung
    tarifzonen: [
        { bis: 11784, satz: 0 },
        { bis: 17005, satz: 0.14, linear: true }, // Eingangssteuersatz 14%
        { bis: 66760, satz: 0.24, linear: true }, // Lineare Progression bis 42%
        { bis: 277825, satz: 0.42, linear: false }, // Spitzensteuersatz 42%
        { bis: Infinity, satz: 0.45, linear: false }, // Reichensteuer 45%
    ],
    sonderausgabenPauschbetragSingle: 36,
    sonderausgabenPauschbetragVerheiratet: 72,
    werbungskostenpauschaleRente: 102,

    // Sozialversicherung
    kvBeitragssatzAllgemein: 0.146,
    kvZusatzbeitragDurchschnitt: 0.017,
    pvBeitragssatzMitKind: 0.034,
    pvBeitragssatzOhneKind: 0.040,
    bbgKvPv_pa: 62100, // Beitragsbemessungsgrenze KV/PV pro Jahr
    bavKvFreibetrag_pm: 187.25,

    // Rente
    rentenbesteuerungsanteil: (eintrittsjahr: number): number => {
        if (eintrittsjahr <= 2005) return 0.50;
        if (eintrittsjahr >= 2058) return 1.0; // Anpassung nach Wachstumschancengesetz
        // Ab 2023 Anstieg um 0,5%-Punkte pro Jahr
        if (eintrittsjahr >= 2023) {
            return 0.825 + (eintrittsjahr - 2022) * 0.005;
        }
        // Bis 2022 Anstieg um 1%-Punkt pro Jahr
        return 0.50 + (eintrittsjahr - 2005) * 0.01;
    },
};

// Typ-Definitionen für das gesamte Projekt
export interface Einkunft {
    id: string;
    art: 'GRV' | 'bAV' | 'Ruerup' | 'Privat' | 'Miete' | 'Kapital';
    betrag: number;
}

export interface UserInput {
    renteneintrittsjahr: number;
    istVerheiratet: boolean;
    hatKinder: boolean;
    istInGKV: boolean;
    einkuenfte: Einkunft[];
    kapitalauszahlung: { betrag: number; jahr: number } | null;
}

export interface CalculationResult {
    nettoEinkommenMonatlich: number;
    steuerlastJaehrlich: number;
    svLastJaehrlich: number;
    detailAufschluesselung: {
        bruttoGesamt: number;
        nettoProEinkunft: { art: string; netto: number }[];
    };
    sondersituationKapitalauszahlung?: {
        jahr: number;
        steuerlastAufAuszahlung: number;
        nettoNachAuszahlung: number;
    };
}

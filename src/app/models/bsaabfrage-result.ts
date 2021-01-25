import { BSAAbfrageProdukt } from "./bsaabfrage-produkt";

export interface BSAAbfrageResult {
    //addresse: DSLRechercheAdresse;
    produkt: BSAAbfrageProdukt;
    availabilityChecked: boolean;
}

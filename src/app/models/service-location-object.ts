import { ServiceLocationSource } from "./service-location-source.enum";

/**
 * Das muss deutlioch ausgefeilter werden.
 * Standorte sollten aus unserer Standortdatenbank kommen. somit ist eine Referenzierung moeglich.
 * Adresse ist nicht immer vorhanden, kann/sollte ueber eigenes Objekt definiert werden
 *
 */
export interface ServiceLocationObject {
  source: ServiceLocationSource;
  sourceId: string;
  name: string;
  geoLat: number;
  geoLon: number;
  addrStreet: string;
  addrHouseNo: string;
  addrHouseNoZusatz: string;
  addrZipcode: string;
  addrCity: string;
  addrState: string;
  addrCountry: string;
}

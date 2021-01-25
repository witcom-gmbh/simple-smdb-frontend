import { ServiceAccessSource } from "./service-access-source.enum";

export interface ServiceAccessObject {
  source: ServiceAccessSource;
  sourceId: string;
  serviceAccessSubType: string;
  name: string;
  description: string;
  link: string;
}

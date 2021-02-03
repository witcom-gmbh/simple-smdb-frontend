import { ServiceAccessSource } from "./service-access-source.enum";
import { ServiceAccessStatus } from "./service-access-status.enum";

export interface ServiceAccessObject {
  source: ServiceAccessSource;
  status: ServiceAccessStatus;
  sourceId: string;
  serviceAccessSubType: string;
  name: string;
  description: string;
  link: string;
}

export interface GeocodeAdressDetail {
    city:string;
    readonly town:string;  
    readonly country:string;
    readonly country_code:string;    
    readonly house_number:string;    
    readonly neighbourhood:string;        
    readonly postcode:string;            
    readonly road:string;        
    readonly state:string;            
    readonly state_district:string;                
    readonly suburb:string;                
    readonly village:string;                    
    readonly hamlet:string;                        
    
}

export interface GeocodeResponse {
  readonly class: string;    
  readonly place_id: string;
  readonly licence: string;
  readonly osm_type: string;
  readonly osm_id: string;
  readonly boundingbox: string[];
  readonly lat: string;
  readonly lon: string;
  readonly display_name: string;
  readonly place_rank: string;
  readonly category: string;
  readonly type: string;
  readonly importance: number;
  address?:GeocodeAdressDetail;
}
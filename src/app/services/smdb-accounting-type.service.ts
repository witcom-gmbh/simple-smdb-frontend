import { Injectable } from '@angular/core';
import { AccountingTypeV1Service } from '../api/services';
import { AccountingTypeDto } from '../api/models';

@Injectable({
  providedIn: 'root'
})
export class SmdbAccountingTypeService {

  //todo - load by apian refresh regularly
  static_list:Array<AccountingTypeDto>=[
    {
        "_type": "AccountingTypeDto",
        "id": 10059327,
        "version": 0,
        "name": "einmalig",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "einmalig"
            },
            "defaultText": "einmalig"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "ONE_TIME",
        "accrualTimePeriod": null,
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Stück"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10059328,
        "version": 0,
        "name": "jaehrlich",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "jährlich"
            },
            "defaultText": "jährlich"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "YEAR"
        },
        "baseQuantity": null
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10059329,
        "version": 0,
        "name": "acctTypeMonthlyPerUser",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "monatlich (pro Benutzer)"
            },
            "defaultText": "monatlich (pro Benutzer)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Benutzer"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10059330,
        "version": 0,
        "name": "acctTypeMonthlyPerPackage",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "monatlich (pro Paket)"
            },
            "defaultText": "monatlich (pro Paket)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Paket"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10059331,
        "version": 0,
        "name": "acctTypeMonthlyGeneric",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "monatlich"
            },
            "defaultText": "monatlich"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Einheit"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10059332,
        "version": 0,
        "name": "monatlich__je_Stueck_",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "monatlich (je Stück)"
            },
            "defaultText": "monatlich (je Stück)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Stück"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10059333,
        "version": 0,
        "name": "monatlich__12M_",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "monatlich (12M)"
            },
            "defaultText": "monatlich (12M)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Einheit"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10059335,
        "version": 0,
        "name": "monatlich__24M_",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "monatlich (24M)"
            },
            "defaultText": "monatlich (24M)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Einheit"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10059334,
        "version": 0,
        "name": "monatliche",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "monatliche"
            },
            "defaultText": "monatliche"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": null
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10059336,
        "version": 0,
        "name": "monatlich__36M_",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "monatlich (36M)"
            },
            "defaultText": "monatlich (36M)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Einheit"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10059337,
        "version": 0,
        "name": "Monatlich__GB_",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "monatlich (GB/GHz)"
            },
            "defaultText": "monatlich (GB/GHz)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "GB/GHz"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10227910,
        "version": 0,
        "name": "einmalig_12M",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "einmalig (12M)"
            },
            "defaultText": "einmalig (12M)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "ONE_TIME",
        "accrualTimePeriod": null,
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Stück"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10227912,
        "version": 0,
        "name": "einmalig_24M",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "einmalig (24M)"
            },
            "defaultText": "einmalig (24M)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "ONE_TIME",
        "accrualTimePeriod": null,
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Stück"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10227914,
        "version": 0,
        "name": "einmalig_36M",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "einmalig (36M)"
            },
            "defaultText": "einmalig (36M)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "ONE_TIME",
        "accrualTimePeriod": null,
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Stück"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10262953,
        "version": 0,
        "name": "einmalig__60M",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "einmalig (60M)"
            },
            "defaultText": "einmalig (60M)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "ONE_TIME",
        "accrualTimePeriod": null,
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Stück"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10262955,
        "version": 0,
        "name": "monatlich__60M",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "monatlich (60M)"
            },
            "defaultText": "monatlich (60M)"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Einheit"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10687104,
        "version": 1,
        "name": "acctTypeRecurringGeneric",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "Wiederkehrend/Anschließend"
            },
            "defaultText": "Wiederkehrend/Anschließend"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "Generisch wiederkehrender Betrag, z.b.fuer Domains.\nDie tatsächliche Abrechnungsperiode/Berechnung erfolgt über das Billing-System"
            },
            "defaultText": "Generisch wiederkehrender Betrag, z.b.fuer Domains.\nDie tatsächliche Abrechnungsperiode/Berechnung erfolgt über das Billing-System"
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "YEAR"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Einheit"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10690808,
        "version": 0,
        "name": "changeOneTime",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "Change einmalig"
            },
            "defaultText": "Change einmalig"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "ONE_TIME",
        "accrualTimePeriod": null,
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Einheit"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10812110,
        "version": 1,
        "name": "acctTypeUBGBMonth",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "Nutzung GB RAM/Monat"
            },
            "defaultText": "Nutzung GB RAM/Monat"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "1 GB"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10812114,
        "version": 1,
        "name": "acctTypeUBGHZMonth",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "Nutzung GHz CPU/Monat"
            },
            "defaultText": "Nutzung GHz CPU/Monat"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "GHz"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10815972,
        "version": 0,
        "name": "acctTypeUBGBStorageMonth",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "Nutzung GB Storage/Monat"
            },
            "defaultText": "Nutzung GB Storage/Monat"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "100 GB"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10816919,
        "version": 0,
        "name": "acctTypeIPMonthly",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "IP-Adressen/Monat"
            },
            "defaultText": "IP-Adressen/Monat"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "IP-Adresse"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10687766,
        "version": 2,
        "name": "acctTypeInitial",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "Initial"
            },
            "defaultText": "Initial"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "Erstmalig, initial, Einrichtung, etc."
            },
            "defaultText": "Erstmalig, initial, Einrichtung, etc."
        },
        "accrualFrequency": "ONE_TIME",
        "accrualTimePeriod": null,
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Einheit"
        }
    },
    {
        "_type": "AccountingTypeDto",
        "id": 10871693,
        "version": 0,
        "name": "acctTypeQoSMonthly",
        "displayName": {
            "_type": "MultiLingualStringDto",
            "map": {
                "de_DE": "Nutzung QoS/Monat"
            },
            "defaultText": "Nutzung QoS/Monat"
        },
        "description": {
            "_type": "MultiLingualStringDto",
            "map": {},
            "defaultText": null
        },
        "accrualFrequency": "RECURRING",
        "accrualTimePeriod": {
            "_type": "TimePeriodDto",
            "length": 1,
            "unit": "MONTH"
        },
        "baseQuantity": {
            "_type": "BaseQuantityDto",
            "amount": 1,
            "unit": "Einheit"
        }
    }
];

  constructor(
    private accountingTypeSvc:AccountingTypeV1Service
  ) { }

  getAccountingTypeByName(name:string):AccountingTypeDto{

    return this.static_list.find(t => t.name===name);

  }
}

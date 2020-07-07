export const SmdbConfig:any = {
	"transitions": [{
			"fromState": "IN_WORK",
			"toState": "OFFERED",
			"transition": "toOffered",
			"predecessors": []
		},
		{
			"fromState": "OFFERED",
			"toState": "CLEAN_ORDER",
			"transition": "toCleanOrder",
			"predecessors": ["toOffered"]
		},
		{
			"fromState": "CLEAN_ORDER",
			"toState": "READY_FOR_MANUFACTURING",
			"transition": "toReadyForManufacturing",
			"predecessors": ["toOffered", "toCleanOrder"]
		},
		{
			"fromState": "TEST",
			"toState": "OFFERED",
			"transition": "toOffered",
			"predecessors": []
		}
	],
	"accountingTypeMapping": [{
			"serviceTerms": "lz12M",
			"accountingTypes": [{
					"name": "einmalig_12M"
				},
				{
					"name": "monatlich__12M_"
				}
			]

		},
		{
			"serviceTerms": "lz24M",
			"accountingTypes": [{
					"name": "einmalig_24M"
				},
				{
					"name": "monatlich__24M_"
				}
			]

		},
		{
			"serviceTerms": "lz36M",
			"accountingTypes": [{
					"name": "einmalig_36M"
				},
				{
					"name": "monatlich__36M_"
				}
			]

		},
		{
			"serviceTerms": "lz60M",
			"accountingTypes": [{
					"name": "einmalig__60M"
				},
				{
					"name": "monatlich__60M"
				}
			]

		},
		{
			"serviceTerms": "FIXED",
			"accountingTypes": [{
					"name": "einmalig"
				},
				{
					"name": "acctTypeMonthlyGeneric"
				}
			]

		}
	],
	"serviceItemStateMapping": [{
			"state": "INWORK",
			"mappings": {
				"contactsRequiredProperty": "contactsRequiredOfferedState"
			}
		},
		{
			"state": "OFFERED",
			"mappings": {
				"contactsRequiredProperty": "contactsRequiredCleanOrderState"
			}
		}
	]
}

export const hazardousPropertyCodes = [
  {
    code: 'HP_1',
    shortDesc: 'Explosive',
    longDesc:
      'Waste that can cause dangerous chemical reactions, producing gas that can damage surroundings (e.g., pyrotechnic or self-reactive waste).'
  },
  {
    code: 'HP_2',
    shortDesc: 'Oxidizing',
    longDesc:
      'Waste that can provide oxygen, causing or contributing to the combustion of other materials.'
  },
  {
    code: 'HP_3',
    shortDesc: 'Flammable',
    longDesc:
      'Waste that is easily ignited, including liquids with a flashpoint below 60°C, flammable gases, or solid waste that ignites through friction.'
  },
  {
    code: 'HP_4',
    shortDesc: 'Irritant',
    longDesc:
      'Waste that can cause skin irritation or damage to the eyes upon contact.'
  },
  {
    code: 'HP_5',
    shortDesc: 'Specific Target Organ Toxicity/Aspiration Toxicity',
    longDesc:
      'Waste that can harm specific organs through repeated exposure or cause toxic effects when inhaled or absorbed.'
  },
  {
    code: 'HP_6',
    shortDesc: 'Acute Toxicity',
    longDesc:
      'Waste that can cause severe health effects when ingested, inhaled, or through skin contact.'
  },
  {
    code: 'HP_7',
    shortDesc: 'Carcinogenic',
    longDesc: 'Waste that can cause cancer or increase the risk of cancer.'
  },
  {
    code: 'HP_8',
    shortDesc: 'Corrosive',
    longDesc: 'Waste that can cause severe skin corrosion upon contact.'
  },
  {
    code: 'HP_9',
    shortDesc: 'Infectious',
    longDesc:
      'Waste containing microorganisms or toxins that can cause disease in humans or animals.'
  },
  {
    code: 'HP_10',
    shortDesc: 'Toxic for Reproduction',
    longDesc:
      'Waste that can negatively affect reproductive health or harm offspring development.'
  },
  {
    code: 'HP_11',
    shortDesc: 'Mutagenic',
    longDesc:
      'Waste that can cause permanent changes in genetic material (mutations).'
  },
  {
    code: 'HP_12',
    shortDesc: 'Produces toxic gases in contact with water, air or acid',
    longDesc:
      'Waste that releases toxic gases when in contact with water or acids.'
  },
  {
    code: 'HP_13',
    shortDesc: 'Sensitising',
    longDesc:
      'Waste that contains substances that can cause allergic reactions, affecting the skin or respiratory system.'
  },
  {
    code: 'HP_14',
    shortDesc: 'Ecotoxic',
    longDesc:
      'Waste that poses risks to the environment, potentially affecting ecosystems.'
  },
  {
    code: 'HP_15',
    shortDesc:
      '(capable of exhibiting a hazardous property HP 1 - HP 14, not directly displayed by the original waste)',
    longDesc:
      'Waste that could show any of the hazardous properties HP 1 - HP 14, even if not originally present.'
  },
  {
    code: 'HP_POP',
    shortDesc:
      '(contains regulated persistent POPs at concentrations exceeding the legal limits)',
    longDesc:
      'Waste that contains regulated persistent organic pollutants (POPs) at concentrations exceeding the legal limits set out in Annex IV of the POPs Regulation, and is therefore classified as hazardous.'
  }
]

export const validHazCodes = hazardousPropertyCodes.map(({ code }) => code)

/**
 * European Waste Catalogue (EWC) codes
 * This file contains a list of valid EWC codes for validation purposes.
 *
 * The codes are stored without spaces, but the validation will accept codes
 * with or without spaces (e.g., both "010101" and "01 01 01" are valid).
 *
 * This is the complete list of EWC codes from the List of Wastes (England) Regulations 2005
 * https://www.legislation.gov.uk/uksi/2005/895/schedule/1/made
 */

export const validEwcCodes = [
  // Chapter 01: Wastes resulting from exploration, mining, quarrying, and physical and chemical treatment of minerals
  '010101', // wastes from mineral excavation
  '010102', // wastes from mineral non-metalliferous excavation
  '010304', // acid-generating tailings from processing of sulphide ore
  '010305', // other tailings containing hazardous substances
  '010306', // tailings other than those mentioned in 01 03 04 and 01 03 05
  '010307', // other wastes containing hazardous substances from physical and chemical processing of metalliferous minerals
  '010308', // dusty and powdery wastes other than those mentioned in 01 03 07
  '010309', // red mud from alumina production other than the wastes mentioned in 01 03 10
  '010310', // red mud from alumina production containing hazardous substances other than the wastes mentioned in 01 03 07
  '010399', // wastes not otherwise specified
  '010407', // wastes containing dangerous substances from physical and chemical processing of non-metalliferous minerals
  '010408', // waste gravel and crushed rocks other than those mentioned in 01 04 07
  '010409', // waste sand and clays
  '010410', // dusty and powdery wastes other than those mentioned in 01 04 07
  '010411', // wastes from potash and rock salt processing other than those mentioned in 01 04 07
  '010412', // tailings and other wastes from washing and cleaning of minerals other than those mentioned in 01 04 07 and 01 04 11
  '010413', // wastes from stone cutting and sawing other than those mentioned in 01 04 07
  '010499', // wastes not otherwise specified
  '010504', // freshwater drilling muds and wastes
  '010505', // oil-containing drilling muds and wastes
  '010506', // drilling muds and other drilling wastes containing dangerous substances
  '010507', // barite-containing drilling muds and wastes other than those mentioned in 01 05 05 and 01 05 06
  '010508', // chloride-containing drilling muds and wastes other than those mentioned in 01 05 05 and 01 05 06
  '010599', // wastes not otherwise specified

  // Chapter 02: Wastes from agriculture, horticulture, aquaculture, forestry, hunting and fishing, food preparation and processing
  '020101', // sludges from washing and cleaning
  '020102', // animal-tissue waste
  '020103', // plant-tissue waste
  '020104', // waste plastics (except packaging)
  '020106', // animal faeces, urine and manure (including spoiled straw), effluent, collected separately and treated off-site
  '020107', // wastes from forestry
  '020108', // agrochemical waste containing hazardous substances
  '020109', // agrochemical waste other than those mentioned in 02 01 08
  '020110', // waste metal
  '020199', // wastes not otherwise specified
  '020201', // sludges from washing and cleaning
  '020202', // animal-tissue waste
  '020203', // materials unsuitable for consumption or processing
  '020204', // sludges from on-site effluent treatment
  '020299', // wastes not otherwise specified
  '020301', // sludges from washing, cleaning, peeling, centrifuging and separation
  '020302', // wastes from preserving agents
  '020303', // wastes from solvent extraction
  '020304', // materials unsuitable for consumption or processing
  '020305', // sludges from on-site effluent treatment
  '020399', // wastes not otherwise specified
  '020401', // soil from cleaning and washing beet
  '020402', // off-specification calcium carbonate
  '020403', // sludges from on-site effluent treatment
  '020499', // wastes not otherwise specified
  '020501', // materials unsuitable for consumption or processing
  '020502', // sludges from on-site effluent treatment
  '020599', // wastes not otherwise specified
  '020601', // materials unsuitable for consumption or processing
  '020602', // wastes from preserving agents
  '020603', // sludges from on-site effluent treatment
  '020699', // wastes not otherwise specified
  '020701', // wastes from washing, cleaning and mechanical reduction of raw materials
  '020702', // wastes from spirits distillation
  '020703', // wastes from chemical treatment
  '020704', // materials unsuitable for consumption or processing
  '020705', // sludges from on-site effluent treatment
  '020799', // wastes not otherwise specified

  // Chapter 03: Wastes from wood processing and the production of panels and furniture, pulp, paper and cardboard
  '030101', // waste bark and cork
  '030104', // sawdust, shavings, cuttings, wood, particle board and veneer containing hazardous substances
  '030105', // sawdust, shavings, cuttings, wood, particle board and veneer other than those mentioned in 03 01 04
  '030199', // wastes not otherwise specified
  '030201', // non-halogenated organic wood preservatives
  '030202', // organochlorinated wood preservatives
  '030203', // organometallic wood preservatives
  '030204', // inorganic wood preservatives
  '030205', // other wood preservatives containing hazardous substances
  '030299', // wood preservatives not otherwise specified
  '030301', // waste bark and wood
  '030302', // green liquor sludge (from recovery of cooking liquor)
  '030305', // de-inking sludges from paper recycling
  '030307', // mechanically separated rejects from pulping of waste paper and cardboard
  '030308', // wastes from sorting of paper and cardboard destined for recycling
  '030309', // lime mud waste
  '030310', // fibre rejects, fibre-, filler- and coating-sludges from mechanical separation
  '030311', // sludges from on-site effluent treatment other than those mentioned in 03 03 10
  '030399', // wastes not otherwise specified

  // Chapter 04: Wastes from the leather, fur and textile industries
  '040101', // fleshings and lime split wastes
  '040102', // liming waste
  '040103', // degreasing wastes containing solvents without a liquid phase
  '040104', // tanning liquor containing chromium
  '040105', // tanning liquor free of chromium
  '040106', // sludges, in particular from on-site effluent treatment containing chromium
  '040107', // sludges, in particular from on-site effluent treatment free of chromium
  '040108', // waste tanned leather (blue sheetings, shavings, cuttings, buffing dust) containing chromium
  '040109', // wastes from dressing and finishing
  '040199', // wastes not otherwise specified
  '040209', // wastes from composite materials (impregnated textile, elastomer, plastomer)
  '040210', // organic matter from natural products (for example grease, wax)
  '040214', // wastes from finishing containing organic solvents
  '040215', // wastes from finishing other than those mentioned in 04 02 14
  '040216', // dyestuffs and pigments containing hazardous substances
  '040217', // dyestuffs and pigments other than those mentioned in 04 02 16
  '040219', // sludges from on-site effluent treatment containing hazardous substances
  '040220', // sludges from on-site effluent treatment other than those mentioned in 04 02 19
  '040221', // wastes from unprocessed textile fibres
  '040222', // wastes from processed textile fibres
  '040299', // wastes not otherwise specified

  // Chapter 05: Wastes from petroleum refining, natural gas purification and pyrolytic treatment of coal
  '050102', // desalter sludges
  '050103', // tank bottom sludges
  '050104', // acid alkyl sludges
  '050105', // oil spills
  '050106', // oily sludges from maintenance operations of the plant or equipment
  '050107', // acid tars
  '050108', // other tars
  '050109', // sludges from on-site effluent treatment containing hazardous substances
  '050110', // sludges from on-site effluent treatment other than those mentioned in 05 01 09
  '050111', // wastes from cleaning of fuels with bases
  '050112', // oil containing acids
  '050113', // boiler feedwater sludges
  '050114', // wastes from cooling columns
  '050115', // spent filter clays
  '050116', // sulphur-containing wastes from petroleum desulphurisation
  '050117', // bitumen
  '050199', // wastes not otherwise specified
  '050601', // acid tars
  '050603', // other tars
  '050604', // waste from cooling columns
  '050699', // wastes not otherwise specified
  '050701', // wastes containing mercury
  '050702', // wastes containing sulphur
  '050799', // wastes not otherwise specified

  // Chapter 06: Wastes from inorganic chemical processes
  '060101', // sulphuric acid and sulphurous acid
  '060102', // hydrochloric acid
  '060103', // hydrofluoric acid
  '060104', // phosphoric and phosphorous acid
  '060105', // nitric acid and nitrous acid
  '060106', // other acids
  '060199', // wastes not otherwise specified
  '060201', // calcium hydroxide
  '060203', // ammonium hydroxide
  '060204', // sodium and potassium hydroxide
  '060205', // other bases
  '060299', // wastes not otherwise specified
  '060311', // solid salts and solutions containing cyanides
  '060313', // solid salts and solutions containing heavy metals
  '060314', // solid salts and solutions other than those mentioned in 06 03 11 and 06 03 13
  '060315', // metallic oxides containing heavy metals
  '060316', // metallic oxides other than those mentioned in 06 03 15
  '060399', // wastes not otherwise specified
  '060403', // wastes containing arsenic
  '060404', // wastes containing mercury
  '060405', // wastes containing other heavy metals
  '060499', // wastes not otherwise specified
  '060502', // sludges from on-site effluent treatment containing hazardous substances
  '060503', // sludges from on-site effluent treatment other than those mentioned in 06 05 02
  '060602', // wastes containing hazardous sulphides
  '060603', // wastes containing sulphides other than those mentioned in 06 06 02
  '060699', // wastes not otherwise specified
  '060701', // wastes containing asbestos from electrolysis
  '060702', // activated carbon from chlorine production
  '060703', // barium sulphate sludge containing mercury
  '060704', // solutions and acids, for example contact acid
  '060799', // wastes not otherwise specified
  '060802', // wastes containing hazardous chlorosilanes
  '060899', // wastes not otherwise specified
  '060902', // phosphorous slag
  '060903', // calcium-based reaction wastes containing or contaminated with hazardous substances
  '060904', // calcium-based reaction wastes other than those mentioned in 06 09 03
  '060999', // wastes not otherwise specified
  '061002', // wastes containing hazardous substances
  '061099', // wastes not otherwise specified
  '061101', // calcium-based reaction wastes from titanium dioxide production
  '061199', // wastes not otherwise specified
  '061301', // inorganic plant protection products, wood-preserving agents and other biocides
  '061302', // spent activated carbon (except 06 07 02)
  '061303', // carbon black
  '061304', // wastes from asbestos processing
  '061305', // soot
  '061399', // wastes not otherwise specified

  // Chapter 07: Wastes from organic chemical processes
  '070101', // aqueous washing liquids and mother liquors
  '070103', // organic halogenated solvents, washing liquids and mother liquors
  '070104', // other organic solvents, washing liquids and mother liquors
  '070107', // halogenated still bottoms and reaction residues
  '070108', // other still bottoms and reaction residues
  '070109', // halogenated filter cakes and spent absorbents
  '070110', // other filter cakes and spent absorbents
  '070111', // sludges from on-site effluent treatment containing hazardous substances
  '070112', // sludges from on-site effluent treatment other than those mentioned in 07 01 11
  '070199', // wastes not otherwise specified
  '070201', // aqueous washing liquids and mother liquors
  '070203', // organic halogenated solvents, washing liquids and mother liquors
  '070204', // other organic solvents, washing liquids and mother liquors
  '070207', // halogenated still bottoms and reaction residues
  '070208', // other still bottoms and reaction residues
  '070209', // halogenated filter cakes and spent absorbents
  '070210', // other filter cakes and spent absorbents
  '070211', // sludges from on-site effluent treatment containing hazardous substances
  '070212', // sludges from on-site effluent treatment other than those mentioned in 07 02 11
  '070213', // waste plastic
  '070214', // wastes from additives containing hazardous substances
  '070215', // wastes from additives other than those mentioned in 07 02 14
  '070216', // wastes containing hazardous silicones
  '070217', // waste containing silicones other than those mentioned in 07 02 16
  '070299', // wastes not otherwise specified
  '070301', // aqueous washing liquids and mother liquors
  '070303', // organic halogenated solvents, washing liquids and mother liquors
  '070304', // other organic solvents, washing liquids and mother liquors
  '070307', // halogenated still bottoms and reaction residues
  '070308', // other still bottoms and reaction residues
  '070309', // halogenated filter cakes and spent absorbents
  '070310', // other filter cakes and spent absorbents
  '070311', // sludges from on-site effluent treatment containing hazardous substances
  '070312', // sludges from on-site effluent treatment other than those mentioned in 07 03 11
  '070399', // wastes not otherwise specified
  '070401', // aqueous washing liquids and mother liquors
  '070403', // organic halogenated solvents, washing liquids and mother liquors
  '070404', // other organic solvents, washing liquids and mother liquors
  '070407', // halogenated still bottoms and reaction residues
  '070408', // other still bottoms and reaction residues
  '070409', // halogenated filter cakes and spent absorbents
  '070410', // other filter cakes and spent absorbents
  '070411', // sludges from on-site effluent treatment containing hazardous substances
  '070412', // sludges from on-site effluent treatment other than those mentioned in 07 04 11
  '070413', // solid wastes containing hazardous substances
  '070499', // wastes not otherwise specified
  '070501', // aqueous washing liquids and mother liquors
  '070503', // organic halogenated solvents, washing liquids and mother liquors
  '070504', // other organic solvents, washing liquids and mother liquors
  '070507', // halogenated still bottoms and reaction residues
  '070508', // other still bottoms and reaction residues
  '070509', // halogenated filter cakes and spent absorbents
  '070510', // other filter cakes and spent absorbents
  '070511', // sludges from on-site effluent treatment containing hazardous substances
  '070512', // sludges from on-site effluent treatment other than those mentioned in 07 05 11
  '070513', // solid wastes containing hazardous substances
  '070514', // solid wastes other than those mentioned in 07 05 13
  '070599', // wastes not otherwise specified
  '070601', // aqueous washing liquids and mother liquors
  '070603', // organic halogenated solvents, washing liquids and mother liquors
  '070604', // other organic solvents, washing liquids and mother liquors
  '070607', // halogenated still bottoms and reaction residues
  '070608', // other still bottoms and reaction residues
  '070609', // halogenated filter cakes and spent absorbents
  '070610', // other filter cakes and spent absorbents
  '070611', // sludges from on-site effluent treatment containing hazardous substances
  '070612', // sludges from on-site effluent treatment other than those mentioned in 07 06 11
  '070699', // wastes not otherwise specified
  '070701', // aqueous washing liquids and mother liquors
  '070703', // organic halogenated solvents, washing liquids and mother liquors
  '070704', // other organic solvents, washing liquids and mother liquors
  '070707', // halogenated still bottoms and reaction residues
  '070708', // other still bottoms and reaction residues
  '070709', // halogenated filter cakes and spent absorbents
  '070710', // other filter cakes and spent absorbents
  '070711', // sludges from on-site effluent treatment containing hazardous substances
  '070712', // sludges from on-site effluent treatment other than those mentioned in 07 07 11
  '070799', // wastes not otherwise specified

  // Chapter 08: Wastes from the manufacture, formulation, supply and use of coatings, adhesives, sealants and printing inks
  '080111', // waste paint and varnish containing organic solvents or other hazardous substances
  '080112', // waste paint and varnish other than those mentioned in 08 01 11
  '080113', // sludges from paint or varnish containing organic solvents or other hazardous substances
  '080114', // sludges from paint or varnish other than those mentioned in 08 01 13
  '080115', // aqueous sludges containing paint or varnish containing organic solvents or other hazardous substances
  '080116', // aqueous sludges containing paint or varnish other than those mentioned in 08 01 15
  '080117', // wastes from paint or varnish removal containing organic solvents or other hazardous substances
  '080118', // wastes from paint or varnish removal other than those mentioned in 08 01 17
  '080119', // aqueous suspensions containing paint or varnish containing organic solvents or other hazardous substances
  '080120', // aqueous suspensions containing paint or varnish other than those mentioned in 08 01 19
  '080121', // waste paint or varnish remover
  '080199', // wastes not otherwise specified
  '080201', // waste coating powders
  '080202', // aqueous sludges containing ceramic materials
  '080203', // aqueous suspensions containing ceramic materials
  '080299', // wastes not otherwise specified
  '080307', // aqueous sludges containing ink
  '080308', // aqueous liquid waste containing ink
  '080312', // waste ink containing hazardous substances
  '080313', // waste ink other than those mentioned in 08 03 12
  '080314', // ink sludges containing hazardous substances
  '080315', // ink sludges other than those mentioned in 08 03 14
  '080316', // waste etching solutions
  '080317', // waste printing toner containing hazardous substances
  '080318', // waste printing toner other than those mentioned in 08 03 17
  '080319', // disperse oil
  '080399', // wastes not otherwise specified
  '080409', // waste adhesives and sealants containing organic solvents or other hazardous substances
  '080410', // waste adhesives and sealants other than those mentioned in 08 04 09
  '080411', // adhesive and sealant sludges containing organic solvents or other hazardous substances
  '080412', // adhesive and sealant sludges other than those mentioned in 08 04 11
  '080413', // aqueous sludges containing adhesives or sealants containing organic solvents or other hazardous substances
  '080414', // aqueous sludges containing adhesives or sealants other than those mentioned in 08 04 13
  '080415', // aqueous liquid waste containing adhesives or sealants containing organic solvents or other hazardous substances
  '080416', // aqueous liquid waste containing adhesives or sealants other than those mentioned in 08 04 15
  '080417', // rosin oil
  '080499', // wastes not otherwise specified
  '080501', // waste isocyanates

  // Chapter 09: Wastes from the photographic industry
  '090101', // water-based developer and activator solutions
  '090102', // water-based offset plate developer solutions
  '090103', // solvent-based developer solutions
  '090104', // fixer solutions
  '090105', // bleach solutions and bleach fixer solutions
  '090106', // wastes containing silver from on-site treatment of photographic wastes
  '090107', // photographic film and paper containing silver or silver compounds
  '090108', // photographic film and paper free of silver or silver compounds
  '090110', // single-use cameras without batteries
  '090111', // single-use cameras containing batteries included in 16 06 01, 16 06 02 or 16 06 03
  '090112', // single-use cameras containing batteries other than those mentioned in 09 01 11
  '090113', // aqueous liquid waste from on-site reclamation of silver other than those mentioned in 09 01 06
  '090199', // wastes not otherwise specified

  // Chapter 10: Wastes from thermal processes
  '100101', // bottom ash, slag and boiler dust (excluding boiler dust mentioned in 10 01 04)
  '100102', // coal fly ash
  '100103', // fly ash from peat and untreated wood
  '100104', // oil fly ash and boiler dust
  '100105', // calcium-based reaction wastes from flue-gas desulphurisation in solid form
  '100107', // calcium-based reaction wastes from flue-gas desulphurisation in sludge form
  '100109', // sulphuric acid
  '100113', // fly ash from emulsified hydrocarbons used as fuel
  '100114', // bottom ash, slag and boiler dust from co-incineration containing hazardous substances
  '100115', // bottom ash, slag and boiler dust from co-incineration other than those mentioned in 10 01 14
  '100116', // fly ash from co-incineration containing hazardous substances
  '100117', // fly ash from co-incineration other than those mentioned in 10 01 16
  '100118', // wastes from gas cleaning containing hazardous substances
  '100119', // wastes from gas cleaning other than those mentioned in 10 01 05, 10 01 07 and 10 01 18
  '100120', // sludges from on-site effluent treatment containing hazardous substances
  '100121', // sludges from on-site effluent treatment other than those mentioned in 10 01 20
  '100122', // aqueous sludges from boiler cleansing containing hazardous substances
  '100123', // aqueous sludges from boiler cleansing other than those mentioned in 10 01 22
  '100124', // sands from fluidised beds
  '100125', // wastes from fuel storage and preparation of coal-fired power plants
  '100126', // wastes from cooling-water treatment
  '100199', // wastes not otherwise specified
  '100201', // wastes from the processing of slag
  '100202', // unprocessed slag
  '100207', // solid wastes from gas treatment containing hazardous substances
  '100208', // solid wastes from gas treatment other than those mentioned in 10 02 07
  '100210', // mill scales
  '100211', // wastes from cooling-water treatment containing oil
  '100212', // wastes from cooling-water treatment other than those mentioned in 10 02 11
  '100213', // sludges and filter cakes from gas treatment containing hazardous substances
  '100214', // sludges and filter cakes from gas treatment other than those mentioned in 10 02 13
  '100215', // other sludges and filter cakes
  '100299', // wastes not otherwise specified
  '100302', // anode scraps
  '100304', // primary production slags
  '100305', // waste alumina
  '100308', // salt slags from secondary production
  '100309', // black drosses from secondary production
  '100315', // skimmings that are flammable or emit, upon contact with water, flammable gases in hazardous quantities
  '100316', // skimmings other than those mentioned in 10 03 15
  '100317', // tar-containing wastes from anode manufacture
  '100318', // carbon-containing wastes from anode manufacture other than those mentioned in 10 03 17
  '100319', // flue-gas dust containing hazardous substances
  '100320', // flue-gas dust other than those mentioned in 10 03 19
  '100321', // other particulates and dust (including ball-mill dust) containing hazardous substances
  '100322', // other particulates and dust (including ball-mill dust) other than those mentioned in 10 03 21
  '100323', // solid wastes from gas treatment containing hazardous substances
  '100324', // solid wastes from gas treatment other than those mentioned in 10 03 23
  '100325', // sludges and filter cakes from gas treatment containing hazardous substances
  '100326', // sludges and filter cakes from gas treatment other than those mentioned in 10 03 25
  '100327', // wastes from cooling-water treatment containing oil
  '100328', // wastes from cooling-water treatment other than those mentioned in 10 03 27
  '100329', // wastes from treatment of salt slags and black drosses containing hazardous substances
  '100330', // wastes from treatment of salt slags and black drosses other than those mentioned in 10 03 29
  '100399', // wastes not otherwise specified
  '100401', // slags from primary and secondary production
  '100402', // dross and skimmings from primary and secondary production
  '100403', // calcium arsenate
  '100404', // flue-gas dust
  '100405', // other particulates and dust
  '100406', // solid wastes from gas treatment
  '100407', // sludges and filter cakes from gas treatment
  '100409', // wastes from cooling-water treatment containing oil
  '100410', // wastes from cooling-water treatment other than those mentioned in 10 04 09
  '100499', // wastes not otherwise specified
  '100501', // slags from primary and secondary production
  '100503', // flue-gas dust
  '100504', // other particulates and dust
  '100505', // solid waste from gas treatment
  '100506', // sludges and filter cakes from gas treatment
  '100508', // wastes from cooling-water treatment containing oil
  '100509', // wastes from cooling-water treatment other than those mentioned in 10 05 08
  '100510', // dross and skimmings that are flammable or emit, upon contact with water, flammable gases in hazardous quantities
  '100511', // dross and skimmings other than those mentioned in 10 05 10
  '100599', // wastes not otherwise specified
  '100601', // slags from primary and secondary production
  '100602', // dross and skimmings from primary and secondary production
  '100603', // flue-gas dust
  '100604', // other particulates and dust
  '100606', // solid wastes from gas treatment
  '100607', // sludges and filter cakes from gas treatment
  '100609', // wastes from cooling-water treatment containing oil
  '100610', // wastes from cooling-water treatment other than those mentioned in 10 06 09
  '100699', // wastes not otherwise specified
  '100701', // slags from primary and secondary production
  '100702', // dross and skimmings from primary and secondary production
  '100703', // solid wastes from gas treatment
  '100704', // other particulates and dust
  '100705', // sludges and filter cakes from gas treatment
  '100707', // wastes from cooling-water treatment containing oil
  '100708', // wastes from cooling-water treatment other than those mentioned in 10 07 07
  '100799', // wastes not otherwise specified
  '100808', // salt slag from primary and secondary production
  '100809', // other slags
  '100810', // dross and skimmings that are flammable or emit, upon contact with water, flammable gases in hazardous quantities
  '100811', // dross and skimmings other than those mentioned in 10 08 10
  '100812', // tar-containing wastes from anode manufacture
  '100813', // carbon-containing wastes from anode manufacture other than those mentioned in 10 08 12
  '100814', // anode scrap
  '100815', // flue-gas dust containing hazardous substances
  '100816', // flue-gas dust other than those mentioned in 10 08 15
  '100817', // sludges and filter cakes from flue-gas treatment containing hazardous substances
  '100818', // sludges and filter cakes from flue-gas treatment other than those mentioned in 10 08 17
  '100819', // wastes from cooling-water treatment containing oil
  '100820', // wastes from cooling-water treatment other than those mentioned in 10 08 19
  '100899', // wastes not otherwise specified
  '100903', // furnace slag
  '100905', // casting cores and moulds which have not undergone pouring containing hazardous substances
  '100906', // casting cores and moulds which have not undergone pouring other than those mentioned in 10 09 05
  '100907', // casting cores and moulds which have undergone pouring containing hazardous substances
  '100908', // casting cores and moulds which have undergone pouring other than those mentioned in 10 09 07
  '100909', // flue-gas dust containing hazardous substances
  '100910', // flue-gas dust other than those mentioned in 10 09 09
  '100911', // other particulates containing hazardous substances
  '100912', // other particulates other than those mentioned in 10 09 11
  '100913', // waste binders containing hazardous substances
  '100914', // waste binders other than those mentioned in 10 09 13
  '100915', // waste crack-indicating agent containing hazardous substances
  '100916', // waste crack-indicating agent other than those mentioned in 10 09 15
  '100999', // wastes not otherwise specified
  '101003', // furnace slag
  '101005', // casting cores and moulds which have not undergone pouring containing hazardous substances
  '101006', // casting cores and moulds which have not undergone pouring other than those mentioned in 10 10 05
  '101007', // casting cores and moulds which have undergone pouring containing hazardous substances
  '101008', // casting cores and moulds which have undergone pouring other than those mentioned in 10 10 07
  '101009', // flue-gas dust containing hazardous substances
  '101010', // flue-gas dust other than those mentioned in 10 10 09
  '101011', // other particulates containing hazardous substances
  '101012', // other particulates other than those mentioned in 10 10 11
  '101013', // waste binders containing hazardous substances
  '101014', // waste binders other than those mentioned in 10 10 13
  '101015', // waste crack-indicating agent containing hazardous substances
  '101016', // waste crack-indicating agent other than those mentioned in 10 10 15
  '101099', // wastes not otherwise specified
  '101103', // waste glass-based fibrous materials
  '101105', // particulates and dust
  '101109', // waste preparation mixture before thermal processing containing hazardous substances
  '101110', // waste preparation mixture before thermal processing other than those mentioned in 10 11 09
  '101111', // waste glass in small particles and glass powder containing heavy metals (for example from cathode ray tubes)
  '101112', // waste glass other than those mentioned in 10 11 11
  '101113', // glass-polishing and -grinding sludge containing hazardous substances
  '101114', // glass-polishing and -grinding sludge other than those mentioned in 10 11 13
  '101115', // solid wastes from flue-gas treatment containing hazardous substances
  '101116', // solid wastes from flue-gas treatment other than those mentioned in 10 11 15
  '101117', // sludges and filter cakes from flue-gas treatment containing hazardous substances
  '101118', // sludges and filter cakes from flue-gas treatment other than those mentioned in 10 11 17
  '101119', // solid wastes from on-site effluent treatment containing hazardous substances
  '101120', // solid wastes from on-site effluent treatment other than those mentioned in 10 11 19
  '101199', // wastes not otherwise specified
  '101201', // waste preparation mixture before thermal processing
  '101203', // particulates and dust
  '101205', // sludges and filter cakes from gas treatment
  '101206', // discarded moulds
  '101208', // waste ceramics, bricks, tiles and construction products (after thermal processing)
  '101209', // solid wastes from gas treatment containing hazardous substances
  '101210', // solid wastes from gas treatment other than those mentioned in 10 12 09
  '101211', // wastes from glazing containing heavy metals
  '101212', // wastes from glazing other than those mentioned in 10 12 11
  '101213', // sludge from on-site effluent treatment
  '101299', // wastes not otherwise specified
  '101301', // waste preparation mixture before thermal processing
  '101304', // wastes from calcination and hydration of lime
  '101306', // particulates and dust (except 10 13 12 and 10 13 13)
  '101307', // sludges and filter cakes from gas treatment
  '101309', // wastes from asbestos-cement manufacture containing asbestos
  '101310', // wastes from asbestos-cement manufacture other than those mentioned in 10 13 09
  '101311', // wastes from cement-based composite materials other than those mentioned in 10 13 09 and 10 13 10
  '101312', // solid wastes from gas treatment containing hazardous substances
  '101313', // solid wastes from gas treatment other than those mentioned in 10 13 12
  '101314', // waste concrete and concrete sludge
  '101399', // wastes not otherwise specified
  '101401', // waste from gas cleaning containing mercury

  // Chapter 11: Wastes from chemical surface treatment and coating of metals and other materials; non-ferrous hydro-metallurgy
  '110105', // pickling acids
  '110106', // acids not otherwise specified
  '110107', // pickling bases
  '110108', // phosphatising sludges
  '110109', // sludges and filter cakes containing hazardous substances
  '110110', // sludges and filter cakes other than those mentioned in 11 01 09
  '110111', // aqueous rinsing liquids containing hazardous substances
  '110112', // aqueous rinsing liquids other than those mentioned in 11 01 11
  '110113', // degreasing wastes containing hazardous substances
  '110114', // degreasing wastes other than those mentioned in 11 01 13
  '110115', // eluate and sludges from membrane systems or ion exchange systems containing hazardous substances
  '110116', // saturated or spent ion exchange resins
  '110198', // other wastes containing hazardous substances
  '110199', // wastes not otherwise specified
  '110202', // sludges from zinc hydrometallurgy (including jarosite, goethite)
  '110203', // wastes from the production of anodes for aqueous electrolytical processes
  '110205', // wastes from copper hydrometallurgical processes containing hazardous substances
  '110206', // wastes from copper hydrometallurgical processes other than those mentioned in 11 02 05
  '110207', // other wastes containing hazardous substances
  '110299', // wastes not otherwise specified
  '110301', // wastes containing cyanide
  '110302', // other wastes
  '110501', // hard zinc
  '110502', // zinc ash
  '110503', // solid wastes from gas treatment
  '110504', // spent flux
  '110599', // wastes not otherwise specified

  // Chapter 12: Wastes from shaping and physical and mechanical surface treatment of metals and plastics
  '120101', // ferrous metal filings and turnings
  '120102', // ferrous metal dust and particles
  '120103', // non-ferrous metal filings and turnings
  '120104', // non-ferrous metal dust and particles
  '120105', // plastics shavings and turnings
  '120106', // mineral-based machining oils containing halogens (except emulsions and solutions)
  '120107', // mineral-based machining oils free of halogens (except emulsions and solutions)
  '120108', // machining emulsions and solutions containing halogens
  '120109', // machining emulsions and solutions free of halogens
  '120110', // synthetic machining oils
  '120112', // spent waxes and fats
  '120113', // welding wastes
  '120114', // machining sludges containing hazardous substances
  '120115', // machining sludges other than those mentioned in 12 01 14
  '120116', // waste blasting material containing hazardous substances
  '120117', // waste blasting material other than those mentioned in 12 01 16
  '120118', // metal sludge (grinding, honing and lapping sludge) containing oil
  '120119', // readily biodegradable machining oil
  '120120', // spent grinding bodies and grinding materials containing hazardous substances
  '120121', // spent grinding bodies and grinding materials other than those mentioned in 12 01 20
  '120199', // wastes not otherwise specified
  '120301', // aqueous washing liquids
  '120302', // steam degreasing wastes

  // Chapter 13: Oil wastes and wastes of liquid fuels (except edible oils, and those in chapters 05, 12 and 19)
  '130101', // hydraulic oils, containing PCBs
  '130104', // chlorinated emulsions
  '130105', // non-chlorinated emulsions
  '130109', // mineral-based chlorinated hydraulic oils
  '130110', // mineral based non-chlorinated hydraulic oils
  '130111', // synthetic hydraulic oils
  '130112', // readily biodegradable hydraulic oils
  '130113', // other hydraulic oils
  '130204', // mineral-based chlorinated engine, gear and lubricating oils
  '130205', // mineral-based non-chlorinated engine, gear and lubricating oils
  '130206', // synthetic engine, gear and lubricating oils
  '130207', // readily biodegradable engine, gear and lubricating oils
  '130208', // other engine, gear and lubricating oils
  '130301', // insulating or heat transmission oils containing PCBs
  '130306', // mineral-based chlorinated insulating and heat transmission oils other than those mentioned in 13 03 01
  '130307', // mineral-based non-chlorinated insulating and heat transmission oils
  '130308', // synthetic insulating and heat transmission oils
  '130309', // readily biodegradable insulating and heat transmission oils
  '130310', // other insulating and heat transmission oils
  '130401', // bilge oils from inland navigation
  '130402', // bilge oils from jetty sewers
  '130403', // bilge oils from other navigation
  '130501', // solids from grit chambers and oil/water separators
  '130502', // sludges from oil/water separators
  '130503', // interceptor sludges
  '130506', // oil from oil/water separators
  '130507', // oily water from oil/water separators
  '130508', // mixtures of wastes from grit chambers and oil/water separators
  '130701', // fuel oil and diesel
  '130702', // petrol
  '130703', // other fuels (including mixtures)
  '130801', // desalter sludges or emulsions
  '130802', // other emulsions
  '130899', // wastes not otherwise specified

  // Chapter 14: Waste organic solvents, refrigerants and propellants (except 07 and 08)
  '140601', // chlorofluorocarbons, HCFC, HFC
  '140602', // other halogenated solvents and solvent mixtures
  '140603', // other solvents and solvent mixtures
  '140604', // sludges or solid wastes containing halogenated solvents
  '140605', // sludges or solid wastes containing other solvents

  // Chapter 15: Waste packaging, absorbents, wiping cloths, filter materials and protective clothing not otherwise specified
  '150101', // paper and cardboard packaging
  '150102', // plastic packaging
  '150103', // wooden packaging
  '150104', // metallic packaging
  '150105', // composite packaging
  '150106', // mixed packaging
  '150107', // glass packaging
  '150109', // textile packaging
  '150110', // packaging containing residues of or contaminated by hazardous substances
  '150111', // metallic packaging containing a hazardous solid porous matrix (for example asbestos), including empty pressure containers
  '150202', // absorbents, filter materials (including oil filters not otherwise specified), wiping cloths, protective clothing contaminated by hazardous substances
  '150203', // absorbents, filter materials, wiping cloths and protective clothing other than those mentioned in 15 02 02

  // Chapter 16: Wastes not otherwise specified in the list
  '160103', // end-of-life tyres
  '160104', // end-of-life vehicles
  '160106', // end-of-life vehicles, containing neither liquids nor other hazardous components
  '160107', // oil filters
  '160108', // components containing mercury
  '160109', // components containing PCBs
  '160110', // explosive components (for example air bags)
  '160111', // brake pads containing asbestos
  '160112', // brake pads other than those mentioned in 16 01 11
  '160113', // brake fluids
  '160114', // antifreeze fluids containing hazardous substances
  '160115', // antifreeze fluids other than those mentioned in 16 01 14
  '160116', // tanks for liquefied gas
  '160117', // ferrous metal
  '160118', // non-ferrous metal
  '160119', // plastic
  '160120', // glass
  '160121', // hazardous components other than those mentioned in 16 01 07 to 16 01 11 and 16 01 13 and 16 01 14
  '160122', // components not otherwise specified
  '160199', // wastes not otherwise specified
  '160209', // transformers and capacitors containing PCBs
  '160210', // discarded equipment containing or contaminated by PCBs other than those mentioned in 16 02 09
  '160211', // discarded equipment containing chlorofluorocarbons, HCFC, HFC
  '160212', // discarded equipment containing free asbestos
  '160213', // discarded equipment containing hazardous components other than those mentioned in 16 02 09 to 16 02 12
  '160214', // discarded equipment other than those mentioned in 16 02 09 to 16 02 13
  '160215', // hazardous components removed from discarded equipment
  '160216', // components removed from discarded equipment other than those mentioned in 16 02 15
  '160303', // inorganic wastes containing hazardous substances
  '160304', // inorganic wastes other than those mentioned in 16 03 03
  '160305', // organic wastes containing hazardous substances
  '160306', // organic wastes other than those mentioned in 16 03 05
  '160307', // metallic mercury
  '160401', // waste ammunition
  '160402', // fireworks wastes
  '160403', // other waste explosives
  '160504', // gases in pressure containers (including halons) containing hazardous substances
  '160505', // gases in pressure containers other than those mentioned in 16 05 04
  '160506', // laboratory chemicals, consisting of or containing hazardous substances, including mixtures of laboratory chemicals
  '160507', // discarded inorganic chemicals consisting of or containing hazardous substances
  '160508', // discarded organic chemicals consisting of or containing hazardous substances
  '160509', // discarded chemicals other than those mentioned in 16 05 06, 16 05 07 or 16 05 08
  '160601', // lead batteries
  '160602', // Ni-Cd batteries
  '160603', // mercury-containing batteries
  '160604', // alkaline batteries (except 16 06 03)
  '160605', // other batteries and accumulators
  '160606', // separately collected electrolyte from batteries and accumulators
  '160708', // wastes containing oil
  '160709', // wastes containing other hazardous substances
  '160799', // wastes not otherwise specified
  '160801', // spent catalysts containing gold, silver, rhenium, rhodium, palladium, iridium or platinum (except 16 08 07)
  '160802', // spent catalysts containing hazardous transition metals or hazardous transition metal compounds
  '160803', // spent catalysts containing transition metals or transition metal compounds not otherwise specified
  '160804', // spent fluid catalytic cracking catalysts (except 16 08 07)
  '160805', // spent catalysts containing phosphoric acid
  '160806', // spent liquids used as catalysts
  '160807', // spent catalysts contaminated with hazardous substances
  '160901', // permanganates, for example potassium permanganate
  '160902', // chromates, for example potassium chromate, potassium or sodium dichromate
  '160903', // peroxides, for example hydrogen peroxide
  '160904', // oxidising substances, not otherwise specified
  '161001', // aqueous liquid wastes containing hazardous substances
  '161002', // aqueous liquid wastes other than those mentioned in 16 10 01
  '161003', // aqueous concentrates containing hazardous substances
  '161004', // aqueous concentrates other than those mentioned in 16 10 03
  '161101', // carbon-based linings and refractories from metallurgical processes containing hazardous substances
  '161102', // carbon-based linings and refractories from metallurgical processes others than those mentioned in 16 11 01
  '161103', // other linings and refractories from metallurgical processes containing hazardous substances
  '161104', // other linings and refractories from metallurgical processes other than those mentioned in 16 11 03
  '161105', // linings and refractories from non-metallurgical processes containing hazardous substances
  '161106', // linings and refractories from non-metallurgical processes others than those mentioned in 16 11 05

  // Chapter 17: Construction and demolition wastes (including excavated soil from contaminated sites)
  '170101', // concrete
  '170102', // bricks
  '170103', // tiles and ceramics
  '170106', // mixtures of, or separate fractions of concrete, bricks, tiles and ceramics containing hazardous substances
  '170107', // mixtures of concrete, bricks, tiles and ceramics other than those mentioned in 17 01 06
  '170201', // wood
  '170202', // glass
  '170203', // plastic
  '170204', // glass, plastic and wood containing or contaminated with hazardous substances
  '170301', // bituminous mixtures containing coal tar
  '170302', // bituminous mixtures other than those mentioned in 17 03 01
  '170303', // coal tar and tarred products
  '170401', // copper, bronze, brass
  '170402', // aluminium
  '170403', // lead
  '170404', // zinc
  '170405', // iron and steel
  '170406', // tin
  '170407', // mixed metals
  '170409', // metal waste contaminated with hazardous substances
  '170410', // cables containing oil, coal tar and other hazardous substances
  '170411', // cables other than those mentioned in 17 04 10
  '170503', // soil and stones containing hazardous substances
  '170504', // soil and stones other than those mentioned in 17 05 03
  '170505', // dredging spoil containing hazardous substances
  '170506', // dredging spoil other than those mentioned in 17 05 05
  '170507', // track ballast containing hazardous substances
  '170508', // track ballast other than those mentioned in 17 05 07
  '170601', // insulation materials containing asbestos
  '170603', // other insulation materials consisting of or containing hazardous substances
  '170604', // insulation materials other than those mentioned in 17 06 01 and 17 06 03
  '170605', // construction materials containing asbestos
  '170801', // gypsum-based construction materials contaminated with hazardous substances
  '170802', // gypsum-based construction materials other than those mentioned in 17 08 01
  '170901', // construction and demolition wastes containing mercury
  '170902', // construction and demolition wastes containing PCB (for example PCB-containing sealants, PCB-containing resin-based floorings, PCB-containing sealed glazing units, PCB-containing capacitors)
  '170903', // other construction and demolition wastes (including mixed wastes) containing hazardous substances
  '170904', // mixed construction and demolition wastes other than those mentioned in 17 09 01, 17 09 02 and 17 09 03

  // Chapter 18: Wastes from human or animal health care and/or related research (except kitchen and restaurant wastes not arising from immediate health care)
  '180101', // sharps (except 18 01 03)
  '180102', // body parts and organs including blood bags and blood preserves (except 18 01 03)
  '180103', // wastes whose collection and disposal is subject to special requirements in order to prevent infection
  '180104', // wastes whose collection and disposal is not subject to special requirements in order to prevent infection (for example dressings, plaster casts, linen, disposable clothing, diapers)
  '180106', // chemicals consisting of or containing hazardous substances
  '180107', // chemicals other than those mentioned in 18 01 06
  '180108', // cytotoxic and cytostatic medicines
  '180109', // medicines other than those mentioned in 18 01 08
  '180110', // amalgam waste from dental care
  '180201', // sharps (except 18 02 02)
  '180202', // wastes whose collection and disposal is subject to special requirements in order to prevent infection
  '180203', // wastes whose collection and disposal is not subject to special requirements in order to prevent infection
  '180205', // chemicals consisting of or containing hazardous substances
  '180206', // chemicals other than those mentioned in 18 02 05
  '180207', // cytotoxic and cytostatic medicines
  '180208', // medicines other than those mentioned in 18 02 07

  // Chapter 19: Wastes from waste management facilities, off-site waste water treatment plants and the preparation of water intended for human consumption and water for industrial use
  '190102', // ferrous materials removed from bottom ash
  '190105', // filter cake from gas treatment
  '190106', // aqueous liquid wastes from gas treatment and other aqueous liquid wastes
  '190107', // solid wastes from gas treatment
  '190110', // spent activated carbon from flue-gas treatment
  '190111', // bottom ash and slag containing hazardous substances
  '190112', // bottom ash and slag other than those mentioned in 19 01 11
  '190113', // fly ash containing hazardous substances
  '190114', // fly ash other than those mentioned in 19 01 13
  '190115', // boiler dust containing hazardous substances
  '190116', // boiler dust other than those mentioned in 19 01 15
  '190117', // pyrolysis wastes containing hazardous substances
  '190118', // pyrolysis wastes other than those mentioned in 19 01 17
  '190119', // sands from fluidised beds
  '190199', // wastes not otherwise specified
  '190203', // premixed wastes composed only of non-hazardous wastes
  '190204', // premixed wastes composed of at least one hazardous waste
  '190205', // sludges from physico/chemical treatment containing hazardous substances
  '190206', // sludges from physico/chemical treatment other than those mentioned in 19 02 05
  '190207', // oil and concentrates from separation
  '190208', // liquid combustible wastes containing hazardous substances
  '190209', // solid combustible wastes containing hazardous substances
  '190210', // combustible wastes other than those mentioned in 19 02 08 and 19 02 09
  '190211', // other wastes containing hazardous substances
  '190299', // wastes not otherwise specified
  '190304', // wastes marked as hazardous, partly stabilised
  '190305', // stabilised wastes other than those mentioned in 19 03 04
  '190306', // wastes marked as hazardous, solidified
  '190307', // solidified wastes other than those mentioned in 19 03 06
  '190401', // vitrified waste
  '190402', // fly ash and other flue-gas treatment wastes
  '190403', // non-vitrified solid phase
  '190404', // aqueous liquid wastes from vitrified waste tempering
  '190501', // non-composted fraction of municipal and similar wastes
  '190502', // non-composted fraction of animal and vegetable waste
  '190503', // off-specification compost
  '190599', // wastes not otherwise specified
  '190603', // liquor from anaerobic treatment of municipal waste
  '190604', // digestate from anaerobic treatment of municipal waste
  '190605', // liquor from anaerobic treatment of animal and vegetable waste
  '190606', // digestate from anaerobic treatment of animal and vegetable waste
  '190699', // wastes not otherwise specified
  '190702', // landfill leachate containing hazardous substances
  '190703', // landfill leachate other than those mentioned in 19 07 02
  '190801', // screenings
  '190802', // waste from desanding
  '190805', // sludges from treatment of urban waste water
  '190806', // saturated or spent ion exchange resins
  '190807', // solutions and sludges from regeneration of ion exchangers
  '190808', // membrane system waste containing heavy metals
  '190809', // grease and oil mixture from oil/water separation containing only edible oil and fats
  '190810', // grease and oil mixture from oil/water separation other than those mentioned in 19 08 09
  '190811', // sludges containing hazardous substances from biological treatment of industrial waste water
  '190812', // sludges from biological treatment of industrial waste water other than those mentioned in 19 08 11
  '190813', // sludges containing hazardous substances from other treatment of industrial waste water
  '190814', // sludges from other treatment of industrial waste water other than those mentioned in 19 08 13
  '190899', // wastes not otherwise specified
  '190901', // solid waste from primary filtration and screenings
  '190902', // sludges from water clarification
  '190903', // sludges from decarbonation
  '190904', // spent activated carbon
  '190905', // saturated or spent ion exchange resins
  '190906', // solutions and sludges from regeneration of ion exchangers
  '190999', // wastes not otherwise specified
  '191001', // iron and steel waste
  '191002', // non-ferrous waste
  '191003', // fluff-light fraction and dust containing hazardous substances
  '191004', // fluff-light fraction and dust other than those mentioned in 19 10 03
  '191005', // other fractions containing hazardous substances
  '191006', // other fractions other than those mentioned in 19 10 05
  '191101', // spent filter clays
  '191102', // acid tars
  '191103', // aqueous liquid wastes
  '191104', // wastes from fuel cleaning with bases
  '191105', // sludges from on-site effluent treatment containing hazardous substances
  '191106', // sludges from on-site effluent treatment other than those mentioned in 19 11 05
  '191107', // wastes from flue-gas cleaning
  '191199', // wastes not otherwise specified
  '191201', // paper and cardboard
  '191202', // ferrous metal
  '191203', // non-ferrous metal
  '191204', // plastic and rubber
  '191205', // glass
  '191206', // wood containing hazardous substances
  '191207', // wood other than that mentioned in 19 12 06
  '191208', // textiles
  '191209', // minerals (for example sand, stones)
  '191210', // combustible waste (refuse derived fuel)
  '191211', // other wastes (including mixtures of materials) from mechanical treatment of waste containing hazardous substances
  '191212', // other wastes (including mixtures of materials) from mechanical treatment of wastes other than those mentioned in 19 12 11
  '191301', // solid wastes from soil remediation containing hazardous substances
  '191302', // solid wastes from soil remediation other than those mentioned in 19 13 01
  '191303', // sludges from soil remediation containing hazardous substances
  '191304', // sludges from soil remediation other than those mentioned in 19 13 03
  '191305', // sludges from groundwater remediation containing hazardous substances
  '191306', // sludges from groundwater remediation other than those mentioned in 19 13 05
  '191307', // aqueous liquid wastes and aqueous concentrates from groundwater remediation containing hazardous substances
  '191308', // aqueous liquid wastes and aqueous concentrates from groundwater remediation other than those mentioned in 19 13 07

  // Chapter 20: Municipal wastes (household waste and similar commercial, industrial and institutional wastes) including separately collected fractions
  '200101', // paper and cardboard
  '200102', // glass
  '200108', // biodegradable kitchen and canteen waste
  '200110', // clothes
  '200111', // textiles
  '200113', // solvents
  '200114', // acids
  '200115', // alkalines
  '200117', // photochemicals
  '200119', // pesticides
  '200121', // fluorescent tubes and other mercury-containing waste
  '200123', // discarded equipment containing chlorofluorocarbons
  '200125', // edible oil and fat
  '200126', // oil and fat other than those mentioned in 20 01 25
  '200127', // paint, inks, adhesives and resins containing hazardous substances
  '200128', // paint, inks, adhesives and resins other than those mentioned in 20 01 27
  '200129', // detergents containing hazardous substances
  '200130', // detergents other than those mentioned in 20 01 29
  '200131', // cytotoxic and cytostatic medicines
  '200132', // medicines other than those mentioned in 20 01 31
  '200133', // batteries and accumulators included in 16 06 01, 16 06 02 or 16 06 03 and unsorted batteries and accumulators containing these batteries
  '200134', // batteries and accumulators other than those mentioned in 20 01 33
  '200135', // discarded electrical and electronic equipment other than those mentioned in 20 01 21 and 20 01 23 containing hazardous components
  '200136', // discarded electrical and electronic equipment other than those mentioned in 20 01 21, 20 01 23 and 20 01 35
  '200137', // wood containing hazardous substances
  '200138', // wood other than that mentioned in 20 01 37
  '200139', // plastics
  '200140', // metals
  '200141', // wastes from chimney sweeping
  '200199', // other fractions not otherwise specified
  '200201', // biodegradable waste
  '200202', // soil and stones
  '200203', // other non-biodegradable wastes
  '200301', // mixed municipal waste
  '200302', // waste from markets
  '200303', // street-cleaning residues
  '200304', // septic tank sludge
  '200306', // waste from sewage cleaning
  '200307', // bulky waste
  '200399' // municipal wastes not otherwise specified
]

/**
 * Validates if the provided EWC code is in the list of valid codes
 * Accepts codes with or without spaces
 *
 * @param {string} code - The EWC code to validate
 * @returns {boolean} - True if the code is valid, false otherwise
 */
export const isValidEwcCode = (code) => {
  if (!code) return false

  // Remove spaces from the code
  const normalizedCode = code.replace(/\s/g, '')

  // Check if the normalized code is in the list of valid codes
  return validEwcCodes.includes(normalizedCode)
}

// Simple GEDCOM parser that converts GEDCOM to a more usable format

export interface Individual {
  id: string;
  name: string;
  givenName: string;
  surname: string;
  sex: 'M' | 'F' | 'U';
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  famc?: string; // Family ID where this individual is a child
  fams?: string[]; // Family IDs where this individual is a spouse/parent
}

export interface Family {
  id: string;
  husbandId?: string;
  wifeId?: string;
  children: string[];
  marriageDate?: string;
  marriagePlace?: string;
}

export interface GedcomData {
  individuals: { [key: string]: Individual };
  families: { [key: string]: Family };
}

export function parseGedcom(gedcomText: string): GedcomData {
  const lines = gedcomText.split(/\r?\n/);
  const result: GedcomData = {
    individuals: {},
    families: {}
  };

  let currentRecord: any = null;
  let currentId = '';
  let currentTag = '';

  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(@[^@]+@)?\s*([A-Za-z0-9_]+)/);
    if (!match) continue;

    const [_, level, id, tag] = match;
    const value = line.slice(match[0].length).trim();
    const levelNum = parseInt(level, 10);

    if (levelNum === 0 && id) {
      // New record
      currentId = id;
      currentRecord = null;

      if (tag === 'INDI') {
        currentRecord = {
          id: currentId,
          fams: []
        };
        result.individuals[currentId] = currentRecord;
      } else if (tag === 'FAM') {
        currentRecord = {
          id: currentId,
          children: []
        };
        result.families[currentId] = currentRecord;
      }
    } else if (currentRecord) {
      switch (levelNum) {
        case 1:
          currentTag = tag;
          switch (tag) {
            case 'NAME':
              const nameParts = value.split('/');
              currentRecord.givenName = nameParts[0].trim();
              currentRecord.surname = nameParts[1]?.trim() || '';
              currentRecord.name = `${currentRecord.givenName} ${currentRecord.surname}`.trim();
              break;
            case 'SEX':
              currentRecord.sex = value as 'M' | 'F' | 'U';
              break;
            case 'HUSB':
              if (currentRecord) (currentRecord as Family).husbandId = value;
              break;
            case 'WIFE':
              if (currentRecord) (currentRecord as Family).wifeId = value;
              break;
            case 'CHIL':
              if (currentRecord) (currentRecord as Family).children.push(value);
              break;
            case 'FAMC':
              if (currentRecord) (currentRecord as Individual).famc = value;
              break;
            case 'FAMS':
              if (currentRecord) (currentRecord as Individual).fams?.push(value);
              break;
          }
          break;
        case 2:
          if (currentTag === 'BIRT' && tag === 'DATE') {
            currentRecord.birthDate = value;
          } else if (currentTag === 'BIRT' && tag === 'PLAC') {
            currentRecord.birthPlace = value;
          } else if (currentTag === 'DEAT' && tag === 'DATE') {
            currentRecord.deathDate = value;
          } else if (currentTag === 'DEAT' && tag === 'PLAC') {
            currentRecord.deathPlace = value;
          } else if (currentTag === 'MARR' && tag === 'DATE') {
            currentRecord.marriageDate = value;
          } else if (currentTag === 'MARR' && tag === 'PLAC') {
            currentRecord.marriagePlace = value;
          }
          break;
      }
    }
  }

  return result;
}

export function findRootIndividual(gedcomData: GedcomData): Individual | null {
  // Find someone who is not a child in any family (likely the root)
  const allChildIds = new Set<string>();
  Object.values(gedcomData.families).forEach(family => {
    family.children.forEach(childId => allChildIds.add(childId));
  });

  const rootIndividual = Object.values(gedcomData.individuals).find(
    individual => !allChildIds.has(individual.id)
  );

  return rootIndividual || Object.values(gedcomData.individuals)[0] || null;
}

export function getFamilyTreeData(gedcomData: GedcomData, rootId: string, maxDepth = 5, currentDepth = 0): any {
  if (currentDepth > maxDepth) return null;

  const individual = gedcomData.individuals[rootId];
  if (!individual) return null;

  const result: any = {
    id: individual.id,
    name: individual.name,
    givenName: individual.givenName,
    surname: individual.surname,
    sex: individual.sex,
    birthDate: individual.birthDate,
    deathDate: individual.deathDate,
    partners: [],
    children: []
  };

  // Find families where this individual is a spouse
  const families = (individual.fams || []).map(famId => gedcomData.families[famId]).filter(Boolean);

  for (const family of families) {
    const spouseId = family.husbandId === rootId ? family.wifeId : family.husbandId;
    const spouse = spouseId ? gedcomData.individuals[spouseId] : null;

    if (spouse) {
      const partnerNode = {
        id: spouse.id,
        name: spouse.name,
        givenName: spouse.givenName,
        surname: spouse.surname,
        sex: spouse.sex,
        birthDate: spouse.birthDate,
        deathDate: spouse.deathDate,
        relation: 'spouse'
      };

      // Add children
      const children = family.children
        .map(childId => getFamilyTreeData(gedcomData, childId, maxDepth, currentDepth + 1))
        .filter(Boolean);

      result.partners.push(partnerNode);
      result.children.push(...children);
    }
  }

  return result;
}

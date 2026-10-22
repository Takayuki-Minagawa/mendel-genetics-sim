import type { Gene, AllelePair, Language } from '../types/genetics';
import { isHomozygous } from './genetics';
import { fmt, type TranslationKeys } from '../i18n/translations';

// One-line explanation of why a (normalized) genotype shows its phenotype
export function geneReason(gene: Gene, pair: AllelePair, t: TranslationKeys, lang: Language): string {
  const pheno = gene.phenotypes[gene.phenotypeMap[pair[0] + pair[1]]];
  const name = pheno?.name[lang] ?? '?';
  if (pheno?.lethal) return fmt(t.cross.reasonLethal, { g: pair.join('') });
  if (isHomozygous(pair)) return fmt(t.cross.reasonHomo, { g: pair.join(''), p: name });
  switch (gene.inheritance) {
    case 'incomplete':
      return fmt(t.cross.reasonIncomplete, { g: pair.join(''), p: name });
    case 'codominant':
      if (pair[1] !== 'O') return fmt(t.cross.reasonCodominant, { a: pair[0], b: pair[1], p: name });
      return fmt(t.cross.reasonDominant, { d: pair[0], r: pair[1], p: name });
    default:
      return fmt(t.cross.reasonDominant, { d: pair[0], r: pair[1], p: name });
  }
}

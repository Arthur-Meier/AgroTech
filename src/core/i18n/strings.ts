import { getLocales } from 'expo-localization';

type Dictionary = Record<string, string>;

const ptBR: Dictionary = {
  'app.animals': 'Animais',
  'app.newAnimal': 'Novo animal',
  'app.create': 'Criar',
  'app.save': 'Salvar',
  'app.edit': 'Editar',
  'app.cancel': 'Cancelar',
  'app.loading': 'Carregando...',
  'app.tryAgain': 'Tentar novamente',
  'app.export': 'Exportar CSV',
  'app.settings': 'Ajustes',
  'app.plan': 'Plano',
  'app.freePlan': 'Free',
  'app.proPlan': 'Pro',
  'app.openPaywall': 'Ver plano Pro',
  'app.consent': 'Consentimento',
  'app.privacyPolicy': 'Politica de privacidade',
  'app.accept': 'Aceitar',
  'app.revoke': 'Revogar',
  'animals.empty.title': 'Nenhum animal cadastrado',
  'animals.empty.body': 'Cadastre o primeiro animal para iniciar o controle.',
  'animals.error.load': 'Nao foi possivel carregar os animais.',
  'animals.list.title': 'Lista de animais',
  'animals.limitReached': 'Limite do plano Free atingido.',
  'animals.upgradeHint': 'Assine o Pro para cadastrar acima do limite.',
  'animals.createBlocked': 'Limite atingido. Atualize para o plano Pro.',
  'animals.exportBlocked': 'Exportacao CSV disponivel no plano Pro.',
  'animals.exportSuccess': 'CSV exportado com sucesso.',
  'animals.exportError': 'Falha ao exportar CSV.',
  'animalForm.tag.label': 'N do brinco',
  'animalForm.tag.placeholder': 'Identificacao do animal',
  'animalForm.type.label': 'Tipo',
  'animalForm.sex.label': 'Sexo',
  'animalForm.breed.label': 'Raca',
  'animalForm.origin.label': 'Origem',
  'animalForm.origin.option.birth': 'Nascimento',
  'animalForm.origin.option.purchase': 'Compra',
  'animalForm.origin.option.transfer': 'Transferencia',
  'animalForm.origin.help.birth': 'Para nascimento, pai e mae sao obrigatorios.',
  'animalForm.origin.help.external':
    'Para compra/transferencia, pai e mae podem ser digitados manualmente.',
  'animalForm.birthDate.label': 'Data de nascimento',
  'animalForm.birthDate.select': 'Selecionar data de nascimento',
  'animalForm.weight.label': 'Peso (kg)',
  'animalForm.sireTag.label': 'Brinco pai',
  'animalForm.damTag.label': 'Brinco mae',
  'animalForm.parent.placeholder': 'Selecione',
  'animalForm.parent.noMale': 'Nenhum macho cadastrado para selecionar.',
  'animalForm.parent.noFemale': 'Nenhuma femea cadastrada para selecionar.',
  'animalForm.notes.label': 'Observacoes',
  'animalForm.validation.tag': 'Informe a identificacao do animal (brinco).',
  'animalForm.validation.birthDate': 'Data de nascimento invalida. Use YYYY-MM-DD.',
  'animalForm.validation.weight': 'Peso deve ser numerico.',
  'animalForm.validation.parentsRequired':
    'Origem por nascimento exige pai e mae selecionados.',
  'animalForm.saved': 'Cadastro salvo com sucesso.',
  'paywall.title': 'Plano Pro',
  'paywall.subtitle': 'Desbloqueie recursos premium para acelerar a gestao.',
  'paywall.benefit.limit': 'Cadastro sem limite de animais',
  'paywall.benefit.export': 'Exportacao CSV e compartilhamento',
  'paywall.benefit.support': 'Prioridade para novos modulos',
  'paywall.cta': 'Ativar Pro (stub)',
  'paywall.close': 'Voltar',
  'settings.title': 'Ajustes',
  'settings.section.plan': 'Plano e limites',
  'settings.section.compliance': 'Privacidade e consentimento',
  'settings.section.data': 'Dados',
  'settings.freeLimits': 'Limite Free: ate {maxAnimals} animais.',
  'settings.currentEntitlement': 'Plano atual: {plan}',
  'consent.title': 'Consentimento LGPD',
  'consent.description':
    'Voce controla se analytics de uso pode ser coletado para melhorar o app.',
  'consent.analytics': 'Permitir analytics de uso',
  'consent.updatedAt': 'Atualizado em {date}',
  'consent.saved': 'Consentimento atualizado.',
  'consent.error': 'Nao foi possivel atualizar o consentimento.',
  'validation.title': 'Validacao',
};

const enUS: Dictionary = {
  'app.animals': 'Animals',
  'app.newAnimal': 'New animal',
  'app.settings': 'Settings',
};

const dictionaries: Record<string, Dictionary> = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

function resolveLocale(): string {
  const locale = getLocales()[0]?.languageTag ?? 'pt-BR';
  return dictionaries[locale] ? locale : 'pt-BR';
}

export type TranslationParams = Record<string, string | number>;

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, template);
}

export function t(key: string, params?: TranslationParams): string {
  const locale = resolveLocale();
  const dict = dictionaries[locale];
  const fallback = dictionaries['pt-BR'];
  const template = dict[key] ?? fallback[key] ?? key;
  return interpolate(template, params);
}

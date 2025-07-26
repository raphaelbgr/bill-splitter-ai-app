import { z } from 'zod';

// Supported languages and regions
export type SupportedLanguage = 'pt-BR' | 'es-ES' | 'en-US' | 'fr-FR';
export type SupportedRegion = 'BR' | 'ES' | 'US' | 'FR' | 'MX' | 'AR' | 'CO';

// Cultural context types
export interface CulturalContext {
  region: SupportedRegion;
  language: SupportedLanguage;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  paymentMethods: string[];
  culturalExpressions: Record<string, string>;
  socialDynamics: Record<string, string>;
  businessPractices: Record<string, string>;
}

// Translation interface
export interface Translation {
  [key: string]: string | Translation;
}

// Regional payment methods
export interface RegionalPaymentMethods {
  primary: string[];
  secondary: string[];
  cultural: string[];
  digital: string[];
}

// Internationalization configuration
export interface I18nConfig {
  defaultLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  fallbackLanguage: SupportedLanguage;
  loadPath: string;
  debug: boolean;
}

// Validation schemas
export const CulturalContextSchema = z.object({
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']),
  currency: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  numberFormat: z.string(),
  paymentMethods: z.array(z.string()),
  culturalExpressions: z.record(z.string()),
  socialDynamics: z.record(z.string()),
  businessPractices: z.record(z.string())
});

export const RegionalPaymentMethodsSchema = z.object({
  primary: z.array(z.string()),
  secondary: z.array(z.string()),
  cultural: z.array(z.string()),
  digital: z.array(z.string())
});

export class RachaAII18n {
  private translations: Map<SupportedLanguage, Translation> = new Map();
  private culturalContexts: Map<SupportedRegion, CulturalContext> = new Map();
  private regionalPaymentMethods: Map<SupportedRegion, RegionalPaymentMethods> = new Map();
  private currentLanguage: SupportedLanguage = 'pt-BR';
  private currentRegion: SupportedRegion = 'BR';
  private config: I18nConfig;

  constructor(config: I18nConfig) {
    this.config = config;
    this.initializeCulturalContexts();
    this.initializeRegionalPaymentMethods();
    this.loadTranslations();
  }

  // Initialize cultural contexts for different regions
  private initializeCulturalContexts(): void {
    // Brazilian context (primary)
    this.culturalContexts.set('BR', {
      region: 'BR',
      language: 'pt-BR',
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: 'pt-BR',
      paymentMethods: ['PIX', 'Cartão de Crédito', 'Dinheiro', 'Transferência'],
      culturalExpressions: {
        'expense_sharing': 'rachar a conta',
        'group_gathering': 'galera',
        'celebration': 'festa',
        'restaurant': 'restaurante',
        'happy_hour': 'happy hour',
        'birthday': 'aniversário',
        'travel': 'viagem',
        'collective_payment': 'vaquinha'
      },
      socialDynamics: {
        'who_invites_pays': 'quem convida paga',
        'equal_split': 'dividir igualzinho',
        'forgets_wallet': 'sempre esquece carteira',
        'prefers_cash': 'prefere dinheiro',
        'pix_preference': 'só tem PIX'
      },
      businessPractices: {
        'tipping': '10% gorjeta',
        'service_charge': 'taxa de serviço',
        'split_bills': 'dividir conta',
        'group_discounts': 'desconto para grupo'
      }
    });

    // Spanish context (Spain)
    this.culturalContexts.set('ES', {
      region: 'ES',
      language: 'es-ES',
      currency: 'EUR',
      timezone: 'Europe/Madrid',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: 'es-ES',
      paymentMethods: ['Tarjeta', 'Efectivo', 'Transferencia', 'Bizum'],
      culturalExpressions: {
        'expense_sharing': 'dividir la cuenta',
        'group_gathering': 'grupo',
        'celebration': 'fiesta',
        'restaurant': 'restaurante',
        'happy_hour': 'hora feliz',
        'birthday': 'cumpleaños',
        'travel': 'viaje',
        'collective_payment': 'bote'
      },
      socialDynamics: {
        'who_invites_pays': 'quien invita paga',
        'equal_split': 'dividir por igual',
        'forgets_wallet': 'siempre olvida la cartera',
        'prefers_cash': 'prefiere efectivo',
        'bizum_preference': 'solo tiene Bizum'
      },
      businessPractices: {
        'tipping': 'propina opcional',
        'service_charge': 'servicio incluido',
        'split_bills': 'dividir cuenta',
        'group_discounts': 'descuento grupo'
      }
    });

    // Mexican context
    this.culturalContexts.set('MX', {
      region: 'MX',
      language: 'es-ES',
      currency: 'MXN',
      timezone: 'America/Mexico_City',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: 'es-MX',
      paymentMethods: ['Tarjeta', 'Efectivo', 'Transferencia', 'OXXO'],
      culturalExpressions: {
        'expense_sharing': 'partir la cuenta',
        'group_gathering': 'grupo',
        'celebration': 'fiesta',
        'restaurant': 'restaurante',
        'happy_hour': 'happy hour',
        'birthday': 'cumpleaños',
        'travel': 'viaje',
        'collective_payment': 'cooperacha'
      },
      socialDynamics: {
        'who_invites_pays': 'quien invita paga',
        'equal_split': 'partir por igual',
        'forgets_wallet': 'siempre olvida la cartera',
        'prefers_cash': 'prefiere efectivo',
        'oxxo_preference': 'solo tiene OXXO'
      },
      businessPractices: {
        'tipping': '10% propina',
        'service_charge': 'servicio incluido',
        'split_bills': 'partir cuenta',
        'group_discounts': 'descuento grupo'
      }
    });

    // US context
    this.culturalContexts.set('US', {
      region: 'US',
      language: 'en-US',
      currency: 'USD',
      timezone: 'America/New_York',
      dateFormat: 'MM/dd/yyyy',
      numberFormat: 'en-US',
      paymentMethods: ['Credit Card', 'Cash', 'Venmo', 'PayPal', 'Apple Pay'],
      culturalExpressions: {
        'expense_sharing': 'split the bill',
        'group_gathering': 'group',
        'celebration': 'party',
        'restaurant': 'restaurant',
        'happy_hour': 'happy hour',
        'birthday': 'birthday',
        'travel': 'trip',
        'collective_payment': 'pool money'
      },
      socialDynamics: {
        'who_invites_pays': 'whoever invites pays',
        'equal_split': 'split equally',
        'forgets_wallet': 'always forgets wallet',
        'prefers_cash': 'prefers cash',
        'venmo_preference': 'only has Venmo'
      },
      businessPractices: {
        'tipping': '15-20% tip',
        'service_charge': 'service charge',
        'split_bills': 'split bill',
        'group_discounts': 'group discount'
      }
    });

    // French context
    this.culturalContexts.set('FR', {
      region: 'FR',
      language: 'fr-FR',
      currency: 'EUR',
      timezone: 'Europe/Paris',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: 'fr-FR',
      paymentMethods: ['Carte Bancaire', 'Espèces', 'Virement', 'Lydia'],
      culturalExpressions: {
        'expense_sharing': 'partager l\'addition',
        'group_gathering': 'groupe',
        'celebration': 'fête',
        'restaurant': 'restaurant',
        'happy_hour': 'happy hour',
        'birthday': 'anniversaire',
        'travel': 'voyage',
        'collective_payment': 'cagnotte'
      },
      socialDynamics: {
        'who_invites_pays': 'celui qui invite paie',
        'equal_split': 'partager équitablement',
        'forgets_wallet': 'oublie toujours le portefeuille',
        'prefers_cash': 'préfère les espèces',
        'lydia_preference': 'n\'a que Lydia'
      },
      businessPractices: {
        'tipping': 'pourboire optionnel',
        'service_charge': 'service compris',
        'split_bills': 'partager addition',
        'group_discounts': 'réduction groupe'
      }
    });
  }

  // Initialize regional payment methods
  private initializeRegionalPaymentMethods(): void {
    // Brazilian payment methods
    this.regionalPaymentMethods.set('BR', {
      primary: ['PIX', 'Cartão de Crédito', 'Dinheiro'],
      secondary: ['Transferência Bancária', 'Boleto', 'Cartão de Débito'],
      cultural: ['Vaquinha', 'Racha', 'Pagar depois'],
      digital: ['PIX', 'PicPay', 'Mercado Pago', 'PagSeguro']
    });

    // Spanish payment methods
    this.regionalPaymentMethods.set('ES', {
      primary: ['Tarjeta', 'Efectivo', 'Bizum'],
      secondary: ['Transferencia', 'PayPal', 'Apple Pay'],
      cultural: ['Bote', 'Pagar después', 'A medias'],
      digital: ['Bizum', 'PayPal', 'Apple Pay', 'Google Pay']
    });

    // Mexican payment methods
    this.regionalPaymentMethods.set('MX', {
      primary: ['Tarjeta', 'Efectivo', 'OXXO'],
      secondary: ['Transferencia', 'PayPal', 'RappiPay'],
      cultural: ['Cooperacha', 'Pagar después', 'A medias'],
      digital: ['OXXO', 'PayPal', 'RappiPay', 'Mercado Pago']
    });

    // US payment methods
    this.regionalPaymentMethods.set('US', {
      primary: ['Credit Card', 'Cash', 'Venmo'],
      secondary: ['PayPal', 'Apple Pay', 'Google Pay'],
      cultural: ['Pool money', 'Pay later', 'Split evenly'],
      digital: ['Venmo', 'PayPal', 'Apple Pay', 'Google Pay']
    });

    // French payment methods
    this.regionalPaymentMethods.set('FR', {
      primary: ['Carte Bancaire', 'Espèces', 'Lydia'],
      secondary: ['Virement', 'PayPal', 'Apple Pay'],
      cultural: ['Cagnotte', 'Payer plus tard', 'Partager'],
      digital: ['Lydia', 'PayPal', 'Apple Pay', 'Google Pay']
    });
  }

  // Load translations for all supported languages
  private loadTranslations(): void {
    // Portuguese translations (primary)
    this.translations.set('pt-BR', {
      // Navigation
      'nav.home': 'Início',
      'nav.conversation': 'Conversa',
      'nav.groups': 'Grupos',
      'nav.analytics': 'Análises',
      'nav.settings': 'Configurações',

      // Common actions
      'action.send': 'Enviar',
      'action.cancel': 'Cancelar',
      'action.confirm': 'Confirmar',
      'action.save': 'Salvar',
      'action.delete': 'Excluir',
      'action.edit': 'Editar',
      'action.add': 'Adicionar',

      // Conversation
      'conversation.placeholder': 'Descreva sua despesa em português...',
      'conversation.send': 'Enviar',
      'conversation.typing': 'RachaAI está digitando...',
      'conversation.error': 'Erro na conversa',
      'conversation.retry': 'Tentar novamente',

      // Expense related
      'expense.total': 'Total',
      'expense.split': 'Dividir',
      'expense.amount': 'Valor',
      'expense.description': 'Descrição',
      'expense.category': 'Categoria',
      'expense.date': 'Data',
      'expense.participants': 'Participantes',

      // Categories
      'category.restaurant': 'Restaurante',
      'category.transport': 'Transporte',
      'category.entertainment': 'Entretenimento',
      'category.shopping': 'Compras',
      'category.travel': 'Viagem',
      'category.utilities': 'Contas',
      'category.other': 'Outros',

      // Payment methods
      'payment.pix': 'PIX',
      'payment.credit_card': 'Cartão de Crédito',
      'payment.cash': 'Dinheiro',
      'payment.transfer': 'Transferência',
      'payment.debit_card': 'Cartão de Débito',

      // Messages
      'message.welcome': 'Olá! Como posso ajudar com suas despesas hoje?',
      'message.expense_processed': 'Processei sua despesa!',
      'message.confirm_split': 'Confirma esta divisão?',
      'message.split_confirmed': 'Divisão confirmada!',
      'message.error_occurred': 'Ocorreu um erro. Tente novamente.',
      'message.language_changed': 'Idioma alterado para {{language}}',
      'message.cultural_context_loaded': 'Contexto cultural carregado para {{region}}',
      'message.payment_methods_loaded': 'Métodos de pagamento carregados para {{region}}',

      // Settings
      'settings.language': 'Idioma',
      'settings.currency': 'Moeda',
      'settings.timezone': 'Fuso Horário',
      'settings.notifications': 'Notificações',
      'settings.privacy': 'Privacidade',

      // Analytics
      'analytics.spending': 'Gastos',
      'analytics.categories': 'Categorias',
      'analytics.trends': 'Tendências',
      'analytics.groups': 'Grupos',

      // Groups
      'groups.create': 'Criar Grupo',
      'groups.join': 'Entrar no Grupo',
      'groups.members': 'Membros',
      'groups.expenses': 'Despesas',
      'groups.balance': 'Saldo',

      // Cultural expressions
      'cultural.rachar': 'Rachar a conta',
      'cultural.galera': 'Galera',
      'cultural.vaquinha': 'Vaquinha',
      'cultural.quem_convida': 'Quem convida paga',
      'cultural.dividir_igual': 'Dividir igualzinho'
    });

    // Spanish translations
    this.translations.set('es-ES', {
      // Navigation
      'nav.home': 'Inicio',
      'nav.conversation': 'Conversación',
      'nav.groups': 'Grupos',
      'nav.analytics': 'Análisis',
      'nav.settings': 'Configuración',

      // Common actions
      'action.send': 'Enviar',
      'action.cancel': 'Cancelar',
      'action.confirm': 'Confirmar',
      'action.save': 'Guardar',
      'action.delete': 'Eliminar',
      'action.edit': 'Editar',
      'action.add': 'Añadir',

      // Conversation
      'conversation.placeholder': 'Describe tu gasto en español...',
      'conversation.send': 'Enviar',
      'conversation.typing': 'RachaAI está escribiendo...',
      'conversation.error': 'Error en la conversación',
      'conversation.retry': 'Intentar de nuevo',

      // Expense related
      'expense.total': 'Total',
      'expense.split': 'Dividir',
      'expense.amount': 'Cantidad',
      'expense.description': 'Descripción',
      'expense.category': 'Categoría',
      'expense.date': 'Fecha',
      'expense.participants': 'Participantes',

      // Categories
      'category.restaurant': 'Restaurante',
      'category.transport': 'Transporte',
      'category.entertainment': 'Entretenimiento',
      'category.shopping': 'Compras',
      'category.travel': 'Viaje',
      'category.utilities': 'Servicios',
      'category.other': 'Otros',

      // Payment methods
      'payment.card': 'Tarjeta',
      'payment.cash': 'Efectivo',
      'payment.transfer': 'Transferencia',
      'payment.bizum': 'Bizum',
      'payment.paypal': 'PayPal',

      // Messages
      'message.welcome': '¡Hola! ¿Cómo puedo ayudarte con tus gastos hoy?',
      'message.expense_processed': '¡Procesé tu gasto!',
      'message.confirm_split': '¿Confirmas esta división?',
      'message.split_confirmed': '¡División confirmada!',
      'message.error_occurred': 'Ocurrió un error. Intenta de nuevo.',
      'message.language_changed': 'Idioma cambiado a {{language}}',
      'message.cultural_context_loaded': 'Contexto cultural cargado para {{region}}',
      'message.payment_methods_loaded': 'Métodos de pago cargados para {{region}}',

      // Settings
      'settings.language': 'Idioma',
      'settings.currency': 'Moneda',
      'settings.timezone': 'Zona Horaria',
      'settings.notifications': 'Notificaciones',
      'settings.privacy': 'Privacidad',

      // Analytics
      'analytics.spending': 'Gastos',
      'analytics.categories': 'Categorías',
      'analytics.trends': 'Tendencias',
      'analytics.groups': 'Grupos',

      // Groups
      'groups.create': 'Crear Grupo',
      'groups.join': 'Unirse al Grupo',
      'groups.members': 'Miembros',
      'groups.expenses': 'Gastos',
      'groups.balance': 'Saldo',

      // Cultural expressions
      'cultural.dividir': 'Dividir la cuenta',
      'cultural.grupo': 'Grupo',
      'cultural.bote': 'Bote',
      'cultural.quien_invita': 'Quien invita paga',
      'cultural.dividir_igual': 'Dividir por igual'
    });

    // English translations
    this.translations.set('en-US', {
      // Navigation
      'nav.home': 'Home',
      'nav.conversation': 'Conversation',
      'nav.groups': 'Groups',
      'nav.analytics': 'Analytics',
      'nav.settings': 'Settings',

      // Common actions
      'action.send': 'Send',
      'action.cancel': 'Cancel',
      'action.confirm': 'Confirm',
      'action.save': 'Save',
      'action.delete': 'Delete',
      'action.edit': 'Edit',
      'action.add': 'Add',

      // Conversation
      'conversation.placeholder': 'Describe your expense in English...',
      'conversation.send': 'Send',
      'conversation.typing': 'RachaAI is typing...',
      'conversation.error': 'Conversation error',
      'conversation.retry': 'Try again',

      // Expense related
      'expense.total': 'Total',
      'expense.split': 'Split',
      'expense.amount': 'Amount',
      'expense.description': 'Description',
      'expense.category': 'Category',
      'expense.date': 'Date',
      'expense.participants': 'Participants',

      // Categories
      'category.restaurant': 'Restaurant',
      'category.transport': 'Transport',
      'category.entertainment': 'Entertainment',
      'category.shopping': 'Shopping',
      'category.travel': 'Travel',
      'category.utilities': 'Utilities',
      'category.other': 'Other',

      // Payment methods
      'payment.credit_card': 'Credit Card',
      'payment.cash': 'Cash',
      'payment.venmo': 'Venmo',
      'payment.paypal': 'PayPal',
      'payment.apple_pay': 'Apple Pay',

      // Messages
      'message.welcome': 'Hello! How can I help with your expenses today?',
      'message.expense_processed': 'I processed your expense!',
      'message.confirm_split': 'Confirm this split?',
      'message.split_confirmed': 'Split confirmed!',
      'message.error_occurred': 'An error occurred. Please try again.',
      'message.language_changed': 'Language changed to {{language}}',
      'message.cultural_context_loaded': 'Cultural context loaded for {{region}}',
      'message.payment_methods_loaded': 'Payment methods loaded for {{region}}',

      // Settings
      'settings.language': 'Language',
      'settings.currency': 'Currency',
      'settings.timezone': 'Timezone',
      'settings.notifications': 'Notifications',
      'settings.privacy': 'Privacy',

      // Analytics
      'analytics.spending': 'Spending',
      'analytics.categories': 'Categories',
      'analytics.trends': 'Trends',
      'analytics.groups': 'Groups',

      // Groups
      'groups.create': 'Create Group',
      'groups.join': 'Join Group',
      'groups.members': 'Members',
      'groups.expenses': 'Expenses',
      'groups.balance': 'Balance',

      // Cultural expressions
      'cultural.split': 'Split the bill',
      'cultural.group': 'Group',
      'cultural.pool': 'Pool money',
      'cultural.whoever_invites': 'Whoever invites pays',
      'cultural.split_equally': 'Split equally'
    });

    // French translations
    this.translations.set('fr-FR', {
      // Navigation
      'nav.home': 'Accueil',
      'nav.conversation': 'Conversation',
      'nav.groups': 'Groupes',
      'nav.analytics': 'Analyses',
      'nav.settings': 'Paramètres',

      // Common actions
      'action.send': 'Envoyer',
      'action.cancel': 'Annuler',
      'action.confirm': 'Confirmer',
      'action.save': 'Enregistrer',
      'action.delete': 'Supprimer',
      'action.edit': 'Modifier',
      'action.add': 'Ajouter',

      // Conversation
      'conversation.placeholder': 'Décrivez votre dépense en français...',
      'conversation.send': 'Envoyer',
      'conversation.typing': 'RachaAI tape...',
      'conversation.error': 'Erreur de conversation',
      'conversation.retry': 'Réessayer',

      // Expense related
      'expense.total': 'Total',
      'expense.split': 'Partager',
      'expense.amount': 'Montant',
      'expense.description': 'Description',
      'expense.category': 'Catégorie',
      'expense.date': 'Date',
      'expense.participants': 'Participants',

      // Categories
      'category.restaurant': 'Restaurant',
      'category.transport': 'Transport',
      'category.entertainment': 'Divertissement',
      'category.shopping': 'Achats',
      'category.travel': 'Voyage',
      'category.utilities': 'Services',
      'category.other': 'Autres',

      // Payment methods
      'payment.card': 'Carte Bancaire',
      'payment.cash': 'Espèces',
      'payment.transfer': 'Virement',
      'payment.lydia': 'Lydia',
      'payment.paypal': 'PayPal',

      // Messages
      'message.welcome': 'Bonjour ! Comment puis-je vous aider avec vos dépenses aujourd\'hui ?',
      'message.expense_processed': 'J\'ai traité votre dépense !',
      'message.confirm_split': 'Confirmer ce partage ?',
      'message.split_confirmed': 'Partage confirmé !',
      'message.error_occurred': 'Une erreur s\'est produite. Veuillez réessayer.',
      'message.language_changed': 'Langue changée vers {{language}}',
      'message.cultural_context_loaded': 'Contexte culturel chargé pour {{region}}',
      'message.payment_methods_loaded': 'Méthodes de paiement chargées pour {{region}}',

      // Settings
      'settings.language': 'Langue',
      'settings.currency': 'Devise',
      'settings.timezone': 'Fuseau Horaire',
      'settings.notifications': 'Notifications',
      'settings.privacy': 'Confidentialité',

      // Analytics
      'analytics.spending': 'Dépenses',
      'analytics.categories': 'Catégories',
      'analytics.trends': 'Tendances',
      'analytics.groups': 'Groupes',

      // Groups
      'groups.create': 'Créer un Groupe',
      'groups.join': 'Rejoindre le Groupe',
      'groups.members': 'Membres',
      'groups.expenses': 'Dépenses',
      'groups.balance': 'Solde',

      // Cultural expressions
      'cultural.partager': 'Partager l\'addition',
      'cultural.groupe': 'Groupe',
      'cultural.cagnotte': 'Cagnotte',
      'cultural.celui_qui_invite': 'Celui qui invite paie',
      'cultural.partager_equitablement': 'Partager équitablement'
    });
  }

  // Get translation for a key
  public t(key: string, params?: Record<string, string>): string {
    const translation = this.getNestedTranslation(this.translations.get(this.currentLanguage) || {}, key);
    
    if (!translation) {
      // Fallback to default language
      const fallbackTranslation = this.getNestedTranslation(this.translations.get(this.config.fallbackLanguage) || {}, key);
      if (!fallbackTranslation) {
        return key; // Return key if no translation found
      }
      return this.interpolate(fallbackTranslation, params);
    }

    return this.interpolate(translation, params);
  }

  // Get nested translation value
  private getNestedTranslation(obj: Translation, key: string): string | undefined {
    const keys = key.split('.');
    let current: any = obj;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  }

  // Interpolate parameters in translation
  private interpolate(text: string, params?: Record<string, string>): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  // Set current language
  public setLanguage(language: SupportedLanguage): void {
    if (this.config.supportedLanguages.includes(language)) {
      this.currentLanguage = language;
    }
  }

  // Set current region
  public setRegion(region: SupportedRegion): void {
    this.currentRegion = region;
  }

  // Get current language
  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  // Get current region
  public getCurrentRegion(): SupportedRegion {
    return this.currentRegion;
  }

  // Get cultural context for current region
  public getCulturalContext(): CulturalContext {
    return this.culturalContexts.get(this.currentRegion) || this.culturalContexts.get('BR')!;
  }

  // Get regional payment methods
  public getRegionalPaymentMethods(): RegionalPaymentMethods {
    return this.regionalPaymentMethods.get(this.currentRegion) || this.regionalPaymentMethods.get('BR')!;
  }

  // Format currency for current region
  public formatCurrency(amount: number): string {
    const context = this.getCulturalContext();
    return new Intl.NumberFormat(context.numberFormat, {
      style: 'currency',
      currency: context.currency
    }).format(amount);
  }

  // Format date for current region
  public formatDate(date: Date): string {
    const context = this.getCulturalContext();
    return new Intl.DateTimeFormat(context.numberFormat, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  // Get cultural expression
  public getCulturalExpression(key: string): string {
    const context = this.getCulturalContext();
    return context.culturalExpressions[key] || key;
  }

  // Get social dynamic
  public getSocialDynamic(key: string): string {
    const context = this.getCulturalContext();
    return context.socialDynamics[key] || key;
  }

  // Get business practice
  public getBusinessPractice(key: string): string {
    const context = this.getCulturalContext();
    return context.businessPractices[key] || key;
  }

  // Get supported languages
  public getSupportedLanguages(): SupportedLanguage[] {
    return this.config.supportedLanguages;
  }

  // Get supported regions
  public getSupportedRegions(): SupportedRegion[] {
    return Array.from(this.culturalContexts.keys());
  }

  // Validate cultural context
  public validateCulturalContext(context: CulturalContext): boolean {
    try {
      CulturalContextSchema.parse(context);
      return true;
    } catch {
      return false;
    }
  }

  // Validate regional payment methods
  public validateRegionalPaymentMethods(methods: RegionalPaymentMethods): boolean {
    try {
      RegionalPaymentMethodsSchema.parse(methods);
      return true;
    } catch {
      return false;
    }
  }
}

// Default configuration
export const defaultI18nConfig: I18nConfig = {
  defaultLanguage: 'pt-BR',
  supportedLanguages: ['pt-BR', 'es-ES', 'en-US', 'fr-FR'],
  fallbackLanguage: 'pt-BR',
  loadPath: '/locales',
  debug: false
};

// Create default instance
export const i18n = new RachaAII18n(defaultI18nConfig); 
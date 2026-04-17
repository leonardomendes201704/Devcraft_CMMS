import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  'pt-BR': {
    translation: {
      title: 'Devcraft CMMS',
      subtitle: 'Fundacao da plataforma pronta para evolucao por fases.',
      apiStatus: 'Status da API',
      healthy: 'Saudavel',
      unknown: 'Nao verificado',
      language: 'Idioma',
      tenantHint: 'Tenant enviado via header X-Tenant-Id no backend.',
    },
  },
  'en-US': {
    translation: {
      title: 'Devcraft CMMS',
      subtitle: 'Platform foundation ready to evolve in phases.',
      apiStatus: 'API status',
      healthy: 'Healthy',
      unknown: 'Not checked',
      language: 'Language',
      tenantHint: 'Tenant is sent by X-Tenant-Id header on backend.',
    },
  },
}

void i18n.use(initReactI18next).init({
  resources,
  lng: 'pt-BR',
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
})

export { i18n }

'use client'
import { createContext, useContext, useState } from 'react'
import { dictionary, type Locale } from '@/lib/dictionary'
const I18nContext = createContext<{ locale: Locale; t: typeof dictionary.es; toggle: () => void }>({ locale: 'es', t: dictionary.es, toggle: () => {} })
export function I18nProvider({ children }: { children: React.ReactNode }) { const [locale, setLocale] = useState<Locale>('es'); return <I18nContext.Provider value={{ locale, t: dictionary[locale], toggle: () => setLocale((l) => l === 'es' ? 'en' : 'es') }}>{children}</I18nContext.Provider> }
export const useI18n = () => useContext(I18nContext)

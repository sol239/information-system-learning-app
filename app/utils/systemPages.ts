import type { SystemPage } from '~/model/types/SystemPage'

export const SYSTEM_NAVBAR_PAGES: SystemPage[] = [
  {
    name: 'Nástěnka',
    route: '/nastenka',
    description: 'Hlavní přehled o táboře, zobrazující důležité informace a statistiky.',
    icon: 'i-heroicons-chart-bar-20-solid',
  },
  {
    name: 'Turnusy',
    route: '/turnusy',
    description: 'Přehled dostupných turnusů pro účastníky.',
    icon: 'i-heroicons-calendar-date-range',
  },
  {
    name: 'Účastníci',
    route: '/ucastnici',
    description: 'Seznam všech účastníků tábora s možností správy jejich údajů.',
    icon: 'i-heroicons-users',
  },
  {
    name: 'Vedoucí',
    route: '/vedouci',
    description: 'Seznam vedoucích tábora s možností správy jejich údajů.',
    icon: 'i-heroicons-user-group',
  },
  {
    name: 'Jídla',
    route: '/jidla',
    description: 'Přehled jídel, která budou na táboře podávána, včetně informací o alergenech.',
    icon: 'i-lucide-utensils',
  },
  {
    name: 'Kniha jídel',
    route: '/kniha-jidel',
    description: 'Podrobný přehled o tom, kdy se budou podávat jednotlivá jídla, včetně informací o alergenech.',
    icon: 'i-lucide-square-menu',
  },
]

export function getSystemNavbarPages(): SystemPage[] {
  return SYSTEM_NAVBAR_PAGES.map(page => ({ ...page }))
}

export function getFirstSystemPageRoute(): string {
  return SYSTEM_NAVBAR_PAGES[0]?.route ?? ''
}

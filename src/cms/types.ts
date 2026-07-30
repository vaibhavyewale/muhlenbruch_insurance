export type NavItem = { id: string; label: string; href: string; enabled: boolean; order: number }
export type HeroSlide = { id: string; eyebrow: string; title: string; emphasizedTitle: string; description: string; primaryLabel: string; primaryHref: string; videoUrl: string; overlay: string; published: boolean; order: number }
export type HeroContent = HeroSlide & { slides: HeroSlide[] }
export type RepeatableItem = { id: string; title: string; description: string; image: string; enabled: boolean; order: number; badge?: string }
export type Stat = { id: string; number: string; label: string; icon: string; enabled: boolean; order: number }
export type AboutContent = { eyebrow: string; title: string; emphasizedTitle: string; description: string; image: string; badge: string; buttonLabel: string; buttonHref: string }
export type ContactContent = { eyebrow: string; title: string; emphasizedTitle: string; company: string; address: string; phone: string; email: string; hours: string; formTitle: string; successMessage: string }
export type CmsContent = { siteName: string; logo: string; favicon: string; nav: NavItem[]; hero: HeroContent; services: RepeatableItem[]; plans: RepeatableItem[]; stats: Stat[]; about: AboutContent; contact: ContactContent; testimonials: RepeatableItem[]; footer: { description: string; copyright: string } }

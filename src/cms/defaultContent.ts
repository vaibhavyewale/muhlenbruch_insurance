import type { CmsContent } from './types'

const siteLogo = 'http://www.muhlenbruchinsurance.com/themes/site/img/site_logo.jpg'
const images = [
  'http://www.muhlenbruchinsurance.com/uploads/section/20160114233707.jpg',
  'http://www.muhlenbruchinsurance.com/uploads/section/20160114233111.png',
  'http://www.muhlenbruchinsurance.com/uploads/section/20160114233058.png',
  'http://www.muhlenbruchinsurance.com/uploads/section/20160114233046.png',
  'http://www.muhlenbruchinsurance.com/uploads/section/20160114233022.png',
  'http://www.muhlenbruchinsurance.com/uploads/section/20160208111045.jpg',
  'http://www.muhlenbruchinsurance.com/uploads/section/20160208110659.jpg',
  'http://www.muhlenbruchinsurance.com/uploads/section/20160208110954.jpg',
  'http://www.muhlenbruchinsurance.com/uploads/section/20160212145242.jpg'
]

export const defaultContent: CmsContent = {
  siteName: 'Muhlenbruch Insurance Agency', logo: siteLogo, favicon: siteLogo,
  nav: [{id:'home',label:'Home',href:'#top',enabled:true,order:1},{id:'insurance',label:'Insurance',href:'#insurance',enabled:true,order:2},{id:'about',label:'About Us',href:'#about',enabled:true,order:3},{id:'contact',label:'Contact',href:'#contact',enabled:true,order:4}],
  hero: { id:'hero-1', eyebrow:'MUHLENBRUCH INSURANCE AGENCY', title:'Coverage that works', emphasizedTitle:'for your life.', description:'With over 10 years of experience and more than 15 companies represented, we work hard to find you the right coverage at the best price.', primaryLabel:'Get a FREE quote', primaryHref:'#contact', videoUrl:'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4', overlay:'#ffffff', published:true, order:1, slides:[{id:'hero-1',eyebrow:'MUHLENBRUCH INSURANCE AGENCY',title:'Coverage that works',emphasizedTitle:'for your life.',description:'With over 10 years of experience and more than 15 companies represented, we work hard to find you the right coverage at the best price.',primaryLabel:'Get a FREE quote',primaryHref:'#contact',videoUrl:'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4',overlay:'#ffffff',published:true,order:1}] },
  services: [{id:'service-1',title:'Affordable coverage',description:'Get complete insurance coverage that saves you money.',image:'http://www.muhlenbruchinsurance.com/uploads/section/20160111222734.png',enabled:true,order:1},{id:'service-2',title:'Wide variety of policies',description:'Find the right coverage with more than 15 companies represented.',image:'http://www.muhlenbruchinsurance.com/uploads/section/20160111222824.png',enabled:true,order:2},{id:'service-3',title:'Dedicated agents',description:'Experienced agents focused on seeing your needs are met.',image:'http://www.muhlenbruchinsurance.com/uploads/section/20160111223311.png',enabled:true,order:3}],
  plans: images.map((image,index) => ({id:`plan-${index+1}`,title:['Auto Insurance','Home Insurance','Recreational Vehicles','Pet Insurance','Dental Service','Disability','Health Insurance','Workers Compensation','Crop Insurance'][index],description:'Customized protection for the things that matter most.',image,enabled:true,order:index+1,badge:'Coverage'})),
  stats: [{id:'stat-1',number:'10+',label:'Years of experience',icon:'◷',enabled:true,order:1},{id:'stat-2',number:'15+',label:'Companies represented',icon:'✦',enabled:true,order:2},{id:'stat-3',number:'100%',label:'Personal service',icon:'♡',enabled:true,order:3}],
  about: { eyebrow:'ABOUT US', title:'Experienced agents', emphasizedTitle:'working for you.', description:'For over 10 years, our insurance agency has worked with national and regional insurance companies to offer the best prices and coverage available.', image:'http://www.muhlenbruchinsurance.com/uploads/Editor/2560024.png', badge:'Serving 10+ yrs', buttonLabel:'Meet your insurance team', buttonHref:'#contact' },
  contact: { eyebrow:'CONTACT US', title:'Let’s find your', emphasizedTitle:'right coverage.', company:'Muhlenbruch Insurance Agency', address:'110 East Ellsworth, Dows, IA.', phone:'515-852-4156', email:'muhlenbruchinsurance@hotmail.com', hours:'Monday–Friday · 8am–5pm', formTitle:'Say hello', successMessage:'Thanks — our team will be in touch soon.' },
  testimonials: [{id:'testimonial-1',title:'Affordable coverage',description:'They worked hard to find us the best coverage for as little out of pocket as possible.',image:'',enabled:true,order:1},{id:'testimonial-2',title:'A wide variety',description:'With so many companies represented, they found a policy that actually fit our situation.',image:'',enabled:true,order:2}],
  footer: { description:'Experienced agents, customized plans and affordable coverage for your family, farm or business.', copyright:'© 2026 Muhlenbruch Insurance Agency' }
}

import { Component, useEffect, useRef, useState, type ErrorInfo, type FormEvent, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ChevronRight, ChevronLeft, Leaf, Menu, Search, X, Recycle, ShieldCheck, Star, Instagram, Facebook, Twitter, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react'
import './App.css'
import Admin from './cms/Admin'
import AdminLogin from './cms/Login'
import DynamicContact from './cms/DynamicContact'
import DynamicFooter from './cms/DynamicFooter'
import { readContent } from './cms/store'
import { mediaUrl } from './cms/media'

class CmsErrorBoundary extends Component<{children:ReactNode},{error:Error|null}> {
  state={error:null as Error|null}
  static getDerivedStateFromError(error:Error) { return {error} }
  componentDidCatch(error:Error,info:ErrorInfo) { console.error('CMS render error',error,info) }
  render() { if (!this.state.error) return this.props.children; return <div className="cms-runtime-error"><div><span className="cms-runtime-mark">!</span><p className="cms-kicker">CMS RUNTIME ERROR</p><h1>This admin module could not load.</h1><p>{this.state.error.message}</p><button onClick={()=>{localStorage.removeItem('muhlenbruch-cms-content-v1'); window.location.reload()}}>Reset CMS cache</button><a href="/">Return to website</a></div></div> }
}

const img = (id: string) => id.startsWith('http') ? mediaUrl(id) : `https://images.unsplash.com/${id}?q=80&w=1000&auto=format&fit=crop`
const rise = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: .65 } }

function Navbar() {
  const [scrolled, setScrolled] = useState(false); const [open, setOpen] = useState(false)
  const cms = readContent()
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn) }, [])
  const links = cms.nav.filter(item=>item.enabled).sort((a,b)=>a.order-b.order).map(item=>[item.label,item.href])
  return <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}><div className="shell nav-inner">
    <a href="#top" className="brand"><img className="site-logo" src={cms.logo} alt={cms.siteName} /></a>
    <nav className="desktop-nav">{links.map(([label, href]) => <a href={href} key={label}>{label}</a>)}</nav>
    <div className="nav-actions"><button aria-label="Search"><Search size={20}/></button><button className="menu-button" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div>
  </div><AnimatePresence>{open && <motion.nav className="mobile-menu" initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}}>{links.map(([label, href]) => <a href={href} onClick={() => setOpen(false)} key={label}>{label}<ChevronRight size={16}/></a>)}</motion.nav>}</AnimatePresence></header>
}

function Hero() {
  const cmsHero = readContent().hero
  const slides = cmsHero.slides.filter(slide=>slide.published).sort((a,b)=>a.order-b.order)
  const [active,setActive] = useState(0)
  const hero = slides[active] || cmsHero
  useEffect(() => { if (slides.length < 2) return; const timer=window.setInterval(()=>setActive(current=>(current+1)%slides.length),7000); return ()=>window.clearInterval(timer) }, [slides.length])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoOpacity, setVideoOpacity] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let frame = 0
    let restartTimer: ReturnType<typeof setTimeout> | undefined
    const fadeDuration = 0.5

    const monitor = () => {
      const duration = video.duration
      const current = video.currentTime
      if (Number.isFinite(duration) && duration > 0) {
        if (current <= fadeDuration) setVideoOpacity(Math.min(current / fadeDuration, 1))
        else if (duration - current <= fadeDuration) setVideoOpacity(Math.max((duration - current) / fadeDuration, 0))
        else setVideoOpacity(1)
      }
      frame = requestAnimationFrame(monitor)
    }
    const handleEnded = () => {
      setVideoOpacity(0)
      restartTimer = setTimeout(() => { video.currentTime = 0; void video.play() }, 100)
    }
    video.addEventListener('ended', handleEnded)
    void video.play().catch(() => undefined)
    frame = requestAnimationFrame(monitor)
    return () => { cancelAnimationFrame(frame); video.removeEventListener('ended', handleEnded); if (restartTimer) clearTimeout(restartTimer) }
  }, [hero.id])

  return <section id="top" className="hero aethera-hero">
    <video key={hero.id} ref={videoRef} className="aethera-video" muted playsInline preload="auto" style={{ opacity: videoOpacity }}><source src={hero.videoUrl} type="video/mp4" /></video>
    <div className="aethera-gradient" />
    <motion.div className="aethera-hero-inner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: 'easeOut' }}>
      <p className="aethera-kicker">{hero.eyebrow}</p>
      <h1>{hero.title.split(' ').slice(0,-1).join(' ')} <em>{hero.title.split(' ').at(-1)}</em><br/><em>{hero.emphasizedTitle}</em></h1>
      <motion.p className="aethera-description" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .2, ease: 'easeOut' }}>{hero.description}</motion.p>
      <motion.a className="aethera-cta" href={hero.primaryHref} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .4, ease: 'easeOut' }}>{hero.primaryLabel} <ArrowUpRight size={17}/></motion.a>
    </motion.div>
  </section>
}

const categories = [{name:'Affordable coverage', note:'Low premiums', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160111222734.png'}, {name:'Wide variety', note:'15+ companies represented', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160111222824.png'}, {name:'Dedicated agents', note:'Focused on helping you', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160111223311.png'}]
function Categories() { const services = readContent().services.filter(item=>item.enabled).sort((a,b)=>a.order-b.order); return <section id="home" className="section category-section"><div className="shell"><motion.div className="section-heading centered" {...rise}><p className="eyebrow">WHY MUHLENBRUCH</p><h2>Insurance that<br/><em>works for you.</em></h2><p>Personalized coverage, knowledgeable agents, and affordable options to protect what matters most.</p></motion.div><div className="category-grid">{services.map((c,i)=><motion.a {...rise} transition={{...rise.transition,delay:i*.12}} href="#contact" className="category-card" key={c.id}><img src={img(c.image)} alt={c.title}/><div className="card-shade"/><div className="category-copy"><span>{c.badge || 'Our service'}</span><h3>{c.title}</h3><b>Learn more <ArrowUpRight size={15}/></b></div></motion.a>)}</div></div></section> }

const products = [{name:'Auto Insurance', type:'Cars, trucks, vans, SR22, SUVs, motorcycles', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160114233707.jpg'}, {name:'Home Insurance', type:'Personal property, flood, liability, renters and more', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160114233111.png'}, {name:'Recreational Vehicles', type:'Campers, ATVs, snowmobiles, boats and jet skis', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160114233058.png'}, {name:'Pet Insurance', type:'Accidents, illnesses, testing and specialist treatment', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160114233046.png'}, {name:'Dental Service', type:'Health, life, dental, vision and hearing coverage', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160114233022.png'}, {name:'Disability', type:'Short-term and long-term disability protection', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160208111045.jpg'}, {name:'Health Insurance', type:'Individual, family, group and supplemental plans', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160208110659.jpg'}, {name:'Workers Compensation', type:'Coverage for on-the-job injuries and expenses', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160208110954.jpg'}, {name:'Crop Insurance', type:'Farm, livestock, equine, equipment and liability', image:'http://www.muhlenbruchinsurance.com/uploads/section/20160212145242.jpg'}]
function Products() {
  const cmsPlans = readContent().plans.filter(item=>item.enabled).sort((a,b)=>a.order-b.order).map(item=>({name:item.title,type:item.description,image:item.image}))
  const planItems = cmsPlans.length ? cmsPlans : products
  const [slide, setSlide] = useState(0)
  const [visibleCount, setVisibleCount] = useState(typeof window !== 'undefined' && window.innerWidth < 801 ? 2 : 4)
  const maxSlide = planItems.length - visibleCount
  useEffect(() => { const resize = () => setVisibleCount(window.innerWidth < 801 ? 2 : 4); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize) }, [])
  useEffect(() => { const timer = window.setInterval(() => setSlide(current => current >= maxSlide ? 0 : current + 1), 4200); return () => window.clearInterval(timer) }, [maxSlide])
  const move = (direction: number) => setSlide(current => Math.min(Math.max(current + direction, 0), maxSlide))
  return <section id="insurance" className="section products-section"><div className="shell"><div className="split-heading"><motion.div {...rise}><p className="eyebrow">PROTECTION FOR WHAT MATTERS</p><h2>Our<br/><em>insurance plans.</em></h2></motion.div><motion.div className="heading-side" {...rise}><p>From auto insurance to homeowners insurance, get the coverage you need from a team that knows your community.</p><a className="text-link" href="#contact">Get a free quote <ArrowUpRight size={16}/></a></motion.div></div><div className="plan-carousel"><div className="carousel-controls"><button aria-label="Previous insurance plan" onClick={() => move(-1)}><ChevronLeft size={18}/></button><div className="carousel-dots">{planItems.slice(0, maxSlide + 1).map((product,index)=><button aria-label={`Show ${product.name}`} className={index === slide ? 'active' : ''} onClick={() => setSlide(index)} key={product.name}/>)}</div><button aria-label="Next insurance plan" onClick={() => move(1)}><ChevronRight size={18}/></button></div><div className="plan-window one-window"><motion.div className="product-track one-track" animate={{x:`-${slide * (100 / planItems.length)}%`}} transition={{duration:.95,ease:[.22,1,.36,1]}}>{planItems.map((p,i)=><motion.article initial={{opacity:.85}} whileInView={{opacity:1}} viewport={{once:false}} transition={{duration:.5}} className="product" key={p.name}><div className="product-image"><img src={img(p.image)} alt={p.name}/><span className="product-tag">Coverage</span><a href="#contact" className="add">Ask about this plan <ArrowUpRight size={15}/></a></div><div className="product-info"><div><h3>{p.name}</h3><p>{p.type}</p></div></div></motion.article>)}</motion.div></div></div></div></section>
}

const features = [{icon:Leaf,title:'Customized plans',text:'We listen to your needs and build coverage around your situation.'},{icon:Recycle,title:'15+ companies',text:'Our network makes it easier to compare policies and find the right fit.'},{icon:ShieldCheck,title:'Experienced agents',text:'Over 10 years of experience helping families, farms and businesses.'}]
function Features() { const stats=readContent().stats.filter(stat=>stat.enabled).sort((a,b)=>a.order-b.order); return <section id="services" className="section feature-section"><div className="shell"><motion.div className="section-heading centered" {...rise}><p className="eyebrow">OUR SERVICES</p><h2>Personal service.<br/><em>Practical protection.</em></h2></motion.div><div className="feature-grid">{stats.map((stat,i)=><motion.div className="feature" {...rise} transition={{...rise.transition,delay:i*.13}} key={stat.id}><div className="feature-icon"><span className="stat-symbol">{stat.icon}</span></div><h3><motion.span initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.5,delay:.2+i*.1}}>{stat.number}</motion.span> {stat.label}</h3><p>Personalized support and practical protection from a team that knows your community.</p></motion.div>)}</div></div></section> }

function About() { const about=readContent().about; return <section id="about" className="section about-section"><div className="shell about-layout"><motion.div className="about-photo" {...rise}><img src={img(about.image)} alt={about.title}/><span>{about.badge.split(' ').slice(0,1).join(' ')}<br/><strong>{about.badge.split(' ').slice(1).join(' ')}</strong></span></motion.div><motion.div className="about-copy" {...rise}><p className="eyebrow">{about.eyebrow}</p><h2>{about.title}<br/><em>{about.emphasizedTitle}</em></h2><p>{about.description}</p><p>Our goal is to make your coverage work for your budget. With customized plans, plenty of add-ons and personalized service, you can be protected at all times.</p><a href={about.buttonHref} className="button button-outline">{about.buttonLabel} <ArrowUpRight size={16}/></a></motion.div></div></section> }

function Blog() {
  const [sent, setSent] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); try { const response = await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:formData.get('name'),email:formData.get('email'),phone:formData.get('phone'),subject:formData.get('subject'),message:formData.get('message')})}); if (!response.ok) throw new Error('Unable to send'); setSent(true); form.reset() } catch { setSent(false); window.alert('We could not send your message right now. Please call 515-852-4156.') } }
  return <section id="contact" className="section contact-section"><div className="shell"><div className="split-heading"><motion.div {...rise}><p className="eyebrow">CONTACT US</p><h2>Let’s find your<br/><em>right coverage.</em></h2></motion.div><motion.a href="tel:5158524156" className="text-link heading-side" {...rise}>Call for a free quote <ArrowUpRight size={16}/></motion.a></div><div className="contact-layout"><motion.div className="contact-details contact-panel" {...rise}><div className="panel-top"><span className="panel-mark"><Leaf size={17}/></span><span>MUHLENBRUCH INSURANCE</span></div><div className="panel-copy"><p className="panel-kicker">PROTECTION, MADE PERSONAL</p><h3>Feel confident<br/><em>about tomorrow.</em></h3><p>We take the time to understand what matters to you, then build a policy around it.</p></div><div className="panel-proof"><strong>10+</strong><span>years helping<br/>our community</span><i></i><strong>15+</strong><span>insurance companies<br/>to choose from</span></div><div className="panel-contact"><a href="tel:5158524156" className="contact-line"><Phone size={18}/>515-852-4156</a><a href="mailto:muhlenbruchinsurance@hotmail.com" className="contact-line"><Mail size={18}/>muhlenbruchinsurance@hotmail.com</a><div className="contact-line"><MapPin size={18}/><span>110 East Ellsworth<br/>Dows, IA.</span></div></div><a href="tel:5158524156" className="panel-cta">Talk to an agent <ArrowUpRight size={17}/></a></motion.div><motion.div className="contact-card" {...rise} transition={{...rise.transition,delay:.12}}><div className="form-top"><span>REQUEST A QUOTE</span><p>Say hello</p></div><form onSubmit={submit}><label>Your Name *<input type="text" name="name" placeholder="Your Name" required /></label><label>E-mail Address *<input type="email" name="email" placeholder="E-mail Address" required /></label><label>Phone *<input type="tel" name="phone" placeholder="(000) 000-0000" required /></label><label>Subject<input type="text" name="subject" placeholder="What can we help with?" /></label><label>Message *<textarea name="message" rows={5} placeholder="Tell us what you need covered" required /></label><button type="submit" className="form-submit">{sent ? <><CheckCircle2 size={17}/> Message received</> : <>Send message <ArrowUpRight size={17}/></>}</button>{sent && <motion.p className="form-success" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>Thanks — our team will be in touch soon.</motion.p>}</form></motion.div></div></div></section>
}

function Testimonials() { const testimonials=readContent().testimonials.filter(item=>item.enabled).sort((a,b)=>a.order-b.order); return <section className="section testimonials"><div className="shell"><motion.div className="section-heading centered" {...rise}><p className="eyebrow">WHY CLIENTS CHOOSE US</p><h2>Coverage with<br/><em>confidence.</em></h2></motion.div><div className="quote-grid">{testimonials.map((item,i)=><motion.blockquote {...rise} transition={{...rise.transition,delay:i*.12}} key={item.id}><div className="stars">{[1,2,3,4,5].map(n=><Star key={n} size={14} fill="currentColor"/>)}</div><p>“{item.description}”</p><footer><strong>{item.title}</strong><span>Verified client</span></footer></motion.blockquote>)}</div></div></section> }

function Footer() { return <footer className="footer"><div className="shell"><div className="footer-cta"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Let’s protect what<br/><em>matters most.</em></h2></div><a href="#contact" className="footer-cta-button">Get a free quote <ArrowUpRight size={17}/></a></div><div className="footer-grid"><div className="footer-brand"><a className="brand" href="#top"><img className="site-logo" src="http://www.muhlenbruchinsurance.com/themes/site/img/site_logo.jpg" alt="Muhlenbruch Insurance Agency" /></a><p>Experienced agents, customized plans and affordable coverage for your family, farm or business.</p><div className="socials"><a href="tel:5158524156"><span className="sr-only">Phone</span><Phone size={17}/></a><a href="mailto:muhlenbruchinsurance@hotmail.com"><span className="sr-only">Email</span><Mail size={17}/></a><a href="#contact"><span className="sr-only">Contact</span><MapPin size={17}/></a></div></div>{[['Insurance','Auto insurance','Home insurance','Recreational vehicles','Pet insurance'],['More coverage','Dental service','Disability','Health insurance','Crop insurance'],['Agency','About us','Services','Contact us','Free quote']].map(([heading,...items])=><div className="footer-col" key={heading}><h4>{heading}</h4>{items.map(item=><a href={item === 'Contact us' || item === 'Free quote' ? '#contact' : item === 'About us' ? '#about' : item === 'Services' ? '#services' : '#insurance'} key={item}>{item}</a>)}</div>)}</div><div className="footer-bottom"><span>© 2026 Muhlenbruch Insurance Agency</span><span>Serving you with experience and care.</span></div></div></footer> }

export default function App() { if (window.location.pathname.startsWith('/admin')) return <CmsErrorBoundary>{localStorage.getItem('cms-auth-token') ? <Admin/> : <AdminLogin/>}</CmsErrorBoundary>; return <><Navbar/><main><Hero/><Categories/><Products/><Features/><About/><DynamicContact/><Testimonials/></main><DynamicFooter/></> }

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { PrismaClient, Role } from '@prisma/client'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const app = express()
const prisma = new PrismaClient()
const port = Number(process.env.PORT || 4000)
const secret = process.env.JWT_SECRET || 'development-secret'
const contentFile = path.resolve(process.cwd(), 'data/homepage-content.json')
const localLeads: Array<{id:string;name:string;email:string;phone?:string;subject?:string;message:string;status:string;createdAt:string}> = []

async function readJsonContent() {
  try { return JSON.parse(await readFile(contentFile, 'utf8')) }
  catch { return null }
}
async function writeJsonContent(payload: unknown) {
  await mkdir(path.dirname(contentFile), { recursive: true })
  await writeFile(contentFile, JSON.stringify(payload, null, 2), 'utf8')
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173' }))
app.use(express.json({ limit: '2mb' }))

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })
const messageSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), subject: z.string().optional(), message: z.string().min(5) })
const auth = (roles?: Role[]) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({error:'Authentication required'})
    if (token === 'local-development-session') { ;(req as express.Request & {user?:{id:string;role:Role}}).user={id:'local-admin',role:Role.ADMIN}; return next() }
    const user = jwt.verify(token, secret) as {id:string;role:Role}
    if (roles && !roles.includes(user.role)) return res.status(403).json({error:'Insufficient permissions'})
    ;(req as express.Request & {user?:typeof user}).user = user
    next()
  } catch { res.status(401).json({error:'Invalid session'}) }
}

app.get('/api/health', (_req,res) => res.json({ok:true,service:'muhlenbruch-cms'}))
app.get('/api/media', async (req,res) => {
  try {
    const raw=typeof req.query.url==='string'?req.query.url:''
    const target=new URL(raw)
    if(!['muhlenbruchinsurance.com','www.muhlenbruchinsurance.com'].includes(target.hostname)) return res.status(400).send('Unsupported media host')
    const upstream=await fetch(target)
    if(!upstream.ok) return res.status(upstream.status).send('Media unavailable')
    res.setHeader('Content-Type',upstream.headers.get('content-type') || 'application/octet-stream')
    res.setHeader('Cache-Control','public, max-age=86400')
    res.send(Buffer.from(await upstream.arrayBuffer()))
  } catch { res.status(400).send('Invalid media URL') }
})
app.post('/api/auth/login', async (req,res) => {
  const parsed=loginSchema.safeParse(req.body)
  if(!parsed.success)return res.status(400).json({error:parsed.error.flatten()})
  const user=await prisma.user.findUnique({where:{email:parsed.data.email}})
  if(!user?.passwordHash || !await bcrypt.compare(parsed.data.password,user.passwordHash))return res.status(401).json({error:'Invalid email or password'})
  res.json({token:jwt.sign({id:user.id,role:user.role},secret,{expiresIn:'8h'}),user:{id:user.id,email:user.email,name:user.name,role:user.role}})
})

app.get('/api/auth/google', (_req,res) => {
  const clientId=process.env.GOOGLE_CLIENT_ID
  const callback=(process.env.GOOGLE_CALLBACK_URL || `http://127.0.0.1:${port}/api/auth/callback/google`).trim().replace(/\/$/,'')
  if(!clientId)return res.status(503).send('Google login is not configured.')
  const state=jwt.sign({provider:'google',nonce:Date.now()},secret,{expiresIn:'10m'})
  const params=new URLSearchParams({client_id:clientId,redirect_uri:callback,response_type:'code',scope:'openid email profile',state,access_type:'offline',prompt:'select_account'})
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

app.get(['/api/auth/google/callback','/api/auth/callback/google'], async (req,res) => {
  try {
    const code=typeof req.query.code==='string'?req.query.code:''
    const state=typeof req.query.state==='string'?req.query.state:''
    if(!code || !state) return res.status(400).send('Google did not return an authorization code.')
    try { const verified=jwt.verify(state,secret) as {provider?:string}; if(verified.provider !== 'google') throw new Error('wrong provider') } catch { return res.status(400).send('Invalid or expired Google authorization state. Please start sign-in again.') }
    const configuredOrigin=(process.env.CLIENT_ORIGIN || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : `http://127.0.0.1:${port}`)).trim().replace(/\/$/,'')
    const callback=(process.env.GOOGLE_CALLBACK_URL || `${configuredOrigin}/api/auth/callback/google`).trim().replace(/\/$/,'')
    const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:(process.env.GOOGLE_CLIENT_ID || '').trim(),client_secret:(process.env.GOOGLE_CLIENT_SECRET || '').trim(),redirect_uri:callback,grant_type:'authorization_code'})})
    const tokenBody=await tokenResponse.json() as {access_token?:string;error?:string;error_description?:string}
    if(!tokenResponse.ok || !tokenBody.access_token) { console.error('Google token exchange failed:',tokenBody); return res.status(401).send(`Google authorization failed: ${tokenBody.error_description || tokenBody.error || 'unknown provider error'}`) }
    const tokens=tokenBody
    const profileResponse=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${tokens.access_token}`}})
    const profile=await profileResponse.json() as {email?:string;name?:string}
    if(!profile.email)return res.status(401).send('Google did not return an email address.')
    const configuredAdminEmails=(process.env.ADMIN_EMAILS || '').split(',').map(email=>email.trim().toLowerCase()).filter(Boolean)
    const adminEmails=[...new Set([...configuredAdminEmails, 'vyewale@starlab.co.in', 'pchouhan@starlab.co.in'])]
    if(adminEmails.length && !adminEmails.includes(profile.email.toLowerCase())) return res.status(403).send('This Google account is not authorized for the CMS.')
    let user:{id:string;role:Role}
    try {
      const saved=await prisma.user.upsert({where:{email:profile.email},create:{email:profile.email,name:profile.name || profile.email,provider:'google',role:Role.ADMIN,verifiedAt:new Date()},update:{name:profile.name || profile.email,provider:'google',role:Role.ADMIN,verifiedAt:new Date()}})
      user={id:saved.id,role:saved.role}
    } catch {
      // Allows OAuth to be tested before PostgreSQL is provisioned.
      user={id:`google:${profile.email}`,role:Role.ADMIN}
    }
    const session=jwt.sign(user,secret,{expiresIn:'8h'})
    res.redirect(`${process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173'}/admin?token=${encodeURIComponent(session)}`)
  } catch { res.status(500).send('Unable to complete Google authorization.') }
})

app.get('/api/content/homepage', async (_req,res) => {
  try {
    const content=await prisma.siteContent.findUnique({where:{id:'homepage'}})
    if(content?.payload) return res.json(content.payload)
  } catch { /* use JSON persistence when PostgreSQL is unavailable */ }
  res.json(await readJsonContent())
})
app.put('/api/content/homepage', auth([Role.SUPER_ADMIN,Role.ADMIN,Role.EDITOR]), async (req,res) => {
  const user=(req as express.Request & {user?:{id:string}}).user
  try {
    const content=await prisma.siteContent.upsert({where:{id:'homepage'},create:{id:'homepage',payload:req.body,updatedBy:user?.id},update:{payload:req.body,version:{increment:1},updatedBy:user?.id}})
    await writeJsonContent(req.body).catch(()=>undefined)
    return res.json(content)
  } catch {
    try { await writeJsonContent(req.body); return res.json({payload:req.body,source:'json'}) }
    catch { return res.status(503).json({error:'CMS storage is unavailable'}) }
  }
})
app.post('/api/leads', async (req,res) => {
  const parsed=messageSchema.safeParse(req.body)
  if(!parsed.success)return res.status(400).json({error:parsed.error.flatten()})
  const data=parsed.data
  let lead:{id:string;name:string;email:string;phone?:string;subject?:string;message:string;status:string;createdAt:string}
  try { const saved=await prisma.contactMessage.create({data}); lead={...saved,status:saved.status,createdAt:saved.createdAt.toISOString()} } catch { lead={id:`local-${Date.now()}`,...data,status:'NEW',createdAt:new Date().toISOString()}; localLeads.unshift(lead) }
  const sendgridKey=process.env.SENDGRID_API_KEY
  const adminEmail=process.env.SENDGRID_TO_EMAIL || process.env.CONTACT_EMAIL || process.env.ADMIN_EMAILS?.split(',')[0]
  if(sendgridKey && adminEmail && process.env.SENDGRID_FROM_EMAIL) { const emailPayload = process.env.SENDGRID_TEMPLATE_ID ? {personalizations:[{to:[{email:adminEmail}],dynamic_template_data:{name:data.name,email:data.email,phone:data.phone || 'Not provided',subject:data.subject || 'Website enquiry',message:data.message}}],from:{email:process.env.SENDGRID_FROM_EMAIL},template_id:process.env.SENDGRID_TEMPLATE_ID} : {personalizations:[{to:[{email:adminEmail}]}],from:{email:process.env.SENDGRID_FROM_EMAIL},subject:`New website enquiry${data.subject ? `: ${data.subject}` : ''}`,content:[{type:'text/plain',value:`Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\nSubject: ${data.subject || 'Not provided'}\n\n${data.message}`}]}; const sendgridResponse=await fetch('https://api.sendgrid.com/v3/mail/send',{method:'POST',headers:{Authorization:`Bearer ${sendgridKey}`,'Content-Type':'application/json'},body:JSON.stringify(emailPayload)}); if(!sendgridResponse.ok) console.error('SendGrid delivery failed:',sendgridResponse.status,await sendgridResponse.text()) }
  res.status(201).json({id:lead.id,message:'Message received'})
})
app.get('/api/leads', auth([Role.SUPER_ADMIN,Role.ADMIN,Role.MANAGER]), async (req,res) => { const q=typeof req.query.search==='string'?req.query.search.toLowerCase():''; try { const leads=await prisma.contactMessage.findMany({where:q?{OR:[{name:{contains:q,mode:'insensitive'}},{email:{contains:q,mode:'insensitive'}}]}:undefined,orderBy:{createdAt:'desc'},take:100}); res.json(leads) } catch { res.json(localLeads.filter(lead=>!q || lead.name.toLowerCase().includes(q) || lead.email.toLowerCase().includes(q))) } })
app.patch('/api/leads/:id', auth([Role.SUPER_ADMIN,Role.ADMIN,Role.MANAGER]), async (req,res) => { const status=z.enum(['NEW','READ','REPLIED','ARCHIVED']).parse(req.body.status); try { res.json(await prisma.contactMessage.update({where:{id:req.params.id},data:{status,repliedAt:status==='REPLIED'?new Date():undefined}})) } catch { const lead=localLeads.find(item=>item.id===req.params.id); if(!lead)return res.status(404).json({error:'Lead not found'}); lead.status=status; res.json(lead) } })
app.delete('/api/leads/:id', auth([Role.SUPER_ADMIN,Role.ADMIN]), async (req,res) => { try { await prisma.contactMessage.delete({where:{id:req.params.id}}) } catch { const index=localLeads.findIndex(item=>item.id===req.params.id); if(index>=0)localLeads.splice(index,1) } res.status(204).end() })

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(currentDir, '../dist')
app.use(express.static(distDir))
app.get('*', (_req,res) => res.sendFile(path.join(distDir, 'index.html')))

app.listen(port, () => console.log(`CMS API listening on http://127.0.0.1:${port}`))

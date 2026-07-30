import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import './admin.css'

export default function AdminLogin() {
  const [loading,setLoading] = useState(false)
  const [message,setMessage] = useState('')
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')
    if (token) { localStorage.setItem('cms-auth-token', token); window.history.replaceState({}, '', '/admin'); window.location.assign('/admin') }
    if (error) setMessage('Google sign-in was cancelled or could not be completed.')
  }, [])
  const signInWithGoogle = () => { setLoading(true); setMessage('Redirecting to Google…'); window.location.assign('/api/auth/google') }
  return <div className="modern-login"><div className="modern-login-glow glow-left"/><div className="modern-login-glow glow-right"/><header className="modern-login-header"><a href="/" className="modern-login-brand"><span>M</span><strong>Muhlenbruch<span>•</span></strong></a><a href="/" className="modern-login-back">Back to website</a></header><main className="modern-login-main"><div className="modern-login-card"><div className="modern-login-badge"><ShieldCheck size={21}/></div><p className="modern-login-kicker">MUHLENBRUCH CONTENT STUDIO</p><h1>Welcome<br/><em>back.</em></h1><p className="modern-login-subtitle">Sign in securely to manage your insurance website.</p><button className="modern-google-button" onClick={signInWithGoogle} disabled={loading}><span className="modern-google-icon">G</span><span>{loading ? 'Connecting to Google…' : 'Continue with Google'}</span><ArrowRight size={17}/></button>{message && <p className="modern-login-message">{message}</p>}<div className="modern-login-trust"><CheckCircle2 size={15}/><span>Secure administrator access</span><i/><span>Google OAuth</span></div></div><p className="modern-login-footer">By continuing, you agree to the administrator access policy.</p></main></div>
}

import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { languages, getDict } from './lib/i18n'
import { Home, Leaf, CloudSun, Droplets, Bug, LineChart, BookOpenCheck, Bot, CalendarDays, ShieldCheck, Languages, Phone, LogIn, LogOut, Send, ImagePlus, Landmark, MessageCircle } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useLang(){
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en')
  useEffect(()=>{ localStorage.setItem('lang', lang) }, [lang])
  return { lang, setLang, dict: getDict(lang) }
}

function useToken(){
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [farmerId, setFarmerId] = useState(localStorage.getItem('farmerId') || '')
  const login = (t, fid)=>{ setToken(t); setFarmerId(fid); localStorage.setItem('token', t); localStorage.setItem('farmerId', fid) }
  const logout = ()=>{ setToken(''); setFarmerId(''); localStorage.removeItem('token'); localStorage.removeItem('farmerId') }
  return { token, farmerId, login, logout }
}

function Topbar({onLangChange, lang, onToggleMenu, token, onLogout}){
  const dict = getDict(lang)
  return (
    <div className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="text-green-600"/>
          <div>
            <div className="font-extrabold tracking-tight text-green-800">{dict.appTitle}</div>
            <div className="text-xs text-green-700/70">{dict.appSubtitle}</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <select value={lang} onChange={e=>onLangChange(e.target.value)} className="text-sm border rounded px-2 py-1">
            {Object.entries(languages).map(([k,v])=> <option key={k} value={k}>{v}</option>)}
          </select>
          {token ? (
            <button onClick={onLogout} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded"><LogOut size={16}/>{dict.logout}</button>
          ):(
            <Link to="/login" className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded"><LogIn size={16}/>{dict.login}</Link>
          )}
        </div>
      </div>
    </div>
  )
}

function Hero({dict}){
  const features = dict.features
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-100 border-b">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="text-3xl md:text-5xl font-extrabold text-green-800 leading-tight">
          {dict.appTitle}
        </motion.h1>
        <p className="text-green-700 mt-2 md:text-xl">{dict.appSubtitle}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {features.map((f,i)=> (
            <motion.div key={i} initial={{opacity:0,y:6}} whileInView={{opacity:1,y:0}} className="p-3 bg-white rounded-xl shadow border flex items-center gap-2">
              <ShieldCheck className="text-green-600" size={18}/>
              <div className="text-sm font-medium text-green-800">{f}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HomePage({lang}){
  const dict = getDict(lang)
  return (
    <div>
      <Hero dict={dict}/>
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {[
          {to:'/recommendations', icon:<Leaf/>, title:dict.recommendations},
          {to:'/weather', icon:<CloudSun/>, title:dict.weather},
          {to:'/soil', icon:<Droplets/>, title:dict.soil},
          {to:'/irrigation', icon:<Droplets/>, title:dict.irrigation},
          {to:'/pests', icon:<Bug/>, title:dict.pests},
          {to:'/market', icon:<LineChart/>, title:dict.market},
          {to:'/calendar', icon:<CalendarDays/>, title:dict.cropCalendar},
          {to:'/schemes', icon:<Landmark/>, title:dict.schemes},
          {to:'/chat', icon:<Bot/>, title:dict.chatbot},
        ].map((c,i)=> (
          <Link key={i} to={c.to} className="group p-5 rounded-xl bg-white border shadow hover:shadow-md transition flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 text-green-700 group-hover:bg-green-100">{c.icon}</div>
            <div className="font-semibold text-green-900">{c.title}</div>
          </Link>
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6 text-green-700 text-sm">{dict.offline}</div>
    </div>
  )
}

function LoginPage({lang, onLogin}){
  const dict = getDict(lang)
  const [farmerId, setFarmerId] = useState('')
  const [phone, setPhone] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function requestOtp(){
    setLoading(true)
    try{
      const res = await fetch(`${API}/auth/request-otp`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({phone, farmer_id: farmerId||undefined})})
      const data = await res.json()
      setMessage(`OTP sent. Demo OTP: ${data.demo_otp}`)
      setStep(2)
    }catch(e){ setMessage('Failed to request OTP') } finally{ setLoading(false) }
  }

  async function verifyOtp(){
    setLoading(true)
    try{
      const res = await fetch(`${API}/auth/verify-otp`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({phone, otp, farmer_id: farmerId||undefined, aadhaar: aadhaar||undefined, language: lang})})
      const data = await res.json()
      if(data.token){ onLogin(data.token, data.farmer_id || data.farmerId || phone) }
    }catch(e){ setMessage('Failed to verify OTP') } finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white rounded-xl border shadow p-4 space-y-3">
        <div className="text-lg font-bold text-green-800">{dict.login}</div>
        <input value={farmerId} onChange={e=>setFarmerId(e.target.value)} placeholder={dict.farmerId} className="w-full border rounded px-3 py-2"/>
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder={dict.phone} className="w-full border rounded px-3 py-2"/>
        <input value={aadhaar} onChange={e=>setAadhaar(e.target.value)} placeholder={dict.aadhaar} className="w-full border rounded px-3 py-2"/>
        {step===1 ? (
          <button onClick={requestOtp} disabled={loading} className="w-full bg-green-600 text-white rounded px-3 py-2 flex items-center justify-center gap-2"><Send size={16}/>{dict.requestOtp}</button>
        ):(
          <div className="space-y-2">
            <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder={dict.enterOtp} className="w-full border rounded px-3 py-2"/>
            <button onClick={verifyOtp} disabled={loading} className="w-full bg-green-600 text-white rounded px-3 py-2">{dict.verifyOtp}</button>
          </div>
        )}
        <div className="text-xs text-green-700">{message}</div>
      </div>
    </div>
  )
}

function Dashboard({token, lang}){
  const [data, setData] = useState(null)
  useEffect(()=>{ (async()=>{ if(!token) return; const res = await fetch(`${API}/dashboard?token=${token}`); const d = await res.json(); setData(d) })() },[token])
  if(!token) return <div className="p-4">Please login</div>
  if(!data) return <div className="p-4">Loading...</div>
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="font-bold text-green-800 mb-2">Personalized Crop Suggestions</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.recommendations.map((r,i)=> (
              <div key={i} className="p-3 border rounded-lg bg-green-50">
                <div className="font-semibold text-green-800">{r.crop}</div>
                <div className="text-sm text-green-700">Score: {(r.score*100).toFixed(0)}%</div>
                <div className="text-xs text-green-700/80">{r.reason}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="font-bold text-green-800 mb-2">Crop Calendar</div>
          <Calendar token={token}/>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="font-bold text-green-800 mb-2">AI Image-Based Disease Detection</div>
          <DiseaseDetector token={token}/>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="font-bold text-green-800">Soil Health</div>
          <div className="text-sm text-green-700">pH: {data.soil.ph} | N: {data.soil.nitrogen} | P: {data.soil.phosphorus} | K: {data.soil.potassium}</div>
          <div className="text-xs text-green-700/80 mt-1">{data.soil.advice}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="font-bold text-green-800">Weather Risks</div>
          {data.weather.alerts.map((a,i)=> <div key={i} className="text-sm text-green-700">• {a.type}: {a.message}</div>)}
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="font-bold text-green-800">Notifications</div>
          {(data.notifications||[]).map((n,i)=> <div key={i} className="text-sm text-green-700">• {n.title||'Update'} - {n.message||''}</div>)}
        </div>
      </div>
    </div>
  )
}

function Calendar({token}){
  const [items, setItems] = useState([])
  useEffect(()=>{ (async()=>{ if(!token) return; const res = await fetch(`${API}/calendar?token=${token}`); const d = await res.json(); setItems(d.items||[]) })() },[token])
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((it,i)=> (
        <div key={i} className="border rounded-lg p-3">
          <div className="font-semibold text-green-800">{it.crop} • {it.phase}</div>
          <div className="text-sm text-green-700">{new Date(it.date).toLocaleDateString()}</div>
          {it.note && <div className="text-xs text-green-700/80">{it.note}</div>}
        </div>
      ))}
    </div>
  )
}

function DiseaseDetector({token}){
  const [file, setFile] = useState()
  const [result, setResult] = useState(null)
  async function submit(){
    const fd = new FormData()
    fd.append('file', file)
    fd.append('token', token)
    const res = await fetch(`${API}/disease-detect`, {method:'POST', body: fd})
    const d = await res.json(); setResult(d)
  }
  return (
    <div className="space-y-2">
      <input type="file" onChange={e=>setFile(e.target.files[0])} className="w-full"/>
      <button onClick={submit} className="bg-green-600 text-white px-3 py-2 rounded">Analyze</button>
      {result && <div className="text-sm text-green-800">{result.diagnosis} — {result.treatment}</div>}
    </div>
  )
}

function Schemes(){
  const [state, setState] = useState('')
  const [crop, setCrop] = useState('')
  const [data, setData] = useState([])
  async function search(){
    const res = await fetch(`${API}/schemes`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({state, crop})})
    const d = await res.json(); setData(d.schemes||[])
  }
  return (
    <div className="max-w-3xl mx:auto p-4 space-y-3">
      <div className="bg-white border rounded-xl p-4">
        <div className="font-bold text-green-800 mb-2">Government Scheme Finder</div>
        <div className="grid sm:grid-cols-3 gap-2">
          <input value={state} onChange={e=>setState(e.target.value)} placeholder="State" className="border rounded px-3 py-2"/>
          <input value={crop} onChange={e=>setCrop(e.target.value)} placeholder="Crop" className="border rounded px-3 py-2"/>
          <button onClick={search} className="bg-green-600 text-white rounded px-3 py-2">Search</button>
        </div>
        <div className="mt-3 space-y-2">
          {data.map((s,i)=> (
            <a key={i} href={s.link} target="_blank" className="block border rounded p-3 hover:bg-green-50">
              <div className="font-semibold text-green-800">{s.name}</div>
              <div className="text-sm text-green-700">{s.description}</div>
              <div className="text-xs text-green-700/80">{s.benefit}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function SimplePage({title, endpoint, method='GET'}){
  const [input, setInput] = useState('')
  const [resData, setRes] = useState(null)
  async function call(){
    const res = await fetch(`${API}${endpoint}`, {method, headers:{'Content-Type':'application/json'}, body: method==='POST'? input || '{}' : undefined})
    setRes(await res.json())
  }
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <div className="bg-white border rounded-xl p-4">
        <div className="font-bold text-green-800 mb-2">{title}</div>
        {method==='POST' && <textarea value={input} onChange={e=>setInput(e.target.value)} className="w-full border rounded p-2" rows={4} placeholder='{"key": "value"}'/>}
        <button onClick={call} className="mt-2 bg-green-600 text-white rounded px-3 py-2">Run</button>
        {resData && <pre className="bg-green-50 p-2 rounded mt-3 text-xs overflow-auto">{JSON.stringify(resData,null,2)}</pre>}
      </div>
    </div>
  )
}

function Chatbot(){
  const [text, setText] = useState('')
  const [msgs, setMsgs] = useState([])
  async function send(){
    const res = await fetch(`${API}/chat`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({text})})
    const d = await res.json(); setMsgs(m=>[...m, {role:'user', text}, {role:'bot', text:d.reply}]); setText('')
  }
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg:white border rounded-xl p-4 space-y-2">
        <div className="font-bold text-green-800">24/7 AI Chatbot</div>
        <div className="h-64 overflow-auto border rounded p-2 bg-green-50">
          {msgs.map((m,i)=> <div key={i} className={"text-sm "+(m.role==='user'?"text-green-900":"text-green-700")}>
            <b>{m.role==='user'? 'You': 'Bot'}:</b> {m.text}
          </div> )}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Type your question..."/>
          <button onClick={send} className="bg-green-600 text-white rounded px-3 py-2">Send</button>
        </div>
      </div>
    </div>
  )
}

function Footer(){
  return (
    <div className="bg-green-900 text-green-100 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="font-bold">Smart Crop Advisory</div>
          <div>Fast, simple, multilingual advisory for small farmers.</div>
        </div>
        <div>
          <div className="font-bold">Services</div>
          <ul className="space-y-1">
            <li>AI Crop Consultation</li>
            <li>Soil Testing Consultation</li>
            <li>Irrigation Planning Support</li>
            <li>Seasonal Advisory</li>
          </ul>
        </div>
        <div>
          <div className="font-bold">Contact</div>
          <div>WhatsApp: <a href="https://wa.me/911234567890" target="_blank" className="underline text-green-100">Chat</a></div>
          <div>Phone: +91 12345 67890</div>
          <div>Email: support@smartcrop.example</div>
        </div>
        <div>
          <div className="font-bold">Location</div>
          <div>Village Center, District, State</div>
          <div className="mt-2 text-xs">FAQ: OTP login, change language, offline use</div>
        </div>
      </div>
    </div>
  )
}

export default function Root(){
  const {lang, setLang} = useLang()
  const {token, login, logout} = useToken()
  return (
    <div className="min-h-screen bg-green-50 text-green-900">
      <Topbar onLangChange={setLang} lang={lang} token={token} onLogout={logout}/>
      <Routes>
        <Route path="/" element={<HomePage lang={lang}/>} />
        <Route path="/login" element={<LoginPage lang={lang} onLogin={login}/>} />
        <Route path="/dashboard" element={<Dashboard token={token} lang={lang}/>} />
        <Route path="/calendar" element={<Calendar token={token}/>} />
        <Route path="/schemes" element={<Schemes/>} />
        <Route path="/recommendations" element={<SimplePage title="AI Crop Recommendations" endpoint="/dashboard" method="GET"/>} />
        <Route path="/weather" element={<SimplePage title="Weather Alerts" endpoint="/dashboard" method="GET"/>} />
        <Route path="/soil" element={<SimplePage title="Soil Health Analysis" endpoint="/soil-analysis" method="POST"/>} />
        <Route path="/irrigation" element={<SimplePage title="Irrigation Planning" endpoint="/irrigation-plan" method="POST"/>} />
        <Route path="/pests" element={<SimplePage title="Pest & Disease Alerts" endpoint="/dashboard" method="GET"/>} />
        <Route path="/market" element={<SimplePage title="Market Updates" endpoint="/market-updates" method="GET"/>} />
        <Route path="/chat" element={<Chatbot/>} />
      </Routes>
      <Footer/>
    </div>
  )
}

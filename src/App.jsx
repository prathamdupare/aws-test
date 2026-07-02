import { useState } from 'react'
import reactLogo from './assets/react.svg'

import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function App() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState([])

  const ping = async () => {
      const ts = new Date().toLocaleTimeString()
    setLogs((l) => [...l, `[${ts}] → GET ${API_URL}/api/health`])
    try {
      const res = await fetch(`${API_URL}/api/health`)

      const data = await res.json()
      setLogs((l) => [
        ...l,
        `[${ts}] ← ${res.status} ${JSON.stringify(data)}`,
      ])
    } catch (err) {
      setLogs((l) => [...l, `[${ts}] × ${err.message}`])
    }
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <p>Frontend ↔ Backend smoke test</p>
          <p>Click ping to call <code>{API_URL}/api/health</code></p>
        </div>
        <div className="buttons">
          <button
            type="button"
            className="counter"
            onClick={() => setCount((count) => count + 1)}>
                                                             Count is {count}
          </button>
          <button type="button" className="ping" onClick={ping}>
                                                                  Ping Backend
          </button>
        </div>
        <pre className="logs">
          {logs.length === 0 ? 'no requests yet' : logs.join('\n')}
        </pre>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
      </section>

    </>
  )
}

export default App;

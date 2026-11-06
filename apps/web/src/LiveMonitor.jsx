import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, RefreshCw, ShieldAlert, Square, Monitor, CheckCircle2 } from 'lucide-react';
import './monitor.css';

const API = 'http://127.0.0.1:8000';
const INTERVAL_MS = 15000;

function messageOf(error) {
  return error?.message || 'Unable to analyse the selected screen.';
}

export default function LiveMonitor() {
  const [sources, setSources] = useState([]);
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('idle');
  const [model, setModel] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const busyRef = useRef(false);
  const stoppingRef = useRef(false);
  const controllerRef = useRef(null);
  const liveRef = useRef(false);
  const isElectron = Boolean(window.heybuddy?.listCaptureSources);

  async function refresh() {
    try {
      if (isElectron) {
        const items = await window.heybuddy.listCaptureSources();
        setSources(items);
        setSource((value) => items.some(item => item.id === value) ? value : '');
      }
      const response = await fetch(API + '/api/ollama');
      if (response.ok) setModel(await response.json());
    } catch {
      setModel({ connected: false, model_installed: false });
    }
  }

  useEffect(() => {
    refresh();
    return () => stop();
    // Unmount ends sharing. On-demand permission, never background monitoring.
  }, []);

  function stop() {
    window.heybuddy?.setRiskAlert?.(false);
    stoppingRef.current = true;
    liveRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    busyRef.current = false;
    setActive(false);
    setStatus('idle');
  }

  async function scanFrame() {
    if (busyRef.current || !liveRef.current || !videoRef.current) return;
    if (videoRef.current.readyState < 2) return;
    busyRef.current = true;
    setStatus('analysing');
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const video = videoRef.current;
      const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      const image_base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      const response = await fetch(API + '/api/analyze/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64 }),
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.detail || 'Local AI analysis failed.');
      if (liveRef.current) {
        setResult(payload);
        window.heybuddy?.setRiskAlert?.(payload.has_concern === true);
        setCount(value => value + 1);
        setError('');
      }
    } catch (e) {
      if (e.name !== 'AbortError' && liveRef.current) setError(messageOf(e));
    } finally {
      busyRef.current = false;
      if (liveRef.current) setStatus('watching');
    }
  }

  async function start() {
    if (liveRef.current) return;
    setError('');
    setResult(null);
    setCount(0);
    try {
      if (isElectron) {
        if (!source) {
          setError('Choose a screen or conversation window first.');
          return;
        }
        const ok = await window.heybuddy.chooseCaptureSource(source);
        if (!ok) throw new Error('Window is no longer available. Refresh the source list.');
      }
      // A real user click initiates all screen captures.
      // In browsers, the native picker asks which source to share.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 1 },
        audio: false,
      });
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      videoRef.current = video;
      streamRef.current = stream;
      stream.getVideoTracks()[0]?.addEventListener('ended', stop, { once: true });
      await video.play();
      stoppingRef.current = false;
      liveRef.current = true;
      setActive(true);
      setStatus('watching');
      scanFrame();
      timerRef.current = setInterval(scanFrame, INTERVAL_MS);
    } catch (e) {
      stop();
      if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') {
        setError('Screen capture failed: ' + messageOf(e));
      }
    }
  }

  return (
    <section className="monitor-panel" aria-label="Local screen protection">
      <div className="monitor-head">
        <div className="monitor-heading"><span className="monitor-symbol"><Monitor size={21}/></span><div><h2>Screen Protection</h2><p>Read visible conversations locally, while you choose to share them.</p></div></div>
        <span className={'monitor-state' + (active ? ' monitor-state--on' : '')}>{active ? 'Sharing active' : 'Off'}</span>
      </div>
      <p className="monitor-explain">
        Select a conversation window, then start. HeyBuddy scans the visible image about every 15 seconds through local Ollama. Nothing is recorded or uploaded to a cloud service by this feature. Voice messages are not analysed yet.
      </p>
      {isElectron && (
        <div className="monitor-select">
          <label htmlFor="monitor-source">Choose the window or screen to share</label>
          <div className="monitor-select-row">
            <select id="monitor-source" value={source} onChange={e => setSource(e.target.value)} disabled={active}>
              <option value="">Select a source…</option>
              {sources.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <button onClick={refresh} disabled={active} aria-label="Refresh windows"><RefreshCw size={18}/></button>
          </div>
        </div>
      )}
      <div className="monitor-actions">
        {!active ? <button className="monitor-start" onClick={start}><Eye size={18}/> Start screen protection</button> :
          <button className="monitor-stop" onClick={stop}><Square size={16}/> Stop sharing</button>}
        <span>{status === 'analysing' ? 'Buddy is checking…' : active ? 'Monitoring visible content only' : 'Screen access is off'}</span>
      </div>
      <div className="monitor-model">{model?.connected ? <CheckCircle2 size={15} /> : <EyeOff size={15}/>}
        {model ? (model.connected ? (model.model_installed ? 'Ollama ready · ' + model.model : 'Download ' + model.model + ' before analysis') : 'Ollama is offline or backend unavailable') : 'Checking local Ollama connection…'}
      </div>
      {error && <div className="monitor-error" role="alert">{error}</div>}
      {result && (
        <div className={'monitor-result monitor-result--' + (result.has_concern ? 'warning' : 'normal')} role="status">
          <div className="monitor-result-title"><ShieldAlert size={19}/><strong>{result.has_concern ? 'Possible warning signs found' : 'No clear warning signs identified'}</strong></div>
          <p><strong>{result.category} · {result.risk_level}</strong> — {result.summary}</p>
          {result.evidence?.length > 0 && <ul>{result.evidence.map((text,i)=><li key={i}>{text}</li>)}</ul>}
          <p><strong>Suggested action:</strong> {result.suggested_action}</p>
          <small>AI assessment is uncertain and may miss context. It is not a guarantee of safety or proof of wrongdoing. Frames analysed this session: {count}.</small>
        </div>
      )}
    </section>
  );
}

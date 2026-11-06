import { useEffect, useState } from 'react';
import {
  Activity, ArrowRight, CheckCircle2, CircleHelp, Heart, Home, LockKeyhole,
  MessageCircleMore, MicOff, MonitorOff, Shield, ShieldAlert, ShieldCheck,
  Sparkles, UserRound, Wifi, WifiOff, X,
} from 'lucide-react';

const scenarios = {
  scam: {
    label: 'Scam',
    speaker: 'Unknown sender',
    message: 'You won 5,000 game credits! Verify your account by logging in at this link in the next 10 minutes.',
    title: 'Possible phishing or reward scam',
    clues: [
      'A prize you did not expect is being used as bait.',
      'The sender creates urgency with a 10-minute deadline.',
      'A login link could be designed to steal your account information.',
    ],
    advice: 'Do not open the link or enter a password. Check the promotion through the game’s official website or app.',
  },
  grooming: {
    label: 'Grooming',
    speaker: 'Online gaming friend',
    message: 'You are so mature for your age. Send me your address, and keep this between us, okay?',
    title: 'Possible boundary-crossing or grooming behaviour',
    clues: [
      'The person is asking for sensitive personal information.',
      'They are encouraging secrecy from people you trust.',
      'Flattery can sometimes be used to lower someone’s guard.',
    ],
    advice: 'Do not share your address. Consider stopping the conversation and talking to a trusted adult or support person.',
  },
  bullying: {
    label: 'Cyberbullying',
    speaker: 'Group chat participant',
    message: 'Everybody thinks you are a loser. We are posting your photo so everyone can laugh at you.',
    title: 'Possible cyberbullying and harassment',
    clues: [
      'The message targets someone with degrading insults.',
      'It threatens public humiliation through sharing a photo.',
      'Group pressure can make online harassment escalate.',
    ],
    advice: 'You do not need to respond. Save relevant evidence safely, use platform reporting tools, and seek support.',
  },
};

const features = [
  { icon: MonitorOff, title: 'Screen monitoring', detail: 'Not active in this prototype', tone: 'muted' },
  { icon: MicOff, title: 'Voice activation', detail: 'Not active in this prototype', tone: 'muted' },
  { icon: LockKeyhole, title: 'Private by design', detail: 'No input is uploaded by this interface', tone: 'mint' },
];

function Buddy({ mood = 'happy', size = 'large' }) {
  return (
    <div className={'buddy buddy--' + size + ' buddy--' + mood} role="img" aria-label="Original purple HeyBuddy mascot">
      <div className="buddy__antenna"><span /></div>
      <div className="buddy__body">
        <div className="buddy__cheek buddy__cheek--left" />
        <div className="buddy__cheek buddy__cheek--right" />
        <div className="buddy__eye buddy__eye--left" />
        <div className="buddy__eye buddy__eye--right" />
        <div className="buddy__mouth" />
      </div>
      <div className="buddy__shadow" />
    </div>
  );
}

function App() {
  const [page, setPage] = useState('home');
  const [selected, setSelected] = useState('scam');
  const [revealed, setRevealed] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [noticeOpen, setNoticeOpen] = useState(true);
  const scenario = scenarios[selected];

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    fetch('http://127.0.0.1:8000/health', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unavailable');
        return response.json();
      })
      .then((data) => setApiStatus(data.status === 'ok' ? 'online' : 'offline'))
      .catch(() => setApiStatus('offline'))
      .finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  const navigation = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'check', label: 'Safety preview', icon: ShieldAlert },
    { id: 'buddy', label: 'My buddy', icon: UserRound },
    { id: 'privacy', label: 'Privacy', icon: LockKeyhole },
  ];

  function selectScenario(id) {
    setSelected(id);
    setRevealed(false);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage('home')} aria-label="Go to overview">
          <span className="brand__icon"><ShieldCheck size={22} strokeWidth={2.5} /></span>
          <span className="brand__name">HeyBuddy<span className="brand__dot">.</span><small>YOUR ONLINE SAFETY PAL</small></span>
        </button>

        <span className="sidebar__section">WORKSPACE</span>
        <nav aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={'nav-item' + (page === id ? ' nav-item--active' : '')} onClick={() => setPage(id)}>
              <Icon size={18} /><span>{label}</span>
              {page === id && <span className="nav-item__point" />}
            </button>
          ))}
        </nav>

        <div className="sidebar__bottom">
          <div className="privacy-note">
            <span className="privacy-note__icon"><LockKeyhole size={17} /></span>
            <strong>Privacy comes first</strong>
            <span>Camera, mic and screen access are off.</span>
          </div>
          <div className="version"><span className="online-dot" /> Prototype v0.1 <span>LOCAL-FIRST</span></div>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <span className="topbar__breadcrumb">HeyBuddy <span>/</span> {navigation.find((item) => item.id === page)?.label}</span>
          <div className="topbar__right"><span className="topbar__preview">EARLY PREVIEW</span><div className="topbar__avatar">B</div></div>
        </div>

        {page === 'home' && (
          <>
            <div className="greeting"><p className="eyebrow"><Sparkles size={15} /> YOUR DIGITAL SAFE SPACE</p><h1>Hey there, friend <span aria-hidden="true">✳</span></h1><p>Meet your new sidekick for navigating the internet with confidence.</p></div>

            <section className="hero">
              <div className="hero__glow hero__glow--one" /><div className="hero__glow hero__glow--two" />
              <div className="hero__copy">
                <div className="hero__chip"><span className="spark-dot" /> INTRODUCING YOUR ONLINE BUDDY</div>
                <h2>Online feels better<br />when you've got a <em>buddy.</em></h2>
                <p>Spot red flags, understand tricky situations, and make safer choices — with a friendly face by your side.</p>
                <button className="hero__button" onClick={() => setPage('check')}>Explore the preview <ArrowRight size={17} /></button>
              </div>
              <div className="hero__art"><div className="hero__bubble hero__bubble--left"><Heart size={20} fill="currentColor" /></div><Buddy /><div className="hero__bubble hero__bubble--right"><ShieldCheck size={20} /></div></div>
            </section>

            <div className="section-heading"><div><h3>Let's explore</h3><p>Get a feel for what HeyBuddy will do.</p></div><span className="tiny-pill">STEP 1 · FOUNDATION</span></div>

            <div className="overview-grid">
              <button className="feature-card" onClick={() => setPage('check')}><span className="feature-icon feature-icon--purple"><MessageCircleMore size={22} /></span><h4>Try a scenario</h4><p>See examples of scams, grooming and bullying, with prewritten safety guidance.</p><span className="feature-link">Explore sample <ArrowRight size={16} /></span></button>
              <button className="feature-card" onClick={() => setPage('buddy')}><span className="feature-icon feature-icon--peach"><Heart size={22} /></span><h4>Meet Buddy</h4><p>Get to know the animated companion we're building to make safety feel approachable.</p><span className="feature-link">Say hello <ArrowRight size={16} /></span></button>
              <button className="feature-card" onClick={() => setPage('privacy')}><span className="feature-icon feature-icon--mint"><LockKeyhole size={22} /></span><h4>Your privacy</h4><p>Learn what's active today — and why screen and microphone permissions stay off.</p><span className="feature-link">View details <ArrowRight size={16} /></span></button>
            </div>
          </>
        )}

        {page === 'check' && (
          <section className="page-panel">
            <div className="page-heading"><p className="eyebrow"><ShieldAlert size={15} /> EXPLORE THE FUTURE</p><h1>Safety check preview</h1><p>Choose a fictional example to see the kinds of red flags HeyBuddy will explain.</p></div>
            {noticeOpen && <div className="notice"><CircleHelp size={20} /><span><strong>This is a scripted demo, not AI detection.</strong> Real Ollama analysis will be added in the next development step.</span><button onClick={() => setNoticeOpen(false)} aria-label="Dismiss notice"><X size={18}/></button></div>}
            <div className="scenario-tabs" role="group" aria-label="Choose sample scenario">
              {Object.entries(scenarios).map(([id, item]) => <button key={id} className={id === selected ? 'scenario-tab scenario-tab--active' : 'scenario-tab'} onClick={() => selectScenario(id)}>{item.label}</button>)}
            </div>
            <div className="chat-card"><div className="chat-card__top"><span className="chat-card__dot" /> SAMPLE CONVERSATION <span>FICTIONAL</span></div><div className="sender"><span className="sender__avatar">?</span><strong>{scenario.speaker}</strong></div><div className="chat-bubble">{scenario.message}</div><div className="chat-card__bottom"><LockKeyhole size={15} /> No messages are being captured or monitored.</div></div>
            {!revealed ? (
              <button className="primary-button" onClick={() => setRevealed(true)}><Shield size={18} /> Show Buddy's sample guidance <ArrowRight size={17} /></button>
            ) : (
              <div className="analysis-card"><div className="analysis-card__header"><Buddy size="small" mood="concerned" /><div><span>HEYBUDDY · PREWRITTEN EXAMPLE</span><h3>{scenario.title}</h3></div></div><h4>What stands out?</h4><ul>{scenario.clues.map((clue) => <li key={clue}><CheckCircle2 size={17} />{clue}</li>)}</ul><div className="advice"><strong>Safer next step</strong><p>{scenario.advice}</p></div><small>Example only. These clues are not a verdict about any real person.</small></div>
            )}
          </section>
        )}

        {page === 'buddy' && (
          <section className="page-panel">
            <div className="page-heading"><p className="eyebrow"><Heart size={15} /> YOUR PERSONAL COMPANION</p><h1>Meet Buddy</h1><p>A friendly, original character who will help explain online risks without judgment.</p></div>
            <div className="buddy-feature"><div className="buddy-feature__figure"><Buddy /></div><div><span className="tiny-pill">ORIGINAL CHARACTER · FIRST DRAFT</span><h2>Hi, I'm Buddy!</h2><p>I'm here to make online safety easier to understand. Eventually you'll be able to talk to me, ask questions, and customise how I look and sound.</p><div className="feature-tags"><span>Friendly</span><span>Privacy-first</span><span>No judgment</span></div><p className="muted-small">Voice output, wake words and a floating desktop overlay are planned, not active yet.</p></div></div>
          </section>
        )}

        {page === 'privacy' && (
          <section className="page-panel">
            <div className="page-heading"><p className="eyebrow"><LockKeyhole size={15} /> YOU STAY IN CONTROL</p><h1>Privacy & local status</h1><p>This first build does not collect conversations or record your screen or microphone.</p></div>
            <div className="status-panel"><div className="status-panel__header"><h3>System status</h3><span className="tiny-pill">LOCAL DEVICE</span></div>
              <div className="status-row"><span className="status-row__icon"><Activity size={19}/></span><div><strong>React interface</strong><p>Running in your browser or desktop shell</p></div><span className="status-label status-label--ok">Active</span></div>
              <div className="status-row"><span className="status-row__icon"><span>{apiStatus === 'online' ? <Wifi size={19}/> : <WifiOff size={19}/>}</span></span><div><strong>Local FastAPI service</strong><p>127.0.0.1:8000 · only accessible on your computer by default</p></div><span className={'status-label status-label--' + (apiStatus === 'online' ? 'ok' : 'off')}>{apiStatus === 'online' ? 'Connected' : apiStatus === 'checking' ? 'Checking' : 'Not running'}</span></div>
              <div className="status-row"><span className="status-row__icon"><Shield size={19}/></span><div><strong>Ollama AI</strong><p>Integration planned for Step 3</p></div><span className="status-label status-label--off">Not configured</span></div>
            </div>
            <div className="permissions-grid">{features.map(({ icon: Icon, title, detail, tone }) => <div className="permission" key={title}><span className={'feature-icon feature-icon--' + tone}><Icon size={20} /></span><strong>{title}</strong><p>{detail}</p></div>)}</div>
          </section>
        )}

        <footer className="footer"><span><ShieldCheck size={16} /> HeyBuddy · Privacy-first prototype</span><span>Made to help people recognise online harm, not make accusations.</span></footer>
      </main>
    </div>
  );
}

export default App;

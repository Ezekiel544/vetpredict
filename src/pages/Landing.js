import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMarkets } from '../services/api';
import Heroimg from './heroimg.png';
import './global.css';
import Poozimg from './pooz_logo.png';
// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatTimeLeft(closesAt) {
  if (!closesAt) return 'Live';

  const closeTime = new Date(closesAt).getTime();

  if (Number.isNaN(closeTime)) return 'Live';

  const ms = closeTime - Date.now();

  if (ms <= 0) return 'Closed';

  const h = Math.floor(ms / 3600000);
  const d = Math.floor(ms / 86400000);
  const mo = Math.floor(d / 30);
  const yr = Math.floor(d / 365);

  if (yr >= 1) return `${yr}y left`;
  if (mo >= 1) return `${mo}mo left`;
  if (d >= 1) return `${d}d left`;

  return `${h}h left`;
}

const isMobile = () => {
  if (typeof navigator === 'undefined') return false;

  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// ─────────────────────────────────────────────────────────────
// STATIC MARKETS
// ─────────────────────────────────────────────────────────────

const STATIC_MARKETS = [
  {
    _id: '1',
    category: 'Crypto',
    title: 'Will Bitcoin close above $120,000 this month?',
    yesPercent: 68,
    pool: '42,860 VET',
  },
  {
    _id: '2',
    category: 'Sports',
    title: 'Will Arsenal win their next Premier League match?',
    yesPercent: 74,
    pool: '18,240 VET',
  },
  {
    _id: '3',
    category: 'Entertainment',
    title: "Will this film win Best Picture at next year's awards?",
    yesPercent: 41,
    pool: '9,670 VET',
  },
  {
    _id: '4',
    category: 'Politics',
    title: 'Will the proposed trade bill pass this quarter?',
    yesPercent: 57,
    pool: '24,110 VET',
  },
  {
    _id: '5',
    category: 'Gaming',
    title: 'Will the new release reach one million players?',
    yesPercent: 82,
    pool: '12,890 VET',
  },
  {
    _id: '6',
    category: 'Stocks',
    title: 'Will the index finish the week in green?',
    yesPercent: 53,
    pool: '31,420 VET',
  },
];

const FILTERS = [
  'All',
  'Sports',
  'Crypto',
  'Entertainment',
  'Politics',
  'Gaming',
  'Stocks',
];

// ─────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────

const FAQS = [
  [
    'What is Pooz?',
    'Pooz is a decentralised prediction market built on VeChain. Predict real-world outcomes and earn VET when you are right.',
  ],
  [
    'Are my funds safe?',
    'Pooz is non-custodial: your funds stay in your wallet and every transaction is transparent on-chain. We never hold your assets.',
  ],
  [
    'What are the fees?',
    'Pooz charges a flat 1.5% platform fee on winnings only. No subscription, no deposit fees, no hidden charges.',
  ],
  [
    'How are markets resolved?',
    'A combination of trusted oracles and decentralised verification determines outcomes, then smart contracts distribute payouts automatically within seconds.',
  ],
  [
    'Can I create my own market?',
    'Yes. Verified users can propose markets through the DAO. Approved markets go live within 24 hours and earn a share of platform fees.',
  ],
  [
    'Which wallets are supported?',
    'VeWorld is the native wallet. You can also sign in with Google or email — we create a managed VeChain wallet for you automatically.',
  ],
];

// ─────────────────────────────────────────────────────────────
// ROTATING WORDS
// ─────────────────────────────────────────────────────────────

const ROTATE_WORDS = [
  'future.',
  'markets.',
  'outcome.',
  'profits.',
  'edge.',
];

// ─────────────────────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────────────────────

const LEADERBOARD = [
  {
    rank: 1,
    name: 'CryptoSage',
    avatar: 'C',
    markets: 142,
    gain: '+$14,820',
  },
  {
    rank: 2,
    name: 'SportsBrain',
    avatar: 'S',
    markets: 98,
    gain: '+$9,440',
  },
  {
    rank: 3,
    name: 'Velorion',
    avatar: 'V',
    markets: 87,
    gain: '+$7,110',
  },
  {
    rank: 4,
    name: 'NovaSeer',
    avatar: 'N',
    markets: 76,
    gain: '+$5,880',
  },
  {
    rank: 5,
    name: 'PulseOracle',
    avatar: 'P',
    markets: 64,
    gain: '+$4,200',
  },
  {
    rank: 6,
    name: 'DeltaKnow',
    avatar: 'D',
    markets: 58,
    gain: '+$3,660',
  },
  {
    rank: 7,
    name: 'Ashkroft_X',
    avatar: 'A',
    markets: 51,
    gain: '+$2,990',
  },
];

// ─────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote:
      'Called the BTC breakout a full week before it happened. Walked away with 3x my stake. The UX is cleaner than anything else in this space.',
    name: 'Marcus T.',
    handle: '@marcust_ve',
    win: '+340%',
    avatar: 'M',
  },
  {
    quote:
      "I've used Polymarket, Augur, Manifold. Pooz feels different — faster, cheaper to use, and the market selection actually reflects what's happening in the world.",
    name: 'Priya K.',
    handle: '@priyak_chain',
    win: '+218%',
    avatar: 'P',
  },
  {
    quote:
      "The non-custodial aspect is a deal-breaker for me — in the best way. My VET never leaves my wallet until a payout hits. That's how DeFi should work.",
    name: 'Jake R.',
    handle: '@jr_predict',
    win: '+190%',
    avatar: 'J',
  },
  {
    quote:
      'Got into the Arsenal market at 62% YES before the match. Final score confirmed it. VET landed in seconds. No friction, no waiting, just clean resolution.',
    name: 'Stella M.',
    handle: '@stella_wins',
    win: '+155%',
    avatar: 'S',
  },
  {
    quote:
      'The signal section got me. Owning your insight is exactly the right framing. Knowledge has been commoditised everywhere else — here it pays.',
    name: 'Tobias F.',
    handle: '@tobias_ve',
    win: '+270%',
    avatar: 'T',
  },
  {
    quote:
      'Built on VeChain means gas is practically free. I can make small precision bets without burning fees. That changes the entire risk calculation.',
    name: 'Aisha N.',
    handle: '@aishanve',
    win: '+128%',
    avatar: 'A',
  },
];

// ─────────────────────────────────────────────────────────────
// ACTIVITY FEED
// ─────────────────────────────────────────────────────────────

const ACTIVITY_FEED = [
  {
    avatar: 'J',
    name: 'Jake R.',
    action: 'predicted',
    market: 'BTC above $120k',
    amount: '800 VET',
    time: '2s ago',
    side: 'YES',
  },
  {
    avatar: 'P',
    name: 'Priya K.',
    action: 'predicted',
    market: 'Arsenal next match',
    amount: '1,200 VET',
    time: '14s ago',
    side: 'YES',
  },
  {
    avatar: 'M',
    name: 'Marcus T.',
    action: 'won',
    market: 'ETH above $5k',
    amount: '+3,440 VET',
    time: '1m ago',
    side: null,
  },
  {
    avatar: 'S',
    name: 'Stella M.',
    action: 'predicted',
    market: 'Fed rate cut Sept',
    amount: '500 VET',
    time: '2m ago',
    side: 'YES',
  },
  {
    avatar: 'T',
    name: 'Tobias F.',
    action: 'predicted',
    market: 'GTA VI record launch',
    amount: '2,000 VET',
    time: '3m ago',
    side: 'YES',
  },
  {
    avatar: 'A',
    name: 'Aisha N.',
    action: 'won',
    market: 'Champions League — City',
    amount: '+1,920 VET',
    time: '5m ago',
    side: null,
  },
  {
    avatar: 'D',
    name: 'DeltaKnow',
    action: 'predicted',
    market: 'S&P 500 hits 6,000',
    amount: '600 VET',
    time: '7m ago',
    side: 'NO',
  },
];

// ─────────────────────────────────────────────────────────────
// ARROW
// ─────────────────────────────────────────────────────────────

const Arrow = () => <span className="arrow">↗</span>;

// ─────────────────────────────────────────────────────────────
// 3D ORBIT GLOBE
// ─────────────────────────────────────────────────────────────

function OrbitGlobe() {
  return (
    <div className="vp-globe">
      <div className="metric metric-a">
        <span>Live markets</span>
        <b>
          240<span>+</span>
        </b>
        <i>↑ 18% this week</i>
      </div>

      <div className="metric metric-b">
        <span>Markets settled</span>
        <b>
          99.8<span>%</span>
        </b>
        <i>Verified on-chain</i>
      </div>

      <div className="orbit-scene">
        <div className="globe-glow" />

        <div className="globe-wrap">
          <div className="planet">
            <i className="land one" />
            <i className="land two" />
            <i className="land three" />

            <b className="pin p1" />
            <b className="pin p2" />
            <b className="pin p3" />
          </div>
        </div>

        <div className="orbit-ring ring-a">
          <div className="ring-el" />
          <div className="dot-track">
            <span className="orbit-dot" />
          </div>
        </div>

        <div className="orbit-ring ring-b">
          <div className="ring-el" />
          <div className="dot-track">
            <span className="orbit-dot" />
          </div>
        </div>

        <div className="orbit-ring ring-c">
          <div className="ring-el" />
          <div className="dot-track">
            <span className="orbit-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WORD SWAP
// ─────────────────────────────────────────────────────────────

function WordSwap() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('show');

  useEffect(() => {
    let timer = null;
    let cancelled = false;

    const wait = (ms) =>
      new Promise((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const cycle = async () => {
      await wait(2600);

      if (cancelled) return;

      setPhase('exit');

      await wait(350);

      if (cancelled) return;

      setIndex((current) => (current + 1) % ROTATE_WORDS.length);
      setPhase('enter');

      await wait(350);

      if (cancelled) return;

      setPhase('show');

      cycle();
    };

    cycle();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  return (
    <span className={`word-swap word-${phase}`}>
      <span className="ws-current">
        {ROTATE_WORDS[index]}
      </span>
    </span>
  );
}


// ─────────────────────────────────────────────────────────────
// 3D CUBE
// ─────────────────────────────────────────────────────────────

function Cube3D() {
  return (
    <div className="cube-stage">
      <div className="cube-orbits">
        <div className="cube-orbit-ring" />
        <div className="cube-orbit-ring" />
      </div>

      <div className="cube-3d">

        <div className="cube-face front">
          <span className="face-icon">◈</span>

          <div className="face-val">
            240<span>+</span>
          </div>

          <div className="face-label">
            Live Markets
          </div>
        </div>

        <div className="cube-face back">
          <span className="face-icon">⚡</span>

          <div className="face-val">
            1.5<span>%</span>
          </div>

          <div className="face-label">
            Platform Fee
          </div>
        </div>

        <div className="cube-face left">
          <span className="face-icon" />

          <div className="face-val">
            10k<span>+</span>
          </div>

          <div className="face-label">
            Predictors
          </div>
        </div>

        <div className="cube-face right">
          <span className="face-icon">✦</span>

          <div className="face-val">
            99<span>%</span>
          </div>

          <div className="face-label">
            Uptime
          </div>
        </div>

        <div className="cube-face top">
          <span className="face-icon" />

          <div className="face-val">
            2M<span>+</span>
          </div>

          <div className="face-label">
            VET Traded
          </div>
        </div>

        <div className="cube-face bottom">
          <span className="face-icon" />

          <div className="face-val">
            0
          </div>

          <div className="face-label">
            Exploits
          </div>
        </div>

      </div>
    </div>
  );
}
function HeroSunScene() {
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handleMove = (event) => {
      const rect = scene.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      scene.style.setProperty('--mx', `${x * 2}`);
      scene.style.setProperty('--my', `${y * 2}`);
    };

    const handleLeave = () => {
      scene.style.setProperty('--mx', '0');
      scene.style.setProperty('--my', '0');
    };

    scene.addEventListener('pointermove', handleMove);
    scene.addEventListener('pointerleave', handleLeave);

    return () => {
      scene.removeEventListener('pointermove', handleMove);
      scene.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return (
    <div className="vp-sun-scene" ref={sceneRef}>
      <div className="vp-scene-grid" />

      <div className="vp-atmosphere vp-atmosphere-one" />
      <div className="vp-atmosphere vp-atmosphere-two" />

      <div className="vp-orbit vp-orbit-one" />
      <div className="vp-orbit vp-orbit-two" />
      <div className="vp-orbit vp-orbit-three" />

      <div className="vp-stars">
        {Array.from({ length: 26 }).map((_, index) => (
          <span
            key={index}
            className={`vp-star vp-star-${index + 1}`}
          />
        ))}
      </div>

      <div className="vp-sun-system">
        <div className="vp-sun-halo vp-sun-halo-outer" />
        <div className="vp-sun-halo vp-sun-halo-middle" />
        <div className="vp-sun-halo vp-sun-halo-inner" />

        <div className="vp-sun">
          <div className="vp-sun-surface" />
          <div className="vp-sun-highlight" />
          <div className="vp-sun-shadow" />
        </div>

        <div className="vp-sun-ring vp-sun-ring-one" />
        <div className="vp-sun-ring vp-sun-ring-two" />
      </div>

      {/* Back clouds */}
      <div className="vp-cloud-cloudset vp-cloud-back">
        <div className="vp-cloud c1" />
        <div className="vp-cloud c2" />
        <div className="vp-cloud c3" />
        <div className="vp-cloud c4" />
        <div className="vp-cloud c5" />
      </div>

      {/* Main cloud layer */}
      <div className="vp-cloud-cloudset vp-cloud-main">
        <div className="vp-cloud c1" />
        <div className="vp-cloud c2" />
        <div className="vp-cloud c3" />
        <div className="vp-cloud c4" />
        <div className="vp-cloud c5" />
        <div className="vp-cloud c6" />
        <div className="vp-cloud c7" />
      </div>

      {/* Foreground clouds */}
      <div className="vp-cloud-cloudset vp-cloud-front">
        <div className="vp-cloud c1" />
        <div className="vp-cloud c2" />
        <div className="vp-cloud c3" />
        <div className="vp-cloud c4" />
        <div className="vp-cloud c5" />
        <div className="vp-cloud c6" />
      </div>

      <div className="vp-light-beam vp-beam-one" />
      <div className="vp-light-beam vp-beam-two" />

      <div className="vp-floating-data vp-data-one">
        <span className="vp-data-dot" />
        <span>LIVE MARKET</span>
      </div>

      <div className="vp-floating-data vp-data-two">
        <span>VET</span>
        <strong>+2.81%</strong>
      </div>

      <div className="vp-floating-data vp-data-three">
        <span className="vp-data-dot" />
        <span>ON-CHAIN</span>
      </div>

      <div className="vp-scan-line" />
      <div className="vp-ground-glow" />
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// VET CARD
// ─────────────────────────────────────────────────────────────

function VetCard() {
  return (
    <div className="vet-card-stage">

      <div className="vet-glow-ring" />
      <div className="vet-glow-ring" />

      <div className="vet-card-wrap">

        <div className="vet-card-face vet-card-front">
          <div className="vc-logo">
            POOZ
          </div>

          <div className="vc-big">
            VET<span>.</span>
          </div>

          <div className="vc-ticker">
            VeChain Token
          </div>
        </div>

        <div className="vet-card-face vet-card-back">

          <div className="vc-chip" />

          <div className="vc-price">
            $0.033{' '}
            <span className="vc-price-change">
              ▲ 2.81%
            </span>
          </div>

          <div className="vc-back-label">
            Current Market Price
          </div>

          <div className="vc-back-num">
            2M+ VET
          </div>

          <div className="vc-back-label">
            in active prediction pools
          </div>

        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────────────────────────

function Modal({
  mode,
  close,
  marketTitle,
}) {
  const {
    loginWithEmail,
    signupWithEmail,
    loginWithWallet,
  } = useAuth();

  const [tab, setTab] = useState(mode || 'signup');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [
    showVeWorldRedirect,
    setShowVeWorldRedirect,
  ] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  useEffect(() => {
    setTab(mode || 'signup');
    setError('');
    setDone(false);
    setShowVeWorldRedirect(false);
  }, [mode]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.body.style.overflow = mode ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mode]);

  if (!mode) return null;

  const set = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const handleEmail = async (event) => {
    if (event) {
      event.preventDefault();
    }

    setError('');
    setLoading(true);

    try {
      if (tab === 'signup') {
        await signupWithEmail(
          form.email,
          form.password,
          form.displayName
        );
      } else {
        await loginWithEmail(
          form.email,
          form.password
        );
      }

      setDone(true);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.errors?.[0]?.msg ||
          err?.message ||
          'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWallet = async () => {
    setError('');

    if (typeof window === 'undefined') {
      setError('Wallet connection is only available in the browser.');
      return;
    }

    const hasVechain =
      window.connex ||
      window.vechain ||
      window.vechain_vendor;

    if (hasVechain) {
      setLoading(true);

      try {
        await loginWithWallet();
        setDone(true);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            'Wallet connection failed.'
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    if (isMobile()) {
      setShowVeWorldRedirect(true);
    } else {
      setError(
        'VeWorld not detected. Install the extension from veworld.net'
      );
    }
  };

  return (
    <div
      className="auth-overlay"
      onClick={(event) => {
        if (event.currentTarget === event.target) {
          close();
        }
      }}
    >
      <form
        className="auth-modal"
        onSubmit={handleEmail}
      >
        <button
          type="button"
          className="modal-close"
          onClick={close}
          aria-label="Close"
        >
          ×
        </button>

        <div className="modal-logo">
          ✦
        </div>

        {done ? (
          <>
            <h2>
              You&apos;re all set!
            </h2>

            <p>
              Your Pooz journey starts here.
            </p>

            <button
              type="button"
              className="red-btn modal-submit"
              onClick={close}
            >
              Explore markets
            </button>
          </>
        ) : (
          <>
            <h2>
              {tab === 'signup'
                ? marketTitle
                  ? 'Sign Up to Predict'
                  : 'Create your account'
                : 'Welcome back'}
            </h2>

            <p>
              {marketTitle
                ? `Place your prediction on: "${marketTitle}"`
                : 'Predict smarter. Keep control of your assets.'}
            </p>

            <div className="auth-tabs">
              <button
                type="button"
                className={
                  tab === 'signup'
                    ? 'active'
                    : ''
                }
                onClick={() => {
                  setTab('signup');
                  setError('');
                  setShowVeWorldRedirect(false);
                }}
              >
                Sign up
              </button>

              <button
                type="button"
                className={
                  tab === 'login'
                    ? 'active'
                    : ''
                }
                onClick={() => {
                  setTab('login');
                  setError('');
                  setShowVeWorldRedirect(false);
                }}
              >
                Log in
              </button>
            </div>

            {error && (
              <p
                style={{
                  color: '#ef4444',
                  fontSize: 13,
                  marginBottom: 10,
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
            )}

            {showVeWorldRedirect ? (
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  Open VeWorld app to connect your wallet
                </p>

                <a
                  href={
                    typeof window !== 'undefined'
                      ? `veworld://browser?url=${encodeURIComponent(
                          window.location.href
                        )}`
                      : '#'
                  }
                  className="wallet-btn"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                    textDecoration: 'none',
                  }}
                >
                  Open in VeWorld
                </a>

                <a
                  href={
                    /iPhone|iPad|iPod/i.test(
                      typeof navigator !== 'undefined'
                        ? navigator.userAgent
                        : ''
                    )
                      ? 'https://apps.apple.com/app/veworld/id1633613910'
                      : 'https://play.google.com/store/apps/details?id=com.vechain.wallet'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    display: 'block',
                    marginBottom: 10,
                  }}
                >
                  Don&apos;t have VeWorld? Download it →
                </a>

                <span
                  style={{
                    fontSize: 12,
                    cursor: 'pointer',
                    opacity: 0.6,
                  }}
                  onClick={() =>
                    setShowVeWorldRedirect(false)
                  }
                >
                  ← Back
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="wallet-btn"
                onClick={handleWallet}
                disabled={loading}
              >
                ◇{' '}
                {loading
                  ? 'Connecting...'
                  : 'Connect VeWorld wallet'}
              </button>
            )}
          </>
        )}
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MARKET CARD
// ─────────────────────────────────────────────────────────────

function Card({
  market,
  index,
  onPredict,
}) {
  const safeMarket = market || {};

  const category =
    safeMarket.category || 'Other';

  const title =
    safeMarket.title ||
    safeMarket.question ||
    'Untitled market';

  let yes = safeMarket.yesPercent;

  if (
    yes === undefined ||
    yes === null ||
    Number.isNaN(Number(yes))
  ) {
    if (
      safeMarket.totalPool &&
      Number(safeMarket.totalPool) > 0
    ) {
      yes = Math.round(
        ((safeMarket.yesPool || 0) /
          safeMarket.totalPool) *
          100
      );
    } else {
      yes = 50;
    }
  }

  yes = Math.max(
    0,
    Math.min(100, Number(yes))
  );

  const poolVet =
    safeMarket.totalPool
      ? (
          Number(safeMarket.totalPool) /
          1e18
        ).toFixed(0)
      : null;

  const poolDisplay =
    poolVet && parseFloat(poolVet) > 0
      ? `${poolVet} VET`
      : safeMarket.pool || 'New';

  const timeLeft =
    formatTimeLeft(safeMarket.closesAt) ||
    safeMarket.timeLeft ||
    'Live';

  const categoryClass =
    category.toLowerCase().replace(/\s+/g, '-');

  return (
    <article
      className="market-card"
      style={{
        '--delay': `${index * 70}ms`,
      }}
      onClick={() => onPredict(safeMarket)}
    >
      <div className="market-top">
        <span
          className={`tag ${categoryClass}`}
        >
          {category}
        </span>

        <span>
          ◷ {timeLeft}
        </span>
      </div>

      <h3>
        {title}
      </h3>

      <div className="odds-track">
        <i
          style={{
            width: `${yes}%`,
          }}
        />
      </div>

      <div className="odds">
        <b>
          YES <em>{yes}%</em>
        </b>

        <b>
          NO <em>{100 - yes}%</em>
        </b>
      </div>

      <div className="market-bottom">
        <span>
          Pool{' '}
          <strong>
            {poolDisplay}
          </strong>
        </span>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPredict(safeMarket);
          }}
        >
          Predict
        </button>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// REVEAL HOOK
// ─────────────────────────────────────────────────────────────

function useReveal() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    if (
      typeof IntersectionObserver ===
      'undefined'
    ) {
      setVisible(true);
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setVisible(entry.isIntersecting);
        },
        {
          threshold: 0.15,
          rootMargin:
            '0px 0px -60px 0px',
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    ref,
    visible,
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN LANDING PAGE
// ─────────────────────────────────────────────────────────────

export default function Landing() {
  const [filter, setFilter] =
    useState('All');

  const [faq, setFaq] =
    useState(null);

  const [auth, setAuth] =
    useState(null);

  const [authMarket, setAuthMarket] =
    useState(null);

  const [menu, setMenu] =
    useState(false);

  const [markets, setMarkets] =
    useState(STATIC_MARKETS);

  const [loadingMarkets, setLoadingMarkets] =
    useState(false);

  const [email, setEmail] =
    useState('');

  const [subscribed, setSubscribed] =
    useState(false);

  const signal = useReveal();
  const security = useReveal();
  const steps = useReveal();

  // ───────────────────────────────────────────────────────────
  // LOAD MARKETS
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const params = {
      status: 'active',
      limit: 6,
    };

    if (filter !== 'All') {
      params.category = filter;
    }

    setLoadingMarkets(true);

    fetchMarkets(params)
      .then((res) => {
        if (cancelled) return;

        const data = res?.data || res || {};

        const receivedMarkets =
          data.markets ||
          data.data?.markets ||
          [];

        if (
          Array.isArray(receivedMarkets)
        ) {
          if (receivedMarkets.length > 0) {
            setMarkets(receivedMarkets);
          } else {
            setMarkets(
              filter === 'All'
                ? STATIC_MARKETS
                : STATIC_MARKETS.filter(
                    (market) =>
                      market.category === filter
                  )
            );
          }
        } else {
          setMarkets(
            filter === 'All'
              ? STATIC_MARKETS
              : STATIC_MARKETS.filter(
                  (market) =>
                    market.category === filter
                )
          );
        }
      })
      .catch(() => {
        if (cancelled) return;

        setMarkets(
          filter === 'All'
            ? STATIC_MARKETS
            : STATIC_MARKETS.filter(
                (market) =>
                  market.category === filter
              )
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingMarkets(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  // ───────────────────────────────────────────────────────────
  // AUTH
  // ───────────────────────────────────────────────────────────

  const openAuth = (tab) => {
    setAuthMarket(null);
    setAuth(tab);
    setMenu(false);
  };

  const openPredict = (market) => {
    setAuthMarket(market);
    setAuth('signup');
  };

  const closeModal = () => {
    setAuth(null);
    setAuthMarket(null);
  };

  const signup = () => {
    setMenu(false);
    setAuthMarket(null);
    setAuth('signup');
  };

  // ───────────────────────────────────────────────────────────
  // NEWSLETTER
  // ───────────────────────────────────────────────────────────

  const handleSubscribe = () => {
    const trimmedEmail =
      email.trim();

    if (!trimmedEmail) return;

    setSubscribed(true);
    setEmail('');
  };

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────

  return (
    <main className="vp-site">

      {/* ═══════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════ */}

    <section className="hero vp-hero" id="top">
  <div className="vp-hero-noise" />

  <nav className="vp-nav">
    <a href="#top" className="logo">
      {/* Po<span>oz</span> */}
      <img src={Poozimg} alt="Pooz" width="130" height="130"/>
    </a>

    <div className="nav-links">
      <a href="#markets">Markets</a>
      <a href="#how">How it works</a>
      <a href="#signals">Signals</a>
      <a href="#activity">Activity</a>
    </div>

    <div className="nav-actions">
      <a href="#markets" className="nav-predict-hide">
        Start predicting
      </a>

      <button
        className="hamburger"
        type="button"
        aria-label="Open menu"
        onClick={() => setMenu((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
    </div>
  </nav>

  {menu && (
    <div className="mobile-menu">
      <a href="#markets" onClick={() => setMenu(false)}>
        Markets
      </a>

      <a href="#how" onClick={() => setMenu(false)}>
        How it works
      </a>

      <a href="#signals" onClick={() => setMenu(false)}>
        Signals
      </a>

      <a href="#activity" onClick={() => setMenu(false)}>
        Activity
      </a>

      <a
        href="#markets"
        className="mobile-menu-cta"
        onClick={(event) => {
          event.preventDefault();
          setMenu(false);
          signup();
        }}
      >
        Start predicting
      </a>
    </div>
  )}

  <div className="vp-hero-layout">

    {/* LEFT CONTENT */}
    <div className="hero-copy vp-hero-copy">

      <div className="vp-status">
        <span className="vp-status-pulse" />
        Built on VeChain
      </div>

      <h1>
        Predict Onchain
        <span className="vp-title-gradient">
          <WordSwap />
        </span>
        <br />
        <span className="vp-title-white">
          Earn what you know.
        </span>
      </h1>

      <p className="vp-hero-description">
        Turn your knowledge into an edge.
        Predict real-world outcomes, compete with
        other predictors and earn VET when your
        calls are right.
      </p>

      <div className="buttons vp-hero-buttons">
        <a
          className="red-btn vp-primary-btn"
          href="#markets"
          onClick={(event) => {
            event.preventDefault();
            signup();
          }}
        >
          Explore markets
          <span>↗</span>
        </a>

        <a className="ghost-btn vp-secondary-btn" href="#how">
          How it works
          <span>↓</span>
        </a>
      </div>

      <div className="proof vp-proof">
        <div className="avatars">
          <b>J</b>
          <b>K</b>
          <b>M</b>
          <b>S</b>
        </div>

        <p>
          <strong>10,000+ predictors</strong>
          <br />
          already making smarter calls
        </p>
      </div>
    </div>

    {/* 3D VISUAL */}
    <div className="vp-hero-visual">
      <HeroSunScene />

      <div className="vp-visual-label vp-label-top">
        <span>01</span>
        MARKET SIGNAL
      </div>

      <div className="vp-visual-label vp-label-bottom">
        <span>VECHAIN</span>
        <b>DECENTRALIZED</b>
      </div>
    </div>

  </div>

  <div className="ticker vp-ticker">
    <span>
      VET <b>$0.033</b> <i>+2.81%</i>
    </span>

    <span>
      <small />
      NON-CUSTODIAL
    </span>

    <span>
      <small />
      INSTANT PAYOUTS
    </span>

    <span>
      <small />
      1.5% WINNING FEE
    </span>

    <span>
      <small />
      BUILT ON VECHAIN
    </span>
  </div>
</section>

      {/* ═══════════════════════════════════════════════════════
          LIVE MARKETS
      ═══════════════════════════════════════════════════════ */}

      <section
        className="section"
        id="markets"
      >
        <header className="section-head">

          <div>
            <p className="eyebrow">
              <i /> Live opportunity
            </p>

            <h2>
              Markets moving{' '}
              <span>
                right now.
              </span>
            </h2>
          </div>

          <p>
            Use what you know. Every market
            is transparent, measurable, and
            built to settle cleanly.
          </p>

        </header>

        {/* FILTERS */}

        <div className="filters">

          {FILTERS.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() =>
                setFilter(item)
              }
              className={
                filter === item
                  ? 'selected'
                  : ''
              }
            >
              {item}
            </button>
          ))}

        </div>

        {/* MARKETS */}

        {loadingMarkets ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              opacity: 0.4,
            }}
          >
            Loading markets...
          </div>
        ) : markets.length > 0 ? (
          <div className="market-grid">

            {markets.map(
              (market, index) => (
                <Card
                  key={
                    market?._id ||
                    market?.id ||
                    `${filter}-${index}`
                  }
                  market={market}
                  index={index}
                  onPredict={openPredict}
                />
              )
            )}

          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              opacity: 0.4,
            }}
          >
            No markets available in this
            category yet.
          </div>
        )}

        <div className="center">

          <button
            type="button"
            className="ghost-btn"
            onClick={signup}
          >
            View all live markets{' '}
            <Arrow />
          </button>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SIGNAL
      ═══════════════════════════════════════════════════════ */}

      <section
        ref={signal.ref}
        className={`signal-wrap${
          signal.visible
            ? ' signal-visible'
            : ''
        }`}
      >
        <div className="signal">

          <div className="signal-copy">

            <p className="eyebrow">
              <i /> The signal is yours
            </p>

            <h2>
              Know the world.
              <br />
              <span>
                Own your insight.
              </span>
            </h2>

            <p>
              Pooz turns your informed
              opinions into positions with a
              clear, elegant experience from
              market to payout.
            </p>

            <button
              type="button"
              className="red-btn"
              onClick={signup}
            >
              Start predicting
            </button>

          </div>

          <div className="signal-art">

            <div className="signal-core">
              <small>VET</small>
              <b>◈</b>
            </div>

            <div className="data d1">
              + 74% YES
            </div>

            <div className="data d2">
              12.4k VET pool
            </div>

            <div className="signal-ring r1" />
            <div className="signal-ring r2" />

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS CUBE
      ═══════════════════════════════════════════════════════ */}

      <section className="cube-section">

        <div className="cube-section-inner">

          <div className="cube-copy">

            <p className="eyebrow">
              <i /> By the numbers
            </p>

            <h2>
              Built to{' '}
              <span>
                scale.
              </span>
            </h2>

            <p>
              Pooz is growing fast. Over
              10,000 active predictors have
              placed bets across 240+ markets,
              with over 2 million VET settled
              on-chain without a single disputed
              payout.
            </p>

            <div className="stat-blocks">

              {[
                ['240', '+', 'Live Markets'],
                ['10k', '+', 'Predictors'],
                ['2M', '+', 'VET Settled'],
                ['99.8', '%', 'Resolution Rate'],
              ].map(
                ([number, suffix, label]) => (
                  <div
                    className="stat-block"
                    key={label}
                  >
                    <div className="stat-num">
                      {number}
                      <span>
                        {suffix}
                      </span>
                    </div>

                    <div className="stat-label">
                      {label}
                    </div>
                  </div>
                )
              )}

            </div>

          </div>

          <Cube3D />

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════ */}

      <section
        className="section"
        id="how"
      >
        <header className="section-head centered">

          <p className="eyebrow">
            <i /> Simple by design
          </p>

          <h2>
            From curiosity to{' '}
            <span>
              payout.
            </span>
          </h2>

        </header>

        <div
          ref={steps.ref}
          className={`steps${
            steps.visible
              ? ' steps-visible'
              : ''
          }`}
        >

          {[
            [
              '01',
              'Create account',
              'Sign up in under 60 seconds — email, Google, or VeWorld wallet. No KYC required for entry-level participation.',
            ],
            [
              '02',
              'Fund wallet',
              'Your VET stays in your wallet. Top up directly from any VeChain-compatible exchange.',
            ],
            [
              '03',
              'Pick a market',
              'Browse 240+ live markets across crypto, sport, politics, gaming, and more. Pick YES or NO.',
            ],
            [
              '04',
              'Get paid',
              'Smart contracts distribute winnings the moment the outcome is verified. Typically within seconds of settlement.',
            ],
          ].map(
            ([number, title, description], index) => (
              <article
                className="step"
                key={number}
                style={{
                  '--step-delay': `${index * 0.18}s`,
                }}
              >
                <span>
                  {number}
                </span>

                <b>◈</b>

                <h3>
                  {title}
                </h3>

                <p>
                  {description}
                </p>
              </article>
            )
          )}

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LEADERBOARD
      ═══════════════════════════════════════════════════════ */}

      <section className="leaderboard-section">

        <div className="leaderboard-inner">

          <div className="leaderboard-copy">

            <p className="eyebrow">
              <i /> Top predictors
            </p>

            <h2>
              The best{' '}
              <span>
                call it right.
              </span>
            </h2>

            <p>
              Prediction is a skill. Our
              leaderboard tracks the sharpest
              minds across every market category.
              Climb the ranks and earn recognition
              alongside your VET.
            </p>

            <button
              type="button"
              className="red-btn"
              onClick={signup}
              style={{
                marginTop: 8,
              }}
            >
              Join the leaderboard{' '}
              <Arrow />
            </button>

          </div>

          <div className="lb-table">

            <div className="lb-header">
              <div>#</div>
              <div>Predictor</div>
              <div>Markets</div>
              <div>Gain</div>
            </div>

            {LEADERBOARD.map((user) => (
              <div
                className="lb-row"
                key={user.rank}
              >
                <div
                  className={`lb-rank ${
                    user.rank === 1
                      ? 'gold'
                      : user.rank === 2
                      ? 'silver'
                      : user.rank === 3
                      ? 'bronze'
                      : ''
                  }`}
                >
                  {user.rank === 1
                    ? '🥇'
                    : user.rank === 2
                    ? '🥈'
                    : user.rank === 3
                    ? '🥉'
                    : user.rank}
                </div>

                <div className="lb-user">

                  <div className="lb-avatar">
                    {user.avatar}
                  </div>

                  <div>
                    <div className="lb-name">
                      {user.name}
                    </div>
                  </div>

                </div>

                <div className="lb-markets">
                  {user.markets}
                </div>

                <div className="lb-gain">
                  {user.gain}
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          VET TOKEN
      ═══════════════════════════════════════════════════════ */}

      <section
        className="token-section"
        id="token"
      >
        <div className="token-inner">

          <div className="token-copy">

            <p className="eyebrow">
              <i /> The fuel of the platform
            </p>

            <h2>
              Powered by{' '}
              <span>
                VET.
              </span>
            </h2>

            <p>
              VeChain's native token is fast,
              cheap, and enterprise-grade. VET
              makes Pooz possible — ultra-low
              gas fees mean even small precision
              bets are worthwhile.
            </p>

            <div className="token-features">

              {[
                [
                  '⚡',
                  'Near-instant finality',
                  'VeChain settles in ~10 seconds. Waiting minutes for a blockchain confirmation is a thing of the past.',
                ],
                [
                  '💸',
                  'Micro-transaction ready',
                  'Gas fees on VeChain cost fractions of a cent. Bet 50 VET without burning half on fees.',
                ],
                [
                  '🌱',
                  'Sustainable chain',
                  'VeChain uses Proof of Authority — energy consumption is a fraction of proof-of-work chains.',
                ],
                [
                  '🔐',
                  'Enterprise security',
                  'The same infrastructure trusted by Fortune 500 companies secures every prediction on Pooz.',
                ],
              ].map(
                ([icon, title, description]) => (
                  <div
                    className="token-feature"
                    key={title}
                  >
                    <div className="tf-icon">
                      {icon}
                    </div>

                    <div className="tf-text">
                      <h4>
                        {title}
                      </h4>

                      <p>
                        {description}
                      </p>
                    </div>
                  </div>
                )
              )}

            </div>

          </div>

          <VetCard />

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECURITY
      ═══════════════════════════════════════════════════════ */}

      <section
        ref={security.ref}
        className={`security${
          security.visible
            ? ' security-visible'
            : ''
        }`}
        id="security"
      >
        <div className="section security-content">

          <div className="security-copy">

            <p className="eyebrow">
              <i /> Built for trust
            </p>

            <h2>
              Your prediction.
              <br />
              <span>
                Your assets.
              </span>
            </h2>

            <p>
              Transparent technology, no
              custodial shortcuts. Your
              information and your VET remain
              yours — always.
            </p>

          </div>

          <div className="security-grid">

            {[
              [
                '⌘',
                'Non-custodial',
                'Your VET stays in your wallet at all times. We never touch your principal.',
              ],
              [
                '◎',
                'On-chain clarity',
                'Every bet, every outcome, every payout is verifiable by anyone.',
              ],
              [
                'ϟ',
                'Instant settlements',
                'Correct calls are rewarded automatically within seconds of resolution.',
              ],
              [
                '✦',
                'Audited contracts',
                'Our smart contracts have been independently audited and are open-source.',
              ],
            ].map(
              ([icon, title, description], index) => (
                <article
                  key={title}
                  style={{
                    '--security-delay': `${index * 0.16}s`,
                  }}
                >
                  <b>
                    {icon}
                  </b>

                  <h3>
                    {title}
                  </h3>

                  <p>
                    {description}
                  </p>
                </article>
              )
            )}

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LIVE ACTIVITY
      ═══════════════════════════════════════════════════════ */}

      <section className="activity-section">

        <div className="activity-inner">

          <div className="activity-copy">

            <p className="eyebrow">
              <i /> Real-time action
            </p>

            <h2>
              10,000 predictors.{' '}
              <span>
                Live right now.
              </span>
            </h2>

            <p>
              At any moment, thousands of
              Pooz users are placing
              predictions, winning payouts,
              and calling market outcomes
              across every category.
            </p>

            <button
              type="button"
              className="red-btn"
              onClick={signup}
              style={{
                marginTop: 8,
              }}
            >
              Join them{' '}
              <Arrow />
            </button>

          </div>

          <div className="activity-feed">

            <div className="activity-feed-header">

              <div className="live-dot">
                Live feed
              </div>

              <div
                style={{
                  color: 'var(--soft)',
                  fontWeight: 400,
                }}
              >
                Last 10 minutes
              </div>

            </div>

            {ACTIVITY_FEED.map(
              (activity, index) => (
                <div
                  className="activity-item"
                  key={`${activity.name}-${index}`}
                  style={{
                    animationDelay: `${index * 80}ms`,
                  }}
                >

                  <div className="ai-avatar">
                    {activity.avatar}
                  </div>

                  <div className="ai-content">

                    <div className="ai-name">
                      {activity.name}
                    </div>

                    <div className="ai-action">

                      {activity.action === 'won' ? (
                        <>
                          <strong
                            style={{
                              color: '#22c55e',
                            }}
                          >
                            won
                          </strong>{' '}
                          on{' '}
                          <strong>
                            {activity.market}
                          </strong>
                        </>
                      ) : (
                        <>
                          predicted{' '}
                          <strong>
                            {activity.side}
                          </strong>{' '}
                          on{' '}
                          <strong>
                            {activity.market}
                          </strong>
                        </>
                      )}

                    </div>

                  </div>

                  <div
                    className="ai-amount"
                    style={
                      activity.action === 'won'
                        ? {
                            color: '#22c55e',
                          }
                        : {}
                    }
                  >
                    {activity.amount}
                  </div>

                  <div className="ai-time">
                    {activity.time}
                  </div>

                </div>
              )
            )}

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════ */}

      <section className="testimonials-section">

        <div className="testimonials-inner">

          <div className="testimonials-head">

            <p
              className="eyebrow"
              style={{
                justifyContent: 'center',
                display: 'flex',
              }}
            >
              <i /> What predictors say
            </p>

            <h2>
              The community{' '}
              <span>
                speaks.
              </span>
            </h2>

            <p>
              Over 10,000 active users.
              Here's what some of them are
              saying.
            </p>

          </div>

          <div className="tcard-grid">

            {TESTIMONIALS.map(
              (testimonial) => (
                <div
                  className="tcard"
                  key={testimonial.name}
                >

                  <div className="tcard-win">
                    {testimonial.win} return
                  </div>

                  <p
                    className="tcard-quote"
                    style={{
                      paddingLeft: 24,
                      paddingTop: 8,
                    }}
                  >
                    {testimonial.quote}
                  </p>

                  <div className="tcard-user">

                    <div className="tcard-avatar">
                      {testimonial.avatar}
                    </div>

                    <div>

                      <div className="tcard-name">
                        {testimonial.name}
                      </div>

                      <div className="tcard-handle">
                        {testimonial.handle}
                      </div>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════ */}

      <section
        className="section faq-section"
        id="faq"
      >
        <header className="section-head centered">

          <p className="eyebrow">
            <i /> Need to know
          </p>

          <h2>
            Clear answers,{' '}
            <span>
              no noise.
            </span>
          </h2>

        </header>

        <div className="faqs">

          {FAQS.map(
            ([question, answer], index) => (
              <article
                key={question}
              >
                <button
                  type="button"
                  onClick={() =>
                    setFaq(
                      faq === index
                        ? null
                        : index
                    )
                  }
                >
                  {question}

                  <b>
                    {faq === index
                      ? '−'
                      : '+'}
                  </b>
                </button>

                {faq === index && (
                  <p>
                    {answer}
                  </p>
                )}
              </article>
            )
          )}

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          NEWSLETTER
      ═══════════════════════════════════════════════════════ */}

      <section className="newsletter-section">

        <p
          className="eyebrow"
          style={{
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          <i /> Stay ahead
        </p>

        <h2
          style={{
            font:
              '800 clamp(34px,4vw,52px)/1.1 sans-serif',
            letterSpacing: '-2px',
            marginBottom: 10,
          }}
        >
          Get exclusive{' '}
          <span
            style={{
              color: 'var(--red)',
            }}
          >
            market alerts
          </span>
        </h2>

        <p
          style={{
            opacity: 0.6,
            margin: '0 auto 24px',
            maxWidth: 400,
            fontSize: 14,
            color: 'var(--soft)',
          }}
        >
          Be the first to know about trending
          markets and special events. Join
          10,000+ predictors.
        </p>

        {subscribed ? (
          <p
            style={{
              color: '#22c55e',
              fontWeight: 600,
            }}
          >
            ✅ You're subscribed! Check your
            inbox.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSubscribe();
                }
              }}
              style={{
                padding: '11px 16px',
                borderRadius: 8,
                border:
                  '1px solid rgba(255,255,255,0.15)',
                background:
                  'rgba(255,255,255,0.07)',
                color: 'inherit',
                fontSize: 14,
                minWidth: 240,
                outline: 'none',
              }}
            />

            <button
              type="button"
              className="red-btn"
              onClick={handleSubscribe}
            >
              Subscribe →
            </button>
          </div>
        )}

      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════ */}

      <section
        className="final"
        id="start"
      >
        <div className="rings" />

        <p className="eyebrow">
          <i /> Make your call
        </p>

        <h2>
          Your knowledge has
          <br />
          <span>
            real value.
          </span>
        </h2>

        <p>
          Join Pooz to turn the moments
          you follow into the outcomes you own.
        </p>

        <div className="buttons">

          <button
            type="button"
            className="red-btn"
            onClick={signup}
          >
            Create free account{' '}
            <Arrow />
          </button>

          <a
            className="ghost-btn"
            href="#markets"
          >
            Browse markets
          </a>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}

      <footer>

        <a
          className="brand"
          href="#top"
        >
          {/* <i>✦</i> POOZ */}
         < img src={Poozimg} alt="Pooz" width="130" height="130"/> 
        </a>

        <p>
          Built on VeChain. Non-custodial.
          Transparent. © 2026
        </p>

        <div>

          <a href="#faq">
            Terms
          </a>

          <a href="#faq">
            Privacy
          </a>

          <a href="#faq">
            Support
          </a>

        </div>

      </footer>

      {/* ═══════════════════════════════════════════════════════
          AUTH MODAL
      ═══════════════════════════════════════════════════════ */}

      <Modal
        mode={auth}
        close={closeModal}
        marketTitle={authMarket?.title}
      />

    </main>
  );
}
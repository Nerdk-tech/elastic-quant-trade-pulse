import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useAnimation } from 'framer-motion';
import { usePublicPrices } from '@/hooks/usePublicPrices';

function NetworkBg() {
  const dots = [
    {cx:80,cy:60},{cx:200,cy:120},{cx:380,cy:40},{cx:520,cy:90},{cx:680,cy:50},{cx:820,cy:110},{cx:960,cy:60},{cx:1100,cy:90},{cx:1260,cy:50},{cx:1360,cy:110},
    {cx:140,cy:200},{cx:320,cy:240},{cx:480,cy:200},{cx:640,cy:260},{cx:780,cy:210},{cx:920,cy:250},{cx:1060,cy:200},{cx:1200,cy:230},{cx:1340,cy:200},
  ];
  const lines = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[0,10],[1,11],[2,12],[4,13],[6,14],[8,16]];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1400 320" preserveAspectRatio="xMidYMid slice">
      {lines.map(([a,b],i)=>(<line key={i} x1={dots[a].cx} y1={dots[a].cy} x2={dots[b].cx} y2={dots[b].cy} stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>))}
      {dots.map((d,i)=>(
        <motion.circle key={i} cx={d.cx} cy={d.cy} r="3" fill="rgba(255,255,255,0.4)"
          animate={{ opacity: [0.4, 1, 0.4], r: [3, 4.5, 3] }}
          transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </svg>
  );
}

// Animated chart line that draws itself
function AnimatedChartLine({ d, color, delay = 0 }) {
  return (
    <motion.path
      d={d} stroke={color} strokeWidth="2" fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2.5, delay, ease: 'easeInOut' }}
    />
  );
}

function AnimatedDashboardMockup() {
  const bars = [30,45,38,62,55,72,85,70,80,95,88,92];
  const positions = [['BTC/USD','Long 10x','+12.4%','#10b981'],['TSLA','Short 5x','+8.7%','#10b981'],['ETH/USD','Long 5x','+6.2%','#10b981'],['PEPE','Long 25x','+31.2%','#f59e0b']];

  // Animate P&L values
  const controls = useAnimation();

  return (
    <motion.div className="relative select-none"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
      {/* Monitor */}
      <div className="w-[440px] drop-shadow-2xl">
        <div className="bg-[#0d1117] rounded-xl border border-white/10 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#161b22]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <div className="flex-1 mx-3 h-4 bg-[#0d1117] rounded text-[9px] text-gray-500 flex items-center px-2">cortex.io/dashboard</div>
          </div>
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-4 gap-1.5">
              {[['Balance','$24,820','#10b981'],['P&L Today','+$1,240','#10b981'],['Trades','7 active','#60a5fa'],['APY','15%/day','#fbbf24']].map(([l,v,c],i)=>(
                <motion.div key={i} className="bg-[#161b22] rounded p-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <p className="text-[8px] text-gray-500">{l}</p>
                  <p className="text-[10px] font-bold mt-0.5" style={{color:c}}>{v}</p>
                </motion.div>
              ))}
            </div>
            {/* Animated chart */}
            <div className="bg-[#161b22] rounded p-2 h-20 relative overflow-hidden">
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 300 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <AnimatedChartLine d="M0,50 C30,45 50,55 80,35 C110,15 130,25 160,15 C190,5 210,10 240,6 C260,3 280,5 300,2" color="#10b981" delay={0.5} />
                <motion.path d="M0,50 C30,45 50,55 80,35 C110,15 130,25 160,15 C190,5 210,10 240,6 C260,3 280,5 300,2 L300,60 L0,60Z"
                  fill="url(#chartFill)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.5 }} />
                <AnimatedChartLine d="M0,55 C30,52 50,57 80,48 C110,40 130,44 160,36 C190,30 210,33 240,28 C260,24 280,27 300,20" color="#6366f1" delay={0.8} />
              </svg>
              {/* Animated bars */}
              <div className="absolute bottom-1 left-2 right-2 flex items-end gap-0.5 h-6">
                {bars.map((h,i)=>(
                  <motion.div key={i} className="flex-1 rounded-sm"
                    style={{background:h>75?'#10b981':h>50?'#3b82f6':'#6b7280', opacity:0.7}}
                    initial={{ height: 0 }} animate={{ height: `${h}%` }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.4, ease: 'easeOut' }} />
                ))}
              </div>
            </div>
            {/* Positions */}
            <div className="space-y-1">
              {positions.map(([a,p,r,c],i)=>(
                <motion.div key={i} className="flex items-center justify-between bg-[#161b22] rounded px-2 py-1"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.12 }}>
                  <span className="text-[9px] font-semibold text-white w-16">{a}</span>
                  <span className="text-[8px] text-gray-400">{p}</span>
                  <motion.span className="text-[9px] font-bold" style={{color:c}}
                    animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}>
                    {r}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-5 w-20 bg-gray-300 mx-auto rounded-b" />
        <div className="h-1.5 w-36 bg-gray-400 mx-auto rounded" />
      </div>
      {/* Phone overlay */}
      <motion.div className="absolute -bottom-2 -left-14 w-[100px] bg-[#0d1117] rounded-2xl border border-white/15 shadow-2xl overflow-hidden"
        animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
        <div className="h-3 bg-[#161b22] flex items-center justify-center"><div className="w-8 h-1 bg-gray-600 rounded-full"/></div>
        <div className="p-2 space-y-1">
          <div className="bg-[#161b22] rounded p-1.5"><p className="text-[7px] text-gray-500">Portfolio</p><p className="text-[11px] font-bold text-emerald-400">$24,820</p></div>
          {[['BTC','+4.2%'],['ETH','+2.1%'],['DOGE','+18%'],['PEPE','+31%']].map(([a,r],i)=>(
            <motion.div key={i} className="flex justify-between bg-[#161b22] rounded px-1.5 py-1"
              animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.7 }}>
              <span className="text-[7px] text-white">{a}</span>
              <span className="text-[7px] font-bold text-emerald-400">{r}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Animated partners marquee
const partners = [
  { name: 'Nasdaq', el: <svg viewBox="0 0 120 40" className="h-6"><text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#0072bc">Nasdaq</text></svg> },
  { name: 'NYSE', el: <svg viewBox="0 0 80 40" className="h-6"><text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#000">NYSE</text></svg> },
  { name: 'ICE', el: <svg viewBox="0 0 60 40" className="h-6"><rect x="2" y="5" width="56" height="28" rx="3" fill="none" stroke="#000" strokeWidth="2"/><text x="10" y="26" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#000">ICE</text></svg> },
  { name: 'CBOE', el: <svg viewBox="0 0 80 40" className="h-6"><text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="20" fill="#000">Cboe</text></svg> },
  { name: 'CME', el: <svg viewBox="0 0 80 40" className="h-6"><text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="22" fill="#e31837">CME</text></svg> },
  { name: 'Bloomberg', el: <svg viewBox="0 0 130 40" className="h-6"><text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="#000">Bloomberg</text></svg> },
  { name: 'Reuters', el: <svg viewBox="0 0 100 40" className="h-6"><text x="0" y="28" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="#f60">Reuters</text></svg> },
];

function PartnersMarquee() {
  const doubled = [...partners, ...partners];
  return (
    <div className="relative overflow-hidden py-2">
      <motion.div
        className="flex items-center gap-14"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {doubled.map((p, i) => (
          <div key={i} className="flex items-center opacity-50 hover:opacity-80 transition-opacity flex-shrink-0">
            {p.el}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function HeroSection() {
  const { prices } = usePublicPrices();

  const liveAssets = [
    { sym: 'BTC', name: 'Bitcoin', fallbackPrice: '$67,420', fallbackChg: '+4.2%', up: true, key: 'BTC' },
    { sym: 'ETH', name: 'Ethereum', fallbackPrice: '$3,521', fallbackChg: '+2.8%', up: true, key: 'ETH' },
    { sym: 'SOL', name: 'Solana', fallbackPrice: '$187', fallbackChg: '+8.9%', up: true, key: 'SOL' },
    { sym: 'DOGE', name: 'Dogecoin', fallbackPrice: '$0.182', fallbackChg: '+12.4%', up: true, key: 'DOGE' },
    { sym: 'XRP', name: 'Ripple', fallbackPrice: '$0.62', fallbackChg: '+3.1%', up: true, key: 'XRP' },
    { sym: 'ADA', name: 'Cardano', fallbackPrice: '$0.48', fallbackChg: '+5.6%', up: true, key: 'ADA' },
  ];

  return (
    <>
      <div className="h-14" />

      <section className="relative overflow-hidden" style={{background:'linear-gradient(135deg,hsl(174,65%,30%) 0%,hsl(185,68%,40%) 60%,hsl(174,60%,32%) 100%)'}}>
        <NetworkBg />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 items-center py-16 lg:py-20">
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.55}}>
              <h1 className="font-display font-bold leading-tight text-white" style={{fontSize:'clamp(2.8rem,6vw,5rem)'}}>
                <span className="italic" style={{color:'hsl(185,90%,78%)'}}>Better</span> Analysis.
              </h1>
              <p className="mt-4 text-base text-white/80 max-w-md leading-relaxed font-display">
                It all starts with the Data. Now the AI trades it. Ask it anything.
              </p>
              <div className="mt-8 flex items-center gap-4 flex-wrap">
                <Link to="/register">
                  <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 h-11 rounded-full text-base shadow-lg font-display">
                    Join for Free
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.65,delay:0.1}} className="hidden lg:flex justify-end items-end pb-4">
              <AnimatedDashboardMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Asset cards + partners */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
            {liveAssets.map((a,i)=>{
              const live = prices[a.key];
              const price = live?.price != null
                ? `$${live.price < 1 ? live.price.toFixed(4) : live.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                : a.fallbackPrice;
              const chgNum = live?.change != null ? parseFloat(live.change.toFixed(2)) : null;
              const chg = chgNum != null ? `${chgNum >= 0 ? '+' : ''}${chgNum}%` : a.fallbackChg;
              const up = chgNum != null ? chgNum >= 0 : a.up;
              return (
              <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                whileHover={{ scale: 1.04, y: -2 }}
                className="p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-primary/20 transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display font-bold text-sm text-gray-900">{a.sym}</span>
                  <motion.span className={`text-xs font-bold ${up?'text-emerald-600':'text-red-500'}`}
                    animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}>
                    {chg}
                  </motion.span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{a.name}</p>
                <p className="font-display font-semibold text-sm text-gray-800">{price}</p>
                <div className="mt-2 h-8 flex items-end gap-0.5">
                  {[40,55,35,65,50,70,45,60,75,58].map((h,j)=>(
                    <motion.div key={j} className={`flex-1 rounded-sm ${up?'bg-emerald-400':'bg-red-400'}`}
                      style={{opacity:0.6}}
                      animate={{ height: [`${h}%`, `${h + (j%3)*8}%`, `${h}%`] }}
                      transition={{ duration: 2 + j * 0.3, repeat: Infinity, ease: 'easeInOut' }} />
                  ))}
                </div>
              </motion.div>
            )})}
          </div>

          <div className="border-t border-gray-100 pt-8">
            <p className="text-center text-xs font-display font-bold text-gray-400 uppercase tracking-widest mb-4">Our Partners</p>
            <PartnersMarquee />
          </div>
        </div>
      </section>
    </>
  );
}
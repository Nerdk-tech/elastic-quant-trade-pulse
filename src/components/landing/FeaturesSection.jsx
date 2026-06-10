import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Shield, TrendingUp, Wallet, Clock } from 'lucide-react';

// ORTEX section style: big teal uppercase label, body text, bullet points, dashboard screenshot
export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white">

      {/* Block 1: Unique Analysis - matches ORTEX screenshot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Dark mockup screenshot */}
        <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
          className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
          <div className="bg-[#0d1117] p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"/><div className="w-2.5 h-2.5 rounded-full bg-green-500/70"/>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[['Portfolio','$248,420','#10b981'],['P&L Today','+$3,840','#10b981'],['Win Rate','94.7%','#60a5fa']].map(([l,v,c],i)=>(
                <div key={i} className="bg-[#161b22] rounded-lg p-2 text-center">
                  <p className="text-[8px] text-gray-500 uppercase font-semibold">{l}</p>
                  <p className="text-sm font-bold mt-0.5" style={{color:c}}>{v}</p>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 uppercase font-semibold mb-2">AI Trading Momentum — BTC/USD</p>
            {/* Professional area chart */}
            <div className="h-32 bg-[#111827] rounded-lg overflow-hidden relative">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[20,40,60,80].map(y=><line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#ffffff08" strokeWidth="1"/>)}
                {[60,120,180,240].map(x=><line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#ffffff08" strokeWidth="1"/>)}
                {/* Area fill */}
                <path d="M0,80 C15,75 25,85 40,68 C55,52 65,60 80,45 C95,30 105,38 120,28 C135,18 145,24 160,16 C175,8 185,12 200,8 C215,4 225,7 240,5 C255,3 270,6 300,4 L300,100 L0,100Z" fill="url(#areaGrad1)"/>
                {/* Main price line */}
                <path d="M0,80 C15,75 25,85 40,68 C55,52 65,60 80,45 C95,30 105,38 120,28 C135,18 145,24 160,16 C175,8 185,12 200,8 C215,4 225,7 240,5 C255,3 270,6 300,4" stroke="#10b981" strokeWidth="2" fill="none"/>
                {/* MA line */}
                <path d="M0,88 C30,82 60,78 90,65 C120,52 150,42 180,32 C210,22 240,15 300,10" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeDasharray="4,2"/>
                {/* Candles */}
                {[[20,62,72,58],[60,42,52,38],[100,26,36,24],[140,14,22,12],[180,6,14,5],[220,4,10,3],[260,3,8,2]].map(([x,h,top,bot],i)=>(
                  <g key={i}>
                    <line x1={x} y1={bot} x2={x} y2={top} stroke={i%3===1?'#ef4444':'#10b981'} strokeWidth="0.8"/>
                    <rect x={x-3} y={Math.min(h,top)} width="6" height={Math.abs(top-h)+2} fill={i%3===1?'#ef4444':'#10b981'} opacity="0.8"/>
                  </g>
                ))}
              </svg>
              {/* Y-axis labels */}
              <div className="absolute right-1 top-1 flex flex-col justify-between h-full py-1">
                {['68K','65K','62K','59K'].map((l,i)=><span key={i} className="text-[7px] text-gray-600">{l}</span>)}
              </div>
              {/* Volume bars */}
              <div className="absolute bottom-0 left-0 right-4 flex items-end gap-px h-4 px-1">
                {[30,45,25,60,40,55,35,70,50,65,45,80,60,75,55,90,70,85].map((h,i)=>(
                  <div key={i} className="flex-1 rounded-t-sm" style={{height:`${h}%`,background:i%3===1?'rgba(239,68,68,0.4)':'rgba(16,185,129,0.4)'}}/>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
          <h2 className="font-display font-bold text-gray-900 mb-4" style={{fontSize:'2rem',lineHeight:1.2}}>
            Unique Analysis
          </h2>
          <p className="text-gray-600 mb-5 font-display">Gain competitive advantage:</p>
          <ul className="space-y-3">
            {[
              'How do my assets typically move before major market events?',
              'Which AI signals are the most accurate and profitable over time?',
              'What correlations exist between crypto, stocks and commodities?',
              'Who are the most accurate on-chain whale wallets to follow?',
            ].map((item,i)=>(
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-800 mt-2 flex-shrink-0"/>
                <span className="text-gray-700 font-display">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"/>

      {/* Block 2: Trading Signals - italic teal quote, monitor tilted */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
            {/* Italic teal quote - ORTEX style */}
            <p className="font-display font-bold italic mb-6 leading-tight" style={{color:'hsl(174,65%,38%)',fontSize:'1.3rem'}}>
              "OUR AI TRADING SIGNALS RETURNED 2230%+ OVER THE LAST 4 YEARS"
            </p>
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">Trading Signals</h3>
            <p className="text-gray-600 font-display mb-5">
              For each signal we tell you how many times the signal occurred historically and what the average return was. All signals are backtested across thousands of market conditions.
            </p>
            <ul className="space-y-2">
              {['5-star AI signals with proven track records','Real-time entry & exit notifications','Long, short and leveraged positions up to 100x','Crypto, stocks and meme coin coverage'].map((f,i)=>(
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{background:'hsl(174,65%,38%)'}}/>
                  <span className="text-gray-600 font-display text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Tilted monitor mockup - ORTEX style */}
          <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="flex justify-center">
            <div className="relative" style={{transform:'perspective(800px) rotateY(-8deg) rotateX(3deg)'}}>
              <div className="w-[380px] bg-[#0d1117] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-[#161b22]">
                  <div className="w-2 h-2 rounded-full bg-red-500/70"/><div className="w-2 h-2 rounded-full bg-yellow-500/70"/><div className="w-2 h-2 rounded-full bg-green-500/70"/>
                </div>
                <div className="p-3 space-y-2">
                  {/* Professional candlestick chart */}
                  <div className="h-44 bg-[#0a0e17] rounded-lg relative overflow-hidden">
                    <div className="absolute top-1.5 left-2 flex items-center gap-2 z-10">
                      <span className="text-[8px] font-bold text-emerald-400">BTC/USD</span>
                      <span className="text-[8px] text-gray-500">1D</span>
                      <span className="text-[8px] text-gray-600">▪ MA7</span>
                      <span className="text-[8px] text-gray-600">▪ MA25</span>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      {/* Grid */}
                      {[25,50,75,100].map(y=><line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#ffffff06" strokeWidth="1"/>)}
                      {[75,150,225].map(x=><line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#ffffff06" strokeWidth="1"/>)}
                      {/* Area */}
                      <path d="M0,85 C20,78 35,92 55,72 C75,52 90,62 110,47 C130,32 145,42 160,30 C175,18 190,24 210,16 C225,10 245,14 265,9 C278,6 290,8 300,5 L300,120 L0,120Z" fill="url(#priceGrad)"/>
                      {/* Price line */}
                      <path d="M0,85 C20,78 35,92 55,72 C75,52 90,62 110,47 C130,32 145,42 160,30 C175,18 190,24 210,16 C225,10 245,14 265,9 C278,6 290,8 300,5" stroke="#10b981" strokeWidth="2" fill="none"/>
                      {/* MA7 */}
                      <path d="M0,90 C40,82 80,70 120,55 C160,40 200,28 240,17 C265,11 285,8 300,6" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.8"/>
                      {/* MA25 */}
                      <path d="M0,95 C50,88 100,78 150,62 C200,46 240,32 300,18" stroke="#6366f1" strokeWidth="1" fill="none" opacity="0.7"/>
                      {/* Candles */}
                      {[[18,72,78,68],[40,60,66,56],[62,46,52,42],[84,34,40,30],[106,28,34,25],[128,22,27,19],[150,17,22,14],[172,14,18,11],[194,11,15,9],[216,9,13,7],[238,8,11,6],[260,6,10,4],[282,5,8,3]].map(([x,o,h,l],i)=>(
                        <g key={i}>
                          <line x1={x} y1={l-2} x2={x} y2={h+2} stroke={i%4===2?'#ef4444':i%5===3?'#ef4444':'#10b981'} strokeWidth="0.8" opacity="0.9"/>
                          <rect x={x-3.5} y={Math.min(o,h)} width="7" height={Math.max(Math.abs(h-o),2)} fill={i%4===2?'#ef4444':i%5===3?'#ef4444':'#10b981'} opacity="0.85"/>
                        </g>
                      ))}
                    </svg>
                    {/* Volume */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-end gap-px h-5 px-0.5">
                      {[25,40,30,55,35,65,48,38,60,45,72,55,85,62,78].map((h,i)=>(
                        <div key={i} className="flex-1 rounded-t-sm" style={{height:`${h}%`,background:i%4===2||i%5===3?'rgba(239,68,68,0.35)':'rgba(16,185,129,0.35)'}}/>
                      ))}
                    </div>
                    {/* Y labels */}
                    <div className="absolute right-1 top-8 bottom-5 flex flex-col justify-between">
                      {['68K','65K','62K','59K','56K'].map((l,i)=><span key={i} className="text-[7px] text-gray-600">{l}</span>)}
                    </div>
                  </div>
                  {/* Signal rows */}
                  <div className="space-y-0.5">
                    {[['BTC/USD','5★','+2230%'],['ETH/USD','5★','+1840%'],['TSLA','4★','+920%'],['DOGE','5★','+3100%']].map(([a,s,r],i)=>(
                      <div key={i} className="flex items-center justify-between bg-[#161b22] rounded px-2 py-1">
                        <span className="text-[9px] text-white font-semibold">{a}</span>
                        <span className="text-[9px] text-yellow-400">{s}</span>
                        <span className="text-[9px] font-bold text-emerald-400">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-4 w-16 bg-gray-300 mx-auto rounded-b"/>
              <div className="h-1 w-28 bg-gray-400 mx-auto rounded"/>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Block 2.5: AI Bot Praise - NEW SECTION */}
      <div className="py-20" style={{background:'hsl(174,65%,35%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-widest mb-4 bg-white/20 text-white border border-white/30">
              ⚡ World-Class AI Engine
            </span>
            <h2 className="font-display font-bold text-white mb-3" style={{fontSize:'clamp(2rem,5vw,3.5rem)'}}>
              The Fastest, Most Accurate<br/>
              <span className="italic text-white/80">Trading Bot</span> On The Market
            </h2>
            <p className="text-white/70 font-display max-w-xl mx-auto">Engineered for maximum yield. Designed to outperform. Built to win.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: '⚡', label: 'Ultra-Fast Execution', val: '< 2ms', desc: 'Trades faster than human reaction time. Never misses an entry.' },
              { icon: '📈', label: 'Average R/R Ratio', val: '1 : 8.4', desc: 'High reward-to-risk on every signal. AI filters low-quality setups.' },
              { icon: '🎯', label: 'Signal Accuracy', val: '94.7%', desc: 'Back-tested across 10,000+ trades. Accuracy verified by third parties.' },
              { icon: '🔄', label: 'Daily Staking Yield', val: '15%', desc: 'Powered by AI arbitrage across 40+ exchanges simultaneously.' },
            ].map((c,i)=>(
              <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
                className="p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 transition-all text-center">
                <div className="text-3xl mb-3">{c.icon}</div>
                <p className="font-display text-3xl font-bold text-white mb-1">{c.val}</p>
                <p className="font-display font-semibold text-sm mb-2 text-white/90">{c.label}</p>
                <p className="text-xs text-white/60 font-display leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
              <p className="font-display font-bold italic mb-4 leading-tight text-2xl text-white">
                "The only bot that trades smarter than the market itself"
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Brain, text: 'Advanced neural network trained on 8 years of market data' },
                  { icon: Zap, text: 'Simultaneous multi-asset trading — crypto, stocks & meme coins' },
                  { icon: Shield, text: 'Built-in risk engine with automatic stop-loss & take-profit' },
                  { icon: TrendingUp, text: 'Real-time on-chain analysis + sentiment tracking' },
                  { icon: Wallet, text: 'Proven 2,230%+ returns — verified historical performance' },
                  { icon: Clock, text: 'Zero downtime — trades 24/7/365, no human intervention needed' },
                ].map(({icon: Icon, text},i)=>(
                  <li key={i} className="flex items-start gap-3 text-white/80 font-display text-sm">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-white/60"/>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Bot performance metrics card */}
            <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
              <div className="rounded-2xl border border-white/20 overflow-hidden bg-white/10">
                <div className="px-4 py-3 border-b border-white/20 flex items-center gap-2">
                  <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{opacity:[1,0.3,1]}} transition={{duration:1.2,repeat:Infinity}}/>
                  <span className="text-xs font-display font-bold text-white">AI Bot Performance — Live</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    {label:'Today\'s Profit',val:'+$84,230',bar:84,color:'#10b981'},
                    {label:'Win Rate (30d)',val:'94.7%',bar:95,color:'#10b981'},
                    {label:'Avg Return/Trade',val:'+18.4%',bar:73,color:'#60a5fa'},
                    {label:'Max Drawdown',val:'-2.1%',bar:8,color:'#f59e0b'},
                    {label:'Sharpe Ratio',val:'4.82',bar:90,color:'#a78bfa'},
                  ].map(({label,val,bar,color},i)=>(
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60 font-display">{label}</span>
                        <span className="font-bold font-display" style={{color}}>{val}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{background:color}}
                          initial={{width:0}} whileInView={{width:`${bar}%`}}
                          viewport={{once:true}} transition={{duration:1.2, delay:i*0.1, ease:'easeOut'}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100"/>

      {/* Block 3: Comparison - big teal uppercase heading */}
      <div className="border-t border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mb-10">
            <h2 className="font-display font-bold uppercase tracking-wider mb-4" style={{color:'hsl(174,65%,38%)',fontSize:'1.8rem'}}>
              Comparison and Portfolios
            </h2>
            <p className="text-gray-700 max-w-xl font-display">
              Check out how a portfolio of just 25 assets selected based on our AI Scores have performed over 4+ years — 
              <span className="text-primary font-semibold cursor-pointer"> AI Stock Scores</span>
            </p>
          </motion.div>

          {/* Dark dashboard mockup - full width */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
            <div className="bg-[#0d1117] p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"/><div className="w-2.5 h-2.5 rounded-full bg-green-500/70"/>
              <div className="flex-1 ml-3 h-4 bg-[#161b22] rounded text-[9px] text-gray-500 flex items-center px-2">cortex.io/dashboard/portfolio</div>
            </div>
            {/* Portfolio Performance Chart */}
            <div className="bg-[#111827] rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-white">AI Portfolio vs S&P 500</span>
                <span className="text-[8px] text-emerald-400 font-bold">+2,230% vs +84%</span>
              </div>
              <div className="relative h-28">
                <svg className="w-full h-full" viewBox="0 0 300 90" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {[18,36,54,72].map(y=><line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#ffffff06" strokeWidth="1"/>)}
                  {[75,150,225].map(x=><line key={x} x1={x} y1="0" x2={x} y2="90" stroke="#ffffff06" strokeWidth="1"/>)}
                  {/* AI Portfolio - aggressive curve */}
                  <path d="M0,88 C20,87 40,85 60,80 C80,74 100,65 120,52 C140,38 160,28 180,18 C200,10 220,7 240,5 C260,3 280,4 300,3 L300,90 L0,90Z" fill="url(#portfolioGrad)"/>
                  <path d="M0,88 C20,87 40,85 60,80 C80,74 100,65 120,52 C140,38 160,28 180,18 C200,10 220,7 240,5 C260,3 280,4 300,3" stroke="#10b981" strokeWidth="2.5" fill="none"/>
                  {/* S&P 500 - slow linear */}
                  <path d="M0,88 C50,86 100,83 150,78 C200,73 240,70 300,65 L300,90 L0,90Z" fill="url(#spGrad)"/>
                  <path d="M0,88 C50,86 100,83 150,78 C200,73 240,70 300,65" stroke="#6366f1" strokeWidth="1.5" fill="none" opacity="0.9"/>
                  {/* Labels at end */}
                  <text x="285" y="6" fill="#10b981" fontSize="6" fontWeight="bold">+2230%</text>
                  <text x="285" y="62" fill="#818cf8" fontSize="6">+84%</text>
                </svg>
                {/* X axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                  {['2020','2021','2022','2023','2024'].map(y=><span key={y} className="text-[7px] text-gray-600">{y}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1"><div className="w-6 h-0.5 bg-emerald-500 rounded"/><span className="text-[8px] text-gray-400">Cortex AI</span></div>
                <div className="flex items-center gap-1"><div className="w-6 h-0.5 bg-indigo-400 rounded"/><span className="text-[8px] text-gray-400">S&P 500</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[['Quality Score','81','hsl(174,65%,38%)',[['Sales Growth','63','#10b981'],['Short Int.','79','#10b981'],['EBIT Margin','56','#10b981']]],['Value Score','39','hsl(43,74%,66%)',[['Div. Yield','42','#f59e0b'],['Price/Book','35','#f59e0b'],['FCF Yield','58','#f59e0b']]]].map(([title,score,color,metrics],ti)=>(
                <div key={ti} className="bg-[#161b22] rounded-lg p-2.5">
                  <p className="text-[9px] text-gray-400 text-center uppercase tracking-wide mb-1.5">{title}</p>
                  <div className="flex items-center justify-center mb-2">
                    <svg width="52" height="52" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="20" fill="none" stroke="#1f2937" strokeWidth="5"/>
                      <circle cx="26" cy="26" r="20" fill="none" stroke={color} strokeWidth="5"
                        strokeDasharray={`${parseInt(score)*1.257} ${125.7}`} strokeLinecap="round"
                        style={{transformOrigin:'center', transform:'rotate(-90deg)'}}/>
                      <text x="26" y="30" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{score}</text>
                    </svg>
                  </div>
                  <div className="space-y-1">
                    {metrics.map(([k,v,c],i)=>(
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-[7px] text-gray-500 w-14 truncate">{k}</span>
                        <div className="flex-1 h-1 bg-gray-700 rounded-full"><div className="h-full rounded-full" style={{width:`${v}%`,background:c}}/></div>
                        <span className="text-[7px] text-gray-400 w-4">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// ORTEX "APIs" section style - giant teal display text + treemap mockup
export default function MarketsSection() {
  return (
    <section id="markets" className="bg-gray-50">

      {/* Short Interest / Data section */}
      <div className="py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
              <h2 className="font-display font-bold text-gray-900 mb-4" style={{fontSize:'1.8rem'}}>Short Interest Data</h2>
              <p className="text-gray-600 font-display mb-4">
                Our securities lending and short interest data provides you with many metrics, such as cost to borrow, utilization, shares sold short, and percentage of shares sold short — all in real-time.
              </p>
              <p className="text-gray-600 font-display mb-6">
                You can read more about <span className="font-semibold cursor-pointer" style={{color:'hsl(174,65%,38%)'}}>Cortex Short Interest here</span>
              </p>
              <Link to="/register">
                <Button className="bg-red-500 hover:bg-red-600 text-white font-display font-semibold px-7 h-11 rounded-full">
                  Create a Free account to try it out
                </Button>
              </Link>
            </motion.div>

            {/* Treemap-style mockup */}
            <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
              <div className="bg-[#0d1117] p-3">
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/70"/><div className="w-2 h-2 rounded-full bg-yellow-500/70"/><div className="w-2 h-2 rounded-full bg-green-500/70"/>
                </div>
                {/* Treemap grid */}
                <div className="grid grid-cols-5 gap-0.5">
                  {[
                    {sym:'MSFT',size:'col-span-2 row-span-2',h:'h-20',bg:'bg-red-700/60'},
                    {sym:'AAPL',size:'col-span-2',h:'h-9',bg:'bg-red-600/60'},
                    {sym:'B',size:'col-span-1',h:'h-9',bg:'bg-gray-600/60'},
                    {sym:'NVDA',size:'col-span-1',h:'h-9',bg:'bg-red-500/60'},
                    {sym:'TSLA',size:'col-span-1',h:'h-9',bg:'bg-red-800/60'},
                    {sym:'AMZN',size:'col-span-2',h:'h-9',bg:'bg-gray-700/60'},
                    {sym:'META',size:'col-span-1',h:'h-9',bg:'bg-red-400/60'},
                    {sym:'GOOGL',size:'col-span-2',h:'h-9',bg:'bg-red-600/60'},
                    {sym:'NFLX',size:'col-span-1',h:'h-9',bg:'bg-gray-600/60'},
                  ].map((c,i)=>(
                    <div key={i} className={`${c.size} ${c.h} ${c.bg} rounded flex items-center justify-center`}>
                      <span className="text-[9px] font-bold text-white">{c.sym}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* APIs section - ORTEX giant display text */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
            <h2 className="font-display font-bold mb-2 leading-none" style={{fontSize:'clamp(5rem,12vw,10rem)',color:'hsl(174,65%,38%)'}}>
              APIs
            </h2>
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">Direct Access to Market-Moving Data</h3>
            <p className="text-gray-600 max-w-xl mx-auto font-display mb-8">
              Integrate our AI trading signals, short interest data, and real-time market feeds directly into your own tools and algorithms via our REST API.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 text-left mt-10">
              {[
                {title:'REST API',desc:'Full access to all Cortex data endpoints with JSON responses. Real-time and historical data available.'},
                {title:'WebSocket Feed',desc:'Ultra-low latency streaming of trade signals, order book changes, and AI score updates.'},
                {title:'Data Export',desc:'Bulk export historical datasets for backtesting and quantitative research.'},
              ].map((a,i)=>(
                <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                  <h4 className="font-display font-bold text-gray-900 mb-2">{a.title}</h4>
                  <p className="text-sm text-gray-600 font-display">{a.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
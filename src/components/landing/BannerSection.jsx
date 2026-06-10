import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

function NetworkBg() {
  const dots = Array.from({length:14},(_,i)=>({cx:(i*102+50)%1400,cy:(i*37+20)%180}));
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 1400 180" preserveAspectRatio="xMidYMid slice">
      {dots.map((d,i)=>i<dots.length-1&&(<line key={i} x1={d.cx} y1={d.cy} x2={dots[i+1].cx} y2={dots[i+1].cy} stroke="white" strokeWidth="1"/>))}
      {dots.map((d,i)=>(<circle key={i} cx={d.cx} cy={d.cy} r="2.5" fill="white"/>))}
    </svg>
  );
}

export default function BannerSection() {
  return (
    <section className="py-20 relative overflow-hidden" style={{background:'linear-gradient(135deg,hsl(174,65%,30%) 0%,hsl(185,68%,40%) 60%,hsl(174,60%,32%) 100%)'}}>
      <NetworkBg />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <h2 className="font-display font-bold leading-tight text-white mb-2" style={{fontSize:'clamp(2.5rem,6vw,4.5rem)'}}>
            <span className="italic" style={{color:'hsl(185,90%,78%)'}}>Better</span> Trading.<br/>Start for Free.
          </h2>
          <p className="text-white/75 font-display mb-8 text-lg">$500 welcome bonus · 1-week free trial · 2% daily staking · No locked contracts</p>
          <Link to="/register">
            <Button className="bg-red-500 hover:bg-red-600 text-white font-display font-semibold px-10 gap-2 h-12 rounded-full text-base shadow-xl">
              Join for Free <ArrowRight className="w-4 h-4"/>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  { name:'Marcus R.',handle:'@marcus_trades',avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',text:'Made $14,200 in the first two weeks. The AI bot picked an ETH long at exactly the right time. This platform is insane.',profit:'+$14,200',asset:'ETH Long' },
  { name:'Priya S.',handle:'@priyainvests',avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',text:'The staking rewards alone cover my monthly expenses now. 2% per day compounds crazy fast. Wish I found this sooner.',profit:'+$8,400/mo',asset:'USDT Staking' },
  { name:'Kai T.',handle:'@kaitrading_x',avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',text:'Caught the PEPE pump with 50x leverage thanks to the AI signal. Life-changing. The bot sold at the perfect top.',profit:'+$31,800',asset:'PEPE 50x' },
  { name:'Jordan M.',handle:'@jm_cryptomax',avatar:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',text:'Referred 4 friends, got $1,200 in bonuses on top of my trading profits. The referral system is incredibly generous.',profit:'+$1,200 bonus',asset:'Referrals' },
  { name:'Sofia K.',handle:'@sofiak_finance',avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',text:'Withdrew $50,000 this month with zero issues. No locked contracts, no games. Best platform I\'ve used in 6 years.',profit:'$50K withdrawn',asset:'BTC + TSLA' },
  { name:'Alex P.',handle:'@alexprofits',avatar:'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face',text:'Won the weekly leaderboard twice. $7,500 in pool rewards plus my regular gains. The competition keeps me motivated.',profit:'+$7,500 pool',asset:'Weekly Pool #1' },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
          <p className="text-xs font-display font-bold uppercase tracking-widest mb-3" style={{color:'hsl(174,65%,38%)'}}>Community</p>
          <h2 className="font-display text-4xl font-bold text-gray-900">What traders are saying</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t,i)=>(
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.06}}
              className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover"/>
                <div>
                  <p className="font-display font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400 font-display">{t.handle}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-display font-bold text-emerald-600 text-sm">{t.profit}</p>
                  <p className="text-xs text-gray-400 font-display">{t.asset}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed font-display">"{t.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
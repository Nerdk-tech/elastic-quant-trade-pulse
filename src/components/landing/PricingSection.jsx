import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    sub: '1 week free trial',
    features: ['AI trading bot access', 'Crypto & stocks', 'Up to 10x leverage', '$500 welcome bonus', 'Basic analytics', '0% fee during trial'],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '5%',
    sub: 'of expert AI trading bot generated profits only',
    features: ['Everything in Starter', 'Up to 100x leverage', 'Meme coin access', '15% daily staking rate', 'Weekly reward pool', 'Referral system ($300/ref)', 'Priority withdrawals', 'Highest yields on market'],
    cta: 'Get Pro',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Institutional',
    price: 'Custom',
    sub: 'for high-volume traders',
    features: ['Everything in Pro', 'Dedicated AI agent', 'Custom leverage limits', 'API access', 'White-glove support', 'Custom fee structure', 'Early feature access'],
    cta: 'Contact us',
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto font-display">
            We only charge 5% on expert AI trading bot generated profits — never on deposits. First week is completely free.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.highlight
                  ? 'border-primary shadow-lg shadow-primary/10'
                  : 'border-gray-200 bg-white'
              }`}
              style={plan.highlight ? { background: 'linear-gradient(160deg, hsl(174,65%,30%) 0%, hsl(185,70%,42%) 100%)' } : {}}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                    <Zap className="w-3 h-3" />{plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`text-sm font-medium ${plan.highlight ? 'text-teal-200' : 'text-gray-500'}`}>{plan.name}</p>
                <p className={`font-display text-5xl font-bold mt-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</p>
                <p className={`text-xs mt-1 ${plan.highlight ? 'text-teal-200' : 'text-gray-400'}`}>{plan.sub}</p>
              </div>

              {plan.name === 'Pro' && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-white/15 border border-white/20 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="text-xs text-white font-medium">Best rates on the market</span>
                </div>
              )}

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-teal-200' : 'text-primary'}`} />
                    <span className={`text-sm ${plan.highlight ? 'text-teal-100' : 'text-gray-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register">
                <Button className={`w-full font-semibold h-11 rounded-full ${
                  plan.highlight
                    ? 'bg-white text-primary hover:bg-gray-100'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}>
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
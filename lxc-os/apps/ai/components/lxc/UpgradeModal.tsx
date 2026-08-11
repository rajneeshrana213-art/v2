'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Check, Zap, Star, GraduationCap, Lock, Sparkles,
  CreditCard, Shield, ArrowRight, BadgeCheck, Infinity as InfinityIcon
} from 'lucide-react';
import { PLAN_META, GOAL_PLAN_MAP, type PlanKey, planIncludes } from '@/lib/lxc/module-access';
import { lxcWebUrl } from '@/lib/lxc-api-base';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (planKey: PlanKey) => void;
  currentPlan: PlanKey;
  educationGoal?: 'school' | 'college' | 'competitive';
  /** Pre-selected plan (from locked module CTA) */
  preselect?: PlanKey;
}

declare global {
  interface Window { Razorpay: any; }
}

const PLAN_FEATURES: Record<Exclude<PlanKey, 'free'>, string[]> = {
  ignite: [
    'AI Classroom (PDF → immersive lessons)',
    'Smart Notes & Mind Maps',
    'Study Roadmap & Flashcard AI',
    'Practice Tests + Adaptive Quiz',
    'Focus AI Pomodoro',
    'Peer Study Arena',
    'Bharat Mode & Voice AI',
    'Parent Dashboard',
    'Achievements & XP',
  ],
  zenith: [
    'Everything in Ignite Plus',
    'Digital Twin AI Model',
    'Performance Dashboard & Risk Alert',
    'Project Companion',
    'Mentor AI & Life Skills Coach',
    'Soft Skills Coach & Avatar',
    'Talent Discovery',
    'Skill Passport (NFT credentials)',
    'Gov & CSR Analytics',
  ],
  apex: [
    'Everything in Zenith Pro',
    'Decision Simulator',
    'Wellness & Emotion AI',
    'RIT AI Placement Engine',
    'Competitive Exam AI Tutor',
    'JEE / NEET / UPSC Modules',
    'Priority AI response speed',
    'Exclusive Beta features access',
  ],
  lifetime: [
    'Everything in Apex Elite — forever',
    'All 24 AI modules unlocked permanently',
    'No monthly / annual renewal',
    'Free upgrades to all future modules',
    'Priority support & early access',
    'Skill Passport (NFT credentials)',
    'Dedicated AI tutor session credits',
    'Exclusive Lifetime Member badge',
  ],
};

export function UpgradeModal({ isOpen, onClose, onSuccess, currentPlan, educationGoal, preselect }: UpgradeModalProps) {
  const recommendedPlan = educationGoal ? GOAL_PLAN_MAP[educationGoal] : 'ignite';

  type NonFreePlan = Exclude<PlanKey, 'free'>;
  const [selectedPlan, setSelectedPlan] = useState<NonFreePlan>(
    (preselect && preselect !== 'free' ? preselect : recommendedPlan) as NonFreePlan
  );
  const [billing, setBilling] = useState<'monthly' | 'annual' | 'lifetime'>('monthly');
  const [autoRenew, setAutoRenew] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPlan, setSuccessPlan] = useState<PlanKey>('ignite');

  // --- Dynamic Pricing from Database ---
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    async function fetchPlans() {
      try {
        setIsLoadingPlans(true);
        const res = await fetch('/api/plans');
        const data = await res.json();
        if (data.success && data.plans) {
          setDbPlans(data.plans);
        }
      } catch (err) {
        console.error('Failed to fetch pricing plans:', err);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    fetchPlans();
  }, [isOpen]);

  const getDynamicPrice = useCallback((planKey: PlanKey, type: 'monthly' | 'annual' | 'lifetime') => {
    const goal = (educationGoal === 'college' || educationGoal === 'competitive') ? educationGoal : 'school';
    const goalUpper = goal.toUpperCase();
    
    let dbName = '';
    if (planKey === 'ignite') {
      dbName = `RIT_AI_${goalUpper}_IGNITE`;
    } else if (planKey === 'zenith') {
      dbName = `RIT_AI_${goalUpper}_ZENITH_PRO`;
    } else if (planKey === 'apex') {
      dbName = `RIT_AI_${goalUpper}_ZENITH_ELITE`;
    } else if (planKey === 'lifetime') {
      dbName = `RIT_AI_${goalUpper}_LIFETIME`;
    }

    const p = dbPlans.find(pl => pl.name === dbName);
    const basePrice = p ? p.price : 0;

    if (type === 'lifetime') {
      return basePrice;
    } else if (type === 'annual') {
      return basePrice * 10;
    } else {
      return basePrice;
    }
  }, [dbPlans, educationGoal]);

  const apexMonthly = getDynamicPrice('apex', 'monthly');
  const lifetimePrice = getDynamicPrice('lifetime', 'lifetime');
  const savings2Yrs = apexMonthly * 12 * 2 - lifetimePrice;

  const annualSaving = (plan: Exclude<PlanKey, 'free' | 'lifetime'>) => {
    const m = getDynamicPrice(plan, 'monthly') * 12;
    const a = getDynamicPrice(plan, 'annual');
    return Math.round(((m - a) / m) * 100);
  };

  useEffect(() => {
    if (!isOpen) return;
    setSelectedPlan((preselect && preselect !== 'free' ? preselect : recommendedPlan) as NonFreePlan);
  }, [isOpen, preselect, recommendedPlan]);

  // When lifetime plan selected, force lifetime billing
  useEffect(() => {
    if (selectedPlan === 'lifetime') setBilling('lifetime');
    else if (billing === 'lifetime') setBilling('monthly');
  }, [selectedPlan]);

  useEffect(() => {
    if (selectedPlan === 'lifetime' || billing === 'lifetime') {
      setAutoRenew(false);
    } else {
      setAutoRenew(true);
    }
  }, [selectedPlan, billing]);

  // Load Razorpay SDK
  useEffect(() => {
    if (!isOpen) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, [isOpen]);

  const handlePayment = useCallback(async () => {
    setIsProcessing(true);
    setPaymentError(null);

    const token = localStorage.getItem('@lxc_ai_token');
    if (!token) {
      setPaymentError('Please log in to purchase a plan.');
      setIsProcessing(false);
      return;
    }

    const effectiveCycle = selectedPlan === 'lifetime' ? 'lifetime' : billing;

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch(lxcWebUrl('/api/v1/forum/subscription/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          planKey: selectedPlan,
          billingCycle: effectiveCycle,
          autoRenew: autoRenew && effectiveCycle !== 'lifetime',
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Open Razorpay checkout
      const planMeta = PLAN_META[selectedPlan];
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LearnXChain',
        description: `${orderData.planName} — ${effectiveCycle === 'lifetime' ? 'Lifetime Access' : effectiveCycle === 'annual' ? 'Annual' : 'Monthly'}`,
        ...(orderData.subscriptionId
          ? { subscription_id: orderData.subscriptionId }
          : { order_id: orderData.orderId }),
        theme: { color: planMeta.color },
        prefill: {},
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_subscription_id?: string;
          razorpay_signature: string;
        }) => {
          try {
            // 3. Verify payment
            const verifyRes = await fetch(lxcWebUrl('/api/v1/forum/subscription/verify-payment'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planKey: selectedPlan,
                billingCycle: effectiveCycle,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

            // 4. Show success
            setSuccessPlan(selectedPlan);
            setShowSuccess(true);
            // Clear plan cache
            try { localStorage.removeItem('lxc_forum_plan_cache'); } catch {}
            setTimeout(() => {
              onSuccess(selectedPlan);
              onClose();
              setShowSuccess(false);
            }, 3000);
          } catch (err: any) {
            setPaymentError(err.message || 'Payment verification failed. Contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => { setIsProcessing(false); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  }, [selectedPlan, billing, autoRenew, onSuccess, onClose]);

  if (!isOpen) return null;

  const SUBSCRIPTION_PLANS: Exclude<PlanKey, 'free' | 'lifetime'>[] = ['ignite', 'zenith', 'apex'];
  const isLifetimeSelected = selectedPlan === 'lifetime';
  const alreadyLifetime = currentPlan === 'lifetime';

  return (
    <AnimatePresence>
      {showSuccess ? (
        // ── Success screen ──────────────────────────────────────────────────
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4 p-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              className="text-7xl"
            >
              {PLAN_META[successPlan].emoji}
            </motion.div>
            <h2 className="text-3xl font-black text-white">
              Welcome to {PLAN_META[successPlan].label}! 🎉
            </h2>
            <p className="text-slate-300">
              {successPlan === 'lifetime'
                ? 'Your lifetime access is now active. All modules unlocked forever! 🎊'
                : 'Your modules are now unlocked. Redirecting...'}
            </p>
            <div className="flex justify-center gap-1 mt-4">
              {[0,1,2,3,4].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full"
                  style={{ background: PLAN_META[successPlan].color }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : (
        // ── Main modal ──────────────────────────────────────────────────────
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl scrollbar-hide text-slate-900 dark:text-white"
          >
            {/* ── Header ── */}
            <div className="relative p-6 pb-4 border-b border-slate-100 dark:border-white/8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1A9FFF]/15 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#1A9FFF]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Unlock Your Full Potential</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose a plan and start learning without limits</p>
                </div>
              </div>

              {/* Goal recommendation badge */}
              {educationGoal && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${PLAN_META[recommendedPlan].color}15`, color: PLAN_META[recommendedPlan].color, border: `1px solid ${PLAN_META[recommendedPlan].color}30` }}>
                  <BadgeCheck className="w-3 h-3" />
                  Recommended for your goal: {PLAN_META[recommendedPlan].label}
                </div>
              )}
            </div>

            <div className="p-6 space-y-5">
              {/* ── Billing toggle (hidden for lifetime) ── */}
              {!isLifetimeSelected && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <span className={`text-xs font-bold ${billing === 'monthly' ? 'text-slate-955 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Monthly</span>
                    <button
                      onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
                      className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${billing === 'annual' ? 'bg-[#1A9FFF]' : 'bg-slate-200 dark:bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${billing === 'annual' ? 'left-6' : 'left-1'}`} />
                    </button>
                    <span className={`text-xs font-bold flex items-center gap-1 ${billing === 'annual' ? 'text-slate-955 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      Annual
                      <span className="bg-[#5CDD2B]/20 text-[#5CDD2B] text-[9px] font-black px-1.5 py-0.5 rounded-full">SAVE UP TO 30%</span>
                    </span>
                  </div>

                </div>
              )}

              {/* ── Subscription plan cards ── */}
              {isLoadingPlans ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-32 rounded-2xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/3 p-4 flex flex-col justify-between">
                      <div className="h-6 w-12 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                      <div className="h-4 w-24 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
                      <div className="h-6 w-16 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const meta = PLAN_META[plan];
                    const isSelected = selectedPlan === plan;
                    const isRecommended = plan === recommendedPlan;
                    const price = billing === 'annual' ? getDynamicPrice(plan, 'annual') : getDynamicPrice(plan, 'monthly');
                    const monthlyEffective = billing === 'annual' ? Math.round(getDynamicPrice(plan, 'annual') / 12) : getDynamicPrice(plan, 'monthly');
                    const alreadyOwned = planIncludes(currentPlan, plan) && currentPlan !== 'lifetime';

                    return (
                      <div key={plan} className="relative">
                        {isRecommended && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: meta.color, color: '#000' }}>
                            ⭐ BEST FOR YOU
                          </div>
                        )}
                        <button
                          onClick={() => !alreadyOwned && setSelectedPlan(plan)}
                          disabled={alreadyOwned}
                          className={`w-full p-4 rounded-2xl border text-left transition-all ${
                            alreadyOwned
                              ? 'opacity-50 cursor-not-allowed border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2'
                              : isSelected
                              ? 'border-2 cursor-pointer bg-white dark:bg-transparent'
                              : 'border-slate-200 hover:border-slate-300 dark:border-white/8 dark:hover:border-white/20 cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-white/3 dark:hover:bg-white/5'
                          }`}
                          style={isSelected && !alreadyOwned ? { borderColor: meta.color, background: `${meta.color}08` } : {}}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{meta.emoji}</span>
                            {isSelected && !alreadyOwned && <Check className="w-4 h-4" style={{ color: meta.color }} />}
                            {alreadyOwned && <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold">CURRENT</span>}
                          </div>
                          <div className="font-black text-sm text-slate-900 dark:text-white">{meta.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 mb-2">{meta.desc}</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900 dark:text-white" style={isSelected ? { color: meta.color } : {}}>₹{monthlyEffective}</span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400">/mo</span>
                          </div>
                          {billing === 'annual' && (
                            <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">₹{price}/year · Save {annualSaving(plan)}%</div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Lifetime plan — special full-width card ── */}
              {isLoadingPlans ? (
                <div className="w-full h-20 rounded-2xl border border-purple-500/10 bg-purple-500/5 p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-28 bg-purple-500/10 rounded-lg"></div>
                        <div className="h-3 w-48 bg-purple-500/10 rounded-lg"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-6 w-16 bg-purple-500/10 rounded-lg"></div>
                      <div className="h-3 w-20 bg-purple-500/10 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl blur-xl opacity-20 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }} />

                  <button
                    onClick={() => !alreadyLifetime && setSelectedPlan('lifetime')}
                    disabled={alreadyLifetime}
                    className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      alreadyLifetime
                        ? 'opacity-50 cursor-not-allowed border-purple-500/20'
                        : isLifetimeSelected
                        ? 'cursor-pointer bg-white dark:bg-transparent'
                        : 'cursor-pointer border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5 hover:bg-purple-500/10'
                    }`}
                    style={isLifetimeSelected && !alreadyLifetime ? { borderColor: '#A855F7', background: '#A855F708' } : {}}
                  >
                    {/* Badge */}
                    <div className="absolute -top-3 left-4 text-[8px] font-black uppercase px-3 py-1 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#fff' }}>
                      ♾️ BEST VALUE · PAY ONCE
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}>
                          <InfinityIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            Lifetime Elite
                            {alreadyLifetime && <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold">CURRENT</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">All 24 modules · Never expires · Free future upgrades</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">₹{getDynamicPrice('lifetime', 'lifetime')}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400">one-time payment</div>
                        <div className="text-[9px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                          saves ₹{savings2Yrs > 0 ? savings2Yrs.toLocaleString() : '1,400+'}/2yrs
                        </div>
                      </div>

                      {isLifetimeSelected && !alreadyLifetime && (
                        <Check className="w-5 h-5 shrink-0 ml-3" style={{ color: '#A855F7' }} />
                      )}
                    </div>
                  </button>
                </div>
              )}

              {/* ── Feature list for selected plan ── */}
              <div className="border border-slate-200 dark:border-white/8 rounded-2xl p-4 bg-slate-50 dark:bg-white/2 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  What's included in {PLAN_META[selectedPlan].label}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {PLAN_FEATURES[selectedPlan].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                      <Check className="w-3 h-3 shrink-0" style={{ color: PLAN_META[selectedPlan].color }} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {paymentError && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 font-medium">
                  ⚠️ {paymentError}
                </div>
              )}

              {/* ── CTA ── */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || (planIncludes(currentPlan, selectedPlan) && !(selectedPlan === 'lifetime' && currentPlan !== 'lifetime'))}
                className="w-full py-3.5 rounded-2xl font-black text-sm text-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: `linear-gradient(135deg, ${PLAN_META[selectedPlan].color}, ${PLAN_META[selectedPlan].color}cc)` }}
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full"
                    />
                    Processing…
                  </>
                ) : alreadyLifetime ? (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    You have Lifetime Access ♾️
                  </>
                ) : planIncludes(currentPlan, selectedPlan) && selectedPlan !== 'lifetime' ? (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    Already on {PLAN_META[selectedPlan].label}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {selectedPlan === 'lifetime'
                      ? `Pay ₹${getDynamicPrice('lifetime', 'lifetime')} Once — Lifetime Access`
                      : `Pay ₹${billing === 'annual' ? getDynamicPrice(selectedPlan, 'annual') : getDynamicPrice(selectedPlan, 'monthly')}${billing === 'annual' ? '/year' : '/month'} with Razorpay`
                    }
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-[9px] text-slate-500 dark:text-neutral-400">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-[#5CDD2B]" /> 7-day refund</span>
                <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-[#1A9FFF]" /> Secure Razorpay</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> GST invoice</span>
                {isLifetimeSelected && (
                  <span className="flex items-center gap-1"><InfinityIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Lifetime guarantee</span>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

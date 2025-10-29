import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import Header from '../Header';

interface BillingPageProps {
  onAddCredits: (amount: number) => void;
}

interface CreditPackProps {
    credits: number;
    price: number;
    isPopular: boolean;
    onPurchase: () => void;
}

const CreditPack: React.FC<CreditPackProps> = ({ credits, price, isPopular, onPurchase }) => {
    const { t } = useTranslation();
    
    return (
        <div className={`relative bg-slate-800/50 border-2 rounded-lg p-6 flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300 ${isPopular ? 'border-cyan-400' : 'border-slate-700'}`}>
            {isPopular && (
                <div className="absolute -top-3.5 bg-cyan-400 text-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">{t('billingPage.pack.popular')}</div>
            )}
            <h3 className="text-2xl font-bold text-white mt-4">{t('billingPage.pack.title', { credits })}</h3>
            <p className="text-5xl font-extrabold text-white my-6">
                {t('billingPage.pack.price', { price })}
            </p>
            <button 
                onClick={onPurchase}
                className={`w-full font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${isPopular ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-slate-700 text-cyan-300 hover:bg-slate-600'}`}
            >
                {t('billingPage.pack.purchaseButton')}
            </button>
        </div>
    );
};


const BillingPage: React.FC<BillingPageProps> = ({ onAddCredits }) => {
  const { t } = useTranslation();

  const creditPacks = [
    { credits: 10, price: 10, isPopular: false },
    { credits: 50, price: 45, isPopular: true },
    { credits: 100, price: 80, isPopular: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-scale">
      <Header title={t('billingPage.header.title')} subtitle={t('billingPage.header.subtitle')} />
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {creditPacks.map((pack) => (
          <CreditPack 
            key={pack.credits}
            credits={pack.credits}
            price={pack.price}
            isPopular={pack.isPopular}
            onPurchase={() => onAddCredits(pack.credits)}
          />
        ))}
      </div>
    </div>
  );
};

export default BillingPage;

import React from 'react';
import { User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Header from '../Header';

interface AccountPageProps {
  user: User;
  onSetUserLogo: (logo: string) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, onSetUserLogo }) => {
  const { t } = useTranslation();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onSetUserLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-scale">
      <Header title="Studio Account" subtitle="Manage your studio branding and settings." />
      
      <div className="mt-12 grid grid-cols-1 gap-8 max-w-lg mx-auto">
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg space-y-4">
            <h3 className="text-xl font-semibold text-white">{t('dashboard.studioBranding.title')}</h3>
            <div className="text-center">
                <p className="text-sm text-slate-400">{t('dashboard.studioBranding.subtitle')}</p>
                {user.logo && (
                    <div className="bg-slate-900/50 p-4 rounded-md my-4">
                        <img src={user.logo} alt="Studio Logo Preview" className="max-h-20 mx-auto object-contain" />
                    </div>
                )}
                <label htmlFor="logo-upload-account" className="cursor-pointer mt-4 w-full inline-block bg-slate-700 text-cyan-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300">
                    {t('dashboard.studioBranding.uploadButton')}
                </label>
                <input id="logo-upload-account" type="file" className="sr-only" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

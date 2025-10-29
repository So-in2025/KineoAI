import React from 'react';

interface HeaderProps {
    title: string;
    subtitle: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="text-center p-4 md:p-6">
      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
        {title}
      </h1>
      <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">
        {subtitle}
      </p>
    </header>
  );
};

export default Header;

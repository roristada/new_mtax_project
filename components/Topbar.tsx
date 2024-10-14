"use client";

import React from "react";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Switch } from "../components/ui/switch";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

const Topbar = () => {
  const { data: session } = useSession();
  const t = useTranslations('Topbar');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "th" : "en";
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="border-2 border-blue-200">
            <AvatarFallback className="bg-white text-blue-400">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-medium">{t('welcome')}</span>
            <span className="text-xl font-bold text-blue-600 transition-all duration-300 ease-in-out hover:text-purple-500 hover:scale-105">
              {t('companyPlaceholder', { name: session?.user?.company })}
            </span>
            <span className="text-md font-semibold text-gray-700 transition-all duration-300 ease-in-out hover:text-pink-500 hover:scale-105">
              {t('namePlaceholder', { name: session?.user?.name })}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-white bg-opacity-50 rounded-full px-4 py-2 shadow-sm">
          <span className={`text-sm ${locale === "en" ? "font-medium text-blue-600" : "text-gray-600"}`}>
            EN
          </span>
          <Switch 
            checked={locale === "th"} 
            onCheckedChange={toggleLanguage}
            className="bg-blue-200"
          />
          <span className={`text-sm ${locale === "th" ? "font-medium text-blue-600" : "text-gray-600"}`}>
            TH
          </span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;

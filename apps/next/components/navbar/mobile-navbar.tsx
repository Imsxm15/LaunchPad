'use client';

import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Link } from 'next-view-transitions';
import { useMemo, useState } from 'react';
import { IoIosMenu } from 'react-icons/io';
import { IoIosClose } from 'react-icons/io';

import { LocaleSwitcher } from '../locale-switcher';
import { Button } from '@/components/elements/button';
import { Logo } from '@/components/logo';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

type Props = {
  leftNavbarItems: {
    URL: string;
    text: string;
    target?: string;
  }[];
  rightNavbarItems: {
    URL: string;
    text: string;
    target?: string;
  }[];
  logo: any;
  locale: string;
};

export const MobileNavbar = ({
  leftNavbarItems,
  rightNavbarItems,
  logo,
  locale,
}: Props) => {
  const [open, setOpen] = useState(false);

  const { scrollY } = useScroll();

  const [showBackground, setShowBackground] = useState(false);
  const router = useRouter();
  const { customer, logout } = useAuth();

  const displayName = useMemo(() => {
    if (!customer) {
      return '';
    }

    const fullName = `${customer.first_name ?? ''} ${customer.last_name ?? ''}`
      .trim()
      .replace(/\s+/g, ' ');

    return fullName.length ? fullName : customer.email;
  }, [customer]);

  const secondaryLine = useMemo(() => {
    if (!customer?.email) {
      return '';
    }

    return displayName !== customer.email ? customer.email : '';
  }, [customer, displayName]);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push(`/${locale}`);
  };

  useMotionValueEvent(scrollY, 'change', (value) => {
    if (value > 100) {
      setShowBackground(true);
    } else {
      setShowBackground(false);
    }
  });

  return (
    <div
      className={cn(
        'flex justify-between bg-transparent items-center w-full rounded-md px-2.5 py-1.5 transition duration-200',
        showBackground &&
          ' bg-neutral-900  shadow-[0px_-2px_0px_0px_var(--neutral-800),0px_2px_0px_0px_var(--neutral-800)]'
      )}
    >
      <Logo image={logo?.image} />

      <div className="flex items-center gap-2">
        {customer ? (
          <span className="text-xs font-semibold text-white leading-tight">
            {displayName}
          </span>
        ) : null}
        <IoIosMenu
          className="text-white h-6 w-6"
          onClick={() => setOpen(!open)}
        />
      </div>

      {open && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-start justify-start space-y-10  pt-5  text-xl text-zinc-600  transition duration-200 hover:text-zinc-800">
          <div className="flex items-center justify-between w-full px-5">
            <Logo locale={locale} image={logo?.image} />
            <div className="flex items-center space-x-2">
              <LocaleSwitcher currentLocale={locale} />
              <IoIosClose
                className="h-8 w-8 text-white"
                onClick={() => setOpen(!open)}
              />
            </div>
          </div>
          <div className="flex flex-col items-start justify-start gap-[14px] px-8">
            {leftNavbarItems.map((navItem: any, idx: number) => (
              <>
                {navItem.children && navItem.children.length > 0 ? (
                  <>
                    {navItem.children.map((childNavItem: any, idx: number) => (
                      <Link
                        key={`link=${idx}`}
                        href={`/${locale}${childNavItem.URL}`}
                        onClick={() => setOpen(false)}
                        className="relative max-w-[15rem] text-left text-2xl"
                      >
                        <span className="block text-white">
                          {childNavItem.text}
                        </span>
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    key={`link=${idx}`}
                    href={`/${locale}${navItem.URL}`}
                    onClick={() => setOpen(false)}
                    className="relative"
                  >
                    <span className="block text-[26px] text-white">
                      {navItem.text}
                    </span>
                  </Link>
                )}
              </>
            ))}
          </div>
          <div className="flex flex-col w-full gap-4 px-8 py-4">
            {customer ? (
              <div className="flex flex-col gap-3 text-white">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold leading-tight">
                    {displayName}
                  </span>
                  {secondaryLine ? (
                    <span className="text-sm text-neutral-400 leading-tight">
                      {secondaryLine}
                    </span>
                  ) : null}
                </div>
                <Button variant="simple" onClick={handleLogout} className="w-fit">
                  Se déconnecter
                </Button>
              </div>
            ) : (
              <div className="flex flex-row items-start gap-2.5">
                {rightNavbarItems.map((item, index) => (
                  <Button
                    key={item.text}
                    variant={
                      index === rightNavbarItems.length - 1
                        ? 'primary'
                        : 'simple'
                    }
                    as={Link}
                    href={`/${locale}${item.URL}`}
                    onClick={() => setOpen(false)}
                  >
                    {item.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

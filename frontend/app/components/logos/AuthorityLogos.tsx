"use client";

import React from "react";

export function DoajLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill="#F7A800" />
      <path d="M22 35H42C52 35 58 41 58 50C58 59 52 65 42 65H22V35ZM32 43V57H41C46 57 49 54 49 50C49 46 46 43 41 43H32Z" fill="#FFFFFF" />
      <circle cx="70" cy="50" r="8" fill="#FFFFFF" />
    </svg>
  );
}

export function ScopusLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="100" height="100" rx="50" fill="#EB6D00" />
      <path d="M68 36C63 31 52 30 40 35C28 40 22 49 24 57C26 65 37 68 50 65C60 62 67 56 68 49H57C56 52 51 55 45 57C38 59 32 58 31 54C30 50 34 46 42 43C51 40 60 40 63 43H68V36Z" fill="#FFFFFF" />
    </svg>
  );
}

export function WebOfScienceLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill="#5E2590" />
      <path d="M30 30L42 70L50 44L58 70L70 30H60L53 54L46 30H30Z" fill="#FFFFFF" />
      <circle cx="76" cy="34" r="4" fill="#50E3C2" />
    </svg>
  );
}

export function CrossrefLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill="#37393A" />
      <circle cx="38" cy="50" r="14" fill="#FF5000" />
      <circle cx="62" cy="50" r="14" fill="#00A9E0" />
      <path d="M44 38C48 42 48 58 44 62C56 62 56 38 44 38Z" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}

export function ScimagoLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill="#0A2540" />
      <path d="M25 65L40 45L55 55L75 30" stroke="#00D4B2" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="75" cy="30" r="6" fill="#00D4B2" />
    </svg>
  );
}

export function DgrsdtLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill="#006633" />
      <path d="M50 20L75 35V65L50 80L25 65V35L50 20Z" fill="none" stroke="#FFFFFF" strokeWidth="5" />
      <circle cx="50" cy="50" r="12" fill="#D4AF37" />
    </svg>
  );
}

export function PubmedLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill="#205493" />
      <path d="M30 30H52C60 30 65 34 65 41C65 48 60 52 52 52H40V70H30V30ZM40 38V44H51C54 44 56 43 56 41C56 39 54 38 51 38H40Z" fill="#FFFFFF" />
      <path d="M68 50L75 70H66L62 58H68V50Z" fill="#00A6D6" />
    </svg>
  );
}

export function GoogleLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

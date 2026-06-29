import React from 'react';
import Link from 'next/link';

export default function WelcomeCard() {
  return (
    <div className="welcome-card">
      <h1>Welcome to EIS</h1>
      <Link href="/dashboard" passHref>
        <button>Login</button>
      </Link>
    </div>
  );
}

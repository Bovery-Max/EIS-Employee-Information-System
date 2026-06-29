import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          EIS
        </Link>
      </h1>
      <nav role="navigation">
        {/* Future navigation links can be added here */}
      </nav>
    </header>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafbd5' }}>
      {children}
    </div>
  );
}

import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div>
      <header className="container header">
        <h2>Hyundai CMMS</h2>
        <nav>
          <Link href="/" style={{ marginRight: 12 }}>Dashboard</Link>
          <Link href="/machines" style={{ marginRight: 12 }}>Machines</Link>
          <Link href="/components" style={{ marginRight: 12 }}>Components</Link>
          <Link href="/work-orders">Work Orders</Link>
        </nav>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}

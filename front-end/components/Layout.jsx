import Header from './Header';

/**
 * Layout — wraps public-facing pages with the shared Header.
 * Admin pages use their own sidebar layout so they don't include this.
 */
export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">{children}</main>
    </div>
  );
}

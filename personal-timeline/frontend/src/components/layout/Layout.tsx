import { ReactNode } from "react";
import Navigation from "./Navigation";
import "/src/index.css"; 

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app-layout">
      <Navigation />
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 Personal Timeline App. Built with React &amp; TypeScript.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

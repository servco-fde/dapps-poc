import { useState } from 'react';
import { createBrowserRouter, NavLink, Outlet, RouterProvider } from 'react-router';
import {
  Button,
  ResourceStatusIndicator,
  ResourceStatusProvider,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@databricks/appkit-ui/react';
import { DatabaseZap, Menu } from 'lucide-react';
import { MetricCatalogPage } from './pages/MetricCatalogPage';
import { ProposalBuilderPage } from './pages/ProposalBuilderPage';
import { ProposalDetailPage } from './pages/ProposalDetailPage';
import { ProposalListPage } from './pages/ProposalListPage';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`;

type NavLinkClassFn = (props: { isActive: boolean }) => string;

function NavLinks({
  className,
  linkClass,
  onClick,
}: {
  className?: string;
  linkClass: NavLinkClassFn;
  onClick?: () => void;
}) {
  return (
    <nav className={className} aria-label="Primary navigation">
      <NavLink to="/" end className={linkClass} onClick={onClick}>
        Metric catalog
      </NavLink>
      <NavLink to="/proposals" end className={linkClass} onClick={onClick}>
        Proposals
      </NavLink>
      <NavLink to="/proposals/new" className={linkClass} onClick={onClick}>
        New proposal
      </NavLink>
    </nav>
  );
}

function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-2">
          <DatabaseZap className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Metric View Collaboration Hub</h1>
        </div>
        <NavLinks className="hidden gap-1 md:flex" linkClass={navLinkClass} />
        <div className="ml-auto md:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation</span>
            </Button>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <NavLinks
                className="mt-6 flex flex-col gap-1"
                linkClass={mobileNavLinkClass}
                onClick={() => setMobileNavOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <MetricCatalogPage /> },
      { path: '/proposals', element: <ProposalListPage /> },
      { path: '/proposals/new', element: <ProposalBuilderPage /> },
      { path: '/proposals/:proposalId', element: <ProposalDetailPage /> },
    ],
  },
]);

export default function App() {
  return (
    <ResourceStatusProvider>
      <ResourceStatusIndicator />
      <RouterProvider router={router} />
    </ResourceStatusProvider>
  );
}

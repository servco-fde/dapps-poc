import { useState } from 'react';
import { createBrowserRouter, Link, Navigate, NavLink, Outlet, RouterProvider } from 'react-router';
import {
  Badge,
  Button,
  ResourceStatusIndicator,
  ResourceStatusProvider,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@databricks/appkit-ui/react';
import { DatabaseZap, Menu } from 'lucide-react';
import { DocumentationLayout } from './components/DocumentationLayout';
import { DOCUMENTATION_ROUTES } from './content/documentation';
import { AppGuidePage } from './pages/AppGuidePage';
import { FdeReferenceGuidePage } from './pages/FdeReferenceGuidePage';
import { MetricCatalogPage } from './pages/MetricCatalogPage';
import { ProposalBuilderPage } from './pages/ProposalBuilderPage';
import { ProposalDetailPage } from './pages/ProposalDetailPage';
import { ProposalListPage } from './pages/ProposalListPage';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `servco-nav-link ${isActive ? 'servco-nav-link-active' : ''}`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `servco-nav-link block ${isActive ? 'servco-nav-link-active' : ''}`;

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
      <NavLink to={DOCUMENTATION_ROUTES.root} className={linkClass} onClick={onClick}>
        Documentation
      </NavLink>
    </nav>
  );
}

function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-background">
      <header className="servco-app-header sticky top-0 z-20 flex min-w-0 items-center gap-4 border-b bg-white/95 px-4 pb-3 pt-4 backdrop-blur md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="servco-brand-icon shrink-0" aria-hidden="true">
            <DatabaseZap className="h-5 w-5" />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="servco-brand-label">Servco</div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="truncate text-lg font-bold text-foreground">Metric View Hub</h1>
              <Badge asChild variant="secondary" className="shrink-0">
                <Link to={DOCUMENTATION_ROUTES.fde}>Reference implementation</Link>
              </Badge>
            </div>
          </div>
        </div>
        <NavLinks className="hidden gap-1 lg:flex" linkClass={navLinkClass} />
        <div className="ml-auto lg:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation</span>
            </Button>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Metric View Hub</SheetTitle>
                <Badge asChild variant="secondary" className="w-fit">
                  <Link to={DOCUMENTATION_ROUTES.fde} onClick={() => setMobileNavOpen(false)}>
                    Reference implementation
                  </Link>
                </Badge>
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
      <main className="servco-main flex-1">
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
      {
        path: DOCUMENTATION_ROUTES.root,
        element: <DocumentationLayout />,
        children: [
          { index: true, element: <Navigate to={DOCUMENTATION_ROUTES.app} replace /> },
          { path: 'app', element: <AppGuidePage /> },
          { path: 'fde', element: <FdeReferenceGuidePage /> },
        ],
      },
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

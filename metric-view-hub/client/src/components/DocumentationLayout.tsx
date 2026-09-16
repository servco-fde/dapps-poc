import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@databricks/appkit-ui/react';
import { DOCUMENTATION_ROUTES } from '../content/documentation';

type GuideName = 'app' | 'fde';

export function DocumentationLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeGuide: GuideName = location.pathname.startsWith(DOCUMENTATION_ROUTES.fde) ? 'fde' : 'app';

  const changeGuide = (guide: string) => {
    void navigate(guide === 'fde' ? DOCUMENTATION_ROUTES.fde : DOCUMENTATION_ROUTES.app);
  };

  useEffect(() => {
    if (!location.hash) return;

    const targetId = decodeURIComponent(location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  return (
    <div className="servco-page mx-auto max-w-7xl space-y-6">
      <div>
        <div className="servco-eyebrow">Living documentation</div>
        <h2 className="servco-page-title">Documentation</h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Learn how to use Metric View Hub or inspect the Databricks reference architecture behind it.
        </p>
      </div>

      <Tabs value={activeGuide} onValueChange={changeGuide} className="min-w-0">
        <TabsList className="servco-tabs-list max-w-full overflow-x-auto" aria-label="Documentation guides">
          <TabsTrigger value="app">Metric View Hub Guide</TabsTrigger>
          <TabsTrigger value="fde">FDE Reference Guide</TabsTrigger>
        </TabsList>
        <TabsContent value={activeGuide} forceMount className="mt-6 min-w-0">
          <Outlet />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createApp, analytics, lakebase, server } from '@databricks/appkit';
import { setupProposalRoutes } from './routes/proposals/proposal-routes';

createApp({
  plugins: [analytics(), lakebase(), server()],
  async onPluginsReady(appkit) {
    await setupProposalRoutes(appkit);
  },
}).catch(console.error);

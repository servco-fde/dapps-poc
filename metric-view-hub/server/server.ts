import { createApp, analytics, lakebase, server } from '@databricks/appkit';
import { setupProposalRoutes } from './routes/proposals/proposal-routes';
import { setupMicrosoftProfileRoutes } from './routes/microsoft/profile-routes';

createApp({
  plugins: [analytics(), lakebase(), server()],
  async onPluginsReady(appkit) {
    await setupProposalRoutes(appkit);
    setupMicrosoftProfileRoutes(appkit);
  },
}).catch(console.error);

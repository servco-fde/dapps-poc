# Architecture

- React with Material UI on the front end
- Node.js on the back end
- PostgreSQL in Lakebase for the app's own data
- Unity Catalog read-only for company data
- Prisma for the database layer unless you see a reason against it
- sign-on from the Databricks platform with Entra ID
- No other UI library, no local login, no hard-coded credentials

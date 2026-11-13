# Refugee Camp Resource Distribution Frontend

React 19 dashboard for the Refugee Camp Resource Distribution API. The interface uses Tailwind CSS, Lucide icons, responsive role-aware navigation, and authenticated API requests.

## Run locally

Copy `.env.example` to `.env` when the backend is not using the default URL:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Then run:

```powershell
npm install
npm run dev
```

The default Vite address is `http://localhost:5173`. The backend must permit this origin through its `CORS_ORIGIN` setting.

## Verification

```powershell
npm run lint
npm run build
```

Authentication tokens are stored in browser local storage and attached as Bearer tokens. A rejected or expired token automatically returns the user to the sign-in screen.

# WatchTower Project Roadmap & Improvements

## Hygiene & Refactoring (Completed ✅)
- Removed hardcoded ports (`3000`, `8081`) and replaced with `process.env.PORT` and `process.env.HUB_PORT` in `server.js` and `index.js`.
- Replaced hardcoded Solana Devnet URLs (`https://api.devnet.solana.com`) with `process.env.RPC_URL` and `process.env.FALLBACK_RPC_URL` to prevent rate-limiting in production and allow the use of private RPC nodes (QuickNode/Alchemy).
- Cleaned up local testing default configurations to seamlessly support production `.env` variables.
- Kept `validator-cli` default config at `ws://localhost:8081` for local setup, but it correctly defers to `process.env.HUB_SERVER` for production releases.

---

## Future Features to Add 🚀

### 1. Solana Mainnet Transition
- **Dynamic Cluster Switching:** Add a toggle in the UI and `.env` configs to dynamically switch the backend `Connection` and UI explorer links from `?cluster=devnet` to `mainnet-beta`.
- **Custom SPL Utility Token:** Move away from paying out native SOL (Lamports) which constantly drains the admin wallet. Create an SPL Utility Token (e.g., `$WTCH`) to manage reward economics sustainably.

### 2. Scalability & Performance Fixes (Critical for Production)
- **Redis Caching for Analytics:** Currently, the `/website-details/:id` endpoint iterates over every single `WebsiteTick` to calculate uptime and latency graphs. As data grows, this will cause heavy database lag. Implementing Redis to cache the aggregated stats is highly recommended.
- **Database Archival Strategy:** Since we are taking **hourly snapshots** and permanently logging them on the blockchain, you can safely delete raw `WebsiteTick` data older than 7-14 days to save massive MongoDB storage costs.

### 3. Advanced Validator Network Mechanics
- **Validator Staking (dPoS):** Require validators to stake $WTCH tokens via a Solana Smart Contract to be admitted to the network. This mathematically prevents "Sybil Attacks" where someone spins up 1,000 fake validators to farm rewards.
- **Auto-Updater for CLI:** Implement an auto-update script for `validator-cli` so node operators always run the latest version without manual npm pulls.

### 4. Enhanced Notary Authority
- **Decentralized Notary Cluster:** Currently, there is a single Notary (`localhost:8082`). Expand this to require a multi-sig or quorum from 3 separate Notary servers geographically distributed to eliminate the single point of truth.
- **Content Defacement Checking:** Beyond simple HTTP Status/Latency checks, allow users to specify an expected keyword. Validators must verify that the keyword exists in the HTML, protecting against site defacement hacks.

### 5. UI/UX Refinements
- **Real-Time Websocket Dashboard:** Connect the React frontend directly to the WebSocket hub. This would allow the dashboard charts and the "Recent Events" feed to update *live* in front of the user's eyes without needing to refresh the page.
- **Custom Alerting Cooldowns:** Allow users to set custom rules for email notifications (e.g., "Only email me if the site is down for 5 consecutive minutes" instead of immediately on the first failure).

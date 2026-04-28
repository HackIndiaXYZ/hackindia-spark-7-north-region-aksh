# 🌐 dPIN Website Monitoring System 

A **decentralized website monitoring system** leveraging **dPIN (Decentralized Public Infrastructure Network)** to ensure **trustless uptime verification, real-time alerts, and transparency** without relying on centralized authorities.  

> With dPIN, experience a truly decentralized, transparent, and reliable website monitoring system.

## 🔥 Key Features  
🔹 **No Single Point of Failure** – Distributed monitoring across independent validators.  

🔹 **Trustless Transparency** – Website owners can prove uptime without a central entity.  

🔹 **Crypto Incentives** – Validators earn rewards for monitoring and reporting website health.  

🔹 **Decentralized Monitoring** – Multiple nodes check website status instead of a single company.  

🔹 **Real-Time Alerts** – Instant notifications for downtime or performance issues.

🔹 **Emergency Mobile Buzzer** – High-priority mobile sirens via Pushover that bypass silent mode for critical downtime.

🔹 **Security & Privacy** – No third-party access to website data.  

---

## 🛑 Problem Statement  
Traditional website monitoring systems are **centralized, opaque, and vulnerable** to **downtime, censorship, and manipulation**. They rely on single providers, limiting transparency and control.  

---

## ✅ Solution  

Our **dPIN-based monitoring system** decentralizes website uptime tracking by leveraging independent validators across a global network. Unlike traditional systems, which rely on a single authority, our solution ensures **real-time, trustless, and tamper-proof monitoring** without any central points of failure. Website owners can **prove uptime transparently**, while users receive **instant alerts** for downtime or performance issues. Validators are incentivized with **crypto rewards**, fostering a **self-sustaining, censorship-resistant** ecosystem that enhances reliability, security, and trust in website monitoring.

✨ **Website owners** can verify uptime transparently.  

⚡ **Users** receive **instant alerts** for downtime or performance issues.  

💰 **Validators** are rewarded with **crypto incentives**, fostering a **self-sustaining, censorship-resistant** monitoring ecosystem.  

---

## 🛠️ Tech Stack  
🛡️ **Blockchain** – Solana 

🌍 **dPIN (Decentralized Public Infrastructure Network)** – Distributed monitoring  

🔗 **Database** – MongoDB   

🖥️ **Frontend** – React.js, Radix UI, Tailwind CSS, ShadCN  

📡 **Backend** – Node.js, Express.js

🔒 **Authentication** – Clerk

⚙️ **Validator CLI** – Commander.js, Chalk

---

## ⚙️ Installation & Setup  
```bash

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your specific configuration

# 1. Run the Main Backend
node index.js

# 2. Run the Hub (WebSocket) Server (Required for Validators)
cd hub
node server.js

# 3. Run the Notary Service (Required for Attestations)
cd ../notary
node server.js

# 4. Install & Run the Frontend
cd ../../frontend
npm install
cp .env.example .env
npm run dev
```

## 🔑 Getting API Keys

Before you can run the application, you'll need to obtain several API keys and credentials:

### 1. JWT Secret
- This is used for authentication in the backend
- Generate a secure random string:
  ```bash
  openssl rand -base64 32
  ```
  Or simply create a strong password-like string

### 2. Solana Wallet Keys (Admin)
- Generate a Solana keypair for the admin account:
  ```bash
  # Install Solana CLI tools if you haven't already
  solana-keygen new
  ```
  - The output will show your public key and save your private key
  - Use these values for `ADMIN_PUBLIC_KEY` and `ADMIN_PRIVATE_KEY`

### 3. Solana RPC URL
- Sign up for a free account at [Alchemy](https://www.alchemy.com/)
- Create a new Solana app (can use Devnet for testing)
- Copy the HTTP URL from your dashboard
- Format: `https://solana-devnet.g.alchemy.com/v2/YOUR_API_KEY`

### 4. Clerk Authentication
- Create an account at [Clerk](https://clerk.dev/)
- Set up a new application
- From your Clerk dashboard:
  - Get your `CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
  - Get your `CLERK_SECRET_KEY` (starts with `sk_test_`)
  - Use the publishable key for both backend and frontend

### 5. Email Service (Nodemailer)
- If using Gmail:
  1. Go to your Google Account → Security
  2. Enable 2-Step Verification if not already enabled
  3. Go to App passwords
  4. Create a new app password
  5. Use this password for `PASS_NODEMAILER`

### 6. Pushover (Optional for Mobile Buzzer)
- Create an account at [Pushover](https://pushover.net/)
- Create a new "Application/API Token" to get your `PUSHOVER_APP_TOKEN`
- Users provide their own `User Key` in the dashboard settings to link their phones.

After obtaining all keys, add them to your `.env` files in both backend and frontend directories.

## 🧠 Project Structure
```
dPIN/
├── backend/               # Express.js API & WebSocket server
│   ├── blockchain/        # Solana blockchain interaction modules
│   ├── db/                # Database connection configuration
│   ├── hub/               # WebSocket server for real-time consensus
│   ├── model/             # MongoDB schemas
│   ├── notary/            # Blockchain notary and payout logic
│   ├── utils/             # Helper functions
│   └── index.js           # Main Express server file
├── frontend/              # React.js application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Library configurations
│       ├── pages/         # Application views/pages
│       ├── utils/         # Helper utilities
│       └── App.jsx        # Main application component
├── linux-cli/             # Headless validator CLI tool for Linux servers
│   ├── bin/               # Executable entry point
│   ├── config/            # Configuration management
│   ├── src/               # Core execution logic
│   └── utils/             # CLI utilities
├── validator-cli/         # Node.js CLI tool for validators
│   ├── bin/               # Executable entry point
│   ├── config/            # Configuration files
│   ├── src/               # Source code
│   └── utils/             # CLI utilities
├── tests/                 # Testing suites and scripts
│   ├── meshnet-simulator.js   # Simulates multiple validators
│   ├── forceHourlySnapshot.js # Tests blockchain snapshots
│   └── forceReputationSync.js # Tests reputation syncing
└── blockchain/            # Smart contracts and anchor programs
    └── programs/          # Solana programs (Smart Contracts)
```

---

## 🚀 Running a Validator node

To contribute to the network and earn SOL rewards, you can run a validator node:

### Node.js CLI (Interactive)
```bash
cd validator-cli
npm install
node src/cli.js
```

### Headless Linux CLI (Service-ready)
```bash
cd linux-cli
npm install
./run.sh
```

---

## 🧪 Testing & Simulation

You can simulate a large network of validators and website downtime without physical hardware:

### MeshNet Simulator
This script spawns 10+ virtual validators across different global locations to test consensus and the dashboard map.
```bash
cd tests
npm install
node meshnet-simulator.js
```

### Blockchain Sync
Test the Solana ledger recording and reputation syncing:
```bash
node tests/forceHourlySnapshot.js
node tests/forceReputationSync.js
```

---

## ℹ️ Additional Information  

🔹 **Wallet Public Key** – Needed for withdrawal of earned rewards. 

🔹 **Key Generation** – Automatically generates a pair of **public & private keys** for enhanced security.  

🔹 **Decentralized Transactions** – Ensures secure and anonymous payment processing.  

---

## ❓ Troubleshooting  
If you face any issues, try these steps:  

⚠️ **Issue:** App not starting  
🔹 **Solution:** Ensure **Node.js** and **npm** are installed, and run `npm install` before starting the application.  

⚠️ **Issue:** Wallet not connecting  
🔹 **Solution:** Make sure **Phantom/Solflare** or any compatible Solana wallet is installed and connected to the correct network.  

⚠️ **Issue:** No real-time alerts  
🔹 **Solution:** Check if notifications are **enabled** in browser settings.  

⚠️ **Issue:** Transaction failures  
🔹 **Solution:** Ensure your wallet has **sufficient SOL** for transactions.  

⚠️ **Issue:** Authentication problems  
🔹 **Solution:** Verify your Clerk API keys are correctly configured in your environment variables.

---

## 📝 API Endpoints

### User Endpoints
- `POST /user` - Create a new user
- `PUT /user/pushover` - Update user's Pushover API key for mobile "Buzzer" alerts
- `GET /dashboard-details` - Get user dashboard information (websites and stats)

### Website Monitoring Endpoints
- `POST /website` - Register a new website for monitoring
- `GET /website-details/:id` - Get detailed metrics, status, and logs for a website
- `DELETE /website/:id` - Remove a website from monitoring
- `PUT /website-track/:id` - Enable/disable monitoring for a website
- `GET /website/:id/validators` - Get all validators currently tracking a specific website

### Validator Endpoints
- `POST /validator` - Register a new validator node
- `POST /validator-signin` - Authenticate as a validator
- `GET /validator-detail` - Get validator activity, blockchain logs, and rewards
- `POST /getPayout` - Request a payout of earned SOL to validator wallet
- `POST /website-tick` - Submit a validation report for a website (internal)

### Notary Service Endpoints
- `POST /notarize` - Independently check a URL and return a signed cryptographic attestation
- `POST /verify` - Verify an attestation signature
- `GET /health` - Service health check and public key retrieval

---

## 🙌 Team Members
- **Aryan Kumar Singh**
- **Krishan Goyal**
- **Sejal Jaswal**
- **Harsh Thakur**

---

## 🤝 Contributing  
We welcome contributions! Follow these steps:  

1️⃣ **Fork** the repo  

2️⃣ **Create** a new branch: `git checkout -b feature-branch`  

3️⃣ **Commit** your changes: `git commit -m "Added new feature"`  

4️⃣ **Push** to the branch: `git push origin feature-branch`  

5️⃣ **Submit** a **Pull Request (PR)**  

💡 **Tip:** Always write **clear commit messages** and follow **best coding practices** before submitting a PR!  

---

## 📜 If you found this useful, don't forget to ⭐ star this repo!

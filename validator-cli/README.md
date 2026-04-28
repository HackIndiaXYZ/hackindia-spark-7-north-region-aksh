# 🛡️ WatchTower Validator CLI

Welcome to the **WatchTower Validator CLI**! This is the official command-line interface for running a decentralized monitoring node on the WatchTower dPIN network.

By running this CLI, you join a global network of independent nodes that monitor website uptimes. In exchange for providing your network bandwidth and cryptographic proofs, you earn **Solana (SOL)** rewards.

## 📦 Installation

To install the CLI globally on your machine, run:

```bash
npm install -g @aksh/validator-cli
```

*(Note: If you are running from source, use `npm install` and run `node bin/index.js` instead).*

## 🚀 Getting Started

### 1. Register a Node
Before you can start monitoring, you must register your node with the WatchTower Hub.

```bash
validator-cli register
```
You will be prompted for:
*   Your Name & Email
*   A secure password
*   Your **Solana Public Key** (where your rewards will be sent)
*   The Hub WebSocket URL

### 2. Start the Validator
Once registered, a cryptographic keypair is saved locally. You can start monitoring immediately:

```bash
validator-cli start
```
The node will connect to the Hub, receive monitoring assignments, and automatically submit cryptographic attestations. Keep this process running 24/7 to maximize your rewards!

### 3. Check Your Rewards
To view your pending Solana payouts:

```bash
validator-cli rewards
```

## 🛠️ Additional Commands

*   `validator-cli info` - View your node's connection status, ID, and public key.
*   `validator-cli ping <url>` - Manually test the latency to a specific website.
*   `validator-cli debug-ping <url>` - Perform a deep latency analysis (DNS + Network Ping).
*   `validator-cli generate-keys` - Manually generate a new cryptographic keypair.

## 🔒 Security
Your private keys are generated locally and **never** transmitted to the WatchTower servers. All uptime reports are signed locally on your machine using your private key to ensure non-repudiation.

## 📄 License
This project is licensed under the MIT License.

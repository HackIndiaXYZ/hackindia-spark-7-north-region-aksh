import mongoose from 'mongoose';
import WebSocket from 'ws';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/techexpo";
const HUB_URL = "ws://127.0.0.1:8081";
const NUM_VALIDATORS = 15;

const REGIONS = [
    "Delhi, India",
    "London, UK",
    "New York, USA",
    "Tokyo, Japan",
    "Singapore, SG",
    "Sydney, Australia",
    "Berlin, Germany",
    "Paris, France"
];

// Re-defining schema to avoid complex path imports
const validatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    publicKey: { type: String, required: true },
    location: { type: String, required: true },
    ip: { type: String, required: true },
    pendingPayouts: { type: Number, default: 0 },
    payoutPublicKey: { type: String, required: true },
    password: { type: String, required: true },
    trustScore: { type: Number, default: 50 },
    totalChecks: { type: Number, default: 0 },
    successfulVerifications: { type: Number, default: 0 },
    isAdmitted: { type: Boolean, default: false },
    trialStartedAt: { type: Date, default: Date.now }
});

const Validator = mongoose.model('Validator', validatorSchema);

function signMessage(message, secretKey) {
    const messageBytes = naclUtil.decodeUTF8(message);
    const signature = nacl.sign.detached(messageBytes, secretKey);
    return JSON.stringify(Array.from(signature));
}

async function createMockValidator(index, region) {
    const keypair = nacl.sign.keyPair();
    const publicKeyBase64 = naclUtil.encodeBase64(keypair.publicKey);
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const email = `meshnet_${index}_${Date.now()}@example.com`;
    
    // Every 3rd node is a High-Trust, Admitted validator
    const isHighTrust = index % 3 === 0;
    
    const validator = new Validator({
        name: `MeshNet Node ${index}`,
        email,
        publicKey: publicKeyBase64,
        location: region,
        ip: `192.168.100.${index}`,
        payoutPublicKey: "mock_solana_address",
        password: hashedPassword,
        isAdmitted: isHighTrust, 
        trustScore: isHighTrust ? 85 : 50 
    });
    
    await validator.save();
    console.log(`[DB] Created validator ${index} in ${region} (High Trust/Admitted: ${isHighTrust})`);
    
    return {
        validatorDb: validator,
        keypair,
        region
    };
}

function connectNode(nodeInfo) {
    let ws;
    let reconnectTimeout = 2000; // Start with 2 seconds

    function connect() {
        ws = new WebSocket(HUB_URL);
        
        ws.on('open', () => {
            console.log(`[NODE] ${nodeInfo.validatorDb.name} connected to Hub.`);
            reconnectTimeout = 2000; // Reset timeout on successful connection
            
            const callbackId = randomUUID();
            const publicKeyBase64 = naclUtil.encodeBase64(nodeInfo.keypair.publicKey);
            const signedMessage = signMessage(`Signed message for ${callbackId}, ${publicKeyBase64}`, nodeInfo.keypair.secretKey);
            
            ws.send(JSON.stringify({
                type: "signup",
                data: {
                    callbackId,
                    ip: nodeInfo.validatorDb.ip,
                    publicKey: publicKeyBase64,
                    signedMessage,
                    location: nodeInfo.region
                }
            }));
        });
        
        ws.on('message', (message) => {
            const data = JSON.parse(message.toString());
            
            if (data.type === 'signup') {
                console.log(`[NODE] Node ${nodeInfo.validatorDb.name} registered on Hub.`);
            } else if (data.type === 'validate') {
                const { url, callbackId } = data.data;
                // Simulate 85% Good, 15% Bad for realism
                let status = Math.random() > 0.15 ? "Good" : "Bad";
                console.log(`[NODE] ${nodeInfo.validatorDb.name} (${nodeInfo.region}) checking ${url} -> ${status}`);

                const signature = signMessage(`Replying to ${callbackId}`, nodeInfo.keypair.secretKey);
                const latency = Math.floor(Math.random() * 150) + 50;
                
                // Send back the report
                ws.send(JSON.stringify({
                    type: 'validate',
                    data: {
                        callbackId,
                        status,
                        latency,
                        validatorId: nodeInfo.validatorDb._id.toString(),
                        signedMessage: signature,
                        location: nodeInfo.region
                    }
                }));
            }
        });
        
        ws.on('close', () => {
            console.log(`[NODE] ${nodeInfo.validatorDb.name} disconnected. Retrying in ${reconnectTimeout/1000}s...`);
            setTimeout(connect, reconnectTimeout);
            // Exponential backoff up to 30 seconds
            reconnectTimeout = Math.min(reconnectTimeout * 1.5, 30000);
        });
        
        ws.on('error', (err) => {
            // Error event usually triggers close, so we just log it here
            console.log(`[NODE] ${nodeInfo.validatorDb.name} connection error. Hub might be down.`);
        });
    }

    connect();
}

async function main() {
    console.log("Starting WatchTower MeshNet Simulator...");
    
    await mongoose.connect(MONGO_URI);
    console.log("Connected to database.");
    
    const nodes = [];
    for (let i = 0; i < NUM_VALIDATORS; i++) {
        const nodeInfo = await createMockValidator(i, REGIONS[i % REGIONS.length]);
        nodes.push(nodeInfo);
    }
    
    console.log(`Spinning up ${NUM_VALIDATORS} concurrent WebSocket connections...`);
    for (const node of nodes) {
        connectNode(node);
    }
    
    console.log("MeshNet running! Press Ctrl+C to stop.");
}

main().catch(console.error);

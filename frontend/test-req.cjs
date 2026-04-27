const { Connection } = require("@solana/web3.js");

const connection = new Connection("https://api.devnet.solana.com");
const signature = "dQwiLaQYkYugermiVqAJwV72viNM9jCERj1Z8sD9hx7b5jRHWUdtR2YaEmJffQi537LmKr72vsX54Wpwc6QUroh";

connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 }).then(tx => {
  if (tx) {
    console.log("Transaction Details:");
    console.log("Status:", tx.meta.err ? "Failed" : "Success");
    const innerInstructions = tx.transaction.message.instructions;
    innerInstructions.forEach(instr => {
       if (instr.program === "system" && instr.parsed.type === "transfer") {
         console.log(`Amount: ${instr.parsed.info.lamports} lamports`);
         console.log(`From: ${instr.parsed.info.source}`);
         console.log(`To: ${instr.parsed.info.destination}`);
       }
    });
  } else {
    console.log("Transaction not found.");
  }
}).catch(err => {
  console.error("Error:", err);
});

# Validator CLI

A decentralized uptime validator CLI for monitoring website availability.

## Requirements

- Node.js 14 or higher
- npm 6 or higher
- Connection to a validator hub server

## Installation

Install globally with npm:

```bash
npm install -g validator-cli
```

Or for local development:

```bash
# Clone or download the repository
# Then navigate to the project directory
cd validator-cli

# Install dependencies
npm install

# Create a global symlink to use the CLI from anywhere
npm link
```

## Getting Started

Here's how to get up and running with the Validator CLI:

1. **Make sure you have completed the installation steps above**

2. **Register as a validator (CLI-only)**

   ```bash
   validator-cli register
   ```

3. **Start the validator client**
   ```bash
   validator-cli start
   ```

## Usage

### Getting Help

You can display help information using:

```bash
validator-cli -help
# or
validator-cli --help
```

### Available Commands

```bash
validator-cli [command] [options]
```

### Generate Validator Keys

```bash
validator-cli generate-keys
```

This will generate a keypair for your validator in `~/.watchtower-validator`.

### Start the Validator

```bash
validator-cli start /path/to/privateKey.txt
```

Start the validator using the default private key at `~/.watchtower-validator/privateKey.txt`.

### View Validator Info

```bash
validator-cli info
```

### View Rewards

```bash
validator-cli rewards
```

Check your accumulated rewards from validation work.

### Ping a URL

```bash
validator-cli ping https://example.com
```

Manually ping a URL to check its status and response time.

## Configuration

The validator uses a configuration file located at `~/.watchtower-validator/config.json`. Example:

```json
{
  "hubServer": "ws://localhost:8081"
}
```

## Troubleshooting

### WebSocket Connection Issues

If you encounter WebSocket connection errors, ensure that the hub server is running and accessible. Check the `hubServer` URL in your `~/.watchtower-validator/config.json` file and make sure it is correct.

## License

ISC

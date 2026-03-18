import { Command } from 'commander';
import { createClient, requireWalletClient, coinToAsset } from '../lib/client';
import { output } from '../lib/format';

export function leverageCommand(): Command {
  const cmd = new Command('leverage');
  cmd.description('Manage leverage settings');

  cmd
    .command('set')
    .description('Set cross leverage for a symbol')
    .requiredOption('--symbol <sym>', 'Symbol (e.g. BTC)')
    .requiredOption('--value <n>', 'Leverage value (e.g. 10)')
    .option('--testnet', 'Use testnet')
    .option('--pretty', 'Human-friendly output')
    .action(async (opts) => {
      try {
        const clients = createClient({ testnet: opts.testnet });
        const exchange = requireWalletClient(clients);
        const assetIdx = await coinToAsset(clients.info, opts.symbol);
        const result = await exchange.updateLeverage({
          asset: assetIdx,
          isCross: true,
          leverage: parseInt(opts.value),
        });
        output(result, opts.pretty);
      } catch (err: any) {
        console.error(JSON.stringify({ error: err.message }));
        process.exit(1);
      }
    });

  return cmd;
}

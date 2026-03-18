import { Command } from 'commander';
import { createClient } from '../lib/client';
import { output } from '../lib/format';

export function priceCommand(): Command {
  const cmd = new Command('price');
  cmd.description('Get current mid price for a symbol');
  cmd.argument('<symbol>', 'Symbol (e.g. BTC, ETH)');
  cmd.option('--testnet', 'Use testnet');
  cmd.option('--pretty', 'Human-friendly output');

  cmd.action(async (symbol: string, opts) => {
    try {
      const { info } = createClient({ testnet: opts.testnet });
      const sym = symbol.toUpperCase();
      const allMids = await info.allMids();
      const price = (allMids as Record<string, string>)[sym];
      if (price === undefined) {
        console.error(JSON.stringify({ error: `Symbol not found: ${sym}` }));
        process.exit(1);
      }
      output({ symbol: sym, price: parseFloat(price) }, opts.pretty);
    } catch (err: any) {
      console.error(JSON.stringify({ error: err.message }));
      process.exit(1);
    }
  });

  return cmd;
}

import { Command } from 'commander';
import { createClient } from '../lib/client';
import { output } from '../lib/format';

export function marketsCommand(): Command {
  const cmd = new Command('markets');
  cmd.description('List all available perpetual markets');
  cmd.option('--testnet', 'Use testnet');
  cmd.option('--pretty', 'Human-friendly output');

  cmd.action(async (opts) => {
    try {
      const { info } = createClient({ testnet: opts.testnet });
      const meta = await info.meta();
      const markets = meta.universe.map((m: any) => ({
        name: m.name,
        szDecimals: m.szDecimals,
        maxLeverage: m.maxLeverage,
      }));
      output(markets, opts.pretty);
    } catch (err: any) {
      console.error(JSON.stringify({ error: err.message }));
      process.exit(1);
    }
  });

  return cmd;
}

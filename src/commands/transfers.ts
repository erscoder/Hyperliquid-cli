import { Command } from 'commander';
import { createClient, requireWallet } from '../lib/client';
import { output } from '../lib/format';

export function transfersCommand(): Command {
  const cmd = new Command('transfers');
  cmd.description('Show deposit/withdrawal history');
  cmd.option('--limit <n>', 'Number of records to show', '20');
  cmd.option('--testnet', 'Use testnet');
  cmd.option('--pretty', 'Human-friendly output');

  cmd.action(async (opts) => {
    try {
      const clients = createClient({ testnet: opts.testnet });
      const address = requireWallet(clients.config);
      // startTime required — fetch last 90 days
      const startTime = Date.now() - 90 * 24 * 60 * 60 * 1000;
      const txs = await clients.info.userNonFundingLedgerUpdates({ user: address as `0x${string}`, startTime });
      const limit = parseInt(opts.limit);
      const result = (txs as any[]).slice(0, limit).map((tx: any) => ({
        type: tx.delta?.type,
        amount: tx.delta?.usdc,
        time: new Date(tx.time).toISOString(),
        hash: tx.hash,
      }));
      output(result, opts.pretty);
    } catch (err: any) {
      console.error(JSON.stringify({ error: err.message }));
      process.exit(1);
    }
  });

  return cmd;
}

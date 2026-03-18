import { Command } from 'commander';
import { createClient, requireWallet } from '../lib/client';
import { output } from '../lib/format';

export function historyCommand(): Command {
  const cmd = new Command('history');
  cmd.description('Show trade history');
  cmd.option('--limit <n>', 'Number of trades to show', '20');
  cmd.option('--testnet', 'Use testnet');
  cmd.option('--pretty', 'Human-friendly output');

  cmd.action(async (opts) => {
    try {
      const clients = createClient({ testnet: opts.testnet });
      const address = requireWallet(clients.config);
      const fills = await clients.info.userFills({ user: address as `0x${string}` });
      const limit = parseInt(opts.limit);
      const result = fills.slice(0, limit).map((f: any) => ({
        coin: f.coin,
        side: f.side,
        size: f.sz,
        price: f.px,
        fee: f.fee,
        time: new Date(f.time).toISOString(),
        closedPnl: f.closedPnl,
        tid: f.tid,
      }));
      output(result, opts.pretty);
    } catch (err: any) {
      console.error(JSON.stringify({ error: err.message }));
      process.exit(1);
    }
  });

  return cmd;
}

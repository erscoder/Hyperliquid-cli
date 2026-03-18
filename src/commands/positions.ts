import { Command } from 'commander';
import { createClient, requireWallet } from '../lib/client';
import { output } from '../lib/format';

export function positionsCommand(): Command {
  const cmd = new Command('positions');
  cmd.description('Show open perpetual positions');
  cmd.option('--testnet', 'Use testnet');
  cmd.option('--pretty', 'Human-friendly output');

  cmd.action(async (opts) => {
    try {
      const clients = createClient({ testnet: opts.testnet });
      const address = requireWallet(clients.config);
      const state = await clients.info.clearinghouseState({ user: address as `0x${string}` });
      const positions = state.assetPositions
        .filter((p: any) => parseFloat(p.position.szi) !== 0)
        .map((p: any) => ({
          coin: p.position.coin,
          size: p.position.szi,
          entryPrice: p.position.entryPx,
          unrealizedPnl: p.position.unrealizedPnl,
          leverage: p.position.leverage,
          liquidationPrice: p.position.liquidationPx,
          marginUsed: p.position.marginUsed,
        }));
      output(positions, opts.pretty);
    } catch (err: any) {
      console.error(JSON.stringify({ error: err.message }));
      process.exit(1);
    }
  });

  return cmd;
}

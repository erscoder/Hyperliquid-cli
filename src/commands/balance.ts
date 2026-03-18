import { Command } from 'commander';
import { createClient, requireWallet } from '../lib/client';
import { output } from '../lib/format';

export function balanceCommand(): Command {
  const cmd = new Command('balance');
  cmd.description('Show wallet balances (account value, margin, withdrawable USDC)');
  cmd.option('--testnet', 'Use testnet');
  cmd.option('--pretty', 'Human-friendly output');

  cmd.action(async (opts) => {
    try {
      const clients = createClient({ testnet: opts.testnet });
      const address = requireWallet(clients.config);
      const state = await clients.info.clearinghouseState({ user: address as `0x${string}` });
      const result = {
        accountValue: state.marginSummary.accountValue,
        totalMarginUsed: state.marginSummary.totalMarginUsed,
        totalRawUsd: state.marginSummary.totalRawUsd,
        withdrawable: state.withdrawable,
      };
      output(result, opts.pretty);
    } catch (err: any) {
      console.error(JSON.stringify({ error: err.message }));
      process.exit(1);
    }
  });

  return cmd;
}

import { Command } from 'commander';
import { loadFileConfig, saveConfig, Config } from '../lib/client';
import { output } from '../lib/format';

export function configCommand(): Command {
  const cmd = new Command('config');
  cmd.description('Manage hl configuration (~/.hl/config.json)');

  cmd
    .command('get')
    .description('Show current config (private key is masked)')
    .option('--pretty', 'Human-friendly output')
    .action((opts) => {
      const cfg = loadFileConfig();
      const safe = {
        walletAddress: cfg.walletAddress || '(not set)',
        privateKey: cfg.privateKey ? cfg.privateKey.slice(0, 6) + '...' : '(not set)',
        testnet: cfg.testnet ?? false,
      };
      output(safe, opts.pretty);
    });

  cmd
    .command('set <key> <value>')
    .description('Set a config value. Keys: walletAddress, privateKey, testnet')
    .action((key: string, value: string) => {
      const allowed: (keyof Config)[] = ['walletAddress', 'privateKey', 'testnet'];
      if (!allowed.includes(key as keyof Config)) {
        console.error(JSON.stringify({ error: `Unknown key: ${key}. Allowed: ${allowed.join(', ')}` }));
        process.exit(1);
      }
      const parsed: any = key === 'testnet' ? value === 'true' : value;
      saveConfig({ [key]: parsed });
      console.log(JSON.stringify({ ok: true, key, set: key === 'privateKey' ? '***' : value }));
    });

  return cmd;
}

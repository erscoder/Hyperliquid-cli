#!/usr/bin/env node
import { Command } from 'commander';
import { balanceCommand } from './commands/balance';
import { positionsCommand } from './commands/positions';
import { ordersCommand } from './commands/orders';
import { marketsCommand } from './commands/markets';
import { priceCommand } from './commands/price';
import { historyCommand } from './commands/history';
import { transfersCommand } from './commands/transfers';
import { leverageCommand } from './commands/leverage';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('hl')
  .version('1.0.0')
  .description('Hyperliquid CLI — agent-friendly interface for the Hyperliquid DEX')
  .option('--testnet', 'Use testnet globally');

program.addCommand(balanceCommand());
program.addCommand(positionsCommand());
program.addCommand(ordersCommand());
program.addCommand(marketsCommand());
program.addCommand(priceCommand());
program.addCommand(historyCommand());
program.addCommand(transfersCommand());
program.addCommand(leverageCommand());
program.addCommand(configCommand());

program.parseAsync(process.argv).catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});

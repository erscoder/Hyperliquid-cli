import { Command } from 'commander';
import { createClient, requireWallet, requireWalletClient, coinToAsset } from '../lib/client';
import { output } from '../lib/format';

export function ordersCommand(): Command {
  const cmd = new Command('orders');
  cmd.description('Manage open orders');

  // hl orders list
  cmd
    .command('list')
    .alias('ls')
    .description('List open orders')
    .option('--testnet', 'Use testnet')
    .option('--pretty', 'Human-friendly output')
    .action(async (opts) => {
      try {
        const clients = createClient({ testnet: opts.testnet });
        const address = requireWallet(clients.config);
        const orders = await clients.info.openOrders({ user: address as `0x${string}` });
        const result = (orders as any[]).map((o: any) => ({
          oid: o.oid,
          coin: o.coin,
          side: o.side,
          size: o.sz,
          price: o.limitPx,
          timestamp: new Date(o.timestamp).toISOString(),
        }));
        output(result, opts.pretty);
      } catch (err: any) {
        console.error(JSON.stringify({ error: err.message }));
        process.exit(1);
      }
    });

  // hl orders place
  cmd
    .command('place')
    .description('Place a limit or market order')
    .requiredOption('--symbol <sym>', 'Symbol (e.g. BTC)')
    .requiredOption('--side <side>', 'buy or sell')
    .requiredOption('--size <n>', 'Order size')
    .option('--price <p>', 'Limit price (omit for market order)')
    .option('--testnet', 'Use testnet')
    .option('--pretty', 'Human-friendly output')
    .action(async (opts) => {
      try {
        const clients = createClient({ testnet: opts.testnet });
        const exchange = requireWalletClient(clients);
        const isBuy = opts.side.toLowerCase() === 'buy';
        const isMarket = !opts.price;
        const assetIdx = await coinToAsset(clients.info, opts.symbol);
        const limitPx = isMarket ? (isBuy ? '999999999' : '0.000001') : String(parseFloat(opts.price));
        const result = await exchange.order({
          orders: [{
            a: assetIdx,
            b: isBuy,
            p: limitPx,
            s: String(parseFloat(opts.size)),
            r: false,
            t: isMarket ? { limit: { tif: 'Ioc' } } : { limit: { tif: 'Gtc' } },
          }],
          grouping: 'na',
        });
        output(result, opts.pretty);
      } catch (err: any) {
        console.error(JSON.stringify({ error: err.message }));
        process.exit(1);
      }
    });

  // hl orders cancel
  cmd
    .command('cancel')
    .description('Cancel a specific order')
    .requiredOption('--symbol <sym>', 'Symbol (e.g. BTC)')
    .requiredOption('--id <oid>', 'Order ID')
    .option('--testnet', 'Use testnet')
    .option('--pretty', 'Human-friendly output')
    .action(async (opts) => {
      try {
        const clients = createClient({ testnet: opts.testnet });
        const exchange = requireWalletClient(clients);
        const assetIdx = await coinToAsset(clients.info, opts.symbol);
        const result = await exchange.cancel({
          cancels: [{ a: assetIdx, o: parseInt(opts.id) }],
        });
        output(result, opts.pretty);
      } catch (err: any) {
        console.error(JSON.stringify({ error: err.message }));
        process.exit(1);
      }
    });

  // hl orders cancel-all
  cmd
    .command('cancel-all')
    .description('Cancel all open orders (optionally filtered by symbol)')
    .option('--symbol <sym>', 'Only cancel orders for this symbol')
    .option('--testnet', 'Use testnet')
    .option('--pretty', 'Human-friendly output')
    .action(async (opts) => {
      try {
        const clients = createClient({ testnet: opts.testnet });
        const exchange = requireWalletClient(clients);
        const address = requireWallet(clients.config);
        const openOrders = await clients.info.openOrders({ user: address as `0x${string}` });
        const toCancel = opts.symbol
          ? (openOrders as any[]).filter((o: any) => o.coin === opts.symbol.toUpperCase())
          : (openOrders as any[]);
        if (toCancel.length === 0) {
          output({ cancelled: 0, message: 'No open orders found' }, opts.pretty);
          return;
        }
        // Need asset indices for each coin
        const cancels = await Promise.all(
          toCancel.map(async (o: any) => ({
            a: await coinToAsset(clients.info, o.coin),
            o: o.oid,
          }))
        );
        const result = await exchange.cancel({ cancels });
        output({ cancelled: toCancel.length, result }, opts.pretty);
      } catch (err: any) {
        console.error(JSON.stringify({ error: err.message }));
        process.exit(1);
      }
    });

  return cmd;
}

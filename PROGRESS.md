# PROGRESS.md
> Last updated: 2026-03-18 by Harvis

## Current Status
✅ v1.0.0 — CLI funcional, build limpio, QA verificado contra API real.

## What Was Done
- Estructura completa del proyecto (TypeScript, Commander, viem)
- `hl price <symbol>` — precio en tiempo real ✅ probado con BTC y ETH
- `hl markets` — lista todos los perps ✅ probado (170+ markets)
- `hl balance` — balance de cuenta (requiere wallet)
- `hl positions` — posiciones abiertas (requiere wallet)
- `hl orders list/place/cancel/cancel-all` — gestión de órdenes (requiere private key)
- `hl history [--limit N]` — historial de trades
- `hl transfers [--limit N]` — historial de depósitos/retiros
- `hl leverage set` — ajustar leverage (requiere private key)
- `hl config get/set` — gestión de config en ~/.hl/config.json
- Output JSON por defecto + --pretty para humanos
- README.md detallado en inglés
- Build: `npm run build` ✅ sin errores
- QA real: `hl price BTC` → `{"symbol":"BTC","price":73886.5}` ✅

## What's Next
- Publicar en npm: `npm publish`
- Crear repo en GitHub: `github.com/erscoder/hyperliquid-cli`
- Considerar añadir `hl watch <symbol>` para streaming de precios
- Tests unitarios (mocking HttpTransport)

## Key Files
- `src/lib/client.ts` — factory de PublicClient/WalletClient
- `src/commands/` — un archivo por comando
- `bin/hl` — entrypoint del binario
- `package.json` — `bin.hl`, `files: ["dist","bin"]`

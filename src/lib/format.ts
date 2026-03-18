export function output(data: unknown, pretty: boolean): void {
  if (pretty) {
    prettyPrint(data);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

function prettyPrint(data: unknown): void {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log('(none)');
      return;
    }
    data.forEach((item, i) => {
      console.log(`[${i + 1}]`);
      prettyObject(item as Record<string, unknown>);
      console.log('');
    });
  } else if (typeof data === 'object' && data !== null) {
    prettyObject(data as Record<string, unknown>);
  } else {
    console.log(data);
  }
}

function prettyObject(obj: Record<string, unknown>, indent = 0): void {
  const pad = '  '.repeat(indent);
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      console.log(`${pad}${k}:`);
      prettyObject(v as Record<string, unknown>, indent + 1);
    } else if (Array.isArray(v)) {
      console.log(`${pad}${k}: [${v.join(', ')}]`);
    } else {
      console.log(`${pad}${k}: ${v}`);
    }
  }
}

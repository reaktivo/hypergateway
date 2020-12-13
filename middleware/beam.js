import child_process from 'child_process';
import { rootHyperdriveKey } from '../config.js';

/**
 * 
 * @param {import('express').Request} req 
 */
function getUrl(req) {
  const [_, key, ...rest] = req.path.split('/');
  
  const parts = key.length === 64
    ? [key, ...rest]
    : [rootHyperdriveKey, key, ...rest]

  return 'hyper://' + parts.filter(Boolean).join('/');
}

function getTryUrls(url) {
  const suffixes = ['index.html']
  const urls = suffixes.map(suffix => {
    return [...url.split('/'), suffix].join('/');
  });

  return [url, ...urls];
}

/**
 * @param {import('express').Request} req
 * @param {import ('express').Response} res
 */
export default (req, res, next) => {
  const parts = req.path.split('/');
  console.log(parts);
  if (parts[1] !== 'beam') {
    next();
    return;
  }

  const code = parts[2];
  const subprocess = child_process.spawn(`./node_modules/.bin/hyp`, ['beam', code]);
  
  function onData(data) {
    console.log('--data', data);
    res.write(data);
  }

  function onEnd(data) {
    console.log('--end', data);
    res.end(data);
  }

  function onError(data) {
    console.log('--err', data.toString());
    const msg = data.toString();

    if (msg.includes('Debugger attached')) return;
    if (msg.includes('Accessing network')) return;
    if (msg.includes('Waiting for the debugger')) return;
    if(msg.includes('Joined the DHT')) return;
    if(msg.includes('Network is holepunchable')) return;
    if(msg.includes('Encrypted tunnel established to remote peer')) return;
    if (msg.includes('0K')) return;

    subprocess.stdout.off('data', onData);
    subprocess.stdout.off('end', onEnd);
    subprocess.stderr.off('data', onError);
    
    res.sendStatus(404);
  }

  subprocess.stdout.on('data', onData);
  subprocess.stdout.on('end', onEnd);
  subprocess.stderr.on('data', onError);
}
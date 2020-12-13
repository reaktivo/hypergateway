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
export default (req, res) => {
  const urls = getTryUrls(getUrl(req));

  function next(url) {
    console.log(url);
    const subprocess = child_process.spawn(`hyp`, [`cat`, url]);
    
    function onData(data) {
      res.write(data);
    }

    function onEnd(data) {
      res.end(data);
    }

    function onError(data) {
      const msg = data.toString();

      if (msg.includes('Debugger attached')) return;
      if (msg.includes('Accessing network')) return;
      if (msg.includes('Waiting for the debugger')) return;
      if (msg.includes('0K')) return;

      subprocess.stdout.off('data', onData);
      subprocess.stdout.off('end', onEnd);
      subprocess.stderr.off('data', onError);

      if (urls.length > 0) {
        next(urls.shift());
      } else {
        // TODO: Handle different error responses here
        // TODO: Attempt to load ${rootHyperdriveKey}/404.html instead
        console.log('url', url);
        res.sendStatus(404);
      }
    }

    subprocess.stdout.on('data', onData);
    subprocess.stdout.on('end', onEnd);
    subprocess.stderr.on('data', onError);
  }
  
  next(urls.shift());
}
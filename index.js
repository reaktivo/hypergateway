import { app } from './server.js';
import { port } from './config.js';

app.listen(port, 'localhost', (err) => {
  console.log(`Listening to port ${port}`);
})
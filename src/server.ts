import express from 'express';
import cors from 'cors';
import searchRoute from './api/searchRoute';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', searchRoute);

app.get('/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on :${port}`);
});

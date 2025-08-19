import { Router } from 'express';
import { searchStreamHandler } from '../controllers/searchController';

const router = Router();

router.post('/search', searchStreamHandler);
router.get('/search', searchStreamHandler);

export default router;

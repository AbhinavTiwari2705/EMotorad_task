import { Router } from 'express';
import { identifyContact } from '../controllers/identifyController.js';

const router = Router();

router.post('/', identifyContact);

export const identifyRouter = router;
import { Router } from 'express';
import { identifyContact } from '../controllers/identifyController.js';
import { validateIdentifyInput } from '../middleware/validation.js';

const router = Router();

router.post('/', validateIdentifyInput ,identifyContact);

export const identifyRouter = router;



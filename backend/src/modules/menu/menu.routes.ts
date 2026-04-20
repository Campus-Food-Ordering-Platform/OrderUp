import { Router } from 'express';
import {
    createMenuItem,
    getMenuItems,
    removeMenuItem,
    modifyMenuItem
} from './menu.controller';
import { requireAuth } from './../../common/middleware/requireAuth';

const router = Router();

router.get('/:vendorId', requireAuth, getMenuItems);
router.post('/', requireAuth, createMenuItem);
router.put('/:itemId', requireAuth, modifyMenuItem);
router.delete('/:itemId', requireAuth, removeMenuItem);

export default router;
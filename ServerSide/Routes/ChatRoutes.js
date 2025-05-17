const router = require('express').Router();
const { Protect } = require('../Middlewares/authMiddleware');
const { listMyChats, getOrCreateChat, sendMessage } = require('../Controllers/ChatController');

router.get('/', Protect , listMyChats);               
router.get('/:otherId', Protect , getOrCreateChat); 
router.post('/:chatId/message', Protect , sendMessage);

module.exports = router;

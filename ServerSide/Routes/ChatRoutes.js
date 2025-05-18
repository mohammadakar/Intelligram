const router = require('express').Router();
const { Protect } = require('../Middlewares/authMiddleware');
const { listMyChats, getOrCreateChat, sendMessage, deleteMessage, deleteChat, updateMessage } = require('../Controllers/ChatController');

router.get('/', Protect , listMyChats);               
router.get('/:otherId', Protect , getOrCreateChat); 
router.post('/:chatId/message', Protect , sendMessage);
router.put('/:chatId/messages/:messageId', Protect , updateMessage);
router.delete('/:chatId/messages/:messageId', Protect , deleteMessage);
router.delete('/:chatId', Protect , deleteChat);

module.exports = router;

const express = require('express');
const router = express.Router();

const { 
    addCard, 
    getCard, 
    removeCard, 
    updateCardQuantity, 
    clearCart, 
    getCartTotal, 
    moveToWishlist,
    getCartByProductId,
    filterByCategory,
    getByCategory
} = require('../auth-controller/card-controller');
const authUserMiddleware = require('../middleware/authUser-middleware');

// Basic cart operations
router.post('/addCard', authUserMiddleware, addCard);
router.get('/getCard', authUserMiddleware, getCard);
router.delete('/removeCard/:id', authUserMiddleware, removeCard);

// New routes
router.put('/updateQuantity/:id', authUserMiddleware, updateCardQuantity);
router.delete('/clearCart', authUserMiddleware, clearCart);
router.get('/cartTotal', authUserMiddleware, getCartTotal);
router.post('/moveToWishlist/:id', authUserMiddleware, moveToWishlist);
router.get('/product/:productId', authUserMiddleware, getCartByProductId);

router.get('/filterCat', filterByCategory);

// Get products by category
router.get('/category', getByCategory);

module.exports = router;
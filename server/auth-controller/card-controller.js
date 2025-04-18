const express = require('express');
const Card = require('../model/cardSchema');
const axios = require('axios');
require('../db/connection')


const addCard = async (req, res) => {
    try {
        // Check if product already exists in cart
        const existingItem = await Card.findOne({
            owner: req.user._id,
            product_id: req.body.product_id
        });

        if (existingItem) {
            // Update quantity if product already exists
            existingItem.quantity += Number(req.body.quantity) || 1;
            await existingItem.save();
            return res.status(200).json({ message: 'Product quantity updated in cart', cart: existingItem });
        }

        // Create new cart item
        const newCardItem = new Card({
            owner: req.user._id,
            ...req.body
        });

        await newCardItem.save();
        res.status(201).json({ message: 'Product added to cart successfully', cart: newCardItem });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
};

// Get all cart items for a user
const getCard = async (req, res) => {
    try {
        const cartItems = await Card.find({ owner: req.user._id });
        res.status(200).json({ cart: cartItems });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ message: 'Error fetching cart items', error: error.message });
    }
};

// Remove specific item from cart
const removeCard = async (req, res) => {
    try {
        const deletedItem = await Card.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!deletedItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Item removed from cart', deletedItem });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Error removing cart item', error: error.message });
    }
};

// Update cart item quantity
const updateCardQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        const updatedItem = await Card.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { quantity },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Quantity updated', updatedItem });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ message: 'Error updating quantity', error: error.message });
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const result = await Card.deleteMany({ owner: req.user._id });
        res.status(200).json({ message: 'Cart cleared', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
};

// Get cart total
const getCartTotal = async (req, res) => {
    try {
        const cartItems = await Card.find({ owner: req.user._id });
        
        const subtotal = cartItems.reduce((total, item) => {
            return total + (Number(item.final_price) * Number(item.quantity));
        }, 0);
        
        res.status(200).json({ subtotal });
    } catch (error) {
        console.error('Error calculating cart total:', error);
        res.status(500).json({ message: 'Error calculating cart total', error: error.message });
    }
};

// Move item from cart to wishlist
const moveToWishlist = async (req, res) => {
    try {
        // Find the cart item
        const cartItem = await Card.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        // Check if item already exists in wishlist
        const existingWishlistItem = await Wishlist.findOne({
            owner: req.user._id,
            product_id: cartItem.product_id
        });

        if (!existingWishlistItem) {
            // Create new wishlist item
            const wishlistItem = new Wishlist({
                owner: req.user._id,
                product_id: cartItem.product_id,
                title: cartItem.title,
                final_price: cartItem.final_price,
                initial_price: cartItem.initial_price,
                description: cartItem.description,
                image: cartItem.image,
                images: cartItem.images,
                brand: cartItem.brand,
                category: cartItem.category
            });

            await wishlistItem.save();
        }

        // Remove from cart
        await Card.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Item moved to wishlist' });
    } catch (error) {
        console.error('Error moving item to wishlist:', error);
        res.status(500).json({ message: 'Error moving item to wishlist', error: error.message });
    }
};

// Get cart item by product id
const getCartByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const cartItem = await Card.findOne({
            owner: req.user._id,
            product_id: productId
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        res.status(200).json({ cartItem });
    } catch (error) {
        console.error('Error fetching cart item by product ID:', error);
        res.status(500).json({ message: 'Error fetching cart item', error: error.message });
    }
};

const filterByCategory = async (req, res) => {
    try {
        const { nameType, nameCategory } = req.query;
        
        const products = await Card.find({
            'breadcrumbs.0.name': nameType,
            'breadcrumbs.1.name': nameCategory
        });

        res.status(200).json(products);
    } catch (error) {
        console.error('Error filtering products:', error);
        res.status(500).json({ 
            message: 'Error filtering products', 
            error: error.message 
        });
    }
};

const getByCategory = async (req, res) => {
    try {
        const { nameType, nameCategory } = req.query;
        
        const products = await Card.find({
            'breadcrumbs.0.name': nameType,
            'breadcrumbs.2.name': nameCategory
        });

        res.status(200).json(products);
    } catch (error) {
        console.error('Error getting category products:', error);
        res.status(500).json({ 
            message: 'Error getting category products', 
            error: error.message 
        });
    }
};

module.exports = {
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
};
const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');


const imageUploader = async (req, res) => {
    const { imageUrl } = req.body;

    try {
        const browser = await puppeteer.launch({
            headless : false
        });

        const page = await browser.newPage();
        await page.goto('https://ai-platform-virtual-try-on.hf.space/?__theme=light', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        const imagePath = path.resolve(__dirname, 'temp-image.jpg');

        const response = await axios({
            url: imageUrl,
            responseType: 'stream',
        });

        response.data.pipe(fs.createWriteStream(imagePath));
        await new Promise((resolve) => response.data.on('end', resolve));

        await page.waitForSelector('.upload-container.svelte-rrgd5g', { timeout: 60000 });
        const fileInput = await page.$('.upload-container.svelte-rrgd5g input[type="file"]');
        await fileInput.uploadFile(imagePath);

        await new Promise(resolve => setTimeout(resolve, 5000));

        fs.unlinkSync(imagePath);

        res.json({ success: true, message: 'Image uploaded successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {imageUploader}
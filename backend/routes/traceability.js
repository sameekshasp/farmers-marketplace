const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const pool = require('../config/database');

// Get traceability information by batch ID
router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const [traceability] = await pool.execute(
      'SELECT t.*, p.name as product_name, p.category, p.image_url, f.farm_name, f.location as farm_location, f.rating as farmer_rating, u.name as farmer_name, u.phone as farmer_phone FROM traceability t JOIN products p ON t.product_id = p.id JOIN farmers f ON t.farmer_id = f.id JOIN users u ON f.user_id = u.id WHERE t.batch_id = ?',
      [batchId]
    );

    if (traceability.length === 0) {
      return res.status(404).json({ message: 'Traceability information not found' });
    }

    const traceData = traceability[0];

    // Generate QR code URL
    const qrCodeUrl = `${req.protocol}://${req.get('host')}/api/trace/${batchId}`;
    
    // Generate QR code image
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

    res.json({
      ...traceData,
      qrCodeUrl,
      qrCodeDataUrl
    });
  } catch (error) {
    console.error('Get traceability error:', error);
    res.status(500).json({ message: 'Failed to get traceability information' });
  }
});

// Generate QR code for a product batch
router.post('/generate/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    // Check if batch exists
    const [traceability] = await pool.execute(
      'SELECT id FROM traceability WHERE batch_id = ?',
      [batchId]
    );

    if (traceability.length === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Generate QR code URL
    const qrCodeUrl = `${req.protocol}://${req.get('host')}/api/trace/${batchId}`;
    
    // Generate QR code image
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

    res.json({
      batchId,
      qrCodeUrl,
      qrCodeDataUrl
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

module.exports = router;

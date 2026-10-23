import express from 'express';
import { Wallet } from '../models/Wallet.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wallet - Get wallet balance and transaction ledger
router.get('/', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Active workspace required' });
    }

    let wallet = await Wallet.findOne({ workspaceId });
    if (!wallet) {
      wallet = await Wallet.create({
        workspaceId,
        balanceUSD: 50.0,
        transactions: [
          {
            type: 'BONUS',
            amountUSD: 50.0,
            description: 'Complimentary Starter Credit',
            referenceId: `START_${Date.now()}`,
          },
        ],
      });
    }

    // Sort transactions latest first
    const sortedTransactions = [...wallet.transactions].sort((a, b) => b.timestamp - a.timestamp);

    return res.json({
      success: true,
      wallet: {
        _id: wallet._id,
        workspaceId: wallet.workspaceId,
        balanceUSD: wallet.balanceUSD,
        autoRechargeEnabled: wallet.autoRechargeEnabled,
        rechargeThreshold: wallet.rechargeThreshold,
        rechargeAmount: wallet.rechargeAmount,
        transactions: sortedTransactions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/wallet/add-funds - Add funds / recharge wallet
router.post('/add-funds', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.workspaceId;
    const { amountUSD, paymentMethod = 'Credit Card' } = req.body;

    const parsedAmount = parseFloat(amountUSD);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required' });
    }

    let wallet = await Wallet.findOne({ workspaceId });
    if (!wallet) {
      wallet = new Wallet({ workspaceId, balanceUSD: 0, transactions: [] });
    }

    wallet.balanceUSD = +(wallet.balanceUSD + parsedAmount).toFixed(2);
    const newTx = {
      type: 'CREDIT',
      amountUSD: parsedAmount,
      description: `Wallet Recharge via ${paymentMethod}`,
      timestamp: new Date(),
      referenceId: `TX_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`,
    };
    wallet.transactions.push(newTx);

    await wallet.save();

    if (req.app.get('io')) {
      req.app.get('io').to(workspaceId.toString()).emit('walletUpdated', {
        balanceUSD: wallet.balanceUSD,
        transaction: newTx,
      });
    }

    return res.json({ success: true, wallet });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/wallet/settings - Update auto-recharge settings
router.post('/settings', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.workspaceId;
    const { autoRechargeEnabled, rechargeThreshold, rechargeAmount } = req.body;

    const wallet = await Wallet.findOne({ workspaceId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    if (autoRechargeEnabled !== undefined) wallet.autoRechargeEnabled = autoRechargeEnabled;
    if (rechargeThreshold !== undefined) wallet.rechargeThreshold = rechargeThreshold;
    if (rechargeAmount !== undefined) wallet.rechargeAmount = rechargeAmount;

    await wallet.save();
    return res.json({ success: true, wallet });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/wallet/deduct - Deduct usage (called by autonomous AI actions)
router.post('/deduct', authMiddleware, async (req, res) => {
  try {
    const workspaceId = req.workspaceId;
    const { amountUSD, description, service } = req.body;

    const parsedAmount = parseFloat(amountUSD);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required' });
    }

    const wallet = await Wallet.findOne({ workspaceId });
    if (!wallet || wallet.balanceUSD < parsedAmount) {
      return res.status(402).json({
        success: false,
        message: 'Insufficient wallet balance for this autonomous action. Please recharge.',
      });
    }

    wallet.balanceUSD = +(wallet.balanceUSD - parsedAmount).toFixed(2);
    const newTx = {
      type: 'DEBIT',
      amountUSD: parsedAmount,
      description: description || `GTM API Usage: ${service || 'Autonomous Agent'}`,
      timestamp: new Date(),
      referenceId: `USE_${Date.now()}`,
    };
    wallet.transactions.push(newTx);

    await wallet.save();

    if (req.app.get('io')) {
      req.app.get('io').to(workspaceId.toString()).emit('walletUpdated', {
        balanceUSD: wallet.balanceUSD,
        transaction: newTx,
      });
    }

    return res.json({ success: true, balanceUSD: wallet.balanceUSD, transaction: newTx });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

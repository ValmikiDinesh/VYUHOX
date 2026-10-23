import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT', 'BONUS', 'REFUND'],
    required: true,
  },
  amountUSD: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  referenceId: {
    type: String,
    default: '',
  },
});

const walletSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
      index: true,
    },
    balanceUSD: {
      type: Number,
      default: 50.0, // Initial promotional credit
      min: 0,
    },
    autoRechargeEnabled: {
      type: Boolean,
      default: false,
    },
    rechargeThreshold: {
      type: Number,
      default: 25.0,
    },
    rechargeAmount: {
      type: Number,
      default: 100.0,
    },
    stripeCustomerId: {
      type: String,
      default: '',
    },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

export const Wallet = mongoose.model('Wallet', walletSchema);

import mongoose from 'mongoose';

const domainWarmupSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    senderEmail: {
      type: String,
      trim: true,
      default: '',
    },
    provider: {
      type: String,
      enum: ['SMARTLEAD', 'INSTANTLY', 'INTERNAL'],
      default: 'SMARTLEAD',
    },
    status: {
      type: String,
      enum: ['WARMING', 'WARM', 'COLD', 'DANGER'],
      default: 'WARMING',
      index: true,
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 92,
    },
    spfRecord: {
      valid: { type: Boolean, default: true },
      record: { type: String, default: 'v=spf1 include:_spf.google.com ~all' },
      status: { type: String, default: 'VALID' },
    },
    dkimRecord: {
      valid: { type: Boolean, default: true },
      selector: { type: String, default: 'google' },
      record: { type: String, default: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...' },
      status: { type: String, default: 'VALID' },
    },
    dmarcRecord: {
      valid: { type: Boolean, default: true },
      record: { type: String, default: 'v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@domain.com' },
      policy: { type: String, default: 'quarantine' },
      status: { type: String, default: 'VALID' },
    },
    mxRecord: {
      valid: { type: Boolean, default: true },
      hosts: { type: [String], default: ['aspmx.l.google.com', 'alt1.aspmx.l.google.com'] },
      status: { type: String, default: 'VALID' },
    },
    dailySentCount: {
      type: Number,
      default: 24,
    },
    dailyTargetLimit: {
      type: Number,
      default: 50,
    },
    inboxPlacementRate: {
      type: Number,
      default: 98.2, // Percentage
    },
    spamRate: {
      type: Number,
      default: 0.4, // Percentage
    },
    daysInWarmup: {
      type: Number,
      default: 14,
    },
    lastDnsCheck: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const DomainWarmup = mongoose.model('DomainWarmup', domainWarmupSchema);

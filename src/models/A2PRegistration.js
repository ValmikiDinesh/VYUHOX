import mongoose from 'mongoose';

const a2pRegistrationSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
      index: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    legalBusinessName: {
      type: String,
      required: true,
      trim: true,
    },
    ein: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      enum: ['LLC', 'Corporation', 'Partnership', 'Sole_Proprietorship', 'Non_Profit'],
      default: 'Corporation',
    },
    industry: {
      type: String,
      default: 'Software / Technology',
    },
    website: {
      type: String,
      default: 'https://vyuhox.com',
    },
    contactEmail: {
      type: String,
      default: 'compliance@vyuhox.com',
    },
    contactPhone: {
      type: String,
      default: '+1 (555) 019-2831',
    },
    address: {
      street: { type: String, default: '100 Innovation Way, Suite 400' },
      city: { type: String, default: 'San Francisco' },
      state: { type: String, default: 'CA' },
      postalCode: { type: String, default: '94105' },
      country: { type: String, default: 'USA' },
    },
    campaignUseCase: {
      type: String,
      enum: ['MARKETING', 'CUSTOMER_CARE', 'ACCOUNT_NOTIFICATION', 'MIXED'],
      default: 'MARKETING',
    },
    campaignDescription: {
      type: String,
      default: 'Outbound sales follow-ups, appointment reminders, and demo meeting coordination for opted-in B2B prospects.',
    },
    sampleMessage1: {
      type: String,
      default: 'Hi [Name], this is Alex from HedgeX. Are you still open to reviewing our automated liquidity router demo tomorrow at 2 PM? Reply STOP to cancel.',
    },
    sampleMessage2: {
      type: String,
      default: 'Hi [Name], your HedgeX strategy walkthrough is confirmed for Thursday at 3 PM EST: https://meet.google.com/xyz-qwer-asd. Reply HELP for support or STOP to opt out.',
    },
    optInWorkflow: {
      type: String,
      default: 'Prospects opt-in via website demo request forms and verified two-way conversational outreach with explicit SMS consent.',
    },
    optInKeywords: {
      type: [String],
      default: ['START', 'YES', 'JOIN', 'SUBSCRIBE'],
    },
    optOutKeywords: {
      type: [String],
      default: ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'END'],
    },
    helpKeywords: {
      type: [String],
      default: ['HELP', 'INFO', 'SUPPORT'],
    },
    twilioTrustHubSid: {
      type: String,
      default: '',
    },
    brandRegistrationSid: {
      type: String,
      default: '',
    },
    campaignSid: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['UNREGISTERED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: {
      type: Date,
      default: Date.now,
    },
    throughputTPS: {
      type: Number,
      default: 15, // Messages per second
    },
  },
  { timestamps: true }
);

export const A2PRegistration = mongoose.model('A2PRegistration', a2pRegistrationSchema);

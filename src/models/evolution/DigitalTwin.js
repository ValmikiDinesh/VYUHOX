import mongoose from 'mongoose';

const digitalTwinSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EvolutionProject',
      required: true,
      index: true,
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    lastScannedAt: {
      type: Date,
      default: Date.now,
    },
    // 1. Current Website & Client Component Structure
    websiteStructure: {
      pages: [
        {
          route: String,
          name: String,
          componentPath: String,
          accessLevel: String, // 'public', 'client', 'superadmin'
          description: String,
          subComponents: [String],
          stateDependencies: [String],
        },
      ],
      navigationTree: mongoose.Schema.Types.Mixed,
    },
    // 2. Features and Modules Registry
    modules: [
      {
        moduleId: String,
        name: String,
        department: String,
        status: { type: String, enum: ['PRODUCTION', 'BETA', 'PLANNED', 'DEPRECATED'], default: 'PRODUCTION' },
        backendRoutes: [String],
        frontendPages: [String],
        databaseModels: [String],
        capabilities: [String],
        dependencies: [String],
      },
    ],
    // 3. System Architecture & AST Graph
    architecture: {
      frameworks: [String],
      layers: {
        presentation: String,
        apiGateway: String,
        businessLogic: String,
        persistence: String,
        realtime: String,
        aiAgents: String,
      },
      agentRegistry: [
        {
          agentId: String,
          role: String,
          department: String,
          primaryModel: String,
          status: String,
          allowedTools: [String],
        },
      ],
      stateFlowDescription: String,
    },
    // 4. Database Relationships
    databaseSchemaGraph: {
      totalCollections: Number,
      models: [
        {
          name: String,
          collectionName: String,
          filePath: String,
          fieldsCount: Number,
          relations: [{ field: String, refModel: String, relationType: String }],
          indexes: [String],
        },
      ],
    },
    // 5. APIs and Third-Party Integrations
    apisAndIntegrations: {
      routeGroups: [
        {
          prefix: String,
          file: String,
          endpointCount: Number,
          endpoints: [
            {
              method: String,
              path: String,
              handler: String,
              authRequired: Boolean,
              workspaceScoped: Boolean,
              description: String,
            },
          ],
        },
      ],
      externalProviders: [
        {
          provider: String,
          category: String, // 'AI', 'Voice', 'SMS', 'Email', 'Ads', 'Payments'
          status: String,
          fallbackConfigured: Boolean,
        },
      ],
    },
    // 6. Customer User Journeys
    customerJourneys: [
      {
        journeyId: String,
        title: String,
        targetPersona: String,
        steps: [
          {
            stepIndex: Number,
            action: String,
            screen: String,
            expectedOutcome: String,
            observableDefects: [String],
          },
        ],
        conversionGoal: String,
        healthStatus: { type: String, enum: ['OPTIMAL', 'DEGRADED', 'BROKEN'], default: 'OPTIMAL' },
      },
    ],
    // 7. Known Problems & Defect Traceability
    knownProblems: [
      {
        issueId: String,
        severity: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
        module: String,
        description: String,
        rootCause: String,
        status: { type: String, enum: ['OPEN', 'INVESTIGATING', 'FIXED', 'VERIFIED'], default: 'OPEN' },
        discoveredAt: { type: Date, default: Date.now },
      },
    ],
    // 8. Performance Indicators
    performanceIndicators: {
      averageApiResponseMs: { type: Number, default: 45 },
      clientBundleSizeKB: { type: Number, default: 520 },
      databaseQueryAvgMs: { type: Number, default: 12 },
      uptimePercent: { type: Number, default: 99.8 },
      lastAuditTimestamp: { type: Date, default: Date.now },
    },
    // 9. Approved Product Roadmap
    approvedRoadmap: [
      {
        epicId: String,
        title: String,
        priority: String,
        approvedInCycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'EvolutionCycle' },
        status: { type: String, enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED'], default: 'PLANNED' },
        requirementsCount: Number,
      },
    ],
  },
  { timestamps: true }
);

export const DigitalTwin = mongoose.model('DigitalTwin', digitalTwinSchema);
export default DigitalTwin;

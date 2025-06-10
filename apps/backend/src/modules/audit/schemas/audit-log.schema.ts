export interface AuditLog {
  _id?: string;

  // User Information
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId?: string;

  // Action Information
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  endpoint: string;

  // Request Information
  ip: string;
  userAgent: string;
  referer?: string;

  // Request/Response Data
  requestData?: any;
  responseData?: any;

  // Status
  status: 'success' | 'error' | 'warning';
  statusCode: number;
  errorMessage?: string;

  // Metadata
  duration: number; // in milliseconds
  timestamp: Date;
  environment: string;
  version: string;

  // Security
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];

  // Additional context
  context?: Record<string, any>;

  // Indexes
  createdAt: Date;
  updatedAt: Date;
}

export const AuditLogSchema = {
  userId: { type: String, index: true },
  userEmail: { type: String, index: true },
  userRole: { type: String, index: true },
  sessionId: { type: String, index: true },

  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  resourceId: { type: String, index: true },
  method: { type: String, required: true },
  endpoint: { type: String, required: true },

  ip: { type: String, required: true },
  userAgent: { type: String },
  referer: { type: String },

  requestData: { type: Object },
  responseData: { type: Object },

  status: {
    type: String,
    enum: ['success', 'error', 'warning'],
    required: true,
    index: true,
  },
  statusCode: { type: Number, required: true },
  errorMessage: { type: String },

  duration: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  environment: { type: String, required: true },
  version: { type: String, required: true },

  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true,
  },
  tags: [{ type: String, index: true }],

  context: { type: Object },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

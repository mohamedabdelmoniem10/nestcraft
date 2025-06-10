export interface AnalyticsEvent {
  _id?: string;

  // Event Information
  eventType: string;
  eventName: string;
  category: string;

  // User Information
  userId?: string;
  sessionId?: string;
  deviceId?: string;

  // Location & Device
  ip: string;
  country?: string;
  city?: string;
  userAgent: string;
  browser?: string;
  os?: string;
  device?: string;

  // Performance Metrics
  pageLoadTime?: number;
  renderTime?: number;
  responseTime?: number;

  // Page Information
  page?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Event Data
  properties: Record<string, any>;
  value?: number;

  // Metadata
  timestamp: Date;
  environment: string;
  version: string;

  // Indexes
  createdAt: Date;

  // Additional fields for specific event types
  customFields?: Record<string, any>;
}

export const AnalyticsEventSchema = {
  eventType: { type: String, required: true, index: true },
  eventName: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },

  userId: { type: String, index: true },
  sessionId: { type: String, index: true },
  deviceId: { type: String, index: true },

  ip: { type: String, required: true },
  country: { type: String, index: true },
  city: { type: String, index: true },
  userAgent: { type: String },
  browser: { type: String, index: true },
  os: { type: String, index: true },
  device: { type: String, index: true },

  pageLoadTime: { type: Number },
  renderTime: { type: Number },
  responseTime: { type: Number },

  page: { type: String, index: true },
  referrer: { type: String },
  utmSource: { type: String, index: true },
  utmMedium: { type: String, index: true },
  utmCampaign: { type: String, index: true },

  properties: { type: Object, required: true },
  value: { type: Number },

  timestamp: { type: Date, default: Date.now, index: true },
  environment: { type: String, required: true },
  version: { type: String, required: true },

  createdAt: { type: Date, default: Date.now },

  customFields: { type: Object },
};

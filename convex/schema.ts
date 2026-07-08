import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // User profiles — extends auth user with caregiver-specific fields
  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("professional"), v.literal("family")),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    // Professional-specific
    certifications: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    // Family-specific
    relationship: v.optional(v.string()),
    // Accessibility & preferences
    ageGroup: v.optional(
      v.union(v.literal("under_65"), v.literal("65_plus")),
    ),
    textSize: v.optional(
      v.union(
        v.literal("small"),
        v.literal("medium"),
        v.literal("large"),
        v.literal("extra-large"),
      ),
    ),
    highContrast: v.optional(v.boolean()),
    simplifiedNav: v.optional(v.boolean()),
    reducedMotion: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"]),

  // Care recipients — the people being cared for
  careRecipients: defineTable({
    name: v.string(),
    dateOfBirth: v.optional(v.string()),
    careType: v.union(
      v.literal("senior"),
      v.literal("disability"),
      v.literal("childcare"),
      v.literal("general"),
    ),
    conditions: v.optional(v.string()),
    notes: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    avatarEmoji: v.optional(v.string()),
    createdBy: v.id("users"),
  }).index("by_creator", ["createdBy"]),

  // Clinical health profile for a care recipient (one per recipient).
  // Drives the personalized care plan. All fields optional so intake can
  // be completed incrementally.
  healthProfiles: defineTable({
    careRecipientId: v.id("careRecipients"),
    createdBy: v.id("users"),
    // Chronic conditions (multi-select keys) + free text
    conditions: v.optional(v.array(v.string())),
    otherConditions: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    // Current medications captured during intake (free-form names)
    currentMedications: v.optional(v.array(v.string())),
    // Mobility & safety
    mobility: v.optional(
      v.union(
        v.literal("independent"),
        v.literal("cane"),
        v.literal("walker"),
        v.literal("wheelchair"),
        v.literal("bedbound"),
      ),
    ),
    fallRisk: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    // Cognition
    cognitiveStatus: v.optional(
      v.union(
        v.literal("alert"),
        v.literal("mild"),
        v.literal("moderate"),
        v.literal("severe"),
      ),
    ),
    // Independence — each entry: { key, level } where level 0=dependent..2=independent
    adl: v.optional(
      v.array(v.object({ key: v.string(), level: v.number() })),
    ),
    iadl: v.optional(
      v.array(v.object({ key: v.string(), level: v.number() })),
    ),
    // Quality-of-life self/observed report — each 0..4
    qualityOfLife: v.optional(
      v.object({
        mood: v.number(),
        pain: v.number(),
        sleep: v.number(),
        social: v.number(),
        energy: v.number(),
      }),
    ),
    // Reference info
    bloodType: v.optional(v.string()),
    primaryPhysician: v.optional(v.string()),
    dietaryRestrictions: v.optional(v.array(v.string())),
    emergencyNotes: v.optional(v.string()),
    // Cached generated plan summary
    carePlanSummary: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_care_recipient", ["careRecipientId"])
    .index("by_creator", ["createdBy"]),

  // Care team membership
  careTeamMembers: defineTable({
    careRecipientId: v.id("careRecipients"),
    userId: v.id("users"),
    role: v.union(
      v.literal("primary"),
      v.literal("secondary"),
      v.literal("family"),
      v.literal("professional"),
    ),
    invitedBy: v.optional(v.id("users")),
  })
    .index("by_care_recipient", ["careRecipientId"])
    .index("by_user", ["userId"])
    .index("by_user_and_recipient", ["userId", "careRecipientId"]),

  // Care log entries
  careLogs: defineTable({
    careRecipientId: v.id("careRecipients"),
    userId: v.id("users"),
    type: v.union(
      v.literal("task"),
      v.literal("vital"),
      v.literal("meal"),
      v.literal("note"),
      v.literal("activity"),
      v.literal("mood"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    // For vitals
    vitalType: v.optional(v.string()),
    vitalValue: v.optional(v.string()),
    vitalUnit: v.optional(v.string()),
    // For meals
    mealType: v.optional(v.string()),
    // For mood
    moodScore: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_care_recipient", ["careRecipientId"])
    .index("by_care_recipient_time", ["careRecipientId", "timestamp"]),

  // Medications
  medications: defineTable({
    careRecipientId: v.id("careRecipients"),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    instructions: v.optional(v.string()),
    timeOfDay: v.optional(v.string()),
    active: v.boolean(),
    createdBy: v.id("users"),
  }).index("by_care_recipient", ["careRecipientId"]),

  // Medication logs (taken/missed)
  medicationLogs: defineTable({
    medicationId: v.id("medications"),
    careRecipientId: v.id("careRecipients"),
    userId: v.id("users"),
    status: v.union(
      v.literal("taken"),
      v.literal("missed"),
      v.literal("skipped"),
    ),
    scheduledDate: v.string(),
    notes: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_medication", ["medicationId"])
    .index("by_care_recipient_date", ["careRecipientId", "scheduledDate"]),

  // Schedule entries
  scheduleEntries: defineTable({
    careRecipientId: v.id("careRecipients"),
    assignedTo: v.optional(v.id("users")),
    type: v.union(
      v.literal("shift"),
      v.literal("appointment"),
      v.literal("reminder"),
      v.literal("medication"),
      v.literal("task"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    completed: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("by_care_recipient", ["careRecipientId"])
    .index("by_date", ["date"])
    .index("by_care_recipient_date", ["careRecipientId", "date"]),

  // Time tracking entries (for professionals)
  timeEntries: defineTable({
    careRecipientId: v.id("careRecipients"),
    userId: v.id("users"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    durationMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("approved"),
    ),
  })
    .index("by_user", ["userId"])
    .index("by_care_recipient", ["careRecipientId"])
    .index("by_user_date", ["userId", "date"]),

  // Subscriptions
  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.union(
      v.literal("free"),
      v.literal("plus"),
      v.literal("professional"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),

  // Care team messages
  messages: defineTable({
    careRecipientId: v.id("careRecipients"),
    userId: v.id("users"),
    userName: v.string(),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_care_recipient", ["careRecipientId"]),

  // Chatbot conversations
  chatMessages: defineTable({
    userId: v.id("users"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    content: v.string(),
    context: v.optional(v.string()), // "onboarding", "general", "scheduling", "care"
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_time", ["userId", "timestamp"]),

  // External service integrations
  integrations: defineTable({
    userId: v.id("users"),
    provider: v.string(), // "google_calendar", "outlook_calendar", "gmail", "outlook_mail", "apple_calendar"
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("pending"),
      v.literal("error"),
    ),
    email: v.optional(v.string()),
    lastSync: v.optional(v.number()),
    scopes: v.optional(v.string()),
    metadata: v.optional(v.string()), // JSON string for provider-specific data
  })
    .index("by_user", ["userId"])
    .index("by_user_provider", ["userId", "provider"]),

  // FHIR / MyChart connections (Plus & Pro only)
  fhirConnections: defineTable({
    userId: v.id("users"),
    provider: v.string(), // "epic_mychart", "epic_sandbox"
    fhirBaseUrl: v.string(),
    patientId: v.optional(v.string()), // FHIR Patient ID
    patientName: v.optional(v.string()),
    accessToken: v.optional(v.string()), // encrypted in production
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
    scopes: v.optional(v.string()),
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("expired"),
      v.literal("error"),
    ),
    lastSync: v.optional(v.number()),
    metadata: v.optional(v.string()), // JSON blob
  })
    .index("by_user", ["userId"])
    .index("by_user_provider", ["userId", "provider"]),

  // FHIR messages (synced from MyChart Communication resources)
  fhirMessages: defineTable({
    userId: v.id("users"),
    fhirConnectionId: v.id("fhirConnections"),
    fhirResourceId: v.optional(v.string()), // FHIR Communication.id
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    practitionerName: v.string(),
    practitionerReference: v.optional(v.string()), // "Practitioner/abc123"
    patientReference: v.optional(v.string()), // "Patient/xyz789"
    subject: v.optional(v.string()),
    content: v.string(),
    category: v.optional(v.string()), // FHIR Communication.category
    status: v.union(
      v.literal("sent"),
      v.literal("received"),
      v.literal("read"),
      v.literal("failed"),
    ),
    sentAt: v.number(),
    readAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_connection", ["fhirConnectionId"])
    .index("by_user_time", ["userId", "sentAt"]),

  // Security audit log
  securityEvents: defineTable({
    userId: v.id("users"),
    eventType: v.string(), // "login", "logout", "password_change", "2fa_enabled", "integration_connected"
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    details: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_time", ["userId", "timestamp"]),
});

export default schema;

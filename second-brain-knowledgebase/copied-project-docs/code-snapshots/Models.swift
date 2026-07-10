// MARK: - Models.swift
// Core data models for Nurtura app

import Foundation
import SwiftUI

// MARK: - User Profile
struct UserProfile: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    let firstName: String
    let lastName: String
    let email: String
    let role: UserRole
    let onboardingComplete: Bool
    let ageGroup: AgeGroup
    let textSize: TextSize
    let highContrast: Bool
    let simplifiedNav: Bool
    let reducedMotion: Bool
    let subscriptionTier: SubscriptionTier
    let certifications: [String]?
    let hourlyRate: Double?
    let createdAt: Date
    
    var fullName: String { "\(firstName) \(lastName)" }
}

enum UserRole: String, Codable, CaseIterable, Identifiable {
    case family = "family"
    case professional = "professional"
    case patient = "patient"
    
    var id: String { rawValue }
    var displayName: String {
        switch self {
        case .family: return "Family Caregiver"
        case .professional: return "Professional Caregiver"
        case .patient: return "I am a Care Recipient"
        }
    }
    
    var icon: String {
        switch self {
        case .family: return "heart.fill"
        case .professional: return "stethoscope"
        case .patient: return "person.fill"
        }
    }
    
    var description: String {
        switch self {
        case .family: return "Caring for a loved one"
        case .professional: return "Certified care professional"
        case .patient: return "I receive care from others"
        }
    }
}

enum AgeGroup: String, Codable {
    case under65 = "under_65"
    case over65 = "65_and_over"
}

enum TextSize: String, Codable, CaseIterable {
    case small = "small"
    case medium = "medium"
    case large = "large"
    case extraLarge = "extra_large"
    
    var scale: CGFloat {
        switch self {
        case .small: return 0.9
        case .medium: return 1.0
        case .large: return 1.2
        case .extraLarge: return 1.4
        }
    }
    
    var displayName: String {
        switch self {
        case .small: return "Small"
        case .medium: return "Medium"
        case .large: return "Large"
        case .extraLarge: return "Extra Large"
        }
    }
}

enum SubscriptionTier: String, Codable, CaseIterable, Identifiable {
    case free = "free"
    case plus = "plus"
    case professional = "professional"
    
    var id: String { rawValue }
    var displayName: String {
        switch self {
        case .free: return "Free"
        case .plus: return "Plus"
        case .professional: return "Professional"
        }
    }
    
    var price: String {
        switch self {
        case .free: return "$0/month"
        case .plus: return "$9.99/month"
        case .professional: return "$19.99/month"
        }
    }
    
    var features: [String] {
        switch self {
        case .free:
            return ["1 care recipient", "Medication tracking", "Calendar view", "Ivy: 5 messages/day", "Basic care logging"]
        case .plus:
            return ["Up to 5 care recipients", "Team messaging", "Calendar integrations", "Ivy: unlimited", "Priority support"]
        case .professional:
            return ["Unlimited care recipients", "Time tracking & billing", "Advanced analytics", "Ivy: 24/7 + quick actions", "Priority support"]
        }
    }
    
    var maxCareRecipients: Int {
        switch self {
        case .free: return 1
        case .plus: return 5
        case .professional: return Int.max
        }
    }
    
    var ivyMessageLimit: Int? {
        switch self {
        case .free: return 5
        case .plus: return nil
        case .professional: return nil
        }
    }
    
    var ivyIdentity: String {
        switch self {
        case .free: return "Setup Guide"
        case .plus: return "Care Assistant"
        case .professional: return "24/7 Care Assistant"
        }
    }
}

// MARK: - Care Recipient
struct CareRecipient: Codable, Identifiable, Equatable {
    let id: String
    let name: String
    let careType: String
    let conditions: [String]
    let emergencyContact: EmergencyContact?
    let createdBy: String
    let createdAt: Date
    let avatarColor: String?
    
    var avatarColorValue: Color {
        switch avatarColor {
        case "sage": return Color(red: 0.55, green: 0.68, blue: 0.55)
        case "sky": return Color(red: 0.40, green: 0.65, blue: 0.85)
        case "coral": return Color(red: 0.95, green: 0.50, blue: 0.40)
        case "lavender": return Color(red: 0.70, green: 0.55, blue: 0.90)
        default: return Color(red: 0.55, green: 0.68, blue: 0.55)
        }
    }
}

struct EmergencyContact: Codable, Equatable {
    let name: String
    let phone: String
    let relationship: String
}

// MARK: - Care Log
enum CareLogType: String, Codable, CaseIterable, Identifiable {
    case task = "task"
    case vital = "vital"
    case meal = "meal"
    case note = "note"
    case mood = "mood"
    
    var id: String { rawValue }
    var icon: String {
        switch self {
        case .task: return "checklist"
        case .vital: return "heart.fill"
        case .meal: return "fork.knife"
        case .note: return "note.text"
        case .mood: return "face.smiling"
        }
    }
    
    var displayName: String {
        switch self {
        case .task: return "Task"
        case .vital: return "Vital"
        case .meal: return "Meal"
        case .note: return "Note"
        case .mood: return "Mood"
        }
    }
}

struct CareLog: Codable, Identifiable, Equatable {
    let id: String
    let careRecipientId: String
    let userId: String
    let type: CareLogType
    let title: String
    let vitalType: String?
    let vitalValue: String?
    let vitalUnit: String?
    let mealType: MealType?
    let moodScore: Int?
    let notes: String?
    let timestamp: Date
    let userName: String
}

enum MealType: String, Codable {
    case breakfast = "breakfast"
    case lunch = "lunch"
    case dinner = "dinner"
    case snack = "snack"
}

// MARK: - Medication
struct Medication: Codable, Identifiable, Equatable {
    let id: String
    let careRecipientId: String
    let name: String
    let dosage: String
    let frequency: String
    let timeOfDay: [String]
    let active: Bool
    let createdAt: Date
    let notes: String?
    
    var isActive: Bool { active }
}

struct MedicationLog: Codable, Identifiable, Equatable {
    let id: String
    let medicationId: String
    let careRecipientId: String
    let status: MedicationStatus
    let scheduledDate: Date
    let timestamp: Date
}

enum MedicationStatus: String, Codable {
    case taken = "taken"
    case missed = "missed"
    case snoozed = "snoozed"
    case pending = "pending"
}

// MARK: - Schedule
struct ScheduleEntry: Codable, Identifiable, Equatable {
    let id: String
    let careRecipientId: String
    let type: ScheduleType
    let title: String
    let date: Date
    let startTime: Date
    let endTime: Date?
    let isCompleted: Bool
    let assignedTo: String?
    let notes: String?
    let createdAt: Date
}

enum ScheduleType: String, Codable, CaseIterable, Identifiable {
    case appointment = "appointment"
    case shift = "shift"
    case reminder = "reminder"
    
    var id: String { rawValue }
    var icon: String {
        switch self {
        case .appointment: return "calendar.badge.clock"
        case .shift: return "clock.badge.checkmark"
        case .reminder: return "bell.fill"
        }
    }
    
    var displayName: String {
        switch self {
        case .appointment: return "Appointment"
        case .shift: return "Shift"
        case .reminder: return "Reminder"
        }
    }
}

// MARK: - Message
struct Message: Codable, Identifiable, Equatable {
    let id: String
    let careRecipientId: String
    let userId: String
    let userName: String
    let content: String
    let timestamp: Date
    let isRead: Bool
}

// MARK: - Chat (Ivy)
struct ChatMessage: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    let role: ChatRole
    let content: String
    let context: String?
    let timestamp: Date
}

enum ChatRole: String, Codable {
    case user = "user"
    case assistant = "assistant"
}

// MARK: - Time Tracking
struct TimeEntry: Codable, Identifiable, Equatable {
    let id: String
    let careRecipientId: String
    let userId: String
    let date: Date
    let startTime: Date
    let endTime: Date?
    let durationMinutes: Int?
    let notes: String?
    let isBilled: Bool
}

// MARK: - Integration
struct Integration: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    let provider: IntegrationProvider
    let status: IntegrationStatus
    let email: String?
    let lastSync: Date?
}

enum IntegrationProvider: String, Codable, CaseIterable, Identifiable {
    case googleCalendar = "google_calendar"
    case appleCalendar = "apple_calendar"
    case gmail = "gmail"
    case outlook = "outlook"
    case googleFit = "google_fit"
    
    var id: String { rawValue }
    var displayName: String {
        switch self {
        case .googleCalendar: return "Google Calendar"
        case .appleCalendar: return "Apple Calendar"
        case .gmail: return "Gmail"
        case .outlook: return "Outlook"
        case .googleFit: return "Google Fit"
        }
    }
    
    var icon: String {
        switch self {
        case .googleCalendar: return "calendar"
        case .appleCalendar: return "calendar.badge.clock"
        case .gmail: return "envelope.fill"
        case .outlook: return "envelope.fill"
        case .googleFit: return "heart.fill"
        }
    }
}

enum IntegrationStatus: String, Codable {
    case connected = "connected"
    case disconnected = "disconnected"
    case error = "error"
}

// MARK: - Security Event
struct SecurityEvent: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    let eventType: SecurityEventType
    let ipAddress: String
    let details: String
    let timestamp: Date
}

enum SecurityEventType: String, Codable {
    case login = "login"
    case logout = "logout"
    case twoFactorEnabled = "2fa_enabled"
    case twoFactorDisabled = "2fa_disabled"
    case passwordChanged = "password_changed"
    case integrationConnected = "integration_connected"
    case integrationDisconnected = "integration_disconnected"
    case dataExported = "data_exported"
    case accountDeleted = "account_deleted"
}

// MARK: - Accessibility Settings
struct AccessibilitySettings {
    var textSize: TextSize = .medium
    var highContrast: Bool = false
    var simplifiedNav: Bool = false
    var reducedMotion: Bool = false
    var seniorMode: Bool = false
    
    mutating func toggleSeniorMode() {
        seniorMode.toggle()
        if seniorMode {
            textSize = .large
            highContrast = true
            simplifiedNav = true
        } else {
            textSize = .medium
            highContrast = false
            simplifiedNav = false
        }
    }
}

// MARK: - Care Team Member
struct CareTeamMember: Codable, Identifiable, Equatable {
    let id: String
    let careRecipientId: String
    let userId: String
    let role: String
    let userName: String
    let userEmail: String
    let joinedAt: Date
}

// MARK: - Health Vitals (Watch)
struct BloodPressureReading: Codable, Identifiable, Equatable {
    let id: String
    let careRecipientId: String
    let systolic: Int
    let diastolic: Int
    let timestamp: Date
    let notes: String?
    
    var displayValue: String { "\(systolic)/\(diastolic) mmHg" }
}

struct HeartRateReading: Codable, Identifiable, Equatable {
    let id: String
    let careRecipientId: String
    let bpm: Int
    let timestamp: Date
}

// MARK: - App Constants
struct AppConstants {
    static let appName = "Nurtura"
    static let appTagline = "Care, naturally"
    static let convexURL = "https://optimistic-tapir-431.convex.cloud"
    static let appStoreURL = "https://nurtura.app"
    
    static let primaryColor = Color(red: 0.55, green: 0.68, blue: 0.55) // Sage
    static let secondaryColor = Color(red: 0.40, green: 0.65, blue: 0.85) // Sky
    static let accentColor = Color(red: 0.95, green: 0.50, blue: 0.40) // Coral
    
    static let minTouchTarget: CGFloat = 44
    static let focusRingWidth: CGFloat = 3
    static let focusRingColor = Color(red: 0.55, green: 0.68, blue: 0.55)
}

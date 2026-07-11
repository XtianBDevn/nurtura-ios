// MARK: - ConvexAPI.swift
// API client for Convex backend operations

import Foundation
import Combine

@MainActor
class ConvexAPI: ObservableObject {
    static let shared = ConvexAPI()
    
    private let baseURL = AppConstants.convexURL
    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        d.keyDecodingStrategy = .convertFromSnakeCase
        return d
    }()
    
    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.dateEncodingStrategy = .iso8601
        e.keyEncodingStrategy = .convertToSnakeCase
        return e
    }()
    
    private init() {}
    
    // MARK: - Generic Request
    private func request<T: Decodable>(
        path: String,
        method: String = "GET",
        body: Encodable? = nil
    ) async throws -> T {
        guard let token = AuthManager.shared.accessToken else {
            throw APIError.unauthorized
        }
        
        var request = URLRequest(url: URL(string: "\(baseURL)/\(path)")!)
        request.httpMethod = method
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let body {
            request.httpBody = try encoder.encode(body)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.unknown
        }
        
        if httpResponse.statusCode == 401 {
            try await AuthManager.shared.refreshAccessToken()
            return try await self.request(path: path, method: method, body: body)
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError(statusCode: httpResponse.statusCode)
        }
        
        return try decoder.decode(T.self, from: data)
    }
    
    private func requestVoid(path: String, method: String = "POST", body: Encodable? = nil) async throws {
        let _: EmptyResponse = try await request(path: path, method: method, body: body)
    }
    
    // MARK: - Profile
    func getProfile() async throws -> UserProfile {
        try await request(path: "api/profiles/get")
    }
    
    func updateProfile(_ profile: ProfileUpdate) async throws -> UserProfile {
        try await request(path: "api/profiles/update", method: "POST", body: profile)
    }
    
    func completeOnboarding(profile: OnboardingProfile) async throws {
        let body = OnboardingCompletion(
            role: profile.role.rawValue,
            firstName: profile.firstName,
            lastName: profile.lastName,
            ageGroup: profile.ageGroup.rawValue,
            textSize: profile.textSize.rawValue,
            highContrast: profile.highContrast,
            simplifiedNav: profile.simplifiedNav,
            reducedMotion: profile.reducedMotion,
            careRecipientName: profile.careRecipientName,
            careType: profile.careType,
            careRecipientNotes: profile.careRecipientNotes,
            certifications: profile.certifications,
            hourlyRate: profile.hourlyRate
        )
        try await requestVoid(path: "api/profiles/completeOnboarding", body: body)
    }
    
    func updateAccessibility(settings: AccessibilitySettings) async throws {
        let body = AccessibilityUpdate(
            textSize: settings.textSize.rawValue,
            highContrast: settings.highContrast,
            simplifiedNav: settings.simplifiedNav,
            reducedMotion: settings.reducedMotion
        )
        try await requestVoid(path: "api/profiles/updateAccessibility", body: body)
    }
    
    // MARK: - Care Recipients
    func getCareRecipients() async throws -> [CareRecipient] {
        try await request(path: "api/careRecipients/list")
    }
    
    func createCareRecipient(_ recipient: CareRecipientCreate) async throws -> CareRecipient {
        try await request(path: "api/careRecipients/create", method: "POST", body: recipient)
    }
    
    func getCareRecipient(id: String) async throws -> CareRecipient {
        try await request(path: "api/careRecipients/get?id=\(id)")
    }
    
    // MARK: - Care Logs
    func getCareLogs(recipientId: String) async throws -> [CareLog] {
        try await request(path: "api/careLogs/list?careRecipientId=\(recipientId)")
    }
    
    func createCareLog(_ log: CareLogCreate) async throws -> CareLog {
        try await request(path: "api/careLogs/create", method: "POST", body: log)
    }
    
    // MARK: - Medications
    func getMedications(recipientId: String) async throws -> [Medication] {
        try await request(path: "api/medications/list?careRecipientId=\(recipientId)")
    }
    
    func createMedication(_ medication: MedicationCreate) async throws -> Medication {
        try await request(path: "api/medications/create", method: "POST", body: medication)
    }
    
    func markMedicationStatus(medicationId: String, status: MedicationStatus, date: Date) async throws {
        let body = MedicationStatusUpdate(medicationId: medicationId, status: status.rawValue, scheduledDate: date)
        try await requestVoid(path: "api/medicationLogs/create", body: body)
    }
    
    // MARK: - Schedule
    func getScheduleEntries(recipientId: String? = nil, date: Date? = nil) async throws -> [ScheduleEntry] {
        var path = "api/scheduleEntries/list"
        var queryItems: [String] = []
        if let recipientId { queryItems.append("careRecipientId=\(recipientId)") }
        if let date { queryItems.append("date=\(ISO8601DateFormatter().string(from: date))") }
        if !queryItems.isEmpty {
            path += "?" + queryItems.joined(separator: "&")
        }
        return try await request(path: path)
    }
    
    func createScheduleEntry(_ entry: ScheduleEntryCreate) async throws -> ScheduleEntry {
        try await request(path: "api/scheduleEntries/create", method: "POST", body: entry)
    }
    
    // MARK: - Messages
    func getMessages(recipientId: String) async throws -> [Message] {
        try await request(path: "api/messages/list?careRecipientId=\(recipientId)")
    }
    
    func sendMessage(_ message: MessageCreate) async throws -> Message {
        try await request(path: "api/messages/send", method: "POST", body: message)
    }
    
    // MARK: - Chat (Ivy)
    func getChatMessages() async throws -> [ChatMessage] {
        try await request(path: "api/chatMessages/list")
    }
    
    func sendChatMessage(_ message: ChatMessageCreate) async throws -> ChatMessage {
        try await request(path: "api/chatMessages/send", method: "POST", body: message)
    }
    
    func clearChatHistory() async throws {
        try await requestVoid(path: "api/chatMessages/clearHistory", method: "POST")
    }
    
    // MARK: - Time Tracking
    func getTimeEntries(recipientId: String? = nil) async throws -> [TimeEntry] {
        var path = "api/timeEntries/list"
        if let recipientId { path += "?careRecipientId=\(recipientId)" }
        return try await request(path: path)
    }
    
    func clockIn(recipientId: String) async throws -> TimeEntry {
        try await request(path: "api/timeEntries/clockIn", method: "POST", body: ["careRecipientId": recipientId])
    }
    
    func clockOut(entryId: String) async throws -> TimeEntry {
        try await request(path: "api/timeEntries/clockOut", method: "POST", body: ["id": entryId])
    }
    
    // MARK: - Subscription
    func getSubscription() async throws -> SubscriptionInfo {
        try await request(path: "api/subscriptions/get")
    }
    
    // MARK: - Integrations
    func getIntegrations() async throws -> [Integration] {
        try await request(path: "api/integrations/list")
    }
    
    func connectIntegration(provider: IntegrationProvider) async throws -> Integration {
        try await request(path: "api/integrations/connect", method: "POST", body: ["provider": provider.rawValue])
    }
    
    func disconnectIntegration(id: String) async throws {
        try await requestVoid(path: "api/integrations/disconnect", method: "POST", body: ["id": id])
    }
    
    // MARK: - Security
    func logSecurityEvent(_ eventType: SecurityEventType, details: String) async throws {
        let body = SecurityEventCreate(eventType: eventType.rawValue, details: details)
        try await requestVoid(path: "api/securityEvents/log", body: body)
    }
    
    func getSecurityEvents() async throws -> [SecurityEvent] {
        try await request(path: "api/securityEvents/list")
    }
    
    func exportData() async throws -> URL {
        let response: ExportResponse = try await request(path: "api/users/exportData")
        return URL(string: response.downloadUrl)!
    }
    
    func deleteAccount() async throws {
        try await requestVoid(path: "api/users/deleteAccount", method: "POST")
    }
    
    // MARK: - Care Team
    func getCareTeamMembers(recipientId: String) async throws -> [CareTeamMember] {
        try await request(path: "api/careTeamMembers/list?careRecipientId=\(recipientId)")
    }
    
    // MARK: - Watch Sync
    func syncWatchData() async throws -> WatchSyncData {
        try await request(path: "api/watch/sync")
    }
}

// MARK: - Request Bodies
struct ProfileUpdate: Codable {
    let firstName: String?
    let lastName: String?
    let role: String?
}

struct OnboardingCompletion: Codable {
    let role: String
    let firstName: String
    let lastName: String
    let ageGroup: String
    let textSize: String
    let highContrast: Bool
    let simplifiedNav: Bool
    let reducedMotion: Bool
    let careRecipientName: String
    let careType: String
    let careRecipientNotes: String?
    let certifications: [String]
    let hourlyRate: Double?
}

struct AccessibilityUpdate: Codable {
    let textSize: String
    let highContrast: Bool
    let simplifiedNav: Bool
    let reducedMotion: Bool
}

struct CareRecipientCreate: Codable {
    let name: String
    let careType: String
    let conditions: [String]
    let emergencyContact: EmergencyContact?
    let notes: String?
}

struct CareLogCreate: Codable {
    let careRecipientId: String
    let type: String
    let title: String
    let vitalType: String?
    let vitalValue: String?
    let vitalUnit: String?
    let mealType: String?
    let moodScore: Int?
    let notes: String?
}

struct MedicationCreate: Codable {
    let careRecipientId: String
    let name: String
    let dosage: String
    let frequency: String
    let timeOfDay: [String]
    let notes: String?
}

struct MedicationStatusUpdate: Codable {
    let medicationId: String
    let status: String
    let scheduledDate: Date
}

struct ScheduleEntryCreate: Codable {
    let careRecipientId: String
    let type: String
    let title: String
    let date: Date
    let startTime: Date
    let endTime: Date?
    let notes: String?
    let assignedTo: String?
}

struct MessageCreate: Codable {
    let careRecipientId: String
    let content: String
}

struct ChatMessageCreate: Codable {
    let content: String
    let context: String?
}

struct SecurityEventCreate: Codable {
    let eventType: String
    let details: String
}

struct EmptyResponse: Codable {}

struct ExportResponse: Codable {
    let downloadUrl: String
}

struct SubscriptionInfo: Codable {
    let plan: SubscriptionTier
    let status: String
    let expiresAt: Date?
}

struct WatchSyncData: Codable {
    let medications: [Medication]
    let scheduleEntries: [ScheduleEntry]
    let careRecipients: [CareRecipient]
}

// MARK: - API Errors
enum APIError: Error, LocalizedError {
    case unauthorized
    case serverError(statusCode: Int)
    case decodingError
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .unauthorized: return "Please sign in to continue."
        case .serverError(let code): return "Server error (\(code)). Please try again."
        case .decodingError: return "Failed to parse response."
        case .unknown: return "An unknown error occurred."
        }
    }
}

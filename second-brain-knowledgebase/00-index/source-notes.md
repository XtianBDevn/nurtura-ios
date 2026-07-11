# Source Notes

Re-check these sources before launch or submission because Apple policies,
health privacy guidance, and review requirements can change.

## Apple App Store And TestFlight
- App Store Connect submission overview: https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/overview-of-submitting-for-review
- TestFlight overview: https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/
- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Upload screenshots and previews: https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots/
- Manage app privacy: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Add watchOS app information: https://developer.apple.com/help/app-store-connect/create-an-app-record/add-watchos-app-information/
- Declare regulated medical device status: https://developer.apple.com/help/app-store-connect/manage-app-information/declare-regulated-medical-device-status/

Key points used here:
- Apple reviews every submitted app version and associated content.
- App versions for each platform are submitted separately.
- TestFlight supports iOS, macOS, visionOS, tvOS, and watchOS beta testing.
- TestFlight builds can be tested for up to 90 days.
- Apple specifically scrutinizes medical apps that could provide inaccurate
  information or be used for diagnosis/treatment.
- Health, fitness, and medical data has extra privacy rules, including limits
  on advertising or data-mining use.

## Health App Privacy And Regulatory Sources
- FTC Mobile Health App Interactive Tool: https://www.ftc.gov/business-guidance/resources/mobile-health-apps-interactive-tool
- HHS mobile health app developer resources: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html
- FDA device software functions and mobile medical applications: https://www.fda.gov/medical-devices/digital-health-center-excellence/device-software-functions-including-mobile-medical-applications

Key points used here:
- More than one federal law can apply to a mobile health app.
- HIPAA may apply if the app is offered by or on behalf of a covered entity or
  business associate, but non-HIPAA health apps can still be covered by FTC rules.
- Software intended for diagnosis, cure, mitigation, treatment, prevention, or
  affecting body structure/function can become FDA-regulated device software.
- Marketing claims must match actual functionality and evidence.

## Nurtura Local Project Sources
- `Package.swift`: Swift package targets iOS 17, watchOS 10, macOS 13 and exposes `NurturaShared`.
- `Nurtura/Models/Models.swift`: caregiver, care recipient, medication, schedule, message, subscription, accessibility, and watch sync models.
- `Nurtura/Services/ConvexAPI.swift`: Convex API client, subscriptions, integrations, security logs, exports, account deletion, and watch sync.
- `Nurtura/Services/AuthManager.swift`: OAuth-style auth and Keychain storage.
- `NurturaTests/`: existing model, auth, and Convex contract tests.
- `Documentation/*.pdf` and `../nurtura-user-flow-storyboard.pdf`: existing walkthrough, QA, and storyboard references copied into this knowledgebase.


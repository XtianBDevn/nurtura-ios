# Current Baseline

Date checked: July 8, 2026

## Repository Shape
- Swift package: `Nurtura`
- Shared target: `NurturaShared`
- Platforms declared: iOS 17, watchOS 10, macOS 13
- Existing tests: `NurturaTests`
- Existing Watch folder: `NurturaWatch`
- Existing PDFs copied into this knowledgebase.

## Test Status

Command:

```bash
swift test
```

Result:

```text
Build failed before test execution.
```

Primary compile blocker:

```text
Nurtura/Services/ConvexAPI.swift:78:38:
cannot find type 'OnboardingProfile' in scope
```

SwiftPM warning:

```text
found 4 file(s) which are unhandled
Nurtura/Views/Auth/AuthFlow.swift
Nurtura/Views/Onboarding/OnboardingFlow.swift
Nurtura/NurturaApp.swift
Nurtura/Views/RootView.swift
```

Interpretation:
- The package target includes service/model files only, but one included service file references an app/onboarding type not available to the package.
- Either move/share `OnboardingProfile` into the package target, change the API method to accept a target-owned DTO, or adjust package target sources.
- The unhandled UI-file warning may be acceptable if Xcode owns the app target separately, but it should be cleaned up or documented before release.


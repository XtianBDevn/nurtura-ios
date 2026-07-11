// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Nurtura",
    platforms: [
        .iOS(.v17),
        .watchOS(.v10),
        .macOS(.v13),
    ],
    products: [
        .library(
            name: "NurturaShared",
            targets: ["NurturaShared"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-algorithms.git", from: "1.2.0"),
    ],
    targets: [
        .target(
            name: "NurturaShared",
            dependencies: [
                .product(name: "Algorithms", package: "swift-algorithms"),
            ],
            path: "Nurtura",
            sources: [
                "Models/Models.swift",
                "Services/AuthManager.swift",
                "Services/ConvexAPI.swift",
            ]
        ),
        .testTarget(
            name: "NurturaSharedTests",
            dependencies: ["NurturaShared"],
            path: "NurturaTests"
        ),
    ]
)

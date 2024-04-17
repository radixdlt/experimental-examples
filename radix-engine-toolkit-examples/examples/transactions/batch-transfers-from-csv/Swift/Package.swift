// swift-tools-version: 5.7.1

import PackageDescription

let package = Package(
    name: "SwiftExample",
    platforms: [.macOS(.v12), .iOS(.v12)],
    dependencies: [
        .package(url: "https://github.com/radixdlt/swift-engine-toolkit", .branch("main")),
        .package(url: "https://github.com/swiftcsv/SwiftCSV", from: "0.8.0"),
    ],
    targets: [
        .executableTarget(
            name: "SwiftExample",
            dependencies: [
                .product(name: "EngineToolkit", package: "swift-engine-toolkit"),
                .product(name: "SwiftCSV", package: "SwiftCSV"),
            ],
            path: "Sources"
        ),
    ]
)

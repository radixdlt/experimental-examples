// swift-tools-version: 5.7.1

import PackageDescription

let package = Package(
    name: "SwiftExample",
    platforms: [.macOS(.v12), .iOS(.v12)],
    dependencies: [
        .package(url: "https://github.com/radixdlt/swift-engine-toolkit", .branch("main")),
    ],
    targets: [
        .executableTarget(
            name: "SwiftExample",
            dependencies: [
                .product(name: "EngineToolkit", package: "swift-engine-toolkit"),
            ],
            path: "Sources"
        ),
    ]
)

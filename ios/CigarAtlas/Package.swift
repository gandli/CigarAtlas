// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CigarAtlas",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "CigarAtlas",
            targets: ["CigarAtlas"]),
    ],
    dependencies: [
        // Add dependencies here as needed
    ],
    targets: [
        .target(
            name: "CigarAtlas",
            dependencies: []),
        .testTarget(
            name: "CigarAtlasTests",
            dependencies: ["CigarAtlas"]),
    ]
)
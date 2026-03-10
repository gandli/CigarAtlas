# CigarAtlas

Community app for cigar enthusiasts.

## Positioning

CigarAtlas is a consumer-facing platform focused on cigar lifestyle: tasting records, social interaction, local meetups, and humidor routines.

## Scope (MVP)

- Community feed
- Tasting journal
- Local meetup board
- User profile and badges

## iOS App

The iOS app is located in the `ios/` directory and is built with SwiftUI.

### Requirements

- Xcode 16.0+
- iOS 17.0+
- Swift 5.9+

### Getting Started

```bash
cd ios/CigarAtlas
open CigarAtlas.xcodeproj
```

### Project Structure

```
ios/CigarAtlas/
├── CigarAtlas.xcodeproj    # Xcode project
├── Package.swift           # Swift Package Manager
└── CigarAtlas/
    ├── CigarAtlasApp.swift # App entry point
    ├── ContentView.swift   # Main tab view
    ├── Models/             # Data models
    ├── Views/              # SwiftUI views
    │   ├── CigarListView.swift
    │   ├── CollectionView.swift
    │   ├── TastingNoteView.swift
    │   └── SettingsView.swift
    ├── ViewModels/         # Business logic
    ├── Services/           # Network & storage
    └── Resources/          # Assets & Info.plist
```

### Features (iOS)

- **Explore**: Browse and search cigars by brand, strength, wrapper type
- **Collection**: Track your personal humidor inventory
- **Notes**: Record tasting notes with detailed ratings
- **Settings**: App preferences and about information

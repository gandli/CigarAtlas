import Foundation

/// Represents a cigar brand
struct CigarBrand: Identifiable, Codable, Hashable {
    let id: UUID
    let name: String
    let country: String
    let foundedYear: Int?
    let description: String
    let logoURL: URL?
    
    init(
        id: UUID = UUID(),
        name: String,
        country: String,
        foundedYear: Int? = nil,
        description: String = "",
        logoURL: URL? = nil
    ) {
        self.id = id
        self.name = name
        self.country = country
        self.foundedYear = foundedYear
        self.description = description
        self.logoURL = logoURL
    }
}

/// Represents a specific cigar model
struct Cigar: Identifiable, Codable, Hashable {
    let id: UUID
    let brandId: UUID
    let name: String
    let vitola: String
    let strength: CigarStrength
    let wrapper: WrapperType
    let origin: String
    let length: Double // in inches
    let ringGauge: Int
    let tastingNotes: [String]
    let rating: Double? // 0-100
    let imageURL: URL?
    
    init(
        id: UUID = UUID(),
        brandId: UUID,
        name: String,
        vitola: String,
        strength: CigarStrength,
        wrapper: WrapperType,
        origin: String,
        length: Double,
        ringGauge: Int,
        tastingNotes: [String] = [],
        rating: Double? = nil,
        imageURL: URL? = nil
    ) {
        self.id = id
        self.brandId = brandId
        self.name = name
        self.vitola = vitola
        self.strength = strength
        self.wrapper = wrapper
        self.origin = origin
        self.length = length
        self.ringGauge = ringGauge
        self.tastingNotes = tastingNotes
        self.rating = rating
        self.imageURL = imageURL
    }
}

/// Cigar strength levels
enum CigarStrength: String, Codable, CaseIterable {
    case mild = "Mild"
    case mildToMedium = "Mild-Medium"
    case medium = "Medium"
    case mediumToFull = "Medium-Full"
    case full = "Full"
    
    var displayName: String { rawValue }
}

/// Wrapper leaf types
enum WrapperType: String, Codable, CaseIterable {
    case connecticut = "Connecticut"
    case habano = "Habano"
    case maduro = "Maduro"
    case corojo = "Corojo"
    case sumatra = "Sumatra"
    case cameroon = "Cameroon"
    case broadleaf = "Broadleaf"
    
    var displayName: String { rawValue }
}

/// User's personal cigar collection
struct CigarCollection: Identifiable, Codable {
    let id: UUID
    var cigarId: UUID
    var quantity: Int
    var purchaseDate: Date?
    var purchasePrice: Double?
    var storageLocation: String?
    var notes: String
    var isFavorite: Bool
    
    init(
        id: UUID = UUID(),
        cigarId: UUID,
        quantity: Int = 1,
        purchaseDate: Date? = nil,
        purchasePrice: Double? = nil,
        storageLocation: String? = nil,
        notes: String = "",
        isFavorite: Bool = false
    ) {
        self.id = id
        self.cigarId = cigarId
        self.quantity = quantity
        self.purchaseDate = purchaseDate
        self.purchasePrice = purchasePrice
        self.storageLocation = storageLocation
        self.notes = notes
        self.isFavorite = isFavorite
    }
}

/// Tasting note / review
struct TastingNote: Identifiable, Codable {
    let id: UUID
    let cigarId: UUID
    let date: Date
    var rating: Int // 1-100
    var draw: Int // 1-10
    var burn: Int // 1-10
    var flavor: Int // 1-10
    var aroma: Int // 1-10
    var notes: String
    var pairedWith: String?
    
    init(
        id: UUID = UUID(),
        cigarId: UUID,
        date: Date = Date(),
        rating: Int,
        draw: Int,
        burn: Int,
        flavor: Int,
        aroma: Int,
        notes: String = "",
        pairedWith: String? = nil
    ) {
        self.id = id
        self.cigarId = cigarId
        self.date = date
        self.rating = rating
        self.draw = draw
        self.burn = burn
        self.flavor = flavor
        self.aroma = aroma
        self.notes = notes
        self.pairedWith = pairedWith
    }
}
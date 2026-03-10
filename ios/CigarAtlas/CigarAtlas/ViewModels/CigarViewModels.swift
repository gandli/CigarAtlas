import Foundation

/// ViewModel for the main cigar list
@MainActor
@Observable
final class CigarListViewModel {
    var cigars: [Cigar] = []
    var brands: [CigarBrand] = []
    var isLoading = false
    var errorMessage: String?
    
    private let cigarService = CigarService.shared
    
    func loadCigars() async {
        isLoading = true
        errorMessage = nil
        
        do {
            brands = try await cigarService.fetchBrands()
            // Load cigars for each brand
            for brand in brands {
                let brandCigars = try await cigarService.fetchCigars(by: brand.id)
                cigars.append(contentsOf: brandCigars)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func search(query: String) async {
        guard !query.isEmpty else {
            await loadCigars()
            return
        }
        
        isLoading = true
        do {
            cigars = try await cigarService.searchCigars(query: query)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

/// ViewModel for user's collection
@MainActor
@Observable
final class CollectionViewModel {
    var collection: [CigarCollection] = []
    var isLoading = false
    var errorMessage: String?
    
    private let collectionService = CollectionService.shared
    
    func loadCollection() async {
        isLoading = true
        errorMessage = nil
        
        do {
            collection = try await collectionService.getCollection()
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func addToCollection(cigarId: UUID, quantity: Int = 1) async {
        let item = CigarCollection(cigarId: cigarId, quantity: quantity)
        do {
            try await collectionService.addToCollection(item)
            await loadCollection()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func updateQuantity(_ item: CigarCollection, newQuantity: Int) async {
        var updated = item
        updated.quantity = newQuantity
        do {
            try await collectionService.updateCollection(updated)
            await loadCollection()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func removeFromCollection(_ item: CigarCollection) async {
        do {
            try await collectionService.removeFromCollection(item.id)
            await loadCollection()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

/// ViewModel for tasting notes
@MainActor
@Observable
final class TastingNoteViewModel {
    var notes: [TastingNote] = []
    var isLoading = false
    var errorMessage: String?
    
    private let tastingNoteService = TastingNoteService.shared
    
    func loadNotes(for cigarId: UUID? = nil) async {
        isLoading = true
        errorMessage = nil
        
        do {
            if let cigarId = cigarId {
                notes = try await tastingNoteService.getNotes(for: cigarId)
            } else {
                notes = try await tastingNoteService.getNotes()
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func saveNote(_ note: TastingNote) async {
        do {
            try await tastingNoteService.saveNote(note)
            await loadNotes(for: note.cigarId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func deleteNote(_ note: TastingNote) async {
        do {
            try await tastingNoteService.deleteNote(note.id)
            await loadNotes(for: note.cigarId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
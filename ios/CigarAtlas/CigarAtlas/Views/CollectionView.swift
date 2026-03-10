import SwiftUI

struct CollectionView: View {
    @State private var viewModel = CollectionViewModel()
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading collection...")
                } else if let error = viewModel.errorMessage {
                    ContentUnavailableView(
                        "Error",
                        systemImage: "exclamationmark.triangle",
                        description: Text(error)
                    )
                } else if viewModel.collection.isEmpty {
                    ContentUnavailableView(
                        "Empty Collection",
                        systemImage: "archivebox",
                        description: Text("Your humidor is empty. Add cigars to start tracking your collection.")
                    )
                } else {
                    List {
                        ForEach(viewModel.collection) { item in
                            CollectionRowView(item: item)
                                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                    Button(role: .destructive) {
                                        Task {
                                            await viewModel.removeFromCollection(item)
                                        }
                                    } label: {
                                        Label("Delete", systemImage: "trash")
                                    }
                                }
                        }
                    }
                }
            }
            .navigationTitle("My Collection")
            .task {
                await viewModel.loadCollection()
            }
        }
    }
}

struct CollectionRowView: View {
    let item: CigarCollection
    
    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.brown.opacity(0.2))
                .frame(width: 50, height: 50)
                .overlay {
                    Image(systemName: "smoke.fill")
                        .foregroundStyle(.brown)
                }
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Cigar ID: \(item.cigarId.uuidString.prefix(8))")
                    .font(.headline)
                Text("Quantity: \(item.quantity)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                if let location = item.storageLocation {
                    Label(location, systemImage: "location.fill")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            
            Spacer()
            
            if item.isFavorite {
                Image(systemName: "heart.fill")
                    .foregroundStyle(.red)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    CollectionView()
}
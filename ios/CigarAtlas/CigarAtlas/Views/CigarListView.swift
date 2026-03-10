import SwiftUI

struct CigarListView: View {
    @State private var viewModel = CigarListViewModel()
    @State private var searchText = ""
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading cigars...")
                } else if let error = viewModel.errorMessage {
                    ContentUnavailableView(
                        "Error",
                        systemImage: "exclamationmark.triangle",
                        description: Text(error)
                    )
                } else if viewModel.cigars.isEmpty {
                    ContentUnavailableView(
                        "No Cigars",
                        systemImage: "smoke",
                        description: Text("Start exploring cigars by searching or browsing brands.")
                    )
                } else {
                    List(viewModel.cigars) { cigar in
                        CigarRowView(cigar: cigar)
                    }
                    .searchable(text: $searchText)
                    .onChange(of: searchText) { _, newValue in
                        Task {
                            await viewModel.search(query: newValue)
                        }
                    }
                }
            }
            .navigationTitle("Cigars")
            .task {
                await viewModel.loadCigars()
            }
        }
    }
}

struct CigarRowView: View {
    let cigar: Cigar
    
    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.brown.opacity(0.2))
                .frame(width: 60, height: 60)
                .overlay {
                    Image(systemName: "smoke.fill")
                        .font(.title2)
                        .foregroundStyle(.brown)
                }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(cigar.name)
                    .font(.headline)
                Text(cigar.vitola)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                HStack(spacing: 8) {
                    Label(cigar.strength.displayName, systemImage: "flame.fill")
                        .font(.caption)
                    Text("•")
                    Text("\(cigar.length)\" x \(cigar.ringGauge)")
                        .font(.caption)
                }
                .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            if let rating = cigar.rating {
                Text(String(format: "%.0f", rating))
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.brown)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    CigarListView()
}
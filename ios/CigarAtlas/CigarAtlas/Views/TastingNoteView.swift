import SwiftUI

struct TastingNoteView: View {
    @State private var viewModel = TastingNoteViewModel()
    @State private var showingAddNote = false
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading notes...")
                } else if let error = viewModel.errorMessage {
                    ContentUnavailableView(
                        "Error",
                        systemImage: "exclamationmark.triangle",
                        description: Text(error)
                    )
                } else if viewModel.notes.isEmpty {
                    ContentUnavailableView(
                        "No Tasting Notes",
                        systemImage: "note.text",
                        description: Text("Start recording your cigar experiences by adding tasting notes.")
                    )
                } else {
                    List {
                        ForEach(viewModel.notes) { note in
                            TastingNoteRowView(note: note)
                                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                    Button(role: .destructive) {
                                        Task {
                                            await viewModel.deleteNote(note)
                                        }
                                    } label: {
                                        Label("Delete", systemImage: "trash")
                                    }
                                }
                        }
                    }
                }
            }
            .navigationTitle("Tasting Notes")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingAddNote = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddNote) {
                AddTastingNoteSheet { note in
                    Task {
                        await viewModel.saveNote(note)
                    }
                }
            }
            .task {
                await viewModel.loadNotes()
            }
        }
    }
}

struct TastingNoteRowView: View {
    let note: TastingNote
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(note.date, style: .date)
                    .font(.headline)
                Spacer()
                Text("\(note.rating)")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.brown)
            }
            
            HStack(spacing: 16) {
                RatingBadge(label: "Draw", value: note.draw)
                RatingBadge(label: "Burn", value: note.burn)
                RatingBadge(label: "Flavor", value: note.flavor)
                RatingBadge(label: "Aroma", value: note.aroma)
            }
            
            if !note.notes.isEmpty {
                Text(note.notes)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            
            if let pairedWith = note.pairedWith {
                Label("Paired with: \(pairedWith)", systemImage: "wineglass")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct RatingBadge: View {
    let label: String
    let value: Int
    
    var body: some View {
        VStack(spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text("\(value)/10")
                .font(.caption)
                .fontWeight(.semibold)
        }
    }
}

struct AddTastingNoteSheet: View {
    let onSave: (TastingNote) -> Void
    
    @Environment(\.dismiss) private var dismiss
    @State private var cigarId = UUID()
    @State private var rating = 50
    @State private var draw = 5
    @State private var burn = 5
    @State private var flavor = 5
    @State private var aroma = 5
    @State private var notes = ""
    @State private var pairedWith = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Overall Rating") {
                    HStack {
                        Text("\(rating)")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundStyle(.brown)
                        Spacer()
                        Slider(value: Binding(
                            get: { Double(rating) },
                            set: { rating = Int($0) }
                        ), in: 0...100)
                    }
                }
                
                Section("Detailed Ratings") {
                    HStack {
                        Text("Draw")
                        Spacer()
                        Text("\(draw)/10")
                    }
                    Slider(value: Binding(
                        get: { Double(draw) },
                        set: { draw = Int($0) }
                    ), in: 1...10)
                    
                    HStack {
                        Text("Burn")
                        Spacer()
                        Text("\(burn)/10")
                    }
                    Slider(value: Binding(
                        get: { Double(burn) },
                        set: { burn = Int($0) }
                    ), in: 1...10)
                    
                    HStack {
                        Text("Flavor")
                        Spacer()
                        Text("\(flavor)/10")
                    }
                    Slider(value: Binding(
                        get: { Double(flavor) },
                        set: { flavor = Int($0) }
                    ), in: 1...10)
                    
                    HStack {
                        Text("Aroma")
                        Spacer()
                        Text("\(aroma)/10")
                    }
                    Slider(value: Binding(
                        get: { Double(aroma) },
                        set: { aroma = Int($0) }
                    ), in: 1...10)
                }
                
                Section("Notes") {
                    TextEditor(text: $notes)
                        .frame(height: 100)
                }
                
                Section("Pairing") {
                    TextField("Paired with (drink, food, etc.)", text: $pairedWith)
                }
            }
            .navigationTitle("New Tasting Note")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let note = TastingNote(
                            cigarId: cigarId,
                            rating: rating,
                            draw: draw,
                            burn: burn,
                            flavor: flavor,
                            aroma: aroma,
                            notes: notes,
                            pairedWith: pairedWith.isEmpty ? nil : pairedWith
                        )
                        onSave(note)
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    TastingNoteView()
}
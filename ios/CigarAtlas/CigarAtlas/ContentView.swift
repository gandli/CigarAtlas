import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            Tab("Explore", systemImage: "smoke") {
                CigarListView()
            }
            Tab("Collection", systemImage: "archivebox") {
                CollectionView()
            }
            Tab("Notes", systemImage: "note.text") {
                TastingNoteView()
            }
            Tab("Settings", systemImage: "gearshape") {
                SettingsView()
            }
        }
    }
}

#Preview {
    ContentView()
}
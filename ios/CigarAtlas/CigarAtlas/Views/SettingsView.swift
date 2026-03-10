import SwiftUI

struct SettingsView: View {
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    
    var body: some View {
        NavigationStack {
            List {
                Section("Appearance") {
                    Toggle("Dark Mode", isOn: $isDarkMode)
                }
                
                Section("Notifications") {
                    Toggle("Enable Notifications", isOn: $notificationsEnabled)
                }
                
                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundStyle(.secondary)
                    }
                    
                    Link(destination: URL(string: "https://github.com/gandli/CigarAtlas")!) {
                        HStack {
                            Label("GitHub Repository", systemImage: "link")
                            Spacer()
                            Image(systemName: "arrow.up.right.square")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                
                Section {
                    Link(destination: URL(string: "https://github.com/gandli/CigarAtlas/blob/main/LICENSE")!) {
                        Label("License", systemImage: "doc.text")
                    }
                    
                    Link(destination: URL(string: "https://github.com/gandli/CigarAtlas/blob/main/README.md")!) {
                        Label("Documentation", systemImage: "book")
                    }
                } footer: {
                    Text("CigarAtlas is an open-source project for cigar enthusiasts.")
                        .font(.caption)
                }
            }
            .navigationTitle("Settings")
        }
        .preferredColorScheme(isDarkMode ? .dark : .light)
    }
}

#Preview {
    SettingsView()
}
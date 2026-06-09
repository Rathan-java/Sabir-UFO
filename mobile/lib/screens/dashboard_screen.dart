import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../config.dart';
import '../services/auth_service.dart';
import '../theme.dart';
import 'report_screen.dart';
import 'my_reports_screen.dart';
import 'map_screen.dart';
import 'interviews_screen.dart';
import 'ebook_screen.dart';
import 'admin_screen.dart';
import 'profile_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = AuthService.instance.currentUser;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sabir UFO'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            tooltip: 'Profile',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const ProfileScreen()),
            ),
          ),
        ],
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: FirebaseFirestore.instance.collection('users').doc(user?.uid).snapshots(),
        builder: (context, snap) {
          final data = snap.data?.data() as Map<String, dynamic>?;
          final name = (data?['displayName'] ?? user?.displayName ?? 'Explorer').toString();
          final isAdmin = (data?['role'] ?? '') == 'admin';

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 32),
            children: [
              Text('Welcome back, ${name.split(' ').first}.',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              const Text('Submit a new sighting, browse interviews, or review your past reports.',
                  style: TextStyle(color: SabirUfoTheme.textDim)),
              const SizedBox(height: 24),
              _Card(
                icon: Icons.description_outlined,
                title: 'Report a UFO Sighting',
                body: 'Submit a report with photos, videos, location, and an easy-to-pick category.',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ReportScreen()),
                ),
              ),
              const SizedBox(height: 12),
              _Card(
                icon: Icons.menu_book_outlined,
                title: 'eBook',
                body: 'Get the researcher\'s book on UFO encounters. Purchase via WhatsApp.',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const EbookScreen()),
                ),
              ),
              const SizedBox(height: 12),
              _Card(
                icon: Icons.play_circle_outline,
                title: 'UFO Interviews',
                body: 'Watch curated YouTube interviews with pilots, witnesses, and investigators.',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const InterviewsScreen()),
                ),
              ),
              const SizedBox(height: 24),
              const Divider(height: 1, color: SabirUfoTheme.border),
              const SizedBox(height: 16),
              _Card(
                icon: Icons.folder_outlined,
                title: 'My Reports',
                body: 'Track the status of every sighting you have submitted.',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const MyReportsScreen()),
                ),
              ),
              const SizedBox(height: 12),
              _Card(
                icon: Icons.map_outlined,
                title: 'Sightings Map',
                body: 'See public sightings reported across India.',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const MapScreen()),
                ),
              ),
              if (isAdmin) ...[
                const SizedBox(height: 12),
                _Card(
                  icon: Icons.shield_outlined,
                  title: 'Admin Console',
                  body: 'Review every incoming report.',
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const AdminScreen()),
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}

class _Card extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;
  final VoidCallback onTap;
  const _Card({required this.icon, required this.title, required this.body, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: SabirUfoTheme.panel,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            border: Border.all(color: SabirUfoTheme.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: SabirUfoTheme.accent.withOpacity(0.08),
                  border: Border.all(color: SabirUfoTheme.accent.withOpacity(0.18)),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(icon, color: SabirUfoTheme.accent, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 3),
                    Text(body, style: const TextStyle(color: SabirUfoTheme.textDim, fontSize: 13, height: 1.4)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: SabirUfoTheme.textFaint, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}

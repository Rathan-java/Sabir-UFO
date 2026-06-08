import 'package:flutter/material.dart';
import '../models/sighting.dart';
import '../services/auth_service.dart';
import '../services/sightings_service.dart';
import '../widgets/sighting_tile.dart';
import 'report_screen.dart';

class MyReportsScreen extends StatelessWidget {
  const MyReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.instance.currentUser!.uid;
    return Scaffold(
      appBar: AppBar(title: const Text('My Reports')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const ReportScreen()),
        ),
        icon: const Icon(Icons.add),
        label: const Text('New sighting'),
      ),
      body: StreamBuilder<List<Sighting>>(
        stream: SightingsService.instance.streamMine(uid),
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(child: Text('Error: ${snap.error}'));
          }
          final rows = snap.data ?? const [];
          if (rows.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text('No reports yet. Tap + to file your first sighting.',
                    textAlign: TextAlign.center),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.only(top: 8, bottom: 80),
            itemCount: rows.length,
            itemBuilder: (_, i) => SightingTile(s: rows[i]),
          );
        },
      ),
    );
  }
}

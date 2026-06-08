import 'package:flutter/material.dart';

import '../config.dart';
import '../models/sighting.dart';
import '../services/sightings_service.dart';
import '../widgets/sighting_tile.dart';
import '../theme.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});
  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  String _search = '';
  String _status = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Console')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(children: [
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(hintText: 'Search…', isDense: true),
                  onChanged: (v) => setState(() => _search = v.trim().toLowerCase()),
                ),
              ),
              const SizedBox(width: 8),
              DropdownButton<String>(
                value: _status.isEmpty ? null : _status,
                hint: const Text('Status'),
                dropdownColor: SabirUfoTheme.bg1,
                items: [
                  const DropdownMenuItem(value: '', child: Text('All')),
                  ...AppConfig.statuses.map((s) => DropdownMenuItem(value: s, child: Text(s))),
                ],
                onChanged: (v) => setState(() => _status = v ?? ''),
              ),
            ]),
          ),
          Expanded(
            child: StreamBuilder<List<Sighting>>(
              stream: SightingsService.instance.streamAll(),
              builder: (context, snap) {
                if (!snap.hasData) return const Center(child: CircularProgressIndicator());
                final rows = snap.data!.where((s) {
                  if (_status.isNotEmpty && s.status != _status) return false;
                  if (_search.isEmpty) return true;
                  final blob = '${s.description} ${s.reporterName} ${s.reporterEmail} ${s.classification} ${s.location.place}'.toLowerCase();
                  return blob.contains(_search);
                }).toList();
                if (rows.isEmpty) return const Center(child: Text('No matching sightings.'));
                return ListView.builder(
                  itemCount: rows.length,
                  itemBuilder: (_, i) {
                    final s = rows[i];
                    return SightingTile(
                      s: s,
                      showReporter: true,
                      trailing: TextButton.icon(
                        icon: const Icon(Icons.edit, size: 16),
                        label: const Text('Review'),
                        onPressed: () => _openEditor(s),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _openEditor(Sighting s) {
    String status = s.status;
    final notes = TextEditingController(text: s.adminNotes);
    showModalBottomSheet(
      context: context,
      backgroundColor: SabirUfoTheme.bg1,
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: EdgeInsets.only(
          left: 20, right: 20, top: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: StatefulBuilder(builder: (context, setS) => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Review sighting', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: status,
              decoration: const InputDecoration(labelText: 'STATUS'),
              items: AppConfig.statuses.map((x) => DropdownMenuItem(value: x, child: Text(x))).toList(),
              onChanged: (v) => setS(() => status = v ?? status),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: notes, maxLines: 3,
              decoration: const InputDecoration(labelText: 'PRIVATE NOTES'),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () async {
                await SightingsService.instance.updateStatus(s.id, status, notes.text.trim());
                if (mounted) Navigator.pop(context);
              },
              child: const Text('Save'),
            ),
          ],
        )),
      ),
    );
  }
}

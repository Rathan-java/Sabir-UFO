import 'dart:io';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';

import '../config.dart';
import '../services/auth_service.dart';
import '../services/media_service.dart';
import '../services/sightings_service.dart';
import '../theme.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});
  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  String _classification = AppConfig.classifications.first;
  String _shape = 'Light';
  final _desc = TextEditingController();
  final _place = TextEditingController();
  final _duration = TextEditingController();
  int _witnesses = 1;
  DateTime _sightedAt = DateTime.now();
  double? _lat;
  double? _lng;
  bool _public = false;
  bool _submitting = false;
  final List<File> _files = [];

  Future<void> _pickFiles() async {
    final picker = ImagePicker();
    final picked = await picker.pickMultipleMedia();
    setState(() {
      for (final f in picked) {
        if (_files.length < 10) _files.add(File(f.path));
      }
    });
  }

  Future<void> _captureLocation() async {
    try {
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) perm = await Geolocator.requestPermission();
      if (perm == LocationPermission.deniedForever) {
        _toast('Location permission denied'); return;
      }
      final p = await Geolocator.getCurrentPosition();
      setState(() { _lat = p.latitude; _lng = p.longitude; });
      _toast('Location captured');
    } catch (e) {
      _toast('Location failed: $e');
    }
  }

  Future<void> _submit() async {
    if (_desc.text.trim().isEmpty) { _toast('Description is required'); return; }
    setState(() => _submitting = true);
    try {
      final media = <Map<String, dynamic>>[];
      for (final f in _files) {
        final r = await MediaService.instance.upload(f);
        media.add({'url': r.url, 'type': r.type});
      }
      final user = AuthService.instance.currentUser!;
      await SightingsService.instance.create({
        'reporterUid': user.uid,
        'reporterName': user.displayName ?? (user.email?.split('@').first ?? 'Anonymous'),
        'reporterEmail': user.email ?? '',
        'isPublic': _public,
        'classification': _classification,
        'objectShape': _shape,
        'witnessCount': _witnesses,
        'sightedAt': _sightedAt.millisecondsSinceEpoch,
        'durationText': _duration.text.trim(),
        'location': {'lat': _lat, 'lng': _lng, 'place': _place.text.trim()},
        'description': _desc.text.trim(),
        'media': media,
        'status': 'pending',
        'adminNotes': '',
      });
      if (mounted) {
        _toast('Sighting submitted');
        Navigator.of(context).pop();
      }
    } catch (e) {
      _toast('Failed: $e');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _toast(String s) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(s)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Report a sighting')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DropdownButtonFormField<String>(
            value: _classification,
            decoration: const InputDecoration(labelText: 'CLASSIFICATION *'),
            items: AppConfig.classifications
                .map((c) => DropdownMenuItem(value: c, child: Text(c, overflow: TextOverflow.ellipsis)))
                .toList(),
            onChanged: (v) => setState(() => _classification = v ?? _classification),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _shape,
            decoration: const InputDecoration(labelText: 'OBJECT SHAPE'),
            items: AppConfig.objectShapes.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
            onChanged: (v) => setState(() => _shape = v ?? _shape),
          ),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
              child: OutlinedButton.icon(
                icon: const Icon(Icons.event),
                label: Text('Sighted: ${_sightedAt.toString().substring(0, 16)}'),
                onPressed: () async {
                  final d = await showDatePicker(
                    context: context, firstDate: DateTime(2000), lastDate: DateTime.now(),
                    initialDate: _sightedAt,
                  );
                  if (d == null) return;
                  final t = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(_sightedAt));
                  setState(() => _sightedAt = DateTime(d.year, d.month, d.day, t?.hour ?? 0, t?.minute ?? 0));
                },
              ),
            ),
          ]),
          const SizedBox(height: 12),
          TextField(controller: _duration, decoration: const InputDecoration(labelText: 'DURATION  (e.g. ~3 min)')),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
              child: TextField(
                decoration: const InputDecoration(labelText: 'WITNESSES'),
                keyboardType: TextInputType.number,
                controller: TextEditingController(text: _witnesses.toString()),
                onChanged: (v) => _witnesses = int.tryParse(v) ?? 1,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(controller: _place, decoration: const InputDecoration(labelText: 'PLACE')),
            ),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
              child: Text(
                _lat == null
                    ? 'No coordinates'
                    : '${_lat!.toStringAsFixed(4)}, ${_lng!.toStringAsFixed(4)}',
                style: const TextStyle(color: SabirUfoTheme.textDim),
              ),
            ),
            OutlinedButton.icon(
              icon: const Icon(Icons.my_location),
              label: const Text('Use my location'),
              onPressed: _captureLocation,
            ),
          ]),
          const SizedBox(height: 12),
          TextField(
            controller: _desc,
            maxLines: 6,
            maxLength: 5000,
            decoration: const InputDecoration(labelText: 'DESCRIPTION *'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            icon: const Icon(Icons.attachment),
            label: Text('Add photos / videos (${_files.length}/10)'),
            onPressed: _pickFiles,
          ),
          if (_files.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Wrap(
                spacing: 8, runSpacing: 8,
                children: _files.asMap().entries.map((e) {
                  return Stack(children: [
                    Container(
                      width: 80, height: 80,
                      decoration: BoxDecoration(
                        border: Border.all(color: SabirUfoTheme.border),
                        borderRadius: BorderRadius.circular(8),
                        image: DecorationImage(image: FileImage(e.value), fit: BoxFit.cover),
                      ),
                    ),
                    Positioned(top: 0, right: 0, child: GestureDetector(
                      onTap: () => setState(() => _files.removeAt(e.key)),
                      child: const CircleAvatar(
                        radius: 10, backgroundColor: Colors.black87,
                        child: Icon(Icons.close, size: 12, color: Colors.white),
                      ),
                    )),
                  ]);
                }).toList(),
              ),
            ),
          const SizedBox(height: 12),
          SwitchListTile(
            value: _public,
            onChanged: (v) => setState(() => _public = v),
            title: const Text('Show on public map with my name'),
            subtitle: const Text('Off by default — your report stays admin-only.',
                style: TextStyle(color: SabirUfoTheme.textFaint, fontSize: 12)),
            tileColor: SabirUfoTheme.bg1,
            shape: RoundedRectangleBorder(
              side: const BorderSide(color: SabirUfoTheme.border),
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            child: Text(_submitting ? 'Submitting…' : 'Submit sighting'),
          ),
        ],
      ),
    );
  }
}

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../models/sighting.dart';
import '../services/auth_service.dart';
import '../services/sightings_service.dart';
import '../theme.dart';

class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.instance.currentUser?.uid;
    return Scaffold(
      appBar: AppBar(title: const Text('Sightings Map')),
      body: FutureBuilder<bool>(
        future: _isAdmin(uid),
        builder: (context, adminSnap) {
          final isAdmin = adminSnap.data == true;
          final stream = isAdmin
              ? SightingsService.instance.streamAll()
              : SightingsService.instance.streamPublic();
          return StreamBuilder<List<Sighting>>(
            stream: stream,
            builder: (context, snap) {
              final rows = (snap.data ?? const [])
                  .where((s) => s.location.lat != null && s.location.lng != null)
                  .toList();

              return FlutterMap(
                options: const MapOptions(
                  initialCenter: LatLng(20, 0),
                  initialZoom: 2,
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.sabir.ufo.mobile',
                  ),
                  MarkerLayer(
                    markers: rows.map((s) => Marker(
                      point: LatLng(s.location.lat!, s.location.lng!),
                      width: 22, height: 22,
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const RadialGradient(
                            colors: [SabirUfoTheme.cyan, SabirUfoTheme.violet],
                          ),
                          boxShadow: [
                            BoxShadow(color: SabirUfoTheme.cyan.withOpacity(0.6), blurRadius: 8),
                          ],
                          border: Border.all(color: Colors.white70, width: 1),
                        ),
                      ),
                    )).toList(),
                  ),
                  if (rows.isEmpty)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Text('No sightings with coordinates yet.',
                            style: TextStyle(color: Colors.white70)),
                      ),
                    ),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Future<bool> _isAdmin(String? uid) async {
    if (uid == null) return false;
    final snap = await FirebaseFirestore.instance.collection('users').doc(uid).get();
    return (snap.data()?['role'] ?? '') == 'admin';
  }
}

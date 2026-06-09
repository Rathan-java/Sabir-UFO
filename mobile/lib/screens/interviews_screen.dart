import 'package:cached_network_image/cached_network_image.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme.dart';

class InterviewsScreen extends StatelessWidget {
  const InterviewsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Interviews by Sabir Hussain')),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('interviews').orderBy('order').snapshots(),
        builder: (context, snap) {
          if (!snap.hasData) return const Center(child: CircularProgressIndicator());
          final docs = snap.data!.docs;
          if (docs.isEmpty) {
            return const Center(child: Text('No interviews published yet.'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: docs.length,
            itemBuilder: (_, i) {
              final d = docs[i].data() as Map<String, dynamic>;
              final id = (d['youtubeId'] ?? '').toString();
              final title = (d['title'] ?? 'Untitled').toString();
              final thumb = 'https://img.youtube.com/vi/$id/hqdefault.jpg';
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Material(
                  color: SabirUfoTheme.panel.withOpacity(0.55),
                  borderRadius: BorderRadius.circular(14),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: () => launchUrl(
                      Uri.parse('https://www.youtube.com/watch?v=$id'),
                      mode: LaunchMode.externalApplication,
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: SabirUfoTheme.border),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          AspectRatio(
                            aspectRatio: 16 / 9,
                            child: Stack(fit: StackFit.expand, children: [
                              CachedNetworkImage(imageUrl: thumb, fit: BoxFit.cover,
                                  errorWidget: (_, __, ___) => Container(color: SabirUfoTheme.bg2)),
                              Container(color: Colors.black.withOpacity(0.3)),
                              const Icon(Icons.play_circle_fill, size: 56, color: Colors.white),
                            ]),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(14),
                            child: Text(title,
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

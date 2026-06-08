import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/sighting.dart';
import '../theme.dart';

Color statusColor(String s) {
  switch (s) {
    case 'verified': return SabirUfoTheme.green;
    case 'reviewed': return SabirUfoTheme.cyan;
    case 'rejected': return SabirUfoTheme.red;
    default: return SabirUfoTheme.amber;
  }
}

class SightingTile extends StatelessWidget {
  final Sighting s;
  final bool showReporter;
  final Widget? trailing;
  const SightingTile({super.key, required this.s, this.showReporter = false, this.trailing});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat.yMMMd().add_jm();
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SabirUfoTheme.panel.withOpacity(0.55),
        border: Border.all(color: SabirUfoTheme.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _badge(s.classification.isEmpty ? '—' : s.classification, SabirUfoTheme.violet),
              const SizedBox(width: 6),
              _badge(s.status.toUpperCase(), statusColor(s.status)),
              if (s.isPublic) ...[const SizedBox(width: 6), _badge('PUBLIC', SabirUfoTheme.green)],
            ],
          ),
          const SizedBox(height: 8),
          if (showReporter)
            Text('${s.reporterName} · ${s.reporterEmail}',
                style: const TextStyle(color: SabirUfoTheme.textFaint, fontSize: 12)),
          Text(
            '${s.objectShape.isEmpty ? '—' : s.objectShape} · '
            '${s.witnessCount} witness${s.witnessCount == 1 ? '' : 'es'} · '
            '${s.location.place.isNotEmpty ? s.location.place : (s.location.lat != null ? "${s.location.lat!.toStringAsFixed(2)}, ${s.location.lng!.toStringAsFixed(2)}" : "no location")}',
            style: const TextStyle(color: SabirUfoTheme.textDim, fontSize: 12),
          ),
          const SizedBox(height: 8),
          Text(s.description),
          if (s.media.isNotEmpty) ...[
            const SizedBox(height: 10),
            SizedBox(
              height: 90,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: s.media.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final m = s.media[i];
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: m.type == 'video'
                        ? Container(
                            width: 90, height: 90, color: SabirUfoTheme.bg2,
                            alignment: Alignment.center,
                            child: const Icon(Icons.play_circle_outline, color: SabirUfoTheme.cyan, size: 36),
                          )
                        : CachedNetworkImage(
                            imageUrl: m.url, width: 90, height: 90, fit: BoxFit.cover,
                            placeholder: (_, __) => Container(color: SabirUfoTheme.bg2),
                          ),
                  );
                },
              ),
            ),
          ],
          if (s.adminNotes.isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: SabirUfoTheme.cyan.withOpacity(0.06),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('Researcher notes: ${s.adminNotes}',
                  style: const TextStyle(fontSize: 12)),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              Text(fmt.format(s.sightedAt ?? DateTime.fromMillisecondsSinceEpoch(0)),
                  style: const TextStyle(color: SabirUfoTheme.textFaint, fontSize: 11)),
              const Spacer(),
              if (trailing != null) trailing!,
            ],
          ),
        ],
      ),
    );
  }

  Widget _badge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        border: Border.all(color: color),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Text(text,
          style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.8)),
    );
  }
}

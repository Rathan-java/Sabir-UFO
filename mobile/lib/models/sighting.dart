import 'package:cloud_firestore/cloud_firestore.dart';

class MediaItem {
  final String url;
  final String type; // 'image' | 'video'
  MediaItem({required this.url, required this.type});
  Map<String, dynamic> toMap() => {'url': url, 'type': type};
  factory MediaItem.fromMap(Map m) =>
      MediaItem(url: (m['url'] ?? '').toString(), type: (m['type'] ?? 'image').toString());
}

class GeoPoint2 {
  final double? lat;
  final double? lng;
  final String place;
  GeoPoint2({this.lat, this.lng, this.place = ''});
  Map<String, dynamic> toMap() => {'lat': lat, 'lng': lng, 'place': place};
  factory GeoPoint2.fromMap(Map? m) => GeoPoint2(
    lat: (m?['lat'] as num?)?.toDouble(),
    lng: (m?['lng'] as num?)?.toDouble(),
    place: (m?['place'] ?? '').toString(),
  );
}

class Sighting {
  final String id;
  final String reporterUid;
  final String reporterName;
  final String reporterEmail;
  final bool isPublic;
  final String classification;
  final String objectShape;
  final int witnessCount;
  final DateTime? sightedAt;
  final String durationText;
  final GeoPoint2 location;
  final String description;
  final List<MediaItem> media;
  final String status;
  final String adminNotes;
  final DateTime? createdAt;

  Sighting({
    required this.id,
    required this.reporterUid,
    required this.reporterName,
    required this.reporterEmail,
    required this.isPublic,
    required this.classification,
    required this.objectShape,
    required this.witnessCount,
    required this.sightedAt,
    required this.durationText,
    required this.location,
    required this.description,
    required this.media,
    required this.status,
    required this.adminNotes,
    required this.createdAt,
  });

  factory Sighting.fromDoc(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    DateTime? toDate(dynamic v) {
      if (v == null) return null;
      if (v is Timestamp) return v.toDate();
      if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
      if (v is String) return DateTime.tryParse(v);
      return null;
    }
    return Sighting(
      id: doc.id,
      reporterUid: (d['reporterUid'] ?? '').toString(),
      reporterName: (d['reporterName'] ?? '').toString(),
      reporterEmail: (d['reporterEmail'] ?? '').toString(),
      isPublic: d['isPublic'] == true,
      classification: (d['classification'] ?? '').toString(),
      objectShape: (d['objectShape'] ?? '').toString(),
      witnessCount: (d['witnessCount'] as num?)?.toInt() ?? 1,
      sightedAt: toDate(d['sightedAt']),
      durationText: (d['durationText'] ?? '').toString(),
      location: GeoPoint2.fromMap(d['location'] as Map?),
      description: (d['description'] ?? '').toString(),
      media: ((d['media'] as List?) ?? const [])
          .whereType<Map>()
          .map(MediaItem.fromMap)
          .toList(),
      status: (d['status'] ?? 'pending').toString(),
      adminNotes: (d['adminNotes'] ?? '').toString(),
      createdAt: toDate(d['createdAt']),
    );
  }
}

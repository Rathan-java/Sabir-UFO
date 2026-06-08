import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/sighting.dart';

class SightingsService {
  SightingsService._();
  static final SightingsService instance = SightingsService._();
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _col => _db.collection('sightings');

  Future<String> create(Map<String, dynamic> data) async {
    final ref = await _col.add({
      ...data,
      'createdAt': FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  Stream<List<Sighting>> streamMine(String uid) {
    return _col
        .where('reporterUid', isEqualTo: uid)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((s) => s.docs.map(Sighting.fromDoc).toList());
  }

  Stream<List<Sighting>> streamAll() {
    return _col
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((s) => s.docs.map(Sighting.fromDoc).toList());
  }

  Stream<List<Sighting>> streamPublic() {
    return _col
        .where('isPublic', isEqualTo: true)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((s) => s.docs.map(Sighting.fromDoc).toList());
  }

  Future<void> updateStatus(String id, String status, String notes) {
    return _col.doc(id).update({'status': status, 'adminNotes': notes});
  }
}

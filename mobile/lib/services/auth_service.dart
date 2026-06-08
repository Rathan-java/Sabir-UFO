import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../config.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final GoogleSignIn _google = GoogleSignIn();

  Stream<User?> get userStream => _auth.authStateChanges();
  User? get currentUser => _auth.currentUser;

  Future<UserCredential?> signInWithGoogle() async {
    final acct = await _google.signIn();
    if (acct == null) return null; // user cancelled
    final googleAuth = await acct.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    final cred = await _auth.signInWithCredential(credential);
    await _ensureProfile(cred.user);
    return cred;
  }

  Future<void> signOut() async {
    await _google.signOut();
    await _auth.signOut();
  }

  Future<Map<String, dynamic>?> loadProfile(String uid) async {
    final snap = await _db.collection('users').doc(uid).get();
    return snap.exists ? snap.data() : null;
  }

  Future<void> updateDisplayName(String uid, String name) async {
    await _db.collection('users').doc(uid).update({'displayName': name});
  }

  Future<void> _ensureProfile(User? user) async {
    if (user == null) return;
    final ref = _db.collection('users').doc(user.uid);
    final snap = await ref.get();
    final email = (user.email ?? '').toLowerCase();
    final shouldBeAdmin = AppConfig.adminEmail.isNotEmpty &&
        email == AppConfig.adminEmail.toLowerCase();
    if (!snap.exists) {
      await ref.set({
        'displayName': user.displayName ?? (user.email?.split('@').first ?? 'Explorer'),
        'email': user.email ?? '',
        'photoURL': user.photoURL ?? '',
        'role': shouldBeAdmin ? 'admin' : 'user',
        'createdAt': FieldValue.serverTimestamp(),
      });
    } else if (shouldBeAdmin && snap.data()?['role'] != 'admin') {
      await ref.update({'role': 'admin'});
    }
  }
}

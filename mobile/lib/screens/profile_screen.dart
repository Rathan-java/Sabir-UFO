import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../services/auth_service.dart';
import '../theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _name = TextEditingController();
  bool _saving = false;
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final uid = AuthService.instance.currentUser?.uid;
    if (uid == null) return;
    final p = await AuthService.instance.loadProfile(uid);
    _name.text = (p?['displayName'] ?? '').toString();
    setState(() => _loaded = true);
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthService.instance.currentUser;
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: !_loaded
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundImage: user?.photoURL != null ? NetworkImage(user!.photoURL!) : null,
                      backgroundColor: SabirUfoTheme.violet,
                      child: user?.photoURL == null
                          ? const Icon(Icons.person, size: 36, color: Colors.white)
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_name.text, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text(user?.email ?? '', style: const TextStyle(color: SabirUfoTheme.textFaint, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: _name,
                  decoration: const InputDecoration(labelText: 'DISPLAY NAME'),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: TextEditingController(text: user?.email ?? ''),
                  enabled: false,
                  decoration: const InputDecoration(labelText: 'GOOGLE EMAIL'),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _saving
                      ? null
                      : () async {
                          setState(() => _saving = true);
                          try {
                            await AuthService.instance.updateDisplayName(user!.uid, _name.text.trim());
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Saved')),
                              );
                            }
                          } finally {
                            if (mounted) setState(() => _saving = false);
                          }
                        },
                  child: Text(_saving ? 'Saving…' : 'Save changes'),
                ),
                const SizedBox(height: 8),
                OutlinedButton(
                  onPressed: () async {
                    await AuthService.instance.signOut();
                    if (mounted) Navigator.of(context).popUntil((r) => r.isFirst);
                  },
                  child: const Text('Sign out'),
                ),
              ],
            ),
    );
  }
}

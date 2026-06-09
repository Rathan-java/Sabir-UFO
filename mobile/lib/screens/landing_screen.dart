import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../theme.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            colors: [Color(0xFF1A0D40), SabirUfoTheme.bg0],
            radius: 1.0,
            center: Alignment(0, -0.4),
          ),
        ),
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 64, height: 64,
                    decoration: BoxDecoration(
                      color: SabirUfoTheme.accent.withOpacity(0.08),
                      border: Border.all(color: SabirUfoTheme.accent.withOpacity(0.25)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.travel_explore, size: 32, color: SabirUfoTheme.accent),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Sabir UFO',
                    style: TextStyle(
                      fontSize: 36, fontWeight: FontWeight.w700,
                      letterSpacing: 0, color: SabirUfoTheme.text,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Sighting & Research',
                    style: TextStyle(color: SabirUfoTheme.textDim, letterSpacing: 3),
                  ),
                  const SizedBox(height: 28),
                  const Text(
                    'India\'s serious archive for people who have seen something they cannot explain. Report what you witnessed and contribute to ongoing investigation.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: SabirUfoTheme.textDim, fontSize: 15, height: 1.5),
                  ),
                  const SizedBox(height: 36),
                  FilledButton.icon(
                    onPressed: () async {
                      try {
                        await AuthService.instance.signInWithGoogle();
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Sign-in failed: $e')),
                          );
                        }
                      }
                    },
                    icon: const Icon(Icons.login),
                    label: const Text('Continue with Google'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

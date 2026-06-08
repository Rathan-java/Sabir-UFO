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
                  const Text('🛸', style: TextStyle(fontSize: 60)),
                  const SizedBox(height: 16),
                  ShaderMask(
                    shaderCallback: (b) => const LinearGradient(
                      colors: [Colors.white, SabirUfoTheme.cyan, SabirUfoTheme.violet],
                    ).createShader(b),
                    child: const Text(
                      'Sabir UFO',
                      style: TextStyle(
                        fontSize: 44, fontWeight: FontWeight.w700,
                        letterSpacing: 3, color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Sighting & Research',
                    style: TextStyle(color: SabirUfoTheme.textDim, letterSpacing: 3),
                  ),
                  const SizedBox(height: 28),
                  const Text(
                    'A serious, witness-driven archive of the modern UAP phenomenon.',
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

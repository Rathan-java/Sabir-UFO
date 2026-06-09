import 'package:flutter/material.dart';

/// Restrained dark theme — research/investigative feel.
/// Single muted steel-blue accent. No neon, no rainbow gradients.
class SabirUfoTheme {
  static const Color bg0 = Color(0xFF0A0D14);
  static const Color bg1 = Color(0xFF0F131C);
  static const Color bg2 = Color(0xFF161B27);
  static const Color panel = Color(0xFF141A28);
  static const Color text = Color(0xFFE6EBF5);
  static const Color textDim = Color(0xFF98A0B3);
  static const Color textFaint = Color(0xFF6B7388);
  // Aliases kept so existing references stay valid; all map to the
  // new muted palette. There is no real cyan/violet/magenta anymore.
  static const Color accent = Color(0xFF6AA6E0);       // muted steel-blue
  static const Color accentDim = Color(0xFF4A82BD);
  static const Color cyan = accent;                    // alias
  static const Color violet = Color(0xFF8A7EC4);       // muted
  static const Color magenta = Color(0xFFD97A8A);      // muted (red-ish)
  static const Color green = Color(0xFF7FC59A);
  static const Color amber = Color(0xFFD6B170);
  static const Color red = Color(0xFFD97A8A);
  static const Color border = Color(0x1AC8D5F0); // ~0.10 alpha cool-grey

  static ThemeData build() {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: bg0,
      colorScheme: const ColorScheme.dark(
        primary: accent,
        secondary: violet,
        surface: bg1,
        onSurface: text,
        error: red,
      ),
      textTheme: base.textTheme.apply(
        bodyColor: text,
        displayColor: text,
        fontFamily: 'Roboto',
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bg1,
        foregroundColor: text,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: TextStyle(
          fontWeight: FontWeight.w700, fontSize: 18, letterSpacing: 0.6, color: text,
        ),
      ),
      cardTheme: CardTheme(
        color: panel.withOpacity(0.55),
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: border),
          borderRadius: BorderRadius.circular(14),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: bg0,
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: text,
          side: const BorderSide(color: border),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: bg1,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: accent, width: 1.5),
        ),
        labelStyle: const TextStyle(color: textDim, letterSpacing: 1.4),
      ),
      dividerColor: border,
      iconTheme: const IconThemeData(color: text),
    );
  }
}

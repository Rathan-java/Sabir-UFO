import 'package:flutter/material.dart';

/// Cosmic dark theme — neon cyan/violet on deep space.
class SabirUfoTheme {
  static const Color bg0 = Color(0xFF04060F);
  static const Color bg1 = Color(0xFF070B1A);
  static const Color bg2 = Color(0xFF0C1230);
  static const Color panel = Color(0xFF0D1330);
  static const Color text = Color(0xFFE7ECFF);
  static const Color textDim = Color(0xFF9AA3C7);
  static const Color textFaint = Color(0xFF6B7299);
  static const Color cyan = Color(0xFF7BE9FF);
  static const Color violet = Color(0xFFA06BFF);
  static const Color magenta = Color(0xFFFF6BD6);
  static const Color green = Color(0xFF6BFFB3);
  static const Color amber = Color(0xFFFFCF6B);
  static const Color red = Color(0xFFFF6B8A);
  static const Color border = Color(0x2E7BE9FF); // ~0.18 alpha

  static ThemeData build() {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: bg0,
      colorScheme: const ColorScheme.dark(
        primary: cyan,
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
          backgroundColor: cyan,
          foregroundColor: bg1,
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
          borderSide: const BorderSide(color: cyan, width: 1.5),
        ),
        labelStyle: const TextStyle(color: textDim, letterSpacing: 1.4),
      ),
      dividerColor: border,
      iconTheme: const IconThemeData(color: text),
    );
  }
}

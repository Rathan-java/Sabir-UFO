/// Sabir UFO — central config for the mobile app.
/// Fill these in to match your Firebase project + admin info.
class AppConfig {
  /// Email that gets admin role on first sign-in.
  static const String adminEmail = 'admin@example.com';

  /// WhatsApp number for eBook purchase (international, digits only).
  static const String adminWhatsApp = '919876543210';

  /// Cloudinary unsigned upload (free tier).
  static const String cloudinaryCloudName = 'your-cloud-name';
  static const String cloudinaryUploadPreset = 'sabir_ufo_unsigned';

  /// Full Hynek/Vallée classification scale.
  static const List<String> classifications = [
    'Nocturnal Lights',
    'Daylight Discs',
    'Radar–Visual',
    'Close Encounter of the First Kind (CE-1)',
    'Close Encounter of the Second Kind (CE-2)',
    'Close Encounter of the Third Kind (CE-3)',
    'Close Encounter of the Fourth Kind (CE-4 — abduction)',
    'Close Encounter of the Fifth Kind (CE-5 — direct communication)',
    'Other / Unknown',
  ];

  static const List<String> objectShapes = [
    'Disc', 'Triangle', 'Sphere', 'Cigar', 'Cluster', 'Light', 'Other',
  ];

  static const List<String> statuses = ['pending', 'reviewed', 'verified', 'rejected'];
}

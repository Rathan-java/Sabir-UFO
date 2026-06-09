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

  /// Sighting categories — plain-language labels for first-time reporters.
  /// Technical name first, followed by a short description anyone can understand.
  static const List<String> classifications = [
    'Nocturnal Lights (Glowing lights or ball-shaped UFO seen at night)',
    'Daylight Discs (Disc or saucer-shaped UFO seen in daylight)',
    'Radar-Visual (UFO seen with eyes AND picked up on radar)',
    'Close Encounter of the First Kind (Saw a UFO up close, no contact)',
    'Close Encounter of the Second Kind (UFO left physical traces — burn marks, ground impressions, electrical interference)',
    'Close Encounter of the Third Kind (Saw beings or creatures near the UFO)',
    'Close Encounter of the Fourth Kind (Felt taken aboard or abducted)',
    'Close Encounter of the Fifth Kind (Communicated directly with beings)',
    'Other / Not sure',
  ];

  static const List<String> objectShapes = [
    'Disc (saucer-shaped)',
    'Triangle (triangular)',
    'Sphere (round / ball)',
    'Cigar (long, tube-shaped)',
    'Cluster (group of small UFOs together)',
    'Light (just a point or ball of light)',
    'Other',
  ];

  static const List<String> statuses = ['pending', 'reviewed', 'verified', 'rejected'];
}

import 'dart:io';
import 'package:http/http.dart' as http;
import '../config.dart';

class UploadResult {
  final String url;
  final String type; // image | video
  UploadResult(this.url, this.type);
}

/// Single upload abstraction. Uses Cloudinary unsigned upload (free).
/// Swap to Firebase Storage by changing the implementation here only.
class MediaService {
  MediaService._();
  static final MediaService instance = MediaService._();

  Future<UploadResult> upload(File file) async {
    final isVideo = _isVideo(file.path);
    final endpoint = Uri.parse(
      'https://api.cloudinary.com/v1_1/${AppConfig.cloudinaryCloudName}/${isVideo ? 'video' : 'image'}/upload',
    );
    final req = http.MultipartRequest('POST', endpoint)
      ..fields['upload_preset'] = AppConfig.cloudinaryUploadPreset
      ..files.add(await http.MultipartFile.fromPath('file', file.path));
    final streamed = await req.send();
    final res = await http.Response.fromStream(streamed);
    if (res.statusCode >= 400) {
      throw Exception('Upload failed: ${res.statusCode} ${res.body}');
    }
    final body = res.body;
    final url = RegExp(r'"secure_url"\s*:\s*"([^"]+)"').firstMatch(body)?.group(1);
    if (url == null) throw Exception('No secure_url in response');
    return UploadResult(url, isVideo ? 'video' : 'image');
  }

  bool _isVideo(String path) {
    final ext = path.toLowerCase().split('.').last;
    return ['mp4', 'mov', 'webm', 'mkv', 'm4v'].contains(ext);
  }
}

import 'package:cached_network_image/cached_network_image.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config.dart';
import '../theme.dart';

class EbookScreen extends StatelessWidget {
  const EbookScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('eBook')),
      body: FutureBuilder<DocumentSnapshot>(
        future: FirebaseFirestore.instance.collection('ebook').doc('config').get(),
        builder: (context, snap) {
          final data = (snap.data?.data() as Map<String, dynamic>?) ?? {
            'title': 'eBook coming soon',
            'blurb': 'Details will appear here once the admin publishes them.',
            'price': '',
            'coverImageUrl': '',
          };
          final title = (data['title'] ?? '').toString();
          final blurb = (data['blurb'] ?? '').toString();
          final price = (data['price'] ?? '').toString();
          final cover = (data['coverImageUrl'] ?? '').toString();

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              if (cover.isNotEmpty)
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: AspectRatio(
                    aspectRatio: 2 / 3,
                    child: CachedNetworkImage(imageUrl: cover, fit: BoxFit.cover),
                  ),
                ),
              const SizedBox(height: 20),
              Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
              if (price.isNotEmpty) ...[
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: SabirUfoTheme.violet.withOpacity(0.12),
                    border: Border.all(color: SabirUfoTheme.violet),
                    borderRadius: BorderRadius.circular(99),
                  ),
                  child: Text(price, style: const TextStyle(color: SabirUfoTheme.violet, fontWeight: FontWeight.w600)),
                ),
              ],
              const SizedBox(height: 14),
              Text(blurb, style: const TextStyle(color: SabirUfoTheme.textDim, height: 1.5)),
              const SizedBox(height: 24),
              FilledButton.icon(
                icon: const Icon(Icons.chat),
                label: const Text('Purchase via WhatsApp'),
                onPressed: () {
                  final msg = Uri.encodeComponent(
                    'Hi! I\'d like to purchase your eBook: "$title". Please send me the payment + delivery details.',
                  );
                  final url = Uri.parse('https://wa.me/${AppConfig.adminWhatsApp}?text=$msg');
                  launchUrl(url, mode: LaunchMode.externalApplication);
                },
              ),
              const SizedBox(height: 8),
              const Text(
                'You\'ll be sent to WhatsApp with a prefilled message. The researcher will reply with payment and delivery details.',
                style: TextStyle(color: SabirUfoTheme.textFaint, fontSize: 12),
              ),
            ],
          );
        },
      ),
    );
  }
}

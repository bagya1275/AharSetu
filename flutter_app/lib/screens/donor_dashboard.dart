import 'package:flutter/material.dart';
import '../models/user.dart';
import '../models/donation.dart';
import '../services/api_service.dart';

class DonorDashboard extends StatefulWidget {
  final User user;

  const DonorDashboard({super.key, required this.user});

  @override
  State<DonorDashboard> createState() => _DonorDashboardState();
}

class _DonorDashboardState extends State<DonorDashboard> {
  List<Donation> _donations = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchDonations();
  }

  void _fetchDonations() async {
    final list = await ApiService.getMyDonations();

    setState(() {
      _donations = list;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080C14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Text(
          'AharSetu - ${widget.user.name}',
          style: const TextStyle(color: Colors.white),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Chip(
              label: Text(
                widget.user.role,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                ),
              ),
              backgroundColor: const Color(0xFF10B981),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF065F46),
                    Color(0xFF022C22),
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome, ${widget.user.name}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text(
                        'Track your live surplus food posts in real-time.',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  Semantics(
                    identifier: 'post_surplus_food_btn',
                    child: ElevatedButton.icon(
                      key: const ValueKey('post_surplus_food_btn'),
                      onPressed: () {},
                      icon: const Icon(
                        Icons.add,
                        color: Colors.black,
                      ),
                      label: const Text(
                        'Post New Surplus Food',
                        style: TextStyle(
                          color: Colors.black,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Row(
              children: [
                _buildMetricCard(
                  'Total Meals Saved',
                  '${_donations.fold(0, (sum, d) => sum + d.servings)} Meals',
                  Colors.greenAccent,
                ),
                const SizedBox(width: 12),
                _buildMetricCard(
                  'Live Active Posts',
                  '${_donations.length} Posts',
                  Colors.amberAccent,
                ),
                const SizedBox(width: 12),
                _buildMetricCard(
                  'CO2 Prevented',
                  '~0 kg',
                  Colors.tealAccent,
                ),
              ],
            ),

            const SizedBox(height: 24),

            Container(
              key: const ValueKey('donor_dashboard'),
              width: double.infinity,
              padding: const EdgeInsets.all(40),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.white10,
                ),
              ),
              child: _loading
                  ? const Center(
                      child: CircularProgressIndicator(),
                    )
                  : _donations.isEmpty
                      ? Column(
                          children: const [
                            Icon(
                              Icons.access_time,
                              color: Colors.grey,
                              size: 48,
                            ),
                            SizedBox(height: 12),
                            Text(
                              'No active donations at the moment.',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              '+ Post surplus food now',
                              style: TextStyle(
                                color: Color(0xFF10B981),
                                fontSize: 13,
                              ),
                            ),
                          ],
                        )
                      : Column(
                          children: _donations
                              .map(
                                (d) => ListTile(
                                  title: Text(
                                    d.title,
                                    style: const TextStyle(
                                      color: Colors.white,
                                    ),
                                  ),
                                  subtitle: Text(
                                    '${d.servings} meals • ${d.category}',
                                    style: const TextStyle(
                                      color: Colors.grey,
                                    ),
                                  ),
                                ),
                              )
                              .toList(),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(
    String label,
    String value,
    Color color,
  ) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.white10,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: Colors.grey,
                fontSize: 11,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

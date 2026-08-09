import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import 'donor_dashboard.dart';

class RoleSelectionScreen extends StatefulWidget {
  final User user;

  const RoleSelectionScreen({
    super.key,
    required this.user,
  });

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen> {
  String _selectedRole = 'DONOR';
  bool _loading = false;

  void _confirmRole() async {
    setState(() => _loading = true);

    try {
      final res = await ApiService.setRole(_selectedRole);

      if (res['success'] == true) {
        final updatedUser = User.fromJson(res['user']);

        if (!mounted) return;

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => DonorDashboard(user: updatedUser),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080C14),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: 500,
          ),
          child: Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Select Your Role (Step 2)',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 20),

                _buildRoleCard(
                  'DONOR',
                  'Food Donor / Partner',
                  'Hotels, Banquets & Caterers',
                ),

                _buildRoleCard(
                  'NGO',
                  'NGO & Shelter Rescuer',
                  'Verified Non-Profit Shelters',
                ),

                _buildRoleCard(
                  'VOLUNTEER',
                  'Volunteer Delivery Hero',
                  'Express Logistics Rider',
                ),

                _buildRoleCard(
                  'REQUESTER',
                  'Food Requester',
                  'Direct Community Request',
                ),

                const SizedBox(height: 24),

                Semantics(
                  identifier: 'confirm_role_btn',
                  child: ElevatedButton(
                    key: const ValueKey('confirm_role_btn'),
                    onPressed: _loading ? null : _confirmRole,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                    ),
                    child: Text(
                      _loading
                          ? 'Assigning...'
                          : 'Confirm Role & Go to Dashboard',
                      style: const TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoleCard(
    String roleId,
    String title,
    String subtitle,
  ) {
    final isSelected = _selectedRole == roleId;

    return GestureDetector(
      key: ValueKey(
        'role_card_${roleId.toLowerCase()}',
      ),
      onTap: () {
        setState(() {
          _selectedRole = roleId;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF1E293B)
              : const Color(0xFF0F172A),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF10B981)
                : Colors.white12,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(
              isSelected
                  ? Icons.check_circle
                  : Icons.radio_button_unchecked,
              color: isSelected
                  ? const Color(0xFF10B981)
                  : Colors.grey,
            ),

            const SizedBox(width: 12),

            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                Text(
                  subtitle,
                  style: const TextStyle(
                    color: Colors.grey,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

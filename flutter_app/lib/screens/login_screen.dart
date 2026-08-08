import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/user.dart';
import 'role_selection_screen.dart';
import 'donor_dashboard.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;

  void _handleLogin() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final res = await ApiService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (res['success'] == true) {
        final user = User.fromJson(res['user']);
        if (!mounted) return;

        if (user.role == 'UNASSIGNED') {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => RoleSelectionScreen(user: user)),
          );
        } else {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => DonorDashboard(user: user)),
          );
        }
      } else {
        setState(() => _error = res['message'] ?? 'Login failed');
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080C14),
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 450),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white10),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'AharSetu Login',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              if (_error != null)
                Container(
                  padding: const EdgeInsets.all(10),
                  color: Colors.redAccent.withOpacity(0.2),
                  child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                ),
              const SizedBox(height: 12),
              Semantics(
                identifier: 'input_email',
                child: TextField(
                  key: const ValueKey('input_email'),
                  controller: _emailController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Email Address',
                    labelStyle: TextStyle(color: Colors.grey),
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Semantics(
                identifier: 'input_password',
                child: TextField(
                  key: const ValueKey('input_password'),
                  controller: _passwordController,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    labelStyle: TextStyle(color: Colors.grey),
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Semantics(
                identifier: 'auth_submit_btn',
                child: ElevatedButton(
                  key: const ValueKey('auth_submit_btn'),
                  onPressed: _loading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: Text(
                    _loading ? 'Signing In...' : 'Sign In',
                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

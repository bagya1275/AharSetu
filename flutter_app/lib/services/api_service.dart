import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/donation.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('aharsetu_token');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
    String phone,
    String address,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'address': address,
      }),
    );
    final data = jsonDecode(response.body);
    if (data['token'] != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('aharsetu_token', data['token']);
    }
    return data;
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(response.body);
    if (data['token'] != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('aharsetu_token', data['token']);
    }
    return data;
  }

  static Future<Map<String, dynamic>> setRole(String role, {String? shelterLocation}) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/auth/set-role'),
      headers: headers,
      body: jsonEncode({
        'role': role,
        if (shelterLocation != null) 'shelterLocation': shelterLocation,
      }),
    );
    return jsonDecode(response.body);
  }

  static Future<List<Donation>> getMyDonations() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/donations/my'),
      headers: headers,
    );
    final data = jsonDecode(response.body);
    if (data['success'] == true && data['donations'] != null) {
      return (data['donations'] as List).map((d) => Donation.fromJson(d)).toList();
    }
    return [];
  }

  static Future<Map<String, dynamic>> createDonation(Map<String, dynamic> donationData) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/donations'),
      headers: headers,
      body: jsonEncode(donationData),
    );
    return jsonDecode(response.body);
  }
}

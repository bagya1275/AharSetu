import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const AharSetuApp());
}

class AharSetuApp extends StatelessWidget {
  const AharSetuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AharSetu - Smart Food Redistribution',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF080C14),
        fontFamily: 'Inter',
      ),
      home: const LoginScreen(),
    );
  }
}

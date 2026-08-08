class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final String? address;
  final String? shelterLocation;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.address,
    this.shelterLocation,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'UNASSIGNED',
      phone: json['phone'],
      address: json['address'],
      shelterLocation: json['shelterLocation'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role,
    'phone': phone,
    'address': address,
    'shelterLocation': shelterLocation,
  };
}

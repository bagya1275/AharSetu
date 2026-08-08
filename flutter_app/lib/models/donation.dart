class Donation {
  final String id;
  final String donorId;
  final String donorName;
  final String title;
  final String description;
  final String category;
  final String dietary;
  final int servings;
  final double weightKg;
  final int expiryHours;
  final String pickupAddress;
  final String photoUrl;
  final String status;

  Donation({
    required this.id,
    required this.donorId,
    required this.donorName,
    required this.title,
    required this.description,
    required this.category,
    required this.dietary,
    required this.servings,
    required this.weightKg,
    required this.expiryHours,
    required this.pickupAddress,
    required this.photoUrl,
    required this.status,
  });

  factory Donation.fromJson(Map<String, dynamic> json) {
    return Donation(
      id: json['id'] ?? json['_id'] ?? '',
      donorId: json['donorId'] ?? '',
      donorName: json['donorName'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      dietary: json['dietary'] ?? '',
      servings: json['servings'] ?? 0,
      weightKg: (json['weightKg'] ?? 0).toDouble(),
      expiryHours: json['expiryHours'] ?? 0,
      pickupAddress: json['pickupAddress'] ?? '',
      photoUrl: json['photoUrl'] ?? '',
      status: json['status'] ?? 'AVAILABLE',
    );
  }
}

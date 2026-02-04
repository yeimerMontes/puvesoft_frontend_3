class CartListItem {
  CartListItem({
    required this.id,
    required this.label,
  });

  final String id;
  final String label;
}

class CartDetail {
  CartDetail({
    required this.id,
    required this.items,
  });

  final String id;
  final List<dynamic> items;
}

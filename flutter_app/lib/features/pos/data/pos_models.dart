class CartItemPayload {
  CartItemPayload({
    required this.payload,
  });

  final Map<String, dynamic> payload;
}

class PosSalePayload {
  PosSalePayload({
    required this.payload,
  });

  final Map<String, dynamic> payload;
}

class PosSaleResult {
  PosSaleResult({
    required this.saleId,
    required this.status,
  });

  final String saleId;
  final String status;
}

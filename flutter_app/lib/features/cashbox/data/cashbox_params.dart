class CashboxHistoryParams {
  CashboxHistoryParams({
    required this.page,
    required this.size,
    required this.search,
    required this.fechaInicial,
    required this.fechaFinal,
  });

  final int page;
  final int size;
  final String search;
  final String fechaInicial;
  final String fechaFinal;

  Map<String, dynamic> toQuery() {
    return {
      'page': page,
      'size': size,
      'search': search,
      'fecha_inicial': fechaInicial,
      'fecha_final': fechaFinal,
    };
  }
}

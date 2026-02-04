class ProductSearchParams {
  ProductSearchParams({
    required this.page,
    required this.search,
    required this.size,
    required this.paginate,
    required this.typeProduct,
    required this.bodega,
  });

  final int page;
  final String search;
  final int size;
  final int paginate;
  final String typeProduct;
  final String bodega;

  Map<String, dynamic> toQuery() {
    return {
      'page': page,
      'search': search,
      'size': size,
      'paginate': paginate,
      'typeProduct': typeProduct,
      'bodega': bodega,
    };
  }
}

class ProductModel {
  ProductModel({
    required this.id,
    required this.name,
  });

  final String id;
  final String name;
}

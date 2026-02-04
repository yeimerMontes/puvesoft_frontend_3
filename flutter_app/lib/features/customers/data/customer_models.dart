class CustomerSearchParams {
  CustomerSearchParams({
    required this.page,
    required this.search,
    required this.size,
    required this.paginate,
  });

  final int page;
  final String search;
  final int size;
  final int paginate;

  Map<String, dynamic> toQuery() {
    return {
      'page': page,
      'search': search,
      'size': size,
      'paginate': paginate,
    };
  }
}

class CustomerModel {
  CustomerModel({
    required this.id,
    required this.name,
  });

  final String id;
  final String name;
}

class PermissionsModel {
  static List<String> fromDynamic(dynamic data) {
    if (data is List) {
      return data.map((item) => item.toString()).toList();
    }
    return [];
  }
}

class AppConfig {
  AppConfig({
    required this.baseUrl,
  });

  final String baseUrl;

  static AppConfig production() {
    return AppConfig(baseUrl: 'https://conexion.puvesoft.co/api');
  }
}

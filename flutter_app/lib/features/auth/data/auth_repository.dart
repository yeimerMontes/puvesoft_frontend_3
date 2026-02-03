class AuthRepository {
  Future<void> login({required String username, required String password}) async {
    // TODO: POST /auth/login
  }

  Future<void> loginAdmin({required String username, required String password}) async {
    // TODO: POST /auth/loginUserAdminJwt
  }

  Future<void> logout() async {
    // TODO: POST /auth/logout
  }

  Future<void> sendPasswordRecovery({required String email}) async {
    // TODO: POST /sendMail
  }
}

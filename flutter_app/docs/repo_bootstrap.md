# Repo Bootstrap (when Flutter is available)

Run these commands locally to create the Flutter project and generate platform folders:

```bash
cd flutter_app
flutter create .
```

Then add dependencies (example):

```bash
dart pub add dio
```

After scaffolding, wire `AppConfig.production()` in your app entrypoint.

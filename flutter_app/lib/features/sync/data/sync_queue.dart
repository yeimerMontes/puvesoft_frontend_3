import 'sync_queue_item_type.dart';

enum SyncQueueStatus {
  pending,
  completed,
  failed,
}

class SyncQueueItem {
  SyncQueueItem({
    required this.id,
    required this.type,
    required this.payload,
    required this.createdAt,
    this.status = SyncQueueStatus.pending,
    this.retries = 0,
  });

  final String id;
  final SyncQueueItemType type;
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  final SyncQueueStatus status;
  final int retries;

  SyncQueueItem copyWith({
    SyncQueueStatus? status,
    int? retries,
  }) {
    return SyncQueueItem(
      id: id,
      type: type,
      payload: payload,
      createdAt: createdAt,
      status: status ?? this.status,
      retries: retries ?? this.retries,
    );
  }
}

abstract class SyncQueueStore {
  Future<void> save(SyncQueueItem item);
  Future<SyncQueueItem?> read(String id);
  Future<List<SyncQueueItem>> list();
}

class MemorySyncQueueStore implements SyncQueueStore {
  final Map<String, SyncQueueItem> _items = {};

  @override
  Future<void> save(SyncQueueItem item) async {
    _items[item.id] = item;
  }

  @override
  Future<SyncQueueItem?> read(String id) async {
    return _items[id];
  }

  @override
  Future<List<SyncQueueItem>> list() async {
    final items = _items.values.toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
    return items;
  }
}

class SyncQueueRepository {
  SyncQueueRepository(this._store);

  final SyncQueueStore _store;

  Future<void> enqueue(SyncQueueItem item) async {
    await _store.save(item);
  }

  Future<List<SyncQueueItem>> pendingItems() async {
    final items = await _store.list();
    return items.where((item) => item.status == SyncQueueStatus.pending).toList();
  }

  Future<void> markCompleted(String id) async {
    final item = await _store.read(id);
    if (item == null) {
      return;
    }
    await _store.save(item.copyWith(status: SyncQueueStatus.completed));
  }

  Future<void> markFailed(String id) async {
    final item = await _store.read(id);
    if (item == null) {
      return;
    }
    await _store.save(
      item.copyWith(
        status: SyncQueueStatus.failed,
        retries: item.retries + 1,
      ),
    );
  }
}

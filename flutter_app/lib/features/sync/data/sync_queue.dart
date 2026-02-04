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
  });

  final String id;
  final String type;
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  final SyncQueueStatus status;
}

class SyncQueueRepository {
  Future<void> enqueue(SyncQueueItem item) async {
    // TODO: store locally (SQLite)
  }

  Future<List<SyncQueueItem>> pendingItems() async {
    // TODO: load pending items ordered by createdAt
    return [];
  }

  Future<void> markCompleted(String id) async {
    // TODO: mark item as synced
  }

  Future<void> markFailed(String id) async {
    // TODO: mark item as failed
  }
}

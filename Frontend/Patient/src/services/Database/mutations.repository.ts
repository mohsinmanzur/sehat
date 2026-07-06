import * as SQLite from 'expo-sqlite';

export type MutationOperation = 'create' | 'update' | 'delete';
export type MutationEntityType = 'health_measurement' | 'medical_document';

export type PendingMutation = {
    id: string;
    entity_type: MutationEntityType;
    operation: MutationOperation;
    payload: string;
    local_id: string | null;
    server_id: string | null;
    created_at: string;
    retry_count: number;
    last_error: string | null;
};

function generateId(): string {
    return `mut_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function enqueueMutation(
    db: SQLite.SQLiteDatabase,
    mutation: Omit<PendingMutation, 'id' | 'created_at' | 'retry_count' | 'last_error'>
): Promise<string> {
    const id = generateId();
    await db.runAsync(
        `INSERT INTO pending_mutations
            (id, entity_type, operation, payload, local_id, server_id, created_at, retry_count, last_error)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL)`,
        [
            id,
            mutation.entity_type,
            mutation.operation,
            mutation.payload,
            mutation.local_id ?? null,
            mutation.server_id ?? null,
            new Date().toISOString(),
        ]
    );
    return id;
}

export async function getPendingMutations(db: SQLite.SQLiteDatabase): Promise<PendingMutation[]> {
    return db.getAllAsync<PendingMutation>(
        'SELECT * FROM pending_mutations ORDER BY created_at ASC'
    );
}

export async function removeMutation(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM pending_mutations WHERE id = ?', [id]);
}

export async function removeMutationByLocalId(
    db: SQLite.SQLiteDatabase,
    localId: string
): Promise<void> {
    await db.runAsync(
        "DELETE FROM pending_mutations WHERE local_id = ? AND operation = 'create'",
        [localId]
    );
}

export async function removeMutationsByServerId(
    db: SQLite.SQLiteDatabase,
    serverId: string,
    entityType: MutationEntityType
): Promise<void> {
    await db.runAsync(
        'DELETE FROM pending_mutations WHERE server_id = ? AND entity_type = ?',
        [serverId, entityType]
    );
}

export async function incrementRetry(
    db: SQLite.SQLiteDatabase,
    id: string,
    error: string
): Promise<void> {
    await db.runAsync(
        'UPDATE pending_mutations SET retry_count = retry_count + 1, last_error = ? WHERE id = ?',
        [error, id]
    );
}

export async function getFailedMutationCount(db: SQLite.SQLiteDatabase): Promise<number> {
    const row = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM pending_mutations WHERE retry_count >= 3'
    );
    return row?.count ?? 0;
}

export async function getPendingMutationCount(db: SQLite.SQLiteDatabase): Promise<number> {
    const row = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM pending_mutations WHERE retry_count < 3'
    );
    return row?.count ?? 0;
}

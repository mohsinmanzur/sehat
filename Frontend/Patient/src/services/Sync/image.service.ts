import { Paths, File, Directory } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import backend from '../Backend/backend.service';
import { updateLocalFilePath } from '../Database/documents.repository';
import type { MedicalDocument } from '../../types/types';

function getDocsDir(): Directory {
    return new Directory(Paths.document, 'medical_docs');
}

function ensureDocsDir(): void {
    const dir = getDocsDir();
    if (!dir.exists) {
        dir.create();
    }
}

export async function downloadAndCacheDocumentImage(
    db: SQLite.SQLiteDatabase,
    docId: string,
    fileUrl: string
): Promise<string | null> {
    try {
        ensureDocsDir();
        const ext = fileUrl.split('?')[0].split('.').pop() ?? 'jpg';
        const destFile = new File(getDocsDir(), docId + '.' + ext);

        if (destFile.exists) {
            await updateLocalFilePath(db, docId, destFile.uri);
            return destFile.uri;
        }

        const { file_url: secureUrl } = await backend.getSecureDocumentUrl(fileUrl);
        await File.downloadFileAsync(secureUrl, destFile, { idempotent: true });
        await updateLocalFilePath(db, docId, destFile.uri);
        return destFile.uri;
    } catch {
        return null;
    }
}

export async function ensureLocalDocumentImages(
    db: SQLite.SQLiteDatabase,
    docs: MedicalDocument[]
): Promise<void> {
    for (const doc of docs) {
        if (!doc.id || !doc.file_url) continue;
        const ext = doc.file_url.split('?')[0].split('.').pop() ?? 'jpg';
        const file = new File(getDocsDir(), doc.id + '.' + ext);
        if (!file.exists) {
            await downloadAndCacheDocumentImage(db, doc.id, doc.file_url);
        } else {
            await updateLocalFilePath(db, doc.id, file.uri);
        }
    }
}

export async function getLocalImageUri(docId: string, fileUrl?: string): Promise<string | null> {
    if (!fileUrl) return null;
    const ext = fileUrl.split('?')[0].split('.').pop() ?? 'jpg';
    const file = new File(getDocsDir(), docId + '.' + ext);
    return file.exists ? file.uri : null;
}

export async function saveLocalImageCopy(sourceUri: string, localId: string): Promise<string> {
    ensureDocsDir();
    const sourceFile = new File(sourceUri);
    const destFile = new File(getDocsDir(), localId + '.jpg');
    sourceFile.copy(destFile);
    return destFile.uri;
}

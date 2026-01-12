import * as Model from "./Model";

interface AuthenticateCommand {
    challenge: string,
    signature: string,
}

export async function authenticateToDirectory(directoryId: string, command: AuthenticateCommand): Promise<boolean> {
    const header = `${command.challenge}|${command.signature}`;

    const response = await fetch(`api/auth/${directoryId}`, {
        method: "HEAD",
        headers: {
            "Authorization": `KeyProof ${header}`
        }
    });

    return response.ok;
}

export async function getDirectories(): Promise<Map<Model.DirectoryId, Model.DirectoryMetadataResponse> | undefined> {
    const response = await fetch("api/directory");
    if (!response.ok) {
        return undefined;
    }

    const data = await response.json() as Model.DirectoryMetadataResponse[];
    const result = new Map<Model.DirectoryId, Model.DirectoryMetadataResponse>();
    for (const item of data) {
        result.set(item.directoryId, item);
    }

    return result;
}

interface CreateDirectoryCommand {
    protectedData: Model.EncryptedString;
    challengePublicKey: string;
}

export async function createDirectory(command: CreateDirectoryCommand) : Promise<Response> {
    return fetch("api/directory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(command)
    });
}

interface CreateFileCommand {
    protectedData: Model.EncryptedString;
}

export async function createFile(directoryId: string, command: CreateFileCommand): Promise<Response> {
    return fetch(`api/file/${directoryId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(command)
    });
}

export async function uploadFileChunk(
    directoryId: string,
    fileId: string,
    chunkIndex: number,
    iv: string,
    encrypted: ArrayBuffer
) {
    await fetch(`/api/file/${directoryId}/${fileId}`, {
        method: "PUT",
        headers: {
            "X-Chunk": chunkIndex.toString(),
            "X-IV": iv,
            "Content-Type": "application/octet-stream"
        },
        body: encrypted
    });
}

export async function finalizeFile(
    directoryId: string,
    fileId: string
) {
    await fetch(`/api/file/${directoryId}/${fileId}`, {
        method: "POST"
    });
}


export async function getDirectory(directoryId: string): Promise<Model.DirectoryMetadataResponse | undefined> {
    const response = await fetch(`api/directory/${directoryId}`);
    if (!response.ok) {
        return undefined;
    }

    return await response.json() as Model.DirectoryMetadataResponse;
}

export async function getDirectoryFiles(directoryId: string): Promise<Model.FileMetadataResponse[] | undefined> {
    const response = await fetch(`api/file/${directoryId}`);
    if (!response.ok) {
        return undefined;
    }

    return await response.json() as Model.FileMetadataResponse[];
}
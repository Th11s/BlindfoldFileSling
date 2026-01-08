import * as Model from "./Model";

interface CreateDirectoryCommand {
    encryptedData: Model.EncryptedData;
    ownerChallenge: Model.EncryptedChallenge;
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
    encryptedData: Model.EncryptedData;
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


export async function getDirectoryMetadata(directoryId: string): Promise<Model.DirectoryMetadataResponse | undefined> {
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
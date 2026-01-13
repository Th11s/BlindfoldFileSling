import React from "react";
import ReactDOM from "react-dom/client";

import {
    getDirectoryFiles,
    downloadFile
} from "../DirectoryService";

import { ActivityIndicator } from "./ActivityIndicator";
import * as Model from "../Model"

interface FileListProps {
    directoryId: string;
}

function FileList({ directoryId }: FileListProps) {
    const [files, setFiles] = React.useState<Model.FileMetadata[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        async function fetchFiles() {
            const files = await getDirectoryFiles(directoryId);
            setFiles(files || []);
            setLoading(false);
        }

        fetchFiles();
    }, [directoryId]);

    // Download handler using the File System Access API
    const handleDownload = async (file: Model.FileMetadata) => {
        try {
            
            // Prompt user for destination file using File System Access API
            // @ts-ignore: File System Access API is not yet in TypeScript lib.dom.d.ts
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: file.fileName,
                types: [
                    {
                        description: "All Files",
                        accept: { [file.mimeType]: [`.${file.extension}`] }
                    }
                ]
            });

            if (!fileHandle) {
                return;
            }

            downloadFile(file, fileHandle);
            
        } catch (err) {
            if ((err as any).name !== "AbortError") {
                alert("Download failed: " + ((err as Error).message || err));
            }
        }
    };

    if (loading) {
        return <ActivityIndicator />;
    }

    if (files.length === 0) {
        return <div>No files found.</div>;
    }

    return (
        <div className="file-list">
            {files.map(file => (
                <div className="file-item" key={file.fileId}>
                    <div className="icon"></div>
                    <div className="name">{file.fileName}</div>
                    <div className="uploaded">{file.createdAt}</div>
                    <div className="size">{file.fileSize}</div>
                    <div className="type">{file.mimeType} {file.extension}</div>
                    <div className="actions">
                        <button type="button" onClick={() => handleDownload(file)}>
                            <i className="fa fa-download" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export class FileListWebComponent extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute("directory-id");
        if (!directoryId) {
            console.error("directory-id was not present");
            return;
        }

        ReactDOM.createRoot(this).render(<FileList directoryId={directoryId} />);
    }
}
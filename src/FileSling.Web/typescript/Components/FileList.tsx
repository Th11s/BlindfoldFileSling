import React from "react";
import ReactDOM from "react-dom/client";

import * as DirectoryService from "../DirectoryService";

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
            const files = await DirectoryService.getDirectoryFiles(directoryId);
            setFiles(files || []);
            setLoading(false);
        }

        fetchFiles();
    }, [directoryId]);

    if (loading) {
        return <ActivityIndicator />;
    }

    if (files.length === 0) {
        return <div>No files found.</div>;
    }

    return (
        <ul>
            {files.map(file => (
                <li key={file.fileId}>
                    <a href={`file/${file.directoryId}/${file.fileId}`}>{file.fileName}</a>
                </li>
            ))}
        </ul>
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
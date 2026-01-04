import React from "react";
import ReactDOM from "react-dom/client";

import { ActivityIndicator } from "./ActivityIndicator.js";
import * as Model from "../Model.js"

interface FileListProps {
    directoryId: string;
}


function FileList({ directoryId }: FileListProps) {
    const [files, setFiles] = React.useState<Model.FileMetadata[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        async function fetchFiles() {
            const response = await fetch(`/api/directory/${directoryId}`);
            if (response.ok) {
                const filesData = await response.json();
                setFiles(filesData);
                setLoading(false);
            }
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
                    <a href={`file/${file.fileId}`}>{file.fileName}</a>
                </li>
            ))}
        </ul>
    );
}

export class FileListWebComponent extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute("directory-id") || "";
        ReactDOM.createRoot(this).render(<FileList directoryId={directoryId} />);
    }
}
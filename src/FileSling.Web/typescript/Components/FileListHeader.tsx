import React from "react";
import ReactDOM from "react-dom/client";

import { ActivityIndicator } from "./ActivityIndicator.js";
import * as Model from "../Model.js"

interface FileListHeaderProps {
    directoryId: string;
}

function FileListHeader({ directoryId }: FileListHeaderProps) {
    const [directoryMetadata, setDirectoryMetadata] = React.useState<Model.DirectoryMetadata | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        async function fetchDirectoryMetadata() {
            const response = await fetch(`/api/directory/${directoryId}/header`);
            if (response.ok) {
                const metadata = await response.json();
                setDirectoryMetadata(metadata);
            }
            setLoading(false);
        }

        fetchDirectoryMetadata();
    }, [directoryId]);

    if (loading) {
        return <ActivityIndicator />;
    }

    if (!directoryMetadata) {
        return <div>No directory metadata found.</div>;
    }

    return (
        <div className="directory-header">Directory Header Content</div>
    );
}

export class FileListHeaderWebComponent extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute("directory-id") || "";
        ReactDOM.createRoot(this).render(<FileListHeader directoryId={directoryId} />);
    }
}
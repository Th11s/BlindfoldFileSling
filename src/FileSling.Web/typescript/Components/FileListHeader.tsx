import React from "react";
import ReactDOM from "react-dom/client";

import { getDirectoryMetadata } from "../DirectoryService";

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
            const metadata = await getDirectoryMetadata(directoryId);
            setDirectoryMetadata(metadata);
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
        <div className="file-list-header">{directoryMetadata.displayName}</div>
    );
}

export class FileListHeaderWebComponent extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute("directory-id");
        if (!directoryId) {
            console.error("directory-id was not present");
            return;
        }

        ReactDOM.createRoot(this).render(<FileListHeader directoryId={directoryId} />);
    }
}
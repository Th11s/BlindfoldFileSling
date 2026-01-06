import React from "react";
import ReactDOM from "react-dom/client";

import { ActivityIndicator } from "./ActivityIndicator.js";
import * as Model from "../Model.js"
import * as ClientStorage from "../ClientStorage.js";

function DirectoryList() {
    const [directories, setDirectories] = React.useState<Model.DirectoryMetadata[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        async function loadDirectories() {
            const dirs = await ClientStorage.getDirectories();
            setDirectories(dirs);
            setLoading(false);
        }
        loadDirectories();
    }, []);
    
    if (loading) {
        return <ActivityIndicator />;
    }

    if (directories.length === 0) {
        return <div>No directories found.</div>;
    }

    return (
        <div className="directory-grid">
            {directories.map(dir => (
                <a className="directory-item" key={dir.directoryId} href={`ls/${dir.directoryId}`}>
                    <h2>{dir.displayName}</h2>
                    <div>{dir.createdAt.toLocaleString()} - {dir.expiresAt?.toLocaleString()}</div>
                    <div>{dir.lastFileUploadAt?.toLocaleString()}</div>
                    <div>{dir.usedStorageBytes} / {dir.maxStorageBytes}</div>
                </a>
            ))}
        </div>
    );
}

export class DirectoryListWebComponent extends HTMLElement {
    connectedCallback() {
        ReactDOM.createRoot(this).render(<DirectoryList />);
    }
}
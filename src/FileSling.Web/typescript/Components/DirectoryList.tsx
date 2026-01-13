import React from "react";
import ReactDOM from "react-dom/client";

import { ActivityIndicator } from "./ActivityIndicator";
import { DirectoryMetadataWithUserCaps } from "../Model"
import { getDirectories } from "../DirectoryService";

function DirectoryList() {
    const [directories, setDirectories] = React.useState<DirectoryMetadataWithUserCaps[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        async function loadDirectories() {
            const directories = await getDirectories();

            setDirectories(directories);
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
        <div className="directory-list">
            {directories.map(dir => (
                <a className="directory-item" key={dir.directoryId} href={`ls/${dir.directoryId}`}>
                    <img className="icon" src="icons/folder.svg" alt="Folder Icon" />
                    <div className="name">{dir.displayName}</div>
                    <div className="dates">{dir.createdAt} - {dir.expiresAt}</div>
                    <div className="last-upload">{dir.lastFileUploadAt}</div>
                    <div className="disk-space">{dir.usedStorageSpace} / {dir.maxStorageSpace}</div>
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
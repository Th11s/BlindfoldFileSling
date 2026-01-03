import ReactDOM from 'react-dom/client';

import { ActivityIndicator } from './ActivityIndicator.js';
import * as Model from '../Model.js'

interface FileListHeaderProps {
    directoryId: string;
}

function FileListHeader({ directoryId }: FileListHeaderProps) {
    //private directoryMetadata?: Model.DirectoryMetadata;

    //connectedCallback() {
    //    const directoryId = this.getAttribute('directory-id');
    //    if (!directoryId) {
    //        throw 'Missing directory-id attribute';
    //    }

    //    this.replaceChildren(<ActivityIndicator />);
    //    this.loadDirectoryHeader(directoryId).then(() => this.render());
    //}

    //async loadDirectoryHeader(directoryId: string) {
    //    const response = await fetch(`/api/directory/${directoryId}/header`);
    //}

    return (
        <div className="directory-header">Directory Header Content</div>
    );
}

export class FileListHeaderWebComponent extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute('directory-id') || "";
        ReactDOM.createRoot(this).render(<FileListHeader directoryId={directoryId} />);
    }
}
import ReactDOM from 'react-dom/client';

import { ActivityIndicator } from './ActivityIndicator.js';
import * as Model from '../Model.js'

interface FileListProps {
    directoryId: string;
}


function FileList({ directoryId }: FileListProps) {
    //private files?: Model.FileMetadata[]

    //connectedCallback() {
    //    const directoryId = this.getAttribute('directory-id');
    //    if (!directoryId) {
    //        throw 'Missing directory-id attribute';
    //    }

    //    this.replaceChildren(<ActivityIndicator />);
    //    this.getFiles(directoryId).then(() => this.render());
    //}

    //async getFiles(directoryId: string) {
    //    const response = await fetch(`/api/directory/${directoryId}`);
    //    this.files = await response.json();
    //}

    //render() {
    //    if (!this.files) {
    //        this.innerHTML = `<div>No files found.</div>`;
    //        return;
    //    }

    //    const fileList = document.createElement('ul');
    //    this.files.forEach((file: any) => {
    //        const listItem = document.createElement('li');
    //        listItem.textContent = file.name;
    //        fileList.appendChild(listItem);
    //    });
    //    this.appendChild(fileList);
    //}

    return(
        <div className = "file-list" > File List Component</div>
    );
}

export class FileListWebComponent extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute('directory-id') || "";
        ReactDOM.createRoot(this).render(<FileList directoryId={directoryId} />);
    }
}
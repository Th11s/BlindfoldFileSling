import ReactDOM from 'react-dom/client';

import { ActivityIndicator } from './ActivityIndicator.js';
import * as Model from '../Model.js'
import * as ClientStorage from '../ClientStorage.js';

function DirectoryList() {
    //private directories?: Model.DirectoryMetadata[];

    //connectedCallback() {
    //    this.replaceChildren(<ActivityIndicator />);
    //    this.loadDirectories().then(() => this.render());
    //}

    //async loadDirectories() {
    //    const directories = ClientStorage.getDirectories();
    //    this.directories = await directories;
    //}

    //render() {
    //    if (!this.directories) {
    //        const notFoundContent = (
    //            <div>
    //                No directories found.
    //            </div>
    //        );
    //        this.replaceChildren(notFoundContent);
    //        return;
    //    }


    //    this.innerHTML = `<div>Directory Browser Component</div>`;
    //    const dirList = document.createElement('ul');
    //    this.directories.forEach(dir => {
    //        const listItem = document.createElement('li');
    //            const anchor = document.createElement('a');
    //            anchor.href = `ls/${dir.directoryId}`;
    //            anchor.textContent = dir.displayName;
    //        listItem.appendChild(anchor);

    //        dirList.appendChild(listItem);
    //    });
    //    this.replaceChildren(dirList);
    //}

    return (
        <div className="directory-list">Directory Browser Component</div>
    );
}

export class DirectoryListWebComponent extends HTMLElement {
    connectedCallback() {
        ReactDOM.createRoot(this).render(<DirectoryList />);
    }
}
import { addActivityIndicator } from './ActivityIndicator.js';
import * as Model from '../Model.js'
import * as ClientStorage from '../ClientStorage.js';

export class DirectoryBrowser extends HTMLElement {
    private directories?: Model.DirectoryMetadata[];

    connectedCallback() {
        addActivityIndicator(this);
        this.loadDirectories().then(() => this.render());
    }

    async loadDirectories() {
        const directories = ClientStorage.getDirectories();
        this.directories = await directories;
    }

    render() {
        if (!this.directories) {
            this.innerHTML = `<div>No directories found.</div>`;
            return;
        }

        this.innerHTML = `<div>Directory Browser Component</div>`;
        const dirList = document.createElement('ul');
        this.directories.forEach(dir => {
            const listItem = document.createElement('li');
                const anchor = document.createElement('a');
                anchor.href = `ls/${dir.directoryId}`;
                anchor.textContent = dir.displayName;
            listItem.appendChild(anchor);

            dirList.appendChild(listItem);
        });
        this.replaceChildren(dirList);
    }
}
import * as App from './js-client/App.js';

export function afterWebStarted(blazor) {
    console.debug('FileSling.Web.lib.module afterWebStarted has been called');

    App.initializeApp(blazor);
}
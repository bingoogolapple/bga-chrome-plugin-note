import { useEffect } from "react"

function App() {
    // useEffect(() => {
    //     chrome.tabs.query({
    //         active: true,
    //         lastFocusedWindow: true,
    //         // currentWindow: true,
    //     }).then(([tab]) => {
    //         if (tab?.url?.startsWith('http')) {
    //             chrome.debugger.attach({ tabId: tab.id }, '1.2', function () {
    //                 chrome.debugger.sendCommand(
    //                     { tabId: tab.id },
    //                     'Network.enable',
    //                     {},
    //                     () => {
    //                         if (chrome.runtime.lastError) {
    //                             console.error(chrome.runtime.lastError);
    //                         }
    //                     }
    //                 );
    //             });
    //         } else {
    //             console.log('Debugger can only be attached to HTTP/HTTPS pages.');
    //         }
    //     })
    // }, [])
    return (
        <div>
            <h1>popup</h1>
        </div>
    )
}

export default App

const HID_DEVICE_TYPE = 'HID';
const USB_DEVICE_TYPE = 'USB';
const HID_DEVICES_BLOCK_ID = 'hid_devices_block_id';
const USB_DEVICES_BLOCK_ID = 'usb_devices_block_id';

const GET_DEVICES_CMD = 'get_devices';
const OPEN_DEVICE_CMD = 'open_device';
const CLOSE_DEVICE_CMD = 'close_device';
const FEED_SERVICE_WORKER_CMD = 'feed_service_worker';
const BOUNCE_DEVICE_CMD = 'bounce_device';

var globalUsbDevices = null;

// Formats an 8-bit integer `value` in hexadecimal with leading zero.
const hex8 = value => {
    return ('00' + value.toString(16)).substr(-2).toUpperCase();
};

// Formats a 16-bit integer `value` in hexadecimal with leading zeros.
const hex16 = value => {
    return ('0000' + value.toString(16)).substr(-4).toUpperCase();
};

const canonicalDeviceName = (device, type) => {
    return `[${type}] ${hex16(device.vendorId)}:${hex16(device.productId)} ${device.productName}`
}

const createButtonElement = (text, onclickCb) => {
    element = document.createElement('button');
    element.appendChild(document.createTextNode(text));
    element.onclick = onclickCb;
    return element;
}

const createButtons = () => {
    const deviceType = USB_DEVICE_TYPE;
    const blockId = USB_DEVICES_BLOCK_ID;
    const navigatorDeviceObj = navigator.usb;

    // Add a button to request device permissions.
    const requestButtonElement = document.createElement('button');
    requestButtonElement.appendChild(document.createTextNode(`Request ${deviceType} Device Permission`));
    requestButtonElement.onclick = e => {
        navigatorDeviceObj.requestDevice({ filters: [] }).then(d => {
            console.log(`Granted permission for ${canonicalDeviceName(d, deviceType)}`);
        });
    };
    document.body.appendChild(requestButtonElement);
    document.body.appendChild(document.createElement('br'));

    // Add a button to create a list of granted devices.
    const getDevicesButtonElement = document.createElement('button');
    getDevicesButtonElement.appendChild(document.createTextNode(`Get Granted ${deviceType} Devices`));
    getDevicesButtonElement.onclick = e => {
        navigatorDeviceObj.getDevices().then((devices) => {
            console.log('get_devices', devices);
            globalUsbDevices = devices;

            let devicesBlockElement = document.createElement('div');
            devicesBlockElement.setAttribute('id', blockId);
            if (devices && devices.length > 0) {
                for (let i = 0; i < devices.length; i++) {
                    const deviceName = canonicalDeviceName(devices[i], USB_DEVICE_TYPE);
                    console.log(`[DEBUG] ${deviceName}`);

                    // openButtonElement = document.createElement('button');
                    // openButtonElement.appendChild(document.createTextNode(`Open ${deviceType}Devices[${i}] ${devices[i].name}`));
                    // openButtonElement.onclick = e => {
                    //     if (globalUsbDevices) {
                    //         globalUsbDevices[i].open();
                    //     } else {
                    //         console.log('globalUsbDevices is null, please click getDevices button again!');
                    //     }
                    // };


                    devicesBlockElement.appendChild(createButtonElement(`Open ${deviceName}`, () => {
                        if (globalUsbDevices) {
                            globalUsbDevices[i].open().then(() => {
                                console.log(`${deviceName} opened`);
                            });
                        } else {
                            console.log('globalUsbDevices is null, please click getDevices button again!');
                        }                        
                    }));
                    devicesBlockElement.appendChild(document.createElement('br'));

                    // closeButtonElement = document.createElement('button');
                    // closeButtonElement.appendChild(document.createTextNode(`Close ${deviceType}Devices[${i}] ${devices[i].name}`));
                    // closeButtonElement.onclick = e => {
                    //     if (globalUsbDevices) {
                    //         globalUsbDevices[i].close();
                    //     } else {
                    //         console.log('globalUsbDevices is null, please click getDevices button again!');
                    //     }
                    // };
                    // devicesBlockElement.appendChild(closeButtonElement);
                    // devicesBlockElement.appendChild(document.createElement('br'));

                    devicesBlockElement.appendChild(createButtonElement(`close ${deviceName}`, () => {
                        if (globalUsbDevices) {
                            globalUsbDevices[i].close().then(()=> {
                                console.log(`${deviceName} closed`);
                            });
                        } else {
                            console.log('globalUsbDevices is null, please click getDevices button again!');
                        }                        
                    }));
                    devicesBlockElement.appendChild(document.createElement('br'));

                    if (devices[i].configuration) {
                        for (let iface_idx = 0; iface_idx < devices[i].configuration.interfaces.length; iface_idx++) {
                            const iface_number = devices[i].configuration.interfaces[iface_idx].interfaceNumber;
                            devicesBlockElement.appendChild(createButtonElement(`Claim ${deviceName} interface number ${iface_number}`, () => {
                                if (globalUsbDevices) {
                                    globalUsbDevices[i].claimInterface(iface_number).then(()=> {
                                        console.log(`${deviceName} claimed interface number ${iface_number}`);
                                    });
                                } else {
                                    console.log('globalUsbDevices is null, please click getDevices button again!');
                                }                        
                            }));
                            devicesBlockElement.appendChild(document.createElement('br'));

                            devicesBlockElement.appendChild(createButtonElement(`Release ${deviceName} interface number ${iface_number}`, () => {
                                if (globalUsbDevices) {
                                    globalUsbDevices[i].claimInterface(iface_number).then(()=> {
                                        console.log(`${deviceName} released interface number ${iface_number}`);
                                    });
                                } else {
                                    console.log('globalUsbDevices is null, please click getDevices button again!');
                                }                        
                            }));
                            devicesBlockElement.appendChild(document.createElement('br'));                            
                        }
                    } else {
                        console.log(`devices[${i}] doesn't have active configuration!`);
                    }
                    devicesBlockElement.appendChild(document.createElement('br'));
                }
            }
            const oldDevicesBlockElement = document.getElementById(blockId);
            document.body.replaceChild(devicesBlockElement, oldDevicesBlockElement);
        });
    };
    document.body.appendChild(getDevicesButtonElement);
    document.body.appendChild(document.createElement('br'));

    // Add a block for opening/closing device buttons.
    let devicesBlockElement = document.createElement('div');
    devicesBlockElement.setAttribute("id", blockId);
    document.body.appendChild(devicesBlockElement);
}

window.onload = e => {
    console.log('Script for WebUSB partial claim (script.js)');
    createButtons();
};

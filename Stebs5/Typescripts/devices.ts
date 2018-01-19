module Stebs {

    export function registerDevice(slot: number, callback: (data: any) => void) {
        deviceManager.updateCallbacks[slot] = callback;
    };

    export function updateDevice(slot: number, update: any) {
        serverHub.updateDevice(slot, update);
    };

    export function updateDeviceSecondUpdate(slot: number, update: any, secondUpdate: any) {
        serverHub.updateDeviceSecondUpdate(slot, update, secondUpdate);
    };

    /**
     * Manager which is responsible for the client side handling of devices.
     */
    export var deviceManager = {

        deviceTypes: <{ [id: string]: DeviceType }>{},
        updateCallbacks: <{ [slot: number]: (data: any) => void }>{},
        devices: <[{ slot: number, type: DeviceType }]>[],

        /**
         * Initializes the manager.
         */
        init(): void {
            $('#addDeviceForm').submit(() => {
                var deviceType = $('#deviceSelect').val();
                var slot = parseInt($('#deviceSlot').val());
                serverHub.addDevice(deviceType, slot)
                    .then(result => deviceManager.addDevice(deviceManager.deviceTypes[deviceType], result));
                return false;
            });
        },

        /**
         * Removes and readds all devices.
         * This is used, when reconnecting without a browser reload.
         */
        reInitialise(): void {
            this.updateCallbacks = {};
            var oldDevices = deviceManager.devices;
            this.devices = [];
            $('#deviceElements .removeable-device').remove();
            for (var i = 0; i < oldDevices.length; ++i) {
                var device = oldDevices[i];
                ((d: { slot: number, type: DeviceType }) => serverHub.addDevice(d.type.Id, d.slot)
                    .then(result => deviceManager.addDevice(d.type, result)))(device);
            }
        },

        /**
         * Sets the device types.
         */
        setDeviceTypes(types: { [id: string]: DeviceType }): void {
            deviceManager.deviceTypes = types;
            //Add options to the device adding dialog
            var select = $('#deviceSelect');
            select.empty();
            for (var id in deviceManager.deviceTypes) {
                var deviceType = deviceManager.deviceTypes[id];
                select.append($('<option />').text(deviceType.Name).val(deviceType.Id));
            }
        },

        /**
         * Add needed gui elements to add the new device.
         * @param deviceType
         * @param slot
         */
        addDevice(deviceType: DeviceType, device: AddDeviceViewModel): void {
            if (!device.Success) { return; }
            deviceManager.devices.push({ slot: device.Slot, type: deviceType });
            Stebs.deviceManager.selectNextAvailableDeviceSlot();
            $('#deviceNewElements').append(
                $('<div />')
                    .attr('id', 'device-' + device.Slot)
                    .addClass('device')
                    .addClass('removeable-device')
                    .html(device.Template)
                    .prepend($('<p />').html(
                        //Remove link
                        '<a class="closing-link" style="position: absolute; right: 8px; top: 2px;" href="#">x</a>' +
                        //Device header
                        deviceType.Name + ' <span class="slot-number">[' + ((device.Slot < 16) ? '0'  : '') + device.Slot.toString(16).toUpperCase() + ']</span>'

                    ))
            );
            //Remove device if x was clicked.
            $('#device-' + device.Slot + ' .closing-link').click(() => serverHub.removeDevice(device.Slot)
                .then(() => $('#device-' + device.Slot).remove())
                .then(() => {
                    //remove from deviceManager.devices
                    let index = deviceManager.devices.map(function (e) { return e.slot; }).indexOf(device.Slot);
                    if (index > -1) {
                        deviceManager.devices.splice(index, 1);
                    }
                })
                .then(() => Stebs.deviceManager.selectNextAvailableDeviceSlot()));
        },

        /**
         * Sends view updates to all registered listeners-
         */
        updateView(slot: number, update: any) {
            if (deviceManager.updateCallbacks[slot]) {
                deviceManager.updateCallbacks[slot](update);
            }
        },

        /**
         * determines an available port number in sequential, ascending order and
         * updates #deviceSlot's value.
         */
        selectNextAvailableDeviceSlot(): void {
            let sortedSlotArray = deviceManager.devices.map(function (e) { return e.slot; })
                .sort(function (a, b) { return a - b });
            let i: number = 0;
            //loops until it finds a gap, e.g. slot-nr 1, 2, 3,<gap>,5,6.
            while (i < sortedSlotArray.length && sortedSlotArray[i] === i) {
                i++;
            }
            $('#deviceSlot').val(i);
        }

    };

    export class DeviceType {
        public Name: string;
        public Id: string;
    };

}

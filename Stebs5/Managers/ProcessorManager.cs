﻿using ProcessorDispatcher;
using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using System.Web;
using ProcessorSimulation;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using ProcessorSimulation.Device;

namespace Stebs5
{
    public class ProcessorManager : IProcessorManager
    {
        private IHubConnectionContext<dynamic> Clients { get; }
        private IDispatcher Dispatcher { get; }
        private IConstants Constants { get; }
        private readonly ConcurrentDictionary<string, IDispatcherItem> processors = new ConcurrentDictionary<string, IDispatcherItem>();

        public ProcessorManager(IDispatcher dispatcher, IConstants constants)
        {
            this.Constants = constants;
            this.Clients = GlobalHost.ConnectionManager.GetHubContext<StebsHub>().Clients;
            this.Dispatcher = dispatcher;
            this.Dispatcher.StateChanged += StateChanged;
            this.Dispatcher.FinishedStep += FinishedStep;
            this.Dispatcher.HistoryStackEmpty += HistoryStackEmpty;
        }

        /// <summary>Called, when a reset or halt was processed.</summary>
        /// <param name="item">Processor, which was resetted/halted.</param>
        private void StateChanged(IDispatcherItem item, StateChange stateChange)
        {
            var group = Clients.Group(item.Guid.ToString());
            switch (stateChange)
            {
                case StateChange.SoftReset:
                    group.Reset();
                    break;
                case StateChange.Halt:
                    group.Halt();
                    break;
                case StateChange.HardReset:
                    group.HardReset();
                    break;
                case StateChange.Pause:
                    group.Pause();
                    break;
            }
        }

        /// <summary>Called, when a simulation step was processed.</summary>
        /// <param name="item">Processor which was simulated</param>
        /// <param name="stepSize">Simulated step size.</param>
        /// <param name="ramChanges">Changes done to the ram during the simulation step.</param>
        /// <param name="registerChanges">Changes done to the registers during the simulation step.</param>
        private void FinishedStep(IDispatcherItem item, SimulationStepSize stepSize, int address, AluCmd command, IReadOnlyDictionary<byte, byte> ramChanges, IReadOnlyDictionary<Registers, IRegister> registerChanges, bool[] statusRegisterChanges)
        {
            var guid = item.Guid.ToString();
            Clients.Group(guid).UpdateProcessor(stepSize, address, command.ToString(), ramChanges, registerChanges, statusRegisterChanges);
        }


        /// <summary>Handle register changes so the client can be notified about asynchronous changes like interrupts.</summary>
        private Action<IProcessor, IRegister> RegisterChanged(IDispatcherItem item) => (processor, register) =>
        {
            if (register.Type == Registers.Interrupt)
            {
                var guid = item.Guid.ToString();
                Clients.Group(guid).ProcessorInterrupt(processor.Registers[Registers.Interrupt].Value);
            }
        };

        /// <summary>Informs the clients that the history stack is empty so that he can't undo anymore.</summary>
        private void HistoryStackEmpty (IDispatcherItem item)
        {
            var guid = item.Guid.ToString();
            Clients.Group(guid).undoLimitReached();
        }

        /// <summary>
        /// Method which is used to create any processor in the processor manager.
        /// This method can be used to change the initalisation of the processor and hook into events.
        /// </summary>
        private IDispatcherItem ProcessorFactory(string clientId)
        {
            var item = Dispatcher.CreateProcessor(runDelay: Constants.DefaultRunDelay);
            item.Processor.RegisterChanged += RegisterChanged(item);
            return item;
        }

        public Guid CreateProcessor(string clientId)
        {
            //Remove processor, if it exists for given client id
            //This assures, that a new client does not get an existing processor
            RemoveProcessor(clientId);
            //Add new processor for given client id
            return AssureProcessorExists(clientId);
        }

        public Guid AssureProcessorExists(string clientId) =>
            //Create new processor if none exists; Use existing otherwise
            processors.AddOrUpdate(clientId, ProcessorFactory, (id, processor) => processor).Guid;

        public Guid? RemoveProcessor(string clientId)
        {
            IDispatcherItem processor;
            if (processors.TryRemove(clientId, out processor))
            {
                Dispatcher.Remove(processor.Guid);
                return processor.Guid;
            }
            return null;
        }

        public Guid? GetProcessorId(string clientId)
        {
            IDispatcherItem item;
            if (processors.TryGetValue(clientId, out item)) { return item.Guid; }
            return null;
        }

        public void ChangeRamContent(string clientId, int[] newContent)
        {
            IDispatcherItem item;
            if(processors.TryGetValue(clientId, out item))
            {
                using (var session = item.Processor.CreateSession())
                {
                    session.RamSession.Set(newContent.Select(ram => (byte)ram).ToArray());
                }
            }
        }

        private void Update(string clientId, Func<IDispatcherItem, IDispatcherItem> update)
        {
            IDispatcherItem item;
            if (processors.TryGetValue(clientId, out item))
            {
                Dispatcher.Update(item.Guid, update);
            }
        }
        public void Run(string clientId, SimulationStepSize stepSize) => Update(clientId, item => item.SetStepSize(stepSize).SetRunning(true));
        public void Pause(string clientId) => Update(clientId, item => item.SetRunning(false));
        public void Stop(string clientId) => Update(clientId, item => { Dispatcher.SoftReset(item.Guid); return item.SetRunning(false); });
        public void Reset(string clientId) => Update(clientId, item => { Dispatcher.HardReset(item.Guid); return item.SetRunning(false); });
        public void ChangeStepSize(string clientId, SimulationStepSize stepSize) => Update(clientId, item => item.SetStepSize(stepSize));
        public void ChangeRunDelay(string clientId, TimeSpan runDelay) => Update(clientId, item => item.SetRunDelay(runDelay));

        public void Step(string clientId, SimulationStepSize stepSize)
        {
            IDispatcherItem item;
            if (processors.TryGetValue(clientId, out item))
            {
                Dispatcher.Step(item.Guid, stepSize);
            }
        }

        public void UndoStep(string clientId, SimulationStepSize stepSize)
        {
            IDispatcherItem item;
            if (processors.TryGetValue(clientId, out item))
            {
                Dispatcher.UndoStep(item.Guid, stepSize);
            }
        }

        private void ProcessorAction(string clientId, Action<IProcessorSession> action)
        {
            IDispatcherItem item;
            if (processors.TryGetValue(clientId, out item))
            {
                item.Processor.Execute(action);
            }
        }

        public byte AddDevice(string clientId, IDevice device, byte? slot)
        {
            byte result = 0;
            IDispatcherItem item;
            if (processors.TryGetValue(clientId, out item))
            {
                item.Processor.Execute(session =>
                {
                    var view = new SignalrDeviceView(this, item.Guid.ToString());
                    if (!slot.HasValue) { result = session.DeviceManager.AddDevice(session.Processor, device, view); }
                    else { result = session.DeviceManager.AddDevice(session.Processor, device, view, slot.Value); }
                    view.Slot = result;
                });
            }
            return result;
        }

        public void RemoveDevice(string clientId, byte slot) =>
            ProcessorAction(clientId, session => session.DeviceManager.RemoveDevice(slot));

        public void UpdateDevice(string clientId, byte slot, string input) =>
            ProcessorAction(clientId, session => {
                var devices = session.DeviceManager.Devices;
                if (devices.ContainsKey(slot))
                {
                    devices[slot].Update(input);
                }
            });

        public void UpdateDevice(string clientId, byte slot, string input, string secondInput) =>
            ProcessorAction(clientId, session => {
                var devices = session.DeviceManager.Devices;
                if (devices.ContainsKey(slot))
                {
                    devices[slot].Update(input, secondInput);
                }
            });

        public void HardwareInterrupt(string clientId)
        {
            IDispatcherItem item;
            if (processors.TryGetValue(clientId, out item))
            {
                item.Processor.Execute(session => session.SetRegister(Registers.Interrupt, 1, true));
            }
        }


        public void CreateBreakpoints(string clientId, int[] breakpointArray)
        {
            IDispatcherItem item;
            if (processors.TryGetValue(clientId, out item))
            {
                item.Processor.Execute(session => session.CreateBreakpoints(breakpointArray));
            }
        }

        /// <summary>Class which is used to deliver device updates to the clien</summary>
        private class SignalrDeviceView : IDeviceView
        {
            private ProcessorManager manager;
            private string groupGuid;
            public byte Slot { get; set; }

            public SignalrDeviceView(ProcessorManager manager, string groupGuid)
            {
                this.manager = manager;
                this.groupGuid = groupGuid;
            }

            public void UpdateView(IDeviceUpdate update) => manager.Clients.Group(groupGuid).UpdateDevice(Slot, update);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Collections.Immutable;
using System.Threading;
using ProcessorSimulation.Device;

namespace ProcessorSimulation
{
    public class Processor : IProcessor
    {
        public uint InitialStackPointer { get; } = 0xbf;
        private object writeLock = new object();

        #region Events
        //Because processor events are accessed by multiple threads custom locking has to be implemented
        //to guarantee thread safety. (See also the delegate chapter of 'C# in depth')
        private object eventLock = new object();

        private Action<IProcessor, AluCmd> aluCommandChanged;
        public event Action<IProcessor, AluCmd> AluCommandChanged
        {
            add
            {
                lock (eventLock) { aluCommandChanged += value; }
            }
            remove
            {
                lock (eventLock) { aluCommandChanged -= value; }
            }
        }

        private Action<IProcessor, int> mpmAddressChanged;
        public event Action<IProcessor, int> MpmAddressChanged
        {
            add
            {
                lock (eventLock) { mpmAddressChanged += value; }
            }
            remove
            {
                lock (eventLock) { mpmAddressChanged -= value; }
            }
        }


        private Action<IProcessor, IRegister> registerChanged;
        public event Action<IProcessor, IRegister> RegisterChanged
        {
            add
            {
                lock (eventLock) { registerChanged += value; }
            }
            remove
            {
                lock (eventLock) { registerChanged -= value; }
            }
        }

        private Action<IProcessor, bool[]> srChanged;
        public event Action<IProcessor, bool[]> StatusRegisterChanged
        {
            add
            {
                lock (eventLock) { srChanged += value; }
            }
            remove
            {
                lock (eventLock) { srChanged -= value; }
            }
        }

        private Action<IProcessor> halted;
        public event Action<IProcessor> Halted
        {
            add
            {
                lock (eventLock) { halted += value; }
            }
            remove
            {
                lock (eventLock) { halted -= value; }
            }
        }
        #endregion

        private volatile int mpmAddress;
        private volatile AluCmd aluCommand;
        private volatile ImmutableDictionary<Registers, IRegister> registers = ImmutableDictionary<Registers, IRegister>.Empty;
        private readonly RegisterFactory registerFactory;

        private volatile Stack<IProcessorState> history = new Stack<IProcessorState>();
        private volatile IDictionary<int, Tuple<int, int>> breakpoints = new Dictionary<int, Tuple<int, int>>();

        public IAlu Alu { get; }
        private IRam ram;
        private const int historyMaxSize = 1024;    //How many microsteps are saved in the undo-history.
        private const int historyOverflow = 128;    //How many microsteps can be over the maximum until the oldest states are dropped.
        public IReadOnlyRam Ram
        {
            get { return new ReadOnlyRam(ram); }
        }
        public IDictionary<Registers, IRegister> Registers
        {
            get { return registers; }
        }
        public int MpmAddress
        {
            get { return mpmAddress; }
            set { mpmAddress = value; }
        }
        public AluCmd AluCommand
        {
            get { return aluCommand; }
            set { aluCommand = value; }
        }

        public bool IsHalted { get; private set; }

        private IDeviceManager deviceManager;

        /// <summary>Processor constructor with needed dependencies.</summary>
        /// <param name="alu">Alu, which is used for calculations in this processor.</param>
        /// <param name="ram">Ram, which is used as memory for this processor.</param>
        /// <param name="registerFactory">Factory function, that is used to create register instances.</param>
        public Processor(IAlu alu, IRam ram, RegisterFactory registerFactory, IDeviceManager deviceManager)
        {
            this.Alu = alu;
            this.ram = ram;
            this.registerFactory = registerFactory;
            this.deviceManager = deviceManager;
            //Initialize the registers dictionary with all existing registers
            registers = registers.AddRange(RegistersExtensions.GetValues()
                .Select(type => registerFactory(type, 0, false))
                .ToDictionary(register => register.Type));
            registers = registers.SetItem(ProcessorSimulation.Registers.SP, registerFactory(ProcessorSimulation.Registers.SP, InitialStackPointer, false));
        }

        /// <summary>Notifies that the register with the given type changed.</summary>
        /// <remarks>The changed register has to be entered to the registers data structure beforehand.</remarks>
        /// <param name="register">Type of the changed register.</param>
        private void NotifyRegisterChanged(Registers register)
        {
            NotifyRegisterChanged(registers[register]);
        }

        /// <summary>
        /// Checks if the processor reached a breakpoint and should be paused.
        /// If it reached a breakpoint, it will reduce it's iteration value 
        /// by 1 and remove it from the list if it reached zero.
        /// </summary>
        /// <param name="processor">Processor which will be handled.</param>
        /// <returns>If the processor has reached a breakpoint.</returns>
        public bool HandleBreakpoint()
        {
            int instructionPointer = (int)(Registers[ProcessorSimulation.Registers.IP].Value);
            Tuple<int, int> value;
            if (GetBreakpoints().TryGetValue(instructionPointer, out value))
            {
                if (value.Item1 <= value.Item2 + 1)
                {
                    GetBreakpoints()[instructionPointer] = new Tuple<int, int>(value.Item1, 0);
                    return true;
                }
                else GetBreakpoints()[instructionPointer] = new Tuple<int, int>(value.Item1, value.Item2 + 1);
            }
            return false;
        }

        /// <summary>Notifies, that the given register changed.</summary>
        /// <param name="register">New register</param>
        private void NotifyRegisterChanged(IRegister register)
        {
            Action<IProcessor, IRegister> handler;
            lock (eventLock)
            {
                handler = registerChanged;
            }
            if (handler != null)
            {
                //Call handler outside of the lock, so called handle methods will not caue a deadlock.
                //This is safe because delegates are immutable.
                handler(this, register);
            }
        }

        /// <summary>Notifies, that the status register changed.</summary>
        /// <param name="changes">changes to the sr</param>
        private void NotifySRChanged(bool[] changes)
        {
            Action<IProcessor, bool[]> handler;
            lock (eventLock)
            {
                handler = srChanged;
            }
            if (handler != null)
            {
                //Call handler outside of the lock, so called handle methods will not caue a deadlock.
                //This is safe because delegates are immutable.
                handler(this, changes);
            }
        }

        /// <summary>Notifies, that the current active ALU command changed</summary>
        /// <param name="command">New command</param>
        private void NotifyAluCommandChanged(AluCmd command)
        {
            Action<IProcessor, AluCmd> handler;
            lock (eventLock)
            {
                handler = aluCommandChanged;
            }
            if (handler != null)
            {
                //Call handler outside of the lock, so called handle methods will not caue a deadlock.
                //This is safe because delegates are immutable.
                handler(this, command);
            }
        }

        /// <summary>Notifies, that the current mpm address changed.</summary>
        /// <param name="address">New address</param>
        private void NotifyMpmAddressChanged(int address)
        {
            Action<IProcessor, int> handler;
            lock (eventLock)
            {
                handler = mpmAddressChanged;
            }
            if (handler != null)
            {
                //Call handler outside of the lock, so called handle methods will not caue a deadlock.
                //This is safe because delegates are immutable.
                handler(this, address);
            }
        }

        /// <summary>Notifies, that the simulaton is stopped by a halt instruction.</summary>
        private void NotifyHalt()
        {
            Action<IProcessor> handler;
            lock (eventLock)
            {
                handler = halted;
            }
            if (handler != null)
            {
                handler(this);
            }
        }

        public IProcessorSession CreateSession()
        {
            return ProcessorSession.CreateSession(this);
        }

        public void Execute(Action<IProcessorSession> action)
        {
            using (var session = CreateSession()) { action(session); }
        }

        /// <summary>
        /// Returns and removes the latest state from the undo-history.
        /// </summary>
        public IProcessorState PopState()
        {
            return history.Pop();
        }

        /// <summary>
        /// Adds a given state to the undo-history.
        /// </summary>
        public void PushState(IProcessorState state)
        {
            history.Push(state);
            DropStackElements();
        }

        /// <summary>
        /// Clears the undo-history.
        /// </summary>
        public void ResetStateHistory()
        {
            history.Clear();
        }

        /// <summary>
        /// Limits the stack to a number of elements
        /// </summary>
        private void DropStackElements()
        {
            if (history.Count > (historyMaxSize + historyOverflow))
            {
                history = new Stack<IProcessorState>(history.Take(historyMaxSize).Reverse());
            }
        }

        public IDictionary<int, Tuple<int, int>> GetBreakpoints()
        {
            return breakpoints;
        }

        public bool IsHistoryStackEmpty()
        {
            return history.Count <= 64;
        }

        public void SetBreakpoints(IDictionary<int, Tuple<int, int>> newBreakpoints)
        {
            breakpoints = newBreakpoints;
        }

        /// <summary>Proxy Pattern to protect write access to the ram.</summary>
        /// <remarks>
        /// This prevents deadlocks, because the ram is locking and often processor and ram sessions are required.
        /// This protection ensures the order in which locks (sessions) to processor and ram are acquired.
        /// </remarks>
        public sealed class ReadOnlyRam : IReadOnlyRam
        {
            private IRam Ram { get; }

            public IDictionary<byte, byte> Data
            {
                get { return Ram.Data; }
            }

            public event Action<byte, byte> RamChanged
            {
                add { Ram.RamChanged += value; }
                remove { Ram.RamChanged -= value; }
            }

            public ReadOnlyRam(IRam ram)
            {
                this.Ram = ram;
            }
        }

        public sealed class ProcessorSession : IProcessorSession
        {
            private bool disposed = false;
            private Processor Processor { get; }
            public IRamSession RamSession { get; }
            IProcessor IProcessorSession.Processor => Processor;
            public IDeviceManager DeviceManager => Processor.deviceManager;

            private ProcessorSession(Processor processor, IRamSession ram)
            {
                this.Processor = processor;
                this.RamSession = ram;
            }

            ~ProcessorSession() { Dispose(); }

            public static ProcessorSession CreateSession(Processor processor)
            {
                Monitor.Enter(processor.writeLock);
                return new ProcessorSession(processor, processor.ram.CreateSession());
            }

            public void Dispose()
            {
                if (!disposed)
                {
                    disposed = true;
                    RamSession.Dispose();
                    Monitor.Exit(Processor.writeLock);
                }
            }

            public void setAluCommand(AluCmd command)
            {
                if (disposed) { throw new InvalidOperationException("Mutative access to closed session"); }
                Processor.aluCommand = command;
                Processor.NotifyAluCommandChanged(command);
            }

            public void setMpmAddress(int address)
            {
                if (disposed) { throw new InvalidOperationException("Mutative access to closed session"); }
                Processor.mpmAddress = address;
                Processor.NotifyMpmAddressChanged(address);
            }

            public void SetRegister(Registers type, uint value, bool highlight)
            {
                if (disposed) { throw new InvalidOperationException("Mutative access to closed session"); }
                var register = Processor.registerFactory(type, value, highlight);
                Processor.registers = Processor.registers.SetItem(type, register);
                Processor.NotifyRegisterChanged(register);
            }

            public void SetRegister(IRegister register)
            {
                if (disposed) { throw new InvalidOperationException("Mutative access to closed session"); }
                if (register.Type == ProcessorSimulation.Registers.Status) {
                    var oldRegister = Processor.registers[ProcessorSimulation.Registers.Status];
                    Processor.registers = Processor.registers.SetItem(register.Type, register);

                    var interruptOld = (oldRegister.Value & 16) > 0 ? 1 : 0;
                    var signedOld = (oldRegister.Value & 8) > 0 ? 1 : 0;
                    var overflowOld = (oldRegister.Value & 4) > 0 ? 1 : 0;
                    var zeroOld = (oldRegister.Value & 2) > 0 ? 1 : 0;
                    var interruptNew = (register.Value & 16) > 0 ? 1 : 0;
                    var signedNew = (register.Value & 8) > 0 ? 1 : 0;
                    var overflowNew = (register.Value & 4) > 0 ? 1 : 0;
                    var zeroNew = (register.Value & 2) > 0 ? 1 : 0;
                    bool[] changes = { interruptOld != interruptNew, signedOld != signedNew, overflowOld != overflowNew, zeroOld != zeroNew };
                    Processor.NotifyRegisterChanged(register);
                    Processor.NotifySRChanged(changes);
                }
                else
                {
                    Processor.registers = Processor.registers.SetItem(register.Type, register);
                    Processor.NotifyRegisterChanged(register);
                }
            }

            public void CreateBreakpoints(int[] breakPointArray)
            {
                IDictionary<int, Tuple<int, int>> breakpoints = new Dictionary<int, Tuple<int, int>>();

                for (int i = 0; i < breakPointArray.Length; i++)
                {
                    if (breakPointArray[i] != 0) breakpoints.Add(i, new Tuple<int, int>(breakPointArray[i], 0));
                }

                Processor.SetBreakpoints(breakpoints);
            }

            public void SetHalted(bool value)
            {
                if (disposed) { throw new InvalidOperationException("Mutative access to closed session"); }
                Processor.IsHalted = value;
                if (value) { Processor.NotifyHalt(); }
            }
        }
    }
}

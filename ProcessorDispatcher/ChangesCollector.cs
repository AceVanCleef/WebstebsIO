using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProcessorSimulation;
using System.Collections.ObjectModel;

namespace ProcessorDispatcher
{
    public class ChangesCollector : IChangesCollector
    {
        private Dictionary<byte, byte> ramChanges = new Dictionary<byte, byte>();
        public IReadOnlyDictionary<byte, byte> RamChanges => new ReadOnlyDictionary<byte, byte>(ramChanges);
        private AluCmd aluCommandChange = new AluCmd();
        public AluCmd AluCommandChange => aluCommandChange;
        private int mpmAddressChange = 0;
        public int MpmAddressChange => mpmAddressChange;
        private Dictionary<Registers, IRegister> registerChanges = new Dictionary<Registers, IRegister>();
        public IReadOnlyDictionary<Registers, IRegister> RegisterChanges => new ReadOnlyDictionary<Registers, IRegister>(registerChanges);
        private bool[] statusRegisterChanges = { false, false, false, false };
        public bool[] StatusRegisterChanges => statusRegisterChanges;
        public bool IsHalted { get; private set; }
        public bool IsPaused { get; private set; }
        private IProcessor processor = null;

        public void BindTo(IProcessor processor)
        {
            if(this.processor != null) { Unbind(); }
            this.processor = processor;
            processor.AluCommandChanged += AluCommandChanged;
            processor.MpmAddressChanged += MpmAddressChanged;
            processor.StatusRegisterChanged += StatusRegisterChanged;
            processor.RegisterChanged += RegisterChanged;
            processor.Ram.RamChanged += RamChanged;
            processor.Halted += Halted;
            statusRegisterChanges = new bool[4];
            ramChanges.Clear();
            registerChanges.Clear();
            IsHalted = false;
        }

        public void Unbind()
        {
            processor.AluCommandChanged -= AluCommandChanged;
            processor.MpmAddressChanged -= MpmAddressChanged;
            processor.StatusRegisterChanged -= StatusRegisterChanged;
            processor.RegisterChanged -= RegisterChanged;
            processor.Ram.RamChanged -= RamChanged;
            processor.Halted -= Halted;
        }

        private void AluCommandChanged(IProcessor processor, AluCmd command)
        {
            aluCommandChange = command;
        }

        private void MpmAddressChanged(IProcessor processor, int address)
        {
            mpmAddressChange = address;
        }

        private void RegisterChanged(IProcessor processor, IRegister register)
        {
            registerChanges[register.Type] = register;
        }

        private void StatusRegisterChanged(IProcessor processor, bool[] changes)
        {
            statusRegisterChanges = changes;
        }

        private void RamChanged(byte address, byte value)
        {
            ramChanges[address] = value;
        }

        private void Halted(IProcessor processor)
        {
            IsHalted = true;
        }
    }
}

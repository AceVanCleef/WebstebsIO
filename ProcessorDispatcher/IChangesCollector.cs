﻿using ProcessorSimulation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProcessorDispatcher
{
    /// <summary>
    /// Collector, which uses processor and ram events to find changes and collect them in the public dictionaries.
    /// </summary>
    public interface IChangesCollector
    {
        /// <summary>
        /// Binds the collector to the given processor. (Subscribes to its events.)
        /// </summary>
        /// <param name="processor"></param>
        void BindTo(IProcessor processor);

        /// <summary>
        /// Unbinds the collector from the previous processor. (Stops collecting data.)
        /// </summary>
        void Unbind();

        /// <summary>
        /// Change of the ALU command.
        /// </summary>
        AluCmd AluCommandChange { get; }

        /// <summary>
        /// Change of the mpm address.
        /// </summary>
        int MpmAddressChange { get; }

        /// <summary>
        /// Changes that happened to the ram during the subscribed phase.
        /// </summary>
        IReadOnlyDictionary<byte, byte> RamChanges { get; }

        /// <summary>
        /// Changes that happened to the registers during the subscribed phase.
        /// </summary>
        IReadOnlyDictionary<Registers, IRegister> RegisterChanges { get; }

        /// <summary>
        /// Which part of the status register changed.
        /// </summary>
        bool[] StatusRegisterChanges { get; }

        /// <summary>
        /// Determines, if the processor halted in the current step.
        /// </summary>
        bool IsHalted { get; }
    }
}

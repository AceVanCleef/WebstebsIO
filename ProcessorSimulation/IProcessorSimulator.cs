using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProcessorSimulation
{
    /// <summary>
    /// An instance of IProcessorSimulator contains all processor simulation logic.
    /// It has to be state-less, so the same IProcessorSimulator instance can simulate multiple processors at once.
    /// </summary>
    public interface IProcessorSimulator
    {
        /// <summary>
        /// Executes a micro step on the given processor.
        /// </summary>
        /// <param name="processor"></param>
        void ExecuteMicroStep(IProcessor processor);

        /// <summary>
        /// Executes a macro step on the given processor.
        /// </summary>
        /// <param name="processor"></param>
        void ExecuteMacroStep(IProcessor processor);

        /// <summary>
        /// Executes an instruction step on the given processor.
        /// </summary>
        /// <param name="processor"></param>
        void ExecuteInstructionStep(IProcessor processor);

        /// <summary>
        /// Undos a micro step on the given processor.
        /// </summary>
        /// <param name="processor"></param>
        void UndoMicroStep(IProcessor processor);

        /// <summary>
        /// Undos a macro step on the given processor.
        /// </summary>
        /// <param name="processor"></param>
        void UndoMacroStep(IProcessor processor);

        /// <summary>
        /// Undos an instruction step on the given processor.
        /// </summary>
        /// <param name="processor"></param>
        void UndoInstructionStep(IProcessor processor);

        /// <summary>
        /// Resets all registers of the processor, but keeps the same RAM.
        /// </summary>
        /// <param name="processor"></param>
        void SoftReset(IProcessor processor);

        /// <summary>
        /// Resets the RAM and all registers of the processor.
        /// </summary>
        /// <param name="processor"></param>
        void HardReset(IProcessor processor);
    }
}

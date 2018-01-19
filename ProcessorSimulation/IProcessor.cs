using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProcessorSimulation
{
    public interface IProcessor
    {
        /// <summary>Event that is fired, when the alu command changed.</summary>
        event Action<IProcessor, AluCmd> AluCommandChanged;
        /// <summary>Event that is fired, when the mpm address changed.</summary>
        event Action<IProcessor, int> MpmAddressChanged;
        /// <summary>Event that is fired, when the status register changed.</summary>
        event Action<IProcessor, bool[]> StatusRegisterChanged;
        /// <summary>Event that is fired, when a register changed.</summary>
        event Action<IProcessor, IRegister> RegisterChanged;
        /// <summary>Event, that is fired, when the halt instruction was simulated.</summary>
        event Action<IProcessor> Halted;

        IAlu Alu { get; }
        IReadOnlyRam Ram { get; }
        IDictionary<Registers, IRegister> Registers { get; }
        int MpmAddress { get; set; }
        AluCmd AluCommand { get; set; }

        /// <summary>Determines, if the processor stopped execution by executing a HALT instruction.</summary>
        bool IsHalted { get; }

        /// <summary>Returns the initial value of the stack pointer.</summary>
        uint InitialStackPointer { get; }

        /// <summary>Create session, with which the processor state can be modified.</summary>
        /// <returns>Session instance</returns>
        /// <remarks>This method can block, because only one session should exist and it should be used by one thread only.</remarks>
        IProcessorSession CreateSession();

        /// <summary>
        /// Pushes an IProcessorState onto the history stack.
        /// </summary>
        /// <param name="state"></param>
        void PushState(IProcessorState state);

        /// <summary>
        /// Checks if the program reached a breakpoint and handles is accordingly.
        /// </summary>
        bool HandleBreakpoint();

        /// <summary>
        /// Resets the history of the processor.
        /// </summary>
        void ResetStateHistory();
        /// <summary>
        /// Gets the top IProcessorState from the history stack.
        /// </summary>
        /// <returns></returns>
        IProcessorState PopState();

        /// <summary>
        /// Returns the dictionary with all breakpoints. (Key = Instruction point, Tuple Value1 = amount of iterations, Tuple Value2 = current iteration)
        /// </summary>
        /// <returns></returns>
        IDictionary<int, Tuple<int, int>> GetBreakpoints();

        /// <summary>
        /// Returns if the history stack is empty (used for undo button disable).
        /// </summary>
        bool IsHistoryStackEmpty();

        /// <summary>
        /// Sets the dictionary with all breakpoints. (Key = Instruction pointer, Tuple Value1 = amount of iterations, Tuple Value2 = current iteration)
        /// </summary>
        /// <param name="newBreakpoints"></param>
        void SetBreakpoints(IDictionary<int, Tuple<int, int>> newBreakpoints);

        /// <summary>Creates a session and executes the given action in this session.</summary>
        /// <param name="action"></param>
        void Execute(Action<IProcessorSession> action);
    }
}

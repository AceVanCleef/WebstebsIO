using System;
using System.Collections.Generic;
using static ProcessorSimulation.AluCmd;

namespace ProcessorSimulation
{
    /// <summary>
    /// Simulation of the ALU (arithmetic and logic unit).
    /// </summary>
    /// The ALU is the calculating part of the CPU. It executes mathematical and logical
    /// operations fed by two input registers (x and y).
    /// For unary commands solely x is used. Results are returned whereas stati are implicitly
    /// stored in the status register.
    public class Alu : IAlu
    {
        private static bool IsPos(byte b) { return (b & 0x80) == 0; }
        private static bool IsNeg(byte b) { return (b & 0x80) != 0; }
        private static bool IsZero(byte b) { return b == 0; }

        private static void SetZeroSigned(byte r, ref StatusRegister status, RegisterFactory registerFactory)
        {
            status = status.SetSigned(IsNeg(r), registerFactory);
            status = status.SetZero(IsZero(r), registerFactory);
        }

        private static byte Add(byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory)
        {
            byte r = (byte)(x + y);
            SetZeroSigned(r, ref status, registerFactory);
            status = status.SetOverflow((IsPos(x) && IsPos(y) && IsNeg(r)) || (IsNeg(x) && IsNeg(y) && IsPos(r)), registerFactory);
            return r;
        }

        private static byte Sub(byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory)
        {
            byte r = (byte)(x - y);
            SetZeroSigned(r, ref status, registerFactory);
            status = status.SetOverflow((IsNeg(x) && IsPos(y) && IsPos(r)) || (IsPos(x) && IsNeg(y) && IsNeg(r)), registerFactory);
            return r;
        }

        private delegate byte AluFunc(byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory);

        /// <summary>
        /// Dictonary with all ALU operations and associated ALU operations.
        /// </summary>
        private Dictionary<AluCmd, AluFunc> commands = new Dictionary<AluCmd, AluFunc>()
        {
            [NOP] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                status = status.SetSigned(false, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                status = status.SetZero(true, registerFactory);
                return 0;
            },
            [ADD] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                return Add(x, y, ref status, registerFactory);
            },
            [SUB] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                return Sub(x, y, ref status, registerFactory);
            },
            [MUL] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                bool isNeg = IsPos(x) ^ IsPos(y);        // true if x and y have different MSBs
                byte absX = IsPos(x) ? x : (byte)(-x);
                byte absY = IsPos(y) ? y : (byte)(-y);
                byte r = (byte)(x * y);
                SetZeroSigned(r, ref status, registerFactory);
                bool isInRange = (absX * absY) <= (0x7F + (isNeg ? 0 : 1));
                status = status.SetOverflow(!isInRange, registerFactory);
                return r;
            },
            [DIV] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                bool isNeg = IsPos(x) ^ IsPos(y);        // true if x and y have different MSBs
                byte absX = IsPos(x) ? x : (byte)(-x);
                byte absY = IsPos(y) ? y : (byte)(-y);
                byte absR = (byte)(absX / absY);
                byte r = (isNeg ? (byte)(-absR) : absR);
                status = status.SetSigned((absR == 0 ? false : isNeg), registerFactory);  // S = 0 if zero
                status = status.SetZero(absR == 0, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                return r;
            },
            // Cp. https://software.intel.com/en-us/node/679570#2CA63EEE-225E-4CEB-8261-D0204CC354F9
            [MOD] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                byte absX = IsPos(x) ? x : (byte)(-x);
                byte absY = IsPos(y) ? y : (byte)(-y);
                byte absR = (byte)(absX % absY);
                byte r = (IsNeg(x) ? (byte)(-absR) : absR);
                SetZeroSigned(r, ref status, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                return r;
            },
            [DEC] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                return Sub(x, 1, ref status, registerFactory);
            },
            [INC] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                return Add(x, 1, ref status, registerFactory);
            },
            [OR] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                byte r = (byte)(x | y);
                SetZeroSigned(r, ref status, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                return r;
            },
            [XOR] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                byte r = (byte)(x ^ y);
                SetZeroSigned(r, ref status, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                return r;
            },
            [NOT] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                byte r = (byte)(~x);
                SetZeroSigned(r, ref status, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                return r;
            },
            [AND] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                byte r = (byte)(x & y);
                SetZeroSigned(r, ref status, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                return r;
            },
            [SHR] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                byte r = (byte)(x >> 1);
                SetZeroSigned(r, ref status, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                return r;
            },
            [SHL] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                byte r = (byte)(x << 1);
                SetZeroSigned(r, ref status, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                return r;
            },
            [ROR] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                byte r = (byte)(x >> 1 | ((x & 0x01) << 7));
                SetZeroSigned(r, ref status, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                return r;
            },
            [ROL] = (byte x, byte y, ref StatusRegister status, RegisterFactory registerFactory) => {
                byte r = (byte)(x << 1 | ((x & 0x80) >> 7));
                SetZeroSigned(r, ref status, registerFactory);
                status = status.SetOverflow(false, registerFactory);
                return r;
            },
        };

        private readonly RegisterFactory registerFactory;

        public Alu(RegisterFactory registerFactory)
        {
            this.registerFactory = registerFactory;
        }

        public byte Execute(AluCmd command, byte x, byte y, ref StatusRegister status)
        {
            return (byte)commands[command](x, y, ref status, registerFactory);
        }
    }
}

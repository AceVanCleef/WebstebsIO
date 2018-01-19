using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using ProcessorSimulation;
using System.Collections.Generic;
using static ProcessorSimulation.AluCmd;
using Microsoft.Practices.Unity;

namespace Stebs5.Tests.ProcessorSimulation
{
    [TestClass]
    public class AluTest
    {

        private Alu alu;

        [TestInitialize]
        public void Setup()
        {
            alu = new Alu((registers, value, highlight) => new Register(registers, value, highlight));
        }

        [TestMethod]
        public void TestExecute()
        {
            // Test cases in tuples: command, x, y, expected result
            Func<AluCmd, byte, byte, byte, byte, Tuple<AluCmd, byte, byte, byte, byte>> test = Tuple.Create;
            Func<int, int, int, byte> status = (s, o, z) => (byte)((s << 3) | (o << 2) | (z << 1));

            var testCases = new List<Tuple<AluCmd, byte, byte, byte, byte>>()
            {
                // NOP
                test(NOP, 0x00, 0x00, 0x00, status(0, 0, 1)),

                // ADD
                // Zero                                             x  +  y  =  res
                test(ADD, 0x00, 0x00, 0x00, status(0, 0, 1)),   //  zero  zero  zero
                test(ADD, 0x10, 0x00, 0x10, status(0, 0, 0)),   //  pos   zero  pos
                test(ADD, 0x00, 0x10, 0x10, status(0, 0, 0)),   //  zero  pos   pos
                test(ADD, 0xF0, 0x00, 0xF0, status(1, 0, 0)),   //  neg   zero  neg
                test(ADD, 0x00, 0xF0, 0xF0, status(1, 0, 0)),   //  zero  neg   neg
                test(ADD, 0x80, 0x80, 0x00, status(0, 1, 1)),   //  neg   neg   zero
                // Sign, Overflow
                test(ADD, 0x10, 0x10, 0x20, status(0, 0, 0)),   //  pos   pos   pos
                test(ADD, 0x50, 0x50, 0xA0, status(1, 1, 0)),   //  pos   pos   neg
                test(ADD, 0x70, 0xF0, 0x60, status(0, 0, 0)),   //  pos   neg   pos
                test(ADD, 0x50, 0x90, 0xE0, status(1, 0, 0)),   //  pos   neg   neg
                test(ADD, 0xF0, 0x30, 0x20, status(0, 0, 0)),   //  neg   pos   pos
                test(ADD, 0x90, 0x10, 0xA0, status(1, 0, 0)),   //  neg   pos   neg
                test(ADD, 0x90, 0x90, 0x20, status(0, 1, 0)),   //  neg   neg   pos
                test(ADD, 0xF0, 0xF0, 0xE0, status(1, 0, 0)),   //  neg   neg   neg

                // SUB
                // Zero                                             x  -  y  =  res
                test(SUB, 0x00, 0x00, 0x00, status(0, 0, 1)),   //  zero  zero  zero
                test(SUB, 0x10, 0x00, 0x10, status(0, 0, 0)),   //  pos   zero  pos
                test(SUB, 0x00, 0x10, 0xF0, status(1, 0, 0)),   //  zero  pos   neg
                test(SUB, 0xF0, 0x00, 0xF0, status(1, 0, 0)),   //  neg   zero  neg
                test(SUB, 0x00, 0xF0, 0x10, status(0, 0, 0)),   //  zero  neg   pos
                test(SUB, 0x80, 0x80, 0x00, status(0, 0, 1)),   //  neg   neg   zero
                test(SUB, 0x7F, 0x7F, 0x00, status(0, 0, 1)),   //  pos   pos   zero
                // Sign, Overflow
                test(SUB, 0x30, 0x10, 0x20, status(0, 0, 0)),   //  pos   pos   pos
                test(SUB, 0x50, 0x60, 0xF0, status(1, 0, 0)),   //  pos   pos   neg
                test(SUB, 0x20, 0xB0, 0x70, status(0, 0, 0)),   //  pos   neg   pos
                test(SUB, 0x70, 0xE0, 0x90, status(1, 1, 0)),   //  pos   neg   neg
                test(SUB, 0xD0, 0x60, 0x70, status(0, 1, 0)),   //  neg   pos   pos
                test(SUB, 0xA0, 0x10, 0x90, status(1, 0, 0)),   //  neg   pos   neg
                test(SUB, 0x90, 0x80, 0x10, status(0, 0, 0)),   //  neg   neg   pos
                test(SUB, 0x80, 0x90, 0xF0, status(1, 0, 0)),   //  neg   neg   neg
                
                // Signed MUL
                // Zero                                             x  *  y  =  res
                test(MUL, 0x00, 0x00, 0x00, status(0, 0, 1)),   //  zero  zero  zero
                test(MUL, 0x10, 0x00, 0x00, status(0, 0, 1)),   //  pos   zero  zero
                test(MUL, 0x00, 0x10, 0x00, status(0, 0, 1)),   //  zero  pos   zero
                test(MUL, 0xA0, 0x00, 0x00, status(0, 0, 1)),   //  neg   zero  zero
                test(MUL, 0x00, 0xA0, 0x00, status(0, 0, 1)),   //  zero  neg   zero
                // Sign, Overflow
                test(MUL, 0x05, 0x19, 0x7D, status(0, 0, 0)),   //  pos   pos   pos
                test(MUL, 0x05, 0x1A, 0x82, status(1, 1, 0)),   //  pos   pos   neg
                test(MUL, 0xFB, 0x19, 0x83, status(1, 0, 0)),   //  neg   pos   neg
                test(MUL, 0xFB, 0x1A, 0x7E, status(0, 1, 0)),   //  neg   pos   pos
                test(MUL, 0x05, 0xE7, 0x83, status(1, 0, 0)),   //  pos   neg   neg
                test(MUL, 0x05, 0xE6, 0x7E, status(0, 1, 0)),   //  pos   neg   pos
                test(MUL, 0xFB, 0xE7, 0x7D, status(0, 0, 0)),   //  neg   neg   pos
                test(MUL, 0xFB, 0xE6, 0x82, status(1, 1, 0)),   //  neg   neg   neg
                // Overflow
                test(MUL, 0x04, 0x23, 0x8C, status(1, 1, 0)),   //  pos   pos   neg

                // Signed DIV
                // Zero -- division by zero NOT tested              x  /  y  =  res
                test(DIV, 0x00, 0x01, 0x00, status(0, 0, 1)),   //  zero  pos   zero
                test(DIV, 0x00, 0x81, 0x00, status(0, 0, 1)),   //  zero  neg   zero
                test(DIV, 0x01, 0x02, 0x00, status(0, 0, 1)),   //  pos   pos   zero
                test(DIV, 0x01, 0xFE, 0x00, status(0, 0, 1)),   //  pos   neg   zero
                test(DIV, 0xFF, 0x02, 0x00, status(0, 0, 1)),   //  neg   pos   zero
                test(DIV, 0xFF, 0xFE, 0x00, status(0, 0, 1)),   //  neg   neg   zero
                // Sign
                test(DIV, 0x32, 0x05, 0x0A, status(0, 0, 0)),   //  pos   pos   pos
                test(DIV, 0xCE, 0x05, 0xF6, status(1, 0, 0)),   //  neg   pos   neg
                test(DIV, 0x50, 0xF6, 0xF8, status(1, 0, 0)),   //  pos   neg   neg
                test(DIV, 0xCE, 0xF6, 0x05, status(0, 0, 0)),   //  neg   neg   pos

                // Signed MOD
                // https://software.intel.com/en-us/node/679570#2CA63EEE-225E-4CEB-8261-D0204CC354F9
                // Zero -- division by zero NOT tested              x  /  y  =  res
                test(MOD, 0x00, 0x01, 0x00, status(0, 0, 1)),   //  zero  pos   zero
                test(MOD, 0x05, 0x05, 0x00, status(0, 0, 1)),   //  pos   pos   zero
                test(MOD, 0x05, 0xFB, 0x00, status(0, 0, 1)),   //  pos   neg   zero
                test(MOD, 0xFB, 0x05, 0x00, status(0, 0, 1)),   //  neg   pos   zero
                test(MOD, 0xFB, 0xFB, 0x00, status(0, 0, 1)),   //  neg   neg   zero
                // Sign
                test(MOD, 0x08, 0x05, 0x03, status(0, 0, 0)),   //  pos   pos   pos
                test(MOD, 0x08, 0xFB, 0x03, status(0, 0, 0)),   //  pos   neg   pos
                test(MOD, 0xF8, 0x05, 0xFD, status(1, 0, 0)),   //  neg   pos   neg
                test(MOD, 0xF8, 0xFB, 0xFD, status(1, 0, 0)),   //  neg   neg   neg

                // DEC
                //                                                  x  -  1  =  res
                test(DEC, 0x00, 0x80, 0xFF, status(1, 0, 0)),   //  zero        neg
                test(DEC, 0x01, 0x80, 0x00, status(0, 0, 1)),   //  pos         zero
                test(DEC, 0x40, 0x80, 0x3F, status(0, 0, 0)),   //  pos         pos
                test(DEC, 0x80, 0x80, 0x7F, status(0, 1, 0)),   //  neg         pos
                test(DEC, 0xA0, 0x80, 0x9F, status(1, 0, 0)),   //  neg         neg

                // INC
                //                                                  x  +  1  =  res
                test(INC, 0xFF, 0x80, 0x00, status(0, 0, 1)),   //  neg         zero
                test(INC, 0x00, 0x80, 0x01, status(0, 0, 0)),   //  zero        pos
                test(INC, 0x40, 0x80, 0x41, status(0, 0, 0)),   //  pos         pos
                test(INC, 0x7F, 0x80, 0x80, status(1, 1, 0)),   //  pos         neg
                test(INC, 0xA0, 0x80, 0xA1, status(1, 0, 0)),   //  neg         neg

                // OR
                // Zero                                             x  |  1  =  res
                test(OR, 0x00, 0x00, 0x00, status(0, 0, 1)),    //  zero  zero  zero
                test(OR, 0x00, 0x44, 0x44, status(0, 0, 0)),    //  zero  pos   pos
                test(OR, 0x00, 0x99, 0x99, status(1, 0, 0)),    //  zero  neg   neg
                test(OR, 0x44, 0x00, 0x44, status(0, 0, 0)),    //  pos   zero  pos
                test(OR, 0x99, 0x00, 0x99, status(1, 0, 0)),    //  neg   zero  neg
                // Sign
                test(OR, 0x22, 0x44, 0x66, status(0, 0, 0)),    //  pos   pos   pos
                test(OR, 0x22, 0x99, 0xBB, status(1, 0, 0)),    //  pos   neg   neg
                test(OR, 0x99, 0x44, 0xDD, status(1, 0, 0)),    //  neg   pos   neg
                test(OR, 0x99, 0xBB, 0xBB, status(1, 0, 0)),    //  neg   neg   neg

                // XOR
                // Zero                                             x  ^  1  =  res
                test(XOR, 0x00, 0x00, 0x00, status(0, 0, 1)),   //  zero  zero  zero
                test(XOR, 0x00, 0x44, 0x44, status(0, 0, 0)),   //  zero  pos   pos
                test(XOR, 0x00, 0x99, 0x99, status(1, 0, 0)),   //  zero  neg   neg
                test(XOR, 0x44, 0x00, 0x44, status(0, 0, 0)),   //  pos   zero  pos
                test(XOR, 0x99, 0x00, 0x99, status(1, 0, 0)),   //  neg   zero  neg
                test(XOR, 0x77, 0x77, 0x00, status(0, 0, 1)),   //  pos   pos   zero
                test(XOR, 0x99, 0x99, 0x00, status(0, 0, 1)),   //  neg   neg   zero
                // Sign
                test(XOR, 0x66, 0x44, 0x22, status(0, 0, 0)),   //  pos   pos   pos
                test(XOR, 0x11, 0x99, 0x88, status(1, 0, 0)),   //  pos   neg   neg
                test(XOR, 0x99, 0x11, 0x88, status(1, 0, 0)),   //  neg   pos   neg
                test(XOR, 0x99, 0x88, 0x11, status(0, 0, 0)),   //  neg   neg   pos

                // NOT
                //                                                  ~x       =  res
                test(NOT, 0x00, 0x80, 0xFF, status(1, 0, 0)),   //  zero        neg
                test(NOT, 0xFF, 0x80, 0x00, status(0, 0, 1)),   //  neg         zero
                test(NOT, 0x80, 0x80, 0x7F, status(0, 0, 0)),   //  neg         pos
                test(NOT, 0x7F, 0x80, 0x80, status(1, 0, 0)),   //  pos         neg

                // AND
                // Zero                                             x  &  1  =  res
                test(AND, 0x00, 0x00, 0x00, status(0, 0, 1)),   //  zero  zero  zero
                test(AND, 0x00, 0x44, 0x00, status(0, 0, 1)),   //  zero  pos   zero
                test(AND, 0x00, 0x99, 0x00, status(0, 0, 1)),   //  zero  neg   zero
                test(AND, 0x44, 0x00, 0x00, status(0, 0, 1)),   //  pos   zero  zero
                test(AND, 0x99, 0x00, 0x00, status(0, 0, 1)),   //  neg   zero  zero
                // Sign
                test(AND, 0x77, 0x66, 0x66, status(0, 0, 0)),   //  pos   pos   pos
                test(AND, 0x11, 0x99, 0x11, status(0, 0, 0)),   //  pos   neg   pos
                test(AND, 0x99, 0x11, 0x11, status(0, 0, 0)),   //  neg   pos   pos
                test(AND, 0x99, 0x88, 0x88, status(1, 0, 0)),   //  neg   neg   neg

                // SHR
                // Zero                                             x >> 1   =  res
                test(SHR, 0x00, 0x80, 0x00, status(0, 0, 1)),   //  zero        zero
                test(SHR, 0x01, 0x80, 0x00, status(0, 0, 1)),   //  pos         zero
                // Sign
                test(SHR, 0xFF, 0x80, 0x7F, status(0, 0, 0)),   //  neg         pos
                test(SHR, 0x44, 0x80, 0x22, status(0, 0, 0)),   //  pos         pos

                // SHL
                // Zero                                             x << 1   =  res
                test(SHL, 0x00, 0x80, 0x00, status(0, 0, 1)),   //  zero        zero
                test(SHL, 0x80, 0x80, 0x00, status(0, 0, 1)),   //  neg         zero
                // Sign
                test(SHL, 0x22, 0x80, 0x44, status(0, 0, 0)),   //  pos         pos
                test(SHL, 0x7F, 0x80, 0xFE, status(1, 0, 0)),   //  pos         neg
                test(SHL, 0x88, 0x80, 0x10, status(0, 0, 0)),   //  neg         pos
                test(SHL, 0xCC, 0x80, 0x98, status(1, 0, 0)),   //  neg         neg

                // ROR
                // Zero                                             ror 1    =  res
                test(ROR, 0x00, 0x80, 0x00, status(0, 0, 1)),   //  zero        zero
                // Sign
                test(ROR, 0x22, 0x80, 0x11, status(0, 0, 0)),   //  pos         pos
                test(ROR, 0x11, 0x80, 0x88, status(1, 0, 0)),   //  pos         neg
                test(ROR, 0x80, 0x80, 0x40, status(0, 0, 0)),   //  neg         pos
                test(ROR, 0x99, 0x80, 0xCC, status(1, 0, 0)),   //  neg         neg
                
                // ROL
                // Zero                                             rol 1    =  res
                test(ROL, 0x00, 0x80, 0x00, status(0, 0, 1)),   //  zero        zero
                // Sign
                test(ROL, 0x22, 0x80, 0x44, status(0, 0, 0)),   //  pos         pos
                test(ROL, 0x66, 0x80, 0xCC, status(1, 0, 0)),   //  pos         neg
                test(ROL, 0x80, 0x80, 0x01, status(0, 0, 0)),   //  neg         pos
                test(ROL, 0xCC, 0x80, 0x99, status(1, 0, 0)),   //  neg         neg
            };

            // Test each case
            StatusRegister register = new StatusRegister(new Register(Registers.Status, 0, false));
            foreach(var testCase in testCases)
            {
                var expSignVal = (testCase.Item5 >> 3) & 1;
                var expOverflowVal = (testCase.Item5 >> 2) & 1;
                var expZeroVal = (testCase.Item5 >> 1) & 1;
                var actSignVal = (register.Value >> 3) & 1;
                var actOverflowVal = (register.Value >> 2) & 1;
                var actZeroVal = (register.Value >> 1) & 1;
                var actualValue = alu.Execute(testCase.Item1, testCase.Item2, testCase.Item3, ref register);
                string id = $"\n{testCase.Item1} {testCase.Item2.ToString("X")},{testCase.Item3.ToString("X")}" +
                            $"\nResult, expected: {testCase.Item4.ToString("X")}  actual:  {actualValue.ToString("X")}" +
                            $"\nSOZ, expected: {expSignVal}{expOverflowVal}{expZeroVal}  actual:  {actSignVal}{actOverflowVal}{actZeroVal}";
                Assert.AreEqual(testCase.Item4, actualValue, id);
                Assert.IsTrue(((byte)register.Value) == testCase.Item5, id);
            }
        }

        [TestMethod]
        public void TestDivisionByZero()
        {
            try
            {
                StatusRegister status = new StatusRegister(new Register(Registers.Status, 0, false));
                alu.Execute(DIV, 5, 0, ref status);
                Assert.Fail("Division by 0 doesn't throw an exception");
            }
            catch (DivideByZeroException) { }
        }
    }
}

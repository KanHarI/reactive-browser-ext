test("Jest sanity", () => {
  expect(1).toBe(1);
}, 10);

// class TestSampleClass {
//   public myStr: string;
//   public myVal: number;
//
//   constructor(myValParam: number) {
//     this.myVal = myValParam;
//     this.myStr = "AAAA";
//     this.myVal += 1;
//   }
// }
//
// test("Test leader shared custom handler", async () => {
//   const accessed_key_counter: Record<string, number> = {};
//   const handlers = {
//     defineProperty: function (
//       target: Record<string, unknown>,
//       key: string,
//       desc: Record<string, never>
//     ) {
//       if (!(key in accessed_key_counter)) {
//         accessed_key_counter[key] = 0;
//       }
//       accessed_key_counter[key] += 1;
//       return Promise.resolve(Reflect.defineProperty(target, key, desc));
//     },
//   };
//
//   const testLeader = new LeaderShared<TestSampleClass>(
//     TestSampleClass,
//     [3],
//     handlers
//   ).leaderProxy as TestSampleClass & Shared<TestSampleClass>;
//   testLeader.myVal += 2;
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   await testLeader.atomicCallback(() => {});
//   // Awaiting an atomic action syncs our object
//   expect(accessed_key_counter["myStr"]).toBe(1);
//   expect(accessed_key_counter["myVal"]).toBe(3);
//   expect(testLeader.myVal).toBe(6);
//   let updateCounter = 0;
//   testLeader.addPostUpdateCallback("test", () => {
//     updateCounter++;
//     return Promise.resolve();
//   });
//   await testLeader.atomicCallback((x) => {
//     x.myStr = "BBB";
//   });
//   expect(testLeader.myStr).toBe("BBB");
//   expect(accessed_key_counter["myStr"]).toBe(1);
//   await testLeader.asyncAtomicCallback(async (x) => {
//     await sleep(100);
//     x.myStr = "CCC";
//   });
//   expect(testLeader.myStr).toBe("CCC");
//   expect(accessed_key_counter["myStr"]).toBe(1);
//   expect(updateCounter).toBe(2);
//   testLeader.myVal++;
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   await testLeader.atomicCallback(() => {});
//   expect(updateCounter).toBe(3);
// });
//
// test("State set new prop", async () => {
//   const testLeader = new LeaderShared<TestSampleClass>(TestSampleClass, [3])
//     .leaderProxy as TestSampleClass & Shared<TestSampleClass>;
//   ((testLeader as unknown) as Record<string, unknown>).newProp = 5;
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   await testLeader.atomicCallback(() => {});
//   expect(((testLeader as unknown) as Record<string, number>).newProp).toBe(5);
// });
//
// test("Throw on setting function prop", async () => {
//   const testLeader = new LeaderShared<TestSampleClass>(TestSampleClass, [3])
//     .leaderProxy as TestSampleClass & Shared<TestSampleClass>;
//   const throwsFunc = () => {
//     // eslint-disable-next-line @typescript-eslint/no-empty-function
//     ((testLeader as unknown) as Record<string, unknown>).newProp = () => {};
//   };
//   expect(throwsFunc).toThrow();
// });
//
// test("Throw on setting object prop", async () => {
//   const testLeader = new LeaderShared<TestSampleClass>(TestSampleClass, [3])
//     .leaderProxy as TestSampleClass & Shared<TestSampleClass>;
//   const throws = () => {
//     // eslint-disable-next-line @typescript-eslint/no-empty-function
//     ((testLeader as unknown) as Record<string, unknown>).newProp = { a: 1 };
//   };
//   expect(throws).toThrow();
// });
//
// class ClassWithObjects {
//   public myObj: Record<string, unknown>;
//
//   constructor() {
//     this.myObj = { a: 1 };
//   }
// }
//
// test("Disallow classes with objects", () => {
//   const throws = () => {
//     const leaderShared = new LeaderShared<ClassWithObjects>(
//       ClassWithObjects,
//       []
//     ).leaderProxy as ClassWithObjects & Shared<ClassWithObjects>;
//     leaderShared.myObj.a = 2;
//   };
//   expect(throws).toThrow();
// });

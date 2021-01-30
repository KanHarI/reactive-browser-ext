import {
  AbstractProxy,
  addRootWatcher,
  addWatcherOn,
  deepCopyToReactiveProxy,
  RecordProxy,
} from "../src";

test("Jest sanity", () => {
  expect(1).toBe(1);
}, 10);

test("RecordProxy sanity", () => {
  const myReactiveRecord: Record<
    string,
    unknown
  > = new RecordProxy().$getProxy();
  myReactiveRecord.newProp = 2;
  expect(myReactiveRecord.newProp).toBe(2);
});

interface SimpleInterface extends Record<string, unknown> {
  myNum: number;
  myStr: string;
}

test("RecordProxy immutables tracking", () => {
  const mySimpleInterface: RecordProxy &
    SimpleInterface = deepCopyToReactiveProxy<SimpleInterface>({
    myNum: 2,
    myStr: "abc",
  });
  const myNumHistory: Array<number | null> = [mySimpleInterface.myNum];
  mySimpleInterface.$addPostUpdateCallbackOn(
    "myNum",
    "myNumHistoryCounter",
    (val: number | null) => {
      myNumHistory.push(val);
    }
  );
  mySimpleInterface.myNum = 7;
  mySimpleInterface.myNum--;
  mySimpleInterface.myStr += "d"; // Modifying myStr - should not affect myNum callbacks
  expect(JSON.stringify(myNumHistory)).toBe(JSON.stringify([2, 7, 6]));
  expect(mySimpleInterface.myStr).toBe("abcd");
});

test("RecordProxy immutables tracking with watcher", () => {
  const mySimpleInterface: RecordProxy &
    SimpleInterface = deepCopyToReactiveProxy<SimpleInterface>({
    myNum: 2,
    myStr: "abc",
  });
  const myNumHistory: Array<number | null> = [mySimpleInterface.myNum];
  addWatcherOn(
    mySimpleInterface,
    "myNum",
    "myNumHistoryCounter",
    (val: number | null) => {
      myNumHistory.push(val);
    }
  );
  mySimpleInterface.myNum = 7;
  mySimpleInterface.myNum--;
  mySimpleInterface.myStr += "d"; // Modifying myStr - should not affect myNum callbacks
  expect(JSON.stringify(myNumHistory)).toBe(JSON.stringify([2, 7, 6]));
  expect(mySimpleInterface.myStr).toBe("abcd");
});

interface NestedInterface extends Record<string, unknown> {
  internal: SimpleInterface;
}

test("RecordProxy mutable tracking", () => {
  const myNestedInterface: NestedInterface &
    AbstractProxy = deepCopyToReactiveProxy({
    internal: { myNum: 0, myStr: "" },
  });
  let callFromParentCount = 0;
  let callFromChildCount = 0;
  myNestedInterface.$addPostUpdateCallbackOn(
    "internal",
    "callFromParent",
    () => {
      callFromParentCount++;
    }
  );
  ((myNestedInterface.internal as unknown) as AbstractProxy).$addPostUpdateCallback(
    "callFromChild",
    () => {
      callFromChildCount++;
    }
  );
  myNestedInterface.internal = { myNum: 1, myStr: "a" };
  expect(callFromParentCount).toBe(1);
  expect(callFromChildCount).toBe(1);
});

test("RecordProxy mutable tracking with watchers", () => {
  const myNestedInterface = deepCopyToReactiveProxy<NestedInterface>({
    internal: { myNum: 0, myStr: "" },
  });
  let callFromParentCount = 0;
  let callFromChildCount = 0;
  addWatcherOn(myNestedInterface, "internal", "callFromParent", () => {
    callFromParentCount++;
  });
  addRootWatcher(myNestedInterface.internal, "callFromChild", () => {
    callFromChildCount++;
  });
  myNestedInterface.internal = { myNum: 1, myStr: "a" };
  expect(callFromParentCount).toBe(1);
  expect(callFromChildCount).toBe(1);
});

test("Test array assignment", () => {
  const myReactiveArray = deepCopyToReactiveProxy<Array<unknown>>([]);
  let element2ModCounter = 0;
  myReactiveArray.$addPostUpdateCallbackOn("2", "strOnCallbackDetect", () => {
    element2ModCounter++;
  });
  expect(element2ModCounter).toBe(0);
  myReactiveArray.push(7);
  myReactiveArray.push(7);
  expect(element2ModCounter).toBe(0);
  myReactiveArray.push(7);
  expect(element2ModCounter).toBe(1);
  myReactiveArray.pop();
  expect(element2ModCounter).toBe(2);
  myReactiveArray.pop();
  expect(element2ModCounter).toBe(2);
  myReactiveArray.unshift(7);
  myReactiveArray.unshift(7);
  expect(element2ModCounter).toBe(3);
  myReactiveArray.shift();
  expect(element2ModCounter).toBe(4);
});

test("Illegal array assignment", () => {
  const throws = () => {
    const myReactiveArray = deepCopyToReactiveProxy<Array<unknown>>([]);
    myReactiveArray["a"] = 5;
  };

  expect(throws).toThrow();
});

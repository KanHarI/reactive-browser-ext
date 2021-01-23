import { RecordProxy } from "../src";
import { deepCopyRecordToProxy } from "../src";
import { ProxyInterface } from "../lib";

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

interface SimpleInterface {
  myNum: number;
  myStr: string;
}

test("RecordProxy immutables tracking", () => {
  const mySimpleInterface: RecordProxy &
    SimpleInterface = deepCopyRecordToProxy<SimpleInterface>({
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

interface NestedInterface {
  internal: null | SimpleInterface;
}

test("RecordProxy mutable tracking", () => {
  const myNestedInterface: NestedInterface &
    ProxyInterface = deepCopyRecordToProxy({ internal: null });
  let callFromParentCount = 0;
  let callFromChildCount = 0;
  myNestedInterface.$addPostUpdateCallbackOn(
    "internal",
    "callFromParent",
    () => {
      callFromParentCount++;
    }
  );
  ((myNestedInterface.internal as unknown) as ProxyInterface).$addPostUpdateCallback(
    "callFromChild",
    () => {
      callFromChildCount++;
    }
  );
  myNestedInterface.internal = { myNum: 1, myStr: "a" };
  expect(callFromParentCount).toBe(1);
  expect(callFromChildCount).toBe(1);
});

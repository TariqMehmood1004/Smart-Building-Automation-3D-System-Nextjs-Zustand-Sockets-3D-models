"use client";

import React, { useState } from "react";
import { Button, Form, NumberInput } from "@heroui/react";
import { Power, PowerOff, ChevronUp, ChevronDown } from "lucide-react";

export default function THvacValueNumber() {
  const [amount, setAmount] = useState<number | null>(23.8);
  const [rawInput, setRawInput] = useState("23.8"); // <-- new raw input
  const [isOn, setIsOn] = useState(true);

  // format display value
  const formatValue = (val: string) => {
    if (val.trim() === "" || isNaN(Number(val))) return ["0", ""];
    const [intPart, decimalPart] = Number(val).toFixed(1).split(".");
    return [intPart, decimalPart ? `.${decimalPart}` : ""];
  };

  const [intPart, decimalPart] = formatValue(rawInput);

  const increase = () => {
    if (isOn && amount !== null) {
      setAmount((prev) => {
        const next = Math.min((prev ?? 0) + 1, 100);
        setRawInput(next.toFixed(1)); // keep raw synced
        return parseFloat(next.toFixed(1));
      });
    }
  };

  const decrease = () => {
    if (isOn && amount !== null) {
      setAmount((prev) => {
        const next = Math.max((prev ?? 0) - 1, 0);
        setRawInput(next.toFixed(1));
        return parseFloat(next.toFixed(1));
      });
    }
  };

  return (
    <div className="flex items-center w-50 justify-center gap-6">
      <div className="flex flex-col items-center gap-3">
        <Form
          className="flex flex-col items-center"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative flex items-center gap-2">
            {/* Hidden functional input */}
            <NumberInput
              hideStepper
              inputMode="decimal"
              value={Number(rawInput)}
              onChange={(e) => {
                const val = typeof e === "number" ? String(e) : e.target.value;

                setRawInput(val);

                if (!isNaN(Number(val)) && val.trim() !== "") {
                  setAmount(Number(val));
                } else {
                  setAmount(null);
                }
              }}
              disabled={!isOn}
              classNames={{
                inputWrapper:
                  "bg-transparent p-0 m-0 border-none shadow-none focus:outline-none focus:ring-0",
                input:
                  "text-transparent p-0 m-0 caret-white selection:bg-gray-600 text-7xl font-bold leading-none focus:outline-none focus:ring-0",
              }}
            />

            {/* Custom styled display */}
            <div className="absolute inset-0 flex items-end justify-center pointer-events-none px-3">
              <span
                className={`text-7xl font-bold leading-none ${
                  isOn ? "text-white" : "text-[#A1A5A3]"
                }`}
              >
                {intPart}
              </span>
              <span
                className={`text-4xl font-medium leading-none ${
                  isOn ? "text-[#A1A5A3]" : "text-[#A1A5A3]"
                }`}
              >
                {decimalPart}
              </span>
            </div>
          </div>
        </Form>

        {/* Power button */}
        <Button
          onClick={() => setIsOn((prev) => !prev)}
          variant="bordered"
          className="capitalize border border-[#3B3A3A] flex items-center gap-2 px-4 py-2 rounded text-[16px] text-[#A1A5A3]"
        >
          {isOn ? <Power size={22} /> : <PowerOff size={22} />}
        </Button>
      </div>

      {/* Up/Down buttons */}
      <div className="flex flex-col gap-2 ml-4">
        <button
          type="button"
          onClick={increase}
          disabled={!isOn}
          className={`p-2 rounded-full hover:bg-[#444946] transition-all duration-300 ${
            !isOn ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <ChevronUp size={20} className="text-white" />
        </button>
        <button
          type="button"
          onClick={decrease}
          disabled={!isOn}
          className={`p-2 rounded-full hover:bg-[#444946] transition-all duration-300 ${
            !isOn ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <ChevronDown size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}

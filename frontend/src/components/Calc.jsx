import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllMetals } from "../store/metals/metalsSlice";

const Calc = () => {
  const { metals } = useSelector((state) => state.metal);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllMetals());
  }, [dispatch]);

  // State variables
  const [selectedPrice, setSelectedPrice] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [grams, setGrams] = useState(""); // State for grams input
  const [workmanship, setWorkmanship] = useState(""); // State for workmanship input
  const [activeTab, setActiveTab] = useState(""); // State for active tab (Metal or Diamond)

  // Purity multipliers for gold
  const goldPurities = [
    { label: "24k", multiplier: 1 },
    { label: "21k", multiplier: 0.857 },
    { label: "18k", multiplier: 0.75 },
  ];

  // Handle dropdown selection
  const handleMetalChange = (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const price = selectedOption.getAttribute("data-price");
    setSelectedPrice(price || ""); // Set selected price
    setCurrentInput(price || ""); // Set as initial input in calculator
  };

  // Handle button clicks
  const handleButtonClick = (value) => {
    if (value === "Erase") {
      clearInput();
    } else {
      setCurrentInput((prev) => prev + value);
    }
  };

  // Clear input
  const clearInput = () => {
    setCurrentInput("");
    setGrams("");
    setWorkmanship("");
  };

  // Calculate total price based on the most recent input values
  const calculateTotalPrice = (updatedGrams = grams, updatedWorkmanship = workmanship) => {
    if (selectedPrice && updatedGrams) {
      const basePrice = parseFloat(selectedPrice) * parseFloat(updatedGrams);
      const workmanshipFee = parseFloat(updatedWorkmanship) || 0; // Default to 0 if empty
      const total = (basePrice + workmanshipFee).toFixed(2);
      setCurrentInput(total); // Update the output field with the total price
    } else {
      setCurrentInput("");
    }
  };

  // Handle grams input change
  const handleGramsChange = (event) => {
    const value = event.target.value;
    setGrams(value);
    calculateTotalPrice(value, workmanship);
  };

  // Handle workmanship input change
  const handleWorkmanshipChange = (event) => {
    const value = event.target.value;
    setWorkmanship(value);
    calculateTotalPrice(grams, value);
  };

  return (
    <div className="fixed bottom-20 right-10 bg-[#15141788] w-1/4 h-auto z-50 rounded-lg p-4">
      {/* Tabs for Metal and Diamond */}
      <div className="tab-buttons flex justify-between mb-4">
        <button
          className={`p-2 w-1/2 ${
            activeTab === "metal" ? "bg-theme-bg-light text-white" : "bg-color-primary"
          } hover:bg-color-dark `}
          onClick={() => setActiveTab("metal")}
        >
          Metal
        </button>
        <button
          className={`p-2 w-1/2 ${
            activeTab === "diamond" ? "bg-theme-bg-light text-white" : "bg-color-primary"
          } hover:bg-color-dark `}
          onClick={() => setActiveTab("diamond")}
        >
          Diamond
        </button>
      </div>

      {/* Metal Calculator */}
      {activeTab === "metal" && (
        <div>
          {/* Dropdown Menu */}
          <div className="metal-selection mb-4">
            <select
              id="category"
              onChange={handleMetalChange}
              aria-label="Choose Metal Type"
              style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" }}
            >
              <option value="" disabled selected>
                Select Metal
              </option>
              {metals.map((item) => {
                if (item.metal.toLowerCase() === "gold") {
                  return goldPurities.map((purity) => (
                    <option
                      key={`${item.metal}-${purity.label}`}
                      value={`${item.metal}-${purity.label}`}
                      data-price={(item.price * purity.multiplier).toFixed(2)}
                    >
                      {item.metal} ({purity.label}) - SAR {(item.price * purity.multiplier).toFixed(2)}
                    </option>
                  ));
                }
                return (
                  <option key={item.metal} value={item.metal} data-price={item.price}>
                    {item.metal} - SAR {item.price}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Input Field for Grams */}
          <div className="grams-input mb-4">
            <input
              type="number"
              placeholder="Enter grams"
              value={grams}
              onChange={handleGramsChange}
              className="w-full p-2 rounded-lg"
              style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" }}
            />
          </div>

          {/* Input Field for Workmanship */}
          <div className="workmanship-input mb-4">
            <input
              type="number"
              placeholder="Enter workmanship fee (SAR)"
              value={workmanship}
              onChange={handleWorkmanshipChange}
              className="w-full p-2 rounded-lg"
              style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" }}
            />
          </div>

          {/* Display Screen */}
          <div id="display" className="calculator-display mb-4 text-white font-bold">
            {currentInput || "0"}
          </div>

          {/* Calculator Buttons */}
          <div id="buttons" className="calculator-buttons grid grid-cols-4 gap-2">
            <button
              className="col-span-4 bg-red-500 text-white p-2 rounded-lg"
              onClick={() => handleButtonClick("Erase")}
            >
              Erase
            </button>
          </div>
        </div>
      )}

      {/* Diamond Calculator */}
      {activeTab === "diamond" && (
        <div className="diamond-container text-center text-white">
          <p className="text-lg">Diamond Calculator Coming Soon...</p>
        </div>
      )}
    </div>
  );
};

export default Calc;

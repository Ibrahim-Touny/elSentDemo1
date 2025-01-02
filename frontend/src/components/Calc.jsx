import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllMetals } from "../store/metals/metalsSlice";
import * as XLSX from "xlsx";

const Calc = () => {
  const { metals } = useSelector((state) => state.metal);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllMetals());
  }, [dispatch]);

  const [data, setData] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [grams, setGrams] = useState("");
  const [workmanship, setWorkmanship] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [caratWeight, setCaratWeight] = useState("");
  const [cutShape, setCutShape] = useState("");
  const [clarity, setClarity] = useState("");
  const [color, setColor] = useState("");
  const [diamondPrice, setDiamondPrice] = useState("");
  const [goldBasePrice, setGoldBasePrice] = useState(""); // Base price for diamond calculations
  const [cut, setCut] = useState("");
  const [design, setDesign] = useState("");
  const [flourescence, setFlourescence] = useState("");
  const [setting, setSetting] = useState("");
  const [alloyPrice, setAlloyPrice] = useState("");
  const [carats, setCarats] = useState("");
  const [factoryProfits, setFactoryProfits] = useState(false);
  const [distearn, setDistearn] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [taxes, setTaxes] = useState(false);

  const handleFactoryProfitsClick = () => setFactoryProfits(!factoryProfits);
  const handleDistearnClick = () => setDistearn(!distearn);
  const handleMarketingClick = () => setMarketing(!marketing);
  const handleTaxesClick = () => setTaxes(!taxes);
  const goldPurities = [
    { label: "24k", multiplier: 1 },
    { label: "22k", multiplier: 0.9167 },
    { label: "21k", multiplier: 0.857 },
    { label: "18k", multiplier: 0.75 },
  ];
  const fluorescencePercentages = {
    None: 0.0,         // No reduction
    Faint: 0.02,       // Reduce by 2%
    Medium: 0.04,      // Reduce by 4%
    Strong: 0.06,      // Reduce by 6%
    "Very Strong": 0.08 // Reduce by 8%
  };
  const designCosts = {
    "Cad design": 100,      // 100 per gram
    "Master piece": 75,     // 75 per gram
    "Casting": 50,          // 50 per gram
    "Mechanic": 20,       // 20 per gram
    "Stamp": 15,           // 10 per gram
  };
  useEffect(() => {
    const fetchExcelData = async () => {
      const response = await fetch("/EXCEL.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(jsonData);
      //// console.log(jsonData);
    };
    
    fetchExcelData();
  }, []);

  const handleMetalChange = (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const price = selectedOption.getAttribute("data-price");
    setSelectedPrice(price || "");
    setCurrentInput(price || "");
  };

  const handleButtonClick = (value) => {
    if (value === "Erase") {
      clearInput();
    } else {
      setCurrentInput((prev) => prev + value);
    }
  };

  const clearInput = () => {
    setCurrentInput("");
    setGrams("");
    setWorkmanship("");
    setCaratWeight("");
    setCutShape("");
    setClarity("");
    setColor("");
    setDiamondPrice("");
    setGoldBasePrice("");
    setAlloyPrice("");
  };

  const calculateTotalPrice = (
    updatedGrams = grams,
    updatedWorkmanship = workmanship,
    updatedAlloy = alloyPrice
  ) => {
    if (selectedPrice && updatedGrams && updatedWorkmanship) {
      const adjustedGrams = parseFloat(updatedGrams) || 0;
      const basePrice = parseFloat(selectedPrice) * adjustedGrams;
      const totalWorkmanshipFee = parseFloat(updatedWorkmanship) * adjustedGrams;
      const totalAlloyPrice = (parseFloat(updatedAlloy) || 0) * adjustedGrams;
      const total = (basePrice + totalWorkmanshipFee + totalAlloyPrice).toFixed(2);
      setCurrentInput(total);
    } else {
      setCurrentInput("");
    }
  };
  
  const handleGramsChange = (event) => {
    const value = event.target.value;
    setGrams(value);
    calculateTotalPrice(value, workmanship, alloyPrice);
  };
  
  const handleAlloyChange = (event) => {
    const value = event.target.value;
    setAlloyPrice(value);
    calculateTotalPrice(grams, workmanship, value);
  };

  const handleWorkmanshipChange = (event) => {
    const value = event.target.value;
    setWorkmanship(value);
    calculateTotalPrice(grams, value, alloyPrice);
  };

  const handleCaratsChange = (event) => {
    const value = event.target.value;
    setCarats(value);
    calculateDiamondPrice(value);
  };

  const calculateDiamondPrice = () => {
    if (caratWeight && cutShape && clarity && color && flourescence) {
        const matchingRow = data.find(
          (row) =>
            row.Carat.trim().toLowerCase() === caratWeight.trim().toLowerCase() &&
            row.Shape.trim().toLowerCase() === cutShape.trim().toLowerCase() &&
            row.Clarity.trim().toLowerCase() === clarity.trim().toLowerCase() &&
            row.Color.trim().toLowerCase() === color.trim().toLowerCase()
        );
      if (matchingRow) 
      {
        const excelPrice = (parseFloat(matchingRow["sar"]) || 0);
        const piecePrice = excelPrice * parseFloat(carats);
        const designCost = designCosts[design] || 0;
        const designAddition = designCost * (parseFloat(carats)/5);
        const fluorescenceReduction =fluorescencePercentages[flourescence] || 0.0;
        // console.log("Excel Price:", excelPrice);
        let price = (piecePrice - (piecePrice * fluorescenceReduction) + designAddition)+(parseFloat(goldBasePrice) || 0);
        let finalPrice = 0;
            if (factoryProfits) {
                finalPrice += price * 0.2; // Add 20% for factory profits
            }
            if (distearn) {
                finalPrice += price * 0.15; // Add 15% for Distearn
            }
            if (marketing) {
                finalPrice += price * 1.0; // Add 100% for Marketing
            }
            if (taxes) {
                finalPrice += price * 0.22; // Add 22% for taxes
            }
        const totaloutput = (price + (finalPrice||0));
        setDiamondPrice(totaloutput);
        setGoldBasePrice(totaloutput); // Overwrite the migrated gold price with the calculated diamond value
      } else {
        // console.log("No matching data found");
      }
    } else {
      // console.log("Incomplete input");
    }
  };

  const migrateToDiamondCalculator = () => {
    if (currentInput) {
      setGoldBasePrice(currentInput); // Pass the gold calculator output as base
      setActiveTab("diamond"); // Switch to the diamond tab
    }
  };

  const clearDiamondInput = () => {
    setCaratWeight("");
    setCutShape("");
    setClarity("");
    setColor("");
    setDiamondPrice("");
    setFlourescence("");
    setCut("");
    setDesign("");
    setSetting("");
  };

  return (
    <div className="fixed bottom-20 right-10 bg-[#15141788] w-1/4 h-auto z-50 rounded-lg p-4">
      <div className="tab-buttons flex justify-between mb-4">
        <button
          className={`p-2 w-1/2 ${activeTab === "metal" ? "bg-theme-bg-light text-white" : "bg-color-primary"} hover:bg-color-dark`}
          onClick={() => setActiveTab("metal")}
        >
          Metal
        </button>
        <button
          className={`p-2 w-1/2 ${activeTab === "diamond" ? "bg-theme-bg-light text-white" : "bg-color-primary"} hover:bg-color-dark`}
          onClick={() => setActiveTab("diamond")}
        >
          Diamond
        </button>
      </div>

      {activeTab === "metal" && (
        <div>
          <div className="metal-selection mb-4">
            <select id="category" onChange={handleMetalChange} aria-label="Choose Metal Type" style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" }}>
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

          <div className="input-grid grid grid-cols-2 gap-4 mb-4">
            <div className="grams-input">
              <input
                type="number"
                placeholder="Enter grams"
                value={grams}
                onChange={handleGramsChange}
                className="w-full p-2 rounded-lg"
                style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" }}
              />
            </div>

            <div className="workmanship-input">
              <input
                type="number"
                placeholder="Enter workmanship fee (SAR)"
                value={workmanship}
                onChange={handleWorkmanshipChange}
                className="w-full p-2 rounded-lg"
                style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" }}
              />
            </div>
          </div>
          <div className="alloy-input">
              <input
                type="number"
                placeholder="Enter alloy fee (SAR)"
                value={alloyPrice}
                onChange={handleAlloyChange}
                className="w-full p-2 rounded-lg"
                style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" }}
              />
            </div>
            <br />
          <div id="display" className="calculator-display mb-2 text-white font-bold">
            {currentInput || "0"}
          </div>

          <div id="buttons" className="calculator-buttons grid grid-cols-4 gap-2">
            <button className="col-span-4 bg-red-500 text-white p-2 rounded-lg" onClick={() => handleButtonClick("Erase")}>
              Erase
            </button>
            <button className="col-span-4 bg-blue-500 text-white p-2 rounded-lg" onClick={migrateToDiamondCalculator}>
              Proceed to Diamond
            </button>
          </div>
        </div>
      )}

      {activeTab === "diamond" && (
        <div>
          <div className="input-grid grid grid-cols-2 gap-4 mb-2">
          <div className="carat-weight-dropdown mb-2">
  <select
    value={caratWeight}
    onChange={(e) => setCaratWeight(e.target.value)}
    className="w-full p-2 rounded-lg"
    style={{ backgroundColor: "rgba(224, 224, 224, 0.33)", color: "white" }}
  >
    <option value="" disabled>Select carat weight</option>
    <option value="0.01-0.03" style={{ color: "black" }}>0.01-0.03</option>
    <option value="0.04-0.07" style={{ color: "black" }}>0.04-0.07</option>
    <option value="0.08-0.14" style={{ color: "black" }}>0.08-0.14</option>
    <option value="0.15-0.17" style={{ color: "black" }}>0.15-0.17</option>
    <option value="0.23-0.29"style={{ color: "black" }}>0.23-0.29</option>
    <option value="0.30-0.39" style={{ color: "black" }}>0.30-0.39</option>
    <option value="0.40-0.49" style={{ color: "black" }}>0.40-0.49</option>
    <option value="0.50-0.69" style={{ color: "black" }}>0.50-0.69</option>
    <option value="0.70-0.89" style={{ color: "black" }}>0.70-0.89</option>
    <option value="1.00-1.49" style={{ color: "black" }}>1.00-1.49</option>
    <option value="1.50-1.99" style={{ color: "black" }}>1.50-1.99</option>
    <option value="2.00-2.99" style={{ color: "black" }}>2.00-2.99</option>
    <option value="3.00-3.99" style={{ color: "black" }}>3.00-3.99</option>
    <option value="4.00-4.99" style={{ color: "black" }}>4.00-4.99</option>
    <option value="5.00-5.99" style={{ color: "black" }}>5.00-5.99</option>
    <option value="10.00-10.99" style={{ color: "black" }}>10.00-10.99</option>
  </select>
</div>

<div className="cut-shape-dropdown mb-2">
            <select
              onChange={(e) => setCutShape(e.target.value)}
              value={cutShape}
              className="w-full p-2 rounded-lg"
              style={{ backgroundColor: "rgba(224, 224, 224, 0.33)",color: "white" }}
            >
              <option value="" disabled>
                Select Shape
              </option>
              <option value="round" style={{ color: "black" }}>Round</option>
              <option value="pear" style={{ color: "black" }}>Pear</option>
            </select>
          </div>
          </div>

          <div className="input-grid grid grid-cols-2 gap-4 mb-2">
          <div className="clarity-dropdown mb-2">
            <select
              onChange={(e) => setClarity(e.target.value)}
              value={clarity}
              className="w-full p-2 rounded-lg"
              style={{ backgroundColor: "rgba(224, 224, 224, 0.33)",color: "white" }}
            >
              <option value="" disabled>
                Select Clarity
              </option>
              <option value="F" style={{ color: "black" }}>F</option>
              <option value="IF" style={{ color: "black" }}>IF</option>
              <option value="VVS1" style={{ color: "black" }}>VVS1</option>
              <option value="VVS2" style={{ color: "black" }}>VVS2</option>
              <option value="VS1" style={{ color: "black" }}>VS1</option>
              <option value="VS2" style={{ color: "black" }}>VS2</option>
              <option value="SI1" style={{ color: "black" }}>SI1</option>
              <option value="SI2" style={{ color: "black" }}>SI2</option>
              <option value="SI3" style={{ color: "black" }}>SI3</option>
              <option value="I1" style={{ color: "black" }}>I1</option>
              <option value="I2" style={{ color: "black" }}>I2</option>
              <option value="I3" style={{ color: "black" }}>I3</option>
            </select>
          </div>



          <div className="color-dropdown mb-2">
            <select
              onChange={(e) => setColor(e.target.value)}
              value={color}
              className="w-full p-2 rounded-lg"
              style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" ,color: "white"}}
            >
              <option value="" disabled>
                Select Color
              </option>
              <option value="D" style={{ color: "black" }}>D</option>
              <option value="E" style={{ color: "black" }}>E</option>
              <option value="F" style={{ color: "black" }}>F</option>
              <option value="G" style={{ color: "black" }}>G</option>
              <option value="H" style={{ color: "black" }}>H</option>
              <option value="I" style={{ color: "black" }}>I</option>
              <option value="J" style={{ color: "black" }}>J</option>
              <option value="K" style={{ color: "black" }}>K</option>
              <option value="L" style={{ color: "black" }}>L</option>
              <option value="M" style={{ color: "black" }}>M</option>
              <option value="N" style={{ color: "black" }}>N</option>
            </select>
          </div>
          </div>
          <div className="input-grid grid grid-cols-2 gap-4 mb-4">
  <div className="flourescence-dropdown mb-2">
    <select
      onChange={(e) => setFlourescence(e.target.value)}
      value={flourescence}
      className="w-full p-2 rounded-lg"
      style={{ backgroundColor: "rgba(224, 224, 224, 0.33)", color: "white" }}
    >
      <option value="" disabled>
        Select Fluorescence
      </option>
      <option value="None" style={{ color: "black" }}>None</option>
      <option value="Faint" style={{ color: "black" }}>Faint</option>
      <option value="Medium" style={{ color: "black" }}>Medium</option>
      <option value="Strong" style={{ color: "black" }}>Strong</option>
      <option value="Very Strong" style={{ color: "black" }}>Very Strong</option>
    </select>
  </div>

  <div className="design-dropdown mb-2">
    <select
      onChange={(e) => setDesign(e.target.value)}
      value={design}
      className="w-full p-2 rounded-lg"
      style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" ,color: "white"}}
    >
      <option value="" disabled>
        Select Design
      </option>
      <option value="Cad design" style={{ color: "black" }}>Cad design</option>
      <option value="Master piece" style={{ color: "black" }}>Master piece</option>
      <option value="Casting" style={{ color: "black" }}>Casting </option>
      <option value="Mechanic" style={{ color: "black" }}>Mechanic </option>
      <option value="Stamp" style={{ color: "black" }}>Stamp</option>
    </select>
  </div>
</div>

<div className="input-grid grid grid-cols-1 gap-4 mb-4">

          {/*<div className="setting-dropdown mb-4">
            <select
              onChange={(e) => setSetting(e.target.value)}
              value={setting}
              className="w-full p-2 rounded-lg"
              style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" ,color: "white"}}
            >
              <option value="" disabled>
                Select Setting
              </option>
              <option value="prong" style={{ color: "black" }}>prong</option>
              <option value="pave" style={{ color: "black" }}>pave</option>
              <option value="micro" style={{ color: "black" }}>micro </option>
              <option value="chanel" style={{ color: "black" }}>chanel </option>
              <option value="bazel" style={{ color: "black" }}>bazel</option>
              <option value="bars" style={{ color: "black" }}>bars</option>
              <option value="invisibale" style={{ color: "black" }}>invisibale</option>
            </select>
          </div>*/}
          <div className="carats-input">
              <input
                type="number"
                placeholder="Enter carats"
                value={carats}
                onChange={handleCaratsChange}
                className="w-full p-2 rounded-lg"
                style={{ backgroundColor: "rgba(224, 224, 224, 0.33)" }}
              />
            </div>
</div>

<div>
      <div className="grid grid-cols-2 gap-2 col-span-4">
        <button
          className={`factoryProfits ${factoryProfits ? 'bg-active' : 'bg-color-secondary'} no-underline font-Roboto text-sm hover:bg-hover transition-all duration-150 text-white py-1 px-2 rounded-md font-semibold`}
          onClick={handleFactoryProfitsClick}
        >
          Factory Profits
        </button>
        <button
          className={`Distearn ${distearn ? 'bg-active' : 'bg-color-secondary'} no-underline font-Roboto text-sm hover:bg-hover transition-all duration-150 text-white py-1 px-2 rounded-md font-semibold`}
          onClick={handleDistearnClick}
        >
          Distributor Earnings
        </button>
        <button
          className={`Marketing ${marketing ? 'bg-active' : 'bg-color-secondary'} no-underline font-Roboto text-sm hover:bg-hover transition-all duration-150 text-white py-1 px-2 rounded-md font-semibold`}
          onClick={handleMarketingClick}
        >
          Marketing Expenses
        </button>
        <button
          className={`taxes ${taxes ? 'bg-active' : 'bg-color-secondary'} no-underline font-Roboto text-sm hover:bg-hover transition-all duration-150 text-white py-1 px-2 rounded-md font-semibold`}
          onClick={handleTaxesClick}
        >
          Taxes and Customs
        </button>
      </div>
    </div>
<br/>
          <div id="display" className="calculator-display mb-4 text-white font-bold">
            {goldBasePrice || "0"}
          </div>

          <div id="buttons" className="calculator-buttons grid grid-cols-4 gap-2">
            <button className="col-span-2 bg-red-500 text-white p-2 rounded-lg" onClick={() => handleButtonClick("Erase")}>
              Erase
            </button>
            <button className="col-span-2 bg-blue-500 text-white p-2 rounded-lg"  onClick={calculateDiamondPrice}>
              Calculate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calc;

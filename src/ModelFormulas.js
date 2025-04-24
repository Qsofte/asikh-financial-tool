// ModelFormulas.js - Contains detailed formulas for mango distribution model

const modelFormulas = {
  volumeCalculations: [
    {
      name: "Quality Sorting Loss Volume",
      formula: "procurementVolume * (qualitySortingLoss / 100)",
      description: "Volume lost during initial quality sorting"
    },
    {
      name: "Volume After Quality Sorting",
      formula: "procurementVolume - qualitySortingLossVolume",
      description: "Remaining volume after quality sorting"
    },
    {
      name: "Processing Loss Volume",
      formula: "volumeAfterQualitySorting * (processingLoss / 100)",
      description: "Volume lost during processing"
    },
    {
      name: "Volume After Processing",
      formula: "volumeAfterQualitySorting - processingLossVolume",
      description: "Remaining volume after processing"
    },
    {
      name: "Wastage Volume",
      formula: "volumeAfterProcessing * (wastage / 100)",
      description: "Volume lost due to wastage"
    },
    {
      name: "Net Usable Volume",
      formula: "volumeAfterProcessing - wastageVolume",
      description: "Final usable volume for packaging"
    },
    {
      name: "Processing Yield Percentage",
      formula: "(netUsableVolume / procurementVolume) * 100",
      description: "Percentage of initial volume that is usable after all losses"
    }
  ],
  
  boxCalculations: [
    {
      name: "Box Weight",
      formula: "3 kg per box (fixed)",
      description: "Standard weight of each box"
    },
    {
      name: "Wholesale Boxes",
      formula: "(volumeForBoxes * (channelDistribution.wholesale / 100)) / boxWeight",
      description: "Number of boxes allocated to wholesale channel"
    },
    {
      name: "Retail Boxes",
      formula: "(volumeForBoxes * (channelDistribution.retail / 100)) / boxWeight",
      description: "Number of boxes allocated to retail channel"
    },
    {
      name: "D2C Boxes",
      formula: "(volumeForBoxes * (channelDistribution.d2c / 100)) / boxWeight",
      description: "Number of boxes allocated to direct-to-consumer channel"
    },
    {
      name: "Total Boxes",
      formula: "wholesaleBoxes + retailBoxes + d2cBoxes",
      description: "Total number of boxes across all channels"
    }
  ],
  
  revenueCalculations: [
    {
      name: "Wholesale Gross Revenue",
      formula: "wholesaleBoxes * sellingPrice3kg",
      description: "Total revenue from wholesale channel before discounts"
    },
    {
      name: "Retail Gross Revenue",
      formula: "retailBoxes * sellingPrice3kg",
      description: "Total revenue from retail channel before discounts"
    },
    {
      name: "D2C Gross Revenue",
      formula: "d2cBoxes * sellingPrice3kg",
      description: "Total revenue from D2C channel before discounts"
    },
    {
      name: "Wholesale Discount",
      formula: "wholesaleGrossRevenue * (wholesaleDiscount / 100)",
      description: "Discount amount for wholesale channel"
    },
    {
      name: "Retail Discount",
      formula: "retailGrossRevenue * (retailDiscount / 100)",
      description: "Discount amount for retail channel"
    },
    {
      name: "D2C Discount",
      formula: "d2cGrossRevenue * (d2cDiscount / 100)",
      description: "Discount amount for D2C channel"
    },
    {
      name: "Wholesale Net Revenue",
      formula: "wholesaleGrossRevenue - wholesaleDiscount",
      description: "Revenue after discounts for wholesale channel"
    },
    {
      name: "Retail Net Revenue",
      formula: "retailGrossRevenue - retailDiscount",
      description: "Revenue after discounts for retail channel"
    },
    {
      name: "D2C Net Revenue",
      formula: "d2cGrossRevenue - d2cDiscount",
      description: "Revenue after discounts for D2C channel"
    },
    {
      name: "Total Gross Revenue",
      formula: "wholesaleGrossRevenue + retailGrossRevenue + d2cGrossRevenue",
      description: "Total revenue across all channels before discounts"
    },
    {
      name: "Total Net Revenue",
      formula: "wholesaleNetRevenue + retailNetRevenue + d2cNetRevenue",
      description: "Total revenue across all channels after discounts"
    }
  ],
  
  costCalculations: [
    {
      name: "Procurement Cost",
      formula: "procurementVolume * procurementPrice",
      description: "Cost of procuring mangoes from farmers"
    },
    {
      name: "Farmer Cost Per Box",
      formula: "(procurementCost / totalBoxes) * (channelVolume / totalVolume)",
      description: "Farmer cost allocated per box for each channel"
    },
    {
      name: "Post-Harvest Cost Per Box",
      formula: "(postHarvestCost / totalBoxes) * (channelVolume / totalVolume)",
      description: "Post-harvest processing cost per box"
    },
    {
      name: "Packaging Cost Per Box",
      formula: "packagingCost3kg",
      description: "Cost of packaging materials per box"
    },
    {
      name: "Packaging Labor Cost Per Box",
      formula: "packagingLaborCost",
      description: "Labor cost for packaging per box"
    },
    {
      name: "Cold Storage Cost Per Box",
      formula: "coldStorageCost * boxWeight * coldStorageDays",
      description: "Cost of cold storage per box"
    },
    {
      name: "Logistics Cost Per Box",
      formula: "logisticsCost3kg",
      description: "Cost of logistics per box"
    },
    {
      name: "Sales Commission Per Box",
      formula: "channelNetRevenue * (salesCommission / 100) / channelBoxes",
      description: "Sales commission per box"
    },
    {
      name: "Payment Gateway Charges (D2C only)",
      formula: "d2cNetRevenue * (pgCharges / 100) / d2cBoxes",
      description: "Payment gateway charges per box for D2C channel"
    }
  ],
  
  fixedCostCalculations: [
    {
      name: "Total Fixed Costs",
      formula: "procurementStaffCost + packagingStaffCost + packagingEquipmentCost + logisticsFixedCost + deliveryStaffCost + salesStaffCost + marketingCost + overheadCost",
      description: "Sum of all fixed costs"
    },
    {
      name: "Wholesale Fixed Cost Allocation",
      formula: "totalFixedCosts * (actualWholesalePercent / 100)",
      description: "Fixed costs allocated to wholesale channel"
    },
    {
      name: "Retail Fixed Cost Allocation",
      formula: "totalFixedCosts * (actualRetailPercent / 100)",
      description: "Fixed costs allocated to retail channel"
    },
    {
      name: "D2C Fixed Cost Allocation",
      formula: "totalFixedCosts * (actualD2CPercent / 100)",
      description: "Fixed costs allocated to D2C channel"
    },
    {
      name: "Wholesale Fixed Cost Per Box",
      formula: "wholesaleFixedCost / wholesaleBoxes",
      description: "Fixed cost per box for wholesale channel"
    },
    {
      name: "Retail Fixed Cost Per Box",
      formula: "retailFixedCost / retailBoxes",
      description: "Fixed cost per box for retail channel"
    },
    {
      name: "D2C Fixed Cost Per Box",
      formula: "d2cFixedCost / d2cBoxes",
      description: "Fixed cost per box for D2C channel"
    }
  ],
  
  profitabilityCalculations: [
    {
      name: "Wholesale Total Variable Cost",
      formula: "wholesaleFarmerCost + wholesalePostHarvest + wholesalePackaging + wholesalePackagingLabor + wholesaleColdStorage + wholesaleLogistics + wholesaleSalesCommission",
      description: "Sum of all variable costs for wholesale channel"
    },
    {
      name: "Retail Total Variable Cost",
      formula: "retailFarmerCost + retailPostHarvest + retailPackaging + retailPackagingLabor + retailColdStorage + retailLogistics + retailSalesCommission",
      description: "Sum of all variable costs for retail channel"
    },
    {
      name: "D2C Total Variable Cost",
      formula: "d2cFarmerCost + d2cPostHarvest + d2cPackaging + d2cPackagingLabor + d2cColdStorage + d2cLogistics + d2cSalesCommission + d2cPgCharges",
      description: "Sum of all variable costs for D2C channel"
    },
    {
      name: "Wholesale Total Cost",
      formula: "wholesaleTotalVariableCost + wholesaleFixedCostPerBox",
      description: "Total cost per box for wholesale channel"
    },
    {
      name: "Retail Total Cost",
      formula: "retailTotalVariableCost + retailFixedCostPerBox",
      description: "Total cost per box for retail channel"
    },
    {
      name: "D2C Total Cost",
      formula: "d2cTotalVariableCost + d2cFixedCostPerBox",
      description: "Total cost per box for D2C channel"
    },
    {
      name: "Wholesale Profit Per Box",
      formula: "wholesaleNetRevenuePerBox - wholesaleTotalCost",
      description: "Profit per box for wholesale channel"
    },
    {
      name: "Retail Profit Per Box",
      formula: "retailNetRevenuePerBox - retailTotalCost",
      description: "Profit per box for retail channel"
    },
    {
      name: "D2C Profit Per Box",
      formula: "d2cNetRevenuePerBox - d2cTotalCost",
      description: "Profit per box for D2C channel"
    },
    {
      name: "Wholesale Profit",
      formula: "wholesaleProfitPerBox * wholesaleBoxes",
      description: "Total profit for wholesale channel"
    },
    {
      name: "Retail Profit",
      formula: "retailProfitPerBox * retailBoxes",
      description: "Total profit for retail channel"
    },
    {
      name: "D2C Profit",
      formula: "d2cProfitPerBox * d2cBoxes",
      description: "Total profit for D2C channel"
    },
    {
      name: "Total Profit",
      formula: "wholesaleProfit + retailProfit + d2cProfit",
      description: "Total profit across all channels"
    }
  ],
  
  marginCalculations: [
    {
      name: "Wholesale Margin",
      formula: "(wholesaleProfitPerBox / wholesaleNetRevenuePerBox) * 100",
      description: "Profit margin percentage for wholesale channel"
    },
    {
      name: "Retail Margin",
      formula: "(retailProfitPerBox / retailNetRevenuePerBox) * 100",
      description: "Profit margin percentage for retail channel"
    },
    {
      name: "D2C Margin",
      formula: "(d2cProfitPerBox / d2cNetRevenuePerBox) * 100",
      description: "Profit margin percentage for D2C channel"
    },
    {
      name: "Overall Margin",
      formula: "(totalProfit / totalNetRevenue) * 100",
      description: "Overall profit margin percentage"
    }
  ],
  
  keyMetrics: [
    {
      name: "Average Profit Per Box",
      formula: "totalProfit / totalBoxes",
      description: "Average profit across all boxes"
    },
    {
      name: "Revenue Per Kg Procured",
      formula: "totalNetRevenue / procurementVolume",
      description: "Revenue generated per kg of mangoes procured"
    },
    {
      name: "Value Addition Multiple",
      formula: "revenuePerKgProcured / procurementPrice",
      description: "Multiple of value added compared to procurement price"
    },
    {
      name: "Break-Even Units",
      formula: "totalFixedCosts / (averageProfitPerBox - averageVariableCostPerBox)",
      description: "Number of boxes needed to break even"
    }
  ],
  
  perPiecePricing: [
    {
      name: "Per Piece Volume",
      formula: "netUsableVolume * (perPieceAllocation / 100)",
      description: "Volume allocated for per-piece sales"
    },
    {
      name: "Total Pieces",
      formula: "perPieceVolume / perPieceWeight",
      description: "Number of individual mango pieces"
    },
    {
      name: "Per Piece Revenue",
      formula: "perPiecePrice * totalPieces",
      description: "Total revenue from per-piece sales"
    },
    {
      name: "Per Piece Cost",
      formula: "(procurementCost / procurementVolume) * perPieceVolume + additionalPerPieceCosts",
      description: "Total cost for per-piece sales"
    },
    {
      name: "Per Piece Profit",
      formula: "perPieceRevenue - perPieceCost",
      description: "Profit from per-piece sales"
    }
  ]
};

export default modelFormulas;

// src/App.js
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './App.css';
import modelFormulas from './ModelFormulas';

function App() {
  return (
    <div className="App">
      <MangoDistributionModel />
    </div>
  );
}

const MangoDistributionModel = () => {
  // Initial state with default values
  const [inputs, setInputs] = useState({
    // Procurement Parameters
    procurementPrice: 50, // ₹/kg
    postHarvestCost: 5, // ₹/kg
    qualitySortingLoss: 3, // %
    processingLoss: 2, // %
    wastage: 5, // %
    procurementVolume: 15000, // kg
    procurementStaffCost: 35000, // ₹/month
    procurementTransportCost: 1, // ₹/kg
    farmerSupportCost: 5000, // ₹/month
    procurementInspectionCost: 0.5, // ₹/kg

    // Packaging Parameters
    packagingCost500g: 2, // ₹/box
    packagingCost1kg: 4, // ₹/box
    packagingCost3kg: 6, // ₹/box
    packagingLaborCost: 0.5, // ₹/box
    packagingStaffCost: 25000, // ₹/month
    packagingEquipmentCost: 10000, // ₹/month
    packagingWastage: 1, // %

    // Storage & Handling Parameters
    coldStorageCost: 2, // ₹/kg/month
    coldChainElectricityCost: 15000, // ₹/month
    inventoryDaysWholesale: 3, // days
    inventoryDaysRetail: 5, // days
    inventoryDaysD2C: 7, // days
    qualityControlCost: 0.3, // ₹/kg
    qcStaffCost: 20000, // ₹/month

    // Logistics Parameters
    logisticsCost500g: 8, // ₹/box
    logisticsCost1kg: 12, // ₹/box
    logisticsCost3kg: 15, // ₹/box
    logisticsFixedCost: 30000, // ₹/month
    deliveryStaffCost: 40000, // ₹/month
    fuelCostPerLiter: 100, // ₹
    avgDistanceWholesale: 30, // km
    avgDistanceRetail: 45, // km
    avgDistanceD2C: 60, // km
    transportDamage: 0.5, // %

    // Sales Parameters
    sellingPrice500g: 70, // ₹/box
    sellingPrice1kg: 120, // ₹/box
    sellingPrice3kg: 270, // ₹/box
    // Per-piece pricing
    enablePerPiecePricing: false, // Toggle for per-piece pricing
    mangoPiecesPerKg: 4, // Average number of mangoes per kg
    sellingPricePerPiece: 30, // ₹/piece
    perPieceMixPercent: 15, // % of total volume sold as individual pieces
    variety: '', // Mango variety
    perPieceWeight: 250, // grams per piece
    channelDistribution: {
      wholesale: 50, // %
      retail: 30, // %
      d2c: 20, // %
    },
    productMix: {
      wholesale: {
        box500g: 10, // %
        box1kg: 20, // %
        box3kg: 70, // %
      },
      retail: {
        box500g: 30, // %
        box1kg: 60, // %
        box3kg: 10, // %
      },
      d2c: {
        box500g: 70, // %
        box1kg: 25, // %
        box3kg: 5, // %
      },
    },
    pgCharges: 2, // %
    salesStaffCost: 45000, // ₹/month
    salesCommission: 1, // %
    marketingCost: 30000, // ₹/month
    wholesaleDiscount: 2, // %
    retailDiscount: 5, // %
    d2cDiscount: 10, // %
    wholesaleReturns: 1, // %
    retailReturns: 2, // %
    d2cReturns: 3, // %

    // Overhead Parameters
    rent: 35000, // ₹/month
    adminStaffCost: 50000, // ₹/month
    utilities: 12000, // ₹/month
    insurance: 8000, // ₹/month
    officeSupplies: 5000, // ₹/month
    softwareSubscriptions: 7000, // ₹/month

    // Financial Parameters
    workingCapitalLoanAmount: 500000, // ₹
    interestRate: 12, // % p.a.
    loanTenure: 12, // months
    incomeTaxRate: 30, // %
    gstRate: 5, // %

    // Competitor Pricing
    competitor1Price500g: 65, // ₹/box
    competitor1Price1kg: 110, // ₹/box
    competitor1Price3kg: 250, // ₹/box
    competitor2Price500g: 55, // ₹/box
    competitor2Price1kg: 105, // ₹/box
    competitor2Price3kg: 240, // ₹/box
    competitor3Price500g: 50, // ₹/box
    competitor3Price1kg: 95, // ₹/box
    competitor3Price3kg: 220, // ₹/box

  });

  const [activeTab, setActiveTab] = useState('summary');
  const [results, setResults] = useState({});

  // Calculate results whenever inputs change
  useEffect(() => {
    calculateModel();
  }, [inputs]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'variety') {
      setInputs((prev) => ({ ...prev, variety: value }));
      return;
    }

    // Handle nested state updates for channel distribution and product mix
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      setInputs((prev) => {
        if (subChild) {
          // Handle deeply nested properties (productMix.wholesale.box500g)
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: {
                ...prev[parent][child],
                [subChild]: parseFloat(value),
              },
            },
          };
        } else {
          // Handle single-level nested properties (channelDistribution.wholesale)
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: parseFloat(value),
            },
          };
        }
      });
    } else {
      // Handle flat properties
      setInputs((prev) => ({
        ...prev,
        [name]: parseFloat(value),
      }));
    }
  };

  // Main calculation function
  const calculateModel = () => {
    // Calculate losses throughout the process
    const qualitySortingLossVolume =
      inputs.procurementVolume * (inputs.qualitySortingLoss / 100);
    const volumeAfterQualitySorting =
      inputs.procurementVolume - qualitySortingLossVolume;

    const processingLossVolume =
      volumeAfterQualitySorting * (inputs.processingLoss / 100);
    const volumeAfterProcessing =
      volumeAfterQualitySorting - processingLossVolume;

    const wastageVolume = volumeAfterProcessing * (inputs.wastage / 100);
    const netUsableVolume = volumeAfterProcessing - wastageVolume;

    // Handle per-piece pricing if enabled
    let volumeForBoxes = netUsableVolume;
    let perPieceVolume = 0;
    let totalPieces = 0;
    let perPieceRevenue = 0;
    let perPieceCost = 0;
    let perPieceProfit = 0;

    if (inputs.enablePerPiecePricing) {
      // Calculate volume allocated for per-piece sales
      perPieceVolume = netUsableVolume * (inputs.perPieceMixPercent / 100);
      volumeForBoxes = netUsableVolume - perPieceVolume;

      // Calculate number of individual pieces
      totalPieces = Math.floor((perPieceVolume * 1000) / inputs.perPieceWeight);

      // Calculate per-piece revenue
      perPieceRevenue = totalPieces * inputs.sellingPricePerPiece;

      // Calculate per-piece cost (using average cost per kg)
      const avgCostPerKg =
        inputs.procurementPrice +
        inputs.postHarvestCost +
        inputs.procurementTransportCost +
        inputs.procurementInspectionCost;
      perPieceCost = perPieceVolume * avgCostPerKg;

      // Calculate per-piece profit
      perPieceProfit = perPieceRevenue - perPieceCost;
    }

    // Calculate average box weight per channel (kg)
    const wholesaleAvgWeight =
      (inputs.productMix.wholesale.box500g / 100) * 0.5 +
      (inputs.productMix.wholesale.box1kg / 100) * 1 +
      (inputs.productMix.wholesale.box3kg / 100) * 3;
    const retailAvgWeight =
      (inputs.productMix.retail.box500g / 100) * 0.5 +
      (inputs.productMix.retail.box1kg / 100) * 1 +
      (inputs.productMix.retail.box3kg / 100) * 3;
    const d2cAvgWeight =
      (inputs.productMix.d2c.box500g / 100) * 0.5 +
      (inputs.productMix.d2c.box1kg / 100) * 1 +
      (inputs.productMix.d2c.box3kg / 100) * 3;

    // Calculate boxes by segment
    const wholesaleBoxes = Math.floor(
      (volumeForBoxes * (inputs.channelDistribution.wholesale / 100)) /
        wholesaleAvgWeight
    );
    const retailBoxes = Math.floor(
      (volumeForBoxes * (inputs.channelDistribution.retail / 100)) /
        retailAvgWeight
    );
    const d2cBoxes = Math.floor(
      (volumeForBoxes * (inputs.channelDistribution.d2c / 100)) / d2cAvgWeight
    );
    const totalBoxes = wholesaleBoxes + retailBoxes + d2cBoxes;

    // Calculate actual volumes by channel after rounding to whole boxes
    const actualWholesaleVolume = wholesaleBoxes * wholesaleAvgWeight;
    const actualRetailVolume = retailBoxes * retailAvgWeight;
    const actualD2CVolume = d2cBoxes * d2cAvgWeight;
    const totalVolume =
      actualWholesaleVolume + actualRetailVolume + actualD2CVolume;

    // Actual percentage distribution after box calculations
    const actualWholesalePercent = (actualWholesaleVolume / totalVolume) * 100;
    const actualRetailPercent = (actualRetailVolume / totalVolume) * 100;
    const actualD2CPercent = (actualD2CVolume / totalVolume) * 100;

    // Fixed costs total (monthly)
    const totalFixedCosts =
      inputs.procurementStaffCost +
      inputs.farmerSupportCost +
      inputs.packagingStaffCost +
      inputs.packagingEquipmentCost +
      inputs.coldChainElectricityCost +
      inputs.qcStaffCost +
      inputs.logisticsFixedCost +
      inputs.deliveryStaffCost +
      inputs.salesStaffCost +
      inputs.marketingCost +
      inputs.rent +
      inputs.adminStaffCost +
      inputs.utilities +
      inputs.insurance +
      inputs.officeSupplies +
      inputs.softwareSubscriptions;

    // Allocate fixed costs to channels based on volume
    const fixedCostWholesale = totalFixedCosts * (actualWholesalePercent / 100);
    const fixedCostRetail = totalFixedCosts * (actualRetailPercent / 100);
    const fixedCostD2C = totalFixedCosts * (actualD2CPercent / 100);

    // Calculate monthly interest cost on working capital loan
    const monthlyInterestCost =
      (inputs.workingCapitalLoanAmount * (inputs.interestRate / 100)) / 12;

    // Per box calculations - Wholesale
    const wholesaleRevenuePerBox = inputs.sellingPrice3kg;
    const wholesaleDiscountPerBox =
      wholesaleRevenuePerBox * (inputs.wholesaleDiscount / 100);
    const wholesaleReturnsCost =
      wholesaleRevenuePerBox * (inputs.wholesaleReturns / 100);
    const wholesaleNetRevenuePerBox =
      wholesaleRevenuePerBox - wholesaleDiscountPerBox - wholesaleReturnsCost;

    const wholesaleFarmerCost = 3 * inputs.procurementPrice;
    const wholesalePostHarvest = 3 * inputs.postHarvestCost;
    const wholesaleProcurementTransport = 3 * inputs.procurementTransportCost;
    const wholesaleProcurementInspection = 3 * inputs.procurementInspectionCost;
    const wholesalePackaging = inputs.packagingCost3kg;
    const wholesalePackagingLabor = inputs.packagingLaborCost;
    const wholesaleColdStorage =
      3 * inputs.coldStorageCost * (inputs.inventoryDaysWholesale / 30);
    const wholesaleQualityControl = 3 * inputs.qualityControlCost;
    const wholesaleLogistics = inputs.logisticsCost3kg;
    const wholesaleTransportDamage =
      wholesaleNetRevenuePerBox * (inputs.transportDamage / 100);
    const wholesaleSalesCommission =
      wholesaleNetRevenuePerBox * (inputs.salesCommission / 100);

    const wholesaleTotalVariableCost =
      wholesaleFarmerCost +
      wholesalePostHarvest +
      wholesaleProcurementTransport +
      wholesaleProcurementInspection +
      wholesalePackaging +
      wholesalePackagingLabor +
      wholesaleColdStorage +
      wholesaleQualityControl +
      wholesaleLogistics +
      wholesaleTransportDamage +
      wholesaleSalesCommission;

    const wholesaleFixedCostPerBox = fixedCostWholesale / wholesaleBoxes;
    const wholesaleInterestCostPerBox =
      (monthlyInterestCost * (actualWholesalePercent / 100)) / wholesaleBoxes;

    const wholesaleTotalCostPerBox =
      wholesaleTotalVariableCost +
      wholesaleFixedCostPerBox +
      wholesaleInterestCostPerBox;
    const wholesaleProfitPerBox =
      wholesaleNetRevenuePerBox - wholesaleTotalCostPerBox;
    const wholesaleMargin =
      (wholesaleProfitPerBox / wholesaleNetRevenuePerBox) * 100;
    const wholesaleContribution =
      wholesaleNetRevenuePerBox - wholesaleTotalVariableCost;
    const wholesaleContributionMargin =
      (wholesaleContribution / wholesaleNetRevenuePerBox) * 100;

    // Per box calculations - Retail
    const retailRevenuePerBox = inputs.sellingPrice1kg;
    const retailDiscountPerBox =
      retailRevenuePerBox * (inputs.retailDiscount / 100);
    const retailReturnsCost =
      retailRevenuePerBox * (inputs.retailReturns / 100);
    const retailNetRevenuePerBox =
      retailRevenuePerBox - retailDiscountPerBox - retailReturnsCost;

    const retailFarmerCost = 1 * inputs.procurementPrice;
    const retailPostHarvest = 1 * inputs.postHarvestCost;
    const retailProcurementTransport = 1 * inputs.procurementTransportCost;
    const retailProcurementInspection = 1 * inputs.procurementInspectionCost;
    const retailPackaging = inputs.packagingCost1kg;
    const retailPackagingLabor = inputs.packagingLaborCost;
    const retailColdStorage =
      1 * inputs.coldStorageCost * (inputs.inventoryDaysRetail / 30);
    const retailQualityControl = 1 * inputs.qualityControlCost;
    const retailLogistics = inputs.logisticsCost1kg;
    const retailTransportDamage =
      retailNetRevenuePerBox * (inputs.transportDamage / 100);
    const retailSalesCommission =
      retailNetRevenuePerBox * (inputs.salesCommission / 100);

    const retailTotalVariableCost =
      retailFarmerCost +
      retailPostHarvest +
      retailProcurementTransport +
      retailProcurementInspection +
      retailPackaging +
      retailPackagingLabor +
      retailColdStorage +
      retailQualityControl +
      retailLogistics +
      retailTransportDamage +
      retailSalesCommission;

    const retailFixedCostPerBox = fixedCostRetail / retailBoxes;
    const retailInterestCostPerBox =
      (monthlyInterestCost * (actualRetailPercent / 100)) / retailBoxes;

    const retailTotalCostPerBox =
      retailTotalVariableCost +
      retailFixedCostPerBox +
      retailInterestCostPerBox;
    const retailProfitPerBox = retailNetRevenuePerBox - retailTotalCostPerBox;
    const retailMargin = (retailProfitPerBox / retailNetRevenuePerBox) * 100;
    const retailContribution = retailNetRevenuePerBox - retailTotalVariableCost;
    const retailContributionMargin =
      (retailContribution / retailNetRevenuePerBox) * 100;

    // Per box calculations - D2C
    const d2cRevenuePerBox = inputs.sellingPrice500g;
    const d2cDiscountPerBox = d2cRevenuePerBox * (inputs.d2cDiscount / 100);
    const d2cReturnsCost = d2cRevenuePerBox * (inputs.d2cReturns / 100);
    const d2cNetRevenuePerBox =
      d2cRevenuePerBox - d2cDiscountPerBox - d2cReturnsCost;

    const d2cFarmerCost = 0.5 * inputs.procurementPrice;
    const d2cPostHarvest = 0.5 * inputs.postHarvestCost;
    const d2cProcurementTransport = 0.5 * inputs.procurementTransportCost;
    const d2cProcurementInspection = 0.5 * inputs.procurementInspectionCost;
    const d2cPackaging = inputs.packagingCost500g;
    const d2cPackagingLabor = inputs.packagingLaborCost;
    const d2cColdStorage =
      0.5 * inputs.coldStorageCost * (inputs.inventoryDaysD2C / 30);
    const d2cQualityControl = 0.5 * inputs.qualityControlCost;
    const d2cLogistics = inputs.logisticsCost500g;
    const d2cTransportDamage =
      d2cNetRevenuePerBox * (inputs.transportDamage / 100);
    const d2cPgCharges = d2cNetRevenuePerBox * (inputs.pgCharges / 100);
    const d2cSalesCommission =
      d2cNetRevenuePerBox * (inputs.salesCommission / 100);

    const d2cTotalVariableCost =
      d2cFarmerCost +
      d2cPostHarvest +
      d2cProcurementTransport +
      d2cProcurementInspection +
      d2cPackaging +
      d2cPackagingLabor +
      d2cColdStorage +
      d2cQualityControl +
      d2cLogistics +
      d2cTransportDamage +
      d2cPgCharges +
      d2cSalesCommission;

    const d2cFixedCostPerBox = fixedCostD2C / d2cBoxes;
    const d2cInterestCostPerBox =
      (monthlyInterestCost * (actualD2CPercent / 100)) / d2cBoxes;

    const d2cTotalCostPerBox =
      d2cTotalVariableCost + d2cFixedCostPerBox + d2cInterestCostPerBox;
    const d2cProfitPerBox = d2cNetRevenuePerBox - d2cTotalCostPerBox;
    const d2cMargin = (d2cProfitPerBox / d2cNetRevenuePerBox) * 100;
    const d2cContribution = d2cNetRevenuePerBox - d2cTotalVariableCost;
    const d2cContributionMargin = (d2cContribution / d2cNetRevenuePerBox) * 100;

    // Break-even analysis
    const wholesaleBreakEvenUnits = Math.ceil(
      fixedCostWholesale / wholesaleContribution
    );
    const retailBreakEvenUnits = Math.ceil(
      fixedCostRetail / retailContribution
    );
    const d2cBreakEvenUnits = Math.ceil(fixedCostD2C / d2cContribution);
    const overallBreakEvenUnits =
      wholesaleBreakEvenUnits + retailBreakEvenUnits + d2cBreakEvenUnits;

    // Monthly summary calculations
    const wholesaleGrossRevenue = wholesaleBoxes * wholesaleRevenuePerBox;
    const retailGrossRevenue = retailBoxes * retailRevenuePerBox;
    const d2cGrossRevenue = d2cBoxes * d2cRevenuePerBox;
    const totalGrossRevenue =
      wholesaleGrossRevenue + retailGrossRevenue + d2cGrossRevenue;

    const wholesaleDiscounts = wholesaleBoxes * wholesaleDiscountPerBox;
    const retailDiscounts = retailBoxes * retailDiscountPerBox;
    const d2cDiscounts = d2cBoxes * d2cDiscountPerBox;
    const totalDiscounts = wholesaleDiscounts + retailDiscounts + d2cDiscounts;

    const wholesaleReturns = wholesaleBoxes * wholesaleReturnsCost;
    const retailReturns = retailBoxes * retailReturnsCost;
    const d2cReturns = d2cBoxes * d2cReturnsCost;
    const totalReturns = wholesaleReturns + retailReturns + d2cReturns;

    const wholesaleNetRevenue = wholesaleBoxes * wholesaleNetRevenuePerBox;
    const retailNetRevenue = retailBoxes * retailNetRevenuePerBox;
    const d2cNetRevenue = d2cBoxes * d2cNetRevenuePerBox;
    const totalNetRevenue =
      wholesaleNetRevenue + retailNetRevenue + d2cNetRevenue + perPieceRevenue;

    const wholesaleVariableCost = wholesaleBoxes * wholesaleTotalVariableCost;
    const retailVariableCost = retailBoxes * retailTotalVariableCost;
    const d2cVariableCost = d2cBoxes * d2cTotalVariableCost;
    const totalVariableCost =
      wholesaleVariableCost +
      retailVariableCost +
      d2cVariableCost +
      perPieceCost;

    const wholesaleTotalCost = wholesaleBoxes * wholesaleTotalCostPerBox;
    const retailTotalCost = retailBoxes * retailTotalCostPerBox;
    const d2cTotalCost = d2cBoxes * d2cTotalCostPerBox;
    const totalCostAllChannels =
      wholesaleTotalCost + retailTotalCost + d2cTotalCost + perPieceCost;

    const wholesaleProfit = wholesaleNetRevenue - wholesaleTotalCost;
    const retailProfit = retailNetRevenue - retailTotalCost;
    const d2cProfit = d2cNetRevenue - d2cTotalCost;
    const totalProfit =
      wholesaleProfit + retailProfit + d2cProfit + perPieceProfit;

    const grossMargin =
      ((totalNetRevenue - totalVariableCost) / totalNetRevenue) * 100;
    const operatingMargin = (totalProfit / totalNetRevenue) * 100;

    const incomeTax = Math.max(0, totalProfit * (inputs.incomeTaxRate / 100));
    const netProfit = totalProfit - incomeTax;
    const netMargin = (netProfit / totalNetRevenue) * 100;

    // Cost structure breakdown
    const totalFarmerCost =
      wholesaleBoxes * wholesaleFarmerCost +
      retailBoxes * retailFarmerCost +
      d2cBoxes * d2cFarmerCost;

    const totalPostHarvestCost =
      wholesaleBoxes * wholesalePostHarvest +
      retailBoxes * retailPostHarvest +
      d2cBoxes * d2cPostHarvest;

    const totalPackagingCost =
      wholesaleBoxes * (wholesalePackaging + wholesalePackagingLabor) +
      retailBoxes * (retailPackaging + retailPackagingLabor) +
      d2cBoxes * (d2cPackaging + d2cPackagingLabor);

    const totalStorageCost =
      wholesaleBoxes * wholesaleColdStorage +
      retailBoxes * retailColdStorage +
      d2cBoxes * d2cColdStorage;

    const totalLogisticsCost =
      wholesaleBoxes * wholesaleLogistics +
      retailBoxes * retailLogistics +
      d2cBoxes * d2cLogistics;

    const totalCommissionsCost =
      wholesaleBoxes * wholesaleSalesCommission +
      retailBoxes * retailSalesCommission +
      d2cBoxes * d2cSalesCommission;

    // Key Performance Indicators
    const revenuePerKgProcured = totalNetRevenue / inputs.procurementVolume;
    const profitPerKgProcured = netProfit / inputs.procurementVolume;
    const averageCostPerKg = totalCostAllChannels / totalVolume;
    const averageRevenuePerBox = totalNetRevenue / totalBoxes;
    const averageCostPerBox = totalCostAllChannels / totalBoxes;
    const averageProfitPerBox = netProfit / totalBoxes;
    const processingYieldPercentage =
      (totalVolume / inputs.procurementVolume) * 100;
    const returnOnInvestment =
      (netProfit / (inputs.workingCapitalLoanAmount + totalFixedCosts)) * 100;
    const valueAdditionMultiple =
      revenuePerKgProcured / inputs.procurementPrice;

    // Calculate competitor average prices
    const avgCompetitorPrice500g =
      (inputs.competitor1Price500g +
        inputs.competitor2Price500g +
        inputs.competitor3Price500g) /
      3;
    const avgCompetitorPrice1kg =
      (inputs.competitor1Price1kg +
        inputs.competitor2Price1kg +
        inputs.competitor3Price1kg) /
      3;
    const avgCompetitorPrice3kg =
      (inputs.competitor1Price3kg +
        inputs.competitor2Price3kg +
        inputs.competitor3Price3kg) /
      3;

    // Calculate price premium vs. competition
    const pricePremium500g =
      ((inputs.sellingPrice500g - avgCompetitorPrice500g) /
        avgCompetitorPrice500g) *
      100;
    const pricePremium1kg =
      ((inputs.sellingPrice1kg - avgCompetitorPrice1kg) /
        avgCompetitorPrice1kg) *
      100;
    const pricePremium3kg =
      ((inputs.sellingPrice3kg - avgCompetitorPrice3kg) /
        avgCompetitorPrice3kg) *
      100;

    // Forecast simple cash flow (monthly)
    const expectedMonthlyNetCashflow = netProfit;
    const monthlyLoanRepayment =
      inputs.workingCapitalLoanAmount / inputs.loanTenure;
    const netCashflowAfterLoanRepayment =
      expectedMonthlyNetCashflow - monthlyLoanRepayment;

    // Update results state
    setResults({
      // Volume metrics
      procurementVolume: inputs.procurementVolume,
      qualitySortingLossVolume,
      volumeAfterQualitySorting,
      processingLossVolume,
      volumeAfterProcessing,
      wastageVolume,
      netUsableVolume,

      // Box calculations
      wholesaleBoxes,
      retailBoxes,
      d2cBoxes,
      totalBoxes,
      actualWholesaleVolume,
      actualRetailVolume,
      actualD2CVolume,
      totalVolume,
      actualWholesalePercent,
      actualRetailPercent,
      actualD2CPercent,

      // Fixed costs
      totalFixedCosts,
      fixedCostWholesale,
      fixedCostRetail,
      fixedCostD2C,
      monthlyInterestCost,

      // Per box financials - Wholesale
      wholesaleRevenuePerBox,
      wholesaleDiscountPerBox,
      wholesaleReturnsCost,
      wholesaleNetRevenuePerBox,
      wholesaleFarmerCost,
      wholesalePostHarvest,
      wholesalePackaging,
      wholesalePackagingLabor,
      wholesaleColdStorage,
      wholesaleLogistics,
      wholesaleTotalVariableCost,
      wholesaleFixedCostPerBox,
      wholesaleInterestCostPerBox,
      wholesaleTotalCostPerBox,
      wholesaleProfitPerBox,
      wholesaleMargin,
      wholesaleContribution,
      wholesaleContributionMargin,

      // Per box financials - Retail
      retailRevenuePerBox,
      retailDiscountPerBox,
      retailReturnsCost,
      retailNetRevenuePerBox,
      retailFarmerCost,
      retailPostHarvest,
      retailPackaging,
      retailPackagingLabor,
      retailColdStorage,
      retailLogistics,
      retailTotalVariableCost,
      retailFixedCostPerBox,
      retailInterestCostPerBox,
      retailTotalCostPerBox,
      retailProfitPerBox,
      retailMargin,
      retailContribution,
      retailContributionMargin,

      // Per box financials - D2C
      d2cRevenuePerBox,
      d2cDiscountPerBox,
      d2cReturnsCost,
      d2cNetRevenuePerBox,
      d2cFarmerCost,
      d2cPostHarvest,
      d2cPackaging,
      d2cPackagingLabor,
      d2cColdStorage,
      d2cLogistics,
      d2cPgCharges,
      d2cTotalVariableCost,
      d2cFixedCostPerBox,
      d2cInterestCostPerBox,
      d2cTotalCostPerBox,
      d2cProfitPerBox,
      d2cMargin,
      d2cContribution,
      d2cContributionMargin,

      // Break-even analysis
      wholesaleBreakEvenUnits,
      retailBreakEvenUnits,
      d2cBreakEvenUnits,
      overallBreakEvenUnits,

      // Monthly financials
      wholesaleGrossRevenue,
      retailGrossRevenue,
      d2cGrossRevenue,
      totalGrossRevenue,

      wholesaleDiscounts,
      retailDiscounts,
      d2cDiscounts,
      totalDiscounts,

      wholesaleReturns,
      retailReturns,
      d2cReturns,
      totalReturns,

      wholesaleNetRevenue,
      retailNetRevenue,
      d2cNetRevenue,
      totalNetRevenue,

      wholesaleVariableCost,
      retailVariableCost,
      d2cVariableCost,
      totalVariableCost,

      wholesaleTotalCost,
      retailTotalCost,
      d2cTotalCost,
      totalCostAllChannels,

      wholesaleProfit,
      retailProfit,
      d2cProfit,
      totalProfit,

      grossMargin,
      operatingMargin,
      incomeTax,
      netProfit,
      netMargin,

      // Cost structure breakdown
      totalFarmerCost,
      totalPostHarvestCost,
      totalPackagingCost,
      totalStorageCost,
      totalLogisticsCost,
      totalCommissionsCost,

      // KPIs
      revenuePerKgProcured,
      profitPerKgProcured,
      averageCostPerKg,
      averageRevenuePerBox,
      averageCostPerBox,
      averageProfitPerBox,
      processingYieldPercentage,
      returnOnInvestment,
      valueAdditionMultiple,

      // Competitor analysis
      avgCompetitorPrice500g,
      avgCompetitorPrice1kg,
      avgCompetitorPrice3kg,
      pricePremium500g,
      pricePremium1kg,
      pricePremium3kg,

      // Cash flow
      expectedMonthlyNetCashflow,
      monthlyLoanRepayment,
      netCashflowAfterLoanRepayment,

      // Per-piece pricing
      perPieceVolume,
      totalPieces,
      perPieceRevenue,
      perPieceCost,
      perPieceProfit,
    });
  };

  // Chart data for revenue, cost, and profit by channel
  const channelPerformanceData = [
    {
      name: 'Wholesale',
      revenue: results.wholesaleNetRevenue || 0,
      cost: results.wholesaleTotalCost || 0,
      profit: results.wholesaleProfit || 0,
    },
    {
      name: 'Retail',
      revenue: results.retailNetRevenue || 0,
      cost: results.retailTotalCost || 0,
      profit: results.retailProfit || 0,
    },
    {
      name: 'D2C',
      revenue: results.d2cNetRevenue || 0,
      cost: results.d2cTotalCost || 0,
      profit: results.d2cProfit || 0,
    },
  ];

  // Chart data for per box economics
  const boxEconomicsData = [
    {
      name: 'Wholesale',
      farmerCost: results.wholesaleFarmerCost || 0,
      postHarvest: results.wholesalePostHarvest || 0,
      packaging:
        results.wholesalePackaging + (results.wholesalePackagingLabor || 0),
      coldStorage: results.wholesaleColdStorage || 0,
      logistics: results.wholesaleLogistics || 0,
      salesCosts: results.wholesaleSalesCommission || 0,
      fixedCosts: results.wholesaleFixedCostPerBox || 0,
      interestCost: results.wholesaleInterestCostPerBox || 0,
      profit: results.wholesaleProfitPerBox || 0,
    },
    {
      name: 'Retail',
      farmerCost: results.retailFarmerCost || 0,
      postHarvest: results.retailPostHarvest || 0,
      packaging: results.retailPackaging + (results.retailPackagingLabor || 0),
      coldStorage: results.retailColdStorage || 0,
      logistics: results.retailLogistics || 0,
      salesCosts: results.retailSalesCommission || 0,
      fixedCosts: results.retailFixedCostPerBox || 0,
      interestCost: results.retailInterestCostPerBox || 0,
      profit: results.retailProfitPerBox || 0,
    },
    {
      name: 'D2C',
      farmerCost: results.d2cFarmerCost || 0,
      postHarvest: results.d2cPostHarvest || 0,
      packaging: results.d2cPackaging + (results.d2cPackagingLabor || 0),
      coldStorage: results.d2cColdStorage || 0,
      logistics: results.d2cLogistics || 0,
      salesCosts:
        (results.d2cSalesCommission || 0) + (results.d2cPgCharges || 0),
      fixedCosts: results.d2cFixedCostPerBox || 0,
      interestCost: results.d2cInterestCostPerBox || 0,
      profit: results.d2cProfitPerBox || 0,
    },
  ];

  // Chart data for cost structure
  const costStructureData = [
    { name: 'Farmer Cost', value: results.totalFarmerCost || 0 },
    { name: 'Post-Harvest', value: results.totalPostHarvestCost || 0 },
    { name: 'Packaging', value: results.totalPackagingCost || 0 },
    { name: 'Storage', value: results.totalStorageCost || 0 },
    { name: 'Logistics', value: results.totalLogisticsCost || 0 },
    { name: 'Commissions', value: results.totalCommissionsCost || 0 },
    { name: 'Fixed Costs', value: results.totalFixedCosts || 0 },
    { name: 'Interest', value: results.monthlyInterestCost || 0 },
  ];

  // Chart data for box distribution
  const boxDistributionData = [
    { name: 'Wholesale', value: results.wholesaleBoxes || 0 },
    { name: 'Retail', value: results.retailBoxes || 0 },
    { name: 'D2C', value: results.d2cBoxes || 0 },
  ];

  // Chart data for pricing comparison
  const pricingComparisonData = [
    {
      name: '500g Box',
      our: inputs.sellingPrice500g,
      competitor1: inputs.competitor1Price500g,
      competitor2: inputs.competitor2Price500g,
      competitor3: inputs.competitor3Price500g,
    },
    {
      name: '1kg Box',
      our: inputs.sellingPrice1kg,
      competitor1: inputs.competitor1Price1kg,
      competitor2: inputs.competitor2Price1kg,
      competitor3: inputs.competitor3Price1kg,
    },
    {
      name: '3kg Box',
      our: inputs.sellingPrice3kg,
      competitor1: inputs.competitor1Price3kg,
      competitor2: inputs.competitor2Price3kg,
      competitor3: inputs.competitor3Price3kg,
    },
  ];

  // Colors for charts
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#8dd1e1',
  ];

  // Tab navigation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return renderSummaryTab();
      case 'pricing':
        return renderPricingTab();
      case 'channelAnalysis':
        return renderChannelAnalysisTab();
      case 'boxEconomics':
        return renderBoxEconomicsTab();
      case 'procurement':
        return renderProcurementTab();
      case 'costs':
        return renderCostsTab();
      case 'assumptions':
        return renderAssumptionsTab();
      case 'modelDetails':
        return renderModelDetailsTab();
      default:
        return renderSummaryTab();
    }
  };

  // Summary Tab
  const renderSummaryTab = () => {
    return (
      <div className="tab-content">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Financial summary */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Financial Summary</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>Gross Revenue:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalGrossRevenue?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Net Revenue:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalNetRevenue?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Total Cost:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalCostAllChannels?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Operating Profit:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalProfit?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Net Profit:</div>
              <div className="font-bold text-right">
                ₹
                {results.netProfit?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Net Margin:</div>
              <div className="font-bold text-right">
                {results.netMargin?.toFixed(1) || 0}%
              </div>

              <div>ROI:</div>
              <div className="font-bold text-right">
                {results.returnOnInvestment?.toFixed(1) || 0}%
              </div>
            </div>
          </div>

          {/* Volume metrics */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Volume Metrics</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>Procurement:</div>
              <div className="font-bold text-right">
                {results.procurementVolume?.toLocaleString() || 0} kg
              </div>

              <div>Total Loss:</div>
              <div className="font-bold text-right">
                {(
                  results.procurementVolume - results.totalVolume
                )?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ||
                  0}{' '}
                kg
              </div>

              <div>Net Usable:</div>
              <div className="font-bold text-right">
                {results.totalVolume?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}{' '}
                kg
              </div>

              <div>Yield %:</div>
              <div className="font-bold text-right">
                {results.processingYieldPercentage?.toFixed(1) || 0}%
              </div>

              <div>Total Boxes:</div>
              <div className="font-bold text-right">
                {results.totalBoxes?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {/* Channel profitability */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">
              Channel Profitability
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div>Wholesale:</div>
              <div className="font-bold text-right">
                ₹
                {results.wholesaleProfit?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Retail:</div>
              <div className="font-bold text-right">
                ₹
                {results.retailProfit?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>D2C:</div>
              <div className="font-bold text-right">
                ₹
                {results.d2cProfit?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>W Margin:</div>
              <div className="font-bold text-right">
                {results.wholesaleMargin?.toFixed(1) || 0}%
              </div>

              <div>R Margin:</div>
              <div className="font-bold text-right">
                {results.retailMargin?.toFixed(1) || 0}%
              </div>

              <div>D2C Margin:</div>
              <div className="font-bold text-right">
                {results.d2cMargin?.toFixed(1) || 0}%
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Key Metrics</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>Avg Profit/Box:</div>
              <div className="font-bold text-right">
                ₹{results.averageProfitPerBox?.toFixed(2) || 0}
              </div>

              <div>Farmer Cost/Kg:</div>
              <div className="font-bold text-right">
                ₹{inputs.procurementPrice?.toFixed(2) || 0}
              </div>

              <div>Revenue/Kg:</div>
              <div className="font-bold text-right">
                ₹{results.revenuePerKgProcured?.toFixed(2) || 0}
              </div>

              <div>Value Multiple:</div>
              <div className="font-bold text-right">
                {results.valueAdditionMultiple?.toFixed(2) || 0}x
              </div>

              <div>Break-even:</div>
              <div className="font-bold text-right">
                {results.overallBreakEvenUnits?.toLocaleString() || 0} boxes
              </div>

              <div>Net Cash Flow:</div>
              <div className="font-bold text-right">
                ₹
                {results.netCashflowAfterLoanRepayment?.toLocaleString(
                  undefined,
                  { maximumFractionDigits: 0 }
                ) || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Channel Performance Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Channel Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    `₹${value.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}`
                  }
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
                <Bar dataKey="cost" name="Cost" fill="#FF8042" />
                <Bar dataKey="profit" name="Profit" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Cost Structure</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costStructureData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0.05
                      ? `${name}: ${(percent * 100).toFixed(0)}%`
                      : ''
                  }
                >
                  {costStructureData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    `₹${value.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}`
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Box Economics Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Box Economics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={boxEconomicsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Bar
                  dataKey="farmerCost"
                  name="Farmer Cost"
                  stackId="a"
                  fill="#8884d8"
                />
                <Bar
                  dataKey="postHarvest"
                  name="Post-Harvest"
                  stackId="a"
                  fill="#82ca9d"
                />
                <Bar
                  dataKey="packaging"
                  name="Packaging"
                  stackId="a"
                  fill="#ffc658"
                />
                <Bar
                  dataKey="coldStorage"
                  name="Cold Storage"
                  stackId="a"
                  fill="#8dd1e1"
                />
                <Bar
                  dataKey="logistics"
                  name="Logistics"
                  stackId="a"
                  fill="#0088FE"
                />
                <Bar
                  dataKey="salesCosts"
                  name="Sales Costs"
                  stackId="a"
                  fill="#d0ed57"
                />
                <Bar
                  dataKey="fixedCosts"
                  name="Fixed Costs"
                  stackId="a"
                  fill="#a4de6c"
                />
                <Bar
                  dataKey="interestCost"
                  name="Interest"
                  stackId="a"
                  fill="#FF8042"
                />
                <Bar
                  dataKey="profit"
                  name="Profit"
                  stackId="a"
                  fill="#00C49F"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Box Distribution Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Box Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={boxDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {boxDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} boxes`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Per-Piece Pricing Section (only shown when enabled) */}
          {inputs.enablePerPiecePricing && (
            <div className="bg-white p-4 rounded shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Individual Piece Sales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b text-left">
                            Metric
                          </th>
                          <th className="py-2 px-4 border-b text-right">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 px-4 border-b">
                            Volume Allocated
                          </td>
                          <td className="py-2 px-4 border-b text-right">
                            {results.perPieceVolume?.toFixed(1) || 0} kg
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">
                            % of Total Volume
                          </td>
                          <td className="py-2 px-4 border-b text-right">
                            {inputs.perPieceMixPercent}%
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">Pieces Per Kg</td>
                          <td className="py-2 px-4 border-b text-right">
                            {inputs.mangoPiecesPerKg}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">Total Pieces</td>
                          <td className="py-2 px-4 border-b text-right">
                            {results.totalPieces?.toLocaleString() || 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">
                            Price Per Piece
                          </td>
                          <td className="py-2 px-4 border-b text-right">
                            ₹{inputs.sellingPricePerPiece}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b text-left">
                            Financial
                          </th>
                          <th className="py-2 px-4 border-b text-right">
                            Amount (₹)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 px-4 border-b">Total Revenue</td>
                          <td className="py-2 px-4 border-b text-right">
                            ₹
                            {results.perPieceRevenue?.toLocaleString(
                              undefined,
                              { maximumFractionDigits: 0 }
                            ) || 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">Total Cost</td>
                          <td className="py-2 px-4 border-b text-right">
                            ₹
                            {results.perPieceCost?.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            }) || 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b font-semibold">
                            Profit
                          </td>
                          <td className="py-2 px-4 border-b text-right font-semibold">
                            ₹
                            {results.perPieceProfit?.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            }) || 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">Margin</td>
                          <td className="py-2 px-4 border-b text-right">
                            {results.perPieceRevenue
                              ? (
                                  (results.perPieceProfit /
                                    results.perPieceRevenue) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">Revenue Per Kg</td>
                          <td className="py-2 px-4 border-b text-right">
                            ₹
                            {results.perPieceVolume
                              ? (
                                  results.perPieceRevenue /
                                  results.perPieceVolume
                                ).toFixed(0)
                              : 0}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Pricing Tab
  const renderPricingTab = () => {
    return (
      <div className="tab-content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Pricing Comparison Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Price Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pricingComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    `₹${value.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}`
                  }
                />
                <Legend />
                <Bar dataKey="our" name="Our Price" fill="#00C49F" />
                <Bar dataKey="competitor1" name="Competitor 1" fill="#0088FE" />
                <Bar dataKey="competitor2" name="Competitor 2" fill="#FFBB28" />
                <Bar dataKey="competitor3" name="Competitor 3" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Price Premium Matrix */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Price Premium/Discount
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Box Type</th>
                    <th className="py-2 px-4 border-b">Our Price</th>
                    <th className="py-2 px-4 border-b">Avg Market</th>
                    <th className="py-2 px-4 border-b">Premium</th>
                    <th className="py-2 px-4 border-b">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 border-b">500g Box</td>
                    <td className="py-2 px-4 border-b">
                      ₹{inputs.sellingPrice500g}
                    </td>
                    <td className="py-2 px-4 border-b">
                      ₹{results.avgCompetitorPrice500g?.toFixed(2) || 0}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {results.pricePremium500g?.toFixed(1) || 0}%
                    </td>
                    <td className="py-2 px-4 border-b">
                      {results.d2cMargin?.toFixed(1) || 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">1kg Box</td>
                    <td className="py-2 px-4 border-b">
                      ₹{inputs.sellingPrice1kg}
                    </td>
                    <td className="py-2 px-4 border-b">
                      ₹{results.avgCompetitorPrice1kg?.toFixed(2) || 0}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {results.pricePremium1kg?.toFixed(1) || 0}%
                    </td>
                    <td className="py-2 px-4 border-b">
                      {results.retailMargin?.toFixed(1) || 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">3kg Box</td>
                    <td className="py-2 px-4 border-b">
                      ₹{inputs.sellingPrice3kg}
                    </td>
                    <td className="py-2 px-4 border-b">
                      ₹{results.avgCompetitorPrice3kg?.toFixed(2) || 0}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {results.pricePremium3kg?.toFixed(1) || 0}%
                    </td>
                    <td className="py-2 px-4 border-b">
                      {results.wholesaleMargin?.toFixed(1) || 0}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Price Controls */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Price Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                D2C Box (₹/500g)
              </label>
              <input
                type="number"
                name="sellingPrice500g"
                value={inputs.sellingPrice500g}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
              <p className="text-sm text-gray-500 mt-1">Margin: {results.d2cMargin?.toFixed(1) || 0}%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Retail Box (₹/1kg)
              </label>
              <input
                type="number"
                name="sellingPrice1kg"
                value={inputs.sellingPrice1kg}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
              <p className="text-sm text-gray-500 mt-1">Margin: {results.retailMargin?.toFixed(1) || 0}%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wholesale Box (₹/3kg)
              </label>
              <input
                type="number"
                name="sellingPrice3kg"
                value={inputs.sellingPrice3kg}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
              <p className="text-sm text-gray-500 mt-1">Margin: {results.wholesaleMargin?.toFixed(1) || 0}%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Channel Mix (W/R/D2C %)
              </label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="number"
                  name="channelDistribution.wholesale"
                  value={inputs.channelDistribution.wholesale}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <input
                  type="number"
                  name="channelDistribution.retail"
                  value={inputs.channelDistribution.retail}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <input
                  type="number"
                  name="channelDistribution.d2c"
                  value={inputs.channelDistribution.d2c}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Per-Piece Pricing Controls */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Per-Piece Pricing</h2>
            <div className="flex items-center">
              <label className="mr-2 text-sm font-medium text-gray-700">
                Enable
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="enablePerPiecePricing"
                  checked={inputs.enablePerPiecePricing}
                  onChange={(e) => {
                    setInputs((prev) => ({
                      ...prev,
                      enablePerPiecePricing: e.target.checked,
                    }));
                  }}
                  className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  style={{
                    top: '0px',
                    left: inputs.enablePerPiecePricing ? '4px' : '-4px',
                    transition: 'left 0.2s',
                    backgroundColor: inputs.enablePerPiecePricing
                      ? '#10B981'
                      : 'white',
                    borderColor: inputs.enablePerPiecePricing
                      ? '#10B981'
                      : '#D1D5DB',
                  }}
                />
                <label
                  className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  style={{
                    backgroundColor: inputs.enablePerPiecePricing
                      ? '#D1FAE5'
                      : '#D1D5DB',
                  }}
                ></label>
              </div>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${
              !inputs.enablePerPiecePricing && 'opacity-50 pointer-events-none'
            }`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price Per Piece (₹)
              </label>
              <input
                type="number"
                name="sellingPricePerPiece"
                value={inputs.sellingPricePerPiece}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pieces Per Kg
              </label>
              <input
                type="number"
                name="mangoPiecesPerKg"
                value={inputs.mangoPiecesPerKg}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                % of Volume as Pieces
              </label>
              <input
                type="number"
                name="perPieceMixPercent"
                value={inputs.perPieceMixPercent}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weight Per Piece (g)
              </label>
              <input
                type="number"
                name="perPieceWeight"
                value={inputs.perPieceWeight}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>

          {inputs.enablePerPiecePricing && (
            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-medium mb-2">Per-Piece Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Volume</div>
                  <div className="font-medium">
                    {results.perPieceVolume?.toFixed(1) || 0} kg
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Pieces</div>
                  <div className="font-medium">
                    {results.totalPieces?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Revenue</div>
                  <div className="font-medium">
                    ₹
                    {results.perPieceRevenue?.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    }) || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Profit</div>
                  <div className="font-medium">
                    ₹
                    {results.perPieceProfit?.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    }) || 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Discounts and Promotions */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Discounts & Returns</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wholesale Discount (%)
              </label>
              <input
                type="number"
                name="wholesaleDiscount"
                value={inputs.wholesaleDiscount}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Retail Discount (%)
              </label>
              <input
                type="number"
                name="retailDiscount"
                value={inputs.retailDiscount}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                D2C Discount (%)
              </label>
              <input
                type="number"
                name="d2cDiscount"
                value={inputs.d2cDiscount}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wholesale Returns (%)
              </label>
              <input
                type="number"
                name="wholesaleReturns"
                value={inputs.wholesaleReturns}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Retail Returns (%)
              </label>
              <input
                type="number"
                name="retailReturns"
                value={inputs.retailReturns}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                D2C Returns (%)
              </label>
              <input
                type="number"
                name="d2cReturns"
                value={inputs.d2cReturns}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sales Commission (%)
              </label>
              <input
                type="number"
                name="salesCommission"
                value={inputs.salesCommission}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Gateway (%)
              </label>
              <input
                type="number"
                name="pgCharges"
                value={inputs.pgCharges}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Channel Analysis Tab
  const renderChannelAnalysisTab = () => {
    // Summary of channel metrics
    const channelMetricsData = [
      {
        channel: 'Wholesale',
        boxes: results.wholesaleBoxes || 0,
        volume: results.actualWholesaleVolume || 0,
        revenue: results.wholesaleNetRevenue || 0,
        cost: results.wholesaleTotalCost || 0,
        profit: results.wholesaleProfit || 0,
        margin: results.wholesaleMargin || 0,
        breakEven: results.wholesaleBreakEvenUnits || 0,
      },
      {
        channel: 'Retail',
        boxes: results.retailBoxes || 0,
        volume: results.actualRetailVolume || 0,
        revenue: results.retailNetRevenue || 0,
        cost: results.retailTotalCost || 0,
        profit: results.retailProfit || 0,
        margin: results.retailMargin || 0,
        breakEven: results.retailBreakEvenUnits || 0,
      },
      {
        channel: 'D2C',
        boxes: results.d2cBoxes || 0,
        volume: results.actualD2CVolume || 0,
        revenue: results.d2cNetRevenue || 0,
        cost: results.d2cTotalCost || 0,
        profit: results.d2cProfit || 0,
        margin: results.d2cMargin || 0,
        breakEven: results.d2cBreakEvenUnits || 0,
      },
    ];

    return (
      <div className="tab-content">
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Channel Performance Matrix
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Channel</th>
                  <th className="py-2 px-4 border-b">Boxes</th>
                  <th className="py-2 px-4 border-b">Volume (kg)</th>
                  <th className="py-2 px-4 border-b">Revenue (₹)</th>
                  <th className="py-2 px-4 border-b">Cost (₹)</th>
                  <th className="py-2 px-4 border-b">Profit (₹)</th>
                  <th className="py-2 px-4 border-b">Margin (%)</th>
                  <th className="py-2 px-4 border-b">Break-even</th>
                </tr>
              </thead>
              <tbody>
                {channelMetricsData.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{item.channel}</td>
                    <td className="py-2 px-4 border-b">
                      {item.boxes.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {item.volume.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      ₹
                      {item.revenue.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="py-2 px-4 border-b">
                      ₹
                      {item.cost.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="py-2 px-4 border-b">
                      ₹
                      {item.profit.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {item.margin.toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 border-b">
                      {item.breakEven.toLocaleString()} boxes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Channel Mix Controls */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Channel Mix Controls</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wholesale %
                </label>
                <input
                  type="number"
                  name="channelDistribution.wholesale"
                  value={inputs.channelDistribution.wholesale}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Retail %
                </label>
                <input
                  type="number"
                  name="channelDistribution.retail"
                  value={inputs.channelDistribution.retail}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  D2C %
                </label>
                <input
                  type="number"
                  name="channelDistribution.d2c"
                  value={inputs.channelDistribution.d2c}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sum:{' '}
                  {inputs.channelDistribution.wholesale +
                    inputs.channelDistribution.retail +
                    inputs.channelDistribution.d2c}
                  %
                </label>
                <div
                  className={`mt-1 py-2 px-4 text-center ${
                    inputs.channelDistribution.wholesale +
                      inputs.channelDistribution.retail +
                      inputs.channelDistribution.d2c ===
                    100
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  } rounded`}
                >
                  {inputs.channelDistribution.wholesale +
                    inputs.channelDistribution.retail +
                    inputs.channelDistribution.d2c ===
                  100
                    ? 'Valid distribution'
                    : 'Should sum to 100%'}
                </div>
              </div>
            </div>
          </div>

          {/* Actual Distribution */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Actual Distribution (by volume)
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={boxDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {boxDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} boxes`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Per Box Economics Comparison */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Per Box Profitability
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  {
                    name: 'Wholesale',
                    value: results.wholesaleProfitPerBox || 0,
                  },
                  {
                    name: 'Retail',
                    value: results.retailProfitPerBox || 0,
                  },
                  { name: 'D2C', value: results.d2cProfitPerBox || 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="value" name="Profit per Box" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Channel Margin Comparison */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Channel Margin Comparison
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  {
                    name: 'Wholesale',
                    value: results.wholesaleMargin || 0,
                  },
                  { name: 'Retail', value: results.retailMargin || 0 },
                  { name: 'D2C', value: results.d2cMargin || 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="value" name="Margin %" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Mix Controls */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Product Mix by Channel</h2>
          <div className="grid grid-cols-1 gap-4">
            {/* Wholesale Product Mix */}
            <div className="border-b pb-4 mb-4">
              <h3 className="font-medium mb-2">Wholesale Product Mix</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    500g Boxes (%)
                  </label>
                  <input
                    type="number"
                    name="productMix.wholesale.box500g"
                    value={inputs.productMix.wholesale.box500g}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    1kg Boxes (%)
                  </label>
                  <input
                    type="number"
                    name="productMix.wholesale.box1kg"
                    value={inputs.productMix.wholesale.box1kg}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    3kg Boxes (%)
                  </label>
                  <input
                    type="number"
                    name="productMix.wholesale.box3kg"
                    value={inputs.productMix.wholesale.box3kg}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="col-span-3">
                  <div
                    className={`text-center p-1 rounded ${
                      inputs.productMix.wholesale.box500g +
                        inputs.productMix.wholesale.box1kg +
                        inputs.productMix.wholesale.box3kg ===
                      100
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Sum:{' '}
                    {inputs.productMix.wholesale.box500g +
                      inputs.productMix.wholesale.box1kg +
                      inputs.productMix.wholesale.box3kg}
                    %
                    {inputs.productMix.wholesale.box500g +
                      inputs.productMix.wholesale.box1kg +
                      inputs.productMix.wholesale.box3kg !==
                      100 && ' (Should sum to 100%)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Retail Product Mix */}
            <div className="border-b pb-4 mb-4">
              <h3 className="font-medium mb-2">Retail Product Mix</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    500g Boxes (%)
                  </label>
                  <input
                    type="number"
                    name="productMix.retail.box500g"
                    value={inputs.productMix.retail.box500g}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    1kg Boxes (%)
                  </label>
                  <input
                    type="number"
                    name="productMix.retail.box1kg"
                    value={inputs.productMix.retail.box1kg}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    3kg Boxes (%)
                  </label>
                  <input
                    type="number"
                    name="productMix.retail.box3kg"
                    value={inputs.productMix.retail.box3kg}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="col-span-3">
                  <div
                    className={`text-center p-1 rounded ${
                      inputs.productMix.retail.box500g +
                        inputs.productMix.retail.box1kg +
                        inputs.productMix.retail.box3kg ===
                      100
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Sum:{' '}
                    {inputs.productMix.retail.box500g +
                      inputs.productMix.retail.box1kg +
                      inputs.productMix.retail.box3kg}
                    %
                    {inputs.productMix.retail.box500g +
                      inputs.productMix.retail.box1kg +
                      inputs.productMix.retail.box3kg !==
                      100 && ' (Should sum to 100%)'}
                  </div>
                </div>
              </div>
            </div>

            {/* D2C Product Mix */}
            <div>
              <h3 className="font-medium mb-2">D2C Product Mix</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    500g Boxes (%)
                  </label>
                  <input
                    type="number"
                    name="productMix.d2c.box500g"
                    value={inputs.productMix.d2c.box500g}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    1kg Boxes (%)
                  </label>
                  <input
                    type="number"
                    name="productMix.d2c.box1kg"
                    value={inputs.productMix.d2c.box1kg}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    3kg Boxes (%)
                  </label>
                  <input
                    type="number"
                    name="productMix.d2c.box3kg"
                    value={inputs.productMix.d2c.box3kg}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="col-span-3">
                  <div
                    className={`text-center p-1 rounded ${
                      inputs.productMix.d2c.box500g +
                        inputs.productMix.d2c.box1kg +
                        inputs.productMix.d2c.box3kg ===
                      100
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Sum:{' '}
                    {inputs.productMix.d2c.box500g +
                      inputs.productMix.d2c.box1kg +
                      inputs.productMix.d2c.box3kg}
                    %
                    {inputs.productMix.d2c.box500g +
                      inputs.productMix.d2c.box1kg +
                      inputs.productMix.d2c.box3kg !==
                      100 && ' (Should sum to 100%)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Box Economics Tab
  const renderBoxEconomicsTab = () => {
    return (
      <div className="tab-content">
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Box Economics Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Component</th>
                  <th className="py-2 px-4 border-b">Wholesale</th>
                  <th className="py-2 px-4 border-b">Retail</th>
                  <th className="py-2 px-4 border-b">D2C</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">
                    Gross Revenue
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleRevenuePerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailRevenuePerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cRevenuePerBox?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Discounts</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleDiscountPerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailDiscountPerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cDiscountPerBox?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Returns</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleReturnsCost?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailReturnsCost?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cReturnsCost?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">
                    Net Revenue
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleNetRevenuePerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailNetRevenuePerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cNetRevenuePerBox?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Farmer Cost</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleFarmerCost?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailFarmerCost?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cFarmerCost?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Post-Harvest</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesalePostHarvest?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailPostHarvest?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cPostHarvest?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Packaging</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesalePackaging?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailPackaging?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cPackaging?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Packaging Labor</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesalePackagingLabor?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailPackagingLabor?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cPackagingLabor?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Cold Storage</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleColdStorage?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailColdStorage?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cColdStorage?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Logistics</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleLogistics?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailLogistics?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cLogistics?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Sales Commission</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleSalesCommission?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailSalesCommission?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cSalesCommission?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">PG Charges</td>
                  <td className="py-2 px-4 border-b">₹0.00</td>
                  <td className="py-2 px-4 border-b">₹0.00</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cPgCharges?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">
                    Total Variable Cost
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleTotalVariableCost?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailTotalVariableCost?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cTotalVariableCost?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Fixed Cost Allocation</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleFixedCostPerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailFixedCostPerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cFixedCostPerBox?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Interest Cost</td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleInterestCostPerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailInterestCostPerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cInterestCostPerBox?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">
                    Total Cost
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.wholesaleTotalCostPerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.retailTotalCostPerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{results.d2cTotalCostPerBox?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">
                    Profit per Box
                  </td>
                  <td className="py-2 px-4 border-b font-semibold">
                    ₹{results.wholesaleProfitPerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b font-semibold">
                    ₹{results.retailProfitPerBox?.toFixed(2) || 0}
                  </td>
                  <td className="py-2 px-4 border-b font-semibold">
                    ₹{results.d2cProfitPerBox?.toFixed(2) || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">Margin %</td>
                  <td className="py-2 px-4 border-b font-semibold">
                    {results.wholesaleMargin?.toFixed(1) || 0}%
                  </td>
                  <td className="py-2 px-4 border-b font-semibold">
                    {results.retailMargin?.toFixed(1) || 0}%
                  </td>
                  <td className="py-2 px-4 border-b font-semibold">
                    {results.d2cMargin?.toFixed(1) || 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Box Economics Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Box Economics Visualization
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={boxEconomicsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Bar
                  dataKey="farmerCost"
                  name="Farmer Cost"
                  stackId="a"
                  fill="#8884d8"
                />
                <Bar
                  dataKey="postHarvest"
                  name="Post-Harvest"
                  stackId="a"
                  fill="#82ca9d"
                />
                <Bar
                  dataKey="packaging"
                  name="Packaging"
                  stackId="a"
                  fill="#ffc658"
                />
                <Bar
                  dataKey="coldStorage"
                  name="Cold Storage"
                  stackId="a"
                  fill="#8dd1e1"
                />
                <Bar
                  dataKey="logistics"
                  name="Logistics"
                  stackId="a"
                  fill="#0088FE"
                />
                <Bar
                  dataKey="salesCosts"
                  name="Sales Costs"
                  stackId="a"
                  fill="#d0ed57"
                />
                <Bar
                  dataKey="fixedCosts"
                  name="Fixed Costs"
                  stackId="a"
                  fill="#a4de6c"
                />
                <Bar
                  dataKey="interestCost"
                  name="Interest"
                  stackId="a"
                  fill="#FF8042"
                />
                <Bar
                  dataKey="profit"
                  name="Profit"
                  stackId="a"
                  fill="#00C49F"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Packaging Costs Controls */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Packaging & Logistics Costs
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Packaging (500g)
                </label>
                <input
                  type="number"
                  name="packagingCost500g"
                  value={inputs.packagingCost500g}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logistics (500g)
                </label>
                <input
                  type="number"
                  name="logisticsCost500g"
                  value={inputs.logisticsCost500g}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Packaging (1kg)
                </label>
                <input
                  type="number"
                  name="packagingCost1kg"
                  value={inputs.packagingCost1kg}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logistics (1kg)
                </label>
                <input
                  type="number"
                  name="logisticsCost1kg"
                  value={inputs.logisticsCost1kg}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Packaging (3kg)
                </label>
                <input
                  type="number"
                  name="packagingCost3kg"
                  value={inputs.packagingCost3kg}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logistics (3kg)
                </label>
                <input
                  type="number"
                  name="logisticsCost3kg"
                  value={inputs.logisticsCost3kg}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Packaging Labor
                </label>
                <input
                  type="number"
                  name="packagingLaborCost"
                  value={inputs.packagingLaborCost}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cold Storage
                </label>
                <input
                  type="number"
                  name="coldStorageCost"
                  value={inputs.coldStorageCost}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Procurement Tab
  const renderProcurementTab = () => {
    // Loss visualization data
    const lossData = [
      { name: 'Procurement', value: results.procurementVolume || 0 },
      {
        name: 'Quality Sorting Loss',
        value: results.qualitySortingLossVolume || 0,
      },
      { name: 'Processing Loss', value: results.processingLossVolume || 0 },
      { name: 'Wastage', value: results.wastageVolume || 0 },
      { name: 'Net Usable', value: results.totalVolume || 0 },
    ];

    return (
      <div className="tab-content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Procurement Summary */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Procurement Summary</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>Total Volume:</div>
              <div className="font-bold text-right">
                {results.procurementVolume?.toLocaleString() || 0} kg
              </div>

              <div>Quality Sorting Loss:</div>
              <div className="font-bold text-right">
                {results.qualitySortingLossVolume?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}{' '}
                kg ({inputs.qualitySortingLoss}%)
              </div>

              <div>Processing Loss:</div>
              <div className="font-bold text-right">
                {results.processingLossVolume?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}{' '}
                kg ({inputs.processingLoss}%)
              </div>

              <div>Wastage:</div>
              <div className="font-bold text-right">
                {results.wastageVolume?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}{' '}
                kg ({inputs.wastage}%)
              </div>

              <div>Net Usable Volume:</div>
              <div className="font-bold text-right">
                {results.totalVolume?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}{' '}
                kg
              </div>

              <div>Processing Yield:</div>
              <div className="font-bold text-right">
                {results.processingYieldPercentage?.toFixed(1) || 0}%
              </div>

              <div>Farmer Cost:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalFarmerCost?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Avg. Cost per Kg:</div>
              <div className="font-bold text-right">
                ₹{inputs.procurementPrice?.toFixed(2) || 0}
              </div>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Procurement Controls</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Procurement Volume (kg)
                </label>
                <input
                  type="number"
                  name="procurementVolume"
                  value={inputs.procurementVolume}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Procurement Price (₹/kg)
                </label>
                <input
                  type="number"
                  name="procurementPrice"
                  value={inputs.procurementPrice}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quality Sorting Loss (%)
                </label>
                <input
                  type="number"
                  name="qualitySortingLoss"
                  value={inputs.qualitySortingLoss}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Processing Loss (%)
                </label>
                <input
                  type="number"
                  name="processingLoss"
                  value={inputs.processingLoss}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wastage (%)
                </label>
                <input
                  type="number"
                  name="wastage"
                  value={inputs.wastage}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Post-Harvest Cost (₹/kg)
                </label>
                <input
                  type="number"
                  name="postHarvestCost"
                  value={inputs.postHarvestCost}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Procurement Staff Cost
                </label>
                <input
                  type="number"
                  name="procurementStaffCost"
                  value={inputs.procurementStaffCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Farmer Support Cost
                </label>
                <input
                  type="number"
                  name="farmerSupportCost"
                  value={inputs.farmerSupportCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Procurement Transport (₹/kg)
                </label>
                <input
                  type="number"
                  name="procurementTransportCost"
                  value={inputs.procurementTransportCost}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inspection Cost (₹/kg)
                </label>
                <input
                  type="number"
                  name="procurementInspectionCost"
                  value={inputs.procurementInspectionCost}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loss Visualization */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">
            Volume Flow Visualization
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lossData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString()} kg`} />
              <Legend />
              <Bar dataKey="value" name="Volume (kg)" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Costs Tab
  const renderCostsTab = () => {
    return (
      <div className="tab-content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Fixed Costs */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Fixed Costs (Monthly)
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div>Procurement Staff:</div>
              <div className="font-bold text-right">
                ₹{inputs.procurementStaffCost.toLocaleString()}
              </div>

              <div>Packaging Staff:</div>
              <div className="font-bold text-right">
                ₹{inputs.packagingStaffCost.toLocaleString()}
              </div>

              <div>QC Staff:</div>
              <div className="font-bold text-right">
                ₹{inputs.qcStaffCost.toLocaleString()}
              </div>

              <div>Logistics Staff:</div>
              <div className="font-bold text-right">
                ₹{inputs.deliveryStaffCost.toLocaleString()}
              </div>

              <div>Sales Staff:</div>
              <div className="font-bold text-right">
                ₹{inputs.salesStaffCost.toLocaleString()}
              </div>

              <div>Admin Staff:</div>
              <div className="font-bold text-right">
                ₹{inputs.adminStaffCost.toLocaleString()}
              </div>

              <div>Rent:</div>
              <div className="font-bold text-right">
                ₹{inputs.rent.toLocaleString()}
              </div>

              <div>Utilities:</div>
              <div className="font-bold text-right">
                ₹{inputs.utilities.toLocaleString()}
              </div>

              <div>Marketing:</div>
              <div className="font-bold text-right">
                ₹{inputs.marketingCost.toLocaleString()}
              </div>

              <div>Other:</div>
              <div className="font-bold text-right">
                ₹
                {(
                  inputs.insurance +
                  inputs.officeSupplies +
                  inputs.softwareSubscriptions
                ).toLocaleString()}
              </div>

              <div className="font-semibold">Total Fixed Costs:</div>
              <div className="font-bold text-right">
                ₹{results.totalFixedCosts?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {/* Variable Costs */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Variable Costs (Monthly)
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div>Farmer Payments:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalFarmerCost?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Post-Harvest:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalPostHarvestCost?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Packaging:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalPackagingCost?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Cold Storage:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalStorageCost?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Logistics:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalLogisticsCost?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Sales Commissions:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalCommissionsCost?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div>Interest Costs:</div>
              <div className="font-bold text-right">
                ₹
                {results.monthlyInterestCost?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div className="font-semibold">Total Variable Costs:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalVariableCost?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>

              <div className="font-semibold">Grand Total Costs:</div>
              <div className="font-bold text-right">
                ₹
                {results.totalCostAllChannels?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Structure Visualization */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Cost Structure</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costStructureData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  percent > 0.05
                    ? `${name}: ${(percent * 100).toFixed(0)}%`
                    : ''
                }
              >
                {costStructureData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  `₹${value.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}`
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Parameters */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Financial Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Working Capital Loan (₹)
              </label>
              <input
                type="number"
                name="workingCapitalLoanAmount"
                value={inputs.workingCapitalLoanAmount}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                name="interestRate"
                value={inputs.interestRate}
                onChange={handleInputChange}
                min="0"
                max="50"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Tenure (months)
              </label>
              <input
                type="number"
                name="loanTenure"
                value={inputs.loanTenure}
                onChange={handleInputChange}
                min="1"
                max="60"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Income Tax Rate (%)
              </label>
              <input
                type="number"
                name="incomeTaxRate"
                value={inputs.incomeTaxRate}
                onChange={handleInputChange}
                min="0"
                max="50"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Interest Cost
              </label>
              <div className="mt-1 py-2 px-4 bg-gray-100 rounded">
                ₹
                {results.monthlyInterestCost?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Loan Repayment
              </label>
              <div className="mt-1 py-2 px-4 bg-gray-100 rounded">
                ₹
                {results.monthlyLoanRepayment?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Assumptions Tab
  const renderAssumptionsTab = () => {
    return (
      <div className="tab-content">
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Mango Variety</h2>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variety
          </label>
          <input
            type="text"
            name="variety"
            value={inputs.variety}
            onChange={handleInputChange}
            placeholder="e.g. Alphonso"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {/* Procurement Assumptions */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium mb-2">Procurement Assumptions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Procurement Staff Cost
                </label>
                <input
                  type="number"
                  name="procurementStaffCost"
                  value={inputs.procurementStaffCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Farmer Support Cost
                </label>
                <input
                  type="number"
                  name="farmerSupportCost"
                  value={inputs.farmerSupportCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Procurement Transport (₹/kg)
                </label>
                <input
                  type="number"
                  name="procurementTransportCost"
                  value={inputs.procurementTransportCost}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inspection Cost (₹/kg)
                </label>
                <input
                  type="number"
                  name="procurementInspectionCost"
                  value={inputs.procurementInspectionCost}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>
          {/* Packaging & Storage Assumptions */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium mb-2">
              Packaging & Storage Assumptions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Packaging Staff Cost
                </label>
                <input
                  type="number"
                  name="packagingStaffCost"
                  value={inputs.packagingStaffCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Packaging Equipment Cost
                </label>
                <input
                  type="number"
                  name="packagingEquipmentCost"
                  value={inputs.packagingEquipmentCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cold Chain Electricity
                </label>
                <input
                  type="number"
                  name="coldChainElectricityCost"
                  value={inputs.coldChainElectricityCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  QC Staff Cost
                </label>
                <input
                  type="number"
                  name="qcStaffCost"
                  value={inputs.qcStaffCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quality Control Cost (₹/kg)
                </label>
                <input
                  type="number"
                  name="qualityControlCost"
                  value={inputs.qualityControlCost}
                  onChange={handleInputChange}
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Packaging Wastage (%)
                </label>
                <input
                  type="number"
                  name="packagingWastage"
                  value={inputs.packagingWastage}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>

          {/* Logistics Assumptions */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-medium mb-2">Logistics Assumptions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logistics Fixed Cost
                </label>
                <input
                  type="number"
                  name="logisticsFixedCost"
                  value={inputs.logisticsFixedCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Staff Cost
                </label>
                <input
                  type="number"
                  name="deliveryStaffCost"
                  value={inputs.deliveryStaffCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fuel Cost per Liter
                </label>
                <input
                  type="number"
                  name="fuelCostPerLiter"
                  value={inputs.fuelCostPerLiter}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Transport Damage (%)
                </label>
                <input
                  type="number"
                  name="transportDamage"
                  value={inputs.transportDamage}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wholesale Distance (km)
                </label>
                <input
                  type="number"
                  name="avgDistanceWholesale"
                  value={inputs.avgDistanceWholesale}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Retail Distance (km)
                </label>
                <input
                  type="number"
                  name="avgDistanceRetail"
                  value={inputs.avgDistanceRetail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  D2C Distance (km)
                </label>
                <input
                  type="number"
                  name="avgDistanceD2C"
                  value={inputs.avgDistanceD2C}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>

          {/* Sales & Overhead Assumptions */}
          <div>
            <h3 className="font-medium mb-2">Sales & Overhead Assumptions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sales Staff Cost
                </label>
                <input
                  type="number"
                  name="salesStaffCost"
                  value={inputs.salesStaffCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Marketing Cost
                </label>
                <input
                  type="number"
                  name="marketingCost"
                  value={inputs.marketingCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Admin Staff Cost
                </label>
                <input
                  type="number"
                  name="adminStaffCost"
                  value={inputs.adminStaffCost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rent
                </label>
                <input
                  type="number"
                  name="rent"
                  value={inputs.rent}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Utilities
                </label>
                <input
                  type="number"
                  name="utilities"
                  value={inputs.utilities}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Insurance
                </label>
                <input
                  type="number"
                  name="insurance"
                  value={inputs.insurance}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Office Supplies
                </label>
                <input
                  type="number"
                  name="officeSupplies"
                  value={inputs.officeSupplies}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Software Subscriptions
                </label>
                <input
                  type="number"
                  name="softwareSubscriptions"
                  value={inputs.softwareSubscriptions}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Model Details Tab
  const renderModelDetailsTab = () => {
    return (
      <div className="tab-content">
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Model Formulas</h2>
          {Object.entries(modelFormulas).map(([category, formulas]) => (
            <div key={category} className="mb-6">
              <h3 className="font-medium mb-2 text-blue-600 capitalize">
                {category
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">Metric</th>
                      <th className="py-2 px-4 border-b text-left">Formula</th>
                      <th className="py-2 px-4 border-b text-left">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formulas.map((formula, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="py-2 px-4 border-b font-medium">
                          {formula.name}
                        </td>
                        <td className="py-2 px-4 border-b font-mono text-sm">
                          {formula.formula}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {formula.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Current Model State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Inputs</h3>
              <pre className="overflow-x-auto bg-gray-100 p-2 rounded text-sm h-64">
                {JSON.stringify(inputs, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">Results</h3>
              <pre className="overflow-x-auto bg-gray-100 p-2 rounded text-sm h-64">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Mango Distribution Financial Model
      </h1>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'summary'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('summary')}
        >
          Summary
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'pricing'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('pricing')}
        >
          Pricing
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'channelAnalysis'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('channelAnalysis')}
        >
          Channel Analysis
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'boxEconomics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('boxEconomics')}
        >
          Box Economics
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'procurement'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('procurement')}
        >
          Procurement
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'costs'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('costs')}
        >
          Costs
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'assumptions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('assumptions')}
        >
          Assumptions
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'modelDetails'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('modelDetails')}
        >
          Model Details
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};
export default App;

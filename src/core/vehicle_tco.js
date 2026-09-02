import { formatBRL, MARKET_BENCHMARKS } from "./constants.js";

/**
 * Calculador de Custo Total de Propriedade (TCO) Veicular: Honda Biz vs Carro
 */
export function calculateVehicleTCO({
  // Dados da Honda Biz Atual
  bizFipeValue = 8000,
  bizMonthlyKm = 350,
  bizKmPerLiter = 45,
  bizFuelPrice = 6.20,
  bizAnnualIpvaLicensing = 160,
  bizAnnualInsurance = 360,
  bizMonthlyMaintenance = 50,
  bizAnnualDepreciationPct = 5,

  // Dados do Carro Pretendido
  carPrice = 38000,
  useBizAsDownPayment = true,
  extraCashDownPayment = 4000,
  financingInstallmentsCount = 48,
  financingMonthlyInterestPct = MARKET_BENCHMARKS.DEFAULT_VEHICLE_FINANCING_MONTHLY,
  carMonthlyKm = 450,
  carKmPerLiter = 11.5,
  carFuelPrice = 6.20,
  carAnnualIpvaLicensingPct = 2.0, // 2% em Santa Catarina
  carAnnualInsurance = 2200,
  carMonthlyMaintenance = 160,
  carAnnualDepreciationPct = 8,
}) {
  // 1. Calculo de Custos da Honda Biz
  const bizMonthlyFuel = (bizMonthlyKm / bizKmPerLiter) * bizFuelPrice;
  const bizMonthlyIpva = bizAnnualIpvaLicensing / 12;
  const bizMonthlyInsurance = bizAnnualInsurance / 12;
  const bizMonthlyDepreciation = (bizFipeValue * (bizAnnualDepreciationPct / 100)) / 12;

  const bizTotalMonthlyCost =
    bizMonthlyFuel +
    bizMonthlyIpva +
    bizMonthlyInsurance +
    bizMonthlyMaintenance +
    bizMonthlyDepreciation;

  // 2. Calculo do Financiamento do Carro
  const bizTradeInValue = useBizAsDownPayment ? bizFipeValue : 0;
  const totalDownPayment = bizTradeInValue + extraCashDownPayment;
  const financedAmount = Math.max(0, carPrice - totalDownPayment);

  let carMonthlyFinancingInstallment = 0;
  if (financedAmount > 0 && financingInstallmentsCount > 0) {
    const i = financingMonthlyInterestPct / 100;
    const n = financingInstallmentsCount;
    // Formula Price
    carMonthlyFinancingInstallment =
      (financedAmount * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);
  }

  // 3. Calculo de Custos Recorrentes do Carro
  const carMonthlyFuel = (carMonthlyKm / carKmPerLiter) * carFuelPrice;
  const carAnnualIpva = (carPrice * (carAnnualIpvaLicensingPct / 100)) + 180; // IPVA + Taxa de licenciamento
  const carMonthlyIpva = carAnnualIpva / 12;
  const carMonthlyInsurance = carAnnualInsurance / 12;
  const carMonthlyDepreciation = (carPrice * (carAnnualDepreciationPct / 100)) / 12;

  const carOperationalMonthlyCost =
    carMonthlyFuel +
    carMonthlyIpva +
    carMonthlyInsurance +
    carMonthlyMaintenance +
    carMonthlyDepreciation;

  const carTotalMonthlyCostWithFinancing =
    carOperationalMonthlyCost + carMonthlyFinancingInstallment;

  // 4. Comparacao e Custo de Oportunidade
  const monthlyCostDifference = carTotalMonthlyCostWithFinancing - bizTotalMonthlyCost;
  const operationalCostDifference = carOperationalMonthlyCost - bizTotalMonthlyCost;

  // Em 5 anos investindo a diferenca a 10% a.a. (CDI liquido):
  const monthlyRate = Math.pow(1.10, 1 / 12) - 1;
  let opportunityCost5Years = 0;
  for (let m = 1; m <= 60; m++) {
    opportunityCost5Years = (opportunityCost5Years + monthlyCostDifference) * (1 + monthlyRate);
  }

  return {
    biz: {
      fipeValue: bizFipeValue,
      monthlyFuel: Math.round(bizMonthlyFuel),
      monthlyIpva: Math.round(bizMonthlyIpva),
      monthlyInsurance: Math.round(bizMonthlyInsurance),
      monthlyMaintenance: Math.round(bizMonthlyMaintenance),
      monthlyDepreciation: Math.round(bizMonthlyDepreciation),
      totalMonthlyCost: Math.round(bizTotalMonthlyCost),
      annualTotalCost: Math.round(bizTotalMonthlyCost * 12),
    },
    car: {
      carPrice,
      totalDownPayment,
      financedAmount,
      financingInstallment: Math.round(carMonthlyFinancingInstallment),
      financingTotalPaid: Math.round(carMonthlyFinancingInstallment * financingInstallmentsCount + totalDownPayment),
      financingTotalInterestPaid: Math.round((carMonthlyFinancingInstallment * financingInstallmentsCount) - financedAmount),
      monthlyFuel: Math.round(carMonthlyFuel),
      monthlyIpva: Math.round(carMonthlyIpva),
      monthlyInsurance: Math.round(carMonthlyInsurance),
      monthlyMaintenance: Math.round(carMonthlyMaintenance),
      monthlyDepreciation: Math.round(carMonthlyDepreciation),
      operationalMonthlyCost: Math.round(carOperationalMonthlyCost),
      totalMonthlyCostWithFinancing: Math.round(carTotalMonthlyCostWithFinancing),
      annualTotalCost: Math.round(carTotalMonthlyCostWithFinancing * 12),
    },
    comparison: {
      monthlyDifference: Math.round(monthlyCostDifference),
      annualDifference: Math.round(monthlyCostDifference * 12),
      operationalMonthlyDifference: Math.round(operationalCostDifference),
      opportunityCost5Years: Math.round(opportunityCost5Years),
      timesMoreExpensive: +(carTotalMonthlyCostWithFinancing / Math.max(1, bizTotalMonthlyCost)).toFixed(1),
    },
  };
}

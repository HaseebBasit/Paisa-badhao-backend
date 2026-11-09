const calculatorService = require('../services/CalculatorService');

class CalculatorController {
  calculate(req, res, next) {
    try {
      const { initialAmount, inflationRate, years, title } = req.body;
      const result = calculatorService.calculate({ initialAmount, inflationRate, years, title });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async save(req, res, next) {
    try {
      const result = await calculatorService.saveCalculation(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: 'Calculation saved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await calculatorService.getUserCalculations(req.user._id);
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteOne(req, res, next) {
    try {
      const { id } = req.params;
      await calculatorService.deleteCalculation(req.user._id, id);
      res.status(200).json({
        success: true,
        message: 'Calculation deleted.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CalculatorController();

/**
 * State Qualification Engine
 * Analyzes client business operations and determines required state and federal registrations
 * This is the "brain" that tells clients what they need to be compliant
 */

class StateQualificationEngine {
  constructor(db) {
    this.db = db;
  }

  /**
   * Analyze client business and recommend required services
   * This is the core intelligence that powers your onboarding agent
   */
  async analyzeBusinessRequirements(businessData) {
    const recommendations = [];
    const reasoning = [];

    // ============================================================================
    // FEDERAL REQUIREMENTS
    // ============================================================================

    // USDOT Number - Required for:
    // 1. Interstate commerce with vehicles over 10,000 lbs
    // 2. Intrastate hazmat
    // 3. Vehicles designed/used to transport 9+ passengers for compensation
    // 4. Vehicles designed/used to transport 16+ passengers (not for compensation)
    
    const needsUSDOT = this.checkUSDOTRequirement(businessData);
    if (needsUSDOT.required) {
      recommendations.push({
        serviceType: 'USDOT',
        serviceName: 'USDOT Number Registration',
        price: 299,
        priority: 'required',
        reason: needsUSDOT.reason,
        renewalFrequency: 'Biennial',
        renewalPrice: 199,
        category: 'Federal Registration'
      });
      reasoning.push(needsUSDOT.reason);
    }

    // MC Number (Operating Authority) - Required for:
    // 1. For-hire carriers in interstate commerce
    // 2. Arranging transportation of passengers or property for compensation
    
    const needsMC = this.checkMCRequirement(businessData);
    if (needsMC.required) {
      recommendations.push({
        serviceType: 'MC',
        serviceName: 'Operating Authority (MC Number)',
        price: 399,
        priority: 'required',
        reason: needsMC.reason,
        renewalFrequency: 'Annual',
        renewalPrice: 299,
        category: 'Federal Registration',
        prerequisites: needsUSDOT.required ? ['USDOT'] : []
      });
      reasoning.push(needsMC.reason);
    }

    // BOC-3 Filing - Required for:
    // 1. All motor carriers with operating authority (MC number)
    
    const needsBOC3 = needsMC.required;
    if (needsBOC3) {
      recommendations.push({
        serviceType: 'BOC-3',
        serviceName: 'BOC-3 Process Agent Filing',
        price: 149,
        priority: 'required',
        reason: 'Required for all carriers with operating authority to designate process agents in each state',
        renewalFrequency: 'Annual',
        renewalPrice: 99,
        category: 'Federal Registration',
        prerequisites: ['MC']
      });
      reasoning.push('BOC-3 filing is mandatory for MC authority holders');
    }

    // UCR Registration - Required for:
    // 1. Interstate motor carriers, freight forwarders, brokers
    
    const needsUCR = this.checkUCRRequirement(businessData);
    if (needsUCR.required) {
      const ucrPrice = this.calculateUCRPrice(businessData.numberOfVehicles);
      recommendations.push({
        serviceType: 'UCR',
        serviceName: 'Unified Carrier Registration (UCR)',
        price: ucrPrice,
        priority: 'required',
        reason: needsUCR.reason,
        renewalFrequency: 'Annual',
        renewalPrice: ucrPrice,
        category: 'Federal Registration'
      });
      reasoning.push(needsUCR.reason);
    }

    // IFTA - Required for:
    // 1. Vehicles over 26,000 lbs operating in multiple jurisdictions
    // 2. Three or more axles
    
    const needsIFTA = this.checkIFTARequirement(businessData);
    if (needsIFTA.required) {
      recommendations.push({
        serviceType: 'IFTA',
        serviceName: 'IFTA Registration & Fuel Tax Reporting',
        price: 299,
        priority: 'required',
        reason: needsIFTA.reason,
        renewalFrequency: 'Quarterly',
        renewalPrice: 149,
        category: 'Fuel Tax',
        note: 'Quarterly fuel tax reports required'
      });
      reasoning.push(needsIFTA.reason);
    }

    // IRP (Apportioned Registration) - Required for:
    // 1. Vehicles over 26,000 lbs operating in multiple jurisdictions
    
    const needsIRP = this.checkIRPRequirement(businessData);
    if (needsIRP.required) {
      recommendations.push({
        serviceType: 'IRP',
        serviceName: 'IRP Apportioned Registration',
        price: 349,
        priority: 'required',
        reason: needsIRP.reason,
        renewalFrequency: 'Annual',
        renewalPrice: 299,
        category: 'Vehicle Registration'
      });
      reasoning.push(needsIRP.reason);
    }

    // ============================================================================
    // STATE REQUIREMENTS
    // ============================================================================

    const stateRequirements = await this.analyzeStateRequirements(businessData);
    recommendations.push(...stateRequirements.recommendations);
    reasoning.push(...stateRequirements.reasoning);

    // ============================================================================
    // OPTIONAL SERVICES (Recommended but not required)
    // ============================================================================

    // ELD Compliance - Recommended for:
    // 1. Interstate carriers
    // 2. Fleets with multiple drivers
    
    if (businessData.interstateCommerce && businessData.numberOfVehicles >= 2) {
      recommendations.push({
        serviceType: 'ELD',
        serviceName: 'ELD Compliance Management',
        price: 199,
        priceType: 'monthly',
        priority: 'recommended',
        reason: 'ELD mandate requires electronic logging devices for interstate carriers',
        category: 'Compliance Monitoring',
        note: 'Monthly subscription per vehicle'
      });
    }

    // Insurance - Always recommended
    recommendations.push({
      serviceType: 'INSURANCE',
      serviceName: 'Cargo & Liability Insurance',
      price: 0, // Varies by carrier
      priority: 'recommended',
      reason: 'Required insurance levels vary by operation type and cargo',
      category: 'Insurance',
      note: 'We can help you find competitive insurance rates'
    });

    // ============================================================================
    // CALCULATE TOTALS
    // ============================================================================

    const requiredServices = recommendations.filter(r => r.priority === 'required');
    const recommendedServices = recommendations.filter(r => r.priority === 'recommended');
    
    const totalRequired = requiredServices.reduce((sum, s) => sum + (s.price || 0), 0);
    const totalRecommended = recommendedServices.reduce((sum, s) => sum + (s.price || 0), 0);

    return {
      recommendations,
      requiredServices,
      recommendedServices,
      totalRequired,
      totalRecommended,
      totalWithRecommended: totalRequired + totalRecommended,
      reasoning,
      summary: this.generateSummary(recommendations, businessData)
    };
  }

  /**
   * Check if USDOT number is required
   */
  checkUSDOTRequirement(data) {
    // Interstate commerce with commercial vehicles
    if (data.interstateCommerce) {
      if (data.vehicleWeight >= 10001 || data.numberOfVehicles > 0) {
        return {
          required: true,
          reason: 'You operate in interstate commerce with commercial vehicles over 10,000 lbs. Federal law requires a USDOT number.'
        };
      }
    }

    // Intrastate hazmat
    if (data.hazmatRequired && !data.interstateCommerce) {
      return {
        required: true,
        reason: 'You transport hazardous materials. A USDOT number is required even for intrastate operations.'
      };
    }

    // Passenger carriers
    if (data.carriesPassengers) {
      if (data.passengerCapacity >= 16 || 
          (data.passengerCapacity >= 9 && data.forHire)) {
        return {
          required: true,
          reason: 'You transport passengers. A USDOT number is required for vehicles with 16+ capacity, or 9+ capacity for-hire.'
        };
      }
    }

    return { required: false, reason: null };
  }

  /**
   * Check if MC number is required
   */
  checkMCRequirement(data) {
    // For-hire carriers in interstate commerce
    if (data.interstateCommerce && data.forHire) {
      return {
        required: true,
        reason: 'You transport goods or passengers for-hire in interstate commerce. Operating authority (MC Number) is required.'
      };
    }

    // Brokers and freight forwarders
    if (data.businessClassification === 'Broker' || data.businessClassification === 'Freight Forwarder') {
      return {
        required: true,
        reason: `As a ${data.businessClassification}, you need operating authority (MC Number) to arrange transportation.`
      };
    }

    return { required: false, reason: null };
  }

  /**
   * Check if UCR is required
   */
  checkUCRRequirement(data) {
    // Interstate motor carriers, freight forwarders, brokers
    if (data.interstateCommerce) {
      return {
        required: true,
        reason: 'Interstate carriers must register with UCR (Unified Carrier Registration) annually.'
      };
    }

    return { required: false, reason: null };
  }

  /**
   * Check if IFTA is required
   */
  checkIFTARequirement(data) {
    // Qualified motor vehicles in multiple jurisdictions
    if (data.interstateCommerce && data.vehicleWeight >= 26001) {
      return {
        required: true,
        reason: 'Vehicles over 26,000 lbs operating interstate must register for IFTA fuel tax reporting.'
      };
    }

    // Three or more axles
    if (data.interstateCommerce && data.numberOfAxles >= 3) {
      return {
        required: true,
        reason: 'Vehicles with 3+ axles operating interstate require IFTA registration.'
      };
    }

    return { required: false, reason: null };
  }

  /**
   * Check if IRP is required
   */
  checkIRPRequirement(data) {
    // Vehicles over 26,000 lbs in multiple jurisdictions
    if (data.interstateCommerce && data.vehicleWeight >= 26001) {
      return {
        required: true,
        reason: 'Vehicles over 26,000 lbs operating in multiple states require IRP (Apportioned) registration.'
      };
    }

    return { required: false, reason: null };
  }

  /**
   * Calculate UCR price based on fleet size
   */
  calculateUCRPrice(numberOfVehicles) {
    if (numberOfVehicles <= 2) return 99;
    if (numberOfVehicles <= 20) return 199;
    if (numberOfVehicles <= 100) return 299;
    if (numberOfVehicles <= 1000) return 399;
    return 549;
  }

  /**
   * Analyze state-specific requirements
   */
  async analyzeStateRequirements(businessData) {
    const recommendations = [];
    const reasoning = [];

    if (!businessData.statesOfOperation || businessData.statesOfOperation.length === 0) {
      return { recommendations, reasoning };
    }

    // Query qualified states from database
    const states = await this.getQualifiedStates(businessData.statesOfOperation);

    for (const state of states) {
      const stateData = JSON.parse(state.requirements || '{}');

      // Check if state permit is required
      if (stateData.requiresPermit) {
        recommendations.push({
          serviceType: 'STATE_PERMIT',
          serviceName: `${state.state_code} State Operating Permit`,
          price: stateData.permitPrice || 299,
          priority: 'required',
          reason: `${state.state_name} requires operating permits for ${businessData.businessClassification || 'commercial carriers'}.`,
          renewalFrequency: stateData.renewalFrequency || 'Annual',
          renewalPrice: stateData.renewalPrice || 199,
          category: 'State Registration',
          state: state.state_code
        });
        reasoning.push(`${state.state_name} permit required for your operation type`);
      }

      // Additional state-specific requirements
      if (stateData.additionalRequirements) {
        stateData.additionalRequirements.forEach(req => {
          recommendations.push({
            serviceType: `STATE_${req.type}`,
            serviceName: `${state.state_code} ${req.name}`,
            price: req.price || 0,
            priority: req.required ? 'required' : 'recommended',
            reason: req.description,
            category: 'State Registration',
            state: state.state_code
          });
        });
      }
    }

    return { recommendations, reasoning };
  }

  /**
   * Get qualified states data from database
   */
  async getQualifiedStates(stateCodes) {
    return new Promise((resolve, reject) => {
      if (!stateCodes || stateCodes.length === 0) {
        return resolve([]);
      }

      const placeholders = stateCodes.map(() => '?').join(',');
      const query = `SELECT * FROM qualified_states WHERE state_code IN (${placeholders})`;

      this.db.all(query, stateCodes, (err, rows) => {
        if (err) {
          console.error('Error getting qualified states:', err);
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  }

  /**
   * Generate human-readable summary
   */
  generateSummary(recommendations, businessData) {
    const required = recommendations.filter(r => r.priority === 'required');
    const recommended = recommendations.filter(r => r.priority === 'recommended');

    let summary = `Based on your business operating ${businessData.interstateCommerce ? 'in interstate commerce' : 'intrastate'} `;
    
    if (businessData.businessClassification) {
      summary += `as a ${businessData.businessClassification} `;
    }
    
    summary += `with ${businessData.numberOfVehicles} vehicle(s), `;
    summary += `you need ${required.length} required registration(s)`;
    
    if (recommended.length > 0) {
      summary += ` and we recommend ${recommended.length} additional service(s)`;
    }
    
    summary += '.';

    return summary;
  }

  /**
   * Validate business data completeness
   */
  validateBusinessData(businessData) {
    const errors = [];
    const missing = [];

    // Required fields
    const required = [
      'legalBusinessName',
      'businessType',
      'operationType',
      'interstateCommerce',
      'numberOfVehicles',
      'numberOfDrivers'
    ];

    required.forEach(field => {
      if (!businessData[field] && businessData[field] !== 0 && businessData[field] !== false) {
        missing.push(field);
      }
    });

    // Business logic validations
    if (businessData.numberOfVehicles > businessData.numberOfDrivers * 3) {
      errors.push('Vehicle count significantly exceeds driver capacity. You may need to hire more drivers.');
    }

    if (businessData.businessType === 'Sole Proprietor' && businessData.hazmatRequired) {
      errors.push('Sole proprietors face limitations transporting hazardous materials. Consider forming an LLC or Corporation.');
    }

    if (businessData.forHire && !businessData.insuranceInfo) {
      errors.push('For-hire carriers require specific insurance coverage. Please provide insurance information.');
    }

    return {
      isValid: missing.length === 0,
      missingFields: missing,
      warnings: errors
    };
  }

  /**
   * Get service details by type
   */
  async getServiceDetails(serviceType) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM services WHERE name LIKE ? OR category LIKE ?',
        [`%${serviceType}%`, `%${serviceType}%`],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
  }

  /**
   * Calculate total compliance cost for business
   */
  async calculateComplianceCost(businessData) {
    const analysis = await this.analyzeBusinessRequirements(businessData);
    
    return {
      requiredSetupCost: analysis.totalRequired,
      recommendedSetupCost: analysis.totalRecommended,
      totalSetupCost: analysis.totalWithRecommended,
      annualRenewalCost: this.calculateAnnualRenewals(analysis.recommendations),
      monthlyRecurring: this.calculateMonthlyRecurring(analysis.recommendations),
      breakdown: analysis.recommendations.map(r => ({
        service: r.serviceName,
        setupCost: r.price,
        renewalCost: r.renewalPrice || 0,
        frequency: r.renewalFrequency,
        required: r.priority === 'required'
      }))
    };
  }

  /**
   * Calculate annual renewal costs
   */
  calculateAnnualRenewals(recommendations) {
    let annualCost = 0;
    
    recommendations.forEach(r => {
      if (r.renewalFrequency === 'Annual') {
        annualCost += r.renewalPrice || 0;
      } else if (r.renewalFrequency === 'Biennial') {
        annualCost += (r.renewalPrice || 0) / 2; // Average per year
      } else if (r.renewalFrequency === 'Quarterly') {
        annualCost += (r.renewalPrice || 0) * 4;
      }
    });

    return Math.round(annualCost);
  }

  /**
   * Calculate monthly recurring costs
   */
  calculateMonthlyRecurring(recommendations) {
    let monthlyCost = 0;
    
    recommendations.forEach(r => {
      if (r.priceType === 'monthly') {
        monthlyCost += r.price || 0;
      }
    });

    return monthlyCost;
  }
}

module.exports = StateQualificationEngine;










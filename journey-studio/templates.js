/* Alchemy Journey Studio — templates.js
   Pre-built Guidewire journey templates for Claims and Policy.
*/

var _JOURNEY_TEMPLATES = [

  /* ═══════════════════════════════════════════════
     CLAIMS TEMPLATES
  ═══════════════════════════════════════════════ */

  {
    id: 'motor-claims-fnol',
    category: 'Claims',
    icon: '🚗',
    name: 'Motor Claims FNOL',
    description: 'First Notification of Loss for a motor vehicle incident — incident details, vehicle, driver, and submission.',
    journey: {
      name: 'Motor Claims FNOL',
      product: 'ClaimCenter',
      team: '',
      goal: 'Allow policyholders to submit a first notification of loss for a motor vehicle incident.',
      createdAt: new Date().toISOString()
    },
    screens: [
      {
        id: 'mc-001', name: 'Incident Details', type: 'form', step: 1,
        description: 'Tell us what happened so we can start processing your claim.',
        cta: 'Continue', backLabel: '', errorMessage: '', notes: '',
        fields: [
          { id: 'mc-f-001', label: 'Date of incident', gwWidget: 'DateInput', type: 'date', required: true, placeholder: '', helpText: 'The date the incident occurred.', section: 'Incident Details', gwProps: {} },
          { id: 'mc-f-002', label: 'Time of incident', gwWidget: 'Input', type: 'text', required: false, placeholder: 'e.g. 14:30', helpText: 'Approximate time if known.', section: 'Incident Details', gwProps: {} },
          { id: 'mc-f-003', label: 'Type of incident', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Incident Details', gwProps: { typeKey: 'Collision,Theft,Vandalism,Weather damage,Fire,Flood,Animal strike,Other' } },
          { id: 'mc-f-004', label: 'Was anyone injured?', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: '', section: 'Incident Details', gwProps: { trueLabel: 'Yes', falseLabel: 'No' } },
          { id: 'mc-f-005', label: 'Location of incident', gwWidget: 'Input', type: 'text', required: true, placeholder: 'Town, city or postcode', helpText: 'Where did the incident take place?', section: 'Incident Details', gwProps: {} },
          { id: 'mc-f-006', label: 'Description of what happened', gwWidget: 'TextAreaInput', type: 'textarea', required: true, placeholder: 'Please describe the incident in as much detail as possible...', helpText: '', section: 'Incident Details', gwProps: {} }
        ],
        navigation: { onSuccess: 'mc-002', onBack: '', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Incident Details' }
      },
      {
        id: 'mc-002', name: 'Vehicle Details', type: 'form', step: 2,
        description: 'Provide details of the vehicle involved in the incident.',
        cta: 'Continue', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'mc-f-007', label: 'Vehicle registration', gwWidget: 'TextInput', type: 'text', required: true, placeholder: 'e.g. AB12 CDE', helpText: '', section: 'Vehicle Details', gwProps: {} },
          { id: 'mc-f-008', label: 'Vehicle make', gwWidget: 'TextInput', type: 'text', required: true, placeholder: 'e.g. Ford', helpText: '', section: 'Vehicle Details', gwProps: {} },
          { id: 'mc-f-009', label: 'Vehicle model', gwWidget: 'TextInput', type: 'text', required: true, placeholder: 'e.g. Focus', helpText: '', section: 'Vehicle Details', gwProps: {} },
          { id: 'mc-f-010', label: 'Year of manufacture', gwWidget: 'IntegerInput', type: 'number', required: true, placeholder: 'e.g. 2019', helpText: '', section: 'Vehicle Details', gwProps: { min: 1900, max: 2026 } },
          { id: 'mc-f-011', label: 'Is the vehicle driveable?', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: '', section: 'Vehicle Details', gwProps: { trueLabel: 'Yes', falseLabel: 'No' } },
          { id: 'mc-f-012', label: 'Estimated repair cost', gwWidget: 'CurrencyInput', type: 'number', required: false, placeholder: '', helpText: 'Approximate cost if known.', section: 'Vehicle Details', gwProps: { min: 0 } }
        ],
        navigation: { onSuccess: 'mc-003', onBack: 'mc-001', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Vehicle Details' }
      },
      {
        id: 'mc-003', name: 'Driver Details', type: 'form', step: 3,
        description: 'Provide details of the driver at the time of the incident.',
        cta: 'Continue', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'mc-f-013', label: 'Driver name', gwWidget: 'TextInput', type: 'text', required: true, placeholder: '', helpText: '', section: 'Driver Details', gwProps: {} },
          { id: 'mc-f-014', label: 'Driver licence number', gwWidget: 'TextInput', type: 'text', required: true, placeholder: '', helpText: '', section: 'Driver Details', gwProps: {} },
          { id: 'mc-f-015', label: 'Is the driver the policyholder?', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: '', section: 'Driver Details', gwProps: { trueLabel: 'Yes', falseLabel: 'No' } },
          { id: 'mc-f-016', label: 'Were there other vehicles involved?', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: '', section: 'Third Party Details', gwProps: { trueLabel: 'Yes', falseLabel: 'No' } },
          { id: 'mc-f-017', label: 'Third party details', gwWidget: 'TextAreaInput', type: 'textarea', required: false, placeholder: 'Name, registration, insurer if known...', helpText: 'Only complete if other vehicles were involved.', section: 'Third Party Details', gwProps: {} }
        ],
        navigation: { onSuccess: 'mc-004', onBack: 'mc-002', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Driver Details' }
      },
      {
        id: 'mc-004', name: 'Review Claim', type: 'form', step: 4,
        description: 'Please review the information below before submitting your claim.',
        cta: 'Submit Claim', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'mc-f-018', label: 'Confirm information is correct', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Declaration', gwProps: { typeKey: 'Yes, all information is correct and accurate,No, I need to make changes' } }
        ],
        navigation: { onSuccess: 'mc-005', onBack: 'mc-003', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Review Claim' }
      },
      {
        id: 'mc-005', name: 'Claim Submitted', type: 'confirmation', step: 5,
        description: 'Your claim has been submitted successfully. Please keep your claim reference number safe.',
        cta: 'Return to Dashboard', backLabel: '', errorMessage: '', notes: '',
        fields: [
          { id: 'mc-f-019', label: 'Claim reference number', gwWidget: 'TextInput', type: 'text', required: false, placeholder: '', helpText: 'Your unique claim reference for tracking.', section: 'Confirmation', gwProps: {} }
        ],
        navigation: { onSuccess: '', onBack: '', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Claim Submitted' }
      }
    ]
  },

  {
    id: 'property-claims-fnol',
    category: 'Claims',
    icon: '🏠',
    name: 'Property Claims FNOL',
    description: 'First Notification of Loss for a property incident — damage details, property information, and submission.',
    journey: {
      name: 'Property Claims FNOL',
      product: 'ClaimCenter',
      team: '',
      goal: 'Allow policyholders to submit a first notification of loss for a property damage incident.',
      createdAt: new Date().toISOString()
    },
    screens: [
      {
        id: 'pc-001', name: 'Incident Details', type: 'form', step: 1,
        description: 'Tell us what happened to your property.',
        cta: 'Continue', backLabel: '', errorMessage: '', notes: '',
        fields: [
          { id: 'pc-f-001', label: 'Date of incident', gwWidget: 'DateInput', type: 'date', required: true, placeholder: '', helpText: '', section: 'Incident Details', gwProps: {} },
          { id: 'pc-f-002', label: 'Type of incident', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Incident Details', gwProps: { typeKey: 'Flood,Fire,Storm damage,Theft,Accidental damage,Subsidence,Escape of water,Other' } },
          { id: 'pc-f-003', label: 'Is the property still habitable?', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: '', section: 'Incident Details', gwProps: { trueLabel: 'Yes', falseLabel: 'No' } },
          { id: 'pc-f-004', label: 'Description of damage', gwWidget: 'TextAreaInput', type: 'textarea', required: true, placeholder: 'Describe the damage in as much detail as possible...', helpText: '', section: 'Incident Details', gwProps: {} }
        ],
        navigation: { onSuccess: 'pc-002', onBack: '', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Incident Details' }
      },
      {
        id: 'pc-002', name: 'Property Details', type: 'form', step: 2,
        description: 'Confirm the details of the affected property.',
        cta: 'Continue', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'pc-f-005', label: 'Property address', gwWidget: 'TextInput', type: 'text', required: true, placeholder: '', helpText: '', section: 'Property Details', gwProps: {} },
          { id: 'pc-f-006', label: 'Property type', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Property Details', gwProps: { typeKey: 'Detached house,Semi-detached house,Terraced house,Flat,Bungalow,Commercial property' } },
          { id: 'pc-f-007', label: 'Is this your main residence?', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: '', section: 'Property Details', gwProps: { trueLabel: 'Yes', falseLabel: 'No' } },
          { id: 'pc-f-008', label: 'Estimated value of damage', gwWidget: 'CurrencyInput', type: 'number', required: false, placeholder: '', helpText: 'Approximate cost of repairs if known.', section: 'Property Details', gwProps: { min: 0 } },
          { id: 'pc-f-009', label: 'Have you obtained repair quotes?', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: '', section: 'Property Details', gwProps: { trueLabel: 'Yes', falseLabel: 'No' } }
        ],
        navigation: { onSuccess: 'pc-003', onBack: 'pc-001', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Property Details' }
      },
      {
        id: 'pc-003', name: 'Review & Submit', type: 'form', step: 3,
        description: 'Review your claim details before submission.',
        cta: 'Submit Claim', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'pc-f-010', label: 'Confirm information is correct', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Declaration', gwProps: { typeKey: 'Yes, all information is correct,No, I need to make changes' } }
        ],
        navigation: { onSuccess: 'pc-004', onBack: 'pc-002', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Review & Submit' }
      },
      {
        id: 'pc-004', name: 'Claim Submitted', type: 'confirmation', step: 4,
        description: 'Your property claim has been submitted. A claims handler will be in touch within 2 working days.',
        cta: 'Return to Dashboard', backLabel: '', errorMessage: '', notes: '',
        fields: [
          { id: 'pc-f-011', label: 'Claim reference number', gwWidget: 'TextInput', type: 'text', required: false, placeholder: '', helpText: '', section: 'Confirmation', gwProps: {} }
        ],
        navigation: { onSuccess: '', onBack: '', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Claim Submitted' }
      }
    ]
  },

  /* ═══════════════════════════════════════════════
     POLICY TEMPLATES
  ═══════════════════════════════════════════════ */

  {
    id: 'motor-new-business',
    category: 'Policy',
    icon: '🚙',
    name: 'Motor New Business Quote',
    description: 'New business motor insurance quote journey — driver details, vehicle, coverage selection, and quote summary.',
    journey: {
      name: 'Motor New Business Quote',
      product: 'PolicyCenter',
      team: '',
      goal: 'Guide a customer through obtaining a new motor insurance quote.',
      createdAt: new Date().toISOString()
    },
    screens: [
      {
        id: 'mnb-001', name: 'Driver Details', type: 'form', step: 1,
        description: 'Tell us about the main driver to start your quote.',
        cta: 'Continue', backLabel: '', errorMessage: '', notes: '',
        fields: [
          { id: 'mnb-f-001', label: 'Date of birth', gwWidget: 'DateInput', type: 'date', required: true, placeholder: '', helpText: '', section: 'Main Driver', gwProps: {} },
          { id: 'mnb-f-002', label: 'Driving licence type', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Main Driver', gwProps: { typeKey: 'Full UK licence,Provisional licence,European licence,International licence' } },
          { id: 'mnb-f-003', label: 'Years held licence', gwWidget: 'IntegerInput', type: 'number', required: true, placeholder: '', helpText: '', section: 'Main Driver', gwProps: { min: 0, max: 60 } },
          { id: 'mnb-f-004', label: 'No claims discount (years)', gwWidget: 'IntegerInput', type: 'number', required: true, placeholder: '', helpText: '', section: 'Main Driver', gwProps: { min: 0, max: 20 } },
          { id: 'mnb-f-005', label: 'Any convictions in last 5 years?', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: '', section: 'Main Driver', gwProps: { trueLabel: 'Yes', falseLabel: 'No' } }
        ],
        navigation: { onSuccess: 'mnb-002', onBack: '', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Driver Details' }
      },
      {
        id: 'mnb-002', name: 'Vehicle Details', type: 'form', step: 2,
        description: 'Tell us about the vehicle you want to insure.',
        cta: 'Continue', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'mnb-f-006', label: 'Vehicle registration', gwWidget: 'TextInput', type: 'text', required: true, placeholder: 'e.g. AB12 CDE', helpText: 'Enter your registration to look up vehicle details.', section: 'Vehicle', gwProps: {} },
          { id: 'mnb-f-007', label: 'Vehicle make', gwWidget: 'TextInput', type: 'text', required: true, placeholder: '', helpText: '', section: 'Vehicle', gwProps: {} },
          { id: 'mnb-f-008', label: 'Vehicle model', gwWidget: 'TextInput', type: 'text', required: true, placeholder: '', helpText: '', section: 'Vehicle', gwProps: {} },
          { id: 'mnb-f-009', label: 'Year of manufacture', gwWidget: 'IntegerInput', type: 'number', required: true, placeholder: '', helpText: '', section: 'Vehicle', gwProps: { min: 1980, max: 2026 } },
          { id: 'mnb-f-010', label: 'Estimated vehicle value', gwWidget: 'CurrencyInput', type: 'number', required: true, placeholder: '', helpText: '', section: 'Vehicle', gwProps: { min: 0 } },
          { id: 'mnb-f-011', label: 'Annual mileage', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Usage', gwProps: { typeKey: 'Under 5,000,5,000–10,000,10,000–15,000,15,000–20,000,Over 20,000' } },
          { id: 'mnb-f-012', label: 'Vehicle use', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Usage', gwProps: { typeKey: 'Social, domestic and pleasure,Commuting,Business use,Commercial use' } }
        ],
        navigation: { onSuccess: 'mnb-003', onBack: 'mnb-001', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Vehicle Details' }
      },
      {
        id: 'mnb-003', name: 'Coverage Selection', type: 'form', step: 3,
        description: 'Choose your level of cover and any additional options.',
        cta: 'Get Quote', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'mnb-f-013', label: 'Cover type', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Coverage', gwProps: { typeKey: 'Third party only,Third party fire and theft,Comprehensive' } },
          { id: 'mnb-f-014', label: 'Voluntary excess', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: 'Higher excess reduces your premium.', section: 'Coverage', gwProps: { typeKey: '£0,£100,£250,£500,£750,£1,000' } },
          { id: 'mnb-f-015', label: 'Legal expenses cover', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: '', section: 'Optional Extras', gwProps: { trueLabel: 'Add (£25/yr)', falseLabel: 'No thanks' } },
          { id: 'mnb-f-016', label: 'Breakdown cover', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: '', section: 'Optional Extras', gwProps: { trueLabel: 'Add (£40/yr)', falseLabel: 'No thanks' } }
        ],
        navigation: { onSuccess: 'mnb-004', onBack: 'mnb-002', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Coverage Selection' }
      },
      {
        id: 'mnb-004', name: 'Quote Summary', type: 'confirmation', step: 4,
        description: 'Your personalised quote is ready. Review the details below to proceed.',
        cta: 'Accept & Buy', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'mnb-f-017', label: 'Annual premium', gwWidget: 'CurrencyInput', type: 'number', required: false, placeholder: '', helpText: '', section: 'Your Quote', gwProps: {} },
          { id: 'mnb-f-018', label: 'Policy start date', gwWidget: 'DateInput', type: 'date', required: true, placeholder: '', helpText: '', section: 'Your Quote', gwProps: {} }
        ],
        navigation: { onSuccess: '', onBack: 'mnb-003', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Quote Summary' }
      }
    ]
  },

  {
    id: 'policy-renewal',
    category: 'Policy',
    icon: '🔄',
    name: 'Policy Renewal',
    description: 'Guide policyholders through reviewing and renewing their existing policy with any amendments.',
    journey: {
      name: 'Policy Renewal',
      product: 'PolicyCenter',
      team: '',
      goal: 'Allow policyholders to review and renew their existing insurance policy.',
      createdAt: new Date().toISOString()
    },
    screens: [
      {
        id: 'pr-001', name: 'Renewal Review', type: 'form', step: 1,
        description: 'Review your current policy details before renewal.',
        cta: 'Continue', backLabel: '', errorMessage: '', notes: '',
        fields: [
          { id: 'pr-f-001', label: 'Policy number', gwWidget: 'TextInput', type: 'text', required: true, placeholder: '', helpText: '', section: 'Policy Details', gwProps: {} },
          { id: 'pr-f-002', label: 'Current renewal date', gwWidget: 'DateInput', type: 'date', required: true, placeholder: '', helpText: '', section: 'Policy Details', gwProps: {} },
          { id: 'pr-f-003', label: 'Have your circumstances changed?', gwWidget: 'BooleanRadioInput', type: 'radio', required: true, placeholder: '', helpText: 'E.g. new address, new vehicle, change in usage.', section: 'Changes', gwProps: { trueLabel: 'Yes', falseLabel: 'No' } },
          { id: 'pr-f-004', label: 'Describe changes (if any)', gwWidget: 'TextAreaInput', type: 'textarea', required: false, placeholder: 'Describe any changes to your circumstances...', helpText: '', section: 'Changes', gwProps: {} }
        ],
        navigation: { onSuccess: 'pr-002', onBack: '', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Renewal Review' }
      },
      {
        id: 'pr-002', name: 'Coverage Review', type: 'form', step: 2,
        description: 'Review and update your coverage options for the renewal period.',
        cta: 'Continue', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'pr-f-005', label: 'Cover type', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Coverage', gwProps: { typeKey: 'Third party only,Third party fire and theft,Comprehensive' } },
          { id: 'pr-f-006', label: 'Voluntary excess', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Coverage', gwProps: { typeKey: '£0,£100,£250,£500,£750,£1,000' } },
          { id: 'pr-f-007', label: 'Payment preference', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Payment', gwProps: { typeKey: 'Annual (save 5%),Monthly direct debit,Credit/debit card' } }
        ],
        navigation: { onSuccess: 'pr-003', onBack: 'pr-001', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Coverage Review' }
      },
      {
        id: 'pr-003', name: 'Confirm Renewal', type: 'form', step: 3,
        description: 'Confirm your renewal details and proceed to payment.',
        cta: 'Confirm Renewal', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'pr-f-008', label: 'I confirm the information is accurate', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Declaration', gwProps: { typeKey: 'Yes, I confirm,No, I need to make changes' } }
        ],
        navigation: { onSuccess: 'pr-004', onBack: 'pr-002', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Confirm Renewal' }
      },
      {
        id: 'pr-004', name: 'Renewal Confirmed', type: 'confirmation', step: 4,
        description: 'Your policy has been renewed. Your new policy documents will be sent by email.',
        cta: 'Return to Dashboard', backLabel: '', errorMessage: '', notes: '',
        fields: [
          { id: 'pr-f-009', label: 'New policy reference', gwWidget: 'TextInput', type: 'text', required: false, placeholder: '', helpText: '', section: 'Confirmation', gwProps: {} },
          { id: 'pr-f-010', label: 'New renewal date', gwWidget: 'DateInput', type: 'date', required: false, placeholder: '', helpText: '', section: 'Confirmation', gwProps: {} }
        ],
        navigation: { onSuccess: '', onBack: '', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Renewal Confirmed' }
      }
    ]
  },

  {
    id: 'mid-term-adjustment',
    category: 'Policy',
    icon: '✏️',
    name: 'Mid-Term Adjustment',
    description: 'Make changes to an active policy — address change, vehicle change, named driver addition, or coverage amendment.',
    journey: {
      name: 'Mid-Term Adjustment',
      product: 'PolicyCenter',
      team: '',
      goal: 'Allow policyholders to make amendments to their active policy mid-term.',
      createdAt: new Date().toISOString()
    },
    screens: [
      {
        id: 'mta-001', name: 'Select Change Type', type: 'form', step: 1,
        description: 'What change would you like to make to your policy?',
        cta: 'Continue', backLabel: '', errorMessage: '', notes: '',
        fields: [
          { id: 'mta-f-001', label: 'Policy number', gwWidget: 'TextInput', type: 'text', required: true, placeholder: '', helpText: '', section: 'Policy', gwProps: {} },
          { id: 'mta-f-002', label: 'Type of change', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Change Type', gwProps: { typeKey: 'Change of address,Change of vehicle,Add named driver,Remove named driver,Change coverage level,Other amendment' } },
          { id: 'mta-f-003', label: 'Effective date of change', gwWidget: 'DateInput', type: 'date', required: true, placeholder: '', helpText: 'The date from which this change should take effect.', section: 'Change Type', gwProps: {} }
        ],
        navigation: { onSuccess: 'mta-002', onBack: '', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Select Change Type' }
      },
      {
        id: 'mta-002', name: 'Change Details', type: 'form', step: 2,
        description: 'Provide the details of the change you are making.',
        cta: 'Continue', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'mta-f-004', label: 'New address / vehicle / driver details', gwWidget: 'TextAreaInput', type: 'textarea', required: true, placeholder: 'Provide full details of the change...', helpText: '', section: 'Change Details', gwProps: {} },
          { id: 'mta-f-005', label: 'Reason for change', gwWidget: 'TypeKeyInput', type: 'select', required: false, placeholder: '', helpText: '', section: 'Change Details', gwProps: { typeKey: 'Moved home,New vehicle purchased,Marriage or civil partnership,Divorce or separation,Added to household,Other' } }
        ],
        navigation: { onSuccess: 'mta-003', onBack: 'mta-001', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Change Details' }
      },
      {
        id: 'mta-003', name: 'Review Amendment', type: 'form', step: 3,
        description: 'Review the amendment before confirming. An additional premium or refund may apply.',
        cta: 'Confirm Change', backLabel: 'Back', errorMessage: '', notes: '',
        fields: [
          { id: 'mta-f-006', label: 'Confirm amendment is correct', gwWidget: 'TypeKeyInput', type: 'select', required: true, placeholder: '', helpText: '', section: 'Declaration', gwProps: { typeKey: 'Yes, proceed with this change,No, I need to amend' } }
        ],
        navigation: { onSuccess: 'mta-004', onBack: 'mta-002', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Review Amendment' }
      },
      {
        id: 'mta-004', name: 'Amendment Confirmed', type: 'confirmation', step: 4,
        description: 'Your policy amendment has been processed. Updated documents will be sent by email.',
        cta: 'Return to Dashboard', backLabel: '', errorMessage: '', notes: '',
        fields: [
          { id: 'mta-f-007', label: 'Amendment reference', gwWidget: 'TextInput', type: 'text', required: false, placeholder: '', helpText: '', section: 'Confirmation', gwProps: {} }
        ],
        navigation: { onSuccess: '', onBack: '', onError: '', onSkip: '' },
        accessibility: { pageTitle: 'Amendment Confirmed' }
      }
    ]
  }

];

/* ── Load a template into the app ── */
function loadTemplate(templateId) {
  var tpl = _JOURNEY_TEMPLATES.find(function(t){ return t.id === templateId; });
  if(!tpl){ toast('Template not found'); return; }

  /* Clone to avoid mutating the template */
  S.journey = Object.assign({}, tpl.journey, { createdAt: new Date().toISOString() });
  S.screens = JSON.parse(JSON.stringify(tpl.screens));
  S.cur = null;

  _enableUI();
  renderList();
  showWelcome();
  markDirty();
  closeModal('templateModal');
  toast('Template "' + tpl.name + '" loaded ✓');
}

/* ── Open template picker modal ── */
function openTemplateModal() {
  var body = $id('templateModalBody');
  if(!body) return;

  var categories = ['Claims', 'Policy'];
  var html = '';

  categories.forEach(function(cat) {
    var catTemplates = _JOURNEY_TEMPLATES.filter(function(t){ return t.category === cat; });
    html += '<div class="tpl-category"><h3 class="tpl-cat-title">'+cat+'</h3><div class="tpl-grid">';
    catTemplates.forEach(function(t) {
      html += '<div class="tpl-card" onclick="loadTemplate(\''+t.id+'\')">' +
        '<div class="tpl-icon">'+t.icon+'</div>' +
        '<div class="tpl-name">'+t.name+'</div>' +
        '<div class="tpl-desc">'+t.description+'</div>' +
        '<button class="btn small full" style="margin-top:auto">Use Template</button>' +
      '</div>';
    });
    html += '</div></div>';
  });

  body.innerHTML = html;
  openModal('templateModal');
}

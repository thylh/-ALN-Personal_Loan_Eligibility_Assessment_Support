const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
const pagesDir = path.join(srcDir, 'pages');
const customerDir = path.join(pagesDir, 'customer');
const adminDir = path.join(pagesDir, 'admin');

// Create directories if they don't exist
[customerDir, adminDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const createComponentContent = (name) => `import React from 'react';

const ${name} = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">${name}</h1>
      <p>This is a placeholder for the ${name} page.</p>
    </div>
  );
};

export default ${name};
`;

const customerPages = [
    { name: 'Home', file: 'Home.jsx' },
    { name: 'LoginRegister', file: 'LoginRegister.jsx' },
    { name: 'Ekyc', file: 'Ekyc.jsx' },
    { name: 'LoanApplicationForm', file: 'LoanApplicationForm.jsx' },
    { name: 'DocumentUpload', file: 'DocumentUpload.jsx' },
    { name: 'EContract', file: 'EContract.jsx' },
    { name: 'CustomerDashboard', file: 'CustomerDashboard.jsx' },
    { name: 'PaymentDisbursement', file: 'PaymentDisbursement.jsx' },
    { name: 'TransactionHistory', file: 'TransactionHistory.jsx' },
    { name: 'ProfileSettings', file: 'ProfileSettings.jsx' },
    { name: 'NotificationCenter', file: 'NotificationCenter.jsx' },
    { name: 'SupportHelp', file: 'SupportHelp.jsx' },
    { name: 'Referral', file: 'Referral.jsx' }
];

const adminPages = [
    { name: 'AdminDashboard', file: 'AdminDashboard.jsx' },
    { name: 'LosList', file: 'LosList.jsx' },
    { name: 'UnderwritingDetail', file: 'UnderwritingDetail.jsx' },
    { name: 'LmsList', file: 'LmsList.jsx' },
    { name: 'DisbursementCommand', file: 'DisbursementCommand.jsx' },
    { name: 'CollectionReconciliation', file: 'CollectionReconciliation.jsx' },
    { name: 'DebtCollection', file: 'DebtCollection.jsx' },
    { name: 'CrmCustomerList', file: 'CrmCustomerList.jsx' },
    { name: 'IamManagement', file: 'IamManagement.jsx' },
    { name: 'ProductConfig', file: 'ProductConfig.jsx' },
    { name: 'RuleEngineConfig', file: 'RuleEngineConfig.jsx' },
    { name: 'TemplateConfig', file: 'TemplateConfig.jsx' },
    { name: 'ReportsBi', file: 'ReportsBi.jsx' },
    { name: 'AuditLogs', file: 'AuditLogs.jsx' }
];

customerPages.forEach(page => {
    fs.writeFileSync(path.join(customerDir, page.file), createComponentContent(page.name));
});

adminPages.forEach(page => {
    fs.writeFileSync(path.join(adminDir, page.file), createComponentContent(page.name));
});

console.log("Pages generated successfully.");
